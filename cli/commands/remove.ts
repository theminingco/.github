import { PublicKey } from "@metaplex-foundation/js";
import { metaplex, signer } from "../utility/config";
import { linkAccount } from "../utility/link";
import { promptText } from "../utility/prompt";

const removeVerifiedToken = async (): Promise<void> => {
  const address = await promptText("What is the token address?");

  const masterEditionAddress = new PublicKey(address);

  const token = await metaplex.nfts().findByMint({
    mintAddress: masterEditionAddress
  });

  if (!token.updateAuthorityAddress.equals(signer.publicKey)) { throw new Error("Signer is not the updateAuthority"); }

  await metaplex.nfts().update({
    nftOrSft: token,
    newUpdateAuthority: PublicKey.default,
    collection: null,
    creators: []
  });

  console.info();
  console.info(`Removed verification of token ${linkAccount(masterEditionAddress)}`);
};

export default removeVerifiedToken;
