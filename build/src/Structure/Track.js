"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TrackStructure {
    trackToken;
    info;
    type;
    constructor(track) {
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
        };
        this.type = track.type;
    }
}
exports.default = TrackStructure;
//# sourceMappingURL=Track.js.map