import { Blue } from "../Connectors/Node";
import { Options as DefaultPackets, VoiceConnection as Options, NodeOptions as NodePacket } from "../Blue";
/**
 * Extends the Blue interface with additional method 'verifyVersion'.
 */
interface BlueStruct extends Blue {
    verifyVersion: (arg: string) => any;
}
/**
 * Utility class for various operations.
 */
declare class Util {
    private blue;
    /**
     * Constructs a new Util instance.
     * @param blue - The Blue object.
     */
    constructor(blue: BlueStruct);
    /**
     * Checks the validity of parameters passed to the bluets constructor.
     * @param nodePackets - Node packets.
     * @param defaultPackets - Default packets.
     * @returns The Node object.
     * @throws Errors if invalid arguments are passed.
     */
    checkParamsValidity<T extends DefaultPackets>(nodePackets: NodePacket[], defaultPackets: T): Promise<any>;
    /**
     * Checks the validity of an object.
     * @param options - The options object.
     * @returns A boolean indicating validity.
     * @throws Errors if options are invalid.
     */
    checkObjectValidity<T extends Options>(options: T): boolean;
    /**
     * Encodes a string to base64.
     * @param input - The input string.
     * @returns The base64 encoded string.
     */
    base64encode(input: string): string;
    /**
     * Decodes a base64 string.
     * @param input - The input base64 string.
     * @returns The decoded string or false if input is not valid base64.
     */
    base64decode(input: string): string | boolean;
    /**
     * Checks if a string is valid base64.
     * @param input - The input string.
     * @returns A boolean indicating validity.
     */
    isBase64(input: string): boolean;
    /**
     * Converts time duration to milliseconds.
     * @param time - The time duration.
     * @returns The duration in milliseconds.
     * @throws Errors for invalid time formats or values.
     */
    durationInMs(time: string | number): number;
}
export default Util;
