import { cluster } from "./config";
import type { PublicKey } from "@solana/web3.js";

const clusterQuery = (): string => {
  if (cluster === "mainnet-beta") { return ""; }
  return `?cluster=${cluster}`;
};

export const link = (str: string, url: string): string => {
  return `\u{1b}]8;;${url}\u{7}${str}\u{1b}]8;;\u{7}`;
};

export const linkTransaction = (hash: string, text?: string): string => {
  const content = text ?? hash;
  return link(content, `https://solscan.io/tx/${hash}${clusterQuery()}`);
};

export const linkAccount = (key: PublicKey, text?: string): string => {
  const address = key.toBase58();
  const content = text ?? address;
  return link(content, `https://solscan.io/address/${address}${clusterQuery()}`);
};
