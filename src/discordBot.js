const Discord = require("discord.js")
const client = new Discord.Client()

// Report successful login:
client.on("ready", () => {
	console.log("Logged in as:", client.user.tag)
})

// Reply to message:
client.on("message", msg => {
	console.log("Received message:", msg)
	if (msg.content.toLowerCase() === "ping") {
		msg.reply("Pong")
	}
})

client.login(process.env.DISCORD_TOKEN)