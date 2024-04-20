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
var Node_1 = __importDefault(require("../Connectors/Node"));
var config_json_1 = require("../config.json");
var Libs_1 = __importDefault(require("./Libs"));
var supportedPlatforms = {
    "youtube": "ytsearch",
    "youtube music": "ytmsearch",
    "soundcloud": "scsearch"
};
var Util = /** @class */ (function () {
    function Util(blue) {
        this.blue = blue;
    }
    Util.prototype.checkParamsValidity = function (nodePackets, defaultPackets) {
        return __awaiter(this, void 0, void 0, function () {
            var supportedLibraries, _i, nodePackets_1, packet, _a, _b, defaultSearchEngine;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!nodePackets || !defaultPackets.library || nodePackets.length < 1) {
                            throw new Error("Invalid arguments passed to the bluets constructor.");
                        }
                        supportedLibraries = [Libs_1.default.DiscordJs, Libs_1.default.Eris, Libs_1.default.OceanicJS];
                        if (!supportedLibraries.includes(defaultPackets.library)) {
                            throw new Error("Supported Libraries: DiscordJs | Eris | OceanicJs, but received Unknown#Lib");
                        }
                        _i = 0, nodePackets_1 = nodePackets;
                        _c.label = 1;
                    case 1:
                        if (!(_i < nodePackets_1.length)) return [3 /*break*/, 6];
                        packet = nodePackets_1[_i];
                        if (!packet.host || !packet.password || !packet.port || !Object.keys(packet).includes("secure")) {
                            throw new Error("Invalid parameters passed in bluets constructor.");
                        }
                        this.blue.node = new Node_1.default(this.blue, packet, defaultPackets);
                        _a = this.blue;
                        if (!(typeof packet.version === "string")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.blue.verify_version(packet.version)];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _b = "v4";
                        _c.label = 4;
                    case 4:
                        _a.version = _b;
                        this.blue.node.connect();
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        defaultSearchEngine = defaultPackets.defaultSearchEngine;
                        if (defaultSearchEngine && !supportedPlatforms[defaultSearchEngine]) {
                            throw new Error("Available search engines are: ".concat(Object.keys(supportedPlatforms).join(", "), " or keep it blank."));
                        }
                        this.blue.options = {
                            host: nodePackets[0].host,
                            password: nodePackets[0].password,
                            port: nodePackets[0].port,
                            secure: nodePackets[0].secure,
                            defaultSearchEngine: defaultSearchEngine ? supportedPlatforms[defaultSearchEngine] || config_json_1.default_platform : config_json_1.default_platform,
                            autoplay: defaultPackets.autoplay || false,
                            library: defaultPackets.library
                        };
                        return [2 /*return*/, this.blue.node];
                }
            });
        });
    };
    Util.prototype.checkObjectValidity = function (options) {
        var guildId = options.guildId, voiceChannel = options.voiceChannel, textChannel = options.textChannel;
        if (!guildId) {
            throw new Error("Provide the proper guildId");
        }
        if (typeof guildId !== "string") {
            throw new TypeError("The option 'guildId' must be a string, but received '".concat(typeof guildId, "' type!"));
        }
        if (!voiceChannel) {
            throw new TypeError("Provide the proper VoiceChannel ID");
        }
        if (typeof voiceChannel !== "string") {
            throw new TypeError("The option 'voiceChannel' must be a string, but received '".concat(typeof voiceChannel, "' type!"));
        }
        if (!textChannel) {
            throw new TypeError("Provide the proper TextChannel ID");
        }
        if (typeof textChannel !== "string") {
            throw new TypeError("The option 'textChannel' must be a string, but received '".concat(typeof textChannel, "' type!"));
        }
        return true;
    };
    Util.prototype.durationInMs = function (time) {
        if (!time && time !== 0) {
            throw new RangeError("'time' parameter must be present and of string type with a value greater than 0.");
        }
        var onlyInteger = parseInt(time.toString());
        if (Number.isNaN(onlyInteger)) {
            throw new TypeError("Invalid time format, e.g: 2min");
        }
        if (typeof time === "number") {
            return Math.floor(onlyInteger * 1000);
        }
        var units = ["weeks", "w", "ms", "s", "hrs", "days", "months", "years", "seconds", "miliseconds", "minutes", "hours", "d", "m", "y", "yrs"];
        var timeString = time.toString().toUpperCase().trim();
        var unit = units.find(function (u) { return timeString.includes(u); }) || "s";
        var result;
        switch (unit) {
            case "s":
            case "seconds":
                result = Math.floor(onlyInteger * 1000);
                break;
            case "minutes":
                result = Math.floor(onlyInteger * (1000 * 60));
                break;
            case "ms":
            case "miliseconds":
                result = Math.floor(onlyInteger);
                break;
            case "hrs":
            case "hours":
                result = Math.floor(onlyInteger * (1000 * 60 * 60));
                break;
            case "days":
            case "d":
                result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24));
                break;
            case "months":
            case "m":
                result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24 * 30));
                break;
            case "years":
            case "yrs":
                result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24 * 365));
                break;
            case "w":
            case "weeks":
                result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24 * 7));
                break;
            default:
                result = Math.floor(onlyInteger * 1000);
        }
        return Number(result);
    };
    return Util;
}());
exports.default = Util;
