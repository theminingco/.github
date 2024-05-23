import { getCluster } from "@theminingco/core/lib/cluster";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRpc } from "./rpc";
import { useFirebase } from "./firebase";

export interface UseCluster {
  readonly cluster: string | null;
}

const ClusterContext = createContext<UseCluster>({
  cluster: null,
});

export function useCluster(): UseCluster {
  return useContext(ClusterContext);
}

export default function ClusterProvider(props: PropsWithChildren): ReactElement {
  const { rpc } = useRpc();
  const [cluster, setCluster] = useState<string | null>(null);
  const { logError } = useFirebase();

  useEffect(() => {
    getCluster(rpc)
      .then(setCluster)
      .catch(logError);
  }, [logError, rpc]);

  const context = useMemo(() => {
    return { cluster };
  }, [cluster]);

  return (
    <ClusterContext.Provider value={context}>
      {props.children}
    </ClusterContext.Provider>
  );
}
