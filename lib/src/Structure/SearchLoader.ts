import Track from "./Track";

export interface Info {
    identifier: string,
    author: string,
    length?: number,
    duration?: number,
    isStream: boolean,
    isSeekable: boolean,
    title: string,
    artworkUrl: string | unknown,
    uri: string | unknown,
    sourceName: string,
    position: number,
    isrc: string | unknown,
}

interface SearchData {
    encoded: string,
    info: Info[],
    pluginInfo: any,
    userData: any
}

interface Data {
    encoded?: string,
    info: Info | any,
    pluginInfo: any,
    userData?: any,
    tracks?: Track[]
}

class SearchLoader {
    public loadType: string;
    public data: Data | SearchData[] | {};
    constructor(searchData: any) {
        this.loadType = searchData.loadType;
        if(Array.isArray(searchData.data)) 
            this.data = [...searchData.data];
        else {
            this.data = {};
            if(searchData.data.encoded) this.data["encoded"] = searchData.data.encoded;
            if(searchData.data.userData) this.data["userData"] = searchData.data.userData;
            if(searchData.data.tracks && Array.isArray(searchData.data.tracks)) this.data["tracks"] = [...searchData.data.tracks];
            this.data = {
                ...searchData.data
            }
        }
    }
}

export default SearchLoader;