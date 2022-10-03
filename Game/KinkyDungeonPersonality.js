"use strict";

let KDJailPersonalities = {
	"Robot": true,
	"Dom": true,
	"Sub": true,
};

let KDStrictPersonalities = [
	"Dom",
];
let KDLoosePersonalities = [
	"Sub",
];

let KDEnemyPersonalities = [
	{name: "", weight: 10,
		tags: {
			"robot": -100,
		},
	},
	{name: "Robot", weight: -100,
		tags: {
			"robot": 200,
		},
	},
	{name: "Dom", weight: 1,
		tags: {
			"minor": -3,
			"alchemist": 2,
			"elite": 3,
			"boss": 3,
			"robot": -100,
		},
	},
	{name: "Sub", weight: 0,
		tags: {
			"minor": 3,
			"human": 1,
			"elite": -2,
			"boss": -10,
			"robot": -100,
		},
	},
];

/**
 *
 * @param {entity} enemy
 * @returns {string}
 */
function KDGetPersonality(enemy) {
	let WeightTotal = 0;
	let Weights = [];

	for (let p of KDEnemyPersonalities) {
		let weight = p.weight;
		Weights.push({p: p, weight: WeightTotal});
		if (p.tags)
			for (let tag of Object.entries(p.tags)) {
				if (enemy.Enemy.tags[tag[0]]) weight += tag[1];
			}
		WeightTotal += Math.max(weight, 0);
	}

	let selection = KDRandom() * WeightTotal;

	for (let L = Weights.length - 1; L >= 0; L--) {
		if (selection > Weights[L].weight) {
			if (Weights[L].p.name != undefined) {
				return Weights[L].p.name;
			}
			return "";
		}
	}

	return "";
}

/**
 *
 * @param {entity} enemy
 * @returns {string}
 */
function KDJailPersonality(enemy) {
	return (enemy.personality && KDJailPersonalities[enemy.personality]) ? enemy.personality : "";
}