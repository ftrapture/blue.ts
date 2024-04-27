"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ObjectPool = /** @class */ (function () {
    function ObjectPool(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.size, size = _c === void 0 ? 10 : _c, _d = _b.initializeFn, initializeFn = _d === void 0 ? function () { return ({}); } : _d, _e = _b.validateFn, validateFn = _e === void 0 ? function () { return true; } : _e, _f = _b.resizeFactor, resizeFactor = _f === void 0 ? 2 : _f, _g = _b.timeout, timeout = _g === void 0 ? 30000 : _g;
        this.pool = new Array(size).fill(null).map(function () { return initializeFn(); });
        this.currentIndex = 0;
        this.size = size;
        this.initializeFn = initializeFn;
        this.validateFn = validateFn;
        this.resizeFactor = resizeFactor;
        this.timeout = timeout;
    }
    ObjectPool.prototype.acquire = function () {
        var obj = null;
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
    };
    ObjectPool.prototype.release = function (obj) {
        var _this = this;
        if (!this.validateFn(obj))
            return;
        this.currentIndex--;
        if (this.size > this.pool.length * this.resizeFactor) {
            this.pool = this.pool.concat(new Array(this.size - this.pool.length).fill(null).map(function () { return _this.initializeFn(); }));
        }
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                delete obj[key];
            }
        }
        this.pool[this.currentIndex] = obj;
        setTimeout(function () {
            if (_this.pool.includes(obj)) {
                _this.currentIndex--;
            }
        }, this.timeout);
    };
    return ObjectPool;
}());
exports.default = ObjectPool;
