"use strict";

/** No dialogues will trigger when the player dist is higher than this */
let KinkyDungeonMaxDialogueTriggerDist = 5.9;

/** @type {Record<string, KinkyDialogueTrigger>} */
let KDDialogueTriggers = {
	"WeaponStop": {
		dialogue: "WeaponFound",
		allowedPrisonStates: ["parole"],
		excludeTags: ["zombie", "skeleton"],
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
	"OfferDress": {
		dialogue: "OfferDress",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Sub"],
		requireTagsSingle: ["dressRestraints", "bindingDress"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["bindingDress"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.8 * Math.max(Math.abs(KinkyDungeonGoddessRep.Latex)/100, Math.abs(KinkyDungeonGoddessRep.Conjure)/100);
		},
	},
	"OfferKigu": {
		dialogue: "OfferKigu",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Sub"],
		requireTagsSingle: ["kiguRestraints"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["kiguRestraints"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.8 * Math.max(Math.abs(KinkyDungeonGoddessRep.Latex)/100, Math.abs(KinkyDungeonGoddessRep.Conjure)/100);
		},
	},
	"OfferArmor": {
		dialogue: "OfferArmor",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Sub"],
		requireTagsSingle: ["melee"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.1,["shackleGag"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Metal)/100, Math.abs(KinkyDungeonGoddessRep.Illusion)/100);
		},
	},
	"OfferChain": {
		dialogue: "OfferChain",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Sub"],
		requireTagsSingle: ["chainRestraints", "witch"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["chainRestraints"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Metal)/100, Math.abs(KinkyDungeonGoddessRep.Conjure)/100);
		},
	},
	"OfferVine": {
		dialogue: "OfferVine",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom"],
		requireTagsSingle: ["vineRestraints"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["vineRestraints"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Rope)/100, Math.abs(KinkyDungeonGoddessRep.Will)/100);
		},
	},
	"OfferObsidian": {
		dialogue: "OfferObsidian",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom", "Sub"],
		requireTagsSingle: ["obsidianRestraints"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["obsidianRestraints"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Metal)/100, Math.abs(KinkyDungeonGoddessRep.Elements)/100);
		},
	},
	"OfferMaidRestraint": {
		dialogue: "OfferMaidRestraint",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Sub"],
		requireTagsSingle: ["maidRestraints"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["maidRestraints"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Latex)/100, Math.abs(KinkyDungeonGoddessRep.Illusion)/100);
		},
	},
	"OfferDragon": {
		dialogue: "OfferDragon",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom"],
		requireTagsSingle: ["dragonRestraints"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["dragonRestraints"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.abs(KinkyDungeonGoddessRep.Leather)/100;
		},
	},
	"OfferComfy": {
		dialogue: "OfferComfy",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Sub"],
		requireTagsSingle: ["submissive"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["comfyRestraints"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Conjure)/100, Math.abs(KinkyDungeonGoddessRep.Illusion)/100);
		},
	},
	"OfferShackles": {
		dialogue: "OfferShackles",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom"],
		requireTagsSingle: ["shackleRestraints", "steelCuffs", "handcuffer"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["shackleRestraints", "steelCuffs"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Metal)/100, Math.abs(KinkyDungeonGoddessRep.Prisoner)/100);
		},
	},
	"OfferKitty": {
		dialogue: "OfferKitty",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom", "Sub"],
		requireTagsSingle: ["kittyRestraints"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["kittyRestraints"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Leather)/100, Math.abs(KinkyDungeonGoddessRep.Will)/100);
		},
	},
	"OfferMithrilRope": {
		dialogue: "OfferMithrilRope",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom","Sub"],
		requireTagsSingle: ["mithrilRope","mithrilRopeHogtie"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["mithrilRope","mithrilRopeHogtie"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Rope)/100, Math.abs(KinkyDungeonGoddessRep.Will)/100);
		},
	},
	"OfferMithril": {
		dialogue: "OfferMithril",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom","Sub"],
		requireTagsSingle: ["mithrilRestraints"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["mithrilRestraints"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Metal)/100, Math.abs(KinkyDungeonGoddessRep.Ghost)/100);
		},
	},
	"OfferWolfRestraint": {
		dialogue: "OfferWolfRestraint",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom"],
		requireTagsSingle: ["trainer"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["wolfRestraints"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Metal)/100, Math.abs(KinkyDungeonGoddessRep.Will)/100);
		},
	},
	"OfferSlime": {
		dialogue: "OfferSlime",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom"],
		requireTags: ["alchemist","human"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["slimeRestraintsRandom"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Latex)/100, Math.abs(KinkyDungeonGoddessRep.Will)/100);
		},
	},
	"OfferScarf": {
		dialogue: "OfferScarf",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom", "Sub"],
		requireTagsSingle: ["scarfRestraints","ropeAuxiliary"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["scarfRestraints"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.abs(KinkyDungeonGoddessRep.Rope)/100;
		},
	},
	"OfferAutoTape": {
		dialogue: "OfferAutoTape",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Robot"],
		requireTags: ["robot","autoTape"],
		excludeTags: ["zombie", "skeleton"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["autoTape"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.abs(KinkyDungeonGoddessRep.Metal + 50)/100;
		},
	},
	"OfferHiTechCables": {
		dialogue: "OfferHiTechCables",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Robot"],
		requireTags: ["robot"],
		requireTagsSingle: ["hitechCables", "cableGag"],
		excludeTags: ["zombie", "skeleton"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["hitechCables", "cableGag"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.abs(KinkyDungeonGoddessRep.Metal + 50)/100;
		},
	},
	"OfferIce": {
		dialogue: "OfferIce",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom"],
		requireTagsSingle: ["iceRestraints", "ice", "apprentice", "witch", "water"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["iceRestraints"]));
		},
		weight: (enemy, dist) => {
			return 0.5 + 0.1 * Math.max(Math.abs(KinkyDungeonGoddessRep.Elements)/100, Math.abs(KinkyDungeonGoddessRep.Ghost)/100);
		},
	},
	"OfferLatex": {
		dialogue: "OfferLatex",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Sub"],
		requireTagsSingle: ["latexRestraints", "latexRestraintsHeavy"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.25,["latexRestraints", "latexRestraintsHeavy"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.max(Math.abs(KinkyDungeonGoddessRep.Latex)/100, Math.abs(KinkyDungeonGoddessRep.Conjure)/100);
		},
	},
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
	"OfferRopes": {
		dialogue: "OfferRopes",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom"],
		requireTagsSingle: ["ropeRestraints", "ropeRestraints2", "ropeRestraintsWrist", "ropeRestraintsHogtie"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.5,["ropeRestraints", "ropeRestraints", "ropeRestraintsWrist", "ropeRestraintsHogtie"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.4 * Math.abs(KinkyDungeonGoddessRep.Rope + 50)/100;
		},
	},
	"OfferLeather": {
		dialogue: "OfferLeather",
		allowedPrisonStates: ["parole", ""],
		requireTagsSingle: ["leatherRestraints", "leatherRestraintsHeavy"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy, AIData,dist,1.5,0.5,["leatherRestraintsHeavy"]));
		},
		weight: (enemy, dist) => {
			return 1 + 0.5 * Math.abs(KinkyDungeonGoddessRep.Leather + 50)/100;
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
function KDDefaultPrereqs(enemy, AIData, dist, maxdist, chance, restraintTags) {
	return dist < maxdist
			&& !AIData.domMe
			&& !KDEnemyHasFlag(enemy, "playstart")
			&& !KinkyDungeonFlags.get("DangerFlag")
			&& !KinkyDungeonFlags.get("BondageOffer")
			&& !KinkyDungeonFlags.get("NoTalk")
			&& (KinkyDungeonStatsChoice.get("Undeniable") || KDRandom() < chance)
			&& (!restraintTags || KinkyDungeonGetRestraint({tags: restraintTags}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined)
			&& (KinkyDungeonStatsChoice.get("Undeniable") || !KDIsBrat(enemy));
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
