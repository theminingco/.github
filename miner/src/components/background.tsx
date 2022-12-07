import React from "react";
import { Box, Text } from "ink";
import { useWindowSize, randomElement } from "@theminingco/core";

const generateRow = (length: number, percentage: number) => {
    const factor = (Math.cos(2 * percentage) + 1) / 2;
    const randomDigit = () => randomElement(["0", "1"]);
    const randomEmpty = () => !Math.round(Math.random() * factor);
    const randomDim = () => !Math.round(Math.random() * factor + 0.2);

    let row = "";
    for (let i = 0; i < length; i++) {
        if (randomEmpty()) {
            row = row + " ";
        } else {
            const prefix = randomDim() ? "\u001b[2m" : "";
            const cell = randomDigit();
            const suffix = randomDim() ? "\u001b[22m" : "";
            row = row + prefix + cell + suffix;
        }
    }
    return row;
};

const Background = (props: { flipped?: boolean }) => {
    const { width, height } = useWindowSize();
    const halfHeight = Math.floor((height - 6) / 2);
    const numRows = height & 1 && props.flipped ? halfHeight + 1 : halfHeight;
    
    let rows = [...Array(numRows).keys()]
        .map(i => (i + 1) / numRows)
        .map(p => generateRow(width, p));

    if (props.flipped) {
        rows = rows.reverse();
    }

    //On the flipside there is one extra empty line sometimes

    return (
        <Box height={numRows} width={width} flexDirection="column">
            { rows.map((x, i) => <Text key={i}>{x}</Text>) }
        </Box>
    );
};

export default Background;