import assert from "assert";
import { describe, it } from "mocha";
import { range, interval, nonNull } from "@theminingco/core/src/array";

describe("array", () => {

  it("Range should be properly created", () => {
    const actual = range(1, 10);
    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    assert.deepStrictEqual(actual, expected);
  });

  it("Range with step should be properly created", () => {
    const actual = range(1, 10, 2);
    const expected = [1, 3, 5, 7, 9];
    assert.deepStrictEqual(actual, expected);
  });

  it("Interval should be properly created", () => {
    const actual = interval(10);
    const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    assert.deepStrictEqual(actual, expected);
  });

  it("Interval with step should be properly created", () => {
    const actual = interval(10, 2);
    const expected = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
    assert.deepStrictEqual(actual, expected);
  });

  it("NonNull should filter out null and undefined values from array", () => {
    const actual = [0, 1, null, undefined, 2, null, undefined, 3, null, undefined]
      .filter(nonNull);
    const expected = [0, 1, 2, 3];
    assert.deepStrictEqual(actual, expected);
  });

  it("MapNonNull should skip over null values from array and transform the non-nul values", () => {
    const actual = [0, 1, null, 2, null, 3]
      .mapNonNull(x => x + 1);
    const expected = [1, 2, null, 3, null, 4];
    assert.deepStrictEqual(actual, expected);
  });

});
