import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { connection, signer, usdcAccount, usdcAmount, usdcMint } from "./config";
import type { JupiterLoadParams, RouteInfo } from "@jup-ag/core";
import { Jupiter } from "@jup-ag/core";
import JSBI from "jsbi";

interface IUserProvider {
    balance: number;
    trades: Array<RouteInfo>;
}

const Context = createContext<IUserProvider>({
    balance: NaN,
    trades: []
});

export const useProvider = (): IUserProvider => {
    return useContext(Context);
};

export const Provider = (props: PropsWithChildren): ReactElement => {
    const [balance, setBalance] = useState(NaN);
    const [jupiter, setJupiter] = useState<Jupiter | null>(null);
    const [trades, setTrades] = useState(new Array<RouteInfo>());

    const reloadBalance = useCallback(() => {
        connection.getTokenAccountBalance(usdcAccount)
            .then(info => {
                setBalance(info.value.uiAmount ?? NaN);
            }).catch(() => { /* Empty */ });
    }, []);

    const reloadBestRoute = useCallback(() => {
        if (jupiter == null) { return; }
        jupiter.computeRoutes({
            inputMint: usdcMint,
            outputMint: usdcMint,
            amount: JSBI.BigInt(usdcAmount),
            slippageBps: 100, // 1%
            forceFetch: true
        })
            .then(routes => routes.routesInfos[0])
            .then(best => setTrades(current => current.concat([best])))
            .catch(() => { /* Empty */ });
    }, [jupiter]);

    useEffect(() => {
        reloadBalance();
    }, []);

    useEffect(() => {
        if (jupiter == null) { return () => { /* Empty */ }; }
        reloadBestRoute();
        const id = setInterval(reloadBestRoute, 5000);
        return () => { clearInterval(id); };
    }, [jupiter]);

    useEffect(() => {
        const config: JupiterLoadParams = {
            connection,
            cluster: "mainnet-beta",
            user: signer.publicKey
        };
        Jupiter.load(config)
            .then(setJupiter)
            .catch(() => { /* Empty */ });
    }, []);

    const context = useMemo(() => {
        return { balance, trades };
    }, [balance, trades]);

    return <Context.Provider value={context}>{props.children}</Context.Provider>;
};
