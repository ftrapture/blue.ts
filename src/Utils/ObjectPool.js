class ObjectPool {
    constructor({
        size = 10,
        initializeFn = () => ({}),
        validateFn = () => true,
        resizeFactor = 2,
        timeout = 30000, 
    } = {}) {
        this.pool = new Array(size).fill(null).map(() => initializeFn());
        this.currentIndex = 0;
        this.size = size;
        this.initializeFn = initializeFn;
        this.validateFn = validateFn;
        this.resizeFactor = resizeFactor;
        this.timeout = timeout;
    }

    acquire() {
        let obj = null;

        if (this.currentIndex < this.pool.length) {
            obj = this.pool[this.currentIndex];
            this.currentIndex++;
        } else {
            obj = this.initializeFn();
            this.pool.push(obj);
            this.size++;
        }
        return obj;
    }

    release(obj) {
        if (!this.validateFn(obj)) return;

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

module.exports = ObjectPool;