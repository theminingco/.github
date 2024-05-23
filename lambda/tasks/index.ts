import type { HttpsFunction } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import type { ScheduleFunction, ScheduledEvent } from "firebase-functions/v2/scheduler";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { secrets } from "../utility/secrets";
import { initializeConnection } from "../utility/solana";

const taskSpecs = [
  { file: "heartbeat", schedule: "*/5 * * * *" },
  { file: "reserves", schedule: "0 * * * *" },
  { file: "stats", schedule: "0 9 * * *" },
  { file: "meta", schedule: "4 0 * * *" },
  { file: "rebalance", schedule: "*/15 * * * *" },
];

type ScheduleHandler = () => Promise<void>;

export const tasks = taskSpecs
  .map(spec => {
    const handler = onSchedule({ schedule: spec.schedule, secrets }, async () => {
      await initializeConnection();
      const file = await import(`./${spec.file}`) as { default: ScheduleHandler };
      await file.default();
    });
    return [spec.file, handler] as [string, ScheduleFunction];
  }).reduce<Record<string, ScheduleFunction>>((a, b) => ({ ...a, [b[0]]: b[1] }), {});


export let trigger: HttpsFunction | null = null;
if (process.env.FUNCTIONS_EMULATOR === "true") {
  trigger = onRequest({ cors: true, secrets }, async (_, res) => {
    const event: ScheduledEvent = { scheduleTime: new Date().toISOString() };
    const promises = Object.values(tasks).map(async task => task.run(event));
    await Promise.all(promises);
    res.status(200).send("OK");
  });
}
