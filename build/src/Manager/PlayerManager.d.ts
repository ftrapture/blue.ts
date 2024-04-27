import QueueManager from "./QueueManager";
import PlayerEvents from "./PlayerEventManager";
import Filters from "./FilterManager";
import Track from "../Structure/Track";
interface PlayerOptions {
    guildId?: string | null;
    textChannel?: string | null;
    voiceChannel?: string | null;
    selfMute?: boolean;
    selfDeaf?: boolean;
}
interface Filter extends Filters {
    player: any;
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
type Loop = "none" | "queue" | "track";
interface PlayerEvent extends PlayerEvents {
    TrackStartEvent: (...args: any) => void;
    TrackEndEvent: (...args: any) => void;
    TrackStuckEvent: (...args: any) => void;
    TrackExceptionEvent: (...args: any) => void;
    WebSocketClosedEvent: (...args: any) => void;
}
interface Queue extends QueueManager {
    buffer: any[];
    head: number;
    tail: number;
    previous: any | null;
    current: any | null;
}
declare class Player {
    blue: any;
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
    constructor(blue: any, options: PlayerOptions);
    isPaused(): boolean;
    isConnected(): boolean;
    play(options?: any): Promise<this>;
    connect(): void;
    send(data: any): void;
    updateTrackInfo(datas: Track): void;
    stop(): this;
    disconnect(): this;
    destroy(): this;
    pause(pause?: boolean): this;
    setLoop(query: Loop): this;
    setVoiceChannel(channel: string, options?: any): this;
    setTextChannel(channel: string): this;
    setVolume(integer?: number): this;
    seek(position: string | number): this;
    autoplay(): Promise<this>;
}
export default Player;
