"use strict";

let KDDialogueParams = {
	ShopkeeperFee: 900,
	ShopkeeperFeePerLevel: 100,
	ShopkeeperFeePunishThresh: 2500,
};

/**
 * Tags that are deleted on ng++
 * @type {string[]}
 */
let KDResertNGTags = [
	"BossDialogueFuuka"
];

/**
 * @type {Record<string, {name: string, tags: string[], singletag: string[], chance: number, items?: string[]}>}
 */
let KDShops = {};



/**
 * @type {Record<string, {name: string, outfit: string, tags: string[], singletag: string[], excludeTags: string[], chance: number}>}
 */
let KDRecruitDialog = {};

/**
 * @type {Record<string, {name: string, tags: string[], singletag: string[], excludeTags: string[], weight: number}>}
 */
let KDAllyDialog = {};

let KDSleepBedPercentage = 0.5;

/** @type {Record<string, KinkyDialogue>} */
let KDDialogue = {
	"GhostInfo": {
		response: "Default",
		options: {
			"Continue" : {
				clickFunction: (gagged, player) => {
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					return false;
				},
				playertext: "Default", exitDialogue: true,
			},
			//"Nice" : {gag: true, playertext: "Default", exitDialogue: true},
			//"Snark" : {playertext: "Default", exitDialogue: true},
			//"Brash" : {gag: true, playertext: "Default", exitDialogue: true},
		},
	},
	"Tutorial1": {
		response: "Default",
		options: {
			"Continue" : {
				clickFunction: (gagged, player) => {
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					let zombie = DialogueCreateEnemy(KinkyDungeonStartPosition.x + 7, 3, "FastZombie");
					zombie.AI = "guard";
					zombie.gxx = KinkyDungeonStartPosition.x + 8;
					zombie.gyy = KinkyDungeonGridHeight - 2;
					return false;
				},
				playertext: "GhostInfo_Continue", exitDialogue: true,
			},
			//"Nice" : {gag: true, playertext: "Default", exitDialogue: true},
			//"Snark" : {playertext: "Default", exitDialogue: true},
			//"Brash" : {gag: true, playertext: "Default", exitDialogue: true},
		},
	},
	"Tutorial2_mp3": {
		response: "Default",
		options: {
			"Continue" : {
				clickFunction: (gagged, player) => {
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					DialogueCreateEnemy(KinkyDungeonStartPosition.x + 22, 3, "FastZombie");
					return false;
				},
				playertext: "GhostInfo_Continue", exitDialogue: true,
			},
			//"Nice" : {gag: true, playertext: "Default", exitDialogue: true},
			//"Snark" : {playertext: "Default", exitDialogue: true},
			//"Brash" : {gag: true, playertext: "Default", exitDialogue: true},
		},
	},
	"Tutorial2_dp2": {
		response: "Default",
		options: {
			"Continue" : {
				clickFunction: (gagged, player) => {
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					DialogueCreateEnemy(KinkyDungeonStartPosition.x + 32, 4, "FastZombie");
					return false;
				},
				playertext: "GhostInfo_Continue", exitDialogue: true,
			},
			//"Nice" : {gag: true, playertext: "Default", exitDialogue: true},
			//"Snark" : {playertext: "Default", exitDialogue: true},
			//"Brash" : {gag: true, playertext: "Default", exitDialogue: true},
		},
	},
	"WeaponFound": {
		response: "WeaponFound",
		personalities: ["Robot"],
		options: {
			"Accept": {gag: true, playertext: "WeaponFoundAccept", response: "GoodGirl", personalities: ["Dom", "Sub", "Robot"],
				clickFunction: (gagged, player) => {
					KinkyDungeonSendTextMessage(10, TextGet("KDWeaponConfiscated"), "#ff0000", 2);
					let weapon = KinkyDungeonPlayerDamage.name;
					if (weapon && weapon != "Unarmed") {
						KinkyDungeonChangeRep("Ghost", 3);
						let item = KinkyDungeonInventoryGetWeapon(weapon);
						KDSetWeapon(null);
						KinkyDungeonAddLostItems([item], false);
						KinkyDungeonInventoryRemove(item);
						KinkyDungeonSetFlag("demand", 4);
					}
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}}},
			"Bluff": {playertext: "", response: "",
				prerequisiteFunction: (gagged, player) => {return false;},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}}},
			"Deny": {gag: true, playertext: "WeaponFoundDeny", response: "Punishment", personalities: ["Dom", "Sub", "Robot"],
				clickFunction: (gagged, player) => {
					KinkyDungeonStartChase(undefined, "Refusal");
					KDAggroSpeaker();
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}}},
			"Illusion": {gagDisabled: true, playertext: "WeaponFoundIllusion", response: "Disbelief", personalities: ["Dom", "Sub", "Robot"],
				prerequisiteFunction: (gagged, player) => {return KinkyDungeonGoddessRep.Illusion >= 51;},
				clickFunction: (gagged, player) => {
					if (KDGameData.CurrentDialogMsgSpeaker == "MaidforceHead") {
						KDGameData.CurrentDialogStage = "Deny";
						KDGameData.CurrentDialogMsg = "HeadMaidExcuseMe";
						KinkyDungeonStartChase(undefined, "Refusal");
						KDAggroSpeaker();
					} else {
						let diff = KDPersonalitySpread(40, 60, 80);
						if (KDBasicCheck(["Illusion", "Ghost"], ["Prisoner"]) > diff) {
							KDGameData.CurrentDialogStage = "Bluff";
							KDGameData.CurrentDialogMsg = "Bluffed";
							KinkyDungeonChangeRep("Ghost", -2);
						}
						KDDialogueApplyPersonality(["Dom", "Sub", "Robot"]);
					}
					return false;
				},
				options: {"Back": {playertext: "Pause", leadsToStage: ""}}},
			"Conjure": {gagDisabled: true, playertext: "WeaponFoundConjure", response: "Disbelief", personalities: ["Dom", "Sub", "Robot"],
				prerequisiteFunction: (gagged, player) => {return KinkyDungeonGoddessRep.Conjure >= 51;},
				clickFunction: (gagged, player) => {
					let diff = KDPersonalitySpread(40, 60, 80);
					if (KDBasicCheck(["Conjure", "Ghost"], ["Prisoner"]) > diff) {
						KDGameData.CurrentDialogStage = "Bluff";
						KDGameData.CurrentDialogMsg = "Bluffed";
						KinkyDungeonChangeRep("Ghost", -2);
					}
					KDDialogueApplyPersonality(["Dom", "Sub", "Robot"]);
					return false;
				},
				options: {"Back": {playertext: "Pause", leadsToStage: ""}}},
			"Elements": {gagDisabled: true, playertext: "WeaponFoundElements", response: "Disbelief", personalities: ["Dom", "Sub", "Robot"],
				prerequisiteFunction: (gagged, player) => {return KinkyDungeonGoddessRep.Elements >= 51;},
				clickFunction: (gagged, player) => {
					let diff = KDPersonalitySpread(40, 60, 80);
					if (KDBasicCheck(["Elements", "Ghost"], ["Prisoner"]) > diff) {
						KDGameData.CurrentDialogStage = "Bluff";
						KDGameData.CurrentDialogMsg = "Bluffed";
						KinkyDungeonChangeRep("Ghost", -2);
					}
					KDDialogueApplyPersonality(["Dom", "Sub", "Robot"]);
					return false;
				},
				options: {"Back": {playertext: "Pause", leadsToStage: ""}}},
			"Rope": {gagDisabled: true, playertext: "WeaponFoundRope", response: "Disbelief", personalities: ["Dom", "Sub", "Robot"],
				prerequisiteFunction: (gagged, player) => {return KinkyDungeonGoddessRep.Rope >= 51;},
				clickFunction: (gagged, player) => {
					let diff = KDPersonalitySpread(40, 60, 80);
					if (KDBasicCheck(["Rope", "Ghost"], ["Prisoner"]) > diff) {
						KDGameData.CurrentDialogStage = "Bluff";
						KDGameData.CurrentDialogMsg = "Bluffed";
						KinkyDungeonChangeRep("Ghost", -2);
					}
					KDDialogueApplyPersonality(["Dom", "Sub", "Robot"]);
					return false;
				},
				options: {"Back": {playertext: "Pause", leadsToStage: ""}}},
			"Leather": {gagDisabled: true, playertext: "WeaponFoundLeather", response: "Disbelief", personalities: ["Dom", "Sub", "Robot"],
				prerequisiteFunction: (gagged, player) => {return KinkyDungeonGoddessRep.Leather >= 51;},
				clickFunction: (gagged, player) => {
					let diff = KDPersonalitySpread(40, 60, 80);
					if (KDBasicCheck(["Leather", "Ghost"], ["Prisoner"]) > diff) {
						KDGameData.CurrentDialogStage = "Bluff";
						KDGameData.CurrentDialogMsg = "Bluffed";
						KinkyDungeonChangeRep("Ghost", -2);
					}
					KDDialogueApplyPersonality(["Dom", "Sub", "Robot"]);
					return false;
				},
				options: {"Back": {playertext: "Pause", leadsToStage: ""}}},
		}
	},
	"PrisonIntro": {
		response: "Default",
		options: {
			"NewLife": {playertext: "Default", response: "Default",
				options: {
					"Pout": {playertext: "Default", response: "Default", options: {"Continue" : {playertext: "Continue", leadsToStage: "Rules"}}},
					"Brat": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged, player) => {
							KinkyDungeonChangeRep("Ghost", -10);
							KinkyDungeonChangeRep("Prisoner", 10);
							return false;
						},
						options: {"Continue" : {playertext: "Continue", leadsToStage: "Rules"}}},
					"Sub": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged, player) => {
							KinkyDungeonChangeRep("Ghost", 10);
							return false;
						},
						options: {"Continue" : {playertext: "Continue", leadsToStage: "Rules"}}},
				}
			},
			"Rules": {playertext: "Default", response: "Default",
				options: {
					"Pout": {playertext: "Default", response: "Default", options: {"Continue" : {playertext: "Continue", exitDialogue: true}}},
					"Brat": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged, player) => {
							KinkyDungeonChangeRep("Ghost", -10);
							KinkyDungeonChangeRep("Prisoner", 10);
							return false;
						},
						options: {"Continue" : {playertext: "Continue", exitDialogue: true}}},
					"Sub": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged, player) => {
							KinkyDungeonChangeRep("Ghost", 10);
							return false;
						},
						options: {"Continue" : {playertext: "Continue", exitDialogue: true}}},
				}
			},
		}
	},
	"PrisonRepeat": {
		response: "Default",
		options: {
			"Smile": {playertext: "Default", response: "Default",
				prerequisiteFunction: (gagged, player) => {return !(KinkyDungeonGetRestraintItem("ItemVulva"));},
				clickFunction: (gagged, player) => {
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), 0, true);
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug2"), 0, true);
					KinkyDungeonChangeRep("Ghost", 3);
					return false;
				},
				options: {
					"Correct": {playertext: "Default", response: "Default", gagDisabled: true,
						prerequisiteFunction: (gagged, player) => {return !(KinkyDungeonGetRestraintItem("ItemMouth") || KinkyDungeonGetRestraintItem("ItemMouth2") || KinkyDungeonGetRestraintItem("ItemMouth3"));},
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapGag"), 0, true);
							KinkyDungeonChangeRep("Ghost", -1);
							return false;
						},
						options: {
							"Leave": {playertext: "Leave", exitDialogue: true}
						},
					},
					"Leave": {playertext: "Leave", exitDialogue: true}
				},
			},
			"Smile2": {playertext: "Default", response: "Default",
				prerequisiteFunction: (gagged, player) => {return KinkyDungeonGetRestraintItem("ItemVulva") != undefined;},
				clickFunction: (gagged, player) => {
					KinkyDungeonChangeRep("Ghost", 5);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Struggle": {playertext: "Default", response: "Default",
				prerequisiteFunction: (gagged, player) => {return KinkyDungeonGetRestraintItem("ItemArms") != undefined;},
				clickFunction: (gagged, player) => {
					KinkyDungeonChangeRep("Prisoner", 3);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Pout": {playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonChangeRep("Ghost", -3);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Bribe": {playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					return KinkyDungeonGoddessRep.Prisoner >= -40 && KinkyDungeonGold >= 40;
				},
				options: {
					"Accept": {playertext: "Default", response: "Default",
						clickFunction: (gagged, player) => {
							if (KinkyDungeonGoddessRep.Prisoner >= 49.5) {
								KDGameData.CurrentDialogMsg = "PrisonRepeatBribeFail";
								return false;
							}
							KinkyDungeonChangeRep("Prisoner", -Math.max(10, Math.min(100, KinkyDungeonGold*0.25)));
							KinkyDungeonGold = 0;
							KinkyDungeonSetFlag("LeashToPrison", 0);
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"Leave": {playertext: "Leave", exitDialogue: true}
				},
			},
		}
	},
	"OfferDress": KDYesNoBasic("OfferDress", ["Rope"], ["Ghost"], ["bindingDress"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferArmor": KDYesNoBasic("OfferArmor", ["Metal"], ["Ghost"], ["shackleGag"], [60, -10, 75, -20], [-35, -10, 25, -5]),
	"OfferChain": KDYesNoBasic("OfferChain", ["Metal"], ["Ghost"], ["chainRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15], 2, 3),
	"OfferVine": KDYesNoBasic("OfferVine", ["Will"], ["Ghost"], ["vineRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15], 2, 3),
	"OfferObsidian": KDYesNoBasic("OfferObsidian", ["Elements"], ["Ghost"], ["obsidianRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15], 1, 2),
	"OfferMaidRestraint": KDYesNoBasic("OfferMaidRestraint", ["Illusion"], ["Ghost"], ["maidRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15], 1, 2),
	"OfferDragon": KDYesNoBasic("OfferDragon", ["Leather"], ["Ghost"], ["dragonRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15], 1, 2),
	"OfferComfy": KDYesNoBasic("OfferComfy", ["Conjure"], ["Ghost"], ["comfyRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferShackles": KDYesNoBasic("OfferShackles", ["Metal"], ["Ghost"], ["shackleRestraints", "steelCuffs"], [55, 0, 75, 0], [-25, 0, 40, 15], 1, 3),
	"OfferKitty": KDYesNoBasic("OfferKitty", ["Will"], ["Ghost"], ["kittyRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferMithril": KDYesNoBasic("OfferMithril", ["Metal"], ["Ghost"], ["mithrilRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferMithrilRope": KDYesNoBasic("OfferMithrilRope", ["Rope"], ["Ghost"], ["mithrilRope","mithrilRopeHogtie"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferWolfRestraint": KDYesNoBasic("OfferWolfRestraint", ["Metal"], ["Ghost"], ["wolfRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferSlime": KDYesNoBasic("OfferSlime", ["Latex"], ["Ghost"], ["slimeRestraintsRandom"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferScarf": KDYesNoBasic("OfferScarf", ["Rope"], ["Ghost"], ["scarfRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferAutoTape": KDYesNoBasic("OfferAutoTape", ["Metal"], ["Ghost"], ["autoTape"], [55, 0, 75, 0], [-200, -200, -200, -200], 2, 3),
	"OfferHiTechCables": KDYesNoBasic("OfferHiTechCables", ["Metal"], ["Ghost"], ["hitechCables","cableGag"], [55, 0, 75, 0], [-200, -200, -200, -200], 2, 3),
	"OfferIce": KDYesNoBasic("OfferIce", ["Elements"], ["Ghost"], ["iceRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15], 2, 3),
	"OfferLatex": KDYesNoBasic("OfferLatex", ["Latex"], ["Ghost"], ["latexRestraints", "latexRestraintsHeavy"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferKigu": KDYesNoBasic("OfferKigu", ["Conjure"], ["Ghost"], ["kiguRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferLeather": KDYesNoBasic("OfferLeather", ["Leather"], ["Ghost"], ["armbinderSpell", "straitjacketSpell", "legbinderSpell", "harnessSpell", "gagSpell", "blindfoldSpell", "leathercuffsSpell"], [55, 0, 75, 0], [-25, 0, 40, 15], 1, 3),
	"OfferRopes": KDYesNoBasic("OfferRopes", ["Rope"], ["Ghost"], ["ropeRestraints", "ropeRestraints2", "ropeRestraintsHogtie", "ropeRestraintsWrist", "ropeAuxiliary"], [55, 0, 75, 0], [-25, 0, 40, 15],  3, 5, "Red"),
	"OfferChastity": KDYesNoBasic("OfferChastity", ["Metal"], ["Ghost"], ["genericChastity"], [55, 0, 75, 0], [-25, 0, 40, 15],  1, 1, "Gold", true, [{name: "ChastityOffer", duration: 300}]),



	"OfferWolfgirl": KDRecruitDialogue("OfferWolfgirl", "Nevermere", "Wolfgirl", "Metal", ["wolfGear"], 5, ["wolfGear", "wolfRestraints"], 8, ["wolfgirl", "trainer"], undefined, undefined, 0.5),
	"OfferMaid": KDRecruitDialogue("OfferMaid", "Maidforce", "Maid", "Illusion", ["maidVibeRestraints"], 5, ["maidVibeRestraints", "maidRestraints"], 13, ["maid"], undefined, ["submissive"], 0.5),
	"OfferBast": KDRecruitDialogue("OfferBast", "Bast", "Bast", "Will", ["kittyCollar"], 5, ["kittyRestraints"], 13, ["mummy"], undefined, ["submissive"], 0.5),
	"OfferDressmaker": KDRecruitDialogue("OfferDressmaker", "Dressmaker", "Bikini", "Rope", ["dressUniform"], 5, ["dressUniform", "dressRestraints"], 13, ["dressmaker"], undefined, ["submissive"], 0.5),
	"OfferBountyhunter": KDRecruitDialogue("OfferBountyhunter", "Bountyhunter", "Bountyhunter", "Illusion", [], 5, ["ropeRestraints", "ropeRestraints2", "ropeRestraintsHogtie", "ropeRestraintsWrist", "ropeAuxiliary"], 13, ["bountyhunter"], undefined, ["submissive"], 0.5),
	"OfferAncientRobot": KDRecruitDialogue("OfferAncientRobot", "AncientRobot", "Wolfgirl", "Metal", ["roboPrisoner"], 5, ["roboPrisoner", "roboAngry", "hitechCables"], 13, ["robot"], undefined, ["submissive"], 0.5),
	"OfferElf": KDRecruitDialogue("OfferElf", "Elf", "Elven", "Will", ["mithrilRestraints"], 5, ["mithrilRestraints", "mithrilRope"], 13, ["elf"], undefined, ["submissive"], 0.5),
	"OfferAlchemist": KDRecruitDialogue("OfferAlchemist", "Alchemist", "BlueSuit", "Latex", ["latexUniform"], 5, ["latexUniform", "latexRestraints"], 13, ["alchemist"], undefined, ["submissive"], 0.5),
	//"OfferWitch": KDRecruitDialogue("OfferWitch", "Witch", "Default", "Conjure", [], 5, ["ropeRestraints", "ropeRestraints2", "ropeRestraintsHogtie", "ropeRestraintsWrist", "ropeAuxiliary"], 13, ["witch"], undefined, ["submissive"], 0.5),
	"OfferElemental": KDRecruitDialogue("OfferElemental", "Elemental", "Obsidian", "Elements", ["obsidianCuffs"], 5, ["obsidianRestraints"], 13, ["elemental"], undefined, ["submissive"], 0.5),
	"OfferDragonheart": KDRecruitDialogue("OfferDragonheart", "Dragon", "Default", "Leather", [], 5, ["dragonRestraints"], 13, ["dragon"], undefined, ["submissive"], 0.5),
	"OfferApprentice": KDRecruitDialogue("OfferApprentice", "Apprentice", "Default", "Conjure", [], 5, ["ropeRestraints", "ropeRestraints2", "ropeRestraintsHogtie", "ropeRestraintsWrist", "ropeAuxiliary"], 13, ["apprentice"], undefined, ["submissive", "wizard"], 0.5),
	//"OfferApprentice2": KDRecruitDialogue("OfferApprentice2", "Apprentice", "Default", "Conjure", [], 5, ["ropeRestraints", "ropeRestraints2", "ropeRestraintsHogtie", "ropeRestraintsWrist", "ropeAuxiliary"], 13, ["apprentice"], undefined, ["submissive", "student"], 0.5),
	"OfferBandit": KDRecruitDialogue("OfferBandit", "Bandit", "Default", "Leather", [], 5, ["leatherRestraints", "leatherRestraintsHeavy"], 13, ["bandit"], undefined, ["submissive"], 0.5),
	//"OfferFungal": KDRecruitDialogue("OfferFungal", "Mushy", "BlueSuit", "Will", ["crystalBelt"], 5, ["crystalBelt", "crystalRestraints"], 13, ["fungal"], undefined, ["submissive"], 0.5),

	"AngelHelp": {
		response: "Default",
		inventory: true,
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag("AngelHelp", 55);
			return false;
		},
		options: {
			"Knife": {
				playertext: "Default", response: "AngelHelpKnife",
				prerequisiteFunction: (gagged, player) => {
					return !KinkyDungeonFlags.get("AngelHelped") && !KinkyDungeonInventoryGet("Knife");
				},
				clickFunction: (gagged, player) => {
					KinkyDungeonInventoryAddWeapon("Knife");
					KinkyDungeonSetFlag("AngelHelped", 5);
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"Pick": {
				playertext: "Default", response: "AngelHelpPick",
				prerequisiteFunction: (gagged, player) => {
					return !KinkyDungeonFlags.get("AngelHelped");
				},
				clickFunction: (gagged, player) => {
					KinkyDungeonLockpicks += 3;
					KinkyDungeonSetFlag("AngelHelped", 5);
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"BlueKey": {
				playertext: "Default", response: "AngelHelpBlueKey",
				prerequisiteFunction: (gagged, player) => {
					return !KinkyDungeonFlags.get("AngelHelped");
				},
				clickFunction: (gagged, player) => {
					KinkyDungeonBlueKeys += 1;
					KinkyDungeonSetFlag("AngelHelped", 5);
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"Leave": {playertext: "Leave", exitDialogue: true},
		}
	},
	"DressmakerQuest": {
		response: "Default",
		inventory: true,
		clickFunction: (gagged, player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KDAddQuest("DressmakerQuest");
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Complete": {
				playertext: "Default", response: "Default",
				gag: true,
				clickFunction: (gagged, player) => {
					let items = KinkyDungeonGetRestraintsWithShrine("BindingDress", true, true);
					// Get the most powerful item
					let item = items.length > 0 ? items.reduce((prev, current) => (KDRestraint(prev).power * KinkyDungeonGetLockMult(prev.lock) > KDRestraint(current).power * KinkyDungeonGetLockMult(current.lock)) ? prev : current) : null;

					let power = item ? KDRestraint(item).power : 5;
					if (KDFactionRelation("Player", "Dressmaker") < 0.25)
						KinkyDungeonChangeFactionRep("Dressmaker", 0.002 * power);
					else
						KinkyDungeonChangeFactionRep("Dressmaker", 0.0007 * power);
					KDRemoveQuest("DressmakerQuest");
					KDSpliceIndex(KinkyDungeonEntities.indexOf(KDDialogueEnemy()), 1);
					return false;
				},
				prerequisiteFunction: (gagged, player) => {
					return KinkyDungeonPlayerTags.has("BindingDress");
				},
				options: {
					"Question": {
						playertext: "Default", response: "Default",
						gag: true,
						clickFunction: (gagged, player) => {
							if (KinkyDungeonStatsChoice.has("Dominant")) {
								KinkyDungeonRemoveRestraintsWithShrine("BindingDress");
								KDGameData.CurrentDialogMsg = "DressmakerQuestComplete_QuestionSuccess";
							}
							return false;
						},
						options: {
							"Leave": {
								playertext: "Leave", response: "Default",
								exitDialogue: true,
							},
						}
					},
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"ApprenticeQuest": {
		response: "Default",
		inventory: true,
		clickFunction: (gagged, player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KDAddQuest("ApprenticeQuest");
					return false;
				},
				prerequisiteFunction: (gagged, player) => {
					return !KDHasQuest("ApprenticeQuest");
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"CompleteLegs": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KDRemoveQuest("ApprenticeQuest");
					KDSpliceIndex(KinkyDungeonEntities.indexOf(KDDialogueEnemy()), 1);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollLegs, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (gagged, player) => {
					return KDHasQuest("ApprenticeQuest") && KinkyDungeonInventoryGet("ScrollLegs") != undefined;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"CompleteArms": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KDRemoveQuest("ApprenticeQuest");
					KDSpliceIndex(KinkyDungeonEntities.indexOf(KDDialogueEnemy()), 1);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollArms, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (gagged, player) => {
					return KDHasQuest("ApprenticeQuest") && KinkyDungeonInventoryGet("ScrollArms") != undefined;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"CompleteVerbal": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KDRemoveQuest("ApprenticeQuest");
					KDSpliceIndex(KinkyDungeonEntities.indexOf(KDDialogueEnemy()), 1);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollVerbal, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (gagged, player) => {
					return KDHasQuest("ApprenticeQuest") && KinkyDungeonInventoryGet("ScrollVerbal") != undefined;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"CompletePurity": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KDRemoveQuest("ApprenticeQuest");
					KDSpliceIndex(KinkyDungeonEntities.indexOf(KDDialogueEnemy()), 1);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollPurity, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (gagged, player) => {
					return KDHasQuest("ApprenticeQuest") && KinkyDungeonInventoryGet("ScrollPurity") != undefined;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"DragonheartQuest": {
		response: "Default",
		clickFunction: (gagged, player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KDAddQuest("DragonheartQuest");
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"MaidforceQuest": {
		response: "Default",
		clickFunction: (gagged, player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KDAddQuest("MaidforceQuest");
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"JailerHiSec": {
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag("LeashToPrison", -1);
			return false;
		},
		options: {
			"Submit": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonDefeat(true);
					return true;
				},
				exitDialogue: true,
			},
			"Resist": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					if (KDDialogueEnemy() && !KDDialogueEnemy().hostile) {
						KDDialogueEnemy().hostile = 300;
					}
					KinkyDungeonStartChase(undefined, "Jailbreak");
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"Bed": {
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag("nobed", 8);
			return false;
		},
		options: {
			"Sleep": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonSetFlag("slept", -1);
					//KinkyDungeonChangeWill(KinkyDungeonStatWillMax * KDSleepBedPercentage);
					KDGameData.SleepTurns = KinkyDungeonSleepTurnsMax;
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"TableFood": {
		response: "Default",
		clickFunction: (gagged, player) => {
			if (KinkyDungeonTargetTile) {
				let tile = KinkyDungeonTilesGet(KinkyDungeonTargetTileLocation);
				if (tile) {
					KDGameData.CurrentDialogMsgData = {
						AMOUNT: "" + 10 * (tile.Amount || 1),
						ARTICLE: "a",
						FOODNAME: TextGet(KinkyDungeonTargetTile.Food),
						FOODMSG: TextGet("KinkyDungeonFood" + KinkyDungeonTargetTile.Food),
					};
				}
			}
			return false;
		},
		options: {
			"Eat": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					let tile = KinkyDungeonTilesGet(KinkyDungeonTargetTileLocation);
					if (tile && tile.Type == "Food") {
						let gagTotal = KinkyDungeonGagTotal();
						if (gagTotal > 0) {
							//KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonFoodEatenGag"), "#ff8800", 1);
							KDGameData.CurrentDialogMsg = "TableFoodEatFail";
						} else {
							// Perform the deed
							let Willmulti = Math.max(KinkyDungeonStatWillMax / KDMaxStatStart);
							let amount = tile.Amount ? tile.Amount : 1.0;
							KinkyDungeonChangeWill(amount * Willmulti);

							// Send the message and advance time
							KinkyDungeonAdvanceTime(1);
							//KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonFoodEaten"), "lightgreen", 1);

							// Remove the food
							tile.Food = "Plate";
							tile.Eaten = true;
						}
					}
					return false;
				},
				options: {
					"Leave": {
						clickFunction: (gagged, player) => {
							KinkyDungeonTargetTile = null;
							KinkyDungeonTargetTileLocation = "";
							return false;
						},
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Leave": {
				clickFunction: (gagged, player) => {
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					return false;
				},
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"Button": {
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag("nobutton", 3);
			return false;
		},
		options: {
			"Press": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					// PUSH the BUTTON
					KDCreateEffectTile(player.x, player.y, {
						name: "WireSparks",
						duration: 2,
					}, 0);
					KinkyDungeonAdvanceTime(1, true, true);
					return false;
				},
				exitDialogue: true,
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},

	"LeylineMap": {
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag("nodollterm", 4);
			return false;
		},
		options: {
			"Leave": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonSpells.push(KinkyDungeonFindSpell("ManaPoolUp"));
					KinkyDungeonUpdateStats(0);
					return false;
				},
				exitDialogue: true,
			},
			"Cancel": {
				playertext: "Default", response: "Default",
				options: {
					"Leave": {
						playertext: "Default", response: "Default",
						exitDialogue: true,
						clickFunction: (gagged, player) => {
							KinkyDungeonSpells.push(KinkyDungeonFindSpell("ManaPoolUp"));
							KinkyDungeonUpdateStats(0);
							return false;
						},
					},
					"Cancel": {
						playertext: "Default", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"DollTerminal_Step": {
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag("nodollterm", 4);
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Enter": {
				playertext: "Default", response: "Default",
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
					"Enter": {
						playertext: "Default", response: "Default",
						options: {
							"Leave": {
								playertext: "Leave", response: "Default",
								clickFunction: (gagged, player) => {
									KDEnterDollTerminal(true);
									return false;
								},
								exitDialogue: true,
							},
						}
					},
				}
			},
		}
	},
	"DollTerminal_Forced": {
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag("nodollterm", 4);
			KDGameData.CurrentDialogMsgValue = {
				Percent: Math.max(0, 0.25 * KinkyDungeonSlowLevel),
			};
			KDGameData.CurrentDialogMsgData = {
				RESISTCHANCE: "" + Math.max(0, Math.round(100 - KDGameData.CurrentDialogMsgValue.Percent * 100)),
			};
			return false;
		},
		options: {
			"Resist": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					if (KDRandom() < KDGameData.CurrentDialogMsgValue.Percent) {
						KDGameData.CurrentDialogMsg = "DollTerminal_ForcedForced";
						KDGameData.CurrentDialogStage = "Forced";
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Enter": {
				playertext: "Default", response: "Default",
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						clickFunction: (gagged, player) => {
							KDEnterDollTerminal(true);
							return false;
						},
						exitDialogue: true,
					},
				}
			},
			"Forced": {
				prerequisiteFunction: (gagged, player) => {return false;},
				playertext: "Default", response: "Default",
				options: {
					"Leave": {
						clickFunction: (gagged, player) => {
							KDEnterDollTerminal(false);
							return false;
						},
						playertext: "DollTerminal_Forced_Submit", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"Leyline": {
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag("noleyline", 8);
			return false;
		},
		options: {
			"Use": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonChangeMana(0, false, 100, false, false);
					if (KDTile() && KDTile().Leyline) {
						KinkyDungeonMapSet(player.x, player.y, '0');
						KDTileDelete();
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"BanditQuest": {
		response: "Default",
		clickFunction: (gagged, player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KDAddQuest("BanditPrisoner");
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"PrisonerRescueBountyhunter": KDPrisonerRescue("PrisonerRescueBountyhunter", "Bountyhunter", ["Nawashi", "Ninja"]),
	"PrisonerRescue": KDPrisonerRescue("PrisonerRescue", "Bandit", ["Bandit", "Bandit"]),
	"PrisonerRescueAlchemist": KDPrisonerRescue("PrisonerRescueAlchemist", "Alchemist", ["Alkahestor", "Alchemist"]),
	"PrisonerRescueNevermere": KDPrisonerRescue("PrisonerRescueNevermere", "Nevermere", ["Wolfgirl", "WolfgirlPet"]),
	"PrisonerRescueApprentice": KDPrisonerRescue("PrisonerRescueApprentice", "Apprentice", ["Apprentice2", "Apprentice"]),
	"PrisonerRescueDressmaker": KDPrisonerRescue("PrisonerRescueDressmaker", "Dressmaker", ["Librarian", "Dressmaker"]),
	"PrisonerRescueWitch": KDPrisonerRescue("PrisonerRescueWitch", "Witch", ["WitchIce", "Apprentice"]),
	"PrisonerRescueElemental": KDPrisonerRescue("PrisonerRescueElemental", "Elemental", ["ElementalAir", "ElementalFire"]),
	"PrisonerRescueDragon": KDPrisonerRescue("PrisonerRescueDragon", "Dragon", ["DragonShield", "Dragon"]),
	"PrisonerRescueMaid": KDPrisonerRescue("PrisonerRescueMaid", "Maidforce", ["MaidforceStalker", "Maidforce"]),
	"PrisonerRescueBast": KDPrisonerRescue("PrisonerRescueBast", "Bast", ["Cleric", "MeleeCleric"]),
	"PrisonerRescueElf": KDPrisonerRescue("PrisonerRescueElf", "Elf", ["Elf", "ElfRanger"]),
	//"PrisonerRescueMushy": KDPrisonerRescue("PrisonerRescueMushy", "Mushy", ["Fungal", "Mushy"]),
	"PrisonerRescueAncientRobot": KDPrisonerRescue("PrisonerRescueAncientRobot", "AncientRobot", ["CaptureBot", "Drone"]),

	"ShopkeeperRescue": {
		response: "Default",
		clickFunction: (gagged, player) => {
			return false;
		},
		options: {
			"Accept": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KDGameData.PrisonerState = "";
					KinkyDungeonInterruptSleep();
					// Type shenanigans unintended
					let doorTile = KDGetJailDoor(player.x, player.y);
					/** @type {KDPoint} */
					let door = doorTile;
					if (door) {
						if (doorTile.tile) {
							doorTile.tile.Lock = undefined;
							KDUpdateDoorNavMap();
						}
						KinkyDungeonMapSet(door.x, door.y, 'd');
					} else door = KinkyDungeonGetNearbyPoint(player.x, player.y, true);
					if (!door) {
						door = {x: player.x, y: player.y}; // Better glitch than break game
					}
					KinkyDungeonEntities = [];
					KDGameData.RespawnQueue = [];
					KDUpdateEnemyCache = true;
					let e = DialogueCreateEnemy(door.x, door.y, "ShopkeeperRescue");
					e.allied = 9999;
					e.faction = "Player";
					KDGameData.CurrentDialogMsgSpeaker = e.Enemy.name;
					KinkyDungeonSetEnemyFlag(e, "RescuingPlayer", -1);

					KDGameData.KinkyDungeonGuardSpawnTimer = 100;
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Refuse": {
				playertext: "Default", response: "Default",
				gag: true,
				clickFunction: (gagged, player) => {
					KinkyDungeonSetFlag("refusedShopkeeperRescue", 100);
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"ShopkeeperRescueChatter": {
		response: "Default",
		clickFunction: (gagged, player) => {
			return false;
		},
		options: {
			"Treasure": {
				playertext: "Default", response: "Default", gagDisabled: true,
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Cost": {
				playertext: "Default", response: "Default", gagDisabled: true,
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"ShopkeeperTeleport": {
		response: "Default",
		clickFunction: (gagged, player) => {
			if (!KDGameData.ShopkeeperFee) KDGameData.ShopkeeperFee = 0;
			KDGameData.ShopkeeperFee += KDDialogueParams.ShopkeeperFee + Math.max(0, KDDialogueParams.ShopkeeperFeePerLevel * MiniGameKinkyDungeonLevel);
			KDGameData.CurrentDialogMsgValue = {
				"RESCUECOST": KDGameData.ShopkeeperFee,
			};
			KDGameData.CurrentDialogMsgData = {
				"RESCUECOST": "" + KDGameData.ShopkeeperFee,
			};
			return false;
		},
		options: {
			"Pay": {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (gagged, player) => {
					return KinkyDungeonGold >= KDGameData.ShopkeeperFee;
				},
				clickFunction: (gagged, player) => {
					KinkyDungeonGold -= KDGameData.ShopkeeperFee;
					KDGameData.ShopkeeperFee = 0;
					KinkyDungeonRemoveRestraintsWithShrine("Rope", undefined, true, false, true);
					KinkyDungeonRemoveRestraintsWithShrine("Leather", undefined, true, false, true);
					KinkyDungeonRemoveRestraintsWithShrine("Metal", undefined, true, false, true);
					KinkyDungeonRemoveRestraintsWithShrine("Latex", undefined, true, false, true);
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Tab": {
				prerequisiteFunction: (gagged, player) => {
					return !KDGameData.CurrentDialogMsgData.Please;
				},
				playertext: "Default", response: "Default", gag: true,
				clickFunction: (gagged, player) => {
					if (KinkyDungeonGold >= KDDialogueParams.ShopkeeperFee + Math.max(0, KDDialogueParams.ShopkeeperFeePerLevel * MiniGameKinkyDungeonLevel)) {
						KDGameData.CurrentDialogMsg = "ShopkeeperTeleportTabNo";
						KDGameData.CurrentDialogStage = "";
						KDGameData.CurrentDialogMsgData.Please = "true";
						return false;
					} else {
						if (!KDGameData.CurrentDialogMsgData) KDGameData.CurrentDialogMsgData = {};
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor = KinkyDungeonGetRestraint({tags: ['basicCurse', 'shopCurse']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint = KDChooseRestraintFromListGroupPri(
							KDGetRestraintsEligible({tags: ['trap', 'shopRestraint']}, 10, 'grv', true, undefined, undefined, undefined, false),
							KDRestraintGroupProgressiveOrderFun)?.name;
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar = KinkyDungeonGetRestraint({tags: ['shopCollar']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit = KinkyDungeonGetRestraint({tags: ['shopCatsuit']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;

						if (KDGameData.ShopkeeperFee < KDDialogueParams.ShopkeeperFeePunishThresh || !(
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor
							|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint
							|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar
							|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit
							|| KinkyDungeonGold > KDGameData.ShopkeeperFee
						)) {
							if (KinkyDungeonPlayerTags.get("Metal") || KinkyDungeonPlayerTags.get("Leather") || KinkyDungeonPlayerTags.get("Rope") || KinkyDungeonPlayerTags.get("Latex")) {
								KDGameData.CurrentDialogMsg = "ShopkeeperTeleportTabYesRestrained";
							} else KDGameData.CurrentDialogMsg = "ShopkeeperTeleportTabYes";
						} else {
							KDGameData.CurrentDialogStage = "Debt";
							KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt";
						}
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"TabRetry": {
				prerequisiteFunction: (gagged, player) => {
					return KDGameData.CurrentDialogMsgData.Please != undefined;
				},
				playertext: "Default", response: "Default", gag: true,
				clickFunction: (gagged, player) => {
					if (!KDGameData.CurrentDialogMsgData) KDGameData.CurrentDialogMsgData = {};
					KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor = KinkyDungeonGetRestraint({tags: ['basicCurse', 'shopCurse']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;
					KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint = KDChooseRestraintFromListGroupPri(
						KDGetRestraintsEligible({tags: ['trap', 'shopRestraint']}, 10, 'grv', true, undefined, undefined, undefined, false),
						KDRestraintGroupProgressiveOrderFun)?.name;
					KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar = KinkyDungeonGetRestraint({tags: ['shopCollar']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;
					KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit = KinkyDungeonGetRestraint({tags: ['shopCatsuit']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;

					if (KDGameData.ShopkeeperFee < KDDialogueParams.ShopkeeperFeePunishThresh || !(
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor
						|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint
						|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar
						|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit
						|| KinkyDungeonGold > KDGameData.ShopkeeperFee
					)) {
						if (KinkyDungeonPlayerTags.get("Metal") || KinkyDungeonPlayerTags.get("Leather") || KinkyDungeonPlayerTags.get("Rope") || KinkyDungeonPlayerTags.get("Latex")) {
							KDGameData.CurrentDialogMsg = "ShopkeeperTeleportTabRetryRestrained";
						} else KDGameData.CurrentDialogMsg = "ShopkeeperTeleportTabRetry";
					} else {
						KDGameData.CurrentDialogStage = "Debt";
						KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt";
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Debt": {
				prerequisiteFunction: (gagged, player) => {
					return false;
				},
				playertext: "Default", response: "Default", gag: true,
				clickFunction: (gagged, player) => {
					return false;
				},
				options: {
					"Armor": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (gagged, player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Armor != undefined;
						},
						clickFunction: (gagged, player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = TextGet("Restraint" + KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperTeleportDebt_Yes", response: "Default", gag: true,
								clickFunction: (gagged, player) => {
									if (KDRandom() > (KDBasicArmorWeight_Cursed) / (KDBasicArmorWeight_Cursed + KDBasicArmorWeight)) {
										KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt_Armor_YesUncursed";

									} else {
										KinkyDungeonAddRestraint(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor), 0, true, "", true, false, false, undefined, "Shopkeeper", false, undefined,
											CommonRandomItemFromList("", KDCurseUnlockList.Basic));
										KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt_Armor_YesCursed";

									}

									return false;
								},
								options: {
									"Leave": {
										playertext: "Leave", response: "Default",
										exitDialogue: true,
									},
								}
							},
							"No": {
								playertext: "ShopkeeperTeleportDebt_No", response: "Default", gag: true,
								clickFunction: (gagged, player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt";
									return true;
								}
							},
						}
					},
					"Restraint": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (gagged, player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Restraint != undefined;
						},
						clickFunction: (gagged, player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = TextGet("Restraint" + KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperTeleportDebt_Yes", response: "Default", gag: true,
								clickFunction: (gagged, player) => {
									KinkyDungeonAddRestraint(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint), 0, true, "", true, false, false, undefined, "Shopkeeper", false, undefined,
										CommonRandomItemFromList("", KDCurseUnlockList.Basic));
									return false;
								},
								options: {
									"Leave": {
										playertext: "Leave", response: "Default",
										exitDialogue: true,
									},
								}
							},
							"No": {
								playertext: "ShopkeeperTeleportDebt_No", response: "Default", gag: true,
								clickFunction: (gagged, player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt";
									return true;
								}
							},
						}
					},
					"Collar": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (gagged, player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Collar != undefined;
						},
						clickFunction: (gagged, player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = TextGet("Restraint" + KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperTeleportDebt_Yes", response: "Default", gag: true,
								clickFunction: (gagged, player) => {
									KinkyDungeonAddRestraint(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar), 0, true, "", true, false, false, undefined, "Shopkeeper", false, undefined,
										CommonRandomItemFromList("", KDCurseUnlockList.Basic));
									return false;
								},
								options: {
									"Leave": {
										playertext: "Leave", response: "Default",
										exitDialogue: true,
									},
								}
							},
							"No": {
								playertext: "ShopkeeperTeleportDebt_No", response: "Default", gag: true,
								clickFunction: (gagged, player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt";
									return true;
								}
							},
						}
					},
					"Catsuit": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (gagged, player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Catsuit != undefined;
						},
						clickFunction: (gagged, player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = TextGet("Restraint" + KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperTeleportDebt_Yes", response: "Default", gag: true,
								clickFunction: (gagged, player) => {
									KinkyDungeonAddRestraint(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit), 0, true, "", true, false, false, undefined, "Shopkeeper", false, undefined,
										CommonRandomItemFromList("", KDCurseUnlockList.Basic));
									return false;
								},
								options: {
									"Leave": {
										playertext: "Leave", response: "Default",
										exitDialogue: true,
									},
								}
							},
							"No": {
								playertext: "ShopkeeperTeleportDebt_No", response: "Default", gag: true,
								clickFunction: (gagged, player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt";
									return true;
								}
							},
						}
					},
					"Pay": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (gagged, player) => {
							return KinkyDungeonGold >= KDGameData.ShopkeeperFee;
						},
						clickFunction: (gagged, player) => {
							KinkyDungeonGold -= KDGameData.ShopkeeperFee;
							KDGameData.ShopkeeperFee = 0;
							KinkyDungeonRemoveRestraintsWithShrine("Rope", undefined, true, false, true);
							KinkyDungeonRemoveRestraintsWithShrine("Leather", undefined, true, false, true);
							KinkyDungeonRemoveRestraintsWithShrine("Metal", undefined, true, false, true);
							KinkyDungeonRemoveRestraintsWithShrine("Latex", undefined, true, false, true);
							return false;
						},
						options: {
							"Leave": {
								playertext: "Leave", response: "Default",
								exitDialogue: true,
							},
						}
					},
				}
			},
		}
	},
	"ShopkeeperStart": {
		response: "Default",
		clickFunction: (gagged, player) => {
			if (!KDGameData.ShopkeeperFee) KDGameData.ShopkeeperFee = 0;
			KDGameData.CurrentDialogMsgValue = {
				"RESCUECOST": KDGameData.ShopkeeperFee || (KDDialogueParams.ShopkeeperFee + Math.max(0, KDDialogueParams.ShopkeeperFeePerLevel * MiniGameKinkyDungeonLevel)),
			};
			KDGameData.CurrentDialogMsgData = {
				"RESCUECOST": "" + (KDGameData.ShopkeeperFee || (KDDialogueParams.ShopkeeperFee + Math.max(0, KDDialogueParams.ShopkeeperFeePerLevel * MiniGameKinkyDungeonLevel))),
			};
			return false;
		},
		options: {
			"Danger": {
				playertext: "Default", response: "Default",
				gagDisabled: true,
				options: {
					"Return": {
						playertext: "Return", response: "Default",
						leadsToStage: "",
					},
				}
			},
			"Fee": {
				playertext: "Default", response: "Default",
				gagDisabled: true,
				options: {
					"Return": {
						playertext: "Return", response: "Default",
						leadsToStage: "",
					},
				}
			},
			"Shop": {
				playertext: "Default", response: "Default",
				gagDisabled: true,
				options: {
					"Return": {
						playertext: "Return", response: "Default",
						leadsToStage: "",
					},
				}
			},
			"Gag": {
				playertext: "Default", response: "Default",
				gagRequired: true,
				options: {
					"Return": {
						playertext: "Return", response: "Default",
						leadsToStage: "",
					},
				}
			},
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},

	"BlacksmithShop": KDSaleShop("BlacksmithShop", ["Lockpick", "Knife", "Sword", "Axe", "Spear", "TrapCuffs"], [], ["blacksmith"], 0.4, 1.5),
	"PrisonerBandit": {
		response: "Default",
		personalities: ["Sub"],
		clickFunction: (gagged, player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				personalities: ["Sub"],
				clickFunction: (gagged, player) => {
					if (KDDialogueEnemy()) {
						let e = KDDialogueEnemy();
						KDSpliceIndex(KinkyDungeonEntities.indexOf(KDDialogueEnemy()), 1);
						let created = DialogueCreateEnemy(e.x, e.y, "Bandit");
						created.allied = 9999;
						created.personality = e.personality;
						if (KDFactionRelation("Player", "Bandit") < -0.5) {
							for (let enemy of KinkyDungeonEntities) {
								if (enemy.Enemy.tags.bandit) {
									if (enemy.hostile && enemy.hostile < 9000) {
										enemy.hostile = 0;
									}
									enemy.ceasefire = 300;
								}
							}
						}
						KinkyDungeonAggroFaction("Bountyhunter");
						if (KDFactionRelation("Player", "Bandit") < 0.25)
							KinkyDungeonChangeFactionRep("Bandit", 0.015);
						else
							KinkyDungeonChangeFactionRep("Bandit", 0.005);
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Tighten": {
				playertext: "Default", response: "Default",
				personalities: ["Sub"],
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"PrisonerJail": { // For prisoners in the prison level. Doesnt increase rep much, but useful for jailbreak purposes
		response: "Default",
		clickFunction: (gagged, player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Unlock": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					if (KinkyDungeonRedKeys > 0) {
						if (KinkyDungeonCanUseKey() || !KinkyDungeonIsArmsBound()) {
							if (KDDialogueEnemy()) {
								let e = KDDialogueEnemy();
								e.boundLevel = 0;
								KinkyDungeonSetEnemyFlag(e, "imprisoned", 0);
								e.allied = 9999;
								e.specialdialogue = undefined;
								KinkyDungeonAggroFaction("Jail");
								let faction = e.Enemy.faction ? e.Enemy.faction : "Enemy";
								e.faction = "Player";
								if (!KinkyDungeonHiddenFactions.includes(faction) && !(KDGameData.MapFaction == faction)) {
									if (KDFactionRelation("Player", faction) < 0.25)
										KinkyDungeonChangeFactionRep(faction, 0.005);
									else
										KinkyDungeonChangeFactionRep(faction, 0.0025);
								}
								KinkyDungeonRedKeys -= 1;
								if (KinkyDungeonIsHandsBound(false, true, 0.2)) {
									DialogueBringNearbyEnemy(player.x, player.y, 8);
									KDGameData.CurrentDialogMsg = "PrisonerJailUnlockSlow";
								} else {
									KDGameData.CurrentDialogMsg = "PrisonerJailUnlock";
									if (e.Enemy.tags.gagged) {
										KDGameData.CurrentDialogMsg = KDGameData.CurrentDialogMsg + "Gagged";
									}
								}
							}
						} else {
							KDGameData.CurrentDialogStage = "";
							KDGameData.CurrentDialogMsg = "PrisonerJailUnlockHandsBound";
						}
					} else {
						KDGameData.CurrentDialogStage = "";
						KDGameData.CurrentDialogMsg = "PrisonerJailNoKeys";
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Pick": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					if (KinkyDungeonLockpicks > 0) {
						if (!KinkyDungeonIsHandsBound(false, true, 0.45)) {
							if (KDDialogueEnemy()) {
								let e = KDDialogueEnemy();
								e.boundLevel = 0;
								KinkyDungeonSetEnemyFlag(e, "imprisoned", 0);
								e.allied = 9999;
								e.specialdialogue = undefined;
								KinkyDungeonAggroFaction("Jail");
								let faction = e.Enemy.faction ? e.Enemy.faction : "Enemy";
								e.faction = "Player";
								if (!KinkyDungeonHiddenFactions.includes(faction) && !(KDGameData.MapFaction == faction)) {
									if (KDFactionRelation("Player", faction) < 0.25)
										KinkyDungeonChangeFactionRep(faction, 0.005);
									else
										KinkyDungeonChangeFactionRep(faction, 0.0025);
								}
								KDGameData.CurrentDialogMsg = "PrisonerJailPick";
								if (e.Enemy.tags.gagged) {
									KDGameData.CurrentDialogMsg = KDGameData.CurrentDialogMsg + "Gagged";
								}
								DialogueBringNearbyEnemy(player.x, player.y, 8);
							}
						} else {
							KDGameData.CurrentDialogStage = "";
							KDGameData.CurrentDialogMsg = "PrisonerJailPickHandsBound";
						}
					} else {
						KDGameData.CurrentDialogStage = "";
						KDGameData.CurrentDialogMsg = "PrisonerJailNoPick";
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"Fuuka": {
		response: "Default",
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				enemy.hostile = 9999;
				enemy.aware = true;
				enemy.vp = 2;
				enemy.AI = 'hunt';
				KinkyDungeonSetFlag("BossDialogueFuuka", -1, 1);
			}
			return false;
		},
		options: {
			"Aggressive": { gag: true,
				playertext: "Default", response: "Default",
				options: {
					"Question": {gagDisabled: true,
						playertext: "Default", response: "Default",
						options: {
							"Brat": {
								playertext: "Default", response: "Default",
								options: {
									"Proceed": {
										playertext: "Default", response: "Default",
										leadsToStage: "PostIntro",
									}
								}
							},
							"Proceed": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
					"Proceed": {gagDisabled: true,
						playertext: "Default", response: "Default",
						leadsToStage: "PostIntro",
					},
					"ProceedGag": {gagRequired: true,
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
					"Brat": {gagDisabled: true,
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {gag: true,
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
							"Proceed2": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
				}
			},
			"Defensive": { gag: true,
				playertext: "Default", response: "Default",
				options: {
					"Question": {gagDisabled: true,
						playertext: "Default", response: "Default",
						options: {
							"Question": {
								playertext: "Default", response: "Default",
								options: {
									"Question": {
										playertext: "Default", response: "Default",
										options: {
											"Question": {
												playertext: "Default", response: "Default",
												options: {
													"Question": {
														playertext: "Default", response: "Default",
														options: {
															"Question": {
																playertext: "Default", response: "Default",
																options: {
																	"Proceed": {
																		playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
																		leadsToStage: "PostIntro",
																	}
																}
															},
															"Question2": {
																playertext: "Default", response: "Default",
																options: {
																	"Proceed": {
																		playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
																		leadsToStage: "PostIntro",
																	}
																}
															},
															"Proceed": {
																playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
																leadsToStage: "PostIntro",
															}
														}
													},
													"Proceed": {
														playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
														leadsToStage: "PostIntro",
													}
												}
											},
											"Proceed": {
												playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
												leadsToStage: "PostIntro",
											}
										}
									},
									"Proceed": {
										playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
										leadsToStage: "PostIntro",
									}
								}
							},
							"Proceed": {
								playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
					"Proceed": {gagDisabled: true,
						playertext: "Default", response: "Default",
						leadsToStage: "PostIntro",
					},
					"ProceedGag": {gagRequired: true,
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
					"Brat": {gagDisabled: true,
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {gag: true,
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
							"Proceed2": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
				}
			},
			"Brat": { gag: true,
				playertext: "Default", response: "Default",
				options: {
					"Question": {gagDisabled: true,
						playertext: "Default", response: "Default",
						options: {
							"Question": {
								playertext: "Default", response: "Default",
								options: {
									"Proceed": {
										playertext: "Default", response: "Default",
										leadsToStage: "PostIntro",
									}
								}
							},
							"Proceed": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
					"Proceed": {gagDisabled: true,
						playertext: "Default", response: "Default",
						leadsToStage: "PostIntro",
					},
					"ProceedGag": {gagRequired: true,
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
					"Brat": {gagDisabled: true,
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {gag: true,
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
							"Proceed2": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
				}
			},
			"Dom": { gag: true,
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonChangeRep("Ghost", -2);
					return false;
				},
				options: {
					"Question": {gagDisabled: true,
						playertext: "Default", response: "Default",
						options: {
							"Question": {
								playertext: "Default", response: "Default",
								options: {
									"Proceed": {
										playertext: "Default", response: "Default",
										leadsToStage: "PostIntro",
									}
								}
							},
							"Proceed": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
					"Proceed": {gagDisabled: true,
						playertext: "Default", response: "Default",
						leadsToStage: "PostIntro",
					},
					"ProceedGag": {gagRequired: true,
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
					"Brat": {gag: true,
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {gag: true,
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
							"Proceed2": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
				}
			},
			"Sub": { gag: true,
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonChangeRep("Ghost", 2);
					return false;
				},
				options: {
					"Question": {gagDisabled: true,
						playertext: "Default", response: "Default",
						options: {
							"Question": {
								playertext: "Default", response: "Default",
								options: {
									"Proceed": {
										playertext: "Default", response: "Default",
										leadsToStage: "PostIntro",
									}
								}
							},
							"Proceed": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
					"Proceed": {gagDisabled: true,
						playertext: "Default", response: "Default",
						leadsToStage: "PostIntro",
					},
					"ProceedGag": {gagRequired: true,
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
					"Brat": {gag: true,
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {gag: true,
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
							"Proceed2": {
								playertext: "Default", response: "Default",
								leadsToStage: "PostIntro",
							},
						}
					},
				}
			},
			"Attack": {playertext: "Default", exitDialogue: true},

			"PostIntro": {
				prerequisiteFunction: (gagged, player) => {return false;},
				playertext: "Default", response: "Default",
				options: {
					"Zombie": {
						gagDisabled: true,
						playertext: "Default", response: "Default",
						leadsToStage: "Defensive_Question",
					},
					"Brat": {gag: true,
						playertext: "Default", response: "FuukaPostIntro_Brat",
						leadsToStage: "Fight",
					},
					"Dom": {gag: true,
						playertext: "Default", response: "FuukaPostIntro_Dom",
						leadsToStage: "Fight",
						clickFunction: (gagged, player) => {
							KinkyDungeonChangeRep("Ghost", -2);
							return false;
						}
					},
					"Sub": {gag: true,
						playertext: "Default", response: "FuukaPostIntro_Sub",
						leadsToStage: "Fight",
						clickFunction: (gagged, player) => {
							KinkyDungeonChangeRep("Ghost", 2);
							return false;
						}
					},
					"Normal": {gag: true,
						playertext: "Default", response: "FuukaPostIntro_Normal",
						leadsToStage: "Fight",
					},
				}
			},
			"Fight": {
				prerequisiteFunction: (gagged, player) => {return false;},
				playertext: "Default", dontTouchText: true,
				options: {
					"Fight1": {gag: true,
						playertext: "Default", exitDialogue: true,
					},
					"Fight2": {gag: true,
						playertext: "Default", exitDialogue: true,
					},
					"Fight3": {gag: true,
						playertext: "Default", exitDialogue: true,
					},
				}
			}
		}
	},
	"Dollmaker": {
		response: "Default",
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				enemy.hostile = 9999;
				enemy.aware = true;
				enemy.vp = 2;
				enemy.AI = 'hunt';
				KinkyDungeonSetFlag("BossDialogueDollmaker", -1, 1);
			}
			return false;
		},
		options: {
			"Ask": {
				playertext: "Default", response: "Default", gag: true,
				options: {
					"Proceed": {
						playertext: "Default", response: "Default", gag: true,
						leadsToStage: "Fight",
					},
					"Staff": {
						prerequisiteFunction: (gagged, player) => {
							return KinkyDungeonPlayerDamage?.name == "StaffDoll";
						},
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {
								playertext: "Default", response: "Default",
								leadsToStage: "Fight",
							},
						}
					}
				}
			},
			"Assume": {
				playertext: "Default", response: "Default", gagDisabled: true,
				options: {
					"Happy": {
						playertext: "Default", response: "Default",
						leadsToStage: "Fight",
					},
					"Proceed": {
						playertext: "Default", response: "Default",
						leadsToStage: "Fight",
					},
					"Staff": {
						prerequisiteFunction: (gagged, player) => {
							return KinkyDungeonPlayerDamage?.name == "StaffDoll";
						},
						playertext: "Default", response: "Default",
						options: {
							"Proceed": {
								playertext: "Default", response: "Default",
								leadsToStage: "Fight",
							},
						}
					}
				}
			},

			"Fight": {
				prerequisiteFunction: (gagged, player) => {return false;},
				playertext: "Default", response: "Default",
				options: {
					"Wait": {gagDisabled: true,
						playertext: "Default", response: "Default",
						options: {
							"Dismiss": {
								playertext: "Default", response: "Default",
								options: {
									"Proceed": {
										playertext: "Default", exitDialogue: true,
									},
								}
							},
							"Press": {
								playertext: "Default", response: "Default",
								options: {
									"Proceed": {
										playertext: "Default", exitDialogue: true,
									},
								}
							},
							"Press2": {
								playertext: "Default", response: "Default",
								options: {
									"Proceed": {
										playertext: "Default", exitDialogue: true,
									},
								}
							},
							"Proceed": {
								playertext: "Default", exitDialogue: true,
							},
						}
					},
					"Fight1": {gag: true,
						playertext: "Default", exitDialogue: true,
					},
					"Fight2": {gag: true,
						playertext: "Default", exitDialogue: true,
					},
					"Fight3": {gag: true,
						playertext: "Default", exitDialogue: true,
					},
				}
			},
			"Attack": {playertext: "Default", exitDialogue: true},
		}
	},
	"DollmakerStage2": { // Player defeats fuuka's first form
		response: "Default",
		clickFunction: (gagged, player) => {
			let point = KinkyDungeonGetNearbyPoint(KinkyDungeonStartPosition.x + 10, KinkyDungeonStartPosition.y - 5, true,undefined, true);
			if (!point) {
				point = {x: KinkyDungeonStartPosition.x + 10, y: KinkyDungeonStartPosition.y - 7};
			}
			let e = DialogueCreateEnemy(point.x, point.y, "DollmakerBoss2");
			e.hostile = 300;
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"DollmakerStage3": { // Player defeats fuuka's first form
		response: "Default",
		clickFunction: (gagged, player) => {
			// Remove the doors
			for (let en of KinkyDungeonEntities) {
				if (en.Enemy.tags.dolldoor) en.hp = 0;
			}
			let point = KinkyDungeonGetNearbyPoint(player.x, player.y, true);
			if (!point) {
				point = KinkyDungeonGetRandomEnemyPoint(false, false, null);
			}
			let e = DialogueCreateEnemy(point.x, point.y, "DollmakerBoss3");
			e.hostile = 300;
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"DollmakerWin": { // Player beats Fuuka
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag("BossUnlocked", -1);
			KinkyDungeonSetFlag("SpawnMap", -1);
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				clickFunction: (gagged, player) => {
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("DollmakerVisor");
						KDUnlockPerk("StartCyberDoll");
						KDUnlockPerk("CommonCyber");
					}
					return false;
				},
				exitDialogue: true,
			},
			"Accept": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerVisor"), 0, true);
					KinkyDungeonAddGold(1000);
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("DollmakerVisor");
						KDUnlockPerk("StartCyberDoll");
						KDUnlockPerk("CommonCyber");
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Accept2": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerMask"), 0, true);
					KinkyDungeonAddGold(1000);
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("DollmakerVisor");
						KDUnlockPerk("StartCyberDoll");
						KDUnlockPerk("CommonCyber");
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Gag": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonChangeRep("Ghost", -5);
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("DollmakerVisor");
						KDUnlockPerk("StartCyberDoll");
						KDUnlockPerk("CommonCyber");
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"DollmakerLose": { // Player loses to Fuuka
		response: "Default",
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				enemy.hostile = 0;
				enemy.ceasefire = 4;
				KinkyDungeonSetFlag("BossUnlocked", -1);
				KinkyDungeonSetFlag("NoDollRoomBypass", 0);
			}
			return false;
		},
		options: {
			"Accept": { gag: true,
				playertext: "Default", response: "Default",
				options: {
					"Continue1": {
						playertext: "DollmakerLose_Continue1", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerVisor"), 0, true);
							return false;
						},
					},
					"Continue2": {
						playertext: "DollmakerLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerMask"), 0, true);
							return false;
						},
					},
					"Continue3": {
						playertext: "DollmakerLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDRandom() < 0.5 ? "DollmakerVisor" : "DollmakerMask"), 0, true);
							return false;
						},
					},
				}
			},
			"Deny": { gag: true,
				playertext: "Default", response: "Default",
				options: {
					"Continue1": {
						playertext: "DollmakerLose_Continue1", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerVisor"), 0, true);
							return false;
						},
					},
					"Continue2": {
						playertext: "DollmakerLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerMask"), 0, true);
							return false;
						},
					},
					"Continue3": {
						playertext: "DollmakerLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDRandom() < 0.5 ? "DollmakerVisor" : "DollmakerMask"), 0, true);
							return false;
						},
					},
				}
			},
			"Finish": {
				prerequisiteFunction: (gagged, player) => {return false;},
				playertext: "Default", response: "DollmakerLoseFinish",
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			}
		}
	},
	"FuukaLose": { // Player loses to Fuuka
		response: "Default",
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				enemy.hostile = 0;
				enemy.ceasefire = 4;
				KinkyDungeonSetFlag("BossUnlocked", -1);
			}
			return false;
		},
		options: {
			"Accept": { gag: true,
				playertext: "Default", response: "Default",
				options: {
					"Continue1": {
						playertext: "FuukaLose_Continue1", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue2": {
						playertext: "FuukaLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue3": {
						playertext: "FuukaLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
				}
			},
			"Deny": { gag: true,
				playertext: "Default", response: "Default",
				options: {
					"Continue1": {
						playertext: "FuukaLose_Continue1", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue2": {
						playertext: "FuukaLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue3": {
						playertext: "FuukaLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged, player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
				}
			},
			"Finish": {
				prerequisiteFunction: (gagged, player) => {return false;},
				playertext: "Default", response: "FuukaLoseFinish",
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			}
		}
	},
	"FuukaStage2": { // Player defeats fuuka's first form
		response: "Default",
		clickFunction: (gagged, player) => {
			let point = KinkyDungeonGetNearbyPoint(player.x, player.y, true);
			if (!point) {
				point = KinkyDungeonGetRandomEnemyPoint(false, false, null);
			}
			let e = DialogueCreateEnemy(point.x, point.y, "Fuuka2");
			e.hostile = 300;
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"FuukaWin": { // Player beats Fuuka
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag("BossUnlocked", -1);
			KinkyDungeonSetFlag("SpawnMap", -1);
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				clickFunction: (gagged, player) => {
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("FuukaCollar");
						KDUnlockPerk("CommonFuuka");
					}
					return false;
				},
				exitDialogue: true,
			},
			"Accept": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
					KinkyDungeonAddGold(1000);
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("FuukaCollar");
						KDUnlockPerk("CommonFuuka");
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Gag": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					KinkyDungeonChangeRep("Ghost", -5);
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("FuukaCollar");
						KDUnlockPerk("CommonFuuka");
					}
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
		}
	},
	"PotionSell": KDShopDialogue("PotionSell", ["PotionFrigid", "PotionStamina", "PotionMana", "PotionInvisibility"], [], ["witch", "apprentice", "alchemist", "human", "dragon"], 0.2),
	"ElfCrystalSell": KDShopDialogue("ElfCrystalSell", ["PotionMana", "ElfCrystal", "EarthRune", "WaterRune", "IceRune"], [], ["elf"], 0.25),
	"ScrollSell": KDShopDialogue("ScrollSell", ["ScrollArms", "ScrollVerbal", "ScrollLegs", "ScrollPurity"], [], ["witch", "apprentice", "elf", "wizard", "dressmaker"], 0.15),
	"WolfgirlSell": KDShopDialogue("WolfgirlSell", ["MistressKey", "AncientPowerSource", "AncientPowerSourceSpent", "EnchantedGrinder"], [], ["trainer", "alchemist", "human"], 0.2),
	"NinjaSell": KDShopDialogue("NinjaSell", ["SmokeBomb", "Bola", "Bomb", "PotionInvisibility"], [], ["ninja", "bountyhunter"], 0.2),
	"GhostSell": KDShopDialogue("GhostSell", ["Ectoplasm", "PotionInvisibility", "ElfCrystal"], [], ["alchemist", "witch", "apprentice", "dressmaker", "dragon"], 0.1),
	// TODO magic book dialogue in which you can read forward and there are traps
	"GenericAlly": KDAllyDialogue("GenericAlly", [], [], [], 1),
};


