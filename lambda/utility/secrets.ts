import { defineSecret } from "firebase-functions/params";

export const discordWebhook = defineSecret("DISCORD_WEBHOOK");
export const rpcUrl = defineSecret("RPC_URL");
export const walletKey = defineSecret("SOLANA_WALLET");

export const secrets = [discordWebhook, rpcUrl, walletKey];
