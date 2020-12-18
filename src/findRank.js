const { getConfig, getRanks } = require("./googleSheet")
const { reportError } = require("./error")

function findRank(member) {
	const config = getConfig()
	const ranks = getRanks()
	let rankData = {}

	// The user is not on the server.
	if (!member) {
		rankData = ranks.find(rankEntry => rankEntry.rankid === config.leftserverrankid)
		if (!rankData) {
			reportError(`Error: Cannot find rank '${config.leftserverrankid}'.`)
			rankData = {
				rankid: config.leftserverrankid,
				rank: "Left the server",
				weight: 0,
				command: 0,
			}
		}
		return rankData
	}

	// Find the user rank that is listed highest in the list of ranks.
	rankData = ranks.find(rank => member.roles.cache.find(role => rank.rankid === role.id))
	if (rankData) {
		return rankData
	}

	// The user doesn't have a rank that is listed in the list of ranks.
	rankData = ranks.find(rankEntry => rankEntry.rankid === config.allothersrankid)
	if (!rankData) {
		reportError(`Error: Cannot find rank '${config.allothersrankid}'.`)
		rankData = {
			rankid: config.allothersrankid,
			rank: "Rank not found",
			weight: 0,
			command: 0,
		}
	}
	return rankData
}

module.exports = { findRank }