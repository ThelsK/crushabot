const { loadClient } = require("./discordBot")
const { loadDocument } = require("./googleSheet")

const client = loadClient()
let document
let config = {}
let commandSheet
let outputSheet

function redFont(text) {
	return "\x1b[31m".concat(text).concat("\x1b[00m")
}

async function initialize() {
	document = await loadDocument()
	let sheets = document.sheetsByTitle
	const configSheet = sheets.botconfig
	if (!configSheet) {
		console.error(redFont("Error: Cannot find worksheet with title 'botconfig'."))
		return
	}
	const rows = await configSheet.getRows()
	rows.forEach(row => {
		if (row.property) {
			config[row.property] = row.value
		}
	})
	const essentialConfigs = ["commandsheet", "outputsheet"]
	let missingConfig = false
	essentialConfigs.forEach(essentialConfig => {
		if (!config[essentialConfig]) {
			console.error(redFont(`Error: Cannot find configuration property '${essentialConfig}'.`))
			missingConfig = true
		}
	})
	if (missingConfig) {
		return
	}
}
initialize()









client.on("message", msg => {
	if (msg.content.toLowerCase() === "ping") {
		msg.reply("Pong")
	}
})