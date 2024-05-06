/**
 * Class representing an Object Pool.
 */
declare class ObjectPool {
    private pool;
    private currentIndex;
    private size;
    private initializeFn;
    private validateFn;
    private resizeFactor;
    private timeout;
    /**
     * Constructs a new ObjectPool instance.
     * @param size - The initial size of the pool.
     * @param initializeFn - The function used to initialize objects in the pool.
     * @param validateFn - The function used to validate objects before releasing them.
     * @param resizeFactor - The factor by which the pool should resize when it's full.
     * @param timeout - The time (in milliseconds) after which idle objects are removed from the pool.
     */
    constructor({ size, initializeFn, validateFn, resizeFactor, timeout, }?: {
        size?: number;
        initializeFn?: () => {};
        validateFn?: () => true;
        resizeFactor?: number;
        timeout?: number;
    });
    /**
     * Acquires an object from the pool.
     * @returns The acquired object.
     */
    acquire(): any;
    /**
     * Releases an object back to the pool.
     * @param obj - The object to release.
     */
    release(obj: any): void;
}
export default ObjectPool;
