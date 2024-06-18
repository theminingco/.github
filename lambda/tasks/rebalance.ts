import type { Pool, Token } from "@theminingco/core";
import { poolCollection, tokenCollection } from "../utility/firebase";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

function getCombinedAllocation(tokens: Token[]): Map<string, bigint> {
  const allocation = new Map<string, bigint>();
  for (const token of tokens) {
    for (const [key, value] of token.allocation) {
      const current = allocation.get(key) ?? 0n;
      const percentage = BigInt(value.slice(0, -1));
      allocation.set(key, current + percentage);
    }
  }

  if (allocation.size === 0) {
    return allocation;
  }

  const remainders = new Map<string, bigint>();
  for (const [key, value] of allocation) {
    allocation.set(key, value / BigInt(tokens.length));
    remainders.set(key, value % BigInt(tokens.length));
  }

  const total = Array.from(allocation.values())
    .reduce((x, y) => x + y, 0n);
  const remaining = 100n - total;
  const queue = Array.from(remainders.entries())
    .sort((a, b) => Number(b[1] - a[1]))
    .map(x => x[0]);
  for (let i = 0; i < remaining; i++) {
    const key = queue[i % queue.length];
    const current = allocation.get(key) ?? 0n;
    allocation.set(key, current + 1n);
  }

  const empties = Array.from(allocation.entries())
    .filter(x => x[1] === 0n)
    .map(x => x[0]);
  for (const key of empties) {
    allocation.delete(key);
  }

  return allocation;
}

async function rebalancePool(doc: QueryDocumentSnapshot<Pool>): Promise<void> {
  const snapshot = await tokenCollection
    .where("pool", "==", doc.data().address)
    .get();

  const tokens = snapshot.docs.map(x => x.data());
  const allocation = getCombinedAllocation(tokens);

  // TODO: reblance each pool on alpaca based on allocation

  // Cancel all open orders

  // Calculate target amounts for each symbol

  // For each asset in alpaca:
  // Sell the difference between target and current amount
  // with some margin (up to 1% more or less is allowed?)

  // For each target amount:
  // Buy the difference between target and current amount
  // with some margin (up to 1% more or less is allowed?)
  // At some point might run out of money for buying? How should this be handled?

  await doc.ref.update({ allocation });
}

export default async function rebalanceInvestments(): Promise<void> {
  const snapshot = await poolCollection.get();
  const promises = snapshot.docs.map(rebalancePool);
  await Promise.allResolved(promises);
}
