import React from "react";
import { Box, Text } from "ink";
import { useWindowSize } from "@theminingco/core";

const Header = (props: { title?: string, subtitle?: string }) => {
    const { width } = useWindowSize();

    return (
        <Box borderStyle="round" flexDirection="column" alignItems="center" width={width} height={4}>
            <Text>{props.title}</Text>
            <Text>{props.subtitle}</Text>
        </Box>
    );
};

export default Header;