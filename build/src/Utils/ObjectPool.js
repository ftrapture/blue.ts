"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class representing an Object Pool.
 */
class ObjectPool {
    pool;
    currentIndex;
    size;
    initializeFn;
    validateFn;
    resizeFactor;
    timeout;
    /**
     * Constructs a new ObjectPool instance.
     * @param size - The initial size of the pool.
     * @param initializeFn - The function used to initialize objects in the pool.
     * @param validateFn - The function used to validate objects before releasing them.
     * @param resizeFactor - The factor by which the pool should resize when it's full.
     * @param timeout - The time (in milliseconds) after which idle objects are removed from the pool.
     */
    constructor({ size = 10, initializeFn = () => ({}), validateFn = () => true, resizeFactor = 2, timeout = 30000, } = {}) {
        this.pool = new Array(size).fill(null).map(() => initializeFn());
        this.currentIndex = 0;
        this.size = size;
        this.initializeFn = initializeFn;
        this.validateFn = validateFn;
        this.resizeFactor = resizeFactor;
        this.timeout = timeout;
    }
    /**
     * Acquires an object from the pool.
     * @returns The acquired object.
     */
    acquire() {
        let obj = null;
        if (this.currentIndex < this.pool.length) {
            obj = this.pool[this.currentIndex];
            this.currentIndex++;
        }
        else {
            obj = this.initializeFn();
            this.pool.push(obj);
            this.size++;
        }
        return obj;
    }
    /**
     * Releases an object back to the pool.
     * @param obj - The object to release.
     */
    release(obj) {
        if (!this.validateFn(obj))
            return;
        this.currentIndex--;
        if (this.size > this.pool.length * this.resizeFactor) {
            this.pool = this.pool.concat(new Array(this.size - this.pool.length).fill(null).map(() => this.initializeFn()));
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                delete obj[key];
            }
        }
        this.pool[this.currentIndex] = obj;
        setTimeout(() => {
            if (this.pool.includes(obj)) {
                this.currentIndex--;
            }
        }, this.timeout);
    }
}
exports.default = ObjectPool;
//# sourceMappingURL=ObjectPool.js.map