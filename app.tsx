import type { ReactElement } from "react";
import React from "react";
import type { Key } from "ink";
import { Box, render, useInput, useApp } from "ink";
import { Header } from "./components/header";
import { useWindowSize } from "./utility/size";
import { Footer } from "./components/footer";
import { Main } from "./components/main";
import { Provider } from "./utility/provider";

process.on("SIGINT", () => { /* Empty */ });
process.on("SIGQUIT", () => { /* Empty */ });
process.on("SIGTERM", () => { /* Empty */ });

const App = (): ReactElement => {
    const { width, height } = useWindowSize();
    const { exit } = useApp();

    useInput((_0: string, key: Key) => {
        if (key.escape) {
            exit();
        }
    });

    return (
        <Provider>
            <Box width={width} height={height} flexDirection="column">
                <Header />
                <Main />
                <Footer />
            </Box>
        </Provider>
    );
};

render(<App />, { exitOnCtrlC: false });
