import React from "react";
import { render } from "ink";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import Root from "./components/root.js";
import { openWebSocket } from "./utlity/socket.js";

const options = yargs(hideBin(process.argv))
    .option("port", { alias: "p", type: "number", describe: "The port to bind the server on.", default: process.env.WS_PORT ?? "" })
    .help()
    .parseSync();

const port = parseInt(options.port);
openWebSocket(port);
render(<Root port={port} />, { exitOnCtrlC: false });