import React from "react";
import { Box, Text, useInput, Key } from "ink";
import { useWindowSize } from "@theminingco/core";
import { Connection } from "../modules/socket.js";

const Detail = (props: { connection: Connection, onBack?: () => void}) => {
    const { width, height } = useWindowSize();

    useInput((_: string, key: Key) => {
        if (key.escape) {
            if (props.onBack == null) { return; }
            props.onBack();
        }

    });

    return (
        <Box width={width} height={height - 4} flexDirection="column">
            <Text inverse>{props.connection.ip}</Text>
        </Box>
    );
};

export default Detail;