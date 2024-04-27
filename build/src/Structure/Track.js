"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Track = /** @class */ (function () {
    function Track(track) {
        if (track === void 0) { track = {}; }
        var _a;
        this.trackToken = track.encoded;
        this.info = __assign({}, track.info);
        this.info.thumbnail = track.info.uri.includes("youtube")
            ? "https://img.youtube.com/vi/".concat(track.info.identifier, "/default.jpg")
            : null;
        this.info.duration = (_a = track.info) === null || _a === void 0 ? void 0 : _a.length;
        delete this.info.length;
    }
    return Track;
}());
exports.default = Track;
