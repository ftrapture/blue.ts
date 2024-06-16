"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = __importDefault(require("../Connectors/Node"));
const config_json_1 = require("../config.json");
const Libs_1 = __importDefault(require("./Libs"));
/**
 * Utility class for various operations.
 */
class Util {
    blue;
    platforms;
    /**
     * Constructs a new Util instance.
     * @param blue - The Blue object.
     */
    constructor(blue) {
        this.platforms = {
            "youtube": "ytsearch",
            "youtube music": "ytmsearch",
            "soundcloud": "scsearch",
            "spotify": "spsearch"
        };
        this.blue = blue;
    }
    /**
     * Checks the validity of parameters passed to the bluets constructor.
     * @param nodePackets - Node packets.
     * @param defaultPackets - Default packets.
     * @returns The Node object.
     * @throws Errors if invalid arguments are passed.
     */
    async checkParamsValidity(nodePackets, defaultPackets) {
        if (!nodePackets || !defaultPackets.library || nodePackets.length < 1) {
            throw new Error("Invalid arguments passed to the bluets constructor.");
        }
        const supportedLibraries = [Libs_1.default.DiscordJs, Libs_1.default.Eris, Libs_1.default.OceanicJS];
        if (!supportedLibraries.includes(defaultPackets.library)) {
            throw new Error("Supported Libraries: DiscordJs | Eris | OceanicJs, but received Unknown#Lib");
        }
        for (const packet of nodePackets) {
            if (!packet.host || !packet.password || !packet.port || !Object.keys(packet).includes("secure")) {
                throw new Error("Invalid parameters passed in bluets constructor.");
            }
            const node = new Node_1.default(this.blue, packet, defaultPackets);
            await node.connect();
            this.blue.version = typeof defaultPackets.version === "string" ? await this.blue.verifyVersion(defaultPackets.version) : "v4";
            if (!this.blue.node || !node.isConnected())
                this.blue.node = node;
        }
        const defaultSearchEngine = defaultPackets.defaultSearchEngine;
        if (defaultSearchEngine && !this.platforms[defaultSearchEngine]) {
            throw new Error(`Available search engines are: ${Object.keys(this.platforms).join(", ")} or keep it blank.`);
        }
        this.blue.options = {
            host: this.blue?.node?.info?.host || nodePackets[0].host,
            password: this.blue?.node?.info?.password || nodePackets[0].password,
            port: this.blue?.node?.info?.port || nodePackets[0].port,
            secure: this.blue?.node?.info?.secure || nodePackets[0].secure,
            defaultSearchEngine: defaultSearchEngine ? this.platforms[defaultSearchEngine] || config_json_1.default_platform : config_json_1.default_platform,
            autoplay: defaultPackets.autoplay || false,
            library: defaultPackets.library,
        };
        if (Array.isArray(defaultPackets?.plugins))
            this.blue.options.plugins = defaultPackets?.plugins;
        return this.blue.node;
    }
    /**
     * Checks the validity of an object.
     * @param options - The options object.
     * @returns A boolean indicating validity.
     * @throws Errors if options are invalid.
     */
    checkObjectValidity(options) {
        const { guildId, voiceChannel, textChannel } = options;
        if (!guildId) {
            throw new Error("Provide the proper guildId");
        }
        if (typeof guildId !== "string") {
            throw new TypeError(`The option 'guildId' must be a string, but received '${typeof guildId}' type!`);
        }
        if (!voiceChannel) {
            throw new TypeError("Provide the proper VoiceChannel ID");
        }
        if (typeof voiceChannel !== "string") {
            throw new TypeError(`The option 'voiceChannel' must be a string, but received '${typeof voiceChannel}' type!`);
        }
        if (!textChannel) {
            throw new TypeError("Provide the proper TextChannel ID");
        }
        if (typeof textChannel !== "string") {
            throw new TypeError(`The option 'textChannel' must be a string, but received '${typeof textChannel}' type!`);
        }
        return true;
    }
    /**
     * Encodes a string to base64.
     * @param input - The input string.
     * @returns The base64 encoded string.
     */
    base64encode(input) {
        return Buffer.from(input).toString('base64');
    }
    /**
     * Decodes a base64 string.
     * @param input - The input base64 string.
     * @returns The decoded string or false if input is not valid base64.
     */
    base64decode(input) {
        if (!this.isBase64(input))
            return false;
        return Buffer.from(input, 'base64').toString('utf-8');
    }
    /**
     * Checks if a string is valid base64.
     * @param input - The input string.
     * @returns A boolean indicating validity.
     */
    isBase64(input) {
        const validBase64Chars = /^[A-Za-z0-9+/]*=?=?$/;
        if (!validBase64Chars.test(input)) {
            return false;
        }
        const lengthWithoutPadding = input.replace(/=/g, '').length;
        if (lengthWithoutPadding % 4 !== 0) {
            return false;
        }
        try {
            const decoded = Buffer.from(input, 'base64').toString('utf-8');
            return decoded !== input;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Converts time duration to milliseconds.
     * @param time - The time duration.
     * @returns The duration in milliseconds.
     * @throws Errors for invalid time formats or values.
     */
    durationInMs(time) {
        if (!time && time !== 0) {
            throw new RangeError("'time' parameter must be present and of string type with a value greater than 0.");
        }
        const onlyInteger = parseInt(time.toString());
        if (Number.isNaN(onlyInteger)) {
            throw new TypeError("Invalid time format, e.g: 2min");
        }
        if (typeof time === "number") {
            return Math.floor(onlyInteger * 1000);
        }
        const units = ["weeks", "w", "ms", "s", "hrs", "days", "months", "years", "seconds", "miliseconds", "minutes", "hours", "d", "m", "y", "yrs"];
        const timeString = time.toString().toUpperCase().trim();
        const unit = units.find(u => timeString.includes(u)) || "s";
        let result;
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
    }
}
exports.default = Util;
//# sourceMappingURL=Util.js.map