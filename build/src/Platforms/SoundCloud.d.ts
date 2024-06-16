import { Blue } from "../Connectors/Node";
/**
 * SoundCloud class for handling SoundCloud operations.
 */
declare class SoundCloud {
    readonly blue: Blue;
    private requestQueue;
    private isProcessingQueue;
    private rateLimitDelay;
    /**
     * Constructs a new SoundCloud instance.
     * @param blue - The Blue instance.
     */
    constructor(blue: any);
    /**
     * Adds a request to the queue and processes the queue.
     * @param requestFn - The request function to add to the queue.
     */
    private addToQueue;
    /**
     * Processes the request queue with a delay between requests.
     */
    private processQueue;
    /**
     * Searches for tracks on SoundCloud.
     * @param query - The query to search for.
     * @returns A promise resolving to any or an Error.
     */
    search(query: string): Promise<any | Error>;
}
export default SoundCloud;
