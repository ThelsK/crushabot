
const lastReminder = {} // To prevent spamming reminders.

async function reportError(text) {
	console.error(`\x1b[31m${text}\x1b[00m`)
	const { getConfig } = require("./googleSheet")
	const config = getConfig()
	if (!config.ownertag) {
		return
	}
	if (!lastReminder[`reportError${text}`] ||
		Date.now() > lastReminder[`reportError${text}`] + 600000) {
		lastReminder[`reportError${text}`] = Date.now()
		console.log(`=> ${config.ownertag}: ${text}`)
		const { getClient } = require("./discordBot")
		const client = getClient()
		const owner = client.users.cache.find(user => config.ownertag === `${user.username}#${user.discriminator}`)
		await owner.send(text).catch(error => {
			console.error(`\x1b[31mError: Unable to send direct message to '${config.ownertag}'.\x1b[00m`)
			throw error
		})
	}
}

module.exports = { reportError }