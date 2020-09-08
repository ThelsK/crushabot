const Discord = require("discord.js")
const { getConfig } = require("./googleSheet")
const { discordToken } = require("./environment")

function loadClient() {
	const client = new Discord.Client()
	client.on("ready", () => {
		console.log("Discord Bot connection:", client.user.tag)
	})
	client.login(discordToken)
	return client
}

function msgReply(msg, text) {
	msg.reply(text)
}

function msgError(msg, text) {
	msg.reply(text)
}

module.exports = { loadClient, msgReply, msgError }