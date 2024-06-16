import "../Utils/Color";
import { NodeOptions as Node, Player as PlayerStruct } from "../Blue";
import { Blue } from "../Connectors/Node";
interface BlueStruct extends Blue {
    search: (...args: any) => Promise<any>;
}
/**
 * Rest class for handling RESTful API interactions.
 */
declare class Rest {
    private blue;
    private url;
    private sessionId;
    options: Node;
    /**
     * Constructs a new Rest instance.
     * @param blue - The BlueStruct instance.
     */
    constructor(blue: BlueStruct);
    /**
     * Sets the session ID.
     * @param id - The session ID.
     * @returns A promise resolving to void.
     */
    setSession(id: string): Promise<void>;
    /**
     * Updates player information.
     * @param options - The player options.
     * @returns A promise resolving to any.
     */
    updatePlayer(options: any): Promise<any>;
    /**
     * Creates a new player instance.
     * @param options - The player options.
     * @returns The created PlayerStruct instance.
     * @throws ReferenceError if options are not provided.
     */
    createPlayer(options?: any): PlayerStruct;
    /**
     * Retrieves all players.
     * @returns A promise resolving to any.
     */
    getPlayers(): Promise<any>;
    /**
     * Retrieves statistics.
     * @returns A promise resolving to any.
     */
    getStats(): Promise<any>;
    /**
     * Fetches the version.
     * @returns A promise resolving to any.
     */
    fetchVersion(): Promise<any>;
    /**
     * Updates a session.
     * @param sessionId - The session ID.
     * @param payload - The payload.
     * @returns A promise resolving to any.
     */
    updateSession(sessionId: string | unknown, payload: any): Promise<any>;
    /**
     * Retrieves information.
     * @returns A promise resolving to any.
     */
    getInfo(): Promise<any>;
    /**
     * Decodes a track.
     * @param encoded - The encoded track.
     * @returns A promise resolving to any.
     */
    decodeTrack(encoded: string): Promise<any>;
    /**
     * Decodes multiple tracks.
     * @param encoded - The encoded tracks.
     * @returns A promise resolving to any.
     */
    decodeTracks(encoded: any[]): Promise<any>;
    /**
     * Retrieves a player.
     * @param guildId - The guild ID.
     * @returns A promise resolving to any.
     */
    getPlayer(guildId: string): Promise<any>;
    /**
     * Destroys a player.
     * @param guildId - The guild ID.
     * @returns A promise resolving to any.
     */
    destroyPlayer(guildId: string): Promise<any>;
    /**
     * Sends a payload.
     * @param payload - The payload to send.
     * @returns A promise resolving to any.
     */
    send(payload: any): Promise<any>;
    patch(endpoint: string, body: any): Promise<any>;
    get(path: string): Promise<any>;
    post(endpoint: string, body: any): Promise<any>;
    delete(endpoint: string): Promise<any>;
}
export default Rest;
