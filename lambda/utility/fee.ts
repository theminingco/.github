import { getTransferSolInstruction } from "@solana-program/system";
import { Address, IInstruction, TransactionSigner, getBase64Decoder, getBase64Encoder, getEncodedSize } from "@solana/web3.js";
import { rpc } from "./solana";
import { HttpsError } from "firebase-functions/v2/https";
import { PluginType, getCollectionV1Decoder, getCollectionV1Encoder, getPluginHeaderV1Decoder, getPluginRegistryV1Decoder, getRoyaltiesDecoder } from "@theminingco/metadata";

export async function createFeeInstructions(props: { payer: TransactionSigner; amount: bigint; collection: Address }):  Promise<Array<IInstruction>> {
  const accountInfo = await rpc.getAccountInfo(props.collection).send();
  if (!accountInfo.value) { throw new HttpsError("invalid-argument", "Bad collection"); }
  const data = getBase64Encoder().encode(accountInfo.value.data[0]);
  const collection = getCollectionV1Decoder().decode(data);
  const collectionSize = getEncodedSize(collection, getCollectionV1Encoder());
  const pluginHeader = getPluginHeaderV1Decoder().decode(data, collectionSize);
  const pluginRegistry = getPluginRegistryV1Decoder().decode(data, Number(pluginHeader.pluginRegistryOffset));
  const royaltiesRegistry = pluginRegistry.registry.find((plugin) => plugin.pluginType === PluginType.Royalties);
  if (!royaltiesRegistry) { return []; }
  const royalties = getRoyaltiesDecoder().decode(data, Number(royaltiesRegistry.offset));

  const instructions: Array<IInstruction> = [];

  for (const creator of royalties.creators) {
    if (creator.percentage === 0) { continue; }
    const feeReceiver = creator.address;
    const feeAmount = BigInt(royalties.basisPoints * creator.percentage) * props.amount / 1000000n;

    instructions.push(
      getTransferSolInstruction({
        source: props.payer,
        destination: feeReceiver,
        amount: feeAmount,
      })
    );
  }
  return instructions;
}
