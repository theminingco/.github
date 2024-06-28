import { useCallback, useEffect, useMemo, useState } from "react";

export const pages = ["pools", "portfolio"] as const;
export type Page = typeof pages[number];
export const defaultPage: Page = "pools";

function readPageFromHash(): Page {
  for (const page of pages) {
    if (window.location.hash === `#${page}`) {
      return page;
    }
  }
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(null, "", url.toString());
  return defaultPage;
}

function writePageToHash(page: Page): void {
  let hash = "";
  if (page !== defaultPage) {
    hash = `#${page}`;
  }
  const url = new URL(window.location.href);
  url.hash = hash;
  window.history.pushState(null, "", url.toString());
}

interface UseContent {
  readonly selectedPage: Page | undefined;
  readonly setSelectedPage: (page: Page) => void;
}

export function useContent(): UseContent {
  const [selectedPage, setPage] = useState<Page>();

  useEffect(() => {
    const onHashChange = (): void => setPage(readPageFromHash());
    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setSelectedPage = useCallback((page: Page) => {
    writePageToHash(page);
    setPage(page);
  }, []);

  return useMemo(() => ({ selectedPage, setSelectedPage }), [selectedPage, setSelectedPage]);
}
