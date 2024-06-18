import { Account, IInstruction, address } from "@solana/web3.js";
import { fetchCollectionV1, fetchAllAssetV1ByCollection, AssetV1, getBurnV1Instruction, getBurnCollectionV1Instruction } from "@theminingco/metadata";
import { costPerToken, rpc, signer } from "../utility/config";
import { promptText } from "../utility/prompt";
import { createTransaction, createTransactions, sendAndConfirmTransaction, sendAndConfirmTransactions, splitInstructions } from "@theminingco/core";
import { linkAccount } from "../utility/link";

function deleteAssetInstruction(asset: Account<AssetV1>): IInstruction {
  if (asset.data.updateAuthority.__kind !== "Collection") {
    throw new Error("Invalid update authority");
  }
  const collection = asset.data.updateAuthority.fields[0];
  return getBurnV1Instruction({
    payer: signer,
    asset: asset.address,
    collection,
    compressionProof: null
  });
}

export default async function deleteCollection() {
  const collectionAddress = await promptText("What is the collection address?");

  const collection = await fetchCollectionV1(rpc, address(collectionAddress));
  const assets = await fetchAllAssetV1ByCollection(rpc, collection.address);

  const totalCost = collection.data.currentSize * costPerToken + costPerToken;

  const flatInstructions = assets.map(deleteAssetInstruction);
  let instructions = await splitInstructions(flatInstructions);
  while (instructions.length > 0) {
    const transactions = await createTransactions(rpc, instructions, signer.address);
    const results = await sendAndConfirmTransactions(rpc, transactions);
    instructions = instructions.flatMap((x, i) => results[i] instanceof Error ? [x] : []);
  }

  const deleteCollectionInstruction = getBurnCollectionV1Instruction({
    payer: signer,
    collection: address(collectionAddress),
    compressionProof: null
  });
  const transaction = await createTransaction(rpc, [deleteCollectionInstruction], signer.address);
  await sendAndConfirmTransaction(rpc, transaction);

  console.info();
  console.info(`Deleted collection`);
  console.info(`Address:       ${linkAccount(collectionAddress)}`);
  console.info(`Reclaimed:     ${totalCost}`)
};
