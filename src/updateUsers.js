const { loadGoogleSheet, getConfig, getOutputSheet } = require("./googleSheet")
const { getClient } = require("./discordBot")
const { findRank } = require("./findRank.js")
const { reportError } = require("./error")

async function updateUsers() {

	console.log("Updating users 1")

	// Refresh the Google Sheets document.
	let success = await loadGoogleSheet()
	if (!success) {
		return
	}
	const config = getConfig()
	const client = getClient()

	console.log("Updating users 2")

	// Check if the Bot is connected to the correct server.
	const guild = client.guilds.cache.find(checkGuild => checkGuild.id === config.serverid)
	if (!guild) {
		reportError(`Error: I am not connected to the Server with the configured Server ID.`)
		return
	}

	console.log("Updating users 3")

	// Load the Output sheet.
	const outputSheet = getOutputSheet()
	if (!outputSheet.headerValues.find(value => value === config.discordtagcolumn)) {
		reportError(`Error: Discord Tag column header '${config.discordtagcolumn}' not found.`)
		return
	}

	console.log("Updating users 4")

	// Check all rows.
	await guild.members.fetch({ query: '*', limit: 10000 })
	console.log("Members:", guild.members)
	const outputRows = await outputSheet.getRows()
	outputRows.forEach(async outputRow => {

		// Check if it is an actual user row.
		const discordTag = outputRow[config.discordtagcolumn]
		if (!discordTag || discordTag.indexOf("#") === -1) {
			return
		}
		console.log("Discord Tag:", discordTag)
		const member = await guild.members.cache.find(user => discordTag === `${user.user.username}#${user.user.discriminator}`)
		console.log("Member:", member)
		const rankData = findRank(member)
		console.log("rankData:", rankData)

		// Update the row values.
		if (config.rankweightcolumn) {
			outputRow[config.rankweightcolumn] = Number(rankData.weight)
		}
		if (member && config.discordnamecolumn) {
			outputRow[config.discordnamecolumn] = String(member.nickname || member.user.username)
		}
		if (config.discordrankcolumn) {
			outputRow[config.discordrankcolumn] = String(rankData.rankid)
		}
		if (config.ranknamecolumn) {
			outputRow[config.ranknamecolumn] = String(rankData.rank)
		}
		await outputRow.save().catch(error => {
			reportError(`Error: Unable to save output data to the Google Sheets document.`)
			throw error
		})
	})
}

module.exports = { updateUsers }