import Events from "../Utils/Events";
import { fetch } from "undici";
import Player from "./PlayerManager";
import "../Utils/Color";
import Methods from "../Utils/Methods";
import { NodeOptions as Node, Player as PlayerStruct } from "../Blue";
import { Blue } from "../Connectors/Node";

interface BlueStruct extends Blue {
    search: (...args: any) => Promise<any>
}

/**
 * Rest class for handling RESTful API interactions.
 */
class Rest {
    private blue: BlueStruct;
    private url: string | null;
    private sessionId: any;
    public options: Node;

    /**
     * Constructs a new Rest instance.
     * @param blue - The BlueStruct instance.
     */
    constructor(blue: BlueStruct) {
        this.blue = blue;
        this.url = `http${this.blue._nodes[0].secure ? "s" : ""}://${this.blue._nodes[0].host}:${this.blue._nodes[0].port}`;
        this.options = {
            host: this.blue._nodes[0].host,
            password: this.blue._nodes[0].password,
            port: this.blue._nodes[0].port,
            secure: this.blue._nodes[0].secure
        }
    }

    /**
     * Sets the session ID.
     * @param id - The session ID.
     * @returns A promise resolving to void.
     */
    public async setSession(id: string): Promise<void> {
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
    public async updatePlayer(options: any): Promise<any> {
        this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.options.host} ---> [${String("PLAYER UPDATE").Yellow()}] ---> ${String(`${JSON.stringify(options)}`).Yellow()}`);
        return (await this.patch(`/${this.blue.version}/sessions/${this.sessionId}/players/${options.guildId}?noReplace=${options?.noReplace || false}`, options.data));
    }

    /**
     * Creates a new player instance.
     * @param options - The player options.
     * @returns The created PlayerStruct instance.
     * @throws ReferenceError if options are not provided.
     */
    public createPlayer(options: any = {}): PlayerStruct {
        if(Object.keys(options).length < 1) throw new ReferenceError("Must provide voice, guild and text channel ids.");
        if (this.blue.players.has(options.guildId))
            return this.blue.players.get(options.guildId);
        const playerObj: PlayerStruct = new Player(this.blue, options);
        this.blue.players.set(options.guildId, playerObj);
        return playerObj;
    }

    /**
     * Retrieves all players.
     * @returns A promise resolving to any.
     */
    public async getPlayers(): Promise<any> {
        return (await this.get(`/${this.blue.version}/sessions/${this.sessionId}/players`)); 
    }

    /**
     * Retrieves statistics.
     * @returns A promise resolving to any.
     */
    public async getStats(): Promise<any> {
        return (await this.get(`/${this.blue.version}/stats`)); 
    }

    /**
     * Fetches the version.
     * @returns A promise resolving to any.
     */
    public async fetchVersion(): Promise<any> {
        return (await this.get(`/version`)); 
    }

    /**
     * Updates a session.
     * @param sessionId - The session ID.
     * @param payload - The payload.
     * @returns A promise resolving to any.
     */
    public async updateSession(sessionId: string | unknown, payload: any): Promise<any> {
        return (await this.patch(`/${this.blue.version}/sessions/${sessionId}`, payload)); 
    }

    /**
     * Retrieves information.
     * @returns A promise resolving to any.
     */
    public async getInfo(): Promise<any> {
        return (await this.get(`/${this.blue.version}/info`)); 
    }

    /**
     * Decodes a track.
     * @param encoded - The encoded track.
     * @returns A promise resolving to any.
     */
    public async decodeTrack(encoded: string): Promise<any> {
        return (await this.get(`/${this.blue.version}/decodetrack?encodedTrack=${encodeURIComponent(encoded)}`));
    }

    /**
     * Decodes multiple tracks.
     * @param encoded - The encoded tracks.
     * @returns A promise resolving to any.
     */
    public async decodeTracks(encoded: any[]): Promise<any> {
        return (await this.post(`/${this.blue.version}/decodetracks`, encoded));
    }

    /**
     * Retrieves a player.
     * @param guildId - The guild ID.
     * @returns A promise resolving to any.
     */
    public async getPlayer(guildId: string): Promise<any> {
        return (await this.get(`/${this.blue.version}/sessions/${this.sessionId}/players/${guildId}`)); 
    }

    /**
     * Destroys a player.
     * @param guildId - The guild ID.
     * @returns A promise resolving to any.
     */
    public async destroyPlayer(guildId: string): Promise<any> {
        return (await this.delete(`/${this.blue.version}/sessions/${this.sessionId}/players/${guildId}`));
    }

    /**
     * Sends a payload.
     * @param payload - The payload to send.
     * @returns A promise resolving to any.
     */
    public async send(payload: any): Promise<any> {
        try {
            new Promise((resolve, reject) => {
                let data = JSON.stringify(payload);
                if (data) {
                    resolve(data);
                    this.blue.node.ws.send(data, (error: any) => {
                        if (error) throw new Error(error);
                        else
                            return this;
                    });
                } else {
                    reject(data);
                    throw new Error("Received an unknown payload!");
                }
            });
        } catch (e) {
            this.blue.emit(Events.nodeError, e, new Error("Unable to send the data to the endpoint!"));
        }
    }

    // Private methods for REST operations...

    public async patch(endpoint: string, body: any): Promise<any> {
        try {
            let req = await fetch(this.url! + endpoint, {
                method: Methods.Patch,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.options.password,
                },
                body: JSON.stringify(body),
            });
            return (await req.json());
        } catch (e) {
            return null;
        }
    }

    public async get(path: string): Promise<any> {
        try {
            const req = await fetch(this.url! + path, {
                method: Methods.Get,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.options.password,
                },
            });
            return req.headers.get("content-type") === "application/json" ? (await req.json()) : (await req.text());
        } catch (e) {
            return null;
        }
    }

    public async post(endpoint: string, body: any): Promise<any> {
        try {
            let req = await fetch(this.url! + endpoint, {
                method: Methods.Post,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.options.password,
                },
                body: JSON.stringify(body),
            });

            return (await req.json());
        } catch (e) {
            return null;
        }
    }

    public async delete(endpoint: string): Promise<any> {
        try {
            let req = await fetch(this.url! + endpoint, {
                method: Methods.Delete,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.options.password,
                },
            });

            return (await req.json());
        } catch (e) {
            return null;
        }
    }
}

export default Rest;
