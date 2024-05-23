import type { ReactElement } from "react";
import React, { useMemo } from "react";
import { useCollections } from "../hooks/collections";

export default function List(): ReactElement {
  const { collections } = useCollections();

  const cards = useMemo(() => {
    return collections.map(x => (
      <div key={x.address}>
        {/* Cards with collections */}
        {/* Image */}
        {/* Title + price */}
        {/* APY percentage */}
        {/* Owned / available / total */}
      </div>
    ));
  }, [collections]);

  return (
    <div className="">
      {cards}
    </div>
  );
}
