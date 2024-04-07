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
var undici_1 = require("undici");
var Youtube_1 = __importDefault(require("../Platforms/Youtube"));
var SoundCloud_1 = __importDefault(require("../Platforms/SoundCloud"));
var Spotify_1 = __importDefault(require("../Platforms/Spotify"));
var Types_1 = __importDefault(require("../Utils/Types"));
var Track_1 = __importDefault(require("../Structure/Track"));
var Search = /** @class */ (function () {
    function Search(blue) {
        this.blue = blue;
        this.youtube = new Youtube_1.default(this.blue);
        this.spotify = new Spotify_1.default(this.blue);
        this.soundcloud = new SoundCloud_1.default(this.blue);
    }
    Search.prototype.fetch = function (param) {
        return __awaiter(this, void 0, void 0, function () {
            var query, engine, urlRegex, result, get_sp_link, albums, _a, _b, _c, _i, i, search, playlists, _d, _e, _f, _g, i, search, track, data, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        query = typeof param === "string" ? param : (param === null || param === void 0 ? void 0 : param.query) ? param === null || param === void 0 ? void 0 : param.query : null;
                        engine = (param === null || param === void 0 ? void 0 : param.source) || this.blue.options.defaultSearchEngine;
                        if (!query)
                            return [2 /*return*/, null];
                        urlRegex = /(?:https?|ftp):\/\/[\n\S]+/gi;
                        if (!urlRegex.test(query)) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.spotify.getSpotifyEntityInfo(query)];
                    case 1:
                        get_sp_link = _j.sent();
                        if (!(get_sp_link === null || get_sp_link === void 0 ? void 0 : get_sp_link.album)) return [3 /*break*/, 6];
                        albums = [];
                        _a = get_sp_link["album"];
                        _b = [];
                        for (_c in _a)
                            _b.push(_c);
                        _i = 0;
                        _j.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 5];
                        _c = _b[_i];
                        if (!(_c in _a)) return [3 /*break*/, 4];
                        i = _c;
                        return [4 /*yield*/, this.youtube.search(get_sp_link["album"][i], "ytsearch").catch(function () { return null; })];
                    case 3:
                        search = _j.sent();
                        if (search.data[0])
                            albums.push(new Track_1.default(search.data[0]));
                        _j.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, {
                            loadType: Types_1.default.LOAD_SP_ALBUMS,
                            tracks: albums
                        }];
                    case 6:
                        if (!(get_sp_link === null || get_sp_link === void 0 ? void 0 : get_sp_link.playlist)) return [3 /*break*/, 11];
                        playlists = [];
                        _d = get_sp_link["playlist"];
                        _e = [];
                        for (_f in _d)
                            _e.push(_f);
                        _g = 0;
                        _j.label = 7;
                    case 7:
                        if (!(_g < _e.length)) return [3 /*break*/, 10];
                        _f = _e[_g];
                        if (!(_f in _d)) return [3 /*break*/, 9];
                        i = _f;
                        return [4 /*yield*/, this.youtube.search(get_sp_link["playlist"][i], "ytsearch").catch(function () { return null; })];
                    case 8:
                        search = _j.sent();
                        if (search)
                            playlists.push(new Track_1.default(search.data[0]));
                        _j.label = 9;
                    case 9:
                        _g++;
                        return [3 /*break*/, 7];
                    case 10: return [2 /*return*/, {
                            loadType: Types_1.default.LOAD_SP_PLAYLISTS,
                            tracks: playlists
                        }];
                    case 11:
                        if (!(get_sp_link === null || get_sp_link === void 0 ? void 0 : get_sp_link.track)) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.youtube.search(get_sp_link === null || get_sp_link === void 0 ? void 0 : get_sp_link.track, "ytsearch").catch(function () { return null; })];
                    case 12:
                        result = _j.sent();
                        return [3 /*break*/, 15];
                    case 13: return [4 /*yield*/, this.fetchRawData("".concat(this.blue.version, "/loadtracks"), "identifier=".concat(encodeURIComponent(query)))];
                    case 14:
                        result = _j.sent();
                        _j.label = 15;
                    case 15: return [3 /*break*/, 29];
                    case 16:
                        track = "ytmsearch:".concat(query);
                        data = void 0;
                        if (!(engine === "youtube" || engine === "youtube music" || engine === "soundcloud")) return [3 /*break*/, 24];
                        _h = engine;
                        switch (_h) {
                            case "youtube": return [3 /*break*/, 17];
                            case "youtube music": return [3 /*break*/, 19];
                            case "soundcloud": return [3 /*break*/, 21];
                        }
                        return [3 /*break*/, 23];
                    case 17: return [4 /*yield*/, this.youtube.search(query, "ytsearch").catch(function () { return null; })];
                    case 18:
                        data = _j.sent();
                        return [3 /*break*/, 23];
                    case 19: return [4 /*yield*/, this.youtube.search(query, "ytmsearch").catch(function () { return null; })];
                    case 20:
                        data = _j.sent();
                        return [3 /*break*/, 23];
                    case 21: return [4 /*yield*/, this.soundcloud.search(query).catch(function () { return null; })];
                    case 22:
                        data = _j.sent();
                        return [3 /*break*/, 23];
                    case 23:
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, data];
                    case 24:
                        if (!(engine === "spotify")) return [3 /*break*/, 27];
                        return [4 /*yield*/, this.spotify.search(query)];
                    case 25:
                        data = _j.sent();
                        return [4 /*yield*/, this.youtube.search(data, "ytsearch")];
                    case 26:
                        result = _j.sent();
                        return [3 /*break*/, 29];
                    case 27: return [4 /*yield*/, this.youtube.search(track, "ytsearch")];
                    case 28:
                        result = _j.sent();
                        _j.label = 29;
                    case 29: return [2 /*return*/, result];
                }
            });
        });
    };
    Search.prototype.fetchRawData = function (endpoint, identifier) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        url = "http".concat(this.blue.options.secure ? "s" : "", "://").concat(this.blue.options.host, ":").concat(this.blue.options.port, "/").concat(endpoint, "?").concat(identifier);
                        return [4 /*yield*/, (0, undici_1.fetch)(url, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    'Authorization': this.blue.options.password
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch data: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 3:
                        e_1 = _a.sent();
                        console.log(e_1);
                        throw new Error("Unable to fetch data from the Lavalink server.");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Search;
}());
exports.default = Search;
