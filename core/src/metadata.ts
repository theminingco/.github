
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
  attributes?: Array<Attribute>;
  allocation?: Array<Allocation>;
}

export async function fetchMetadata(uri: string): Promise<Required<Metadata>> {
  return await fetch(uri)
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
    for (const item of metadata.attributes) {
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
    for (const item of metadata.allocation) {
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
  if (Object.keys(metadata).length !== 7) {
    throw new Error("Invalid metadata keys");
  }
  return metadata as Required<Metadata>;
}
