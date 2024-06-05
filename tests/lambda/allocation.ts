import type { SinonStub } from "sinon";
import { stub } from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha";
import { validateMetadata } from "../../lambda/utility/allocation";
import assert from "assert";
import { Allocation, Metadata } from "@theminingco/core";

const res = async (body?: Array<Allocation> | Partial<Metadata>): Promise<Response> => {
  const response: Metadata = {
    name: "Name",
    symbol: "Symbol",
    description: "Description",
    image: "Image",
    external_url: "External URL",
    attributes: [],
    allocation: [],
  };
  if (Array.isArray(body)) {
    response.allocation = body;
  } else {
    Object.assign(response, body);
  }
  return Promise.resolve(new Response(JSON.stringify(response)))
}

describe("allocation", () => {
  let fetchStub = { } as SinonStub;

  beforeEach(() => {
    fetchStub = stub(global, "fetch");
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it("Should verify if all are empty", async () => {
    fetchStub.onFirstCall().returns(res([]));
    const result = await validateMetadata("https://arweave.net/new", []);
    assert.strictEqual(result.size, 0);
  });

  it("Should verify without any allowed symbol filter", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "100%" }]));
    const result = await validateMetadata("https://arweave.net/new", []);
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 100);
  });

  it("Should verify if attributes are not empty", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "100%" }]));
    const result = await validateMetadata("https://arweave.net/new", ["ABC", "DEF"]);
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 100);
  });

  it("Should not verify empty attributes with symbol filter", async () => {
    fetchStub.onFirstCall().returns(res([]));
    const result = await validateMetadata("https://arweave.net/new", ["ABC", "DEF"]);
    assert.strictEqual(result.size, 0);
  });

  it("Should verify if and attributes are not empty with multiple attributes", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "50%" }, { symbol: "DEF", percentage: "50%" }]));
    const result = await validateMetadata("https://arweave.net/new", ["ABC", "DEF"]);
    assert.strictEqual(result.size, 2);
    assert.strictEqual(result.get("ABC"), 50);
    assert.strictEqual(result.get("DEF"), 50);
  });

  it("Should not verify if there are duplicate attributes types", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "50%" }, { symbol: "ABC", percentage: "50%" }]));
    const result = validateMetadata("https://arweave.net/new", ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify with disallowed attribute trait", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "100%" }]));
    const result = validateMetadata("https://arweave.net/new", ["DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if there is an attribute with 0%", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "100%" }, { symbol: "DEF", percentage: "0%" }]));
    const result = validateMetadata("https://arweave.net/new", ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if total attrubutes more than 100%", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "101%" }]));
    const result = validateMetadata("https://arweave.net/new", ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if total attrubutes more than 100% with multiple attributes", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "51%" }, { symbol: "DEF", percentage: "50%" }]));
    const result = validateMetadata("https://arweave.net/new", ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if total attrubutes less than 100%", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "99%" }]));
    const result = validateMetadata("https://arweave.net/new", ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if total attrubutes less than 100% with multiple attributes", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "49%" }, { symbol: "DEF", percentage: "50%" }]));
    const result = validateMetadata("https://arweave.net/new", ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify with extra characters in percentage", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "100%+" }]));
    const result = validateMetadata("https://arweave.net/new", ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify with missing attribute percentage percentage", async () => {
    fetchStub.onSecondCall().returns(res([{ symbol: "ABC", percentage: "100" }]));
    const result = validateMetadata("https://arweave.net/new", ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify with non-matching name", async () => {
    fetchStub.onFirstCall().returns(res({ name: "ABC" }));
    fetchStub.onSecondCall().returns(res({ name: "DEF" }));
    const result = validateMetadata("https://arweave.net/new", [], "https://arweave.net/old");
    await assert.rejects(result);
  });

  it("Should not verify if not uploaded to arweave", async () => {
    fetchStub.onFirstCall().returns(res([{ symbol: "ABC", percentage: "100%" }]));
    const result = validateMetadata("https://fakearweave.net/new", ["ABC", "DEF"]);
    await assert.rejects(result);
  });

});
