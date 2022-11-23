import React from "react";
import { Box, Text } from "ink";
import Connection from "../model/connection.js";
import { useWindowSize } from "../utlity/size.js";

const Row = (props: { index?: number, connection?: Connection, selected?: boolean }) => {
    const { width } = useWindowSize();
    if (props.connection == null) {
        return (<Box height={1} />);
    }

    let content = `${props.connection?.ip}`.padEnd(47);

    if (content.length + 10 <= width) {
        content = `${props.index}`.padEnd(10) + content;
    }

    if (content.length + 10 <= width) {
        content = content + "a".padEnd(10);
    }

    content = content.padEnd(width);

    return (
        <Text inverse={props.selected}>
            {content}
        </Text>
    );
};

export default Row;