import type { Nft, NftWithToken, PublicKey, Sft, SftWithToken } from "@metaplex-foundation/js";
import { metaplex } from "./solana";
import { HttpsError } from "firebase-functions/v2/https";


export const findTokenByMint = async (mintAddress: PublicKey): Promise<Sft | SftWithToken | Nft | NftWithToken> => {
  try {
    const token = await metaplex.nfts().findByMint({
      mintAddress
    });
    return token;
  } catch {
    throw new HttpsError("not-found", "Token not found");
  }
};
