import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { Parsable } from "../utility/parsable";
import { verifyMetadata } from "../utility/meta";
import { createFeeInstructions } from "../utility/fee";
import { poolCollection } from "../utility/firebase";
import { createTransaction, fromNumber, getNftByMint, isBefore, randomId, unix } from "@theminingco/core";
import { getTransferSolInstruction } from "@solana-program/system";
import { createNoopSigner, getBase64EncodedWireTransaction } from "@solana/web3.js";
import { rpc, signer } from "../utility/solana";
import { getAddMemoInstruction } from "@solana-program/memo";

export default async function sellToken(request: CallableRequest): Promise<unknown> {
  const parsable = new Parsable(request.data);
  const mintAddress = parsable.key("mintAccount").publicKey();
  const publicKey = parsable.key("publicKey").publicKey();
  const metaUri = parsable.key("metadata").string();

  const token = await getNftByMint(rpc, mintAddress);
  if (token == null) { throw new HttpsError("failed-precondition", "Invalid token"); }
  const pool = token.collection;
  if (pool == null) { throw new HttpsError("failed-precondition", "Invalid token address"); }
  if (!pool.verified) { throw new HttpsError("failed-precondition", "Invalid token address"); }

  const snapshot = await poolCollection
    .where("address", "==", pool.key)
    .get();

  if (snapshot.docs.length !== 1) { throw new HttpsError("failed-precondition", "Invalid token address"); }

  // const builder = metaplex.nfts().builders();
  const identifier = randomId();
  const { priceTimestamp, price } = snapshot.docs[0].data();

  if (isBefore(priceTimestamp, unix() - 900)) { throw new HttpsError("failed-precondition", "Invalid token price"); }

  // TODO: insert allowed instruments from alpaca
  await verifyMetadata(token, metaUri, []);

  const lamports = fromNumber(price, 9);
  const publicKeySigner = createNoopSigner(publicKey);

  const instructions = [
    // TODO: update metadata instruction
    getTransferSolInstruction({
      source: publicKeySigner,
      destination: signer.address,
      amount: lamports
    }),
    // TODO: Transfer pNFT
    ...createFeeInstructions(
      publicKeySigner,
      lamports,
      token,
    ),
    getAddMemoInstruction({
      memo: identifier,
      signers: [signer, publicKeySigner],
    })
  ]

  const tx = await createTransaction(rpc, instructions, publicKey);
  return { transaction: getBase64EncodedWireTransaction(tx) };
}
