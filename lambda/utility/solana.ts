import type { KeyPairSigner, Rpc, SolanaRpcApi } from "@solana/web3.js";
import { createKeyPairSignerFromBytes, createSolanaRpcFromTransport, getBase58Encoder } from "@solana/web3.js";
import { createRateLimitedRpcTransport, getCluster } from "@theminingco/core";
import { rpcUrl, walletKey } from "./secrets";

export let cluster = "";
export let rpc = {} as Rpc<SolanaRpcApi>;
export let signer = {} as KeyPairSigner;

export async function initializeConnection(): Promise<void> {
  rpc = createSolanaRpcFromTransport(
    createRateLimitedRpcTransport({ url: rpcUrl.value() }),
  );
  cluster = await getCluster(rpc);
  const seed = getBase58Encoder().encode(walletKey.value());
  signer = await createKeyPairSignerFromBytes(seed);
}
