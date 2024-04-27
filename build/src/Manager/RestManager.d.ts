import "../Utils/Color";
interface Node {
    host: string;
    password: string;
    port: number;
    secure: boolean;
}
declare class Rest {
    private blue;
    private url;
    private sessionId;
    options: Node;
    constructor(blue: any);
    setSession(id: string): Promise<void>;
    updatePlayer(options: any): Promise<unknown>;
    createPlayer(options?: any): any;
    getPlayers(): Promise<unknown>;
    getStats(): Promise<unknown>;
    fetchVersion(): Promise<unknown>;
    updateSession(sessionId: string, payload: any): Promise<unknown>;
    getInfo(): Promise<unknown>;
    decodeTrack(encoded: string): Promise<unknown>;
    decodeTracks(encoded: any[]): Promise<unknown>;
    getPlayer(guildId: string): Promise<unknown>;
    destroyPlayer(guildId: string): Promise<unknown>;
    patch(endpoint: string, body: any): Promise<unknown>;
    get(path: string): Promise<unknown>;
    post(endpoint: string, body: any): Promise<unknown>;
    delete(endpoint: string): Promise<unknown>;
    send(payload: any): Promise<void>;
}
export default Rest;
