import Connection from "./connection.js";

export default interface Request {
    from: Connection;
    data: any;
}