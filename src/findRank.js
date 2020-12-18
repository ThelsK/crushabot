const { getConfig, getRanks } = require("./googleSheet")

function findRank(guild, member) {
	const config = getConfig()
	const ranks = getRanks()

	// The user is not on the server.
	if (!member && !ranks[config.leftserverrankid]) {
		reportError(`Error: Cannot find rank '${config.leftserverrankid}'.`)
		return {
			rankid: config.leftserverrankid,
			rank: "Left the Server",
			weight: 0,
			command: 0
		}
	} else if (!member) {
		return ranks[config.leftserverrankid]
	}

	const rankData = ranks.find(rank => member.roles.cache.find(role => (rank.rankid === role.id)))
	return rankData
}

module.exports = { findRank }