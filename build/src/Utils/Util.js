"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Node_1 = __importDefault(require("./../Components/Node"));
var config_json_1 = require("./../config.json");
var platform = {
    "youtube": "ytsearch",
    "youtube music": "ytmsearch",
    "soundcloud": "scsearch"
};
var arr = ["youtube", "youtube music", "soundcloud"];
var Util = /** @class */ (function () {
    function Util(blue) {
        this.blue = blue;
    }
    Util.prototype.checkParamsValidity = function (nodePackets, defaultPackets) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!nodePackets || (nodePackets === null || nodePackets === void 0 ? void 0 : nodePackets.length) < 1)
            throw new Error("Cannot validate the paramerters you passed in bluejs constructor.");
        for (var i in nodePackets) {
            if (!((_a = nodePackets[i]) === null || _a === void 0 ? void 0 : _a.host) || !((_b = nodePackets[i]) === null || _b === void 0 ? void 0 : _b.password) || !((_c = nodePackets[i]) === null || _c === void 0 ? void 0 : _c.port) || !Object.keys(nodePackets[i]).includes("secure"))
                throw new Error("You've passed invalid parameters in bluejs constructor.");
            this.blue.node = new Node_1.default(this.blue, nodePackets[i], defaultPackets);
            this.blue.node.connect();
        }
        if (defaultPackets === null || defaultPackets === void 0 ? void 0 : defaultPackets.defaultSearchEngine)
            if ((defaultPackets === null || defaultPackets === void 0 ? void 0 : defaultPackets.defaultSearchEngine) !== "youtube" || (defaultPackets === null || defaultPackets === void 0 ? void 0 : defaultPackets.defaultSearchEngine) !== "youtube music" || (defaultPackets === null || defaultPackets === void 0 ? void 0 : defaultPackets.defaultSearchEngine) !== "soundcloud")
                throw new Error("Available search engines are: youtube, youtube music, soundcloud or keep it blank.");
        this.blue.options = {
            host: (_d = nodePackets[0]) === null || _d === void 0 ? void 0 : _d.host,
            password: (_e = nodePackets[0]) === null || _e === void 0 ? void 0 : _e.password,
            port: (_f = nodePackets[0]) === null || _f === void 0 ? void 0 : _f.port,
            secure: (_g = nodePackets[0]) === null || _g === void 0 ? void 0 : _g.secure,
            defaultSearchEngine: (defaultPackets === null || defaultPackets === void 0 ? void 0 : defaultPackets.defaultSearchEngine) ? (arr.includes(defaultPackets.defaultSearchEngine.toLowerCase()) === true ? platform[defaultPackets.defaultSearchEngine.toLowerCase()] : config_json_1.default_platform) || config_json_1.default_platform : config_json_1.default_platform,
            autoplay: (defaultPackets === null || defaultPackets === void 0 ? void 0 : defaultPackets.autoplay) || false
        };
        return this.blue.node;
    };
    Util.prototype.checkObjectValidity = function (options) {
        var guildId = options.guildId, voiceChannel = options.voiceChannel, textChannel = options.textChannel;
        if (!guildId)
            throw new Error("Provide the proper guildId");
        if (typeof guildId !== "string")
            throw new TypeError("The option 'guildId' must not be non-string, but recieved '".concat(typeof guildId, "' type!"));
        if (!voiceChannel)
            throw new TypeError("Provide the proper VoiceChannel ID");
        if (typeof voiceChannel !== "string")
            throw new TypeError("The option 'voiceChannel' must not be non-string, but recieved '".concat(typeof voiceChannel, "' type!"));
        if (!textChannel)
            throw new TypeError("Provide the proper TextChannel ID");
        if (typeof textChannel !== "string")
            throw new TypeError("The option 'textChannel' must not be non-string, but recieved '".concat(typeof textChannel, "' type!"));
        return true;
    };
    Util.prototype.durationInMs = function (time) {
        if (!time && time !== 0)
            throw new RangeError("'time' parameter must be present and of string type with the value greater than 0.");
        var onlyInteger = parseInt(time);
        if (typeof time === "number")
            return Number(Math.floor(onlyInteger * 1000));
        if (Number.isNaN(onlyInteger))
            throw new TypeError("Invalid time format, e.g: 2min");
        var units = ["weeks", "w", "ms", "s", "hrs", "days", "months", "years", "seconds", "miliseconds", "minutes", "hours", "d", "m", "y", "yrs"];
        var onlyString = this.timeString(time.toUpperCase()).trim();
        var get = "s";
        if (onlyString !== "")
            get = units.find(function (ar) { return ar.includes(onlyString); });
        var result;
        if (get == "s" || get == "seconds") {
            result = Math.floor(onlyInteger * 1000);
        }
        else if (get == "minutes") {
            result = Math.floor(onlyInteger * (1000 * 60));
        }
        else if (get == "ms" || get == "miliseconds") {
            result = Math.floor(onlyInteger);
        }
        else if (get == "hrs" || get == "hours") {
            result = Math.floor(onlyInteger * (1000 * 60 * 60));
        }
        else if (get == "days" || get == "d") {
            result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24));
        }
        else if (get == "months" || get == "m") {
            result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24 * 30));
        }
        else if (get == "years" || get == "yrs") {
            result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24 * 365));
        }
        else if (get == "w" || get == "weeks") {
            result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24 * 7));
        }
        else {
            result = Math.floor(onlyInteger * 1000);
        }
        return Number(result);
    };
    Util.prototype.timeString = function (time) {
        var string = "";
        for (var i = 0; i < time.length; i++) {
            var ch = time.charCodeAt(i);
            for (var j = 65; j <= 90; j++) {
                if (ch == j)
                    string += String.fromCharCode(ch);
            }
        }
        return string.toLowerCase();
    };
    return Util;
}());
exports.default = Util;
