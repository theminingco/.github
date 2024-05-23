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
  const transport = useMemo(() => {
    // TODO: dynamic?
    return createDefaultRpcTransport({ url: "https://solana-mainnet.g.alchemy.com/v2/cEI9IVd9_paAuyKLsU_zN4UdM-ASnyhq" });
  }, []);

  const rpc = useMemo(() => {
    return createSolanaRpcFromTransport(transport);
  }, [transport]);

  const context = useMemo(() => ({
    rpc,
  }), [rpc]);

  return <RpcContext.Provider value={context}>{props.children}</RpcContext.Provider>;
}
