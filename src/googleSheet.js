const { GoogleSpreadsheet } = require("google-spreadsheet")
const { clientEmail, privateKey, documentId, botConfig } = require("./environment")

const document = new GoogleSpreadsheet(documentId)
let config = [] // Contains loaded configuration settings.
let commands = [] // Contains available commands.
let outputSheet // Contains the output worksheet.
let lastLoad = 0 // Timestamp for when the document was last fully loaded.

const getConfig = () => config
const getCommands = () => commands
const getOutputSheet = () => outputSheet

async function authServiceWorker(reportError) {

	// Authorize the Service Worker.
	await document.useServiceAccountAuth({
		client_email: clientEmail,
		private_key: privateKey
	}).catch(error => {
		reportError(`Error: Unable to authorize the Google service worker.`)
		throw error
	})

	return true
}

async function loadGoogleSheet(reportError) {

	// Only allow the document to be loaded once per ten minutes.
	if (Date.now() < lastLoad + 600000) {
		// Always refresh the header rows of the output sheet.
		if (outputSheet) {
			await outputSheet.loadHeaderRow()
		}
		return true
	}
	lastLoad = Date.now()

	// Load the Document.
	await document.loadInfo().catch(error => {
		reportError(`Error: Unable to load the Google Sheets document.`)
		throw error
	})
	const sheets = document.sheetsByTitle

	// Load the Configuration.
	if (!sheets[botConfig]) {
		reportError(`Error: Cannot find configuration worksheet with title '${botConfig}'.`)
		return
	}
	const configRows = await sheets[botConfig].getRows().catch(error => {
		reportError(`Error: Unable to load configuration from the Google Sheets document.`)
		throw error
	})
	config = []
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
			reportError(`Error: Cannot find configuration property '${mandatoryConfig}'.`)
			return
		}
	}

	// Load the Commands.
	if (!sheets[config.commandsheet]) {
		reportError(`Error: Cannot find command worksheet with title '${config.commandsheet}'.`)
		return
	}
	const commandRows = await sheets[config.commandsheet].getRows().catch(error => {
		reportError(`Error: Unable to load commands from the Google Sheets document.`)
		throw error
	})
	commands = []
	commandRows.forEach(row => {
		if (row.command) {
			commands.push(row)
		}
	})
	console.log("Commands:", commands)

	// Set the Output sheet.
	if (!sheets[config.outputsheet]) {
		reportError(`Error: Cannot find output worksheet with title '${config.outputsheet}'.`)
		return
	}
	outputSheet = sheets[config.outputsheet]

	return true
}

module.exports = { authServiceWorker, loadGoogleSheet, getConfig, getCommands, getOutputSheet }