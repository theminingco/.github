import { createRateLimitedRpcTransport, getCluster } from "@theminingco/core";
import type { KeyPairSigner, Rpc, SolanaRpcApi } from "@solana/web3.js";
import { createSolanaRpcFromTransport, createKeyPairSignerFromBytes, getBase58Encoder } from "@solana/web3.js";
import { getSecret } from "./secrets";

export let rpc = {} as Rpc<SolanaRpcApi>;
export let cluster = "";
export let signer = {} as KeyPairSigner;

export async function initialize(): Promise<void> {
  const rpcUrl = await getSecret("RPC_URL");
  rpc = createSolanaRpcFromTransport(
    createRateLimitedRpcTransport({ url: rpcUrl }),
  );
  cluster = await getCluster(rpc);

  const solanaWallet = await getSecret("SOLANA_WALLET");
  const seed = getBase58Encoder().encode(solanaWallet);
  signer = await createKeyPairSignerFromBytes(seed);
}

export const assetSymbol = "tmc";
export const assetImage = "https://theminingco.xyz/logo/512";
export const assetDescription = "Keep on digging...";
export const assetAttribution = "Copyright © 2024 iwcapital.xyz";
export const assetUrl = "https://theminingco.xyz/";
export const costPerCollection = 0.0023;
export const reclaimablePerCollection = 0.0014;
export const costPerAsset = 0.0034;
export const reclaimablePerAsset = 0.0010;
