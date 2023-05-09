import { ReactElement, useMemo } from "react";
import React from "react";
import { Box, Text } from "ink";
import { useWindowSize } from "../utility/size";
import { useProvider } from "../utility/provider";
import JSBI from "jsbi";

interface IProps {
    index: number;
}

export const Row = (props: IProps): ReactElement => {
    const { width } = useWindowSize();
    const { trades } = useProvider();

    const trade = useMemo(() => {
        const i = trades.length - props.index - 1;
        if (i < 0) { return null; }
        return trades[i];
    }, [trades, props.index]);

    const formattedIndex = useMemo(() => {
        return `${props.index}`.padStart(3, "0");
    }, [props.index]);

    const route = useMemo(() => {
        return "USDC > USDC";
    }, []);

    const formattedPercentage = useMemo(() => {
        if (trade == null) { return ""; }
        const diff = JSBI.subtract(trade.outAmount, trade.inAmount);
        const fraction = JSBI.divide(diff, trade.inAmount);
        const percentage = JSBI.multiply(fraction, JSBI.BigInt(100));
        const formatted = JSBI.toNumber(percentage).toFixed(2);
        return `${formatted}%`;
    }, [trade]);

    if (trade == null) { return <Box height={1} />; }

    return (
        <Box width={width} height={1} flexDirection="row">
            <Text> {formattedIndex} </Text>
            <Text> {route} </Text>
            <Text> {formattedPercentage} </Text>
        </Box>
    );
};
