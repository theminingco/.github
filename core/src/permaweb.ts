import { GetRecentPrioritizationFeesApi, GetSignatureStatusesApi, Rpc, SendTransactionApi, SimulateTransactionApi } from "@solana/web3.js";
import { randomId } from "./identifier";

type UploadRpc = Rpc<GetRecentPrioritizationFeesApi & SimulateTransactionApi & GetSignatureStatusesApi & SendTransactionApi>;

export async function uploadFile(
  rpc: UploadRpc,
  buffer: string | Buffer,
): Promise<string> {
  const id = randomId();
  // TODO:
  // calc upload fee
  // add to uploader
  // sign message to upload file
  // upload file
  return `https://arweave.net/${id}`;
}
