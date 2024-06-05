import { Rpc, SolanaRpcApi, createDefaultRpcTransport, createSolanaRpcFromTransport } from "@solana/web3.js";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useMemo } from "react";

const fallbackUrl = "https://api.devnet.solana.com";

export interface UseRpc {
  readonly rpc: Rpc<SolanaRpcApi>;
}

export const RpcContext = createContext<UseRpc>({
  rpc: createSolanaRpcFromTransport(
    createDefaultRpcTransport({ url: fallbackUrl })
  ),
});

export function useRpc(): UseRpc {
  return useContext(RpcContext);
}

export default function RpcProvider(props: PropsWithChildren): ReactElement {
  const rpcUrl = useMemo(() => {
    if (!Object.hasOwn(global, "document")) { return fallbackUrl; }
    if (document == null) { return fallbackUrl; }
    const tag = document.querySelector("meta[property='rpc-url']");
    if (tag == null) { return fallbackUrl; }
    return tag.getAttribute("content") ?? fallbackUrl;
  }, []);

  const context = useMemo(() => {
    const transport = createDefaultRpcTransport({ url: rpcUrl });
    return {
      rpc: createSolanaRpcFromTransport(transport)
    };
  }, [rpcUrl]);

  return <RpcContext.Provider value={context}>{props.children}</RpcContext.Provider>;
}
