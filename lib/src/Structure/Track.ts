import { Track } from "../Platforms/Spotify";
import { Info } from "./SearchLoader";
/**
 * TrackStructure class for structuring track information.
 */
class TrackStructure {
    /**
     * The token representing the track.
     */
    public encoded: string | unknown;

    /**
     * Information about the track.
     */
    public info: Info;

    /**
     * The type of the track.
     */
    public type?: string;

    /**
     * Constructs a new TrackStructure instance.
     * @param track - The track object.
     */
    constructor(track: Track) {
        this.encoded = track.encoded;
        this.info = {
            identifier: track.info.identifier,
            author: track.info.author,
            duration: track.info.length,
            artworkUrl: track.info.artworkUrl,
            isSeekable: track.info.isSeekable,
            uri: track.info.uri,
            isStream: track.info.isStream,
            sourceName: track.info.sourceName,
            position: track.info.position,
            isrc: track.info.isrc,
            title: track.info.title,
        }
        this.type = track.type || "none";
    }
}

export default TrackStructure;
