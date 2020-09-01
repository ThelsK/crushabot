let issue = "Still initializing. Please try again in one minute."

function setIssue(newIssue) {
	issue = newIssue
	console.error("\x1b[31m".concat(issue).concat("\x1b[00m"))
}

function clearIssue() {
	issue = ""
}

const getIssue = () => issue

module.exports = { getIssue, setIssue, clearIssue }