import Libs from "./Libs";
interface Platform {
    [key: string]: string;
}
interface Options {
    guildId: string;
    voiceChannel: string;
    textChannel: string;
}
interface NodePacket {
    host: string;
    password: string;
    port: number;
    secure: boolean;
    version?: string;
}
interface DefaultPacket {
    library: Libs;
    defaultSearchEngine?: keyof Platform;
    autoplay?: boolean;
}
declare class Util {
    private blue;
    constructor(blue: any);
    checkParamsValidity<T extends DefaultPacket>(nodePackets: NodePacket[], defaultPackets: T): Promise<any>;
    checkObjectValidity<T extends Options>(options: T): boolean;
    durationInMs(time: string | number): number;
}
export default Util;
