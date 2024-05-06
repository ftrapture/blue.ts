"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Queue class represents a queue data structure for storing Track objects.
 */
class Queue {
    buffer; // Array to store Track objects
    head; // Index of the first element in the queue
    tail; // Index of the next available position in the queue
    previous; // Reference to the previously played track
    current; // Reference to the currently playing track
    /**
     * Constructor to initialize the Queue object.
     */
    constructor() {
        this.buffer = [];
        this.head = 0;
        this.tail = 0;
        this.previous = null;
        this.current = null;
    }
    /**
     * Add one or more elements to the end of the queue.
     * @param elements One or more Track objects to add to the queue.
     * @returns The updated Queue object.
     */
    add(...elements) {
        this.buffer.push(...elements);
        this.tail += elements.length;
        return this;
    }
    /**
     * Remove the element at the specified index from the queue.
     * @param index The index of the element to remove.
     * @returns The removed Track object.
     */
    remove(index) {
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
    /**
     * Get the first element of the queue.
     * @returns The first Track object in the queue.
     */
    first() {
        if (this.isEmpty())
            return null;
        return this.buffer[this.head];
    }
    /**
     * Get the last element of the queue.
     * @returns The last Track object in the queue.
     */
    last() {
        if (this.isEmpty())
            return null;
        return this.buffer[this.tail - 1];
    }
    /**
     * Remove and return the last element of the queue.
     * @returns The removed Track object.
     */
    pop() {
        if (this.isEmpty())
            return null;
        const poppedElement = this.buffer.pop();
        this.tail--;
        if (this.head > this.buffer.length / 2) {
            this.buffer = this.buffer.slice(this.head);
            this.head = 0;
            this.tail = this.buffer.length;
        }
        return poppedElement;
    }
    /**
     * Remove and return the first element of the queue.
     * @returns The removed Track object.
     */
    shift() {
        return this.remove(0);
    }
    /**
     * Add one or more elements to the beginning of the queue.
     * @param elements One or more Track objects to add to the queue.
     * @returns The new size of the queue.
     */
    unshift(...elements) {
        this.buffer.unshift(...elements);
        this.head = 0;
        this.tail = this.buffer.length;
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
        slicedQueue.buffer = this.buffer.slice(start, end);
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
exports.default = Queue;
//# sourceMappingURL=QueueManager.js.map