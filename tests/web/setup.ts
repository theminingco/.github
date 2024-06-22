import Provider from "../../web/components/provider";
import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import { createElement } from "react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import { JSDOM } from "jsdom";
import googleFont from "next/font/google";
import { define, fake } from "sinon";
import { MockWalletProvider } from "../mock/wallet";
import { MockPopupProvider } from "../mock/popup";

export let jsdom: JSDOM = { } as JSDOM;
export let context: RenderResult = { } as RenderResult;

define(googleFont, "Noto_Emoji", fake(() => ({ className: "" })));
define(googleFont, "Noto_Sans", fake(() => ({ className: "" })));

const testProviders = [MockWalletProvider, MockPopupProvider];

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
