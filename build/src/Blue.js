"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_events_1 = require("node:events");
const voiceStateUpdate_1 = __importDefault(require("./Connectors/voiceStateUpdate"));
const Util_1 = __importDefault(require("./Utils/Util"));
const Types_1 = __importDefault(require("./Utils/Types"));
const Events_1 = __importDefault(require("./Utils/Events"));
const Node_1 = __importDefault(require("./Connectors/Node"));
const SearchManager_1 = __importDefault(require("./Manager/SearchManager"));
const Track_1 = __importDefault(require("./Structure/Track"));
const index_1 = __importDefault(require("./Libs/index"));
/**
 * Event listeners amount has been set to 20, to get prevent of events calling out of bounds.
 */
node_events_1.EventEmitter.defaultMaxListeners = 20;
/**
* Main Module starts from here
*/
class Blue extends node_events_1.EventEmitter {
    /**
    * Hash map for storing the nodes, that has been passed from the manager constructor agrument.
   */
    nodes;
    /**
    * Default Options:- version, autoplay, defaultSearchEngine, spotify API keys.
   */
    _options;
    /**
    * Unchanged Options.
   */
    options;
    /**
    * version of the lavalink is to be stored, that would be use.
   */
    version;
    /**
    * Node Class
   */
    node;
    /**
    * Search Class
   */
    load;
    /**
    * all nodes are to be stored in an single array
   */
    _nodes;
    /**
    * Utility and all the methods are stored in here
   */
    util;
    /**
    * Client Options, contains the client id.
   */
    client;
    /**
    * Voice State Class
   */
    voiceState;
    /**
    * Players has map, all the active players will be stored here
   */
    players;
    /**
    * available lavalink versions, by-default: v4
   */
    _versions;
    /**
    * Send method, to send payloads to the guild shard.
   */
    send;
    /**
    * all the available supported library is to be stored here
   */
    Lib;
    /**
    * Initiated indicates the main method has been called or not
   */
    initiated;
    /**
     * Blocked Platforms
     */
    blocked_platforms;
    /**
    * A parameterized constructor,
    * This is the main class which actually handles the lavalink server and calls all the neccesary methods when needed.
    * Usage - new Blue(nodes<Array>, options<DefaultOptions>);
   */
    constructor(nodes, options) {
        super();
        if (!nodes)
            throw new Error("You didn't provide a Lavalink node.");
        this.nodes = new Map();
        this._options = options;
        this.options = options;
        this._versions = ["v4"]; // More versions will be added soon.
        this.version = this._versions[0];
        this.node = null;
        this.load = new SearchManager_1.default(this);
        this._nodes = nodes;
        this.util = new Util_1.default(this);
        this.client = null;
        this.initiated = false;
        this.voiceState = new voiceStateUpdate_1.default(this);
        this.players = new Map();
        this.blocked_platforms = [];
    }
    /**
    * @returns a boolean state, to indicate whether it has been initiated or not
   */
    get isInitiated() {
        return this.initiated;
    }
    /**
    * Calls the init (main method) to work with blue.ts.
    * @param client.user.id: Id of the bot.
    * @param client.on(): event listener, to get the session id and token
    * @param client<Guild>.fetch() - to join the voice channel
    * @returns the node obj
   */
    init(client) {
        this.client = client;
        this.util.checkParamsValidity([...this._nodes], { ...this.options });
        this.Lib = new index_1.default(this.options.library, this);
        this.Lib.main();
        if (this._options?.plugins?.length > 0) {
            this._options.plugins.forEach((plugin) => {
                plugin.load(this);
            });
        }
        this.initiated = true;
        return this.node;
    }
    /**
    * Creates a new player
    * @param options.textChannel - text channel id to bound the commands
    * @param options.voiceChannel - voice channel id to join and play the songs
    * @pram options.guildId - guild id where song will play
    * @param options?.selfMute - (optional) whether the bot will join vc muted or not
    * @param options?.selfDeaf - (optional) whether the bot will join vc defeaned or not
    * @returns the created player.
   */
    create(options) {
        if (!this.isInitiated)
            throw new Error("Blue has not been initiated yet.");
        const check = this.util.checkObjectValidity(options);
        if (!check)
            return false;
        if (!this.node)
            throw new TypeError("No nodes are available.");
        const player = this.node.rest.createPlayer(options);
        player.connect();
        return player;
    }
    /**
    * Get active/working nodes
    * @returns all the active nodes
   */
    activeNodes() {
        return this._nodes.filter(n => this.nodes.get(n.host)?.connected);
    }
    /**
    * verify the version of lavalink node
    * @param ver - lavalink version
    * @returns the boolean statement if it matches the version with the supported one
   */
    verifyVersion(ver) {
        return this._versions.find(v => v.toLowerCase() == ver.toLowerCase());
    }
    /**
    * activates a single/cluster of nodes.
    * @param - either: {host, password, port, secure} or [{host1, password, port, secure}, {host2, password, port, secure}, ...rest];
    * @returns either a  cluster of activated node or a single node
   */
    activateNode(nodes) {
        if (Array.isArray(nodes)) {
            return nodes.map(node => this.activateSingleNode(node));
        }
        else {
            return this.activateSingleNode(nodes);
        }
    }
    /***
    * activates nodes
    * @param node.host - identifier of the lavalink node,
    * @param node.password - password of the node,
    * @param node.port - port of the node.
    * @param node.secure - whether the lavalink websocket connection supports ws or wss.
    * @returns node obj
   */
    activateSingleNode(node) {
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
    /***
    * Adds node to the library
    * @param - nodes
    * @returns: void (no return type)
   */
    addNode(node) {
        if (Array.isArray(node)) {
            node.forEach(n => {
                if (!n.host || !n.password || !n.port) {
                    throw new Error("Provide valid node to add");
                }
                const newNodes = this.activateNode(n);
                if (Array.isArray(newNodes)) {
                    newNodes.forEach(newNode => {
                        this.nodes.set(newNode.info.host, newNode);
                    });
                }
                else {
                    this.nodes.set(newNodes.info.host, newNodes);
                }
            });
        }
        else {
            if (!node.host || !node.password || !node.port) {
                throw new Error("Provide valid node to add");
            }
            const newNode = this.activateNode(node);
            if (Array.isArray(newNode)) {
                newNode.forEach(newNodeItem => {
                    this.nodes.set(newNodeItem.info.host, newNodeItem);
                });
            }
            else {
                this.nodes.set(newNode.info.host, newNode);
            }
        }
    }
    /**
     * @param <Platforms[String]>
     * @returns <Platforms>[String] | <Platforms>[]
     */
    setBlockPlatforms(platforms) {
        if (!platforms.length || !platforms.find(p => Object.keys(this.util.platforms).includes(p.toLowerCase())))
            return "Platforms does not match.";
        this.blocked_platforms = platforms;
        return this.blocked_platforms;
    }
    /**
     * @param <Platforms[String]>
     * @returns <Platforms>[String] | <Platforms>[]
     */
    removeBlockPlatforms(platforms) {
        if (!platforms.length)
            return this.blocked_platforms;
        this.blocked_platforms = this.blocked_platforms.filter(p => !platforms.includes(p));
        return this.blocked_platforms;
    }
    /**
     * @returns <Platforms>[String] | <Platforms>[]
     */
    getBlockPlatforms() {
        return this.blocked_platforms;
    }
    /**
    * Removes a node,
    * @param - node,
    * @returns either error or boolean statement
   */
    removeNode(option) {
        if (!option["host" && "port" && "password"]) {
            throw new Error("Provide valid node to remove");
        }
        this._nodes = this._nodes.filter(n => [...this.activeNodes()].map(d => d.host).includes(n.host));
        const node = this.nodes.get(option["host"]);
        if (node) {
            node.disconnect();
            return this.nodes.delete(option["host"]);
        }
        else
            return false;
    }
    /**
    * Updates a node,
    * @param - node,
    * @returns either error or boolean statement
   */
    updateNode(node) {
        if (node) {
            this.addNode(node);
            return this.nodes.get(this.node.info["host"]);
        }
        else {
            let nodes = this._nodes.filter(n => n.host !== this.node?.info?.host);
            let active_nodes = nodes.filter(n => this.nodes.get(n?.host)?.connected);
            if (active_nodes.length > 0) {
                this.activateNode(active_nodes);
                return active_nodes;
            }
            else {
                return new Error("There are no active nodes available.");
            }
        }
    }
    /**
    * Handles all the events,
    * @param - Payloads,
    * @returns: void (no return type)
   */
    handleEvents(payload) {
        if (!payload.guildId) {
            throw new Error(`Unknown payload received.`);
        }
        const player = this.players.get(payload.guildId);
        if (!player || !player?.queue?.current) {
            return;
        }
        const track = player.queue.current?.info;
        if (!track) {
            return;
        }
        const type = payload?.type;
        if (!type) {
            this.emit("nodeError", this, new Error(`Unknown node event '${type}'.`));
        }
        else {
            switch (type) {
                case "TrackStartEvent":
                    player.event.TrackStartEvent(player, track, payload);
                    break;
                case "TrackEndEvent":
                    player.event.TrackEndEvent(player, track, payload);
                    break;
                case "TrackStuckEvent":
                    player.event.TrackStuckEvent(player, track, payload);
                    break;
                case "TrackExceptionEvent":
                    player.event.TrackExceptionEvent(player, track, payload);
                    break;
                case "WebSocketClosedEvent":
                    player.event.WebSocketClosedEvent(player, payload);
                    break;
                default:
                    this.emit(Events_1.default.nodeError, this, new Error(`Unknown node event '${type}'.`));
                    break;
            }
        }
    }
    /**
    * Searches: (tracks, playlists, albums), with additional supported souces: (youtube & youtube music, spotify, soundcloud)
    * @param - param.query<String> or param<String>,
    * @param - requester - executors or the bot itself
    * @returns the searched songs
   */
    async search(param, requester = this.client.user) {
        if (!this.isInitiated)
            throw new Error("Blue has not been initiated yet.");
        let data_copy = {
            tracks: [],
            loadType: Types_1.default.LOAD_EMPTY,
            requester,
            playlistInfo: {},
            userData: {},
            pluginInfo: {}
        };
        if (!this.nodes?.has(this.options.host))
            throw new Error("No nodes are available.");
        const data = await this.load.fetch(param).catch(() => null);
        if (!data || [Types_1.default.LOAD_ERROR, Types_1.default.LOAD_EMPTY].includes(data.loadType))
            throw new Error("No tracks found.");
        switch (data.loadType) {
            case Types_1.default.LOAD_SEARCH:
            case Types_1.default.LOAD_PLAYLIST:
                data_copy.tracks = (Array.isArray(data.data) ? data.data : data.data.tracks)
                    .map(trackData => new Track_1.default(trackData));
                break;
            case Types_1.default.LOAD_TRACK:
                data_copy.tracks = (Array.isArray(data.data) ? [new Track_1.default(data.data[0])] : [new Track_1.default(data.data)]);
                break;
            default:
                data_copy.tracks = (Array.isArray(data.data) ? data.data : data.data.tracks);
        }
        if (data.data.playlistInfo)
            data_copy.playlistInfo = data.data.playlistInfo || {};
        if (data.data.info)
            data_copy.playlistInfo = data.data.info || {};
        if (data.data.userData)
            data_copy.userData = data.data.userData || {};
        if (data.data.pluginInfo)
            data_copy.pluginInfo = data.data.pluginInfo || {};
        data_copy.loadType = data.loadType;
        if (data.data)
            delete data.data;
        data_copy = {
            ...data_copy,
            ...data
        };
        return data_copy;
    }
}
exports.default = Blue;
/**
* This project (Lavalink client - blue.ts) has been
* officially developed by
* Rapture, Under MIT LICENSE
* open pr if you find any bug
*/
//# sourceMappingURL=Blue.js.map