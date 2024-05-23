import { describe, it, beforeEach, afterEach } from "mocha";
import assert from "assert";
import type { SinonFakeTimers, SinonStub } from "sinon";
import { stub, useFakeTimers } from "sinon";
import { invalidateCache, cachedFetch } from "@theminingco/core/src/cache";

const res = async (body: string): Promise<Response> => Promise.resolve(new Response(body));

describe("cache", () => {
  let clock = { } as SinonFakeTimers;
  let fetchStub = { } as SinonStub;

  beforeEach(async () => {
    clock = useFakeTimers();
    fetchStub = stub(global, "fetch");
    fetchStub.onFirstCall().returns(res("1"));
    fetchStub.onSecondCall().returns(res("2"));
    await cachedFetch("https://example.com");
  });

  afterEach(() => {
    invalidateCache();
    clock.restore();
    fetchStub.restore();
  });

  it("Should return cached response", async () => {
    const actual = await cachedFetch("https://example.com", 30);
    assert.strictEqual(actual, "1");
  });

  it("Should return new response after ttl", async () => {
    clock.tick(31 * 1000);
    const actual = await cachedFetch("https://example.com", 30);
    assert.strictEqual(actual, "2");
  });

  it("Should return old response after longer ttl", async () => {
    clock.tick(31 * 1000);
    const actual = await cachedFetch("https://example.com", 60);
    assert.strictEqual(actual, "1");
  });

  it("Should return new response with different url", async () => {
    const actual = await cachedFetch("https://example.com/2", 30);
    assert.strictEqual(actual, "2");
  });

});
