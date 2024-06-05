import type { Pool } from "@theminingco/core";
import { poolCollection, tokenCollection } from "../utility/firebase";
import { validateMetadata } from "../utility/allocation";

async function getAllocations(): Promise<Map<string, Map<string, number>>> {
  const snapshot = await tokenCollection
    .select("collection", "uri")
    .get();

  const collections = snapshot.docs.map(x => x.data().collection);
  const metadatas = snapshot.docs.map(x => x.data().uri);
  const attributes = await Promise.all(metadatas.map(x => validateMetadata(x)));

  const allocations = new Map<string, Map<string, number>>();
  for (let i = 0; i < attributes.length; i++) {
    const allocation = allocations.get(collections[i]) ?? new Map<string, number>();
    for (const [trait, percentage] of attributes[i]) {
      const existing = allocation.get(trait) ?? 0;
      allocation.set(trait, existing + percentage);
    }
    allocations.set(collections[i], allocation);
  }

  // TODO: normalize each allocation to [0, 1]

  return allocations;
}

async function rebalancePool(_pool: Partial<Pool>, _allocation: Map<string, number>): Promise<void> {
  // TODO: reblance each pool on alpaca based on allocation

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
  const snapshot = await poolCollection
    .select("")
    .get();

  const allocations = await getAllocations();
  const promises: Array<Promise<void>> = [];

  for (const doc of snapshot.docs) {
    const allocation = allocations.get(doc.data().address) ?? new Map<string, number>();
    promises.push(rebalancePool(doc.data(), allocation));
  }

  await Promise.allResolved(promises);
}
