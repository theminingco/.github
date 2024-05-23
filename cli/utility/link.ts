import { shortAddress } from "@theminingco/core";
import { cluster } from "./config";
import type { Address } from "@solana/web3.js";

function clusterQuery(): string {
  if (cluster === "mainnet-beta") { return ""; }
  return `?cluster=${cluster}`;
}

export function link(url: string, str?: string): string {
  const content = str ?? url;
  return `\u{1b}]8;;${url}\u{7}${content}\u{1b}]8;;\u{7}`;
}

export function linkTransaction(hash: string, text?: string): string {
  const content = text ?? shortAddress(hash, 8);
  return link(`https://solscan.io/tx/${hash}${clusterQuery()}`, content);
}

export function linkAccount(key: Address, text?: string): string {
  const content = text ?? shortAddress(key);
  return link(`https://solscan.io/address/${key.toString()}${clusterQuery()}`, content);
}
