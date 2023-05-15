
export const log = (message?: string, ephemeral = false): void => {
    const terminator = ephemeral ? "\r" : "\n";
    process.stdout.write(`${message ?? ""}${terminator}`);
};
