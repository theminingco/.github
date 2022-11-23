import React from "react";
import { Box, Text } from "ink";

const Header = (props: { title?: string, subtitle?: string }) => {

    return (
        <Box borderStyle="round" flexDirection="column" alignItems="center" width="100%" height={4}>
            <Text>{props.title}</Text>
            <Text>{props.subtitle}</Text>
        </Box>
    );
};

export default Header;