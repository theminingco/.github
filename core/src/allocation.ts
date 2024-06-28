import type { Allocation } from "./metadata";

type ContainerOption = "allocation" | "map" | "record" | "array";
type TypeOption = "bps" | "percent" | "number" | "bigint";

interface AllocationObject { allocation: Allocation<string | number | bigint>[] | Map<string, string | number | bigint> | Record<string, string | number | bigint> }

interface ReturnContainer<T extends string | number | bigint> {
  allocation: Allocation<T>[];
  map: Map<string, T>;
  record: Record<string, T>;
  array: [string, T][];
}

interface ReturnType {
  bps: string;
  percent: string;
  number: number;
  bigint: bigint;
}

function mapAllocation<U extends TypeOption>(amount: bigint, value: U): ReturnType[U] {
  switch (value) {
    case "bps": return `${amount}bps` as ReturnType[U];
    case "percent": return `${amount / 100n}%` as ReturnType[U];
    case "number": return Number(amount / 100n) as ReturnType[U];
    default: return amount as ReturnType[U];
  }
}

function packAlloction<T extends ContainerOption, U extends TypeOption>(allocation: [string, bigint][], container: T, value: U): ReturnContainer<ReturnType[U]>[T] {
  switch (container) {
    case "allocation": {
      return allocation.map(([symbol, amount]) => ({
        symbol,
        amount: mapAllocation(amount, value),
      })) as ReturnContainer<ReturnType[U]>[T];
    }
    case "map": {
      return new Map(allocation.map(([symbol, amount]) => [
        symbol,
        mapAllocation(amount, value),
      ])) as ReturnContainer<ReturnType[U]>[T];
    }
    case "record": {
      return Object.fromEntries(allocation.map(([symbol, amount]) => [
        symbol,
        mapAllocation(amount, value),
      ])) as ReturnContainer<ReturnType[U]>[T];
    }
    default: {
      return allocation.map(([symbol, amount]) => [
        symbol,
        mapAllocation(amount, value),
      ]) as ReturnContainer<ReturnType[U]>[T];
    }
  }
}

export function allocationParser<
  T extends ContainerOption = "map",
  U extends TypeOption = "bigint",
>({
  container = "map" as T,
  value = "bigint" as U,
  allowedSymbols = [],
}: {
  container?: T;
  value?: U;
  allowedSymbols?: Iterable<string>;
} = {
  container: "map" as T,
  value: "bigint" as U,
  allowedSymbols: [],
}): { parse: (_: AllocationObject) => ReturnContainer<ReturnType[U]>[T] } {
  const allowedSymbolsSet = new Set(allowedSymbols);
  return {
    parse: (metadata: AllocationObject) => {
      const allocation = validateAllocation(metadata, allowedSymbolsSet);
      const total = allocation.reduce((x, y) => x + y[1], 0n);
      if (total > 10000n) { throw new Error("Allocations must not exceed 100%."); }
      if (allocation.length !== new Map(allocation).size) { throw new Error("Metadata allocation symbols must be unique."); }
      return packAlloction(allocation, container, value);
    },
  };
}

const percentageRegex = /(?<number>\d{1,3})(?<specifier>%)/u;
const bpsRegex = /(?<number>\d{1,5})(?<specifier>bps)/u;

function validateAllocationSymbol(symbol: string, allowedSymbols: Set<string>): string {
  const hasSymbolFilter = allowedSymbols.size > 0;
  const isSymbolAllowed = allowedSymbols.has(symbol);
  if (hasSymbolFilter && !isSymbolAllowed) { throw new Error("Metadata allocation symbol must be one of the allowed symbols."); }
  return symbol;
}

function validateAllocationAmount(value: string | number | bigint): bigint {
  if (typeof value === "bigint") {
    if (value <= 0) { throw new Error("Metadata allocation bps must be greater than 0."); }
    return value;
  }
  if (typeof value === "number") {
    if (value <= 0) { throw new Error("Metadata allocation percentage must be greater than 0."); }
    return BigInt(value) * 100n;
  }
  const match = percentageRegex.exec(value) ?? bpsRegex.exec(value);
  if (match == null) { throw new Error("Metadata allocation value must be a percentage or bps."); }
  if (match[0] !== value) { throw new Error("Metadata allocation value cannot have extraneous characters."); }
  const multiplier = match.groups?.specifier === "%" ? 100n : 1n;
  const number = BigInt(match.groups?.number ?? "0") * multiplier;
  if (number <= 0) { throw new Error("Metadata allocation amount must be greater than 0."); }
  return number;
}

function validateAllocation(metadata: AllocationObject, allowedSymbols: Set<string>): [string, bigint][] {
  if (Array.isArray(metadata.allocation)) {
    return metadata.allocation.map(({ symbol, amount }) => [validateAllocationSymbol(symbol, allowedSymbols), validateAllocationAmount(amount)]);
  }
  if (metadata.allocation instanceof Map) {
    return Array.from(metadata.allocation).map(([symbol, amount]) => [validateAllocationSymbol(symbol, allowedSymbols), validateAllocationAmount(amount)]);
  }
  return Object.entries(metadata.allocation).map(([symbol, amount]) => [validateAllocationSymbol(symbol, allowedSymbols), validateAllocationAmount(amount)]);
}
