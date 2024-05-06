import { Blue } from "../Connectors/Node";
/**
 * DiscordJs class
 */
declare class DiscordJs {
    /**
     * Instance of the blue client
     */
    blue: Blue;
    constructor(blue: Blue);
    /**
     * Send data to the guild
     * @param data - Data to be sent
     * @returns Returns a promise with the sent data
     */
    send(data: any): any;
}
export default DiscordJs;
