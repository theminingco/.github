
declare global {
  interface PromiseConstructor {
    allResolved: <T>(values: Iterable<T | PromiseLike<T>>) => Promise<T[]>;
  }
}

function isError<T>(x: PromiseSettledResult<T>): x is PromiseRejectedResult {
  return x.status === "rejected";
}

function isFulfilled<T>(x: PromiseSettledResult<T>): x is PromiseFulfilledResult<T> {
  return x.status === "fulfilled";
}

Promise.allResolved = async (promises) => {
  const results = await Promise.allSettled(promises);
  const errors = results
    .filter(isError)
    .map(x => x.reason);
  if (errors.length > 0) {
    throw new Error(errors.join(","));
  }
  return results
    .filter(isFulfilled)
    .map(x => x.value);
};

export {};
