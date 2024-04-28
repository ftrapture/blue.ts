"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_events_1 = require("node:events");
const config_json_1 = require("./config.json");
const voiceStateUpdate_1 = __importDefault(require("./Connectors/voiceStateUpdate"));
const Util_1 = __importDefault(require("./Utils/Util"));
const Types_1 = __importDefault(require("./Utils/Types"));
const Events_1 = __importDefault(require("./Utils/Events"));
const Node_1 = __importDefault(require("./Connectors/Node"));
const SearchManager_1 = __importDefault(require("./Manager/SearchManager"));
const Track_1 = __importDefault(require("./Structure/Track"));
const index_1 = __importDefault(require("./Libs/index"));
class Blue extends node_events_1.EventEmitter {
    nodes;
    _options;
    options;
    version;
    node;
    load;
    _nodes;
    util;
    client;
    voiceState;
    players;
    _versions;
    send;
    Lib;
    plugins;
    initiated;
    constructor(nodes, options = {}) {
        super({ ...options });
        if (!nodes)
            throw new Error("You didn't provide a lavalink node");
        this.nodes = new Map();
        this._options = options;
        this.options = options;
        this._versions = ["v4"]; //soon many versions will be there.
        this.version = this._versions[0];
        this.node = null;
        this.load = new SearchManager_1.default(this);
        this._nodes = nodes;
        this.util = new Util_1.default(this);
        this.client = null;
        this.initiated = false;
        this.voiceState = new voiceStateUpdate_1.default(this);
        this.players = new Map();
    }
    get isInitiated() {
        return this.initiated;
    }
    init(client) {
        this.initiated = true;
        this.client = client;
        this.util.checkParamsValidity([...this._nodes], { ...this.options });
        this.Lib = new index_1.default(this.options.library, this).main();
        return this.node;
    }
    create(options = {}) {
        if (!this.isInitiated)
            throw new Error("Blue has not been initiated yet.");
        const check = this.util.checkObjectValidity(options);
        if (!check)
            return false;
        if (!this.node)
            throw new TypeError("No nodes are available");
        const player = this.node.rest.createPlayer(options);
        player.connect();
        return player;
    }
    activeNodes() {
        return this._nodes.filter(n => this.nodes.get(n.host)?.connected);
    }
    verify_version(ver) {
        return this._versions.find(v => v.toLowerCase() == ver.toLowerCase());
    }
    activateNode(node = {}) {
        this.options["host"] = node.host;
        this.options["password"] = node.password;
        this.options["port"] = node.port;
        this.options["secure"] = node.secure;
        this.node.info["host"] = node.host;
        this.node.info["password"] = node.password;
        this.node.info["port"] = node.port;
        this.node.info["secure"] = node.secure;
        this.node.node["host"] = node.host;
        this.node.node["password"] = node.password;
        this.node.node["port"] = node.port;
        this.node.node["secure"] = node.secure;
        this.node = new Node_1.default(this, node, this.node.options);
        this.node.connect();
        return this.node;
    }
    addNode(node) {
        if (!node.host || !node.password || !node.port)
            throw new Error("Provide valid node to add");
        return this.nodes.set(node.host, this.activateNode(node));
    }
    removeNode(node) {
        if (!node.info?.host || !node.info?.password || !node.info?.port)
            throw new Error("Provide valid node to remove");
        node.disconnect();
        return this.nodes.delete(node.info?.host);
    }
    updateNode(node = {}) {
        if (node)
            return this.addNode(node);
        let nodes = this._nodes.filter(n => n.host !== this.node?.info?.host);
        let get_active_nodes = nodes.filter(n => this.nodes.get(n?.host)?.connected);
        if (get_active_nodes.length > 0) {
            return this.activateNode(get_active_nodes);
        }
        throw new Error("There are no active nodes are available.");
    }
    handleEvents(payload) {
        if (!payload.guildId)
            throw new Error(`Unknown payload received.`);
        const player = this.players.get(payload.guildId);
        if (!player || !player?.queue?.current)
            return;
        const track = player.queue.current?.info;
        if (!track)
            return;
        const type = payload?.type;
        if (!type) {
            const error = new Error(`Unknown node event '${type}'.`);
            this.emit("nodeError", this, error);
        }
        if (type === "TrackStartEvent") {
            player.event.TrackStartEvent(player, track, payload);
        }
        else if (type === "TrackEndEvent") {
            player.event.TrackEndEvent(player, track, payload);
        }
        else if (type === "TrackStuckEvent") {
            player.event.TrackStuckEvent(player, track, payload);
        }
        else if (type === "TrackExceptionEvent") {
            player.event.TrackExceptionEvent(player, track, payload);
        }
        else if (type === "WebSocketClosedEvent") {
            player.event.WebSocketClosedEvent(player, payload);
        }
        else {
            const error = new Error(`${config_json_1.client_name} :: unknown node event '${type}'.`);
            this.emit(Events_1.default.nodeError, this, error);
        }
    }
    async search(param, requester = this.client.user) {
        if (!this.isInitiated)
            throw new Error("Blue has not been initiated yet.");
        let data_copy = {};
        data_copy.tracks = [];
        data_copy.requester = requester;
        if (!this.nodes?.has(this.options.host))
            throw new Error("No nodes are available.");
        let data = await this.load.fetch(param);
        if (!data || data?.loadType === Types_1.default.LOAD_ERROR || data?.loadType === Types_1.default.LOAD_EMPTY) {
            throw new Error("No tracks found.");
        }
        else if (data.loadType === Types_1.default.LOAD_SEARCH || data.loadType === Types_1.default.LOAD_PLAYLIST) {
            if (Array.isArray(data.data)) {
                for (let i = 0; i < data.data.length; i++) {
                    const track = new Track_1.default(data.data[i]);
                    data_copy.tracks[i] = track;
                }
            }
            else {
                for (let i = 0; i < data.data.tracks.length; i++) {
                    const track = new Track_1.default(data.data.tracks[i]);
                    data_copy.tracks[i] = track;
                }
            }
        }
        else if (data.loadType === Types_1.default.LOAD_TRACK) {
            const track = new Track_1.default(data.data);
            data_copy.tracks[0] = track;
        }
        else if (data.loadType === Types_1.default.LOAD_SP_TRACK) {
            if (data.tracks.length === 1) {
                data_copy.tracks[0] = new Track_1.default(data.tracks[0]);
            }
            else {
                data_copy.tracks = [...data.tracks];
            }
        }
        else {
            data_copy = { ...data, requester: requester };
        }
        data_copy.loadType = data.loadType;
        return data_copy;
    }
}
exports.default = Blue;
//# sourceMappingURL=Blue.js.map