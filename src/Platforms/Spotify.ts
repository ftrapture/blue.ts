import axios from "axios";
import Queue from "../Manager/QueueManager";

interface Track {
    trackToken: string | null,
    info: {
        identifier: string | null | undefined,
        author: string | null | undefined,
        length: number | null | undefined,
        isStream: boolean | null | undefined,
        title: string | null | undefined,
        uri: string | null | undefined,
        sourceName: string | null | undefined,
        position: number | null | undefined,
        artworkUrl: string | null | undefined,
        isrc: string | number | null | undefined,
    },
    pluginInfo: any,
    type: string,
    userData: any
}

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
                    let albums: any[] = [];
                    res.data.tracks.items.map(async (d: any) => {
                        if (d.name && d.artists?.length)
                            albums.push(this.buildTrack({
                                title: `${d.name}`,
                                author: `${d.artists.map((n: any) => n.name).join(" ")}`,
                                id: d.id,
                                isrc: null,
                                duration: d.duration_ms,
                                url: d.external_urls.spotify,
                                type: "album"
                            }));
                    });
                    return {
                        name: res.data.name,
                        type: "album_track",
                        url: res.data.external_urls.spotify,
                        length: albums.length,
                        items: albums
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
                    let playlists: any[] = [];
                    res_pl.data.tracks.items.map(async (d: any) => {
                        if (d.track?.name && d.track?.artists?.length)
                            playlists.push(this.buildTrack({
                            title: `${d.track.name}`,
                            author: `${d.track?.artists.map((n: any) => n.name).join(", ")}`,
                            id: d.track.id,
                            isrc: d.track.external_ids.isrc,
                            duration: d.track.duration_ms,
                            url: d.track.external_urls.spotify,
                            type: "playlist_track"
                        }));
                    });
                    return {
                        name: res_pl.data.name,
                        type: "playlist",
                        description: res_pl.data.description,
                        url: res_pl.data.external_urls.spotify,
                        owner: {
                            name: res_pl.data.owner.display_name,
                            id: res_pl.data.owner.id,
                            url: res_pl.data.owner.external_urls.spotify
                        },
                        followers: res_pl.data.followers.total,
                        length: playlists.length,
                        items: playlists
                    };
                
                default:
                    return null;
            }
        } else {
            return null;
        }
    }

    buildTrack(track: any): Track {
        return {
            trackToken: null,
            info: {
                identifier: track?.id || null,
                author: track?.author || null,
                length: track?.duration || null,
                isStream: false,
                title: track?.title || null,
                uri: track?.url || null,
                sourceName: "spotify",
                position: 0,
                artworkUrl: null,
                isrc: track?.isrc || null,
            },
            pluginInfo: {
                save_uri: null
            },
            type: track.type,
            userData: {}
        }
    }
    
}

export default Spotify;