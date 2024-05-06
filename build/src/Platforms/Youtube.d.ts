import { Blue } from "../Connectors/Node";
/**
 * Youtube class for handling YouTube operations.
 */
declare class Youtube {
    readonly blue: Blue;
    /**
     * Constructs a new Youtube instance.
     * @param blue - The Blue instance.
     */
    constructor(blue: any);
    /**
     * Searches for tracks on YouTube.
     * @param query - The query to search for.
     * @param type - The type of search (default is "ytmsearch").
     * @returns A promise resolving to any or an Error.
     */
    search(query: string, type?: string): Promise<any | Error>;
}
export default Youtube;
