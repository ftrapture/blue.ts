"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FilterManager = /** @class */ (function () {
    function FilterManager(player, options) {
        this.player = player;
        this.volume = 1.0;
        this.vaporwave = false;
        this.equalizer = [];
        this.nightcore = false;
        this.is8D = false;
        this.bassboost = 0;
        this.karaoke = (options === null || options === void 0 ? void 0 : options.karaoke) || null;
        this.timeScaler = (options === null || options === void 0 ? void 0 : options.timeScaler) || null;
        this.tremolo = (options === null || options === void 0 ? void 0 : options.tremolo) || null;
        this.vibrato = (options === null || options === void 0 ? void 0 : options.vibrato) || null;
        this.rotation = (options === null || options === void 0 ? void 0 : options.rotation) || null;
        this.distortion = (options === null || options === void 0 ? void 0 : options.distortion) || null;
        this.channelMix = (options === null || options === void 0 ? void 0 : options.channelMix) || null;
        this.lowPass = (options === null || options === void 0 ? void 0 : options.lowPass) || null;
    }
    FilterManager.prototype.setEqualizer = function (bands) {
        this.equalizer = bands;
        this.updateFilters();
        return this;
    };
    FilterManager.prototype.setKaraoke = function (settings) {
        this.karaoke = settings || null;
        this.updateFilters();
        return this;
    };
    FilterManager.prototype.setTimeScaler = function (scaler) {
        this.timeScaler = scaler || null;
        this.updateFilters();
        return this;
    };
    FilterManager.prototype.setTremolo = function (settings) {
        this.tremolo = settings || null;
        this.updateFilters();
        return this;
    };
    FilterManager.prototype.setBassboost = function () {
        if (!this.player)
            return this;
        var bands = [
            { band: 0, gain: 0.34 },
            { band: 1, gain: 0.34 },
            { band: 2, gain: 0.34 },
            { band: 3, gain: 0.34 },
        ];
        this.setEqualizer(bands);
        return this;
    };
    FilterManager.prototype.setNightcore = function (val) {
        if (!this.player)
            return;
        this.nightcore = val;
        this.setTimescale(val ? { rate: 1.5 } : null);
        if (val) {
            this.vaporwave = false;
        }
        return val;
    };
    FilterManager.prototype.setTimescale = function (timescale) {
        this.timeScaler = timescale || null;
        this.updateFilters();
        return this;
    };
    FilterManager.prototype.setVibrato = function (settings) {
        this.vibrato = settings || null;
        this.updateFilters();
        return this;
    };
    FilterManager.prototype.setRotation = function (settings) {
        this.rotation = settings || null;
        this.updateFilters();
        return this;
    };
    FilterManager.prototype.setDistortion = function (settings) {
        this.distortion = settings || null;
        this.updateFilters();
        return this;
    };
    FilterManager.prototype.setChannelMix = function (mixer) {
        this.channelMix = mixer || null;
        this.updateFilters();
        return this;
    };
    FilterManager.prototype.setLowPass = function (filter) {
        this.lowPass = filter || null;
        this.updateFilters();
        return this;
    };
    FilterManager.prototype.set8D = function (val) {
        if (!this.player)
            return;
        this.setRotation(val ? { rotationHz: 0.065 } : null);
        this.is8D = val;
        return this;
    };
    FilterManager.prototype.clearFilters = function () {
        this.vaporwave = false;
        this.equalizer = [];
        this.nightcore = false;
        this.is8D = false;
        this.bassboost = 0;
        this.karaoke = null;
        this.timeScaler = null;
        this.tremolo = null;
        this.vibrato = null;
        this.rotation = null;
        this.distortion = null;
        this.channelMix = null;
        this.lowPass = null;
        this.updateFilters();
        return this;
    };
    FilterManager.prototype.updateFilters = function () {
        if (!this.player || !this.player.blue || !this.player.blue.node || !this.player.blue.node.rest || !this.player.guildId) {
            throw new Error("Player or its properties are not properly initialized.");
        }
        var _a = this, volume = _a.volume, equalizer = _a.equalizer, karaoke = _a.karaoke, timeScaler = _a.timeScaler, tremolo = _a.tremolo, vibrato = _a.vibrato, rotation = _a.rotation, distortion = _a.distortion, channelMix = _a.channelMix, lowPass = _a.lowPass;
        this.player.blue.node.rest.updatePlayer({
            guildId: this.player.guildId,
            data: {
                filters: {
                    volume: volume,
                    equalizer: equalizer,
                    karaoke: karaoke,
                    timeScaler: timeScaler,
                    tremolo: tremolo,
                    vibrato: vibrato,
                    rotation: rotation,
                    distortion: distortion,
                    channelMix: channelMix,
                    lowPass: lowPass,
                }
            }
        });
    };
    return FilterManager;
}());
exports.default = FilterManager;
