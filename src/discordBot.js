const Discord = require("discord.js")
const { discordToken } = require("./environment")

function loadClient() {
	const client = new Discord.Client()
	client.on("ready", () => {
		console.log("Discord Bot connection:", client.user.tag)
	})
	client.login(discordToken)
	return client
}


/*
client.on("message", msg => {
	console.log("Received message:", msg)
	if (msg.content.toLowerCase() === "ping") {
		msg.reply("Pong")
	}
})
*/

module.exports = { loadClient }