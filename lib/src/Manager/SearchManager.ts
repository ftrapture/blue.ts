import { fetch } from "undici";
import YoutubeEngine from "../Platforms/Youtube";
import SoundcloudEngine from "../Platforms/SoundCloud";
import SpotifyEngine from "../Platforms/Spotify";
import Types from "../Utils/Types";
import TrackStructure from "../Structure/Track";

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
        const query = typeof param === "string" ? param : param?.query || null;
        if (!query) return null;
      
        if (param?.source) this.source = param.source;
      
        const isUrl = this.isValidUrl(query);
      
        if (isUrl) {
          return this.handleUrlQuery(query);
        }
      
        return this.handleNonUrlQuery(query);
      }
      
      private isValidUrl(query: string): boolean {
        const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/gi;
        return urlRegex.test(query);
      }
      
      private async handleUrlQuery(query: string) {
        const spotifyEntityInfo = await this.spotify.getSpotifyEntityInfo(query).catch(() => null);
      
        if (spotifyEntityInfo?.type === "album") {
          return {
            loadType: Types.LOAD_SP_ALBUMS,
            ...spotifyEntityInfo
          };
        }
      
        if (spotifyEntityInfo?.type === "playlist") {
          return {
            loadType: Types.LOAD_SP_PLAYLISTS,
            ...spotifyEntityInfo
          };
        }
      
        if (spotifyEntityInfo?.type === "track") {
          let tracks;
          if (this.source.startsWith("youtube")) {
              tracks = await this.youtube.search(`${spotifyEntityInfo.info.title} ${spotifyEntityInfo.info.author}`, "ytmsearch").catch(() => null);
          } else {
              tracks = await this.soundcloud.search(`${spotifyEntityInfo.info.title} ${spotifyEntityInfo.info.author}`).catch(() => null);
          }

          const track = tracks.data[0];
          
          track.info.sourceName = spotifyEntityInfo.info.sourceName;
          track.info.isrc = spotifyEntityInfo.info.isrc;
          track.type = spotifyEntityInfo.type;
          track.info.uri = spotifyEntityInfo.info.uri;
          return {
            loadType: Types.LOAD_SP_TRACK,
            tracks: [track]
          }
        }
      
        return (await this.fetchRawData(`${this.blue.version}/loadtracks`, `identifier=${encodeURIComponent(query)}`));
      }
      
      private async handleNonUrlQuery(query: string) {
        let data: any;
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
          case "spotify":
            data = await this.spotify.search(query).catch(() => null);
            if (data) {
              const tracks: any = await this.youtube.search(`${data.info.title} ${data.info.author}`, "ytmsearch").catch(() => null);
              if(!tracks) return null;
              let builtTracks: any[] = [];
             for(let i: number = 0; i < tracks.data.length; i++) {
                tracks.data[i].info.sourceName = data.info.sourceName;
                tracks.data[i].info.isrc = data.info.isrc;
                tracks.data[i].type = data.type;
                tracks.data[i].info.uri = data.info.uri;
                builtTracks.push(new TrackStructure(tracks.data[i]));
             }
             
              return {
                loadType: Types.LOAD_SP_TRACK,
                tracks: builtTracks
              }
            }
            break;
          default:
            data = await this.youtube.search(query, "ytsearch").catch(() => null);
        }
      
        return data;
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