const { client_name } = require("../config.json");
const Events = require("../Utils/Events");
class VoiceUpdate {
    constructor(blue) {
        this.blue = blue;
        this.voice = {
            sessionId: null,
            token: null,
            endpoint: null,
        };
        this.channelId = null;
        this.guildId = null;
        this.muted = null;
        this.defeaned = null;
    }
    async updateVoice(packet) {
        if (!"t" in packet || !["VOICE_STATE_UPDATE",
            "VOICE_SERVER_UPDATE"].includes(packet.t)) return false;
        const player = this.blue.players.get(packet.d.guild_id);
        if (!player) return;
        if (packet.t === "VOICE_SERVER_UPDATE") {
            this.setVoiceStateUpdate(packet.d);
        }
        if (packet.t === "VOICE_STATE_UPDATE") {
            if (packet.d.user_id !== this.blue.client.user.id) return;
            this.setServerStateUpdate(packet.d);
        }
    }
    setServerStateUpdate(guildData) {
        this.voice.sessionId = guildData.session_id;
        this.channelId = guildData.channel_id;
        this.guildId = guildData.guild_id;
        this.muted = guildData.self_mute || false;
        this.defeaned = guildData.self_deaf || false;
        this.blue.emit(Events.api, `[DEBUG]: ${this.blue.options.host} ---> [VOICE UPDATE] ---> Channel ID: ${this.channelId} Session ID: ${guildData.session_id} Guild ID: ${this.guildId}`);
    }
    setVoiceStateUpdate(data) {
        if (!data?.endpoint) return this.blue.emit(Events.nodeError, data, new Error(`${client_name} error :: Unable to fetch the endpoint to connect to the voice channel!`));
        if (!this.voice.sessionId) return this.blue.emit(Events.nodeError, this, new Error(`${client_name} error :: Unable to fetch the sessionId to connect to the voice channel!`));
        this.voice.token = data.token;
        this.voice.endpoint = data.endpoint;
        this.blue.node.rest.updatePlayer({
            guildId: this.guildId,
            data: { voice: this.voice },
        });
        this.blue.emit(Events.debug, this.blue.options.host, new Error(`${client_name} :: Voice State Updated | Region: ${this.region}, Guild ID: ${this.guildId}, Session ID: ${this.voice.sessionId}`))
    }
}

module["exports"] = VoiceUpdate;