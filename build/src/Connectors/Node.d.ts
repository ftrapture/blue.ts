import WebSocket from 'ws';
import RestManager from "../Manager/RestManager";
import '../Utils/Color';
declare class Node {
    readonly blue: any;
    node: any;
    sessionId: string | null;
    connected: boolean;
    options: any;
    info: {
        host: string;
        port: number;
        secure: boolean;
        password: string;
    };
    count: number;
    stats: {
        frameStats: any;
        players: number;
        playingPlayers: number;
        uptime: number;
        memory: {
            free: number;
            used: number;
            allocated: number;
            reservable: number;
        };
        cpu: {
            cores: number;
            systemLoad: number;
            lavalinkLoad: number;
        };
    };
    playerUpdate: number;
    rest: RestManager;
    resumeKey: string | null;
    ws: WebSocket | null;
    constructor(blue: any, node: any, options: any);
    connect(): void;
    disconnect(): void | this;
    isConnected(): boolean;
    open(): void;
    close(): void;
    message(payload: string): Promise<void>;
    error(err: Error): void;
}
export default Node;
