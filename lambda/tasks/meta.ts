import { Metadata, getNftsByUpdateAuthority } from "@theminingco/core";
import { BatchWriter, poolCollection, tokenCollection } from "../utility/firebase";
import { rpc, signer } from "../utility/solana";

async function updatePoolMetadata(allTokens: Array<Metadata>): Promise<void> {
  const snaphot = await poolCollection.get();
  const existing = new Map(snaphot.docs.map(x => [x.data().address, x.id]));

  const pools = allTokens.filter(x => x.collection != null && x.collectionDetails != null);
  const batch = new BatchWriter();

  for (const pool of pools) {
    const supply = Number(pool.collectionDetails?.size ?? 0);
    const docId = existing.get(pool.mint.toString());
    if (docId == null) {
      const ref = poolCollection.doc();
      const price = 0;
      const available = 0;
      await batch.create(ref, { address: pool.mint.toString(), name: pool.name, supply, uri: pool.uri, price, available, priceTimestamp: 0 });
    } else {
      const ref = poolCollection.doc(docId);
      await batch.update(ref, { name: pool.name, supply, uri: pool.uri });
    }
  }

  await batch.finalize();
}

async function updateTokenMetadata(allTokens: Array<Metadata>): Promise<void> {
  const snapshot = await tokenCollection.get();
  const existing = new Map(snapshot.docs.map(x => [x.data().address, x.id]));

  const tokens = allTokens.filter(x => x.collection != null && x.collectionDetails == null);

  const batch = new BatchWriter();

  for (const token of tokens) {
    const docId = existing.get(token.mint.toString());
    const pool = token.collection?.key.toString() ?? "";
    if (docId == null) {
      const ref = tokenCollection.doc();
      const isAvailable = false;
      await batch.create(ref, { address: token.mint.toString(), collection: pool, name: token.name, uri: token.uri, isAvailable });
    } else {
      const ref = tokenCollection.doc(docId);
      await batch.update(ref, { collection: pool, name: token.name, uri: token.uri });
    }
  }

  await batch.finalize();
}

export default async function updateMetadata(): Promise<void> {
  const allTokens = await getNftsByUpdateAuthority(rpc, signer.address);

  await Promise.all([
    updatePoolMetadata(allTokens),
    updateTokenMetadata(allTokens),
  ]);
}
