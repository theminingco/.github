import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { Parsable } from "../utility/parsable";
import { signer, rpc } from "../utility/solana";
import { createTransaction, randomId } from "@theminingco/core";
import { getAddMemoInstruction } from "@solana-program/memo";
import { createNoopSigner, getBase64EncodedWireTransaction } from "@solana/web3.js";
import { validateMetadata } from "../utility/allocation";
import { tokenCollection } from "../utility/firebase";
import { getTransferV1Instruction, getUpdateV1Instruction } from "@theminingco/metadata";

export default async function updateToken(request: CallableRequest): Promise<unknown> {
  const parsable = new Parsable(request.data);
  const asset = parsable.key("asset").publicKey();
  const publicKey = parsable.key("publicKey").publicKey();
  const metaUri = parsable.key("metadata").string();

  const tokenSnapshot = await tokenCollection
    .select("owner", "uri")
    .where("address", "==", asset.toString())
    .limit(1)
    .get();
  if (tokenSnapshot.docs.length !== 1) { throw new HttpsError("failed-precondition", "Invalid token"); }
  const token = tokenSnapshot.docs[0].data();
  if (token.owner !== publicKey) { throw new HttpsError("failed-precondition", "Incorrect token owner"); }

  // TODO: insert allowed instruments from alpaca
  await validateMetadata(metaUri, [], token.uri);

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
    // Noop transfer to assert ownership at tx runtime
    getTransferV1Instruction({
      payer: publicKeySigner,
      newOwner: publicKey,
      asset: token.address,
      collection: token.collection,
      authority: publicKeySigner,
      compressionProof: {
        __option: "None",
      }
    }),
    getAddMemoInstruction({
      memo: randomId(),
      signers: [signer, publicKeySigner],
    })
  ];

  const tx = await createTransaction(rpc, instructions, publicKey);
  return { transaction: getBase64EncodedWireTransaction(tx) };
}
