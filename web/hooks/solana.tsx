import type { PropsWithChildren, ReactElement } from "react";
import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";

const SolanaProvider = (props: PropsWithChildren): ReactElement => {
  const endpoint = useMemo(() => {
    return "https://solana-mainnet.g.alchemy.com/v2/cEI9IVd9_paAuyKLsU_zN4UdM-ASnyhq";
  }, []);

  const wallets = useMemo(() => {
    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {props.children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaProvider;
