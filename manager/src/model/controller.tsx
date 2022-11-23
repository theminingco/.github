import Request from "./request.js";

export default interface Controller {
    handle(data: Request, next: (() => void)): void;
}