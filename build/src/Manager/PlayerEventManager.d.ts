declare class PlayerEvent {
    private player;
    send: any;
    constructor(player: any);
    TrackStartEvent(player: any, track: any, payload: any): void;
    TrackEndEvent(player: any, track: any, payload: any): any;
    TrackStuckEvent(player: any, track: any, payload: any): void;
    TrackExceptionEvent(player: any, track: any, payload: any): void;
    WebSocketClosedEvent(player: any, payload: any): void;
}
export default PlayerEvent;
