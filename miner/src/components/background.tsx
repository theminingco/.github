import React from "react";
import { Box } from "ink";
import { useWindowSize } from "@theminingco/core";

const Background = (props: { flipped?: boolean }) => {
    const { width, height } = useWindowSize();
    const halfHeight = Math.floor((height - 6) / 2);

    return (
        <Box height={height & 1 && props.flipped ? halfHeight + 1 : halfHeight} width={width}>
            
        </Box>
    );
};

export default Background;