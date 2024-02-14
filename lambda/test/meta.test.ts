
beforeAll(() => {
  jest.mock("firebase-functions/v2/https", () => ({ HttpsError: Error }));
});

type FetchType = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;

const fetchMock = (json: Record<string, Record<string, unknown>>): FetchType => {
  return async (input: RequestInfo | URL, _init?: RequestInit | undefined) => {
    return Promise.resolve({
      json: async (): Promise<Record<string, unknown>> => {
        const keys = Object.keys(json);
        for (const key of keys) {
          if (!(input as string).endsWith(key)) { continue; }
          return Promise.resolve(json[key]);
        }
        return Promise.reject(new Error("Not found"));
      }
    } as Response);
  };
};

it("Should verify if all are empty", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, []);
  await expect(result).resolves.toBeUndefined();
});

it("Should not verify if attributes not empty when they should be", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "100%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, []);
  await expect(result).rejects.toThrow();
});

it("Should verify if attributes are not empty", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "100%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).resolves.toBeUndefined();
});

it("Should not verify if attributes are empty when they shouldn't be", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should verify if and attributes are not empty with multiple attributes", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "50%" }, { "trait_type": "DEF", "value": "50%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).resolves.toBeUndefined();
});

it("Should not verify if if there are duplicate attributes types", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "50%" }, { "trait_type": "ABC", "value": "50%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify with disallowed attribute trait", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "100%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify if there is an attribute with 0%", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "100%" }, { "trait_type": "DEF", "value": "0%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify if total attrubutes more than 100%", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "101%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify if total attrubutes more than 100% with multiple attributes", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "51%" }, { "trait_type": "DEF", "value": "50%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify if total attrubutes less than 100%", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "99%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify if total attrubutes less than 100% with multiple attributes", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "49%" }, { "trait_type": "DEF", "value": "50%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify with extra characters in percentage", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "100%+" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify with extraneous keys", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "100%" }], extra: "key" }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify if attribute has extraneous keys", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "100%", "extra": "key" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify with wrong attribute trait type", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": 123, "value": "100%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Shoul dnot verify with wrong attribute value type", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": 100 }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Shoul dnot verify with missing attribute value percentage", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "100" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify with missing keys", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { attributes: [{ "trait_type": "ABC", "value": "100%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://arweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should not verify if not uploaded to arweave", async () => {
  const mock = {
    "old": { key: "value" },
    "new": { key: "value", attributes: [{ "trait_type": "ABC", "value": "100%" }] }
  };
  global.fetch = jest.fn(fetchMock(mock));
  const { verifyMetadata } = await import("../utility/meta");
  const token = { uri: "https://arweave.net/old" };
  const newUri = "https://fakearweave.net/new";
  const result = verifyMetadata(token, newUri, ["ABC", "DEF"]);
  await expect(result).rejects.toThrow();
});

it("Should be able to extract attributes", async () => {
  const meta = { attributes: [{ "trait_type": "ABC", "value": "100%" }] };
  const { extractAttributes } = await import("../utility/meta");
  const result = extractAttributes(meta);
  expect(result.size).toBe(1);
  expect(result.get("ABC")).toBe(100);
});

it("Should not be able to extract attributes if not an object", async () => {
  const meta = "meta";
  const { extractAttributes } = await import("../utility/meta");
  expect(() => extractAttributes(meta)).toThrow();
});

it("Should not be able to extract attributes if null", async () => {
  const meta = null;
  const { extractAttributes } = await import("../utility/meta");
  expect(() => extractAttributes(meta)).toThrow();
});

it("Should not be able to extract attributes if attributes not an object", async () => {
  const meta = { attributes: "attributes" };
  const { extractAttributes } = await import("../utility/meta");
  expect(() => extractAttributes(meta)).toThrow();
});

it("Should not be able to extract attributes if attributes null", async () => {
  const meta = { attributes: null };
  const { extractAttributes } = await import("../utility/meta");
  expect(() => extractAttributes(meta)).toThrow();
});

it("Should not be able to extract attributes if attributes not an array", async () => {
  const meta = { attributes: {} };
  const { extractAttributes } = await import("../utility/meta");
  expect(() => extractAttributes(meta)).toThrow();
});

it("Should not be able to extract attributes if attributes is not present", async () => {
  const meta = {};
  const { extractAttributes } = await import("../utility/meta");
  expect(() => extractAttributes(meta)).toThrow();
});
