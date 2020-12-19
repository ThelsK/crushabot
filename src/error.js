const { getConfig } = require("./googleSheet")
const { getClient } = require("./discordBot")

const lastReminder = {} // To prevent spamming reminders.

async function reportError(text) {
	console.error(`\x1b[31m${text}\x1b[00m`) // Apply red color to errors.
	const config = getConfig()
	const client = getClient()

	if (config.errorchannel) {
		const output = client.channels.cache.find(channel => config.errorchannel === channel.id)
		if (output) {
			output.send(text)
		}
	}

	if (!config.erroruserid) {
		return
	}
	if (lastReminder[`reportError${text}`] && Date.now() < lastReminder[`reportError${text}`] + 600000) {
		return
	}
	const owner = client.users.cache.find(user => config.erroruserid === user.id)
	if (!owner) {
		return
	}
	lastReminder[`reportError${text}`] = Date.now()
	await owner.send(text).catch(error => {
		console.error(`\x1b[31mError: Unable to send direct message to '${config.ownertag}'.\x1b[00m`)
		throw error
	})
}

module.exports = { reportError }