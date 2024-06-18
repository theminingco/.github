import { shortAddress } from "@theminingco/core";
import { cluster } from "./solana";
import type { Address } from "@solana/web3.js";

const clusterQuery = (): string => {
  if (cluster === "mainnet-beta") { return ""; }
  return `?cluster=${cluster}`;
};

export function link(url: string, str?: string): string {
  const content = str ?? url;
  return `[${content}](${url})`;
}

export function linkTransaction(hash: string, text?: string): string {
  const content = text ?? shortAddress(hash, 8);
  return link(`https://solscan.io/tx/${hash}${clusterQuery()}`, content);
}

export function linkAccount(key: Address, text?: string): string {
  const content = text ?? shortAddress(key);
  return link(`https://solscan.io/address/${key.toString()}${clusterQuery()}`, content);
}
