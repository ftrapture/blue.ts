"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SearchLoader {
    loadType;
    data;
    constructor(searchData) {
        this.loadType = searchData.loadType;
        if (Array.isArray(searchData.data))
            this.data = [...searchData.data];
        else {
            this.data = {};
            if (searchData.data.encoded)
                this.data["encoded"] = searchData.data.encoded;
            if (searchData.data.userData)
                this.data["userData"] = searchData.data.userData;
            if (searchData.data.tracks && Array.isArray(searchData.data.tracks))
                this.data["tracks"] = [...searchData.data.tracks];
            this.data = {
                ...searchData.data
            };
        }
    }
}
exports.default = SearchLoader;
//# sourceMappingURL=SearchLoader.js.map