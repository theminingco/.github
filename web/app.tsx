import type { ReactElement } from "react";
import { StrictMode } from "react";
import React, { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Helmet } from "react-helmet";
import Provider from "./components/provider";
import Header from "./components/header";
import Footer from "./components/footer";
import ContextProvider from "./hooks/context";
import FirebaseProvider from "./hooks/firebase";
import PopupProvider from "./hooks/popup";
import SolanaProvider from "./hooks/solana";
import { css, keyframes } from "@emotion/react";
import TokensProvider from "./hooks/token";
import Content from "./components/content";
import NavigationProvider from "./hooks/navigation";

const providers = [StrictMode, FirebaseProvider, NavigationProvider, SolanaProvider,
  TokensProvider, PopupProvider, ContextProvider];

const gradient = keyframes`
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
`;

const Root = (): ReactElement => {
  const robots = useMemo(() => window.location.hostname === "theminingco.xyz" ? "index,follow" : "noindex,follow", []);

  const backgroundStyle = useMemo(() => {
    return css`
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(-45deg, #0a1045, #4d1f53, #1a3f27, #1a3f27, #4d1f53, #0a1045);
            background-size: 400% 400%;
            background-attachment: fixed;
            animation: ${gradient} 60s ease-in-out infinite;
            overflow: visible;
            z-index: -1;
        `;
  }, []);

  return (
    <Provider providers={providers}>
      <Helmet><meta name="robots" content={robots} /></Helmet>
      <div css={backgroundStyle} />
      <Header />
      <Content />
      <Footer />
    </Provider>
  );
};

createRoot(document.getElementById("root") ?? new HTMLElement()).render(<Root />);
