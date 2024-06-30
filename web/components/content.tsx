import type { ReactElement } from "react";
import React, { useMemo } from "react";
import Button from "./button";
import clsx from "clsx";
import { pages, useContent } from "../hooks/content";
import dynamic from "next/dynamic";
import { useIsGeoblocked } from "../hooks/geoblock";
import { formatLargeNumber } from "@theminingco/core/lib/string";
import { useTotalLockedValue } from "../hooks/value";
import Skeleton from "./skeleton";

const fallback = <div className="flex-1" />;
const List = dynamic(async () => import("../components/list"), { loading: () => fallback });
const Disabled = dynamic(async () => import("../components/disabled"), { loading: () => fallback });

export default function Content(): ReactElement {
  const { selectedPage, setSelectedPage } = useContent();
  const { tvl, loading } = useTotalLockedValue(selectedPage);
  const isBlocked = useIsGeoblocked();

  const content = useMemo(() => {
    if (isBlocked) {
      return <Disabled />;
    }
    if (selectedPage == null) {
      return fallback;
    }
    return <List type={selectedPage} />;
  }, [isBlocked, selectedPage]);

  const tabs = useMemo(() => {
    return pages.map(page => (
      <Button
        key={page}
        onClick={() => setSelectedPage(page)}
        className={clsx("text-xl", selectedPage === page ? "font-medium" : "font-light")}
      >
        {page.slice(0, 1).toUpperCase() + page.slice(1)}
      </Button>
    ));
  }, [selectedPage, setSelectedPage]);

  const tvlTitle = useMemo(() => {
    return selectedPage === "portfolio" ?? false
      ? "Total Portfolio Value"
      : "Total Value Locked";
  }, [selectedPage]);

  return (
    <div className="flex flex-1 items-center justify-center w-screen">
      <div className="relative max-w-lg w-screen h-full grow flex flex-col items-center justify-center gap-4">
        <div className={clsx("flex gap-4 w-full px-4 items-center", isBlocked ? "hidden" : "")}>
          {tabs}
          <div className="grow" />
          <div className="flex flex-col items-end">
            {loading
              ? <Skeleton className="w-24 h-9" />
              : <div className="text-3xl text-right">◎{formatLargeNumber(tvl)}</div>}
            <div className="text-sm text-right">{tvlTitle}</div>
          </div>
        </div>
        {content}
      </div>
    </div>
  );
}
