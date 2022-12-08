import { HandlerType, IMinerInfo, IOpen, OpenSchema } from "@theminingco/core";
import { hostname } from "os";
import { heartbeat, send, setConnectionStatus } from "../modules/socket.js";

export default class OpenHandler implements HandlerType<IOpen> {
    schema = OpenSchema;

    handler() {
        setConnectionStatus("Waiting for instructions");
        const data: IMinerInfo = { type: "info", host: hostname() };
        send(data);
        heartbeat();
    }
}