import type { CreateMetadataAccountV3InstructionArgs, CreateMetadataAccountV3InstructionAccounts } from "@metaplex-foundation/mpl-token-metadata";
import { createCreateMetadataAccountV3Instruction, PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import type { Connection, Signer } from "@solana/web3.js";
import { sendAndConfirmTransaction } from "./transaction.js";

export const getMetadata = async (uri: string): Promise<Record<string, string>> => {
    const response = await fetch(uri);
    const data = await response.json() as Record<string, string>;
    return data;
};

export const createMetadataAccount = async (connection: Connection, payer: Signer, tokenMint: PublicKey, authority: PublicKey, metaUri: string): Promise<PublicKey> => {
    const meta = await getMetadata(metaUri);

    const metaSeeds = [Buffer.from("metadata"), PROGRAM_ID.toBuffer(), tokenMint.toBuffer()];
    const metaAccount = PublicKey.findProgramAddressSync(metaSeeds, PROGRAM_ID)[0];

    const metaInstructionAccounts: CreateMetadataAccountV3InstructionAccounts = {
        metadata: metaAccount,
        mint: tokenMint,
        mintAuthority: authority,
        payer: payer.publicKey,
        updateAuthority: authority
    };

    const metaInstructionArgs: CreateMetadataAccountV3InstructionArgs = {
        createMetadataAccountArgsV3: {
            data: {
                name: meta.name,
                symbol: meta.symbol,
                uri: metaUri,
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null
            },
            isMutable: false,
            collectionDetails: null
        }
    };

    const metaInstruction = createCreateMetadataAccountV3Instruction(metaInstructionAccounts, metaInstructionArgs);

    await sendAndConfirmTransaction(connection, payer, metaInstruction);

    return metaAccount;
};
