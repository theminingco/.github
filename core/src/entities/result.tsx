import { JTDSchemaType } from "ajv/dist/jtd.js";

export enum ResultState {
    out = 1,
    err = 2,
    code = 3
}

export interface IResult {
    type: "result";
    command: string;
    state: ResultState;
    data: string;
}

export const ResultSchema: JTDSchemaType<IResult> = {
    properties: {
        type: { enum: ["result"] },
        command: { type: "string" },
        state: { type: "uint8" },
        data: { type: "string" }
    }
};