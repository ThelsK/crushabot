const dateFormat = require("dateformat")
const { getConfig } = require("./googleSheet")

function getUTCDate(text) {
	console.log("text:", text)
	const date = new Date(text)
	console.log("date:", date)
	if (isNaN(date.getTime())) {
		return NaN
	}
	let dateString = date.toString()
	dateString = dateString.substr(0, dateString.indexOf("GMT") + 3)
	return new Date(dateString)
}

function formatDate(date) {
	const format = getConfig().dateformat || "dddd dd mmmm yyyy, HH:MM:ss"
	return dateFormat(date, `UTC:${format}`)
}

module.exports = { getUTCDate, formatDate }