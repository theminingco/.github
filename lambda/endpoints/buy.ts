import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { Parsable } from "../utility/parsable";
import { connection, metaplex, signer } from "../utility/solana";
import { LAMPORTS_PER_SOL, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { createMemoInstruction } from "@solana/spl-memo";
import { v4 as uuid } from "uuid";
import { verifyMetadata } from "../utility/meta";
import { createFeeInstructions } from "../utility/fee";
import { poolCollection } from "../utility/firebase";
import { isBefore, unix } from "@theminingco/core";
import { findTokenByMint } from "../utility/token";

const buyToken = async (request: CallableRequest): Promise<unknown> => {
  const parsable = new Parsable(request.data);
  const mintAddress = parsable.key("mintAccount").publicKey();
  const publicKey = parsable.key("publicKey").publicKey();
  const metaUri = parsable.key("metadata").string();

  const token = await findTokenByMint(mintAddress);
  const pool = token.collection;
  if (pool == null) { throw new HttpsError("failed-precondition", "Invalid token"); }
  if (!pool.verified) { throw new HttpsError("failed-precondition", "Invalid token"); }

  const snapshot = await poolCollection
    .where("address", "==", pool.address)
    .get();

  if (snapshot.docs.length !== 1) { throw new HttpsError("failed-precondition", "Invalid token address"); }

  const builder = metaplex.nfts().builders();
  const identifier = uuid();
  const stamp = snapshot.docs[0].data().priceTimestamp;
  const { price } = snapshot.docs[0].data();

  if (isBefore(stamp, unix() - 900)) { throw new HttpsError("failed-precondition", "Invalid token price"); }

  // TODO: insert allowed instruments from alpaca
  await verifyMetadata(token, metaUri, []);

  const metaInstruction = builder.update({
    nftOrSft: token,
    uri: metaUri
  }).getInstructions();

  const paymentInstruction = SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: signer.publicKey,
    lamports: price * LAMPORTS_PER_SOL
  });

  const transferInstructions = builder.transfer({
    nftOrSft: token,
    fromOwner: signer.publicKey,
    toOwner: publicKey
  }).getInstructions();

  const feeInstructions = createFeeInstructions(
    publicKey,
    price * LAMPORTS_PER_SOL,
    token
  );

  const memoInstruction = createMemoInstruction(
    identifier,
    [signer.publicKey, publicKey]
  );

  const instructions = [...metaInstruction, paymentInstruction, ...transferInstructions, ...feeInstructions, memoInstruction];

  const block = await connection.getLatestBlockhash();

  const message = new TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: block.blockhash,
    instructions
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);
  transaction.sign([signer]);

  return { transaction: transaction.serialize() };
};

export default buyToken;
