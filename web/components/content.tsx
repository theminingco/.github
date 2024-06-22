import type { ReactElement } from "react";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useIsGeoblocked } from "../hooks/geoblock";
import Button from "./button";
import clsx from "clsx";

const fallback = <div className="flex-1" />;
const List = dynamic(async () => import("./list"), { loading: () => fallback });
const Disabled = dynamic(async () => import("./disabled"), { loading: () => fallback });

const pages = ["pools", "portfolio"] as const;
type Page = typeof pages[number];

export default function Content(): ReactElement {
  const [selectedPage, setSelectedPage] = useState<Page>("pools");
  const isBlocked = useIsGeoblocked();

  const content = useMemo(() => {
    if (isBlocked) {
      return <Disabled />;
    }
    switch (selectedPage) {
      case "pools":
        return <List />;
      case "portfolio":
        return <List owned />;
    }
  }, [isBlocked, selectedPage]);

  const tabs = useMemo(() => {
    return pages.map(page => (
      <Button
        key={page}
        onClick={() => setSelectedPage(page)}
        className={selectedPage === page ? "font-medium" : "font-light"}
      >
        {page.slice(0, 1).toUpperCase() + page.slice(1)}
      </Button>
    ));
  }, [selectedPage]);

  return (
    <div className="flex flex-1 items-center justify-center w-screen">
      <div className="relative max-w-lg w-screen h-full grow flex flex-col items-center justify-center gap-4">
        <div className={clsx("flex gap-4 w-full px-4", isBlocked ? "hidden" : "")}>
          {tabs}
        </div>
        {content}
      </div>
    </div>
  );
}
