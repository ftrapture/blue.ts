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

class FilterManager {
    public player: Player;
    public volume: number;
    public equalizer: BandConfiguration[];
    public karaoke: KaraokeSettings;
    public tremolo: TremoloSettings;
    public vibrato: VibratoSettings;
    public rotation: RotationSettings;
    public distortion: DistortionSettings;
    public channelMix: ChannelMixer;
    public lowPass: LowPassFilter;
    public timeScaler: TimeScaler;
    public vaporwave: boolean;
    public bassboost: number;
    public is8D: boolean;
    public nightcore: boolean;
    
    constructor(player: Player, options?: FilterOptions) {
        this.player = player;
        this.volume = 1.12;
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

    public setEqualizer(bands: BandConfiguration[]): FilterManager {
        this.equalizer = bands;
        this.updateFilters();
        return this;
    }

    public setKaraoke(settings?: KaraokeSettings): FilterManager {
        this.karaoke = settings || null;
        this.updateFilters();
        return this;
    }

    public setTimeScaler(scaler?: TimeScaler): FilterManager {
        this.timeScaler = scaler || null;
        this.updateFilters();
        return this;
    }

    public setTremolo(settings?: TremoloSettings): FilterManager {
        this.tremolo = settings || null;
        this.updateFilters();
        return this;
    }

    public setBassboost(val: number): this {
        if (!this.player) return this;
        if (val < 0 || val > 6) throw new Error('Bassboost value must be between 0 and 6');
    
        this.bassboost = val;
    
        const sinBassboost = Math.sin(val * (Math.PI / 6));
        const cosBassboost = Math.cos(val * (Math.PI / 6));
        const tanBassboost = Math.tan(val * (Math.PI / 6));
    
        const smoothBassboost = (sinBassboost + cosBassboost + tanBassboost) / 3;
    
        const bands: BandConfiguration[] = Array(13).fill(0).map((n, i) => ({
            band: i,
            gain: smoothBassboost 
        }));
    
        this.setEqualizer(bands);
        return this;
    }
    

    setNightcore(val: boolean) {
        if (!this.player) return;
        this.nightcore = val;

        this.setTimescale(val ? { rate: 1.5 } : null);
        if (val) {
            this.vaporwave = false;
        }
        return val;
    }

    public setTimescale(timescale?: TimeScaler): FilterManager {
        this.timeScaler = timescale || null;
        this.updateFilters();
        return this;
    }

    public setVibrato(settings?: VibratoSettings): FilterManager {
        this.vibrato = settings || null;
        this.updateFilters();
        return this;
    }

    public setRotation(settings?: RotationSettings): FilterManager {
        this.rotation = settings || null;
        this.updateFilters();
        return this;
    }

    public setDistortion(settings?: DistortionSettings): FilterManager {
        this.distortion = settings || null;
        this.updateFilters();
        return this;
    }

    public setChannelMix(mixer?: ChannelMixer): FilterManager {
        this.channelMix = mixer || null;
        this.updateFilters();
        return this;
    }

    public setLowPass(filter?: LowPassFilter): FilterManager {
        this.lowPass = filter || null;
        this.updateFilters();
        return this;
    }

    public set8D(val: boolean) {
        if (!this.player) return;
        this.setRotation(val ? { rotationHz: 0.065 } : null);
        this.is8D = val;
        return this;
    }

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