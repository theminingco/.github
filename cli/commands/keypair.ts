import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { linkAccount } from "../utility/link";
import { promptConfirm, promptText } from "../utility/prompt";
import { existsSync, readFileSync } from "fs";
import { homedir } from "os";

const keypairUtil = async (): Promise<void> => {
  const keyfileExists = await promptConfirm("Do you already have a keyfile?");
  const keyfile = keyfileExists ? await promptText("What is the keyfile path?") : null;
  let keypair = Keypair.generate();

  const keyfilePath = keyfile?.replace("~", homedir());
  if (keyfilePath != null && existsSync(keyfilePath)) {
    const keyfileBuffer = readFileSync(keyfilePath);
    const decodedKeyfile = JSON.parse(keyfileBuffer.toString()) as Array<number>;
    const keyfileArray = new Uint8Array(decodedKeyfile);
    keypair = Keypair.fromSecretKey(keyfileArray);
  }

  const secretKey = base58.encode(keypair.secretKey);

  console.info();
  console.info("Generated a new keypair");
  console.info(`Address: ${linkAccount(keypair.publicKey)}`);
  console.info(`Key: ${secretKey}`);
  return Promise.resolve();
};

export default keypairUtil;
