import { Blue } from "../Connectors/Node";
/**
 * SoundCloud class for handling SoundCloud operations.
 */
declare class SoundCloud {
    readonly blue: Blue;
    /**
     * Constructs a new SoundCloud instance.
     * @param blue - The Blue instance.
     */
    constructor(blue: any);
    /**
     * Searches for tracks on SoundCloud.
     * @param query - The query to search for.
     * @returns A promise resolving to any or an Error.
     */
    search(query: string): Promise<any | Error>;
}
export default SoundCloud;
