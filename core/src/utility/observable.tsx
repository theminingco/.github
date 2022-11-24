export class Observable<T> {
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

export class ObservableMap<T, U> extends Map<T, U> {
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

export class ObservableArray<T> extends Array<T> {
    private listeners = new Map<string, () => void>();

    register(key: string, listener: () => void) {
        this.listeners.set(key, listener);
    }

    unregister(key: string) {
        this.listeners.delete(key);
    }

    fill(value: T, start?: number | undefined, end?: number | undefined): this {
        const result = super.fill(value, start, end);
        this.listeners.forEach(x => x());
        return result;
    }

    push(...items: T[]): number {
        const result = super.push(...items);
        this.listeners.forEach(x => x());
        return result;
    }

    pop(): T | undefined {
        const result = super.pop();
        this.listeners.forEach(x => x());
        return result;
    }

    shift(): T | undefined {
        const result = super.shift();
        this.listeners.forEach(x => x());
        return result;
    }

    unshift(...items: T[]): number {
        const result = super.unshift(...items);
        this.listeners.forEach(x => x());
        return result;
    }

    sort(compareFn?: ((a: T, b: T) => number) | undefined): this {
        const result = super.sort(compareFn);
        this.listeners.forEach(x => x());
        return result;
    }
}

export class ObservableSet<T> extends Set<T> {
    private listeners = new Map<string, () => void>();

    register(key: string, listener: () => void) {
        this.listeners.set(key, listener);
    }

    unregister(key: string) {
        this.listeners.delete(key);
    }

    add(value: T): this {
        const result = super.add(value);
        this.listeners.forEach(x => x());
        return result;
    }

    delete(value: T): boolean {
        const result = super.delete(value);
        this.listeners.forEach(x => x());
        return result;
    }

    clear(): void {
        super.clear();
        this.listeners.forEach(x => x());
    }

}