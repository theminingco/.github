import React from "react";
import { Box, Text } from "ink";
import Connection from "../model/connection.js";
import { useWindowSize } from "@theminingco/core";

const Detail = (props: { connection: Connection, onBack?: () => void}) => {
    const { width, height } = useWindowSize();

    return (
        <Box width={width} height={height - 4} flexDirection="column">
            <Text inverse>{props.connection.ip}</Text>
        </Box>
    );
};

export default Detail;