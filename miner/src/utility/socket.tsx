import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import WebSocket from "ws";
import Observable from "./observable.js";

const connectionStatus = new Observable("Connecting");

export const useConnectionStatus = () => {
    const listenerKey = nanoid();
    const [connected, setConnected] = useState(connectionStatus.get());

    useEffect(() => {
        connectionStatus.register(listenerKey, () => {
            setConnected(connectionStatus.get());
        });

        return () => { connectionStatus.unregister(listenerKey); };
    });

    return connected;
};

export const connectToSocket = (url: string) => {
    const ws = new WebSocket(url);

    ws.on("open", () => {
        ws.send("{ \"miner\": \"info\" }");
    });
      
    ws.on("message", () => {

    });

    ws.on("close", () => {
        connectionStatus.set("Closed");
        // retry
    });

    ws.on("error", () => {
        connectionStatus.set("Failed");
        //retry
    });

    connectionStatus.set("Connected");
};

