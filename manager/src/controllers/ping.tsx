import Controller from "../model/controller.js";

export default class PingController implements Controller {


    
    handle(data: any, next: () => void): void {
        next();
    }

}