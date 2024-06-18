import { useCallback, useMemo, useState } from "react";
import { useCallable } from "./callable";
import { useWallet } from "./wallet";
import type { Address } from "@solana/web3.js";
import { useFirebase } from "./firebase";

interface UseTransaction {
  commit: (tokenAddress: Address, allocation: Map<string, string>) => void;
  loading: boolean;
  result?: string | Error;
}

export function useTransaction(): UseTransaction {
  const [result, setResult] = useState<string | Error>();
  const [loading, setLoading] = useState(false);
  const { update, send } = useCallable();
  const { publicKey, signTransaction } = useWallet();
  const { logError } = useFirebase();

  const asyncCommit = useCallback(async (tokenAddress: Address, allocation: Map<string, string>) => {
    if (publicKey == null) {
      return;
    }
    setLoading(true);
    try {
      const updateResponse = await update({ publicKey, tokenAddress, allocation });
      const transaction = Buffer.from(updateResponse.transaction, "base64");
      const signedTransaction = await signTransaction(transaction);
      const rawSignedTransaction = signedTransaction.toString("base64");
      const sendResponse = await send({ transaction: rawSignedTransaction });
      setResult(sendResponse.signature);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(`${error}`);
      setResult(err);
      setLoading(false);
      logError(err);
    }
  }, [publicKey, update, send, signTransaction]);

  const commit = useCallback((tokenAddress: Address, allocation: Map<string, string>) => {
    void asyncCommit(tokenAddress, allocation);
  }, [asyncCommit]);

  return useMemo(() => ({
    commit,
    loading,
    result,
  }), [commit, loading, result]);
}
