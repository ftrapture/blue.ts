"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Discord_1 = __importDefault(require("./Discord"));
const Oceanic_1 = __importDefault(require("./Oceanic"));
const Eris_1 = __importDefault(require("./Eris"));
const Libs_1 = __importDefault(require("../Utils/Libs"));
/**
 * Library class
 */
class Library {
    /**
     * Instance of the blue client
     */
    blue;
    /**
     * Library name
     */
    lib;
    constructor(lib, blue) {
        this.lib = lib;
        this.blue = blue;
    }
    /**
     * Main function to initialize the library
     */
    main() {
        switch (this.lib) {
            case Libs_1.default.DiscordJs:
                this.blue.send = (data) => new Discord_1.default(this.blue).send(data);
                break;
            case Libs_1.default.Eris:
                this.blue.send = (data) => new Eris_1.default(this.blue).send(data);
                break;
            case Libs_1.default.OceanicJS:
                this.blue.send = (data) => new Oceanic_1.default(this.blue).send(data);
                break;
            default:
                throw new Error("Not supported library.");
        }
    }
}
exports.default = Library;
//# sourceMappingURL=index.js.map