import { fetch } from "undici";
import { Blue } from "../Connectors/Node";
import Methods from "../Utils/Methods";

/**
 * Youtube class for handling YouTube operations.
 */
class Youtube {
    public readonly blue: Blue;

    /**
     * Constructs a new Youtube instance.
     * @param blue - The Blue instance.
     */
    constructor(blue: any) {
        this.blue = blue;
    }

    /**
     * Searches for tracks on YouTube.
     * @param query - The query to search for.
     * @param type - The type of search (default is "ytmsearch").
     * @returns A promise resolving to any or an Error.
     */
    public async search(query: string, type: string = "ytmsearch"): Promise<any | Error> {
        try {
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

export default Youtube;
