import type { Address, FetchAccountConfig, GetMultipleAccountsApi, Rpc } from "@solana/web3.js";
import { interval } from "./array";

const batchLimit = 100;

type FetchFn<T extends object> = (rpc: Rpc<GetMultipleAccountsApi>, addresses: Address[], config?: FetchAccountConfig) => Promise<T[]>;

export function batchFetch<T extends object>(fetchFn: FetchFn<T>): { send: FetchFn<T> } {
  return {
    send: async (rpc, addresses, config) => {
      const numChunks = Math.ceil(addresses.length / batchLimit);
      const chunks = interval(numChunks).map(i => addresses.slice(i * batchLimit, (i + 1) * batchLimit));
      const promises = chunks.map(async chunk => fetchFn(rpc, chunk, config));
      const results = await Promise.all(promises);
      return results.flat();
    },
  };
}
