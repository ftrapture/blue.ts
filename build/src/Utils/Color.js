"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextColor = void 0;
var TextColor;
(function (TextColor) {
    TextColor["Black"] = "\u001B[30m";
    TextColor["Red"] = "\u001B[31m";
    TextColor["Green"] = "\u001B[32m";
    TextColor["Yellow"] = "\u001B[33m";
    TextColor["Blue"] = "\u001B[34m";
    TextColor["Magenta"] = "\u001B[35m";
    TextColor["Cyan"] = "\u001B[36m";
    TextColor["White"] = "\u001B[37m";
})(TextColor || (exports.TextColor = TextColor = {}));
String.prototype.Black = function () {
    return "".concat(TextColor.Black).concat(this, "\u001B[0m");
};
String.prototype.Red = function () {
    return "".concat(TextColor.Red).concat(this, "\u001B[0m");
};
String.prototype.Green = function () {
    return "".concat(TextColor.Green).concat(this, "\u001B[0m");
};
String.prototype.Yellow = function () {
    return "".concat(TextColor.Yellow).concat(this, "\u001B[0m");
};
String.prototype.Blue = function () {
    return "".concat(TextColor.Blue).concat(this, "\u001B[0m");
};
String.prototype.Magenta = function () {
    return "".concat(TextColor.Magenta).concat(this, "\u001B[0m");
};
String.prototype.Cyan = function () {
    return "".concat(TextColor.Cyan).concat(this, "\u001B[0m");
};
String.prototype.White = function () {
    return "".concat(TextColor.White).concat(this, "\u001B[0m");
};
