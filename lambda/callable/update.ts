import type { CallableRequest } from "firebase-functions/v2/https";
import { HttpsError } from "firebase-functions/v2/https";
import { Parsable } from "../utility/parsable";
import { signer, rpc } from "../utility/solana";
import { allocationParser, createTransaction, fetchMetadata, randomId, uploadData } from "@theminingco/core";
import { getAddMemoInstruction } from "@solana-program/memo";
import { createNoopSigner, getBase64EncodedWireTransaction } from "@solana/web3.js";
import { fetchMaybeAssetV1, getTransferV1Instruction, getUpdateV1Instruction } from "@theminingco/metadata";

export default async function getUpdateTokenTransaction(request: CallableRequest): Promise<unknown> {
  const parsable = new Parsable(request.data);
  const tokenAddress = parsable.key("tokenAddress").publicKey();
  const publicKey = parsable.key("publicKey").publicKey();
  const allocation = parsable.key("allocation").map(x => x.string());

  const token = await fetchMaybeAssetV1(rpc, tokenAddress);
  if (!token.exists) { throw new HttpsError("failed-precondition", "Invalid token"); }
  if (token.data.owner !== publicKey) { throw new HttpsError("failed-precondition", "Incorrect token owner"); }
  if (token.data.updateAuthority.__kind !== "Collection") { throw new HttpsError("failed-precondition", "Invalid update authority"); }
  const poolAddress = token.data.updateAuthority.fields[0];

  const metadata = await fetchMetadata(token.data.uri);
  // TODO: insert allowed instruments from alpaca
  metadata.allocation = allocationParser({ container: "allocation", value: "percent" }).parse({ allocation });
  const metaUri = await uploadData(JSON.stringify(metadata), signer);

  const publicKeySigner = createNoopSigner(publicKey);
  const authoritySigner = publicKey === signer.address ? publicKeySigner : signer;

  const instructions = [
    getUpdateV1Instruction({
      asset: tokenAddress,
      collection: poolAddress,
      payer: publicKeySigner,
      authority: authoritySigner,
      newUri: metaUri,
      newName: null,
      newUpdateAuthority: null,
    }),
    // Noop transfer to assert ownership at tx runtime
    getTransferV1Instruction({
      payer: publicKeySigner,
      newOwner: publicKey,
      asset: tokenAddress,
      collection: poolAddress,
      compressionProof: {
        __option: "None",
      },
    }),
    getAddMemoInstruction({
      memo: randomId(),
      signers: [authoritySigner, publicKeySigner],
    }),
  ];

  const tx = await createTransaction(rpc, instructions, publicKey);
  return { transaction: getBase64EncodedWireTransaction(tx) };
}
