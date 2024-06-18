import { homedir } from "os";
import { promptText } from "../utility/prompt";
import { readFile } from "fs/promises";
import { Metadata, createTransactions, fetchMetadata, sendAndConfirmTransactions, splitInstructions, uploadData } from "@theminingco/core";
import { rpc, signer } from "../utility/config";
import { AssetV1, CollectionV1, fetchAllAssetV1ByCollection, fetchCollectionV1, getUpdateV1Instruction } from "@theminingco/metadata";
import { Account, IInstruction, address } from "@solana/web3.js";
import { linkAccount } from "../utility/link";

async function updateCollectionMetadataInstruction(metaPath: string, collection: Account<CollectionV1>) {
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
  return getUpdateV1Instruction({
    asset: collection.address,
    collection: collection.address,
    payer: signer,
    authority: signer,
    newUri: metaUri,
    newName: metadata.name,
    newUpdateAuthority: null,
  })
}

async function updateAssetMetadataInstruction(metaPath: string, asset: Account<AssetV1>) {
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
    authority: signer,
    newUri: metaUri,
    newName: metadata.name,
    newUpdateAuthority: null,
  })
}

export default async function updateCollection() {
  const collectionAddress = await promptText("What is the collection address?");
  const imagesFolder = await promptText("What is the folder containing the metadata?");
  const metaUri = imagesFolder.replace("~", homedir());

  const collection = await fetchCollectionV1(rpc, address(collectionAddress));
  const assets = await fetchAllAssetV1ByCollection(rpc, collection.address);

  const flatInstructions: IInstruction[] = [
    await updateCollectionMetadataInstruction(metaUri, collection)
  ];

  for (const asset of assets) {
    const instruction = await updateAssetMetadataInstruction(metaUri, asset);
    flatInstructions.push(instruction);
  }

  let instructions = await splitInstructions(flatInstructions);
  while (instructions.length > 0) {
    const transactions = await createTransactions(rpc, instructions, signer.address);
    const results = await sendAndConfirmTransactions(rpc, transactions);
    instructions = instructions.flatMap((x, i) => results[i] instanceof Error ? [x] : []);
  }

  console.info();
  console.info(`Updated ${instructions.length} assets`);
  console.info(`Collection:    ${linkAccount(collection.address)}`);
}
