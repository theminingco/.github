import { address } from "@solana/web3.js";
import { rpc, signer } from "../utility/config";
import { promptText } from "../utility/prompt";
import { toNumber } from "@theminingco/core";
import { linkAccount } from "../utility/link";

export default async function getAccountData(): Promise<void> {
  const retrieveAddress = await promptText("What is the address that you want to retrieve?", signer.address);

  const accountInfo = await rpc.getAccountInfo(address(retrieveAddress)).send();

  if (accountInfo.value == null) {
    throw new Error(`Account ${linkAccount(retrieveAddress)} not found`);
  }

  const balance = toNumber(accountInfo.value.lamports, 9);
  const balanceSuffix = balance > 0 && balance < 0.005 ? "+" : "";

  console.info();
  console.info("Fetched account data");
  console.info(`Account:       ${linkAccount(retrieveAddress)}`);
  console.info(`Owner:         ${linkAccount(accountInfo.value.owner)}`);
  console.info(`Balance:       ◎${balance.toFixed(2)}${balanceSuffix}`);
  console.info(`Data:          ${accountInfo.value.data}`);
}
