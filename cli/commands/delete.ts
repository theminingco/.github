import type { Account, IInstruction } from "@solana/web3.js";
import { address } from "@solana/web3.js";
import type { AssetV1 } from "@theminingco/metadata";
import { fetchCollectionV1, fetchAllAssetV1ByCollection, getBurnV1Instruction, getBurnCollectionV1Instruction } from "@theminingco/metadata";
import { reclaimablePerAsset, reclaimablePerCollection, rpc, signer } from "../utility/config";
import { promptText } from "../utility/prompt";
import { createTransaction, sendAndConfirmTransaction } from "@theminingco/core";
import { linkAccount } from "../utility/link";
import { sendAndConfirmWithRetry } from "../utility/retry";

function deleteAssetInstruction(asset: Account<AssetV1>): IInstruction {
  if (asset.data.updateAuthority.__kind !== "Collection") {
    throw new Error("Invalid update authority");
  }
  const collection = asset.data.updateAuthority.fields[0];
  return getBurnV1Instruction({
    payer: signer,
    asset: asset.address,
    collection,
    compressionProof: null,
  });
}

export default async function deleteCollection(): Promise<void> {
  const collectionAddress = await promptText("What is the collection address?");

  const collection = await fetchCollectionV1(rpc, address(collectionAddress));
  const assets = await fetchAllAssetV1ByCollection(rpc, collection.address);

  const totalCost = collection.data.currentSize * reclaimablePerAsset + reclaimablePerCollection;

  const instructions = assets.map(deleteAssetInstruction);
  await sendAndConfirmWithRetry(instructions);

  const deleteCollectionInstruction = getBurnCollectionV1Instruction({
    payer: signer,
    collection: address(collectionAddress),
    compressionProof: null,
  });
  const transaction = await createTransaction(rpc, [deleteCollectionInstruction], signer.address);
  await sendAndConfirmTransaction(rpc, transaction);

  console.info();
  console.info("Deleted collection");
  console.info(`Address:       ${linkAccount(collectionAddress)}`);
  console.info(`Reclaimed:     ${totalCost}`);
}
