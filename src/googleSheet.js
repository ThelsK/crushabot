const { GoogleSpreadsheet } = require('google-spreadsheet')
const { documentId, clientEmail, privateKey } = require("./environment")

async function loadDocument() {
	const document = new GoogleSpreadsheet(documentId)
	await document.useServiceAccountAuth({
		client_email: clientEmail,
		private_key: privateKey
	})
	await document.loadInfo()
	console.log("Google Sheets document:", document.title)
	return document
}

module.exports = { loadDocument }