import { Token, getTokenDecoder } from "@solana-program/token";
import { ReadonlyUint8Array } from "@solana/web3.js";

export function unpackTokenAccount(accountInfo: { data: ReadonlyUint8Array | Uint8Array }): Token {
  return getTokenDecoder().decode(accountInfo.data);
}
