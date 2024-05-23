import { AccountRole, Address, GetRecentPrioritizationFeesApi, IInstruction, ITransactionMessageWithFeePayer, Rpc, SimulateTransactionApi, TransactionMessage, appendTransactionMessageInstructions, createTransactionMessage, getComputeUnitEstimateForTransactionMessageFactory, partiallySignTransactionMessageWithSigners, prependTransactionMessageInstruction, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash } from "@solana/web3.js";
import { getSetComputeUnitLimitInstruction, getSetComputeUnitPriceInstruction } from "@solana-program/compute-budget";
import { nonNull } from "./array";

type TxRpc = Rpc<GetRecentPrioritizationFeesApi & SimulateTransactionApi>;
type TxMessage = ITransactionMessageWithFeePayer<string> & TransactionMessage;

async function prependComputeBudgetInstructions(rpc: TxRpc, transactionMessage: TxMessage, percentile = 0.9): Promise<TxMessage> {
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

export async function createTransaction(rpc: TxRpc, instructions: Array<IInstruction>, payer: Address) {
  const message = createTransactionMessage({ version: 0 });
  const messageWithInstructions = appendTransactionMessageInstructions(instructions, message);
  const messageWithFeePayer = setTransactionMessageFeePayer(payer, messageWithInstructions);
  const messageWithComputeBudget = await prependComputeBudgetInstructions(rpc, messageWithFeePayer);
  const blockHash = await rpc.getRecentBlockhash().send();
  const messageWithLifetime = setTransactionMessageLifetimeUsingBlockhash(blockHash, messageWithComputeBudget);
  return partiallySignTransactionMessageWithSigners(messageWithLifetime);
}
