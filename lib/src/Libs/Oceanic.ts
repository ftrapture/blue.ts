import Events from "../Utils/Events";
import { Blue } from "../Connectors/Node";

/**
 * OceanicJs class
 */
class OceanicJs {
  /**
   * Instance of the blue client
   */
  public blue: Blue;

  constructor(blue: Blue) {
    this.blue = blue;
    this.blue.client.on("packet", async (packet: any) => {
      await this.blue.voiceState.updateVoice(packet);
    });
  }

  /**
   * Send function to send data
   * @param data - Data to send
   * @returns Promise<any>
   */
  public send(data: any): any {
    try {
      if (!data) throw new Error("Parameter of 'send' must be present.")
      return new Promise((resolve, reject) => {
        if (!this.blue.client) return reject(data);
        const guild = this.blue.client.guilds.get(data.d.guild_id);
        if (guild) {
          resolve(guild);
          guild.shard.send(data?.op, data?.d);
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

export default OceanicJs;
