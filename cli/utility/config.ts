import { getCluster } from "@theminingco/core";
import { KeyPairSigner, Rpc, SolanaRpcApi, createSolanaRpcFromTransport, createDefaultRpcTransport, createKeyPairSignerFromBytes, getBase58Encoder } from "@solana/web3.js";
import { getSecret } from "./secrets";

export let rpc = {} as Rpc<SolanaRpcApi>;
export let cluster = "";
export let signer = {} as KeyPairSigner;

export async function initialize(): Promise<void> {
  const rpcUrl = await getSecret("RPC_URL");
  rpc = createSolanaRpcFromTransport(
    createDefaultRpcTransport({ url: rpcUrl })
  );
  cluster = await getCluster(rpc);

  const solanaWallet = await getSecret("SOLANA_WALLET");
  const seed = getBase58Encoder().encode(solanaWallet).subarray(0, 32);
  signer = await createKeyPairSignerFromBytes(seed);
}

export const assetSymbol = "tmc";
export const assetDescription = "Keep on digging...";
export const assetUrl = "https://theminingco.xyz/";
