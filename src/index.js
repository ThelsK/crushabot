const { checkEnvironments } = require("./environment")
const { authServiceWorker, loadGoogleSheet } = require("./googleSheet")
const { loginDiscordClient } = require("./discordBot")
const { reportError } = require("./error")
const { handleMessage } = require("./handleMessage")
const { updateUsers } = require("./updateUsers")

async function initialize() {

	// Check Environment variables.
	if (!checkEnvironments(reportError)) {
		process.exit()
	}

	// Authorize the Google service worker.
	let success = await authServiceWorker(reportError)
	if (!success) {
		process.exit()
	}

	// Load the Google Sheets document.
	success = await loadGoogleSheet(reportError)
	if (!success) {
		process.exit()
	}

	// Initialize the Discord client.
	success = await loginDiscordClient(reportError, handleMessage)
	if (!success) {
		process.exit()
	}

	// Update the Users every hour.
	updateUsers()
	setInterval(updateUsers, 3600000)
	console.log("Initialization completed.")
}
initialize()