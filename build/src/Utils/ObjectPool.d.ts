declare class ObjectPool {
    private pool;
    private currentIndex;
    private size;
    private initializeFn;
    private validateFn;
    private resizeFactor;
    private timeout;
    constructor({ size, initializeFn, validateFn, resizeFactor, timeout, }?: {
        size?: number;
        initializeFn?: () => {};
        validateFn?: () => true;
        resizeFactor?: number;
        timeout?: number;
    });
    acquire(): any;
    release(obj: any): void;
}
export default ObjectPool;
