import React from "react";
import { Box, Text } from "ink";
import Connection from "../model/connection.js";

const Detail = (props: { connection: Connection, onBack?: () => void}) => {
    
    return (
        <Box width="100%" height="100%" flexDirection="column">
            <Text inverse>{props.connection.ip}</Text>
        </Box>
    );
};

export default Detail;