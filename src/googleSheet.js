const { GoogleSpreadsheet } = require('google-spreadsheet')
const { clientEmail, privateKey, documentId, botConfig } = require("./environment")
const { setIssue, clearIssue } = require("./issue")

const document = new GoogleSpreadsheet(documentId)
let config // Will store the configuration settings.
let commands // Will store the available commands.
let outputSheet // Will store the output worksheet reference.

const getConfig = () => config
const getCommands = () => commands
const getOutputSheet = () => outputSheet

async function loadDocument() {
	setIssue(`Initializing data. Please try again in a couple of seconds.`, "silent")
	config = []
	commands = []
	outputsheet = null

	// Check the Environment variables.
	if (!clientEmail) {
		setIssue(`Error: ENV variable GOOGLE_CLIENT_EMAIL not set.`)
		return
	}
	if (!privateKey) {
		setIssue(`Error: ENV variable GOOGLE_PRIVATE_KEY not set.`)
		return
	}
	if (!documentId) {
		setIssue(`Error: ENV variable GOOGLE_DOCUMENT_ID not set.`)
		return
	}

	// Authorize the Service Worker.
	await document.useServiceAccountAuth({
		client_email: clientEmail,
		private_key: privateKey
	}).catch(error => {
		setIssue(`Error: Unable to authorize the Google service worker.`)
		throw error
	})

	// Load the Document.
	await document.loadInfo().catch(error => {
		setIssue(`Error: Unable to load the Google Sheets document.`)
		throw error
	})
	const sheets = document.sheetsByTitle
	console.log("Google Sheets document:", document.title)

	// Load the Configuration.
	if (!sheets[botConfig]) {
		setIssue(`Error: Cannot find worksheet with title '${botConfig}'.`)
		return
	}
	const configRows = await sheets.botconfig.getRows().catch(error => {
		setIssue(`Error: Unable to load configuration from the Google Sheets document.`)
		throw error
	})
	configRows.forEach(row => {
		if (row.property) {
			config[row.property] = row.value
		}
	})

	// Check for mandatory configuration settings.
	const mandatoryConfigs = ["commandsheet", "outputsheet", "serverid", "discordtagcolumn"]
	for (let i in mandatoryConfigs) {
		const mandatoryConfig = mandatoryConfigs[i]
		if (!config[mandatoryConfig]) {
			setIssue(`Error: Cannot find configuration property '${mandatoryConfig}'.`)
			return
		}
	}

	// Load the Commands.
	if (!sheets[config.commandsheet]) {
		setIssue(`Error: Cannot find worksheet with title '${config.commandsheet}'.`)
		return
	}
	const commandRows = await sheets[config.commandsheet].getRows().catch(error => {
		setIssue(`Error: Unable to load commands from the Google Sheets document.`)
		throw error
	})
	commandRows.forEach(row => {
		if (row.command) {
			commands[row.command] = row
		}
	})

	// Set the Output sheet.
	if (!sheets[config.outputsheet]) {
		setIssue(`Error: Cannot find worksheet with title '${config.outputsheet}'.`)
		return
	}
	outputSheet = sheets[config.outputsheet]

	// Cleanup.
	clearIssue()
	console.log(`Google Sheets document loaded successfully.`)
}

module.exports = { loadDocument, getConfig, getCommands, getOutputSheet }