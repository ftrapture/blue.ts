import axios from "axios";
import Queue from "../Manager/QueueManager";
import TrackStructure from "../Structure/Track";
import { Blue } from "../Connectors/Node";
import { Info } from "../Structure/SearchLoader";
import SearchLoader from "../Structure/SearchLoader";

/**
 * Interface representing a track.
 */
export interface Track {
    encoded: string | unknown,
    info: Info,
    type: string
}

/**
 * Spotify class for handling Spotify operations.
 */
class Spotify {
    public readonly blue: Blue;
    public readonly client_id: string | boolean;
    public readonly client_secret: string | boolean;
    public readonly base64Auth: string;
    public readonly baseUrl: string;
    public accessToken: string;
    public interval: number;
    public isRatelimited: boolean;
    public readonly queue: Queue;
    private requestQueue: (() => Promise<void>)[] = [];
    private isProcessingQueue: boolean = false;

    /**
     * Constructs a new Spotify instance.
     * @param blue - The Blue instance.
     */
    constructor(blue: Blue) {
        this.blue = blue;
        this.client_id = this.blue.options["spotify"]?.client_id || false;
        this.client_secret = this.blue.options["spotify"]?.client_secret || false;
        this.base64Auth = Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64');
        this.baseUrl = "https://api.spotify.com/v1/";
        this.accessToken = "";
        this.queue = new Queue();
        this.isRatelimited = false;
        this.interval = 0;
        this.initialize();
    }

    /**
     * Initializes the Spotify instance by obtaining an access token.
     * @returns A promise resolving to void.
     */
    public async initialize(): Promise<void | Error> {
        try {
            const response = await axios.post(
                'https://accounts.spotify.com/api/token',
                'grant_type=client_credentials',
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${this.base64Auth}`,
                    },
                }
            ).catch(() => null);
            this.ratelimitCheck(response);
            if (!response?.data) return null;
            this.accessToken = response.data.access_token;
            this.interval = response.data.expires_in * 1000;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Refreshes the access token of Spotify
     */
    public async refresh(): Promise<void> {
        if (Date.now() >= this.interval) {
            await this.initialize();
        }
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
     * Processes the request queue.
     */
    private async processQueue(): Promise<void> {
        this.isProcessingQueue = true;
        while (this.requestQueue.length > 0) {
            const requestFn = this.requestQueue.shift();
            if (requestFn) {
                try {
                    await requestFn();
                } catch (error) {
                    if (error.message.includes('429') || error.message.includes('ratelmit')) {
                        this.isRatelimited = true;
                        const delay = parseInt(error.response.headers['retry-after']) * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        this.isRatelimited = false;
                    } else {
                        throw error;
                    }
                }
            }
        }
        this.isProcessingQueue = false;
    }

    /**
     * Searches for a track on Spotify.
     * @param query - The query to search for.
     * @param type - The type of search (default is "track").
     * @returns A promise resolving to a Track or an Error.
     */
    public async search(query: string, type: string = "track"): Promise<TrackStructure | Error> {
        return new Promise((resolve, reject) => {
            this.addToQueue(async () => {
                try {
                    const response = await this.request("search", query, type);
                    if (!response || !response.data) return resolve(null);
                    resolve(new TrackStructure(this.buildTrack({
                        title: `${response.data.tracks.items[0].name}`,
                        author: response.data?.tracks.items[0].artists.length ? `${response.data?.tracks.items[0].artists.map((n: any) => n.name).join(" ")}` : "Unknown",
                        id: response.data.tracks.items[0].id,
                        url: response.data.tracks.items[0].external_urls.spotify,
                        isrc: response.data.tracks.items[0].external_ids.isrc,
                        duration: response.data.tracks.items[0].duration_ms,
                        type: "track"
                    })));
                } catch (error) {
                    reject(new Error(error));
                }
            });
        });
    }

    /**
     * Retrieves information about a Spotify entity (track, album, or playlist) from its URL.
     * @param url - The URL of the Spotify entity.
     * @returns A promise resolving to the entity information or null.
     */
    public async getSpotifyEntityInfo(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.addToQueue(async () => {
                try {
                    await this.refresh();
                    const entityDetails = this.extractEntityDetails(url);
                    if (!entityDetails) return resolve(null);

                    const { entityType, entityId } = entityDetails;

                    const [entityInfo] = await Promise.all([
                        this.fetchEntityInfo(entityType, entityId),
                    ]);

                    if (!entityInfo) return resolve(null);
                    
                    const processedTracks = this.processTracks(entityType, entityInfo?.tracks ? entityInfo.tracks.items : entityInfo?.items || [entityInfo]);
                    
                    resolve(this.constructResponse(entityType, entityInfo, processedTracks));
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    public async request(name: string, query: string, type: string, headers?: any, method?: string): Promise<any> {
        await this.refresh();
        if (this.isRatelimited) throw new Error('we just hit an error 429: ratelimit');
        if (!this.baseUrl || !this.accessToken || !query || !type) return null;
        switch (name) {
            case "search":
                const res = await axios.get(
                    `${this.baseUrl}search?q=${encodeURIComponent(query)}&type=${type}`, {
                        headers: { 'Authorization': `Bearer ${this.accessToken}` }
                    }).catch(() => null);
                this.ratelimitCheck(res);
                return res;
            case "tracks":
                const res1 = await axios.get(`${query}${type}`, {
                    headers: { 'Authorization': `Bearer ${this.accessToken}` }
                }).catch(() => null);
                this.ratelimitCheck(res1);
                return res1;
            default:
                const res2 = await axios[method](`${query}${type}`, headers).catch(() => null);
                this.ratelimitCheck(res2);
                return res2;
        }
    }

    public async ratelimitCheck(req: any): Promise<void> {
        if (req.headers.get('x-ratelimit-remaining') === '0') {
            this.isRatelimited = true;
            const delay = parseInt(req.headers.get('x-ratelimit-reset')) * 1000;
            setTimeout(() => {
                this.isRatelimited = false;
            }, delay);
            throw new Error('we just hit an error 429: ratelimit');
        }
    }

    /**
     * Extracts the entity type and ID from the given Spotify URL.
     * @param url - The Spotify URL.
     * @returns An object containing the entity type and ID or null if invalid URL.
     */
    private extractEntityDetails(url: string): { entityType: string, entityId: string } | null {
        const regex = /https?:\/\/open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)(\?si=[a-zA-Z0-9]+)?/;
        const match = url.match(regex);

        if (!match) return null;

        return { entityType: match[1], entityId: match[2] };
    }

    /**
     * Fetches information about the specified Spotify entity.
     * @param entityType - The type of the entity (playlist, album, track, artist).
     * @param entityId - The ID of the entity.
     * @returns A promise resolving to the entity information or null.
     */
    private async fetchEntityInfo(entityType: string, entityId: string): Promise<any> {
        try {
            if (entityType === 'playlist') return (await this.fetchAllPlaylistTracks(entityId));
            const response = await this.request("tracks", `${this.baseUrl}${entityType}s/`, `${entityId}`);
            if (!response) throw new Error("couldn't fetch the metadata of the given link.");
            return response.data;
        } catch(e) {
            throw new Error(e);
        }
    }

    /**
     * Processes the tracks to create an array of TrackStructure objects.
     * @param entityType - The type of the entity (playlist, album, track, artist).
     * @param tracks - The array of tracks to process.
     * @returns An array of TrackStructure objects.
     */
    private processTracks(entityType: string, tracks: any[]): TrackStructure[] {
        return tracks.map((d: any) => {
            let trackInfo;

            switch (entityType) {
                case 'album':
                    trackInfo = {
                        title: d.name,
                        author: d.artists.map((n: any) => n.name).join(" "),
                        id: d.id,
                        isrc: null,
                        duration: d.duration_ms,
                        url: d.external_urls.spotify,
                        type: "album_track"
                    };
                    break;
                case 'playlist':
                    trackInfo = {
                        title: d.name,
                        author: d.artists.map((n: any) => n.name).join(", "),
                        id: d.id,
                        isrc: d.external_ids.isrc,
                        duration: d.duration_ms,
                        url: d.external_urls.spotify,
                        type: "playlist_track"
                    };
                    break;
                case 'track':
                    trackInfo = {
                        title: d.name,
                        author: d.artists.map((n: any) => n.name).join(" "),
                        id: d.id,
                        isrc: d.external_ids.isrc,
                        duration: d.duration_ms,
                        url: d.external_urls.spotify,
                        type: "track"
                    };
                    break;
                case 'artist':
                    trackInfo = {
                        title: d.name,
                        author: d.artists.map((n: any) => n.name).join(" "),
                        id: d.id,
                        isrc: null,
                        duration: d.duration_ms,
                        url: d.external_urls.spotify,
                        type: "artist_top_track"
                    };
                    break;
                default:
                    return null;
            }

            return new TrackStructure(this.buildTrack(trackInfo));
        });
    }

    /**
     * Constructs the response object based on the entity type and processed tracks.
     * @param entityType - The type of the entity (playlist, album, track, artist).
     * @param entityInfo - The entity information.
     * @param processedTracks - The processed tracks.
     * @returns The final response object.
     */
    private constructResponse(entityType: string, entityInfo: any, processedTracks: TrackStructure[]): any {
        switch (entityType) {
            case 'artist':
            case 'album':
                return {
                    loadType: "album_or_artist",
                    name: entityInfo.name,
                    url: entityInfo.external_urls.spotify,
                    length: processedTracks.length,
                    data: { tracks: processedTracks }
                };
            case 'track':
                return {
                    loadType: "track",
                    data: processedTracks[0] 
                };
            case 'playlist':
                return {
                    name: entityInfo.name,
                    loadType: "playlist",
                    description: entityInfo.description,
                    url: entityInfo.external_urls.spotify,
                    owner: {
                        name: entityInfo.owner.display_name,
                        id: entityInfo.owner.id,
                        url: entityInfo.owner.external_urls.spotify
                    },
                    followers: entityInfo.followers.total,
                    length: processedTracks.length,
                    data: { tracks: processedTracks }
                };
            default:
                return null;
        }
    }

    /**
     * Fetches all tracks in a playlist.
     * @param playlistId - Spotify playlist identifier.
     * @returns The playlist tracks in an array.
     */
    private async fetchAllPlaylistTracks(playlistId: string): Promise<any> {
        const allTracks: any[] = [];
        let offset = 0;
        let totalTracks = 0;
        let info = await this.request("playlist", `${this.baseUrl}playlists/`, playlistId, { headers: { 'Authorization': `Bearer ${this.accessToken}` } }, "get");
        let data = info.data;
        delete data.tracks
        try {
            while (true) {
                const res = await this.request("playlist", `${this.baseUrl}playlists/`, `${playlistId}/tracks`, {
                    params: { offset, limit: 100 },
                    headers: { 'Authorization': `Bearer ${this.accessToken}` }
                }, "get")
    
                if (!res.data || res.data.items.length === 0) break;
    
                totalTracks += res.data.items.length;
                allTracks.push(...res.data.items.map((item: any) => item.track));
                offset += 100;
    
                if (totalTracks >= res.data.total) break;
            }
    
            return { ...data, items: allTracks };
        } catch (error) {
            throw new Error(error)
        }
    }
    
    /**
     * Retrieves Spotify recommendations based on a track ID.
     * @param currentTrackId - ID of the current Spotify track.
     * @returns An array of recommended tracks.
     */
    public async getRecommendations(currentTrackId: string): Promise<SearchLoader | null> {
        return new Promise((resolve, reject) => {
            this.addToQueue(async () => {
                try {
                    await this.refresh();
                    const response = await this.request("tracks", `${this.baseUrl}recommendations?seed_tracks=`, `${currentTrackId}`);
                    if (!response?.data) return resolve(null);

                    const recommendations = response.data.tracks.map((d: any) => {
                        return new TrackStructure(this.buildTrack({
                            title: d.name,
                            author: d.artists.map((n: any) => n.name).join(", "),
                            id: d.id,
                            duration: d.duration_ms,
                            url: `https://open.spotify.com/track/${d.id}`,
                            type: "recommend_track"
                        }));
                    });

                    resolve({ loadType: "playlist", data: { tracks: recommendations } });
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    /**
     * Builds a Track object.
     * @param track - The track data.
     * @returns A Track object.
     */
    buildTrack(track: any): Track {
        return {
            encoded: null,
            info: {
                identifier: track?.id || null,
                author: track?.author || null,
                length: track?.duration || null,
                isStream: false,
                isSeekable: true,
                title: track?.title || null,
                uri: track?.url || null,
                sourceName: "spotify",
                position: 0,
                artworkUrl: null,
                isrc: track?.isrc || null,
            },
            type: track.type
        };
    }
}

export default Spotify;
