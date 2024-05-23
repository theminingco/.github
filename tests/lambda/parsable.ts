import { describe, it } from "mocha";
import { Parsable } from "../../lambda/utility/parsable";
import assert from "assert";

describe("parsable", () => {
  it("Should parse a string", () => {
    const parsable = new Parsable("Hello, World!");
    assert.strictEqual(parsable.string(), "Hello, World!");
  });

  it("Should fail parsing a string from a number", () => {
    const parsable = new Parsable(123);
    assert.throws(() => parsable.string());
  });

  it("Should fail parsing a string from a boolean", () => {
    const parsable = new Parsable(true);
    assert.throws(() => parsable.string());
  });

  it("Should fail parsing a string from an object", () => {
    const parsable = new Parsable({ test: "Test" });
    assert.throws(() => parsable.string());
  });

  it("Should fail parsing a string from an array", () => {
    const parsable = new Parsable(["Test"]);
    assert.throws(() => parsable.string());
  });

  it("Should parse a number", () => {
    const parsable = new Parsable(123);
    assert.strictEqual(parsable.number(), 123);
  });

  it("Should fail parsing a number from a string", () => {
    const parsable = new Parsable("Hello, World!");
    assert.throws(() => parsable.number());
  });

  it("Should fail parsing a number from a boolean", () => {
    const parsable = new Parsable(true);
    assert.throws(() => parsable.number());
  });

  it("Should fail parsing a number from an object", () => {
    const parsable = new Parsable({ test: "Test" });
    assert.throws(() => parsable.number());
  });

  it("Should fail parsing a number from an array", () => {
    const parsable = new Parsable(["Test"]);
    assert.throws(() => parsable.number());
  });

  it("Should parse a boolean", () => {
    const parsable = new Parsable(true);
    assert.strictEqual(parsable.boolean(), true);
  });

  it("Should fail parsing a boolean from a string", () => {
    const parsable = new Parsable("Hello, World!");
    assert.throws(() => parsable.boolean());
  });

  it("Should fail parsing a boolean from a number", () => {
    const parsable = new Parsable(123);
    assert.throws(() => parsable.boolean());
  });

  it("Should fail parsing a boolean from an object", () => {
    const parsable = new Parsable({ test: "Test" });
    assert.throws(() => parsable.boolean());
  });

  it("Should fail parsing a boolean from an array", () => {
    const parsable = new Parsable(["Test"]);
    assert.throws(() => parsable.boolean());
  });

  it("Should parse an map with a string", () => {
    const parsable = new Parsable({ test: "Test" });
    assert.strictEqual(parsable.key("test").string(), "Test");
  });

  it("Should fail parsing a non-existant key", () => {
    const parsable = new Parsable({ test: "Test" });
    assert.throws(() => parsable.key("test2"));
  });

  it("Should fail parsing a map from a string", () => {
    const parsable = new Parsable("Hello, World!");
    assert.throws(() => parsable.key("test"));
  });

  it("Should fail parsing a map from a number", () => {
    const parsable = new Parsable(123);
    assert.throws(() => parsable.key("test"));
  });

  it("Should fail parsing a map from a boolean", () => {
    const parsable = new Parsable(true);
    assert.throws(() => parsable.key("test"));
  });

  it("Should fail parsing a map from an array", () => {
    const parsable = new Parsable(["Test"]);
    assert.throws(() => parsable.key("test"));
  });

  it("Should parse an array", () => {
    const parsable = new Parsable(["Test"]);
    assert.strictEqual(parsable.index(0).string(), "Test");
  });

  it("Should fail parsing a non-existant index", () => {
    const parsable = new Parsable(["Test"]);
    assert.throws(() => parsable.index(1));
  });

  it("Should fail parsing an array from a string", () => {
    const parsable = new Parsable("Hello, World!");
    assert.throws(() => parsable.index(0));
  });

  it("Should fail parsing an array from a number", () => {
    const parsable = new Parsable(123);
    assert.throws(() => parsable.index(0));
  });

  it("Should fail parsing an array from a boolean", () => {
    const parsable = new Parsable(true);
    assert.throws(() => parsable.index(0));
  });

  it("Should fail parsing an array from an object", () => {
    const parsable = new Parsable({ test: "Test" });
    assert.throws(() => parsable.index(0));
  });

});
