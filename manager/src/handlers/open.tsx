import { HandlerType, IOpen, OpenSchema, Connection } from "@theminingco/core";

export default class OpenHandler implements HandlerType<IOpen> {
    schema = OpenSchema;

    handler(_: IOpen, _0: Connection) {
        //TODO: add connection
    }
}