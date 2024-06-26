import type { CallableOptions, CallableRequest } from "firebase-functions/v2/https";
import { onCall } from "firebase-functions/v2/https";
import { secrets } from "../utility/secrets";
import { initializeConnection } from "../utility/solana";

const config: CallableOptions = {
  cors: true,
  secrets,
  enforceAppCheck: true,
  consumeAppCheckToken: true,
  invoker: "public",
};

const callableSpec = [
  "update",
  "send",
];

type CallableHandler = (request: CallableRequest) => Promise<unknown>;

export = callableSpec
  .map(spec => {
    const handler = onCall(config, async request => {
      await initializeConnection();
      const file = await import(`./${spec}`) as { default: CallableHandler };
      return file.default(request);
    });
    return [spec, handler] as [string, CallableFunction];
  }).reduce<Record<string, CallableFunction>>((a, b) => ({ ...a, [b[0]]: b[1] }), {});

