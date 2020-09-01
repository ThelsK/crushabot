const { loadDocument, getConfig, getCommands, getOutputSheet } = require("./googleSheet")
const { loadClient } = require("./discordBot")
const { getIssue } = require("./issue")

loadDocument()
const client = loadClient()
client.on("message", async msg => {

	// Ignore Bots.
	if (msg.author.bot) {
		return
	}

	// Ignore Private Messages.
	if (!msg.channel.guild) {
		msg.reply("This Bot only accepts channel messages, not private messages.")
		return
	}

	const content = msg.content.trim().concat(" ") // Space is added to not confuse commands without parameters.
	let command = content.substr(0, content.indexOf(" ")).toLowerCase()
	let parameter = content.substr(content.indexOf(" ") + 1).trim()

	// The !reload command is hardcoded, so its available while the document cannot be reached.
	if (command === "!reload") {
		if (msg.author.id === msg.channel.guild.ownerID) {
			msg.reply("Reloading! Please try issuing another command in one minute.")
			loadDocument()
		} else {
			msg.reply("Only the Server Owner may perform the '!reload' command.")
		}
		return
	}

	// If there is an issue, report the issue instead of resolving the command.
	if (getIssue()) {
		msg.reply(getIssue())
		return
	}

	// If the Server ID doesn't match the serverid setting, report it.
	if (msg.channel.guild.id !== getConfig().serverid) {
		msg.reply("Error: Server mismatch. I am not supposed to be on this server.")
		return
	}

	// If the channel doesn't match, ignore the message.
	if (getConfig().inputchannel && msg.channel.name !== getConfig().inputchannel) {
		return
	}

	// Check if the command is an alias command.
	let getCommand = getCommands()[command]
	if (getCommand && getCommand.type === "alias") {
		if (!getCommand.reference) {
			msg.reply(`Error: No reference set for alias command '${command}'.`)
			return
		}
		if (!getCommands()[getCommand.reference]) {
			msg.reply(`Error: Alias command '${command}' refers to an unknown command '${getCommand.reference}'.`)
			return
		}
		if (getCommands()[getCommand.reference].type === "alias") {
			msg.reply(`Error: Alias command '${command}' refers to another alias command '${getCommand.reference}'.`)
			return
		}
		command = getCommand.reference
		getCommand = getCommands()[command]
	}

	// Check if the command exists.
	if (!getCommand) {
		if (command.substr(0, 1) === "!" && getCommands()["!help"]) {
			msg.reply(`Unknown command '${command}'. Type '!help' for an overview of available commands.`)
		} else if (command.substr(0, 1) === "!") {
			msg.reply(`Unknown command '${command}'.`)
		}
		return
	}

	// Check if the command has a valid command type.
	if (!getCommand.type) {
		msg.reply(`Error: No command type set for '${command}'.`)
		return
	}
	const types = ["info", "stats", "string", "integer", "boolean"]
	if (!types.find(type => type === getCommand.type)) {
		msg.reply(`Error: Unknown command type '${getCommand.type}' set for '${command}'.`)
		return
	}

	// Resolve info type commands.
	if (getCommand.type === "info") {
		if (!getCommand.reply) {
			msg.reply(`Error: No reply set for '${command}'.`)
		} else {
			msg.reply(getCommand.reply)
		}
		return
	}

	// Load the output Sheet, and check if the Discord Tag column exists.
	const outputSheet = getOutputSheet()
	const outputRows = await outputSheet.getRows()
	if (!outputSheet.headerValues.find(value => value === getConfig().discordtagcolumn)) {
		msg.reply(`Error: Discord Tag column header '${getConfig().discordtagcolumn}' not found.`)
		return
	}

	// Check if there is an entry for the current user.
	const discordTag = `${msg.author.username}#${msg.author.discriminator}`
	const discordRank = "unknown"
	let outputRow = outputRows.find(row => row[getConfig().discordtagcolumn] === discordTag)

	// Resolve stats type commands.
	if (getCommand.type === "stats") {
		if (!outputRow) {
			msg.reply(`User '${discordTag}' not found.`)
			return
		}
		let reply = getCommand.reply
		outputSheet.headerValues.forEach(value => {
			if (outputRow[value] === undefined) {
				reply = `${reply}\n${value}: <blank>`
			} else if (outputRow[value] === true) {
				reply = `${reply}\n${value}: ${getConfig().textenabled || "On"}`
			} else if (outputRow[value] === false) {
				reply = `${reply}\n${value}: ${getConfig().textdisabled || "Off"}`
			} else {
				reply = `${reply}\n${value}: ${outputRow[value]}`
			}
		})
		msg.reply(reply)
		return
	}

	// Check if the reference column exists.
	if (!getCommand.reference) {
		msg.reply(`Error: No reference column set for input command '${command}'.`)
		return
	}
	if (!outputSheet.headerValues.find(value => value === getCommand.reference)) {
		msg.reply(`Error: Reference column header '${getCommand.reference}' for input command '${command}' not found.`)
		return
	}

	// Check if a parameter is included.
	if (!parameter) {
		msg.reply(`Please type '${command} value'.`)
		return
	}

	// Check if the parameter is a number.
	if (getCommand.type === "integer") {
		parameter = Number(parameter)
		if (isNaN(parameter)) {
			msg.reply(`Please type '${command} value'. Value must be a number.`)
			return
		}
	}

	// Check if the parameter if a boolean.
	if (getCommand.type === "boolean") {
		parameter = parameter.toLowerCase()
		if (getConfig().textenabled && parameter === getConfig().textenabled) {
			parameter === true
		} else if (getConfig().textdisabled && parameter === getConfig().textdisabled) {
			parameter === false
		} else if (parameter.substr(0, 1) == "y" || parameter.substr(0, 1) == "t" || parameter.substr(0, 1) == "e" || parameter.substr(0, 2) == "on") {
			parameter === true
		} else if (parameter.substr(0, 1) == "n" || parameter.substr(0, 1) == "f" || parameter.substr(0, 1) == "d" || parameter.substr(0, 2) == "of") {
			parameter === false
		} else {
			msg.reply(`Please type '${command} ${getConfig().textenabled || "On"}' or '${command} ${getConfig().textdisabled || "Off"}'.`)
			return
		}
	}

	// Create a new row if needed.
	if (!outputRow) {
		console.log("Creating new row.")
		outputRow = await outputSheet.addRow({})
		console.log("Created new row.")
	}

	// Update the row values.
	console.log("Outputsheet:", outputSheet)
	console.log("OutputRow:", outputRow)
	outputRow[getConfig().discordtagcolumn] = discordTag
	if (getConfig().discordrankcolumn) {
		outputRow[getConfig().discordrankcolumn] = discordRank
	}
	if (getConfig().updatedcolumn) {
		outputRow[getConfig().updatedcolumn] = new Date()
	}
	outputRow[getCommand.reference] = parameter
	await outputRow.save()

	msg.reply(`${getCommand.reference} set to ${parameter}.`)
})