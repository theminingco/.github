import { randomUUID } from "crypto";
import { useLayoutEffect, useState } from "react";

interface Size {
    width: number;
    height: number;
}

const listeners = new Map<string, () => void>();

process.stdout.on("resize", () => {
    listeners.forEach(x => x());
});

export const useWindowSize = (): Size => {
    const listenerKey = randomUUID();
    const initial = { width: process.stdout.columns, height: process.stdout.rows };
    const [size, setSize] = useState<Size>(initial);

    useLayoutEffect(() => {
        listeners.set(listenerKey, () => {
            setSize({ width: process.stdout.columns, height: process.stdout.rows });
        });

        return (): void => { listeners.delete(listenerKey); };
    }, []);

    return size;
};
