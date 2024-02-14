import type { ReactElement } from "react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTokens } from "../hooks/token";
import type { Pool } from "@theminingco/core";
import { css } from "@emotion/react";
import { useNavigation } from "../hooks/navigation";
import { PublicKey } from "@solana/web3.js";

const Collection = (props: Pool): ReactElement => {
  const { openCollection } = useNavigation();
  const [image, setImage] = useState<string>();

  const collectionClicked = useCallback(() => {
    openCollection(new PublicKey(props.address));
  }, [openCollection]);

  const blockStyle = useMemo(() => {
    return css`
            display: flex;
            flex-direction: row;
            align-items: center;
            background-color: #2f323a;
            width: 100%;
            flex-shrink: 0;
            border-radius: 12px;
            padding: 8px;
            color: #e5e5e5;
            cursor: pointer;
        `;
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
    <div css={blockStyle} onClick={collectionClicked}>
      <img src={image} alt={props.name} width="64px" height="64px" />
      {/* TODO: \/ */}
      {/* Title + price */}
      {/* APY percentage */}
      {/* Owned / available / total */}
    </div>
  );
};

const Collections = (): ReactElement => {
  const { collections } = useTokens();

  const collectionNodes = useMemo(() => {
    return collections
      .map(collection => {
        return <Collection key={collection.address} {...collection} />;
      });
  }, [collections]);

  const blockStyle = useMemo(() => {
    return css`
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            flex-wrap: wrap;
            justify-content: space-evenly;
        `;
  }, []);

  return <div css={blockStyle}>{collectionNodes}</div>;
};

export default Collections;
