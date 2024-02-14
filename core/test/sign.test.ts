import { Keypair } from "@solana/web3.js";
import type { Signature } from "../utility/sign";

const mockSecretKey = new Uint8Array([
  37, 82, 2, 69, 62, 136, 24, 68, 66, 70, 53,
  200, 22, 109, 170, 138, 165, 97, 150, 216, 137, 3,
  191, 124, 204, 155, 0, 158, 69, 180, 45, 226, 164,
  160, 152, 169, 147, 219, 167, 128, 189, 236, 54, 61,
  16, 127, 119, 142, 161, 224, 197, 65, 73, 231, 213,
  155, 56, 135, 92, 99, 121, 147, 209, 77
]);
const mockSigner = Keypair.fromSecretKey(mockSecretKey);

const mockAuthKey = "BX4YKmiGmJa99NSKDdTdAvcm6d6xN1bV5vZjLtvjJPQsdAcU5DUMcTYJMqS9GE3yqr9ftphKoRKWsnpqde7PECt9zWEgNUbYBnyQqbgy6aw2BFfFTbc9xdfANpQxuL5iLT4BTDzdpddgdXRyW:2ps3EfVgxNHZtaxKr7QdwoVDjXuugByhNvcvu4wGfdfTC969pG8Yzqca5eGCB8SmuFnbQXC4qUhi6HyPiWQMWKtF";

const uuidMock = (): unknown => ({ v4: (): string => "1234" });
const validTimestamp = { now: 1577836800000 };
const invalidTimestamp = { now: 1577923200000 };

const expectedAuth: Signature = { signer: mockSigner.publicKey, scope: "test" };

beforeAll(() => {
  jest.mock("uuid", uuidMock);
});

it("Get signature should produce a valid auth key", async () => {
  jest.useFakeTimers(validTimestamp);
  const { getSignature } = await import ("../utility/sign");
  const auth = await getSignature(mockSigner, "test");
  expect(auth).toStrictEqual(mockAuthKey);
  jest.useRealTimers();
});

it("Valid signature should verify", async () => {
  jest.useFakeTimers(validTimestamp);
  const { validateSignature } = await import ("../utility/sign");
  const auth = validateSignature(mockAuthKey);
  expect(auth).toStrictEqual(expectedAuth);
  jest.useRealTimers();
});

it("Invalid signature should not verify", async () => {
  jest.useFakeTimers(validTimestamp);
  const { validateSignature } = await import ("../utility/sign");
  const fakeKey = `${mockAuthKey.slice(0, -1)}1`;
  const auth = validateSignature(fakeKey);
  expect(auth).toStrictEqual(null);
  jest.useRealTimers();
});

it("Expired signature should not verify", async () => {
  jest.useFakeTimers(invalidTimestamp);
  const { validateSignature } = await import ("../utility/sign");
  const auth = validateSignature(mockAuthKey);
  expect(auth).toStrictEqual(null);
  jest.useRealTimers();
});

it("Signature should verify with custom expiry", async () => {
  jest.useFakeTimers(invalidTimestamp);
  const { validateSignature } = await import ("../utility/sign");
  const auth = validateSignature(mockAuthKey, 172800);
  expect(auth).toStrictEqual(expectedAuth);
  jest.useRealTimers();
});
