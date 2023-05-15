import { log } from "./log.js";

export const teardown = Array<() => void>();

export const exit = (code: number): void => {
    log();
    teardown.forEach(fn => fn());
    process.exit(code);
};
