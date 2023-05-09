import type { ReactElement } from "react";
import React, { useMemo } from "react";
import { useWindowSize } from "../utility/size";
import { Box } from "ink";
import { Row } from "./row";

export const Main = (): ReactElement => {
    const { width, height } = useWindowSize();
    const numRows = useMemo(() => height - 6, [height]);

    const rows = useMemo(() => {
        const result = [];
        for (const index of Array(numRows).keys()) {
            const row = <Row key={index} index={index} />;
            result.push(row);
        }
        return result;
    }, [numRows]);

    return (
        <Box width={width} height={numRows} flexDirection="column">
            {rows}
        </Box>
    );
};
