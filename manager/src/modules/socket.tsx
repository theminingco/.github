import { nanoid } from "nanoid";
import { ObservableMap, Handler, Connection, Server, Socket } from "@theminingco/core";
import { useEffect, useState } from "react";
import { options } from "../app.js";
import InfoHandler from "../handlers/info.js";
import OpenHandler from "../handlers/open.js";
import CloseHandler from "../handlers/close.js";

const connections = new ObservableMap<Connection, WebSocket>();

export const useConnections = () => {
    const listenerKey = nanoid();
    const [items, setItems] = useState<Array<Connection>>([]);

    useEffect(() => {
        connections.register(listenerKey, () => {
            const newConnections = Array.from(connections.keys());
            setItems(newConnections);
        });

        return () => { connections.unregister(listenerKey); };
    }, []);

    return items;
};

const handler = Handler([
    new OpenHandler(),
    new CloseHandler(),
    new InfoHandler()
]);

export const openWebSocket = () => {
    const wss = new Server({
        port: options.port
    });

    wss.on("connection", (ws: Socket, req: any) => { 
        ws.connect(handler, req.socket.remoteAddress);
    });
};


