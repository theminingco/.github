import type { Pool, Token } from "@theminingco/core/lib/model";
import { useFirebase } from "./firebase";
import type { PropsWithChildren, ReactElement } from "react";
import { createContext, useContext, useMemo } from "react";
import { useInterval } from "./interval";
import { where } from "firebase/firestore/lite";
import { useWallet } from "./wallet";
import { usePools } from "./pools";

interface AddedPoolData {
  readonly price: number;
}

interface UseTokens {
  readonly tokens: (Token & AddedPoolData)[];
  readonly loading: boolean;
  reload: () => void;
}

const TokensContext = createContext<UseTokens>({
  tokens: [],
  loading: false,
  reload: () => { throw new Error("No provider"); },
});

export function useTokens(): UseTokens {
  return useContext(TokensContext);
}

export default function TokensProvider(props: PropsWithChildren): ReactElement {
  const { publicKey } = useWallet();
  const { getDocuments } = useFirebase();
  const { pools, loading: l1 } = usePools();

  const poolsMap = useMemo(() => {
    const map = new Map<string, Pool>();
    for (const pool of pools) {
      map.set(pool.address, pool);
    }
    return map;
  }, [pools]);

  const { result, loading: l2, reload } = useInterval({
    interval: 30, // 30 seconds
    callback: async () => {
      if (!publicKey) {
        return [];
      }
      return getDocuments<Token>(
        "tokens",
        where("owner", "==", publicKey),
      );
    },
  }, []);

  const tokens = useMemo(() => {
    // TODO: filter out if not have a price
    return result?.map(x => ({
      ...x,
      price: poolsMap.get(x.address)?.price ?? 0,
    })) ?? [];
  }, [result, poolsMap]);

  const loading = useMemo(() => {
    return l1 || l2;
  }, [l1, l2]);

  const context = useMemo(() => {
    return { tokens, loading, reload };
  }, [tokens, loading, reload]);

  return (
    <TokensContext.Provider value={context}>
      {props.children}
    </TokensContext.Provider>
  );
}
