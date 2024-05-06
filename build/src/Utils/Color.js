"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextColor = void 0;
/**
 * Enum representing text colors for console output.
 */
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
    return `${TextColor.Black}${this}\x1b[0m`;
};
String.prototype.Red = function () {
    return `${TextColor.Red}${this}\x1b[0m`;
};
String.prototype.Green = function () {
    return `${TextColor.Green}${this}\x1b[0m`;
};
String.prototype.Yellow = function () {
    return `${TextColor.Yellow}${this}\x1b[0m`;
};
String.prototype.Blue = function () {
    return `${TextColor.Blue}${this}\x1b[0m`;
};
String.prototype.Magenta = function () {
    return `${TextColor.Magenta}${this}\x1b[0m`;
};
String.prototype.Cyan = function () {
    return `${TextColor.Cyan}${this}\x1b[0m`;
};
String.prototype.White = function () {
    return `${TextColor.White}${this}\x1b[0m`;
};
//# sourceMappingURL=Color.js.map