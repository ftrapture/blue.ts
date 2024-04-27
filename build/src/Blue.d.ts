/// <reference types="node" />
import { EventEmitter } from "node:events";
import VoiceUpdate from "./Connectors/voiceStateUpdate";
import Util from "./Utils/Util";
import Nodes from "./Connectors/Node";
import Search from "./Manager/SearchManager";
import TrackManager from "./Structure/Track";
import RestManager from "./Manager/RestManager";
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
    tracks: any[];
    loadType: string;
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
declare class Blue extends EventEmitter {
    nodes: Map<string, Node>;
    _options: any;
    options: any;
    version: string;
    node: Node | null;
    load: SearchManager;
    readonly _nodes: any[];
    util: Util;
    client: any;
    voiceState: VoiceUpdatePayloads;
    players: Map<string, any>;
    _versions: string[];
    send: (...args: any) => any;
    Lib: any;
    plugins: Loader[];
    initiated: boolean;
    constructor(nodes: any[], options?: any);
    get isInitiated(): boolean;
    init(client: any): Node;
    create(options?: any): any;
    activeNodes(): any[];
    verify_version(ver: string): string;
    activateNode(node?: any): Node;
    addNode(node: any): any;
    removeNode(node: any): any;
    updateNode(node?: any): any;
    handleEvents(payload: any): void;
    search(param: any, requester?: any): Promise<SearchStruct | any>;
}
export default Blue;
