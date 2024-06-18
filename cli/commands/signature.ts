import { signature } from "@solana/web3.js";
import { rpc } from "../utility/config";
import { promptText } from "../utility/prompt";
import { linkTransaction } from "../utility/link";

export default async function getSignatureData(): Promise<void> {
  const transactionSignature = await promptText("What is the signature that you want to retrieve?");

  const transaction = await rpc.getTransaction(signature(transactionSignature), { maxSupportedTransactionVersion: 0 }).send();

  if (transaction == null) {
    throw new Error(`Transaction ${linkTransaction(transactionSignature)} not found`);
  }

  console.info();
  console.info("Fetched transaction data");
  console.info(`Tx:            ${linkTransaction(transactionSignature)}`);
  console.info(`Block:         ${transaction.slot}`);
  console.info(`Time:          ${transaction.blockTime}`);
  console.info("Logs:")
  transaction.meta?.logMessages?.forEach(log => { console.info(log); });
}
