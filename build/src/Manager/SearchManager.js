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
const Track_1 = __importDefault(require("../Structure/Track"));
class Search {
    blue;
    youtube;
    spotify;
    soundcloud;
    source;
    constructor(blue) {
        this.blue = blue;
        this.youtube = new Youtube_1.default(this.blue);
        this.spotify = new Spotify_1.default(this.blue);
        this.soundcloud = new SoundCloud_1.default(this.blue);
        this.source = this.blue.options.defaultSearchEngine;
    }
    async fetch(param) {
        const query = typeof param === "string" ? param : param?.query || null;
        if (!query)
            return null;
        if (param?.source)
            this.source = param.source;
        const isUrl = this.isValidUrl(query);
        if (isUrl) {
            return this.handleUrlQuery(query);
        }
        return this.handleNonUrlQuery(query);
    }
    isValidUrl(query) {
        const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/gi;
        return urlRegex.test(query);
    }
    async handleUrlQuery(query) {
        const spotifyEntityInfo = await this.spotify.getSpotifyEntityInfo(query).catch(() => null);
        if (spotifyEntityInfo?.type === "album") {
            return {
                loadType: Types_1.default.LOAD_SP_ALBUMS,
                ...spotifyEntityInfo
            };
        }
        if (spotifyEntityInfo?.type === "playlist") {
            return {
                loadType: Types_1.default.LOAD_SP_PLAYLISTS,
                ...spotifyEntityInfo
            };
        }
        if (spotifyEntityInfo?.type === "track") {
            let tracks;
            if (this.source.startsWith("youtube")) {
                tracks = await this.youtube.search(`${spotifyEntityInfo.info.title} ${spotifyEntityInfo.info.author}`, "ytmsearch").catch(() => null);
            }
            else {
                tracks = await this.soundcloud.search(`${spotifyEntityInfo.info.title} ${spotifyEntityInfo.info.author}`).catch(() => null);
            }
            const track = tracks.data[0];
            track.info.sourceName = spotifyEntityInfo.info.sourceName;
            track.info.isrc = spotifyEntityInfo.info.isrc;
            track.type = spotifyEntityInfo.type;
            track.info.uri = spotifyEntityInfo.info.uri;
            return {
                loadType: Types_1.default.LOAD_SP_TRACK,
                tracks: [track]
            };
        }
        return (await this.fetchRawData(`${this.blue.version}/loadtracks`, `identifier=${encodeURIComponent(query)}`));
    }
    async handleNonUrlQuery(query) {
        let data;
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
                    const tracks = await this.youtube.search(`${data.info.title} ${data.info.author}`, "ytmsearch").catch(() => null);
                    if (!tracks)
                        return null;
                    let builtTracks = [];
                    for (let i = 0; i < tracks.data.length; i++) {
                        tracks.data[i].info.sourceName = data.info.sourceName;
                        tracks.data[i].info.isrc = data.info.isrc;
                        tracks.data[i].type = data.type;
                        tracks.data[i].info.uri = data.info.uri;
                        builtTracks.push(new Track_1.default(tracks.data[i]));
                    }
                    return {
                        loadType: Types_1.default.LOAD_SP_TRACK,
                        tracks: builtTracks
                    };
                }
                break;
            default:
                data = await this.youtube.search(query, "ytsearch").catch(() => null);
        }
        return data;
    }
    async fetchRawData(endpoint, identifier) {
        try {
            const url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}/${endpoint}?${identifier}`;
            const response = await (0, undici_1.fetch)(url, {
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
        }
        catch (e) {
            console.log(e);
            throw new Error(`Unable to fetch data from the Lavalink server.`);
        }
    }
}
exports.default = Search;
//# sourceMappingURL=SearchManager.js.map