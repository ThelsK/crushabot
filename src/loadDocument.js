const { GoogleSpreadsheet } = require('google-spreadsheet')
async function loadDocument() {
	console.log("Attempting to Load Document.")
	const document = new GoogleSpreadsheet(process.env.GOOGLE_DOCUMENT_ID)
	console.log("Declared Document.")
	await document.useServiceAccountAuth({
		client_email: process.env.GOOGLE_CLIENT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gi, "\n")
	})
	console.log("Authenticated.")
	await document.loadInfo()
	console.log("Loaded Document:", document.title)
}

module.exports = loadDocument