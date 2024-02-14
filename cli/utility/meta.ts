import type { CreatorInput } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import { signer } from "./config";

export const creators: Array<CreatorInput> = [
  { address: signer.publicKey, share: 0, authority: signer },
  { address: new PublicKey("6V4CFvMqeq3REaqnrozq6HX7Z7BxDYXhFYjZR1WRADXe"), share: 100 }
];
