import { usePools } from "./pools";
import { useTokens } from "./tokens";

type TokensType = ReturnType<typeof useTokens>["tokens"];
type PoolsType = ReturnType<typeof usePools>["pools"];

interface UseItems {
  items: TokensType | PoolsType;
  loading: boolean;
  reload: () => void;
}

export function useItems(owned: boolean): UseItems {
  if (owned) {
    const { tokens, loading, reload } = useTokens();
    return { items: tokens, loading, reload };
  } else {
    const { pools, loading, reload } = usePools();
    return { items: pools, loading, reload };
  }
}
