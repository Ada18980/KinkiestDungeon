"use strict";

let KinkyDungeonFactionColors = {
	"Jail": ["#8A120C"],
	"Slime": ["#9B49BD", "#9B49BD"],
	"Dressmaker": ["#6B48E0", "#F8BD01"],
	"Alchemist": ["#4c6885", "#7bef41"],
	"Elf": ["#63ab3f", "#F8BD01"],
	"Bountyhunter": ["#252525", "#bfbfbf"],
	"AncientRobot": ["#444444", "#4fa4b8"],
	"Dollsmith": ["#444444", "#b1062a", "#ff5277"],
	"Mushy": ["#bfbfbf", "#92c1e8"],
	"Apprentice": ["#686f99", "#ff5277"],
	"Witch": ["#222222", "#8359b3"],
};

/** Hidden factions do not auto-rep change when you attack them */
let KinkyDungeonHiddenFactions = [
	"Plant",
	"Natural",
	"Player",
	"Enemy",
	"Jail",
	"Prisoner",
	"Beast",
	"Slime",
	"Mold",
	"KinkyConstruct",
	"Boss",
	"Ambush",
	"Rage",
	"Ghost",
	"Trap",
	"Rebel",
	"Rock",
	"Delinquent",
	"Wolfhunter",
	"Chase",
	"Mushy",
	"Witch",
];



let KDFactionSecurityMod = {
	Dressmaker: {
		level_magic: 1,
		level_key: 1,
	},
	Witch: {
		level_magic: 1,
		level_key: 1,
	},
	Elemental: {
		level_magic: 2,
	},
	Mushy: {
		level_magic: 1,
		level_tech: 0,
	},
	Apprentice: {
		level_magic: 0,
		level_key: -1,
	},
	Elf: {
		level_magic: 1,
		level_key: 1,
	},
	Bast: {
		level_magic: 1,
	},
	AncientRobot: {
		level_tech: 2,
		level_key: 1,
	},
	Nevermere: {
		level_tech: 1,
		level_key: 1,
	},
	Maidforce: {
		level_tech: 0,
		level_magic: -1,
		level_key: 1,
	},
	Alchemist: {
		level_tech: 1,
		level_magic: -1,
	},
	Bountyhunter: {
		level_tech: 0,
		level_key: 2,
	},
};

let KDBaseSecurity = {
	level_key: 0,
};

let KDPiousFactions = {
	"Angel": 1.0,
};

/** Shows tooltips for these factions even though they are hidden */
let KinkyDungeonTooltipFactions = [
	"Rebel",
	"Ambush",
	"Delinquent",
	"Wolfhunter",
	"Rock",
	"Rage",
];

/** Tag for these factions, these also can have increased chances to appear on a map */
let KinkyDungeonFactionTag = {
	Bountyhunter: "bountyhunter",
	Bandit: "bandit",
	Alchemist: "alchemist",
	Nevermere: "nevermere",
	Apprentice: "apprentice",
	Dressmaker: "dressmaker",
	//Witch: "witch",
	Elemental: "elemental",
	Dragon: "dragon",
	Maidforce: "maid",
	Bast: "mummy",
	Elf: "elf",
	//Mushy: "mushy",
	AncientRobot: "robot",
};

let KinkyDungeonFactionRelationsBase = {
	"Player": {
		Enemy: -1.0,
		Jail: -1.0,
		Prisoner: 0.1,

		// Wild factions
		KinkyConstruct: -0.9,
		Plant: -0.9,
		Slime: -1.0,
		Mold: -1.0,
		Beast: -0.6,

		// Mainline factions
		Bountyhunter: -0.3,
		Bandit: -0.7,
		Alchemist: -0.2,
		Nevermere: -0.1,
		Apprentice: 0.2,
		Dressmaker: -0.4,
		Witch: -0.8,
		Elemental: -0.6,
		Dragon: 0.1,
		Maidforce: -0.1,
		Bast: -0.6,
		Elf: -0.3,
		Mushy: -0.6,
		AncientRobot: -0.4,

		// Special factions
		Angel: 0.1,
		Demon: -0.25,
	},
	"Angel": {
		Demon: -1.0,
		Ghost: -0.7,
		Elemental: 0.15,
		Dragon: 0.05,
		AncientRobot: -0.25,
		Nevermere: -0.1,
		Enemy: 0.1,
	},
	"Natural": {
		Player: -1,
		Jail: -1,
	},
	"Ghost": {
		Player: -1.0,
		Jail: -0.25,
	},
	"Rock": {
		Player: -1.0,
	},
	"Rebel": {
		Jail: -0.1,
	},
	"Demon": {
		Elf: -1.0,
		Bast: -1.0,
		Witch: 0.25,

		Bountyhunter: -0.5,
		Bandit: -0.5,
		Alchemist: -0.5,
		Nevermere: -0.5,
		Apprentice: -0.5,
		Dressmaker: -0.5,
		Elemental: -0.1,
		Dragon: -1.0,
		Maidforce: -0.5,
		Mushy: -0.5,
		AncientRobot: -0.45,
	},
	"Enemy": {
		KinkyConstruct: .1,
		Dragon: .1,
		Bountyhunter: .1,
		Bandit: .1,
		Alchemist: .1,
		Nevermere: .1,
		Apprentice: .1,
		Dressmaker: .1,
		Witch: .1,
		Elemental: .1,
		Maidforce: .1,
		Bast: .1,
		Elf: .1,
		Mushy: .1,
		AncientRobot: .1,
	},
	"Delinquent": {
		Player: -1,
		Maidforce: -1,
		Chase: -1,
	},
	"Wolfhunter": {
		Player: -1,
		Nevermere: -1,
		Chase: -1,
	},
	"Trap": {
		Enemy: 1.0,
		Jail: 1.0,
		Prisoner: 1,

		// Wild factions
		KinkyConstruct: 1,
		Plant: 1,
		Slime: 1,
		Mold: 1,
		Beast: 1,

		Bountyhunter: 1,
		Bandit: 1,
		Alchemist: 1,
		Nevermere: 1,
		Apprentice: 1,
		Dressmaker: 1,
		Witch: 1,
		Elemental: 1,
		Dragon: 1,
		Maidforce: 1,
		Bast: 1,
		Elf: 1,
		Mushy: 1,
		AncientRobot: 1,

		// Special factions
		Angel: 1,
		Demon: 1,


		Chase: -1,
	},
	"Boss": {
		Chase: -1,
	},
	"Chase": {
		// Dummy faction, used for deciding if a faction will make you go On The Run
	},
	"Ambush": {
		Player: -1.0,
		Jail: -0.25,

		Chase: -1,
	},
	"Prisoner": {
	},
	"Jail": {
	},
	"Slime": {
		Jail: -0.25,

		Bountyhunter: -0.5,
		Bandit: -0.6,
		Alchemist: -0.8,
		Nevermere: -0.55,
		Apprentice: -0.55,
		Dressmaker: -0.4,
		Witch: 0.4,
		Elemental: -0.4,
		Dragon: -1.0,
		Maidforce: -1.0,
		Bast: -0.1,
		Elf: -0.1,
		Mushy: 0.1,
		AncientRobot: -1.0,
	},
	"Mold": {
		Jail: -0.25,

		Enemy: -0.5,
		Bountyhunter: -0.5,
		Bandit: -0.6,
		Alchemist: -0.8,
		Nevermere: -0.55,
		Apprentice: -0.55,
		Dressmaker: -0.5,
		Witch: -0.5,
		Elemental: -0.5,
		Dragon: -1.0,
		Maidforce: -1.0,
		Bast: -0.5,
		Elf: -0.5,
		Mushy: -0.5,
		AncientRobot: -1.0,
	},
	"Beast": {
		Jail: -0.25,

		Bountyhunter: -0.4,
		Bandit: -0.4,
		Alchemist: -0.4,
		Nevermere: -0.4,
		Apprentice: -0.4,
		Dressmaker: -0.4,
		Witch: -0.1,
		Elemental: -0.4,
		Dragon: -1.0,
		Maidforce: -0.4,
		Mushy: -0.4,
		AncientRobot: -1.0,
	},
	"KinkyConstruct": {
		Jail: -0.25,
		Apprentice: -0.55,
		Witch: 0.4,
		Dressmaker: 0.4,
		Dragon: -1.0,
	},
	"Plant": {
		Jail: -0.25,
	},
	"Nevermere": {
		"Alchemist": 1.0,
		"Bast": -0.55,
		"Mushy": -0.4,
		"Bandit": 0.3,
		"Apprentice": 0.15,
		"AncientRobot": -0.51,
	},
	"Alchemist": {
		"Bandit": 0.15,
		"AncientRobot": -0.55,
		"Dressmaker": -0.25,
	},
	"Bountyhunter": {
		"Jail": 0.8,
		"Dragon": 0.4,
		"Bandit": -0.55,
		"Maidforce": -0.15,
		"Witch": -0.4,
		"Dressmaker": 0.5,
		"Nevermere": 0.75,
	},
	"Elf": {
		"Mushy": 1.0,
		"Beast": 1.0,
	},
	"Bast": {
		"Elf": -1.0,
		"Witch": -0.4,
		"Beast": 0.55,
	},
	"Bandit": {
		"Mushy": -0.6,
	},
	"Elemental": {
		"KinkyConstruct": 0.55,
		"Dressmaker": 0.35,
		"Witch": 0.15,
		"Bandit": -0.15,
		"Elf": 0.5,
		"Bast": -0.35,
		"Dragon": -0.5,
		"AncientRobot": -0.15,
	},
	"AncientRobot": {
		"Bast": 0.55,
		"Elf": -0.6,
		//"Maidforce": 0.55,
		//"Dragon": 0.45,
		//"Dressmaker": 0.55,
		//"Apprentice": 0.52,
	},
	"Dragon": {
		"Jail": 1.0,
		"Apprentice": 0.4,
		"Bandit": -0.6,
		"Witch": -0.4,
		"Alchemist": -0.15,
		"Beast": -1.0,
		"Mushy": 0.15,
	},
	"Mushy": {
		"Alchemist": -0.55,
		"Elemental": 0.25,
	},
	"Witch": {
		"Elf": -1.0,
	},
	"Dressmaker": {
		"Witch": 0.15,
		"Nevermere": 0.8,
		"Bandit": -0.5,
		"Dragon": -0.5,
	},
	"Apprentice": {
		"Jail": 1.0,
		"Elf":  0.75,
	},
	"Maidforce": {
		"Alchemist": 0.55,
		"Jail": 0.55,
		"Dragon": 0.55,
		"Apprentice": 0.55,
		"Bandit": -0.6,
		"Witch": -0.4,
	},
};

let KinkyDungeonFactionRelations = Object.assign({}, KinkyDungeonFactionRelationsBase);

function KDFactionRelation(a, b) {
	if (a == "Rage" || b == "Rage") return -1.0;
	if (a == b) return 1.0;
	if (KDFactionRelations.get(a) && KDFactionRelations.get(a).get(b)) {
		return KDFactionRelations.get(a).get(b);
	}
	return 0.0;
}

/**
 * @type {Map<string, Map<string, number>>};
 */
let KDFactionRelations = new Map();

function KDInitFactions(Reset) {
	if (Reset) {
		KinkyDungeonFactionRelations = Object.assign({}, KinkyDungeonFactionRelationsBase);
		for (let relation of Object.entries(KinkyDungeonFactionRelationsBase)) {
			KinkyDungeonFactionRelations[relation[0]] = Object.assign({}, KinkyDungeonFactionRelationsBase[relation[0]]);
		}
	}

	for (let f of Object.keys(KinkyDungeonFactionRelationsBase)) {
		if (!KinkyDungeonFactionRelations[f]) {
			KinkyDungeonFactionRelations[f] = Object.assign(KinkyDungeonFactionRelationsBase[f]);
		}
	}

	KDFactionRelations = new Map();
	// For each faction in faction relations we create all the maps
	for (let f1 of Object.entries(KinkyDungeonFactionRelationsBase)) {
		let fmap = new Map();

		KDFactionRelations.set(f1[0], fmap);
	}
	// Next we create the faction relationships
	for (let f1 of Object.entries(KinkyDungeonFactionRelations)) {
		let fmap = KDFactionRelations.get(f1[0]);
		for (let f2 of Object.entries(f1[1])) {
			// Set mutual opinions
			fmap.set(f2[0], f2[1]);
			if (!KDFactionRelations.get(f2[0])) {
				console.log("Could not find faction " + f2[0]);
			}
			KDFactionRelations.get(f2[0]).set(f1[0], f2[1]);
		}
	}
}

/**
 * Sets faction relation and refreshes the map
 * @param {string} a
 * @param {string} b
 * @param {number} relation
 */
function KDSetFactionRelation(a, b, relation) {
	if (a == "Rage" || b == "Rage") return;
	if (KinkyDungeonFactionRelations[a])
		KinkyDungeonFactionRelations[a][b] = Math.max(-1, Math.min(1, relation));
	if (KinkyDungeonFactionRelations[b])
		KinkyDungeonFactionRelations[b][a] = Math.max(-1, Math.min(1, relation));
	KDInitFactions();
}

/**
 * Changes faction relation and refreshes the map
 * @param {string} a
 * @param {string} b
 * @param {number} amount
 */
function KDChangeFactionRelation(a, b, amount, AffectRivals) {
	if (a == "Rage" || b == "Rage") return;
	if (!KinkyDungeonFactionRelations[a]) KinkyDungeonFactionRelations[a] = KinkyDungeonFactionRelationsBase[a] || 0;
	if (!KinkyDungeonFactionRelations[b]) KinkyDungeonFactionRelations[b] = KinkyDungeonFactionRelationsBase[b] || 0;

	let amountSetTo = 0;
	let amountSet = false;

	if (KinkyDungeonFactionRelations[a]) {
		if (!KinkyDungeonFactionRelations[a][b] && KinkyDungeonFactionRelations[b][a])
			KinkyDungeonFactionRelations[a][b] = KinkyDungeonFactionRelations[b][a];
		else if (!KinkyDungeonFactionRelations[a][b]) KinkyDungeonFactionRelations[a][b] = 0;
		amountSetTo = Math.max(-1, Math.min(1, KinkyDungeonFactionRelations[a][b] + amount));
		KinkyDungeonFactionRelations[a][b] = amountSetTo;
		amountSet = true;
	}

	if (KinkyDungeonFactionRelations[b]) {
		if (!KinkyDungeonFactionRelations[b][a] && KinkyDungeonFactionRelations[a][b])
			KinkyDungeonFactionRelations[b][a] = KinkyDungeonFactionRelations[a][b];
		else if (!KinkyDungeonFactionRelations[b][a]) KinkyDungeonFactionRelations[b][a] = 0;
		KinkyDungeonFactionRelations[b][a] = amountSet ? amountSetTo : Math.max(-1, Math.min(1, KinkyDungeonFactionRelations[b][a] + amount));
	}

	if (AffectRivals && a == "Player") {
		for (let faction of Object.keys(KinkyDungeonFactionRelations)) {
			if (!KinkyDungeonHiddenFactions.includes(faction) && faction != a && faction != b) {
				let relation = KDFactionRelation(b, faction);
				KDChangeFactionRelation("Player", faction, amount * relation);
			}
		}
	}
	KDInitFactions();
}
