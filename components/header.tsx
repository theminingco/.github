import type { ReactElement } from "react";
import React from "react";
import { Box, Spacer, Text } from "ink";
import { useWindowSize } from "../utility/size";

export const Header = (): ReactElement => {
    const { width } = useWindowSize();

    // TODO: spinner

    return (
        <Box borderStyle="round" flexDirection="row" alignItems="center" width={width} height={5}>
            <Text> ⛏ The Mining Company </Text>
            <Spacer />
            <Text> ABC </Text>
        </Box>
    );
};
