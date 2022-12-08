import { HandlerType, IMinerInfo, MinerInfoSchema } from "@theminingco/core";
import { updateConnection } from "../modules/socket.js";

export default class InfoHandler implements HandlerType<IMinerInfo> {
    schema = MinerInfoSchema;

    handler(info: IMinerInfo, connection: string) {
        updateConnection(connection, info);
    }
}