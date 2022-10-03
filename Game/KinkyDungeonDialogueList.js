"use strict";

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
				clickFunction: (gagged) => {
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
				clickFunction: (gagged) => {
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
				clickFunction: (gagged) => {
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
				clickFunction: (gagged) => {
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
				clickFunction: (gagged) => {
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
				prerequisiteFunction: (gagged) => {return false;},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}}},
			"Deny": {gag: true, playertext: "WeaponFoundDeny", response: "Punishment", personalities: ["Dom", "Sub", "Robot"],
				clickFunction: (gagged) => {KinkyDungeonStartChase(undefined, "Refusal"); return false;},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}}},
			"Illusion": {gagDisabled: true, playertext: "WeaponFoundIllusion", response: "Disbelief", personalities: ["Dom", "Sub", "Robot"],
				prerequisiteFunction: (gagged) => {return KinkyDungeonGoddessRep.Illusion >= 51;},
				clickFunction: (gagged) => {
					if (KDGameData.CurrentDialogMsgSpeaker == "MaidforceHead") {
						KDGameData.CurrentDialogStage = "Deny";
						KDGameData.CurrentDialogMsg = "HeadMaidExcuseMe";
						KinkyDungeonStartChase(undefined, "Refusal");
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
				prerequisiteFunction: (gagged) => {return KinkyDungeonGoddessRep.Conjure >= 51;},
				clickFunction: (gagged) => {
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
				prerequisiteFunction: (gagged) => {return KinkyDungeonGoddessRep.Elements >= 51;},
				clickFunction: (gagged) => {
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
				prerequisiteFunction: (gagged) => {return KinkyDungeonGoddessRep.Rope >= 51;},
				clickFunction: (gagged) => {
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
				prerequisiteFunction: (gagged) => {return KinkyDungeonGoddessRep.Leather >= 51;},
				clickFunction: (gagged) => {
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
						clickFunction: (gagged) => {
							KinkyDungeonChangeRep("Ghost", -10);
							KinkyDungeonChangeRep("Prisoner", 10);
							return false;
						},
						options: {"Continue" : {playertext: "Continue", leadsToStage: "Rules"}}},
					"Sub": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
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
						clickFunction: (gagged) => {
							KinkyDungeonChangeRep("Ghost", -10);
							KinkyDungeonChangeRep("Prisoner", 10);
							return false;
						},
						options: {"Continue" : {playertext: "Continue", exitDialogue: true}}},
					"Sub": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
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
				prerequisiteFunction: (gagged) => {return !(KinkyDungeonGetRestraintItem("ItemVulva"));},
				clickFunction: (gagged) => {
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), 0, true);
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug2"), 0, true);
					KinkyDungeonChangeRep("Ghost", 3);
					return false;
				},
				options: {
					"Correct": {playertext: "Default", response: "Default", gagDisabled: true,
						prerequisiteFunction: (gagged) => {return !(KinkyDungeonGetRestraintItem("ItemMouth") || KinkyDungeonGetRestraintItem("ItemMouth2") || KinkyDungeonGetRestraintItem("ItemMouth3"));},
						clickFunction: (gagged) => {
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
				prerequisiteFunction: (gagged) => {return KinkyDungeonGetRestraintItem("ItemVulva") != undefined;},
				clickFunction: (gagged) => {
					KinkyDungeonChangeRep("Ghost", 5);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Struggle": {playertext: "Default", response: "Default",
				prerequisiteFunction: (gagged) => {return KinkyDungeonGetRestraintItem("ItemArms") != undefined;},
				clickFunction: (gagged) => {
					KinkyDungeonChangeRep("Prisoner", 3);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Pout": {playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					KinkyDungeonChangeRep("Ghost", -3);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Bribe": {playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					return KinkyDungeonGoddessRep.Prisoner >= -40 && KinkyDungeonGold >= 40;
				},
				options: {
					"Accept": {playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
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
	"OfferDress": KDYesNoSingle("OfferDress", ["Rope"], ["Ghost"], ["bindingDress"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferArmor": KDYesNoSingle("OfferArmor", ["Metal"], ["Ghost"], ["shackleGag"], [-10, 60, -20, 75], [-35, -10, 5, 30]),
	"OfferChain": KDYesNoSingle("OfferChain", ["Metal"], ["Ghost"], ["chainRestraints"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferVine": KDYesNoSingle("OfferVine", ["Metal"], ["Ghost"], ["vineRestraints"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferObsidian": KDYesNoSingle("OfferObsidian", ["Metal"], ["Ghost"], ["obsidianRestraints"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferMaidRestraint": KDYesNoSingle("OfferMaidRestraint", ["Illusion"], ["Ghost"], ["maidRestraints"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferDragon": KDYesNoSingle("OfferDragon", ["Leather"], ["Ghost"], ["dragonRestraints"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferComfy": KDYesNoSingle("OfferComfy", ["Conjure"], ["Ghost"], ["comfyRestraints"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferShackles": KDYesNoSingle("OfferShackles", ["Metal"], ["Ghost"], ["shackleRestraints", "steelCuffs"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferKitty": KDYesNoSingle("OfferKitty", ["Leather"], ["Ghost"], ["kittyRestraints"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferMithril": KDYesNoSingle("OfferMithril", ["Metal"], ["Ghost"], ["mithrilRestraints"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferMithrilRope": KDYesNoSingle("OfferMithrilRope", ["Rope"], ["Ghost"], ["mithrilRope","mithrilRopeHogtie"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferWolfRestraint": KDYesNoSingle("OfferWolfRestraint", ["Metal"], ["Ghost"], ["wolfRestraints"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferSlime": KDYesNoSingle("OfferSlime", ["Latex"], ["Ghost"], ["slimeRestraintsRandom"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferScarf": KDYesNoSingle("OfferScarf", ["Rope"], ["Ghost"], ["scarfRestraints"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferAutoTape": KDYesNoSingle("OfferAutoTape", ["Metal"], ["Ghost"], ["autoTape"], [0, 60, 0, 75], [-200, -200, -200, -200]),
	"OfferHiTechCables": KDYesNoSingle("OfferHiTechCables", ["Metal"], ["Ghost"], ["hitechCables","cableGag"], [0, 60, 0, 75], [-200, -200, -200, -200]),
	"OfferIce": KDYesNoSingle("OfferIce", ["Elements"], ["Ghost"], ["iceRestraints"], [0, 60, 0, 75], [-25, 0, 15, 40]),
	"OfferHighSec": KDYesNoTemplate(
		(refused) => { // Setup function. This is run when you click Yes or No in the start of the dialogue
			// This is the restraint that the dialogue offers to add. It's selected from a set of tags. You can change the tags to change the restraint
			let HighSecArray = ["HighsecArmbinder","HighsecShackles","HighsecBallGag","HighsecLegbinder","DragonMuzzleGag"];
			let r = KinkyDungeonGetRestraintByName(HighSecArray[Math.floor(KDRandom() * HighSecArray.length)]);
			if (r) {
				KDGameData.CurrentDialogMsgData = {
					"Data_r": r.name,
					"RESTRAINT": TextGet("Restraint" + r.name),
				};

				// Percent chance your dominant action ("Why don't you wear it instead?") succeeds
				// Based on a difficulty that is the sum of four lines
				// Dominant perk should help with this
				KDGameData.CurrentDialogMsgValue.PercentOff =
					KDOffensiveDialogueSuccessChance(KDBasicCheck(["Metal"], [])
					- (KDDialogueGagged() ? 60 : 40)
					- (KinkyDungeonStatsChoice.has("Dominant") ? 0 : 40)
					- KDPersonalitySpread(-15, 0, KinkyDungeonStatsChoice.has("Dominant") ? 15 : 50));
				// Set the string to replace in the UI
				KDGameData.CurrentDialogMsgData.OFFPERC = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.PercentOff)}%`;
			}

			// If the player hits No first, this happens
			if (refused) {
				// Set up the difficulty of the check
				// This check basically determines if we switch to the Force stage where the speaker tries to force you
				let diff = KinkyDungeonStatsChoice.has("Dominant") ? 0 : 60;
				// Failure condition
				if (KDBasicCheck(["Metal"], ["Ghost"]) <= diff) {
					KDGameData.CurrentDialogStage = "Force";
					KDGameData.CurrentDialogMsg = "OfferHighSecForceYes"; // This is different from OfferHighSecForce_Yes, it's a more reluctant dialogue...
					// Set up percentage chance to resist
					KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(["Metal"], ["Ghost"]));
					KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
				}
				KinkyDungeonChangeRep("Ghost", -1); // Reduce submission because of refusal
			}
			return false;
		},(refused) => { // Yes function. This happens if the user submits willingly
			KinkyDungeonChangeRep("Metal", 1);
			KDPleaseSpeaker(refused ? 0.004 : 0.005); // Less reputation if you refused
			KinkyDungeonChangeRep("Ghost", refused ? 1 : 2); // Less submission if you refused
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, "Red");
			return false;
		},(refused) => { // No function. This happens when the user refuses.
			// The first half is basically the same as the setup function, but only if the user did not refuse the first yes/no
			if (!refused) {
				// This check basically determines if we switch to the Force stage where the speaker tries to force you
				let diff = KinkyDungeonStatsChoice.has("Dominant") ? 15 : 75; // Slightly harder because we refused
				// Failure condition
				if (KDBasicCheck(["Metal"], ["Ghost"]) <= diff) {
					KDGameData.CurrentDialogStage = "Force";
					KDGameData.CurrentDialogMsg = "";
					// Set up percentage chance to resist
					KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(["Metal"], ["Ghost"]));
					KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
				}
				KinkyDungeonChangeRep("Ghost", -1);
			} else { // If the user refuses we use the already generated success chance and calculate the result
				let percent = KDGameData.CurrentDialogMsgValue.Percent;
				if (KDRandom() > percent) { // We failed! You get tied tight
					KDIncreaseOfferFatigue(-20);
					KDGameData.CurrentDialogMsg = "OfferHighSecForce_Failure";
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, "Red");
				} else {
					KDIncreaseOfferFatigue(10);
				}
			}
			return false;
		},(refused) => { // Dom function. This is what happens when you try the dominant option
			// We use the already generated percent chance
			let percent = KDGameData.CurrentDialogMsgValue.PercentOff;
			if (KDRandom() > percent) {
				// If we fail, we aggro the enemy
				KDIncreaseOfferFatigue(-20);
				KDGameData.CurrentDialogMsg = "OfferDominantFailure";
				KDAggroSpeaker(10);
			} else {
				// If we succeed, we get the speaker enemy and bind them
				KDIncreaseOfferFatigue(10);
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
					enemy.playWithPlayer = 0;
					enemy.playWithPlayerCD = 999;
					let amount = 10;
					if (!enemy.boundLevel) enemy.boundLevel = amount;
					else enemy.boundLevel += amount;
				}
				KinkyDungeonChangeRep("Ghost", -4); // Reduce submission because dom
			}
			return false;
		}),
	"OfferLatex": KDYesNoTemplate(
		(refused) => { // Setup function. This is run when you click Yes or No in the start of the dialogue
			// This is the restraint that the dialogue offers to add. It's selected from a set of tags. You can change the tags to change the restraint
			let r = KinkyDungeonGetRestraint({tags: ["latexRestraints", "latexRestraintsHeavy"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (r) {
				KDGameData.CurrentDialogMsgData = {
					"Data_r": r.name,
					"RESTRAINT": TextGet("Restraint" + r.name),
				};

				// Percent chance your dominant action ("Why don't you wear it instead?") succeeds
				// Based on a difficulty that is the sum of four lines
				// Dominant perk should help with this
				KDGameData.CurrentDialogMsgValue.PercentOff =
					KDOffensiveDialogueSuccessChance(KDBasicCheck(["Latex"], [])
					- (KDDialogueGagged() ? 60 : 40)
					- (KinkyDungeonStatsChoice.has("Dominant") ? 0 : 40)
					- KDPersonalitySpread(-25, 0, KinkyDungeonStatsChoice.has("Dominant") ? 15 : 35));
				// Set the string to replace in the UI
				KDGameData.CurrentDialogMsgData.OFFPERC = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.PercentOff)}%`;
			}

			// If the player hits No first, this happens
			if (refused) {
				// Set up the difficulty of the check
				// This check basically determines if we switch to the Force stage where the speaker tries to force you
				let diff = KinkyDungeonStatsChoice.has("Dominant") ? 0 : 60;
				// Failure condition
				if (KDBasicCheck(["Latex"], ["Ghost"]) <= diff) {
					KDGameData.CurrentDialogStage = "Force";
					KDGameData.CurrentDialogMsg = "OfferLatexForceYes"; // This is different from OfferLatexForce_Yes, it's a more reluctant dialogue...
					// Set up percentage chance to resist
					KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(["Latex"], ["Ghost"]));
					KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
				}
				KinkyDungeonChangeRep("Ghost", -1); // Reduce submission because of refusal
			}
			return false;
		},(refused) => { // Yes function. This happens if the user submits willingly
			KinkyDungeonChangeRep("Latex", 1);
			KDPleaseSpeaker(refused ? 0.004 : 0.005); // Less reputation if you refused
			KinkyDungeonChangeRep("Ghost", refused ? 1 : 2); // Less submission if you refused
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, "Red");
			return false;
		},(refused) => { // No function. This happens when the user refuses.
			// The first half is basically the same as the setup function, but only if the user did not refuse the first yes/no
			if (!refused) {
				// This check basically determines if we switch to the Force stage where the speaker tries to force you
				let diff = KinkyDungeonStatsChoice.has("Dominant") ? 15 : 75; // Slightly harder because we refused
				// Failure condition
				if (KDBasicCheck(["Latex"], ["Ghost"]) <= diff) {
					KDGameData.CurrentDialogStage = "Force";
					KDGameData.CurrentDialogMsg = "";
					// Set up percentage chance to resist
					KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(["Latex"], ["Ghost"]));
					KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
				}
				KinkyDungeonChangeRep("Ghost", -1);
			} else { // If the user refuses we use the already generated success chance and calculate the result
				let percent = KDGameData.CurrentDialogMsgValue.Percent;
				if (KDRandom() > percent) { // We failed! You get tied tight
					KDIncreaseOfferFatigue(-20);
					KDGameData.CurrentDialogMsg = "OfferLatexForce_Failure";
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, "Red");
				} else {
					KDIncreaseOfferFatigue(10);
				}
			}
			return false;
		},(refused) => { // Dom function. This is what happens when you try the dominant option
			// We use the already generated percent chance
			let percent = KDGameData.CurrentDialogMsgValue.PercentOff;
			if (KDRandom() > percent) {
				// If we fail, we aggro the enemy
				KDIncreaseOfferFatigue(-20);
				KDGameData.CurrentDialogMsg = "OfferDominantFailure";
				KDAggroSpeaker(10);
			} else {
				// If we succeed, we get the speaker enemy and bind them
				KDIncreaseOfferFatigue(10);
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
					enemy.playWithPlayer = 0;
					enemy.playWithPlayerCD = 999;
					let amount = 10;
					if (!enemy.boundLevel) enemy.boundLevel = amount;
					else enemy.boundLevel += amount;
				}
				KinkyDungeonChangeRep("Ghost", -4); // Reduce submission because dom
			}
			return false;
		}),
	"OfferChastity": {
		response: "Default",
		clickFunction: (gagged) => {
			KinkyDungeonSetFlag("BondageOffer",  KDOfferCooldown);
			KinkyDungeonSetFlag("ChastityOffer",  50);
			return false;
		},
		options: {
			"Yes": {gag: true, playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					let r = KinkyDungeonGetRestraint({tags: ["genericChastity"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
					if (r) {
						KDGameData.CurrentDialogMsgData = {
							"Data_r": r.name,
							"RESTRAINT": TextGet("Restraint" + r.name),
							"ChastityLock": MiniGameKinkyDungeonLevel + KDRandom()*3 > 3 ? (MiniGameKinkyDungeonLevel + KDRandom()*6 > 9 ? "Gold" : "Blue") : "Red",
						};

						KDGameData.CurrentDialogMsgValue.PercentOff = KDOffensiveDialogueSuccessChance(KDBasicCheck(["Metal"], [])
							- (KDDialogueGagged() ? 60 : 40)
							- (KinkyDungeonStatsChoice.has("Dominant") ? 0 : 40)
							- KDPersonalitySpread(-25, 0, KinkyDungeonStatsChoice.has("Dominant") ? 15 : 35));
						KDGameData.CurrentDialogMsgData.OFFPERC = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.PercentOff)}%`;
					}
					return false;
				},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							KinkyDungeonChangeRep("Metal", 1);
							KDAllySpeaker(9999, true);
							KinkyDungeonChangeRep("Ghost", 2);
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, KDGameData.CurrentDialogMsgData.ChastityLock);
							return false;
						},
						options: {
							"Leave": {playertext: "Leave", prerequisiteFunction: (gagged) => {return KDGameData.CurrentDialogMsgData.ChastityLock == "Red";}, exitDialogue: true},
							"Observe": {playertext: "OfferChastityObserve", prerequisiteFunction: (gagged) => {return KDGameData.CurrentDialogMsgData.ChastityLock != "Red";}, leadsToStage: "Glow"},
						},
					},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							let diff = 75;
							if (KinkyDungeonStatsChoice.has("Dominant")) diff = 0;
							if (KDBasicCheck(["Metal"], ["Ghost"]) <= diff) {
								KDGameData.CurrentDialogStage = "Force";
								KDGameData.CurrentDialogMsg = "OfferChastityForceYes";
								KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(["Metal"], ["Ghost"]));
								KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
							}
							KinkyDungeonChangeRep("Ghost", -1);
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"Dominant": {gag: true, playertext: "OfferDominant", response: "OfferDominantSuccess",
						clickFunction: (gagged) => {
							//KDAllySpeaker(30, true);
							let percent = KDGameData.CurrentDialogMsgValue.PercentOff;
							if (KDRandom() > percent) {
								// Fail
								KDIncreaseOfferFatigue(-20);
								KDGameData.CurrentDialogMsg = "OfferDominantFailure";
								KDAggroSpeaker(10);
							} else {
								KDIncreaseOfferFatigue(10);
								let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
								if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
									enemy.playWithPlayer = 0;
									enemy.playWithPlayerCD = 999;
									let amount = 10;
									if (!enemy.boundLevel) enemy.boundLevel = amount;
									else enemy.boundLevel += amount;
								}
								KinkyDungeonChangeRep("Ghost", -4);
							}
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
				},
			},
			"No": {gag: true, playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					let diff = 60;
					if (KinkyDungeonStatsChoice.has("Dominant")) diff = 0;
					let r = KinkyDungeonGetRestraint({tags: ["genericChastity"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
					if (r) {
						KDGameData.CurrentDialogMsgData = {
							"Data_r": r.name,
							"RESTRAINT": TextGet("Restraint" + r.name),
							"ChastityLock": MiniGameKinkyDungeonLevel + KDRandom()*3 > 3 ? (MiniGameKinkyDungeonLevel + KDRandom()*6 > 9 ? "Gold" : "Blue") : "Red",
						};

						KDGameData.CurrentDialogMsgValue.PercentOff = KDOffensiveDialogueSuccessChance(KDBasicCheck(["Metal"], [])
							- (KDDialogueGagged() ? 60 : 40)
							- (KinkyDungeonStatsChoice.has("Dominant") ? 0 : 40)
							- KDPersonalitySpread(-25, 0, KinkyDungeonStatsChoice.has("Dominant") ? 15 : 35));
						KDGameData.CurrentDialogMsgData.OFFPERC = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.PercentOff)}%`;
					}
					if (KDBasicCheck(["Metal"], ["Ghost"]) <= diff) {
						KDGameData.CurrentDialogStage = "Force";
						KDGameData.CurrentDialogMsg = "";
						KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(["Metal"], ["Ghost"]));
						KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
					}
					KinkyDungeonChangeRep("Ghost", -1);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Force": {gag: true, playertext: "Default", response: "Default",
				prerequisiteFunction: (gagged) => {return false;},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							KDAllySpeaker(9999, true);
							KinkyDungeonChangeRep("Ghost", 1);
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, KDGameData.CurrentDialogMsgData.ChastityLock);
							return false;
						},
						options: {
							"Leave": {playertext: "Leave", prerequisiteFunction: (gagged) => {return KDGameData.CurrentDialogMsgData.ChastityLock == "Red";}, exitDialogue: true},
							"Observe": {playertext: "OfferChastityObserve", prerequisiteFunction: (gagged) => {return KDGameData.CurrentDialogMsgData.ChastityLock != "Red";}, leadsToStage: "Glow"},
						},
					},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							//KDAllySpeaker(30, true);
							let percent = KDGameData.CurrentDialogMsgValue.Percent;
							if (KDRandom() > percent) {
								// Fail
								KDIncreaseOfferFatigue(-20);
								KDGameData.CurrentDialogMsg = "OfferChastityForce_Failure";
								KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, KDGameData.CurrentDialogMsgData.ChastityLock);
							} else {
								KDIncreaseOfferFatigue(10);
							}
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"Dominant": {gag: true, playertext: "OfferDominant", response: "OfferDominantSuccess",
						clickFunction: (gagged) => {
							//KDAllySpeaker(30, true);
							let percent = KDGameData.CurrentDialogMsgValue.PercentOff;
							if (KDRandom() > percent) {
								// Fail
								KDIncreaseOfferFatigue(-20);
								KDGameData.CurrentDialogMsg = "OfferDominantFailure";
								KDAggroSpeaker(10);
							} else {
								KDIncreaseOfferFatigue(10);
								let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
								if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
									enemy.playWithPlayer = 0;
									enemy.playWithPlayerCD = 999;
									let amount = 10;
									if (!enemy.boundLevel) enemy.boundLevel = amount;
									else enemy.boundLevel += amount;
								}
								KinkyDungeonChangeRep("Ghost", -4);
							}
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
				},
			},
			"Glow": {playertext: "Default", response: "OfferChastityGlow",
				prerequisiteFunction: (gagged) => {return false;},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
		}
	},
	"OfferLeather": {
		response: "Default",
		clickFunction: (gagged) => {
			KinkyDungeonSetFlag("BondageOffer",  KDOfferCooldown);
			return false;
		},
		options: {
			"Yes": {gag: true, playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					let r = KinkyDungeonGetRestraint({tags: ["leatherRestraintsHeavy"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
					if (r) {
						KDGameData.CurrentDialogMsgData = {
							"Data_r": r.name,
							"RESTRAINT": TextGet("Restraint" + r.name),
						};

						KDGameData.CurrentDialogMsgValue.PercentOff = KDOffensiveDialogueSuccessChance(KDBasicCheck(["Leather"], [])
							- (KDDialogueGagged() ? 60 : 40)
							- (KinkyDungeonStatsChoice.has("Dominant") ? 0 : 40)
							- KDPersonalitySpread(-25, 0, KinkyDungeonStatsChoice.has("Dominant") ? 15 : 35));
						KDGameData.CurrentDialogMsgData.OFFPERC = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.PercentOff)}%`;
					}
					return false;
				},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							KDPleaseSpeaker(0.005);
							KinkyDungeonChangeRep("Leather", 1);
							KinkyDungeonChangeRep("Ghost", 2);
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, "Red");
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							let diff = 75;
							if (KinkyDungeonStatsChoice.has("Dominant")) diff = 0;
							if (KDBasicCheck(["Leather"], ["Ghost"]) <= diff) {
								KDGameData.CurrentDialogStage = "Force";
								KDGameData.CurrentDialogMsg = "OfferLeatherForceYes";
								KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(["Leather"], ["Ghost"]));
								KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
							}
							KinkyDungeonChangeRep("Ghost", -1);
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"Dominant": {gag: true, playertext: "OfferDominant", response: "OfferDominantSuccess",
						clickFunction: (gagged) => {
							//KDAllySpeaker(30, true);
							let percent = KDGameData.CurrentDialogMsgValue.PercentOff;
							if (KDRandom() > percent) {
								// Fail
								KDIncreaseOfferFatigue(-20);
								KDGameData.CurrentDialogMsg = "OfferDominantFailure";
								KDAggroSpeaker(10);
							} else {
								KDIncreaseOfferFatigue(10);
								let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
								if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
									enemy.playWithPlayer = 0;
									enemy.playWithPlayerCD = 999;
									let amount = 10;
									if (!enemy.boundLevel) enemy.boundLevel = amount;
									else enemy.boundLevel += amount;
								}
								KinkyDungeonChangeRep("Ghost", -4);
							}
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
				},
			},
			"No": {gag: true, playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					let diff = 60;
					if (KinkyDungeonStatsChoice.has("Dominant")) diff = 0;
					let r = KinkyDungeonGetRestraint({tags: ["leatherRestraintsHeavy"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
					if (r) {
						KDGameData.CurrentDialogMsgData = {
							"Data_r": r.name,
							"RESTRAINT": TextGet("Restraint" + r.name),
						};

						KDGameData.CurrentDialogMsgValue.PercentOff = KDOffensiveDialogueSuccessChance(KDBasicCheck(["Leather"], [])
							- (KDDialogueGagged() ? 60 : 40)
							- (KinkyDungeonStatsChoice.has("Dominant") ? 0 : 40)
							- KDPersonalitySpread(-25, 0, KinkyDungeonStatsChoice.has("Dominant") ? 15 : 35));
						KDGameData.CurrentDialogMsgData.OFFPERC = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.PercentOff)}%`;
					}
					if (KDBasicCheck(["Leather"], ["Ghost"]) <= diff) {
						KDGameData.CurrentDialogStage = "Force";
						KDGameData.CurrentDialogMsg = "";
						KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(["Leather"], ["Ghost"]));
						KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
					}
					KinkyDungeonChangeRep("Ghost", -1);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Force": {gag: true, playertext: "Default", response: "Default",
				prerequisiteFunction: (gagged) => {return false;},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							KDPleaseSpeaker(0.004);
							KinkyDungeonChangeRep("Ghost", 1);
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, "Red");
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							let percent = KDGameData.CurrentDialogMsgValue.Percent;
							if (KDRandom() > percent) {
								// Fail
								KDIncreaseOfferFatigue(-20);
								KDGameData.CurrentDialogMsg = "OfferLeatherForce_Failure";
								KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, "Red");
							} else {
								KDIncreaseOfferFatigue(10);
							}
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"Dominant": {gag: true, playertext: "OfferDominant", response: "OfferDominantSuccess",
						clickFunction: (gagged) => {
							//KDAllySpeaker(30, true);
							let percent = KDGameData.CurrentDialogMsgValue.PercentOff;
							if (KDRandom() > percent) {
								// Fail
								KDIncreaseOfferFatigue(-20);
								KDGameData.CurrentDialogMsg = "OfferDominantFailure";
								KDAggroSpeaker(10);
							} else {
								KDIncreaseOfferFatigue(10);
								let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
								if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
									enemy.playWithPlayer = 0;
									enemy.playWithPlayerCD = 999;
									let amount = 10;
									if (!enemy.boundLevel) enemy.boundLevel = amount;
									else enemy.boundLevel += amount;
								}
								KinkyDungeonChangeRep("Ghost", -4);
							}
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
				},
			},
		}
	},
	"OfferRopes": {
		response: "Default",
		clickFunction: (gagged) => {
			if (KinkyDungeonGetRestraintsWithShrine("Rope").length > 0) {
				KDGameData.CurrentDialogMsg = "OfferRopesExtra";
			}
			KinkyDungeonSetFlag("BondageOffer",  KDOfferCooldown);
			return false;
		},
		options: {
			"Yes": {gag: true, playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					return false;
				},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							KDPleaseSpeaker(0.005);
							KinkyDungeonChangeRep("Rope", 1);
							KinkyDungeonChangeRep("Ghost", 2);
							for (let i = 0; i < 3; i++) {
								let r = KinkyDungeonGetRestraint({tags: ["ropeRestraints", "ropeRestraints", "ropeRestraintsWrist"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
								if (r) KinkyDungeonAddRestraintIfWeaker(r, 0, true);
							}
							KDGameData.CurrentDialogMsgData = {
							};
							KDGameData.CurrentDialogMsgValue.PercentOff = KDOffensiveDialogueSuccessChance(KDBasicCheck(["Rope"], [])
								- (KDDialogueGagged() ? 60 : 40)
								- (KinkyDungeonStatsChoice.has("Dominant") ? 0 : 40)
								- KDPersonalitySpread(-25, 0, KinkyDungeonStatsChoice.has("Dominant") ? 15 : 35));
							KDGameData.CurrentDialogMsgData.OFFPERC = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.PercentOff)}%`;
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							let diff = 75;
							if (KinkyDungeonStatsChoice.has("Dominant")) diff = 0;
							if (KDBasicCheck(["Rope"], ["Ghost"]) <= diff) {
								KDGameData.CurrentDialogStage = "Force";
								KDGameData.CurrentDialogMsg = "OfferRopesForceYes";
								KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(["Rope"], ["Ghost"]));
								KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
							}
							KinkyDungeonChangeRep("Ghost", -1);
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"Dominant": {gag: true, playertext: "OfferDominant", response: "OfferDominantSuccess",
						clickFunction: (gagged) => {
							//KDAllySpeaker(30, true);
							let percent = KDGameData.CurrentDialogMsgValue.PercentOff;
							if (KDRandom() > percent) {
								// Fail
								KDIncreaseOfferFatigue(-20);
								KDGameData.CurrentDialogMsg = "OfferDominantFailure";
								KDAggroSpeaker(10);
							} else {
								KDIncreaseOfferFatigue(10);
								let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
								if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
									enemy.playWithPlayer = 0;
									enemy.playWithPlayerCD = 999;
									let amount = 10;
									if (!enemy.boundLevel) enemy.boundLevel = amount;
									else enemy.boundLevel += amount;
								}
								KinkyDungeonChangeRep("Ghost", -4);
							}
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
				},
			},
			"No": {gag: true, playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					let diff = 60;
					if (KinkyDungeonStatsChoice.has("Dominant")) diff = 0;
					if (KDBasicCheck(["Rope"], ["Ghost"]) <= diff) {
						KDGameData.CurrentDialogStage = "Force";
						KDGameData.CurrentDialogMsg = "";
						KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(["Rope"], ["Ghost"]));
						KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
					}

					KDGameData.CurrentDialogMsgValue.PercentOff = KDOffensiveDialogueSuccessChance(KDBasicCheck(["Rope"], [])
						- (KDDialogueGagged() ? 60 : 40)
						- (KinkyDungeonStatsChoice.has("Dominant") ? 0 : 40)
						- KDPersonalitySpread(-25, 0, KinkyDungeonStatsChoice.has("Dominant") ? 15 : 35));
					KDGameData.CurrentDialogMsgData.OFFPERC = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.PercentOff)}%`;
					KinkyDungeonChangeRep("Ghost", -1);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Force": {gag: true, playertext: "Default", response: "Default",
				prerequisiteFunction: (gagged) => {return false;},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							KDPleaseSpeaker(0.004);
							KinkyDungeonChangeRep("Ghost", 2);
							for (let i = 0; i < 3; i++) {
								let r = KinkyDungeonGetRestraint({tags: ["ropeRestraints", "ropeRestraints", "ropeRestraintsWrist"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
								if (r) KinkyDungeonAddRestraintIfWeaker(r, 0, true);
							}
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged) => {
							let percent = KDGameData.CurrentDialogMsgValue.Percent;
							KinkyDungeonChangeRep("Ghost", -1);
							if (KDRandom() > percent) {
								// Fail
								KDIncreaseOfferFatigue(-20);
								KDGameData.CurrentDialogMsg = "OfferRopesForce_Failure";
								for (let i = 0; i < 5; i++) {
									let r = KinkyDungeonGetRestraint({tags: ["ropeRestraints", "ropeRestraints", "ropeRestraintsWrist"]}, MiniGameKinkyDungeonLevel * 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
									if (r) KinkyDungeonAddRestraintIfWeaker(r, 0, true);
								}
							} else {
								KDIncreaseOfferFatigue(10);
							}
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"Dominant": {gag: true, playertext: "OfferDominant", response: "OfferDominantSuccess",
						clickFunction: (gagged) => {
							//KDAllySpeaker(30, true);
							let percent = KDGameData.CurrentDialogMsgValue.PercentOff;
							if (KDRandom() > percent) {
								// Fail
								KDIncreaseOfferFatigue(-20);
								KDGameData.CurrentDialogMsg = "OfferDominantFailure";
								KDAggroSpeaker(10);
							} else {
								KDIncreaseOfferFatigue(10);
								let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
								if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
									enemy.playWithPlayer = 0;
									enemy.playWithPlayerCD = 999;
									let amount = 10;
									if (!enemy.boundLevel) enemy.boundLevel = amount;
									else enemy.boundLevel += amount;
								}
								KinkyDungeonChangeRep("Ghost", -4);
							}
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
				},
			},
		}
	},
	"OfferWolfgirl": KDRecruitDialogue("OfferWolfgirl", "Nevermere", "Wolfgirl", "Metal", ["wolfGear"], 5, ["wolfGear", "wolfRestraints"], 8, ["wolfgirl", "trainer"], undefined, undefined, 0.5),
	"OfferMaid": KDRecruitDialogue("OfferMaid", "Maidforce", "Maid", "Illusion", ["maidVibeRestraints"], 5, ["maidRestraints"], 13, ["maid"], undefined, ["submissive"], 0.5),
	"AngelHelp": {
		response: "Default",
		inventory: true,
		clickFunction: (gagged) => {
			KinkyDungeonSetFlag("AngelHelp", 55);
			return false;
		},
		options: {
			"Knife": {
				playertext: "Default", response: "AngelHelpKnife",
				prerequisiteFunction: (gagged) => {
					return !KinkyDungeonFlags.get("AngelHelped") && !KinkyDungeonInventoryGet("Knife");
				},
				clickFunction: (gagged) => {
					KinkyDungeonInventoryAddWeapon("Knife");
					KinkyDungeonSetFlag("AngelHelped", 5);
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"Pick": {
				playertext: "Default", response: "AngelHelpPick",
				prerequisiteFunction: (gagged) => {
					return !KinkyDungeonFlags.get("AngelHelped");
				},
				clickFunction: (gagged) => {
					KinkyDungeonLockpicks += 3;
					KinkyDungeonSetFlag("AngelHelped", 5);
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"BlueKey": {
				playertext: "Default", response: "AngelHelpBlueKey",
				prerequisiteFunction: (gagged) => {
					return !KinkyDungeonFlags.get("AngelHelped");
				},
				clickFunction: (gagged) => {
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
		clickFunction: (gagged) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					KinkyDungeonSetFlag("DressmakerQuest", -1);
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
				clickFunction: (gagged) => {
					let items = KinkyDungeonGetRestraintsWithShrine("BindingDress", true, true);
					// Get the most powerful item
					let item = items.length > 0 ? items.reduce((prev, current) => (KDRestraint(prev).power * KinkyDungeonGetLockMult(prev.lock) > KDRestraint(current).power * KinkyDungeonGetLockMult(current.lock)) ? prev : current) : null;

					let power = item ? KDRestraint(item).power : 5;
					if (KDFactionRelation("Player", "Dressmaker") < 0.25)
						KinkyDungeonChangeFactionRep("Dressmaker", 0.002 * power);
					else
						KinkyDungeonChangeFactionRep("Dressmaker", 0.0007 * power);
					KinkyDungeonSetFlag("DressmakerQuest", 0);
					KDSpliceIndex(KinkyDungeonEntities.indexOf(KDDialogueEnemy()), 1);
					return false;
				},
				prerequisiteFunction: (gagged) => {
					return KinkyDungeonPlayerTags.has("BindingDress");
				},
				options: {
					"Question": {
						playertext: "Default", response: "Default",
						gag: true,
						clickFunction: (gagged) => {
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
		clickFunction: (gagged) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					KDAddQuest("ApprenticeQuest");
					return false;
				},
				prerequisiteFunction: (gagged) => {
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
				clickFunction: (gagged) => {
					KDRemoveQuest("ApprenticeQuest");
					KDSpliceIndex(KinkyDungeonEntities.indexOf(KDDialogueEnemy()), 1);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollLegs, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (gagged) => {
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
				clickFunction: (gagged) => {
					KDRemoveQuest("ApprenticeQuest");
					KDSpliceIndex(KinkyDungeonEntities.indexOf(KDDialogueEnemy()), 1);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollArms, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (gagged) => {
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
				clickFunction: (gagged) => {
					KDRemoveQuest("ApprenticeQuest");
					KDSpliceIndex(KinkyDungeonEntities.indexOf(KDDialogueEnemy()), 1);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollVerbal, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (gagged) => {
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
				clickFunction: (gagged) => {
					KDRemoveQuest("ApprenticeQuest");
					KDSpliceIndex(KinkyDungeonEntities.indexOf(KDDialogueEnemy()), 1);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollPurity, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (gagged) => {
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
		clickFunction: (gagged) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
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
		clickFunction: (gagged) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
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
		clickFunction: (gagged) => {
			KinkyDungeonSetFlag("LeashToPrison", -1);
			return false;
		},
		options: {
			"Submit": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					KinkyDungeonDefeat(true);
					return true;
				},
				exitDialogue: true,
			},
			"Resist": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
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
		clickFunction: (gagged) => {
			KinkyDungeonSetFlag("nobed", 8);
			return false;
		},
		options: {
			"Sleep": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
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
	"Leyline": {
		response: "Default",
		clickFunction: (gagged) => {
			KinkyDungeonSetFlag("noleyline", 8);
			return false;
		},
		options: {
			"Use": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					KinkyDungeonChangeMana(0, false, 100, false, false);
					if (KDTile() && KDTile().Leyline) {
						KinkyDungeonMapSet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, '0');
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
		clickFunction: (gagged) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
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
	"PrisonerRescue": {
		response: "Default",
		clickFunction: (gagged) => {
			KinkyDungeonInterruptSleep();
			let door = KDGetJailDoor(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			if (door) {
				if (door.tile) {
					door.tile.Lock = undefined;
					KDUpdateDoorNavMap();
				}
				KinkyDungeonMapSet(door.x, door.y, 'd');
				let e = DialogueCreateEnemy(door.x, door.y, "Bandit");
				e.allied = 9999;
				e.faction = "Player";
				KDGameData.CurrentDialogMsgSpeaker = e.Enemy.name;

				let reinforcementCount = Math.floor(1 + KDRandom() * (KDGameData.PriorJailbreaks ? (Math.min(5, KDGameData.PriorJailbreaks) + 1) : 1));
				KDGameData.PriorJailbreaks += 1;
				for (let i = 0; i < reinforcementCount; i++) {
					let pp = KinkyDungeonGetNearbyPoint(door.x, door.y, true, undefined, undefined);
					if (pp) {
						let ee = DialogueCreateEnemy(pp.x, pp.y, "Bandit");
						ee.allied = 9999;
						ee.faction = "Player";
					}
				}
			}
			KDGameData.KinkyDungeonGuardSpawnTimer = 50 + Math.floor(KDRandom() * 10);
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"BlacksmithShop": KDSaleShop("BlacksmithShop", ["RedKey", "Knife", "Sword", "Axe", "Spear", "TrapCuffs"], [], ["blacksmith"], 0.4, 1.5),
	"PrisonerBandit": {
		response: "Default",
		personalities: ["Sub"],
		clickFunction: (gagged) => {
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
				clickFunction: (gagged) => {
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
		clickFunction: (gagged) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Unlock": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
					if (KinkyDungeonRedKeys > 0) {
						if (KinkyDungeonCanUseKey() || !KinkyDungeonIsArmsBound()) {
							if (KDDialogueEnemy()) {
								let e = KDDialogueEnemy();
								e.boundLevel = 0;
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
								if (KinkyDungeonIsHandsBound(false, true)) {
									DialogueBringNearbyEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 8);
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
				clickFunction: (gagged) => {
					if (KinkyDungeonLockpicks > 0) {
						if (!KinkyDungeonIsHandsBound(false, true)) {
							if (KDDialogueEnemy()) {
								let e = KDDialogueEnemy();
								e.boundLevel = 0;
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
								DialogueBringNearbyEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 8);
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
		clickFunction: (gagged) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				enemy.hostile = 9999;
				enemy.aware = true;
				enemy.vp = 2;
				enemy.AI = 'hunt';
				KinkyDungeonSetFlag("BossDialogueFuuka", -1);
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
				clickFunction: (gagged) => {
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
				clickFunction: (gagged) => {
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
				prerequisiteFunction: (gagged) => {return false;},
				playertext: "Default", response: "Default",
				options: {
					"Brat": {gag: true,
						playertext: "Default", response: "FuukaPostIntro_Brat",
						leadsToStage: "Fight",
					},
					"Dom": {gag: true,
						playertext: "Default", response: "FuukaPostIntro_Dom",
						leadsToStage: "Fight",
						clickFunction: (gagged) => {
							KinkyDungeonChangeRep("Ghost", -2);
							return false;
						}
					},
					"Sub": {gag: true,
						playertext: "Default", response: "FuukaPostIntro_Sub",
						leadsToStage: "Fight",
						clickFunction: (gagged) => {
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
				prerequisiteFunction: (gagged) => {return false;},
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
	"FuukaLose": { // Player loses to Fuuka
		response: "Default",
		clickFunction: (gagged) => {
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
						clickFunction: (gagged) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue2": {
						playertext: "FuukaLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue3": {
						playertext: "FuukaLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged) => {
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
						clickFunction: (gagged) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue2": {
						playertext: "FuukaLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue3": {
						playertext: "FuukaLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (gagged) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
				}
			},
			"Finish": {
				prerequisiteFunction: (gagged) => {return false;},
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
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"FuukaWin": { // Player beats Fuuka
		response: "Default",
		clickFunction: (gagged) => {
			KinkyDungeonSetFlag("BossUnlocked", -1);
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Accept": {
				playertext: "Default", response: "Default",
				clickFunction: (gagged) => {
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
				clickFunction: (gagged) => {
					KinkyDungeonChangeRep("Ghost", -5);
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


