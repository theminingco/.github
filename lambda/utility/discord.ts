import { discordWebhook } from "./secrets";

interface Webhook {
  readonly title: string;
  readonly description: string;
  readonly color: number;
  readonly fields: Record<string, string>;
  readonly block: Set<string> | Array<string>;
}

const sendWebhook = async (hook: Webhook): Promise<void> => {
  const webhookUrl = discordWebhook.value();
  const blockSet = new Set(hook.block);
  const fields = Object.entries(hook.fields).map(([name, value]) => ({ name, value, inline: !blockSet.has(name) }));
  const description = hook.description.startsWith("*") ? hook.description : `*${hook.description}*`;
  const data = JSON.stringify({
    embeds: [
      {
        title: hook.title,
        description,
        color: hook.color,
        fields
      }
    ]
  });

  if (webhookUrl === "") {
    console.warn("Discord webhook not set", { data });
  } else {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data
    });
  }
};

export const sendInfo = async (title: string, description: string, fields: Record<string, string> = { }, block: Array<string> = []): Promise<void> => {
  await sendWebhook({
    title,
    description,
    color: 0x2d55cc,
    fields,
    block
  });
};

export const sendWarning = async (title: string, description: string, fields: Record<string, string> = { }, block: Array<string> = []): Promise<void> => {
  await sendWebhook({
    title,
    description,
    color: 0xf99244,
    fields,
    block
  });
};

export const sendError = async (title: string, description: string, fields: Record<string, string> = { }, block: Array<string> = []): Promise<void> => {
  await sendWebhook({
    title,
    description,
    color: 0xff4041,
    fields,
    block
  });
};
