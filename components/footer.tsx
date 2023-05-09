import { Box, Spacer, Text } from "ink";
import { useWindowSize } from "../utility/size";
import type { ReactElement } from "react";
import React, { useMemo } from "react";
import { useProvider } from "../utility/provider";

export const Footer = (): ReactElement => {
    const { width } = useWindowSize();
    const { balance } = useProvider();

    const formattedBalance = useMemo(() => {
        return balance.toFixed(2);
    }, [balance]);

    return (
        <Box width={width} height={1} flexDirection="row">
            <Text>Exit: ESC</Text>
            <Spacer />
            <Text inverse> {formattedBalance} USDC </Text>
        </Box>
    );
};
