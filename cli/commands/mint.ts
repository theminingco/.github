import { metaplex } from "../utility/config";
import { promptConfirm } from "../utility/prompt";
import { PublicKey } from "@solana/web3.js";
import { linkAccount } from "../utility/link";

const createCollection = async (): Promise<void> => {
  const mint = await promptConfirm("What is the token mint address?");
  const mintAddress = new PublicKey(mint);

  const token = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(mintAddress)
  });

  console.info();

  if (token.mint.supply.basisPoints.gtn(0)) {
    console.info(`A token for ${linkAccount(mintAddress)} already exists.`);
    return;
  }

  await metaplex.nfts().mint({
    nftOrSft: token
  });

  console.info(`Minted a token for ${linkAccount(mintAddress)}.`);
};

export default createCollection;
