import { HandlerType, ICommand, CommandSchema, Connection } from "@theminingco/core";

export default class CommandHandler implements HandlerType<ICommand> {
    schema = CommandSchema;

    handler(_: ICommand, _0: Connection) {
        //TODO: handle command
    }
}