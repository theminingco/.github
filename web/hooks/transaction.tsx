import { useCallback, useMemo, useState } from "react";
import { useCallable } from "./callable";
import { useWallet } from "./wallet";
import type { Address } from "@solana/web3.js";
import { useFirebase } from "./firebase";
import type { ToastProps } from "./toast";
import { useToast } from "./toast";
import { humanReadable } from "../utility/error";
import { faUpRightFromSquare, faXmark } from "@fortawesome/free-solid-svg-icons";

interface UseTransaction {
  commit: (tokenAddress: Address, allocation: Map<string, string>) => void;
  loading: boolean;
  result?: string | Error;
}

function preparingToast(): ToastProps {
  return {
    title: "1/3 Preparing transaction",
    message: "Please hold on while we prepare your transaction.",
    type: "loading",
  };
}

function approvingToast(): ToastProps {
  return {
    title: "2/3 Approving transaction",
    message: "Please approve the transaction in your wallet.",
    type: "loading",
  };
}

function sendingToast(): ToastProps {
  return {
    title: "3/3 Sending transaction",
    message: "Sending the transaction to the cluster and confirming it landed.",
    type: "loading",
  };
}

function successToast(hash: string, clearToast: () => void): ToastProps {
  return {
    title: "Transaction successful",
    message: "Successfully landed transaction in a block.",
    type: "success",
    actions: [
      { icon: faXmark, onClick: clearToast },
      { icon: faUpRightFromSquare, href: `https://solscan.io/tx/${hash}` },
    ],
  };
}

function failureToast(error: unknown, clearToast: () => void): ToastProps {
  return {
    title: "Transaction failed",
    message: humanReadable(error),
    type: "error",
    actions: [
      { icon: faXmark, onClick: clearToast },
    ],
  };
}

export function useTransaction(): UseTransaction {
  const [loading, setLoading] = useState(false);
  const { update, send } = useCallable();
  const { publicKey, signTransaction } = useWallet();
  const { logError } = useFirebase();
  const { setToast, clearToast } = useToast();

  const asyncCommit = useCallback(async (tokenAddress: Address, allocation: Map<string, string>) => {
    if (publicKey == null) {
      return;
    }
    setLoading(true);
    try {
      setToast(preparingToast());
      const updateResponse = await update({ publicKey, tokenAddress, allocation });
      const transaction = Buffer.from(updateResponse.transaction, "base64");
      setToast(approvingToast());
      const signedTransaction = await signTransaction(transaction);
      const rawSignedTransaction = signedTransaction.toString("base64");
      setToast(sendingToast());
      const sendResponse = await send({ transaction: rawSignedTransaction });
      setToast(successToast(sendResponse.signature, clearToast));
    } catch (error) {
      setToast(failureToast(error, clearToast));
      setLoading(false);
      logError(error);
    }
  }, [publicKey, update, send, signTransaction, setToast, clearToast, setLoading, logError]);

  const commit = useCallback((tokenAddress: Address, allocation: Map<string, string>) => {
    void asyncCommit(tokenAddress, allocation);
  }, [asyncCommit]);

  return useMemo(() => ({ commit, loading }), [commit, loading]);
}
