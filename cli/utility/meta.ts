import { address } from "@solana/web3.js";
import { signer } from "./config";
import { Creator } from "@theminingco/core";

export const creators: Array<Creator> = [
  { address: signer.address, share: 0, authority: signer },
  { address: address("6V4CFvMqeq3REaqnrozq6HX7Z7BxDYXhFYjZR1WRADXe"), share: 100 },
];
