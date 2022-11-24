import React from "react";
import { Box, useInput, Key } from "ink";
import { useWindowSize } from "core";
import Background from "./background.js";
import Status from "./status.js";
import { options } from "../app.js";

const Root = () => {
    const { width, height } = useWindowSize();
    const halfHeight = Math.floor((height - 6) / 2);

    useInput((_: string, key: Key) => {
        if (key.escape && options.debug) {
            process.exit();
        }
    });

    return (
        <Box width={width} height={height} flexDirection="column">
            <Background height={halfHeight} />
            <Status />
            <Background height={height & 1 ? halfHeight + 1 : halfHeight} flipped />
        </Box>
    );
};

export default Root;