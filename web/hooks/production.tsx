import { useEffect, useRef } from "react";

export function useIsProduction(): boolean {
  const isProduction = useRef(true);

  useEffect(() => {
    isProduction.current = window.location.hostname === "theminingco.xyz";
  }, []);

  return isProduction.current;
}
