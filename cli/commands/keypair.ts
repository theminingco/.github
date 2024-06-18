import { createKeyPairFromBytes, generateKeyPair, getAddressFromPublicKey, getBase58Decoder } from "@solana/web3.js";
import { linkAccount } from "../utility/link";
import { promptConfirm, promptText } from "../utility/prompt";
import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { subtle } from "crypto";

export default async function createKeypair(): Promise<void> {
  const keyfileExists = await promptConfirm("Do you already have a keyfile?");
  const keyfile = keyfileExists ? await promptText("What is the keyfile path?") : null;
  let keypair = {} as CryptoKeyPair;

  let logText = "";
  const keyfilePath = keyfile?.replace("~", homedir());
  if (keyfilePath != null && existsSync(keyfilePath)) {

    const keyfileBuffer = readFileSync(keyfilePath);
    const decodedKeyfile = JSON.parse(keyfileBuffer.toString()) as number[];
    const keyfileArray = new Uint8Array(decodedKeyfile);
    keypair = await createKeyPairFromBytes(keyfileArray, true);
    logText = "Using existing keyfile";
  } else {
    keypair = await generateKeyPair();
    logText = "Generated new keypair";
  }

  const secretKey = new Uint8Array(await subtle.exportKey("raw", keypair.privateKey));
  const publicKey = await getAddressFromPublicKey(keypair.publicKey);

  console.info();
  console.info(logText);
  console.info(`Address:       ${linkAccount(publicKey)}`);
  console.info(`Key:           ${getBase58Decoder().decode(secretKey)}`);
}
