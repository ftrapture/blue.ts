"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const undici_1 = require("undici");
const Youtube_1 = __importDefault(require("../Platforms/Youtube"));
const SoundCloud_1 = __importDefault(require("../Platforms/SoundCloud"));
const Spotify_1 = __importDefault(require("../Platforms/Spotify"));
const Types_1 = __importDefault(require("../Utils/Types"));
const Methods_1 = __importDefault(require("../Utils/Methods"));
const SearchLoader_1 = __importDefault(require("../Structure/SearchLoader"));
/**
 * Search class for handling search operations.
 */
class Search {
    blue;
    youtube;
    spotify;
    soundcloud;
    source;
    requestQueue = [];
    isProcessingQueue = false;
    rateLimitDelay = 1000;
    /**
     * Constructs a new Search instance.
     * @param blue - The Blue instance.
     */
    constructor(blue) {
        this.blue = blue;
        this.youtube = new Youtube_1.default(this.blue);
        this.spotify = new Spotify_1.default(this.blue);
        this.soundcloud = new SoundCloud_1.default(this.blue);
        this.source = this.blue.options.defaultSearchEngine;
    }
    /**
     * Fetches data based on the provided parameter.
     * @param param - The parameter to fetch data.
     * @returns A promise resolving to any.
     */
    async fetch(param) {
        const query = typeof param === "string" ? param : param?.query || null;
        if (!query)
            return {
                loadType: Types_1.default.LOAD_EMPTY,
                data: {}
            };
        if (param.source && this.blue.util.platforms[param.source.toLowerCase()]) {
            this.source = this.blue.util.platforms[param.source.toLowerCase()];
            if (this.blue.blocked_platforms.includes(param.source.toLowerCase()))
                return {
                    loadType: Types_1.default.LOAD_EMPTY,
                    data: {}
                };
        }
        for (const blocked of this.blue.blocked_platforms) {
            if (query.includes(`${this.blue.util.platforms[blocked.toLowerCase()]}:`))
                return {
                    loadType: Types_1.default.LOAD_EMPTY,
                    data: {}
                };
        }
        const isUrl = this.isValidUrl(query);
        if (isUrl) {
            const isBlocked = this.isBlockedUrl(query);
            if (isBlocked)
                return {
                    loadType: Types_1.default.LOAD_EMPTY,
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
    isValidUrl(query) {
        const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/gi;
        return urlRegex.test(query);
    }
    /**
     * @param url: URL
     * @returns either true or false statement
     */
    isBlockedUrl(url) {
        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname;
            for (let platform of this.blue.blocked_platforms) {
                if (hostname.includes(platform.replace(" ", "")))
                    return true;
            }
            return false;
        }
        catch (e) {
            return true;
        }
    }
    /**
     * Handles a URL query.
     * @param query - The URL query.
     * @returns A promise resolving to any.
     */
    async handleUrlQuery(query) {
        const spotifyEntityInfo = await this.spotify.getSpotifyEntityInfo(query).catch(() => null);
        if ([Types_1.default.LOAD_ALBUM, Types_1.default.LOAD_PLAYLIST, "album_or_artist"].includes(spotifyEntityInfo?.loadType)) {
            return {
                ...new SearchLoader_1.default(spotifyEntityInfo),
                ...spotifyEntityInfo
            };
        }
        if (spotifyEntityInfo?.loadType === Types_1.default.LOAD_TRACK) {
            let tracks;
            if (this.source.startsWith("ytsearch") || this.source.startsWith("ytmsearch")) {
                tracks = await this.youtube.search(`${spotifyEntityInfo.data.info.title} ${spotifyEntityInfo.data.info.author}`, "ytmsearch").catch(() => null);
            }
            else {
                tracks = await this.soundcloud.search(`${spotifyEntityInfo.data.info.title} ${spotifyEntityInfo.data.info.author}`).catch(() => null);
            }
            const track = {
                loadType: Types_1.default.LOAD_TRACK,
                data: tracks.data[0]
            };
            track.data.info.sourceName = spotifyEntityInfo.data.info.sourceName;
            track.data.info.isrc = spotifyEntityInfo.data.info.isrc;
            track.data.type = spotifyEntityInfo.data.type;
            track.data.info.uri = spotifyEntityInfo.data.info.uri;
            return new SearchLoader_1.default(track);
        }
        const track = await this.fetchRawData(`${this.blue.version}/loadtracks`, `identifier=${encodeURIComponent(query)}`);
        return new SearchLoader_1.default(track);
    }
    /**
     * Handles a non-URL query.
     * @param query - The non-URL query.
     * @returns A promise resolving to any.
     */
    async handleNonUrlQuery(query) {
        let data;
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
                    const tracks = await this.youtube.search(`${data.info.title} ${data.info.author}`, "ytmsearch").catch(() => null);
                    if (!tracks)
                        return {
                            loadType: Types_1.default.LOAD_EMPTY,
                            data: {}
                        };
                    let builtTracks = [];
                    for (let i = 0; i < tracks.data.length; i++) {
                        tracks.data[i].info.sourceName = data.info.sourceName;
                        tracks.data[i].info.isrc = data.info.isrc;
                        tracks.data[i].type = data.type;
                        tracks.data[i].info.uri = data.info.uri;
                        builtTracks.push(tracks.data[i]);
                    }
                    return new SearchLoader_1.default(tracks);
                }
                break;
            default:
                data = await this.youtube.search(query, "ytsearch").catch(() => null);
        }
        return new SearchLoader_1.default(data);
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
     * Processes the request queue with a delay between requests.
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
    async fetchRawData(endpoint, identifier) {
        return new Promise((resolve, reject) => {
            this.addToQueue(async () => {
                try {
                    const url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}/${endpoint}?${identifier}`;
                    const response = await (0, undici_1.fetch)(url, {
                        method: Methods_1.default.Get,
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
                }
                catch (e) {
                    console.log(e);
                    reject(new Error(`Unable to fetch data from the Lavalink server.`));
                }
            });
        });
    }
}
exports.default = Search;
//# sourceMappingURL=SearchManager.js.map