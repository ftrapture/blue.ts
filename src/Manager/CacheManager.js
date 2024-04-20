const EventEmitter = require('events');
const ObjectPool = require("../Utils/ObjectPool");

class Cache extends EventEmitter {
    constructor(options = {}) {
        super();
        this.cachePool = new ObjectPool({
            size: options.maxSize || 1000,
            initializeFn: () => ({ key: null, value: null, timestamp: 0 }),
            validateFn: entry => entry.key !== null && !this.isExpired(entry),
            resizeFactor: 2,
            timeout: options.defaultTTL || 60 * 1000,
        });
        this.storage = options.storage || new Map();
    }

    get(key, fetchFunction, ttl = this.defaultTTL) {
        let entry = this.storage.get(key);

        if (!entry || this.isExpired(entry)) {
            try {
                const value = fetchFunction(key);

                this.set(key, value, ttl);

                return value;
            } catch (error) {
                console.error(`Error fetching data for key '${key}':`, error);
                return null;
            }
        } else {
            this.updateAccess(entry);
            return entry.value;
        }
    }

    set(key, value, ttl = this.defaultTTL) {
        const entry = this.cachePool.acquire();

        entry.key = key;
        entry.value = value;
        entry.timestamp = Date.now() + ttl;

        this.storage.set(key, entry);
        this.updateStorage(key, entry);

        this.emit('cacheUpdated', { key, value });

        return entry;
    }

    remove(key) {
        const entry = this.storage.get(key);

        if (entry) {
            this.cachePool.release(entry);
            this.storage.delete(key);

            this.emit('cacheRemoved', { key });
        }
    }

    clear() {
        this.cachePool.releaseAll(this.storage.values());
        this.storage.clear();
        this.emit('cacheCleared');
    }

    isExpired(entry) {
        return entry.timestamp < Date.now();
    }

    updateAccess(entry) {
        entry.timestamp = Date.now();
    }

    updateStorage(key, entry) {
        this.storage.set(key, entry);
    }
}

module.exports = Cache;

// Usage
/*
const cache = new Cache({
  maxSize: 1000,
  defaultTTL: 60 * 1000,
  storage: new Map(),
});
const entry = cache.set('key1', 'value1', 5000); // Cache key1 with a max age of 5 seconds

// Get data from the cache
const result = cache.get('key1');
console.log(result);

// Remove data from the cache
cache.remove('key1');

// Clear the entire cache
cache.clear();
*/
