"use strict";

/** No dialogues will trigger when the player dist is higher than this */
let KinkyDungeonMaxDialogueTriggerDist = 5.9;

/** @type {Record<string, KinkyDialogueTrigger>} */
let KDDialogueTriggers = {
	"WeaponStop": {
		dialogue: "WeaponFound",
		allowedPrisonStates: ["parole"],
		excludeTags: ["zombie", "skeleton", "gagged"],
		playRequired: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		prerequisite: (enemy, dist, AIData) => {
			return (KinkyDungeonPlayerDamage
				&& !KinkyDungeonPlayerDamage.unarmed
				&& KinkyDungeonPlayerDamage.name
				&& dist < 3.9
				&& KDHostile(enemy)
				&& KDRandom() < 0.25
				&& !KinkyDungeonFlags.has("demand"));
		},
		weight: (enemy, dist) => {
			return KDStrictPersonalities.includes(enemy.personality) ? 10 : 1;
		},
	},
	"OfferDress": KDDialogueTriggerOffer("OfferDress", ["Rope", "Conjure"], ["bindingDress"],
		["parole", ""],  ["Sub", "Brat"],
		["dressmaker", "bindingDress"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferKigu": KDDialogueTriggerOffer("OfferKigu", ["Latex", "Conjure"], ["kiguRestraints"],
		["parole", ""],  ["Dom", "Brat"],
		["dressmaker"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferArmor": KDDialogueTriggerOffer("OfferArmor", ["Metal", "Illusion"], ["shackleGag"],
		["parole", ""],  ["Sub", "Brat"],
		["shackleGag", "metal", "shackleRestraints", "chain"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferChain": KDDialogueTriggerOffer("OfferChain", ["Metal", "Conjure"], ["chainRestraints"],
		["parole", ""],  ["Sub", "Brat"],
		["chainRestraints", "metal", "handcuffer"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferVine": KDDialogueTriggerOffer("OfferVine", ["Will", "Rope"], ["vineRestraints"],
		["parole", ""],  ["Dom", ""],
		["nature", "vineRestraints"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferObsidian": KDDialogueTriggerOffer("OfferObsidian", ["Metal", "Elements"], ["obsidianRestraints"],
		["parole", ""],  undefined,
		["obsidianRestraints"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferMaidRestraint": KDDialogueTriggerOffer("OfferMaidRestraint", ["Latex", "Illusion"], ["maidRestraints"],
		["parole", ""],  ["Sub", "Brat"],
		["maid"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferDragon": KDDialogueTriggerOffer("OfferDragon", ["Leather"], ["dragonRestraints"],
		["parole", ""],  ["Dom", "", "Brat"],
		["dragon"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferComfy": KDDialogueTriggerOffer("OfferComfy", ["Metal", "Prisoner"], ["comfyRestraints"],
		["parole", ""],  undefined,
		["submissive"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferShackles": KDDialogueTriggerOffer("OfferShackles", ["Metal", "Prisoner"], ["shackleRestraints", "steelCuffs"],
		["parole", ""],  ["Dom", ""],
		["shackleRestraints", "steelCuffs", "handcuffer", "police"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferKitty": KDDialogueTriggerOffer("OfferKitty", ["Leather", "Will"], ["kittyRestraints"],
		["parole", ""],  ["Dom", "Brat", "Sub"],
		["mummy", "kittyRestraints"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferMithrilRope": KDDialogueTriggerOffer("OfferMithrilRope", ["Metal", "Will"], ["mithrilRope","mithrilRopeHogtie"],
		["parole", ""],  ["Dom", "Brat", "Sub"],
		["elf"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferMithril": KDDialogueTriggerOffer("OfferMithril", ["Metal", "Will"], ["mithrilRestraints"],
		["parole", ""],  ["Dom", "Brat", ""],
		["elf"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferWolfRestraint": KDDialogueTriggerOffer("OfferWolfRestraint", ["Metal", "Latex"], ["wolfRestraints"],
		["parole", ""],  ["Dom", ""],
		["trainer"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferSlime": KDDialogueTriggerOffer("OfferSlime", ["Latex", "Prisoner"], ["slimeRestraintsRandom"],
		["parole", ""],  ["Dom", "Brat"],
		["alchemist", "apprentice", "wizard"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferScarf": KDDialogueTriggerOffer("OfferScarf", ["Rope"], ["scarfRestraints"],
		["parole", ""],  undefined,
		["scarfRestraints","ropeAuxiliary", "dressmaker"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferAutoTape": KDDialogueTriggerOffer("OfferAutoTape", ["Metal"], ["autoTape"],
		["parole", ""],  ["Robot"],
		["autoTape"], undefined, ["robot"], ["zombie", "skeleton"],
		undefined, undefined),

	"OfferHiTechCables": KDDialogueTriggerOffer("OfferHiTechCables", ["Metal"], ["hitechCables", "cableGag"],
		["parole", ""],  ["Robot"],
		["hitechCables", "cableGag"], undefined, ["robot"], ["zombie", "skeleton"],
		undefined, undefined),

	"OfferIce": KDDialogueTriggerOffer("OfferIce", ["Elements"], ["iceRestraints"],
		["parole", ""],  ["Dom"],
		["apprentice", "witch"], ["iceRestraints", "ice", "water"], undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferLatex": KDDialogueTriggerOffer("OfferLatex", ["Latex", "Conjure"], ["latexRestraints", "latexRestraintsHeavy"],
		["parole", ""],  ["Sub", "Brat"],
		["latexRestraints", "latexRestraintsHeavy", "alchemist"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferRopes": KDDialogueTriggerOffer("OfferRopes", ["Rope"], ["ropeRestraints", "ropeRestraints", "ropeRestraintsWrist", "ropeRestraintsHogtie"],
		["parole", ""],  ["Dom", ""],
		["ropeRestraints", "ropeRestraints", "ropeRestraintsWrist", "ropeRestraintsHogtie", "rope"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferLeather": KDDialogueTriggerOffer("OfferLeather", ["Leather"], ["armbinderSpell", "straitjacketSpell", "legbinderSpell", "harnessSpell", "gagSpell", "blindfoldSpell", "leathercuffsSpell"],
		["parole", ""],  undefined,
		["leatherRestraints", "leatherRestraintsHeavy"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferChastity": {
		dialogue: "OfferChastity",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Sub"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: true,
		prerequisite: (enemy, dist, AIData) => {
			return (dist < 1.5
				&& KinkyDungeonStatsChoice.has("arousalMode")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("ChastityOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.05
				&& KinkyDungeonGetRestraint({tags: ["genericChastity"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
		},
		weight: (enemy, dist) => {
			return 1 + 0.8 * Math.max(Math.abs(KinkyDungeonGoddessRep.Metal)/100, Math.abs(KinkyDungeonGoddessRep.Elements)/100, Math.abs(KinkyDungeonGoddessRep.Illusion)/100, Math.abs(KinkyDungeonGoddessRep.Ghost)/100);
		},
	},

	"PotionSell": KDShopTrigger("PotionSell"),
	"ElfCrystalSell": KDShopTrigger("ElfCrystalSell"),
	"NinjaSell": KDShopTrigger("NinjaSell"),
	"ScrollSell": KDShopTrigger("ScrollSell"),
	"GhostSell": KDShopTrigger("GhostSell"),
	"WolfgirlSell": KDShopTrigger("WolfgirlSell"),
	"Fuuka": KDBossTrigger("Fuuka", ["Fuuka1", "Fuuka2"]),
	"FuukaLose": KDBossLose("FuukaLose", ["Fuuka1", "Fuuka2"], ["mikoRestraints"]),
	"DollmakerLose1": KDBossLose("DollmakerLose", ["DollmakerBoss1"], ["controlharness", "dollmakerrestraints", "leashing"]),
	"DollmakerLose2": KDBossLose("DollmakerLose", ["DollmakerBoss2", "DollmakerBoss3"], ["controlharness", "cyberdollrestraints", "dollmakerrestraints"]),
	"Dollmaker": KDBossTrigger("Dollmaker", ["DollmakerBoss1", "DollmakerBoss2", "DollmakerBoss3"]),
};

/**
 * Generic condition for Bondage Offers
 * @param {entity} enemy
 * @param {any} AIData
 * @param {number} dist - Current player dist, its sent as a param for faster runtime
 * @param {number} maxdist
 * @param {number} chance
 * @param {string[]} restraintTags - Tags of required restraints
 * @returns {boolean}
 */
function KDDefaultPrereqs(enemy, AIData, dist, maxdist, chance, restraintTags, force) {
	return dist < maxdist
			&& (!AIData.domMe || force)
			&& !KDEnemyHasFlag(enemy, "playstart")
			&& (!KinkyDungeonFlags.get("DangerFlag") || force)
			&& (!KinkyDungeonFlags.get("BondageOffer") || force)
			&& !KinkyDungeonFlags.get("NoTalk")
			&& (KinkyDungeonStatsChoice.get("Undeniable") || KDRandom() < chance || force)
			&& (!restraintTags || KinkyDungeonGetRestraint({tags: restraintTags}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined)
			&& (KinkyDungeonStatsChoice.get("Undeniable") || !KDIsBrat(enemy) || force);
}
function KDShopTrigger(name) {
	return {
		dialogue: name,
		allowedPrisonStates: ["parole", ""],
		nonHostile: true,
		noCombat: true,
		excludeTags: ["noshop"],
		blockDuringPlaytime: true,
		prerequisite: (enemy, dist, AIData) => {
			return (dist < 1.5
				&& !KinkyDungeonFlags.get("NoTalk")
				&& !(KDGameData.SleepTurns > 0)
				&& KDEnemyHasFlag(enemy, name)
				&& !KDEnemyHasFlag(enemy, "NoShop"));
		},
		weight: (enemy, dist) => {
			return 100;
		},
	};
}

/**
 *
 * @param {string} name
 * @param {KinkyDialogue} name
 * @returns {KinkyDialogueTrigger}
 */
function KDRecruitTrigger(name, dialogue) {
	if (dialogue)
		return {
			dialogue: name,
			allowedPrisonStates: ["parole", ""],
			requireTags: dialogue.tags,
			requireTagsSingle: dialogue.singletag,
			excludeTags: dialogue.excludeTags,
			playRequired: true,
			nonHostile: true,
			noCombat: true,
			blockDuringPlaytime: true,
			prerequisite: (enemy, dist, AIData) => {
				return (dist < 1.5
					&& !KinkyDungeonFlags.get("Recruited")
					&& !KinkyDungeonFlags.get("DangerFlag")
					&& !KinkyDungeonFlags.get(name)
					&& !KinkyDungeonFlags.get("NoTalk")
					&& KinkyDungeonCurrentDress != dialogue.outfit
					&& !enemy.faction
					&& !enemy.allied
					&& KDFactionRelation("Player", KDGetFactionOriginal(enemy)) > -0.1
					&& KDRandom() < dialogue.chance);
			},
			weight: (enemy, dist) => {
				return 10;
			},
		};
	return null;
}

/** Boss intro dialogue */
function KDBossTrigger(name, enemyName) {
	return {
		dialogue: name,
		nonHostile: true,
		prerequisite: (enemy, dist, AIData) => {
			return (dist < 2.5
				&& !KinkyDungeonFlags.get("NoTalk")
				&& !(KDGameData.SleepTurns > 0)
				&& enemyName.includes(enemy.Enemy.name)
				&& !KinkyDungeonFlags.has("BossUnlocked")
				&& !KinkyDungeonFlags.has("BossDialogue" + name));
		},
		weight: (enemy, dist) => {
			return 100;
		},
	};
}
/**
 * Lose to a boss
 * @param {string} name
 * @param {string[]} enemyName
 * @param {string[]} tags
 * @returns {KinkyDialogueTrigger}
 */
function KDBossLose(name, enemyName, tags) {
	return {
		dialogue: name,
		prerequisite: (enemy, dist, AIData) => {
			return (dist < 1.5
				&& !KinkyDungeonFlags.get("NoTalk")
				&& !(KDGameData.SleepTurns > 0)
				&& enemyName.includes(enemy.Enemy.name)
				&& !KinkyDungeonFlags.has("BossUnlocked")
				&& !KinkyDungeonHasWill(0.1)
				&& (!tags || !KinkyDungeonGetRestraint({tags: tags}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint])));
		},
		weight: (enemy, dist) => {
			return 100;
		},
	};
}

function KinkyDungeonGetShopForEnemy(enemy, guaranteed) {
	if (enemy.Enemy.tags.noshop) return "";
	let shoplist = [];
	for (let s of Object.values(KDShops)) {
		let end = false;
		if (s.tags) {
			for (let t of s.tags) {
				if (!enemy.Enemy.tags[t]) {
					end = true;
					break;
				}
			}
		}
		let hasTag = !s.singletag;
		if (!end && s.singletag) {
			for (let t of s.singletag) {
				if (enemy.Enemy.tags[t]) {
					hasTag = true;
					break;
				}
			}
		}
		if (!hasTag) end = true;
		if (!end && (guaranteed || !s.chance || KDRandom() < s.chance)) shoplist.push(s.name);
	}
	if (shoplist.length > 0) return shoplist[Math.floor(KDRandom() * shoplist.length)];
	return "";
}
