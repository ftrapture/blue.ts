import Events from "../Utils/Events";
import { Player } from "../Blue";
/**
 * Class to handle player events
 */
class PlayerEvent {
    /**
     * Player instance
     */
    private player: any;
    /**
     * Constructor
     */
    constructor(player: any) {
        this.player = player;
    }

    /**
     * Handle TrackStart event
     */
    public TrackStartEvent(player: any, track: any, payload: any): unknown | void {

        if (!player) return null;
        
        this.player.playing = true;

        this.player.paused = false;

        this.player.blue.emit(Events.trackStart, player, track, payload);

    }

    /**
     * Handle TrackEnd event
     */
    public TrackEndEvent(player: any, track: any, payload: any): unknown | void | Player {

        if (!player) return null;

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

            this.player.blue.options.autoplay && this.player.autoplay();

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
    public TrackStuckEvent(player: any, track: any, payload: any): unknown | void {

        this.player.playing = false;

        if (!player) return null;

        this.player.blue.emit(Events.trackError, player, track, payload);
    }

    /**
     * Handle TrackException event
     */
    public TrackExceptionEvent(player: any, track: any, payload: any): unknown | void {

        this.player.playing = false;

        if (!player) return null;

        this.player.blue.emit(Events.trackError, player, track, payload);
    }

    /**
     * Handle WebSocketClosed event
     */
    public WebSocketClosedEvent(player: any, payload: any): void {

        [4015, 4009].includes(payload.code) && this.player.send({
                guild_id: this.player.guildId,
                channel_id: this.player.voiceChannel,
                self_mute: this.player.options?.selfMute || false,
                self_deaf: this.player.options?.selfDeaf || false,
            });

        this.player.blue.emit(Events.playerDisconnect, player, payload);
    }
}

export default PlayerEvent;
