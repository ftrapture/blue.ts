"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LoadTypes;
(function (LoadTypes) {
    LoadTypes["LOAD_SP_ALBUMS"] = "SPOTIFY_ALBUMS";
    LoadTypes["LOAD_SP_PLAYLISTS"] = "SPOTIFY_PLAYLISTS";
    LoadTypes["LOAD_SP_TRACK"] = "SPOTIFY_TRACK";
    LoadTypes["LOAD_SP_ARTISTS"] = "SPOTIFY_ARTISTS";
    LoadTypes["LOAD_EMPTY"] = "empty";
    LoadTypes["LOAD_TRACK"] = "track";
    LoadTypes["LOAD_PLAYLIST"] = "playlist";
    LoadTypes["LOAD_SEARCH"] = "search";
    LoadTypes["LOAD_ERROR"] = "error";
})(LoadTypes || (LoadTypes = {}));
exports.default = LoadTypes;
