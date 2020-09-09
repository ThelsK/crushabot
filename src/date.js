const dateFormat = require("dateformat")
const { getConfig } = require("./googleSheet")

function getUTCDate(text) {
	const date = new Date(text)
	if (isNaN(date.getTime())) {
		return NaN // To make it easier to detect invalid dates.
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