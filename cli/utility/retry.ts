import type { IInstruction } from "@solana/web3.js";
import { createTransactions, sendAndConfirmTransactions, splitInstructions } from "@theminingco/core";
import { rpc, signer } from "./config";

export async function sendAndConfirmWithRetry(
  flatInstructions: IInstruction[],
): Promise<void> {
  let instructions = splitInstructions(flatInstructions);
  while (instructions.length > 0) {
    const transactions = await createTransactions(rpc, instructions, signer.address);
    const results = await sendAndConfirmTransactions(rpc, transactions);
    const firstFatalFailure = results
      .find((x): x is Error => x instanceof Error && x.message !== "Transaction timed out");
    if (firstFatalFailure != null) {
      throw firstFatalFailure;
    }
    instructions = instructions.flatMap((x, i) => results[i] instanceof Error ? [x] : []);
  }
}
