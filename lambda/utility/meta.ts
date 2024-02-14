import { HttpsError } from "firebase-functions/v2/https";

const percentageRegex = /(?<number>\d+)%/u;

const validateAttribute = (attribute: unknown, allowedTraits: Set<string>): [string, number] => {
  if (typeof attribute !== "object") { throw new HttpsError("invalid-argument", "Metadata attribute must be an object."); }
  if (attribute == null) { throw new HttpsError("invalid-argument", "Metadata attribute must be an object."); }
  const object = attribute as Record<string, unknown>;
  const keys = new Set(Object.keys(object));
  if (keys.size !== 2) { throw new HttpsError("invalid-argument", "Metadata attribute must have two keys."); }
  if (!keys.has("trait_type")) { throw new HttpsError("invalid-argument", "Metadata attribute must have a trait_type key."); }
  if (!keys.has("value")) { throw new HttpsError("invalid-argument", "Metadata attribute must have a value key."); }
  if (typeof object.trait_type !== "string") { throw new HttpsError("invalid-argument", "Metadata attribute trait_type must be a string."); }
  const hasTraitList = allowedTraits.size !== 0;
  const hasTrait = allowedTraits.has(object.trait_type);
  if (hasTraitList && !hasTrait) { throw new HttpsError("invalid-argument", "Metadata attribute trait_type must be one of the allowed traits."); }
  if (typeof object.value !== "string") { throw new HttpsError("invalid-argument", "Metadata attribute value must be a string."); }
  const match = percentageRegex.exec(object.value);
  if (match == null) { throw new HttpsError("invalid-argument", "Metadata attribute value must be a percentage."); }
  if (match[0] !== object.value) { throw new HttpsError("invalid-argument", "Metadata attribute cannot have extraneous characters."); }
  const number = parseInt(match.groups?.number ?? "0", 10);
  if (number <= 0) { throw new HttpsError("invalid-argument", "Metadata attribute percentage must be greater than 0."); }
  return [object.trait_type, number];
};

export const extractAttributes = (metadata: unknown): Map<string, number> => {
  if (typeof metadata !== "object") { throw new HttpsError("invalid-argument", "Metadata must be an object."); }
  if (metadata == null) { throw new HttpsError("invalid-argument", "Metadata must be an object."); }
  const object = metadata as Record<string, unknown>;
  if (typeof object.attributes !== "object") { throw new HttpsError("invalid-argument", "Metadata attributes must be an object."); }
  if (object.attributes == null) { throw new HttpsError("invalid-argument", "Metadata attributes must be an object."); }
  if (!Array.isArray(object.attributes)) { throw new HttpsError("invalid-argument", "Metadata attributes must be an array."); }
  const attributes = object.attributes.map(x => validateAttribute(x, new Set()));
  return new Map(attributes);
};

export const verifyMetadata = async (token: { uri: string }, newUri: string, allowedTraits: Iterable<string>): Promise<void> => {
  if (!newUri.startsWith("https://arweave.net/")) { throw new HttpsError("invalid-argument", "Metadata not uploaded to permaweb."); }

  const oldResponse = await fetch(token.uri);
  const oldMetadata = await oldResponse.json() as Record<string, unknown>;

  const newResponse = await fetch(newUri);
  const newMetadata = await newResponse.json() as Record<string, unknown>;

  const oldKeys = new Set(Object.keys(oldMetadata));
  const newKeys = new Set(Object.keys(newMetadata));

  oldKeys.add("attributes");
  if (oldKeys.size !== newKeys.size) { throw new HttpsError("invalid-argument", "Metadata keys must be the same."); }
  if (!Array.from(oldKeys).every(x => newKeys.has(x))) { throw new HttpsError("invalid-argument", "Metadata keys must be the same."); }
  oldKeys.delete("attributes");
  if (!Array.from(oldKeys).every(x => oldMetadata[x] === newMetadata[x])) { throw new HttpsError("invalid-argument", "Metadata keys must be the same."); }
  if (typeof newMetadata.attributes !== "object") { throw new HttpsError("invalid-argument", "Metadata attributes must be an object."); }
  if (newMetadata.attributes == null) { throw new HttpsError("invalid-argument", "Metadata attributes must be an object."); }
  if (!Array.isArray(newMetadata.attributes)) { throw new HttpsError("invalid-argument", "Metadata attributes must be an array."); }

  const allowedTraitsSet = new Set(allowedTraits);
  const percentages = newMetadata.attributes.map(x => validateAttribute(x, allowedTraitsSet));
  const keys = new Set(percentages.map(x => x[0]));
  if (keys.size !== percentages.length) { throw new HttpsError("invalid-argument", "Metadata attributes must have unique trait types."); }
  const totalPercentage = percentages.reduce((a, b) => a + b[1], 0);
  const requiredPercentage = allowedTraitsSet.size === 0 ? 0 : 100;
  if (totalPercentage !== requiredPercentage) { throw new HttpsError("invalid-argument", "Metadata attributes must sum up to 100%."); }
};
