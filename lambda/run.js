/* eslint-disable */
const { spawn } = require("child_process");
const fetch = require("node-fetch");

const triggerFunction = async () => {
    let retryCount = 0;
    while (retryCount < 5) {
        try {
            const res = await fetch("http://127.0.0.1:2345/theminingco/us-central1/trigger");
            if (res.status === 200) { return; }
        } catch { /* Empty */ }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retryCount++;
    }
};

const main = async () => {
    const proc = spawn("npx", ["firebase", "functions:shell", "-p", "2345"]);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await triggerFunction();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    proc.kill();
};

main().catch(console.error);
