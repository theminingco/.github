import { teardown } from "./exit.js";
import { log } from "./log.js";

let loadingText = "";
const sequence = ["⠷", "⠯", "⠟", "⠻", "⠽", "⠾"];
let intervalId: NodeJS.Timer | null = null;

export const setLoadingText = (text = ""): void => {
    loadingText = text;
};

export const stopLoading = (): void => {
    if (intervalId == null) { return; }
    clearInterval(intervalId);
    log("\x1B[K", true);
    intervalId = null;
};

export const startLoading = (text = ""): void => {
    loadingText = text;
    let index = 0;

    intervalId = setInterval(() => {
        log(`${sequence[index % sequence.length]} ${loadingText}`, true);
        index++;
    }, 100);

    teardown.push(stopLoading);
};
