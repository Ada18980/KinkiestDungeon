
interface RecyclerResource {
	/** Number is base yield, minimum 1 */
	Yield: number,
	/** Processed per floor, per servant */
	Rate: number,
}

let RecyclerResources: Record<string, RecyclerResource> = {
	Rope: {
		Yield: 20,
		Rate: 100,
	},
	Leather: {
		Yield: 12,
		Rate: 25,
	},
	Metal: {
		Yield: 5,
		Rate: 8,
	},
	Latex: {
		Yield: 12,
		Rate: 30,
	},
	Rune: {
		Yield: 0.0001,
		Rate: 4,
	},
}

interface RecyclerOutputs {
	Rope: number,
	Leather: number,
	Metal: number,
	Latex: number,
	Rune: number,
}

function KDGetRecyclerRate(Servants: number[]): Record<string, number> {
	let output = {};
	let mult = 0;
	for (let id of Servants) {
		let servant = KDGetServantEnemy(KDGameData.Collection["" + id]);
		if (servant) {
			mult += 0.8 + KDEnemyTypeRank(servant);
		}
	}
	for (let resource of Object.keys(RecyclerResources)) {
		let resourceInput = KDGameData.FacilitiesData["RecyclerInput_" + resource];
		let resourceRate = Math.min(resourceInput, mult * RecyclerResources[resource].Rate);
		output[resource] = Math.ceil(resourceRate);
	}
	return output;
}