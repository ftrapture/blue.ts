import Events from "../Utils/Events";

class DiscordJs {
    public blue: any;
    constructor(blue: any) {
        this.blue = blue;
        this.blue.client.on(Events.voiceStateUpdate, async (oS: any, nS: any) => {
            const player = this.blue.players.get(oS.guild.id);
            if (nS.id === this.blue.client.user.id && nS.id === oS.id && oS?.channelId && nS?.channelId && oS?.channelId !== nS?.channelId) {
              if (player) {
                if (!player.connected) {
                  player.connect({ guildId: oS.guild.id, voiceChannel: nS?.channelId });
                } else
                  player.setVoiceChannel(nS?.channelId);
              }
            }
          });
          this.blue.client.on(Events.api, async (packet: any) => {
            await this.blue.voiceState.updateVoice(packet);
          });
    }
    public send(data: any): any {
        try {
            if (!data) throw new Error("Parameter of 'send' must be present.")
            return new Promise(async (resolve, reject) => {
                if (!this.blue.client) return reject(data);
                const guild = await this.blue.client.guilds.fetch(data.d.guild_id).catch(() => null);
                if (guild) {
                    resolve(guild);
                    this.blue.client.ws.shards.get(guild.shardId).send(data);
                    this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.blue.options.host} ---> [${String("RECEIVED: SHARD PAYLOAD").Green()}] ---> ${String(`${JSON.stringify(data)}`).Yellow()}`);
                } else {
                    reject(guild);
                }
            });
        } catch (e) {
            throw new Error("Unable to send data to the guild.");
        }
    }

}

export default DiscordJs;