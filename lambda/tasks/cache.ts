import type { AssetV1, CollectionV1 } from "@theminingco/metadata";
import { fetchAllAssetV1ByCollection, fetchAllCollectionV1ByUpdateAuthority } from "@theminingco/metadata";
import { poolCollection, tokenCollection } from "../utility/firebase";
import { rpc, signer } from "../utility/solana";
import type { Account, Address } from "@solana/web3.js";
import type { DocumentReference } from "firebase-admin/firestore";
import { fetchMetadata } from "@theminingco/core";

async function insertOrUpdatePool(ref: DocumentReference | undefined, pool: Account<CollectionV1>): Promise<void> {
  const metadata = await fetchMetadata(pool.data.uri);
  if (ref == null) {
    await poolCollection.doc().create({
      address: pool.address,
      name: pool.data.name,
      supply: pool.data.currentSize,
      image: metadata.image,
      price: 0,
      priceTimestamp: 0,
      allocation: new Map(),
      isReleased: false,
    });
  } else {
    await ref.update({
      name: pool.data.name,
      supply: pool.data.currentSize,
      image: metadata.image,
    });
  }
}

async function reloadPoolsCache(): Promise<Address[]> {
  const pools = await fetchAllCollectionV1ByUpdateAuthority(rpc, signer.address);
  const snaphot = await poolCollection.get();
  const fbPools = new Map(snaphot.docs.map(x => [x.data().address.toString(), x]));
  const ocPools = new Map(pools.map(x => [x.address.toString(), x]));

  let promises: Promise<unknown>[] = [];

  for (const pool of ocPools.values()) {
    const ref = fbPools.get(pool.address)?.ref;
    promises.push(insertOrUpdatePool(ref, pool));
  }

  for (const pool of fbPools.values()) {
    if (ocPools.has(pool.data().address)) {
      continue;
    }
    promises.push(pool.ref.delete());
  }

  await Promise.allResolved(promises);
  return pools.map(x => x.address);
}

async function insertOrUpdateToken(ref: DocumentReference | undefined, token: Account<AssetV1>): Promise<void> {
  const metadata = await fetchMetadata(token.data.uri);
  const updateAuthority = token.data.updateAuthority.__kind === "Collection" ? token.data.updateAuthority : { fields: [""] };
  const pool = updateAuthority.fields[0];
  if (ref == null) {
    await tokenCollection.doc().create({
      address: token.address,
      collection: pool,
      name: token.data.name,
      owner: token.data.owner,
      image: metadata.image,
      allocation: new Map(),
    });
  } else {
    await ref.update({
      collection: pool,
      name: token.data.name,
      owner: token.data.owner,
      image: metadata.image,
    });
  }
}

async function reloadTokensCache(pool: Address): Promise<Address[]> {
  const tokens = await fetchAllAssetV1ByCollection(rpc, pool);
  const snapshot = await tokenCollection
    .where("collection", "==", pool)
    .get();
  const fbTokens = new Map(snapshot.docs.map(x => [x.data().address.toString(), x]));
  const ocTokens = new Map(tokens.map(x => [x.address.toString(), x]));

  let promises: Promise<unknown>[] = [];

  for (const token of ocTokens.values()) {
    const ref = fbTokens.get(token.address)?.ref;
    promises.push(insertOrUpdateToken(ref, token));
  }

  for (const token of fbTokens.values()) {
    if (ocTokens.has(token.data().address)) {
      continue;
    }
    promises.push(token.ref.delete());
  }

  await Promise.allResolved(promises);
  return tokens.map(x => x.address);
}

export default async function updateMetadata(): Promise<void> {
  const pools = await reloadPoolsCache();
  await Promise.allResolved(
    pools.map(async x => reloadTokensCache(x)),
  );
}
