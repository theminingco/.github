import type { ScheduleFunction } from "firebase-functions/v2/scheduler";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { secrets } from "../utility/secrets";
import { initializeConnection } from "../utility/solana";

const taskSpecs = [
  { file: "heartbeat", schedule: "*/5 * * * *" },
  { file: "reserves", schedule: "0 * * * *" },
  { file: "stats", schedule: "0 9 * * *" },
  { file: "cache", schedule: "0 0 * * *" },
  { file: "rebalance", schedule: "*/15 * * * *" },
];

type ScheduleHandler = () => Promise<void>;

export = taskSpecs
  .map(spec => {
    const handler = onSchedule({ schedule: spec.schedule, secrets }, async () => {
      console.info(`Running task ${spec.file}`);
      await initializeConnection();
      const file = await import(`./${spec.file}`) as { default: ScheduleHandler };
      await file.default();
      console.info(`Task ${spec.file} complete`);
    });
    return [spec.file, handler] as [string, ScheduleFunction];
  }).reduce<Record<string, ScheduleFunction>>((a, b) => ({ ...a, [b[0]]: b[1] }), {});
