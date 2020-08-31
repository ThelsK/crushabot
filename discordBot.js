const Discord = require("discord.js");
const client = new Discord.Client();

// Report successful login:
client.on("ready", () => console.log("Logged in as:", client.user.tag))

const token = process.env.DISCORD_TOKEN;
client.login(token);