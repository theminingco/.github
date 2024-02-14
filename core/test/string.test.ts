
it("Should strip non-numeric characters from a string", async () => {
  const { stripNonDigits } = await import ("../utility/string");
  const input = "1a23456ab7890a.4185";
  const expected = "12345678904185";
  const actual = stripNonDigits(input);
  expect(actual).toBe(expected);
});

it("Should strip non-numeric a large number with decimal", async () => {
  const { stripNonDigits } = await import ("../utility/string");
  const input = "1a23456ab7890a.4185";
  const expected = "1234567890.4185";
  const actual = stripNonDigits(input, true);
  expect(actual).toBe(expected);
});

it("Should format a 1 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 1;
  const expected = "1.00";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 2 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 12;
  const expected = "12.00";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 3 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 123;
  const expected = "123.00";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 4 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 1121;
  const expected = "1.1k";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 5 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 11212;
  const expected = "11.2k";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 6 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 112120;
  const expected = "112.1k";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 7 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 1121200;
  const expected = "1.1M";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 8 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 11212000;
  const expected = "11.2M";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 9 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 112120000;
  const expected = "112.1M";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 10 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 1121200000;
  const expected = "1.1B";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 11 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 11212000000;
  const expected = "11.2B";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 12 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 112120000000;
  const expected = "112.1B";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});

it("Should format a 13 figure number", async () => {
  const { formatLargeNumber } = await import ("../utility/string");
  const input = 1121200000000;
  const expected = "1121.2B";
  const actual = formatLargeNumber(input);
  expect(actual).toBe(expected);
});
