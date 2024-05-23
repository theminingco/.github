import type { Pool } from "@theminingco/core/lib/model";
import type { ReactElement, PropsWithChildren } from "react";
import React, { useContext, createContext, useMemo } from "react";
import { useFirebase } from "./firebase";
import { useInterval } from "./interval";

interface UseCollections {
  readonly collections: Array<Pool>;
  readonly loading: boolean;
  reload: () => void;
}

const Context = createContext<UseCollections>({
  collections: [],
  loading: false,
  reload: () => { throw new Error("No provider"); },
});

export function useCollections(): UseCollections {
  return useContext(Context);
}

export default function CollectionsProvider(props: PropsWithChildren): ReactElement {
  const { getDocuments } = useFirebase();

  const { result, loading, reload } = useInterval({
    interval: 30, // 30 seconds
    callback: async () => {
      return getDocuments<Pool>("pools");
    },
  }, []);

  const collections = result ?? [];

  const context = useMemo(() => {
    return { collections, loading, reload };
  }, [collections, loading, reload]);

  return <Context.Provider value={context}>{props.children}</Context.Provider>;
}
