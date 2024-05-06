/**
 * Class to handle player events
 */
declare class PlayerEvent {
    /**
     * Player instance
     */
    private player;
    /**
     * Function to send data
     */
    send: any;
    /**
     * Constructor
     */
    constructor(player: any);
    /**
     * Handle TrackStart event
     */
    TrackStartEvent(player: any, track: any, payload: any): void;
    /**
     * Handle TrackEnd event
     */
    TrackEndEvent(player: any, track: any, payload: any): any;
    /**
     * Handle TrackStuck event
     */
    TrackStuckEvent(player: any, track: any, payload: any): any;
    /**
     * Handle TrackException event
     */
    TrackExceptionEvent(player: any, track: any, payload: any): any;
    /**
     * Handle WebSocketClosed event
     */
    WebSocketClosedEvent(player: any, payload: any): any;
}
export default PlayerEvent;
