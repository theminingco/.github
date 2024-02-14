import type { FindNftsByCreatorOutput } from "@metaplex-foundation/js";
import { metaplex, signer } from "../utility/solana";
import { BatchWriter, poolCollection, tokenCollection } from "../utility/firebase";

const updatePoolMetadata = async (allTokens: FindNftsByCreatorOutput): Promise<void> => {
  const snaphot = await poolCollection.get();
  const existing = new Map(snaphot.docs.map(x => [x.data().address, x.id]));

  const pools = allTokens.filter(x => x.collection != null && x.collectionDetails != null);
  const batch = new BatchWriter();

  for (const pool of pools) {
    const supply = Number(pool.collectionDetails?.size ?? 0);
    const docId = existing.get(pool.address.toBase58());
    if (docId == null) {
      const ref = poolCollection.doc();
      const price = 0;
      const available = 0;
      await batch.create(ref, { address: pool.address.toBase58(), name: pool.name, supply, uri: pool.uri, price, available, priceTimestamp: 0 });
    } else {
      const ref = poolCollection.doc(docId);
      await batch.update(ref, { name: pool.name, supply, uri: pool.uri });
    }
  }

  await batch.finalize();
};

const updateTokenMetadata = async (allTokens: FindNftsByCreatorOutput): Promise<void> => {
  const snapshot = await tokenCollection.get();
  const existing = new Map(snapshot.docs.map(x => [x.data().address, x.id]));

  const tokens = allTokens.filter(x => x.collection != null && x.collectionDetails == null);

  const batch = new BatchWriter();

  for (const token of tokens) {
    const docId = existing.get(token.address.toBase58());
    const pool = token.collection?.address.toBase58() ?? "";
    if (docId == null) {
      const ref = tokenCollection.doc();
      const isAvailable = false;
      await batch.create(ref, { address: token.address.toBase58(), collection: pool, name: token.name, uri: token.uri, isAvailable });
    } else {
      const ref = tokenCollection.doc(docId);
      await batch.update(ref, { collection: pool, name: token.name, uri: token.uri });
    }
  }

  await batch.finalize();
};

const updateMetadata = async (): Promise<void> => {
  const allTokens = await metaplex.nfts().findAllByUpdateAuthority({
    updateAuthority: signer.publicKey
  });

  await updatePoolMetadata(allTokens);
  await updateTokenMetadata(allTokens);
};

export default updateMetadata;
