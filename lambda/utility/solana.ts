import { Connection, Keypair } from "@solana/web3.js";
import { getCluster } from "@theminingco/core";
import base58 from "bs58";
import { rpcUrl, walletKey } from "./secrets";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

export let cluster = "";
export let connection = new Connection("https://api.mainnet-beta.solana.com");
export let signer = Keypair.generate();
export let metaplex = new Metaplex(connection);

export const initializeConnection = async (): Promise<void> => {
  connection = new Connection(rpcUrl.value());
  cluster = await getCluster(connection);
  const seed = base58.decode(walletKey.value()).subarray(0, 32);
  signer = Keypair.fromSeed(seed);
  metaplex = Metaplex.make(connection)
    .use(keypairIdentity(signer));
};
