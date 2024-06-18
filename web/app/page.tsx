"use client";
import type { ReactElement } from "react";
import React, { useEffect, useState } from "react";
import Footer from "../components/footer";
import Header from "../components/header";
import Provider from "../components/provider";
import FirebaseProvider from "../hooks/firebase";
import PopupProvider from "../hooks/popup";
import WalletProvider from "../hooks/wallet";
import PoolsProvider from "../hooks/pools";
import Content from "../components/content";
import Head from "next/head";
import ContextProvider from "../hooks/context";
import { usePathname, useRouter } from "next/navigation";
import TokensProvider from "../hooks/tokens";

const providers = [
  FirebaseProvider, WalletProvider, PoolsProvider, TokensProvider,
  PopupProvider, ContextProvider,
];

export default function Page(): ReactElement {
  const [robots, setRobots] = useState("noindex,follow");
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    router.replace(path);
  }, [path]);

  useEffect(() => {
    if (window.location.hostname === "theminingco.xyz") {
      setRobots("index,follow");
    }
  }, []);

  return (
    <Provider providers={providers}>
      <Head><meta name="robots" content={robots} /></Head>
      <Header />
      <Content />
      <Footer />
    </Provider>
  );
}
