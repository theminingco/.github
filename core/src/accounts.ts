import { Rpc, Address, GetMultipleAccountsApi, AccountInfoBase, AccountInfoWithBase64EncodedData, GetProgramAccountsApi, getBase58Encoder, getBase64Encoder } from '@solana/web3.js';
import { interval } from "./array";
import { Token } from "@solana-program/token";
import { associatedTokenAccount, metadataAddress, metadataProgramId } from './address';
import { Metadata, unpackMetadata } from './metadata';
import { unpackTokenAccount } from './token';

type AccountInfo = AccountInfoBase & AccountInfoWithBase64EncodedData;

export async function getMultipleAccountsBatched(rpc: Rpc<GetMultipleAccountsApi>, publicKeys: Array<Address>): Promise<Array<AccountInfo | null>> {
  const chunkSize = 100;
  const numChunks = Math.ceil(publicKeys.length / chunkSize);
  const chunks = interval(numChunks).map(i => publicKeys.slice(i * chunkSize, (i + 1) * chunkSize));
  const promises = chunks.map(async chunk => rpc.getMultipleAccounts(chunk).send().then(x => x.value));
  const results = await Promise.all(promises);
  return results.flat();
}

export async function getMultipleTokenAccounts(rpc: Rpc<GetMultipleAccountsApi>, mintAccounts: Array<Address>, owner: Address): Promise<Array<Token | null>> {
  const tokenAccounts = await Promise.all(mintAccounts.map(mint => associatedTokenAccount(owner, mint)));
  const accountInfos = await getMultipleAccountsBatched(rpc, tokenAccounts);
  return accountInfos
    .mapNonNull(x => ({ data: getBase64Encoder().encode(x.data[0]) }))
    .mapNonNull(unpackTokenAccount);
};

export async function getNftByMint(rpc: Rpc<GetMultipleAccountsApi>, mint: Address): Promise<Metadata | null> {
  const metaAddress = await metadataAddress(mint);
  const accountInfo = await getMultipleAccountsBatched(rpc, [metaAddress]);
  if (accountInfo[0] == null) { return null; }
  const data = getBase58Encoder().encode(accountInfo[0].data[0]);
  return unpackMetadata({ data });
};

export async function getNftsByUpdateAuthority(rpc: Rpc<GetProgramAccountsApi>, updateAuthority: Address): Promise<Array<Metadata>> {
  const accountInfos = await rpc.getProgramAccounts(metadataProgramId, {
    filters: [{
      offset: 1n,
      bytes: updateAuthority.toString(),
      encoding: "base58"
    }]
  }).send();
  return accountInfos
    .map(x => ({ data: getBase58Encoder().encode(x.account.data) }))
    .map(unpackMetadata);
};

export const isTokenOwner = (account: Token | null): boolean => {
  if (account == null) { return false; }
  return account.amount > 0;
};

