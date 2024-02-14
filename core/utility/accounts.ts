import type { AccountInfo, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { Account } from "@solana/spl-token";
import { unpackAccount } from "@solana/spl-token";
import { ASSOCIATED_TOKEN_PROGRAM_ID as associatedTokenProgramId, TOKEN_PROGRAM_ID as tokenProgramId } from "@solana/spl-token";
import { interval } from "./range";

export const associatedTokenAccount = (owner: PublicKey, mint: PublicKey): PublicKey => {
  const seeds = [owner.toBuffer(), tokenProgramId.toBuffer(), mint.toBuffer()];
  return PublicKey.findProgramAddressSync(seeds, associatedTokenProgramId)[0];
};

export const getMultipleAccountsBatched = async (connection: Connection, publicKeys: Array<PublicKey>): Promise<Array<AccountInfo<Buffer> | null>> => {
  const chunkSize = 100;
  const numChunks = Math.ceil(publicKeys.length / chunkSize);
  const chunks = interval(numChunks).map(i => publicKeys.slice(i * chunkSize, (i + 1) * chunkSize));
  const promises = chunks.map(async chunk => connection.getMultipleAccountsInfo(chunk));
  const results = await Promise.all(promises);
  return results.flat();
};

export const getMultipleTokenAccounts = async (connection: Connection, mintAccounts: Array<PublicKey>, owner: PublicKey): Promise<Array<Account | null>> => {
  const tokenAccounts = mintAccounts.map(mint => associatedTokenAccount(owner, mint));
  const accountInfos = await getMultipleAccountsBatched(connection, tokenAccounts);
  return interval(mintAccounts.length)
    .map(i => accountInfos[i] == null ? null : unpackAccount(tokenAccounts[i], accountInfos[i]));
};

export const isTokenOwner = (account: Account | null): boolean => {
  if (account == null) { return false; }
  return account.amount > 0;
};

