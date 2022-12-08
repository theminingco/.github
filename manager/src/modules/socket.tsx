import { nanoid } from "nanoid";
import { ObservableMap, Handler, Connection, timer, connect } from "@theminingco/core";
import { useEffect, useState } from "react";
import { options } from "../app.js";
import InfoHandler from "../handlers/info.js";
import CloseHandler from "../handlers/close.js";
import PongHandler from "../handlers/pong.js";
import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";

const connections = new ObservableMap<Connection, WebSocket>();
const timeoutCancellables = new Map<Connection, () => void>();
let server: WebSocketServer;

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

export const dropConnection = (connection: Connection) => {
    const socket = connections.get(connection);
    socket?.terminate();
    connections.delete(connection);
};

export const send = (message: any, connection: Connection) => {
    const socket = connections.get(connection);
    const json = JSON.stringify(message);
    socket?.send(json);
};

export const heartbeat = (connection: Connection) => {
    const cancellable = timeoutCancellables.get(connection);
    if (cancellable != null) { cancellable(); }
    timer(() => connections.get(connection)?.ping(), 30);
    const newCancellable = timer(() => dropConnection(connection), 35);
    timeoutCancellables.set(connection, newCancellable);
};

const handler = Handler([
    new CloseHandler(),
    new PongHandler(),
    new InfoHandler()
]);

export const openWebSocket = () => {
    server = new WebSocketServer({ port: options.port });
    server.on("connection", (socket: WebSocket, request: IncomingMessage) => {
        const ip = request.socket.remoteAddress ?? "";
        const connection = connect(socket, handler, ip);
        connections.set(connection, socket);
        heartbeat(connection);
    });
};


