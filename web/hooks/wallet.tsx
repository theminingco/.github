import type { Address } from "@solana/web3.js";
import { getAddressDecoder } from "@solana/web3.js";
import type { Wallet } from "@wallet-standard/core";
import { StandardConnect, StandardDisconnect, StandardEvents, getWallets } from "@wallet-standard/core";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { SupportedWallet } from "../utility/wallet";
import { FallbackWallet, backpackIcon, phantomIcon, solflareIcon } from "../utility/wallet";
import { useFirebase } from "./firebase";
import { useStatic } from "./static";
import { SolanaSignMessage, SolanaSignTransaction } from "@solana/wallet-standard-features";

export interface UseWallet {
  readonly wallets: SupportedWallet[];
  readonly publicKey: Address | null;
  connect: (wallet: SupportedWallet) => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Buffer) => Promise<Buffer>;
  signMessage: (message: Buffer) => Promise<Buffer>;
}

export const WalletContext = createContext<UseWallet>({
  wallets: [],
  publicKey: null,
  connect: async () => Promise.reject(new Error("No provider")),
  disconnect: async () => Promise.reject(new Error("No provider")),
  signTransaction: async () => Promise.reject(new Error("No provider")),
  signMessage: async () => Promise.reject(new Error("No provider")),
});

export function useWallet(): UseWallet {
  return useContext(WalletContext);
}

const filterSupportedWallets = (wallets: readonly Wallet[]): SupportedWallet[] => {
  return wallets
    .filter(wallet => Object.hasOwn(wallet.features, "standard:connect"))
    .filter(wallet => Object.hasOwn(wallet.features, "solana:signTransaction")) as SupportedWallet[];
};

// eslint-disable-next-line @typescript-eslint/unbound-method
const { on, get } = getWallets();
const lastWalletLocalStorageKey = "last_connected_wallet";

export default function WalletProvider(props: PropsWithChildren): ReactElement {
  const [wallet, setWallet] = useState<SupportedWallet | null>(null);
  const [supportedWallets, setSupportedWallets] = useState(filterSupportedWallets(get()));
  const [changeKey, setChangeKey] = useState(0);
  const removeChangeListener = useRef<() => void>();
  const { logError } = useFirebase();

  useEffect(() => {
    const listeners = [
      on("register", (...newWallets) => { setSupportedWallets(currentWallets => [...currentWallets, ...filterSupportedWallets(newWallets)]); }),
      on("unregister", (...newWallets) => { setSupportedWallets(currentWallets => currentWallets.filter(x => newWallets.includes(x))); }),
    ];
    return () => { listeners.forEach(off => { off(); }); };
  }, [setSupportedWallets]);

  const connect = useCallback(async (selectedWallet: SupportedWallet) => {
    await disconnect();
    await selectedWallet.features[StandardConnect].connect();
    removeChangeListener.current = selectedWallet.features[StandardEvents]?.on("change", (props) => {
      setChangeKey(key => key + 1);
    });
    setWallet(selectedWallet);
  }, [setWallet]);

  const disconnect = useCallback(async () => {
    if (wallet == null) { return; }
    removeChangeListener.current?.();
    try {
      await wallet.features[StandardDisconnect]?.disconnect();
    } finally {
      setWallet(null);
    }
  }, [wallet, setWallet]);

  const account = useMemo(() => {
    if (wallet == null) { return null; }
    if (wallet.accounts.length === 0) { return null; }
    return wallet.accounts[0];
  }, [wallet, changeKey]);

  const publicKey = useMemo(() => {
    if (account == null) { return null; }
    return getAddressDecoder().decode(account.publicKey);
  }, [account]);

  const wallets = useMemo(() => {
    const fallbackWallets: SupportedWallet[] = [];
    const walletNames = new Set(supportedWallets.map(x => x.name));
    if (!walletNames.has("Phantom")) {
      fallbackWallets.push(new FallbackWallet("Get Phantom", phantomIcon, "https://www.phantom.app/"));
    }
    if (!walletNames.has("Solflare")) {
      fallbackWallets.push(new FallbackWallet("Get Solflare", solflareIcon, "https://solflare.com/"));
    }
    if (!walletNames.has("Backpack")) {
      fallbackWallets.push(new FallbackWallet("Get Backpack", backpackIcon, "https://backpack.app/"));
    }
    return [...supportedWallets, ...fallbackWallets];
  }, [supportedWallets]);

  const signTransaction = useCallback(async (transaction: Buffer) => {
    if (wallet == null) { throw new Error("No wallet connected"); }
    if (account == null) { throw new Error("No account available"); }
    const signFn = wallet.features[SolanaSignTransaction]?.signTransaction;
    if (signFn == null) { throw new Error("Wallet does not support signing transactions"); }
    const [{ signedTransaction }] = await signFn({ transaction, account });
    return Buffer.from(signedTransaction);
  }, [wallet, account]);

  const signMessage = useCallback(async (message: Buffer) => {
    if (wallet == null) { throw new Error("No wallet connected"); }
    if (account == null) { throw new Error("No account available"); }
    const signFn = wallet.features[SolanaSignMessage]?.signMessage;
    if (signFn == null) { throw new Error("Wallet does not support signing messages"); }
    const [{ signedMessage }] = await signFn({ message, account });
    return Buffer.from(signedMessage);
  }, [wallet, account]);

  useEffect(() => {
    if (wallet == null) { return; }
    localStorage.setItem(lastWalletLocalStorageKey, wallet.name);
  }, [wallet]);

  const staticWallet = useStatic(wallet);
  useEffect(() => {
    if (staticWallet != null) { return; }
    const lastConnectedWalletName = localStorage.getItem(lastWalletLocalStorageKey);
    if (lastConnectedWalletName == null) { return; }
    const lastConnectedWallet = supportedWallets.find(x => x.name === lastConnectedWalletName);
    if (lastConnectedWallet == null) { return; }
    connect(lastConnectedWallet)
      .catch(logError);
  }, [supportedWallets]);

  const context = useMemo(() => ({
    wallets,
    publicKey,
    connect,
    disconnect,
    signTransaction,
    signMessage,
  }), [wallets, publicKey, connect, disconnect, signTransaction, signMessage]);

  return (
    <WalletContext.Provider value={context}>
      {props.children}
    </WalletContext.Provider>
  );
}
