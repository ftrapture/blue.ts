"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const config_json_1 = require("../config.json");
const Events_1 = __importDefault(require("../Utils/Events"));
const RestManager_1 = __importDefault(require("../Manager/RestManager"));
require("../Utils/Color");
const config_json_2 = __importDefault(require("../config.json"));
/**
 * Class definition for the Node class
 */
class Node {
    /**
   * Instance of the blue client
   */
    blue;
    /**
     * Node options
     */
    node;
    /**
     * Session ID
     */
    sessionId;
    /**
     * Connection status
     */
    connected;
    /**
     * Options
     */
    options;
    /**
     * Node information
     */
    info;
    /**
     * Connection attempt count
     */
    count;
    /**
     * Node stats
     */
    stats;
    /**
     * Player update interval
     */
    playerUpdate;
    /**
     * Rest manager
     */
    rest;
    /**
     * Resume key
     */
    resumeKey;
    /**
     * WebSocket connection
     */
    ws;
    /**
     * Constructor for the Node class
     * @param blue - The blue client instance
     * @param node - Node options
     * @param options - Options
     */
    constructor(blue, node, options) {
        // Assigning values to class properties
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
            frameStats: null,
            players: 0,
            playingPlayers: 0,
            uptime: 0,
            memory: {
                free: 0,
                used: 0,
                allocated: 0,
                reservable: 0
            },
            cpu: {
                cores: 0,
                systemLoad: 0,
                lavalinkLoad: 0
            }
        };
        this.playerUpdate = this.options?.playerUpdateInterval || 50;
        this.rest = new RestManager_1.default(this.blue);
        this.resumeKey = !!this.options?.resumeKey ? this.options.resumeKey : null;
        this.ws = null;
    }
    /**
     * Method to connect to the Lavalink node
     */
    connect() {
        // Setting headers for WebSocket connection
        const headers = {
            "Authorization": this.info.password,
            "Client-Name": config_json_1.client_name,
            "User-Id": this.blue.client.user.id,
            "User-Agent": `${config_json_1.client_name}:${config_json_2.default.version} (${config_json_2.default.repository.url})`
        };
        if (this.resumeKey)
            headers["Session-Id"] = this.resumeKey;
        // Creating WebSocket connection
        this.ws = new ws_1.default(`w${this.info.secure ? "ss" : "s"}://${this.info.host}:${this.info.port}/${this.blue.version}/websocket`, { headers });
        // WebSocket event listeners
        this.ws.on(Events_1.default.wsConnect, this.open.bind(this));
        this.ws.on(Events_1.default.wsDisconnect, this.close.bind(this));
        this.ws.on(Events_1.default.wsDebug, this.message.bind(this));
        this.ws.on(Events_1.default.wsError, this.error.bind(this));
    }
    /**
     * Method to disconnect from the Lavalink node
     * @returns - Returns the instance of the Node class or void
     */
    disconnect() {
        if (this.ws) {
            return this.ws.close();
        }
        return this;
    }
    /**
     * Method to check if connected to the Lavalink node
     * @returns - Returns true if connected, false otherwise
     */
    isConnected() {
        return this.connected;
    }
    /**
     * Event handler for successful WebSocket connection
     */
    open() {
        this.connected = true;
        this.blue.nodes.set(this.info.host, this);
        this.blue.emit(Events_1.default.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("WEBSOCKET GATEWAY").Yellow()}] --> [${String("STATUS: OK, CODE: 200").Green()}]`);
        this.blue.emit(Events_1.default.nodeConnect, this, `${config_json_1.client_name} ${this.info.host} :: node successfully connected!`);
    }
    /**
     * Event handler for WebSocket disconnection
     */
    close() {
        this.connected = false;
        this.blue.emit(Events_1.default.nodeDisconnect, this, `${config_json_1.client_name} ${this.info.host} :: node disconnected!`);
        this.blue.emit(Events_1.default.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("CLOSING ERROR_CODE: 404 | 405").Red()}]`);
        this.count++;
        if (this.count > 10) {
            this.blue.emit(Events_1.default.nodeDisconnect, this, `${config_json_1.client_name} error :: After Several tries I couldn't connect to the lavalink!`);
            this.count = 0;
            return this.ws.close();
        }
        const timeout = setTimeout(() => {
            if (this.blue.nodes.get(this.info.host))
                this.connect();
            clearTimeout(timeout);
        }, 5000);
    }
    /**
     * Event handler for receiving WebSocket messages
     * @param payload - The payload received
     */
    async message(payload) {
        const packet = JSON.parse(payload);
        if (!packet?.op)
            return;
        switch (packet.op) {
            case "stats":
                this.stats = { ...packet };
                this.blue.emit(Events_1.default.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("RECEIVED: SYSTEM PAYLOAD").Green()}] ---> ${String(`${JSON.stringify(this.stats)}`).Yellow()}`);
                break;
            case "event":
                this.blue.handleEvents(packet);
                this.blue.emit(Events_1.default.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("RECEIVED: EVENT PAYLOAD").Green()}] ---> ${String(`${JSON.stringify(packet)}`).Yellow()}`);
                break;
            case "ready":
                this.sessionId = packet.sessionId;
                this.blue.emit(Events_1.default.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("RECEIVED: READY PAYLOAD").Green()}] ---> ${String(`${JSON.stringify(packet)}`).Yellow()}`);
                this.rest.setSession(this.sessionId || "none");
                if (this.resumeKey) {
                    await this.rest.patch(`/v4/sessions/${this.sessionId}`, { resuming: !!this.resumeKey || false, timeout: this.playerUpdate });
                }
                break;
            case "playerUpdate":
                const player = this.blue.players.get(packet?.guildId);
                if (player) {
                    this.blue.emit(Events_1.default.playerUpdate, player, player?.queue?.current?.info);
                    player.position = packet.state.position || 0;
                }
                break;
            default:
                this.blue.emit(Events_1.default.nodeError, this, new Error(`Unexpected op "${payload.op}" with data: ${payload}`));
                return;
        }
    }
    /**
     * Event handler for WebSocket errors
     * @param err - The error received
     */
    error(err) {
        this.blue.emit(Events_1.default.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("WEBSOCKET ERROR").Red()}]`);
        this.blue.emit(Events_1.default.nodeError, err, new Error(`Unable to connect to lavalink!`));
    }
}
exports.default = Node;
//# sourceMappingURL=Node.js.map