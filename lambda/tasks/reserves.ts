import { connection, signer } from "../utility/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { sendWarning } from "../utility/discord";
import { linkAccount } from "../utility/link";

const checkTask = async (): Promise<void> => {
  const accountInfo = await connection.getAccountInfo(signer.publicKey);
  const balance = (accountInfo?.lamports ?? 0) / LAMPORTS_PER_SOL;
  const usdEquivalent = balance * 20; // TODO: <-- add sol price from alpaca

  const fields = {
    "Wallet Balance": `◎${balance.toFixed(2)}`,
    "USD Equivalent": `$${usdEquivalent.toFixed(2)}`,
    "Account": linkAccount(signer.publicKey)
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
};

export default checkTask;
