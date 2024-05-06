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
class FilterManager {
    /**
     * Player instance
     */
    public player: Player;

    /**
     * Volume level
     */
    public volume: number;

    /**
     * Equalizer configuration
     */
    public equalizer: BandConfiguration[];

    /**
     * Karaoke settings
     */
    public karaoke: KaraokeSettings;

    /**
     * Tremolo settings
     */
    public tremolo: TremoloSettings;

    /**
     * Vibrato settings
     */
    public vibrato: VibratoSettings;

    /**
     * Rotation settings
     */
    public rotation: RotationSettings;

    /**
     * Distortion settings
     */
    public distortion: DistortionSettings;

    /**
     * Channel mixer settings
     */
    public channelMix: ChannelMixer;

    /**
     * Low pass filter settings
     */
    public lowPass: LowPassFilter;

    /**
     * Time scaler settings
     */
    public timeScaler: TimeScaler;

    /**
     * Vaporwave effect status
     */
    public vaporwave: boolean;

    /**
     * Bass boost level
     */
    public bassboost: number;

    /**
     * 8D effect status
     */
    public is8D: boolean;

    /**
     * Nightcore effect status
     */
    public nightcore: boolean;
    
    constructor(player: any, options?: FilterOptions) {
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
    public setEqualizer(bands: BandConfiguration[]): FilterManager {
        this.equalizer = bands;
        this.updateFilters();
        return this;
    }

    /**
     * Set karaoke settings
     * @param settings - KaraokeSettings
     * @returns FilterManager instance
     */
    public setKaraoke(settings?: KaraokeSettings): FilterManager {
        this.karaoke = settings || null;
        this.updateFilters();
        return this;
    }

    /**
     * Set time scaler settings
     * @param scaler - TimeScaler
     * @returns FilterManager instance
     */
    public setTimeScaler(scaler?: TimeScaler): FilterManager {
        this.timeScaler = scaler || null;
        this.updateFilters();
        return this;
    }

    /**
     * Set tremolo settings
     * @param settings - TremoloSettings
     * @returns FilterManager instance
     */
    public setTremolo(settings?: TremoloSettings): FilterManager {
        this.tremolo = settings || null;
        this.updateFilters();
        return this;
    }

    /**
     * Set nightcore effect
     * @param val - Nightcore status
     * @returns Nightcore status
     */
    setNightcore(val: boolean) {
        if (!this.player) return;
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
    public setTimescale(timescale?: TimeScaler): FilterManager {
        this.timeScaler = timescale || null;
        this.updateFilters();
        return this;
    }

    /**
     * Set vibrato settings
     * @param settings - VibratoSettings
     * @returns FilterManager instance
     */
    public setVibrato(settings?: VibratoSettings): FilterManager {
        this.vibrato = settings || null;
        this.updateFilters();
        return this;
    }

    /**
     * Set rotation settings
     * @param settings - RotationSettings
     * @returns FilterManager instance
     */
    public setRotation(settings?: RotationSettings): FilterManager {
        this.rotation = settings || null;
        this.updateFilters();
        return this;
    }

    /**
     * Set distortion settings
     * @param settings - DistortionSettings
     * @returns FilterManager instance
     */
    public setDistortion(settings?: DistortionSettings): FilterManager {
        this.distortion = settings || null;
        this.updateFilters();
        return this;
    }

    /**
     * Set channel mix settings
     * @param mixer - ChannelMixer
     * @returns FilterManager instance
     */
    public setChannelMix(mixer?: ChannelMixer): FilterManager {
        this.channelMix = mixer || null;
        this.updateFilters();
        return this;
    }

    /**
     * Set low pass filter settings
     * @param filter - LowPassFilter
     * @returns FilterManager instance
     */
    public setLowPass(filter?: LowPassFilter): FilterManager {
        this.lowPass = filter || null;
        this.updateFilters();
        return this;
    }

    /**
     * Set 8D effect
     * @param val - 8D status
     * @returns 8D status
     */
    public set8D(val: boolean) {
        if (!this.player) return;
        this.setRotation(val ? { rotationHz: 0.065 } : null);
        this.is8D = val;
        return this;
    }

    /**
     * Clear all filters
     * @returns FilterManager instance
     */
    public clearFilters(): FilterManager {
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
    public updateFilters(): void {
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

export default FilterManager;
