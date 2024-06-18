import { useEffect, useState } from "react";

export function useIsProduction(): boolean {
  const [isProduction, setIsProduction] = useState(true);

  useEffect(() => {
    setIsProduction(window.location.hostname === "theminingco.xyz");
  }, [])

  return isProduction;
}
