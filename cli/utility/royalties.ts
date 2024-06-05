import { address } from "@solana/web3.js";
import { PluginAuthorityPair } from "@theminingco/metadata";

export function royaltiesPlugin(): PluginAuthorityPair {
  return {
    plugin: {
      __kind: "Royalties",
      fields: [{
        basisPoints: 100,
        creators: [{
          address: address("GKJ1EV89q9qXw42AiiivcNjbno1j3qfXh4BVk4iJVvA9"),
          percentage: 100
        }],
        ruleSet: {
          __kind: "None"
        }
      }]
    },
    authority: {
      __option: "Some",
      value: {
        __kind: "UpdateAuthority",
      }
    }
  }
}
