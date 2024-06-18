import Provider from "../../web/components/provider";
import type { Address } from "@solana/web3.js";
import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import { createElement, useMemo, useState } from "react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import { WalletContext } from "../../web/hooks/wallet";
import { JSDOM } from "jsdom";
import googleFont from "next/font/google";
import { define, fake } from "sinon";

export let jsdom: JSDOM = { } as JSDOM;
export let context: RenderResult = { } as RenderResult;
export let setPublicKey: (publicKey: Address | null) => void = () => { /* Empty */ };

define(googleFont, "Noto_Emoji", fake(() => ({ className: "" })));
define(googleFont, "Noto_Sans", fake(() => ({ className: "" })));

function MockWalletProvider(props: PropsWithChildren): ReactElement {
  const [publicKey, setMockPublicKey] = useState<Address | null>(null);

  setPublicKey = setMockPublicKey;

  const wallet = useMemo(() => {
    return {
      wallets: [],
      wallet: null,
      account: null,
      publicKey,
      connect: async () => Promise.reject(new Error("Not implemented")),
      disconnect: async () => Promise.reject(new Error("Not implemented")),
      signTransaction: async () => Promise.reject(new Error("Not implemented")),
      signMessage: async () => Promise.reject(new Error("Not implemented")),
    };
  }, [publicKey]);

  return createElement(WalletContext.Provider, { ...props, value: wallet });
}

const testProviders = [MockWalletProvider];

function TestWrapper(props: PropsWithChildren): ReactElement {
  return createElement(Provider, { ...props, providers: testProviders });
}

export function startTestRender(element: ReactNode, options?: Omit<RenderOptions, "wrapper">): void {
  jsdom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost:3000",
    pretendToBeVisual: true,
  });
  global.window = jsdom.window as never;
  global.document = jsdom.window.document;
  global.self = global.window;
  window.console = global.console;
  window.matchMedia = query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { /* Empty */ },
    removeListener: () => { /* Empty */ },
    addEventListener: () => { /* Empty */ },
    removeEventListener: () => { /* Empty */ },
    dispatchEvent: () => true,
  });
  const originalErr = console.error.bind(console.error);
  console.error = (msg: { toString: () => string }) => {
    if (msg.toString().includes("Warning: ")) {
      return;
    }
    originalErr(msg);
  };
  context = render(element, { wrapper: TestWrapper, ...options });
}
