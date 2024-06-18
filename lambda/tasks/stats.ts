import { formatLargeNumber } from "@theminingco/core";
import { sendInfo } from "../utility/discord";
import { linkAccount } from "../utility/link";
import { poolCollection } from "../utility/firebase";
import { address } from "@solana/web3.js";

export default async function recordStatistics(): Promise<void> {
  const snapshot = await poolCollection.get();

  const totalValue = snapshot.docs
    .map(doc => doc.data().supply * doc.data().price)
    .reduce((a, b) => a + b, 0);

  const usdValue = totalValue / 20; // TODO: <-- get sol price from alpaca

  const addresses = snapshot.docs
    .map(doc => address(doc.data().address));

  const names = snapshot.docs
    .map(doc => doc.data().name.split(" "))
    .map(parts => parts[parts.length - 1]);

  const symbols = snapshot.docs
    .map((_, i) => linkAccount(addresses[i], names[i]))
    .join(", ");

  await sendInfo(
    "Daily statistics",
    new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    {
      "Total Value Locked": `◎${formatLargeNumber(totalValue)}`,
      "USD Equivalent": `$${formatLargeNumber(usdValue)}`,
      "Pools": symbols,
    },
    ["Pools"],
  );
}
