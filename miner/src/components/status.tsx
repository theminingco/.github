import React from "react";
import { Box, Text } from "ink";
import { useConnectionStatus } from "../modules/socket.js";
import { useWindowSize } from "core";

const Status = () => {
    const { width } = useWindowSize();
    const halfWidth = Math.floor(width * 0.6);
    const connectionStatus = useConnectionStatus();

    return (
        <Box borderStyle="round" alignSelf="center" width={halfWidth} height={6} padding={1}>
            <Box flexDirection="column" alignItems="center" width={halfWidth} height={2}>
                <Text>⛏ The Mining Company</Text>
                <Text>{connectionStatus}</Text>
            </Box>
        </Box>
    );
};

export default Status;