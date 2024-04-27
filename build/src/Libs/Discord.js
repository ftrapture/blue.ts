"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Events_1 = __importDefault(require("../Utils/Events"));
class DiscordJs {
    blue;
    constructor(blue) {
        this.blue = blue;
        this.blue.client.on(Events_1.default.voiceStateUpdate, async (oS, nS) => {
            const player = this.blue.players.get(oS.guild.id);
            if (nS.id === this.blue.client.user.id && nS.id === oS.id && oS?.channelId && nS?.channelId && oS?.channelId !== nS?.channelId) {
                if (player) {
                    if (!player.connected) {
                        player.connect({ guildId: oS.guild.id, voiceChannel: nS?.channelId });
                    }
                    else
                        player.setVoiceChannel(nS?.channelId);
                }
            }
        });
        this.blue.client.on(Events_1.default.api, async (packet) => {
            await this.blue.voiceState.updateVoice(packet);
        });
    }
    send(data) {
        try {
            if (!data)
                throw new Error("Parameter of 'send' must be present.");
            return new Promise(async (resolve, reject) => {
                if (!this.blue.client)
                    return reject(data);
                const guild = await this.blue.client.guilds.fetch(data.d.guild_id).catch(() => null);
                if (guild) {
                    resolve(guild);
                    this.blue.client.ws.shards.get(guild.shardId).send(data);
                    this.blue.emit(Events_1.default.api, `[${String("DEBUG").Blue()}]: ${this.blue.options.host} ---> [${String("RECEIVED: SHARD PAYLOAD").Green()}] ---> ${String(`${JSON.stringify(data)}`).Yellow()}`);
                }
                else {
                    reject(guild);
                }
            });
        }
        catch (e) {
            throw new Error("Unable to send data to the guild.");
        }
    }
}
exports.default = DiscordJs;
//# sourceMappingURL=Discord.js.map