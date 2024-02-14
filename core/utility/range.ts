
export const interval = (length: number, step = 1): Array<number> => {
  return [...Array(length).keys()].map(i => i * step);
};

export const range = (start: number, end: number, step = 1): Array<number> => {
  const length = Math.ceil((end - start) / step);
  return [...Array(length).keys()].map(i => i * step).map(i => i + start);
};
