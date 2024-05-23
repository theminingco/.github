import type { Pool } from "@theminingco/core";
import { interval } from "@theminingco/core";
import { poolCollection, tokenCollection } from "../utility/firebase";
import { extractAttributes } from "../utility/meta";

async function fetchMetadata(uri: string): Promise<Map<string, number>> {
  const response = await fetch(uri);
  const json = await response.json() as unknown;
  return extractAttributes(json);
}

async function getAllocations(): Promise<Map<string, Map<string, number>>> {
  const snapshot = await tokenCollection.get();

  const collections = snapshot.docs.map(x => x.data().collection);
  const metadatas = snapshot.docs.map(x => x.data().uri);
  const attributes = await Promise.all(metadatas.map(fetchMetadata));

  const allocations = new Map<string, Map<string, number>>();
  const totals = new Map<string, number>();
  for (const i of interval(snapshot.docs.length)) {
    const allocation = allocations.get(collections[i]) ?? new Map<string, number>();
    for (const [trait, percentage] of attributes[i]) {
      const existing = allocation.get(trait) ?? 0;
      allocation.set(trait, existing + percentage);
    }
    allocations.set(collections[i], allocation);
    const total = totals.get(collections[i]) ?? 0;
    totals.set(collections[i], total + 1);
  }

  return allocations;
}

async function rebalancePool(_pool: Pool, _allocation: Map<string, number>): Promise<void> {
  // TODO: reblance each pool on alpaca based on allocation
  // Allocation does not add up to 100%. Rest should be held in SOL

  // Cancel all open orders
  // Create all sell orders

  // TODO: Get current free balance in USD
  const freeBalance = 0;

  // Get amount needed for buy orders in USD
  const totalBuyOrder = 0;

  if (freeBalance < totalBuyOrder) {
    // Sell SOL to fill the deficit
  }

  if (freeBalance > totalBuyOrder) {
    // Buy SOL to spend the excess
  }

  // Place all buy orders
  return Promise.resolve();
}

export default async function rebalanceInvestments(): Promise<void> {
  const snapshot = await poolCollection.get();

  const allocations = await getAllocations();
  const promises: Array<Promise<void>> = [];

  for (const doc of snapshot.docs) {
    const allocation = allocations.get(doc.data().address) ?? new Map<string, number>();
    for (const key of allocation.keys()) {
      const current = allocation.get(key) ?? 0;
      const adjusted = current / (doc.data().supply - doc.data().available);
      allocation.set(key, adjusted * 0.009);
    }
    promises.push(rebalancePool(doc.data(), allocation));
  }

  await Promise.all(promises);
}
