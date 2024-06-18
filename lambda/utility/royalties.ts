import { ReadonlyUint8Array, getEncodedSize } from "@solana/web3.js";
import { getCollectionV1Decoder, getCollectionV1Encoder, getPluginHeaderV1Decoder, getPluginRegistryV1Decoder, PluginType, getRoyaltiesDecoder, Royalties } from "@theminingco/metadata";
import { HttpsError } from "firebase-functions/v2/https";

export function extractRoyaltiesPlugin(accountData: ReadonlyUint8Array): Royalties {
  const collection = getCollectionV1Decoder().decode(accountData);
  const collectionSize = getEncodedSize(collection, getCollectionV1Encoder());
  const pluginHeader = getPluginHeaderV1Decoder().decode(accountData, collectionSize);
  const pluginRegistry = getPluginRegistryV1Decoder().decode(accountData, Number(pluginHeader.pluginRegistryOffset));
  const royaltiesRegistry = pluginRegistry.registry.find(plugin => plugin.pluginType === PluginType.Royalties);
  if (!royaltiesRegistry) { throw new HttpsError("invalid-argument", "Bad collection"); }
  return getRoyaltiesDecoder().decode(accountData, Number(royaltiesRegistry.offset));
}
