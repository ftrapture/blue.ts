import Events from "../Utils/Events";

/**
 * Class to handle player events
 */
class PlayerEvent {
    /**
     * Player instance
     */
    private player: any;

    /**
     * Function to send data
     */
    public send: any;

    /**
     * Constructor
     */
    constructor(player: any) {
        this.player = player;
    }

    /**
     * Handle TrackStart event
     */
    public TrackStartEvent(player: any, track: any, payload: any): void {
        if (!player) return;
        this.player.playing = true;
        this.player.paused = false;
        this.player.blue.emit(Events.trackStart, player, track, payload);
    }

    /**
     * Handle TrackEnd event
     */
    public TrackEndEvent(player: any, track: any, payload: any): any {
        if (payload?.reason === "replaced") return;
        if (!player) return;
        this.player.queue.previous = this.player.queue.current;
        this.player.queue.current = null;
        if (this.player.loop === "track") {
            this.player.queue.unshift(this.player.queue.previous);
            this.player.blue.emit(Events.trackEnd, player, track, payload);
            return this.player.play();
        }
        if (this.player.loop === "queue") {
            this.player.queue.add(this.player.queue.previous);
            this.player.blue.emit(Events.trackEnd, player, track, payload);
            return this.player.play();
        }
        if (this.player.queue.size() === 0) {
            this.player.playing = false;
            if (this.player.blue.options.autoplay) this.player.autoplay();
            return this.player.blue.emit(Events.queueEnd, player, track, payload);
        } else if (this.player.queue.size() > 0) {
            this.player.blue.emit(Events.trackEnd, player, track, payload);
            return this.player.play();
        } else {
            this.player.playing = false;
            this.player.blue.emit(Events.queueEnd, player, track, payload);
        }
    }

    /**
     * Handle TrackStuck event
     */
    public TrackStuckEvent(player: any, track: any, payload: any): any {
        this.player.playing = false;
        if (!player) return;
        this.player.blue.emit(Events.trackError, player, track, payload);
    }

    /**
     * Handle TrackException event
     */
    public TrackExceptionEvent(player: any, track: any, payload: any): any {
        this.player.playing = false;
        if (!player) return;
        this.player.blue.emit(Events.trackError, player, track, payload);
    }

    /**
     * Handle WebSocketClosed event
     */
    public WebSocketClosedEvent(player: any, payload: any): any {
        if ([4015, 4009].includes(payload.code)) {
            this.send({
                guild_id: this.player.guildId,
                channel_id: this.player.voiceChannel,
                self_mute: this.player.options?.selfMute || false,
                self_deaf: this.player.options?.selfDeaf || false,
            });
        }
        this.player.blue.emit(Events.playerDisconnect, player, payload);
    }
}

export default PlayerEvent;
