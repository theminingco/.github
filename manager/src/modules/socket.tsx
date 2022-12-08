import { nanoid } from "nanoid";
import { ObservableMap, Handler, timer, connect, IMinerInfo } from "@theminingco/core";
import { useEffect, useState } from "react";
import { options } from "../app.js";
import InfoHandler from "../handlers/info.js";
import CloseHandler from "../handlers/close.js";
import PongHandler from "../handlers/pong.js";
import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";

export interface Connection {
    ip: string;
    host?: string;
}

const sockets = new Map<string, WebSocket>();
const connections = new ObservableMap<string, Connection>();
const timeoutCancellables = new Map<string, () => void>();
let server: WebSocketServer;

export const useConnections = () => {
    const listenerKey = nanoid();
    const initial = Array.from(connections.values());
    const [items, setItems] = useState<Array<Connection>>(initial);

    useEffect(() => {
        connections.register(listenerKey, () => {
            const newConnections = Array.from(connections.values());
            setItems(newConnections);
        });

        return () => { connections.unregister(listenerKey); };
    }, []);

    return items;
};

export const updateConnection = (connection: string, info: IMinerInfo) => {
    const oldCon = connections.get(connection);
    if (oldCon == null) { return; }
    const newCon: Connection = { ...oldCon, ...info };
    connections.set(connection, newCon);
};

export const dropConnection = (connection: string) => {
    const socket = sockets.get(connection);
    socket?.terminate();
    connections.delete(connection);
    sockets.delete(connection);
};

export const send = (message: any, connection: string) => {
    const socket = sockets.get(connection);
    const json = JSON.stringify(message);
    socket?.send(json);
};

export const heartbeat = (connection: string) => {
    const cancellable = timeoutCancellables.get(connection);
    if (cancellable != null) { cancellable(); }
    timer(() => sockets.get(connection)?.ping(), 30);
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
        const connection: Connection = {
            ip: request.socket.remoteAddress ?? ""
        };
        const id = connect(socket, handler);
        connections.set(id, connection);
        sockets.set(id, socket);
        heartbeat(id);
    });
};


