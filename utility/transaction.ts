import type { Connection, Signer, TransactionInstruction } from "@solana/web3.js";
import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";

export const sendAndConfirmTransaction = async (connection: Connection, payer: Signer, ...instructions: Array<TransactionInstruction>): Promise<string> => {
    const block = await connection.getLatestBlockhash();

    const message = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: block.blockhash,
        instructions
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);
    transaction.sign([payer]);
    const receipt = await connection.sendTransaction(transaction);
    return receipt;
};
