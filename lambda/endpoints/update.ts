import { createMemoInstruction } from "@solana/spl-memo";
import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import type { CallableRequest } from "firebase-functions/v2/https";
import { verifyMetadata } from "../utility/meta";
import { Parsable } from "../utility/parsable";
import { metaplex, signer, connection } from "../utility/solana";
import { v4 as uuid } from "uuid";
import { findTokenByMint } from "../utility/token";

const updateToken = async (request: CallableRequest): Promise<unknown> => {
  const parsable = new Parsable(request.data);
  const mintAddress = parsable.key("mintAccount").publicKey();
  const publicKey = parsable.key("publicKey").publicKey();
  const metaUri = parsable.key("metadata").string();

  const token = await findTokenByMint(mintAddress);
  const builder = metaplex.nfts().builders();
  const identifier = uuid();

  // TODO: insert allowed instruments from alpaca
  await verifyMetadata(token, metaUri, []);

  const metaInstruction = builder.update({
    nftOrSft: token,
    uri: metaUri
  }).getInstructions();

  const memoInstruction = createMemoInstruction(
    identifier,
    [signer.publicKey, publicKey]
  );

  const instructions = [...metaInstruction, memoInstruction];

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

export default updateToken;
