function reportError(error) {
	console.error(`\x1b[31m${error}\x1b[00m`)
}

module.exports = { reportError }