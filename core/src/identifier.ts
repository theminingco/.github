import { getBase58Decoder } from "@solana/web3.js";

export function randomId(): string {
  const buffer = new ArrayBuffer(16);
  const view = new DataView(buffer);
  view.setFloat64(0, Math.random());
  view.setFloat64(8, Math.random());
  const bytes = new Uint8Array(buffer);
  return getBase58Decoder().decode(bytes);
}
