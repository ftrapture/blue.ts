"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var QueueManager_1 = __importDefault(require("../Manager/QueueManager"));
var Spotify = /** @class */ (function () {
    function Spotify(blue) {
        var _a, _b;
        this.blue = blue;
        this.client_id = ((_a = this.blue.options["spotify"]) === null || _a === void 0 ? void 0 : _a.client_id) || false;
        this.client_secret = ((_b = this.blue.options["spotify"]) === null || _b === void 0 ? void 0 : _b.client_secret) || false;
        this.base64Auth = Buffer.from("".concat(this.client_id, ":").concat(this.client_secret)).toString('base64');
        this.baseUrl = "https://api.spotify.com/v1/";
        this.accessToken = "";
        this.queue = new QueueManager_1.default();
        this.initialize();
    }
    Spotify.prototype.search = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, type) {
            var response;
            var _a, _b, _c;
            if (type === void 0) { type = "track"; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "search?q=").concat(encodeURIComponent(query), "&type=").concat(type), {
                            headers: {
                                'Authorization': "Bearer ".concat(this.accessToken),
                            },
                        })];
                    case 1:
                        response = _d.sent();
                        return [2 /*return*/, "".concat(response.data.tracks.items[0].name, " ").concat((_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.tracks) === null || _b === void 0 ? void 0 : _b.items[0]) === null || _c === void 0 ? void 0 : _c.artists.map(function (n) { return n.name; }).join(" "))];
                }
            });
        });
    };
    Spotify.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Authorization': "Basic ".concat(this.base64Auth),
                            },
                        })];
                    case 1:
                        response = _a.sent();
                        this.accessToken = response.data.access_token;
                        return [2 /*return*/];
                }
            });
        });
    };
    Spotify.prototype.getSpotifyEntityInfo = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var regex, match, entityType, entityId, _a, res, albums_1, response, res_pl, playlists_1;
            var _this = this;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        regex = /https?:\/\/open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)(\?si=[a-zA-Z0-9]+)?/;
                        match = url.match(regex);
                        if (!match) return [3 /*break*/, 9];
                        entityType = match[1];
                        entityId = match[2];
                        _a = entityType;
                        switch (_a) {
                            case 'album': return [3 /*break*/, 1];
                            case 'track': return [3 /*break*/, 3];
                            case 'playlist': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl).concat(entityType, "s/").concat(entityId), {
                            headers: {
                                'Authorization': "Bearer ".concat(this.accessToken),
                            },
                        })];
                    case 2:
                        res = _c.sent();
                        albums_1 = [];
                        res.data.tracks.items.map(function (d) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                if (d.name && ((_a = d.artists) === null || _a === void 0 ? void 0 : _a.length))
                                    albums_1.push(this.buildTrack({
                                        title: "".concat(d.name),
                                        author: "".concat(d.artists.map(function (n) { return n.name; }).join(" ")),
                                        id: d.id,
                                        isrc: null,
                                        duration: d.duration_ms,
                                        url: d.external_urls.spotify,
                                        type: "album"
                                    }));
                                return [2 /*return*/];
                            });
                        }); });
                        return [2 /*return*/, {
                                name: res.data.name,
                                type: "album_track",
                                url: res.data.external_urls.spotify,
                                length: albums_1.length,
                                items: albums_1
                            }];
                    case 3: return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl).concat(entityType, "s/").concat(entityId), {
                            headers: {
                                'Authorization': "Bearer ".concat(this.accessToken),
                            },
                        })];
                    case 4:
                        response = _c.sent();
                        return [2 /*return*/, {
                                track: "".concat(response.data.name, " ").concat((_b = response.data) === null || _b === void 0 ? void 0 : _b.artists.map(function (n) { return n.name; }).join(" "))
                            }];
                    case 5: return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl).concat(entityType, "s/").concat(entityId), {
                            headers: {
                                'Authorization': "Bearer ".concat(this.accessToken),
                            },
                        })];
                    case 6:
                        res_pl = _c.sent();
                        playlists_1 = [];
                        res_pl.data.tracks.items.map(function (d) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c, _d;
                            return __generator(this, function (_e) {
                                if (((_a = d.track) === null || _a === void 0 ? void 0 : _a.name) && ((_c = (_b = d.track) === null || _b === void 0 ? void 0 : _b.artists) === null || _c === void 0 ? void 0 : _c.length))
                                    playlists_1.push(this.buildTrack({
                                        title: "".concat(d.track.name),
                                        author: "".concat((_d = d.track) === null || _d === void 0 ? void 0 : _d.artists.map(function (n) { return n.name; }).join(", ")),
                                        id: d.track.id,
                                        isrc: d.track.external_ids.isrc,
                                        duration: d.track.duration_ms,
                                        url: d.track.external_urls.spotify,
                                        type: "playlist_track"
                                    }));
                                return [2 /*return*/];
                            });
                        }); });
                        return [2 /*return*/, {
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
                                length: playlists_1.length,
                                items: playlists_1
                            }];
                    case 7: return [2 /*return*/, null];
                    case 8: return [3 /*break*/, 10];
                    case 9: return [2 /*return*/, null];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Spotify.prototype.buildTrack = function (track) {
        return {
            trackToken: null,
            info: {
                identifier: (track === null || track === void 0 ? void 0 : track.id) || null,
                author: (track === null || track === void 0 ? void 0 : track.author) || null,
                length: (track === null || track === void 0 ? void 0 : track.duration) || null,
                isStream: false,
                title: (track === null || track === void 0 ? void 0 : track.title) || null,
                uri: (track === null || track === void 0 ? void 0 : track.url) || null,
                sourceName: "spotify",
                position: 0,
                artworkUrl: null,
                isrc: (track === null || track === void 0 ? void 0 : track.isrc) || null,
            },
            pluginInfo: {
                save_uri: null
            },
            type: track.type,
            userData: {}
        };
    };
    return Spotify;
}());
exports.default = Spotify;
