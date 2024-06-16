import Queue from "../Manager/QueueManager";
import TrackStructure from "../Structure/Track";
import { Blue } from "../Connectors/Node";
import { Info } from "../Structure/SearchLoader";
import SearchLoader from "../Structure/SearchLoader";
/**
 * Interface representing a track.
 */
export interface Track {
    encoded: string | unknown;
    info: Info;
    type: string;
}
/**
 * Spotify class for handling Spotify operations.
 */
declare class Spotify {
    readonly blue: Blue;
    readonly client_id: string | boolean;
    readonly client_secret: string | boolean;
    readonly base64Auth: string;
    readonly baseUrl: string;
    accessToken: string;
    interval: number;
    isRatelimited: boolean;
    readonly queue: Queue;
    private requestQueue;
    private isProcessingQueue;
    /**
     * Constructs a new Spotify instance.
     * @param blue - The Blue instance.
     */
    constructor(blue: Blue);
    /**
     * Initializes the Spotify instance by obtaining an access token.
     * @returns A promise resolving to void.
     */
    initialize(): Promise<void | Error>;
    /**
     * Refreshes the access token of Spotify
     */
    refresh(): Promise<void>;
    /**
     * Adds a request to the queue and processes the queue.
     * @param requestFn - The request function to add to the queue.
     */
    private addToQueue;
    /**
     * Processes the request queue.
     */
    private processQueue;
    /**
     * Searches for a track on Spotify.
     * @param query - The query to search for.
     * @param type - The type of search (default is "track").
     * @returns A promise resolving to a Track or an Error.
     */
    search(query: string, type?: string): Promise<TrackStructure | Error>;
    /**
     * Retrieves information about a Spotify entity (track, album, or playlist) from its URL.
     * @param url - The URL of the Spotify entity.
     * @returns A promise resolving to the entity information or null.
     */
    getSpotifyEntityInfo(url: string): Promise<any>;
    request(name: string, query: string, type: string, headers?: any, method?: string): Promise<any>;
    ratelimitCheck(req: any): Promise<void>;
    /**
     * Extracts the entity type and ID from the given Spotify URL.
     * @param url - The Spotify URL.
     * @returns An object containing the entity type and ID or null if invalid URL.
     */
    private extractEntityDetails;
    /**
     * Fetches information about the specified Spotify entity.
     * @param entityType - The type of the entity (playlist, album, track, artist).
     * @param entityId - The ID of the entity.
     * @returns A promise resolving to the entity information or null.
     */
    private fetchEntityInfo;
    /**
     * Processes the tracks to create an array of TrackStructure objects.
     * @param entityType - The type of the entity (playlist, album, track, artist).
     * @param tracks - The array of tracks to process.
     * @returns An array of TrackStructure objects.
     */
    private processTracks;
    /**
     * Constructs the response object based on the entity type and processed tracks.
     * @param entityType - The type of the entity (playlist, album, track, artist).
     * @param entityInfo - The entity information.
     * @param processedTracks - The processed tracks.
     * @returns The final response object.
     */
    private constructResponse;
    /**
     * Fetches all tracks in a playlist.
     * @param playlistId - Spotify playlist identifier.
     * @returns The playlist tracks in an array.
     */
    private fetchAllPlaylistTracks;
    /**
     * Retrieves Spotify recommendations based on a track ID.
     * @param currentTrackId - ID of the current Spotify track.
     * @returns An array of recommended tracks.
     */
    getRecommendations(currentTrackId: string): Promise<SearchLoader | null>;
    /**
     * Builds a Track object.
     * @param track - The track data.
     * @returns A Track object.
     */
    buildTrack(track: any): Track;
}
export default Spotify;
