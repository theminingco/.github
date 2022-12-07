import { JTDSchemaType } from "ajv/dist/jtd.js";

export interface IMinerInfo {
    type: "info";
    host: string;
}

export const MinerInfoSchema: JTDSchemaType<IMinerInfo> = {
    properties: {
        type: { enum: ["info"] },
        host: { type: "string" }
    }
};