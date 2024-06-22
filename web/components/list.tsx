import type { ReactElement } from "react";
import React, { useMemo } from "react";
import Spinner from "./spinner";
import { useItems } from "../hooks/items";
import Card from "./card";
import { formatLargeNumber } from "@theminingco/core/lib/string";

interface ListProps {
  owned?: boolean;
}

export default function List(props: ListProps): ReactElement {
  const { items, loading } = useItems(props.owned ?? false);

  const cards = useMemo(() => {
    return items.map(x => <Card key={x.address} item={x} />);
  }, [items]);

  const tvl = useMemo(() => {
    return formatLargeNumber(
      items
        .map(x => "pool" in x ? x.pool.price : x.price * x.supply)
        .reduce((acc, x) => acc + x, 0),
    );
  }, [items]);

  const tvlTitle = useMemo(() => {
    return props.owned ?? false
      ? "Total Portfolio Value"
      : "Total Value Locked";
  }, [props.owned]);

  const emptyTitle = useMemo(() => {
    return (
      <div className="absolute top-1/2 w-full -translate-y-1/2 text-center">
        {props.owned ?? false
          ? "You currently do not own any tokens."
          : "Failed loading pools. Please try again."}
      </div>
    );
  }, [props.owned]);

  return (
    <div className="flex flex-1 gap-4 flex-col w-full">
      <div className="text-xl text-center">{tvlTitle}: ◎{tvl}</div>
      <div className="grid grid-cols-3 gap-2">
        {!loading ? cards : null}
        {!loading && items.length === 0 ? emptyTitle : null}
        {loading ? <Spinner className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" /> : null}
      </div>
    </div>
  );
}
