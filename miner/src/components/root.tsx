import React from "react";
import { Box, useInput, Key } from "ink";
import { useWindowSize } from "core";
import Background from "./background.js";
import Status from "./status.js";
import { options } from "../app.js";

const Root = () => {
    const { width, height } = useWindowSize();

    useInput((_: string, key: Key) => {
        if (key.escape && options.debug) {
            process.exit();
        }
    });

    return (
        <Box width={width} height={height} flexDirection="column">
            <Background />
            <Status />
            <Background flipped />
        </Box>
    );
};

export default Root;