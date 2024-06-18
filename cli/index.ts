#!/usr/bin/env node
import type { Choice } from "./utility/prompt";
import { promptChoice } from "./utility/prompt";
import { initialize } from "./utility/config";

type Handler = () => Promise<void>;

function handler(file: string): Handler {
  return async () => {
    const command = await import(file) as { default: Handler };
    await command.default();
  };
}

function subhandler(subcommands: Choice<Handler>[]): Handler {
  return async () => {
    const command = await promptChoice("Select a subinstruction to execute", subcommands);
    await command();
  };
}

const utilCommands: Choice<Handler>[] = [
  { title: "address", description: "Address utilities.", value: handler("./commands/address") },
  { title: "signature", description: "Signature utilities.", value: handler("./commands/signature") },
  { title: "keypair", description: "Keypair utilities.", value: handler("./commands/keypair") },
];

const commands: Choice<Handler>[] = [
  { title: "create", description: "Create a ⛏ The Mining Company collection.", value: handler("./commands/create") },
  { title: "update", description: "Update the metadata of an existing ⛏ The Mining Company collection.", value: handler("./commands/update") },
  { title: "publish", description: "Publish a ⛏ The Mining Company collection.", value: handler("./commands/publish") },
  { title: "list", description: "List all ⛏ The Mining Company collections.", value: handler("./commands/list") },
  { title: "unpublish", description: "Unpublish a ⛏ The Mining Company collection.", value: handler("./commands/unpublish") },
  { title: "reset", description: "Reset the allocation of an existing ⛏ The Mining Company token.", value: handler("./commands/reset") },
  { title: "delete", description: "Delete an existing ⛏ The Mining Company collection.", value: handler("./commands/delete") },
  { title: "utilities", description: "Collection of utilities", value: subhandler(utilCommands) },
];

initialize()
  .then(async () => promptChoice("Select an instruction to execute", commands))
  .then(async command => command())
  .catch(console.error);
