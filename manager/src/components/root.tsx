import React, { useState } from "react";
import { Box} from "ink";
import Header from "./header.js";
import Main from "./main.js";
import Detail from "./detail.js";
import { useWindowSize, Connection } from "@theminingco/core";
import { options } from "../app.js";

const Root = () => {
    const { width, height } = useWindowSize();
    const [connection, setConnection] = useState<Connection | null>(null);

    const title = () => {
        if (connection == null) {
            return `Manager reachable at ws://localhost:${options.port}`;
        } else {
            return "Title";
        }
    };

    const subtitle = () => {
        if (connection == null) {
            return "Select a miner";
        } else {
            return "Status: Connected";
        }
    };

    return (
        <Box width={width} height={height} flexDirection="column">
            <Header title={title()} subtitle={subtitle()} />
            {connection == null ? <Main onSelect={setConnection} /> : <Detail connection={connection} onBack={() => setConnection(null)} />}
        </Box>
    );
};

export default Root;