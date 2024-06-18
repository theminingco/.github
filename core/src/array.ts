
export function interval(length: number, step = 1): number[] {
  return [...Array(length).keys()].map(i => i * step);
}

export function range(start: number, end: number, step = 1): number[] {
  const length = Math.ceil((end - start) / step);
  return [...Array(length).keys()].map(i => i * step).map(i => i + start);
}

export function nonNull<T>(value: T | null | undefined): value is T {
  if (value == null) {
    return false;
  }
  return true;
}

type MapCallback<T, U> = (value: NonNullable<T>, index: number, array: T[]) => U;

declare global {
  interface Array<T> {
    mapNonNull: <U>(callback: MapCallback<T, U>) => (U | null)[];
  }
}

Array.prototype.mapNonNull = function<T, U>(this: T[], callback: MapCallback<T, U>): (U | null)[] {
  return this.map((value, index, array) => {
    if (value == null) {
      return null;
    }
    return callback(value, index, array);
  });
};
