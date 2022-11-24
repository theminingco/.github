import { DOMElement } from "ink";
import { nanoid } from "nanoid";
import { useLayoutEffect, useState } from "react";

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

    useLayoutEffect(() => {
        listeners.set(listenerKey, () => {
            setSize({ width: process.stdout.columns, height: process.stdout.rows });
        });

        return () => { listeners.delete(listenerKey); };
    }, []);
    return size;
};

export const useElementSize = <T extends DOMElement>() => {
    const [ref, setRef] = useState<T | null>(null);
    const [size, setSize] = useState<Size>({width: 0, height: 0 });
    const height = () => ref?.yogaNode?.getComputedHeight() ?? 0;
    const width = () => ref?.yogaNode?.getComputedWidth() ?? 0;

    useLayoutEffect(() => {
        setSize({ width: width(), height: height() });
    }, [width(), height()]);

    return [setRef, size] as [(node: T | null) => void, Size];
};