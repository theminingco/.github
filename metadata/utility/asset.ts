import type { Rpc, GetProgramAccountsApi, Address, Account } from "@solana/web3.js";
import { getBase58Decoder, getBase64Encoder } from "@solana/web3.js";
import type { AssetV1 } from "../generated";
import { getKeyEncoder, Key, getUpdateAuthorityEncoder, MPL_CORE_PROGRAM_PROGRAM_ADDRESS, getAssetV1Decoder } from "../generated";

const assetV1Key = getBase58Decoder().decode(getKeyEncoder().encode(Key.AssetV1));
export async function fetchAllAssetV1ByCollection(rpc: Rpc<GetProgramAccountsApi>, collection: Address): Promise<Account<AssetV1>[]> {
  const updateAuthority = getBase58Decoder().decode(getUpdateAuthorityEncoder().encode({ __kind: "Collection", fields: [collection] }));
  const accountInfos = await rpc.getProgramAccounts(MPL_CORE_PROGRAM_PROGRAM_ADDRESS, {
    encoding: "base64",
    filters: [
      { memcmp: { offset: 0n, bytes: assetV1Key.toString(), encoding: "base58" } },
      { memcmp: { offset: 33n, bytes: updateAuthority.toString(), encoding: "base58" } },
    ],
  }).send();
  const encoder = getBase64Encoder();
  const datas = accountInfos.map(x => encoder.encode(x.account.data[0]));
  const decoder = getAssetV1Decoder();
  const assets = datas.map(x => decoder.decode(x));
  return assets.map((asset, i) => ({
    ...accountInfos[i].account,
    address: accountInfos[i].pubkey,
    programAddress: MPL_CORE_PROGRAM_PROGRAM_ADDRESS,
    data: asset,
  }));
}
