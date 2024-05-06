/// <reference types="node" />
import { EventEmitter } from "node:events";
import VoiceUpdate from "./Connectors/voiceStateUpdate";
import Util from "./Utils/Util";
import NodeManager from "./Connectors/Node";
import Search from "./Manager/SearchManager";
import TrackManager from "./Structure/Track";
import RestManager from "./Manager/RestManager";
import { Queue, Filter, PlayerOptions, Loop, PlayerEvent } from "./Manager/PlayerManager";
import { Loader } from "./Plugins/index";
import Spotify from "./Platforms/Spotify";
import Youtube from "./Platforms/Youtube";
import SoundCloud from "./Platforms/SoundCloud";
import WebSocket from "ws";
import { Blue as BlueStruct } from "./Connectors/Node";
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
    blue: BlueStruct;
    youtube: Youtube;
    spotify: Spotify;
    soundcloud: SoundCloud;
    fetch: (...args: any[]) => Promise<any>;
    source: string;
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
    guildId: string | null;
    voiceChannel: string | null;
    textChannel: string | null;
    selfDeaf: boolean;
    selfMute: boolean;
    filter: Filter;
    options: PlayerOptions;
    loop: Loop;
    event: PlayerEvent;
    connect?: (...args: any) => any;
    setVoiceChannel?: (...args: any) => any;
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
    resumeKey: string | number | null;
    ws: WebSocket | null;
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
    guilds: any;
    ws: any;
}
/**
* @Requester options to get the author id
*/
export interface Requester {
    id: string;
    username: string;
    tag: string;
    discriminator: string | number;
    displayName: string;
}
/**
 * @Search query paramerter structure
 */
interface Params {
    query: string;
    source?: string;
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
declare class Blue extends EventEmitter {
    /**
    * Hash map for storing the nodes, that has been passed from the manager constructor agrument.
   */
    nodes: Map<string, Node>;
    /**
    * Default Options:- version, autoplay, defaultSearchEngine, spotify API keys.
   */
    _options: Options;
    /**
    * Unchanged Options.
   */
    options: any;
    /**
    * version of the lavalink is to be stored, that would be use.
   */
    version: string;
    /**
    * Node Class
   */
    node: Node | null;
    /**
    * Search Class
   */
    load: SearchManager;
    /**
    * all nodes are to be stored in an single array
   */
    readonly _nodes: any[];
    /**
    * Utility and all the methods are stored in here
   */
    util: Util;
    /**
    * Client Options, contains the client id.
   */
    client: ClientOption;
    /**
    * Voice State Class
   */
    voiceState: VoiceUpdatePayloads;
    /**
    * Players has map, all the active players will be stored here
   */
    players: Map<string, any>;
    /**
    * available lavalink versions, by-default: v4
   */
    _versions: string[];
    /**
    * Send method, to send payloads to the guild shard.
   */
    send: (...args: any) => any;
    /**
    * all the available supported library is to be stored here
   */
    Lib: Libs;
    /**
    * Initiated indicates the main method has been called or not
   */
    initiated: boolean;
    /**
    * A parameterized constructor,
    * This is the main class which actually handles the lavalink server and calls all the neccesary methods when needed.
    * Usage - new Blue(nodes<Array>, options<DefaultOptions>);
   */
    constructor(nodes: NodeOptions[], options: Options);
    /**
    * @returns a boolean state, to indicate whether it has been initiated or not
   */
    get isInitiated(): boolean;
    /**
    * Calls the init (main method) to work with blue.ts.
    * @param client.user.id: Id of the bot.
    * @param client.on(): event listener, to get the session id and token
    * @param client<Guild>.fetch() - to join the voice channel
    * @returns the node obj
   */
    init(client: ClientOption): Node;
    /**
    * Creates a new player
    * @param options.textChannel - text channel id to bound the commands
    * @param options.voiceChannel - voice channel id to join and play the songs
    * @pram options.guildId - guild id where song will play
    * @param options?.selfMute - (optional) whether the bot will join vc muted or not
    * @param options?.selfDeaf - (optional) whether the bot will join vc defeaned or not
    * @returns the created player.
   */
    create(options: VoiceConnection): Player | boolean;
    /**
    * Get active/working nodes
    * @returns all the active nodes
   */
    activeNodes(): NodeOptions[];
    /**
    * verify the version of lavalink node
    * @param ver - lavalink version
    * @returns the boolean statement if it matches the version with the supported one
   */
    verifyVersion(ver: string): string;
    /**
    * activates a single/cluster of nodes.
    * @param - either: {host, password, port, secure} or [{host1, password, port, secure}, {host2, password, port, secure}, ...rest];
    * @returns either a  cluster of activated node or a single node
   */
    activateNode(nodes: NodeOptions | NodeOptions[]): Node | Node[];
    /***
    * activates nodes
    * @param node.host - identifier of the lavalink node,
    * @param node.password - password of the node,
    * @param node.port - port of the node.
    * @param node.secure - whether the lavalink websocket connection supports ws or wss.
    * @returns node obj
   */
    private activateSingleNode;
    /***
    * Adds node to the library
    * @param - nodes
    * @returns: void (no return type)
   */
    addNode(node: NodeOptions | NodeOptions[]): void;
    /**
    * Removes a node,
    * @param - node,
    * @returns either error or boolean statement
   */
    removeNode(node: any): boolean | Error;
    /**
    * Updates a node,
    * @param - node,
    * @returns either error or boolean statement
   */
    updateNode(node: NodeOptions): Node | NodeOptions[] | Error;
    /**
    * Handles all the events,
    * @param - Payloads,
    * @returns: void (no return type)
   */
    handleEvents(payload: any): void;
    /**
    * Searches: (tracks, playlists, albums), with additional supported souces: (youtube & youtube music, spotify, soundcloud)
    * @param - param.query<String> or param<String>,
    * @param - requester - executors or the bot itself
    * @returns the searched songs
   */
    search(param: Params | string, requester?: any): Promise<{
        tracks: TrackManager[];
        loadType: string;
        requester: Requester;
    }>;
}
export default Blue;
/**
* This project (Lavalink client - blue.ts) has been
* officially developed by
* Rapture, Under ISC LICENSE
* open pr if you find any bug
*/
