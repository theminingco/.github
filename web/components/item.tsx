import type { ReactElement } from "react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTokens } from "../hooks/token";
import type { Token } from "@theminingco/core";
import { css } from "@emotion/react";
import { useFirebase } from "../hooks/firebase";
import { usePopup } from "../hooks/popup";
import Connect from "./connect";
import type { PublicKey } from "@solana/web3.js";

const Item = (props: Token): ReactElement => {
  const { logEvent } = useFirebase();
  const { openPopup } = usePopup();
  const [image, setImage] = useState<string>();

  const _buyClicked = useCallback(() => {
    // TODO: show allocation popup
  }, []);

  const _sellClicked = useCallback(() => {
    // TODO: show loading popup
  }, []);

  const _updateClicked = useCallback(() => {
    // TODO: show allocation popup
  }, []);

  const _connectWallet = useCallback(() => {
    logEvent("connect_open");
    openPopup(<Connect />);
  }, []);

  useEffect(() => {
    fetch(props.uri)
      .then(async response => response.json())
      .then(data => data as { image: string })
      .then(data => data.image)
      .then(setImage)
      .catch(() => setImage(undefined));
  }, [props.uri]);

  return (
    <div>
      <img src={image} alt={props.name} width="64px" height="64px" />
      {/* TODO: \/ */}
      {/* Title top left */}
      {/* Price top right */}
      {/* Buy / sell / update bottom. Connect wallet if not connection */}
    </div>
  );
};

interface ItemsProps {
  readonly collection: PublicKey;
}

const Items = (props: ItemsProps): ReactElement => {
  const { getTokens } = useTokens();
  const [tokens, setTokens] = useState<Array<Token>>([]);

  const itemNodes = useMemo(() => {
    return tokens
      .map(token => {
        return <Item key={token.address} {...token} />;
      });
  }, [tokens]);

  const blockStyle = useMemo(() => {
    return css`
            display: flex;
            flex-shrink: 0;
            flex-wrap: wrap;
            justify-content: space-evenly;
        `;
  }, []);

  // TODO: if empty connect a wallet cta if not connected
  // Otherwise just show empty label

  useEffect(() => {
    getTokens(props.collection)
      .then(setTokens)
      .catch(() => { /* Empty */ });
  }, [getTokens, setTokens, props.collection]);

  return <div css={blockStyle}>{itemNodes}</div>;
};

export default Items;
