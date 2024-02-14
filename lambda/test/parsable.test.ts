
beforeAll(() => {
  jest.mock("firebase-functions/v2/https", () => ({ HttpsError: Error }));
});

it("Should parse a string", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable("Hello, World!");
  expect(parsable.string()).toBe("Hello, World!");
});

it("Should fail parsing a string from a number", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(123);
  expect(() => parsable.string()).toThrow();
});

it("Should fail parsing a string from a boolean", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(true);
  expect(() => parsable.string()).toThrow();
});

it("Should fail parsing a string from an object", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable({ test: "Test" });
  expect(() => parsable.string()).toThrow();
});

it("Should fail parsing a string from an array", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(["Test"]);
  expect(() => parsable.string()).toThrow();
});

it("Should parse a number", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(123);
  expect(parsable.number()).toBe(123);
});

it("Should fail parsing a number from a string", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable("Hello, World!");
  expect(() => parsable.number()).toThrow();
});

it("Should fail parsing a number from a boolean", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(true);
  expect(() => parsable.number()).toThrow();
});

it("Should fail parsing a number from an object", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable({ test: "Test" });
  expect(() => parsable.number()).toThrow();
});

it("Should fail parsing a number from an array", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(["Test"]);
  expect(() => parsable.number()).toThrow();
});

it("Should parse a boolean", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(true);
  expect(parsable.boolean()).toBe(true);
});

it("Should fail parsing a boolean from a string", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable("Hello, World!");
  expect(() => parsable.boolean()).toThrow();
});

it("Should fail parsing a boolean from a number", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(123);
  expect(() => parsable.boolean()).toThrow();
});

it("Should fail parsing a boolean from an object", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable({ test: "Test" });
  expect(() => parsable.boolean()).toThrow();
});

it("Should fail parsing a boolean from an array", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(["Test"]);
  expect(() => parsable.boolean()).toThrow();
});

it("Should parse an map with a string", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable({ test: "Test" });
  expect(parsable.key("test").string()).toStrictEqual("Test");
});

it("Should fail parsing a non-existant key", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable({ test: "Test" });
  expect(() => parsable.key("test2")).toThrow();
});

it("Should fail parsing a map from a string", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable("Hello, World!");
  expect(() => parsable.key("test")).toThrow();
});

it("Should fail parsing a map from a number", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(123);
  expect(() => parsable.key("test")).toThrow();
});

it("Should fail parsing a map from a boolean", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(true);
  expect(() => parsable.key("test")).toThrow();
});

it("Should fail parsing a map from an array", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(["Test"]);
  expect(() => parsable.key("test")).toThrow();
});

it("Should parse an array", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(["Test"]);
  expect(parsable.index(0).string()).toStrictEqual("Test");
});

it("Should fail parsing a non-existant index", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(["Test"]);
  expect(() => parsable.index(1)).toThrow();
});

it("Should fail parsing an array from a string", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable("Hello, World!");
  expect(() => parsable.index(0)).toThrow();
});

it("Should fail parsing an array from a number", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(123);
  expect(() => parsable.index(0)).toThrow();
});

it("Should fail parsing an array from a boolean", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable(true);
  expect(() => parsable.index(0)).toThrow();
});

it("Should fail parsing an array from an object", async () => {
  const { Parsable } = await import("../utility/parsable");
  const parsable = new Parsable({ test: "Test" });
  expect(() => parsable.index(0)).toThrow();
});
