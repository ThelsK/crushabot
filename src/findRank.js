const { getConfig, getRanks } = require("./googleSheet")

function findRank(member) {
	const config = getConfig()
	const ranks = getRanks()

	// The user is not on the server.
	if (!member) {
		if (ranks[config.leftserverrankid]) {
			return ranks[config.leftserverrankid]
		}
		reportError(`Error: Cannot find rank '${config.leftserverrankid}'.`)
		return {
			rankid: config.leftserverrankid,
			rank: "Left the Server",
			weight: 0,
			command: 0,
		}
	}

	// Find the user rank that is listed highest in the list of ranks.
	const rankData = ranks.find(rank => member.roles.cache.find(role => (rank.rankid === role.id)))
	if (rankData) {
		return rankData
	}

	// The user doesn't have a rank that is listed in the list of ranks.
	if (ranks[config.allothersrankid]) {
		return ranks[config.allothersrankid]
	}
	reportError(`Error: Cannot find rank '${config.allothersrankid}'.`)
	return {
		rankid: config.allothersrankid,
		rank: "Left the Server",
		weight: 0,
		command: 0,
	}
}

module.exports = { findRank }