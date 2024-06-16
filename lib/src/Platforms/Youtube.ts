import { fetch } from "undici";
import { Blue } from "../Connectors/Node";
import Methods from "../Utils/Methods";

/**
 * Youtube class for handling YouTube operations.
 */
class Youtube {
    public readonly blue: Blue;
    private requestQueue: (() => Promise<void>)[] = [];
    private isProcessingQueue: boolean = false;
    private rateLimitDelay: number = 1000; // Delay in milliseconds between requests to avoid rate limiting.

    /**
     * Constructs a new Youtube instance.
     * @param blue - The Blue instance.
     */
    constructor(blue: any) {
        this.blue = blue;
    }

    /**
     * Adds a request to the queue and processes the queue.
     * @param requestFn - The request function to add to the queue.
     */
    private async addToQueue(requestFn: () => Promise<void>): Promise<void> {
        this.requestQueue.push(requestFn);
        if (!this.isProcessingQueue) {
            this.processQueue();
        }
    }

    /**
     * Processes the request queue with a delay between requests.
     */
    private async processQueue(): Promise<void> {
        this.isProcessingQueue = true;
        while (this.requestQueue.length > 0) {
            const requestFn = this.requestQueue.shift();
            if (requestFn) {
                try {
                    await requestFn();
                } catch (error) {
                    console.error(error); // Log the error
                }
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
        }
        this.isProcessingQueue = false;
    }

    /**
     * Searches for tracks on YouTube.
     * @param query - The query to search for.
     * @param type - The type of search (default is "ytmsearch").
     * @returns A promise resolving to any or an Error.
     */
    public async search(query: string, type: string = "ytmsearch"): Promise<any | Error> {
        return new Promise((resolve, reject) => {
            this.addToQueue(async () => {
                try {
                    const url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}/${this.blue.version}/loadtracks?identifier=${encodeURIComponent(`${type}:${query}`)}`;

                    const response = await fetch(url, {
                        method: Methods.Get,
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
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
}

export default Youtube;
