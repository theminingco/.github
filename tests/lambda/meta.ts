import type { SinonStub } from "sinon";
import { stub } from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha";
import { extractAttributes, verifyMetadata } from "../../lambda/utility/meta";
import assert from "assert";

const res = async (body: object): Promise<Response> => Promise.resolve(new Response(JSON.stringify(body)));

describe("meta", () => {
  let fetchStub = { } as SinonStub;

  beforeEach(() => {
    fetchStub = stub(global, "fetch");
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it("Should verify if all are empty", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, []);
    await assert.doesNotReject(result);
  });

  it("Should not verify if attributes not empty when they should be", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "100%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, []);
    await assert.rejects(result);
  });

  it("Should verify if attributes are not empty", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "100%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.doesNotReject(result);
  });

  it("Should not verify if attributes are empty when they shouldn't be", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should verify if and attributes are not empty with multiple attributes", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "50%" }, { trait_type: "DEF", value: "50%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.doesNotReject(result);
  });

  it("Should not verify if if there are duplicate attributes types", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "50%" }, { trait_type: "ABC", value: "50%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify with disallowed attribute trait", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "100%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if there is an attribute with 0%", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "100%" }, { trait_type: "DEF", value: "0%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if total attrubutes more than 100%", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "101%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if total attrubutes more than 100% with multiple attributes", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "51%" }, { trait_type: "DEF", value: "50%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if total attrubutes less than 100%", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "99%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if total attrubutes less than 100% with multiple attributes", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "49%" }, { trait_type: "DEF", value: "50%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify with extra characters in percentage", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "100%+" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify with extraneous keys", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "100%" }], extra: "key" }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if attribute has extraneous keys", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "100%", extra: "key" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify with wrong attribute trait type", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: 123, value: "100%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify with wrong attribute value type", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: 100 }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify with missing attribute value percentage", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "100" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });


  it("Should not verify with missing keys", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ attributes: [{ trait_type: "ABC", value: "100%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if not uploaded to arweave", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC", value: "100%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://fakearweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if missing trait_type", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ value: "100%" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should not verify if missing value", async () => {
    fetchStub.onFirstCall().returns(res({ key: "value" }));
    fetchStub.onSecondCall().returns(res({ key: "value", attributes: [{ trait_type: "ABC" }] }));
    const token = { uri: "https://arweave.net/old" };
    const newUri = "https://arweave.net/new";
    const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
    await assert.rejects(result);
  });

  it("Should be able to extract attributes", () => {
    const meta = { attributes: [{ trait_type: "ABC", value: "100%" }] };
    const result = extractAttributes(meta);
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get("ABC"), 100);
  });

  it("Should not be able to extract attributes if not an object", () => {
    const meta = "meta";
    assert.throws(() => extractAttributes(meta));
  });

  it("Should not be able to extract attributes if null", () => {
    const meta = null;
    assert.throws(() => extractAttributes(meta));
  });

  it("Should not be able to extract attributes if attributes not an object", () => {
    const meta = { attributes: "attributes" };
    assert.throws(() => extractAttributes(meta));
  });

  it("Should not be able to extract attributes if attributes null", () => {
    const meta = { attributes: null };
    assert.throws(() => extractAttributes(meta));
  });

  it("Should not be able to extract attributes if attributes not an array", () => {
    const meta = { attributes: {} };
    assert.throws(() => extractAttributes(meta));
  });

  it("Should not be able to extract attributes if attributes is not present", () => {
    const meta = {};
    assert.throws(() => extractAttributes(meta));
  });

});
