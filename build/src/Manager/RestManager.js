"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Events_1 = __importDefault(require("../Utils/Events"));
const undici_1 = require("undici");
const PlayerManager_1 = __importDefault(require("./PlayerManager"));
require("../Utils/Color");
const Methods_1 = __importDefault(require("../Utils/Methods"));
/**
 * Rest class for handling RESTful API interactions.
 */
class Rest {
    blue;
    url;
    sessionId;
    options;
    /**
     * Constructs a new Rest instance.
     * @param blue - The BlueStruct instance.
     */
    constructor(blue) {
        this.blue = blue;
        this.url = `http${this.blue._nodes[0].secure ? "s" : ""}://${this.blue._nodes[0].host}:${this.blue._nodes[0].port}`;
        this.options = {
            host: this.blue._nodes[0].host,
            password: this.blue._nodes[0].password,
            port: this.blue._nodes[0].port,
            secure: this.blue._nodes[0].secure
        };
    }
    /**
     * Sets the session ID.
     * @param id - The session ID.
     * @returns A promise resolving to void.
     */
    async setSession(id) {
        this.sessionId = id;
        this.url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}`;
        this.options["host"] = this.blue.options.host;
        this.options["password"] = this.blue.options.password;
        this.options["port"] = this.blue.options.port;
        this.options["secure"] = this.blue.options.secure;
    }
    /**
     * Updates player information.
     * @param options - The player options.
     * @returns A promise resolving to any.
     */
    async updatePlayer(options) {
        this.blue.emit(Events_1.default.api, `[${String("DEBUG").Blue()}]: ${this.options.host} ---> [${String("PLAYER UPDATE").Yellow()}] ---> ${String(`${JSON.stringify(options)}`).Yellow()}`);
        return (await this.patch(`/${this.blue.version}/sessions/${this.sessionId}/players/${options.guildId}?noReplace=${options?.noReplace || false}`, options.data));
    }
    /**
     * Creates a new player instance.
     * @param options - The player options.
     * @returns The created PlayerStruct instance.
     * @throws ReferenceError if options are not provided.
     */
    createPlayer(options = {}) {
        if (Object.keys(options).length < 1)
            throw new ReferenceError("Must provide voice, guild and text channel ids.");
        if (this.blue.players.has(options.guildId))
            return this.blue.players.get(options.guildId);
        const playerObj = new PlayerManager_1.default(this.blue, options);
        this.blue.players.set(options.guildId, playerObj);
        return playerObj;
    }
    /**
     * Retrieves all players.
     * @returns A promise resolving to any.
     */
    async getPlayers() {
        return (await this.get(`/${this.blue.version}/sessions/${this.sessionId}/players`));
    }
    /**
     * Retrieves statistics.
     * @returns A promise resolving to any.
     */
    async getStats() {
        return (await this.get(`/${this.blue.version}/stats`));
    }
    /**
     * Fetches the version.
     * @returns A promise resolving to any.
     */
    async fetchVersion() {
        return (await this.get(`/version`));
    }
    /**
     * Updates a session.
     * @param sessionId - The session ID.
     * @param payload - The payload.
     * @returns A promise resolving to any.
     */
    async updateSession(sessionId, payload) {
        return (await this.patch(`/${this.blue.version}/sessions/${sessionId}`, payload));
    }
    /**
     * Retrieves information.
     * @returns A promise resolving to any.
     */
    async getInfo() {
        return (await this.get(`/${this.blue.version}/info`));
    }
    /**
     * Decodes a track.
     * @param encoded - The encoded track.
     * @returns A promise resolving to any.
     */
    async decodeTrack(encoded) {
        return (await this.get(`${this.blue.version}/decodetrack?encodedTrack=${encoded}`));
    }
    /**
     * Decodes multiple tracks.
     * @param encoded - The encoded tracks.
     * @returns A promise resolving to any.
     */
    async decodeTracks(encoded) {
        return (await this.patch(`${this.blue.version}/decodetracks`, encoded));
    }
    /**
     * Retrieves a player.
     * @param guildId - The guild ID.
     * @returns A promise resolving to any.
     */
    async getPlayer(guildId) {
        return (await this.get(`/${this.blue.version}/sessions/${this.sessionId}/players/${guildId}`));
    }
    /**
     * Destroys a player.
     * @param guildId - The guild ID.
     * @returns A promise resolving to any.
     */
    async destroyPlayer(guildId) {
        return (await this.delete(`/${this.blue.version}/sessions/${this.sessionId}/players/${guildId}`));
    }
    /**
     * Sends a payload.
     * @param payload - The payload to send.
     * @returns A promise resolving to any.
     */
    async send(payload) {
        try {
            new Promise((resolve, reject) => {
                let data = JSON.stringify(payload);
                if (data) {
                    resolve(data);
                    this.blue.node.ws.send(data, (error) => {
                        if (error)
                            throw new Error(error);
                        else
                            return this;
                    });
                }
                else {
                    reject(data);
                    throw new Error("Received an unknown payload!");
                }
            });
        }
        catch (e) {
            this.blue.emit(Events_1.default.nodeError, e, new Error("Unable to send the data to the endpoint!"));
        }
    }
    // Private methods for REST operations...
    async patch(endpoint, body) {
        try {
            let req = await (0, undici_1.fetch)(this.url + endpoint, {
                method: Methods_1.default.Patch,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.options.password,
                },
                body: JSON.stringify(body),
            });
            return (await req.json());
        }
        catch (e) {
            return null;
        }
    }
    async get(path) {
        try {
            const req = await (0, undici_1.fetch)(this.url + path, {
                method: Methods_1.default.Get,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.options.password,
                },
            });
            return req.headers.get("content-type") === "application/json" ? (await req.json()) : (await req.text());
        }
        catch (e) {
            return null;
        }
    }
    async post(endpoint, body) {
        try {
            let req = await (0, undici_1.fetch)(this.url + endpoint, {
                method: Methods_1.default.Post,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.options.password,
                },
                body: JSON.stringify(body),
            });
            return (await req.json());
        }
        catch (e) {
            return null;
        }
    }
    async delete(endpoint) {
        try {
            let req = await (0, undici_1.fetch)(this.url + endpoint, {
                method: Methods_1.default.Delete,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.options.password,
                },
            });
            return (await req.json());
        }
        catch (e) {
            return null;
        }
    }
}
exports.default = Rest;
//# sourceMappingURL=RestManager.js.map