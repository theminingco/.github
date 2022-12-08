import React from "react";
import { Box, Text } from "ink";
import { useWindowSize } from "@theminingco/core";
import { Connection } from "../modules/socket.js";

interface Column {
    value: string;
    max: number;
    front?: boolean;
}

const Row = (props: { index?: number, connection?: Connection, selected?: boolean }) => {
    const { width } = useWindowSize();
    if (props.connection == null) {
        return (<Box height={1} />);
    }

    const columns: Array<Column> = [
        { value: `${props.connection?.ip}`, max: 39 },
        { value: `${props.index}`, max: 8, front: true },
        { value: `${props.connection?.host}`, max: 25 }
    ];
    
    let content = "";

    for (const column of columns) {
        if (content.length + column.max + 2 > width) { continue; }
        let value = column.value;
        if (value.length > column.max) {
            value = value.slice(0, column.max - 1) + "…";
        }
        value = value.padEnd(column.max + 2);
        content = column.front ? value + content : content + value;
    }
    
    content = content.padEnd(width);

    return (
        <Text inverse={props.selected}>
            {content}
        </Text>
    );
};

export default Row;