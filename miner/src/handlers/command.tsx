import { HandlerType, ICommand, CommandSchema, Queue, IResult, ResultState } from "@theminingco/core";
import { send, setConnectionStatus } from "../modules/socket.js";
import { spawn } from "child_process";

export default class CommandHandler implements HandlerType<ICommand> {
    schema = CommandSchema;

    queue = new Queue<string>();

    handler(command: ICommand) {
        setConnectionStatus("Responding to command");

        const isExecuting = this.queue.isEmpty();
        this.queue.push(command.command);

        if (!isExecuting) {
            this.handleNext();
        }
    }

    private handleNext() {
        const next = this.queue.pop() ?? "";
        const stream = spawn(next);
        stream.stdout.on("data", (chunk: any) => {
            const message: IResult = {
                type: "result",
                command: next,
                state: ResultState.out,
                data: `${chunk}`
            };
            send(message);
        });

        stream.stderr.on("data", (chunk: any) => {
            const message: IResult = {
                type: "result",
                command: next,
                state: ResultState.err,
                data: `${chunk}`
            };
            send(message);
        });

        stream.on("close", (chunk: any) => {
            const message: IResult = {
                type: "result",
                command: next,
                state: ResultState.code,
                data: `${chunk}`
            };
            send(message);
            if (this.queue.isEmpty()) {
                setConnectionStatus("Waiting for instructions");
            } else {
                this.handleNext();
            }
        });
    }
}