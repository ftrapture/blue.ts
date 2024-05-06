import { client_name } from "../config.json";
import Events from "../Utils/Events";
import "../Utils/Color";
import { Blue } from "./Node";

/**
 * Guild options interface
 */
interface GuildOptions {
  session_id: string;
  channel_id: string | null;
  guild_id: string;
  self_mute: boolean;
  self_deaf: boolean;
}

/**
 * Voice update class
 */
class VoiceUpdate {
  /**
   * Instance of the blue client
   */
  public readonly blue: Blue;

  /**
   * Voice details
   */
  public voice: {
    sessionId: string | null;
    token: string | null;
    endpoint: string | null;
  };

  /**
   * Channel ID
   */
  public channelId: string | null;

  /**
   * Guild ID
   */
  public guildId: string | null;

  /**
   * Muted flag
   */
  public muted: boolean | null;

  /**
   * Deafened flag
   */
  public defeaned: boolean | null;

  /**
   * Region
   */
  public readonly region?: string | null;

  constructor(blue: Blue) {
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
  public async updateVoice(packet: any): Promise<boolean | void> {
    if (!("t" in packet) || !["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t)) return false;
    const player = this.blue.players.get(packet.d.guild_id);
    if (!player) return;
    if (packet.t === "VOICE_SERVER_UPDATE") {
      this.setVoiceStateUpdate(packet.d);
    }
    if (packet.t === "VOICE_STATE_UPDATE") {
      if (packet.d.user_id !== this.blue.client.user.id) return false;
      this.setServerStateUpdate(packet.d);
    }
  }

  /**
   * Set server state update
   * @param guildData - Guild options data
   */
  public setServerStateUpdate(guildData: GuildOptions): void {
    this.voice.sessionId = guildData.session_id;
    this.channelId = guildData.channel_id;
    this.guildId = guildData.guild_id;
    this.muted = guildData.self_mute || false;
    this.defeaned = guildData.self_deaf || false;
    this.blue.emit(Events.api, `[${String("DEBUG").Blue()}]: ${this.blue.options.host} ---> [${String("VOICE UPDATE").Yellow()}] ---> ${String(`Channel ID: ${this.channelId} Session ID: ${guildData.session_id} Guild ID: ${this.guildId}`).Yellow()}`);
  }

  /**
   * Set voice state update
   * @param data - Voice state data
   */
  public setVoiceStateUpdate(data: any): void {
    if (!data?.endpoint) return this.blue.emit(Events.nodeError, data, new Error(`${client_name} error :: Unable to fetch the endpoint to connect to the voice channel!`));
    if (!this.voice.sessionId) return this.blue.emit(Events.nodeError, this, new Error(`${client_name} error :: Unable to fetch the sessionId to connect to the voice channel!`));
    this.voice.token = data.token;
    this.voice.endpoint = data.endpoint;
    this.blue.node!.rest.updatePlayer({
      guildId: this.guildId!,
      data: { voice: this.voice },
    });
    this.blue.emit(Events.debug, this.blue.options.host, new Error(`${client_name} :: Voice State Updated | Region: ${this.region}, Guild ID: ${this.guildId}, Session ID: ${this.voice.sessionId}`));
  }
}

export default VoiceUpdate;
