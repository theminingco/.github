import { signer } from "../utility/config";
import { linkAccount } from "../utility/link";
import { promptText } from "../utility/prompt";
import { address } from "@solana/web3.js";

export default async function removeVerifiedToken(): Promise<void> {
  const mintAddress = await promptText("What is the token address?");

  const masterEditionAddress = address(mintAddress);

  const token = await metaplex.nfts().findByMint({
    mintAddress: masterEditionAddress,
  });

  if (!token.updateAuthorityAddress.equals(signer.address)) { throw new Error("Signer is not the updateAuthority"); }

  await metaplex.nfts().update({
    nftOrSft: token,
    newUpdateAuthority: address(""),
    collection: null,
    creators: [],
  });

  console.info();
  console.info(`Removed verification of token ${linkAccount(masterEditionAddress)}`);
}
