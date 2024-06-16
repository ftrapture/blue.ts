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
    public ping: number;
    public timestamp: number;
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
        this.ping = -1;
        this.connected = false;
        this.paused = false;
        this.timestamp = 0;
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
        
        await this.additionalSource(datas);

        try {
            this.playing = true;
            this.position = 0;

            const volumeFactor = Math.cos(this.position / 1000); 
            const adjustedVolume = Math.floor(this.volume * volumeFactor);

            await this.blue.node.rest.updatePlayer({
                guildId: this.guildId,
                noReplace: options?.noReplace || false,
                data: {
                    track: { encoded: this.queue.current?.encoded || null },
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
    private async search(): Promise<Track | unknown> {
        let data = await this.blue.search({ query: `${this.queue.current.info.title} ${this.queue.current.info.author}`, source: "youtube music" }).catch(() => null);
        if(!data || !data.tracks?.length || [Types.LOAD_ERROR, Types.LOAD_EMPTY].includes(data.loadType)) return null;
        return data.tracks[0];
    }

    private async additionalSource(datas: Track): Promise<void> {
        if(this.queue.current?.type && this.queue.current?.info?.sourceName && ["album_track", "recommend_track", "playlist_track"].includes(this.queue.current.type) && this.blue.util.platforms[this.queue.current.info.sourceName.toLowerCase()]){
            this.queue.current = await this.search();
            await this.updateTrackInfo(datas);
        }
    }

    /**
     * Connect function
     */
    public connect(options?: { [key: string]: string | boolean | unknown }): void {
        this.send({
            guild_id: options?.guildId || this.guildId,
            channel_id: (options?.voiceChannel || options?.voiceChannel === null) ? options.voiceChannel : this.voiceChannel,
            self_deaf: options?.selfDeaf || this.selfDeaf,
            self_mute: options?.selfMute || this.selfMute,
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

        this.options["voiceChannel"] = this.voiceChannel = null;
        this.options["textChannel"] = this.textChannel = null;
        this.options["guildId"] = this.guildId = null;
        return this;
    }

    /**
     * Destroy function
     */
    public destroy(): this {
        this.blue.node.rest.destroyPlayer(this.guildId);
        this.blue.emit(Events.playerDisconnect, this);
        this.blue.players.delete(this.guildId);
        this.disconnect();
        return this;
    }

    /**
     * Pause function
     */
    public pause(pause: boolean = true): this | TypeError {
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
    public setVoiceChannel(channel: string, options: VoiceConnection): this | TypeError {
        if(typeof channel !== "string") throw new TypeError(`'channel' must be contain only channel id.`);
        if (!this.isConnected())
            throw new ReferenceError(`Im not connected to the voice channel.`);

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
    public setTextChannel(channel: string): this | TypeError {
        if(typeof channel !== "string") throw new TypeError(`'channel' must be contain only channel id.`);
        this.textChannel = channel;
        return this;
    }

    /**
     * Set volume function
     */
    public setVolume(integer: number = this.volume): this | RangeError {
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
    public seek(position: string | number): this | RangeError {
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
     * reconnects to the playback
     * @returns Player
     */
    public async reconnect(): Promise<this> {
        if (!this.queue.current && this.queue.isEmpty()) return this;
       await this.blue.node.rest.updatePlayer({
          guildId: this.guildId,
          data: {
            position: this.position,
            track: this.rawTrackBuild(this.queue.current),
          },
        });
    
        return this
      };

    private rawTrackBuild(track: any): any {
        if(track.encoded) {
            return {
                encoded: track.encoded,
                info: {
                    identifier: track.info.identifier,
                    author: track.info.author,
                    length: track.info.duration,
                    artworkUrl: track.info.thumbnail,
                    uri: track.info.uri,
                    isStream: track.info.isStream,
                    sourceName: track.info.sourceName,
                    position: track.info.position,
                    isrc: track.info.isrc,
                    title: track.info.title,
                }
            }
        }
        return new Track(track);
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
            if (!response || !response.tracks?.length) return this.rawAutoplay();

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
    private async rawAutoplay(): Promise<this | Error> {
        try {
            const search: Track | any = await this.blue.load.spotify.search(this.queue.current?.info?.title || this.queue.previous?.info?.title).catch(() => null);

            if(!search) throw new Error("Track not found, for autoplay.");

            const res = await this.blue.load.spotify.getRecommendations(search?.info?.identifier).catch(() => null);

            if(!res || !res.data?.tracks || !res.data.tracks.length) throw new Error("Track not found, for autoplay.");

            const track: Track = res.data.tracks[
                Math.floor(Math.random() * Math.floor(res.data.tracks.length))
            ];

            this.queue.add(track);
            
            await this.play();

            return this;
        } catch (e) {
            return (await this.destroy());
        }
    }
}

export default Player;
