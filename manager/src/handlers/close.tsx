import { HandlerType, IClose, CloseSchema, Connection } from "@theminingco/core";

export default class CloseHandler implements HandlerType<IClose> {
    schema = CloseSchema;

    handler(_: IClose, _0: Connection) {
        //TODO: drop connection
    }
}