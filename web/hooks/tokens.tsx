import { Address } from "@solana/web3.js";
import type { Token } from "@theminingco/core/lib/model";
import { useFirebase } from "./firebase";
import { useMemo } from "react";
import { useInterval } from "./interval";
import { where } from "firebase/firestore/lite";

interface UseTokens {
  readonly tokens: Array<Token>;
  readonly loading: boolean;
  reload: () => void;
}

export function useTokens(collection: Address): UseTokens {
  const { getDocuments } = useFirebase();

  const { result, loading, reload } = useInterval({
    interval: 30, // 30 seconds
    callback: async () => {
      return getDocuments<Token>("tokens", where("collection", "==", collection.toString()));
    },
  }, []);

  const tokens = result ?? [];

  return useMemo(() => {
    return { tokens, loading, reload };
  }, [tokens, loading, reload]);
}
