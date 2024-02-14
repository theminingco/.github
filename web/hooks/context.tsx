import type { PropsWithChildren, ReactElement } from "react";
import React, { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFirebase } from "./firebase";

const ContextProvider = (props: PropsWithChildren): ReactElement => {
  const { publicKey } = useWallet();
  const { identify, setProperties } = useFirebase();

  useEffect(() => {
    if (publicKey == null) { return; }
    identify(publicKey.toBase58());
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

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{props.children}</>;
};

export default ContextProvider;
