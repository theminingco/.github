import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useEffect, useState } from "react";
import { useContext as useReactContext } from "react";
import { useFirebase } from "./firebase";
import { useWallet } from "./wallet";

export interface UseContext {
  readonly countryCode?: string;
  readonly query?: string;
}

const ContextContext = createContext<UseContext>({
  countryCode: "",
  query: "",
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
    if (context?.query == null) { return; }
    setProperties({ ip: context.query });
  }, [context?.query, setProperties]);

  useEffect(() => {
    window.fetch("http://ip-api.com/json")
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
