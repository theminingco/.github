import type { ReactElement } from "react";
import { useMemo } from "react";
import type { Item } from "../hooks/items";
import Button from "./button";
import Image from "next/image";
import { usePopup } from "../hooks/popup";
import dynamic from "next/dynamic";
import { formatLargeNumber } from "@theminingco/core/lib/string";

const Details = dynamic(async () => import("./details"));

interface CardProps {
  readonly item: Item;
}

export default function Card(props: CardProps): ReactElement {
  const { openPopup } = usePopup();

  const title = useMemo(() => {
    if ("pool" in props.item) {
      return props.item.pool.name;
    }
    return props.item.name;
  }, [props.item]);

  const subtitle = useMemo(() => {
    if ("supply" in props.item) {
      return `${props.item.tokens.length}/${props.item.supply}`;
    }
    return props.item.name;
  }, [props.item]);

  const amount = useMemo(() => {
    if ("pool" in props.item) {
      return formatLargeNumber(props.item.pool.price);
    }
    return formatLargeNumber(props.item.price * props.item.supply);
  }, [props.item]);

  return (
    <Button
      key={props.item.address}
      onClick={() => openPopup(<Details item={props.item} />)}
      className="rounded bg-slate-800 p-2"
    >
      <Image className="rounded" src={props.item.image} alt={props.item.name} width={256} height={256} />
      <div className="flex justify-between px-1">
        <span>{title}</span>
        <span className="text-slate-400">{subtitle}</span>
      </div>
      <div>◎{amount}</div>
    </Button>
  );
}
