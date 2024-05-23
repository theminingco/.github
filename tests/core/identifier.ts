import { describe, it, beforeEach, afterEach } from "mocha";
import { SinonStub, stub } from "sinon";
import { randomId } from "@theminingco/core/src/identifier";
import assert from "assert";

describe("identifier", () => {
  let randomMock = { } as SinonStub;

  beforeEach(() => {
    randomMock = stub(Math, "random").returns(0.5);
  });

  afterEach(() => {
    randomMock.restore();
  });

  it("Should generate a valid identifier", () => {
    const identifier = randomId();
    assert.strictEqual(identifier, "8tUk5ns38nDgSrrydY8TwM");
  });

});
