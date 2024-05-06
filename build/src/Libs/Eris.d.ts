import { Blue } from "../Connectors/Node";
/**
 * Eris class
 */
declare class Eris {
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
export default Eris;
