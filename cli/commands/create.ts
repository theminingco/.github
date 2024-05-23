import { metaplex, signer } from "../utility/config";
import { promptConfirm, promptNumber, promptText } from "../utility/prompt";
import { Address } from "@solana/web3.js";
import { linkAccount } from "../utility/link";
import { homedir } from "os";
import { readFileSync } from "fs";
import { creators } from "../utility/meta";
import { range } from "@theminingco/core";

async function createRootToken(imagePath: string): Promise<Address> {
  const title = "⛏ The Mining Company";
  const image = readFileSync(imagePath);

  const metadata = await metaplex.nfts().uploadMetadata({
    name: title,
    symbol: "theminingco",
    description: "Keep on digging...",
    image: toMetaplexFile(image, "image.png"),
    external_url: "https://theminingco.xyz/",
  });

  const token = await metaplex.nfts().create({
    name: title,
    uri: metadata.uri,
    sellerFeeBasisPoints: 100,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    isCollection: true,
    primarySaleHappened: true,
    creators,
  });

  return token.mintAddress;
}

async function createCollectionToken(name: string, imageUri: string, rootCollection: Address): Promise<Address> {
  const collectionTitle = `⛏ The Mining Company - ${name}`;
  const image = readFileSync(imageUri);
  const metadata = await metaplex.nfts().uploadMetadata({
    name: collectionTitle,
    symbol: "theminingco",
    description: "Keep on digging...",
    image: toMetaplexFile(image, `${name}.png`),
    external_url: "https://theminingco.xyz/",
  });

  const token = await metaplex.nfts().create({
    name: collectionTitle,
    uri: metadata.uri,
    sellerFeeBasisPoints: 100,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    isCollection: true,
    collection: rootCollection,
    collectionAuthority: signer,
    primarySaleHappened: true,
    creators,
  });

  return token.mintAddress;
}

async function createToken(index: number, imageUri: string, poolCollection: Address): Promise<Address> {
  const tokenTitle = `#${index}`;
  const image = readFileSync(imageUri);
  const metadata = await metaplex.nfts().uploadMetadata({
    name: tokenTitle,
    symbol: "theminingco",
    description: "Keep on digging...",
    image: toMetaplexFile(image, `${index}.png`),
    external_url: "https://theminingco.xyz/",
  });

  const token = await metaplex.nfts().create({
    name: tokenTitle,
    uri: metadata.uri,
    sellerFeeBasisPoints: 100,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    collection: poolCollection,
    collectionAuthority: signer,
    primarySaleHappened: true,
    creators,
  });

  return token.mintAddress;
}

const costPerToken = 0.025;

// TODO: use createAccount with seed and check if they already exist

export default async function createCollection(): Promise<void> {
  const rootExists = await promptConfirm("Do you already have a root collection?");
  const rootAddress = rootExists ? await promptText("What is the root collection token address?") : null;
  const rootImage = rootExists ? null : await promptText("What is the root collection image?");
  const poolExists = await promptConfirm("Do you already have a pool collection?");
  const poolAddress = poolExists ? await promptText("What is the pool collection token address?") : null;
  const poolName = poolExists ? null : await promptText("What is the pool collection name?");
  const imagesFolder = await promptText("What is the folder containing the images?");
  const numTokens = await promptNumber("How many tokens are there in total in the pool?", 100);
  const startIndex = await promptNumber("What should the starting index be?", 1);

  const totalCost = (numTokens + 1 - startIndex + (rootExists ? 0 : 1) + (poolExists ? 0 : 1)) * costPerToken;
  const confirm = await promptConfirm(`Esimated cost for this mint is at least ◎${totalCost.toFixed(2)}. Continue?`);
  if (!confirm) { return; }

  const imagesUri = imagesFolder.replace("~", homedir());

  console.info();

  const rootCollection = rootAddress == null
    ? await createRootToken(rootImage ?? "")
    : new PublicKey(rootAddress);
  console.info(`Using root collection ${linkAccount(rootCollection)}`);

  const poolCollection = poolAddress == null
    ? await createCollectionToken(poolName ?? "", `${imagesUri}/0.png`, rootCollection)
    : new PublicKey(poolAddress);
  console.info(`Using pool collection ${linkAccount(poolCollection)}`);

  for (const index of range(startIndex, numTokens + 1)) {
    const token = await createToken(index, `${imagesUri}/${index}.png`, poolCollection);
    console.info(`Created token #${index} ${linkAccount(token)}`);
  }

  console.info(`Finished creating collection with ${numTokens} tokens.`);
}
