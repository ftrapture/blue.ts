"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const QueueManager_1 = __importDefault(require("./QueueManager"));
const Events_1 = __importDefault(require("../Utils/Events"));
const PlayerEventManager_1 = __importDefault(require("./PlayerEventManager"));
const FilterManager_1 = __importDefault(require("./FilterManager"));
const Types_1 = __importDefault(require("../Utils/Types"));
/**
 * Player class
 */
class Player {
    blue;
    volume;
    playing;
    queue;
    position;
    connected;
    paused;
    createdTimestamp;
    createdAt;
    guildId;
    voiceChannel;
    textChannel;
    selfDeaf;
    selfMute;
    filter;
    options;
    loop;
    event;
    /**
     * Constructor
     */
    constructor(blue, options) {
        this.blue = blue;
        this.volume = 100;
        this.filter = new FilterManager_1.default(this);
        this.playing = false;
        this.queue = new QueueManager_1.default();
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
        this.blue.emit(Events_1.default.playerCreate, this);
        this.event = new PlayerEventManager_1.default(this);
    }
    /**
     * Check if player is paused
     */
    isPaused() {
        return this.paused;
    }
    /**
     * Check if player is connected
     */
    isConnected() {
        return this.connected;
    }
    /**
     * Play function
     */
    async play(options = {}) {
        if (this.queue.isEmpty())
            return this;
        this.queue.current = this.queue.shift();
        if (!this.queue.current?.info?.identifier)
            return this;
        const datas = this.queue.current;
        if (["album_track", "recommend_track", "playlist_track"].includes(this.queue.current?.type)) {
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
        }
        catch (e) {
            this.playing = false;
            this.blue.emit(Events_1.default.trackError, this, this.queue.current, null);
        }
    }
    /**
     * Search function
     */
    async search() {
        let data = await this.blue.search({ query: `${this.queue.current.info.title} ${this.queue.current.info.author}`, source: "youtube music" }).catch(() => null);
        if (!data || !data.tracks?.length || [Types_1.default.LOAD_ERROR, Types_1.default.LOAD_EMPTY].includes(data.loadType))
            return null;
        return data.tracks[0];
    }
    /**
     * Connect function
     */
    connect() {
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
    send(data) {
        this.blue.send({ op: 4, d: data });
    }
    /**
     * Update track info function
     */
    updateTrackInfo(datas) {
        this.queue.current.info.sourceName = datas.info.sourceName;
        this.queue.current.info.isrc = datas.info.isrc;
        this.queue.current.type = datas.type;
        this.queue.current.info.uri = datas.info.uri;
    }
    /**
     * Stop function
     */
    stop() {
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
    disconnect() {
        if (this.voiceChannel === null)
            return null;
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
        this.blue.emit(Events_1.default.playerDisconnect, this);
        this.blue.players.delete(this.guildId);
        return this;
    }
    /**
     * Destroy function
     */
    destroy() {
        return this.disconnect();
    }
    /**
     * Pause function
     */
    pause(pause = true) {
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
    setLoop(query) {
        if (!query || !["queue", "track", "none"].includes(query.toLowerCase()))
            this.loop = "none";
        else
            this.loop = query.toLowerCase();
        return this;
    }
    /**
     * Set voice channel function
     */
    setVoiceChannel(channel, options) {
        if (typeof channel !== "string")
            throw new TypeError(`'channel' must be contain only channel id.`);
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
    setTextChannel(channel) {
        if (typeof channel !== "string")
            throw new TypeError(`'channel' must be contain only channel id.`);
        this.textChannel = channel;
        return this;
    }
    /**
     * Set volume function
     */
    setVolume(integer = this.volume) {
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
    seek(position) {
        if (typeof position === "string") {
            position = parseInt(position);
            if (Number.isNaN(position))
                throw new RangeError("blue.ts :: Invalid position format");
        }
        if (position < 0)
            position = 0;
        let ms = this.blue.util.durationInMs(position);
        const pos = Math.abs(ms);
        if (ms < 0) {
            this.position = this.position - pos;
        }
        else {
            this.position = pos;
        }
        if (this.position < 0)
            this.position = 0;
        this.blue.node.rest.updatePlayer({ guildId: this.guildId, data: { position } });
        return this;
    }
    /**
     * Autoplay function
     */
    async autoplay() {
        try {
            if (!this.queue.previous?.info?.identifier && !this.queue.current?.info?.identifier)
                throw new Error("Could not search for autoplay tracks.");
            if (!["ytsearch", "ytmsearch", "youtube", "youtube music"].includes(this.blue.load.source))
                return this.rawAutoplay();
            const data = `https://www.youtube.com/watch?v=${this.queue.previous?.info?.identifier || this.queue.current?.info?.identifier}&list=RD${this.queue.previous.info.identifier || this.queue.current.info.identifier}`;
            const response = await this.blue.search({ query: data }).catch(() => null);
            if (!response || !response.tracks?.length)
                throw new Error("Track not found, for autoplay.");
            response.tracks.shift();
            const track = response.tracks[Math.floor(Math.random() * Math.floor(response.tracks.length))];
            this.queue.add(track);
            await this.play();
            return this;
        }
        catch (e) {
            console.log(e);
            return (await this.destroy());
        }
    }
    /**
     * @returns object of this class when song found, or else error.
     */
    async rawAutoplay() {
        try {
            const search = await this.blue.load.spotify.search(this.queue.current?.info?.title || this.queue.previous?.info?.title).catch(() => null);
            if (!search)
                throw new Error("Track not found, for autoplay.");
            const res = await this.blue.load.spotify.getRecommendations(search?.info?.identifier);
            if (!res?.length)
                throw new Error("Track not found, for autoplay.");
            const track = res[Math.floor(Math.random() * Math.floor(res.length))];
            this.queue.add(track);
            await this.play();
            return this;
        }
        catch (e) {
            console.log(e);
            return (await this.destroy());
        }
    }
}
exports.default = Player;
//# sourceMappingURL=PlayerManager.js.map