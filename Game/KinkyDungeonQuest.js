"use strict";

let QuestCompleteWeight = 1000;
let KDDefaultGoddessQuestRep = 5;

/**
 * @type {Record<string, KDQuest>}
 */
let KDQuests = {
	"DressmakerQuest": {
		name: "DressmakerQuest",
		npc: "DressmakerQuest",
		visible: true,
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				for (let i = 0; i < 3; i++) {
					let point = KinkyDungeonGetRandomEnemyPoint(true);
					if (point) {
						KinkyDungeonSummonEnemy(point.x, point.y, "Dressmaker", 1, 2.9);
					}
				}
			}
		},
		weight: (RoomType, MapMod, data, currentQuestList) => {
			if (RoomType == "Tunnel") {
				let weight = 15;
				if (KinkyDungeonPlayerTags.has("BindingDress")) {
					return weight * QuestCompleteWeight;
				}
				return weight;
			}
			return 0;
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			//if (KinkyDungeonFlags.has("DressmakerQuest") && KinkyDungeonPlayerTags.has("BindingDress")) {
			//return false;
			//}
			if (RoomType == "Tunnel") {
				return true;
			}
			return false;
		}
	},
	"ApprenticeQuest": {
		name: "ApprenticeQuest",
		npc: "ApprenticeQuest",
		visible: true,
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel) && !KinkyDungeonFlags.get("ApprenticeQuestSpawn")) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					KinkyDungeonSummonEnemy(point.x, point.y, "Librarian", 1, 2.9);
				}
				KinkyDungeonSetFlag("ApprenticeQuestSpawn", -1);

			}
		},
		weight: (RoomType, MapMod, data, currentQuestList) => {
			if (RoomType == "Tunnel") {
				let weight = 30;
				if (
					KinkyDungeonInventoryGet("ScrollLegs")
					|| KinkyDungeonInventoryGet("ScrollArms")
					|| KinkyDungeonInventoryGet("ScrollVerbal")
					|| KinkyDungeonInventoryGet("ScrollPurity")
				) {
					return weight * QuestCompleteWeight;
				}
				return weight;
			}
			return 0;
		},
		accept: (data) => {
			KinkyDungeonSetFlag("ApprenticeQuestSpawn", 0);
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			if (KDHasQuest("ApprenticeQuest") && !(KinkyDungeonInventoryGet("ScrollLegs")
				|| KinkyDungeonInventoryGet("ScrollArms")
				|| KinkyDungeonInventoryGet("ScrollVerbal")
				|| KinkyDungeonInventoryGet("ScrollPurity")
			)) {
				return false;
			}
			if (RoomType == "Tunnel") {
				return true;
			}
			return false;
		}
	},
	"DragonheartQuest": {
		name: "DragonheartQuest",
		npc: "DragonheartQuest",
		visible: true,
		weight: (RoomType, MapMod, data, currentQuestList) => {
			if (RoomType == "Tunnel") {
				let weight = 20;
				return weight;
			}
			return 0;
		},
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				if (KinkyDungeonFlags.get("DragonheartQuest")) KDRemoveQuest("DragonheartQuest");
				else {
					let point = KinkyDungeonGetRandomEnemyPoint(true);
					if (point) {
						KinkyDungeonSummonEnemy(point.x, point.y, "DragonLeaderDuelist", 1, 2.9);
					}
				}
				KinkyDungeonSetFlag("DragonheartQuest", -1, 1);

			}
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			if (KDHasQuest("DragonheartQuest")) {
				return false;
			}
			if (KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel + 1)) return false;
			if (RoomType == "Tunnel") {
				return true;
			}
			return false;
		}
	},
	"MaidforceQuest": {
		name: "MaidforceQuest",
		npc: "MaidforceQuest",
		visible: true,
		weight: (RoomType, MapMod, data, currentQuestList) => {
			if (RoomType == "Tunnel") {
				let weight = 20;
				return weight;
			}
			return 0;
		},
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {

				if (KinkyDungeonFlags.get("MaidforceQuest")) KDRemoveQuest("MaidforceQuest");
				else {
					let point = KinkyDungeonGetRandomEnemyPoint(true);
					if (point) {
						let e = KinkyDungeonGetEnemy(["maid", "miniboss"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["maid", "miniboss"], undefined, {"maid": {mult: 4, bonus: 10}});
						if (e) {
							let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
							if (epoint) {
								let ee = DialogueCreateEnemy(point.x, point.y, e.name);
								if (ee) {
									ee.faction = "Delinquent";
									ee.factionrep = {"Maidforce": 0.01};
									if (KDCanOverrideAI(ee))
										ee.AI = "looseguard";
									else ee.AI = KDGetAIOverride(ee, 'looseguard');
								}
							}
						}
						let count = 3 + KDRandom() * Math.min(4, KinkyDungeonDifficulty / 20);
						for (let i = 0; i < count; i++) {
							e = KinkyDungeonGetEnemy(["maid"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["maid"], undefined, {"maid": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
							let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
							if (epoint) {
								let ee = DialogueCreateEnemy(point.x, point.y, e.name);
								if (ee) {
									ee.faction = "Delinquent";
									ee.factionrep = {"Maidforce": 0.0025};
									if (KDCanOverrideAI(ee))
										ee.AI = "looseguard";
									else ee.AI = KDGetAIOverride(ee, 'looseguard');
								}
							}
						}
					}
				}
				KinkyDungeonSetFlag("MaidforceQuest", -1, 1);
			}
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			if (KDHasQuest("MaidforceQuest")) {
				return false;
			}
			if (KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel + 1)) return false;
			if (RoomType == "Tunnel") {
				return true;
			}
			return false;
		}
	},
	"WolfgirlHunters": {
		name: "WolfgirlHunters",
		npc: "Wolfgirl",
		visible: true,
		weight: (RoomType, MapMod, data, currentQuestList) => {
			return 0;
		},
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					let e = KinkyDungeonGetEnemy(["wolfgirl", "miniboss"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["wolfgirl", "miniboss"], undefined, {"wolfgirl": {mult: 4, bonus: 10}});
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								ee.faction = "Wolfhunter";
								ee.AI = "patrol";
							}
						}
					}
					let count = 3 + KDRandom() * Math.min(4, KinkyDungeonDifficulty / 20);
					for (let i = 0; i < count; i++) {
						e = KinkyDungeonGetEnemy(["nevermere"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["nevermere"], undefined, {"wolfgirl": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								ee.faction = "Wolfhunter";
								ee.AI = "patrol";
							}
						}
					}
				}
			}
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			return false;
		}
	},
	"BanditQuest": {
		name: "BanditQuest",
		npc: "BanditQuest",
		visible: true,
		nocancel: true,
		weight: (RoomType, MapMod, data, currentQuestList) => {
			if (RoomType == "Tunnel") {
				let weight = 20;
				return weight;
			}
			return 0;
		},
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				if (KinkyDungeonFlags.get("BanditPrisoner")) KDRemoveQuest("BanditPrisoner");
				else {
					let point = KinkyDungeonGetRandomEnemyPoint(true);
					if (point) {
						point = KinkyDungeonNearestJailPoint(point.x, point.y);
						if (point) {
							KinkyDungeonSummonEnemy(point.x, point.y, "PrisonerBandit", 1, 1.5);
						}
					}
				}
				KinkyDungeonSetFlag("BanditPrisoner", -1, 1);
			}
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			if (KDHasQuest("BanditPrisoner")) {
				return false;
			}
			if (KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel + 1)) return false;
			if (RoomType == "Tunnel") {
				return true;
			}
			return false;
		}
	},
	"BlacksmithQuest": {
		name: "BlacksmithQuest",
		npc: "BlacksmithQuest",
		visible: false,
		weight: (RoomType, MapMod, data, currentQuestList) => {
			return 100;
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			if (RoomType == "Tunnel") {
				return true;
			}
			return false;
		}
	},
	"RopeQuest": {
		name: "RopeQuest",
		npc: "RopeKraken",
		visible: true,
		nocancel: true,
		accept: () => {
			KDSetQuestData("RopeQuest", {
				QuestLocation: KDCurrentWorldSlot,
				QuestRoom: KDMapData.RoomType,
			});
			KinkyDungeonSetFlag("RopeQuest", -1, -1);
			let point = KinkyDungeonGetRandomEnemyPoint(true);
			if (point) {
				let e = KinkyDungeonSummonEnemy(point.x, point.y, "RopeKraken", Math.max(1, Math.min(6, Math.round(KDGetEffLevel()/6))), 2.9);
				for (let enemy of e) {
					KinkyDungeonSetEnemyFlag(enemy, "RopeQuest", -1);
					enemy.gxx = point.x;
					enemy.gyy = point.y;
					enemy.AI = "looseguard";
				}
			}
		},
		worldgenstart: () => {
			KDRemoveQuest("RopeQuest");
			KinkyDungeonChangeRep("Rope", -KDDefaultGoddessQuestRep);
			KinkyDungeonSendTextMessage(10, TextGet("KDQuestFail_" + "RopeQuest"), "#ffffff", 1);
			KDPlayerEffectRestrain(undefined, 2 + Math.round(KDGetEffLevel()/2), ["ropeMagicStrong"], "Goddess", false, true, false, false);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Evil" + ".ogg");
		},
		tick: (delta) => {
			if (!(KDGetQuestData("RopeQuest").QuestRoom == KDMapData.RoomType)
				|| !(KDGetQuestData("RopeQuest").QuestLocation?.x == KDCurrentWorldSlot.x)
				|| !(KDGetQuestData("RopeQuest").QuestLocation?.y == KDCurrentWorldSlot.y)) return;
			if (delta > 0 && KinkyDungeonFlags.get("RopeQuest")) {
				for (let enemy of KDMapData.Entities) {
					if (KDEnemyHasFlag(enemy, "RopeQuest")) {
						return;
					}
				}
				for (let i = 0 ; i < 3; i++) {
					KinkyDungeonLoot(KDGetEffLevel(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], "RopeQuest");
				}
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");
				KinkyDungeonChangeRep("Rope", KDDefaultGoddessQuestRep);
				KinkyDungeonSendTextMessage(10, TextGet("KDQuestSucceed_" + "RopeQuest"), "#ffffff", 1);
				KDRemoveQuest("RopeQuest");
			}
		},
		weight: (RoomType, MapMod, data, currentQuestList) => {
			return 10;
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			return false;
		},
		tags: ["Rope"],
	},
	"LatexQuest": {
		name: "LatexQuest",
		npc: "PinkAlchemist",
		visible: true,
		nocancel: true,
		accept: () => {
			KDSetQuestData("LatexQuest", {
				QuestLocation: KDCurrentWorldSlot,
				QuestRoom: KDMapData.RoomType,
			});
			KinkyDungeonSetFlag("LatexQuest", -1, -1);
			let point = KinkyDungeonGetRandomEnemyPoint(true);
			if (point) {
				let ens = KinkyDungeonSummonEnemy(point.x, point.y, "LatexCube", Math.max(1, Math.min(3, Math.round(KDGetEffLevel()/6))), 2.9);
				for (let enemy of ens) {
					//KinkyDungeonSetEnemyFlag(enemy, "LatexQuest", -1);
					enemy.AI = "guard";
				}

				let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["alchemist", "pink", "miniboss"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["pink", "miniboss"], undefined, {"alchemist": {mult: 4, bonus: 10}});
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								KinkyDungeonSetEnemyFlag(ee, "LatexQuest", -1);
								ee.faction = "Latex";
								if (KDCanOverrideAI(ee))
									ee.AI = "looseguard";
								else ee.AI = KDGetAIOverride(ee, 'looseguard');
								ee.gxx = point.x;
								ee.gyy = point.y;
							}
						}
					}
				}
				count = 3 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["alchemist", "pink"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["pink"], undefined, {"alchemist": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(point.x, point.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "LatexQuest", -1);
							ee.faction = "Latex";
							if (KDCanOverrideAI(ee))
								ee.AI = "looseguard";
							else ee.AI = KDGetAIOverride(ee, 'looseguard');
							ee.gxx = point.x;
							ee.gyy = point.y;
						}
					}
				}

			}
		},
		worldgenstart: () => {
			KDRemoveQuest("LatexQuest");
			KinkyDungeonChangeRep("Latex", -KDDefaultGoddessQuestRep);
			KinkyDungeonSendTextMessage(10, TextGet("KDQuestFail_" + "LatexQuest"), "#ffffff", 1);
			KDPlayerEffectRestrain(undefined, 2 + Math.round(KDGetEffLevel()/2), ["latexRestraints", "latexRestraintsHeavy"], "Goddess", false, true, false, false);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Evil" + ".ogg");
		},
		tick: (delta) => {
			if (!(KDGetQuestData("LatexQuest").QuestRoom == KDMapData.RoomType)
				|| !(KDGetQuestData("LatexQuest").QuestLocation?.x == KDCurrentWorldSlot.x)
				|| !(KDGetQuestData("LatexQuest").QuestLocation?.y == KDCurrentWorldSlot.y)) return;
			if (delta > 0&& KinkyDungeonFlags.get("LatexQuest")) {
				for (let enemy of KDMapData.Entities) {
					if (KDEnemyHasFlag(enemy, "LatexQuest")) {
						return;
					}
				}
				for (let i = 0 ; i < 3; i++) {
					KinkyDungeonLoot(KDGetEffLevel(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], "LatexQuest");
				}
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");
				KinkyDungeonChangeRep("Latex", KDDefaultGoddessQuestRep);
				KinkyDungeonSendTextMessage(10, TextGet("KDQuestSucceed_" + "LatexQuest"), "#ffffff", 1);
				KDRemoveQuest("LatexQuest");
			}
		},
		weight: (RoomType, MapMod, data, currentQuestList) => {
			return 10;
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			return false;
		},
		tags: ["Latex"],
	},
	"LeatherQuest": {
		name: "LeatherQuest",
		npc: "ChainBeing",
		visible: true,
		nocancel: true,
		accept: () => {
			KDSetQuestData("LeatherQuest", {
				QuestLocation: KDCurrentWorldSlot,
				QuestRoom: KDMapData.RoomType,
			});
			KinkyDungeonSetFlag("LeatherQuest", -1, -1);
			let point = KinkyDungeonGetRandomEnemyPoint(true);
			if (point) {
				let beings = ["ChainBeing", "CorruptedAdventurer", "ShadowGhast"];
				let ens = KinkyDungeonSummonEnemy(point.x, point.y, beings[Math.floor(KDRandom() * beings.length)], Math.max(2, Math.min(6, Math.round(KDGetEffLevel()/4))), 2.9);
				for (let enemy of ens) {
					KinkyDungeonSetEnemyFlag(enemy, "LeatherQuest", -1);
					enemy.AI = "guard";
					enemy.faction = "Rebel";
				}

				let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["dragon", "miniboss"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["dragon", "miniboss"], undefined, {"dragon": {mult: 4, bonus: 10}});
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								//KinkyDungeonSetEnemyFlag(ee, "LeatherQuest", -1);
								ee.faction = "Rebel";
								if (KDCanOverrideAI(ee))
									ee.AI = "looseguard";
								else ee.AI = KDGetAIOverride(ee, 'looseguard');
								ee.gxx = point.x;
								ee.gyy = point.y;
							}
						}
					}
				}

				count = 3 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["dragonheart"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["dragon"], undefined, {"dragon": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(point.x, point.y, e.name);
						if (ee) {
							//KinkyDungeonSetEnemyFlag(ee, "LeatherQuest", -1);
							ee.faction = "Rebel";
							if (KDCanOverrideAI(ee))
								ee.AI = "looseguard";
							else ee.AI = KDGetAIOverride(ee, 'looseguard');
							ee.gxx = point.x;
							ee.gyy = point.y;
						}
					}
				}

			}
		},
		worldgenstart: () => {
			KDRemoveQuest("LeatherQuest");
			KinkyDungeonChangeRep("Leather", -KDDefaultGoddessQuestRep);
			KinkyDungeonSendTextMessage(10, TextGet("KDQuestFail_" + "LeatherQuest"), "#ffffff", 1);
			KDPlayerEffectRestrain(undefined, 2 + Math.round(KDGetEffLevel()/2), ["dragonRestraints", "leatherRestraints", "leatherRestraintsHeavy"], "Goddess", false, true, false, false);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Evil" + ".ogg");
		},
		tick: (delta) => {
			if (!(KDGetQuestData("LeatherQuest").QuestRoom == KDMapData.RoomType)
				|| !(KDGetQuestData("LeatherQuest").QuestLocation?.x == KDCurrentWorldSlot.x)
				|| !(KDGetQuestData("LeatherQuest").QuestLocation?.y == KDCurrentWorldSlot.y)) return;
			if (delta > 0&& KinkyDungeonFlags.get("LeatherQuest")) {
				for (let enemy of KDMapData.Entities) {
					if (KDEnemyHasFlag(enemy, "LeatherQuest")) {
						return;
					}
				}
				for (let i = 0 ; i < 3; i++) {
					KinkyDungeonLoot(KDGetEffLevel(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], "LeatherQuest");
				}
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");
				KinkyDungeonChangeRep("Leather", KDDefaultGoddessQuestRep);
				KinkyDungeonSendTextMessage(10, TextGet("KDQuestSucceed_" + "LeatherQuest"), "#ffffff", 1);
				KDRemoveQuest("LeatherQuest");
			}
		},
		weight: (RoomType, MapMod, data, currentQuestList) => {
			return 10;
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			return false;
		},
		tags: ["Leather"],
	},
	"MetalQuest": {
		name: "MetalQuest",
		npc: "OldDrone",
		visible: true,
		nocancel: true,
		accept: () => {
			KDSetQuestData("MetalQuest", {
				QuestLocation: KDCurrentWorldSlot,
				QuestRoom: KDMapData.RoomType,
			});
			KinkyDungeonSetFlag("MetalQuest", -1, -1);
			let point = KinkyDungeonGetRandomEnemyPoint(true);
			if (point) {
				let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["oldrobot", "robot", "miniboss"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["robot", "miniboss"], undefined, {"oldrobot": {mult: 2, bonus: 10}}, ["turret"]);
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								KinkyDungeonSetEnemyFlag(ee, "MetalQuest", -1);
								ee.faction = "Virus";
								if (KDCanOverrideAI(ee))
									ee.AI = "looseguard";
								else ee.AI = KDGetAIOverride(ee, 'looseguard');
								ee.gxx = point.x;
								ee.gyy = point.y;
							}
						}
					}
				}

				count = 3 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["robot", "oldrobot"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["robot"], undefined, {"oldrobot": {mult: 2, bonus: 10}}, ["miniboss", "boss", "turret"]);
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(point.x, point.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "MetalQuest", -1);
							ee.faction = "Virus";
							if (KDCanOverrideAI(ee))
								ee.AI = "looseguard";
							else ee.AI = KDGetAIOverride(ee, 'looseguard');
							ee.gxx = point.x;
							ee.gyy = point.y;
						}
					}
				}

			}
		},
		worldgenstart: () => {
			KDRemoveQuest("MetalQuest");
			KinkyDungeonChangeRep("Metal", -KDDefaultGoddessQuestRep);
			KinkyDungeonSendTextMessage(10, TextGet("KDQuestFail_" + "MetalQuest"), "#ffffff", 1);
			KDPlayerEffectRestrain(undefined, 1 + Math.round(KDGetEffLevel()/4), ["cyberdollrestraints", "cyberdollheavy", "controlharness"], "Goddess", false, true, false, false);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Evil" + ".ogg");
		},
		tick: (delta) => {
			if (!(KDGetQuestData("MetalQuest").QuestRoom == KDMapData.RoomType)
				|| !(KDGetQuestData("MetalQuest").QuestLocation?.x == KDCurrentWorldSlot.x)
				|| !(KDGetQuestData("MetalQuest").QuestLocation?.y == KDCurrentWorldSlot.y)) return;
			if (delta > 0 && KinkyDungeonFlags.get("MetalQuest")) {
				for (let enemy of KDMapData.Entities) {
					if (KDEnemyHasFlag(enemy, "MetalQuest")) {
						return;
					}
				}
				for (let i = 0 ; i < 3; i++) {
					KinkyDungeonLoot(KDGetEffLevel(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], "MetalQuest");
				}
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");
				KinkyDungeonChangeRep("Metal", KDDefaultGoddessQuestRep);
				KinkyDungeonSendTextMessage(10, TextGet("KDQuestSucceed_" + "MetalQuest"), "#ffffff", 1);
				KDRemoveQuest("MetalQuest");
			}
		},
		weight: (RoomType, MapMod, data, currentQuestList) => {
			return 10;
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			return false;
		},
		tags: ["Metal"],
	},

	"ElementsQuest": {
		name: "ElementsQuest",
		npc: "DemonStar",
		visible: true,
		nocancel: true,
		accept: () => {
			KDSetQuestData("ElementsQuest", {
				QuestLocation: KDCurrentWorldSlot,
				QuestRoom: KDMapData.RoomType,
			});
			KinkyDungeonSetFlag("ElementsQuest", -1, -1);
			let point = KinkyDungeonGetRandomEnemyPoint(true);
			if (point) {
				let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["demon", "miniboss"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["demon", "miniboss"], undefined, {"demon": {mult: 2, bonus: 10}});
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								KinkyDungeonSetEnemyFlag(ee, "ElementsQuest", -1);
								ee.faction = "Extraplanar";
								if (KDCanOverrideAI(ee))
									ee.AI = "looseguard";
								else ee.AI = KDGetAIOverride(ee, 'looseguard');
								ee.gxx = point.x;
								ee.gyy = point.y;
							}
						}
					}
				}

				count = 3 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["demon"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["demon"], undefined, {"demon": {mult: 2, bonus: 10}}, ["miniboss", "boss"]);
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(point.x, point.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "ElementsQuest", -1);
							ee.faction = "Extraplanar";
							if (KDCanOverrideAI(ee))
								ee.AI = "looseguard";
							else ee.AI = KDGetAIOverride(ee, 'looseguard');
							ee.gxx = point.x;
							ee.gyy = point.y;
						}
					}
				}

			}
		},
		worldgenstart: () => {
			KDRemoveQuest("ElementsQuest");
			KinkyDungeonChangeRep("Elements", -KDDefaultGoddessQuestRep);
			KinkyDungeonSendTextMessage(10, TextGet("KDQuestFail_" + "ElementsQuest"), "#ffffff", 1);
			KDPlayerEffectRestrain(undefined, 1 + Math.round(KDGetEffLevel()/3), ["obsidianRestraints"], "Goddess", false, true, false, false);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Evil" + ".ogg");
		},
		tick: (delta) => {
			if (!(KDGetQuestData("ElementsQuest").QuestRoom == KDMapData.RoomType)
				|| !(KDGetQuestData("ElementsQuest").QuestLocation?.x == KDCurrentWorldSlot.x)
				|| !(KDGetQuestData("ElementsQuest").QuestLocation?.y == KDCurrentWorldSlot.y)) return;
			if (delta > 0 && KinkyDungeonFlags.get("ElementsQuest")) {
				for (let enemy of KDMapData.Entities) {
					if (KDEnemyHasFlag(enemy, "ElementsQuest")) {
						return;
					}
				}
				for (let i = 0 ; i < 3; i++) {
					KinkyDungeonLoot(KDGetEffLevel(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], "ElementsQuest");
				}
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");
				KinkyDungeonChangeRep("Elements", KDDefaultGoddessQuestRep);
				KinkyDungeonSendTextMessage(10, TextGet("KDQuestSucceed_" + "ElementsQuest"), "#ffffff", 1);
				KDRemoveQuest("ElementsQuest");
			}
		},
		weight: (RoomType, MapMod, data, currentQuestList) => {
			return 10;
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			return false;
		},
		tags: ["Elements"],
	},

	"ConjureQuest": {
		name: "ConjureQuest",
		npc: "WitchShock",
		visible: true,
		nocancel: true,
		accept: () => {
			KDSetQuestData("ConjureQuest", {
				QuestLocation: KDCurrentWorldSlot,
				QuestRoom: KDMapData.RoomType,
			});
			KinkyDungeonSetFlag("ConjureQuest", -1, -1);
			let point = KinkyDungeonGetRandomEnemyPoint(true);
			if (point) {
				let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["witch", "apprentice", "miniboss"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["witch", "miniboss"], undefined, {"witch": {mult: 2, bonus: 10}});
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								KinkyDungeonSetEnemyFlag(ee, "ConjureQuest", -1);
								ee.faction = "DubiousWitch";
								if (KDCanOverrideAI(ee))
									ee.AI = "guard";
								else ee.AI = KDGetAIOverride(ee, 'guard');
								ee.gxx = point.x;
								ee.gyy = point.y;
							}
						}
					}
				}

				count = 3 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["apprentice", "witch"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["spellcaster"], undefined, {"witch": {mult: 4, bonus: 10}, "apprentice": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(point.x, point.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "ConjureQuest", -1);
							ee.faction = "DubiousWitch";
							if (KDCanOverrideAI(ee))
								ee.AI = "guard";
							else ee.AI = KDGetAIOverride(ee, 'guard');
							ee.gxx = point.x;
							ee.gyy = point.y;
						}
					}
				}

			}
		},
		worldgenstart: () => {
			KDRemoveQuest("ConjureQuest");
			KinkyDungeonChangeRep("Conjure", -KDDefaultGoddessQuestRep);
			KinkyDungeonSendTextMessage(10, TextGet("KDQuestFail_" + "ConjureQuest"), "#ffffff", 1);
			KDPlayerEffectRestrain(undefined, 2 + Math.round(KDGetEffLevel()/3), ["dressRestraints", "latexRestraints"], "Goddess", false, true, false, false);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Evil" + ".ogg");
		},
		tick: (delta) => {
			if (!(KDGetQuestData("ConjureQuest").QuestRoom == KDMapData.RoomType)
				|| !(KDGetQuestData("ConjureQuest").QuestLocation?.x == KDCurrentWorldSlot.x)
				|| !(KDGetQuestData("ConjureQuest").QuestLocation?.y == KDCurrentWorldSlot.y)) return;
			if (delta > 0&& KinkyDungeonFlags.get("ConjureQuest")) {
				for (let enemy of KDMapData.Entities) {
					if (KDEnemyHasFlag(enemy, "ConjureQuest")) {
						return;
					}
				}
				for (let i = 0 ; i < 3; i++) {
					KinkyDungeonLoot(KDGetEffLevel(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], "ConjureQuest");
				}
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");
				KinkyDungeonChangeRep("Conjure", KDDefaultGoddessQuestRep);
				KinkyDungeonSendTextMessage(10, TextGet("KDQuestSucceed_" + "ConjureQuest"), "#ffffff", 1);
				KDRemoveQuest("ConjureQuest");
			}
		},
		weight: (RoomType, MapMod, data, currentQuestList) => {
			return 10;
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			return false;
		},
		tags: ["Conjure"],
	},

	"WillQuest": {
		name: "WillQuest",
		npc: "Elf",
		visible: true,
		nocancel: true,
		accept: () => {
			KDSetQuestData("WillQuest", {
				QuestLocation: KDCurrentWorldSlot,
				QuestRoom: KDMapData.RoomType,
			});
			KinkyDungeonSetFlag("WillQuest", -1, -1);
			let point = KinkyDungeonGetRandomEnemyPoint(true);
			if (point) {
				let count = 4 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["mummy"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["mummy"], undefined, {"mummy": {mult: 2, bonus: 10}}, ["miniboss", "boss", "submissive"]);
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(point.x, point.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "WillQuest", -1);
							ee.faction = "Debate";
							if (KDCanOverrideAI(ee))
								ee.AI = "guard";
							else ee.AI = KDGetAIOverride(ee, 'guard');
							ee.gxx = point.x;
							ee.gyy = point.y;
						}
					}
				}
				count = 4 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["elf"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["elf"], undefined, {"elf": {mult: 2, bonus: 10}}, ["miniboss", "boss", "turret"]);
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(point.x, point.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "WillQuest", -1);
							ee.faction = "Debate";
							if (KDCanOverrideAI(ee))
								ee.AI = "guard";
							else ee.AI = KDGetAIOverride(ee, 'guard');
							ee.gxx = point.x;
							ee.gyy = point.y;
						}
					}
				}

			}
		},
		worldgenstart: () => {
			KDRemoveQuest("WillQuest");
			KinkyDungeonChangeRep("Will", -KDDefaultGoddessQuestRep);
			KinkyDungeonSendTextMessage(10, TextGet("KDQuestFail_" + "WillQuest"), "#ffffff", 1);
			KDPlayerEffectRestrain(undefined, 3 + Math.round(KDGetEffLevel()/2), ["mithrilRestraints"], "Goddess", false, true, false, false);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Evil" + ".ogg");
		},
		tick: (delta) => {
			if (!(KDGetQuestData("WillQuest").QuestRoom == KDMapData.RoomType)
				|| !(KDGetQuestData("WillQuest").QuestLocation?.x == KDCurrentWorldSlot.x)
				|| !(KDGetQuestData("WillQuest").QuestLocation?.y == KDCurrentWorldSlot.y)) return;
			if (delta > 0&& KinkyDungeonFlags.get("WillQuest")) {
				for (let enemy of KDMapData.Entities) {
					if (KDEnemyHasFlag(enemy, "WillQuest")) {
						return;
					}
				}
				for (let i = 0 ; i < 3; i++) {
					KinkyDungeonLoot(KDGetEffLevel(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], "WillQuest");
				}
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");
				KinkyDungeonChangeRep("Will", KDDefaultGoddessQuestRep);
				KinkyDungeonSendTextMessage(10, TextGet("KDQuestSucceed_" + "WillQuest"), "#ffffff", 1);
				KDRemoveQuest("WillQuest");
			}
		},
		weight: (RoomType, MapMod, data, currentQuestList) => {
			return 10;
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			return false;
		},
		tags: ["Will"],
	},

	"IllusionQuest": {
		name: "IllusionQuest",
		npc: "OldDrone",
		visible: true,
		nocancel: true,
		accept: () => {
			KDSetQuestData("IllusionQuest", {
				QuestLocation: KDCurrentWorldSlot,
				QuestRoom: KDMapData.RoomType,
			});
			KinkyDungeonSetFlag("IllusionQuest", -1, -1);
			let point = KinkyDungeonGetRandomEnemyPoint(true);
			if (point) {
				let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["shadowclan", "miniboss"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["shadowclan", "miniboss"], undefined, {"shadowclan": {mult: 2, bonus: 10}});
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								KinkyDungeonSetEnemyFlag(ee, "IllusionQuest", -1);
								ee.faction = "ShadowClan";
								if (KDCanOverrideAI(ee))
									ee.AI = "guard";
								else ee.AI = KDGetAIOverride(ee, 'guard');
								ee.gxx = point.x;
								ee.gyy = point.y;
							}
						}
					}
				}
				count = 4 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
				for (let i = 0; i < count; i++) {
					let e = KinkyDungeonGetEnemy(["shadowclan"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0',
						["shadowclan"], undefined, {"shadowclan": {mult: 2, bonus: 10}}, ["miniboss", "boss"]);
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(point.x, point.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "IllusionQuest", -1);
							ee.faction = "ShadowClan";
							if (KDCanOverrideAI(ee))
								ee.AI = "guard";
							else ee.AI = KDGetAIOverride(ee, 'guard');
							ee.gxx = point.x;
							ee.gyy = point.y;
						}
					}
				}

			}
		},
		worldgenstart: () => {
			KDRemoveQuest("IllusionQuest");
			KinkyDungeonChangeRep("Illusion", -KDDefaultGoddessQuestRep);
			KinkyDungeonSendTextMessage(10, TextGet("KDQuestFail_" + "IllusionQuest"), "#ffffff", 1);
			KDPlayerEffectRestrain(undefined, 2 + Math.round(KDGetEffLevel()/3), ["shadowlatexRestraints", "shadowlatexRestraintsHeavy"], "Goddess", false, true, false, false);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Evil" + ".ogg");
		},
		tick: (delta) => {
			if (!(KDGetQuestData("IllusionQuest").QuestRoom == KDMapData.RoomType)
				|| !(KDGetQuestData("IllusionQuest").QuestLocation?.x == KDCurrentWorldSlot.x)
				|| !(KDGetQuestData("IllusionQuest").QuestLocation?.y == KDCurrentWorldSlot.y)) return;
			if (delta > 0 && KinkyDungeonFlags.get("IllusionQuest")) {
				for (let enemy of KDMapData.Entities) {
					if (KDEnemyHasFlag(enemy, "IllusionQuest")) {
						return;
					}
				}
				for (let i = 0 ; i < 3; i++) {
					KinkyDungeonLoot(KDGetEffLevel(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], "IllusionQuest");
				}
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");
				KinkyDungeonChangeRep("Illusion", KDDefaultGoddessQuestRep);
				KinkyDungeonSendTextMessage(10, TextGet("KDQuestSucceed_" + "IllusionQuest"), "#ffffff", 1);
				KDRemoveQuest("IllusionQuest");
			}
		},
		weight: (RoomType, MapMod, data, currentQuestList) => {
			return 10;
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			return false;
		},
		tags: ["Illusion"],
	},
};



function KDQuestList(count, mods, RoomType, MapMod, data) {
	let ret = [];
	for (let i = 0; i < count; i++) {
		let genWeightTotal = 0;
		let genWeights = [];

		for (let mod of Object.values(mods)) {
			if (!ret.includes(mod) && mod.prerequisite(RoomType, MapMod, data, ret)) {
				genWeights.push({mod: mod, weight: genWeightTotal});
				genWeightTotal += mod.weight(RoomType, MapMod, data, ret);
			}
		}

		let selection = KDRandom() * genWeightTotal;

		for (let L = genWeights.length - 1; L >= 0; L--) {
			if (selection > genWeights[L].weight) {
				ret.push(genWeights[L].mod);
				break;
			}
		}
	}
	return ret;
}

function KDQuestWorldgenStart(quests) {
	if (quests) {
		for (let q of quests) {
			if (KDQuests[q] && KDQuests[q].worldgenstart) {
				KDQuests[q].worldgenstart();
			}
		}
	}
}

function KDQuestTick(quests, delta) {
	if (quests) {
		for (let q of quests) {
			if (KDQuests[q] && KDQuests[q].tick) {
				KDQuests[q].tick(delta);
			}
		}
	}
}
function KDRemoveQuest(quest) {
	if (!KDGameData.Quests)
		KDGameData.Quests = [];
	else if (KDGameData.Quests.indexOf(quest) > -1)
		KDGameData.Quests.splice(KDGameData.Quests.indexOf(quest), 1);
}
function KDAddQuest(quest) {
	if (!KDGameData.Quests) KDGameData.Quests = [];
	if (!KDGameData.Quests.includes(quest)) {
		if (KDQuests[quest]?.accept) {
			KDQuests[quest].accept();
		}
		KDGameData.Quests.push(quest);
		KinkyDungeonSendTextMessage(10, TextGet("KDNewQuest"), "#ffffff", 2);
	}
}

function KDHasQuest(quest) {
	if (!KDGameData.Quests) return false;
	return KDGameData.Quests.includes(quest);
}

let KDQuestsIndex = 0;
let KDQuestsVisible = 0;
let KDMaxQuests = 2;


function KinkyDungeonDrawQuest() {
	let xOffset = -125;
	let yStart = 300;
	let xStart = 500;
	let spacing = 100;
	let II = 0;

	if (KDGameData.Quests) {
		for (let q of KDGameData.Quests) {
			if (KDQuests[q]?.visible) {
				if (II < KDQuestsIndex + KDMaxQuests && II >= KDQuestsIndex) {
					FillRectKD(kdcanvas, kdpixisprites, "questrec" + q, {
						Left: xStart + xOffset + 100,
						Top: yStart + II*spacing - 40,
						Width: 1050,
						Height: 80,
						Color: "#000000",
						LineWidth: 1,
						zIndex: -18,
						alpha: 0.3
					});
					DrawRectKD(kdcanvas, kdpixisprites, "questrec2" + q, {
						Left: xStart + xOffset + 100,
						Top: yStart + II*spacing - 40,
						Width: 1050,
						Height: 80,
						Color: "#000000",
						LineWidth: 1,
						zIndex: -18,
						alpha: 0.9
					});

					DrawTextFitKD(TextGet("KDQuest_" + q), xStart + xOffset + 200, yStart + II*spacing, 850, "#ffffff", KDTextGray0, 28, "left");
					KDDraw(kdcanvas, kdpixisprites, "kdquest" + q, KinkyDungeonRootDirectory + "Enemies/" + KDQuests[q]?.npc + ".png",
						xStart + xOffset + 100, yStart + II*spacing - 36, 72, 72);
					if (DrawButtonKDEx("kdquestquit" + q, (b) => {
						if (!KDQuests[q]?.nocancel)
							KDRemoveQuest(q);
						return true;
					}, true, xStart + xOffset + 1200, yStart + II*spacing - 36, 220, 72,
					TextGet("KDQuestListCancel"), KDQuests[q]?.nocancel ? KDTextGray3 : "#ffffff",
					KinkyDungeonRootDirectory + "UI/X.png", "", false, true, KDButtonColor, undefined, true))
						DrawTextFitKD(TextGet(KDQuests[q]?.nocancel ? "KDQuestListDescCancelFail" : "KDQuestListDescCancel"),
							xStart + xOffset + 625, 200, 1000, "#ffffff", KDTextGray0, 20, "center", 70);
				}

				II++;
			}
		}
	}

	KDQuestsVisible = II;

	if (KDQuestsVisible == 0) {
		DrawTextFitKD(TextGet("KDNoQuests"),
			xStart + xOffset + 625, 200, 1000, "#ffffff", KDTextGray0, 20, "center", 70);
	}

	if (KDQuestsVisible > KDMaxQuests) {
		DrawButtonKDEx("questUp", (b) => {
			KDQuestsIndex -= 2;
			return true;
		}, true, xStart, yStart - spacing, 90, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Up.png");
		DrawButtonKDEx("questDown", (b) => {
			KDQuestsIndex += 2;
			return true;
		}, true, xStart, yStart + KDMaxQuests*spacing, 90, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Down.png");


		KDQuestsIndex = Math.max(0, Math.min(KDQuestsIndex, KDQuestsVisible - Math.round(KDMaxQuests/2)));
	} else {
		KDQuestsIndex = 0;
	}


	KDDrawLoreRepTabs(xOffset);
}

function KDGetQuestData(quest) {
	if (KDGameData.QuestData) return KDGameData.QuestData[quest] || {};
	return {};
}
function KDSetQuestData(quest, data) {
	if (!KDGameData.QuestData) KDGameData.QuestData = {};
	KDGameData.QuestData[quest] = data;
}

/**
 *
 * @param {string} Name
 * @param {string} Icon
 * @param {string} Goddess
 * @param {(Goddess, Flag) => void} spawnFunction
 * @param {number} Rep
 * @param {number} restraintsCountMult
 * @param {string[]} restraintsTags
 * @returns {KDQuest}
 */
function KDGenQuestTemplate(Name, Icon, Goddess, spawnFunction, restraintsCountMult, restraintsTags, Loot, Rep = KDDefaultGoddessQuestRep) {
	if (!Loot) Loot = Name;
	let quest = {
		name: Name,
		npc: Icon,
		visible: true,
		nocancel: true,
		accept: () => {
			KDSetQuestData(Name, {
				QuestLocation: KDCurrentWorldSlot,
				QuestRoom: KDMapData.RoomType,
			});
			KinkyDungeonSetFlag(Name, -1, -1);
			spawnFunction(Goddess, Name);
		},
		worldgenstart: () => {
			KDRemoveQuest(Name);
			KinkyDungeonChangeRep(Goddess, -KDDefaultGoddessQuestRep);
			KinkyDungeonSendTextMessage(10, TextGet("KDQuestFail_" + Name), "#ffffff", 1);
			KDPlayerEffectRestrain(undefined, Math.round(restraintsCountMult * (1 + KDGetEffLevel()/3)), restraintsTags, "Goddess", false, true, false, false);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Evil" + ".ogg");
		},
		tick: (delta) => {
			if (!(KDGetQuestData(Name).QuestRoom == KDMapData.RoomType)
				|| !(KDGetQuestData(Name).QuestLocation?.x == KDCurrentWorldSlot.x)
				|| !(KDGetQuestData(Name).QuestLocation?.y == KDCurrentWorldSlot.y)) return;
			if (delta > 0 && KinkyDungeonFlags.get(Name)) {
				for (let enemy of KDMapData.Entities) {
					if (KDEnemyHasFlag(enemy, Name)) {
						return;
					}
				}
				for (let i = 0 ; i < 3; i++) {
					KinkyDungeonLoot(KDGetEffLevel(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], Name);
				}
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");
				KinkyDungeonChangeRep(Goddess, Rep);
				KinkyDungeonSendTextMessage(10, TextGet("KDQuestSucceed_" + Name), "#ffffff", 1);
				KDRemoveQuest(Name);
			}
		},
		weight: (RoomType, MapMod, data, currentQuestList) => {
			return 10;
		},
		prerequisite: (RoomType, MapMod, data, currentQuestList) => {
			return false;
		},
		tags: [Goddess],
	};

	return quest;
}