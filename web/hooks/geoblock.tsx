import { useMemo } from "react";
import { useContext } from "./context";


const blockedRegions = new Set([
  "us", "cf", "cd", "kp", "er", "ir", "iq", "lb", "ly", "ml",
  "so", "ss", "sd", "sy", "ye",
]);

export function useIsGeoblocked(): boolean {
  const { countryCode } = useContext();

  return useMemo(() => {
    const code = countryCode?.toLowerCase() ?? "";
    return blockedRegions.has(code);
  }, [countryCode]);
}
