import QueueManager from "./QueueManager";
import Events from "../Utils/Events";
import PlayerEvents from "./PlayerEventManager";
import Filters from "./FilterManager";
import Track from "../Structure/Track";
import Types from "../Utils/Types";
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
    search: (...args: any) => Promise<any>
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
class Player {
    public blue: BlueStruct;
    public volume: number;
    public playing: boolean;
    public queue: Queue;
    public position: number;
    public connected: boolean;
    public paused: boolean;
    public createdTimestamp: number;
    public createdAt: Date;
    public guildId: string | null;
    public voiceChannel: string | null;
    public textChannel: string | null;
    public selfDeaf: boolean;
    public selfMute: boolean;
    public filter: Filter;
    public options: PlayerOptions;
    public loop: Loop;
    public event: PlayerEvent;

    /**
     * Constructor
     */
    constructor(blue: BlueStruct, options: PlayerOptions) {
        this.blue = blue;
        this.volume = 100;
        this.filter = new Filters(this);
        this.playing = false;
        this.queue = new QueueManager();
        this.position = 0;
        this.connected = false;
        this.paused = false;
        this.createdTimestamp = Date.now();
        this.createdAt = new Date();
        this.guildId = options.guildId || null;
        this.voiceChannel = options.voiceChannel || null;
        this.textChannel = options.textChannel || null;
        this.selfDeaf = options.selfDeaf || false;
        this.selfMute = options.selfMute || false;
        this.options = {
            guildId: this.guildId,
            textChannel: this.textChannel,
            voiceChannel: this.voiceChannel,
            selfMute: this.selfMute,
            selfDeaf: this.selfDeaf
        };
        this.loop = "none";
        this.blue.emit(Events.playerCreate, this);
        this.event = new PlayerEvents(this);
    }

    /**
     * Check if player is paused
     */
    public isPaused(): boolean {
        return this.paused;
    }

    /**
     * Check if player is connected
     */
    public isConnected(): boolean {
        return this.connected;
    }

    /**
     * Play function
     */
    public async play(options: any = {}): Promise<this | void> {
        
        if(this.queue.isEmpty()) return this;
        
        this.queue.current = this.queue.shift();

        if(!this.queue.current?.info?.identifier) return this;

        const datas = this.queue.current;
        
        if(["album_track", "recommend_track", "playlist_track"].includes(this.queue.current?.type)){
            this.queue.current = await this.search();
            await this.updateTrackInfo(datas);
        }
        try {
            this.playing = true;
            this.position = 0;

            const volumeFactor = Math.cos(this.position / 1000); 
            const adjustedVolume = Math.floor(this.volume * volumeFactor);

            await this.blue.node.rest.updatePlayer({
                guildId: this.guildId,
                noReplace: options?.noReplace || false,
                data: {
                    track: { encoded: this.queue.current?.trackToken || null },
                    volume: adjustedVolume
                },
            });
            return this;
        } catch (e) {
            this.playing = false;
            this.blue.emit(Events.trackError, this, this.queue.current, null);
        }
    }

    /**
     * Search function
     */
    private async search(): Promise<Track | null | undefined> {
        let data = await this.blue.search({ query: `${this.queue.current.info.title} ${this.queue.current.info.author}`, source: "youtube music" }).catch(() => null);
        if(!data || !data.tracks?.length || [Types.LOAD_ERROR, Types.LOAD_EMPTY].includes(data.loadType)) return null;
        return data.tracks[0];
    }

    /**
     * Connect function
     */
    public connect(): void {
        this.send({
            guild_id: this.guildId,
            channel_id: this.voiceChannel,
            self_deaf: this.selfDeaf,
            self_mute: this.selfMute,
        });
        this.connected = true;
    }

    /**
     * Send function
     */
    public send(data: any): void {
        this.blue.send({ op: 4, d: data });
    }

    /**
     * Update track info function
     */
    public updateTrackInfo(datas: Track): void {
            this.queue.current.info.sourceName = datas.info.sourceName;
            this.queue.current.info.isrc = datas.info.isrc;
            this.queue.current.type = datas.type;
            this.queue.current.info.uri = datas.info.uri;
    }

    /**
     * Stop function
     */
    public stop(): this {
        this.position = 0;
        this.playing = false;
        this.blue.node.rest.updatePlayer({
            guildId: this.guildId,
            data: { track: { encoded: null } },
        });
        return this;
    }

    /**
     * Disconnect function
     */
    public disconnect(): this {
        if (this.voiceChannel === null) return null;
        this.connected = false;
        this.playing = false;
        this.send({
            guild_id: this.guildId,
            channel_id: null,
            self_mute: false,
            self_deaf: false,
        });
        this.voiceChannel = null;
        this.options["voiceChannel"] = null;
        this.blue.node.rest.destroyPlayer(this.guildId);
        this.blue.emit(Events.playerDisconnect, this);
        this.blue.players.delete(this.guildId);
        return this;
    }

    /**
     * Destroy function
     */
    public destroy(): this {
        return this.disconnect();
    }

    /**
     * Pause function
     */
    public pause(pause: boolean = true): this {
        if (typeof pause !== "boolean")
            throw new TypeError("blue.ts :: Pause function must be passed a boolean value.");

        this.blue.node.rest.updatePlayer({
            guildId: this.guildId,
            data: { paused: pause },
        });
        this.playing = !pause;
        this.paused = pause;

        return this;
    }

    /**
     * Set loop function
     */
    public setLoop(query: Loop): this {
        if(!query || !["queue", "track", "none"].includes(query.toLowerCase())) 
            this.loop = "none";
        else
            this.loop = query.toLowerCase() as Loop;
        return this;
    }

    /**
     * Set voice channel function
     */
    public setVoiceChannel(channel: string, options: VoiceConnection): this {
        if(typeof channel !== "string") throw new TypeError(`'channel' must be contain only channel id.`);
        if (this.isConnected() && channel == this.voiceChannel)
            throw new ReferenceError(`Player is already created and connected to ${channel}`);

        this.voiceChannel = channel;
        this.options["voiceChannel"] = this.voiceChannel;
        if (options) {
            this.selfMute = options.selfMute ?? this.selfMute ?? false;
            this.selfDeaf = options.selfDeaf ?? this.selfDeaf ?? false;
        }
        this.connect();
        return this;
    }

    /**
     * Set text channel function
     */
    public setTextChannel(channel: string): this {
        if(typeof channel !== "string") throw new TypeError(`'channel' must be contain only channel id.`);
        this.textChannel = channel;
        return this;
    }

    /**
     * Set volume function
     */
    public setVolume(integer: number = this.volume): this {
        if (Number.isNaN(integer))
            throw new RangeError("blue.ts :: Volume level must be a number.");

        if (integer < 0 || integer > 500)
            throw new RangeError("blue.ts :: Volume Number should be between 0 and 500");

        this.blue.node.rest.updatePlayer({ guildId: this.guildId, data: { volume: integer } });
        this.volume = integer;
        return this;
    }

    /**
     * Seek function
     */
    public seek(position: string | number): this {
        if(typeof position === "string") {
            position = parseInt(position);
            if(Number.isNaN(position)) 
             throw new RangeError("blue.ts :: Invalid position format");
        }
        if(position < 0) position = 0;
        let ms = this.blue.util.durationInMs(position);
        const pos = Math.abs(ms);
        if (ms < 0) {
            this.position = this.position - pos;
        } else {
            this.position = pos;
        }
        if (this.position < 0) this.position = 0;
        this.blue.node.rest.updatePlayer({ guildId: this.guildId, data: { position } });
        return this;
    }

    /**
     * Autoplay function
     */
    public async autoplay(): Promise<this | Error> {
        try {
            if(!this.queue.previous?.info?.identifier && !this.queue.current?.info?.identifier) throw new Error("Could not search for autoplay tracks.")
            if(!["ytsearch", "ytmsearch", "youtube", "youtube music"].includes(this.blue.load.source)) return this.rawAutoplay();
            
            const data = `https://www.youtube.com/watch?v=${this.queue.previous?.info?.identifier || this.queue.current?.info?.identifier}&list=RD${this.queue.previous.info.identifier || this.queue.current.info.identifier}`;

            const response = await this.blue.search({ query: data }).catch(() => null);
            if (!response || !response.tracks?.length) throw new Error("Track not found, for autoplay.");

            response.tracks.shift();
            
            const track = response.tracks[
                Math.floor(Math.random() * Math.floor(response.tracks.length))
            ];

            this.queue.add(track);
            await this.play();

            return this;
        } catch (e) {
            console.log(e)
            return (await this.destroy());
        }
    }

    /**
     * @returns object of this class when song found, or else error.
     */
    private async rawAutoplay(): Promise<any> {
        try {
            const search: Track | any = await this.blue.load.spotify.search(this.queue.current?.info?.title || this.queue.previous?.info?.title).catch(() => null);

            if(!search) throw new Error("Track not found, for autoplay.");

            const res = await this.blue.load.spotify.getRecommendations(search?.info?.identifier);

            if(!res?.length) throw new Error("Track not found, for autoplay.");

            const track: Track = res[
                Math.floor(Math.random() * Math.floor(res.length))
            ];

            this.queue.add(track);
            
            await this.play();

            return this;
        } catch (e) {
            console.log(e)
            return (await this.destroy());
        }
    }
}

export default Player;
