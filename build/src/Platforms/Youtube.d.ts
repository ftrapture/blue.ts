import { Blue } from "../Connectors/Node";
/**
 * Youtube class for handling YouTube operations.
 */
declare class Youtube {
    readonly blue: Blue;
    private requestQueue;
    private isProcessingQueue;
    private rateLimitDelay;
    /**
     * Constructs a new Youtube instance.
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
     * Searches for tracks on YouTube.
     * @param query - The query to search for.
     * @param type - The type of search (default is "ytmsearch").
     * @returns A promise resolving to any or an Error.
     */
    search(query: string, type?: string): Promise<any | Error>;
}
export default Youtube;
