import type { Address, GetLatestBlockhashApi, GetRecentPrioritizationFeesApi, GetSignatureStatusesApi, IInstruction, ITransactionMessageWithFeePayer, Rpc, SendTransactionApi, Signature, SimulateTransactionApi, Transaction, TransactionMessage } from "@solana/web3.js";
import { AccountRole, appendTransactionMessageInstructions, createTransactionMessage, getBase64EncodedWireTransaction, getComputeUnitEstimateForTransactionMessageFactory, getSignatureFromTransaction, partiallySignTransactionMessageWithSigners, prependTransactionMessageInstruction, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash } from "@solana/web3.js";
import { getSetComputeUnitLimitInstruction, getSetComputeUnitPriceInstruction } from "@solana-program/compute-budget";
import { nonNull } from "./array";

type CreateTransactionRpc = Rpc<GetRecentPrioritizationFeesApi & SimulateTransactionApi & GetLatestBlockhashApi>;
type TransactionMessageWithFeePayer = ITransactionMessageWithFeePayer & TransactionMessage;

const computeLimitMargin = 0.1;
const minComputeUnitMargin = 10000;
const priorityFeePercentile = 0.8;

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function() { return this.toString() }

async function prependComputeBudgetInstructions(rpc: CreateTransactionRpc, transactionMessage: TransactionMessageWithFeePayer): Promise<TransactionMessageWithFeePayer> {
  const getComputeUnitEstimateForTransactionMessage = getComputeUnitEstimateForTransactionMessageFactory({ rpc });
  const computeUnitsEstimate = await getComputeUnitEstimateForTransactionMessage(transactionMessage, { transactionMessage });
  const compputeUnitMargin = Math.max(computeUnitsEstimate * computeLimitMargin, minComputeUnitMargin);
  const requestedComputeUnits = computeUnitsEstimate + compputeUnitMargin;
  const transactionMessageWithComputeUnitLimit = prependTransactionMessageInstruction(
    getSetComputeUnitLimitInstruction({ units: requestedComputeUnits }),
    transactionMessage,
  );
  const addresses = transactionMessageWithComputeUnitLimit.instructions
    .flatMap(x => x.accounts)
    .filter(nonNull)
    .filter(x => x.role === AccountRole.WRITABLE)
    .map(x => x.address);
  const recentPrioritizationFees = await rpc.getRecentPrioritizationFees(addresses).send();
  recentPrioritizationFees.sort((a, b) => Number(a.prioritizationFee - b.prioritizationFee));
  const percentileIndex = Math.min(
    Math.max(Math.floor(recentPrioritizationFees.length * priorityFeePercentile), 0),
    recentPrioritizationFees.length - 1,
  );
  const microLamports = recentPrioritizationFees[percentileIndex].prioritizationFee;
  return prependTransactionMessageInstruction(
    getSetComputeUnitPriceInstruction({ microLamports }),
    transactionMessageWithComputeUnitLimit,
  );
}

export async function splitInstructions(instructions: IInstruction[]): Promise<IInstruction[][]> {
  let groupedInstructions: IInstruction[][] = [[]];
  let transactionSize = 128;
  for (const instruction of instructions) {
    const dataSize = instruction.data?.length ?? 0;
    const accountsSize = (instruction.accounts?.length ?? 0) * 32;
    const instructionSize = 32 + dataSize + accountsSize;
    if (transactionSize + instructionSize > 1232) {
      groupedInstructions.push([]);
      transactionSize = 128;
    }
    const lastIndex = groupedInstructions.length - 1;
    groupedInstructions[lastIndex].push(instruction);
    transactionSize += instructionSize;
  }
  return groupedInstructions;
}

export async function createTransaction(rpc: CreateTransactionRpc, instructions: IInstruction[], payer: Address): Promise<Transaction> {
  const transactions = await createTransactions(rpc, [instructions], payer);
  return transactions[0];
}

export async function createTransactions(rpc: CreateTransactionRpc, instructions: IInstruction[][], payer: Address): Promise<Transaction[]> {
  const blockHash = await rpc.getLatestBlockhash().send();
  let transactions: Transaction[] = [];
  for (const group of instructions) {
    const message = createTransactionMessage({ version: 0 });
    const messageWithInstructions = appendTransactionMessageInstructions(group, message);
    const messageWithFeePayer = setTransactionMessageFeePayer(payer, messageWithInstructions);
    const messageWithComputeBudget = await prependComputeBudgetInstructions(rpc, messageWithFeePayer);
    const messageWithLifetime = setTransactionMessageLifetimeUsingBlockhash(blockHash.value, messageWithComputeBudget);
    const transaction = await partiallySignTransactionMessageWithSigners(messageWithLifetime);
    transactions.push(transaction);
  }
  return transactions;
}

type TransactionResult = Signature | Error;
type SendTransactionRpc = Rpc<SimulateTransactionApi & SendTransactionApi & GetSignatureStatusesApi>;

export async function sendAndConfirmTransaction(rpc: SendTransactionRpc, message: Transaction): Promise<Signature> {
  const result = await sendAndConfirmTransactions(rpc, [message]);
  if (result[0] instanceof Error) {
    throw result[0];
  }
  return result[0];
}

export async function sendAndConfirmTransactions(rpc: SendTransactionRpc, messages: Transaction[]): Promise<TransactionResult[]> {
  const transactionsToSend = new Map(messages.map(x => [getSignatureFromTransaction(x), getBase64EncodedWireTransaction(x)]));
  const results = new Map<string, TransactionResult>();

  for (const [signature, transaction] of transactionsToSend.entries()) {
    try {
      const simulationResult = await rpc.simulateTransaction(transaction, { encoding: "base64" }).send();
      if (simulationResult.value.err != null) {
        throw new Error(JSON.stringify(simulationResult.value.err));
      }
    } catch (error) {
      transactionsToSend.delete(signature);
      const message = error instanceof Error ? error.message : "Simulation failed";
      results.set(signature, new Error(message));
    }
  }

  const expiryTime = Date.now() + 90 * 1000;
  while (Date.now() <= expiryTime) {
    if (transactionsToSend.size === 0) {
      break;
    }

    // Send all transactions sequentially
    for (const [signature, transaction] of transactionsToSend) {
      try {
        await rpc.sendTransaction(transaction, { encoding: "base64", maxRetries: 0n, skipPreflight: true }).send();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Send failed";
        results.set(signature, new Error(message));
        transactionsToSend.delete(signature);
      }
    }

    // Wait one second
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check with of the transactions have been confirmed
    for (let i = 0; i < transactionsToSend.size; i += 256) {
      try {
        const signatures = Array.from(transactionsToSend.keys()).slice(i, i + 256);
        const statuses = await rpc.getSignatureStatuses(signatures).send();
        for (let k = 0; k < signatures.length; k++) {
          const signature = signatures[k];
          const status = statuses.value[k];
          if (status === null) {
            continue;
          }
          if (status.err != null) {
            results.set(signature, new Error(JSON.stringify(status.err)));
          } else {
            results.set(signature, signature);
          }
          transactionsToSend.delete(signature);
        }
      } catch {
        // If we fail to get the statuses, we try again in the next iteration
        continue;
      }
    }
  }

  // Assume all the remaining transactions timed out
  for (const [signature, _] of transactionsToSend) {
    results.set(signature, new Error("Transaction timed out"));
  }

  return messages.map(x => results.get(getSignatureFromTransaction(x)) ?? new Error("Transaction not found"));
}
