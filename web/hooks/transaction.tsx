import { useCallback, useMemo, useState } from "react";
import { useCallable } from "./callable";
import { useWallet } from "./wallet";
import type { Address } from "@solana/web3.js";
import { useFirebase } from "./firebase";
import type { AlertProps } from "./alert";
import { useAlert } from "./alert";
import { faUpRightFromSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import { humanReadable } from "../utility/error";

interface UseTransaction {
  commit: (tokenAddress: Address, allocation: Record<string, string>) => void;
  loading: boolean;
  result?: string | Error;
}

function preparingAlert(): AlertProps {
  return {
    title: "1/3 Preparing transaction",
    message: "Please hold on while we prepare your transaction.",
    type: "loading",
  };
}

function approvingAlert(): AlertProps {
  return {
    title: "2/3 Approving transaction",
    message: "Please approve the transaction in your wallet.",
    type: "loading",
  };
}

function sendingAlert(): AlertProps {
  return {
    title: "3/3 Sending transaction",
    message: "Sending the transaction to the cluster and confirming it landed.",
    type: "loading",
  };
}

function successAlert(hash: string, clearAlert: () => void): AlertProps {
  return {
    title: "Transaction successful",
    message: "Successfully landed transaction in a block.",
    type: "success",
    actions: [
      { icon: faUpRightFromSquare, href: `https://solscan.io/tx/${hash}` },
      { icon: faXmark, onClick: clearAlert },
    ],
  };
}

function failureAlert(error: unknown, clearAlert: () => void): AlertProps {
  return {
    title: "Transaction failed",
    message: humanReadable(error),
    type: "error",
    actions: [
      { icon: faXmark, onClick: clearAlert },
    ],
  };
}

export function useTransaction(): UseTransaction {
  const [loading, setLoading] = useState(false);
  const { update, send } = useCallable();
  const { publicKey, signTransaction } = useWallet();
  const { logError } = useFirebase();
  const { setAlert, clearAlert } = useAlert();

  const asyncCommit = useCallback(async (tokenAddress: Address, allocation: Record<string, string>) => {
    if (publicKey == null) {
      return;
    }
    setLoading(true);
    try {
      setAlert(preparingAlert());
      const updateResponse = await update({ publicKey, tokenAddress, allocation });
      const transaction = Buffer.from(updateResponse.transaction, "base64");
      setAlert(approvingAlert());
      const signedTransaction = await signTransaction(transaction);
      const rawSignedTransaction = signedTransaction.toString("base64");
      setAlert(sendingAlert());
      const sendResponse = await send({ transaction: rawSignedTransaction });
      setAlert(successAlert(sendResponse.signature, clearAlert));
    } catch (error) {
      setAlert(failureAlert(error, clearAlert));
      setLoading(false);
      logError(error);
    }
  }, [publicKey, update, send, signTransaction, setAlert, clearAlert, setLoading, logError]);

  const commit = useCallback((tokenAddress: Address, allocation: Record<string, string>) => {
    void asyncCommit(tokenAddress, allocation);
  }, [asyncCommit]);

  return useMemo(() => ({ commit, loading }), [commit, loading]);
}
