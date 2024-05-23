import { Address, ReadonlyUint8Array, getAddressDecoder } from "@solana/web3.js";

const decoder = getAddressDecoder();

export interface Creator {
  address: Address;
  verified: boolean;
  share: number;
}

export interface Collection {
  verified: boolean;
  key: Address;
}

export interface Uses {
  useMethod: number;
  remaining: bigint;
  total: bigint;
}

export interface CollectionDetails {
  size: bigint;
}

interface MetadataPrefix {
  key: number;
  updateAuthority: Address;
  mint: Address;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
}

interface MetadataCreators {
  creators: Array<Creator>;
}

interface MetadataSuffix {
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce: number | null;
  tokenStandard: number | null;
  collection: Collection | null;
  uses: Uses | null;
  collectionDetails: CollectionDetails | null;
}

export type Metadata = MetadataPrefix & MetadataCreators & MetadataSuffix;

export function unpackMetadata(accountInfo: { data: ReadonlyUint8Array | Uint8Array }): Metadata {
  const buffer = Buffer.from(accountInfo.data);
  const [prefix, creatorsOffset] = parseMetadataPrefix(buffer, 0);
  const [creators, suffixOffset] = parseMetadataCreators(buffer, creatorsOffset);
  const [suffix] = parseMetadataSuffix(buffer, suffixOffset);
  return { ...prefix, ...creators, ...suffix };
}

function readString(buffer: Buffer, offset: number): string {
  const readLength = buffer.readUInt32LE(offset);
  const bytes = buffer.subarray(offset + 4, offset + 4 + readLength);
  const nullIndex = bytes.indexOf(0);
  return new TextDecoder().decode(bytes.subarray(0, nullIndex));
}

function parseMetadataPrefix(buffer: Buffer, offset: number): [MetadataPrefix, number] {
  const key = buffer.readUInt8(offset);
  offset += 1;
  const updateAuthority = decoder.decode(buffer.subarray(offset, offset + 32));
  offset += 32;
  const mint = decoder.decode(buffer.subarray(offset, offset + 32));
  offset += 32;
  const name = readString(buffer, offset);
  offset += 36;
  const symbol = readString(buffer, offset);
  offset += 14;
  const uri = readString(buffer, offset);
  offset += 204;
  const sellerFeeBasisPoints = buffer.readUInt16LE(offset);
  offset += 2;
  return [
    { key, updateAuthority, mint, name, symbol, uri, sellerFeeBasisPoints },
    offset,
  ];
}

function parseMetadataCreators(buffer: Buffer, offset: number): [MetadataCreators, number] {
  const creatorsPresent = !!buffer.readUInt8(offset);
  offset += 1;
  if (!creatorsPresent) {
    return [{ creators: [] }, offset];
  }
  const creatorCount = buffer.readUInt16LE(offset);
  offset += 4;
  let creators: Array<Creator> = [];
  for (let i = 0; i < creatorCount; i++) {
    const address = decoder.decode(buffer.subarray(offset, offset + 32));
    offset += 32;
    const verified = !!buffer.readUInt8(offset);
    offset += 1;
    const share = buffer.readUInt8(offset);
    offset += 1;
    creators.push({ address, verified, share });
  }
  return [{ creators }, offset];
}

function parseMetadataSuffix(buffer: Buffer, offset: number): [MetadataSuffix, number] {
  const primarySaleHappened = !!buffer.readUInt8(offset);
  offset += 1;
  const isMutable = !!buffer.readUInt8(offset);
  offset += 1;
  const editionNoncePresent = !!buffer.readUInt8(offset);
  offset += 1;
  let editionNonce: number | null = null;
  if (editionNoncePresent) {
    editionNonce = buffer.readUInt8(offset);
    offset += 1;
  }
  const tokenStandardPresent = !!buffer.readUInt8(offset);
  offset += 1;
  let tokenStandard: number | null = null;
  if (tokenStandardPresent) {
    tokenStandard = buffer.readUInt8(offset);
    offset += 1;
  }
  const collectionPresent = !!buffer.readUInt8(offset);
  offset += 1;
  let collection: Collection | null = null;
  if (collectionPresent) {
    const collectionVerified = !!buffer.readUInt8(offset);
    offset += 1;
    const collectionKey = decoder.decode(buffer.subarray(offset, offset + 32));
    offset += 32;
    collection = { verified: collectionVerified, key: collectionKey };
  }
  const usesPresent = !!buffer.readUInt8(offset);
  offset += 1;
  let uses: Uses | null = null;
  if (usesPresent) {
    const useMethod = buffer.readUInt8(offset);
    offset += 1;
    const remaining = buffer.readBigUInt64LE(offset);
    offset += 8;
    const total = buffer.readBigUInt64LE(offset);
    offset += 8;
    uses = { useMethod, remaining, total };
  }
  const collectionDetailsPresent = !!buffer.readUInt8(offset);
  offset += 1;
  let collectionDetails: CollectionDetails | null = null;
  if (collectionDetailsPresent) {
    const size = buffer.readBigInt64LE(offset);
    offset += 8;
    collectionDetails = { size };
  }
  return [
    { primarySaleHappened, isMutable, editionNonce, tokenStandard, collection, uses, collectionDetails },
    offset,
  ];
}
