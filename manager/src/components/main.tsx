import React, { useState } from "react";
import { Box, Text, useInput, Key, Spacer } from "ink";
import { useWindowSize, range } from "@theminingco/core";
import Connection from "../model/connection.js";
import { useConnections } from "../modules/socket.js";
import Row from "./row.js";

const Main = (props: { onSelect?: (ip: Connection) => void}) => {
    const { width, height } = useWindowSize();
    const [startIndex, setStartIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const connections = useConnections();
    const numRows = height - 5;

    useInput((_: string, key: Key) => {
        if (key.escape) {
            process.exit();
        }

        if (key.return) {
            const index = startIndex + selectedIndex;
            if (index >= connections.length) { return; }
            if (props.onSelect == null) { return; }
            props.onSelect(connections[index]);
        }

        if (key.downArrow) {
            if (selectedIndex + startIndex >= connections.length - 1) {
                return;
            }
            if (selectedIndex < numRows - 1) {
                setSelectedIndex(selectedIndex + 1);
            } else {
                setSelectedIndex(numRows - 1);
                if (startIndex < connections.length - 1) {
                    setStartIndex(startIndex + 1);
                } else {
                    setStartIndex(connections.length - 1);
                }
            }
        }

        if (key.upArrow) {
            if (selectedIndex > 0) {
                setSelectedIndex(selectedIndex - 1);
            } else {
                setSelectedIndex(0);
                if (startIndex > 0) {
                    setStartIndex(startIndex - 1);
                } else {
                    setStartIndex(0);
                }
            }
        }
    });

    const connectionForIndex = (i: number) => {
        const index = startIndex + i;
        return index < connections.length ? connections[index] : undefined;
    };

    return (
        <Box width={width} height={height - 4} flexDirection="column">
            <Box width={width} height={numRows} flexDirection="column">
                {range(numRows).map(i => <Row key={i} index={i} connection={connectionForIndex(i)} selected={i == selectedIndex} />)}
            </Box>

            <Box width={width} height={1} flexDirection="row">
                <Text>Navigation: ▲ ▼   Selection: RETURN   Exit: ESC</Text>
                <Spacer />
                <Text inverse> {connections.length} miner{connections.length == 1 ? "" : "s"} </Text>
            </Box>
            
        </Box>
    );
};

export default Main;