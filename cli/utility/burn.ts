import type { PluginAuthorityPair } from "@theminingco/metadata";

export function burnPlugin(): PluginAuthorityPair {
  return {
    plugin: {
      __kind: "PermanentBurnDelegate",
      fields: [{}],
    },
    authority: {
      __option: "Some",
      value: {
        __kind: "UpdateAuthority",
      },
    },
  };
}
