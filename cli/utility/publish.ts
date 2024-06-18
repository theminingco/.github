import { Address, TransactionSigner } from "@solana/web3.js";
import { royaltiesPlugin } from "./royalties";
import { PluginType, getAddCollectionPluginV1Instruction, getRemoveCollectionPluginV1Instruction } from "@theminingco/metadata";

function updateRoyaltiesPlugin(collectionAddress: Address, signer: TransactionSigner, released: boolean) {
  const pluginAuthorityPair = royaltiesPlugin({ released });
  return [
    getRemoveCollectionPluginV1Instruction({
      collection: collectionAddress,
      payer: signer,
      pluginType: PluginType.Royalties,
    }),
    getAddCollectionPluginV1Instruction({
      collection: collectionAddress,
      payer: signer,
      initAuthority: pluginAuthorityPair.authority,
      plugin: pluginAuthorityPair.plugin,
    })
  ];
}

export function publishCollectionInstructions(collectionAddress: Address, signer: TransactionSigner) {
  return updateRoyaltiesPlugin(collectionAddress, signer, true);
}

export function unpublishCollectionInstructions(collectionAddress: Address, signer: TransactionSigner) {
  return updateRoyaltiesPlugin(collectionAddress, signer, false);
}
