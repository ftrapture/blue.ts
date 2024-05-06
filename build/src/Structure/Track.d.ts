import { Track } from "../Platforms/Spotify";
/**
 * TrackStructure class for structuring track information.
 */
declare class TrackStructure {
    /**
     * The token representing the track.
     */
    trackToken: string;
    /**
     * Information about the track.
     */
    info: {
        identifier: string | null | undefined;
        author: string | null | undefined;
        duration: number | null | undefined;
        isStream: boolean | null | undefined;
        title: string | null | undefined;
        thumbnail: string | null | undefined;
        uri: string | null | undefined;
        sourceName: string | null | undefined;
        position: number | null | undefined;
        isrc: string | number | null | undefined;
    };
    /**
     * The type of the track.
     */
    type: string;
    /**
     * Constructs a new TrackStructure instance.
     * @param track - The track object.
     */
    constructor(track: Track);
}
export default TrackStructure;
