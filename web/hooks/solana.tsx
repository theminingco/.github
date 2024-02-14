import type { PropsWithChildren, ReactElement } from "react";
import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";

const SolanaProvider = (props: PropsWithChildren): ReactElement => {
  const endpoint = useMemo(() => {
    return "https://solana-mainnet.g.alchemy.com/v2/cEI9IVd9_paAuyKLsU_zN4UdM-ASnyhq";
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        {props.children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaProvider;
