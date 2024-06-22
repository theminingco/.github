import type { Token } from "@theminingco/core/lib/model";
import { useFirebase } from "./firebase";
import type { PropsWithChildren, ReactElement } from "react";
import { createContext, useContext, useMemo } from "react";
import { useInterval } from "./interval";
import { where } from "firebase/firestore/lite";
import { useWallet } from "./wallet";

interface UseTokens {
  readonly tokens: Token[];
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

  const { result, loading, reload } = useInterval({
    interval: 30, // 30 seconds
    callback: async () => {
      if (!publicKey) {
        return [];
      }
      return getDocuments<Token>(
        "tokens",
        where("owner", "==", publicKey.toString()),
      );
    },
  }, [publicKey]);

  const tokens = result ?? [];

  const context = useMemo(() => {
    return { tokens, loading, reload };
  }, [tokens, loading, reload]);

  return (
    <TokensContext.Provider value={context}>
      {props.children}
    </TokensContext.Provider>
  );
}
