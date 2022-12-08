import { HandlerType, IClose, CloseSchema, Connection } from "@theminingco/core";
import { dropConnection } from "../modules/socket.js";

export default class CloseHandler implements HandlerType<IClose> {
    schema = CloseSchema;

    handler(_: IClose, connection: Connection) {
        dropConnection(connection);
    }
}