import { useEffect, useState } from "react";
import { timer, Handler, connect } from "@theminingco/core";
import { options } from "../app.js";
import CommandHandler from "../handlers/command.js";
import OpenHandler from "../handlers/open.js";
import CloseHandler from "../handlers/close.js";
import { WebSocket } from "ws";
import PingHandler from "../handlers/ping.js";

let connectionStatus = "Connecting";
let timeoutCancellable: () => void;
let socket: WebSocket;

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

export const send = (message: any) => {
    const json = JSON.stringify(message);
    socket?.send(json);
};

export const heartbeat = () => {
    if (timeoutCancellable != null) { timeoutCancellable(); }
    timeoutCancellable = timer(() => connectToSocket(), 35);
};

const handler = Handler([
    new OpenHandler(),
    new CloseHandler(),
    new PingHandler(),
    new CommandHandler()
]);

export const connectToSocket = () => {
    socket?.terminate();
    socket = new WebSocket(options.manager);
    connect(socket, handler);
};