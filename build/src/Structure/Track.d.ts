import { Track } from "../Platforms/Spotify";
import { Info } from "./SearchLoader";
/**
 * TrackStructure class for structuring track information.
 */
declare class TrackStructure {
    /**
     * The token representing the track.
     */
    encoded: string | unknown;
    /**
     * Information about the track.
     */
    info: Info;
    /**
     * The type of the track.
     */
    type?: string;
    /**
     * Constructs a new TrackStructure instance.
     * @param track - The track object.
     */
    constructor(track: Track);
}
export default TrackStructure;
