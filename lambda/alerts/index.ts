import type { MessagePublishedData } from "firebase-functions/v2/pubsub";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { secrets } from "../utility/secrets";
import { initializeConnection } from "../utility/solana";
import type { CloudEvent, CloudFunction } from "firebase-functions/lib/v2/core";

type AlertEvent = CloudEvent<MessagePublishedData<unknown>>;
type AlertHandler = (request: AlertEvent) => Promise<unknown>;
type AlertFunction = CloudFunction<AlertEvent>;

const alertsSpec = [
  { file: "uptime", topic: "uptime-alert" }
];

export const alerts = alertsSpec
  .map(spec => {
    const handler = onMessagePublished({ topic: spec.topic, secrets }, async event => {
      await initializeConnection();
      const file = await import(`./${spec.file}`) as { default: AlertHandler };
      await file.default(event);
    });
    return [spec.file, handler] as [string, AlertFunction];
  }).reduce<Record<string, AlertFunction>>((a, b) => ({ ...a, [b[0]]: b[1] }), {});
