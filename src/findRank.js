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

	// The user doesn't have a rank that is listed in the list of ranks.
	if (!rankData) {
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

	// Rebuild the rankData, so that adjusting the weight or command value does not adjust the original data.
	rankData = {
		rankid: rankData.rankid,
		rank: rankData.rank,
		weight: 0,
		command: 0,
	}

	// Calculate the weight and command value for users that match multiple ranks.
	ranks.forEach(rank => {
		if (member.roles.cache.find(role => rank.rankid === role.id)) {

			// Update the weight.
			if (config.addweight === "TRUE") {
				rankData.weight += rank.weight
			} else if (rankData.weight < rank.weight) {
				rankData.weight = rank.weight
			}

			// Update the command value.
			if (rankData.command < rank.command) {
				rankData.command = rank.command
			}
		}
	})

	// Adhere to maximum weight.
	if (config.maxweight && rankData.weight > config.maxweight) {
		rankData.weight = config.maxweight
	}
	return rankData
}

module.exports = { findRank }