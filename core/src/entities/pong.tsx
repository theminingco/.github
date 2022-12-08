import { JTDSchemaType } from "ajv/dist/jtd.js";

export interface IPong {
    type: "pong";
}

export const PongSchema: JTDSchemaType<IPong> = {
    properties: {
        type: { enum: ["pong"] }
    }
};