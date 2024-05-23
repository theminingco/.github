import { rpc, signer } from "../utility/solana";
import { sendWarning } from "../utility/discord";
import { linkAccount } from "../utility/link";
import { toNumber } from "@theminingco/core";

export default async function checkTask(): Promise<void> {
  const accountInfo = await rpc.getAccountInfo(signer.address).send();
  const lamports = BigInt(accountInfo.value?.lamports ?? 0);
  const balance = toNumber(lamports, 9);
  const usdEquivalent = balance * 20; // TODO: <-- add sol price from alpaca

  const fields = {
    "Wallet Balance": `◎${balance.toFixed(2)}`,
    "USD Equivalent": `$${usdEquivalent.toFixed(2)}`,
    "Account": linkAccount(signer.address),
  };

  const block = ["Account"];

  if (usdEquivalent < 2000) {
    const message = "Consider depositing some.";
    await sendWarning("Low reserves", message, fields, block);
  }

  if (usdEquivalent > 5000) {
    const message = "Consider withdrawing some.";
    await sendWarning("High reserves", message, fields, block);
  }
}
