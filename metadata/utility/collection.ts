import type { Rpc, GetProgramAccountsApi, Address, Account } from "@solana/web3.js";
import { getBase58Decoder, getBase64Encoder } from "@solana/web3.js";
import type { CollectionV1 } from "../generated";
import { getKeyEncoder, Key, MPL_CORE_PROGRAM_PROGRAM_ADDRESS, getCollectionV1Decoder } from "../generated";

const collectionV1Key = getBase58Decoder().decode(getKeyEncoder().encode(Key.CollectionV1));
export async function fetchAllCollectionV1ByUpdateAuthority(rpc: Rpc<GetProgramAccountsApi>, updateAuthority: Address): Promise<Account<CollectionV1>[]> {
  const accountInfos = await rpc.getProgramAccounts(MPL_CORE_PROGRAM_PROGRAM_ADDRESS, {
    encoding: "base64",
    filters: [
      { memcmp: { offset: 0n, bytes: collectionV1Key.toString(), encoding: "base58" } },
      { memcmp: { offset: 1n, bytes: updateAuthority.toString(), encoding: "base58" } },
    ],
  }).send();
  const encoder = getBase64Encoder();
  const datas = accountInfos.map(x => encoder.encode(x.account.data[0]));
  const decoder = getCollectionV1Decoder();
  const collections = datas.map(x => decoder.decode(x));
  return collections.map((collection, i) => ({
    ...accountInfos[i].account,
    address: accountInfos[i].pubkey,
    programAddress: MPL_CORE_PROGRAM_PROGRAM_ADDRESS,
    data: collection,
  }));
}
