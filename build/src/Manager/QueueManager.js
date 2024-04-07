"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var Queue = /** @class */ (function () {
    function Queue() {
        this.buffer = [];
        this.head = 0;
        this.tail = 0;
        this.previous = null;
        this.current = null;
    }
    Queue.prototype.add = function () {
        var _a;
        var elements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            elements[_i] = arguments[_i];
        }
        (_a = this.buffer).push.apply(_a, elements);
        this.tail += elements.length;
        return this;
    };
    Queue.prototype.remove = function (index) {
        if (this.isEmpty() || index < 0 || index >= this.size()) {
            return null;
        }
        var removedElement = this.buffer.splice(this.head + index, 1)[0];
        this.tail--;
        if (this.head > this.buffer.length / 2) {
            this.buffer = this.buffer.slice(this.head);
            this.head = 0;
            this.tail = this.buffer.length;
        }
        return removedElement;
    };
    Queue.prototype.first = function () {
        if (this.isEmpty())
            return null;
        return this.buffer[this.head];
    };
    Queue.prototype.last = function () {
        if (this.isEmpty())
            return null;
        return this.buffer[this.tail - 1];
    };
    Queue.prototype.pop = function () {
        if (this.isEmpty())
            return null;
        var poppedElement = this.buffer.pop();
        this.tail--;
        if (this.head > this.buffer.length / 2) {
            this.buffer = this.buffer.slice(this.head);
            this.head = 0;
            this.tail = this.buffer.length;
        }
        return poppedElement;
    };
    Queue.prototype.shift = function () {
        return this.remove(0);
    };
    Queue.prototype.unshift = function () {
        var _a;
        var elements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            elements[_i] = arguments[_i];
        }
        (_a = this.buffer).unshift.apply(_a, elements);
        this.head = 0;
        this.tail = this.buffer.length;
        return this.size();
    };
    Queue.prototype.slice = function (start, end) {
        if (start < 0) {
            start = this.size() + start;
        }
        if (end < 0) {
            end = this.size() + end;
        }
        if (start < 0 || start >= this.size() || end < 0 || end > this.size() || start > end) {
            throw new Error("Invalid start or end index");
        }
        var slicedQueue = new Queue();
        slicedQueue.buffer = this.buffer.slice(start, end);
        slicedQueue.tail = end - start;
        return slicedQueue;
    };
    Queue.prototype.splice = function (start, deleteCount) {
        var _a;
        var elements = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            elements[_i - 2] = arguments[_i];
        }
        if (start < 0) {
            start = this.size() + start;
        }
        if (start < 0 || start > this.size()) {
            throw new Error("Invalid start index");
        }
        var deletedElements = (_a = this.buffer).splice.apply(_a, __spreadArray([start, deleteCount], elements, false));
        this.head = 0;
        this.tail = this.buffer.length;
        return deletedElements;
    };
    Queue.prototype.toArray = function () {
        return this.buffer.slice(this.head, this.tail);
    };
    Queue.prototype.shuffle = function () {
        var _a;
        for (var i = this.size() - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            _a = [this.buffer[this.head + j], this.buffer[this.head + i]], this.buffer[this.head + i] = _a[0], this.buffer[this.head + j] = _a[1];
        }
    };
    Queue.prototype.clear = function () {
        this.buffer = [];
        this.head = 0;
        this.tail = 0;
    };
    Queue.prototype.get = function (index) {
        if (index < 0 || index >= this.size()) {
            throw new Error("Index out of bounds");
        }
        return this.buffer[this.head + index];
    };
    Queue.prototype.size = function () {
        return this.tail - this.head;
    };
    Queue.prototype.isEmpty = function () {
        return this.size() === 0;
    };
    return Queue;
}());
exports.default = Queue;
