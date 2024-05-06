import { fetch } from "undici";
import { Blue } from "../Connectors/Node";
import Methods from "../Utils/Methods";

/**
 * SoundCloud class for handling SoundCloud operations.
 */
class SoundCloud {
    public readonly blue: Blue;

    /**
     * Constructs a new SoundCloud instance.
     * @param blue - The Blue instance.
     */
    constructor(blue: any) {
        this.blue = blue;
    }

    /**
     * Searches for tracks on SoundCloud.
     * @param query - The query to search for.
     * @returns A promise resolving to any or an Error.
     */
    public async search(query: string): Promise<any | Error> {
        try {
            const type: string = "scsearch";
            const url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}/${this.blue.version}/loadtracks?identifier=${encodeURIComponent(`${type}:${query}`)}`;

            const response = await fetch(url, {
                method: Methods.Get,
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': this.blue.options.password
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw error; 
        }
    }
}

export default SoundCloud;
