import { describe } from "mocha";
import { unpackMetadata } from "@theminingco/core";
import assert from "assert";

describe("metadata", () => {

  it("Should unpack metadata without attributes or allocation", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url" };
    const result = unpackMetadata(metadata);
    assert.strictEqual(result.name, "name");
    assert.strictEqual(result.symbol, "symbol");
    assert.strictEqual(result.description, "description");
    assert.strictEqual(result.image, "image");
    assert.strictEqual(result.external_url, "external_url");
    assert.deepStrictEqual(result.attributes, []);
    assert.deepStrictEqual(result.allocation, []);
  });

  it("Should unpack metadata with attributes", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", attributes: [{ trait_type: "trait_type", value: "value" }] };
    const result = unpackMetadata(metadata);
    assert.strictEqual(result.name, "name");
    assert.strictEqual(result.symbol, "symbol");
    assert.strictEqual(result.description, "description");
    assert.strictEqual(result.image, "image");
    assert.strictEqual(result.external_url, "external_url");
    assert.deepStrictEqual(result.attributes, [{ trait_type: "trait_type", value: "value" }]);
    assert.deepStrictEqual(result.allocation, []);
  });

  it("Should unpack metadata with allocation", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", allocation: [{ symbol: "symbol", percentage: "100%" }] };
    const result = unpackMetadata(metadata);
    assert.strictEqual(result.name, "name");
    assert.strictEqual(result.symbol, "symbol");
    assert.strictEqual(result.description, "description");
    assert.strictEqual(result.image, "image");
    assert.strictEqual(result.external_url, "external_url");
    assert.deepStrictEqual(result.attributes, []);
    assert.deepStrictEqual(result.allocation, [{ symbol: "symbol", percentage: "100%" }]);
  });

  it("Should unpack metadata with attributes and allocation", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", attributes: [{ trait_type: "trait_type", value: "value" }], allocation: [{ symbol: "symbol", percentage: "100%" }] };
    const result = unpackMetadata(metadata);
    assert.strictEqual(result.name, "name");
    assert.strictEqual(result.symbol, "symbol");
    assert.strictEqual(result.description, "description");
    assert.strictEqual(result.image, "image");
    assert.strictEqual(result.external_url, "external_url");
    assert.deepStrictEqual(result.attributes, [{ trait_type: "trait_type", value: "value" }]);
    assert.deepStrictEqual(result.allocation, [{ symbol: "symbol", percentage: "100%" }]);
  });

  it("Should fail if metadata is not an object", () => {
    const metadata = "metadata";
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if metadata is null", () => {
    const metadata = null;
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if metadata is missing name", () => {
    const metadata = { symbol: "symbol", description: "description", image: "image", external_url: "external_url" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if name is not a string", () => {
    const metadata = { name: 1, symbol: "symbol", description: "description", image: "image", external_url: "external_url" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if metadata is missing symbol", () => {
    const metadata = { name: "name", description: "description", image: "image", external_url: "external_url" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if symbol is not a string", () => {
    const metadata = { name: "name", symbol: 1, description: "description", image: "image", external_url: "external_url" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if metadata is missing description", () => {
    const metadata = { name: "name", symbol: "symbol", image: "image", external_url: "external_url" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if description is not a string", () => {
    const metadata = { name: "name", symbol: "symbol", description: 1, image: "image", external_url: "external_url" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if metadata is missing image", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", external_url: "external_url" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if image is not a string", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: 1, external_url: "external_url" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if metadata is missing external_url", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if external_url is not a string", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: 1 };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if metadata has extra keys", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", extra: "extra" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if attributes is not an array", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", attributes: "attributes" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if attributes is not an object", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", attributes: [1] };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if attributes is missing trait_type", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", attributes: [{ value: "value" }] };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if trait_type is not a string", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", attributes: [{ trait_type: 1, value: "value" }] };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if attributes is missing value", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", attributes: [{ trait_type: "trait_type" }] };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if value is not a string", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", attributes: [{ trait_type: "trait_type", value: 1 }] };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if attributes has extra keys", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", attributes: [{ trait_type: "trait_type", value: "value", extra: "extra" }] };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if allocation is not an array", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", allocation: "allocation" };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if allocation is not an object", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", allocation: [1] };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if allocation is missing symbol", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", allocation: [{ percentage: "100%" }] };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if symbol is not a string", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", allocation: [{ symbol: 1, percentage: "100%" }] };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if allocation is missing percentage", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", allocation: [{ symbol: "symbol" }] };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if percentage is not a string", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", allocation: [{ symbol: "symbol", percentage: 1 }] };
    assert.throws(() => unpackMetadata(metadata));
  });

  it("Should fail if allocation has extra keys", () => {
    const metadata = { name: "name", symbol: "symbol", description: "description", image: "image", external_url: "external_url", allocation: [{ symbol: "symbol", percentage: "100%", extra: "extra" }] };
    assert.throws(() => unpackMetadata(metadata));
  });

});
