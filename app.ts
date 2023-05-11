import { exit } from "./utility/exit.js";
import { promptChoice } from "./utility/prompt.js";

process.on("SIGINT", () => exit(2));
process.on("SIGQUIT", () => exit(3));
process.on("SIGTERM", () => exit(4));

const commands = [
    { title: "upload", description: "Upload token metadata", value: async (): Promise<unknown> => import("./commands/upload.js") },
    { title: "token", description: "Create an spl token", value: async (): Promise<unknown> => import("./commands/token.js") }
];

const command = await promptChoice("Select a command to execute", commands);
await command();
exit(0);
