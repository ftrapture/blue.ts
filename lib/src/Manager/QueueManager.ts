import Track from "../Structure/Track";

/**
 * Queue class represents a queue data structure for storing Track objects.
 */
class Queue {
    public buffer: Track[]; // Array to store Track objects
    public head: number; // Index of the first element in the queue
    public tail: number; // Index of the next available position in the queue
    public previous: Track | null; // Reference to the previously played track
    public current: Track | null; // Reference to the currently playing track

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
    public add(...elements: Track[]): this {
        this.buffer.push(...elements);
        this.tail += elements.length;
        return this;
    }

    /**
     * Remove the element at the specified index from the queue.
     * @param index The index of the element to remove.
     * @returns The removed Track object.
     */
    public remove(index: number): Track {
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
    public first(): Track {
        if (this.isEmpty()) return null;
        return this.buffer[this.head];
    }

    /**
     * Get the last element of the queue.
     * @returns The last Track object in the queue.
     */
    public last(): Track {
        if (this.isEmpty()) return null;
        return this.buffer[this.tail - 1];
    }

    /**
     * Remove and return the last element of the queue.
     * @returns The removed Track object.
     */
    public pop(): Track {
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

    /**
     * Remove and return the first element of the queue.
     * @returns The removed Track object.
     */
    public shift(): Track {
        return this.remove(0);
    }

    /**
     * Add one or more elements to the beginning of the queue.
     * @param elements One or more Track objects to add to the queue.
     * @returns The new size of the queue.
     */
    public unshift(...elements: any[]): number {
        this.buffer.unshift(...elements);
        this.head = 0;
        this.tail = this.buffer.length;
        return this.size();
    }

    public slice(start: number, end: number): Queue {
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

    public splice(start: number, deleteCount: number, ...elements: any[]): Track[] {
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

    public toArray(): Track[] {
        return this.buffer.slice(this.head, this.tail);
    }

    public shuffle(): void {
        for (let i = this.size() - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.buffer[this.head + i], this.buffer[this.head + j]] = [this.buffer[this.head + j], this.buffer[this.head + i]];
        }
    }

    public clear(): void {
        this.buffer = [];
        this.head = 0;
        this.tail = 0;
    }

    public get(index: number): Track {
        if (index < 0 || index >= this.size()) {
            throw new Error("Index out of bounds");
        }
        return this.buffer[this.head + index];
    }

    public size(): number {
        return this.tail - this.head;
    }

    public isEmpty(): boolean {
        return this.size() === 0;
    }
}

export default Queue;