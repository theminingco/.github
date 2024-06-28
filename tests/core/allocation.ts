import { describe, it } from "mocha";
import { allocationParser } from "../../core/src/allocation";
import assert from "assert";


describe("allocation", () => {
  it("Should verify if empty allocation", () => {
    const result = allocationParser().parse({ allocation: [] });
    assert.strictEqual(result.size, 0);
  });

  it("Should verify non-empty allocation without filter", () => {
    const allocation = [{ symbol: "ABC", amount: "100%" }];
    const result = allocationParser().parse({ allocation });
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 10000n);
  });

  it("Should verify if allocation is not empty", () => {
    const allocation = [{ symbol: "ABC", amount: "100%" }];
    const result = allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation });
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 10000n);
  });

  it("Should verify empty allocation with symbol filter", () => {
    const result = allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation: [] });
    assert.strictEqual(result.size, 0);
  });

  it("Should verify if and allocation is not empty with multiple allocations", () => {
    const allocation = [{ symbol: "ABC", amount: "5000bps" }, { symbol: "DEF", amount: 5 }, { symbol: "GHI", amount: 4500n }];
    const result = allocationParser({ allowedSymbols: ["ABC", "DEF", "GHI"] }).parse({ allocation });
    assert.strictEqual(result.size, 3);
    assert.strictEqual(result.get("ABC"), 5000n);
    assert.strictEqual(result.get("DEF"), 500n);
    assert.strictEqual(result.get("GHI"), 4500n);
  });

  it("Should not verify with duplicate allocation symbol", () => {
    const allocation = [{ symbol: "ABC", amount: "50%" }, { symbol: "ABC", amount: "50%" }];
    assert.throws(() => allocationParser({ allowedSymbols: ["ABC"] }).parse({ allocation }));
  });

  it("Should not verify with disallowed allocation symbol", () => {
    const allocation = [{ symbol: "ABC", amount: "100%" }];
    assert.throws(() => allocationParser({ allowedSymbols: ["DEF"] }).parse({ allocation }));
  });

  it("Should not verify if there is an allocation with 0%", () => {
    const allocation = [{ symbol: "ABC", amount: "100%" }, { symbol: "DEF", amount: "0%" }];
    assert.throws(() => allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation }));
  });

  it("Should not verify if total allocation more than 100%", () => {
    const allocation = [{ symbol: "ABC", amount: "101%" }];
    assert.throws(() => allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation }));
  });

  it("Should not verify if total allocation more than 100% with multiple allocation", () => {
    const allocation = [{ symbol: "ABC", amount: "51%" }, { symbol: "DEF", amount: "50%" }];
    assert.throws(() => allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation }));
  });

  it("Should verify if total allocation less than 100%", () => {
    const allocation = [{ symbol: "ABC", amount: "99%" }];
    const result = allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation })
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 9900n);
  });

  it("Should verify if total allocation less than 100% with multiple allocation", () => {
    const allocation = [{ symbol: "ABC", amount: "49%" }, { symbol: "DEF", amount: "50%" }];
    const result = allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation })
    assert.strictEqual(result.size, 2);
    assert.strictEqual(result.get("ABC"), 4900n);
    assert.strictEqual(result.get("DEF"), 5000n);
  });

  it("Should not verify with extra characters in percentage", () => {
    const allocation = [{ symbol: "ABC", amount: "100%+" }];
    assert.throws(() => allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation }));
  });

  it("Should not verify with extra characters in bps", () => {
    const allocation = [{ symbol: "ABC", amount: "100bps+" }];
    assert.throws(() => allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation }));
  });

  it("Should not verify with missing percentage sign", () => {
    const allocation = [{ symbol: "ABC", amount: "100" }];
    assert.throws(() => allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation }));
  });

  it("Should not verify with negative percentage", () => {
    const allocation = [{ symbol: "ABC", amount: "-10%" }, { symbol: "DEF", amount: "110%" }];
    assert.throws(() => allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation }));
  });

  it("Should not veriry with non-numeric percentage", () => {
    const allocation = [{ symbol: "ABC", amount: "abc" }];
    assert.throws(() => allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation }));
  });

  it("Should verify if empty allocation map", () => {
    const result = allocationParser().parse({ allocation: new Map() });
    assert.strictEqual(result.size, 0);
  });

  it("Should verify non-empty allocation map without filter", () => {
    const allocation = new Map([["ABC", "100%"]]);
    const result = allocationParser().parse({ allocation });
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 10000n);
  });

  it("Should verify if allocation map is not empty", () => {
    const allocation = new Map([["ABC", "100%"]]);
    const result = allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation });
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 10000n);
  });

  it("Should verify empty allocation map with symbol filter", () => {
    const result = allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation: new Map() });
    assert.strictEqual(result.size, 0);
  });

  it("Should verify if allocation record is not empty with multiple allocations", () => {
    const allocation = new Map<string, string | number | bigint>([["ABC", "5000bps"], ["DEF", 5], ["GHI", 4500n]]);
    const result = allocationParser({ allowedSymbols: ["ABC", "DEF", "GHI"] }).parse({ allocation });
    assert.strictEqual(result.size, 3);
    assert.strictEqual(result.get("ABC"), 5000n);
    assert.strictEqual(result.get("DEF"), 500n);
    assert.strictEqual(result.get("GHI"), 4500n);
  });

  it("Should verify if empty allocation record", () => {
    const result = allocationParser().parse({ allocation: {} });
    assert.strictEqual(result.size, 0);
  });

  it("Should verify non-empty allocation record without filter", () => {
    const allocation = { "ABC": "100%" };
    const result = allocationParser().parse({ allocation });
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 10000n);
  });

  it("Should verify if allocation record is not empty", () => {
    const allocation = { "ABC": "100%" };
    const result = allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation });
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 10000n);
  });

  it("Should verify empty allocation record with symbol filter", () => {
    const result = allocationParser({ allowedSymbols: ["ABC", "DEF"] }).parse({ allocation: {} });
    assert.strictEqual(result.size, 0);
  });

  it("Should verify if allocation record is not empty with multiple allocations", () => {
    const allocation = { "ABC": "5000bps", "DEF": 5, "GHI": 4500n };
    const result = allocationParser({ allowedSymbols: ["ABC", "DEF", "GHI"]}).parse({ allocation });
    assert.strictEqual(result.size, 3);
    assert.strictEqual(result.get("ABC"), 5000n);
    assert.strictEqual(result.get("DEF"), 500n);
    assert.strictEqual(result.get("GHI"), 4500n);
  });

  it("Should be able to output to array", () => {
    const allocation = { "ABC": "100%" };
    const result = allocationParser({ container: "array" }).parse({ allocation });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0][0], "ABC");
    assert.strictEqual(result[0][1], 10000n);
  });

  it("Should be able to output to record", () => {
    const allocation = { "ABC": "100%" };
    const result = allocationParser({ container: "record" }).parse({ allocation });
    assert.strictEqual(Object.keys(result).length, 1);
    assert.strictEqual(result["ABC"], 10000n);
  });

  it("Should be able to output to allocation list", () => {
    const allocation = { "ABC": "100%" };
    const result = allocationParser({ container: "allocation" }).parse({ allocation });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].symbol, "ABC");
    assert.strictEqual(result[0].amount, 10000n);
  });

  it("Should be able to output number values", () => {
    const allocation = { "ABC": "100%" };
    const result = allocationParser({ value: "number" }).parse({ allocation });
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 100);
  });

  it("Should be able to output percentage values", () => {
    const allocation = { "ABC": "100%" };
    const result = allocationParser({ value: "percent" }).parse({ allocation });
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), "100%");
  });

  it("Should be able to output bps values", () => {
    const allocation = { "ABC": "100%" };
    const result = allocationParser({ value: "bps" }).parse({ allocation });
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), "10000bps");
  });

});
