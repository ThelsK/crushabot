const { GoogleSpreadsheet } = require('google-spreadsheet')

async function loadDocument() {
	const document = new GoogleSpreadsheet(process.env.GOOGLE_DOCUMENT_ID)
	await document.useServiceAccountAuth({
		client_email: process.env.GOOGLE_CLIENT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gi, "\n")
	})
	await document.loadInfo()
	console.log("Document loaded:", document.title)
	return document
}

module.exports = { loadDocument }