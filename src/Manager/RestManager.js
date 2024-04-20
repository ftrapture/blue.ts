const Events = require("../Utils/Events");
const { fetch } = require("undici");
const Player = require("./PlayerManager");

class Rest {
    constructor(blue) {
        this.blue = blue;
        this.url = null;
    }

    sendGuildShardData(data) {
        try {
            if (!data) throw new Error("Parameter of 'sendGuildShardData' must be present.")
            return new Promise(async (resolve, reject) => {
                if (!this.blue.client) return reject(data);
                const guild = await this.blue.client.guilds.fetch(data.d.guild_id).catch(() => null);
                if (guild) {
                    resolve(guild);
                    this.blue.client.ws.shards.get(guild.shardId).send(data);
                    this.blue.emit(Events.api, `[DEBUG]: ${this.blue.options.host} ---> [RECEIVED: SHARD PAYLOAD] ---> ${JSON.stringify(data)}`);
                } else {
                    reject(guild);
                }
            });
        } catch (e) {
            throw new Error("Unable to send data to the guild.");
        }
    }

    async setSession(id) {
        this.sessionId = id;
        this.url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}`;
    }

    async updatePlayer(options) {
        this.blue.emit(Events.api, `[DEBUG]: ${this.blue.options.host} ---> [PLAYER UPDATE] ---> ${JSON.stringify(options)}`);
        return (await this.patch(`/${this.blue.version}/sessions/${this.sessionId}/players/${options.guildId}?noReplace=false`, options.data));
    }

    createPlayer(options = {}) {
        if(Object.keys(options).length < 1) throw new ReferenceError("Must provide voice, guild and text channel ids.");
        if (this.blue.players.has(options.guildId))
            return this.blue.players.get(options.guildId);
        const playerObj = new Player(this.blue, options);
        this.blue.players.set(options.guildId, playerObj);
        return playerObj;
    }

    async patch(endpoint, body) {
        try {
            let req = await fetch(this.url + endpoint, {
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

    async getPlayers() {
        return (await this.get(`/${this.blue.version}/sessions/${this.sessionId}/players`)); 
    }

    async destroyPlayer(guildId) {
        return (await this.delete(`/${this.blue.version}/sessions/${this.sessionId}/players/${guildId}`));
    }

    async get(path) {
        try {
            const req = await fetch(this.url + path, {
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

    async post(endpoint, body) {
        try {
            let req = await fetch(this.url + endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.password,
                },
                body: JSON.stringify(body),
            });

            return (await req.json());
        } catch (e) {
            return null;
        }
    }

    async delete(endpoint) {
        try {
            let req = await fetch(this.url + endpoint, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.password,
                },
            });

            return (await req.json());
        } catch (e) {
            return null;
        }
    }

    async send(payload) {
        try {
            new Promise((resolve, reject) => {
                let data = JSON.stringify(payload);
                if (data) {
                    resolve(data);
                    this.blue.node.ws.send(data, (error) => {
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

module["exports"] = Rest;