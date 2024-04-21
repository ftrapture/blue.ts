const Discord = require("discord.js");
const { Blue, Util } = require("../");
const client = new Discord.Client({
    fetchAllMembers: true,
    failIfNotExists: false,
    allowedMentions: {
        parse: ['roles', 'users'],
        repliedUser: false,
    },
    partials: [
        'MESSAGE',
        'CHANNEL',
        'REACTION',
        'GUILD_MEMBER',
        'USER'
    ],
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_BANS,
        Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
        Discord.Intents.FLAGS.GUILD_WEBHOOKS,
        Discord.Intents.FLAGS.GUILD_INVITES,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    ],
    presence: {
        activities: [
            {
                name: 'ashton.gg',
                type: "LISTENING",
            },
        ],
        status: 'online',
    }
});
const nodes = [
    {
        host: "localhost",
        port: 6969,
        password: "Ares",
        secure: false
    }
];
const options = {
    spotify: {
        client_id: "c46d6ce4936c41c6979f6d00eb2a6dd2",
        client_secret: "30a6c17b7fd64d4485b68c651d21b72f"
    }
};
client.manager = new Blue(nodes, options);
client.on("ready", async () => {
    console.log("ok logged in")
    client.manager.init(client);
});
client.manager.on("nodeConnect", (a, b) => {
    console.log(b);
});
client.manager.on("nodeDisconnect", (a, b) => {
    console.log(b);
});
client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild || !message.channel) return;
    const prefix = ">";
    let player = client.manager.players.get(message.guild.id);
    if (!message.content.toLowerCase().startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const cmd = args.shift()?.toLowerCase();
    if (cmd == "play") {
        if (!message.member.voice.channel) return message.reply("you must be in a voice channel")
        const query = args.slice(0).join(" ");
        if (!query) return message.reply("provide the query");
        if(!player)
          player = await client.manager.create({
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channel.id,
            guildId: message.guild.id,
            selfDeaf: true,
            selfMute: false
          });
        const res = await client.manager.search({ query: query }, message.author);
        if (!res) return message.reply("song not found");
        if (res.loadType == "SPOTIFY_ALBUMS") {
            player.queue.add(res.tracks);
        } else if (res.loadType == "SPOTIFY_PLAYLISTS") {
            player.queue.add(res.tracks);
        } else {
            player.queue.add(res.tracks[0]);
        }
        if(!player.queue?.current)
            player.play();
        return message.reply("queued song")

    }
    if(cmd == "skip") {
        if(!player || !player.isConnected) return message.reply("player not initialized yet.");
        if(player.queue.size() < 1) {
        player.disconnect();
        return message.reply("there's no song to skip.");
        }
        player.stop();
        return message.reply("skipped to the next song.")
    }

    if(cmd == "stop") {
        if(!player || !player.isConnected) return message.reply("player not initialized yet.");
        player.disconnect();
         return message.reply("stopped the song, and left the vc"); 
    }

    if(cmd == "replay") { 
        if(!player || !player.queue.current) return message.reply("Nothing playing rn.");
        player.setSeek(0);
        return message.reply("alr playing from the beginning.")
    }

    if(cmd == "seek") {
        if(!args[0]) return message.reply("provide the position");
        if(!player || !player.queue.current) return message.reply("Nothing playing rn.");
        player.setSeek(args.slice(0).join(" "));
        return message.reply("alr player position sets to "+player.position);
    }
})
client.login("TOKEN")
