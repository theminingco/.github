import { JTDSchemaType } from "ajv/dist/jtd.js";

export interface IError {
    type: "error";
}

export const ErrorSchema: JTDSchemaType<IError> = {
    properties: {
        type: { enum: ["error"] }
    }
};