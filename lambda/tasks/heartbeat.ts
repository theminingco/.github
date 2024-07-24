import { BatchWriter, poolCollection, tokenCollection } from "../utility/firebase";
import { batchFetch, unix } from "@theminingco/core";
import { rpc } from "../utility/solana";
import { address, fetchEncodedAccounts } from "@solana/web3.js";
import { fetchAllMaybeAssetV1 } from "@theminingco/metadata";
import { extractRoyaltiesPlugin } from "../utility/royalties";

async function updateTokenOwners(): Promise<void> {
  const snapshot = await tokenCollection.get();
  const addresses = snapshot.docs.map(x => address(x.data().address));
  const assets = await batchFetch(fetchAllMaybeAssetV1).send(rpc, addresses);
  const batch = new BatchWriter();
  console.info(`Updating ${snapshot.docs.length} tokens.`);

  for (let i = 0; i < snapshot.docs.length; i++) {
    const [asset, doc] = [assets[i], snapshot.docs[i]];
    if (asset.exists) {
      await batch.update(doc.ref, {
        owner: asset.data.owner,
      });
    } else {
      await batch.delete(doc.ref);
    }
  }

  await batch.finalize();
}

async function updatePrices(): Promise<void> {
  const snapshot = await poolCollection.get();
  const addresses = snapshot.docs.map(x => address(x.data().address));
  const collections = await batchFetch(fetchEncodedAccounts).send(rpc, addresses);
  const batch = new BatchWriter();
  console.info(`Updating ${snapshot.docs.length} pools.`);

  for (let i = 0; i < snapshot.docs.length; i++) {
    const [collection, doc] = [collections[i], snapshot.docs[i]];
    const royalties = collection.exists ? extractRoyaltiesPlugin(collection.data) : null;
    const isReleased = royalties?.ruleSet.__kind === "ProgramDenyList";
    // TODO: get actual price in SOL from alpaca
    // 1. Get portfolio size in usd from alpaca
    // 2. Calculate in SOL
    // 3. Divide by (supply)
    // 24h delta
    // 7d delta
    // 30d delta
    const price = 5;
    await batch.update(doc.ref, {
      price,
      priceTimestamp: unix(),
      isReleased,
    });
  }

  await batch.finalize();
}

export default async function heartbeat(): Promise<void> {
  await Promise.allResolved([
    updateTokenOwners(),
    updatePrices(),
  ]);
}
