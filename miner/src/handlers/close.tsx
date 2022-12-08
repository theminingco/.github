import { HandlerType, IClose, CloseSchema, timer } from "@theminingco/core";
import { options } from "../app.js";
import { connectToSocket, setConnectionStatus } from "../modules/socket.js";

export default class CloseHandler implements HandlerType<IClose> {
    schema = CloseSchema;

    handler() {
        setConnectionStatus("Connecting");
        const retryDelay = options.debug ? 3 : 30;
        timer(connectToSocket, retryDelay);
    }
}