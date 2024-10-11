"use strict";

/** No dialogues will trigger when the player dist is higher than this */
let KinkyDungeonMaxDialogueTriggerDist = 5.9;

let KDDialogueTriggers: Record<string, KinkyDialogueTrigger> = {
	"WeaponStop": {
		dialogue: "WeaponFound",
		allowedPrisonStates: ["parole"],
		excludeTags: ["zombie", "skeleton", "gagged"],
		playRequired: true,
		noCombat: true,
		noAlly: true,
		talk: true,
		blockDuringPlaytime: false,
		prerequisite: (enemy, dist, _AIData) => {
			return (KinkyDungeonPlayerDamage
				&& !KinkyDungeonPlayerDamage.unarmed
				&& KinkyDungeonPlayerDamage.name
				&& dist < 3.9
				&& KDHostile(enemy)
				&& KDRandom() < 0.25
				&& !KinkyDungeonFlags.has("demand"));
		},
		weight: (enemy, _dist) => {
			return KDStrictPersonalities.includes(enemy.personality) ? 10 : 1;
		},
	},
	"OfferDress": KDDialogueTriggerOffer("OfferDress", ["Rope", "Conjure"], ["bindingDress"],
		["parole", "", "chase", "jail"],  ["Sub", "Brat"],
		["dressmaker", "bindingDress"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferKigu": KDDialogueTriggerOffer("OfferKigu", ["Latex", "Conjure"], ["kiguRestraints"],
		["parole", "", "chase", "jail"],  ["Dom", "Brat"],
		["dressmaker"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferSenseDep": KDDialogueTriggerOffer("OfferSenseDep", ["Leather", "Illusion"], ["sensedep"],
		["parole", "", "chase", "jail"],  ["Dom", "Brat"],
		["dressmaker", "ninja", "leatherRestraints", "leatherRestraintsHeavy"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferArmor": KDDialogueTriggerOffer("OfferArmor", ["Metal", "Illusion"], ["shackleGag"],
		["parole", "", "chase", "jail"],  ["Sub", "Brat"],
		["shackleGag", "metal", "shackleRestraints", "chain"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferChain": KDDialogueTriggerOffer("OfferChain", ["Metal", "Conjure"], ["chainRestraints"],
		["parole", "", "chase", "jail"],  ["Sub", "Brat"],
		["chainRestraints", "metal", "handcuffer"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferVine": KDDialogueTriggerOffer("OfferVine", ["Will", "Rope"], ["vineRestraints"],
		["parole", "", "chase", "jail"],  ["Dom", ""],
		["nature", "vineRestraints"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferObsidian": KDDialogueTriggerOffer("OfferObsidian", ["Metal", "Elements"], ["obsidianRestraints"],
		["parole", "", "chase", "jail"],  undefined,
		["obsidianRestraints"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferMaidRestraint": KDDialogueTriggerOffer("OfferMaidRestraint", ["Latex", "Illusion"], ["maidRestraints"],
		["parole", "", "chase", "jail"],  ["Sub", "Brat"],
		["maid"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined, "Blue", 0.4),
	"OfferDusterGag": KDDialogueTriggerOffer("OfferDusterGag", ["Latex", "Illusion"], ["dustergag"],
		["parole", "", "chase", "jail"],  ["Dom", "Brat", ""],
		["maid"], ["elite", "miniboss", "boss"], undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferDragon": KDDialogueTriggerOffer("OfferDragon", ["Leather"], ["dragonRestraints"],
		["parole", "", "chase", "jail"],  ["Dom", "", "Brat"],
		["dragon"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferComfy": KDDialogueTriggerOffer("OfferComfy", ["Metal", "Prisoner"], ["comfyRestraints"],
		["parole", "", "chase", "jail"],  undefined,
		["submissive"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferShackles": KDDialogueTriggerOffer("OfferShackles", ["Metal", "Prisoner"], ["shackleRestraints", "steelCuffs"],
		["parole", "", "chase", "jail"],  ["Dom", ""],
		["shackleRestraints", "steelCuffs", "handcuffer", "police"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferKitty": KDDialogueTriggerOffer("OfferKitty", ["Leather", "Will"], ["kittyRestraints"],
		["parole", "", "chase", "jail"],  ["Dom", "Brat", "Sub"],
		["mummy", "kittyRestraints"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferMithrilRope": KDDialogueTriggerOffer("OfferMithrilRope", ["Metal", "Will"], ["mithrilRope","mithrilRopeHogtie"],
		["parole", "", "chase", "jail"],  ["Dom", "Brat", "Sub"],
		["elf"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferMithril": KDDialogueTriggerOffer("OfferMithril", ["Metal", "Will"], ["mithrilRestraints"],
		["parole", "", "chase", "jail"],  ["Dom", "Brat", ""],
		["elf"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferWolfRestraint": KDDialogueTriggerOffer("OfferWolfRestraint", ["Metal", "Latex"], ["wolfRestraints", "wolfRestraintsHeavy"],
		["parole", "", "chase", "jail"],  ["Dom", ""],
		["trainer"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferSlime": KDDialogueTriggerOffer("OfferSlime", ["Latex", "Prisoner"], ["slimeRestraintsRandom"],
		["parole", "", "chase", "jail"],  ["Dom", "Brat"],
		["alchemist", "apprentice", "wizard"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferResin": KDDialogueTriggerOffer("OfferResin", ["Latex", "Prisoner"], ["resinRestraints"],
		["parole", "",],  ["Dom", "Brat", "Sub", ""],
		["alchemist"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, ["Released"]),

	"OfferScarf": KDDialogueTriggerOffer("OfferScarf", ["Rope"], ["scarfRestraints"],
		["parole", "", "chase", "jail"],  undefined,
		["scarfRestraints","ropeAuxiliary", "dressmaker"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferAutoTape": KDDialogueTriggerOffer("OfferAutoTape", ["Metal"], ["autoTape"],
		["parole", "", "chase", "jail"],  ["Robot"],
		["autoTape"], undefined, ["robot"], ["zombie", "skeleton"],
		undefined, undefined),

	"OfferHiTechCables": KDDialogueTriggerOffer("OfferHiTechCables", ["Metal"], ["hitechCables", "cableGag"],
		["parole", "", "chase", "jail"],  ["Robot"],
		["hitechCables", "cableGag"], undefined, ["robot"], ["zombie", "skeleton"],
		undefined, undefined),

	"OfferIce": KDDialogueTriggerOffer("OfferIce", ["Elements"], ["iceRestraints"],
		["parole", "", "chase", "jail"],  ["Dom"],
		["apprentice", "witch"], ["iceRestraints", "ice", "water"], undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferLatex": KDDialogueTriggerOffer("OfferLatex", ["Latex", "Conjure"], ["latexRestraints", "latexpetsuit", "latexRestraintsHeavy"],
		["parole", "", "chase", "jail"],  ["Sub", "Brat"],
		["latexRestraints", "latexRestraintsHeavy", "alchemist"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferLatex2": KDDialogueTriggerOffer("OfferLatex", ["Latex", "Conjure"], ["latexRestraints", "latexpetsuit", "latexRestraintsHeavy"],
		["parole", "", "chase", "jail"],  ["Dom", ""],
		["latexRestraints", "latexRestraintsHeavy", "alchemist"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferRopes": KDDialogueTriggerOffer("OfferRopes", ["Rope"], ["ropeRestraints", "ropeRestraints", "ropeRestraintsWrist", "ropeRestraintsHogtie"],
		["parole", "", "chase", "jail"],  ["Dom", ""],
		["ropeRestraints", "ropeRestraints", "ropeRestraintsWrist", "ropeRestraintsHogtie", "rope"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferLeather": KDDialogueTriggerOffer("OfferLeather", ["Leather"], ["armbinderSpell", "straitjacketSpell", "legbinderSpell", "harnessSpell", "gagSpell", "blindfoldSpell", "leathercuffsSpell"],
		["parole", "", "chase", "jail"],  undefined,
		["leatherRestraints", "leatherRestraintsHeavy"], undefined, undefined, ["zombie", "skeleton", "robot"],
		undefined, undefined),

	"OfferChastity": {
		dialogue: "OfferChastity",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Dom"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		talk: true,
		blockDuringPlaytime: true,
		prerequisite: (_enemy, dist, _AIData) => {
			return (dist < 1.5
				&& KinkyDungeonStatsChoice.has("arousalMode")
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("ChastityOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDRandom() < 0.05
				&& KinkyDungeonGetRestraint({tags: ["genericChastity"]}, MiniGameKinkyDungeonLevel * 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), false, undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					{
						allowLowPower: true
					}) != undefined);
		},
		weight: (_enemy, _dist) => {
			return 1 + 0.8 * Math.max(Math.abs(KinkyDungeonGoddessRep.Metal)/100, Math.abs(KinkyDungeonGoddessRep.Elements)/100, Math.abs(KinkyDungeonGoddessRep.Illusion)/100, Math.abs(KinkyDungeonGoddessRep.Ghost)/100);
		},
	},
	"OfferCursed": {
		dialogue: "OfferCursed",
		allowedPrisonStates: ["parole", ""],
		allowedPersonalities: ["Sub"],
		excludeTags: ["zombie", "skeleton", "robot"],
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		talk: true,
		blockDuringPlaytime: true,
		prerequisite: (_enemy, dist, _AIData) => {
			return (dist < 1.5
				&& !KinkyDungeonFlags.get("DangerFlag")
				&& !KinkyDungeonFlags.get("BondageOffer")
				&& !KinkyDungeonFlags.get("NoTalk")
				&& !KinkyDungeonFlags.get("CursedOffer")
				&& KDRandom() < 0.05
				&& KinkyDungeonGetRestraint({tags: ["leatherRestraints", "noBelt", "leatherHeels"]}, MiniGameKinkyDungeonLevel * 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), false, undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					{
						allowLowPower: true
					}) != undefined);
		},
		weight: (_enemy, _dist) => {
			return 1 + 0.8 * Math.max(Math.abs(KinkyDungeonGoddessRep.Metal)/100, Math.abs(KinkyDungeonGoddessRep.Elements)/100, Math.abs(KinkyDungeonGoddessRep.Illusion)/100, Math.abs(KinkyDungeonGoddessRep.Ghost)/100);
		},
	},

	"PotionSell": KDShopTrigger("PotionSell"),
	//"ElfCrystalSell": KDShopTrigger("ElfCrystalSell"),
	//"NinjaSell": KDShopTrigger("NinjaSell"),
	//"ScrollSell": KDShopTrigger("ScrollSell"),
	//"GhostSell": KDShopTrigger("GhostSell"),
	//"WolfgirlSell": KDShopTrigger("WolfgirlSell"),
	"Fuuka": KDBossTrigger("Fuuka", ["Fuuka1", "Fuuka2"]),
	"FuukaLose": KDBossLose("FuukaLose", ["Fuuka1", "Fuuka2"], undefined, () => {
		return KinkyDungeonSlowLevel > 9; // Player immobilized
	}),
	"TheWarden": KDBossTrigger("TheWarden", ["TheWarden1", "TheWarden2"]),
	"TheWardenLose": KDBossLose("TheWardenLose", ["TheWarden1", "TheWarden2"], undefined, () => {
		return KinkyDungeonPlayerTags.get("Furniture") && !KinkyDungeonHasWill(0.1); // Player in cage
	}),
	"DollmakerLose1": KDBossLose("DollmakerLose", ["DollmakerBoss1", "DollmakerBoss2", "DollmakerBoss3"], undefined, () => {
		return KinkyDungeonPlayerTags.get("Furniture") && !KinkyDungeonHasWill(0.1); // Player in cage
	}),
	"Dollmaker": KDBossTrigger("Dollmaker", ["DollmakerBoss1", "DollmakerBoss2", "DollmakerBoss3"]),
};

/**
 * Generic condition for Bondage Offers
 * @param enemy
 * @param AIData
 * @param dist - Current player dist, its sent as a param for faster runtime
 * @param maxdist
 * @param chance
 * @param restraintTags - Tags of required restraints
 * @param force
 * @param [Lock]
 */
function KDDefaultPrereqs(enemy: entity, AIData: any, dist: number, maxdist: number, chance: number, restraintTags: string[], force: boolean, Lock: string = "Red"): boolean {
	return dist < maxdist
			&& (!AIData.domMe || force)
			&& !KDEnemyHasFlag(enemy, "playstart")
			&& (!KinkyDungeonFlags.get("DangerFlag") || force)
			&& (!KinkyDungeonFlags.get("BondageOffer") || force)
			&& !KinkyDungeonFlags.get("NoTalk")
			&& (KinkyDungeonStatsChoice.get("Undeniable") || KDRandom() < chance || force)
			&& (!restraintTags || KinkyDungeonGetRestraint(
				{tags: restraintTags},
				KDGetEffLevel() * 1.5 + KDGetOfferLevelMod(),
				(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
				undefined,
				Lock,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				{
					allowLowPower: true
				}) != undefined)
			&& (KinkyDungeonStatsChoice.get("Undeniable") || !KDIsBrat(enemy) || force);
}

function KDShopTrigger(name: string): KinkyDialogueTrigger {
	return {
		dialogue: name,
		allowedPrisonStates: ["parole", ""],
		nonHostile: true,
		noCombat: true,
		talk: true,
		excludeTags: ["noshop"],
		blockDuringPlaytime: true,
		prerequisite: (enemy, dist, _AIData) => {
			return (dist < 1.5
				&& !KinkyDungeonFlags.get("NoTalk")
				&& !KDGameData.NoForceGreet
				&& !(KDGameData.SleepTurns > 0)
				&& KDEnemyHasFlag(enemy, name)
				&& !KDEnemyHasFlag(enemy, "NoShop"));
		},
		weight: (_enemy, _dist) => {
			return 100;
		},
	};
}

/**
 * @param name
 * @param dialogue
 */
function KDRecruitTrigger(name: string, dialogue: KinkyDialogue): KinkyDialogueTrigger {
	if (dialogue)
		return {
			dialogue: name,
			allowedPrisonStates: ["parole", "", "chase"],
			requireTags: dialogue.tags,
			requireTagsSingle: dialogue.singletag,
			excludeTags: dialogue.excludeTags,
			playRequired: true,
			nonHostile: true,
			noCombat: true,
			blockDuringPlaytime: true,
			prerequisite: (enemy, dist, _AIData) => {
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
			weight: (_enemy, _dist) => {
				return 10;
			},
		};
	return null;
}

/** Boss intro dialogue */
function KDBossTrigger(name: string, enemyName: string[]): KinkyDialogueTrigger {
	return {
		dialogue: name,
		nonHostile: true,
		prerequisite: (enemy, dist, _AIData) => {
			return (dist < 2.5
				&& KDGetFaction(enemy) != "Player"
				&& !KinkyDungeonFlags.get("NoTalk")
				&& !(KDGameData.SleepTurns > 0)
				&& enemyName.includes(enemy.Enemy.name)
				&& !KinkyDungeonFlags.has("BossUnlocked")
				&& !KinkyDungeonFlags.has("BossDialogue" + name));
		},
		weight: (_enemy, _dist) => {
			return 100;
		},
	};
}
/**
 * Lose to a boss
 * @param name
 * @param enemyName
 * @param tags
 * @param [condition]
 */
function KDBossLose(name: string, enemyName: string[], tags: string[], condition?: () => boolean): KinkyDialogueTrigger {
	return {
		dialogue: name,
		prerequisite: (enemy, dist, _AIData) => {
			return (dist < 1.5
				&& !KinkyDungeonFlags.get("NoTalk")
				&& KDGetFaction(enemy) != "Player"
				&& !(KDGameData.SleepTurns > 0)
				&& enemyName.includes(enemy.Enemy.name)
				&& !KinkyDungeonFlags.has("BossUnlocked")
				&& ((!condition && !KinkyDungeonHasWill(0.1)) || (condition && condition()))
				&& (!tags || !KinkyDungeonGetRestraint({tags: tags}, MiniGameKinkyDungeonLevel * 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint))));
		},
		weight: (_enemy, _dist) => {
			return 100;
		},
	};
}

function KinkyDungeonGetShopForEnemy(enemy: entity, guaranteed?: boolean): string {
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
