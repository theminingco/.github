import type { FirebaseApp } from "firebase/app";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import type { AppCheck } from "firebase/app-check";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from "react";
import { logEvent as logFirebaseEvent } from "firebase/analytics";
import { setUserProperties as setFirebaseProperty } from "firebase/analytics";
import { setUserId as setFirebaseUserId } from "firebase/analytics";
import { getFunctions, httpsCallable, HttpsCallable } from "firebase/functions";
import { getPerformance } from "firebase/performance";
import { getFirestore, DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, QueryFieldFilterConstraint, collection, query, getDocs } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyAZ5K_JvltwcyN9C-b7mrmI8xDCN4SM4Cw",
  authDomain: "theminingco-xyz.firebaseapp.com",
  projectId: "theminingco-xyz",
  storageBucket: "theminingco-xyz.appspot.com",
  messagingSenderId: "856146705486",
  appId: "1:856146705486:web:389f1ba0c455cc45e7d71f",
  measurementId: "G-3X6WSVZN46",
};

const appCheckSite = "6Ldd4-EpAAAAAP3nBdr7J0LT3baDmj5K7ttTxf-w";
const appCheckConfig = {
  provider: new ReCaptchaEnterpriseProvider(appCheckSite),
  isTokenAutoRefreshEnabled: true,
};

function converter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (model: T): DocumentData => model,
    fromFirestore: (snapshot: QueryDocumentSnapshot): T => snapshot.data() as T,
  };
}

interface UseFirebase {
  logEvent: (name: string, params?: Record<string, unknown>) => void;
  logError: (error: Error) => void;
  identify: (identifier: string) => void;
  setProperties: (properties: Record<string, unknown>) => void;
  getCallable: (name: string) => HttpsCallable;
  getDocuments: <T extends DocumentData>(table: string, filter?: QueryFieldFilterConstraint) => Promise<Array<T>>;
}

const Context = createContext<UseFirebase>({
  logEvent: () => { throw new Error("Not implemented"); },
  logError: () => { throw new Error("Not implemented"); },
  identify: () => { throw new Error("Not implemented"); },
  setProperties: () => { throw new Error("Not implemented"); },
  getCallable: () => { throw new Error("Not implemented"); },
  getDocuments: async () => Promise.reject(new Error("Not implemented")),
});

export function useFirebase(): UseFirebase {
  return useContext(Context);
}

export default function FirebaseProvider(props: PropsWithChildren): ReactElement {
  const [appCheck, setAppCheck] = useState<AppCheck>();

  const app = useMemo(() => {
    return initializeApp(firebaseConfig);
  }, []);

  const setupAppCheck = useCallback((firebaseApp: FirebaseApp) => {
    const check = initializeAppCheck(firebaseApp, appCheckConfig);
    setAppCheck(check);
  }, []);

  const logEvent = useCallback((name: string, params?: Record<string, unknown>): void => {
    const analytics = getAnalytics(app);
    logFirebaseEvent(analytics, name, params);
  }, [app]);

  const logError = useCallback((error: Error): void => {
    // TODO: log to firebase
    console.error(error);
  }, [logEvent]);

  const setProperties = useCallback((properties: Record<string, unknown>): void => {
    const analytics = getAnalytics(app);
    setFirebaseProperty(analytics, properties);
  }, [app]);

  const identify = useCallback((identifier: string): void => {
    const analytics = getAnalytics(app);
    setFirebaseUserId(analytics, identifier);
  }, [app]);

  const getCallable = useCallback((name: string) => {
    if (appCheck == null) { setupAppCheck(app); }
    const functions = getFunctions(app);
    return httpsCallable(functions, name, { limitedUseAppCheckTokens: true });
  }, [app, appCheck, setupAppCheck]);

  const getDocuments = useCallback(async <T extends DocumentData>(table: string, filter?: QueryFieldFilterConstraint) => {
    if (appCheck == null) { setupAppCheck(app); }
    const firestore = getFirestore(app);
    const c = collection(firestore, table).withConverter(converter<T>());
    const q = filter == null ? c : query(c, filter);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(x => x.data());
  }, [app, appCheck, setupAppCheck]);

  useEffect(() => {
    const _performance = getPerformance(app);
  }, [app]);

  useEffect(() => {
    const fauxWindow = self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean };
    fauxWindow.FIREBASE_APPCHECK_DEBUG_TOKEN = window.location.host.startsWith("localhost");
  }, []);

  const context = useMemo(() => {
    return { logEvent, logError, identify, setProperties, getCallable, getDocuments };
  }, [logEvent, logError, identify, setProperties, getCallable, getDocuments]);

  return <Context.Provider value={context}>{props.children}</Context.Provider>;
}
