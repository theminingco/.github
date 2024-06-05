import { AccountRole, Address, GetRecentPrioritizationFeesApi, GetSignatureStatusesApi, IInstruction, ITransactionMessageWithFeePayer, Rpc, SendTransactionApi, SimulateTransactionApi, Transaction, TransactionMessage, appendTransactionMessageInstructions, createTransactionMessage, getBase58Decoder, getBase58Encoder, getBase64EncodedWireTransaction, getComputeUnitEstimateForTransactionMessageFactory, getSignatureFromTransaction, partiallySignTransactionMessageWithSigners, prependTransactionMessageInstruction, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash } from "@solana/web3.js";
import { getSetComputeUnitLimitInstruction, getSetComputeUnitPriceInstruction } from "@solana-program/compute-budget";
import { nonNull } from "./array";

type CreateTransactionRpc = Rpc<GetRecentPrioritizationFeesApi & SimulateTransactionApi>;
type TransactionMessageWithFeePayer = ITransactionMessageWithFeePayer<string> & TransactionMessage;

async function prependComputeBudgetInstructions(rpc: CreateTransactionRpc, transactionMessage: TransactionMessageWithFeePayer, percentile = 0.9): Promise<TransactionMessageWithFeePayer> {
  const getComputeUnitEstimateForTransactionMessage = getComputeUnitEstimateForTransactionMessageFactory({ rpc });
  const computeUnitsEstimate = await getComputeUnitEstimateForTransactionMessage(transactionMessage, { transactionMessage });
  const transactionMessageWithComputeUnitLimit = prependTransactionMessageInstruction(
    getSetComputeUnitLimitInstruction({ units: computeUnitsEstimate }),
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
    Math.max(Math.floor(recentPrioritizationFees.length * percentile), 0),
    recentPrioritizationFees.length - 1
  );
  const microLamports = recentPrioritizationFees[percentileIndex].prioritizationFee;
  return prependTransactionMessageInstruction(
    getSetComputeUnitPriceInstruction({ microLamports }),
    transactionMessageWithComputeUnitLimit,
  );
}

export async function createTransaction(rpc: CreateTransactionRpc, instructions: Array<IInstruction>, payer: Address): Promise<Transaction> {
  const message = createTransactionMessage({ version: 0 });
  const messageWithInstructions = appendTransactionMessageInstructions(instructions, message);
  const messageWithFeePayer = setTransactionMessageFeePayer(payer, messageWithInstructions);
  const messageWithComputeBudget = await prependComputeBudgetInstructions(rpc, messageWithFeePayer);
  const blockHash = await rpc.getRecentBlockhash().send();
  const messageWithLifetime = setTransactionMessageLifetimeUsingBlockhash(blockHash, messageWithComputeBudget);
  return partiallySignTransactionMessageWithSigners(messageWithLifetime);
}

export async function createTransactions(rpc: CreateTransactionRpc, instructions: Array<IInstruction>, payer: Address): Promise<Array<Transaction>> {
  // TODO: \/
  // chunk instructions by size (and max versioned tx size)
  // create transaction for each chunk
  return [];
}

type TransactionResult = string | Error;
type SendTransactionRpc = Rpc<SimulateTransactionApi & SendTransactionApi & GetSignatureStatusesApi>;

export async function sendAndConfirmTransaction(rpc: SendTransactionRpc, message: Transaction): Promise<string> {
  const result = await sendAndConfirmTransactions(rpc, [message]);
  if (result[0] instanceof Error) {
    throw result[0];
  }
  return result[0];
}

export async function sendAndConfirmTransactions(rpc: SendTransactionRpc, messages: Array<Transaction>): Promise<TransactionResult[]> {

  const transactionsToSend = new Map(messages.map(x => [getSignatureFromTransaction(x), getBase64EncodedWireTransaction(x)]));
  const results = new Map<string, TransactionResult>();

  for (const [signature, transaction] of transactionsToSend.entries()) {
    try {
      const simulationResult = await rpc.simulateTransaction(transaction, { encoding: "base64"} ).send()
      if (simulationResult.value.err != null) {
        throw new Error(simulationResult.value.err.toString());
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
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check with of the transactions have been confirmed
    for (let i = 0; i < transactionsToSend.size; i += 256) {
      try {
        const signatures = Array.from(transactionsToSend.keys()).slice(i, i + 256);
        const statuses = await rpc.getSignatureStatuses(signatures).send();
        for (let i = 0; i < signatures.length; i++) {
          const signature = signatures[i];
          const status = statuses.value[i];
          if (status === null) {
            continue;
          }
          if (status.err != null) {
            results.set(signature, new Error(status.err.toString()));
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
