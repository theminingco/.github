import Arweave from "arweave";
import base58 from "bs58";

const arweave = Arweave.init({ host: "arweave.net", port: 443, protocol: "https", logging: false });
const decoder = new TextDecoder();
const raw = base58.decode(process.env.ARWEAVE_WALLET ?? "");
const key = JSON.parse(decoder.decode(raw)) as undefined;

export const uploadArweave = async (data: Buffer, contentType: string): Promise<string> => {
    const tx = await arweave.createTransaction({ data }, key);
    tx.addTag("Content-Type", contentType);
    await arweave.transactions.sign(tx, key);
    await arweave.transactions.post(tx);
    return `https://arweave.net/${tx.id}`;
};
