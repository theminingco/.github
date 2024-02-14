import type { PropsWithChildren, ReactElement } from "react";
import React, { useMemo } from "react";
import renderer from "react-test-renderer";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { WalletContext } from "@solana/wallet-adapter-react";

const MockWalletProvider = (props: PropsWithChildren): ReactElement => {
  const wallet = useMemo(() => {
    return {
      publicKey: null
    } as WalletContextState;
  }, []);
  return <WalletContext.Provider value={wallet}>{props.children}</WalletContext.Provider>;
};

it("Header should be rendered", async () => {
  jest.mock("uuid", () => { /* Empty */ });
  jest.mock("firebase/functions", async () => { /* Empty */ });
  const file = await import("../components/header");
  const Header = file.default;
  const component = renderer.create(<MockWalletProvider><Header /></MockWalletProvider>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
