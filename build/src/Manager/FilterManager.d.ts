import { Player } from "../Blue";
/**
 * Configuration for each band in the equalizer
 */
interface BandConfiguration {
    band: number;
    gain: number;
}
/**
 * Settings for karaoke effect
 */
interface KaraokeSettings {
    level: number;
    monoLevel: number;
    filter: BandConfiguration;
    filterWidth: number;
}
/**
 * Settings for time scaling
 */
interface TimeScaler {
    speed?: number;
    pitch?: number;
    rate?: number;
}
/**
 * Settings for tremolo effect
 */
interface TremoloSettings {
    frequency: number;
    depth: number;
}
/**
 * Settings for vibrato effect
 */
interface VibratoSettings {
    frequency: number;
    depth: number;
}
/**
 * Settings for rotation effect
 */
interface RotationSettings {
    rotationHz: number;
}
/**
 * Settings for distortion effect
 */
interface DistortionSettings {
    sinOffset?: number;
    sinScale?: number;
    cosOffset?: number;
    cosScale?: number;
    tanOffset?: number;
    tanScale?: number;
    offset?: number;
    scale?: number;
}
/**
 * Mixer settings for channel
 */
interface ChannelMixer {
    leftToLeft?: number;
    leftToRight?: number;
    rightToLeft?: number;
    rightToRight?: number;
}
/**
 * Low pass filter settings
 */
interface LowPassFilter {
    smoothing: number;
}
/**
 * Options for various filters
 */
export interface FilterOptions {
    volume: number;
    equalizer: BandConfiguration[];
    karaoke: KaraokeSettings;
    tremolo: TremoloSettings;
    vibrato: VibratoSettings;
    rotation: RotationSettings;
    distortion: DistortionSettings;
    channelMix: ChannelMixer;
    lowPass: LowPassFilter;
    timeScaler: TimeScaler;
}
/**
 * FilterManager class
 */
declare class FilterManager {
    /**
     * Player instance
     */
    player: Player;
    /**
     * Volume level
     */
    volume: number;
    /**
     * Equalizer configuration
     */
    equalizer: BandConfiguration[];
    /**
     * Karaoke settings
     */
    karaoke: KaraokeSettings;
    /**
     * Tremolo settings
     */
    tremolo: TremoloSettings;
    /**
     * Vibrato settings
     */
    vibrato: VibratoSettings;
    /**
     * Rotation settings
     */
    rotation: RotationSettings;
    /**
     * Distortion settings
     */
    distortion: DistortionSettings;
    /**
     * Channel mixer settings
     */
    channelMix: ChannelMixer;
    /**
     * Low pass filter settings
     */
    lowPass: LowPassFilter;
    /**
     * Time scaler settings
     */
    timeScaler: TimeScaler;
    /**
     * Vaporwave effect status
     */
    vaporwave: boolean;
    /**
     * Bass boost level
     */
    bassboost: number;
    /**
     * 8D effect status
     */
    is8D: boolean;
    /**
     * Nightcore effect status
     */
    nightcore: boolean;
    constructor(player: any, options?: FilterOptions);
    /**
     * Set equalizer bands
     * @param bands - Array of BandConfiguration
     * @returns FilterManager instance
     */
    setEqualizer(bands: BandConfiguration[]): FilterManager;
    /**
     * Set karaoke settings
     * @param settings - KaraokeSettings
     * @returns FilterManager instance
     */
    setKaraoke(settings?: KaraokeSettings): FilterManager;
    /**
     * Set time scaler settings
     * @param scaler - TimeScaler
     * @returns FilterManager instance
     */
    setTimeScaler(scaler?: TimeScaler): FilterManager;
    /**
     * Set tremolo settings
     * @param settings - TremoloSettings
     * @returns FilterManager instance
     */
    setTremolo(settings?: TremoloSettings): FilterManager;
    /**
     * Set nightcore effect
     * @param val - Nightcore status
     * @returns Nightcore status
     */
    setNightcore(val: boolean): boolean;
    /**
     * Set time scale settings
     * @param timescale - TimeScaler
     * @returns FilterManager instance
     */
    setTimescale(timescale?: TimeScaler): FilterManager;
    /**
     * Set vibrato settings
     * @param settings - VibratoSettings
     * @returns FilterManager instance
     */
    setVibrato(settings?: VibratoSettings): FilterManager;
    /**
     * Set rotation settings
     * @param settings - RotationSettings
     * @returns FilterManager instance
     */
    setRotation(settings?: RotationSettings): FilterManager;
    /**
     * Set distortion settings
     * @param settings - DistortionSettings
     * @returns FilterManager instance
     */
    setDistortion(settings?: DistortionSettings): FilterManager;
    /**
     * Set channel mix settings
     * @param mixer - ChannelMixer
     * @returns FilterManager instance
     */
    setChannelMix(mixer?: ChannelMixer): FilterManager;
    /**
     * Set low pass filter settings
     * @param filter - LowPassFilter
     * @returns FilterManager instance
     */
    setLowPass(filter?: LowPassFilter): FilterManager;
    /**
     * Set 8D effect
     * @param val - 8D status
     * @returns 8D status
     */
    set8D(val: boolean): this;
    /**
     * Clear all filters
     * @returns FilterManager instance
     */
    clearFilters(): FilterManager;
    /**
     * Update filters
     */
    updateFilters(): void;
}
export default FilterManager;
