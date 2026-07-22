"use strict";

let KDJailPersonalities = {
	"Robot": true,
	"Dom": true,
	"Sub": true,
	"": true,
};

let KDStrictPersonalities = [
	"Dom",
	"Voyeur",
	"Protocol",
];
let KDLoosePersonalities = [
	"Sub",
];
let KDBratPersonalities = [
	"Brat",
];

let KDBuyerPersonalities = [
	"Sub",
	"Brat",
	"",
	"Dom",
	"Protocol",
];
let KDBuyerPersonalities_Comment = [
	"Robot",
	"Sub",
	"Brat",
	"",
	"Dom",
	"Protocol",
	"Voyeur"
];




let KDPreferredSubTypeWeights: Record<string, ((enemy: entity, player?: entity) => number)[]> = {
	PillowPrincess: [
		(en) => {
			if (KDGetPersonality(en) == "Voyeur") return 0.1;
			if (KDGetPersonality(en) == "Protocol") return 10;
			if (KDGetPersonality(en) == "Brat") return 0;
			return KDLoosePersonalities.includes(KDGetPersonality(en)) ? 2 : (
				KDStrictPersonalities.includes(KDGetPersonality(en)) ? 5 : 0.1
			);
		},
	],
	Cute: [
		(en) => {
			if (KDGetPersonality(en) == "Voyeur") return 3;
			if (KDGetPersonality(en) == "Protocol") return 6;
			return KDBratPersonalities.includes(KDGetPersonality(en)) ? 0.25 : (
				KDLoosePersonalities.includes(KDGetPersonality(en)) ? 2 : 1
			);
		},
	],
	Brat: [
		(en) => {
			if (KDGetPersonality(en) == "Voyeur") return 3;
			return KDBratPersonalities.includes(KDGetPersonality(en)) ? 3 : (
				KDStrictPersonalities.includes(KDGetPersonality(en)) ? 3 : 0
			);
		},
	],
	Rough: [
		(en) => {
			if (KDGetPersonality(en) == "Voyeur") return 3;
			if (KDGetPersonality(en) == "Sub") return 0;
			return KDLoosePersonalities.includes(KDGetPersonality(en)) ? 2 : (
				KDStrictPersonalities.includes(KDGetPersonality(en)) ? 3 : 0
			);
		},
	],
}



let KDPreferredDomTypeWeights: Record<string, ((enemy: entity, player?: entity) => number)[]> = {
	Protocol: [
		(en) => {
			return KDLoosePersonalities.includes(KDGetPersonality(en)) ? 4: (
				KDStrictPersonalities.includes(KDGetPersonality(en)) ? 2 : 2
			);
		},
	],
	Strict: [
		(en) => {
			return KDBratPersonalities.includes(KDGetPersonality(en)) ? 2.25 : (
				KDLoosePersonalities.includes(KDGetPersonality(en)) ? 2 : 1.5
			);
		},
	],
	Gentle: [
		(en) => {
			return KDLoosePersonalities.includes(KDGetPersonality(en)) ? 5 : (
				KDStrictPersonalities.includes(KDGetPersonality(en)) ? 1 : 0.5
			);
		},
	],
	Mean: [
		(en) => {
			return KDBratPersonalities.includes(KDGetPersonality(en)) ? 5 : (
				KDStrictPersonalities.includes(KDGetPersonality(en)) ? 2 : 1
			);
		},
	],
}


let KDEnemyPersonalities = {
	"": {weight: 10,
		loose: false,
		strict: false,
		brat: false,
		domVariance: 0.4,
		submissiveness: 0.25,
		tags: {
			"robot": -100,
			"switch": 10,
			"veryswitch": 100,
			"nobrain": -100,
		},
	},
	"Robot": {weight: -100,
		loose: false,
		strict: false,
		brat: false,
		submissiveness: 0.25,
		tags: {
			"robot": 200,
			"cyborg": -200,
			"nobrain": -100,
		},
	},
	"NoBrain": {weight: -100,
		loose: false,
		strict: false,
		brat: false,
		submissiveness: 0.0,
		tags: {
			"nobrain": 200,
		},
	},
	"Dom": {weight: 1,
		loose: false,
		strict: true,
		brat: false,
		submissiveness: 0,
		tags: {
			"minor": -3,
			"alchemist": 2,
			"elite": 3,
			"boss": 3,
			"robot": -100,
			"cyborg": 100,
			"submissive": -10,
			"dom": 10,
			"verydom": 100,
			"nobrain": -100,
		},
	},
	
	/*"Protocol": {weight: 0,
		loose: false,
		strict: true,
		brat: false,
		submissiveness: 0,
		tags: {
			"minor": -3,
			"alchemist": 2,
			"elite": 3,
			"boss": 3,
			"robot": -100,
			"cyborg": 100,
			"submissive": -10,
			"dom": 5,
			"verydom": 50,
			"nobrain": -100,
		},
	},*/
	
	"Voyeur": {weight: 1.5,
		loose: false,
		strict: true,
		brat: false,
		submissiveness: 0,
		tags: {
			"minor": 3,
			"elite": 1,
			"robot": -100,
			"cyborg": 100,
			"submissive": -4,
			"dom": 3,
			"verydom": 1,
			"nobrain": -100,
		},
	},
	"Sub": {weight: 0,
		loose: true,
		strict: false,
		brat: false,
		submissiveness: 1.0,
		tags: {
			"minor": 3,
			"human": 1,
			"elite": -2,
			"boss": -10,
			"robot": -100,
			"cyborg": 100,
			"submissive": 10,
			"sub": 10,
			"verysub": 100,
			"nobrain": -100,
		},
	},
	"Brat": {weight: 0,
		loose: true,
		strict: false,
		brat: true,
		domMod: 0.7,
		domVariance: 0.2,
		submissiveness: 0.75,
		tags: {
			"minor": 3,
			"brat": 10,
			"verybrat": 100,
			"human": 1,
			"boss": -3,
			"robot": -100,
			"nobrain": -100,
			"cyborg": 100,
			"submissive": 1,
		},
	},
};

/**
 * Do NOT call this during UI loop, as can lead to desyncs in future w/ replay system or possible netcode
 * @param enemy
 */
function KDGetPersonality(enemy: entity): string {
	if (!enemy.Enemy) return undefined;
	if (enemy.personality) return enemy.personality;
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
 * @param Enemy
 */
function KDGetPersonalityType(Enemy: enemy): string {
	let WeightTotal = 0;
	let Weights = [];

	for (let p of Object.entries(KDEnemyPersonalities)) {
		let weight = p[1].weight;
		Weights.push({p: p[0], weight: WeightTotal});
		if (p[1].tags)
			for (let tag of Object.entries(p[1].tags)) {
				if (Enemy.tags[tag[0]]) weight += tag[1];
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
 * Gets personality for generic jail dialogue
 * much more limited subset than the total personalities. defaults to switch ("")
 * @param enemy
 */
function KDJailPersonality(enemy: entity): string {
	return (enemy.personality && KDJailPersonalities[enemy.personality]) ? enemy.personality : "";
}

function KDEnemyGetPreferredSubType(en: entity, player?: entity, cache?: boolean): string {
	if (en.preferredSubType) return en.preferredSubType;
	let weights : Record<string, number> = {};

	for (let type in KDPreferredSubTypeWeights) {
		let w = 0;
		for (let item of KDPreferredSubTypeWeights[type]) {
			w += item(en, player);
		}
	}

	let val = KDGetByWeight(weights) || "Cute";

	if (cache) en.preferredSubType = val;
	return val;
}

function KDEnemyGetPreferredDomType(en: entity, player?: entity, cache?: boolean): string {
	if (en.preferredDomType) return en.preferredDomType;
	let weights : Record<string, number> = {};

	for (let type in KDPreferredDomTypeWeights) {
		let w = 0;
		for (let item of KDPreferredDomTypeWeights[type]) {
			w += item(en, player);
		}
	}

	let val = KDGetByWeight(weights) || "Cute";

	if (cache) en.preferredDomType = val;
	return val;
}