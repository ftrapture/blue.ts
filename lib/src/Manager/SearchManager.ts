import { fetch } from "undici";
import YoutubeEngine from "../Platforms/Youtube";
import SoundcloudEngine from "../Platforms/SoundCloud";
import SpotifyEngine from "../Platforms/Spotify";
import Types from "../Utils/Types";
import { Blue } from "../Connectors/Node";
import Methods from "../Utils/Methods";
import Track from "../Structure/Track";
import SearchLoader from "../Structure/SearchLoader";

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
class Search {
    public readonly blue: Blue;
    public readonly youtube: Youtube;
    public readonly spotify: Spotify;
    public readonly soundcloud: Soundcloud;
    public source: string;
    private requestQueue: (() => Promise<void>)[] = [];
    private isProcessingQueue: boolean = false;
    private rateLimitDelay: number = 1000;
    /**
     * Constructs a new Search instance.
     * @param blue - The Blue instance.
     */
    constructor(blue: any) {
        this.blue = blue;
        this.youtube = new YoutubeEngine(this.blue);
        this.spotify = new SpotifyEngine(this.blue);
        this.soundcloud = new SoundcloudEngine(this.blue);
        this.source = this.blue.options.defaultSearchEngine;
    }

    /**
     * Fetches data based on the provided parameter.
     * @param param - The parameter to fetch data.
     * @returns A promise resolving to any.
     */
    public async fetch(param: any): Promise<unknown | any> {
        const query = typeof param === "string" ? param : param?.query || null;
        if (!query) 
          return {
            loadType: Types.LOAD_EMPTY,
            data: {}
          };
        if (param.source && this.blue.util.platforms[param.source.toLowerCase()]) { 
          this.source = this.blue.util.platforms[param.source.toLowerCase()];
          if(this.blue.blocked_platforms.includes(param.source.toLowerCase())) 
            return {
              loadType: Types.LOAD_EMPTY,
              data: {}
            };
        }

        for(const blocked of this.blue.blocked_platforms) {
          if(query.includes(`${this.blue.util.platforms[blocked.toLowerCase()]}:`)) 
            return {
              loadType: Types.LOAD_EMPTY,
              data: {}
            };
        }
        const isUrl = this.isValidUrl(query);
      
        if (isUrl) {
          const isBlocked = this.isBlockedUrl(query);
          if(isBlocked)
             return {
              loadType: Types.LOAD_EMPTY,
              data: {}
             };
          return this.handleUrlQuery(query);
        }
      
        return this.handleNonUrlQuery(query);
      }

    /**
     * Checks if a given string is a valid URL.
     * @param query - The string to check.
     * @returns True if the string is a valid URL, false otherwise.
     */
      private isValidUrl(query: string): boolean {
        const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/gi;
        return urlRegex.test(query);
      }

      /**
       * @param url: URL
       * @returns either true or false statement
       */
      private isBlockedUrl(url: URL): boolean {
        try {
          const parsedUrl = new URL(url);
          const hostname = parsedUrl.hostname;
    
          for (let platform of this.blue.blocked_platforms) {
            if (hostname.includes(platform.replace(" ", ""))) return true;
          }
          return false;
        } catch (e) {
          return true;
        }
      }

    /**
     * Handles a URL query.
     * @param query - The URL query.
     * @returns A promise resolving to any.
     */
      private async handleUrlQuery(query: string): Promise<any> {
        const spotifyEntityInfo = await this.spotify.getSpotifyEntityInfo(query).catch(() => null);
        if ([Types.LOAD_ALBUM, Types.LOAD_PLAYLIST, "album_or_artist"].includes(spotifyEntityInfo?.loadType)) {
          return {
            ...new SearchLoader(spotifyEntityInfo),
            ...spotifyEntityInfo
          };
        }
      
        if (spotifyEntityInfo?.loadType === Types.LOAD_TRACK) {
          let tracks;
          if (this.source.startsWith("ytsearch") || this.source.startsWith("ytmsearch")) {
              tracks = await this.youtube.search(`${spotifyEntityInfo.data.info.title} ${spotifyEntityInfo.data.info.author}`, "ytmsearch").catch(() => null);
          } else {
              tracks = await this.soundcloud.search(`${spotifyEntityInfo.data.info.title} ${spotifyEntityInfo.data.info.author}`).catch(() => null);
          }

          const track = {
            loadType: Types.LOAD_TRACK,
            data: tracks.data[0]
          }
          
          track.data.info.sourceName = spotifyEntityInfo.data.info.sourceName;
          track.data.info.isrc = spotifyEntityInfo.data.info.isrc;
          track.data.type = spotifyEntityInfo.data.type;
          track.data.info.uri = spotifyEntityInfo.data.info.uri;
          
          return new SearchLoader(track);
        }
      
        const track = await this.fetchRawData(`${this.blue.version}/loadtracks`, `identifier=${encodeURIComponent(query)}`);
        return new SearchLoader(track);
      }

    /**
     * Handles a non-URL query.
     * @param query - The non-URL query.
     * @returns A promise resolving to any.
     */
      private async handleNonUrlQuery(query: string): Promise<any> {
        let data: any;
        switch (this.source) {
          case "ytsearch":
          case "ytmsearch":
            data = await this.youtube.search(query, this.source).catch(() => null);
            break;
          case "scsearch":
            data = await this.soundcloud.search(query).catch(() => null);
            break;
          case "spsearch":
            data = await this.spotify.search(query).catch(() => null);
            if (data) {
              const tracks: any = await this.youtube.search(`${data.info.title} ${data.info.author}`, "ytmsearch").catch(() => null);
              if(!tracks) return {
                loadType: Types.LOAD_EMPTY,
                data: {}
              };
              let builtTracks: Track[] = [];
             for(let i: number = 0; i < tracks.data.length; i++) {
                tracks.data[i].info.sourceName = data.info.sourceName;
                tracks.data[i].info.isrc = data.info.isrc;
                tracks.data[i].type = data.type;
                tracks.data[i].info.uri = data.info.uri;
                builtTracks.push(tracks.data[i]);
             }
             
              return new SearchLoader(tracks);
            }
            break;
          default:
            data = await this.youtube.search(query, "ytsearch").catch(() => null);
        }
      
        return new SearchLoader(data);
      }

    /**
     * Adds a request to the queue and processes the queue.
     * @param requestFn - The request function to add to the queue.
     */
    private async addToQueue(requestFn: () => Promise<void>): Promise<void> {
      this.requestQueue.push(requestFn);
      if (!this.isProcessingQueue) {
          this.processQueue();
      }
  }

  /**
   * Processes the request queue with a delay between requests.
   */
  private async processQueue(): Promise<void> {
      this.isProcessingQueue = true;
      while (this.requestQueue.length > 0) {
          const requestFn = this.requestQueue.shift();
          if (requestFn) {
              try {
                  await requestFn();
              } catch (error) {
                  console.error(error); // Log the error
              }
              await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
          }
      }
      this.isProcessingQueue = false;
  }

  /**
   * Fetches raw data from the specified endpoint.
   * @param endpoint - The endpoint to fetch from.
   * @param identifier - The identifier for the data.
   * @returns A promise resolving to any.
   */
  public async fetchRawData(endpoint: string, identifier: string): Promise<any> {
      return new Promise((resolve, reject) => {
          this.addToQueue(async () => {
              try {
                  const url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}/${endpoint}?${identifier}`;
                  const response = await fetch(url, {
                      method: Methods.Get,
                      headers: {
                          "Content-Type": "application/json",
                          'Authorization': this.blue.options.password
                      }
                  });

                  if (!response.ok) {
                      throw new Error(`Failed to fetch data: ${response.statusText}`);
                  }

                  const data = await response.json();
                  resolve(data);
              } catch (e) {
                  console.log(e);
                  reject(new Error(`Unable to fetch data from the Lavalink server.`));
              }
          });
      });
  }
}

export default Search;
