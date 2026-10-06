const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
} = require("@discordjs/voice");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.VC_CHANNEL_ID;

async function joinVC() {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = await guild.channels.fetch(CHANNEL_ID);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true,
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
      } catch {
        connection.destroy();
        setTimeout(joinVC, 5000);
      }
    });

    console.log(`Joined ${channel.name}`);
  } catch (err) {
    console.error(err);
    setTimeout(joinVC, 10000);
  }
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  joinVC();
});

client.login(TOKEN);
