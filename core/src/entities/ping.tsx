import { JTDSchemaType } from "ajv/dist/jtd.js";

export interface IPing {
    type: "ping";
}

export const PingSchema: JTDSchemaType<IPing> = {
    properties: {
        type: { enum: ["ping"] }
    }
};