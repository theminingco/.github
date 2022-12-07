import { useEffect, useState } from "react";
import { timer, Handler, Socket } from "@theminingco/core";
import { options } from "../app.js";
import CommandHandler from "../handlers/command.js";
import OpenHandler from "../handlers/open.js";
import CloseHandler from "../handlers/close.js";

let connectionStatus = "Connecting";

export const useConnectionStatus = () => {
    const [connected, setConnected] = useState(connectionStatus);

    useEffect(() => {
        let index = 0;
        timer(() => {
            const prefix = "".padEnd(3);
            const suffix = "".padEnd(index, ".").padEnd(3);
            setConnected(`${prefix}${connectionStatus}${suffix}`);
            index = index == 3 ? 0 : index + 1;
        }, 1, 0);
    }, []);

    return connected;
};

export const setConnectionStatus = (status: string) => {
    connectionStatus = status;
};

const handler = Handler([
    new OpenHandler(),
    new CloseHandler(),
    new CommandHandler()
]);

export const connectToSocket = () => {
    const ws = new Socket(options.manager);
    ws.connect(handler, options.manager);
};