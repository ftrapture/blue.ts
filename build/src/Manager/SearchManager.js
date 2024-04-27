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
        let query = typeof param === "string" ? param : param?.query ? param?.query : null;
        if (param?.source)
            this.source = param?.source;
        if (!query)
            return null;
        const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/gi;
        let result;
        if (urlRegex.test(query)) {
            const get_sp_link = await this.spotify.getSpotifyEntityInfo(query).catch(() => null);
            if (get_sp_link?.type === "album") {
                return {
                    loadType: Types_1.default.LOAD_SP_ALBUMS,
                    ...get_sp_link
                };
            }
            else if (get_sp_link?.type === "playlist") {
                return {
                    loadType: Types_1.default.LOAD_SP_PLAYLISTS,
                    ...get_sp_link
                };
            }
            else if (get_sp_link?.track) {
                if (this.source.startsWith("youtube"))
                    result = await this.youtube.search(get_sp_link?.track, "ytsearch").catch(() => null);
                else
                    result = await this.soundcloud.search(get_sp_link?.track).catch(() => null);
            }
            else {
                result = await this.fetchRawData(`${this.blue.version}/loadtracks`, `identifier=${encodeURIComponent(query)}`);
            }
        }
        else {
            let data;
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
                if (!data)
                    return null;
                return data;
            }
            else if (this.source === "spotify") {
                data = await this.spotify.search(query).catch(() => null);
                result = await this.youtube.search(data, "ytsearch").catch(() => null);
            }
            else {
                result = await this.youtube.search(query, "ytsearch").catch(() => null);
            }
        }
        return result;
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