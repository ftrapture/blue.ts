import { EventEmitter } from "node:events";
import { client_name } from "./config.json";
import VoiceUpdate from "./Connectors/voiceStateUpdate";
import Util from "./Utils/Util";
import Types from "./Utils/Types";
import Events from "./Utils/Events";
import Nodes from "./Connectors/Node";
import Search from "./Manager/SearchManager";
import TrackManager from "./Structure/Track";
import RestManager from "./Manager/RestManager";
import Library from "./Libs/index";
import { Loader } from "./Plugins/index";

interface VoiceUpdatePayloads extends VoiceUpdate {
  blue: any;
  voice: {
    sessionId: string | null;
    token: string | null;
    endpoint: string | null;
  };
  channelId: string | null;
  guildId: string | null;
  muted: boolean | null;
  defeaned: boolean | null;
  region: any;
}

interface SearchStruct {
  tracks: any[],
  loadType: string
}

export interface Track extends TrackManager {
  trackToken: any;
  info: any;
}

interface SearchManager extends Search {
    blue: any;
    youtube: any;
    spotify: any;
    soundcloud: any;
}

interface Node extends Nodes {
  blue: any;
  node: any;
  sessionId: string | null;
  connected: boolean;
  options: any;
  info: {
    host: string;
    port: number;
    secure: boolean;
    password: string;
  };
  count: number;
  stats: {
    frameStats: any;
    players: number;
    playingPlayers: number;
    uptime: number;
    memory: {
      free: number;
      used: number;
      allocated: number;
      reservable: number;
    };
    cpu: {
      cores: number;
      systemLoad: number;
      lavalinkLoad: number;
    };
  };
  playerUpdate: number;
  rest: RestManager;
  resumeKey: string | null;
  ws: any;
} 

class Blue extends EventEmitter {
  public nodes: Map<string, Node>;
  public _options: any;
  public options: any;
  public version: string;
  public node: Node | null;
  public load: SearchManager;
  public readonly _nodes: any[];
  public util: Util;
  public client: any;
  public voiceState: VoiceUpdatePayloads;
  public players: Map<string, any>;
  public _versions: string[];
  public send: (...args: any) => any;
  public Lib: any;
  public plugins: Loader[];
  public initiated: boolean;
  constructor(nodes: any[], options: any = {}) {
    super({ ...options });
    if (!nodes) throw new Error("You didn't provide a lavalink node");
    this.nodes = new Map();
    this._options = options;
    this.options = options;
    this._versions = ["v4"]; //soon many versions will be there.
    this.version = this._versions[0];
    this.node = null;
    this.load = new Search(this);
    this._nodes = nodes;
    this.util = new Util(this);
    this.client = null;
    this.initiated = false;
    this.voiceState = new VoiceUpdate(this);
    this.players = new Map();
  }

  public get isInitiated() {
    return this.initiated;
  }

  public init(client: any): Node {
    this.initiated = true;
    this.client = client;
    this.util.checkParamsValidity([...this._nodes], { ...this.options });
    this.Lib = new Library(this.options.library, this).main();
    return this.node;
  }

  public create(options: any = {}): any {
    if(!this.isInitiated) throw new Error("Blue has not been initiated yet.");
    const check = this.util.checkObjectValidity(options);
    if (!check) return false;
    if (!this.node) throw new TypeError("No nodes are available");
    const player = this.node!.rest.createPlayer(options);
    player.connect();
    return player;
  }

  public activeNodes(): any[] {
    return this._nodes.filter(n => this.nodes.get(n.host)?.connected);
  }

  public verify_version(ver: string): string {
    return this._versions.find(v => v.toLowerCase() == ver.toLowerCase());
  }

  public activateNode(node: any = {}): Node {
    this.options["host"] = node.host;
    this.options["password"] = node.password;
    this.options["port"] = node.port;
    this.options["secure"] = node.secure;
    this.node!.info["host"] = node.host;
    this.node!.info["password"] = node.password;
    this.node!.info["port"] = node.port;
    this.node!.info["secure"] = node.secure;
    this.node!.node["host"] = node.host;
    this.node!.node["password"] = node.password;
    this.node!.node["port"] = node.port;
    this.node!.node["secure"] = node.secure;
    this.node = new Nodes(this, node, this.node!.options);
    this.node.connect();
    return this.node;
  }

  public addNode(node: any): any {
    if (!node.host || !node.password || !node.port) throw new Error("Provide valid node to add");
    return this.nodes.set(node.host, this.activateNode(node));
  }

  public removeNode(node: any): any {
    if (!node.info?.host || !node.info?.password || !node.info?.port) throw new Error("Provide valid node to remove");
    node.disconnect();
    return this.nodes.delete(node.info?.host);
  }

  public updateNode(node: any = {}): any {
    if (node)
      return this.addNode(node);
    let nodes = this._nodes.filter(n => n.host !== this.node?.info?.host);
    let get_active_nodes = nodes.filter(n => this.nodes.get(n?.host)?.connected);
    if (get_active_nodes.length > 0) {
      return this.activateNode(get_active_nodes);
    }
    throw new Error("There are no active nodes are available.");
  }

  public handleEvents(payload: any): void {
    if (!payload.guildId) throw new Error(`Unknown payload received.`);
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

  async search(param: any, requester: any = this.client.user): Promise<SearchStruct | any> {
    if(!this.isInitiated) throw new Error("Blue has not been initiated yet.");
    let data_copy: any = {};
    data_copy.tracks = [];
    data_copy.requester = requester;
    if (!this.nodes?.has(this.options.host)) throw new Error("No nodes are available.");
    let data = await this.load.fetch(param);
    if (data.loadType === Types.LOAD_ERROR || data.loadType === Types.LOAD_EMPTY) {
      throw new Error("No tracks found.");
    } else if (data.loadType === Types.LOAD_SEARCH || data.loadType === Types.LOAD_PLAYLIST) {
      if (Array.isArray(data.data)) {
        for (let i = 0; i < data.data.length; i++) {
          const track = new TrackManager(data.data[i]);
          data_copy.tracks[i] = track;
        }
      } else {
        for (let i = 0; i < data.data.tracks.length; i++) {
          const track = new TrackManager(data.data.tracks[i]);
          data_copy.tracks[i] = track;
        }
      }
    } else if (data.loadType === Types.LOAD_TRACK) {
      const track = new TrackManager(data.data);
      data_copy.tracks[0] = track;
    } else {
      data_copy = { ...data, requester: requester };
    }
    data_copy.loadType = data.loadType;
    return data_copy;
  }
}

export default Blue;
