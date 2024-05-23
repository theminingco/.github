import type { Address } from "@solana/web3.js";
import type { ReactElement } from "react";
import React, { useMemo } from "react";
import { useTokens } from "../hooks/tokens";

interface AllocationProps {
  collection: Address;
}

export default function Details(props: AllocationProps): ReactElement {
  const { tokens } = useTokens(props.collection);

  const items = useMemo(() => {
    return tokens
      .map(token => (
        <div key={token.address}>
          {/* Token icon */}
          {/* TODO: \/ */}
          {/* Title top left */}
          {/* Price top right */}
          {/* Buy / sell / update bottom. Connect wallet if not connection */}
        </div>
      ));
  }, [tokens]);

  // TODO: list of the tokens
  // Token icon, name + price, <->, amount-symbol + usd value

  return (
    <>
      {/* total value of the whole collection (mcap) */}
      <div className="py-2 flex gap-4">
        {items}
      </div>
    </>
  );
}
