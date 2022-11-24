import React from "react";
import { Box, Text } from "ink";
import { useConnectionStatus } from "../modules/socket.js";

const Status = () => {
    const connectionStatus = useConnectionStatus();

    return (
        <Box borderStyle="round" alignSelf="center" width="60%" padding={1}>
            <Box flexDirection="column" alignItems="center" width="100%">
                <Text>⛏ The Mining Company</Text>
                <Text>{connectionStatus}</Text>
            </Box>
        </Box>
    );
};

export default Status;