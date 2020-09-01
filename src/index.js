const { loadClient } = require("./discordBot")
const { loadDocument, config, commands, outputSheet } = require("./googleSheet")

const client = loadClient()
loadDocument()









client.on("message", msg => {
	console.log("Message:", msg)
	if (msg.content.toLowerCase() === "ping") {
		msg.reply("Pong")
	}
})