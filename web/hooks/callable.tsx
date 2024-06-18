import { useCallback, useMemo } from "react";
import { useFirebase } from "./firebase";

interface UpdateRequest {
  publicKey: string;
  tokenAddress: string;
  allocation: Map<string, string>;
}

interface SendRequest {
  transaction: string;
}

interface UpdateResponse {
  transaction: string;
}

interface SendResponse {
  signature: string;
}

interface UseCallable {
  update: (req: UpdateRequest) => Promise<UpdateResponse>;
  send: (req: SendRequest) => Promise<SendResponse>;
}

export function useCallable(): UseCallable {
  const { getCallable } = useFirebase();

  const update = useCallback(async (req: UpdateRequest) => {
    const fn = getCallable<UpdateRequest, UpdateResponse>("update");
    return fn(req).then(x => x.data);
  }, [getCallable]);

  const send = useCallback(async (req: SendRequest) => {
    const fn = getCallable<SendRequest, SendResponse>("send");
    return fn(req).then(x => x.data);
  }, [getCallable]);

  return useMemo(() => ({
    update,
    send,
  }), [update, send]);
}
