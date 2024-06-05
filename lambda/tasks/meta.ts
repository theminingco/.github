import { getAssetsByUpdateAuthority, getCollectionsByUpdateAuthority } from "@theminingco/core";
import { BatchWriter, poolCollection, tokenCollection } from "../utility/firebase";
import { rpc, signer } from "../utility/solana";

async function updatePoolMetadata(): Promise<void> {
  const pools = await getCollectionsByUpdateAuthority(rpc, signer.address);
  const snaphot = await poolCollection
    .select("id", "address")
    .get();
  const existing = new Map(snaphot.docs.map(x => [x.data().address, x.id]));

  const batch = new BatchWriter();

  for (const pool of pools) {
    const docId = existing.get(pool.address.toString());
    if (docId == null) {
      const ref = poolCollection.doc();
      await batch.create(ref, {
        address: pool.address.toString(),
        name: pool.name,
        supply: pool.currentSize,
        uri: pool.uri,
        price: 0,
        available: 0,
        priceTimestamp: 0
      });
    } else {
      const ref = poolCollection.doc(docId);
      await batch.update(ref, {
        name: pool.name,
        supply: pool.currentSize,
        uri: pool.uri
      });
    }
  }

  await batch.finalize();
}

async function updateTokenMetadata(): Promise<void> {
  const tokens = await getAssetsByUpdateAuthority(rpc, signer.address);
  const snapshot = await tokenCollection
    .select("id", "address")
    .get();
  const existing = new Map(snapshot.docs.map(x => [x.data().address, x.id]));

  const batch = new BatchWriter();

  for (const token of tokens) {
    const docId = existing.get(token.address.toString());
    if (token.updateAuthority.__kind !== "Collection") {
      continue;
    }
    const pool = token.updateAuthority.fields[0].toString();
    if (docId == null) {
      const ref = tokenCollection.doc();
      await batch.create(ref, {
        address: token.address.toString(),
        collection: pool,
        name: token.name,
        uri: token.uri,
        owner: token.owner.toString()
      });
    } else {
      const ref = tokenCollection.doc(docId);
      await batch.update(ref, {
        collection: pool,
        name: token.name,
        uri: token.uri
      });
    }
  }

  await batch.finalize();
}

export default async function updateMetadata(): Promise<void> {
  await Promise.allResolved([
    updatePoolMetadata(),
    updateTokenMetadata(),
  ]);
}
