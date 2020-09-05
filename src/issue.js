let issue = "Initial value."

function setIssue(newIssue, silent) {
	issue = newIssue
	if (!silent) {
		console.error(`\x1b[31m${issue}\x1b[00m`)
	}
}

function clearIssue() {
	issue = ""
}

const getIssue = () => issue

module.exports = { getIssue, setIssue, clearIssue }