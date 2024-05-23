import { promptText } from "../utility/prompt";
import { address } from "@solana/web3.js";
import { linkAccount } from "../utility/link";

export default async function createCollection(): Promise<void> {
  const mint = await promptText("What is the token mint address?");
  const mintAddress = address(mint);

  const token = await metaplex.nfts().findByMint({
    mintAddress: address(mintAddress),
  });

  console.info();

  const supply = token.mint.supply.basisPoints;
  if (supply.gtn(0)) {
    console.info(`A token for ${linkAccount(mintAddress)} already exists.`);
    return;
  }

  await metaplex.nfts().mint({
    nftOrSft: token,
  });

  console.info(`Minted a token for ${linkAccount(mintAddress)}.`);
}
