"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const QueueManager_1 = __importDefault(require("../Manager/QueueManager"));
const Track_1 = __importDefault(require("../Structure/Track"));
/**
 * Spotify class for handling Spotify operations.
 */
class Spotify {
    blue;
    client_id;
    client_secret;
    base64Auth;
    baseUrl;
    accessToken;
    interval;
    isRatelimited;
    queue;
    requestQueue = [];
    isProcessingQueue = false;
    /**
     * Constructs a new Spotify instance.
     * @param blue - The Blue instance.
     */
    constructor(blue) {
        this.blue = blue;
        this.client_id = this.blue.options["spotify"]?.client_id || false;
        this.client_secret = this.blue.options["spotify"]?.client_secret || false;
        this.base64Auth = Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64');
        this.baseUrl = "https://api.spotify.com/v1/";
        this.accessToken = "";
        this.queue = new QueueManager_1.default();
        this.isRatelimited = false;
        this.interval = 0;
        this.initialize();
    }
    /**
     * Initializes the Spotify instance by obtaining an access token.
     * @returns A promise resolving to void.
     */
    async initialize() {
        try {
            const response = await axios_1.default.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${this.base64Auth}`,
                },
            }).catch(() => null);
            this.ratelimitCheck(response);
            if (!response?.data)
                return null;
            this.accessToken = response.data.access_token;
            this.interval = response.data.expires_in * 1000;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    /**
     * Refreshes the access token of Spotify
     */
    async refresh() {
        if (Date.now() >= this.interval) {
            await this.initialize();
        }
    }
    /**
     * Adds a request to the queue and processes the queue.
     * @param requestFn - The request function to add to the queue.
     */
    async addToQueue(requestFn) {
        this.requestQueue.push(requestFn);
        if (!this.isProcessingQueue) {
            this.processQueue();
        }
    }
    /**
     * Processes the request queue.
     */
    async processQueue() {
        this.isProcessingQueue = true;
        while (this.requestQueue.length > 0) {
            const requestFn = this.requestQueue.shift();
            if (requestFn) {
                try {
                    await requestFn();
                }
                catch (error) {
                    if (error.message.includes('429') || error.message.includes('ratelmit')) {
                        this.isRatelimited = true;
                        const delay = parseInt(error.response.headers['retry-after']) * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        this.isRatelimited = false;
                    }
                    else {
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
    async search(query, type = "track") {
        return new Promise((resolve, reject) => {
            this.addToQueue(async () => {
                try {
                    const response = await this.request("search", query, type);
                    if (!response || !response.data)
                        return resolve(null);
                    resolve(new Track_1.default(this.buildTrack({
                        title: `${response.data.tracks.items[0].name}`,
                        author: response.data?.tracks.items[0].artists.length ? `${response.data?.tracks.items[0].artists.map((n) => n.name).join(" ")}` : "Unknown",
                        id: response.data.tracks.items[0].id,
                        url: response.data.tracks.items[0].external_urls.spotify,
                        isrc: response.data.tracks.items[0].external_ids.isrc,
                        duration: response.data.tracks.items[0].duration_ms,
                        type: "track"
                    })));
                }
                catch (error) {
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
    async getSpotifyEntityInfo(url) {
        return new Promise((resolve, reject) => {
            this.addToQueue(async () => {
                try {
                    await this.refresh();
                    const entityDetails = this.extractEntityDetails(url);
                    if (!entityDetails)
                        return resolve(null);
                    const { entityType, entityId } = entityDetails;
                    const [entityInfo] = await Promise.all([
                        this.fetchEntityInfo(entityType, entityId),
                    ]);
                    if (!entityInfo)
                        return resolve(null);
                    const processedTracks = this.processTracks(entityType, entityInfo?.tracks ? entityInfo.tracks.items : entityInfo?.items || [entityInfo]);
                    resolve(this.constructResponse(entityType, entityInfo, processedTracks));
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async request(name, query, type, headers, method) {
        await this.refresh();
        if (this.isRatelimited)
            throw new Error('we just hit an error 429: ratelimit');
        if (!this.baseUrl || !this.accessToken || !query || !type)
            return null;
        switch (name) {
            case "search":
                const res = await axios_1.default.get(`${this.baseUrl}search?q=${encodeURIComponent(query)}&type=${type}`, {
                    headers: { 'Authorization': `Bearer ${this.accessToken}` }
                }).catch(() => null);
                this.ratelimitCheck(res);
                return res;
            case "tracks":
                const res1 = await axios_1.default.get(`${query}${type}`, {
                    headers: { 'Authorization': `Bearer ${this.accessToken}` }
                }).catch(() => null);
                this.ratelimitCheck(res1);
                return res1;
            default:
                const res2 = await axios_1.default[method](`${query}${type}`, headers).catch(() => null);
                this.ratelimitCheck(res2);
                return res2;
        }
    }
    async ratelimitCheck(req) {
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
    extractEntityDetails(url) {
        const regex = /https?:\/\/open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)(\?si=[a-zA-Z0-9]+)?/;
        const match = url.match(regex);
        if (!match)
            return null;
        return { entityType: match[1], entityId: match[2] };
    }
    /**
     * Fetches information about the specified Spotify entity.
     * @param entityType - The type of the entity (playlist, album, track, artist).
     * @param entityId - The ID of the entity.
     * @returns A promise resolving to the entity information or null.
     */
    async fetchEntityInfo(entityType, entityId) {
        try {
            if (entityType === 'playlist')
                return (await this.fetchAllPlaylistTracks(entityId));
            const response = await this.request("tracks", `${this.baseUrl}${entityType}s/`, `${entityId}`);
            if (!response)
                throw new Error("couldn't fetch the metadata of the given link.");
            return response.data;
        }
        catch (e) {
            throw new Error(e);
        }
    }
    /**
     * Processes the tracks to create an array of TrackStructure objects.
     * @param entityType - The type of the entity (playlist, album, track, artist).
     * @param tracks - The array of tracks to process.
     * @returns An array of TrackStructure objects.
     */
    processTracks(entityType, tracks) {
        return tracks.map((d) => {
            let trackInfo;
            switch (entityType) {
                case 'album':
                    trackInfo = {
                        title: d.name,
                        author: d.artists.map((n) => n.name).join(" "),
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
                        author: d.artists.map((n) => n.name).join(", "),
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
                        author: d.artists.map((n) => n.name).join(" "),
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
                        author: d.artists.map((n) => n.name).join(" "),
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
            return new Track_1.default(this.buildTrack(trackInfo));
        });
    }
    /**
     * Constructs the response object based on the entity type and processed tracks.
     * @param entityType - The type of the entity (playlist, album, track, artist).
     * @param entityInfo - The entity information.
     * @param processedTracks - The processed tracks.
     * @returns The final response object.
     */
    constructResponse(entityType, entityInfo, processedTracks) {
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
    async fetchAllPlaylistTracks(playlistId) {
        const allTracks = [];
        let offset = 0;
        let totalTracks = 0;
        let info = await this.request("playlist", `${this.baseUrl}playlists/`, playlistId, { headers: { 'Authorization': `Bearer ${this.accessToken}` } }, "get");
        let data = info.data;
        delete data.tracks;
        try {
            while (true) {
                const res = await this.request("playlist", `${this.baseUrl}playlists/`, `${playlistId}/tracks`, {
                    params: { offset, limit: 100 },
                    headers: { 'Authorization': `Bearer ${this.accessToken}` }
                }, "get");
                if (!res.data || res.data.items.length === 0)
                    break;
                totalTracks += res.data.items.length;
                allTracks.push(...res.data.items.map((item) => item.track));
                offset += 100;
                if (totalTracks >= res.data.total)
                    break;
            }
            return { ...data, items: allTracks };
        }
        catch (error) {
            throw new Error(error);
        }
    }
    /**
     * Retrieves Spotify recommendations based on a track ID.
     * @param currentTrackId - ID of the current Spotify track.
     * @returns An array of recommended tracks.
     */
    async getRecommendations(currentTrackId) {
        return new Promise((resolve, reject) => {
            this.addToQueue(async () => {
                try {
                    await this.refresh();
                    const response = await this.request("tracks", `${this.baseUrl}recommendations?seed_tracks=`, `${currentTrackId}`);
                    if (!response?.data)
                        return resolve(null);
                    const recommendations = response.data.tracks.map((d) => {
                        return new Track_1.default(this.buildTrack({
                            title: d.name,
                            author: d.artists.map((n) => n.name).join(", "),
                            id: d.id,
                            duration: d.duration_ms,
                            url: `https://open.spotify.com/track/${d.id}`,
                            type: "recommend_track"
                        }));
                    });
                    resolve({ loadType: "playlist", data: { tracks: recommendations } });
                }
                catch (error) {
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
    buildTrack(track) {
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
exports.default = Spotify;
//# sourceMappingURL=Spotify.js.map