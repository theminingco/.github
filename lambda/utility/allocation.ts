import { fetchMetadata, parseAllocation } from "@theminingco/core";
import { HttpsError } from "firebase-functions/v2/https";

export async function fetchAllocation(uri: string, allowedSymbols: Iterable<string> = []): Promise<Map<string, bigint>> {
  try {
    const metadata = await fetchMetadata(uri);
    return parseAllocation(metadata, allowedSymbols);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new HttpsError("invalid-argument", message);
  }
}
