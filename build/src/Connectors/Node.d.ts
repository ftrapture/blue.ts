import WebSocket from 'ws';
import RestManager from "../Manager/RestManager";
import '../Utils/Color';
import Util from "../Utils/Util";
import { Options, NodeOptions, SearchManager, ClientOption, Libs, VoiceUpdatePayloads, Player } from "../Blue";
/**
 * Interface for the Blue class
 */
export interface Blue {
    nodes: Map<string, Node>;
    _options: Options;
    options: any;
    version: string;
    node: Node | null;
    load: SearchManager;
    _nodes: NodeOptions[];
    util: Util;
    client: ClientOption;
    voiceState: VoiceUpdatePayloads;
    players: Map<string, Player>;
    _versions: string[];
    send: (...args: any) => any;
    Lib: Libs;
    blocked_platforms: string[];
    initiated: boolean;
    on: (...args: any) => any;
    once: (...args: any) => any;
    off: (...args: any) => any;
    emit: (...args: any) => any;
    search: (...args: any) => any;
    handleEvents: (...args: any) => void;
    addNode: (arg?: NodeOptions | NodeOptions[]) => void;
    activeNodes: () => NodeOptions[];
}
/**
 * Class definition for the Node class
 */
declare class Node<T extends Blue = Blue> {
    /**
   * Instance of the blue client
   */
    readonly blue: T;
    /**
     * Node options
     */
    node: NodeOptions;
    /**
     * Session ID
     */
    sessionId: string | null;
    /**
     * Connection status
     */
    connected: boolean;
    /**
     * Options
     */
    options: Options;
    /**
     * Node information
     */
    info: {
        host: string;
        port: number;
        secure: boolean;
        password: string;
    };
    /**
     * Connection attempt count
     */
    count: number;
    /**
     * Node stats
     */
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
    /**
     * Player update interval
     */
    playerUpdate: number;
    /**
     * Player Autoresume
     */
    autoResume: boolean;
    /**
     * Rest manager
     */
    rest: RestManager;
    /**
     * Resume key
     */
    resumeKey: string | unknown;
    /**
     * WebSocket connection
     */
    ws: WebSocket | null;
    /**
     * Constructor for the Node class
     * @param blue - The blue client instance
     * @param node - Node options
     * @param options - Options
     */
    constructor(blue: T, node: NodeOptions, options: Options);
    /**
     * Method to connect to the Lavalink node
     */
    connect(): Promise<void>;
    /**
     * Method to disconnect from the Lavalink node
     * @returns - Returns the instance of the Node class or void
     */
    disconnect(): this | void;
    /**
     * Method to check if connected to the Lavalink node
     * @returns - Returns true if connected, false otherwise
     */
    isConnected(): boolean;
    /**
     * Event handler for successful WebSocket connection
     */
    private open;
    /**
     * Event handler for WebSocket disconnection
     */
    private close;
    /**
     * Event handler for receiving WebSocket messages
     * @param payload - The payload received
     */
    private message;
    /**
     * Event handler for WebSocket errors
     * @param err - The error received
     */
    private error;
}
export default Node;
