import { HandlerType, IMinerInfo, MinerInfoSchema, Connection } from "@theminingco/core";

export default class InfoHandler implements HandlerType<IMinerInfo> {
    schema = MinerInfoSchema;

    handler(_: IMinerInfo, _0: Connection) {

    }
}