import WebSocket, { WebSocketServer } from "ws";
import { nanoid } from "nanoid";
import { ObservableMap } from "core";
import PingController from "../controllers/ping.js";
import Controller from "../model/controller.js";
import Request from "../model/request.js";
import Connection from "../model/connection.js";
import { useEffect, useState } from "react";
import { options } from "../app.js";

const controllers: Array<Controller> = [
    new PingController()
];

const handler = (req: Request, index?: number) => {
    const i = index ?? 0;
    if (i >= controllers.length) { return; } 
    controllers[i].handle(req, () => handler(req, i + 1));
};

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
    });

    return items;
};

export const openWebSocket = () => {
    const app = new WebSocketServer({
        port: parseInt(options.port)
    });

    app.on("connection", (ws: WebSocket, req: any) => { 
        const connection: Connection = {
            ip: req.socket.remoteAddress
        };
        connections.set(connection, ws);
        ws.on("message", (x) => handler({from: connection, data: JSON.parse(x.toString())}));
        ws.on("close", () => connections.delete(connection));
    });
};


