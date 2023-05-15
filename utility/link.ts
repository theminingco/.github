import type { PublicKey } from "@solana/web3.js";
import { cluster } from "./config.js";

const baseUrl = "https://solscan.io";

const clusterQuery = (): string => {
    if (cluster === "mainnet-beta") { return ""; }
    return `?cluster=${cluster}`;
};

export const link = (str: string, url: string): string => {
    return `\u{1b}]8;;${url}\u{7}${str}\u{1b}]8;;\u{7}`;
};

export const linkTransaction = (hash: string): string => {
    return link(hash, `${baseUrl}/tx/${hash}${clusterQuery()}`);
};

export const linkAccount = (key: PublicKey): string => {
    const account = key.toBase58();
    return link(account, `${baseUrl}/account/${account}${clusterQuery()}`);
};
