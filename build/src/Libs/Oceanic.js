"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Events_1 = __importDefault(require("../Utils/Events"));
class OceanicJs {
    blue;
    constructor(blue) {
        this.blue = blue;
        this.blue.client.on("packet", async (packet) => {
            await this.blue.voiceState.updateVoice(packet);
        });
    }
    send(data) {
        try {
            if (!data)
                throw new Error("Parameter of 'send' must be present.");
            return new Promise((resolve, reject) => {
                if (!this.blue.client)
                    return reject(data);
                const guild = this.blue.client.guilds.get(data.d.guild_id);
                if (guild) {
                    resolve(guild);
                    guild.shard.send(data?.op, data?.d);
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
exports.default = OceanicJs;
//# sourceMappingURL=Oceanic.js.map