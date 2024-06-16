import Track from "./Track";
export interface Info {
    identifier: string;
    author: string;
    length?: number;
    duration?: number;
    isStream: boolean;
    isSeekable: boolean;
    title: string;
    artworkUrl: string | unknown;
    uri: string | unknown;
    sourceName: string;
    position: number;
    isrc: string | unknown;
}
interface SearchData {
    encoded: string;
    info: Info[];
    pluginInfo: any;
    userData: any;
}
interface Data {
    encoded?: string;
    info: Info | any;
    pluginInfo: any;
    userData?: any;
    tracks?: Track[];
}
declare class SearchLoader {
    loadType: string;
    data: Data | SearchData[] | {};
    constructor(searchData: any);
}
export default SearchLoader;
