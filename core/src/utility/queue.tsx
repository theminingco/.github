export class Queue<T> {
    private store: Array<T> = [];

    push(val: T) {
        this.store.push(val);
    }

    pop(): T | undefined {
        return this.store.shift();
    }

    isEmpty(): boolean {
        return this.store.length == 0;
    }
}