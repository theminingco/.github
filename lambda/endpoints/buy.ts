import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { Parsable } from "../utility/parsable";
import { rpc, signer } from "../utility/solana";
import { validateMetadata } from "../utility/allocation";
import { createFeeInstructions } from "../utility/fee";
import { poolCollection, tokenCollection } from "../utility/firebase";
import { createTransaction, fromNumber, getAsset, getCollection, isBefore, randomId, unix } from "@theminingco/core";
import { getTransferSolInstruction } from "@solana-program/system";
import { getAddMemoInstruction } from "@solana-program/memo";
import { createNoopSigner, getBase64EncodedWireTransaction } from "@solana/web3.js";
import { getTransferV1Instruction, getUpdateV1Instruction } from "@theminingco/metadata";

export default async function buyToken(request: CallableRequest): Promise<unknown> {
  const parsable = new Parsable(request.data);
  const asset = parsable.key("asset").publicKey();
  const publicKey = parsable.key("publicKey").publicKey();
  const metaUri = parsable.key("metadata").string();

  const tokenSnapshot = await tokenCollection
    .select("owner", "collection", "uri")
    .where("address", "==", asset.toString())
    .limit(1)
    .get();
  if (tokenSnapshot.docs.length !== 1) { throw new HttpsError("failed-precondition", "Invalid token"); }
  const token = tokenSnapshot.docs[0].data();
  if (token.owner !== signer.address) { throw new HttpsError("failed-precondition", "Incorrect token owner"); }

  const poolSnapshot = await poolCollection
    .select("priceTimestamp", "price")
    .where("address", "==", token.collection)
    .limit(1)
    .get();
  if (poolSnapshot.docs.length !== 1) { throw new HttpsError("failed-precondition", "Invalid token collection"); }

  const { priceTimestamp, price } = poolSnapshot.docs[0].data();
  if (isBefore(priceTimestamp, unix() - 900)) { throw new HttpsError("failed-precondition", "Invalid token price"); }

  // TODO: insert allowed instruments from alpaca
  await validateMetadata(metaUri, [], token.uri);

  const lamports = fromNumber(price, 9);
  const publicKeySigner = createNoopSigner(publicKey);

  const instructions = [
    getUpdateV1Instruction({
      asset: token.address,
      collection: token.collection,
      payer: publicKeySigner,
      authority: signer,
      newUri: metaUri,
      // Do not update name or update authority
      newName: null,
      newUpdateAuthority: null,
    }),
    getTransferSolInstruction({
      source: publicKeySigner,
      destination: signer.address,
      amount: lamports
    }),
    getTransferV1Instruction({
      payer: publicKeySigner,
      newOwner: publicKey,
      asset: token.address,
      collection: token.collection,
      authority: signer,
      compressionProof: {
        __option: "None",
      }
    }),
    ...await createFeeInstructions({
      payer: publicKeySigner,
      amount: lamports,
      collection: token.collection,
    }),
    getAddMemoInstruction({
      memo: randomId(),
      signers: [signer, publicKeySigner],
    })
  ];

  const tx = await createTransaction(rpc, instructions, publicKey);
  return { transaction: getBase64EncodedWireTransaction(tx) };
}

