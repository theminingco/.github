

export const noEscape = () => {
    process.on("SIGINT", () => {}); 
    process.on("SIGQUIT", () => {});
    process.on("SIGTERM", () => {});
};