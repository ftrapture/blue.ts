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
    requestQueue = [];
    isProcessingQueue = false;
    rateLimitDelay = 1000; // Delay in milliseconds between requests to avoid rate limiting.
    /**
     * Constructs a new SoundCloud instance.
     * @param blue - The Blue instance.
     */
    constructor(blue) {
        this.blue = blue;
    }
    /**
     * Adds a request to the queue and processes the queue.
     * @param requestFn - The request function to add to the queue.
     */
    async addToQueue(requestFn) {
        this.requestQueue.push(requestFn);
        if (!this.isProcessingQueue) {
            this.processQueue();
        }
    }
    /**
     * Processes the request queue with a delay between requests.
     */
    async processQueue() {
        this.isProcessingQueue = true;
        while (this.requestQueue.length > 0) {
            const requestFn = this.requestQueue.shift();
            if (requestFn) {
                try {
                    await requestFn();
                }
                catch (error) {
                    console.error(error); // Log the error
                }
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
        }
        this.isProcessingQueue = false;
    }
    /**
     * Searches for tracks on SoundCloud.
     * @param query - The query to search for.
     * @returns A promise resolving to any or an Error.
     */
    async search(query) {
        return new Promise((resolve, reject) => {
            this.addToQueue(async () => {
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
                    resolve(data);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
}
exports.default = SoundCloud;
//# sourceMappingURL=SoundCloud.js.map