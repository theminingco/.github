"use client";
import type { ReactElement } from "react";
import React, { useEffect } from "react";
import Footer from "../components/footer";
import Header from "../components/header";
import Provider from "../components/provider";
import FirebaseProvider from "../hooks/firebase";
import PopupProvider from "../hooks/popup";
import ClusterProvider from "../hooks/cluster";
import WalletProvider from "../hooks/wallet";
import RpcProvider from "../hooks/rpc";
import BalanceProvider from "../hooks/balance";
import CollectionsProvider from "../hooks/collections";
import Content from "../components/content";
import Head from "next/head";

const providers = [
  FirebaseProvider, RpcProvider,
  ClusterProvider, WalletProvider, BalanceProvider,
  CollectionsProvider, PopupProvider,
];

export default function Page(): ReactElement {
  const [robots, setRobots] = React.useState("noindex,follow");

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
