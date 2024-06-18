import { promptText } from "../utility/prompt";
import { address } from "@solana/web3.js";
import { rpc, signer } from "../utility/config";
import { createTransaction, sendAndConfirmTransaction } from "@theminingco/core";
import { linkAccount } from "../utility/link";
import { publishCollectionInstructions } from "../utility/publish";

export default async function publishCollection(): Promise<void> {
  const collectionAddress = await promptText("What is the collection address?");
  const instructions = publishCollectionInstructions(
    address(collectionAddress),
    signer,
  );

  const transaction = await createTransaction(rpc, instructions, signer.address);
  await sendAndConfirmTransaction(rpc, transaction);

  console.info();
  console.info("Published collection");
  console.info(`Address:       ${linkAccount(collectionAddress)}`);
}
