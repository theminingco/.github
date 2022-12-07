import Ajv, { JTDSchemaType } from "ajv/dist/jtd.js";
import { nanoid } from "nanoid";
import { WebSocket, WebSocketServer} from "ws";

const ajv = new Ajv.default();

export interface Connection {
    ip: string;
    id: string;
}

export interface HandlerType<T> {
    schema: JTDSchemaType<T>;
    handler: (data: T, from: Connection) => void;
}

export const Handler = (handlers: Array<HandlerType<any>>) => {
    return (data: any, from: Connection) => {
        const json = typeof data === "string" ? JSON.parse(data) : data;
        for (const handler of handlers) {
            const validate = ajv.compile(handler.schema);
            if (!validate(json)) { continue; }
            handler.handler(json, from);
        }
    };
};

export class Server extends WebSocketServer<Socket> { }
export class Socket extends WebSocket {

    connect(handler: (data: any, from: Connection) => void, host: string) {
        const connection: Connection = { ip: host, id: nanoid() };
        this.on("open", () => handler({ type: "open" }, connection));
        this.on("message", (x) => handler(x.toString(), connection));
        this.on("close", () => handler({ type: "close" }, connection));
        this.on("error", () => handler({ type: "error" }, connection));
    }
}