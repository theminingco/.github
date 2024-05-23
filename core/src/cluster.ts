import type { Rpc, GetGenesisHashApi } from "@solana/web3.js";

export async function getCluster(rpc: Rpc<GetGenesisHashApi>): Promise<string> {
  const genesisHash = await rpc.getGenesisHash().send();
  const genesisMap = {
    "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG": "devnet",
    "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY": "testnet",
    "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d": "mainnet-beta",
  } as Record<string, string>;
  return genesisMap[genesisHash];
}
