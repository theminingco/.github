import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { verifyMetadata } from "../utility/meta";
import { Parsable } from "../utility/parsable";
import { signer, rpc } from "../utility/solana";
import { createTransaction, getNftByMint, randomId } from "@theminingco/core";
import { getAddMemoInstruction } from "@solana-program/memo";
import { createNoopSigner, getBase64EncodedWireTransaction } from "@solana/web3.js";

export default async function updateToken(request: CallableRequest): Promise<unknown> {
  const parsable = new Parsable(request.data);
  const mintAddress = parsable.key("mintAccount").publicKey();
  const publicKey = parsable.key("publicKey").publicKey();
  const metaUri = parsable.key("metadata").string();

  const token = await getNftByMint(rpc, mintAddress);
  if (token == null) { throw new HttpsError("failed-precondition", "Invalid token"); }
  // const builder = metaplex.nfts().builders();
  const identifier = randomId();

  // TODO: check if publicKey is the owner of the nft

  // TODO: insert allowed instruments from alpaca
  await verifyMetadata(token, metaUri, []);

  const publicKeySigner = createNoopSigner(publicKey);

  const instructions = [
    // TODO: update nft metadata
    getAddMemoInstruction({
      memo: identifier,
      signers: [signer, publicKeySigner],
    })
  ];

  const tx = await createTransaction(rpc, instructions, publicKey);
  return { transaction: getBase64EncodedWireTransaction(tx) };
}
