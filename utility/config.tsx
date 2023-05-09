import { resolve } from "path";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { readFileSync } from "fs";
import { homedir } from "os";
import YAML from "yaml";

const configFile = resolve(homedir(), ".config", "solana", "cli", "config.yml");
const configYml = readFileSync(configFile, { encoding: "utf8" });
const config = YAML.parse(configYml) as { json_rpc_url: string, keypair_path: string };

export const connection = new Connection(config.json_rpc_url);
export const usdcMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

const signerKeyString = readFileSync(config.keypair_path, { encoding: "utf8" });
const signerKeyJSON = JSON.parse(signerKeyString) as Array<number>;
const signerKeyArr = Uint8Array.from(signerKeyJSON);
export const signer = Keypair.fromSecretKey(signerKeyArr);
const usdcAccountSeeds = [signer.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), usdcMint.toBuffer()];
export const usdcAccount = PublicKey.findProgramAddressSync(usdcAccountSeeds, ASSOCIATED_TOKEN_PROGRAM_ID)[0];
export const usdcAmount = 2000 * 10 ** 6; // 1000 USDC

