import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useMemo } from "react";
import { useRpc } from "./rpc";
import { useInterval } from "./interval";
import { useWallet } from "./wallet";
import { toNumber } from "@theminingco/core/lib/number";

export interface UseBalance {
  readonly balance: number;
  readonly loading: boolean;
  reload: () => void;
}

export const BalanceContext = createContext<UseBalance>({
  balance: 0,
  loading: false,
  reload: () => { throw new Error("No provider"); },
});

export function useBalance(): UseBalance {
  return useContext(BalanceContext);
}

export default function BalanceProvider(props: PropsWithChildren): ReactElement {
  const { rpc } = useRpc();
  const { publicKey } = useWallet();

  const { loading, result, reload } = useInterval({
    interval: 30, // 30 seconds,
    callback: async () => {
      if (publicKey == null) {
        return 0;
      }
      return rpc.getBalance(publicKey)
        .send()
        .then(x => toNumber(x.value, 9));
    },
  }, [publicKey, rpc]);

  const balance = result ?? 0;

  const context = useMemo(() => {
    return { balance, loading, reload };
  }, [balance, loading, reload]);

  return (
    <BalanceContext.Provider value={context}>
      {props.children}
    </BalanceContext.Provider>
  );
}
