import { getCluster } from "@theminingco/core";
import { Keypair, Connection } from "@solana/web3.js";
import base58 from "bs58";
import { getSecret } from "./secrets";
import { Metaplex, irysStorage, keypairIdentity } from "@metaplex-foundation/js";

export let connection = new Connection("https://api.devnet.solana.com");
export let cluster = "";
export let metaplex = new Metaplex(connection);
export let signer = Keypair.generate();

export const initialize = async (): Promise<void> => {
  const rpcUrl = await getSecret("RPC_URL");
  connection = new Connection(rpcUrl);
  cluster = await getCluster(connection);

  const solanaWallet = await getSecret("SOLANA_WALLET");
  const seed = base58.decode(solanaWallet).subarray(0, 32);
  signer = Keypair.fromSeed(seed);

  const bundlerAddress = cluster === "mainnet-beta" ? "https://node1.bundlr.network" : "https://devnet.bundlr.network";
  metaplex = Metaplex.make(connection)
    .use(keypairIdentity(signer))
    .use(irysStorage({ address: bundlerAddress }));
};
