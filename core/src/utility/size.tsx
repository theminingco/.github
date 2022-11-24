import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

interface Size {
    width: number;
    height: number;
}

const listeners = new Map<string, () => void>();

process.on("SIGWINCH", () => {
    listeners.forEach(x => x());
});

export const useWindowSize = () => {
    const listenerKey = nanoid();
    const initial = { width: process.stdout.columns, height: process.stdout.rows };
    const [size, setSize] = useState<Size>(initial);

    useEffect(() => {
        listeners.set(listenerKey, () => {
            setSize({ width: process.stdout.columns, height: process.stdout.rows });
        });

        return () => { listeners.delete(listenerKey); };
    });
    return size;
};