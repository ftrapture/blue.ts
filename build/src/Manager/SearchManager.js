"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var Search = /** @class */ (function () {
    function Search(blue) {
        this.blue = blue;
        this.youtube = new Youtube_1.default(this.blue);
        this.spotify = new Spotify_1.default(this.blue);
        this.soundcloud = new SoundCloud_1.default(this.blue);
        this.source = this.blue.options.defaultSearchEngine;
    }
    Search.prototype.fetch = function (param) {
        return __awaiter(this, void 0, void 0, function () {
            var query, urlRegex, result, get_sp_link, data, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = typeof param === "string" ? param : (param === null || param === void 0 ? void 0 : param.query) ? param === null || param === void 0 ? void 0 : param.query : null;
                        if (param === null || param === void 0 ? void 0 : param.source)
                            this.source = param === null || param === void 0 ? void 0 : param.source;
                        if (!query)
                            return [2 /*return*/, null];
                        urlRegex = /(?:https?|ftp):\/\/[\n\S]+/gi;
                        if (!urlRegex.test(query)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.spotify.getSpotifyEntityInfo(query).catch(function () { return null; })];
                    case 1:
                        get_sp_link = _b.sent();
                        if (!((get_sp_link === null || get_sp_link === void 0 ? void 0 : get_sp_link.type) === "album")) return [3 /*break*/, 2];
                        return [2 /*return*/, __assign({ loadType: Types_1.default.LOAD_SP_ALBUMS }, get_sp_link)];
                    case 2:
                        if (!((get_sp_link === null || get_sp_link === void 0 ? void 0 : get_sp_link.type) === "playlist")) return [3 /*break*/, 3];
                        return [2 /*return*/, __assign({ loadType: Types_1.default.LOAD_SP_PLAYLISTS }, get_sp_link)];
                    case 3:
                        if (!(get_sp_link === null || get_sp_link === void 0 ? void 0 : get_sp_link.track)) return [3 /*break*/, 8];
                        if (!this.source.startsWith("youtube")) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.youtube.search(get_sp_link === null || get_sp_link === void 0 ? void 0 : get_sp_link.track, "ytsearch").catch(function () { return null; })];
                    case 4:
                        result = _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.soundcloud.search(get_sp_link === null || get_sp_link === void 0 ? void 0 : get_sp_link.track).catch(function () { return null; })];
                    case 6:
                        result = _b.sent();
                        _b.label = 7;
                    case 7: return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, this.fetchRawData("".concat(this.blue.version, "/loadtracks"), "identifier=".concat(encodeURIComponent(query)))];
                    case 9:
                        result = _b.sent();
                        _b.label = 10;
                    case 10: return [3 /*break*/, 24];
                    case 11:
                        data = void 0;
                        if (!(this.source === "youtube" || this.source === "youtube music" || this.source === "soundcloud")) return [3 /*break*/, 19];
                        _a = this.source;
                        switch (_a) {
                            case "youtube": return [3 /*break*/, 12];
                            case "youtube music": return [3 /*break*/, 14];
                            case "soundcloud": return [3 /*break*/, 16];
                        }
                        return [3 /*break*/, 18];
                    case 12: return [4 /*yield*/, this.youtube.search(query, "ytsearch").catch(function () { return null; })];
                    case 13:
                        data = _b.sent();
                        return [3 /*break*/, 18];
                    case 14: return [4 /*yield*/, this.youtube.search(query, "ytmsearch").catch(function () { return null; })];
                    case 15:
                        data = _b.sent();
                        return [3 /*break*/, 18];
                    case 16: return [4 /*yield*/, this.soundcloud.search(query).catch(function () { return null; })];
                    case 17:
                        data = _b.sent();
                        return [3 /*break*/, 18];
                    case 18:
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, data];
                    case 19:
                        if (!(this.source === "spotify")) return [3 /*break*/, 22];
                        return [4 /*yield*/, this.spotify.search(query).catch(function () { return null; })];
                    case 20:
                        data = _b.sent();
                        return [4 /*yield*/, this.youtube.search(data, "ytsearch").catch(function () { return null; })];
                    case 21:
                        result = _b.sent();
                        return [3 /*break*/, 24];
                    case 22: return [4 /*yield*/, this.youtube.search(query, "ytsearch").catch(function () { return null; })];
                    case 23:
                        result = _b.sent();
                        _b.label = 24;
                    case 24: return [2 /*return*/, result];
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
