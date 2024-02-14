#!/usr/bin/env node
import type { Choice } from "./utility/prompt";
import { promptChoice } from "./utility/prompt";
import { initialize } from "./utility/config";

type Handler = () => Promise<void>;

const handler = (file: string): Handler => {
  return async () => {
    const command = await import(file) as { default: Handler };
    await command.default();
  };
};

const subhandler = (subcommands: Array<Choice<Handler>>): Handler => {
  return async () => {
    const command = await promptChoice("Select a subinstruction to execute", subcommands);
    await command();
  };
};

const utilCommands: Array<Choice<Handler>> = [
  { title: "keypair", description: "Keypair utilities.", value: handler("./commands/keypair") }
];

const commands: Array<Choice<Handler>> = [
  { title: "create", description: "Create a ⛏ The Mining Company investment pool collection.", value: handler("./commands/create") },
  { title: "update", description: "Update the metadata of an existing ⛏ The Mining Company token.", value: handler("./commands/update") },
  { title: "remove", description: "Remove an existing ⛏ The Mining Company token from the collection.", value: handler("./commands/remove") },
  { title: "mint", description: "Remint an existing ⛏ The Mining Company token that has been burned.", value: handler("./commands/mint") },
  { title: "utilities", description: "Collection of utilities", value: subhandler(utilCommands) }
];

initialize()
  .then(async () => promptChoice("Select an instruction to execute", commands))
  .then(async command => command())
  .catch(console.error);
