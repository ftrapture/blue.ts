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
var config_json_1 = require("../config.json");
var Events_1 = __importDefault(require("../Utils/Events"));
require("../Utils/Color");
var VoiceUpdate = /** @class */ (function () {
    function VoiceUpdate(blue) {
        this.blue = blue;
        this.voice = {
            sessionId: null,
            token: null,
            endpoint: null,
        };
        this.channelId = null;
        this.guildId = null;
        this.muted = null;
        this.defeaned = null;
    }
    VoiceUpdate.prototype.updateVoice = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var player;
            return __generator(this, function (_a) {
                if (!("t" in packet) || !["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t))
                    return [2 /*return*/, false];
                player = this.blue.players.get(packet.d.guild_id);
                if (!player)
                    return [2 /*return*/];
                if (packet.t === "VOICE_SERVER_UPDATE") {
                    this.setVoiceStateUpdate(packet.d);
                }
                if (packet.t === "VOICE_STATE_UPDATE") {
                    if (packet.d.user_id !== this.blue.client.user.id)
                        return [2 /*return*/];
                    this.setServerStateUpdate(packet.d);
                }
                return [2 /*return*/];
            });
        });
    };
    VoiceUpdate.prototype.setServerStateUpdate = function (guildData) {
        this.voice.sessionId = guildData.session_id;
        this.channelId = guildData.channel_id;
        this.guildId = guildData.guild_id;
        this.muted = guildData.self_mute || false;
        this.defeaned = guildData.self_deaf || false;
        this.blue.emit(Events_1.default.api, "[".concat(String("DEBUG").Blue(), "]: ").concat(this.blue.options.host, " ---> [").concat(String("VOICE UPDATE").Yellow(), "] ---> ").concat(String("Channel ID: ".concat(this.channelId, " Session ID: ").concat(guildData.session_id, " Guild ID: ").concat(this.guildId)).Yellow()));
    };
    VoiceUpdate.prototype.setVoiceStateUpdate = function (data) {
        if (!(data === null || data === void 0 ? void 0 : data.endpoint))
            return this.blue.emit(Events_1.default.nodeError, data, new Error("".concat(config_json_1.client_name, " error :: Unable to fetch the endpoint to connect to the voice channel!")));
        if (!this.voice.sessionId)
            return this.blue.emit(Events_1.default.nodeError, this, new Error("".concat(config_json_1.client_name, " error :: Unable to fetch the sessionId to connect to the voice channel!")));
        this.voice.token = data.token;
        this.voice.endpoint = data.endpoint;
        this.blue.node.rest.updatePlayer({
            guildId: this.guildId,
            data: { voice: this.voice },
        });
        this.blue.emit(Events_1.default.debug, this.blue.options.host, new Error("".concat(config_json_1.client_name, " :: Voice State Updated | Region: ").concat(this.region, ", Guild ID: ").concat(this.guildId, ", Session ID: ").concat(this.voice.sessionId)));
    };
    return VoiceUpdate;
}());
exports.default = VoiceUpdate;
