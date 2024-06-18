import { address } from "@solana/web3.js";
import { createTransaction, sendAndConfirmTransaction } from "@theminingco/core";
import { signer, rpc } from "../utility/config";
import { linkAccount } from "../utility/link";
import { promptText } from "../utility/prompt";
import { unpublishCollectionInstructions } from "../utility/publish";

export default async function unpublishCollection(): Promise<void> {
  const collectionAddress = await promptText("What is the collection address?");
  const instructions = unpublishCollectionInstructions(
    address(collectionAddress),
    signer,
  );

  const transaction = await createTransaction(rpc, instructions, signer.address);
  await sendAndConfirmTransaction(rpc, transaction);

  console.info();
  console.info("Unpublished collection");
  console.info(`Address:       ${linkAccount(collectionAddress)}`);
}
