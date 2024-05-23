import assert from "assert";
import { describe, it } from "mocha";
import { shortAddress } from "@theminingco/core/src/address";
import { address } from "@solana/web3.js";

const testAddress = address("11111111111111111111111111111111");

describe("address", () => {
  it("Should be able to shorten address", () => {
    const expected = "1111...1111";
    const actual = shortAddress(testAddress);
    assert.strictEqual(actual, expected);
  });

  it("Should be able to shorten address string", () => {
    const expected = "1111...1111";
    const actual = shortAddress(testAddress.toString());
    assert.strictEqual(actual, expected);
  });

  it("Should be able to shorten address to arbitrary num-chars", () => {
    const expected = "111111...111111";
    const actual = shortAddress(testAddress, 6);
    assert.strictEqual(actual, expected);
  });

  it("Should only shorten to max 8 chars", () => {
    const expected = "11111111...11111111";
    const actual = shortAddress(testAddress, 64);
    assert.strictEqual(actual, expected);
  });

  it("Should only shorten to min 4 chars", () => {
    const expected = "1111...1111";
    const actual = shortAddress(testAddress, 1);
    assert.strictEqual(actual, expected);
  });

  it("Should be able to handle negative chars", () => {
    const expected = "1111...1111";
    const actual = shortAddress(testAddress, -1);
    assert.strictEqual(actual, expected);
  });
});
