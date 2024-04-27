import Queue from "../Manager/QueueManager";
interface Track {
    trackToken: string | null;
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
    pluginInfo: any;
    type: string;
    userData: any;
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
    search(query: string, type?: string): Promise<string>;
    initialize(): Promise<void>;
    getSpotifyEntityInfo(url: string): Promise<{
        name: any;
        type: string;
        url: any;
        length: number;
        items: any[];
        track?: undefined;
        description?: undefined;
        owner?: undefined;
        followers?: undefined;
    } | {
        track: string;
        name?: undefined;
        type?: undefined;
        url?: undefined;
        length?: undefined;
        items?: undefined;
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
        items: any[];
        track?: undefined;
    }>;
    buildTrack(track: any): Track;
}
export default Spotify;
