import { fetch } from "undici";

class SoundCloud {
    public readonly blue: any;

    constructor(blue: any) {
        this.blue = blue;
    }

    async search(query: string, type: string = "scsearch") {
        try {
            const url = `http${this.blue.options.secure ? "s" : ""}://${this.blue.options.host}:${this.blue.options.port}/${this.blue.version}/loadtracks?identifier=${encodeURIComponent(`${type}:${query}`)}`;

            const response = await fetch(url, {
                method: "GET",
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