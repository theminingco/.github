import { HandlerType, IPong, PongSchema } from "@theminingco/core";
import { heartbeat } from "../modules/socket.js";

export default class PongHandler implements HandlerType<IPong> {
    schema = PongSchema;

    handler(_: IPong, connection: string) {
        heartbeat(connection);
    }
}