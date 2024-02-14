import type { Connection, PublicKey } from "@solana/web3.js";

export const isAccountFunded = async (connection: Connection, publicKey: PublicKey): Promise<boolean> => {
  const accountInfo = await connection.getAccountInfo(publicKey);
  if (accountInfo == null) { return false; }
  return accountInfo.lamports > 0;
};
