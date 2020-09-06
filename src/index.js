const { loadDocument, getConfig, getCommands, getOutputSheet } = require("./googleSheet")
const { loadClient, msgReply } = require("./discordBot")
const { getIssue } = require("./issue")
const { getUTCDate, formatDate } = require("./date")

loadDocument()
const client = loadClient()
client.on("message", async msg => {

	// Ignore Bots.
	if (msg.author.bot) {
		return
	}

	// Ignore Private Messages.
	if (!msg.channel.guild) {
		msgReply(msg, `This Bot only accepts channel messages, not private messages.`)
		return
	}

	// Determine the command and the parameters.
	const content = msg.content.trim().concat(" ") // Space is added to not confuse commands without parameters.
	let command = content.substr(0, content.indexOf(" ")).toLowerCase()
	let parameter = content.substr(content.indexOf(" ") + 1).trim()

	// The !reload command is hardcoded, so its available while the document cannot be reached.
	if (command === "!reload") {
		if (msg.author.id === msg.channel.guild.ownerID) {
			msgReply(msg, `Reloading! Please try issuing another command in a couple of seconds.`)
			loadDocument()
		} else {
			msgReply(msg, `Only the Server Owner may perform the '!reload' command.`)
		}
		return
	}

	// If there is an issue, report the issue instead of resolving the command.
	if (getIssue()) {
		msgReply(msg, getIssue())
		return
	}

	// If the Server ID doesn't match the serverid setting, report it.
	const config = getConfig()
	if (msg.channel.guild.id !== config.serverid) {
		if (command.startsWith("!")) {
			msgReply(msg, `Error: Server ID mismatch. I am not supposed to be on this server.`)
		}
		return
	}

	// If the channel doesn't match, ignore the message.
	if (config.inputchannel && msg.channel.name !== config.inputchannel) {
		return
	}

	// Check if the command is an alias command.
	let com = getCommands()[command]
	if (com && com.type === "alias") {
		if (!com.reference) {
			msgReply(msg, `Error: No reference set for alias command '${command}'.`)
			return
		}
		if (!getCommands()[com.reference]) {
			msgReply(msg, `Error: Alias command '${command}' refers to an unknown command '${com.reference}'.`)
			return
		}
		if (getCommands()[com.reference].type === "alias") {
			msgReply(msg, `Error: Alias command '${command}' refers to another alias command '${com.reference}'.`)
			return
		}
		command = com.reference
		com = getCommands()[command]
	}

	// Check if the command exists.
	if (!com) {
		if (command.startsWith("!") && getCommands()["!help"]) {
			msgReply(msg, `Unknown command '${command}'. Type '!help' for an overview of available commands.`)
		} else if (command.startsWith("!")) {
			msgReply(msg, `Unknown command '${command}'.`)
		}
		return
	}

	// Check if the command has a valid command type.
	if (!com.type) {
		msgReply(msg, `Error: No command type set for '${command}'.`)
		return
	}
	const types = ["info", "data", "flag", "text", "number", "date"]
	if (!types.find(type => type === com.type)) {
		msgReply(msg, `Error: Unknown command type '${com.type}' set for '${command}'.`)
		return
	}

	// Check if the user is of adequate rank.
	if (com.minrank) {
		let minrank = msg.guild.roles.cache.find(role => role.name === com.minrank)
		if (!minrank) {
			msgReply(msg, `Error: Minimum rank '${com.minrank}' for command '${command}' not found.`)
			return
		}
		if (minrank.rawPosition > msg.member.roles.highest.rawPosition) {
			msgReply(msg, `Only users with rank '${com.minrank}' or higher can use '${command}'.`)
			return
		}
	}

	// Resolve info type commands.
	if (com.type === "info") {
		if (!com.reply) {
			msgReply(msg, `Error: No reply set for '${command}'.`)
		} else {
			msgReply(msg, com.reply)
		}
		return
	}

	// Load the output Sheet, and check if the Discord Tag column exists.
	const outputSheet = getOutputSheet()
	await outputSheet.loadHeaderRow() // To make sure the admin user did not swap columns around.
	const outputRows = await outputSheet.getRows()
	if (!outputSheet.headerValues.find(value => value === config.discordtagcolumn)) {
		msgReply(msg, `Error: Discord Tag column header '${config.discordtagcolumn}' not found.`)
		return
	}

	// Check if there is an entry for the current user.
	const discordTag = `${msg.author.username}#${msg.author.discriminator}`
	let outputRow = outputRows.find(row => row[config.discordtagcolumn] === discordTag)

	// Resolve stats type commands.
	if (com.type === "data") {
		if (!outputRow && getCommands()["!help"]) {
			msgReply(msg, `No data found for user '${discordTag}'. Type '!help' for an overview of available commands.`)
			return
		} else if (!outputRow) {
			msgReply(msg, `No data found for user '${discordTag}'.`)
			return
		}

		const outputType = outputRows.find(row => row[config.discordtagcolumn] === "type")
		if (!outputType) {
			msgReply(msg, `Error: Output row with Discord Tag 'type' not found.`)
			return
		}
		const outputDesc = outputRows.find(row => row[config.discordtagcolumn] === "description")
		if (!outputDesc) {
			msgReply(msg, `Error: Output row with Discord Tag 'description' not found.`)
			return
		}

		let reply = `${com.reply || "Data for user:"} ${discordTag}`
		outputSheet.headerValues.forEach(value => {
			if (outputType[value] === "flag" && outputRow[value] === "TRUE") {
				reply = `${reply}\n${outputDesc[value] || value} ${config.textenabled || "On"}`
			} else if (outputType[value] === "flag") {
				reply = `${reply}\n${outputDesc[value] || value} ${config.textdisabled || "Off"}`
			} else if (outputType[value] === "text") {
				reply = `${reply}\n${outputDesc[value] || value} ${outputRow[value] || "<blank>"}`
			} else if (outputType[value] === "number") {
				reply = `${reply}\n${outputDesc[value] || value} ${Number(outputRow[value]) || "0"}`
			} else if (outputType[value] === "date" && Number(outputRow[value])) {
				reply = `${reply}\n${outputDesc[value] || value} ${formatDate(new Date(Number(outputRow[value])))}`
			} else if (outputType[value] === "date") {
				reply = `${reply}\n${outputDesc[value] || value} ${formatDate(getUTCDate(outputRow[value]))}`
			}
		})
		msgReply(msg, reply)
		return
	}

	// Check if the reference column exists.
	if (!com.reference) {
		msgReply(msg, `Error: No reference column set for input command '${command}'.`)
		return
	}
	if (!outputSheet.headerValues.find(value => value === com.reference)) {
		msgReply(msg, `Error: Reference column header '${com.reference}' for input command '${command}' not found.`)
		return
	}

	// Check if a parameter is included.
	if (!parameter) {
		msgReply(msg, `Please type '${command} value'.`)
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
			msgReply(msg, `Please type '${command} ${config.textenabled || "On"}' or '${command} ${config.textdisabled || "Off"}'.`)
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
					msgReply(msg, `The text for '${command}' may not include the ' ${character} ' character.`)
					return
				}
			}
		}

		if (com.minimum && parameter.length < Number(com.minimum)) {
			msgReply(msg, `The text for '${command}' must be at least ${com.minimum} characters long.`)
			return
		}
		if (com.maximum && parameter.length > Number(com.maximum)) {
			msgReply(msg, `The text for '${command}' must be at most ${com.maximum} characters long.`)
			return
		}
	}

	// Check if the parameter is a number.
	if (com.type === "number") {
		parameter = Number(parameter)
		if (com.forbidden && !Number.isInteger(parameter)) {
			msgReply(msg, `Please type '${command} value'. Value must be a round number.`)
			return
		}
		if (isNaN(parameter)) {
			msgReply(msg, `Please type '${command} value'. Value must be a number.`)
			return
		}
		if (com.minimum && parameter < Number(com.minimum)) {
			msgReply(msg, `The number for '${command}' must be at least ${com.minimum}.`)
			return
		}
		if (com.maximum && parameter > Number(com.maximum)) {
			msgReply(msg, `The number for '${command}' must be at most ${com.maximum}.`)
			return
		}
	}

	// Check if the parameter is a date.
	if (com.type === "date") {
		const date = getUTCDate(parameter)
		if (isNaN(date)) {
			msgReply(msg, `Please type '${command} value'. Value must be a valid date.`)
			return
		}
		if (com.minimum) {
			const mindate = getUTCDate(com.minimum)
			if (isNaN(mindate)) {
				msgReply(msg, `Error: Minimum value '${com.mindate}' for input command '${command}' is not a date.`)
				return
			}
			if (date.getTime() < mindate.getTime()) {
				msgReply(msg, `The date for '${command}' must be ${formatDate(mindate)} or later.`)
				return
			}
		}
		if (com.maximum) {
			const maxdate = getUTCDate(com.maximum)
			if (isNaN(maxdate)) {
				msgReply(msg, `Error: Maximum value '${com.maxdate}' for input command '${command}' is not a date.`)
				return
			}
			if (date.getTime() > maxdate.getTime()) {
				msgReply(msg, `The date for '${command}' must be ${formatDate(maxdate)} or earlier.`)
				return
			}
		}
		parameter = formatDate(date)
	}

	// Create a new row if needed.
	if (!outputRow) {
		outputRow = await outputSheet.addRow({ [config.discordtagcolumn]: String(discordTag) })
	}

	// Update the row values.
	if (config.discordnamecolumn) {
		outputRow[config.discordnamecolumn] = String(msg.member.nickname || msg.author.username)
	}
	if (config.discordrankcolumn) {
		outputRow[config.discordrankcolumn] = String(msg.member.roles.highest.name)
	}
	if (config.rankvaluecolumn) {
		outputRow[config.rankvaluecolumn] = String(msg.member.roles.highest.rawPosition)
	}
	if (config.lastupdatedcolumn) {
		outputRow[config.lastupdatedcolumn] = formatDate(new Date(Date.now()))
	}
	if (config.updatedvaluecolumn) {
		outputRow[config.updatedvaluecolumn] = new Date(Date.now()).getTime()
	}
	outputRow[com.reference] = String(parameter)
	await outputRow.save()

	// Report back to the user.
	if (parameter === true) {
		parameter = config.textenabled || "On"
	} else if (parameter === false) {
		parameter = config.textdisabled || "Off"
	}
	msgReply(msg, `${com.reply || `${com.reference} set to`} ${parameter}`)
})