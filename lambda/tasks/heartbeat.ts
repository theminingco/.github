import { BatchWriter, poolCollection, tokenCollection } from "../utility/firebase";
import type { Pool, Token } from "@theminingco/core";
import { getMultipleTokenAccounts, interval, isTokenOwner, unix } from "@theminingco/core";
import { connection, signer } from "../utility/solana";
import type { QuerySnapshot } from "firebase-admin/firestore";
import { PublicKey } from "@solana/web3.js";

type AvailableMap = Map<string, Set<string>>;

const transferFundsFromWallet = async (_pool: Pool): Promise<void> => {
  // TODO: Transfer SOL to alpaca
};

const transferFundsFromInvestment = async (_pool: Pool): Promise<void> => {
  // TODO: Transfer SOL from alpaca
};

const updatePoolsCache = async (availableMap: AvailableMap): Promise<void> => {
  const snaphot = await poolCollection.get();

  const batch = new BatchWriter();

  for (const doc of snaphot.docs) {
    const ref = poolCollection.doc(doc.id);
    const available = availableMap.get(doc.data().address)?.size ?? 0;

    // TODO: get actual price in SOL from alpaca
    // Get portfolio size from alpaca
    // Calculate in SOL
    // Divide by (supply - oldAvailable)
    const price = 5;
    await batch.update(ref, { available, price, priceTimestamp: unix() });
    if (doc.data().available > available) { await transferFundsFromInvestment(doc.data()); }
    if (doc.data().available < available) { await transferFundsFromWallet(doc.data()); }
  }

  await batch.finalize();
};

const updateTokensCache = async (snapshot: QuerySnapshot<Token>, availableMap: AvailableMap): Promise<void> => {
  const batch = new BatchWriter();

  for (const doc of snapshot.docs) {
    const isAvailable = availableMap.get(doc.data().collection)?.has(doc.data().address) ?? false;
    const ref = tokenCollection.doc(doc.id);
    await batch.update(ref, { isAvailable });
  }

  await batch.finalize();
};

const getAvailableMap = async (snapshot: QuerySnapshot<Token>): Promise<AvailableMap> => {
  const collectionAddresses = snapshot.docs.map(x => x.data().collection);
  const mintAddresses = snapshot.docs.map(x => new PublicKey(x.data().address));
  const tokenAccounts = await getMultipleTokenAccounts(connection, mintAddresses, signer.publicKey);

  const result = new Map<string, Set<string>>();

  for (const i of interval(mintAddresses.length)) {
    const isAvailable = isTokenOwner(tokenAccounts[i]);
    if (!isAvailable) { continue; }
    const current = result.get(collectionAddresses[i]) ?? new Set<string>();
    current.add(mintAddresses[i].toBase58());
    result.set(collectionAddresses[i], current);
  }

  return result;
};

const heartbeat = async (): Promise<void> => {
  const snaphot = await tokenCollection.get();
  const availableMap = await getAvailableMap(snaphot);
  await updateTokensCache(snaphot, availableMap);
  await updatePoolsCache(availableMap);
};

export default heartbeat;
