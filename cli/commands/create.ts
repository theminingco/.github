import { assetDescription, assetSymbol, assetUrl, rpc, signer } from "../utility/config";
import { promptConfirm, promptText } from "../utility/prompt";
import { Address, IInstruction, generateKeyPairSigner } from "@solana/web3.js";
import { linkAccount } from "../utility/link";
import { homedir } from "os";
import { readFile, readdir } from "fs/promises";
import { createTransaction, createTransactions, sendAndConfirmTransactions, sendAndConfirmTransaction, uploadFile, Metadata } from "@theminingco/core";
import { DataState, getCreateCollectionV2Instruction, getCreateV2Instruction } from "@theminingco/metadata";
import { royaltiesPlugin } from "../utility/royalties";

async function createCollection(collectionName: string, imagePath: string): Promise<Address> {
  const collectionSigner = await generateKeyPairSigner();
  const image = await readFile(imagePath);
  const imageUri = await uploadFile(rpc, image);
  const metadata: Metadata = {
    name: collectionName,
    symbol: assetSymbol,
    image: imageUri,
    description: assetDescription,
    external_url: assetUrl,
  };
  const metaUri = await uploadFile(rpc, JSON.stringify(metadata));

  const instruction = getCreateCollectionV2Instruction({
    collection: collectionSigner,
    updateAuthority: signer.address,
    payer: signer,
    name: collectionName,
    uri: metaUri,
    plugins: [royaltiesPlugin()],
    externalPluginAdapters: null
  });

  const transaction = await createTransaction(rpc, [instruction], signer.address);
  await sendAndConfirmTransaction(rpc, transaction);

  return collectionSigner.address;
}

async function createAssetInstruction(index: number, imagePath: string, collection: Address): Promise<IInstruction> {
  const assetName = `#${index}`;
  const assetSigner = await generateKeyPairSigner();
  const image = await readFile(`${imagePath}/${index}.png`);
  const imageUri = await uploadFile(rpc, image);
  const attributes = await readFile(`${imagePath}/${index}.json`);
  const metadata: Metadata = {
    name: assetName,
    symbol: assetSymbol,
    image: imageUri,
    description: assetDescription,
    external_url: assetUrl,
    attributes: JSON.parse(attributes.toString()),
  };
  const metaUri = await uploadFile(rpc, JSON.stringify(metadata));

  return getCreateV2Instruction({
    asset: assetSigner,
    collection,
    authority: signer,
    updateAuthority: signer.address,
    payer: signer,
    dataState: DataState.AccountState,
    name: assetName,
    uri: metaUri,
    plugins: null,
    externalPluginAdapters: null
  });
}

const costPerToken = 0.0029;

export default async function createNftCollection(): Promise<void> {
  const poolName = await promptText("What is the collection name?");
  const imagesFolder = await promptText("What is the folder containing the images?");
  const imagesUri = imagesFolder.replace("~", homedir());

  const files = await readdir(imagesUri);
  const filesSet = new Set(files);
  const images = [];
  for (let i = 0; i < files.length; i++) {
    if (filesSet.has(`${i}.png`)) {
      images.push(i);
    } else {
      break;
    }
  }

  const totalCost = images.length * costPerToken;
  const confirm = await promptConfirm(`Esimated cost for this mint is at least ◎${totalCost.toFixed(2)}. Continue?`);
  if (!confirm) { return; }

  const collection = await createCollection(poolName, `${imagesUri}/0.png`);
  const instructions: Array<IInstruction> = [];
  for (let i = 1; i < images.length; i++) {
    const instruction = await createAssetInstruction(i, imagesUri, collection)
    instructions.push(instruction);
  }
  const transactions = await createTransactions(rpc, instructions, signer.address);
  await sendAndConfirmTransactions(rpc, transactions); // FIXME: what if some fail?

  console.info();
  console.info(`Created ${instructions.length} assets`);
  console.info(`Collection: ${linkAccount(collection)}`);
}
