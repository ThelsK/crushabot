const discordToken = process.env.DISCORD_TOKEN || process.env.discord_token
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.google_client_email
const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gi, "\n") || process.env.google_private_key.replace(/\\n/gi, "\n")
const documentId = process.env.GOOGLE_DOCUMENT_ID || process.env.google_document_id
const botConfig = process.env.GOOGLE_BOT_CONFIG || process.env.google_bot_config || "botconfig"

module.exports = { discordToken, clientEmail, privateKey, documentId, botConfig }