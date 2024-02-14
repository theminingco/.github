
it("Range should be properly created", async () => {
  const { range } = await import("../utility/range");
  const actual = range(1, 10);
  const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  expect(actual).toStrictEqual(expected);
});

it("Range with step should be properly created", async () => {
  const { range } = await import("../utility/range");
  const actual = range(1, 10, 2);
  const expected = [1, 3, 5, 7, 9];
  expect(actual).toStrictEqual(expected);
});

it("Interval should be properly created", async () => {
  const { interval } = await import("../utility/range");
  const actual = interval(10);
  const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  expect(actual).toStrictEqual(expected);
});

it("Interval with step should be properly created", async () => {
  const { interval } = await import("../utility/range");
  const actual = interval(10, 2);
  const expected = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
  expect(actual).toStrictEqual(expected);
});
