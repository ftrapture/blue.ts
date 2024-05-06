"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * FilterManager class
 */
class FilterManager {
    /**
     * Player instance
     */
    player;
    /**
     * Volume level
     */
    volume;
    /**
     * Equalizer configuration
     */
    equalizer;
    /**
     * Karaoke settings
     */
    karaoke;
    /**
     * Tremolo settings
     */
    tremolo;
    /**
     * Vibrato settings
     */
    vibrato;
    /**
     * Rotation settings
     */
    rotation;
    /**
     * Distortion settings
     */
    distortion;
    /**
     * Channel mixer settings
     */
    channelMix;
    /**
     * Low pass filter settings
     */
    lowPass;
    /**
     * Time scaler settings
     */
    timeScaler;
    /**
     * Vaporwave effect status
     */
    vaporwave;
    /**
     * Bass boost level
     */
    bassboost;
    /**
     * 8D effect status
     */
    is8D;
    /**
     * Nightcore effect status
     */
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
    /**
     * Set equalizer bands
     * @param bands - Array of BandConfiguration
     * @returns FilterManager instance
     */
    setEqualizer(bands) {
        this.equalizer = bands;
        this.updateFilters();
        return this;
    }
    /**
     * Set karaoke settings
     * @param settings - KaraokeSettings
     * @returns FilterManager instance
     */
    setKaraoke(settings) {
        this.karaoke = settings || null;
        this.updateFilters();
        return this;
    }
    /**
     * Set time scaler settings
     * @param scaler - TimeScaler
     * @returns FilterManager instance
     */
    setTimeScaler(scaler) {
        this.timeScaler = scaler || null;
        this.updateFilters();
        return this;
    }
    /**
     * Set tremolo settings
     * @param settings - TremoloSettings
     * @returns FilterManager instance
     */
    setTremolo(settings) {
        this.tremolo = settings || null;
        this.updateFilters();
        return this;
    }
    /**
     * Set nightcore effect
     * @param val - Nightcore status
     * @returns Nightcore status
     */
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
    /**
     * Set time scale settings
     * @param timescale - TimeScaler
     * @returns FilterManager instance
     */
    setTimescale(timescale) {
        this.timeScaler = timescale || null;
        this.updateFilters();
        return this;
    }
    /**
     * Set vibrato settings
     * @param settings - VibratoSettings
     * @returns FilterManager instance
     */
    setVibrato(settings) {
        this.vibrato = settings || null;
        this.updateFilters();
        return this;
    }
    /**
     * Set rotation settings
     * @param settings - RotationSettings
     * @returns FilterManager instance
     */
    setRotation(settings) {
        this.rotation = settings || null;
        this.updateFilters();
        return this;
    }
    /**
     * Set distortion settings
     * @param settings - DistortionSettings
     * @returns FilterManager instance
     */
    setDistortion(settings) {
        this.distortion = settings || null;
        this.updateFilters();
        return this;
    }
    /**
     * Set channel mix settings
     * @param mixer - ChannelMixer
     * @returns FilterManager instance
     */
    setChannelMix(mixer) {
        this.channelMix = mixer || null;
        this.updateFilters();
        return this;
    }
    /**
     * Set low pass filter settings
     * @param filter - LowPassFilter
     * @returns FilterManager instance
     */
    setLowPass(filter) {
        this.lowPass = filter || null;
        this.updateFilters();
        return this;
    }
    /**
     * Set 8D effect
     * @param val - 8D status
     * @returns 8D status
     */
    set8D(val) {
        if (!this.player)
            return;
        this.setRotation(val ? { rotationHz: 0.065 } : null);
        this.is8D = val;
        return this;
    }
    /**
     * Clear all filters
     * @returns FilterManager instance
     */
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
    /**
     * Update filters
     */
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