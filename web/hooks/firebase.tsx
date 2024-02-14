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
import type { HttpsCallableResult, HttpsCallable } from "firebase/functions";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getPerformance } from "firebase/performance";
import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, QueryFieldFilterConstraint } from "firebase/firestore";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-Dn62_MuHbc45yzak4S9ao3NXHw07HkY",
  authDomain: "theminingco.firebaseapp.com",
  projectId: "theminingco",
  storageBucket: "theminingco.appspot.com",
  messagingSenderId: "550370238764",
  appId: "1:550370238764:web:fa3937801fc783c7264c89",
  measurementId: "G-FNCKMNE7CB"
};

const appCheckSite = "6LdJmxcnAAAAAOgZe95n76VL2-uOSmdRNciewzdA";
const fauxWindow = self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean };
fauxWindow.FIREBASE_APPCHECK_DEBUG_TOKEN = window.location.host.startsWith("localhost");
const appCheckConfig = {
  provider: new ReCaptchaEnterpriseProvider(appCheckSite),
  isTokenAutoRefreshEnabled: true
};

const converter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
  toFirestore: (model: T): DocumentData => model,
  fromFirestore: (snapshot: QueryDocumentSnapshot): T => snapshot.data() as T
});

interface UseFirebase {
  logEvent: (name: string, params?: Record<string, unknown>) => void;
  identify: (identifier: string) => void;
  setProperties: (properties: Record<string, unknown>) => void;
  getCallable: (name: string) => HttpsCallable;
  getDocuments: <T extends DocumentData>(table: string, filter?: QueryFieldFilterConstraint) => Promise<Array<T>>;
}

const Context = createContext<UseFirebase>({
  logEvent: () => { /* Empty */ },
  identify: () => { /* Empty */ },
  setProperties: () => { /* Empty */ },
  getCallable: () => async (): Promise<HttpsCallableResult> => Promise.reject(new Error("Not implemented")),
  getDocuments: async () => Promise.reject(new Error("Not implemented"))
});

export const useFirebase = (): UseFirebase => {
  return useContext(Context);
};

const FirebaseProvider = (props: PropsWithChildren): ReactElement => {
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
    const callableFunction = httpsCallable(functions, name, { limitedUseAppCheckTokens: true });
    return callableFunction;
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

  const context = useMemo(() => {
    return { logEvent, identify, setProperties, getCallable, getDocuments };
  }, [logEvent, identify, setProperties, getCallable, getDocuments]);

  return <Context.Provider value={context}>{props.children}</Context.Provider>;
};

export default FirebaseProvider;
