import { type Token, type Pool, getMultipleTokenAccounts, isTokenOwner } from "@theminingco/core";
import { PublicKey } from "@solana/web3.js";
import type { ReactElement, PropsWithChildren } from "react";
import React, { useContext, createContext, useMemo, useEffect, useState, useCallback } from "react";
import { useFirebase } from "./firebase";
import { where } from "firebase/firestore";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

interface UseTokens {
  readonly collections: Array<Pool>;
  getTokens: (collection: PublicKey | string) => Promise<Array<Token>>;
}

const Context = createContext<UseTokens>({
  collections: [],
  getTokens: async () => Promise.reject(new Error("Not implemented"))
});

export const useTokens = (): UseTokens => {
  return useContext(Context);
};

const TokensProvider = (props: PropsWithChildren): ReactElement => {
  const { getDocuments } = useFirebase();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [collections, setCollections] = useState<Array<Pool>>([]);

  const getTokens = useCallback(async (collection: PublicKey | string): Promise<Array<Token>> => {
    const address = typeof collection === "string" ? new PublicKey(collection) : collection;
    const tokens = await getDocuments<Token>("tokens", where("collection", "==", address));
    if (publicKey == null) { return tokens.filter(x => x.isAvailable); }
    const mintAddresses = tokens.map(token => new PublicKey(token.address));
    const tokenAccounts = await getMultipleTokenAccounts(connection, mintAddresses, publicKey);
    return tokens.filter((x, i) => x.isAvailable || isTokenOwner(tokenAccounts[i]));
  }, [getDocuments, publicKey, connection]);

  useEffect(() => {
    getDocuments("pools")
      .then(docs => docs as unknown as Array<Pool>)
      .then(setCollections)
      .catch(() => { /* Empty */ });
  }, [getDocuments, setCollections]);

  const context = useMemo(() => {
    return { collections, getTokens };
  }, [collections, getTokens]);

  return <Context.Provider value={context}>{props.children}</Context.Provider>;
};

export default TokensProvider;
