"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const QueueManager_1 = __importDefault(require("../Manager/QueueManager"));
const Track_1 = __importDefault(require("../Structure/Track"));
class Spotify {
    blue;
    client_id;
    client_secret;
    base64Auth;
    baseUrl;
    accessToken;
    queue;
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
    async search(query, type = "track") {
        const response = await axios_1.default.get(`${this.baseUrl}search?q=${encodeURIComponent(query)}&type=${type}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
            },
        });
        return this.buildTrack({
            title: `${response.data.tracks.items[0].name}`,
            author: `${response.data?.tracks.items[0].artists.map((n) => n.name).join(" ")}`,
            id: response.data.tracks.items[0].id,
            url: response.data.tracks.items[0].external_urls.spotify,
            isrc: response.data.tracks.items[0].external_ids.isrc,
            duration: response.data.tracks.items[0].duration_ms,
            type: "track"
        });
    }
    async initialize() {
        const response = await axios_1.default.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${this.base64Auth}`,
            },
        });
        this.accessToken = response.data.access_token;
    }
    async getSpotifyEntityInfo(url) {
        const regex = /https?:\/\/open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)(\?si=[a-zA-Z0-9]+)?/;
        const match = url.match(regex);
        if (match) {
            const entityType = match[1];
            const entityId = match[2];
            switch (entityType) {
                case 'album':
                    const res = await axios_1.default.get(`${this.baseUrl}${entityType}s/${entityId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    });
                    let albums = [];
                    res.data.tracks.items.map(async (d) => {
                        if (d.name && d.artists?.length)
                            albums.push(new Track_1.default(this.buildTrack({
                                title: `${d.name}`,
                                author: `${d.artists.map((n) => n.name).join(" ")}`,
                                id: d.id,
                                isrc: null,
                                duration: d.duration_ms,
                                url: d.external_urls.spotify,
                                type: "album_track"
                            })));
                    });
                    return {
                        name: res.data.name,
                        type: "album",
                        url: res.data.external_urls.spotify,
                        length: albums.length,
                        tracks: albums
                    };
                case 'track':
                    const response = await axios_1.default.get(`${this.baseUrl}${entityType}s/${entityId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    });
                    return this.buildTrack({
                        title: `${response.data.name}`,
                        author: `${response.data?.artists.map((n) => n.name).join(" ")}`,
                        id: response.data.id,
                        url: response.data.external_urls.spotify,
                        isrc: response.data.external_ids.isrc,
                        duration: response.data.duration_ms,
                        type: "track"
                    });
                case 'playlist':
                    const res_pl = await axios_1.default.get(`${this.baseUrl}${entityType}s/${entityId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    });
                    let playlists = [];
                    res_pl.data.tracks.items.map(async (d) => {
                        if (d.track?.name && d.track?.artists?.length)
                            playlists.push(new Track_1.default(this.buildTrack({
                                title: `${d.track.name}`,
                                author: `${d.track?.artists.map((n) => n.name).join(", ")}`,
                                id: d.track.id,
                                isrc: d.track.external_ids.isrc,
                                duration: d.track.duration_ms,
                                url: d.track.external_urls.spotify,
                                type: "playlist_track"
                            })));
                    });
                    return {
                        name: res_pl.data.name,
                        type: "playlist",
                        description: res_pl.data.description,
                        url: res_pl.data.external_urls.spotify,
                        owner: {
                            name: res_pl.data.owner.display_name,
                            id: res_pl.data.owner.id,
                            url: res_pl.data.owner.external_urls.spotify
                        },
                        followers: res_pl.data.followers.total,
                        length: playlists.length,
                        tracks: playlists
                    };
                default:
                    return null;
            }
        }
        else {
            return null;
        }
    }
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