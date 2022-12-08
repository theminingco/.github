import { HandlerType, ICommand, CommandSchema } from "@theminingco/core";

export default class CommandHandler implements HandlerType<ICommand> {
    schema = CommandSchema;

    handler(_: ICommand) {
        //TODO: handle command
    }
}