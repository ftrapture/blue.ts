"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = require("../config.json");
const Events_1 = __importDefault(require("../Utils/Events"));
require("../Utils/Color");
/**
 * Voice update class
 */
class VoiceUpdate {
    /**
     * Instance of the blue client
     */
    blue;
    /**
     * Voice details
     */
    voice;
    /**
     * Channel ID
     */
    channelId;
    /**
     * Guild ID
     */
    guildId;
    /**
     * Muted flag
     */
    muted;
    /**
     * Deafened flag
     */
    defeaned;
    /**
     * Region
     */
    region;
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
    /**
     * Update voice function
     * @param packet - Packet data
     * @returns Returns true if successful, otherwise false
     */
    async updateVoice(packet) {
        if (!("t" in packet) || !["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t))
            return false;
        const player = this.blue.players.get(packet.d.guild_id);
        if (!player)
            return;
        if (packet.t === "VOICE_SERVER_UPDATE") {
            this.setVoiceStateUpdate(packet.d);
        }
        if (packet.t === "VOICE_STATE_UPDATE") {
            if (packet.d.user_id !== this.blue.client.user.id)
                return false;
            this.setServerStateUpdate(packet.d);
        }
    }
    /**
     * Set server state update
     * @param guildData - Guild options data
     */
    setServerStateUpdate(guildData) {
        this.voice.sessionId = guildData.session_id;
        this.channelId = guildData.channel_id;
        this.guildId = guildData.guild_id;
        this.muted = guildData.self_mute || false;
        this.defeaned = guildData.self_deaf || false;
        this.blue.emit(Events_1.default.api, `[${String("DEBUG").Blue()}]: ${this.blue.options.host} ---> [${String("VOICE UPDATE").Yellow()}] ---> ${String(`Channel ID: ${this.channelId} Session ID: ${guildData.session_id} Guild ID: ${this.guildId}`).Yellow()}`);
    }
    /**
     * Set voice state update
     * @param data - Voice state data
     */
    setVoiceStateUpdate(data) {
        if (!data || !data.endpoint)
            return this.blue.emit(Events_1.default.nodeError, data, new Error(`${config_json_1.client_name} error :: Unable to fetch the endpoint to connect to the voice channel!`));
        if (!this.voice.sessionId)
            return this.blue.emit(Events_1.default.nodeError, this, new Error(`${config_json_1.client_name} error :: Unable to fetch the sessionId to connect to the voice channel!`));
        this.voice.token = data.token;
        this.voice.endpoint = data.endpoint;
        this.blue.node.rest.updatePlayer({
            guildId: this.guildId,
            data: { voice: this.voice },
        });
    }
}
exports.default = VoiceUpdate;
//# sourceMappingURL=voiceStateUpdate.js.map