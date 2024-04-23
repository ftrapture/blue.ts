//test bot src

const { Client, Intents } = require("discord.js");
const { Blue, Events, Types, Library } = require("blue.ts");

const client = new Client({
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
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  ],
  presence: {
    activities: [
      {
        name: 'Blue.js',
        type: "LISTENING",
      },
    ],
    status: 'online',
  }
});

const nodes = [
  {
    host: "localhost",
    port: 2333,
    password: "youshallnotpass",
    secure: false
  }
];

const options = {
  spotify: {
    client_id: "CLIENT_ID",  //spotify client ID
    client_secret: "CLIENT_SECRET" //spotify client Secret
  },
  autoplay: true,
  version: "v4",
  library: Library.DiscordJs
};
client.manager = new Blue(nodes, options);

client.on("ready", async () => {
  console.log("Client is ready!");
  client.manager.init(client);
});

client.manager.on(Events.nodeConnect, (a, b) => {
  console.log(b);
});

client.manager.on(Events.nodeDisconnect, (a, b) => {
  console.log(b);
});

client.manager.on(Events.trackStart, async(a, b) => {
   const guild = await client.guilds.fetch(a.guildId).catch(() => null);
   if(!guild) return;
   const channel = await guild.channels.fetch(a.textChannel).catch(() => null);
   if(!channel) return;
   return channel.send(`Track Started: [${b.title}](${b.uri})`);
});

//logging
/*
client.manager.on(Events.api, (data) => {
  console.log(data);
});*/

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild || !message.channel) return;

  const prefix = ">";
  let player = client.manager.players.get(message.guild.id);

  if (!message.content.toLowerCase().startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd == "play") {
    if (!message.member?.voice.channel) return message.reply("you must be in a voice channel");

    const query = args.slice(0).join(" ");

    if (!query) return message.reply("provide the query");

    if (!player)
      player = await client.manager.create({
        voiceChannel: message.member.voice.channel.id,
        textChannel: message.channel.id,
        guildId: message.guild.id,
        selfDeaf: true,
        selfMute: false
      });

    const res = await client.manager.search({ query: query }, message.author).catch(() => null);
    if (!res) return message.reply("song not found");
    if (res.loadType == Types.LOAD_SP_ALBUMS || res.loadType == Types.LOAD_SP_PLAYLISTS) {
      player.queue.add(...res.tracks);
    } else {
      player.queue.add(res.tracks[0]);
    }
    if (!player.queue?.current)
      player.play();
    return message.reply("queued song");
  }

  if (cmd == "skip") {
    if (!player || !player.isConnected) return message.reply("player not initialized yet.");
    if (player.queue.size() < 1 && !player.playing) {
      player.disconnect();
      return message.reply("there's no song to skip.");
    }
    player.stop();
    return message.reply("skipped to the next song.");
  }

  if (cmd == "stop") {
    if (!player || !player.isConnected) return message.reply("player not initialized yet.");
    player.disconnect();
    return message.reply("stopped the song, and left the vc");
  }

  if (cmd == "replay") {
    if (!player || !player.queue.current) return message.reply("Nothing playing rn.");
    player.seek(0);
    return message.reply("alr playing from the beginning.");
  }

  if (cmd == "seek") {
    if (!args[0]) return message.reply("provide the position");
    if (!player || !player.queue.current) return message.reply("Nothing playing rn.");
    player.seek(args.slice(0).join(" "));
    return message.reply("alr player position sets to " + player.position);
  }

  if (cmd == "8d") {
    if (!player || !player.queue.current) return message.reply("Nothing playing rn.");
    if(player.filter.is8D)
      player.filter.set8D(false);
    else
      player.filter.set8D(true);
    return message.reply(`filter has been added`);
  }
  
  if (cmd == "clear") {
    if (!player || !player.queue.current) return message.reply("Nothing playing rn.");
    player.filter.clearFilters();
    return message.reply(`filters has been cleared`);
  }
});

client.login("BOT_TOKEN"); //Discord Bot Token
