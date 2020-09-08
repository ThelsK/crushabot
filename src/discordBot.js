const Discord = require("discord.js")
const { discordToken } = require("./environment")
const { handleMessage } = require("./handleMessage")
const { reportError } = require("./error")

const client = new Discord.Client()
client.on("ready", () => console.log("Discord Bot connection:", client.user.tag))
client.on("message", msg => handleMessage(client, msg))

async function loginDiscordClient() {
	await client.login(discordToken).catch(error => {
		reportError(`Error: Unable to log in to the Discord client.`)
		throw error
	})

	return true
}

module.exports = { loginDiscordClient }