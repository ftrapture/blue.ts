class Queue {
    constructor() {
        this.buffer = [];
        this.head = 0;
        this.tail = 0;
        this.previous = null;
        this.current = null;
    }

    add(...element) {
        this.buffer.push(...element);
        this.tail++;
        return this;
    }

    remove(index) {
        if (this.isEmpty() || index < 0 || index >= this.size()) {
            return null; 
        }
        const removedElement = this.buffer[this.head + index];
        this.buffer.splice(this.head + index, 1);
        this.tail--;
        if (this.head > this.buffer.length / 2) {
            this.buffer = this.buffer.slice(this.head);
            this.head = 0;
            this.tail -= this.head;
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
            this.tail -= this.head;
        }

        return poppedElement;
    }

    shift() {
        return this.remove(0);
    }

    unshift(...elements) {
        this.buffer.unshift(...elements);
        this.head = 0;
        this.tail += elements.length;
        return this.size();
    }

    slice(start, end) {
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
        slicedQueue.buffer = this.buffer.slice(this.head + start, this.head + end);
        slicedQueue.tail = end - start;
        return slicedQueue;
    }

    splice(start, deleteCount, ...elements) {
        if (start < 0) {
            start = this.size() + start;
        }

        if (start < 0 || start > this.size()) {
            throw new Error("Invalid start index");
        }

        const deletedElements = this.buffer.splice(this.head + start, deleteCount, ...elements);

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

    get(index) {
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

module.exports = Queue;
