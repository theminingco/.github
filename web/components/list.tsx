import type { ReactElement } from "react";
import React, { useMemo } from "react";
import { usePopup } from "../hooks/popup";
import dynamic from "next/dynamic";
import Spinner from "./spinner";
import { useItems } from "../hooks/items";
import Image from "next/image";
import Button from "./button";
import { shortAddress } from "@theminingco/core/lib/address";

const Details = dynamic(async () => import("./details"));

interface ListProps {
  owned?: boolean;
}

export default function List(props: ListProps): ReactElement {
  const { openPopup } = usePopup();
  const { items, loading } = useItems(props.owned ?? false);

  const cards = useMemo(() => {
    return items.map(x => (
      <Button
        key={x.address}
        onClick={() => openPopup(<Details item={x} />)}
        className="rounded"
      >
        {/* TODO styling */}
        <Image src={x.image} alt={x.name} width={100} height={100} />
        <div className="flex w-full justify-between">
          <div>{x.name}</div>
          <div>{x.price}</div>
        </div>
        <Button href={`https://solscan.io/account/${x.address}`}>
          {shortAddress(x.address)}
        </Button>
      </Button>
    ));
  }, [items]);

  return (
    <div className="flex flex-1">
      {loading ? <Spinner /> : cards}
    </div>
  );
}
