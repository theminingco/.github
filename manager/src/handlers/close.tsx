import { HandlerType, IClose, CloseSchema } from "@theminingco/core";
import { dropConnection } from "../modules/socket.js";

export default class CloseHandler implements HandlerType<IClose> {
    schema = CloseSchema;

    handler(_: IClose, connection: string) {
        dropConnection(connection);
    }
}