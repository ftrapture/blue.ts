import { fetch } from "undici";
import YoutubeEngine from "../Platforms/Youtube";
import SoundcloudEngine from "../Platforms/SoundCloud";
import SpotifyEngine from "../Platforms/Spotify";
import Types from "../Utils/Types";

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

class Search {
    public readonly blue: Blue;
    public readonly  youtube: Youtube;
    public readonly  spotify: Spotify;
    public readonly  soundcloud: Soundcloud;
    public source: string;
    constructor(blue: any) {
        this.blue = blue;
        this.youtube = new YoutubeEngine(this.blue);
        this.spotify = new SpotifyEngine(this.blue);
        this.soundcloud = new SoundcloudEngine(this.blue);
        this.source = this.blue.options.defaultSearchEngine;
    }

    async fetch(param: any) {
        let query = typeof param === "string" ? param : param?.query ? param?.query : null;
        if(param?.source) this.source = param?.source;
        if (!query) return null;

        const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/gi;
        let result: any;

        if (urlRegex.test(query)) {
            const get_sp_link = await this.spotify.getSpotifyEntityInfo(query).catch(() => null);
            if (get_sp_link?.type === "album") {
                return {
                    loadType: Types.LOAD_SP_ALBUMS,
                    ...get_sp_link
                };
            } else if (get_sp_link?.type === "playlist") {
                return {
                    loadType: Types.LOAD_SP_PLAYLISTS,
                    ...get_sp_link
                };
            } else if (get_sp_link?.track) {
                if(this.source.startsWith("youtube"))
                    result = await this.youtube.search(get_sp_link?.track, "ytsearch").catch(() => null);
                  else 
                    result = await this.soundcloud.search(get_sp_link?.track).catch(() => null);
            } else {
                result = await this.fetchRawData(`${this.blue.version}/loadtracks`, `identifier=${encodeURIComponent(query)}`);
            }
        } else {
            let data: any;
            if (this.source === "youtube" || this.source === "youtube music" || this.source === "soundcloud") {
                switch (this.source) {
                    case "youtube":
                        data = await this.youtube.search(query, "ytsearch").catch(() => null);
                        break;
                    case "youtube music":
                        data = await this.youtube.search(query, "ytmsearch").catch(() => null);
                        break;
                    case "soundcloud":
                        data = await this.soundcloud.search(query).catch(() => null);
                        break;
                }
                if (!data) return null;
                return data;
             } else if (this.source === "spotify") {
                data = await this.spotify.search(query).catch(() => null);
                result = await this.youtube.search(data, "ytsearch").catch(() => null);
             } else {
                result = await this.youtube.search(query, "ytsearch").catch(() => null);
            }
        }

        return result;
    }

    async fetchRawData(endpoint: string, identifier: string) {
        try {
                const url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}/${endpoint}?${identifier}`;
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': this.blue.options.password
                    }
                });
    
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.statusText}`);
                }
                const data = await response.json();
            return data;
        } catch (e) {
            console.log(e)
            throw new Error(
                `Unable to fetch data from the Lavalink server.`
            );
        }
    }

}

export default Search;