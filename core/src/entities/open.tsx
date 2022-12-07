import { JTDSchemaType } from "ajv/dist/jtd.js";

export interface IOpen {
    type: "open";
}

export const OpenSchema: JTDSchemaType<IOpen> = {
    properties: {
        type: { enum: ["open"] }
    }
};