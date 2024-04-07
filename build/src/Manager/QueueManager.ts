class Queue {
    public buffer: any[];
    public head: number;
    public tail: number;
    public previous: any | null;
    public current: any | null;

    constructor() {
        this.buffer = [];
        this.head = 0;
        this.tail = 0;
        this.previous = null;
        this.current = null;
    }

    add(...elements: any[]) {
        this.buffer.push(...elements);
        this.tail += elements.length;
        return this;
    }

    remove(index: number) {
        if (this.isEmpty() || index < 0 || index >= this.size()) {
            return null;
        }
        const removedElement = this.buffer.splice(this.head + index, 1)[0];
        this.tail--;
        if (this.head > this.buffer.length / 2) {
            this.buffer = this.buffer.slice(this.head);
            this.head = 0;
            this.tail = this.buffer.length;
        }
        return removedElement;
    }

    first() {
        if (this.isEmpty()) return null;
        return this.buffer[this.head];
    }

    last() {
        if (this.isEmpty()) return null;
        return this.buffer[this.tail - 1];
    }

    pop() {
        if (this.isEmpty()) return null;
        const poppedElement = this.buffer.pop();
        this.tail--;
        if (this.head > this.buffer.length / 2) {
            this.buffer = this.buffer.slice(this.head);
            this.head = 0;
            this.tail = this.buffer.length;
        }
        return poppedElement;
    }

    shift() {
        return this.remove(0);
    }

    unshift(...elements: any[]) {
        this.buffer.unshift(...elements);
        this.head = 0;
        this.tail = this.buffer.length;
        return this.size();
    }

    slice(start: number, end: number) {
        if (start < 0) {
            start = this.size() + start;
        }
        if (end < 0) {
            end = this.size() + end;
        }
        if (start < 0 || start >= this.size() || end < 0 || end > this.size() || start > end) {
            throw new Error("Invalid start or end index");
        }
        const slicedQueue = new Queue();
        slicedQueue.buffer = this.buffer.slice(start, end);
        slicedQueue.tail = end - start;
        return slicedQueue;
    }

    splice(start: number, deleteCount: number, ...elements: any[]) {
        if (start < 0) {
            start = this.size() + start;
        }
        if (start < 0 || start > this.size()) {
            throw new Error("Invalid start index");
        }
        const deletedElements = this.buffer.splice(start, deleteCount, ...elements);
        this.head = 0;
        this.tail = this.buffer.length;
        return deletedElements;
    }

    toArray() {
        return this.buffer.slice(this.head, this.tail);
    }

    shuffle() {
        for (let i = this.size() - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.buffer[this.head + i], this.buffer[this.head + j]] = [this.buffer[this.head + j], this.buffer[this.head + i]];
        }
    }

    clear() {
        this.buffer = [];
        this.head = 0;
        this.tail = 0;
    }

    get(index: number) {
        if (index < 0 || index >= this.size()) {
            throw new Error("Index out of bounds");
        }
        return this.buffer[this.head + index];
    }

    size() {
        return this.tail - this.head;
    }

    isEmpty() {
        return this.size() === 0;
    }
}

export default Queue;