import { homedir } from "os";
import { promptText } from "../utility/prompt";
import { readFile } from "fs/promises";
import type { Metadata } from "@theminingco/core";
import { fetchMetadata, uploadData } from "@theminingco/core";
import { rpc, signer } from "../utility/config";
import type { AssetV1, CollectionV1 } from "@theminingco/metadata";
import { fetchAllAssetV1ByCollection, fetchCollectionV1, getUpdateCollectionV1Instruction, getUpdateV1Instruction } from "@theminingco/metadata";
import type { Account, IInstruction } from "@solana/web3.js";
import { address } from "@solana/web3.js";
import { linkAccount } from "../utility/link";
import { sendAndConfirmWithRetry } from "../utility/retry";

async function updateCollectionMetadataInstruction(metaPath: string, collection: Account<CollectionV1>): Promise<IInstruction> {
  const image = await readFile(`${metaPath}/0.png`);
  const imageUri = await uploadData(image, signer);
  const metaBuffer = await readFile(`${metaPath}/0.json`);
  const currentMetadata = await fetchMetadata(collection.data.uri);
  const newMetadata = JSON.parse(metaBuffer.toString()) as Partial<Metadata>;
  const metadata: Metadata = {
    ...currentMetadata,
    ...newMetadata,
    image: imageUri,
  };
  const metaUri = await uploadData(JSON.stringify(metadata), signer);
  return getUpdateCollectionV1Instruction({
    collection: collection.address,
    payer: signer,
    newUri: metaUri,
    newName: metadata.name,
  });
}

async function updateAssetMetadataInstruction(metaPath: string, asset: Account<AssetV1>): Promise<IInstruction> {
  const index = asset.data.name.slice(1);
  const image = await readFile(`${metaPath}/${index}.png`);
  const imageUri = await uploadData(image, signer);
  const metaBuffer = await readFile(`${metaPath}/${index}.json`);
  const currentMetadata = await fetchMetadata(asset.data.uri);
  const newMetadata = JSON.parse(metaBuffer.toString()) as Partial<Metadata>;
  const metadata: Metadata = {
    ...currentMetadata,
    ...newMetadata,
    image: imageUri,
    name: asset.data.name,
  };
  if (asset.data.updateAuthority.__kind !== "Collection") {
    throw new Error("Invalid update authority");
  }
  const collection = asset.data.updateAuthority.fields[0];
  const metaUri = await uploadData(JSON.stringify(metadata), signer);
  return getUpdateV1Instruction({
    asset: asset.address,
    collection,
    payer: signer,
    newUri: metaUri,
    newName: metadata.name,
    newUpdateAuthority: null,
  });
}

export default async function updateCollection(): Promise<void> {
  const collectionAddress = await promptText("What is the collection address?");
  const imagesFolder = await promptText("What is the folder containing the metadata?");
  const metaUri = imagesFolder.replace("~", homedir());

  const collection = await fetchCollectionV1(rpc, address(collectionAddress));
  const assets = await fetchAllAssetV1ByCollection(rpc, collection.address);

  const instructions: IInstruction[] = [
    await updateCollectionMetadataInstruction(metaUri, collection),
  ];

  for (const asset of assets) {
    const instruction = await updateAssetMetadataInstruction(metaUri, asset);
    instructions.push(instruction);
  }

  await sendAndConfirmWithRetry(instructions);

  console.info();
  console.info(`Updated ${instructions.length} assets`);
  console.info(`Collection:    ${linkAccount(collection.address)}`);
}
