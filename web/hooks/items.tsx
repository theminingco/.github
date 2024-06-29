import type { Pool, Token } from "@theminingco/core/lib/model";
import { usePools } from "./pools";
import { useTokens } from "./tokens";
import { useMemo } from "react";
import type { Page } from "./content";

type MetaToken = Token & { pool: Pool };
type MetaPool = Pool & { tokens: Token[] };

export type Item = MetaToken | MetaPool;

interface UseItems {
  items: Item[];
  loading: boolean;
  reload: () => void;
}

export function useItems(page?: Page): UseItems {
  const { tokens: t1, loading: l1, reload: r1 } = useTokens();
  const { pools: p1, loading: l2, reload: r2 } = usePools();

  const poolsMap = useMemo(() => new Map(p1.map(x => [x.address, x])), [p1]);
  const tokensMap = useMemo(() => {
    const map = new Map<string, Token[]>();
    for (const token of t1) {
      const current = map.get(token.collection) ?? [];
      map.set(token.collection, [...current, token]);
    }
    return map;
  }, [t1]);

  const pools = useMemo(() => {
    return p1
      .map(x => ({ ...x, tokens: tokensMap.get(x.address) ?? [] }))
      .map(x => x as MetaPool);
  }, [p1, tokensMap]);

  const tokens = useMemo(() => {
    return t1
      .filter(x => poolsMap.has(x.collection))
      .map(x => ({ ...x, pool: poolsMap.get(x.collection) }))
      .map(x => x as MetaToken);
  }, [t1, poolsMap]);

  const items = useMemo(() => page === "portfolio" ? tokens : pools, [page, tokens, pools]);
  const loading = useMemo(() => l1 || l2, [l1, l2]);
  const reload = useMemo(() => () => [r1, r2].forEach(x => x()), [r1, r2]);

  return useMemo(() => ({
    items, loading, reload,
  }), [items, loading, reload]);
}
