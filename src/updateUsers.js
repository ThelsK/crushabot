const { loadGoogleSheet, getConfig, getOutputSheet } = require("./googleSheet")
const { getClient } = require("./discordBot")
const { findRank } = require("./findRank.js")
const { reportError } = require("./error")

async function updateUsers() {

	// Refresh the Google Sheets document.
	let success = await loadGoogleSheet()
	if (!success) {
		return
	}
	const config = getConfig()
	const client = getClient()

	// Check if the Bot is connected to the correct server.
	const guild = client.guilds.cache.find(checkGuild => checkGuild.id === config.serverid)
	if (!guild) {
		reportError(`Error: I am not connected to the Server with the configured Server ID.`)
		return
	}
	const members = await guild.members.fetch()

	// Load the Output sheet.
	const outputSheet = getOutputSheet()
	if (!outputSheet.headerValues.find(value => value === config.discordtagcolumn)) {
		reportError(`Error: Discord Tag column header '${config.discordtagcolumn}' not found.`)
		return
	}
	//const fetchedMembers = await guild.members.fetch()


	// Check all rows.
	const outputRows = await outputSheet.getRows()
	outputRows.forEach(async outputRow => {

		// Check if it is an actual user row.
		const discordID = String(outputRow[config.discordidcolumn])
		if (!discordID || discordID === "type" || discordID === "description") {
			return
		}
		const member = members.find(memberEntry => memberEntry.id === discordID)
		const rankData = findRank(member)

		// Update the row values.
		if (member && config.discordtagcolumn) {
			outputRow[config.discordtagcolumn] = String(`${member.user.username}#${member.user.discriminator}`)
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
		if (config.rankweightcolumn) {
			outputRow[config.rankweightcolumn] = Number(rankData.weight)
		}
		await outputRow.save().catch(error => {
			reportError(`Error: Unable to save output data to the Google Sheets document.`)
			throw error
		})
	})
}

module.exports = { updateUsers }