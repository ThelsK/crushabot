const { GoogleSpreadsheet } = require('google-spreadsheet')
const { documentId, clientEmail, privateKey } = require("./environment")
const { setIssue, clearIssue } = require("./issue")

const document = new GoogleSpreadsheet(documentId)
let config // Will store the configuration settings.
let commands // Will store the available commands.
let outputSheet // Will store the output worksheet data.

async function loadDocument() {

	// Load the Document.
	await document.useServiceAccountAuth({
		client_email: clientEmail,
		private_key: privateKey
	})
	await document.loadInfo()
	const sheets = document.sheetsByTitle
	console.log("Google Sheets document:", document.title)

	// Load the Configuration.
	if (!sheets.botconfig) {
		setIssue("Error: Cannot find worksheet with title 'botconfig'.")
		return
	}
	const configRows = await sheets.botconfig.getRows()
	config = []
	configRows.forEach(row => {
		if (row.property) {
			config[row.property] = row.value
		}
	})

	// Load the Commands.
	if (!config.commandsheet) {
		setIssue("Error: Cannot find configuration property 'commandsheet'.")
		return
	}
	if (!sheets[config.commandsheet]) {
		setIssue(`Error: Cannot find worksheet with title '${config.commandsheet}'.`)
		return
	}
	const commandRows = await sheets[config.commandsheet].getRows()
	commands = []
	commandRows.forEach(row => {
		if (row.command) {
			commands[row.command] = {
				type: row.type,
				reference: row.reference,
				reply: row.reply
			}
		}
	})

	// Set the Output sheet.
	if (!config.outputsheet) {
		setIssue("Error: Cannot find configuration property 'outputsheet'.")
		return
	}
	if (!sheets[config.outputsheet]) {
		setIssue(`Error: Cannot find worksheet with title '${config.outputsheet}'.`)
		return
	}
	outputSheet = sheets[config.outputsheet]

	clearIssue()
}

module.exports = { loadDocument, config, commands, outputSheet }