import { BatchWriter, poolCollection, tokenCollection } from "../utility/firebase";
import type { Pool } from "@theminingco/core";
import { unix, getMultipleAssets } from "@theminingco/core";
import { rpc, signer } from "../utility/solana";
import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { address } from "@solana/web3.js";

async function transferFundsFromWallet(price: number, amount: number): Promise<void> {
  // TODO: Transfer SOL to alpaca
}

async function transferFundsFromInvestment(price: number, amount: number): Promise<void> {
  // TODO: Transfer SOL from alpaca
}

async function updateTokensCache(): Promise<void> {
  const snaphot = await tokenCollection
    .select("id", "address")
    .get();
  const addresses = snaphot.docs.map(x => address(x.data().address));
  const assets = await getMultipleAssets(rpc, addresses);

  const batch = new BatchWriter();

  for (let i = 0; i < snaphot.docs.length; i++) {
    const owner = assets[i]?.owner;
    const ref = tokenCollection.doc(snaphot.docs[i].id);
    await batch.update(ref, { owner });
  }

  await batch.finalize();
}

async function updatePool(doc: QueryDocumentSnapshot<Partial<Pool>>): Promise<void> {
  const ref = poolCollection.doc(doc.id);
  const pool = doc.data();

  const tokens = await tokenCollection
    .where("collection", "==", pool.address)
    .where("owner", "==", signer.address)
    .count()
    .get();

  const oldAvailable = pool.available ?? 0;
  const available = tokens.data().count;
  const oldPrice = pool.price ?? 0;

  const availableDelta = oldAvailable - available;
  if (availableDelta > 0) { await transferFundsFromWallet(oldPrice, availableDelta); }
  if (availableDelta < 0) { await transferFundsFromInvestment(oldPrice, availableDelta); }

  // TODO: get actual price in SOL from alpaca
  // Get portfolio size from alpaca
  // Calculate in SOL
  // Divide by (supply - oldAvailable)
  const price = 5;
  await ref.update({ available, price, priceTimestamp: unix() });
}

async function updatePoolsCache(): Promise<void> {
  const snaphot = await poolCollection
    .select("id", "address", "available", "price")
    .get();
  const promises = snaphot.docs.map(updatePool);
  await Promise.allResolved(promises);
}

export default async function heartbeat(): Promise<void> {
  await updateTokensCache();
  await updatePoolsCache();
}
