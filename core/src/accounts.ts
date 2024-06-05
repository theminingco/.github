import { Rpc, Address, GetMultipleAccountsApi, AccountInfoBase, AccountInfoWithBase64EncodedData, GetProgramAccountsApi, getBase58Encoder, getBase64Encoder, GetAccountInfoApi } from '@solana/web3.js';
import { AssetV1, CollectionV1, MPL_CORE_PROGRAM_PROGRAM_ADDRESS, getAssetV1Decoder, getCollectionV1Decoder } from '@theminingco/metadata';
import { interval } from './array';

type AccountInfo = AccountInfoBase & AccountInfoWithBase64EncodedData;

export async function getMultipleAccountsBatched(rpc: Rpc<GetMultipleAccountsApi>, publicKeys: Array<Address>): Promise<Array<AccountInfo | null>> {
  const chunkSize = 100;
  const numChunks = Math.ceil(publicKeys.length / chunkSize);
  const chunks = interval(numChunks).map(i => publicKeys.slice(i * chunkSize, (i + 1) * chunkSize));
  const promises = chunks.map(async chunk => rpc.getMultipleAccounts(chunk).send().then(x => x.value));
  const results = await Promise.all(promises);
  return results.flat();
}

export async function getAsset(rpc: Rpc<GetAccountInfoApi>, asset: Address): Promise<AssetV1 | null> {
  const accountInfo = await rpc.getAccountInfo(asset).send();
  if (accountInfo.value == null) { return null; }
  const data = getBase58Encoder().encode(accountInfo.value.data[0]);
  return getAssetV1Decoder().decode(data);
};

export async function getMultipleAssets(rpc: Rpc<GetMultipleAccountsApi>, assets: Array<Address>): Promise<Array<AssetV1 | null>> {
  const accountInfos = await getMultipleAccountsBatched(rpc, assets);
  const encoder = getBase64Encoder();
  const decoder = getAssetV1Decoder();
  return accountInfos
    .mapNonNull(x => encoder.encode(x.data[0]))
    .mapNonNull(x => decoder.decode(x));
}

export async function getAssetsByUpdateAuthority(rpc: Rpc<GetProgramAccountsApi>, updateAuthority: Address): Promise<Array<AssetV1  & { address: Address }>> {
  const accountInfos = await rpc.getProgramAccounts(MPL_CORE_PROGRAM_PROGRAM_ADDRESS, {
    filters: [{
      // TODO: <--
      offset: 1n,
      bytes: updateAuthority.toString(),
      encoding: "base58"
    }]
  }).send();
  const encoder = getBase64Encoder();
  const datas = accountInfos.map(x => encoder.encode(x.account.data[0]));
  const decoder = getAssetV1Decoder();
  const assets = datas.map(x => decoder.decode(x));
  return assets.map((asset, i) => ({
    ...asset,
    address: accountInfos[i].pubkey
  }));
}

export async function getCollection(rpc: Rpc<GetAccountInfoApi>, collection: Address): Promise<CollectionV1 | null> {
  const accountInfo = await rpc.getAccountInfo(collection).send();
  if (accountInfo.value == null) { return null; }
  const data = getBase58Encoder().encode(accountInfo.value.data[0]);
  return getCollectionV1Decoder().decode(data);
}

export async function getMultipleCollections(rpc: Rpc<GetMultipleAccountsApi>, collections: Array<Address>): Promise<Array<CollectionV1 | null>> {
  const accountInfos = await getMultipleAccountsBatched(rpc, collections);
  const encoder = getBase64Encoder();
  const decoder = getCollectionV1Decoder();
  return accountInfos
    .mapNonNull(x => encoder.encode(x.data[0]))
    .mapNonNull(x => decoder.decode(x));
}

export async function getCollectionsByUpdateAuthority(rpc: Rpc<GetProgramAccountsApi>, updateAuthority: Address): Promise<Array<CollectionV1 & { address: Address }>> {
  const accountInfos = await rpc.getProgramAccounts(MPL_CORE_PROGRAM_PROGRAM_ADDRESS, {
    filters: [{
            // TODO: <--
      offset: 1n,
      bytes: updateAuthority.toString(),
      encoding: "base58"
    }]
  }).send();
  const encoder = getBase64Encoder();
  const datas = accountInfos.map(x => encoder.encode(x.account.data[0]));
  const decoder = getCollectionV1Decoder();
  const collections = datas.map(x => decoder.decode(x));
  return collections.map((collection, i) => ({
    ...collection,
    address: accountInfos[i].pubkey
  }));
}
