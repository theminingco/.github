import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useEffect, useState } from "react";
import { useContext as useReactContext } from "react";
import { useFirebase } from "./firebase";
import { useWallet } from "./wallet";

export interface UseContext {
  readonly countryCode?: string;
  readonly ipAddress?: string;
}

const ContextContext = createContext<UseContext>({
  countryCode: "",
  ipAddress: "",
});

export function useContext(): UseContext {
  return useReactContext(ContextContext);
}

export default function ContextProvider(props: PropsWithChildren): ReactElement {
  const { logError, identify, setProperties } = useFirebase();
  const [context, setContext] = useState<UseContext>({});
  const { publicKey } = useWallet();

  useEffect(() => {
    if (publicKey == null) { return; }
    identify(publicKey.toString());
  }, [publicKey, identify]);

  useEffect(() => {
    setProperties({ userAgent: navigator.userAgent });
  }, [setProperties]);

  useEffect(() => {
    if (context?.ipAddress == null) { return; }
    setProperties({ ip: context.ipAddress });
  }, [context?.ipAddress, setProperties]);

  useEffect(() => {
    window.fetch("https://freeipapi.com/api/json")
      .then(async x => x.json())
      .then(x => x as UseContext)
      .then(setContext)
      .catch(logError);
  }, []);

  return (
    <ContextContext.Provider value={context}>
      {props.children}
    </ContextContext.Provider>
  );
}
