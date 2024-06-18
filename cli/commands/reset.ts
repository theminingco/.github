import { promptText } from "../utility/prompt";
import { createTransaction, fetchMetadata, sendAndConfirmTransaction, uploadData } from "@theminingco/core";
import { fetchAssetV1, getUpdateV1Instruction } from "@theminingco/metadata";
import { rpc, signer } from "../utility/config";
import { address } from "@solana/web3.js";
import { linkAccount } from "../utility/link";

export default async function resetAssetAllocation(): Promise<void> {
  const accountAddress = await promptText("What is the token address?");
  const asset = await fetchAssetV1(rpc, address(accountAddress));
  const metadata = await fetchMetadata(asset.data.uri);

  Object.assign(metadata, { allocation: undefined });
  const metaUri = await uploadData(JSON.stringify(metadata), signer);

  const instruction = getUpdateV1Instruction({
    payer: signer,
    asset: address(accountAddress),
    authority: signer,
    newUri: metaUri,
    newName: metadata.name,
    newUpdateAuthority: null,
  });

  const transaction = await createTransaction(rpc, [instruction], signer.address);
  await sendAndConfirmTransaction(rpc, transaction);

  console.info();
  console.info(`Reset token ${metadata.name}`);
  console.info(`Address:       ${linkAccount(address(accountAddress))}`);
}
