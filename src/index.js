const { checkEnvironments } = require("./environment")
const { authServiceWorker, loadGoogleSheet } = require("./googleSheet")
const { loginDiscordClient } = require("./discordBot")
const { updateUsers } = require("./updateUsers")

async function initialize() {

	// Check Environment variables.
	if (!checkEnvironments()) {
		return
	}

	// Authorize the Google service worker.
	let success = await authServiceWorker()
	if (!success) {
		return
	}

	// Load the Google Sheets document.
	success = await loadGoogleSheet()
	if (!success) {
		return
	}

	// Initialize the Discord client.
	success = await loginDiscordClient()
	if (!success) {
		return
	}

	// Update the Users every hour.
	updateUsers()
	setInterval(updateUsers, 3600000)
}
initialize()