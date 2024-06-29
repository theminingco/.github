import { useMemo } from "react";
import { Page } from "./content";
import { useItems } from "./items";

interface UseTotalLockedValue {
  readonly tvl: number;
  readonly loading: boolean;
}

export function useTotalLockedValue(page?: Page): UseTotalLockedValue {
  const { items, loading } = useItems(page);

  const tvl = useMemo(() =>
    items
      .map(x => "pool" in x ? x.pool.price : x.price * x.supply)
      .reduce((acc, x) => acc + x, 0),
    [items]
  );

  return useMemo(() => ({ tvl, loading }), [tvl, loading]);
}
