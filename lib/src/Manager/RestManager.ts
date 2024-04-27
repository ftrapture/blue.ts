import Events from "../Utils/Events";
import { fetch } from "undici";
import Player from "./PlayerManager";
import "../Utils/Color";
import Methods from "../Utils/Methods";

interface Node {
    host: string,
    password: string,
    port: number,
    secure: boolean
}

class Rest {
    private blue: any;
    private url: string | null;
    private sessionId: any;
    public options: Node;
    constructor(blue: any) {
        this.blue = blue;
        this.url = `http${this.blue._nodes[0].secure ? "s" : ""}://${this.blue._nodes[0].host}:${this.blue._nodes[0].port}`;
        this.options = {
            host: this.blue._nodes[0].host,
            password: this.blue._nodes[0].password,
            port: this.blue._nodes[0].port,
            secure: this.blue._nodes[0].secure
        }
    }

    async setSession(id: string) {
        this.sessionId = id;
        this.url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}`;
        this.options["host"] = this.blue.options.host;
        this.options["password"] = this.blue.options.password;
        this.options["port"] = this.blue.options.port;
        this.options["secure"] = this.blue.options.secur;
    }

    async updatePlayer(options: any) {
        this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.options.host} ---> [${String("PLAYER UPDATE").Yellow()}] ---> ${String(`${JSON.stringify(options)}`).Yellow()}`);
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

    async getStats() {
        return (await this.get(`/${this.blue.version}/stats`)); 
    }

    async fetchVersion() {
        return (await this.get(`/version`)); 
    }

    async updateSession(sessionId: string, payload: any) {
        return (await this.patch(`/${this.blue.version}/sessions/${sessionId}`, payload)); 
    }

    async getInfo() {
        return (await this.get(`/${this.blue.version}/info`)); 
    }

    async decodeTrack(encoded: string) {
        return (await this.get(`${this.blue.version}/decodetrack?encodedTrack=${encoded}`));
    }

    async decodeTracks(encoded: any[]) {
        return (await this.patch(`${this.blue.version}/decodetracks`, encoded));
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

    async get(path: string) {
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


    async post(endpoint: string, body: any) {
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

    async delete(endpoint: string) {
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