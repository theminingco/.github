import { Allocation, Metadata, fetchMetadata } from "@theminingco/core";
import { HttpsError } from "firebase-functions/v2/https";

const percentageRegex = /(?<number>\d+)%/u;

async function wrapFetchMetadata(uri: string): Promise<Required<Metadata>> {
  try {
    return await fetchMetadata(uri);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new HttpsError("invalid-argument", message);
  }
}

function validateAllocation(allocation: Allocation, allowedSymbols: Set<string>): [string, number] {
  const hasAllowedList = allowedSymbols.size !== 0;
  const isOnAllowedList = allowedSymbols.has(allocation.symbol);
  if (hasAllowedList && !isOnAllowedList) { throw new HttpsError("invalid-argument", "Metadata allocation trait_type must be one of the allowed traits."); }
  const match = percentageRegex.exec(allocation.percentage);
  if (match == null) { throw new HttpsError("invalid-argument", "Metadata allocation value must be a percentage."); }
  if (match[0] !== allocation.percentage) { throw new HttpsError("invalid-argument", "Metadata allocation cannot have extraneous characters."); }
  const number = parseInt(match.groups?.number ?? "0", 10);
  if (number <= 0) { throw new HttpsError("invalid-argument", "Metadata allocation percentage must be greater than 0."); }
  return [allocation.symbol, number];
}

export async function validateMetadata(uri: string, allowedSymbols: Iterable<string> = [], existingUri?: string): Promise<Map<string, number>> {
  if (!uri.startsWith("https://arweave.net/")) { throw new HttpsError("invalid-argument", "Metadata not uploaded to permaweb."); }

  const metadata = await wrapFetchMetadata(uri);

  if (existingUri != null) {
    const existingMetadata = await wrapFetchMetadata(existingUri);

    const keys = new Set(Object.keys(existingMetadata) as Array<keyof Metadata>);
    keys.delete("allocation");
    if (!Array.from(keys).every(x => existingMetadata[x] === metadata[x])) {
      throw new HttpsError("invalid-argument", "Metadata must be the identical.");
    }
  }

  const allowedSymbolsSet = new Set(allowedSymbols);
  const allocation = metadata.allocation.map(x => validateAllocation(x, allowedSymbolsSet)) ?? [];
  const map = new Map(allocation);
  if (allocation.length !== map.size) { throw new HttpsError("invalid-argument", "Metadata allocations must be unique."); }
  const total = allocation.reduce((x, y) => x + y[1], 0);
  const requiredTotal = map.size > 0 ? 100 : 0;
  if (total !== requiredTotal) { throw new HttpsError("invalid-argument", "Metadata allocations must sum to 100."); }
  return map;
}
