const { fetch } = require("undici");

class Youtube {
    constructor(blue) {
        this.blue = blue;
    }

    async search(query, type = "ytmsearch") {
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
            return { ...data };
        } catch (error) {
            throw error; 
        }
    }
}

module.exports = Youtube;
