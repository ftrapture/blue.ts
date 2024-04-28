import Node from "../Connectors/Node";
import { client_name, default_platform } from "../config.json";
import Libs from "./Libs";

interface Platform {
    [key: string]: string;
}

const supportedPlatforms: Platform = {
    "youtube": "ytsearch",
    "youtube music": "ytmsearch",
    "soundcloud": "scsearch"
};

interface Options {
    guildId: string;
    voiceChannel: string;
    textChannel: string;
}

interface NodePacket {
    host: string;
    password: string;
    port: number;
    secure: boolean;
    version?: string;
}

interface DefaultPacket {
    library: Libs;
    defaultSearchEngine?: keyof Platform;
    autoplay?: boolean;
}

interface BluetsOptions {
    host: string;
    password: string;
    port: number;
    secure: boolean;
    defaultSearchEngine: string;
    autoplay: boolean;
    library: Libs;
}

class Util {
    private blue: any;

    constructor(blue: any) {
        this.blue = blue;
    }

    async checkParamsValidity<T extends DefaultPacket>(nodePackets: NodePacket[], defaultPackets: T): Promise<any> {
        if (!nodePackets || !defaultPackets.library || nodePackets.length < 1) {
            throw new Error("Invalid arguments passed to the bluets constructor.");
        }

        const supportedLibraries = [Libs.DiscordJs, Libs.Eris, Libs.OceanicJS];
        if (!supportedLibraries.includes(defaultPackets.library)) {
            throw new Error("Supported Libraries: DiscordJs | Eris | OceanicJs, but received Unknown#Lib");
        }

        for (const packet of nodePackets) {
            if (!packet.host || !packet.password || !packet.port || !Object.keys(packet).includes("secure")) {
                throw new Error("Invalid parameters passed in bluets constructor.");
            }

            this.blue.node = new Node(this.blue, packet, defaultPackets);
            this.blue.version = typeof packet.version === "string" ? await this.blue.verify_version(packet.version) : "v4";
            this.blue.node.connect();
        }

        const defaultSearchEngine = defaultPackets.defaultSearchEngine;
        if (defaultSearchEngine && !supportedPlatforms[defaultSearchEngine]) {
            throw new Error(`Available search engines are: ${Object.keys(supportedPlatforms).join(", ")} or keep it blank.`);
        }

        this.blue.options = {
            host: nodePackets[0].host,
            password: nodePackets[0].password,
            port: nodePackets[0].port,
            secure: nodePackets[0].secure,
            defaultSearchEngine: defaultSearchEngine ? supportedPlatforms[defaultSearchEngine] || default_platform : default_platform,
            autoplay: defaultPackets.autoplay || false,
            library: defaultPackets.library
        };

        return this.blue.node;
    }

    checkObjectValidity<T extends Options>(options: T): boolean {
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

    base64encode(input: string): string {
        return Buffer.from(input).toString('base64');
    }

    base64decode(input: string): string | boolean {
        if(!this.isBase64(input)) return false;
        return Buffer.from(input, 'base64').toString('utf-8');
    }

    isBase64(input: string): boolean {
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
        } catch (error) {
            return false;
        }
    }

    durationInMs(time: string | number): number {
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

export default Util;