"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const undici_1 = require("undici");
const Methods_1 = __importDefault(require("../Utils/Methods"));
/**
 * SoundCloud class for handling SoundCloud operations.
 */
class SoundCloud {
    blue;
    /**
     * Constructs a new SoundCloud instance.
     * @param blue - The Blue instance.
     */
    constructor(blue) {
        this.blue = blue;
    }
    /**
     * Searches for tracks on SoundCloud.
     * @param query - The query to search for.
     * @returns A promise resolving to any or an Error.
     */
    async search(query) {
        try {
            const type = "scsearch";
            const url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}/${this.blue.version}/loadtracks?identifier=${encodeURIComponent(`${type}:${query}`)}`;
            const response = await (0, undici_1.fetch)(url, {
                method: Methods_1.default.Get,
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': this.blue.options.password
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = SoundCloud;
//# sourceMappingURL=SoundCloud.js.map