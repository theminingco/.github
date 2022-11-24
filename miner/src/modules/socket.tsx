import { useEffect, useState } from "react";
import WebSocket from "ws";
import { timer } from "@theminingco/core";
import { options } from "../app.js";

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

export const connectToSocket = () => {
    const ws = new WebSocket(options.manager);

    ws.on("open", () => {
        connectionStatus = "Waiting for instructions";
        ws.send("{ \"miner\": \"info\" }");
    });
      
    ws.on("message", () => {

    });

    ws.on("close", () => {
        connectionStatus = "Connecting";
        const retryDelay = options.debug ? 3 : 30;
        timer(connectToSocket, retryDelay);
    });

    ws.on("error", () => { });
};