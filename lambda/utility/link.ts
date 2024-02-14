import { cluster } from "./solana";
import type { PublicKey } from "@solana/web3.js";

const clusterQuery = (): string => {
  if (cluster === "mainnet-beta") { return ""; }
  return `?cluster=${cluster}`;
};

export const linkTransaction = (hash: string, text?: string): string => {
  const content = text ?? hash;
  return `[${content}](https://solscan.io/tx/${hash}${clusterQuery()})`;
};

export const linkAccount = (key: PublicKey, text?: string): string => {
  const address = key.toBase58();
  const content = text ?? address;
  return `[${content}](https://solscan.io/address/${address}${clusterQuery()})`;
};
