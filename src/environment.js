const discordToken = process.env.CRUSHABOT_DISCORD_TOKEN || process.env.crushabot_discord_token
	|| process.env.DISCORD_TOKEN || process.env.discord_token
const clientEmail = process.env.CRUSHABOT_GOOGLE_CLIENT_EMAIL || process.env.crushabot_google_client_email
	|| process.env.GOOGLE_CLIENT_EMAIL || process.env.google_client_email
const privateKey = `${process.env.CRUSHABOT_GOOGLE_PRIVATE_KEY || process.env.crushabot_google_private_key
	|| process.env.GOOGLE_PRIVATE_KEY || process.env.google_private_key || ""}`.replace(/\\n/gi, "\n")
const documentId = process.env.CRUSHABOT_GOOGLE_DOCUMENT_ID || process.env.crushabot_google_document_id
	|| process.env.GOOGLE_DOCUMENT_ID || process.env.google_document_id
const botConfig = process.env.CRUSHABOT_GOOGLE_BOT_CONFIG || process.env.crushabot_google_bot_config
	|| process.env.GOOGLE_BOT_CONFIG || process.env.google_bot_config || "botconfig"

function checkEnvironments(reportError) {
	const environments = [
		{ key: "CRUSHABOT_DISCORD_TOKEN", value: discordToken },
		{ key: "CRUSHABOT_GOOGLE_CLIENT_EMAIL", value: clientEmail },
		{ key: "CRUSHABOT_GOOGLE_PRIVATE_KEY", value: privateKey },
		{ key: "CRUSHABOT_GOOGLE_DOCUMENT_ID", value: documentId },
	]
	for (let i in environments) {
		const environment = environments[i]
		if (!environment.value) {
			reportError(`Error: Cannot find environment variable '${environment.key}'.`)
			return
		}
	}

	return true
}

module.exports = { discordToken, clientEmail, privateKey, documentId, botConfig, checkEnvironments }