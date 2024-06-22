import type { Address } from "@solana/web3.js";
import type { PropsWithChildren, ReactElement } from "react";
import { useState, useMemo, createElement } from "react";
import { WalletContext } from "../../web/hooks/wallet";

export let setPublicKey: (publicKey: Address | null) => void = () => { /* Empty */ };

export function MockWalletProvider(props: PropsWithChildren): ReactElement {
  const [publicKey, setMockPublicKey] = useState<Address | null>(null);

  setPublicKey = setMockPublicKey;

  const wallet = useMemo(() => {
    return {
      wallets: [],
      wallet: null,
      account: null,
      publicKey,
      connect: async () => Promise.reject(new Error("Not implemented")),
      disconnect: async () => Promise.reject(new Error("Not implemented")),
      signTransaction: async () => Promise.reject(new Error("Not implemented")),
      signMessage: async () => Promise.reject(new Error("Not implemented")),
    };
  }, [publicKey]);

  return createElement(WalletContext.Provider, { ...props, value: wallet });
}
