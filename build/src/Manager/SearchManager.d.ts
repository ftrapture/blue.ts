import YoutubeEngine from "../Platforms/Youtube";
import SoundcloudEngine from "../Platforms/SoundCloud";
import SpotifyEngine from "../Platforms/Spotify";
interface Blue {
    nodes: any;
    _options: any;
    options: any;
    version: string;
    node: any;
    load: any;
    _nodes: any[];
    util: any;
    client: any;
    voiceState: any;
    players: Map<string, any>;
}
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
declare class Search {
    readonly blue: Blue;
    readonly youtube: Youtube;
    readonly spotify: Spotify;
    readonly soundcloud: Soundcloud;
    source: string;
    constructor(blue: any);
    fetch(param: any): Promise<any>;
    fetchRawData(endpoint: string, identifier: string): Promise<unknown>;
}
export default Search;
