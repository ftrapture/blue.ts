import Queue from "../Manager/QueueManager";
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
declare class Spotify {
    readonly blue: any;
    readonly client_id: string | boolean;
    readonly client_secret: string | boolean;
    readonly base64Auth: string;
    readonly baseUrl: string;
    accessToken: string;
    readonly queue: Queue;
    constructor(blue: any);
    search(query: string, type?: string): Promise<Track>;
    initialize(): Promise<void>;
    getSpotifyEntityInfo(url: string): Promise<Track | {
        name: any;
        type: string;
        url: any;
        length: number;
        tracks: any[];
        description?: undefined;
        owner?: undefined;
        followers?: undefined;
    } | {
        name: any;
        type: string;
        description: any;
        url: any;
        owner: {
            name: any;
            id: any;
            url: any;
        };
        followers: any;
        length: number;
        tracks: any[];
    }>;
    buildTrack(track: any): Track;
}
export default Spotify;
