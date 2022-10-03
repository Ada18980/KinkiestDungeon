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
		prerequisite: (enemy, dist) => {
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["bindingDress"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
		},
		weight: (enemy, dist) => {
			return 1 + 0.8 * Math.max(Math.abs(KinkyDungeonGoddessRep.Latex)/100, Math.abs(KinkyDungeonGoddessRep.Conjure)/100);
		},
	},
	"OfferHighSec": {
		dialogue: "OfferHighSec",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom"],
		requireTagsSingle: ["jail"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.1);
		},
		weight: (enemy, dist) => {
			return 0.1 + 0.1 * Math.max(Math.abs(KinkyDungeonGoddessRep.Prisoner)/100, Math.abs(KinkyDungeonGoddessRep.Ghost)/100);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.1
				&& KinkyDungeonGetRestraint({tags: ["shackleGag"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["chainRestraints"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["vineRestraints"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["obsidianRestraints"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["maidRestraints"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["dragonRestraints"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["comfyRestraints"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["shackleRestraints", "steelCuffs"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["kittyRestraints"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["mithrilRope","mithrilRopeHogtie"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["mithrilRestraints"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["wolfRestraints"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["slimeRestraintsRandom"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["scarfRestraints"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["autoTape"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["hitechCables", "cableGag"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["iceRestraints"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.25
				&& KinkyDungeonGetRestraint({tags: ["latexRestraints", "latexRestraintsHeavy"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
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
		requireTagsSingle: ["ropeRestraints", "ropeRestraints2", "ropeRestraintsWrist"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.5
				&& KinkyDungeonGetRestraint({tags: ["ropeRestraints", "ropeRestraints", "ropeRestraintsWrist"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KDEnemyHasFlag(enemy, "playstart")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.5
				&& KinkyDungeonGetRestraint({tags: ["leatherRestraintsHeavy"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]) != undefined);
		},
		weight: (enemy, dist) => {
			return 1 + 0.5 * Math.abs(KinkyDungeonGoddessRep.Leather + 50)/100;
		},
	},
	"OfferWolfgirl": KDRecruitTrigger("OfferWolfgirl"),
	"OfferMaid": KDRecruitTrigger("OfferMaid"),
	"PotionSell": KDShopTrigger("PotionSell"),
	"ElfCrystalSell": KDShopTrigger("ElfCrystalSell"),
	"NinjaSell": KDShopTrigger("NinjaSell"),
	"ScrollSell": KDShopTrigger("ScrollSell"),
	"GhostSell": KDShopTrigger("GhostSell"),
	"WolfgirlSell": KDShopTrigger("WolfgirlSell"),
	"Fuuka": KDBossTrigger("Fuuka", ["Fuuka1", "Fuuka2"]),
	"FuukaLose": KDBossLose("FuukaLose", ["Fuuka1", "Fuuka2"]),

};

function KDShopTrigger(name) {
	return {
		dialogue: name,
		allowedPrisonStates: ["parole", ""],
		nonHostile: true,
		noCombat: true,
		excludeTags: ["noshop"],
		blockDuringPlaytime: true,
		prerequisite: (enemy, dist) => {
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
 * @returns {KinkyDialogueTrigger}
 */
function KDRecruitTrigger(name) {
	let dialogue = KDRecruitDialog[name];
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
			noAlly: true,
			blockDuringPlaytime: true,
			prerequisite: (enemy, dist) => {
				return (dist < 1.5
					&& !KinkyDungeonFlags.get("DangerFlag")
					&& !KinkyDungeonFlags.get(name)
					&& !KinkyDungeonFlags.get("NoTalk")
					&& KinkyDungeonCurrentDress != dialogue.outfit
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
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
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

/** Lose to a boss */
function KDBossLose(name, enemyName) {
	return {
		dialogue: name,
		prerequisite: (enemy, dist) => {
			return (dist < 1.5
				&& !KinkyDungeonFlags.get("NoTalk")
				&& !(KDGameData.SleepTurns > 0)
				&& enemyName.includes(enemy.Enemy.name)
				&& !KinkyDungeonFlags.has("BossUnlocked")
				&& !KinkyDungeonHasWill(0.1));
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