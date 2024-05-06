<div align="center">
 <img src="https://raw.githubusercontent.com/ftrapture/blue.ts/main/assets/banner.png" alt="Blue.ts Banner" width="800">
 <h1>Blue.ts</h1>
 <p>A powerful, simple, and effective stable Lavalink client developed in TypeScript.</p>
 <p>
   <a href="#features">Features</a>
   •
   <a href="#requirements">Requirements</a>
   •
   <a href="#installation">Installation</a>
   •
   <a href="#quickstart">Quick Start</a>
   •
   <a href="#documentation">Documentation</a>
   •
   <a href="#issues">Issues</a>
   •
   <a href="#license">License</a>
 </p>
 <br>
</div>
<br>
<div>
 <h2 id="features">✨ Features</h2>
 <ul>
   <li>💿 Audio playback with fully-featured controls</li>
   <li>🎚️ Filters support</li>
   <li>🔍 Best search engines: YouTube, Spotify, SoundCloud</li>
   <li>🔄 Advanced autoplay feature</li>
   <li>⚡ Faster, simple, and stable client</li>
   <li>🆙 Supports the latest Lavalink version: 4.0.4</li>
   <li>🌐 Compatible with discord.js, eris, oceanicjs</li>
   <li>🔌 Plugins support</li>
 </ul>
</div>
<br>
<div>
 <h2 id="requirements">⚙️ Requirements</h2>
 <ul>
   <li><a href="https://nodejs.org/en/download">Node.js</a> Version: >= 16.9.0</li>
   <li>A Lavalink server, here are some free Lavalink servers: <a href="https://lavalink.darrennathanael.com/">Click Me</a></li>
   <li>Discord Bot <a href="https://discord.com/developers/applications">token</a> to get started</li>
 </ul>
</div>

<br>
<h2 id="installation">📥 Installation</h2>

```bash
# npm add
npm install blue.ts
# yarn add
yarn add blue.ts
```
<br>
 <h2 id="quickstart">🚀 Quick Start with Discord.js 13</h2>

```javascript
const { Client, Intents } = require("discord.js");
const { Blue, Events, Types, Library } = require("blue.ts");

const client = new Client({
  //...client constructor
});

//Lavalink Nodes
const nodes = [
  {
    host: "localhost",
    port: 2333,
    password: "youshallnotpass",
    secure: false
  }
];

//Blue Manager Options
const options = {
  spotify: {
    client_id: "CLIENT_ID",  //spotify client ID
    client_secret: "CLIENT_SECRET" //spotify client Secret
  },
  autoplay: true,
  version: "v4",
  library: Library.DiscordJs
};

//Declaring the manager
client.manager = new Blue(nodes, options);

//ready event handler to initiate the manager
client.on("ready", async () => {
  console.log("Client is ready!");
  client.manager.init(client);
});

client.on("messageCreate", async (message) => {
  if(message.author.bot) return;
  if(message.content.startsWith("!play")) {

    let player = client.manager.players.get(message.guild.id);

    if(!player) {
      player = await client.manager.create({
        voiceChannel: message.member?.voice?.channel?.id || null,
        textChannel: message.channel?.id,
        guildId: message.guild.id,
        selfDeaf: true,
        selfMute: false
      });
    }

    const res = await client.manager.search({ query: "summertime sadness", source: "spotify" }, message.author);

    if (!res) return message.reply("song not found");

    if (res.loadType == Types.LOAD_SP_ALBUMS || res.loadType == Types.LOAD_SP_PLAYLISTS) {
      player.queue.add(...res.tracks);
      message.reply(`Loaded **${res.length}** tracks from \`${res.name}\``);
    } else {
      player.queue.add(res.tracks[0]);
      message.reply(`Track: **${res.tracks[0].info.title}** added to queue.`);
    }
    if (!player.queue?.current)
      player.play();
  }
});

//Replace the TOKEN with the actual bot token
client.login("TOKEN");
```
<br>
<div>
 <h2 id="documentation">📚 Documentation</h2>
 <p>Check out the <a href="https://github.com/ftrapture/blue.ts/wiki">documentation</a> for detailed usage instructions and examples.</p>
</div>
<br>
<div>
 <h2 id="issues">🐞 Issues</h2>
 <p>For any inquiries or issues, feel free to <a href="https://github.com/ftrapture/blue.ts/issues">open an issue</a> on GitHub.</p>
</div>
<br>
<div>
 <h2 id="license">📜 License</h2>
 <p>This project is licensed under the <a href="https://github.com/ftrapture/blue.ts/tree/1.3?tab=MIT-1-ov-file">MIT License</a>.</p>
</div>
<br>
<br>
<div align="center">
 <a href="https://github.com/ftrapture">
   <img src="https://raw.githubusercontent.com/ftrapture/blue.ts/main/assets/footer.png" alt="Blue.ts Footer" width="800">
 </a>
</div>
