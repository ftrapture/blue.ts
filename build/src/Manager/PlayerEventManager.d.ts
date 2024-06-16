import { Player } from "../Blue";
/**
 * Class to handle player events
 */
declare class PlayerEvent {
    /**
     * Player instance
     */
    private player;
    /**
     * Constructor
     */
    constructor(player: any);
    /**
     * Handle TrackStart event
     */
    TrackStartEvent(player: any, track: any, payload: any): unknown | void;
    /**
     * Handle TrackEnd event
     */
    TrackEndEvent(player: any, track: any, payload: any): unknown | void | Player;
    /**
     * Handle TrackStuck event
     */
    TrackStuckEvent(player: any, track: any, payload: any): unknown | void;
    /**
     * Handle TrackException event
     */
    TrackExceptionEvent(player: any, track: any, payload: any): unknown | void;
    /**
     * Handle WebSocketClosed event
     */
    WebSocketClosedEvent(player: any, payload: any): void;
}
export default PlayerEvent;
