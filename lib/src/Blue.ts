import { EventEmitter } from "node:events";
import { client_name } from "./config.json";
import VoiceUpdate from "./Connectors/voiceStateUpdate";
import Util from "./Utils/Util";
import Types from "./Utils/Types";
import Events from "./Utils/Events";
import NodeManager from "./Connectors/Node";
import Search from "./Manager/SearchManager";
import TrackManager from "./Structure/Track";
import RestManager from "./Manager/RestManager";
import Library from "./Libs/index";
import { 
  Queue, 
  Filter, 
  PlayerOptions, 
  Loop, 
  PlayerEvent 
} from "./Manager/PlayerManager";
import { Loader } from "./Plugins/index";
import Spotify from "./Platforms/Spotify";
import Youtube from "./Platforms/Youtube";
import SoundCloud from "./Platforms/SoundCloud";
import WebSocket from "ws";
import { Blue as BlueStruct } from "./Connectors/Node";
/**
 * Event listeners amount has been set to 20, to get prevent of events calling out of bounds.
 */
EventEmitter.defaultMaxListeners = 20;
 /**
 * extended VoiceUpdate class and exported as interface
*/
export interface VoiceUpdatePayloads extends VoiceUpdate {
  blue: BlueStruct;
  voice: {
    sessionId: string | null;
    token: string | null;
    endpoint: string | null;
  };
  channelId: string | null;
  guildId: string | null;
  muted: boolean | null;
  defeaned: boolean | null;
  region?: string | null;
}

 /**
 * extends Search class and exported as an interface
*/
export interface SearchManager extends Search {
  blue: BlueStruct
  youtube: Youtube;
  spotify: Spotify;
  soundcloud: SoundCloud;
  fetch: (...args) => Promise<any>
  source: string
}

 /**
 * spotify constructor option
*/
export interface SpotifyOptions {
  client_id: string;
  client_secret: string;
}

 /**
 *default blue manager constructor option
*/
export interface Options {
  defaultSearchEngine?: string | null;
  library: string;
  version?: string;
  autoplay?: boolean;
  playerUpdateInterval?: number | null;
  resumeKey?: number | string | null;
  spotify?: SpotifyOptions;
  autoResume: boolean;
  plugins?: Loader[];
}

 /** 
 * node option:- (host, port, secure, password)
*/
export interface NodeOptions {
  host: string;
  port: number;
  secure: boolean;
  password: string;
}

 /** 
 * player class structure
*/
export interface Player {
    blue: BlueStruct;
    volume: number;
    playing: boolean;
    queue: Queue;
    position: number;
    connected: boolean;
    paused: boolean;
    createdTimestamp: number;
    createdAt: Date;
    ping: number;
    timestamp: number;
    guildId: string | null;
    voiceChannel: string | null;
    textChannel: string | null;
    selfDeaf: boolean;
    selfMute: boolean;
    filter: Filter;
    options: PlayerOptions;
    loop: Loop;
    event: PlayerEvent;
    connect?: (...args: any) => void;
    disconnect?: () => any;
    destroy?: () => any;
    setVoiceChannel?: (...args: any) => any;
    reconnect?: () => Promise<any>;
}

 /**
 * extended NodeManager class and exported as an interface
*/
export interface Node extends NodeManager {
  node: NodeOptions;
  sessionId: string | null;
  connected: boolean;
  options: Options;
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
  resumeKey: string | unknown;
  ws: WebSocket | null;
  autoResume: boolean;
}

 /**
 * player create constructor options
*/
export interface VoiceConnection {
  guildId: string;
  textChannel: string;
  voiceChannel: string;
  selfDeaf?: boolean;
  selfMute?: boolean;
}

 /**
 * client options to get the client id
*/
export interface ClientOption {
  user: {
    id: string;
  };
  on?: (...args: any) => any;
  off?: (...args: any) => any;
  once?: (...args: any) => any;
  guilds: any,
  ws: any
}

 /**
 * @Requester options to get the author id
*/
export interface Requester {
  id: string,
  username: string,
  tag: string,
  discriminator: string | number,
  displayName: string
}

/**
 * @Search query paramerter structure
 */
interface Params {
  query: string,
  source?: string
}
 /**
 * @Libs of the supported discord clients (discordjs, eris, oceanicjs)
*/
export interface Libs {
  blue: this;
  lib: string;
  main: () => void;
}

 /**
 * Main Module starts from here
*/
class Blue extends EventEmitter {
 /**
 * Hash map for storing the nodes, that has been passed from the manager constructor agrument.
*/
  public nodes: Map<string, Node>;
 /**
 * Default Options:- version, autoplay, defaultSearchEngine, spotify API keys.
*/
  public _options: Options;
 /**
 * Unchanged Options.
*/
  public options: any;
 /**
 * version of the lavalink is to be stored, that would be use.
*/
  public version: string;
 /**
 * Node Class
*/
  public node: Node | null;
 /**
 * Search Class
*/
  public load: SearchManager;
 /**
 * all nodes are to be stored in an single array
*/
  public _nodes: any[];
 /**
 * Utility and all the methods are stored in here
*/
  public util: Util;
 /**
 * Client Options, contains the client id.
*/
  public client: ClientOption;
 /**
 * Voice State Class
*/
  public voiceState: VoiceUpdatePayloads;
 /**
 * Players has map, all the active players will be stored here
*/
  public players: Map<string, any>;
 /**
 * available lavalink versions, by-default: v4
*/
  public _versions: string[];
 /**
 * Send method, to send payloads to the guild shard.
*/
  public send: (...args: any) => any;
 /**
 * all the available supported library is to be stored here
*/
  public Lib: Libs;

 /**
 * Initiated indicates the main method has been called or not
*/
  public initiated: boolean;

  /**
   * Blocked Platforms
   */
  public blocked_platforms: string[];
 /**
 * A parameterized constructor,
 * This is the main class which actually handles the lavalink server and calls all the neccesary methods when needed.
 * Usage - new Blue(nodes<Array>, options<DefaultOptions>);
*/
  constructor(nodes: NodeOptions[], options: Options) {
    super();
    if (!nodes) throw new Error("You didn't provide a Lavalink node.");
    this.nodes = new Map();
    this._options = options;
    this.options = options;
    this._versions = ["v4"]; // More versions will be added soon.
    this.version = this._versions[0];
    this.node = null;
    this.load = new Search(this);
    this._nodes = nodes;
    this.util = new Util(this);
    this.client = null;
    this.initiated = false;
    this.voiceState = new VoiceUpdate(this);
    this.players = new Map();
    this.blocked_platforms = [];
  }

 /**
 * @returns a boolean state, to indicate whether it has been initiated or not
*/
  public get isInitiated(): boolean {
    return this.initiated;
  }

 /**
 * Calls the init (main method) to work with blue.ts.
 * @param client.user.id: Id of the bot.
 * @param client.on(): event listener, to get the session id and token
 * @param client<Guild>.fetch() - to join the voice channel
 * @returns the node obj
*/
  public init(client: ClientOption): Node {
    this.client = client;
    this.util.checkParamsValidity([...this._nodes], { ...this.options });
    this.Lib = new Library(this.options.library, this);
    this.Lib.main();
    if(this._options?.plugins?.length > 0) {
      this._options.plugins.forEach((plugin: any) => {
        plugin.load(this);
      })
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
  public create(options: VoiceConnection): Player | boolean {
    if (!this.isInitiated) throw new Error("Blue has not been initiated yet.");
    const check = this.util.checkObjectValidity(options);
    if (!check) return false;
    if (!this.node) throw new TypeError("No nodes are available.");
    const player = this.node!.rest.createPlayer(options);
    player.connect();
    return player;
  }

 /**
 * Get active/working nodes
 * @returns all the active nodes
*/
  public activeNodes(): NodeOptions[] {
    return this._nodes.filter(n => this.nodes.get(n.host)?.connected);
  }

 /**
 * verify the version of lavalink node
 * @param ver - lavalink version
 * @returns the boolean statement if it matches the version with the supported one
*/
  public verifyVersion(ver: string): string {
    return this._versions.find(v => v.toLowerCase() == ver.toLowerCase());
  }

 /**
 * activates a single/cluster of nodes.
 * @param - either: {host, password, port, secure} or [{host1, password, port, secure}, {host2, password, port, secure}, ...rest];
 * @returns either a  cluster of activated node or a single node
*/
  public activateNode(nodes: NodeOptions | NodeOptions[]): Node | Node[] {
    if (Array.isArray(nodes)) {
      return nodes.map(node => this.activateSingleNode(node));
    } else {
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
  private activateSingleNode(node: NodeOptions): Node {
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
    this.node = new NodeManager(this, node, this.node!.options);
    this.node.connect();
    return this.node;
  }

 /***
 * Adds node to the library
 * @param - nodes
 * @returns: void (no return type)
*/
  public addNode(node: NodeOptions | NodeOptions[]): void {
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
        } else {
          this.nodes.set(newNodes.info.host, newNodes);
        }
      });
    } else {
      if (!node.host || !node.password || !node.port) {
        throw new Error("Provide valid node to add");
      }
      const newNode = this.activateNode(node);
      if (Array.isArray(newNode)) {
        newNode.forEach(newNodeItem => {
          this.nodes.set(newNodeItem.info.host, newNodeItem);
        });
      } else {
        this.nodes.set(newNode.info.host, newNode);
      }
    }
  }

  /**
   * @param <Platforms[String]>
   * @returns <Platforms>[String] | <Platforms>[]
   */
  public setBlockPlatforms(platforms: string[]): string[] | string {
    if(!platforms.length || !platforms.find(p => Object.keys(this.util.platforms).includes(p.toLowerCase()))) return "Platforms does not match.";
    this.blocked_platforms = platforms;
    return this.blocked_platforms;
  }

  /**
   * @param <Platforms[String]>
   * @returns <Platforms>[String] | <Platforms>[]
   */
  public removeBlockPlatforms(platforms: string[]): string[] {
    if(!platforms.length) return this.blocked_platforms;
    this.blocked_platforms = this.blocked_platforms.filter(p => !platforms.includes(p));
    return this.blocked_platforms;
  }

  /**
   * @returns <Platforms>[String] | <Platforms>[]
   */
  public getBlockPlatforms(): string[] {
    return this.blocked_platforms;
  }

 /**
 * Removes a node,
 * @param - node,
 * @returns either error or boolean statement
*/
  public removeNode(option: any): boolean | Error {
    if (!option["host" && "port" && "password"]) {
      throw new Error("Provide valid node to remove");
    }
    this._nodes = this._nodes.filter(n => [...this.activeNodes()].map(d => d.host).includes(n.host));
    const node = this.nodes.get(option["host"]);
    if(node) {
      node.disconnect();
      return this.nodes.delete(option["host"]);
    } else return false;
  }

 /**
 * Updates a node,
 * @param - node,
 * @returns either error or boolean statement
*/
  public updateNode(node?: NodeOptions): Node | NodeOptions[] | Error {
    if (node) {
      this.addNode(node);
      return this.nodes.get(this.node!.info["host"]);
    } else {
      let nodes: NodeOptions[] = this._nodes.filter(n => n.host !== this.node?.info?.host);
      let active_nodes = nodes.filter(n => this.nodes.get(n?.host)?.connected);
      if (active_nodes.length > 0) {
        this.activateNode(active_nodes);
        return active_nodes;
      } else {
        return new Error("There are no active nodes available.");
      }
    }
  }

 /**
 * Handles all the events,
 * @param - Payloads,
 * @returns: void (no return type)
*/
  public handleEvents(payload: any): void {
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
    } else {
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
                this.emit(Events.nodeError, this, new Error(`Unknown node event '${type}'.`));
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
public async search(param: Params | string, requester: any = this.client.user): Promise<{ tracks: TrackManager[], loadType: string, pluginInfo: any, userData: any, playlistInfo: any, requester: Requester }> {
  if (!this.isInitiated) throw new Error("Blue has not been initiated yet.");

  let data_copy: { 
    tracks: TrackManager[], 
    loadType: string, 
    pluginInfo: any, 
    userData: any, 
    playlistInfo: any, 
    requester: Requester 
  } = { 
    tracks: [], 
    loadType: Types.LOAD_EMPTY, 
    requester, 
    playlistInfo: {}, 
    userData: {}, 
    pluginInfo: {} 
  };

  if (!this.nodes?.has(this.options.host)) throw new Error("No nodes are available.");

  const data = await this.load.fetch(param).catch(() => null);

  if (!data || [Types.LOAD_ERROR, Types.LOAD_EMPTY].includes(data.loadType)) throw new Error("No tracks found.");

  switch (data.loadType) {
    case Types.LOAD_SEARCH:
    case Types.LOAD_PLAYLIST:
      data_copy.tracks = (Array.isArray(data.data) ? data.data : data.data.tracks)
        .map(trackData => new TrackManager(trackData));
      break;

    case Types.LOAD_TRACK:
      data_copy.tracks = (Array.isArray(data.data) ? [new TrackManager(data.data[0])] : [new TrackManager(data.data)]);
      break;

    default:
      data_copy.tracks = (Array.isArray(data.data) ? data.data : data.data.tracks);
  }
  
  if(data.data.playlistInfo) data_copy.playlistInfo = data.data.playlistInfo || {};
  if(data.data.info) data_copy.playlistInfo = data.data.info || {};
  if(data.data.userData) data_copy.userData = data.data.userData || {};
  if(data.data.pluginInfo) data_copy.pluginInfo = data.data.pluginInfo || {};
  data_copy.loadType = data.loadType;
  if(data.data)
  delete data.data
  data_copy = {
    ...data_copy,
    ...data
  }
  
  return data_copy;
}

}

export default Blue;

 /**
 * This project (Lavalink client - blue.ts) has been
 * officially developed by
 * Rapture, Under MIT LICENSE
 * open pr if you find any bug
*/
