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

	// Determine the command and the parameters.
	const content = msg.content.trim().concat(" ") // Space is added to not confuse commands without parameters.
	let command = content.substr(0, content.indexOf(" ")).toLowerCase()
	let parameter = content.substr(content.indexOf(" ") + 1).trim()

	// The !reload command is hardcoded, so its available while the document cannot be reached.
	if (command === "!reload") {
		if (msg.author.id === msg.channel.guild.ownerID) {
			msg.reply("Reloading! Please try issuing another command in a couple of seconds.")
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
		if (command.startsWith("!")) {
			msg.reply("Error: Server ID mismatch. I am not supposed to be on this server.")
		}
		return
	}

	// If the channel doesn't match, ignore the message.
	if (getConfig().inputchannel && msg.channel.name !== getConfig().inputchannel) {
		return
	}

	// Check if the command is an alias command.
	let com = getCommands()[command]
	if (com && com.type === "alias") {
		if (!com.reference) {
			msg.reply(`Error: No reference set for alias command '${command}'.`)
			return
		}
		if (!getCommands()[com.reference]) {
			msg.reply(`Error: Alias command '${command}' refers to an unknown command '${com.reference}'.`)
			return
		}
		if (getCommands()[com.reference].type === "alias") {
			msg.reply(`Error: Alias command '${command}' refers to another alias command '${com.reference}'.`)
			return
		}
		command = com.reference
		com = getCommands()[command]
	}

	// Check if the command exists.
	if (!com) {
		if (command.startsWith("!") && getCommands()["!help"]) {
			msg.reply(`Unknown command '${command}'. Type '!help' for an overview of available commands.`)
		} else if (command.startsWith("!")) {
			msg.reply(`Unknown command '${command}'.`)
		}
		return
	}

	// Check if the command has a valid command type.
	if (!com.type) {
		msg.reply(`Error: No command type set for '${command}'.`)
		return
	}
	const types = ["info", "stats", "string", "integer", "boolean"]
	if (!types.find(type => type === com.type)) {
		msg.reply(`Error: Unknown command type '${com.type}' set for '${command}'.`)
		return
	}

	// Check if the user is of adequate rank.
	if (com.minrank) {
		let minrank = msg.guild.roles.cache.find(role => role.name === com.minrank)
		if (!minrank) {
			msg.reply(`Error: Minimum rank '${com.minrank}' for command '${command}' not found.`)
			return
		}
		if (minrank.rawPosition > msg.member.roles.highest.rawPosition) {
			msg.reply(`Only users with rank '${com.minrank}' or higher can use '${command}'.`)
			return
		}
	}

	// Resolve info type commands.
	if (com.type === "info") {
		if (!com.reply) {
			msg.reply(`Error: No reply set for '${command}'.`)
		} else {
			msg.reply(com.reply)
		}
		return
	}

	// Load the output Sheet, and check if the Discord Tag column exists.
	const outputSheet = getOutputSheet()
	await outputSheet.loadHeaderRow() // To make sure the admin user did not swap columns around.
	const outputRows = await outputSheet.getRows()
	if (!outputSheet.headerValues.find(value => value === getConfig().discordtagcolumn)) {
		msg.reply(`Error: Discord Tag column header '${getConfig().discordtagcolumn}' not found.`)
		return
	}

	// Check if there is an entry for the current user.
	const discordTag = `${msg.author.username}#${msg.author.discriminator}`
	let outputRow = outputRows.find(row => row[getConfig().discordtagcolumn] === discordTag)

	// Resolve stats type commands.
	if (com.type === "stats") {
		if (!outputRow) {
			msg.reply(`User '${discordTag}' not found.`)
			return
		}
		let reply = com.reply
		outputSheet.headerValues.forEach(value => {
			parameter = outputRow[value]
			if (parameter === undefined || parameter === "") {
				parameter = "<blank>"
			} else if (parameter === "TRUE") {
				parameter = getConfig().textenabled || "On"
			} else if (outputRow[value] === "FALSE") {
				parameter = getConfig().textdisabled || "Off"
			} else if (getConfig().updatedcolumn && value === getConfig().updatedcolumn) {
				parameter = new Date(Number(outputRow[value])).toUTCString()
			}
			reply = `${reply}\n${value}: ${parameter}`
		})
		msg.reply(reply)
		return
	}

	// Check if the reference column exists.
	if (!com.reference) {
		msg.reply(`Error: No reference column set for input command '${command}'.`)
		return
	}
	if (!outputSheet.headerValues.find(value => value === com.reference)) {
		msg.reply(`Error: Reference column header '${com.reference}' for input command '${command}' not found.`)
		return
	}

	// Check if a parameter is included.
	if (!parameter) {
		msg.reply(`Please type '${command} value'.`)
		return
	}

	// Check if the parameter is a string.
	if (com.type === "string") {
		if (com.minimum && parameter.length < Number(com.minimum)) {
			msg.reply(`The text for '${command}' must be at least ${com.minimum} characters long.`)
			return
		}
		if (com.maximum && parameter.length > Number(com.maximum)) {
			msg.reply(`The text for '${command}' must be at most ${com.maximum} characters long.`)
			return
		}
	}

	// Check if the parameter is a number.
	if (com.type === "integer") {
		parameter = Number(parameter)
		if (isNaN(parameter)) {
			msg.reply(`Please type '${command} value'. Value must be a number.`)
			return
		}
		if (com.minimum && parameter < Number(com.minimum)) {
			msg.reply(`The number for '${command}' must be at least ${com.minimum}.`)
			return
		}
		if (com.maximum && parameter > Number(com.maximum)) {
			msg.reply(`The number for '${command}' must be at most ${com.maximum}.`)
			return
		}
	}

	// Check if the parameter is a boolean.
	if (com.type === "boolean") {
		parameter = parameter.toLowerCase()
		if (getConfig().textenabled && parameter === getConfig().textenabled) {
			parameter = true
		} else if (getConfig().textdisabled && parameter === getConfig().textdisabled) {
			parameter = false
		} else if (parameter.startsWith("y") || parameter.startsWith("t") || parameter.startsWith("e") || parameter.startsWith("on")) {
			parameter = true
		} else if (parameter.startsWith("n") || parameter.startsWith("f") || parameter.startsWith("d") || parameter.startsWith("of")) {
			parameter = false
		} else {
			msg.reply(`Please type '${command} ${getConfig().textenabled || "On"}' or '${command} ${getConfig().textdisabled || "Off"}'.`)
			return
		}
	}

	// Create a new row if needed.
	if (!outputRow) {
		outputRow = await outputSheet.addRow({ [getConfig().discordtagcolumn]: String(discordTag) })
	}

	// Update the row values.
	if (getConfig().discordnamecolumn) {
		outputRow[getConfig().discordnamecolumn] = String(msg.member.nickname || msg.author.username)
	}
	if (getConfig().discordrankcolumn) {
		outputRow[getConfig().discordrankcolumn] = String(msg.member.roles.highest.name)
	}
	if (getConfig().rankvaluecolumn) {
		outputRow[getConfig().rankvaluecolumn] = String(msg.member.roles.highest.rawPosition)
	}
	if (getConfig().updatedcolumn) {
		outputRow[getConfig().updatedcolumn] = Date.now()
	}
	outputRow[com.reference] = String(parameter)
	await outputRow.save()

	// Report back to the user.
	if (parameter === true) {
		parameter = getConfig().textenabled || "On"
	} else if (parameter === false) {
		parameter = getConfig().textdisabled || "Off"
	}
	if (com.reply) {
		msg.reply(`${com.reply} ${parameter}`)
	} else {
		msg.reply(`${com.reference} set to ${parameter}.`)
	}
})