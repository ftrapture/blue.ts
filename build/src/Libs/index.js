"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Discord_1 = __importDefault(require("./Discord"));
var Oceanic_1 = __importDefault(require("./Oceanic"));
var Eris_1 = __importDefault(require("./Eris"));
var Libs_1 = __importDefault(require("../Utils/Libs"));
var Library = /** @class */ (function () {
    function Library(lib, blue) {
        this.lib = lib;
        this.blue = blue;
    }
    Library.prototype.main = function () {
        var _this = this;
        switch (this.lib) {
            case Libs_1.default.DiscordJs:
                this.blue.send = function (data) { return new Discord_1.default(_this.blue).send(data); };
                break;
            case Libs_1.default.Eris:
                this.blue.send = function (data) { return new Eris_1.default(_this.blue).send(data); };
                break;
            case Libs_1.default.OceanicJS:
                this.blue.send = function (data) { return new Oceanic_1.default(_this.blue).send(data); };
                break;
            default:
                throw new Error("Not supported library.");
        }
    };
    return Library;
}());
exports.default = Library;
