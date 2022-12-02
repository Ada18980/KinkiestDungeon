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

let KDEnemyPersonalities = {
	"": {weight: 10,
		loose: false,
		strict: false,
		brat: false,
		domVariance: 0.4,
		tags: {
			"robot": -100,
		},
	},
	"Robot": {weight: -100,
		loose: false,
		strict: false,
		brat: false,
		tags: {
			"robot": 200,
		},
	},
	"Dom": {weight: 1,
		loose: false,
		strict: true,
		brat: false,
		tags: {
			"minor": -3,
			"alchemist": 2,
			"elite": 3,
			"boss": 3,
			"robot": -100,
		},
	},
	"Sub": {weight: 0,
		loose: true,
		strict: false,
		brat: false,
		tags: {
			"minor": 3,
			"human": 1,
			"elite": -2,
			"boss": -10,
			"robot": -100,
		},
	},
	"Brat": {weight: 0,
		loose: true,
		strict: false,
		brat: true,
		domMod: 0.7,
		tags: {
			"minor": 3,
			"human": 1,
			"boss": -3,
			"robot": -100,
		},
	},
};

/**
 *
 * @param {entity} enemy
 * @returns {string}
 */
function KDGetPersonality(enemy) {
	let WeightTotal = 0;
	let Weights = [];

	for (let p of Object.entries(KDEnemyPersonalities)) {
		let weight = p[1].weight;
		Weights.push({p: p[0], weight: WeightTotal});
		if (p[1].tags)
			for (let tag of Object.entries(p[1].tags)) {
				if (enemy.Enemy.tags[tag[0]]) weight += tag[1];
			}
		WeightTotal += Math.max(weight, 0);
	}

	let selection = KDRandom() * WeightTotal;

	for (let L = Weights.length - 1; L >= 0; L--) {
		if (selection > Weights[L].weight) {
			if (Weights[L].p != undefined) {
				return Weights[L].p;
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