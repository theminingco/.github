import { Address, getAddressDecoder } from "@solana/web3.js";
import type { Wallet, WalletAccount } from "@wallet-standard/core";
import { getWallets } from "@wallet-standard/core";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { SupportedWallet } from "../utility/wallet";
import { FallbackWallet, backpackIcon, phantomIcon, solflareIcon } from "../utility/wallet";
import { useFirebase } from "./firebase";
import { useStatic } from "./static";

export interface UseWallet {
  readonly wallets: Array<SupportedWallet>;
  readonly wallet: SupportedWallet | null;
  readonly account: WalletAccount | null;
  readonly publicKey: Address | null;
  connect: (wallet: SupportedWallet) => Promise<void>;
  disconnect: () => Promise<void>;
}

export const WalletContext = createContext<UseWallet>({
  wallets: [],
  wallet: null,
  account: null,
  publicKey: null,
  connect: async () => Promise.reject(new Error("No provider")),
  disconnect: async () => Promise.reject(new Error("No provider")),
});

export function useWallet(): UseWallet {
  return useContext(WalletContext);
}

const filterSupportedWallets = (wallets: ReadonlyArray<Wallet>): Array<SupportedWallet> => {
  return wallets
    .filter(wallet => Object.hasOwn(wallet.features, "standard:connect"))
    .filter(wallet => Object.hasOwn(wallet.features, "solana:signTransaction")) as Array<SupportedWallet>;
};

// eslint-disable-next-line @typescript-eslint/unbound-method
const { on, get } = getWallets();
const lastWalletLocalStorageKey = "last_connected_wallet";

export default function WalletProvider(props: PropsWithChildren): ReactElement {
  const [wallet, setWallet] = useState<SupportedWallet | null>(null);
  const [supportedWallets, setSupportedWallets] = useState(filterSupportedWallets(get()));
  const { logError } = useFirebase();

  useEffect(() => {
    const listeners = [
      on("register", (...newWallets) => { setSupportedWallets(currentWallets => [...currentWallets, ...filterSupportedWallets(newWallets)]); }),
      on("unregister", (...newWallets) => { setSupportedWallets(currentWallets => currentWallets.filter(x => newWallets.includes(x))); }),
    ];
    return () => { listeners.forEach(off => { off(); }); };
  }, [setSupportedWallets]);

  const connect = useCallback(async (selectedWallet: SupportedWallet) => {
    await selectedWallet.features["standard:connect"].connect();
    setWallet(selectedWallet);
  }, [setWallet]);

  const disconnect = useCallback(async () => {
    if (wallet == null) { return; }
    try {
      await wallet.features["standard:disconnect"]?.disconnect();
    } finally {
      setWallet(null);
    }
  }, [wallet, setWallet]);

  const account = useMemo(() => {
    if (wallet == null) { return null; }
    if (wallet.accounts.length === 0) { return null; }
    return wallet.accounts[0];
  }, [wallet]);

  const publicKey = useMemo(() => {
    if (account == null) { return null; }
    return getAddressDecoder().decode(account.publicKey);
  }, [account]);

  const wallets = useMemo(() => {
    const fallbackWallets: Array<SupportedWallet> = [];
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
    wallet,
    account,
    publicKey,
    connect,
    disconnect,
  }), [wallets, wallet, account, publicKey, connect, disconnect]);

  return <WalletContext.Provider value={context}>{props.children}</WalletContext.Provider>;
}
