declare class Queue {
    buffer: any[];
    head: number;
    tail: number;
    previous: any | null;
    current: any | null;
    constructor();
    add(...elements: any[]): this;
    remove(index: number): any;
    first(): any;
    last(): any;
    pop(): any;
    shift(): any;
    unshift(...elements: any[]): number;
    slice(start: number, end: number): Queue;
    splice(start: number, deleteCount: number, ...elements: any[]): any[];
    toArray(): any[];
    shuffle(): void;
    clear(): void;
    get(index: number): any;
    size(): number;
    isEmpty(): boolean;
}
export default Queue;
