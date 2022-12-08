import { JTDSchemaType } from "ajv/dist/jtd.js";

export interface ICommand {
    type: "command";
    command: string;
}

export const CommandSchema: JTDSchemaType<ICommand> = {
    properties: {
        type: { enum: ["command"] },
        command: { type: "string" }
    }
};