import type { HttpsOptions } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import type { Request, Response } from "express";
import { initializeConnection } from "../utility/solana";
import { secrets } from "../utility/secrets";

const opts: HttpsOptions = {
  cors: false,
  secrets,
};

const endpointSpec = [
  "price",
];

type EndpointHandler = (request: Request, response: Response) => Promise<void>;

export = endpointSpec
  .map(spec => {
    const handler = onRequest(opts, async (request, response) => {
      await initializeConnection();
      const file = await import(`./${spec}`) as { default: EndpointHandler };
      return file.default(request, response);
    });
    return [spec, handler] as [string, CallableFunction];
  }).reduce<Record<string, CallableFunction>>((a, b) => ({ ...a, [b[0]]: b[1] }), {});
