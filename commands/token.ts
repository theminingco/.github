import { AuthorityType, createAssociatedTokenAccountIdempotent, createMint, createSetAuthorityInstruction, mintToChecked } from "@solana/spl-token";
import { connection, signer } from "../utility/config.js";
import { createMetadataAccount } from "../utility/meta.js";
import { sendAndConfirmTransaction } from "../utility/transaction.js";
import { setLoadingText, startLoading, stopLoading } from "../utility/loader.js";
import { linkAccount } from "../utility/link.js";
import { promptText } from "../utility/prompt.js";
import { log } from "../utility/log.js";

const metaUri = await promptText("What is the token metadata uri?", "https://arweave.net/iaMo-q43MBb9XANBJVmXVmu_HF8PPTXI-0roIcqMcCU");

startLoading("Creating token mint");
const tokenMint = await createMint(connection, signer, signer.publicKey, null, 6);

setLoadingText("Minting initial supply");
const tokenAccount = await createAssociatedTokenAccountIdempotent(connection, signer, tokenMint, signer.publicKey);
await mintToChecked(connection, signer, tokenMint, tokenAccount, signer.publicKey, 1e15, 6);

setLoadingText("Creating metadata account");

await createMetadataAccount(connection, signer, tokenMint, signer.publicKey, metaUri);

setLoadingText("Locking the token mint");
const lockInstruction = createSetAuthorityInstruction(tokenMint, signer.publicKey, AuthorityType.MintTokens, null);
await sendAndConfirmTransaction(connection, signer, lockInstruction);

stopLoading();
log(`Created mint ${linkAccount(tokenMint)}`);
