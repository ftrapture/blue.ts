import Queue from "../Manager/QueueManager";
import TrackStructure from "../Structure/Track";
import { Blue } from "../Connectors/Node";
/**
 * Interface representing a track.
 */
export interface Track {
    encoded: string | null;
    info: {
        identifier: string | null | undefined;
        author: string | null | undefined;
        length: number | null | undefined;
        isStream: boolean | null | undefined;
        title: string | null | undefined;
        uri: string | null | undefined;
        sourceName: string | null | undefined;
        position: number | null | undefined;
        artworkUrl: string | null | undefined;
        isrc: string | number | null | undefined;
    };
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
    readonly queue: Queue;
    /**
     * Constructs a new Spotify instance.
     * @param blue - The Blue instance.
     */
    constructor(blue: Blue);
    /**
     * Searches for a track on Spotify.
     * @param query - The query to search for.
     * @param type - The type of search (default is "track").
     * @returns A promise resolving to a Track or an Error.
     */
    search(query: string, type?: string): Promise<TrackStructure | Error>;
    /**
     * Initializes the Spotify instance by obtaining an access token.
     * @returns A promise resolving to void.
     */
    initialize(): Promise<void>;
    /**
     * Retrieves information about a Spotify entity (track, album, or playlist) from its URL.
     * @param url - The URL of the Spotify entity.
     * @returns A promise resolving to the entity information or null.
     */
    getSpotifyEntityInfo(url: string): Promise<any>;
    /**
     *
     * @param playlistId - spotify playlist identifier
     * @returns the playlist tracks in an array
     */
    private fetchAllPlaylistTracks;
    /**
     *
     * @param currentTrackId - id of the spotify tracks.
     * @returns an array of build tracks of spotify recommendations.
     */
    getRecommendations(currentTrackId: string): Promise<any>;
    /**
     * Builds a Track object.
     * @param track - The track data.
     * @returns A Track object.
     */
    buildTrack(track: any): Track;
}
export default Spotify;
