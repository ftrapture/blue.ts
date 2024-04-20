class Track {
constructor(track = {}){
    this.trackToken = track.encoded;
    this.info = { ...track.info };
    this.info.thumbnail = track.info.uri.includes("youtube")
        ? `https://img.youtube.com/vi/${track.info.identifier}/default.jpg`
        : null,
    this.info.duration = track.info.length;
    delete this.info.length;
}
}

module.exports = Track;