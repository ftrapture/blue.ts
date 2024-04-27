"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Events_1 = __importDefault(require("../Utils/Events"));
class PlayerEvent {
    player;
    send;
    constructor(player) {
        this.player = player;
    }
    TrackStartEvent(player, track, payload) {
        if (!player)
            return;
        this.player.playing = true;
        this.player.paused = false;
        this.player.blue.emit(Events_1.default.trackStart, player, track, payload);
    }
    TrackEndEvent(player, track, payload) {
        if (payload?.reason === "replaced")
            return;
        if (!player)
            return;
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
            if (this.player.blue.options.autoplay)
                this.player.autoplay();
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
    TrackStuckEvent(player, track, payload) {
        console.log("stuck");
        this.player.playing = false;
        if (!player)
            return;
        this.player.blue.emit(Events_1.default.trackError, player, track, payload);
    }
    TrackExceptionEvent(player, track, payload) {
        console.log("exception");
        this.player.playing = false;
        if (!player)
            return;
        this.player.blue.emit(Events_1.default.trackError, player, track, payload);
    }
    WebSocketClosedEvent(player, payload) {
        if ([4015, 4009].includes(payload.code)) {
            this.send({
                guild_id: this.player.guildId,
                channel_id: this.player.voiceChannel,
                self_mute: this.player.options?.selfMute || false,
                self_deaf: this.player.options?.selfDeaf || false,
            });
        }
        this.player.blue.emit(Events_1.default.playerDisconnect, player, payload);
    }
}
exports.default = PlayerEvent;
//# sourceMappingURL=PlayerEventManager.js.map