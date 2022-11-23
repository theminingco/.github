import React from "react";
import { Box, useInput, Key } from "ink";
import Background from "./background.js";
import Status from "./status.js";
import { useWindowSize } from "../utility/size.js";

const Root = () => {
    const { width, height } = useWindowSize();

    useInput((_: string, key: Key) => {
        if (key.escape) {
            process.exit();
        }
    });

    return (
        <Box width={width} height={height} flexDirection="column">
            <Background />
            <Status />
        </Box>
    );
};

export default Root;