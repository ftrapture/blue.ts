interface Player {
    blue: any;
    volume: number;
    playing: boolean;
    queue: any;
    position: number;
    connected: boolean;
    paused: boolean;
    createdTimestamp: number;
    createdAt: Date;
    guildId: string | null;
    voiceChannel: string | null;
    textChannel: string | null;
    selfDeaf: boolean;
    selfMute: boolean;
    options: any;
    loop: any;
    event: any;
}
interface BandConfiguration {
    band: number;
    gain: number;
}
interface KaraokeSettings {
    level: number;
    monoLevel: number;
    filter: BandConfiguration;
    filterWidth: number;
}
interface TimeScaler {
    speed?: number;
    pitch?: number;
    rate?: number;
}
interface TremoloSettings {
    frequency: number;
    depth: number;
}
interface VibratoSettings {
    frequency: number;
    depth: number;
}
interface RotationSettings {
    rotationHz: number;
}
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
interface ChannelMixer {
    leftToLeft?: number;
    leftToRight?: number;
    rightToLeft?: number;
    rightToRight?: number;
}
interface LowPassFilter {
    smoothing: number;
}
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
declare class FilterManager {
    player: Player;
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
    vaporwave: boolean;
    bassboost: number;
    is8D: boolean;
    nightcore: boolean;
    constructor(player: Player, options?: FilterOptions);
    setEqualizer(bands: BandConfiguration[]): FilterManager;
    setKaraoke(settings?: KaraokeSettings): FilterManager;
    setTimeScaler(scaler?: TimeScaler): FilterManager;
    setTremolo(settings?: TremoloSettings): FilterManager;
    setBassboost(): this;
    setNightcore(val: boolean): boolean;
    setTimescale(timescale?: TimeScaler): FilterManager;
    setVibrato(settings?: VibratoSettings): FilterManager;
    setRotation(settings?: RotationSettings): FilterManager;
    setDistortion(settings?: DistortionSettings): FilterManager;
    setChannelMix(mixer?: ChannelMixer): FilterManager;
    setLowPass(filter?: LowPassFilter): FilterManager;
    set8D(val: boolean): this;
    clearFilters(): FilterManager;
    updateFilters(): void;
}
export default FilterManager;
