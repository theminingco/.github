import { Address, address, getProgramDerivedAddress } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ADDRESS, TOKEN_PROGRAM_ADDRESS, findAssociatedTokenPda } from "@solana-program/token";

export const tokenProgramId = TOKEN_PROGRAM_ADDRESS;
export const associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ADDRESS;
export const metadataProgramId = address('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export async function associatedTokenAccount(owner: Address, mint: Address): Promise<Address> {
  const pda = await findAssociatedTokenPda({
    owner,
    mint,
    tokenProgram: tokenProgramId
  });
  return pda[0];
};

export async function metadataAddress(mint: Address): Promise<Address> {
  const pda = await getProgramDerivedAddress({
    seeds: ["metadata", metadataProgramId, mint],
    programAddress: metadataProgramId
  });
  return pda[0];
}

export function shortAddress(publicKey: Address | string, chars = 4): string {
  const numChars = Math.max(4, Math.min(chars, 8));
  const key = publicKey.toString();
  const prefix = key.slice(0, numChars);
  const suffix = key.slice(-numChars);
  return `${prefix}...${suffix}`;
}


