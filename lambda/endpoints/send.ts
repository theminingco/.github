import type { CallableRequest } from "firebase-functions/v2/https";
import { HttpsError } from "firebase-functions/v2/https";
import { Parsable } from "../utility/parsable";
import { getUpdateV1InstructionDataDecoder } from "@theminingco/metadata";
import { rpc, signer } from "../utility/solana";
import { tokenCollection } from "../utility/firebase";
import { getBase64Encoder, getCompiledTransactionMessageDecoder, getTransactionDecoder } from "@solana/web3.js";
import { fetchMetadata, sendAndConfirmTransaction } from "@theminingco/core";

export default async function sendUpdateTokenTransaction(request: CallableRequest): Promise<unknown> {
  const parsable = new Parsable(request.data);
  const encodedTransaction = parsable.key("transaction").string();
  const rawTransaction = getBase64Encoder().encode(encodedTransaction);
  const transaction = getTransactionDecoder().decode(rawTransaction);
  if (transaction.signatures[signer.address] == null) { throw new HttpsError("failed-precondition", "Invalid transaction signer"); }

  const message = getCompiledTransactionMessageDecoder().decode(transaction.messageBytes);
  const updateInstruction = message.instructions[0];
  if (updateInstruction == null) { throw new HttpsError("failed-precondition", "Invalid transaction"); }
  if (updateInstruction.data == null) { throw new HttpsError("failed-precondition", "Invalid transaction"); }
  const updateInstructionData = getUpdateV1InstructionDataDecoder().decode(updateInstruction.data);
  if (updateInstructionData.newUri.__option !== "Some") { throw new HttpsError("failed-precondition", "Invalid transaction"); }
  const tokenIndex = updateInstruction.accountIndices?.[0];
  if (tokenIndex == null) { throw new HttpsError("failed-precondition", "Invalid transaction"); }
  const tokenAddress = message.staticAccounts[tokenIndex];

  const snapshot = await tokenCollection
    .where("address", "==", tokenAddress)
    .limit(1)
    .get();
  if (snapshot.docs.length !== 1) { throw new HttpsError("failed-precondition", "Token not found"); }
  const doc = snapshot.docs[0];

  const metadata = await fetchMetadata(updateInstructionData.newUri.value);
  const allocation = new Map(metadata.allocation.map(({ symbol, percentage }) => [symbol, percentage]));
  const signature = await sendAndConfirmTransaction(rpc, transaction);
  await doc.ref.update({ allocation });
  return { signature };
}
