
export const wait = async (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export const unix = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const isAfter = (timestamp: number, other = unix()): boolean => {
  return timestamp >= other;
};

export const isBefore = (timestamp: number, other = unix()): boolean => {
  return timestamp <= other;
};

export const isEqual = (timestamp: number, other = unix(), tolerance = 30): boolean => {
  return Math.abs(timestamp - other) <= tolerance;
};

