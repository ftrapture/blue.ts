import "../Utils/Color";
declare class VoiceUpdate {
    readonly blue: any;
    voice: {
        sessionId: string | null;
        token: string | null;
        endpoint: string | null;
    };
    channelId: string | null;
    guildId: string | null;
    muted: boolean | null;
    defeaned: boolean | null;
    readonly region: any;
    constructor(blue: any);
    updateVoice(packet: any): Promise<boolean>;
    setServerStateUpdate(guildData: any): void;
    setVoiceStateUpdate(data: any): any;
}
export default VoiceUpdate;
