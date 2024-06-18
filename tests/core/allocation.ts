import { describe, it } from "mocha";
import { parseAllocation } from "../../core/src/metadata";
import assert from "assert";

describe("allocation", () => {
  it("Should verify if empty allocation", () => {
    const result = parseAllocation({ allocation: [] });
    assert.strictEqual(result.size, 0);
  });

  it("Should verify non-empty allocation without filter", () => {
    const allocation = [{ symbol: "ABC", percentage: "100%" }];
    const result = parseAllocation({ allocation });
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 100n);
  });

  it("Should verify if allocation is not empty", () => {
    const allocation = [{ symbol: "ABC", percentage: "100%" }];
    const result = parseAllocation({ allocation }, ["ABC", "DEF"]);
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 100n);
  });

  it("Should verify empty allocation with symbol filter", () => {
    const result = parseAllocation({ allocation: [] }, ["ABC", "DEF"]);
    assert.strictEqual(result.size, 0);
  });

  it("Should verify if and allocation is not empty with multiple allocations", () => {
    const allocation = [{ symbol: "ABC", percentage: "50%" }, { symbol: "DEF", percentage: "50%" }];
    const result = parseAllocation({ allocation }, ["ABC", "DEF"]);
    assert.strictEqual(result.size, 2);
    assert.strictEqual(result.get("ABC"), 50n);
    assert.strictEqual(result.get("DEF"), 50n);
  });

  it("Should strip out duplicate allocation types", () => {
    const allocation = [{ symbol: "ABC", percentage: "50%" }, { symbol: "ABC", percentage: "51%" }];
    const result = parseAllocation({ allocation }, ["ABC", "DEF"]);
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 51n);
  });

  it("Should not verify with disallowed allocation symbol", () => {
    const allocation = [{ symbol: "ABC", percentage: "100%" }];
    assert.throws(() => parseAllocation({ allocation }, ["DEF"]));
  });

  it("Should not verify if there is an allocation with 0%", () => {
    const allocation = [{ symbol: "ABC", percentage: "100%" }, { symbol: "DEF", percentage: "0%" }];
    assert.throws(() => parseAllocation({ allocation }, ["ABC", "DEF"]));
  });

  it("Should not verify if total allocation more than 100%", () => {
    const allocation = [{ symbol: "ABC", percentage: "101%" }];
    assert.throws(() => parseAllocation({ allocation }, ["ABC", "DEF"]));
  });

  it("Should not verify if total allocation more than 100% with multiple allocation", () => {
    const allocation = [{ symbol: "ABC", percentage: "51%" }, { symbol: "DEF", percentage: "50%" }];
    assert.throws(() => parseAllocation({ allocation }, ["ABC", "DEF"]));
  });

  it("Should verify if total allocation less than 100%", () => {
    const allocation = [{ symbol: "ABC", percentage: "99%" }];
    const result = parseAllocation({ allocation }, ["ABC", "DEF"]);
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 99n);
  });

  it("Should verify if total allocation less than 100% with multiple allocation", () => {
    const allocation = [{ symbol: "ABC", percentage: "49%" }, { symbol: "DEF", percentage: "50%" }];
    const result = parseAllocation({ allocation }, ["ABC", "DEF"]);
    assert.strictEqual(result.size, 2);
    assert.strictEqual(result.get("ABC"), 49n);
    assert.strictEqual(result.get("DEF"), 50n);
  });

  it("Should not verify with extra characters in percentage", () => {
    const allocation = [{ symbol: "ABC", percentage: "100%+" }];
    assert.throws(() => parseAllocation({ allocation }, ["ABC", "DEF"]));
  });

  it("Should not verify with missing percentage sign", () => {
    const allocation = [{ symbol: "ABC", percentage: "100" }];
    assert.throws(() => parseAllocation({ allocation }, ["ABC", "DEF"]));
  });

  it("Should not verify with negative percentage", () => {
    const allocation = [{ symbol: "ABC", percentage: "-10%" }, { symbol: "DEF", percentage: "110%" }];
    assert.throws(() => parseAllocation({ allocation }, ["ABC", "DEF"]));
  });

  it("Should not veriry with non-numeric percentage", () => {
    const allocation = [{ symbol: "ABC", percentage: "abc" }];
    assert.throws(() => parseAllocation({ allocation }, ["ABC", "DEF"]));
  });

  it("Should verify if empty allocation map", () => {
    const result = parseAllocation({ allocation: new Map() });
    assert.strictEqual(result.size, 0);
  });

  it("Should verify non-empty allocation map without filter", () => {
    const allocation = new Map([["ABC", "100%"]]);
    const result = parseAllocation({ allocation });
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 100n);
  });

  it("Should verify if allocation map is not empty", () => {
    const allocation = new Map([["ABC", "100%"]]);
    const result = parseAllocation({ allocation }, ["ABC", "DEF"]);
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 100n);
  });

  it("Should verify empty allocation map with symbol filter", () => {
    const result = parseAllocation({ allocation: new Map() }, ["ABC", "DEF"]);
    assert.strictEqual(result.size, 0);
  });

  it("Should verify if allocation map is not empty with multiple allocations", () => {
    const allocation = new Map([["ABC", "50%"], ["DEF", "50%"]]);
    const result = parseAllocation({ allocation }, ["ABC", "DEF"]);
    assert.strictEqual(result.size, 2);
    assert.strictEqual(result.get("ABC"), 50n);
    assert.strictEqual(result.get("DEF"), 50n);
  });
});
