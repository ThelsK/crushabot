const { loadGoogleSheet, getConfig, getOutputSheet } = require("./googleSheet")
const { getClient } = require("./discordBot")
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

	// Load the Output sheet.
	const outputSheet = getOutputSheet()
	if (!outputSheet.headerValues.find(value => value === config.discordtagcolumn)) {
		reportError(`Error: Discord Tag column header '${config.discordtagcolumn}' not found.`)
		return
	}

	// Check all rows.
	const outputRows = await outputSheet.getRows()
	outputRows.forEach(async outputRow => {

		// Check if it is an actual user row.
		const discordTag = outputRow[config.discordtagcolumn]
		console.log("Discord Tag:", discordTag, discordTag.indexOf("#"))
		if (!discordTag || discordTag.indexOf("#") == -1) {
			return
		}
		console.log("Guild Members:", guild.members.cache)
		const member = await guild.members.cache.find(user => discordTag === `${user.user.username}#${user.user.discriminator}`)
		console.log("Member:", member)
		if (!member) {
			if (config.discordrankcolumn) {
				outputRow[config.discordrankcolumn] = "<not found>"
			}
			if (config.rankvaluecolumn) {
				outputRow[config.rankvaluecolumn] = -1
			}
		} else {
			if (config.discordnamecolumn) {
				outputRow[config.discordnamecolumn] = String(member.nickname || member.user.username)
			}
			if (config.discordrankcolumn) {
				outputRow[config.discordrankcolumn] = String(member.roles.highest.name)
			}
			if (config.rankvaluecolumn) {
				outputRow[config.rankvaluecolumn] = String(member.roles.highest.rawPosition)
			}
		}
		await outputRow.save().catch(error => {
			setIssue(`Error: Unable to save output data to the Google Sheets document.`)
			throw error
		})
	})
}

module.exports = { updateUsers }