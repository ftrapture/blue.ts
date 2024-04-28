import { Track } from "../Platforms/Spotify";
declare class TrackStructure {
    trackToken: string;
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
    type: string;
    constructor(track: Track);
}
export default TrackStructure;
