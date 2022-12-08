import { JTDSchemaType } from "ajv/dist/jtd.js";

export interface IClose {
    type: "close";
}

export const CloseSchema: JTDSchemaType<IClose> = {
    properties: {
        type: { enum: ["close"] }
    }
};