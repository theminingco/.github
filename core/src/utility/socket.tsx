import Ajv, { JTDSchemaType } from "ajv/dist/jtd.js";
import { nanoid } from "nanoid";
import WebSocket from "ws";

const ajv = new Ajv.default();

export interface HandlerType<T> {
    schema: JTDSchemaType<T>;
    handler: (data: T, from: string) => void;
}

export const Handler = (handlers: Array<HandlerType<any>>) => {
    return (data: any, from: string) => {
        const json = typeof data === "string" ? JSON.parse(data) : data;
        for (const handler of handlers) {
            const validate = ajv.compile(handler.schema);
            if (!validate(json)) { continue; }
            handler.handler(json, from);
        }
    };
};


export const connect = (socket: WebSocket, handler: (data: any, from: string) => void) => {
    const id = nanoid();
    const handle = (data: any) => handler(data, id);
    socket.on("open", () => handle({ type: "open" }));
    socket.on("ping", () => handle({ type: "ping" }));
    socket.on("pong", () => handle({ type: "pong" }));
    socket.on("message", (x) => handle(x.toString()));
    socket.on("close", () => handle({ type: "close" }));
    socket.on("error", () => handle({ type: "error" }));
    return id;
};