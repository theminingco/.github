import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, lazy, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";

const Items = lazy(async () => import("../components/item"));
const Collections = lazy(async () => import("../components/collection"));

interface UseNavigation {
  content: ReactElement | null;
  isHome: boolean;
  openCollection: (collection: PublicKey) => void;
  openHome: () => void;
  open: (content: ReactElement) => void;
}

const Context = createContext<UseNavigation>({
  content: null,
  isHome: true,
  openCollection: () => { /* Empty */ },
  openHome: () => { /* Empty */ },
  open: () => { /* Empty */ }
});

export const useNavigation = (): UseNavigation => {
  return useContext(Context);
};

const NavigationProvider = (props: PropsWithChildren): ReactElement => {
  const [overrideContent, setOverrideContent] = useState<ReactElement | null>(null);

  const isHome = useMemo(() => {
    return overrideContent == null;
  }, [overrideContent]);

  const openCollection = useCallback((collection: PublicKey) => {
    window.history.pushState({}, "", `/${collection.toBase58()}`);
    setOverrideContent(<Items collection={collection} />);
  }, []);

  const openHome = useCallback(() => {
    window.history.replaceState({}, "", "/");
    setOverrideContent(null);
  }, []);

  const open = useCallback((newContent: ReactElement) => {
    setOverrideContent(newContent);
  }, []);

  const content = useMemo(() => {
    if (overrideContent != null) { return overrideContent; }
    return <Collections />;
  }, [overrideContent]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.length < 2) { return; }
    try {
      const collection = new PublicKey(path.slice(1));
      openCollection(collection);
    } catch { openHome(); }
  }, [openCollection]);

  const context = useMemo(() => {
    return { content, isHome, openCollection, openHome, open };
  }, [content, isHome, openCollection, openHome, open]);

  return <Context.Provider value={context}>{props.children}</Context.Provider>;
};

export default NavigationProvider;
