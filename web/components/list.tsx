import type { ReactElement } from "react";
import React, { useMemo } from "react";
import { useItems } from "../hooks/items";
import Card from "./card";
import type { Page } from "../hooks/content";
import { interval } from "@theminingco/core/lib/array";
import Skeleton from "./skeleton";
import clsx from "clsx";

interface ListProps {
  type?: Page;
}

export default function List(props: ListProps): ReactElement {
  const { items, loading } = useItems(props.type ?? "pools");

  const cards = useMemo(() => {
    if (loading) {
      return interval(24).map(x => <Skeleton key={x} className="h-52" />);
    }
    return items.map(x => <Card key={x.address} item={x} />);
  }, [items]);

  const emptyTitle = useMemo(() => {
    return (
      <div className="absolute top-1/2 w-full -translate-y-1/2 text-center">
        {props.type === "portfolio"
          ? "You currently do not own any tokens." // FIXME: <- link to ME and Tensor?
          : "Failed loading pools. Refresh the page to try again."}
      </div>
    );
  }, [props.type]);

  return (
    <div className={clsx("flex flex-auto flex-col w-full h-0", loading ? "overflow-hidden" : "overflow-auto")}>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {cards.length === 0 ? emptyTitle : cards}
      </div>
    </div>
  );
}
