import QueueManager from "./QueueManager";
import PlayerEvents from "./PlayerEventManager";
import Filters from "./FilterManager";
import Track from "../Structure/Track";
import { Blue } from "../Connectors/Node";
import { Player as PlayerOption, VoiceConnection } from "../Blue";
/**
 * Player Options interface
 */
export interface PlayerOptions {
    guildId?: string | null;
    textChannel?: string | null;
    voiceChannel?: string | null;
    selfMute?: boolean;
    selfDeaf?: boolean;
}
/**
 * Interface for Blue structure
 */
interface BlueStruct extends Blue {
    search: (...args: any) => Promise<any>;
}
/**
 * Interface for Filter
 */
export interface Filter extends Filters {
    player: PlayerOption;
    volume: number;
    equalizer: any[];
    karaoke: any;
    tremolo: any;
    vibrato: any;
    rotation: any;
    distortion: any;
    channelMix: any;
    lowPass: any;
    timeScaler: any;
}
/**
 * Loop type
 */
export type Loop = "none" | "queue" | "track";
/**
 * Interface for PlayerEvent
 */
export interface PlayerEvent extends PlayerEvents {
    TrackStartEvent: (...args: any) => void;
    TrackEndEvent: (...args: any) => void;
    TrackStuckEvent: (...args: any) => void;
    TrackExceptionEvent: (...args: any) => void;
    WebSocketClosedEvent: (...args: any) => void;
}
/**
 * Interface for Queue
 */
export interface Queue extends QueueManager {
    buffer: any[];
    head: number;
    tail: number;
    previous: any | null;
    current: any | null;
}
/**
 * Player class
 */
declare class Player {
    blue: BlueStruct;
    volume: number;
    playing: boolean;
    queue: Queue;
    position: number;
    ping: number;
    timestamp: number;
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
    /**
     * Constructor
     */
    constructor(blue: BlueStruct, options: PlayerOptions);
    /**
     * Check if player is paused
     */
    isPaused(): boolean;
    /**
     * Check if player is connected
     */
    isConnected(): boolean;
    /**
     * Play function
     */
    play(options?: any): Promise<this | void>;
    /**
     * Search function
     */
    private search;
    private additionalSource;
    /**
     * Connect function
     */
    connect(options?: {
        [key: string]: string | boolean | unknown;
    }): void;
    /**
     * Send function
     */
    send(data: any): void;
    /**
     * Update track info function
     */
    updateTrackInfo(datas: Track): void;
    /**
     * Stop function
     */
    stop(): this;
    /**
     * Disconnect function
     */
    disconnect(): this;
    /**
     * Destroy function
     */
    destroy(): this;
    /**
     * Pause function
     */
    pause(pause?: boolean): this | TypeError;
    /**
     * Set loop function
     */
    setLoop(query: Loop): this;
    /**
     * Set voice channel function
     */
    setVoiceChannel(channel: string, options: VoiceConnection): this | TypeError;
    /**
     * Set text channel function
     */
    setTextChannel(channel: string): this | TypeError;
    /**
     * Set volume function
     */
    setVolume(integer?: number): this | RangeError;
    /**
     * Seek function
     */
    seek(position: string | number): this | RangeError;
    /**
     * reconnects to the playback
     * @returns Player
     */
    reconnect(): Promise<this>;
    private rawTrackBuild;
    /**
     * Autoplay function
     */
    autoplay(): Promise<this | Error>;
    /**
     * @returns object of this class when song found, or else error.
     */
    private rawAutoplay;
}
export default Player;
