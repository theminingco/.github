import { rpc, signer } from "../utility/solana";
import { sendWarning } from "../utility/discord";
import { linkAccount } from "../utility/link";
import { toNumber } from "@theminingco/core";

export default async function checkTask(): Promise<void> {
  const accountInfo = await rpc.getAccountInfo(signer.address).send();
  const lamports = BigInt(accountInfo.value?.lamports ?? 0);
  const balance = toNumber(lamports, 9);
  const usdEquivalent = balance * 20; // TODO: <-- add sol price from alpaca

  if (usdEquivalent < 100) {
    await sendWarning(
      "Low reserves",
      "Consider depositing some.",
      {
        "Wallet Balance": `◎${balance.toFixed(2)}`,
        "USD Equivalent": `$${usdEquivalent.toFixed(2)}`,
        "Account": linkAccount(signer.address),
      },
      ["Account"],
    );
  }
}
