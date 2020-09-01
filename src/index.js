const { loadClient } = require("./discordBot")
const { loadDocument } = require("./googleSheet")

const client = loadClient()
const document = loadDocument()

client.on("message", msg => {
	if (msg.content.toLowerCase() === "ping") {
		msg.reply("Pong")
	}
})