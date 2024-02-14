import type { ReactElement } from "react";
import React, { useCallback, useMemo } from "react";
import { MinorButton } from "./button";
import { useWallet } from "@solana/wallet-adapter-react";
import { css } from "@emotion/react";
import { Disclaimer, Headline, Subline } from "./text";
import { wait } from "@theminingco/core";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useFirebase } from "../hooks/firebase";

const Connect = (): ReactElement => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { wallets, select, connect, disconnect } = useWallet();
  const { logEvent } = useFirebase();

  const connectWallet = useCallback((index: number) => {
    const wallet = wallets[index];
    return () => {
      const isInstalled = wallet.readyState === WalletReadyState.Installed;
      const isLoadable = wallet.readyState === WalletReadyState.Loadable;
      if (isInstalled || isLoadable) {
        select(wallet.adapter.name);
        wait(200)
          .then(disconnect)
          .then(connect)
          .catch(() => { /* Ignore error */ });
        logEvent("connect_init", { wallet: wallet.adapter.name });
      } else {
        window.open(wallet.adapter.url, "_blank", "noopener,noreferrer");
        logEvent("connect_refer", { wallet: wallet.adapter.name });
      }

    };
  }, [wallets, select, connect, disconnect, logEvent]);

  const buttonStyle = useMemo(() => {
    return css`
            display: flex;
            flex-direction: column;
            align-items: center;
            width: calc(50% - 40px);
            text-transform: unset;
        `;
  }, []);

  const textStyle = useMemo(() => {
    return css`
            padding: 4px 8px;
            text-align: center;
            display: inline-block;
            width: 100%;
            font-weight: bold;
        `;
  }, []);

  const buttons = useMemo(() => {
    const nodes: Array<ReactElement> = [];
    for (let i = 0; i < wallets.length; i++) {
      const text = wallets[i].adapter.name;
      const { icon } = wallets[i].adapter;
      const image = icon === "" ? null : <img src={icon} alt={`${text} logo`} width={32} height={32} />;
      nodes.push(
        <MinorButton css={buttonStyle} key={text} onClick={connectWallet(i)}>
          {image}
          <span css={textStyle}>{text}</span>
        </MinorButton>
      );
    }
    return nodes;
  }, [wallets]);

  const disclaimerText = useMemo(() => {
    return "By connecting a wallet, you acknowledge that you have read and understood ⛏ The Mining Company's Terms of Service and Privacy Policy. Wallets are provided by third parties and access may depend on these third parties being operational.";
  }, []);

  const blockStyle = useMemo(() => {
    return css`
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            width: 100%;
        `;
  }, []);

  return (
    <>
      <Headline>Connect wallet</Headline>
      <Subline>Select your wallet to get started.</Subline>
      <div css={blockStyle}>{buttons}</div>
      <Disclaimer>{disclaimerText}</Disclaimer>
    </>
  );
};

export default Connect;
