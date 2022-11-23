import React from "react";
import { Box, Text } from "ink";
import { useConnectionStatus } from "../utility/socket.js";

const Status = () => {
    const connectionStatus = useConnectionStatus();

    return (
        <Box flexDirection="row" alignItems="center" height="100%">
            <Box flexDirection="column" alignItems="center" width="100%">
                <Box borderStyle="round" alignItems="center" flexDirection="column" width="60%" paddingTop={1} paddingBottom={1}>
                    <Text>⛏ The Mining Company ⛏</Text>
                    <Text>{connectionStatus}</Text>
                </Box>
            </Box>
        </Box>
    );
};

export default Status;