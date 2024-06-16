"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * TrackStructure class for structuring track information.
 */
class TrackStructure {
    /**
     * The token representing the track.
     */
    encoded;
    /**
     * Information about the track.
     */
    info;
    /**
     * The type of the track.
     */
    type;
    /**
     * Constructs a new TrackStructure instance.
     * @param track - The track object.
     */
    constructor(track) {
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
        };
        this.type = track.type || "none";
    }
}
exports.default = TrackStructure;
//# sourceMappingURL=Track.js.map