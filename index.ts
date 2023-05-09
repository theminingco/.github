import prompt from "prompts";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { homedir } from "os";
import { readFileSync } from "fs";
import { resolve } from "path";
import YAML from "yaml";
import assert from "assert";
import type { JupiterLoadParams } from "@jup-ag/core";
import { Jupiter } from "@jup-ag/core";
import JSBI from "jsbi";

const teardown = Array<() => Promise<void>>();

const onExit = (code: number): void => {
    console.log("Exiting...");
    Promise.all(teardown.map(async fn => fn()))
        .then(() => process.exit(code))
        .catch(() => process.exit(1));
};

process.on("SIGINT", () => onExit(2));
process.on("SIGQUIT", () => onExit(3));
process.on("SIGTERM", () => onExit(4));

const tokenResponse = await prompt({
    type: "text",
    name: "address",
    message: "Which token should be used?",
    initial: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
}) as { address: string };

const amountResponse = await prompt({
    type: "number",
    name: "amount",
    message: "How many tokens should be used?",
    initial: 100
}) as { amount: number };

const slippageResponse = await prompt({
    type: "number",
    name: "amount",
    message: "How much slippage (in bps) should be used?",
    initial: 10
}) as { amount: number };

let index = 0;
let ephemeral = "Loading RPC";
const sequence = ["⠷", "⠯", "⠟", "⠻", "⠽", "⠾"];
const id = setInterval(() => {
    process.stdout.write(`${sequence[index % sequence.length]} ${ephemeral}\r`);
    index++;
}, 100);

teardown.push(async () => {
    clearInterval(id);
    return Promise.resolve();
});

const configFile = resolve(homedir(), ".config", "solana", "cli", "config.yml");
const configYml = readFileSync(configFile, { encoding: "utf8" });
const config = YAML.parse(configYml) as { json_rpc_url: string, keypair_path: string };

const connection = new Connection(config.json_rpc_url);
const genesisHash = await connection.getGenesisHash();
assert(genesisHash === "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d", "Not on mainnet");

const signerKeyString = readFileSync(config.keypair_path, { encoding: "utf8" });
const signerKeyJSON = JSON.parse(signerKeyString) as Array<number>;
const signerKeyArr = Uint8Array.from(signerKeyJSON);
const signer = Keypair.fromSecretKey(signerKeyArr);

const tokenMint = new PublicKey(tokenResponse.address);
const mintInfo = await connection.getTokenSupply(tokenMint);
const tokenAmount = amountResponse.amount * 10 ** mintInfo.value.decimals;
const tokenSeeds = [signer.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMint.toBuffer()];
const _tokenAccount = PublicKey.findProgramAddressSync(tokenSeeds, ASSOCIATED_TOKEN_PROGRAM_ID)[0];

const jupiterConfig: JupiterLoadParams = {
    connection,
    cluster: "mainnet-beta",
    user: signer
};

ephemeral = "Loading Jupiter";
const jupiter = await Jupiter.load(jupiterConfig);

const mainloop = async (): Promise<void> => {
    const routes = await jupiter.computeRoutes({
        inputMint: tokenMint,
        outputMint: tokenMint,
        amount: JSBI.BigInt(tokenAmount),
        slippageBps: slippageResponse.amount,
        forceFetch: true
    });

    const best = routes.routesInfos[0];
    const outWithSlippage = JSBI.divide(JSBI.multiply(best.outAmount, JSBI.BigInt(10000 - best.slippageBps)), JSBI.BigInt(10000));
    ephemeral = `Best route: ${best.inAmount} -> ${outWithSlippage}`;

    if (JSBI.lessThan(best.inAmount, outWithSlippage)) {
        const { execute } = await jupiter.exchange({ routeInfo: best });
        const result = await execute();
        if ("error" in result) {
            process.stdout.write(`Failed to swap: ${result.error}\n`);
        } else if ("inputAmount" in result && "outputAmount" in result && "txid" in result) {
            const formattedInput = result.inputAmount.toFixed(2);
            const formattedOutput = result.outputAmount.toFixed(2);
            const url = `https://solscan.io/tx/${result.txid}`;
            const link = `\u{1b}]8;;${url}\u{7}${result.txid}\u{1b}]8;;\u{7}`;
            process.stdout.write(`Swapped ${formattedInput} for ${formattedOutput} in ${link}\n`);
            onExit(0);
        }
    }

    return mainloop();
};

await mainloop();


