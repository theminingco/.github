import type { Address, SignatureBytes } from "@solana/web3.js";
import { address, getBase58Decoder, getBase58Encoder, verifySignature } from "@solana/web3.js";
import { unix } from "./time";
import { randomId } from "./identifier";
import { subtle } from "crypto";

export interface Signature {
  readonly scope: string;
  readonly signer: Address;
}

interface SignaturePayload {
  readonly scope: string;
  readonly nonce: string;
  readonly signer: string;
  readonly stamp: number;
}

type SignMessage = (message: Uint8Array) => Promise<Uint8Array>;
const base58 = {
  decode: getBase58Decoder().decode,
  encode: getBase58Encoder().encode,
};
const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();
const text = {
  decode: textDecoder.decode.bind(textDecoder),
  encode: textEncoder.encode.bind(textEncoder),
};

export async function validateSignature(key: string, expiry = 86400): Promise<Signature | null> {
  const [body, sig] = key.split(":");
  const data = base58.encode(body);
  const payload = JSON.parse(text.decode(data)) as SignaturePayload;
  const singerBytes = base58.encode(payload.signer);
  const signer = await subtle.importKey("raw", singerBytes, "Ed25519", true, ["verify"]);
  const signature = new Uint8Array(base58.encode(sig)) as SignatureBytes;
  if (payload.stamp <= unix() - expiry) { return null; }
  const isValid = await verifySignature(signer, signature, data);
  if (!isValid) { return null; }
  return { scope: payload.scope, signer: address(payload.signer) };
}

export async function getSignature(publicKey: Address, signMessage: SignMessage, keyScope: string): Promise<string> {
  const payload = {
    scope: keyScope,
    nonce: randomId(),
    signer: publicKey.toString(),
    stamp: unix(),
  };
  const body = text.encode(JSON.stringify(payload));
  const signature = await signMessage(body);
  return `${base58.decode(body)}:${base58.decode(signature)}`;
}
