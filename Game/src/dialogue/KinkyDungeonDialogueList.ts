"use strict";

let KDDialogueParams = {
	ShopkeeperHelpFee: 230,
	ShopkeeperHelpFeePerLevel: 70,
	ShopkeeperHelpFeePerPower: 10,
	ShopkeeperHelpFeeFreebiePower: 20,
	ShopkeeperFee: 900,
	ShopkeeperFeePerLevel: 100,
	ShopkeeperFeePunishThresh: 2500,
	ChefChance: 0.1,
};

/**
 * Tags that are deleted on ng++
 */
let KDResertNGTags: string[] = [
	"BossDialogueFuuka",
	"BossDialogueTheWarden",
	"BossDialogueSilverWitch",
	"BossDialogueSelene",
	"BossDialogueDollmaker",
];


let KDShopPersonalities = ["", "Sub", "Dom", "Brat", "Robot"];
let KDShops: Record<string, {name: string, tags: string[], singletag: string[], chance: number, items?: string[], itemsdrop?: string[]}> = {};



let KDRecruitDialog: Record<string, {name: string, outfit: string, tags: string[], singletag: string[], excludeTags: string[], chance: number}> = {};

let KDAllyDialog: Record<string, {name: string, tags: string[], singletag: string[], excludeTags: string[], weight: number}> = {};

let KDSleepBedPercentage = 0.5;

let KDDialogue: Record<string, KinkyDialogue> = {
	"GhostInfo": {
		response: "Default",
		options: {
			"Continue" : {
				clickFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					let zombie = DialogueCreateEnemy(KDMapData.StartPosition.x + 7, 3, "FastZombie");
					zombie.AI = "guard";
					zombie.gxx = KDMapData.StartPosition.x + 8;
					zombie.gyy = KDMapData.GridHeight - 2;
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
				clickFunction: (_gagged, _player) => {
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					DialogueCreateEnemy(KDMapData.StartPosition.x + 22, 3, "FastZombie");
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
				clickFunction: (_gagged, _player) => {
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					DialogueCreateEnemy(KDMapData.StartPosition.x + 32, 4, "FastZombie");
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
				clickFunction: (_gagged, _player) => {
					KinkyDungeonSendTextMessage(10, TextGet("KDWeaponConfiscated"), "#ff5277", 2);
					if (!isUnarmed(KinkyDungeonPlayerDamage)) {
						KinkyDungeonChangeRep("Ghost", 3);
						let item = KinkyDungeonInventoryGetWeapon(KinkyDungeonPlayerWeapon);
						KDSetWeapon(null);
						if (item) {
							KinkyDungeonAddLostItems([item], false);
							KinkyDungeonInventoryRemove(item);
						}

						KinkyDungeonSetFlag("demand", 4);
					}
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}}},
			"Bluff": {playertext: "", response: "",
				prerequisiteFunction: (_gagged, _player) => {return false;},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}}},
			"Deny": {gag: true, playertext: "WeaponFoundDeny", response: "Punishment", personalities: ["Dom", "Sub", "Robot"],
				clickFunction: (_gagged, _player) => {
					KinkyDungeonStartChase(undefined, "Refusal");
					KDAggroSpeaker();
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}}},
			"Illusion": {gagDisabled: true, playertext: "WeaponFoundIllusion", response: "Disbelief", personalities: ["Dom", "Sub", "Robot"],
				prerequisiteFunction: (_gagged, _player) => {return KinkyDungeonGoddessRep.Illusion >= 51;},
				clickFunction: (_gagged, _player) => {
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
				prerequisiteFunction: (_gagged, _player) => {return KinkyDungeonGoddessRep.Conjure >= 51;},
				clickFunction: (_gagged, _player) => {
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
				prerequisiteFunction: (_gagged, _player) => {return KinkyDungeonGoddessRep.Elements >= 51;},
				clickFunction: (_gagged, _player) => {
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
				prerequisiteFunction: (_gagged, _player) => {return KinkyDungeonGoddessRep.Rope >= 51;},
				clickFunction: (_gagged, _player) => {
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
				prerequisiteFunction: (_gagged, _player) => {return KinkyDungeonGoddessRep.Leather >= 51;},
				clickFunction: (_gagged, _player) => {
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
						clickFunction: (_gagged, _player) => {
							KinkyDungeonChangeRep("Ghost", -10);
							KinkyDungeonChangeRep("Prisoner", 10);
							return false;
						},
						options: {"Continue" : {playertext: "Continue", leadsToStage: "Rules"}}},
					"Sub": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
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
						clickFunction: (_gagged, _player) => {
							KinkyDungeonChangeRep("Ghost", -10);
							KinkyDungeonChangeRep("Prisoner", 10);
							return false;
						},
						options: {"Continue" : {playertext: "Continue", exitDialogue: true}}},
					"Sub": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
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
		clickFunction: (_gagged) => {
			let GoldAmount = Math.round(KDGetEffLevel() * 100 * (1 + 0.02 * Math.max(0, KDGetEffSecurityLevel() + 50)));
			KDGameData.CurrentDialogMsgData = {
				"BRIBECOST": "" + GoldAmount,
			};
			return false;
		},
		options: {
			"Smile": {playertext: "Default", response: "Default",
				prerequisiteFunction: (_gagged, _player) => {return !(KinkyDungeonGetRestraintItem("ItemVulva"));},
				clickFunction: (_gagged, _player) => {
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), 0, true, undefined, undefined, undefined, undefined, KDGetSpeakerFaction());
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug2"), 0, true, undefined, undefined, undefined, undefined, KDGetSpeakerFaction());
					KinkyDungeonChangeRep("Ghost", 3);
					return false;
				},
				options: {
					"Correct": {playertext: "Default", response: "Default", gagDisabled: true,
						prerequisiteFunction: (_gagged, _player) => {return !(KinkyDungeonGetRestraintItem("ItemMouth") || KinkyDungeonGetRestraintItem("ItemMouth2") || KinkyDungeonGetRestraintItem("ItemMouth3"));},
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapGag"), 0, true, undefined, undefined, undefined, undefined, KDGetSpeakerFaction());
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
				prerequisiteFunction: (_gagged, _player) => {return KinkyDungeonGetRestraintItem("ItemVulva") != undefined;},
				clickFunction: (_gagged, _player) => {
					KinkyDungeonChangeRep("Ghost", 5);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Struggle": {playertext: "Default", response: "Default",
				prerequisiteFunction: (_gagged, _player) => {return KinkyDungeonGetRestraintItem("ItemArms") != undefined;},
				clickFunction: (_gagged, _player) => {
					KinkyDungeonChangeRep("Prisoner", 3);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Pout": {playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					KinkyDungeonChangeRep("Ghost", -3);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Bribe": {playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					let GoldAmount = Math.round(KDGetEffLevel() * 100 * (1 + 0.02 * Math.max(0, KDGetEffSecurityLevel() + 50)));
					return KDGetEffSecurityLevel() >= -40 && KinkyDungeonGold >= GoldAmount;
				},
				options: {
					"Accept": {playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
							let GoldAmount = Math.round(KDGetEffLevel() * 100 * (1 + 0.02 * Math.max(0, KDGetEffSecurityLevel() + 50)));
							if (KDGetEffSecurityLevel() >= 49.5) {
								KDGameData.CurrentDialogMsg = "PrisonRepeatBribeFail";
								return false;
							}
							if (KinkyDungeonGold <GoldAmount) {
								KDGameData.CurrentDialogMsg = "PrisonRepeatBribePoor";
								return false;
							}
							KinkyDungeonChangeRep("Prisoner", -Math.max(10, Math.min(100, GoldAmount*0.25)));
							KinkyDungeonAddGold(-GoldAmount);
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
	"OfferMaidRestraint": KDYesNoBasic("OfferMaidRestraint", ["Illusion"], ["Ghost"], ["maidRestraints", "maidRestraintsHeavy"], [55, 0, 75, 0], [-25, 0, 40, 15], 1, 2, "Blue"),
	"OfferDusterGag": KDYesNoBasic("OfferDusterGag", ["Illusion"], ["Ghost"], ["dustergag"], [55, 0, 75, 0], [-25, 0, 40, 15], 1, 1),
	"OfferDragon": KDYesNoBasic("OfferDragon", ["Leather"], ["Ghost"], ["dragonRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15], 1, 2),
	"OfferComfy": KDYesNoBasic("OfferComfy", ["Conjure"], ["Ghost"], ["comfyRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferShackles": KDYesNoBasic("OfferShackles", ["Metal"], ["Ghost"], ["shackleRestraints", "steelCuffs"], [55, 0, 75, 0], [-25, 0, 40, 15], 1, 3),
	"OfferKitty": KDYesNoBasic("OfferKitty", ["Will"], ["Ghost"], ["kittyRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferMithril": KDYesNoBasic("OfferMithril", ["Metal"], ["Ghost"], ["mithrilRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferMithrilRope": KDYesNoBasic("OfferMithrilRope", ["Rope"], ["Ghost"], ["mithrilRope","mithrilRopeHogtie"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferWolfRestraint": KDYesNoBasic("OfferWolfRestraint", ["Metal"], ["Ghost"], ["wolfRestraints", "wolfRestraintsHeavy"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferSlime": KDYesNoBasic("OfferSlime", ["Latex"], ["Ghost"], ["slimeRestraintsRandom"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferResin": KDYesNoBasic("OfferResin", ["Latex"], ["Ghost"], ["resinRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferScarf": KDYesNoBasic("OfferScarf", ["Rope"], ["Ghost"], ["scarfRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferAutoTape": KDYesNoBasic("OfferAutoTape", ["Metal"], ["Ghost"], ["autoTape"], [55, 0, 75, 0], [-200, -200, -200, -200], 2, 3),
	"OfferHiTechCables": KDYesNoBasic("OfferHiTechCables", ["Metal"], ["Ghost"], ["hitechCables","cableGag"], [55, 0, 75, 0], [-200, -200, -200, -200], 2, 3),
	"OfferIce": KDYesNoBasic("OfferIce", ["Elements"], ["Ghost"], ["iceRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15], 2, 3),
	"OfferLatex": KDYesNoBasic("OfferLatex", ["Latex"], ["Ghost"], ["latexRestraints", "latexpetsuit", "latexRestraintsHeavy"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferLatex2": KDYesNoBasic("OfferLatex", ["Latex"], ["Ghost"], ["latexRestraints", "latexpetsuit", "latexRestraintsHeavy"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferKigu": KDYesNoBasic("OfferKigu", ["Conjure"], ["Ghost"], ["kiguRestraints"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferSenseDep": KDYesNoBasic("OfferSenseDep", ["Leather"], ["Ghost"], ["sensedep"], [55, 0, 75, 0], [-25, 0, 40, 15]),
	"OfferLeather": KDYesNoBasic("OfferLeather", ["Leather"], ["Ghost"], ["armbinderSpell", "straitjacketSpell", "legbinderSpell", "harnessSpell", "gagSpell", "blindfoldSpell", "leathercuffsSpell"], [55, 0, 75, 0], [-25, 0, 40, 15], 1, 3),
	"OfferRopes": KDYesNoBasic("OfferRopes", ["Rope"], ["Ghost"], ["ropeRestraints", "ropeRestraints2", "ropeRestraintsHogtie", "ropeRestraintsWrist", "ropeAuxiliary"], [55, 0, 75, 0], [-25, 0, 40, 15],  3, 5, "Red"),
	"OfferChastity": KDYesNoBasic("OfferChastity", ["Metal"], ["Ghost"], ["genericChastity"], [55, 0, 75, 0], [-25, 0, 40, 15],  1, 1, "Gold", false, [{name: "ChastityOffer", duration: 3000}]),
	"OfferCursed": KDYesNoBasic("OfferCursed", ["Metal"], ["Ghost"], ["leatherRestraints", "noBelt", "leatherHeels"], [55, 0, 75, 0], [-25, 0, 40, 15],  1, 1, "Gold", true, [{name: "CursedOffer", duration: 250}], "Common"),




	"OfferWolfgirl": KDRecruitDialogue("OfferWolfgirl", "Nevermere", "Wolfgirl", "Latex", ["wolfGear"], 5, ["wolfGear", "wolfRestraints"], 8, ["wolfgirl", "trainer"], undefined, undefined, 0.5),
	"OfferMaid": KDRecruitDialogue("OfferMaid", "Maidforce", "Maid", "Illusion", ["maidVibeRestraints"], 5, ["maidVibeRestraints", "maidRestraints", "maidRestraintsHeavy"], 13, ["maid"], undefined, ["submissive"], 0.5),
	"OfferBast": KDRecruitDialogue("OfferBast", "Bast", "Bast", "Will", ["kittyCollar"], 5, ["kittyRestraints"], 13, ["mummy"], undefined, ["submissive"], 0.5),
	"OfferDressmaker": KDRecruitDialogue("OfferDressmaker", "Dressmaker", "Bikini", "Rope", ["dressUniform"], 5, ["dressUniform", "dressRestraints"], 13, ["dressmaker"], undefined, ["submissive"], 0.5),
	"OfferBountyhunter": KDRecruitDialogue("OfferBountyhunter", "Bountyhunter", "Bountyhunter", "Illusion", [], 5, ["ropeRestraints", "ropeRestraints2", "ropeRestraintsHogtie", "ropeRestraintsWrist", "ropeAuxiliary"], 13, ["bountyhunter"], undefined, ["submissive"], 0.5),
	"OfferAncientRobot": KDRecruitDialogue("OfferAncientRobot", "AncientRobot", "Wolfgirl", "Metal", ["roboPrisoner"], 5, ["roboPrisoner", "roboAngry", "hitechCables"], 13, ["robot"], undefined, ["submissive"], 0.5),
	"OfferElf": KDRecruitDialogue("OfferElf", "Elf", "Elven", "Will", ["mithrilRestraints"], 5, ["mithrilRestraints", "mithrilRope"], 13, ["elf"], undefined, ["submissive"], 0.5),
	"OfferAlchemist": KDRecruitDialogue("OfferAlchemist", "Alchemist", "BlueSuit", "Latex", ["latexUniform"], 5, ["latexUniform", "latexRestraints", "latexRestraintsHeavy"], 13, ["alchemist"], undefined, ["submissive"], 0.5),
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
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("AngelHelp", 55);
			return false;
		},
		options: {
			"Knife": {
				playertext: "Default", response: "AngelHelpKnife",
				prerequisiteFunction: (_gagged, _player) => {
					return !KinkyDungeonFlags.get("AngelHelped") && !KinkyDungeonInventoryGet("Knife");
				},
				clickFunction: (_gagged, _player) => {
					KinkyDungeonInventoryAddWeapon("Knife");
					KinkyDungeonSetFlag("AngelHelped", 5);
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"Pick": {
				playertext: "Default", response: "AngelHelpPick",
				prerequisiteFunction: (__gagged, _player) => {
					return !KinkyDungeonFlags.get("AngelHelped");
				},
				clickFunction: (_gagged, _player) => {
					KDAddConsumable("Pick", 3);
					KinkyDungeonSetFlag("AngelHelped", 5);
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"BlueKey": {
				playertext: "Default", response: "AngelHelpBlueKey",
				prerequisiteFunction: (_gagged, _player) => {
					return !KinkyDungeonFlags.get("AngelHelped");
				},
				clickFunction: (_gagged, _player) => {
					KDAddConsumable("BlueKey", 1);
					KinkyDungeonSetFlag("AngelHelped", 5);
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"Divine": {
				playertext: "Default", response: "AngelHelpDivine",
				prerequisiteFunction: (_gagged, _player) => {
					return !KinkyDungeonFlags.get("AngelHelped") && KinkyDungeonPlayerGetRestraintsWithLocks(["Divine2", "Divine"]).length > 0;
				},
				clickFunction: (_gagged, _player) => {
					let lockedRestraints = KinkyDungeonPlayerGetRestraintsWithLocks(["Divine2"]);
					if (KDGetBlessings().length > 0 && lockedRestraints.length > 0) {
						let luckyItem = lockedRestraints[Math.floor(KDRandom() * lockedRestraints.length)];
						KinkyDungeonLock(luckyItem, "");
						KinkyDungeonSetFlag("AngelHelped", 5);
					} else {
						if (KinkyDungeonPlayerGetRestraintsWithLocks(["Divine"]).length > 0)
							KDGameData.CurrentDialogMsg = "AngelHelpDivineQuest";
						else
							KDGameData.CurrentDialogMsg = "AngelHelpDivineFail";
					}
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
		clickFunction: (_gagged, _player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
					let items = KinkyDungeonGetRestraintsWithShrine("BindingDress", true, true);
					// Get the most powerful item
					let item = items.length > 0 ? items.reduce((prev, current) => (KinkyDungeonRestraintPower(prev, true) > KinkyDungeonRestraintPower(current, true)) ? prev : current) : null;

					let power = item ? KDRestraint(item).power : 5;
					if (KDFactionRelation("Player", "Dressmaker") < 0.25)
						KinkyDungeonChangeFactionRep("Dressmaker", 0.002 * power);
					else
						KinkyDungeonChangeFactionRep("Dressmaker", 0.0007 * power);
					KDRemoveQuest("DressmakerQuest");
					KDRemoveEntity(KDDialogueEnemy(), false);
					return false;
				},
				prerequisiteFunction: (_gagged, _player) => {
					return KinkyDungeonPlayerTags.has("BindingDress");
				},
				options: {
					"Question": {
						playertext: "Default", response: "Default",
						gag: true,
						clickFunction: (_gagged, _player) => {
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
		clickFunction: (_gagged, _player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					KDAddQuest("ApprenticeQuest");
					return false;
				},
				prerequisiteFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
					KDRemoveQuest("ApprenticeQuest");
					KDRemoveEntity(KDDialogueEnemy(), false);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollLegs, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
					KDRemoveQuest("ApprenticeQuest");
					KDRemoveEntity(KDDialogueEnemy(), false);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollArms, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
					KDRemoveQuest("ApprenticeQuest");
					KDRemoveEntity(KDDialogueEnemy(), false);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollVerbal, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
					KDRemoveQuest("ApprenticeQuest");
					KDRemoveEntity(KDDialogueEnemy(), false);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollPurity, -1);
					if (KDFactionRelation("Player", "Apprentice") < 0.25)
						KinkyDungeonChangeFactionRep("Apprentice", 0.015);
					else
						KinkyDungeonChangeFactionRep("Apprentice", 0.005);
					return false;
				},
				prerequisiteFunction: (_gagged, _player) => {
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
		clickFunction: (_gagged, _player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
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
		clickFunction: (_gagged, _player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
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
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("LeashToPrison", -1);
			return false;
		},
		options: {
			"Submit": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					KinkyDungeonDefeat(true);
					return true;
				},
				exitDialogue: true,
			},
			"Resist": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
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
	"CyberHiSec": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("LeashToPrison", -1);
			return false;
		},
		options: {
			"Submit": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					KDEnterDollTerminal(false, true, false);
					return true;
				},
				exitDialogue: true,
			},
			"Question1": {
				playertext: "Default", response: "Default",
				gag: true, responseGag: true,
				leadsToStage: "",
				dontTouchText: true,
			},
			"Question2": {
				playertext: "Default", response: "Default",
				gag: true, responseGag: true,
				leadsToStage: "",
				dontTouchText: true,
			},
			"Question3": {
				playertext: "Default", response: "Default",
				gagDisabled: true,
				options: {
					"Who": {
						playertext: "Default", response: "Default",
						dontTouchText: true,
						leadsToStage: "",
					},
					"When": {
						playertext: "Default", response: "Default",
						dontTouchText: true,
						leadsToStage: "",
					},
					"Why": {
						playertext: "Default", response: "Default",
						clickFunction: () => {
							let restraint = KinkyDungeonGetRestraint({tags: ["cyberdollrestraints", "cableGag"]},
								KDGetEffLevel(),
								(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), false, "Cyber",
								undefined, undefined, undefined, undefined, undefined,
								{
									allowedGroups: ["ItemMouth"],
								}
							);

							if (restraint) {
								KinkyDungeonAddRestraintIfWeaker(
									restraint, 3, false, "Cyber", false
								);
							}

							return false;

						},
						leadsToStage: "",
						dontTouchText: true,
					},
				},
			},
			"Resist": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
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
	"Tutorial": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("nobed", 8);
			return false;
		},
		options: {
			"Continue": {
				playertext: "Default", response: "Default",
				drawFunction: (_gagged, _player, _delta) => {
					// Portrait
					DrawBoxKD(5, 5, 490, 990, "#ffffff", false, 0.1 + 0.05 * Math.sin(CommonTime()/200), 100);
					return false;
				},
				options: {
					"Continue": {
						playertext: "Continue", response: "Default",
						drawFunction: (_gagged, _player, _delta) => {
							// Portrait
							DrawBoxKD(5, 5, 490, 990, "#ffffff", false, 0.1 + 0.05 * Math.sin(CommonTime()/200), 100);
							return false;
						},
						options: {
							"Continue": {
								playertext: "Continue", response: "Default",
								drawFunction: (_gagged, _player, _delta) => {
									// Pose and restraint display
									DrawBoxKD(500, 900, 250, 95, "#ffffff", false, 0.1 + 0.05 * Math.sin(CommonTime()/200), 100);
									return false;
								},
								options: {
									"Continue": {
										playertext: "Continue", response: "Default",
										drawFunction: (_gagged, _player, _delta) => {
											// Buff bar
											DrawBoxKD(740, 750, 800, 175, "#ffffff", false, 0.1 + 0.05 * Math.sin(CommonTime()/200), 100);
											return false;
										},
										options: {
											"Continue": {
												playertext: "Continue", response: "Default",
												drawFunction: (_gagged, _player, _delta) => {
													// Action Bar
													DrawBoxKD(1620, 820, 440, 175, "#ffffff", false, 0.1 + 0.05 * Math.sin(CommonTime()/200), 100);
													return false;
												},
												options: {
													"Continue": {
														playertext: "Continue", response: "Default",
														drawFunction: (_gagged, _player, _delta) => {
															// Submenus
															DrawBoxKD(1845, 450, 150, 320, "#ffffff", false, 0.1 + 0.05 * Math.sin(CommonTime()/200), 100);
															return false;
														},
														options: {
															"Continue": {
																// Status Bar
																playertext: "Continue", response: "Default",
																drawFunction: (_gagged, _player, _delta) => {
																	DrawBoxKD(1700, 280, 320, 180, "#ffffff", false, 0.1 + 0.05 * Math.sin(CommonTime()/200), 100);
																	return false;
																},
																options: {
																	"Continue": {
																		playertext: "Continue", response: "Default",
																		drawFunction: (_gagged, _player, _delta) => {
																			// Hotbar
																			DrawBoxKD(780, 920, 900, 75, "#ffffff", false, 0.1 + 0.05 * Math.sin(CommonTime()/200), 100);
																			return false;
																		},
																		options: {
																			"Continue": {
																				playertext: "Continue", response: "Default",
																				drawFunction: (_gagged, _player, _delta) => {
																					DrawBoxKD(550, 100, 1000, 200, "#ffffff", false, 0.1 + 0.05 * Math.sin(CommonTime()/200), 100);
																					return false;
																				},
																				options: {
																					"Continue": {
																						playertext: "Continue", response: "Default",
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
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"LeaveAndDisable": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					KDToggles.SkipTutorial = true;
					KDSaveToggles();
					return false;
				},
				exitDialogue: true,
			},
		}
	},
	"Bed": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("nobed", 8);
			return false;
		},
		options: {
			"Sleep": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					if (KinkyDungeonMapGet(KDPlayer().x, KDPlayer().y) && KDGameData.InteractTargetX && KDGameData.InteractTargetY) {
						if (KinkyDungeonMapGet(KDGameData.InteractTargetX, KDGameData.InteractTargetY) == 'B') {
							KDMovePlayer(KDGameData.InteractTargetX, KDGameData.InteractTargetY, true);
						}
					}

					KinkyDungeonSetFlag("slept", -1);
					if (KinkyDungeonPlayerInCell(true) && KDGameData.PrisonerState == 'jail') {
						KinkyDungeonChangeRep("Ghost", KinkyDungeonIsArmsBound() ? 5 : 2);
					}
					//KinkyDungeonChangeWill(KinkyDungeonStatWillMax * KDSleepBedPercentage);
					KDGameData.SleepTurns = KinkyDungeonSleepTurnsMax;
					KinkyDungeonChangeMana(KinkyDungeonStatManaMax, false, 0, false, true);
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
	"DollDropoff": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("nobed", 8);

			let en: entity = null;
			let leashed = KDGetLeashedTo(_player);
			if (leashed.length > 0) en = leashed[0];

			if (en && !en.player && KDCanBind(en)) {
				KDGameData.CurrentDialogMsgData.NME = KDEnemyName(en);
				KDGameData.CurrentDialogMsgValue.ID = en.id;
				KDGameData.CurrentDialogMsgData.PRCNT = "" +
					Math.round(100 * Math.min(1, Math.max(0,
						KDGetSkillCheck(en, _player, en, KDSkillCheckType.Agility, .5))));
				KDGameData.CurrentDialogMsgValue.PRCNT = KDGetSkillCheck(en, _player, en, KDSkillCheckType.Agility, .5);
			}

			return false;
		},
		options: {
			"Use": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {

					let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
					if (nearestJail && nearestJail.x == KDGameData.InteractTargetX && nearestJail.y == KDGameData.InteractTargetY) {
						KDMovePlayer(KDGameData.InteractTargetX + (nearestJail.direction?.x || 0), KDGameData.InteractTargetY + (nearestJail.direction?.y || 0), true);
						if (nearestJail.restrainttags) {
							let restraint = KinkyDungeonGetRestraint({tags: nearestJail.restrainttags}, KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), false, undefined);
							if (restraint)
								KinkyDungeonAddRestraintIfWeaker(restraint, KDGetEffLevel(),false, undefined);
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
			"NPC": {
				playertext: "Default", response: "Default",
				greyoutFunction: (_gagged, _player) => {
					let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
					if (nearestJail && nearestJail.x == KDGameData.InteractTargetX && nearestJail.y == KDGameData.InteractTargetY) {
						if (KinkyDungeonEntityAt(
							KDGameData.InteractTargetX + (nearestJail.direction?.x || 0),
							KDGameData.InteractTargetY + (nearestJail.direction?.y || 0))) {
								return false;
						}
					}
					return !KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
				},
				greyoutTooltip: "KDOccupied",
				clickFunction: (_gagged, _player) => {

					let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
					if (nearestJail && nearestJail.x == KDGameData.InteractTargetX && nearestJail.y == KDGameData.InteractTargetY) {
						KinkyDungeonDrawState = "Collection";
						KDCollectionTab = "Dropoff";
						KDCurrentFacilityTarget = "";
						KDFacilityCollectionCallback = null;
						KinkyDungeonCheckClothesLoss = true;
					}

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
			"EnemyHelpless": {
				playertext: "Default", response: "Default",
				greyoutFunction: (_gagged, _player) => {
					let en: entity = null;
					let leashed = KDGetLeashedTo(_player);
					if (leashed.length > 0) en = leashed[0];
					let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
					if (nearestJail && nearestJail.x == KDGameData.InteractTargetX && nearestJail.y == KDGameData.InteractTargetY) {
						if (KinkyDungeonEntityAt(
							KDGameData.InteractTargetX + (nearestJail.direction?.x || 0),
							KDGameData.InteractTargetY + (nearestJail.direction?.y || 0))
							&& KinkyDungeonEntityAt(
								KDGameData.InteractTargetX + (nearestJail.direction?.x || 0),
								KDGameData.InteractTargetY + (nearestJail.direction?.y || 0)) != en) {
								return false;
						}
					}
					return !KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY)
						|| KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY) == en;
				},
				prerequisiteFunction: (_gagged, _player) => {


					let en: entity = null;
					let leashed = KDGetLeashedTo(_player);
					if (leashed.length > 0) en = leashed[0];

					if (en && !en.player && KDCanBind(en)) {
						return KDHelpless(en) || KDWillingBondage(en, _player);
					}
					return false;
				},
				clickFunction: (_gagged, _player) => {
					let en: entity = null;
					let leashed = KDGetLeashedTo(_player);
					if (leashed.length > 0) en = leashed[0];
					if (en && !en.player && KDCanBind(en)) {

						let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
						if (nearestJail && nearestJail.x == KDGameData.InteractTargetX && nearestJail.y == KDGameData.InteractTargetY) {
							KDBreakTether(en);
							KDMoveEntity(en,
								KDGameData.InteractTargetX + (nearestJail.direction?.x || 0),
								KDGameData.InteractTargetY + (nearestJail.direction?.y || 0), false);
							if (nearestJail.restrainttags) {
								let restraint = KinkyDungeonGetRestraint({tags: nearestJail.restrainttags},
									KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
									true,
									"",
									true,
									false,
									false, undefined, true);


								if (restraint) {
									KDSetNPCRestraint(en.id, "Device", {
										name: restraint.name,
										lock: "White",
										id: KinkyDungeonGetItemID(),
										faction: KDDefaultNPCBindPalette,
									});
									// Add the tieup value
									KDNPCRestraintTieUp(en.id, {
										name: restraint.name,
										lock: "White",
										id: KinkyDungeonGetItemID(),
										faction: KDDefaultNPCBindPalette,
									}, 1);
									KinkyDungeonAdvanceTime(1);
								}
							}
						}

					}
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
			"Enemy": {
				playertext: "Default", response: "Default",
				prerequisiteFunction: (_gagged, _player) => {
					let en: entity = null;
					let leashed = KDGetLeashedTo(KDPlayer());
					if (leashed.length > 0) en = leashed[0];
					if (en && !en.player && KDCanBind(en)) {

						let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
						if (nearestJail && nearestJail.x == KDGameData.InteractTargetX && nearestJail.y == KDGameData.InteractTargetY) {
							if (KinkyDungeonEntityAt(
								KDGameData.InteractTargetX + (nearestJail.direction?.x || 0),
								KDGameData.InteractTargetY + (nearestJail.direction?.y || 0))
								&& KinkyDungeonEntityAt(
									KDGameData.InteractTargetX + (nearestJail.direction?.x || 0),
									KDGameData.InteractTargetY + (nearestJail.direction?.y || 0)) != en) {
									if (!(!KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY)
										|| KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY) == en))
										return false;
							}
						}


						return !KDHelpless(en) && (!en.specialBoundLevel || !en.specialBoundLevel.Furniture);
					}
					return false;
				},
				greyoutFunction: (_gagged, _player) => {
					let en: entity = null;
					let leashed = KDGetLeashedTo(KDPlayer());
					if (leashed.length > 0) en = leashed[0];

					if (en && !en.player && KDCanBind(en)) {
						return KinkyDungeonIsDisabled(en) || KDGameData.CurrentDialogMsgValue.PRCNT > 0;
					}
					return false;
				},
				greyoutTooltip: "KDFurnEnemyDisabled",
				clickFunction: (_gagged, _player) => {
					let en: entity = null;
					let leashed = KDGetLeashedTo(_player);
					if (leashed.length > 0) en = leashed[0];
					if (en && !en.player && KDCanBind(en)) {


						if (KDRandom() < KDGameData.CurrentDialogMsgValue.PRCNT) {

							let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
							if (nearestJail && nearestJail.x == KDGameData.InteractTargetX && nearestJail.y == KDGameData.InteractTargetY) {

								KDBreakTether(en);
								KDMoveEntity(en,
									KDGameData.InteractTargetX + (nearestJail.direction?.x || 0),
									KDGameData.InteractTargetY + (nearestJail.direction?.y || 0), false);

								if ((!en.specialBoundLevel || !en.specialBoundLevel.Furniture)) {
									KDTieUpEnemy(en, en.Enemy.maxhp * 0.3 + 10, "Furniture", undefined);
									KinkyDungeonAdvanceTime(1);
									if (en.bind) en.bind = 0;
									en.bind = Math.max(en.bind, 10);
								}

								KinkyDungeonAdvanceTime(1);
							}


						} else {
							KDGameData.CurrentDialogMsg = "FurnitureEnemyFail";
							KinkyDungeonAdvanceTime(1);
							return true;
						}

					}
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
	"Furniture": {
		response: "Default",
		clickFunction: (_gagged, player) => {
			KinkyDungeonSetFlag("nobed", 8);

			let en = KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
			if (en && !en.player && KDCanBind(en)) {
				KDGameData.CurrentDialogMsgData.NME = KDEnemyName(en);
				KDGameData.CurrentDialogMsgData.PRCNT = "" +
					Math.round(100 * Math.min(1, Math.max(0,
						KDGetSkillCheck(en, player, en, KDSkillCheckType.Agility, .5))));
				KDGameData.CurrentDialogMsgValue.PRCNT = KDGetSkillCheck(en, player, en, KDSkillCheckType.Agility, .5);
			}

			return false;
		},
		options: {
			"Use": {
				playertext: "Default", response: "Default",
				greyoutFunction: (_gagged, _player) => {
					return !KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY)
						|| KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY) == _player;
				},
				greyoutTooltip: "KDOccupied",
				clickFunction: (_gagged, _player) => {

					let tile = KinkyDungeonTilesGet(KDGameData.InteractTargetX + ',' + KDGameData.InteractTargetY);
					if (tile?.Furniture) {
						KDMovePlayer(KDGameData.InteractTargetX, KDGameData.InteractTargetY, true);

						let furn = KDFurniture[tile.Furniture];
						if (furn) {
							KinkyDungeonSetFlag("GuardCalled", 50);
							let rest = KinkyDungeonGetRestraint(
								{tags: [furn.restraintTag]}, MiniGameKinkyDungeonLevel,
								(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
								true,
								"",
								true,
								false,
								false);
							if (rest) {
								KinkyDungeonAddRestraintIfWeaker(rest, KDGetEffLevel(), true);
								if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/LockHeavy.ogg");
							}
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
			"NPC": {
				playertext: "Default", response: "Default",
				greyoutFunction: (_gagged, _player) => {
					return !KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
				},
				greyoutTooltip: "KDOccupied",
				clickFunction: (_gagged, _player) => {

					let tile = KinkyDungeonTilesGet(KDGameData.InteractTargetX + ',' + KDGameData.InteractTargetY);
					if (tile?.Furniture) {
						KinkyDungeonDrawState = "Collection";
						KDCollectionTab = "Imprison";
						KDCurrentFacilityTarget = "";
						KDFacilityCollectionCallback = null;
						KinkyDungeonCheckClothesLoss = true;
					}

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
			"EnemyHelpless": {
				playertext: "Default", response: "Default",
				prerequisiteFunction: (_gagged, _player) => {
					let en = KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
					if (en && !en.player && KDCanBind(en)) {
						return KDHelpless(en);
					}
					return false;
				},
				clickFunction: (_gagged, _player) => {
					let en = KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
					if (en && !en.player && KDCanBind(en)) {
						let tile = KinkyDungeonTilesGet(KDGameData.InteractTargetX + ',' + KDGameData.InteractTargetY);
						let furn = KDFurniture[tile.Furniture];
						let rest = KinkyDungeonGetRestraint(
							{tags: [furn.restraintTag]}, MiniGameKinkyDungeonLevel,
							(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
							true,
							"",
							true,
							false,
							false, undefined, true);
						KDImprisonEnemy(en, true, "PrisonerJailOwn", {
							name: rest.name,
							lock: "White",
							id: KinkyDungeonGetItemID(),
							faction: KDDefaultNPCBindPalette,
						});
						KinkyDungeonAdvanceTime(1);
					}
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
			"Enemy": {
				playertext: "Default", response: "Default",
				prerequisiteFunction: (_gagged, _player) => {
					let en = KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
					if (en && !en.player && KDCanBind(en)) {
						return !KDHelpless(en) && (!en.specialBoundLevel || !en.specialBoundLevel.Furniture);
					}
					return false;
				},
				greyoutFunction: (_gagged, _player) => {
					let en = KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
					if (en && !en.player && KDCanBind(en)) {
						return KinkyDungeonIsDisabled(en) || KDGameData.CurrentDialogMsgValue.PRCNT > 0;
					}
					return false;
				},
				greyoutTooltip: "KDFurnEnemyDisabled",
				clickFunction: (_gagged, _player) => {
					let en = KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
					if (en && !en.player && KDCanBind(en)) {
						if (KDRandom() < KDGameData.CurrentDialogMsgValue.PRCNT) {
							if ((!en.specialBoundLevel || !en.specialBoundLevel.Furniture)) {
								KDTieUpEnemy(en, en.Enemy.maxhp * 0.3 + 10, "Furniture", undefined);
								KinkyDungeonAdvanceTime(1);
								if (en.bind) en.bind = 0;
								en.bind = Math.max(en.bind, 10);
								en.immobile = Math.max(en.immobile || 0, 10);
							}
						} else {
							KDGameData.CurrentDialogMsg = "FurnitureEnemyFail";
							KinkyDungeonAdvanceTime(1);
							return true;
						}

					}
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
	"Elevator": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
				skip: true,
			},
			...Object.fromEntries(["Summit", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(
				(num) => {
					/**
					 */
					let d: KinkyDialogue = {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KDIsElevatorFloorUnlocked(num);
						},
						clickFunction: (_gagged, _player) => {
							KDElevatorToFloor(
								KDElevatorFloorIndex[num] ? (KDElevatorFloorIndex[num].Floor) : (typeof num === "string" ? 0 : num),
								KDElevatorFloorIndex[num]?.RoomType ||
									(typeof KDGameData.ElevatorsUnlocked[num] == "string" ? KDGameData.ElevatorsUnlocked[num] : undefined));
							return false;
						},
						exitDialogue: true,
					};
					return [num, d];
				}
			))
		}
	},
	"Oriel": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			return false;
		},
		options: {
			"WhoAreYou": {
				playertext: "Default", response: "Default",
				gag: true, responseGag: true,
				prerequisiteFunction: (_gagged, _player) => {
					return !KinkyDungeonFlags.get("dOriel_WhoAreYou");
				},
				clickFunction: (gagged, _player) => {
					if (!gagged)
						KinkyDungeonSetFlag("dOriel_WhoAreYou", -1);
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"Goddess": {
				playertext: "Default", response: "Default",
				gag: true, responseGag: true,
				prerequisiteFunction: (_gagged, _player) => {
					return KinkyDungeonFlags.get("dOriel_WhoAreYou") && !KinkyDungeonFlags.get("dOriel_Goddess");
				},
				clickFunction: (gagged, _player) => {
					if (!gagged)
						KinkyDungeonSetFlag("dOriel_Goddess", -1);
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"Control": {
				playertext: "Default", response: "Default",
				gag: true, responseGag: true,
				prerequisiteFunction: (_gagged, _player) => {
					return KinkyDungeonFlags.get("dOriel_WhoAreYou") && !KinkyDungeonFlags.get("dOriel_Control");
				},
				clickFunction: (gagged, _player) => {
					if (!gagged)
						KinkyDungeonSetFlag("dOriel_Control", -1);
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"Elevator": {
				playertext: "Default", response: "Default",
				gag: true, responseGag: true,
				prerequisiteFunction: (_gagged, _player) => {
					return (KinkyDungeonFlags.get("dOriel_WhoAreYou") && KDMapData.RoomType == "ElevatorRoom");
				},
				leadsToStage: "", dontTouchText: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				gag: true, responseGag: true,
				prerequisiteFunction: (gagged, _player) => {
					if (KinkyDungeonFlags.get("dOriel_WhoAreYou") || gagged)
						return KinkyDungeonAllRestraintDynamic().some((element) => {
							return !KDRestraint(element.item)?.armor && !KDRestraint(element.item)?.good;
						});
					return false;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"Hello": {
				playertext: "Default", response: "Default",
				gag: true, responseGag: true,
				prerequisiteFunction: (gagged, _player) => {
					return (KinkyDungeonFlags.get("dOriel_WhoAreYou") == -1) || gagged;
				},
				leadsToStage: "", dontTouchText: true,
			},
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"ToolsOfTheTrade": {
		response: "Default",
		inventory: true,
		clickFunction: (_gagged, _player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"SmokeBomb": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					let amount = KinkyDungeonInventoryGetConsumable("Gunpowder")?.quantity;
					if (amount >= 1) {
						KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("Gunpowder"), -1);
						KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("SmokeBomb"), 1);
					} else {
						KDGameData.CurrentDialogMsg = "ToolsOfTheTradeFail";
					}
					KDGameData.CurrentDialogStage = "";
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"FlashBomb": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					let amount = KinkyDungeonInventoryGetConsumable("Gunpowder")?.quantity;
					let amount2 = KinkyDungeonInventoryGetConsumable("AncientPowerSource")?.quantity;
					if (amount >= 1 && amount2 >= 1) {
						KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("Gunpowder"), -1);
						KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("AncientPowerSource"), -1);
						KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("FlashBomb"), 3);
					} else {
						KDGameData.CurrentDialogMsg = "ToolsOfTheTradeFail";
					}
					KDGameData.CurrentDialogStage = "";
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Bomb": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					let amount = KinkyDungeonInventoryGetConsumable("Gunpowder")?.quantity;
					if (amount >= 2) {
						KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("Gunpowder"), -2);
						KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("Bomb"), 1);
					} else {
						KDGameData.CurrentDialogMsg = "ToolsOfTheTradeFail";
					}
					KDGameData.CurrentDialogStage = "";
					return false;
				},
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"PotionInvisibility": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					let amount = KinkyDungeonInventoryGetConsumable("Ectoplasm")?.quantity;
					if (amount >= 3) {
						KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("Ectoplasm"), -3);
						KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("PotionInvisibility"), 1);
					} else {
						KDGameData.CurrentDialogMsg = "ToolsOfTheTradeFail";
					}
					KDGameData.CurrentDialogStage = "";
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
	"CommercePortal": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("noportal", 1);
			if (!KDGameData.TeleportLocations) KDGameData.TeleportLocations = {};
			KDGameData.TeleportLocations.commerce = {x: KDCurrentWorldSlot.x, y: KDCurrentWorldSlot.y, type: KDGameData.RoomType, level: MiniGameKinkyDungeonLevel, checkpoint: MiniGameKinkyDungeonCheckpoint};
			return false;
		},
		options: {
			"Go": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					let params = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];

					if (KDTile() && KDTile().Portal == "CommercePortal") {
						KinkyDungeonMapSet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, '0');
						KDTileDelete();
					}

					MiniGameKinkyDungeonLevel = 0;

					KinkyDungeonCreateMap(params, "ShopStart", "", MiniGameKinkyDungeonLevel, undefined, undefined, undefined, {x: 0, y: 0}, false, undefined);

					// Place return portal
					KinkyDungeonMapSet(KDMapData.EndPosition.x, KDMapData.EndPosition.y, ';');
					KinkyDungeonTilesSet("" + (KDMapData.EndPosition.x) + "," + (KDMapData.EndPosition.y), {Portal: "CommercePortalReturn", Light: 5, lightColor: 0xffff88});

					KinkyDungeonSetFlag("noportal", 3);


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
	"CommercePortalReturn": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("noportal", 1);
			return false;
		},
		options: {
			"Go": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, player) => {
					if (KDTile() && KDTile().Portal == "CommercePortalReturn") {
						KinkyDungeonMapSet(player.x, player.y, '0');
						KDTileDelete();
					}

					if (!KDGameData.TeleportLocations) KDGameData.TeleportLocations = {};
					MiniGameKinkyDungeonLevel = KDGameData.TeleportLocations.commerce.level;
					let params = KinkyDungeonMapParams[KinkyDungeonMapIndex[KDGameData.TeleportLocations.commerce.checkpoint]];



					KinkyDungeonCreateMap(params, KDGameData.TeleportLocations.commerce.type, "", KDGameData.TeleportLocations.commerce.level,
						undefined, undefined, undefined, {x: KDGameData.TeleportLocations.commerce.x, y: KDGameData.TeleportLocations.commerce.y}, true, undefined);

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
		clickFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
					let tile = KinkyDungeonTilesGet(KinkyDungeonTargetTileLocation);
					if (tile && tile.Type == "Food") {
						let gagTotal = KinkyDungeonGagTotal();
						if (gagTotal > 0) {
							//KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonFoodEatenGag"), "#ff8933", 1);
							KDGameData.CurrentDialogMsg = "TableFoodEatFail";
						} else {
							// Perform the deed
							let Willmulti = Math.max(KinkyDungeonStatWillMax / KDMaxStatStart);
							let amount = tile.Amount ? tile.Amount : 1.0;
							KinkyDungeonChangeWill(amount * Willmulti);

							// Send the message and advance time
							KinkyDungeonAdvanceTime(1);

							KDRunChefChance(KinkyDungeonPlayerEntity);
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
						clickFunction: (_gagged, _player) => {
							KinkyDungeonTargetTile = null;
							KinkyDungeonTargetTileLocation = "";
							return false;
						},
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Take": {
				playertext: "Default", response: "Default",
				prerequisiteFunction: (_gagged, _player) => {
					let tile = KinkyDungeonTilesGet(KinkyDungeonTargetTileLocation);
					if (tile && tile.Type == "Food" && KDFood[tile.Food]?.Theft) {
						return true;
					}
					return false;
				},
				clickFunction: (_gagged, _player) => {
					let tile = KinkyDungeonTilesGet(KinkyDungeonTargetTileLocation);
					if (tile && tile.Type == "Food" && KDFood[tile.Food]?.Theft) {
						KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable(KDFood[tile.Food].Theft), 1);

						// Send the message and advance time
						KinkyDungeonAdvanceTime(1);
						//KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonFoodEaten"), "lightgreen", 1);

						KDRunChefChance(KinkyDungeonPlayerEntity);

						// Remove the food
						tile.Food = "Plate";
						tile.Eaten = true;
					}
					return false;
				},
				options: {
					"Leave": {
						clickFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
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
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("nobutton", 3);
			return false;
		},
		options: {
			"Press": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, player) => {
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
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("nodollterm", 4);
			return false;
		},
		options: {
			"Leave": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					KDPushSpell(KinkyDungeonFindSpell("ManaPoolUp"));
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
						clickFunction: (_gagged, _player) => {
							KDPushSpell(KinkyDungeonFindSpell("ManaPoolUp"));
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
		clickFunction: (_gagged, _player) => {
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
								clickFunction: (_gagged, _player) => {
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
		clickFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
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
						clickFunction: (_gagged, _player) => {
							KDEnterDollTerminal(true);
							return false;
						},
						exitDialogue: true,
					},
				}
			},
			"Forced": {
				prerequisiteFunction: (_gagged, _player) => {return false;},
				playertext: "Default", response: "Default",
				options: {
					"Leave": {
						clickFunction: (_gagged, _player) => {
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
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("noleyline", 8);
			return false;
		},
		options: {
			"Use": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, player) => {
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
		clickFunction: (_gagged, _player) => {
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Help": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
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
		clickFunction: (_gagged, _player) => {
			return false;
		},
		options: {
			"Accept": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, player) => {
					KDGameData.PrisonerState = "";
					KinkyDungeonInterruptSleep();
					// Type shenanigans unintended
					let doorTile = KDGetJailDoor(player.x, player.y);
					let door: KDPoint = doorTile;
					if (door && KDistChebyshev(door.x-player.x, door.y-player.y) < 5) {
						if (doorTile.tile) {
							doorTile['OGLock'] = doorTile['Lock'];
							doorTile.tile.Lock = undefined;
							KDUpdateDoorNavMap();
						}
						KinkyDungeonMapSet(door.x, door.y, 'd');
					} else door = KinkyDungeonGetNearbyPoint(player.x, player.y, true);
					if (!door) {
						door = {x: player.x, y: player.y}; // Better glitch than break game
					}
					KDMapData.Entities = [];
					KDCommanderRoles = new Map();
					KDGameData.RespawnQueue = [];
					KDUpdateEnemyCache = true;
					let e = DialogueCreateEnemy(door.x, door.y, "ShopkeeperRescue");
					e.allied = 9999;
					e.faction = "Player";
					KDGameData.CurrentDialogMsgSpeaker = e.Enemy.name;
					KinkyDungeonSetEnemyFlag(e, "RescuingPlayer", -1);

					KDGameData.GuardSpawnTimer = 100;
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
				clickFunction: (_gagged, _player) => {
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
		clickFunction: (_gagged, _player) => {
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
		clickFunction: (_gagged, _player) => {
			if (!KDGameData.ShopkeeperFee) KDGameData.ShopkeeperFee = 0;
			KDGameData.ShopkeeperFee += KDDialogueParams.ShopkeeperFee + Math.max(0, KDDialogueParams.ShopkeeperFeePerLevel * (KDGameData.HighestLevelCurrent || 1));
			KDGameData.CurrentDialogMsgValue = {
				"RESCUECOST": Math.round(KDGameData.ShopkeeperFee),
			};
			KDGameData.CurrentDialogMsgData = {
				"RESCUECOST": "" + Math.round(KDGameData.ShopkeeperFee),
			};
			return false;
		},
		options: {
			"Pay": {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (_gagged, _player) => {
					return KinkyDungeonGold >= KDGameData.ShopkeeperFee;
				},
				clickFunction: (_gagged, _player) => {
					KinkyDungeonGold -= KDGameData.ShopkeeperFee;
					KDGameData.ShopkeeperFee = 0;
					KinkyDungeonRemoveRestraintsWithShrine("Rope", undefined, true, false, true, false, true);
					KinkyDungeonRemoveRestraintsWithShrine("Leather", undefined, true, false, true, false, true);
					KinkyDungeonRemoveRestraintsWithShrine("Metal", undefined, true, false, true, false, true);
					KinkyDungeonRemoveRestraintsWithShrine("Latex", undefined, true, false, true, false, true);
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
				prerequisiteFunction: (_gagged, _player) => {
					return !KDGameData.CurrentDialogMsgData.Please;
				},
				playertext: "Default", response: "Default", gag: true,
				clickFunction: (_gagged, _player) => {
					if (KinkyDungeonGold >= KDDialogueParams.ShopkeeperFee + Math.max(0, KDDialogueParams.ShopkeeperFeePerLevel * (KDGameData.HighestLevelCurrent || 1))) {
						KDGameData.CurrentDialogMsg = "ShopkeeperTeleportTabNo";
						KDGameData.CurrentDialogStage = "";
						KDGameData.CurrentDialogMsgData.Please = "true";
						return false;
					} else {
						if (!KDGameData.CurrentDialogMsgData) KDGameData.CurrentDialogMsgData = {};
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor = KinkyDungeonGetRestraint({tags: ['basicCurse', 'shopCurse']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint = KDChooseRestraintFromListGroupPri(
							KDGetRestraintsEligible({tags: ['trap', 'shopRestraint']}, 10, 'grv', true, undefined, undefined, undefined, false),
							KDGetProgressiveOrderFun())?.name;
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
				prerequisiteFunction: (_gagged, _player) => {
					return KDGameData.CurrentDialogMsgData.Please != undefined;
				},
				playertext: "Default", response: "Default", gag: true,
				clickFunction: (_gagged, _player) => {
					if (!KDGameData.CurrentDialogMsgData) KDGameData.CurrentDialogMsgData = {};
					KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor = KinkyDungeonGetRestraint({tags: ['basicCurse', 'shopCurse']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;
					KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint = KDChooseRestraintFromListGroupPri(
						KDGetRestraintsEligible({tags: ['trap', 'shopRestraint']}, 10, 'grv', true, undefined, undefined, undefined, false),
						KDGetProgressiveOrderFun())?.name;
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
				prerequisiteFunction: (_gagged, _player) => {
					return false;
				},
				playertext: "Default", response: "Default", gag: true,
				clickFunction: (_gagged, _player) => {
					return false;
				},
				options: {
					"Armor": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Armor != undefined;
						},
						clickFunction: (_gagged, _player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = KDGetItemNameString(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperTeleportDebt_Yes", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									if (KDRandom() > (KDBasicArmorWeight_Cursed) / (KDBasicArmorWeight_Cursed + KDBasicArmorWeight)) {
										KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt_Armor_YesUncursed";

									} else {
										let armor = KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor;
										let curs = KDGetByWeight(KinkyDungeonGetHexByListWeighted("Common", armor,
											false, 0, 50, []));
										let events = JSON.parse(JSON.stringify(KDRestraint({name: armor}).events || []));
										let variant: KDRestraintVariant = {
											template: armor,
											events: events,
										};
										if (curs) {
											events.push(...KDEventHexModular[curs].events({variant: variant}));
										}
										KDEquipInventoryVariant(variant, "", 0, true, "", true, false, "Shopkeeper", true,
											KDGetByWeight(KinkyDungeonGetCurseByListWeighted(["Common"], "", false, 0, 20)));

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
								clickFunction: (_gagged, _player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt";
									return true;
								}
							},
						}
					},
					"Restraint": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Restraint != undefined;
						},
						clickFunction: (_gagged, _player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = KDGetItemNameString(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperTeleportDebt_Yes", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									let armor = KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint;
									let curs = KDGetByWeight(KinkyDungeonGetHexByListWeighted("Common", armor,
										false, 0, 50, []));
									let events = JSON.parse(JSON.stringify(KDRestraint({name: armor}).events || []));
									let variant: KDRestraintVariant = {
										template: armor,
										events: events,
									};
									if (curs) {
										events.push(...KDEventHexModular[curs].events({variant: variant}));
									}
									KDEquipInventoryVariant(variant, "", 0, true, "", true, false, "Shopkeeper", true,
										KDGetByWeight(KinkyDungeonGetCurseByListWeighted(["Common"], "", false, 0, 20)));
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
								clickFunction: (_gagged, _player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt";
									return true;
								}
							},
						}
					},
					"Collar": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Collar != undefined;
						},
						clickFunction: (_gagged, _player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = KDGetItemNameString(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperTeleportDebt_Yes", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									let armor = KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar;
									let curs = KDGetByWeight(KinkyDungeonGetHexByListWeighted("Common", armor,
										false, 0, 50, []));
									let events = JSON.parse(JSON.stringify(KDRestraint({name: armor}).events || []));
									let variant: KDRestraintVariant = {
										template: armor,
										events: events,
									};
									if (curs) {
										events.push(...KDEventHexModular[curs].events({variant: variant}));
									}
									KDEquipInventoryVariant(variant, "", 0, true, "", true, false, "Shopkeeper", true,
										KDGetByWeight(KinkyDungeonGetCurseByListWeighted(["Common"], "", false, 0, 20)));
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
								clickFunction: (_gagged, _player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt";
									return true;
								}
							},
						}
					},
					"Catsuit": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Catsuit != undefined;
						},
						clickFunction: (_gagged, _player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = KDGetItemNameString(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperTeleportDebt_Yes", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									let armor = KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit;
									let curs = KDGetByWeight(KinkyDungeonGetHexByListWeighted("Common", armor,
										false, 0, 50, []));
									let events = JSON.parse(JSON.stringify(KDRestraint({name: armor}).events || []));
									let variant: KDRestraintVariant = {
										template: armor,
										events: events,
									};
									if (curs) {
										events.push(...KDEventHexModular[curs].events({variant: variant}));
									}
									KDEquipInventoryVariant(variant, "", 0, true, "", true, false, "Shopkeeper", true,
										KDGetByWeight(KinkyDungeonGetCurseByListWeighted(["Common"], "", false, 0, 20)));
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
								clickFunction: (_gagged, _player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperTeleportDebt";
									return true;
								}
							},
						}
					},
					"Pay": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KinkyDungeonGold >= KDGameData.ShopkeeperFee;
						},
						clickFunction: (_gagged, _player) => {
							KinkyDungeonGold -= KDGameData.ShopkeeperFee;
							KDGameData.ShopkeeperFee = 0;
							KinkyDungeonRemoveRestraintsWithShrine("Rope", undefined, true, false, true, false, true);
							KinkyDungeonRemoveRestraintsWithShrine("Leather", undefined, true, false, true, false, true);
							KinkyDungeonRemoveRestraintsWithShrine("Metal", undefined, true, false, true, false, true);
							KinkyDungeonRemoveRestraintsWithShrine("Latex", undefined, true, false, true, false, true);
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
	"ShopkeeperOfferHelp": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KDGameData.CurrentDialogMsgValue = {
				"RESCUECOST": Math.round(KDDialogueParams.ShopkeeperHelpFee + (KDDialogueParams.ShopkeeperHelpFeePerLevel * (KDGameData.HighestLevelCurrent || 1))
					+ (KDDialogueParams.ShopkeeperHelpFeePerPower * (KDGetTotalRestraintPower(
						KinkyDungeonPlayerEntity, ["Leather", "Latex", "Rope", "Metal"], [], true, false)
						|| 1))),
			};
			KDGameData.CurrentDialogMsgData = {
				"RESCUECOST": "" + Math.round(KDGameData.CurrentDialogMsgValue.RESCUECOST),
			};
			return false;
		},
		options: {
			"Pay": {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (_gagged, _player) => {
					return KinkyDungeonGold >= KDGameData.CurrentDialogMsgValue.RESCUECOST;
				},
				clickFunction: (_gagged, _player) => {
					KinkyDungeonGold -= KDGameData.CurrentDialogMsgValue.RESCUECOST;
					KinkyDungeonRemoveRestraintsWithShrine("Rope", undefined, true, false, true, false, true);
					KinkyDungeonRemoveRestraintsWithShrine("Leather", undefined, true, false, true, false, true);
					KinkyDungeonRemoveRestraintsWithShrine("Metal", undefined, true, false, true, false, true);
					KinkyDungeonRemoveRestraintsWithShrine("Latex", undefined, true, false, true, false, true);
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
				prerequisiteFunction: (_gagged, _player) => {
					return !KDGameData.CurrentDialogMsgData.Please;
				},
				playertext: "Default", response: "Default", gag: true,
				clickFunction: (_gagged, _player) => {
					if (KinkyDungeonGold >= KDGameData.CurrentDialogMsgValue.RESCUECOST) {
						KDGameData.CurrentDialogMsg = "ShopkeeperOfferHelpTabNo";
						KDGameData.CurrentDialogStage = "";
						KDGameData.CurrentDialogMsgData.Please = "true";
						return false;
					} else {
						if (!KDGameData.CurrentDialogMsgData) KDGameData.CurrentDialogMsgData = {};
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor = KinkyDungeonGetRestraint({tags: ['commonCurse']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint = KDChooseRestraintFromListGroupPri(
							KDGetRestraintsEligible({tags: ['trap', 'shopRestraint']}, 10, 'grv', true, undefined, undefined, undefined, false),
							KDGetProgressiveOrderFun())?.name;
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar = KinkyDungeonGetRestraint({tags: ['shopCollar']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit = KinkyDungeonGetRestraint({tags: ['shopCatsuit']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;

						if (KDGetTotalRestraintPower(
							KinkyDungeonPlayerEntity, ["Leather", "Latex", "Rope", "Metal"], [], true, false) > KDDialogueParams.ShopkeeperHelpFeeFreebiePower
							|| KinkyDungeonFlags.get("Collateral") || !(
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor
							|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint
							|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar
							|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit
						)) {
							KDGameData.CurrentDialogMsg = "ShopkeeperOfferHelpTabYesRestrained";
						} else {
							KDGameData.CurrentDialogMsg = "ShopkeeperOfferHelpTabNoPoor";
							KDGameData.CurrentDialogStage = "";
							KDGameData.CurrentDialogMsgData.Please = "true";
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
				prerequisiteFunction: (_gagged, _player) => {
					return KDGameData.CurrentDialogMsgData.Please != undefined;
				},
				playertext: "Default", response: "Default", gag: true,
				clickFunction: (_gagged, _player) => {
					if (!KDGameData.CurrentDialogMsgData) KDGameData.CurrentDialogMsgData = {};
					KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor = KinkyDungeonGetRestraint({tags: ['commonCurse']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;
					KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint = KDChooseRestraintFromListGroupPri(
						KDGetRestraintsEligible({tags: ['trap', 'shopRestraint']}, 10, 'grv', true, undefined, undefined, undefined, false),
						KDGetProgressiveOrderFun())?.name;
					KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar = KinkyDungeonGetRestraint({tags: ['shopCollar']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;
					KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit = KinkyDungeonGetRestraint({tags: ['shopCatsuit']}, 10, 'grv', true, undefined, undefined, undefined, false)?.name;

					if (KDGetTotalRestraintPower(
						KinkyDungeonPlayerEntity, ["Leather", "Latex", "Rope", "Metal"], [], true, false) > KDDialogueParams.ShopkeeperHelpFeeFreebiePower
						|| KinkyDungeonFlags.get("Collateral") || !(
						KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor
						|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint
						|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar
						|| KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit
					)) {
						KDGameData.CurrentDialogMsg = "ShopkeeperOfferHelpTabRetryRestrained";
					} else {
						KinkyDungeonSetFlag("Collateral", -1, 1);
						KinkyDungeonRemoveRestraintsWithShrine("Rope", undefined, true, false, true, false, true);
						KinkyDungeonRemoveRestraintsWithShrine("Leather", undefined, true, false, true, false, true);
						KinkyDungeonRemoveRestraintsWithShrine("Metal", undefined, true, false, true, false, true);
						KinkyDungeonRemoveRestraintsWithShrine("Latex", undefined, true, false, true, false, true);
						KDGameData.CurrentDialogStage = "Debt";
						KDGameData.CurrentDialogMsg = "ShopkeeperOfferHelpDebt";
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
				prerequisiteFunction: (_gagged, _player) => {
					return false;
				},
				playertext: "Default", response: "Default", gag: true,
				clickFunction: (_gagged, _player) => {
					return false;
				},
				options: {
					"Armor": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Armor != undefined;
						},
						clickFunction: (_gagged, _player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = KDGetItemNameString(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperOfferHelpDebt_Yes", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									if (KDRandom() > (KDBasicArmorWeight_Cursed) / (KDBasicArmorWeight_Cursed + KDBasicArmorWeight)) {
										KDGameData.CurrentDialogMsg = "ShopkeeperOfferHelpDebt_Armor_YesUncursed";

									} else {
										let armor = KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Armor;
										let curs = KDGetByWeight(KinkyDungeonGetHexByListWeighted("Common", armor,
											false, 0, 50, []));
										let events = JSON.parse(JSON.stringify(KDRestraint({name: armor}).events || []));
										let variant: KDRestraintVariant = {
											template: armor,
											events: events,
										};
										if (curs) {
											events.push(...KDEventHexModular[curs].events({variant: variant}));
										}
										KDEquipInventoryVariant(variant, "", 0, true, "", true, false, "Shopkeeper", true,
											KDGetByWeight(KinkyDungeonGetCurseByListWeighted(["Common"], "", false, 0, 20)));
										KDGameData.CurrentDialogMsg = "ShopkeeperOfferHelpDebt_Armor_YesCursed";

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
								playertext: "ShopkeeperOfferHelpDebt_No", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperOfferHelpDebt";
									return true;
								}
							},
						}
					},
					"Restraint": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Restraint != undefined;
						},
						clickFunction: (_gagged, _player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = KDGetItemNameString(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperOfferHelpDebt_Yes", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									let armor = KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Restraint;
									let curs = KDGetByWeight(KinkyDungeonGetHexByListWeighted("Common", armor,
										false, 0, 50, []));
									let events = JSON.parse(JSON.stringify(KDRestraint({name: armor}).events || []));
									let variant: KDRestraintVariant = {
										template: armor,
										events: events,
									};
									if (curs) {
										events.push(...KDEventHexModular[curs].events({variant: variant}));
									}
									KDEquipInventoryVariant(variant, "", 0, true, "", true, false, "Shopkeeper", true,
										KDGetByWeight(KinkyDungeonGetCurseByListWeighted(["Common"], "", false, 0, 20)));
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
								playertext: "ShopkeeperOfferHelpDebt_No", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperOfferHelpDebt";
									return true;
								}
							},
						}
					},
					"Collar": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Collar != undefined;
						},
						clickFunction: (_gagged, _player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = KDGetItemNameString(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperOfferHelpDebt_Yes", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									let armor = KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Collar;
									let curs = KDGetByWeight(KinkyDungeonGetHexByListWeighted("Common", armor,
										false, 0, 50, []));
									let events = JSON.parse(JSON.stringify(KDRestraint({name: armor}).events || []));
									let variant: KDRestraintVariant = {
										template: armor,
										events: events,
									};
									if (curs) {
										events.push(...KDEventHexModular[curs].events({variant: variant}));
									}
									KDEquipInventoryVariant(variant, "", 0, true, "", true, false, "Shopkeeper", true,
										KDGetByWeight(KinkyDungeonGetCurseByListWeighted(["Common"], "", false, 0, 20)));
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
								playertext: "ShopkeeperOfferHelpDebt_No", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperOfferHelpDebt";
									return true;
								}
							},
						}
					},
					"Catsuit": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KDGameData.CurrentDialogMsgData?.RESTRAINTNAME_Catsuit != undefined;
						},
						clickFunction: (_gagged, _player) => {
							KDGameData.CurrentDialogMsgData.RESTRAINTNAME = KDGetItemNameString(KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit);
							return false;
						},
						options: {
							"Yes": {
								playertext: "ShopkeeperOfferHelpDebt_Yes", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									let armor = KDGameData.CurrentDialogMsgData.RESTRAINTNAME_Catsuit;
									let curs = KDGetByWeight(KinkyDungeonGetHexByListWeighted("Common", armor,
										false, 0, 50, []));
									let events = JSON.parse(JSON.stringify(KDRestraint({name: armor}).events || []));
									let variant: KDRestraintVariant = {
										template: armor,
										events: events,
									};
									if (curs) {
										events.push(...KDEventHexModular[curs].events({variant: variant}));
									}
									KDEquipInventoryVariant(variant, "", 0, true, "", true, false, "Shopkeeper", true,
										KDGetByWeight(KinkyDungeonGetCurseByListWeighted(["Common"], "", false, 0, 20)));
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
								playertext: "ShopkeeperOfferHelpDebt_No", response: "Default", gag: true,
								clickFunction: (_gagged, _player) => {
									KDGameData.CurrentDialogStage = "Debt";
									KDGameData.CurrentDialogMsg = "ShopkeeperOfferHelpDebt";
									return true;
								}
							},
						}
					},
					"Pay": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KinkyDungeonGold >= KDGameData.CurrentDialogMsgValue.RESCUECOST;
						},
						clickFunction: (_gagged, _player) => {
							KinkyDungeonGold -= KDGameData.CurrentDialogMsgValue.RESCUECOST;
							KinkyDungeonRemoveRestraintsWithShrine("Rope", undefined, true, false, true, false, true);
							KinkyDungeonRemoveRestraintsWithShrine("Leather", undefined, true, false, true, false, true);
							KinkyDungeonRemoveRestraintsWithShrine("Metal", undefined, true, false, true, false, true);
							KinkyDungeonRemoveRestraintsWithShrine("Latex", undefined, true, false, true, false, true);
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
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"ShopkeeperStart": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			if (!KDGameData.ShopkeeperFee) KDGameData.ShopkeeperFee = 0;
			KDGameData.CurrentDialogMsgValue = {
				"RESCUECOST": Math.round(KDGameData.ShopkeeperFee || (KDDialogueParams.ShopkeeperFee + Math.max(0, KDDialogueParams.ShopkeeperFeePerLevel * (KDGameData.HighestLevelCurrent || 1)))),
			};
			KDGameData.CurrentDialogMsgData = {
				"RESCUECOST": "" + (KDGameData.ShopkeeperFee || (KDDialogueParams.ShopkeeperFee + Math.max(0, KDDialogueParams.ShopkeeperFeePerLevel * (KDGameData.HighestLevelCurrent || 1)))),
			};
			return false;
		},
		options: {
			"Shop": {
				playertext: "Default", response: "Default",
				gag: true,
				clickFunction: (gagged, _player) => {
					if (gagged) {
						KDGameData.CurrentDialogMsg = "ShopkeeperStartShopGag";
					}
					return false;
				},
				options: {
					"Sell": {
						playertext: "Default", response: "Default",
						exitDialogue: true,
						clickFunction: (_gagged, _player) => {
							KDGameData.InventoryAction = "Sell";
							KDGameData.SellMarkup = 0.7;
							KinkyDungeonDrawState = "Inventory";
							KinkyDungeonCurrentFilter = Weapon;
							return false;
						},
					},
					/*"SellBulk": {
						playertext: "Default", response: "Default",
						exitDialogue: true,
						clickFunction: (_gagged, _player) => {
							KDGameData.InventoryAction = "SellBulk";
							KDGameData.SellMarkup = 0.7;
							KinkyDungeonDrawState = "Inventory";
							KinkyDungeonCurrentFilter = Weapon;
							return false;
						},
					},*/
					"Return": {
						playertext: "Return", response: "Default",
						leadsToStage: "",
					},
				}
			},
			"Help": {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (_gagged, _player) => {
					return KinkyDungeonAllRestraintDynamic().some((element) => {
						return !KDRestraint(element.item)?.armor && !KDRestraint(element.item)?.good;
					});
				},
				clickFunction: (_gagged, _player) => {
					if (KinkyDungeonGetRestraintsWithShrine("Metal", true, true, false).length > 0
						|| KinkyDungeonGetRestraintsWithShrine("Latex", true, true, false).length > 0
						|| KinkyDungeonGetRestraintsWithShrine("Leather", true, true, false).length > 0
						|| KinkyDungeonGetRestraintsWithShrine("Rope", true, true, false).length > 0) {
						let e = KDGetSpeaker();
						KDStartDialog("ShopkeeperOfferHelp", e.Enemy.name, true, e.personality, e);
						return true;
					}
					return false;
				},
				options: {
					"Return": {
						playertext: "Return", response: "Default",
						leadsToStage: "",
					},
				}
			},
			"Buy": {
				playertext: "Default", response: "Default",
				gag: true,
				options: {
					"Return": {
						playertext: "Return", response: "Default",
						leadsToStage: "",
					},
				}
			},
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

	"MummyElevator": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			let e = KDGetSpeaker();
			if (e) {
				e.hp = 0;
				let en = DialogueCreateEnemy(e.x, e.y, "Mummy");
				en.hostile = 9999;
				en.faction = "Enemy";
				en.aware = true;

				// If the roomtype is sarcophagus, spawn the sarcophagus
				if (KDGameData.RoomType == "ElevatorEgyptian") {
					en = DialogueCreateEnemy(e.x, e.y + 11, "SarcoKraken");
					en.faction = "Enemy";
					en.maxlifetime = 9999;
					en.lifetime = 9999;
					if (KinkyDungeonTilesGet((e.x) + ',' + (e.y + 11))) {
						KinkyDungeonTilesGet((e.x) + ',' + (e.y + 11)).Skin = "SarcophagusGone";
					}
				} else if (KDGameData.RoomType == "ElevatorEgyptian2") {
					// Otherwise ALL statues in the room become cursed ones
					for (let X = 1; X < KDMapData.GridWidth - 1; X++) {
						for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
							if (KinkyDungeonMapGet(X, Y) == 'X') {
								KinkyDungeonMapSet(X, Y, '3');
								DialogueCreateEnemy(X, Y, "MummyCursed");
							}
						}
					}
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

	"AntiqueShop": KDSaleShop("AntiqueShop", ["Sunglasses", "Snuffer", "SackOfSacks", "Rope"], [], ["blacksmith"], 0.4, 2),
	"BlacksmithShop": KDSaleShop("BlacksmithShop", ["Pick", "Knife", "Sword", "Hammer", "Axe", "Spear", "TrapCuffs"], [], ["blacksmith"], 0.4, 1.5),
	"ArmorerShop": KDSaleShop("ArmorerShop", ["Shield", "Breastplate", "Bracers", "Gauntlets", "SteelBoots", "ChainTunic", "ChainBikini", "TrapBelt", "TrapBra"], [], ["blacksmith"], 0.4, 2.0),
	"BowyerShop": KDSaleShop("BowyerShop", ["AncientPowerSource", "Bow", "BowRecurve", "Crossbow", "CrossbowPistol", "Bustier", "LeatherGloves", "LeatherBoots", "TrapBlindfold"], [], ["blacksmith"], 0.4, 1.5),
	"ShadyShop": KDSaleShop("ShadyShop",
		["RopeSnakeRaw", "VinylTapeRaw", "Stuffing", "ClothGag", "ClothGag2", "ClothGag3", "ClothGagOver"], [], ["blacksmith"], 0.4, 5, ["SmokeBomb"], 10),
	"PrisonerBandit": {
		response: "Default",
		personalities: ["Sub"],
		clickFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
					if (KDDialogueEnemy()) {
						let e = KDDialogueEnemy();
						KDRemoveEntity(KDDialogueEnemy(), false);
						let created = DialogueCreateEnemy(e.x, e.y, "Bandit");
						created.allied = 9999;
						created.personality = e.personality;
						if (KDFactionRelation("Player", "Bandit") < -0.5) {
							for (let enemy of KDMapData.Entities) {
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
		clickFunction: (_gagged, _player) => {
			let e = KDDialogueEnemy();
			if (e && !KDEnemyHasFlag(e, "LockJammed")) {
				KDGameData.CurrentDialogMsgData = {};
				KDGameData.CurrentDialogMsgValue = {};
				let bonus = KinkyDungeonGetPickBonus();
				KDGameData.CurrentDialogMsgValue.JamPercent = 1/Math.max(1, (2 + ((bonus > 0) ? 5*bonus : 2*bonus)));
				if (KinkyDungeonFlags.get("LockJamPity")) KDGameData.CurrentDialogMsgValue.JamPercent /= 2;
				KDGameData.CurrentDialogMsgData.JAMPERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.JamPercent)}%`;
			} else {
				KDGameData.CurrentDialogStage = "Jammed";
				KDGameData.CurrentDialogMsg = "PrisonerJailJammed";
			}

			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Jammed": {
				prerequisiteFunction: (_gagged, _player) => {
					return false;
				},
				playertext: "Default", response: "Default",
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"JammedRecent": {
				prerequisiteFunction: (_gagged, _player) => {
					return false;
				},
				playertext: "Default", response: "Default",
				options: {
					"Apologize": {
						clickFunction: (_gagged, _player) => {
							KinkyDungeonChangeRep("Ghost", 5);
							return false;
						},
						playertext: "Default", response: "Default",
						gagDisabled: true,
						exitDialogue: true,
					},
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			},
			"Unlock": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, player) => {
					if (KinkyDungeonItemCount("RedKey") > 0) {
						if (KinkyDungeonCanUseKey() || !KinkyDungeonIsArmsBound()) {
							if (KDDialogueEnemy()) {
								let e = KDDialogueEnemy();
								KDFreeNPC(e);
								e.allied = 9999;
								e.specialdialogue = undefined;
								KDAggroMapFaction();
								let faction = e.Enemy.faction ? e.Enemy.faction : "Enemy";
								e.faction = "Player";
								KinkyDungeonSetEnemyFlag(e, "NoFollow", 0);
								KinkyDungeonSetEnemyFlag(e, "Defensive", -1);
								if (!KinkyDungeonHiddenFactions.has(faction) && !(KDMapData.MapFaction == faction)) {
									if (KDFactionRelation("Player", faction) < 0.25)
										KinkyDungeonChangeFactionRep(faction, 0.03);
									else
										KinkyDungeonChangeFactionRep(faction, 0.015);
								}
								KDAddConsumable("RedKey", -1);
								if (KinkyDungeonIsHandsBound(false, true, 0.2)) {
									DialogueBringNearbyEnemy(player.x, player.y, 8, true);
									KDGameData.CurrentDialogMsg = "PrisonerJailUnlockSlow";
								} else {
									KDGameData.CurrentDialogMsg = "PrisonerJailUnlock";
									if (e.Enemy.tags.gagged) {
										KDGameData.CurrentDialogMsg = KDGameData.CurrentDialogMsg + "Gagged";
									}
								}
								KDAddToParty(e);
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
				clickFunction: (_gagged, player) => {
					if (KinkyDungeonItemCount("Pick") > 0) {
						if (!KinkyDungeonIsHandsBound(false, true, 0.45)) {
							if (KDDialogueEnemy()) {
								if (KDRandom() < KDGameData.CurrentDialogMsgValue.JamPercent && KDDialogueEnemy() && !KDEnemyHasFlag(KDDialogueEnemy(), "nojam")) {
									let e = KDDialogueEnemy();
									KinkyDungeonSetEnemyFlag(e, "LockJammed", -1);
									KDGameData.CurrentDialogStage = "JammedRecent";
									KDGameData.CurrentDialogMsg = "PrisonerJailPickJam";
									KinkyDungeonSetFlag("LockJamPity", -1);
								} else {
									KinkyDungeonSetFlag("LockJamPity", 0);
									let e = KDDialogueEnemy();
									KDFreeNPC(e);
									e.allied = 9999;
									e.specialdialogue = undefined;
									KDAggroMapFaction();

									let faction = e.Enemy.faction ? e.Enemy.faction : "Enemy";
									e.faction = "Player";
									KinkyDungeonSetEnemyFlag(e, "NoFollow", 0);
									KinkyDungeonSetEnemyFlag(e, "Defensive", -1);
									if (!KinkyDungeonHiddenFactions.has(faction) && !(KDMapData.MapFaction == faction)) {
										if (KDFactionRelation("Player", faction) < 0.25)
											KinkyDungeonChangeFactionRep(faction, 0.03);
										else
											KinkyDungeonChangeFactionRep(faction, 0.015);
									}
									KDGameData.CurrentDialogMsg = "PrisonerJailPick";
									if (e.Enemy.tags.gagged) {
										KDGameData.CurrentDialogMsg = KDGameData.CurrentDialogMsg + "Gagged";
									}
									DialogueBringNearbyEnemy(player.x, player.y, 8, true);
									KDAddToParty(e);
								}

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
	"PrisonerJailOwn": { // For prisoners in the prison level. Doesnt increase rep much, but useful for jailbreak purposes
		response: "Default",
		clickFunction: (_gagged, _player) => {
			let e = KDDialogueEnemy();
			if (e) {
				KDGameData.CurrentDialogMsgData = {};
				KDGameData.CurrentDialogMsgValue = {};
			}

			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
			"Unlock": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, player) => {
					if (KinkyDungeonItemCount("RedKey") > 0) {
						if (KinkyDungeonCanUseKey() || !KinkyDungeonIsArmsBound()) {
							if (KDDialogueEnemy()) {
								let e = KDDialogueEnemy();
								KDFreeNPC(e);
								e.specialdialogue = undefined;
								if (KinkyDungeonIsHandsBound(false, true, 0.2)) {
									DialogueBringNearbyEnemy(player.x, player.y, 8, true);
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
			"Flip": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					if (KDDialogueEnemy()) {
						let e = KDDialogueEnemy();

						e.flip = !e.flip;
						KinkyDungeonSetEnemyFlag(e, "blush", 2);
						KDUpdatePersistentNPC(e.id);
						if (KDNPCChar.get(e.id))
							KDRefreshCharacter.set(KDNPCChar.get(e.id), true);

						KDGameData.CurrentDialogStage = "";
						KDGameData.CurrentDialogMsg = "PrisonerJailOwnFlip";
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
			"Reclaim": {
				playertext: "Default", response: "Default",
				prerequisiteFunction: (_gagged, _player) => {
					if (KDDialogueEnemy()) {
						let e = KDDialogueEnemy();

						return (KDIsImprisoned(e) && KDGameData.Collection[e.id + ""] != undefined);

					}
					return false;
				},
				clickFunction: (_gagged, _player) => {
					if (KDDialogueEnemy()) {
						let e = KDDialogueEnemy();

						if (KDIsImprisoned(e) && KDGameData.Collection[e.id + ""] != undefined) {
							KDRemoveEntity(e, false, false, true);
							delete KDGameData.Collection[e.id + ""].escaped;
							delete KDGameData.Collection[e.id + ""].spawned;
							if (KDGetNPCRestraints(e.id)?.Device) {
								KDSetNPCRestraint(e.id, "Device", null);
							}
							KDSetIDFlag(e.id, "escapegrace", 0);
							if (KDIsNPCPersistent(e.id) && KDGetPersistentNPC(e.id)) {
								KDGetPersistentNPC(e.id).collect = true;
								KDGetPersistentNPC(e.id).captured = false;
								KDGetPersistentNPC(e.id).room = "Summit";
							}
							KinkyDungeonAdvanceTime(1);
						}

					}

					return false;
				},
				exitDialogue: true,
			},
			"Pick": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, player) => {
					if (KinkyDungeonItemCount("Pick") > 0) {
						if (!KinkyDungeonIsHandsBound(false, true, 0.45)) {
							if (KDDialogueEnemy()) {
								if (KDDialogueEnemy()) {
									let e = KDDialogueEnemy();
									KDFreeNPC(e);
									e.specialdialogue = undefined;
									KDGameData.CurrentDialogMsg = "PrisonerJailPick";
									if (e.Enemy.tags.gagged) {
										KDGameData.CurrentDialogMsg = KDGameData.CurrentDialogMsg + "Gagged";
									}
									DialogueBringNearbyEnemy(player.x, player.y, 8, true);
								}

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
		clickFunction: (_gagged, _player) => {
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
															"Question3": {
																playertext: "Default", response: "Default",
																prerequisiteFunction: (_gagged, _player) => {
																	return KDUnlockedPerks.includes("StartCyberDoll");
																},
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
																	"Proceed": {
																		playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
																		leadsToStage: "PostIntro",
																	}
																}
															},
															"Question4": {
																playertext: "Default", response: "Default",
																options: {
																	"Proceed": {
																		playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
																		leadsToStage: "PostIntro",
																	}
																}
															},
															"Question5": {
																playertext: "Default", response: "Default",
																options: {
																	"Proceed": {
																		playertext: "Default", response: "Default",
																		leadsToStage: "PostIntro",
																		dontTouchText: true,
																	}
																}
															},
															"Proceed": {
																playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
																leadsToStage: "PostIntro",
															}
														}
													},
													"Question2": {
														playertext: "Default", response: "Default",
														leadsToStage: "Defensive_Question_Question_Question_Question_Question",
														dontTouchText: true,
													},
													"Proceed": {
														playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
														leadsToStage: "PostIntro",
													}
												}
											},
											"Question2": {
												playertext: "Default", response: "Default",
												leadsToStage: "Defensive_Question_Question_Question_Question",
												dontTouchText: true,
											},
											"Question3": {
												playertext: "Default", response: "Default",
												leadsToStage: "Defensive_Question_Question_Question_Question",
												dontTouchText: true,
											},
											"Proceed": {
												playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
												leadsToStage: "PostIntro",
											}
										}
									},
									"Question2": {
										playertext: "Default", response: "Default",
										leadsToStage: "Defensive_Question_Question_Question",
										dontTouchText: true,
									},
									"Proceed": {
										playertext: "FuukaDefensive_Question_Question_Proceed", response: "Default",
										leadsToStage: "PostIntro",
									}
								}
							},
							"Question2": {
								playertext: "Default", response: "Default",
								leadsToStage: "Defensive_Question_Question_Question",
								dontTouchText: true,
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
				clickFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
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
				prerequisiteFunction: (_gagged, _player) => {return false;},
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
						clickFunction: (_gagged, _player) => {
							KinkyDungeonChangeRep("Ghost", -2);
							return false;
						}
					},
					"Sub": {gag: true,
						playertext: "Default", response: "FuukaPostIntro_Sub",
						leadsToStage: "Fight",
						clickFunction: (_gagged, _player) => {
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
				prerequisiteFunction: (_gagged, _player) => {return false;},
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
	"TheWarden": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				enemy.hostile = 9999;
				enemy.aware = true;
				enemy.vp = 2;
				enemy.AI = 'hunt';
				KinkyDungeonSetFlag("BossDialogueTheWarden", -1, 1);
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
									"Question": {gagDisabled: true,
										playertext: "Default", response: "Default",
										options: {
											"Proceed": {
												playertext: "Default", response: "Default",
												leadsToStage: "PostIntro",
											},
										}
									},
									"Question2": {gagDisabled: true,
										playertext: "Default", response: "Default",
										options: {
											"Proceed": {
												playertext: "Default", response: "Default",
												leadsToStage: "PostIntro",
											},
										}
									},
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
																		playertext: "TheWardenDefensive_Question_Question_Proceed", response: "Default",
																		leadsToStage: "PostIntro",
																	}
																}
															},
															"Question2": {
																playertext: "Default", response: "Default",
																options: {
																	"Proceed": {
																		playertext: "TheWardenDefensive_Question_Question_Proceed", response: "Default",
																		leadsToStage: "PostIntro",
																	}
																}
															},
															"Question3": {
																playertext: "Default", response: "Default",
																prerequisiteFunction: (_gagged, _player) => {
																	return KDUnlockedPerks.includes("StartCyberDoll");
																},
																options: {
																	"Question": {
																		playertext: "Default", response: "Default",
																		options: {
																			"Proceed": {
																				playertext: "TheWardenDefensive_Question_Question_Proceed", response: "Default",
																				leadsToStage: "PostIntro",
																			}
																		}
																	},
																	"Question2": {
																		playertext: "Default", response: "Default",
																		options: {
																			"Proceed": {
																				playertext: "TheWardenDefensive_Question_Question_Proceed", response: "Default",
																				leadsToStage: "PostIntro",
																			}
																		}
																	},
																	"Question3": {
																		playertext: "Default", response: "Default",
																		options: {
																			"Proceed": {
																				playertext: "Default", response: "Default",
																				leadsToStage: "PostIntro",
																				dontTouchText: true,
																			}
																		}
																	},
																	"Proceed": {
																		playertext: "TheWardenDefensive_Question_Question_Proceed", response: "Default",
																		leadsToStage: "PostIntro",
																	}
																}
															},
															"Proceed": {
																playertext: "TheWardenDefensive_Question_Question_Proceed", response: "Default",
																leadsToStage: "PostIntro",
															}
														}
													},
													"Question2": {
														playertext: "Default", response: "Default",
														leadsToStage: "Defensive_Question_Question_Question_Question_Question",
														dontTouchText: true,
													},
													"Proceed": {
														playertext: "TheWardenDefensive_Question_Question_Proceed", response: "Default",
														leadsToStage: "PostIntro",
													}
												}
											},
											"Question2": {
												playertext: "Default", response: "Default",
												leadsToStage: "Defensive_Question_Question_Question_Question",
												dontTouchText: true,
											},
											"Question3": {
												playertext: "Default", response: "Default",
												leadsToStage: "Defensive_Question_Question_Question_Question",
												dontTouchText: true,
											},
											"Proceed": {
												playertext: "TheWardenDefensive_Question_Question_Proceed", response: "Default",
												leadsToStage: "PostIntro",
											}
										}
									},
									"Question2": {
										playertext: "Default", response: "Default",
										leadsToStage: "Defensive_Question_Question_Question",
										dontTouchText: true,
									},
									"Proceed": {
										playertext: "TheWardenDefensive_Question_Question_Proceed", response: "Default",
										leadsToStage: "PostIntro",
									}
								}
							},
							"Question2": {
								playertext: "Default", response: "Default",
								leadsToStage: "Defensive_Question_Question_Question",
								dontTouchText: true,
							},
							"Proceed": {
								playertext: "TheWardenDefensive_Question_Question_Proceed", response: "Default",
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
						clickFunction: (_gagged, _player) => {
							if (KinkyDungeonPlayerTags.get("Collars")) {
								KDGameData.CurrentDialogMsg = "TheWardenBrat_Question_Collar";
							}
							return false;
						},
						options: {
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
				clickFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
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
				prerequisiteFunction: (_gagged, _player) => {return false;},
				playertext: "Default", response: "Default",
				options: {
					"Zombie": {
						gagDisabled: true,
						playertext: "Default", response: "Default",
						leadsToStage: "Defensive_Question",
					},
					"Brat": {gag: true,
						playertext: "Default", response: "TheWardenPostIntro_Brat",
						leadsToStage: "Fight",
					},
					"Dom": {gag: true,
						playertext: "Default", response: "TheWardenPostIntro_Dom",
						leadsToStage: "Fight",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonChangeRep("Ghost", -2);
							return false;
						}
					},
					"Sub": {gag: true,
						playertext: "Default", response: "TheWardenPostIntro_Sub",
						leadsToStage: "Fight",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonChangeRep("Ghost", 2);
							return false;
						}
					},
					"Normal": {gag: true,
						playertext: "Default", response: "TheWardenPostIntro_Normal",
						leadsToStage: "Fight",
					},
				}
			},
			"Fight": {
				prerequisiteFunction: (_gagged, _player) => {return false;},
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
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				enemy.hostile = 9999;
				enemy.aware = true;
				enemy.vp = 2;
				enemy.AI = 'hunt';
				KinkyDungeonSetFlag("BossDialogueDollmaker", -1, 1);
			}
			KDUnlockPerk("StartCyberDollStorage");
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
						prerequisiteFunction: (_gagged, _player) => {
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
						prerequisiteFunction: (_gagged, _player) => {
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
				prerequisiteFunction: (_gagged, _player) => {return false;},
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
	"DollmakerStage2": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			let point = KinkyDungeonGetNearbyPoint(KDMapData.StartPosition.x + 10, KDMapData.StartPosition.y - 5, true,undefined, true, true);
			if (!point) {
				point = {x: KDMapData.StartPosition.x + 10, y: KDMapData.StartPosition.y - 5};
			}
			let e = DialogueCreateEnemy(point.x, point.y, "DollmakerBoss2");
			e.Enemy = JSON.parse(JSON.stringify(e.Enemy));
			if (KinkyDungeonStatsChoice.get("extremeMode")) e.Enemy.maxhp *= 4;
			else if (KinkyDungeonStatsChoice.get("hardMode")) e.Enemy.maxhp *= 2;
			e.hp = e.Enemy.maxhp;
			e.hostile = 300;
			e.modified = true;
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"DollmakerStage3": {
		response: "Default",
		clickFunction: (_gagged, player) => {
			// Remove the doors
			for (let en of KDMapData.Entities) {
				if (en.Enemy.tags.dolldoor) en.hp = 0;
			}
			let point = KinkyDungeonGetNearbyPoint(player.x, player.y, true);
			if (!point) {
				point = KinkyDungeonGetRandomEnemyPoint(false, false, null);
			}
			let e = DialogueCreateEnemy(point.x, point.y, "DollmakerBoss3");
			e.Enemy = JSON.parse(JSON.stringify(e.Enemy));
			if (KinkyDungeonStatsChoice.get("extremeMode")) e.Enemy.maxhp *= 4;
			else if (KinkyDungeonStatsChoice.get("hardMode")) e.Enemy.maxhp *= 2;
			e.hp = e.Enemy.maxhp;
			e.hostile = 300;
			e.modified = true;
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"DollmakerWin": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("BossUnlocked", -1);
			KinkyDungeonSetFlag("SpawnMap", -1);
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				clickFunction: (_gagged, _player) => {
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("DollmakerVisor");
						KDUnlockPerk("DollmakerMask");
						KDUnlockPerk("StartCyberDoll");
						KDUnlockPerk("CommonCyber");
					}
					return false;
				},
				exitDialogue: true,
			},
			"Accept": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerVisor"), 0, true);
					KinkyDungeonAddGold(1000);
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("DollmakerVisor");
						KDUnlockPerk("DollmakerMask");
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
				clickFunction: (_gagged, _player) => {
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerMask"), 0, true);
					KinkyDungeonAddGold(1000);
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("DollmakerVisor");
						KDUnlockPerk("DollmakerMask");
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
				clickFunction: (_gagged, _player) => {
					KinkyDungeonChangeRep("Ghost", -5);
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("DollmakerVisor");
						KDUnlockPerk("DollmakerMask");
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
	"DollmakerLose": {
		response: "Default",
		clickFunction: (_gagged, _player) => {
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
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerVisor"), 0, true);
							return false;
						},
					},
					"Continue2": {
						playertext: "DollmakerLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerMask"), 0, true);
							return false;
						},
					},
					"Continue3": {
						playertext: "DollmakerLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
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
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerVisor"), 0, true);
							return false;
						},
					},
					"Continue2": {
						playertext: "DollmakerLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("DollmakerMask"), 0, true);
							return false;
						},
					},
					"Continue3": {
						playertext: "DollmakerLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDRandom() < 0.5 ? "DollmakerVisor" : "DollmakerMask"), 0, true);
							return false;
						},
					},
				}
			},
			"Finish": {
				prerequisiteFunction: (_gagged, _player) => {return false;},
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
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				enemy.hostile = 0;
				enemy.ceasefire = 4;
				KinkyDungeonSetFlag("BossUnlocked", -1);
				KinkyDungeonRemoveBuffsWithTag(KinkyDungeonPlayerEntity, ["removeDefeat"]);
			}
			return false;
		},
		options: {
			"Magic": { gagDisabled: true,
				playertext: "Default", response: "Default",
				options: {
					"Continue1": {
						playertext: "FuukaLose_Continue1", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue2": {
						playertext: "FuukaLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue3": {
						playertext: "FuukaLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
				}
			},
			"Accept": { gag: true,
				playertext: "Default", response: "Default",
				options: {
					"Continue1": {
						playertext: "FuukaLose_Continue1", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue2": {
						playertext: "FuukaLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue3": {
						playertext: "FuukaLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
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
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue2": {
						playertext: "FuukaLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
					"Continue3": {
						playertext: "FuukaLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true);
							return false;
						},
					},
				}
			},
			"Finish": {
				prerequisiteFunction: (_gagged, _player) => {return false;},
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
	"DragonQueenCrystal": { // Player defeats fuuka's first form
		response: "Default",
		clickFunction: (_gagged, player) => {
			let point = KinkyDungeonGetNearbyPoint(player.x, player.y, true, undefined, true);
			if (!point) {
				point = KinkyDungeonGetRandomEnemyPoint(false, false, null);
			}
			let e = DialogueCreateEnemy(point.x, point.y, "DragonGirlCrystal");
			e.Enemy = JSON.parse(JSON.stringify(e.Enemy));
			if (KinkyDungeonStatsChoice.get("extremeMode")) e.Enemy.maxhp *= 4;
			else if (KinkyDungeonStatsChoice.get("hardMode")) e.Enemy.maxhp *= 2;
			e.hp = e.Enemy.maxhp;
			e.modified = true;
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"FuukaStage2": { // Player defeats fuuka's first form
		response: "Default",
		clickFunction: (_gagged, player) => {
			let point = KinkyDungeonGetNearbyPoint(player.x, player.y, true);
			if (!point) {
				point = KinkyDungeonGetRandomEnemyPoint(false, false, null);
			}
			let e = DialogueCreateEnemy(point.x, point.y, "Fuuka2");
			e.Enemy = JSON.parse(JSON.stringify(e.Enemy));
			if (KinkyDungeonStatsChoice.get("extremeMode")) e.Enemy.maxhp *= 4;
			else if (KinkyDungeonStatsChoice.get("hardMode")) e.Enemy.maxhp *= 2;
			e.hp = e.Enemy.maxhp;
			e.hostile = 300;
			e.modified = true;
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
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("BossUnlocked", -1);
			KinkyDungeonSetFlag("SpawnMap", -1);
			if (KinkyDungeonPlayerBuffs?.FuukaOrb) KinkyDungeonPlayerBuffs.FuukaOrb.duration = 0;
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				clickFunction: (_gagged, _player) => {
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
				clickFunction: (_gagged, _player) => {
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar2"), 0, true);
					//KinkyDungeonAddGold(1000);
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
				clickFunction: (_gagged, _player) => {
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


	"TheWardenLose": { // Player loses to TheWarden
		response: "Default",
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				enemy.hostile = 0;
				enemy.ceasefire = 4;
				KinkyDungeonSetFlag("BossUnlocked", -1);
				KinkyDungeonRemoveBuffsWithTag(KinkyDungeonPlayerEntity, ["removeDefeat"]);
			}
			return false;
		},
		options: {
			"Magic": { gagDisabled: true,
				playertext: "Default", response: "Default",
				options: {
					"Continue1": {
						playertext: "TheWardenLose_Continue1", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WardenBelt"), 0, true);
							KinkyDungeonChangeRep("Prisoner", -100);
							return false;
						},
					},
					"Continue2": {
						playertext: "TheWardenLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WardenBelt"), 0, true);
							KinkyDungeonChangeRep("Prisoner", -100);
							return false;
						},
					},
					"Continue3": {
						playertext: "TheWardenLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WardenBelt"), 0, true);
							KinkyDungeonChangeRep("Prisoner", -100);
							return false;
						},
					},
				}
			},
			"Accept": { gag: true,
				playertext: "Default", response: "Default",
				options: {
					"Continue1": {
						playertext: "TheWardenLose_Continue1", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WardenBelt"), 0, true);
							KinkyDungeonChangeRep("Prisoner", -100);
							return false;
						},
					},
					"Continue2": {
						playertext: "TheWardenLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WardenBelt"), 0, true);
							KinkyDungeonChangeRep("Prisoner", -100);
							return false;
						},
					},
					"Continue3": {
						playertext: "TheWardenLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WardenBelt"), 0, true);
							KinkyDungeonChangeRep("Prisoner", -100);
							return false;
						},
					},
				}
			},
			"Deny": { gag: true,
				playertext: "Default", response: "Default",
				options: {
					"Continue1": {
						playertext: "TheWardenLose_Continue1", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WardenBelt"), 0, true);
							KinkyDungeonChangeRep("Prisoner", -100);
							return false;
						},
					},
					"Continue2": {
						playertext: "TheWardenLose_Continue2", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WardenBelt"), 0, true);
							KinkyDungeonChangeRep("Prisoner", -100);
							return false;
						},
					},
					"Continue3": {
						playertext: "TheWardenLose_Continue3", response: "Default",
						leadsToStage: "Finish",
						clickFunction: (_gagged, _player) => {
							KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WardenBelt"), 0, true);
							KinkyDungeonChangeRep("Prisoner", -100);
							return false;
						},
					},
				}
			},
			"Finish": {
				prerequisiteFunction: (_gagged, _player) => {return false;},
				playertext: "Default", response: "TheWardenLoseFinish",
				options: {
					"Leave": {
						playertext: "Leave", response: "Default",
						exitDialogue: true,
					},
				}
			}
		}
	},
	"TheWardenStage2": { // Player defeats thewarden's first form
		response: "Default",
		clickFunction: (_gagged, player) => {
			let point = KinkyDungeonGetNearbyPoint(player.x, player.y, true);
			if (!point) {
				point = KinkyDungeonGetRandomEnemyPoint(false, false, null);
			}
			let e = DialogueCreateEnemy(point.x, point.y, "TheWarden2");
			e.Enemy = JSON.parse(JSON.stringify(e.Enemy));
			if (KinkyDungeonStatsChoice.get("extremeMode")) e.Enemy.maxhp *= 4;
			else if (KinkyDungeonStatsChoice.get("hardMode")) e.Enemy.maxhp *= 2;
			e.hp = e.Enemy.maxhp;
			e.hostile = 300;
			e.modified = true;
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	},
	"TheWardenWin": { // Player beats TheWarden
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("BossUnlocked", -1);
			KinkyDungeonSetFlag("SpawnMap", -1);
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				clickFunction: (_gagged, _player) => {
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("WardenBelt");
						KDUnlockPerk("CommonWarden");
					}
					return false;
				},
				exitDialogue: true,
			},
			"Accept": {
				playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WardenBelt2"), 0, true);
					KinkyDungeonAddGold(1000);
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("WardenBelt");
						KDUnlockPerk("CommonWarden");
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
				clickFunction: (_gagged, _player) => {
					KinkyDungeonChangeRep("Ghost", -5);
					if (KinkyDungeonIsPlayer()) {
						KDUnlockPerk("WardenBelt");
						KDUnlockPerk("CommonWarden");
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
	"ShopBuy": KDShopBuyDialogue("ShopBuy"),
	"PotionSell": KDShopDialogue("PotionSell", ["PotionFrigid", "PotionStamina", "PotionMana", "PotionInvisibility"], [], ["witch", "apprentice", "alchemist", "human", "dragon"], 0.2,
		["PotionWill", "PotionFrigid"]),
	"ElfCrystalSell": KDShopDialogue("ElfCrystalSell", ["PotionMana", "ManaOrb", "ElfCrystal", "EarthRune", "WaterRune", "IceRune"], [], ["elf"], 0.25,
		["ElfCrystal"]),
	"ScrollSell": KDShopDialogue("ScrollSell", ["ScrollArms", "ScrollVerbal", "ScrollLegs", "ScrollPurity"], [], ["witch", "apprentice", "elf", "wizard", "dressmaker"], 0.15,
		["ScrollArms", "ScrollVerbal", "ScrollLegs"]),
	"WolfgirlSell": KDShopDialogue("WolfgirlSell", ["MistressKey", "ManaOrb", "AncientPowerSource", "AncientPowerSourceSpent", "EnchantedGrinder"], [], ["trainer", "alchemist", "human"], 0.2,
		["AncientPowerSource", "AncientPowerSourceSpent", "AncientPowerSourceSpent"]),
	"NinjaSell": KDShopDialogue("NinjaSell", ["SmokeBomb", "FlashBomb", "Flashbang", "Bola", "Bomb", "PotionInvisibility"], [], ["ninja", "bountyhunter"], 0.2,
		["SmokeBomb", "Bola", "Bomb"]),
	"BombSell": KDShopDialogue("BombSell", ["SmokeBomb", "FlashBomb", "Flashbang", "Gunpowder", "Bomb"], [], ["miner", "bandit", "gun", "alchemist"], 0.4,
		["Bomb", "Bomb", "Bomb"]),
	"CookieSell": KDShopDialogue("CookieSell", ["Cookie", "Brownies", "Donut", "CookieJailer", "DivineTear"], [], ["human"], 0.14,
		["Cookie", "Brownies", "Donut"]),
	"ThiefSell": KDShopDialogue("ThiefSell", ["DiscPick", "CuffKeys", "Snuffer", "Bomb", "FlashBomb", "Flashbang", "SmokeBomb"], [], ["human"], 0.1,
		["DiscPick", "CuffKeys"]),
	"GunSell": KDShopDialogue("GunSell", ["Blaster", "EscortDrone", "Gunpowder", "CrossbowHeavy", "CrossbowPistol", "Crossbow"], [], ["maid", "bandit", "gun", "bountyhunter"], 0.33,
		["CrossbowPistol", "Gunpowder"]),
	"GhostSell": KDShopDialogue("GhostSell", ["Ectoplasm", "PotionInvisibility", "ElfCrystal"], [], ["alchemist", "witch", "apprentice", "dressmaker", "dragon"], 0.1,
		["Ectoplasm", "Ectoplasm", "Ectoplasm"]),
	"DressSell": KDShopDialogue("DressSell", ["BindingDress", "MikoDress", "DressGag", "DressBra"], [], ["dressmaker"], 0.5,
		["BindingDress", "DressBra", "DressGag"]),
	// TODO magic book dialogue in which you can read forward and there are traps
	"GenericAlly": KDAllyDialogue("GenericAlly", [], [], [], 1),
};


