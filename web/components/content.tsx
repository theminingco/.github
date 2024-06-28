import type { ReactElement } from "react";
import React, { useMemo} from "react";
import Button from "./button";
import clsx from "clsx";
import { pages, useContent } from "../hooks/content";
import dynamic from "next/dynamic";
import { useIsGeoblocked } from "../hooks/geoblock";

const fallback = <div className="flex-1" />;
const List = dynamic(async () => import("../components/list"), { loading: () => fallback });
const Disabled = dynamic(async () => import("../components/disabled"), { loading: () => fallback });

export default function Content(): ReactElement {
  const { selectedPage, setSelectedPage } = useContent();
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
    return fallback;
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
  }, [selectedPage, setSelectedPage]);

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
