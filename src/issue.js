let issue = "Still initializing. Please try again in 10 seconds."

function setIssue(newIssue) {
	issue = newIssue
	console.error("\x1b[31m".concat(text).concat("\x1b[00m"))
}

function clearIssue() {
	issue = ""
}

module.exports = { issue, setIssue, clearIssue }