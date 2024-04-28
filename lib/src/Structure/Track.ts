import { Track } from "../Platforms/Spotify";

class TrackStructure {
    public trackToken: string;
    public info: {
        identifier: string | null | undefined,
        author: string | null | undefined,
        duration: number | null | undefined,
        isStream: boolean | null | undefined,
        title: string | null | undefined,
        thumbnail: string | null | undefined,
        uri: string | null | undefined,
        sourceName: string | null | undefined,
        position: number | null | undefined,
        isrc: string | number | null | undefined,
    };
    public type: string;
    constructor(track: Track) {
        this.trackToken = track.encoded;
        this.info = {
            identifier: track.info.identifier,
            author: track.info.author,
            duration: track.info.length,
            thumbnail: track.info.artworkUrl,
            uri: track.info.uri,
            isStream: track.info.isStream,
            sourceName: track.info.sourceName,
            position: track.info.position,
            isrc: track.info.isrc,
            title: track.info.title,

        }
        this.type = track.type;
    }
}

export default TrackStructure;