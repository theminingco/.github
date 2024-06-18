import { assetAttribution, assetDescription, assetImage, assetSymbol, assetUrl, costPerToken, rpc, signer } from "../utility/config";
import { promptConfirm, promptNumber, promptText } from "../utility/prompt";
import type { Address, IInstruction } from "@solana/web3.js";
import { generateKeyPairSigner } from "@solana/web3.js";
import { linkAccount } from "../utility/link";
import type { Metadata } from "@theminingco/core";
import { createTransaction, createTransactions, sendAndConfirmTransactions, sendAndConfirmTransaction, uploadData, splitInstructions } from "@theminingco/core";
import { DataState, getCreateCollectionV2Instruction, getCreateV2Instruction } from "@theminingco/metadata";
import { royaltiesPlugin } from "../utility/royalties";

async function createCollection(collectionName: string): Promise<Address> {
  const collectionSigner = await generateKeyPairSigner();
  const metadata: Metadata = {
    name: collectionName,
    symbol: assetSymbol,
    image: assetImage,
    description: assetDescription,
    external_url: assetUrl,
    attribution: assetAttribution,
  };
  const metaUri = await uploadData(JSON.stringify(metadata), signer);

  const instruction = getCreateCollectionV2Instruction({
    collection: collectionSigner,
    updateAuthority: signer.address,
    payer: signer,
    name: collectionName,
    uri: metaUri,
    plugins: [royaltiesPlugin()],
    externalPluginAdapters: null,
  });

  const transaction = await createTransaction(rpc, [instruction], signer.address);
  await sendAndConfirmTransaction(rpc, transaction);

  return collectionSigner.address;
}

async function createAssetInstruction(index: number, collection: Address): Promise<IInstruction> {
  const assetSigner = await generateKeyPairSigner();
  const metadata: Metadata = {
    name: `#${index}`,
    symbol: assetSymbol,
    image: assetImage,
    description: assetDescription,
    external_url: assetUrl,
    attribution: assetAttribution
  };
  const metaUri = await uploadData(JSON.stringify(metadata), signer);

  return getCreateV2Instruction({
    asset: assetSigner,
    collection,
    authority: signer,
    updateAuthority: signer.address,
    payer: signer,
    dataState: DataState.AccountState,
    name: metadata.name,
    uri: metaUri,
    plugins: null,
    externalPluginAdapters: null,
  });
}

export default async function createNftCollection(): Promise<void> {
  const poolName = await promptText("What is the collection name?");
  const tokenCount = await promptNumber("How many tokens are in the collection?", 100);

  const totalCost = tokenCount * costPerToken + costPerToken;
  const confirm = await promptConfirm(`Esimated cost for this action is at least ◎${totalCost.toFixed(2)}. Continue?`);
  if (!confirm) { return; }

  const collection = await createCollection(poolName);

  const flatInstructions: IInstruction[] = [];
  for (let i = 1; i <= tokenCount; i++) {
    const instruction = await createAssetInstruction(i, collection);
    flatInstructions.push(instruction);
  }

  let instructions = await splitInstructions(flatInstructions);
  while (instructions.length > 0) {
    const transactions = await createTransactions(rpc, instructions, signer.address);
    const results = await sendAndConfirmTransactions(rpc, transactions);
    instructions = instructions.flatMap((x, i) => results[i] instanceof Error ? [x] : []);
  }

  console.info();
  console.info(`Collection:    ${linkAccount(collection)}`);
  console.info(`Est Cost:      ◎${totalCost.toFixed(2)}`);
}
