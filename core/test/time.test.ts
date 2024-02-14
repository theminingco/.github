
const validTimestamp = { now: 1577836812345 };

it("Should create a valid unix timestamp", async () => {
  jest.useFakeTimers(validTimestamp);
  const { unix } = await import ("../utility/time");
  const timestamp = unix();
  expect(timestamp).toStrictEqual(1577836812);
  jest.useRealTimers();
});

it("Should return true from isAfter if timestamp is after other", async () => {
  const { isAfter } = await import ("../utility/time");
  const timestamp = isAfter(1577836813, 1577836812);
  expect(timestamp).toStrictEqual(true);
});

it("Should return false from isAfter if timestamp is before other", async () => {
  const { isAfter } = await import ("../utility/time");
  const timestamp = isAfter(1577836811, 1577836812);
  expect(timestamp).toStrictEqual(false);
});

it("Should return true from isBefore if timestamp is before other", async () => {
  const { isBefore } = await import ("../utility/time");
  const timestamp = isBefore(1577836811, 1577836812);
  expect(timestamp).toStrictEqual(true);
});

it("Should return false from isBefore if timestamp is after other", async () => {
  const { isBefore } = await import ("../utility/time");
  const timestamp = isBefore(1577836813, 1577836812);
  expect(timestamp).toStrictEqual(false);
});

it("Should return true from isEqual if timestamp is equal", async () => {
  const { isEqual } = await import ("../utility/time");
  const timestamp = isEqual(1577836812, 1577836812, 10);
  expect(timestamp).toStrictEqual(true);
});

it("Should return true from isEqual if timestamp is not equal but within tolerance", async () => {
  const { isEqual } = await import ("../utility/time");
  const timestamp = isEqual(1577836815, 1577836812, 10);
  expect(timestamp).toStrictEqual(true);
});

it("Should return false from isEqual if timestamp is not equal", async () => {
  const { isEqual } = await import ("../utility/time");
  const timestamp = isEqual(1577836825, 1577836812, 10);
  expect(timestamp).toStrictEqual(false);
});
