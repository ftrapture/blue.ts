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
    queue;
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
        this.initialize();
    }
    /**
     * Searches for a track on Spotify.
     * @param query - The query to search for.
     * @param type - The type of search (default is "track").
     * @returns A promise resolving to a Track or an Error.
     */
    async search(query, type = "track") {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}search?q=${encodeURIComponent(query)}&type=${type}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                },
            }).catch(() => null);
            if (!response?.data)
                return null;
            return new Track_1.default(this.buildTrack({
                title: `${response.data.tracks.items[0].name}`,
                author: `${response.data?.tracks.items[0].artists.map((n) => n.name).join(" ")}`,
                id: response.data.tracks.items[0].id,
                url: response.data.tracks.items[0].external_urls.spotify,
                isrc: response.data.tracks.items[0].external_ids.isrc,
                duration: response.data.tracks.items[0].duration_ms,
                type: "track"
            }));
        }
        catch (error) {
            throw error;
        }
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
            if (!response?.data)
                return null;
            this.accessToken = response.data.access_token;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves information about a Spotify entity (track, album, or playlist) from its URL.
     * @param url - The URL of the Spotify entity.
     * @returns A promise resolving to the entity information or null.
     */
    async getSpotifyEntityInfo(url) {
        try {
            const regex = /https?:\/\/open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)(\?si=[a-zA-Z0-9]+)?/;
            const match = url.match(regex);
            if (!match)
                return null;
            const entityType = match[1];
            const entityId = match[2];
            let entityInfoPromise;
            let tracksPromise;
            switch (entityType) {
                case 'playlist':
                    entityInfoPromise = axios_1.default.get(`${this.baseUrl}${entityType}s/${entityId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    }).then(res => res.data).catch(() => null);
                    tracksPromise = this.fetchAllPlaylistTracks(entityId);
                    break;
                case 'album':
                case 'track':
                    entityInfoPromise = axios_1.default.get(`${this.baseUrl}${entityType}s/${entityId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    }).then(res => res.data).catch(() => null);
                    tracksPromise = axios_1.default.get(`${this.baseUrl}${entityType}s/${entityId}/tracks`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    }).then(res => res.data).catch(() => null);
                    break;
                case 'artist':
                    entityInfoPromise = axios_1.default.get(`${this.baseUrl}${entityType}s/${entityId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    }).then(res => res.data).catch(() => null);
                    tracksPromise = axios_1.default.get(`${this.baseUrl}${entityType}s/${entityId}/top-tracks`, {
                        params: {
                            country: 'US' // Assuming you want top tracks in the US
                        },
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    }).then(res => res.data).catch(() => null);
                    break;
                default:
                    return null;
            }
            const [entityInfo, tracks] = await Promise.all([entityInfoPromise, tracksPromise]);
            if (!entityInfo || !tracks)
                return null;
            const processedTracks = tracks.items.map((d) => {
                switch (entityType) {
                    case 'album':
                        return new Track_1.default(this.buildTrack({
                            title: `${d.name}`,
                            author: `${d.artists.map((n) => n.name).join(" ")}`,
                            id: d.id,
                            isrc: null,
                            duration: d.duration_ms,
                            url: d.external_urls.spotify,
                            type: "album_track"
                        }));
                    case 'playlist':
                        return new Track_1.default(this.buildTrack({
                            title: `${d.track.name}`,
                            author: `${d.track.artists.map((n) => n.name).join(", ")}`,
                            id: d.track.id,
                            isrc: d.track.external_ids.isrc,
                            duration: d.track.duration_ms,
                            url: d.track.external_urls.spotify,
                            type: "playlist_track"
                        }));
                    case 'track':
                        return new Track_1.default(this.buildTrack({
                            title: `${d.name}`,
                            author: `${d.artists.map((n) => n.name).join(" ")}`,
                            id: d.id,
                            isrc: d.external_ids.isrc,
                            duration: d.duration_ms,
                            url: d.external_urls.spotify,
                            type: "track"
                        }));
                    case 'artist':
                        return new Track_1.default(this.buildTrack({
                            title: `${d.name}`,
                            author: `${d.artists.map((n) => n.name).join(" ")}`,
                            id: d.id,
                            isrc: null, // Artist tracks don't have ISRC codes
                            duration: d.duration_ms,
                            url: d.external_urls.spotify,
                            type: "artist_top_track"
                        }));
                    default:
                        return null;
                }
            });
            switch (entityType) {
                case 'album':
                    return {
                        name: entityInfo.name,
                        type: "album",
                        url: entityInfo.external_urls.spotify,
                        length: processedTracks.length,
                        tracks: processedTracks
                    };
                case 'track':
                    return processedTracks[0];
                case 'playlist':
                    return {
                        name: entityInfo.name,
                        type: "playlist",
                        description: entityInfo.description,
                        url: entityInfo.external_urls.spotify,
                        owner: {
                            name: entityInfo.owner.display_name,
                            id: entityInfo.owner.id,
                            url: entityInfo.owner.external_urls.spotify
                        },
                        followers: entityInfo.followers.total,
                        length: processedTracks.length,
                        tracks: processedTracks
                    };
                case 'artist':
                    return {
                        name: entityInfo.name,
                        type: "artist",
                        url: entityInfo.external_urls.spotify,
                        length: processedTracks.length,
                        tracks: processedTracks
                    };
                default:
                    return null;
            }
        }
        catch (error) {
            throw error;
        }
    }
    /**
     *
     * @param playlistId - spotify playlist identifier
     * @returns the playlist tracks in an array
     */
    async fetchAllPlaylistTracks(playlistId) {
        const allTracks = [];
        let offset = 0;
        let totalTracks = 0;
        while (true) {
            const res = await axios_1.default.get(`${this.baseUrl}playlists/${playlistId}/tracks`, {
                params: {
                    offset: offset,
                    limit: 100
                },
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                },
            }).catch(() => null);
            if (!res || !res.data || res.data.items.length === 0) {
                break; // No more tracks or error occurred
            }
            // Increment total tracks count
            totalTracks += res.data.items.length;
            // Add tracks to the list
            allTracks.push(...res.data.items);
            // Update offset for the next request
            offset += 100;
            // Break if all tracks have been fetched
            if (totalTracks >= res.data.total) {
                break;
            }
        }
        return { items: allTracks }; // Return in the same format as other track requests
    }
    /**
     *
     * @param currentTrackId - id of the spotify tracks.
     * @returns an array of build tracks of spotify recommendations.
     */
    async getRecommendations(currentTrackId) {
        const response = await axios_1.default.get(`${this.baseUrl}recommendations?seed_tracks=${currentTrackId}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        }).catch(() => null);
        if (!response?.data)
            return null;
        let recommendations = [];
        response.data.tracks.map((d) => {
            recommendations.push(new Track_1.default(this.buildTrack({
                title: `${d.name}`,
                author: `${d.artists.map((n) => n.name).join(", ")}`,
                id: d.id,
                duration: d.duration_ms,
                url: `https://open.spotify.com/track/${d.id}`,
                type: "recommend_track"
            })));
        });
        return recommendations;
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