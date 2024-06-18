import type { CallableRequest } from "firebase-functions/v2/https";
import { HttpsError } from "firebase-functions/v2/https";
import { Parsable } from "../utility/parsable";
import { signer, rpc } from "../utility/solana";
import type { Allocation } from "@theminingco/core";
import { createTransaction, fetchMetadata, parseAllocation, randomId, uploadData } from "@theminingco/core";
import { getAddMemoInstruction } from "@solana-program/memo";
import { createNoopSigner, getBase64EncodedWireTransaction } from "@solana/web3.js";
import { fetchMaybeAssetV1, getTransferV1Instruction, getUpdateV1Instruction } from "@theminingco/metadata";

function unpackAllocation(allocation: Map<string, string>): Allocation[] {
  // TODO: insert allowed instruments from alpaca
  return Array.from(parseAllocation({ allocation }, []).entries())
    .map(([symbol, value]) => ({ symbol, percentage: `${value.toString()}%` }));
}

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
  metadata.allocation = unpackAllocation(allocation);
  const metaUri = await uploadData(JSON.stringify(metadata), signer);

  const publicKeySigner = createNoopSigner(publicKey);

  const instructions = [
    getUpdateV1Instruction({
      asset: tokenAddress,
      collection: poolAddress,
      payer: publicKeySigner,
      authority: signer,
      newUri: metaUri,
      newName: null,
      newUpdateAuthority: null,
    }),
    // Noop transfer to assert ownership at tx runtime
    getTransferV1Instruction({
      payer: publicKeySigner,
      newOwner: publicKey,
      asset: token.address,
      collection: poolAddress,
      authority: publicKeySigner,
      compressionProof: {
        __option: "None",
      },
    }),
    getAddMemoInstruction({
      memo: randomId(),
      signers: [signer, publicKeySigner],
    }),
  ];

  const tx = await createTransaction(rpc, instructions, publicKey);
  return { transaction: getBase64EncodedWireTransaction(tx) };
}
