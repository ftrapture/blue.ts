const Socket = require("ws");
const { client_name } = require("../config.json");
const Events = require("../Utils/Events");
const RestManager = require(`../Manager/RestManager`);
class Node {
    constructor(blue, node, options) {
        this.blue = blue;
        this.node = node;
        this.sessionId = null;
        this.connected = false;
        this.options = options;
        this.info = {
            host: this.node.host,
            port: this.node.port,
            secure: !!this.node.secure,
            password: this.node.password
        };
        this.count = 0;
        this.stats = {
            "frameStats": null,
            "players": 0,
            "playingPlayers": 0,
            "uptime": 0,
            "memory": {
                "free": 0,
                "used": 0,
                "allocated": 0,
                "reservable": 0
            },
            "cpu": {
                "cores": 0,
                "systemLoad": 0,
                "lavalinkLoad": 0
            }
        }
        this.playerUpdate = this.options?.playerUpdateInterval || 50;
        this.rest = new RestManager(this.blue);
        this.resumeKey = !!this.options?.resumeKey ? this.options.resumeKey : null;
        this.ws = null;
    }
    connect() {
        const headers = {
            "Authorization": this.info.password,
            "Client-Name": client_name,
            "User-Id": this.blue.client.user.id
        };
        if (this.resumeKey) headers["Resume-Key"] = this.resumeKey;
        this.ws = new Socket(`w${this.info.secure ? "ss" : "s"}://${this.info.host}:${this.info.port}/v4/websocket`, { headers });
        this.blue.emit(Events.api, `[DEBUG]: ${this.info.host} ---> [CONNECTING...]`);
        this.ws.on(Events.wsConnect, this.open.bind(this));
        this.ws.on(Events.wsDisconnect, this.close.bind(this));
        this.ws.on(Events.wsDebug, this.message.bind(this));
        this.ws.on(Events.wsError, this.error.bind(this));
    }
    
    disconnect() {
        if(this.ws) {
            return this.ws.close();
        }
        return this
    }

    isConnected() {
        return this.connected;
    }

    open() {
        this.connected = true;
        this.blue.nodes.set(this.info.host, this);
        this.blue.emit(Events.api, `[DEBUG]: ${this.info.host} ---> [WEBSOCKET GATEWAY] --> [STATUS: OK, CODE: 200]`);
        this.blue.emit(Events.nodeConnect, this, `${client_name} ${this.info.host} :: node successfully connected!`);
    }
    close() {
        this.connected = false;
        this.blue.emit(Events.nodeDisconnect, this, `${client_name} ${this.info.host} :: node disconnected!`);
        this.blue.emit(Events.api, `[DEBUG]: ${this.info.host} ---> [CLOSING ERROR_CODE: 404 | 405]`);
        this.count++;
        if (this.count > 10) {
            this.blue.emit(Events.nodeDisconnect, this, `${client_name} error :: After Several tries I couldn't connect to the lavalink!`);
            this.count = 0;
            return this.ws.close();
        }
       const timeout = setTimeout(() => {
         if(this.blue.nodes.get(this.info.host))
            this.connect();
         clearTimeout(timeout);
        }, 5000);
    }
    async message(payload) {
        const packet = JSON.parse(payload);
        if (!packet?.op) return;
        switch (packet.op) {
            case "stats":
                this.stats = { ...packet };
                this.blue.emit(Events.api, `[DEBUG]: ${this.info.host} ---> [RECEIVED: SYSTEM PAYLOAD] ---> ${JSON.stringify(this.stats)}`);
                break;
            case "event":
                this.blue.handleEvents(packet);
                this.blue.emit(Events.api, `[DEBUG]: ${this.info.host} ---> [RECEIVED: EVENT PAYLOAD] ---> ${JSON.stringify(packet)}`);
                break;
            case "ready":
                this.sessionId = packet.sessionId;
                this.blue.emit(Events.api, `[DEBUG]: ${this.info.host} ---> [RECEIVED: READY PAYLOAD] ---> ${JSON.stringify(packet)}`);
                this.rest.setSession(this.sessionId);
                if (this.resumeKey) {
                    await this.rest.patch(`/v4/sessions/${this.sessionId}`, { resumingKey: this.resumeKey, timeout: this.playerUpdate })
                }
                break;
            case "playerUpdate":
                const player = this.blue.players.get(packet?.guildId);
                if (player) {
                    this.blue.emit(Events.playerUpdate, player);
                    player.position = packet.state.position || 0;
                }
                break;
            default:
                this.blue.emit(Events.nodeError, this, new Error(`Unexpected op "${payload.op}" with data: ${payload}`)
                );
                return;
        }
    }
    error(err) {
        this.blue.emit(Events.api, `[DEBUG]: ${this.info.host} ---> [WEBSOCKET ERROR]`);
        this.blue.emit(Events.nodeError, err, new Error(`Unable to connect to lavalink!`));
    }
}

module["exports"] = Node;