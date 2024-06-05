import { homedir } from "os";
import { promptChoice, promptText } from "../utility/prompt";
import { createTransaction, fetchMetadata, getAsset, getCollection, sendAndConfirmTransaction, uploadFile } from "@theminingco/core";
import { AssetV1, CollectionV1, Key, getAssetV1Decoder, getCollectionV1Decoder, getUpdateCollectionV1Instruction, getUpdateV1Instruction } from "@theminingco/metadata";
import { assetDescription, assetSymbol, assetUrl, rpc, signer } from "../utility/config";
import { Address, address, getBase58Encoder, getBase64Encoder } from "@solana/web3.js";
import { readFile } from "fs/promises";
import { linkAccount } from "../utility/link";

async function fetchAssetOrCollection(address: Address): Promise<AssetV1 | CollectionV1 | null> {
  const accountInfo = await rpc.getAccountInfo(address).send();
  if (!accountInfo.value) {
    return null;
  }
  const data = getBase58Encoder().encode(accountInfo.value.data[0]);
  try {
    return getAssetV1Decoder().decode(data);
  } catch {
    return getCollectionV1Decoder().decode(data);
  }
}

export default async function updateNftCollection(): Promise<void> {
  const accountAddress = await promptText("What is the asset/collection address?");
  const choice = await promptChoice("What would you like to update?", [
    { title: "Update Image", description: "Update the asset/collection image", value: "image" },
    { title: "Update Attributes", description: "Update the asset/collection attributes", value: "attributes" },
    { title: "Reset Allocation", description: "Reset the asset/collection allocation", value: "allocation" },
    { title: "Reset Meta", description: "Reset the asset/collection metadata", value: "metadata" },
  ]);

  let filePath = "";
  if (choice === "image" || choice === "attributes") {
    filePath = await promptText("What is the path to the new image/attributes?");
  }
  const fileUri = filePath.replace("~", homedir());
  const assetOrCollection = await fetchAssetOrCollection(address(accountAddress));
  if (!assetOrCollection) {
    throw new Error("Asset or collection not found");
  }
  const currentMetadata = await fetchMetadata(assetOrCollection.uri);
  let newMetadata = { ...currentMetadata };

  switch (choice) {
    case "image":
      const image = await readFile(fileUri);
      const imageUri = await uploadFile(rpc, image);
      Object.assign(newMetadata, { image: imageUri });
      break;
    case "attributes":
      const attributes = await readFile(fileUri);
      Object.assign(newMetadata, { attributes: JSON.parse(attributes.toString()) });
      break;
    case "allocation":
      Object.assign(newMetadata, { allocation: undefined });
      break;
    case "metadata":
      Object.assign(newMetadata, { symbol: assetSymbol, description: assetDescription, external_url: assetUrl, });
      break;
  }

  const metaUri = await uploadFile(rpc, JSON.stringify(newMetadata));

  let instructions = [];
  let type = "";

  switch (assetOrCollection.key) {
    case Key.AssetV1:
      type = "Asset";
      instructions.push(
        getUpdateV1Instruction({
          payer: signer,
          asset: address(accountAddress),
          authority: signer,
          newUri: metaUri,
          newName: newMetadata.name,
          newUpdateAuthority: null
        })
    );
      break;
    case Key.CollectionV1:
      type = "Collection";
      instructions.push(
        getUpdateCollectionV1Instruction({
          payer: signer,
          collection: address(accountAddress),
          authority: signer,
          newUri: metaUri,
          newName: newMetadata.name,
        })
    );
      break;
  }

  const transaction = await createTransaction(rpc, instructions, signer.address);
  await sendAndConfirmTransaction(rpc, transaction);

  console.info();
  console.info(`Updated ${type} ${newMetadata.name}`);
  console.info(`Address: ${linkAccount(address(accountAddress))}`)
}
