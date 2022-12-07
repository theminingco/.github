import { HandlerType, IOpen, OpenSchema, Connection } from "@theminingco/core";
import { setConnectionStatus } from "../modules/socket.js";

export default class OpenHandler implements HandlerType<IOpen> {
    schema = OpenSchema;

    handler(_: IOpen, _0: Connection) {
        setConnectionStatus("Waiting for instructions");

        //TODO: send miner info
    }
}