const { loadGoogleSheet, getConfig, getCommands, getOutputSheet } = require("./googleSheet")
const { getClient } = require("./discordBot")
const { getUTCDate, formatDate } = require("./date")
const { findRank } = require("./findRank.js")
const { reportError } = require("./error")

const lastReminder = {} // To prevent spamming reminders.

async function handleMessage(msg) {

	// Ignore Bots.
	if (msg.author.bot) {
		return
	}

	// Refresh the Google Sheets document.
	let success = await loadGoogleSheet(reportError)
	if (!success) {
		return
	}
	const client = getClient()
	const config = getConfig()
	const commands = getCommands()

	// When receiving a channel message on the wrong server, inform that server's owner.
	if (msg.guild && msg.guild.id !== config.serverid) {
		if (!lastReminder[`wrongServer${msg.guild.id}`] ||
			Date.now() > lastReminder[`wrongServer${msg.guild.id}`] + 600000) {
			lastReminder[`wrongServer${msg.guild.id}`] = Date.now()
			msg.guild.owner.send(`Error: Your Server '${msg.guild.name}' with ID '${msg.guild.id}'`
				+ ` does not match the configured Server ID.`
				+ `\nEither update the Server ID in the configuration, or remove me from your Server.`
				+ `\nNote: It can take up to 10 minutes for me to recognize any configuration updates.`)
		}
		return
	}

	// When receiving a channel message on the right server, ignore the incorrect channels.
	if (msg.guild && config.inputchannelid && msg.channel.id !== config.inputchannelid) {
		return
	}

	// Check if the Bot is connected to the correct server.
	const guild = client.guilds.cache.find(checkGuild => checkGuild.id === config.serverid)
	if (!guild) {
		msgError(msg, null, `Error: I am not connected to the Server with the configured Server ID.`)
		return
	}

	// Determine the command and the parameters.
	const content = msg.content.trim().concat(" ") // Space is added to not confuse commands without parameters.
	let command = content.substr(0, content.indexOf(" ")).toLowerCase()
	let parameter = content.substr(content.indexOf(" ") + 1).trim()

	// Check if the command is an alias command.
	let com = commands.find(commandEntry => commandEntry.command === command)
	if (com && com.type === "alias") {
		if (!com.reference) {
			msgError(msg, com, `Error: No reference set for alias command '${command}'.`)
			return
		}
		const reference = commands.find(commandEntry => commandEntry.command === com.reference)
		if (!reference) {
			msgError(msg, com, `Error: Alias command '${command}' refers to an unknown command '${com.reference}'.`)
			return
		}
		if (reference.type === "alias") {
			msgError(msg, com, `Error: Alias command '${command}' refers to another alias command '${com.reference}'.`)
			return
		}
		command = com.reference
		com = reference
	}

	// Check if the command exists.
	if (!com) {
		if (msg.guild && !command.startsWith("!")) {
			return
		}
		if (commands["!help"]) {
			msgReply(msg, com, `Unknown command '${command}'. Type '!help' for an overview of available commands.`)
		} else {
			msgReply(msg, com, `Unknown command '${command}'.`)
		}
		return
	}

	// Check if the command is allowed as a channel message.
	if (msg.guild && com.inchannel !== "TRUE") {
		msgReply(msg, com, `Command '${command} is not allowed as a channel message. Try it as a direct message.`)
		return
	}

	// Check if the command is allowed as a direct message.
	if (!msg.guild && com.indm !== "TRUE") {
		msgReply(msg, com, `Command '${command} is not allowed as a direct message. Try it as a channel message.`)
		return
	}

	// Check if the command has a valid command type.
	if (!com.type) {
		msgError(msg, com, `Error: No command type set for '${command}'.`)
		return
	}
	const types = ["info", "data", "flag", "text", "number", "date"]
	if (!types.find(type => type === com.type)) {
		msgError(msg, com, `Error: Unknown command type '${com.type}' set for '${command}'.`)
		return
	}

	// Find the user's highest matching rank.
	const member = await guild.members.fetch(msg.author)
	const rankData = findRank(member)

	// Check if the user is of adequate rank.
	if (com.minrank) {
		if (rankData.command < com.minrank) {
			msgReply(msg, com, `You do not have a sufficient rank to use the '${command}' command.`)
			return
		}
	}

	// Resolve info type commands.
	if (com.type === "info") {
		if (!com.reply) {
			msgReply(msg, com, `Error: No reply set for '${command}'.`)
		} else {
			msgReply(msg, com, com.reply + com.suffix)
		}
		return
	}

	// Load the output Sheet, and check if the Discord ID column exists.
	const outputSheet = getOutputSheet()
	if (!outputSheet.headerValues.find(value => value === config.discordidcolumn)) {
		msgError(msg, com, `Error: Discord ID column header '${config.discordidcolumn}' not found.`)
		return
	}
	const outputRows = await outputSheet.getRows()

	// Check if there is an entry for the current user.
	const discordTag = `${member.user.username}#${member.user.discriminator}`
	let outputRow = outputRows.find(row => row[config.discordidcolumn] === member.id)

	// Resolve stats type commands.
	if (com.type === "data") {
		if (!outputRow && commands["!help"]) {
			msgReply(msg, com, `No data found for user '${discordTag}'. Type '!help' for an overview of available commands.`)
			return
		} else if (!outputRow) {
			msgReply(msg, com, `No data found for user '${discordTag}'.`)
			return
		}

		const outputType = outputRows.find(row => row[config.discordidcolumn] === "type")
		if (!outputType) {
			msgError(msg, com, `Error: Output row with Discord ID 'type' not found.`)
			return
		}
		const outputDesc = outputRows.find(row => row[config.discordidcolumn] === "description")
		if (!outputDesc) {
			msgError(msg, com, `Error: Output row with Discord ID 'description' not found.`)
			return
		}

		let reply = `${com.reply || "Data for user:"} ${discordTag}`
		outputSheet.headerValues.forEach(value => {
			if (outputType[value] === "flag" && outputRow[value] === "TRUE") {
				reply += `\n${outputDesc[value] || value} ${config.textenabled || "On"}`
			} else if (outputType[value] === "flag" && outputRow[value] !== "FALSE" && config.defaultflagvalue === "TRUE") {
				reply += `\n${outputDesc[value] || value} ${config.textenabled || "On"}`
			} else if (outputType[value] === "flag") {
				reply += `\n${outputDesc[value] || value} ${config.textdisabled || "Off"}`
			} else if (outputType[value] === "text") {
				reply += `\n${outputDesc[value] || value} ${outputRow[value] || "<blank>"}`
			} else if (outputType[value] === "number") {
				reply += `\n${outputDesc[value] || value} ${Number(outputRow[value]) || "0"}`
			} else if (outputType[value] === "date" && Number(outputRow[value])) {
				reply += `\n${outputDesc[value] || value} ${formatDate(new Date(Number(outputRow[value])))}`
			} else if (outputType[value] === "date") {
				reply += `\n${outputDesc[value] || value} ${outputRow[value] || "<blank>"}`
			}
		})
		reply += com.suffix
		msgReply(msg, com, reply)
		return
	}

	// Check if a parameter is included.
	if (!parameter) {
		msgReply(msg, com, `Please type '${command} value'.`)
		return
	}

	// Check if the parameter is a flag.
	if (com.type === "flag") {
		parameter = parameter.toLowerCase()
		if (config.textenabled && parameter === config.textenabled.toLowerCase()) {
			parameter = true
		} else if (config.textdisabled && parameter === config.textdisabled.toLowerCase()) {
			parameter = false
		} else if (parameter.startsWith("y") || parameter.startsWith("t") || parameter.startsWith("e") || parameter.startsWith("on")) {
			parameter = true
		} else if (parameter.startsWith("n") || parameter.startsWith("f") || parameter.startsWith("d") || parameter.startsWith("of")) {
			parameter = false
		} else {
			msgReply(msg, com, `Please type '${command} ${config.textenabled || "On"}' or '${command} ${config.textdisabled || "Off"}'.`)
			return
		}
	}

	// Check if the parameter is a text.
	if (com.type === "text") {
		if (com.forbidden) {
			const characters = com.forbidden.split("")
			for (let i in characters) {
				const character = characters[i]
				if (parameter.includes(character)) {
					msgReply(msg, com, `The text for '${command}' may not include the ' ${character} ' character.`)
					return
				}
			}
		}
		if (com.minimum) {
			const minlength = Number(com.minimum)
			if (isNaN(minlength)) {
				msgError(msg, com, `Error: Minimum length '${com.minimum}' for input command '${command}' is not a number.`)
				return
			}
			if (parameter.length < minlength) {
				msgReply(msg, com, `The text for '${command}' must be ${minlength} or more characters.`)
				return
			}
		}
		if (com.maximum) {
			const maxlength = Number(com.maximum)
			if (isNaN(maxlength)) {
				msgError(msg, com, `Error: Maximum length '${com.maximum}' for input command '${command}' is not a number.`)
				return
			}
			if (parameter.length > maxlength) {
				msgReply(msg, com, `The text for '${command}' must be ${maxlength} or less characters.`)
				return
			}
		}
	}

	// Check if the parameter is a number.
	if (com.type === "number") {
		parameter = Number(parameter)
		if (com.forbidden && !Number.isInteger(parameter)) {
			msgReply(msg, com, `Please type '${command} value'. Value must be a round number.`)
			return
		}
		if (isNaN(parameter)) {
			msgReply(msg, com, `Please type '${command} value'. Value must be a number.`)
			return
		}
		if (com.minimum) {
			const minvalue = Number(com.minimum)
			if (isNaN(minvalue)) {
				msgError(msg, com, `Error: Minimum value '${com.minimum}' for input command '${command}' is not a number.`)
				return
			}
			if (parameter < minvalue) {
				msgReply(msg, com, `The value for '${command}' must be ${minvalue} or more.`)
				return
			}
		}
		if (com.maximum) {
			const maxvalue = Number(com.maximum)
			if (isNaN(maxvalue)) {
				msgError(msg, com, `Error: Maximum value '${com.maximum}' for input command '${command}' is not a number.`)
				return
			}
			if (parameter > maxvalue) {
				msgReply(msg, com, `The value for '${command}' must be ${maxvalue} or less.`)
				return
			}
		}
	}

	// Check if the parameter is a date.
	if (com.type === "date") {
		const date = getUTCDate(parameter)
		if (isNaN(date)) {
			msgReply(msg, com, `Please type '${command} value'. Value must be a valid date.`)
			return
		}
		if (com.minimum) {
			const mindate = getUTCDate(com.minimum)
			if (isNaN(mindate)) {
				msgError(msg, com, `Error: Minimum date '${com.minimum}' for input command '${command}' is not a date.`)
				return
			}
			if (date.getTime() < mindate.getTime()) {
				msgReply(msg, com, `The date for '${command}' must be ${formatDate(mindate)} or later.`)
				return
			}
		}
		if (com.maximum) {
			const maxdate = getUTCDate(com.maximum)
			if (isNaN(maxdate)) {
				msgError(msg, com, `Error: Maximum date '${com.maximum}' for input command '${command}' is not a date.`)
				return
			}
			if (date.getTime() > maxdate.getTime()) {
				msgReply(msg, com, `The date for '${command}' must be ${formatDate(maxdate)} or earlier.`)
				return
			}
		}
		parameter = formatDate(date)
	}

	// Check if the reference column exists.
	if (!com.reference) {
		msgError(msg, com, `Error: No reference column set for input command '${command}'.`)
		return
	}
	if (!outputSheet.headerValues.find(value => value === com.reference)) {
		msgError(msg, com, `Error: Reference column header '${com.reference}' for input command '${command}' not found.`)
		return
	}

	// Create a new row if needed.
	if (!outputRow) {
		outputRow = await outputSheet.addRow({ [config.discordidcolumn]: String(member.id) }).catch(error => {
			reportIssue(`Error: Unable to create new output row for the Google Sheets document.`)
			throw error
		})
	}

	// Update the row values.
	if (config.discordtagcolumn) {
		outputRow[config.discordtagcolumn] = String(discordTag)
	}
	if (config.discordnamecolumn) {
		outputRow[config.discordnamecolumn] = String(member.nickname || member.user.username)
	}
	if (config.lastupdatedcolumn) {
		outputRow[config.lastupdatedcolumn] = formatDate(new Date(Date.now()))
	}
	if (config.updatedvaluecolumn) {
		outputRow[config.updatedvaluecolumn] = new Date(Date.now()).getTime()
	}
	if (config.discordrankcolumn) {
		outputRow[config.discordrankcolumn] = String(rankData.rankid)
	}
	if (config.ranknamecolumn) {
		outputRow[config.ranknamecolumn] = String(rankData.rank)
	}
	if (config.rankweightcolumn) {
		outputRow[config.rankweightcolumn] = String(rankData.weight)
	}
	outputRow[com.reference] = String(parameter)
	await outputRow.save().catch(error => {
		reportIssue(`Error: Unable to save output data to the Google Sheets document.`)
		throw error
	})

	// Report back to the user.
	if (parameter === true) {
		parameter = config.textenabled || "On"
	} else if (parameter === false) {
		parameter = config.textdisabled || "Off"
	}
	msgReply(msg, com, `${com.reply || `${com.reference} set to`} ${parameter}${com.suffix}`)
}

async function msgReply(msg, com, text) {
	const config = getConfig()
	let replytomsg = false
	let replyindm = false
	let deletemsg = false

	if (!com && msg.guild && config.nocommandinchannel === "TRUE" && config.replyindm === "TRUE") {
		replyindm = true
	} else if (!com && msg.guild && config.nocommandinchannel === "TRUE") {
		replytomsg = true
	} else if (!com && !msg.guild && config.nocommandindm === "TRUE") {
		replyindm = true
	} else if (com && com.replyindm === "TRUE") {
		replyindm = true
	} else if (com) {
		replytomsg = true
	}

	if (!com && msg.guild && config.deletemsg === "TRUE") {
		deletemsg = true
	} else if (com && msg.guild && com.deletemsg === "TRUE") {
		deletemsg = true
	}

	if (replytomsg || replyindm) {
		console.log(`<= ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`)
		console.log(`=> ${msg.author.username}#${msg.author.discriminator}: ${text}`)
	}

	if (replytomsg) {
		await msg.reply(text).catch(error => {
			reportError(`Error: Unable to send a reply to '${msg.author.username}#${msg.author.discriminator}'.`)
			throw error
		})
	}

	if (replyindm) {
		await msg.author.send(text).catch(error => {
			reportError(`Error: Unable to send a direct message to '${msg.author.username}#${msg.author.discriminator}'.`)
			throw error
		})
	}

	if (deletemsg) {
		await msg.delete().catch(error => {
			reportError(`Error: Unable to delete the message from '${msg.author.username}#${msg.author.discriminator}'.`)
			throw error
		})
	}
}

async function msgError(msg, com, text) {
	const config = getConfig()
	if (!config.errorchannelid && !config.erroruserid) {
		msgReply(msg, com, text)
		return
	}
	console.log(`<= ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`)
	reportError(text)

	let deletemsg = false
	if (!com && msg.guild && config.deletemsg === "TRUE") {
		deletemsg = true
	} else if (com && msg.guild && com.deletemsg === "TRUE") {
		deletemsg = true
	}

	if (deletemsg) {
		await msg.delete().catch(error => {
			reportError(`Error: Unable to delete the message from '${msg.author.username}#${msg.author.discriminator}'.`)
			throw error
		})
	}
}

module.exports = { handleMessage }