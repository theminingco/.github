import type { Pool } from "@theminingco/core/lib/model";
import type { ReactElement, PropsWithChildren } from "react";
import React, { useContext, createContext, useMemo } from "react";
import { useFirebase } from "./firebase";
import { useInterval } from "./interval";
import { where } from "firebase/firestore/lite";
import { useIsProduction } from "./production";

interface UsePools {
  readonly pools: Pool[];
  readonly loading: boolean;
  reload: () => void;
}

const PoolsContext = createContext<UsePools>({
  pools: [],
  loading: false,
  reload: () => { throw new Error("No provider"); },
});

export function usePools(): UsePools {
  return useContext(PoolsContext);
}

export default function PoolsProvider(props: PropsWithChildren): ReactElement {
  const { getDocuments } = useFirebase();
  const isProduction = useIsProduction();

  const { result, loading, reload } = useInterval({
    interval: 30, // 30 seconds
    callback: async () => {
      return getDocuments<Pool>(
        "pools",
        isProduction ? where("isReleased", "==", true) : undefined,
      );
    },
  }, [isProduction]);

  const pools = result ?? [];

  const context = useMemo(() => {
    return { pools, loading, reload };
  }, [pools, loading, reload]);

  return (
    <PoolsContext.Provider value={context}>
      {props.children}
    </PoolsContext.Provider>
  );
}
