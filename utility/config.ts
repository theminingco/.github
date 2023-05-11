import { Connection, Keypair } from "@solana/web3.js";
import base58 from "bs58";

export const connection = new Connection(process.env.RPC_URL ?? "");
const genesisHash = await connection.getGenesisHash();
const genesisMap = {
    "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG": "devnet",
    "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY": "testnet",
    "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d": "mainnet-beta"
} as Record<string, string>;
export const cluster = genesisMap[genesisHash];

const seed = base58.decode(process.env.SOLANA_WALLET ?? "").subarray(0, 32);
export const signer = Keypair.fromSeed(seed);
