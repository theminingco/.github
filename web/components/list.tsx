import type { ReactElement } from "react";
import React, { useMemo } from "react";
import Spinner from "./spinner";
import { useItems } from "../hooks/items";
import Card from "./card";
import type { Page } from "../hooks/content";

interface ListProps {
  type?: Page;
}

export default function List(props: ListProps): ReactElement {
  const { items, loading } = useItems(props.type ?? "pools");

  const cards = useMemo(() => {
    return items.map(x => <Card key={x.address} item={x} />);
  }, [items]);

  const emptyTitle = useMemo(() => {
    return (
      <div className="absolute top-1/2 w-full -translate-y-1/2 text-center">
        {props.type === "portfolio"
          ? "You currently do not own any tokens."
          : "Failed loading pools. Please try again."}
      </div>
    );
  }, [props.type]);

  return (
    <div className="flex flex-1 flex-col w-full">
      <div className="mt-4 grid grid-cols-3 gap-2">
        {!loading ? cards : null}
        {!loading && items.length === 0 ? emptyTitle : null}
        {loading ? <Spinner className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" /> : null}
      </div>
    </div>
  );
}
