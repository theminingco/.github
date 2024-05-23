import type { CloudEvent } from "firebase-functions/lib/v2/core";
import { sendError } from "../utility/discord";
import type { MessagePublishedData } from "firebase-functions/v2/pubsub";

export default async function uptimeAlert(event: CloudEvent<MessagePublishedData<unknown>>): Promise<void> {
  const data = event.data.message.json as { site: string, region: string };
  await sendError(`${data.site} uptime`, `${data.site} might be down or unreachable (${data.region})`);
}
