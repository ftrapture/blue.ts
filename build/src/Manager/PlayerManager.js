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
var QueueManager_1 = __importDefault(require("./QueueManager"));
var Events_1 = __importDefault(require("../Utils/Events"));
var PlayerEventManager_1 = __importDefault(require("./PlayerEventManager"));
var FilterManager_1 = __importDefault(require("./FilterManager"));
var Player = /** @class */ (function () {
    function Player(blue, options) {
        this.blue = blue;
        this.volume = 100;
        this.filter = new FilterManager_1.default(this);
        this.playing = false;
        this.queue = new QueueManager_1.default();
        this.position = 0;
        this.connected = false;
        this.paused = false;
        this.createdTimestamp = Date.now();
        this.createdAt = new Date();
        this.guildId = options.guildId || null;
        this.voiceChannel = options.voiceChannel || null;
        this.textChannel = options.textChannel || null;
        this.selfDeaf = options.selfDeaf || false;
        this.selfMute = options.selfMute || false;
        this.options = {
            guildId: this.guildId,
            textChannel: this.textChannel,
            voiceChannel: this.voiceChannel,
            selfMute: this.selfMute,
            selfDeaf: this.selfDeaf
        };
        this.loop = "none";
        this.blue.emit(Events_1.default.playerCreate, this);
        this.event = new PlayerEventManager_1.default(this);
    }
    Player.prototype.isPaused = function () {
        return this.paused;
    };
    Player.prototype.isConnected = function () {
        return this.connected;
    };
    Player.prototype.play = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            var volumeFactor, adjustedVolume, e_1;
            var _a;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.queue.size() < 1)
                            return [2 /*return*/, this];
                        this.queue.current = this.queue.shift();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        this.playing = true;
                        this.position = 0;
                        volumeFactor = Math.cos(this.position / 1000);
                        adjustedVolume = Math.floor(this.volume * volumeFactor);
                        return [4 /*yield*/, this.blue.node.rest.updatePlayer({
                                guildId: this.guildId,
                                noReplace: (options === null || options === void 0 ? void 0 : options.noReplace) || false,
                                data: {
                                    track: { encoded: (_a = this.queue.current) === null || _a === void 0 ? void 0 : _a.trackToken },
                                    volume: adjustedVolume
                                },
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, this];
                    case 3:
                        e_1 = _b.sent();
                        this.playing = false;
                        this.blue.emit(Events_1.default.trackError, this, this.queue.current, null);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Player.prototype.connect = function () {
        this.send({
            guild_id: this.guildId,
            channel_id: this.voiceChannel,
            self_deaf: this.selfDeaf,
            self_mute: this.selfMute,
        });
        this.connected = true;
    };
    Player.prototype.send = function (data) {
        this.blue.node.rest.sendGuildShardData({ op: 4, d: data });
    };
    Player.prototype.stop = function () {
        this.position = 0;
        this.playing = false;
        this.blue.node.rest.updatePlayer({
            guildId: this.guildId,
            data: { track: { encoded: null } },
        });
        return this;
    };
    Player.prototype.disconnect = function () {
        if (this.voiceChannel === null)
            return null;
        this.connected = false;
        this.playing = false;
        this.send({
            guild_id: this.guildId,
            channel_id: null,
            self_mute: false,
            self_deaf: false,
        });
        this.voiceChannel = null;
        this.options["voiceChannel"] = null;
        this.blue.node.rest.destroyPlayer(this.guildId);
        this.blue.emit(Events_1.default.playerDisconnect, this);
        this.blue.players.delete(this.guildId);
        return this;
    };
    Player.prototype.destroy = function () {
        return this.disconnect();
    };
    Player.prototype.pause = function (pause) {
        if (pause === void 0) { pause = true; }
        if (typeof pause !== "boolean")
            throw new TypeError("blue.js :: Pause function must be passed a boolean value.");
        this.blue.node.rest.updatePlayer({
            guildId: this.guildId,
            data: { paused: pause },
        });
        this.playing = !pause;
        this.paused = pause;
        return this;
    };
    Player.prototype.setLoop = function (query) {
        if (!query || !["queue", "track", "none"].includes(query.toLowerCase()))
            this.loop = "none";
        else
            this.loop = query.toLowerCase();
        return this;
    };
    Player.prototype.setVoiceChannel = function (channel, options) {
        var _a, _b, _c, _d;
        if (options === void 0) { options = {}; }
        if (typeof channel !== "string")
            throw new TypeError("'channel' must be contain only channel id.");
        if (this.isConnected() && channel == this.voiceChannel)
            throw new ReferenceError("Player is already created and connected to ".concat(channel));
        this.voiceChannel = channel;
        this.options["voiceChannel"] = this.voiceChannel;
        if (options) {
            this.selfMute = (_b = (_a = options.selfMute) !== null && _a !== void 0 ? _a : this.selfMute) !== null && _b !== void 0 ? _b : false;
            this.selfDeaf = (_d = (_c = options.selfDeaf) !== null && _c !== void 0 ? _c : this.selfDeaf) !== null && _d !== void 0 ? _d : false;
        }
        this.connect();
        return this;
    };
    Player.prototype.setTextChannel = function (channel) {
        if (typeof channel !== "string")
            throw new TypeError("'channel' must be contain only channel id.");
        this.textChannel = channel;
        return this;
    };
    Player.prototype.setVolume = function (integer) {
        if (integer === void 0) { integer = this.volume; }
        if (Number.isNaN(integer))
            throw new RangeError("blue.js :: Volume level must be a number.");
        if (integer < 0 || integer > 500)
            throw new RangeError("blue.js :: Volume Number should be between 0 and 500");
        this.blue.node.rest.updatePlayer({ guildId: this.guildId, data: { volume: integer } });
        this.volume = integer;
        return this;
    };
    Player.prototype.seek = function (position) {
        if (typeof position === "string") {
            position = parseInt(position);
            if (Number.isNaN(position))
                throw new RangeError("blue.js :: Invalid position format");
        }
        if (position < 0)
            position = 0;
        var ms = this.blue.util.durationInMs(position);
        var pos = Math.abs(ms);
        if (ms < 0) {
            this.position = this.position - pos;
        }
        else {
            this.position = pos;
        }
        if (this.position < 0)
            this.position = 0;
        this.blue.node.rest.updatePlayer({ guildId: this.guildId, data: { position: position } });
        return this;
    };
    Player.prototype.autoplay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, response, track, e_2;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _k.trys.push([0, 5, , 7]);
                        data = "https://www.youtube.com/watch?v=".concat(((_b = (_a = this.queue.previous) === null || _a === void 0 ? void 0 : _a.info) === null || _b === void 0 ? void 0 : _b.identifier) || ((_d = (_c = this.queue.current) === null || _c === void 0 ? void 0 : _c.info) === null || _d === void 0 ? void 0 : _d.identifier), "&list=RD").concat(this.queue.previous.info.identifier || this.queue.current.info.identifier);
                        return [4 /*yield*/, this.blue.search({
                                query: data,
                                requester: (_g = (_f = (_e = this.queue.previous) === null || _e === void 0 ? void 0 : _e.info) === null || _f === void 0 ? void 0 : _f.requester) !== null && _g !== void 0 ? _g : (_j = (_h = this.queue.current) === null || _h === void 0 ? void 0 : _h.info) === null || _j === void 0 ? void 0 : _j.requester,
                                source: "ytmsearch",
                            }).catch(function () { return false; })];
                    case 1:
                        response = _k.sent();
                        if (!(!response || !response.tracks || ["error", "empty"].includes(response.loadType))) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.stop()];
                    case 2: return [2 /*return*/, (_k.sent())];
                    case 3:
                        response.tracks.shift();
                        track = response.tracks[Math.floor(Math.random() * Math.floor(response.tracks.length))];
                        this.queue.add(track);
                        return [4 /*yield*/, this.play()];
                    case 4:
                        _k.sent();
                        return [2 /*return*/, this];
                    case 5:
                        e_2 = _k.sent();
                        console.log(e_2);
                        return [4 /*yield*/, this.destroy()];
                    case 6: return [2 /*return*/, (_k.sent())];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return Player;
}());
exports.default = Player;
