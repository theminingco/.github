
export default class ObservableMap<T, U> extends Map<T, U> {
    private listeners = new Map<string, () => void>();

    register(key: string, listener: () => void) {
        this.listeners.set(key, listener);
    }

    unregister(key: string) {
        this.listeners.delete(key);
    }

    set(key: T, value: U): this {
        const result = super.set(key, value);
        this.listeners.forEach(x => x());
        return result;
    }

    delete(key: T): boolean {
        const result = super.delete(key);
        this.listeners.forEach(x => x());
        return result;
    }

    clear(): void {
        super.clear();
        this.listeners.forEach(x => x());
    }
    
}