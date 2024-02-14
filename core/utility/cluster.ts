import type { Connection } from "@solana/web3.js";

export const getCluster = async (connection: Connection): Promise<string> => {
  const genesisHash = await connection.getGenesisHash();
  const genesisMap = {
    "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG": "devnet",
    "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY": "testnet",
    "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d": "mainnet-beta"
  } as Record<string, string>;
  return genesisMap[genesisHash];
};
