import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";
import { address } from "@solana/web3.js";
import type { PluginAuthorityPair } from "@theminingco/metadata";

export function royaltiesPlugin(config?: { released?: boolean }): PluginAuthorityPair {
  const isReleased = config?.released ?? false;
  return {
    plugin: {
      __kind: "Royalties",
      fields: [{
        basisPoints: 100,
        creators: [{
          address: address("GKJ1EV89q9qXw42AiiivcNjbno1j3qfXh4BVk4iJVvA9"),
          percentage: 100,
        }],
        ruleSet: {
          __kind: isReleased ? "ProgramDenyList" : "ProgramAllowList",
          fields: [isReleased ? [] : [SYSTEM_PROGRAM_ADDRESS]],
        },
      }],
    },
    authority: {
      __option: "Some",
      value: {
        __kind: "UpdateAuthority",
      },
    },
  };
}
