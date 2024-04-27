"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FilterManager {
    player;
    volume;
    equalizer;
    karaoke;
    tremolo;
    vibrato;
    rotation;
    distortion;
    channelMix;
    lowPass;
    timeScaler;
    vaporwave;
    bassboost;
    is8D;
    nightcore;
    constructor(player, options) {
        this.player = player;
        this.volume = 1.0;
        this.vaporwave = false;
        this.equalizer = [];
        this.nightcore = false;
        this.is8D = false;
        this.bassboost = 0;
        this.karaoke = options?.karaoke || null;
        this.timeScaler = options?.timeScaler || null;
        this.tremolo = options?.tremolo || null;
        this.vibrato = options?.vibrato || null;
        this.rotation = options?.rotation || null;
        this.distortion = options?.distortion || null;
        this.channelMix = options?.channelMix || null;
        this.lowPass = options?.lowPass || null;
    }
    setEqualizer(bands) {
        this.equalizer = bands;
        this.updateFilters();
        return this;
    }
    setKaraoke(settings) {
        this.karaoke = settings || null;
        this.updateFilters();
        return this;
    }
    setTimeScaler(scaler) {
        this.timeScaler = scaler || null;
        this.updateFilters();
        return this;
    }
    setTremolo(settings) {
        this.tremolo = settings || null;
        this.updateFilters();
        return this;
    }
    setBassboost() {
        if (!this.player)
            return this;
        const bands = [
            { band: 0, gain: 0.34 },
            { band: 1, gain: 0.34 },
            { band: 2, gain: 0.34 },
            { band: 3, gain: 0.34 },
        ];
        this.setEqualizer(bands);
        return this;
    }
    setNightcore(val) {
        if (!this.player)
            return;
        this.nightcore = val;
        this.setTimescale(val ? { rate: 1.5 } : null);
        if (val) {
            this.vaporwave = false;
        }
        return val;
    }
    setTimescale(timescale) {
        this.timeScaler = timescale || null;
        this.updateFilters();
        return this;
    }
    setVibrato(settings) {
        this.vibrato = settings || null;
        this.updateFilters();
        return this;
    }
    setRotation(settings) {
        this.rotation = settings || null;
        this.updateFilters();
        return this;
    }
    setDistortion(settings) {
        this.distortion = settings || null;
        this.updateFilters();
        return this;
    }
    setChannelMix(mixer) {
        this.channelMix = mixer || null;
        this.updateFilters();
        return this;
    }
    setLowPass(filter) {
        this.lowPass = filter || null;
        this.updateFilters();
        return this;
    }
    set8D(val) {
        if (!this.player)
            return;
        this.setRotation(val ? { rotationHz: 0.065 } : null);
        this.is8D = val;
        return this;
    }
    clearFilters() {
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
    }
    updateFilters() {
        if (!this.player || !this.player.blue || !this.player.blue.node || !this.player.blue.node.rest || !this.player.guildId) {
            throw new Error("Player or its properties are not properly initialized.");
        }
        const { volume, equalizer, karaoke, timeScaler, tremolo, vibrato, rotation, distortion, channelMix, lowPass } = this;
        this.player.blue.node.rest.updatePlayer({
            guildId: this.player.guildId,
            data: {
                filters: {
                    volume, equalizer, karaoke, timeScaler, tremolo, vibrato, rotation, distortion, channelMix, lowPass,
                }
            }
        });
    }
}
exports.default = FilterManager;
//# sourceMappingURL=FilterManager.js.map