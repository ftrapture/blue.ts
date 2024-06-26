import WebSocket from 'ws';
import { client_name } from "../config.json";
import Events from "../Utils/Events";
import RestManager from "../Manager/RestManager";
import '../Utils/Color';
import Config from "../config.json";
import Util from "../Utils/Util";
import { Options, NodeOptions, SearchManager, ClientOption, Libs, VoiceUpdatePayloads, Player } from "../Blue";
/**
 * Interface for the Blue class
 */
export interface Blue {
  // Map of nodes
  nodes: Map<string, Node>; 
  // Options for the blue client
  _options: Options; 
  // Options for the blue client
  options: any; 
  // Version of the blue client
  version: string; 
  // Node information
  node: Node | null;
  // Search manager
  load: SearchManager; 
   // Readonly array of node options
  _nodes: NodeOptions[];
  // Utility functions
  util: Util; 
  // Client options
  client: ClientOption; 
  // Voice state
  voiceState: VoiceUpdatePayloads; 
  // Map of players
  players: Map<string, Player>; 
  // Versions
  _versions: string[];
  // Send function
  send: (...args: any) => any; 
  // Library
  Lib: Libs; 
  //Blocked Platforms
  blocked_platforms: string[];
  // Initiation flag
  initiated: boolean; 
  // Event listener
  on: (...args: any) => any; 
  // Event listener (once)
  once: (...args: any) => any; 
  // Event listener (off)
  off: (...args: any) => any; 
  // Event emitter
  emit: (...args: any) => any; 
  // Search function
  search: (...args: any) => any; 
  // Event handler
  handleEvents: (...args: any) => void; 
  // Node Add
  addNode: (arg?: NodeOptions | NodeOptions[]) => void;
  //Returns active nodes
  activeNodes: () => NodeOptions[];
}

/**
 * Class definition for the Node class
 */
class Node<T extends Blue = Blue> {
  /**
 * Instance of the blue client
 */
public readonly blue: T;

/**
 * Node options
 */
public node: NodeOptions;

/**
 * Session ID
 */
public sessionId: string | null;

/**
 * Connection status
 */
public connected: boolean;

/**
 * Options
 */
public options: Options;

/**
 * Node information
 */
public info: {
  host: string;
  port: number;
  secure: boolean;
  password: string;
};

/**
 * Connection attempt count
 */
public count: number;

/**
 * Node stats
 */
public stats: {
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
public playerUpdate: number;

/**
 * Player Autoresume
 */
public autoResume: boolean;

/**
 * Rest manager
 */
public rest: RestManager;

/**
 * Resume key
 */
public resumeKey: string | unknown;

/**
 * WebSocket connection
 */
public ws: WebSocket | null;

  /**
   * Constructor for the Node class
   * @param blue - The blue client instance
   * @param node - Node options
   * @param options - Options
   */
  constructor(blue: T, node: NodeOptions, options: Options) {
    // Assigning values to class properties
    this.blue = blue;
    this.node = node;
    this.sessionId = null;
    this.connected = false;
    this.options = options;
    this.autoResume = this.options?.autoResume || false;
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
    this.playerUpdate = this.options?.playerUpdateInterval || 60;
    this.rest = new RestManager(this.blue);
    this.resumeKey = !!this.options?.resumeKey ? this.options.resumeKey : null;
    this.ws = null;
  }

  /**
   * Method to connect to the Lavalink node
   */
  public async connect(): Promise<void> {
    // Setting headers for WebSocket connection
    const headers: any = {
      "Authorization": this.info.password,
      "Client-Name": client_name,
      "User-Id": this.blue.client.user.id,
      "User-Agent": `${client_name}/${Config.version} (${Config.repository.url})`
    };
    if (this.resumeKey) headers["Session-Id"] = this.resumeKey;
    // Creating WebSocket connection
    this.ws = new WebSocket(`w${this.info.secure ? "ss" : "s"}://${this.info.host}:${this.info.port}/${this.blue.version}/websocket`, { headers });
    // WebSocket event listeners
    this.ws.on(Events.wsConnect, this.open.bind(this));
    this.ws.on(Events.wsDisconnect, this.close.bind(this));
    this.ws.on(Events.wsDebug, this.message.bind(this));
    this.ws.on(Events.wsError, this.error.bind(this));
  }

  /**
   * Method to disconnect from the Lavalink node
   * @returns - Returns the instance of the Node class or void
   */
  public disconnect(): this | void {
    if (this.ws) {
      return this.ws.close();
    }
    return this;
  }

  /**
   * Method to check if connected to the Lavalink node
   * @returns - Returns true if connected, false otherwise
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Event handler for successful WebSocket connection
   */
  private open(): void {
    this.connected = true;
    this.blue.nodes.set(this.info.host, this);
    this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("WEBSOCKET GATEWAY").Yellow()}] --> [${String("STATUS: OK, CODE: 200").Green()}]`);
    this.blue.emit(Events.nodeConnect, this, `${client_name} ${this.info.host} :: node successfully connected!`);
  }

  /**
   * Event handler for WebSocket disconnection
   */
  private close(): void | Node | NodeOptions[] | Error  {
    this.connected = false;
    this.blue.emit(Events.nodeDisconnect, this, `${client_name} ${this.info.host} :: node disconnected!`);
    this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("CLOSING ERROR_CODE: 404 | 405").Red()}]`);
    this.count++;
    if (this.count > 10) {
      this.blue.emit(Events.nodeDisconnect, this, `${client_name} error :: After Several tries I couldn't connect to the lavalink!`);
      this.count = 0;
      return this.ws!.close();
    }
    if(this.blue._nodes.length > 1)  
      return this.blue._nodes = this.blue._nodes.filter(n => [...this.blue.activeNodes()].map(d => d.host).includes(n.host));
    const timeout = setTimeout(() => {
      this.blue.nodes.get(this.info.host) && this.connect();
      clearTimeout(timeout);
    }, 5000);
  }

  /**
   * Event handler for receiving WebSocket messages
   * @param payload - The payload received
   */
  private async message(payload: string): Promise<void | undefined> {
    const packet = JSON.parse(payload);
    if (!packet?.op) return;
    switch (packet.op) {
        case "stats":
            this.stats = { ...packet };
            this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("RECEIVED: SYSTEM PAYLOAD").Green()}] ---> ${String(`${JSON.stringify(this.stats)}`).Yellow()}`);
            break;
        case "event":
            this.blue.handleEvents(packet);
            this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("RECEIVED: EVENT PAYLOAD").Green()}] ---> ${String(`${JSON.stringify(packet)}`).Yellow()}`);
            break;
        case "ready":
            this.sessionId = packet.sessionId;
            this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("RECEIVED: READY PAYLOAD").Green()}] ---> ${String(`${JSON.stringify(packet)}`).Yellow()}`);
            this.rest.setSession(this.sessionId || "none");
            this.autoResume && this.blue.players.forEach((player: Player): void => {
              try {
              if(player.blue.node === this && player.connected && player.queue.current){
                const { selfDeaf, selfMute,  guildId } = player.options;
                player.connect({ 
                  voiceChannel: null,
                  guildId: guildId,
                  selfDeaf: selfDeaf,
                  selfMute: selfMute
                });
                player.connect();
                player.reconnect();
              }
             } catch (e: any) {}
            });
            this.resumeKey && await this.rest.updateSession(this.resumeKey, { resuming: !!this.resumeKey, timeout: this.playerUpdate });
            break;
        case "playerUpdate":
            const player = this.blue.players.get(packet?.guildId);
            if (player && packet.state) {
                player.position = packet.state.position || 0;
                player.ping = packet.state.ping || -1;
                player.timestamp = packet.state.timestamp || 0;
                this.blue.emit(Events.playerUpdate, player, player?.queue?.current?.info);
            }
            break;
        default:
            this.blue.emit(Events.nodeError, this, new Error(`Unexpected op "${(payload as any).op}" with data: ${payload}`));
            return;
    }
  }


  /**
   * Event handler for WebSocket errors
   * @param err - The error received
   */
  private error(err: Error): void {
    this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.info.host} ---> [${String("WEBSOCKET ERROR").Red()}]`);
    this.blue.emit(Events.nodeError, err, new Error(`Unable to connect to lavalink!`));
  }
}

export default Node;
