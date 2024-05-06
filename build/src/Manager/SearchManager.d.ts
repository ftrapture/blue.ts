import YoutubeEngine from "../Platforms/Youtube";
import SoundcloudEngine from "../Platforms/SoundCloud";
import SpotifyEngine from "../Platforms/Spotify";
import { Blue } from "../Connectors/Node";
interface Youtube extends YoutubeEngine {
    blue: Blue;
}
interface Soundcloud extends SoundcloudEngine {
    blue: Blue;
}
interface Spotify extends SpotifyEngine {
    blue: Blue;
    client_id: string | boolean;
    client_secret: string | boolean;
    base64Auth: string;
    baseUrl: string;
    accessToken: string;
    queue: any;
}
/**
 * Search class for handling search operations.
 */
declare class Search {
    readonly blue: Blue;
    readonly youtube: Youtube;
    readonly spotify: Spotify;
    readonly soundcloud: Soundcloud;
    source: string;
    /**
     * Constructs a new Search instance.
     * @param blue - The Blue instance.
     */
    constructor(blue: any);
    /**
     * Fetches data based on the provided parameter.
     * @param param - The parameter to fetch data.
     * @returns A promise resolving to any.
     */
    fetch(param: any): Promise<any>;
    /**
     * Checks if a given string is a valid URL.
     * @param query - The string to check.
     * @returns True if the string is a valid URL, false otherwise.
     */
    private isValidUrl;
    /**
     * Handles a URL query.
     * @param query - The URL query.
     * @returns A promise resolving to any.
     */
    private handleUrlQuery;
    /**
     * Handles a non-URL query.
     * @param query - The non-URL query.
     * @returns A promise resolving to any.
     */
    private handleNonUrlQuery;
    /**
     * Fetches raw data from the specified endpoint.
     * @param endpoint - The endpoint to fetch from.
     * @param identifier - The identifier for the data.
     * @returns A promise resolving to any.
     */
    fetchRawData(endpoint: string, identifier: string): Promise<unknown>;
}
export default Search;
