const axios = require("axios");
const Queue = require("../Manager/QueueManager");

class Spotify {
    constructor(blue) {
        this.blue = blue;
        this.client_id = this.blue.options["spotify"]?.client_id || false;
        this.client_secret = this.blue.options["spotify"]?.client_secret || false;
        this.base64Auth = Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64');
        this.baseUrl = "https://api.spotify.com/v1/";
        this.accessToken = "";
        this.queue = new Queue();
        this.initialize();
    }
    
    async search(query, type = "track") {
        const response = await axios.get(
            `${this.baseUrl}search?q=${encodeURIComponent(query)}&type=${type}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                },
            }
        );
        return `${response.data.tracks.items[0].name} ${response.data?.tracks?.items[0]?.artists.map(n => n.name).join(" ")}`;
    }

    async initialize() {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${this.base64Auth}`,
                },
            }
        );
        this.accessToken = response.data.access_token;
    }
    
    async getSpotifyEntityInfo(url) {
        const regex = /https?:\/\/open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)(\?si=[a-zA-Z0-9]+)?/;
        const match = url.match(regex);

        if (match) {
            const entityType = match[1];
            const entityId = match[2];

            switch (entityType) {
                case 'album':
                    const res = await axios.get(`${this.baseUrl}${entityType}s/${entityId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    });
                    let albums = [];
                    res.data.tracks.items.map(async (d) => {
                        if (d.name && d.artists?.length)
                            albums.push(`${d.name} ${d.artists.map(n => n.name).join(" ")}`);
                    });
                    return {
                        album: albums
                    };

                case 'track':
                    const response = await axios.get(`${this.baseUrl}${entityType}s/${entityId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    });
                    return `${response.data.name} ${response.data?.artists.map(n => n.name).join(" ")}`;
                
                case 'playlist':
                    const res_pl = await axios.get(`${this.baseUrl}${entityType}s/${entityId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    });
                    let playlists = [];
                    res_pl.data.tracks.items.map(async (d) => {
                        if (d.track?.name && d.track?.artists?.length)
                            playlists.push(`${d.track.name} ${d.track?.artists.map(n => n.name).join(" ")}`);
                    });
                    return {
                        playlist: playlists
                    };
                
                default:
                    return null;
            }
        } else {
            return null;
        }
    }

    
}

module.exports = Spotify;