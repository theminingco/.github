import { fetchAllCollectionV1ByUpdateAuthority } from "@theminingco/metadata";
import { rpc, signer } from "../utility/config";
import { linkAccount } from "../utility/link";

export default async function listCollections(): Promise<void> {
  const collections = await fetchAllCollectionV1ByUpdateAuthority(rpc, signer.address);

  console.info(`Found ${collections.length} collections`);
  for (const collection of collections) {
    const name = collection.data.name.padEnd(15);
    console.info(`${name}${linkAccount(collection.address)}`);
  }
}
