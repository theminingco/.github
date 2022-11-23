
export default class Observable<T> {
    private listeners = new Map<string, () => void>();
    private value: T;

    constructor(value: T) {
        this.value = value;
    }

    register(key: string, listener: () => void) {
        this.listeners.set(key, listener);
    }

    unregister(key: string) {
        this.listeners.delete(key);
    }

    set(value: T) {
        this.value = value;
        this.listeners.forEach(x => x());
    }

    get(): T {
        return this.value;
    }
}