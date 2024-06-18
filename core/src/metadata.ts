
export interface Attribute {
  trait_type: string;
  value: string;
}

export interface Allocation {
  symbol: string;
  percentage: string;
}

export interface Metadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes?: Attribute[];
  allocation?: Allocation[];
  attribution?: string;
}

export async function fetchMetadata(uri: string): Promise<Required<Metadata>> {
  return fetch(uri)
    .then(async x => await x.json() as unknown)
    .then(unpackMetadata);
}

export function unpackMetadata(metadata: unknown): Required<Metadata> {
  if (typeof metadata !== "object" || metadata === null) {
    throw new Error("Invalid metadata");
  }
  if (!("name" in metadata) || typeof metadata.name !== "string") {
    throw new Error("Invalid or missing name");
  }
  if (!("symbol" in metadata) || typeof metadata.symbol !== "string") {
    throw new Error("Invalid or missing symbol");
  }
  if (!("description" in metadata) || typeof metadata.description !== "string") {
    throw new Error("Invalid or missing description");
  }
  if (!("image" in metadata) || typeof metadata.image !== "string") {
    throw new Error("Invalid or missing image");
  }
  if (!("external_url" in metadata) || typeof metadata.external_url !== "string") {
    throw new Error("Invalid or missing external_url");
  }
  if ("attributes" in metadata) {
    if (!Array.isArray(metadata.attributes)) {
      throw new Error("Invalid attributes");
    }
    for (const item of metadata.attributes as unknown[]) {
      if (typeof item !== "object" || item === null) {
        throw new Error("Invalid attribute");
      }
      if (!("trait_type" in item) || typeof item.trait_type !== "string") {
        throw new Error("Invalid or missing trait_type");
      }
      if (!("value" in item) || typeof item.value !== "string") {
        throw new Error("Invalid or missing value");
      }
      if (Object.keys(item).length !== 2) {
        throw new Error("Invalid attribute keys");
      }
    }
  } else {
    Object.assign(metadata, { attributes: [] });
  }
  if ("allocation" in metadata) {
    if (!Array.isArray(metadata.allocation)) {
      throw new Error("Invalid allocation");
    }
    for (const item of metadata.allocation as unknown[]) {
      if (typeof item !== "object" || item === null) {
        throw new Error("Invalid allocation");
      }
      if (!("symbol" in item) || typeof item.symbol !== "string") {
        throw new Error("Invalid or missing symbol");
      }
      if (!("percentage" in item) || typeof item.percentage !== "string") {
        throw new Error("Invalid or missing percentage");
      }
      if (Object.keys(item).length !== 2) {
        throw new Error("Invalid allocation keys");
      }
    }
  } else {
    Object.assign(metadata, { allocation: [] });
  }
  if ("attribution" in metadata) {
    if (typeof metadata.attribution !== "string") {
      throw new Error("Invalid attribution");
    }
  } else {
    Object.assign(metadata, { attribution: "" });
  }
  if (Object.keys(metadata).length !== 8) {
    throw new Error("Invalid metadata keys");
  }
  return metadata as Required<Metadata>;
}

const percentageRegex = /(?<number>\d+)%/u;

function validateSingleAllocation(symbol: string, percentage: string, allowedSymbols: Set<string>): [string, bigint] {
  const hasSymbolFilter = allowedSymbols.size > 0;
  const isSymbolAllowed = allowedSymbols.has(symbol);
  if (hasSymbolFilter && !isSymbolAllowed) { throw new Error("Metadata allocation symbol must be one of the allowed symbols."); }
  const match = percentageRegex.exec(percentage);
  if (match == null) { throw new Error("Metadata allocation value must be a percentage."); }
  if (match[0] !== percentage) { throw new Error("Metadata allocation cannot have extraneous characters."); }
  const number = BigInt(match.groups?.number ?? "0");
  if (number <= 0) { throw new Error("Metadata allocation percentage must be greater than 0."); }
  return [symbol, number];
}

interface AllocationObject { allocation: Allocation[] | Map<string, string> }

export function parseAllocation(metadata: AllocationObject, allowedSymbols: Iterable<string> = []): Map<string, bigint> {
  const allowedSymbolsSet = new Set(allowedSymbols);
  const rawAllocation = Array.isArray(metadata.allocation)
    ? new Map(metadata.allocation.map(x => [x.symbol, x.percentage]))
    : metadata.allocation;
  const allocation = Array.from(rawAllocation)
    .map(([symbol, percentage]) => validateSingleAllocation(symbol, percentage, allowedSymbolsSet));
  const map = new Map(allocation);
  const total = allocation.reduce((x, y) => x + y[1], 0n);
  if (total > 100n) { throw new Error("Metadata allocations must not exceed 100."); }
  return map;
}
