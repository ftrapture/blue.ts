import axios from "axios";
import Queue from "../Manager/QueueManager";

class Spotify {
    public readonly blue: any;
    public readonly client_id: string | boolean;
    public readonly client_secret: string | boolean;
    public readonly base64Auth: string;
    public readonly baseUrl: string;
    public accessToken: string;
    public readonly queue: Queue;

    constructor(blue: any) {
        this.blue = blue;
        this.client_id = this.blue.options["spotify"]?.client_id || false;
        this.client_secret = this.blue.options["spotify"]?.client_secret || false;
        this.base64Auth = Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64');
        this.baseUrl = "https://api.spotify.com/v1/";
        this.accessToken = "";
        this.queue = new Queue();
        this.initialize();
    }
    
    async search(query: string, type: string = "track") {
        const response = await axios.get(
            `${this.baseUrl}search?q=${encodeURIComponent(query)}&type=${type}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                },
            }
        );
        return `${response.data.tracks.items[0].name} ${response.data?.tracks?.items[0]?.artists.map((n: any) => n.name).join(" ")}`;
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
    
    async getSpotifyEntityInfo(url: string) {
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
                    let albums: string[] = [];
                    res.data.tracks.items.map(async (d: any) => {
                        if (d.name && d.artists?.length)
                            albums.push(`${d.name} ${d.artists.map((n: any) => n.name).join(" ")}`);
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
                    return {
                        track: `${response.data.name} ${response.data?.artists.map((n: any) => n.name).join(" ")}`
                    };
                
                case 'playlist':
                    const res_pl = await axios.get(`${this.baseUrl}${entityType}s/${entityId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        },
                    });
                    let playlists: string[] = [];
                    res_pl.data.tracks.items.map(async (d: any) => {
                        if (d.track?.name && d.track?.artists?.length)
                            playlists.push(`${d.track.name} ${d.track?.artists.map((n: any) => n.name).join(" ")}`);
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

export default Spotify;