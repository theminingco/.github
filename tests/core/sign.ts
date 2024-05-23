import { getSignature, validateSignature } from "@theminingco/core/src/sign";
import { describe, it, beforeEach, afterEach, before } from "mocha";
import assert from "assert";
import type { SinonFakeTimers, SinonStub } from "sinon";
import { useFakeTimers, stub } from "sinon";
import { Address, createKeyPairFromBytes, getAddressFromPublicKey, signBytes } from "@solana/web3.js";

const validTimestamp = 1577836800000;
const invalidTimestamp = 1577923200000;

const mockSecretKey = new Uint8Array([
  37, 82, 2, 69, 62, 136, 24, 68, 66, 70, 53,
  200, 22, 109, 170, 138, 165, 97, 150, 216, 137, 3,
  191, 124, 204, 155, 0, 158, 69, 180, 45, 226, 164,
  160, 152, 169, 147, 219, 167, 128, 189, 236, 54, 61,
  16, 127, 119, 142, 161, 224, 197, 65, 73, 231, 213,
  155, 56, 135, 92, 99, 121, 147, 209, 77,
]);

const mockAuthKey = "2vghb9NaoMreYc71qdSyBGbWuM8CbMpwAceSrZ2ZTu1fq8qus6mok1D15qKy7ewTxrtTPXYrPHbZLAQeABHc5TeU8j9xFEStBCayHZuc5SXQoSmAYqB5sLaHs1i4pxUMnahcddbDrk68bC6srFg8E3BRvAzA2ECz2SGrPzyU9J:4tyzZdYdzgFUEVKUKzfmiZdv1RYeKMAUsZYbDBQx1SiFNKHX2JrYaCcrjLHzG6oGxxQmsfL5Un9NHaSz3c5sPvbE";

describe("sign", () => {
  let clock = { } as SinonFakeTimers;
  let randomMock = { } as SinonStub;
  let mockSignerSecretKey = { } as CryptoKey;
  let mockSignerPublicKey = { } as Address;

  before(async () => {
    const mockSigner = await createKeyPairFromBytes(mockSecretKey);
    mockSignerSecretKey = mockSigner.privateKey;
    mockSignerPublicKey = await getAddressFromPublicKey(mockSigner.publicKey);
  })

  beforeEach(() => {
    clock = useFakeTimers();
    randomMock = stub(Math, "random").returns(0.5);
  });

  afterEach(() => {
    clock.restore();
    randomMock.restore();
  });

  it("Get signature should produce a valid auth key", async () => {
    clock.now = validTimestamp;
    const auth = await getSignature(mockSignerPublicKey, async (message: Uint8Array) => (
      signBytes(mockSignerSecretKey, message)
    ), "test");
    assert.strictEqual(auth, mockAuthKey);
  });

  it("Valid signature should verify", async () => {
    clock.now = validTimestamp;
    const auth = await validateSignature(mockAuthKey);
    assert.deepStrictEqual(auth, { signer: mockSignerPublicKey, scope: "test" });
  });

  it("Invalid signature should not verify", async () => {
    clock.now = validTimestamp;
    const fakeKey = `${mockAuthKey.slice(0, -1)}1`;
    const auth = await validateSignature(fakeKey);
    assert.strictEqual(auth, null);
  });

  it("Expired signature should not verify", async () => {
    clock.now = invalidTimestamp;
    const auth = await validateSignature(mockAuthKey);
    assert.strictEqual(auth, null);
  });

  it("Signature should verify with custom expiry", async () => {
    clock.now = invalidTimestamp;
    const auth = await validateSignature(mockAuthKey, 172800);
    assert.deepStrictEqual(auth, { signer: mockSignerPublicKey, scope: "test" });
  });
});

