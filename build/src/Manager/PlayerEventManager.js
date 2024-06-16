"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Events_1 = __importDefault(require("../Utils/Events"));
/**
 * Class to handle player events
 */
class PlayerEvent {
    /**
     * Player instance
     */
    player;
    /**
     * Constructor
     */
    constructor(player) {
        this.player = player;
    }
    /**
     * Handle TrackStart event
     */
    TrackStartEvent(player, track, payload) {
        if (!player)
            return null;
        this.player.playing = true;
        this.player.paused = false;
        this.player.blue.emit(Events_1.default.trackStart, player, track, payload);
    }
    /**
     * Handle TrackEnd event
     */
    TrackEndEvent(player, track, payload) {
        if (!player)
            return null;
        this.player.queue.previous = this.player.queue.current;
        this.player.queue.current = null;
        if (this.player.loop === "track") {
            this.player.queue.unshift(this.player.queue.previous);
            this.player.blue.emit(Events_1.default.trackEnd, player, track, payload);
            return this.player.play();
        }
        if (this.player.loop === "queue") {
            this.player.queue.add(this.player.queue.previous);
            this.player.blue.emit(Events_1.default.trackEnd, player, track, payload);
            return this.player.play();
        }
        if (this.player.queue.size() === 0) {
            this.player.playing = false;
            this.player.blue.options.autoplay && this.player.autoplay();
            return this.player.blue.emit(Events_1.default.queueEnd, player, track, payload);
        }
        else if (this.player.queue.size() > 0) {
            this.player.blue.emit(Events_1.default.trackEnd, player, track, payload);
            return this.player.play();
        }
        else {
            this.player.playing = false;
            this.player.blue.emit(Events_1.default.queueEnd, player, track, payload);
        }
    }
    /**
     * Handle TrackStuck event
     */
    TrackStuckEvent(player, track, payload) {
        this.player.playing = false;
        if (!player)
            return null;
        this.player.blue.emit(Events_1.default.trackError, player, track, payload);
    }
    /**
     * Handle TrackException event
     */
    TrackExceptionEvent(player, track, payload) {
        this.player.playing = false;
        if (!player)
            return null;
        this.player.blue.emit(Events_1.default.trackError, player, track, payload);
    }
    /**
     * Handle WebSocketClosed event
     */
    WebSocketClosedEvent(player, payload) {
        [4015, 4009].includes(payload.code) && this.player.send({
            guild_id: this.player.guildId,
            channel_id: this.player.voiceChannel,
            self_mute: this.player.options?.selfMute || false,
            self_deaf: this.player.options?.selfDeaf || false,
        });
        this.player.blue.emit(Events_1.default.playerDisconnect, player, payload);
    }
}
exports.default = PlayerEvent;
//# sourceMappingURL=PlayerEventManager.js.map