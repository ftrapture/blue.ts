const { EventEmitter } = require("node:events");
const { client_name } = require("./config.json");
const VoiceUpdate = require("./Components/voiceStateUpdate");
const Util = require("./Utils/Util");
const Types = require("./Utils/Types");
const Events = require("./Utils/Events");
const Node = require("./Components/Node");
const Search = require("./Manager/SearchManager");
const Track = require("./Structure/Track");
class Blue extends EventEmitter {
    constructor(nodes, options = {}) {
        super({ ...options });
        if (!nodes) throw new Error("You didn't provide a lavalink node");
        this.nodes = new Map();
        this._options = options;
        this.options = options;
        this.version = "v4";
        this.node = null;
        this.load = new Search(this);
        this._nodes = nodes;
        this.util = new Util(this);
        this.client = null;
        this.voiceState = new VoiceUpdate(this);
        this.players = new Map();
    }

    init(client) {
        this.client = client;
        this.util.checkParamsValidity([...this._nodes], { ...this.options });
        this.client.on(Events.voiceStateUpdate, async (oS, nS) => {
            const player = this.players.get(oS.guild.id);
            if (nS.id === this.client.user.id && nS.id === oS.id && oS?.channelId && nS?.channelId && oS?.channelId !== nS?.channelId) {
                if (player) {
                    if (!player.connected) {
                         player.connect({ guildId: oS.guild.id, voiceChannel: nS?.channelId });
                     } else 
                         player.setVoiceChannel(nS?.channelId);
                }
            }
        });
        this.client.on(Events.api, async (packet) => {
            await this.voiceState.updateVoice(packet);
        });
    }

    create(options = {}) {
        const check = this.util.checkObjectValidity(options);
        if(!check) return false;
        let node = this.nodes.get(this.options.host)
        if (!node) throw new TypeError("No nodes are avalible");
        const player = this.node.rest.createPlayer(options);
        player.connect();
        return player;
    }

    activeNodes() {
        return this._nodes.filter(n => this.nodes.get(n.host)?.connected);
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
        this.node = new Node(this, node, this.node.options);
        this.node.connect();
        return this.node;
    }

    addNode(node) {
        if(!node.host || !node.password || !node.port) throw new Error("Provide valid node to add");
        return this.nodes.set(node.host, this.activateNode(node));
    }

    removeNode(node) {
        if(!node.info?.host || !node.info?.password || !node.info?.port) throw new Error("Provide valid node to remove");
        node.disconnect();
        return this.nodes.delete(node.info?.host);
    }

    updateNode(node = {}) {
        if(node) 
            return this.addNode(node);
        let nodes = this._nodes.filter(n => n.host !== this.node?.info?.host);
        let get_active_nodes = nodes.filter(n => this.nodes.get(n?.host)?.connected);
        if(get_active_nodes) {
            return this.activateNode(get_active_nodes);
        } 
        throw new Error("There are no active nodes are available.");
    }

    handleEvents(payload) {
        if (!payload.guildId) throw new Error(`Unknown payload recieved.`);
        const player = this.players.get(payload.guildId);
        if (!player || !player?.queue?.current) return;
        const track = player.queue.current?.info;
        if (!track) return;
        const type = payload?.type;
        if (!type) {
            const error = new Error(`Unknown node event '${type}'.`);
            this.emit("nodeError", this, error);
        }
        if (type === "TrackStartEvent") {
            player.event.TrackStartEvent(player, track, payload);
        } else if (type === "TrackEndEvent") {
            player.event.TrackEndEvent(player, track, payload);
        } else if (type === "TrackStuckEvent") {
            player.event.TrackStuckEvent(player, track, payload);
        } else if (type === "TrackExceptionEvent") {
            player.event.TrackExceptionEvent(player, track, payload);
        } else if (type === "WebSocketClosedEvent") {
            player.event.WebSocketClosedEvent(player, payload);
        } else {
            const error = new Error(`${client_name} :: unknown node event '${type}'.`);
            this.emit(Events.nodeError, this, error);
        }
    }
    
    async search(param, requester = this.client.user) {
        let data_copy = {};
        data_copy.tracks = [];
        data_copy.requester = requester;
        if (!this.nodes?.has(this.options.host)) throw new Error("No nodes are available.");
        let data = await this.load.fetch(param);
       if (data.loadType === Types.LOAD_ERROR || data.loadType === Types.LOAD_EMPTY) {
            throw new Error("No tracks found.");
        } else if (data.loadType === Types.LOAD_SEARCH || data.loadType === Types.LOAD_PLAYLIST) {
            
            if(Array.isArray(data.data)){
               for(let i = 0; i < data.data.length; i++){
                 const track = new Track(data.data[i]);
                 data_copy.tracks[i] = track;
               }
            } else {
                for(let i = 0; i < data.data.tracks.length; i++){
                    const track = new Track(data.data.tracks[i]);
                    data_copy.tracks[i] = track;
                }
            }
        } else if (data.loadType === Types.LOAD_TRACK) {
            const track = new Track(data.data);
            data_copy.tracks[0] = track;
        } else {
            data_copy = { ...data, requester: requester };
        }
        data_copy.loadType = data.loadType;
        return data_copy;
    }
}

module["exports"] = Blue;