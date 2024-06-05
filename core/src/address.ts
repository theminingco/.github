import { Address } from "@solana/web3.js";

export function shortAddress(publicKey: Address | string, chars = 4): string {
  const numChars = Math.max(4, Math.min(chars, 8));
  const key = publicKey.toString();
  const prefix = key.slice(0, numChars);
  const suffix = key.slice(-numChars);
  return `${prefix}...${suffix}`;
}


