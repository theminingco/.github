import { HandlerType, IPong, PongSchema, Connection } from "@theminingco/core";
import { heartbeat } from "../modules/socket.js";

export default class PongHandler implements HandlerType<IPong> {
    schema = PongSchema;

    handler(_: IPong, connection: Connection) {
        heartbeat(connection);
    }
}