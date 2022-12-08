import { HandlerType, IPing, PingSchema } from "@theminingco/core";
import { heartbeat } from "../modules/socket.js";

export default class PingHandler implements HandlerType<IPing> {
    schema = PingSchema;

    handler() {
        heartbeat();
    }
}