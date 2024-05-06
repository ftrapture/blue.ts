import Track from "../Structure/Track";
/**
 * Queue class represents a queue data structure for storing Track objects.
 */
declare class Queue {
    buffer: Track[];
    head: number;
    tail: number;
    previous: Track | null;
    current: Track | null;
    /**
     * Constructor to initialize the Queue object.
     */
    constructor();
    /**
     * Add one or more elements to the end of the queue.
     * @param elements One or more Track objects to add to the queue.
     * @returns The updated Queue object.
     */
    add(...elements: Track[]): this;
    /**
     * Remove the element at the specified index from the queue.
     * @param index The index of the element to remove.
     * @returns The removed Track object.
     */
    remove(index: number): Track;
    /**
     * Get the first element of the queue.
     * @returns The first Track object in the queue.
     */
    first(): Track;
    /**
     * Get the last element of the queue.
     * @returns The last Track object in the queue.
     */
    last(): Track;
    /**
     * Remove and return the last element of the queue.
     * @returns The removed Track object.
     */
    pop(): Track;
    /**
     * Remove and return the first element of the queue.
     * @returns The removed Track object.
     */
    shift(): Track;
    /**
     * Add one or more elements to the beginning of the queue.
     * @param elements One or more Track objects to add to the queue.
     * @returns The new size of the queue.
     */
    unshift(...elements: any[]): number;
    slice(start: number, end: number): Queue;
    splice(start: number, deleteCount: number, ...elements: any[]): Track[];
    toArray(): Track[];
    shuffle(): void;
    clear(): void;
    get(index: number): Track;
    size(): number;
    isEmpty(): boolean;
}
export default Queue;
