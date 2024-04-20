const Node = require("./../Components/Node");
const { client_name, default_platform } = require("./../config.json");
let platform = {
    "youtube": "ytsearch",
    "youtube music": "ytmsearch",
    "soundcloud": "scsearch"
}, arr = ["youtube", "youtube music", "soundcloud"];
class Util {

    constructor(blue) {
        this.blue = blue;
    }

    checkParamsValidity(nodePackets, defaultPackets) {
        if (!nodePackets || nodePackets?.length < 1) throw new Error("Cannot validate the paramerters you passed in bluejs constructor.");
        for (let i in nodePackets) {
            if (!nodePackets[i]?.host || !nodePackets[i]?.password || !nodePackets[i]?.port || !Object.keys(nodePackets[i]).includes("secure")) throw new Error("You've passed invalid parameters in bluejs constructor.");
            this.blue.node = new Node(this.blue, nodePackets[i], defaultPackets);
            this.blue.node.connect();
        }
        if (defaultPackets?.defaultSearchEngine)
          if (defaultPackets?.defaultSearchEngine !== "youtube" || defaultPackets?.defaultSearchEngine !== "youtube music" || defaultPackets?.defaultSearchEngine !== "soundcloud") throw new Error("Available search engines are: youtube, youtube music, soundcloud or keep it blank.");
        this.blue.options = {
            host: nodePackets[0]?.host,
            password: nodePackets[0]?.password,
            port: nodePackets[0]?.port, 
            secure: nodePackets[0]?.secure,
            defaultSearchEngine: defaultPackets?.defaultSearchEngine ? (arr.includes(defaultPackets.defaultSearchEngine.toLowerCase()) === true ? platform[defaultPackets.defaultSearchEngine.toLowerCase()] : default_platform) || default_platform : default_platform,
            autoplay: defaultPackets?.autoplay || false
        };
        return this.blue.node;
    }

    checkObjectValidity(options){
        let { guildId, voiceChannel, textChannel } = options;
        if (!guildId)
            throw new Error(`Provide the proper guildId`);
        if (typeof guildId !== "string")
            throw new TypeError(`The option 'guildId' must not be non-string, but recieved '${typeof guildId}' type!`);
        if (!voiceChannel)
            throw new TypeError("Provide the proper VoiceChannel ID");
        if (typeof voiceChannel !== "string")
            throw new TypeError(
                `The option 'voiceChannel' must not be non-string, but recieved '${typeof voiceChannel}' type!`
            );
        if (!textChannel)
            throw new TypeError("Provide the proper TextChannel ID");
        if (typeof textChannel !== "string")
            throw new TypeError(
                `The option 'textChannel' must not be non-string, but recieved '${typeof textChannel}' type!`
            );
        return true;
    }

    durationInMs(time){
        if(!time && time !== 0) throw new RangeError("'time' parameter must be present and of string type with the value greater than 0.");
        const onlyInteger = parseInt(time);
        if(typeof time === "number") return Number(Math.floor(onlyInteger * 1000));
        if(Number.isNaN(onlyInteger)) throw new TypeError("Invalid time format, e.g: 2min")
        let units = ["weeks", "w", "ms", "s", "hrs", "days", "months", "years", "seconds", "miliseconds", "minutes", "hours", "d", "m", "y", "yrs"];
        const onlyString = this.timeString(time.toUpperCase()).trim();
        let get = "s";
        if(onlyString !== "")
          get = units.find(ar => ar.includes(onlyString));
        let result;
        if(get == "s" || get == "seconds") {
            result = Math.floor(onlyInteger * 1000);
        } else if(get == "minutes"){
            result = Math.floor(onlyInteger * (1000 * 60));
        } else if(get == "ms" || get == "miliseconds") {
            result = Math.floor(onlyInteger);
        } else if(get == "hrs" || get == "hours") {
            result = Math.floor(onlyInteger * (1000 * 60 * 60));
        } else if(get == "days" || get == "d") {
            result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24));
        } else if(get == "months" || get == "m") {
            result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24 * 30));
        } else if(get == "years" || get == "yrs") {
            result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24 * 365));
        } else if(get == "w" || get == "weeks") {
            result = Math.floor(onlyInteger * (1000 * 60 * 60 * 24 * 7));
        } else {
            result = Math.floor(onlyInteger * 1000);
        }
        return Number(result);
    }
    
    timeString(time){
        let string = "";
        for(let i = 0; i < time.length; i++) {
            const ch = time.charCodeAt(i);
            for(let j = 65; j <= 90; j++) {
                if(ch == j) string += String.fromCharCode(ch);
            }
        }
        return string.toLowerCase();
    }
}

module.exports = Util;