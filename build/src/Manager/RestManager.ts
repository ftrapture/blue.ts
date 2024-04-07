import Events from "../Utils/Events";
import { fetch } from "undici";
import Player from "./PlayerManager";
import "../Utils/Color";
class Rest {
    private blue: any;
    private url: string | null;
    private sessionId: any;

    constructor(blue: any) {
        this.blue = blue;
        this.url = null;
    }

    sendGuildShardData(data: any) {
        try {
            if (!data) throw new Error("Parameter of 'sendGuildShardData' must be present.")
            return new Promise(async (resolve, reject) => {
                if (!this.blue.client) return reject(data);
                const guild = await this.blue.client.guilds.fetch(data.d.guild_id).catch(() => null);
                if (guild) {
                    resolve(guild);
                    this.blue.client.ws.shards.get(guild.shardId).send(data);
                    this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.blue.options.host} ---> [${String("RECEIVED: SHARD PAYLOAD").Green()}] ---> ${String(`${JSON.stringify(data)}`).Yellow()}`);
                } else {
                    reject(guild);
                }
            });
        } catch (e) {
            throw new Error("Unable to send data to the guild.");
        }
    }

    async setSession(id: string) {
        this.sessionId = id;
        this.url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}`;
    }

    async updatePlayer(options: any) {
        this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.blue.options.host} ---> [${String("PLAYER UPDATE").Yellow()}] ---> ${String(`${JSON.stringify(options)}`).Yellow()}`);
        return (await this.patch(`/${this.blue.version}/sessions/${this.sessionId}/players/${options.guildId}?noReplace=${options?.noReplace || false}`, options.data));
    }

    createPlayer(options: any = {}) {
        if(Object.keys(options).length < 1) throw new ReferenceError("Must provide voice, guild and text channel ids.");
        if (this.blue.players.has(options.guildId))
            return this.blue.players.get(options.guildId);
        const playerObj = new Player(this.blue, options);
        this.blue.players.set(options.guildId, playerObj);
        return playerObj;
    }

    
    async getPlayers() {
        return (await this.get(`/${this.blue.version}/sessions/${this.sessionId}/players`)); 
    }

    async getPlayer(guildId: string) {
        return (await this.get(`/${this.blue.version}/sessions/${this.sessionId}/players/${guildId}`)); 
    }

    async destroyPlayer(guildId: string) {
        return (await this.delete(`/${this.blue.version}/sessions/${this.sessionId}/players/${guildId}`));
    }

    async patch(endpoint: string, body: any) {
        try {
            let req = await fetch(this.url! + endpoint, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.blue.options.password,
                },
                body: JSON.stringify(body),
            });
            return (await req.json());
        } catch (e) {
            return null;
        }
    }

    async get(path: string) {
        try {
            const req = await fetch(this.url! + path, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.blue.options.password,
                },
            });

        return req.headers.get("content-type") === "application/json" ? (await req.json()) : (await req.text());
        } catch (e) {
            return null;
        }
    }

    async post(endpoint: string, body: any) {
        try {
            let req = await fetch(this.url! + endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.blue.options.password,
                },
                body: JSON.stringify(body),
            });

            return (await req.json());
        } catch (e) {
            return null;
        }
    }

    async delete(endpoint: string) {
        try {
            let req = await fetch(this.url! + endpoint, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.blue.options.password,
                },
            });

            return (await req.json());
        } catch (e) {
            return null;
        }
    }

    async send(payload: any) {
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
                    throw new Error("Recieved an unknown payload!");
                }
            });
        } catch (e) {
            this.blue.emit(Events.nodeError, e, new Error("Unable to send the data to the endpoint!"));
        }
    }
}

export default Rest;