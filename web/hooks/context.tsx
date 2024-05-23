import type { PropsWithChildren, ReactElement } from "react";
import React, { useEffect } from "react";
import { useWallet } from "./wallet";
import { useFirebase } from "./firebase";

export default function ContextProvider(props: PropsWithChildren): ReactElement {
  const { publicKey } = useWallet();
  const { identify, setProperties } = useFirebase();

  useEffect(() => {
    if (publicKey == null) { return; }
    identify(publicKey.toString());
  }, [publicKey, identify]);

  useEffect(() => {
    setProperties({ userAgent: navigator.userAgent });
  }, []);

  useEffect(() => {
    window.fetch("https://api.ipify.org")
      .then(async res => res.text())
      .then(ip => setProperties({ ip }))
      .catch(() => { /* Empty */ });
  }, []);

  return <>{props.children}</>;
}
