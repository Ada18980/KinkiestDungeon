"use strict";

let QuestCompleteWeight = 1000;
let KDDefaultGoddessQuestRep = 5;

let KDQuests: Record<string, KDQuest> = {
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
		weight: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (RoomType == "PerkRoom") {
				let weight = 15;
				if (KinkyDungeonPlayerTags.has("BindingDress")) {
					return weight * QuestCompleteWeight;
				}
				return weight;
			}
			return 0;
		},
		prerequisite: (RoomType, _MapMod, _data, _currentQuestList) => {
			//if (KinkyDungeonFlags.has("DressmakerQuest") && KinkyDungeonPlayerTags.has("BindingDress")) {
			//return false;
			//}
			if (RoomType == "PerkRoom") {
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
		weight: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (RoomType == "PerkRoom") {
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
		accept: () => {
			KinkyDungeonSetFlag("ApprenticeQuestSpawn", 0);
		},
		prerequisite: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (KDHasQuest("ApprenticeQuest") && !(KinkyDungeonInventoryGet("ScrollLegs")
				|| KinkyDungeonInventoryGet("ScrollArms")
				|| KinkyDungeonInventoryGet("ScrollVerbal")
				|| KinkyDungeonInventoryGet("ScrollPurity")
			)) {
				return false;
			}
			if (RoomType == "PerkRoom") {
				return true;
			}
			return false;
		}
	},
	"DragonheartQuest": {
		name: "DragonheartQuest",
		npc: "DragonheartQuest",
		visible: true,
		weight: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (RoomType == "PerkRoom") {
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
		prerequisite: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (KDHasQuest("DragonheartQuest")) {
				return false;
			}
			if (KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel + 1)) return false;
			if (RoomType == "PerkRoom") {
				return true;
			}
			return false;
		}
	},
	"MaidforceQuest": {
		name: "MaidforceQuest",
		npc: "MaidforceQuest",
		visible: true,
		weight: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (RoomType == "PerkRoom") {
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
						let e = KinkyDungeonGetEnemy(["maid", "miniboss"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["maid", "miniboss"], undefined, {"maid": {mult: 4, bonus: 10}});
						if (e) {
							let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
							if (epoint) {
								let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
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
							e = KinkyDungeonGetEnemy(["maid"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["maid"], undefined, {"maid": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
							let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
							if (e && epoint) {
								let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
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
		prerequisite: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (KDHasQuest("MaidforceQuest")) {
				return false;
			}
			if (KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel + 1)) return false;
			if (RoomType == "PerkRoom") {
				return true;
			}
			return false;
		}
	},
	"WolfgirlHunters": {
		name: "WolfgirlHunters",
		npc: "Wolfgirl",
		visible: true,
		nocancel: true,
		weight: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return 0;
		},
		worldgenstart: () => {
			if (KDRandom() < 0.6 && KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					let e = KinkyDungeonGetEnemy(["wolfgirl", "miniboss"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["wolfgirl", "miniboss"], undefined, {"wolfgirl": {mult: 4, bonus: 10}});
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
							if (ee) {
								ee.faction = "Wolfhunter";
								ee.AI = "patrol";
							}
						}
					}
					let count = 3 + KDRandom() * Math.min(4, KinkyDungeonDifficulty / 20);
					for (let i = 0; i < count; i++) {
						e = KinkyDungeonGetEnemy(["nevermere"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["nevermere"], undefined, {"wolfgirl": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (e && epoint) {
							let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
							if (ee) {
								ee.faction = "Wolfhunter";
								ee.AI = "patrol";
							}
						}
					}
				}
			}
		},
		prerequisite: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return false;
		}
	},

	"LatexDoll": {
		name: "LatexDoll",
		npc: "Dressmaker",
		visible: true,
		nocancel: true,
		weight: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return 0;
		},
		worldgenstart: () => {
			if (KDRandom() < 0.6 && KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					let e = KinkyDungeonGetEnemy(["dressmaker"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["dressmaker"], undefined, {"dressmaker": {mult: 4, bonus: 10}}, ["minor"]);
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
							if (ee) {
								ee.faction = "DollShoppe";
								ee.AI = "patrol";
							}
						}
					}
					let count = 3 + KDRandom() * Math.min(4, KinkyDungeonDifficulty / 20);
					for (let i = 0; i < count; i++) {
						e = KinkyDungeonGetEnemy(["dressmaker"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["dressmaker"], undefined, {"dressmaker": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (e && epoint) {
							let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
							if (ee) {
								ee.faction = "DollShoppe";
								ee.AI = "patrol";
							}
						}
					}
				}
			}
		},
		prerequisite: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return false;
		}
	},


	"MaidSweeper": {
		name: "MaidSweeper",
		npc: "DirtPile",
		visible: true,
		nocancel: true,
		weight: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return 0;
		},
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				if (!KDGameData.QuestData.DirtPiles) KDGameData.QuestData.DirtPiles = {
					pilesTotal: 0,
					pilesSinceLastSpawn: 0,
					lastSpawn: "Frog",
					quota: -3,
				};

				if (KDGameData.QuestData.DirtPiles.pilesTotal < KDGameData.QuestData.DirtPiles.quota * 0.95) {
					KDGameData.QuestData.DirtPiles.quota = KDGameData.QuestData.DirtPiles.pilesTotal;
					let point = KinkyDungeonGetRandomEnemyPoint(true);
					if (point) {
						let e = KinkyDungeonGetEnemy(["maid", "miniboss"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["maid", "miniboss"], undefined, {"maid": {mult: 4, bonus: 10}});
						if (e) {
							let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
							if (epoint) {
								let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
								if (ee) {
									ee.faction = "Delinquent";
									if (KDCanOverrideAI(ee))
										ee.AI = "patrol";
									else ee.AI = KDGetAIOverride(ee, 'patrol');
									ee.gx = KinkyDungeonPlayerEntity.x;
									ee.gy = KinkyDungeonPlayerEntity.y;
								}
							}
						}
						let count = 3 + KDRandom() * Math.min(4, KinkyDungeonDifficulty / 20);
						for (let i = 0; i < count; i++) {
							e = KinkyDungeonGetEnemy(["maid"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["maid"], undefined, {"maid": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
							let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
							if (e && epoint) {
								let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
								if (ee) {
									ee.faction = "Delinquent";
									if (KDCanOverrideAI(ee))
										ee.AI = "patrol";
									else ee.AI = KDGetAIOverride(ee, 'patrol');
									ee.gx = KinkyDungeonPlayerEntity.x;
									ee.gy = KinkyDungeonPlayerEntity.y;
								}
							}
						}
					}
					KinkyDungeonChangeFactionRep("Maidforce", -0.2);
					KinkyDungeonSendTextMessage(10, TextGet("KDNotEnoughDirtPiles"), "#ff8933", 4);
				}


				let count2 = 14 + 6 * KDRandom();
				for (let i = 0; i < count2; i++) {
					let epoint = KinkyDungeonGetRandomEnemyPoint(true);
					if (epoint) {
						DialogueCreateEnemy(epoint.x, epoint.y, "DirtPile");
						KDGameData.QuestData.DirtPiles.quota += 1;
					}
				}
			}
		},
		prerequisite: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return false;
		}
	},

	"ElementalSlave": {
		name: "ElementalSlave",
		npc: "ElementalFire",
		visible: true,
		nocancel: true,
		weight: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return 0;
		},
		worldgenstart: () => {
			KinkyDungeonSetFlag("ElementalSlaveTeleport", -1);
		},
		prerequisite: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return false;
		},
		tick: (delta) => {
			if (delta > 0 && KinkyDungeonFlags.get("ElementalSlaveTeleport")) {
				let altType = KDGetAltType(MiniGameKinkyDungeonLevel, KDGameData.MapMod, KDGameData.RoomType);
				if (!altType || altType.makeMain) {
					let tiles = KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 3.5).filter(
						(tile) => {
							return KinkyDungeonMapGet(tile.x, tile.y) == 'A' && tile.tile?.Name == "Elements";
						}
					);
					if (tiles.length > 0 && KDRandom() < 0.4) {
						let altar = tiles[0];

						let point = KinkyDungeonGetNearbyPoint(altar.x, altar.y, true, undefined, false);
						if (point) {
							let element = CommonRandomItemFromList("", ['fire', 'earth', 'air', 'water', 'ice']);

							let e = KinkyDungeonGetEnemy(["elemental", "miniboss", element], MiniGameKinkyDungeonLevel + 8, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["elemental", element, "miniboss"], undefined, {"elemental": {mult: 4, bonus: 10}}, ["minor"]);
							if (e) {
								let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
								if (epoint) {
									let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
									if (ee) {
										ee.faction = "Owners";
										ee.AI = "hunt";
										ee.teleporting = 3;
										ee.teleportingmax = 3;
										KinkyDungeonSetFlag("ElementalSlaveTeleport", 0);
									}
								}
							}
							let count = 3 + KDRandom() * Math.min(4, KinkyDungeonDifficulty / 20);
							for (let i = 0; i < count; i++) {
								e = KinkyDungeonGetEnemy(["elemental", element], MiniGameKinkyDungeonLevel + 4, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["elemental", element], undefined, {"elemental": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
								let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
								if (e && epoint) {
									let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
									if (ee) {
										ee.faction = "Owners";
										ee.AI = "hunt";
										ee.teleporting = 3;
										ee.teleportingmax = 3;
										KinkyDungeonSetFlag("ElementalSlaveTeleport", 0);
									}
								}
							}
						}
					}

				}
			}
		},
	},

	"EscapedDoll": {
		name: "EscapedDoll",
		npc: "DollmakerBoss1",
		visible: true,
		nocancel: true,
		weight: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return 0;
		},
		worldgenstart: () => {
			if (KDRandom() < 0.35 && KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					let e = KinkyDungeonGetEnemy(["dollsmith", "miniboss"], MiniGameKinkyDungeonLevel + 10, 'bel', '0', ["dollsmith", "miniboss"], undefined, {"dollsmith": {mult: 4, bonus: 10}}, ["minor"]);
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
							if (ee) {
								ee.faction = "Dollsmith";
								ee.AI = "patrol";
							}
						}
					}
					let count = 3 + KDRandom() * Math.min(4, KinkyDungeonDifficulty / 20);
					for (let i = 0; i < count; i++) {
						e = KinkyDungeonGetEnemy(["dollsmith"], MiniGameKinkyDungeonLevel + 4, 'bel', '0', ["dollsmith"], undefined, {"dollsmith": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (e && epoint) {
							let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
							if (ee) {
								ee.faction = "Dollsmith";
								ee.AI = "patrol";
							}
						}
					}
				}
			}
		},
		prerequisite: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return false;
		}
	},


	"Nawashi": {
		name: "Nawashi",
		npc: "Nawashi",
		visible: true,
		nocancel: true,
		weight: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return 0;
		},
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(epoint.x, epoint.y, "Nawashi");
						if (ee) {
							ee.faction = "RopeDojo";
							ee.AI = "hunt";
						}
					}
				}
			}
		},
		prerequisite: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return false;
		}
	},
	"BanditQuest": {
		name: "BanditQuest",
		npc: "BanditQuest",
		visible: true,
		nocancel: true,
		weight: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (RoomType == "PerkRoom") {
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
		prerequisite: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (KDHasQuest("BanditPrisoner")) {
				return false;
			}
			if (KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel + 1)) return false;
			if (RoomType == "PerkRoom") {
				return true;
			}
			return false;
		}
	},
	"BlacksmithQuest": {
		name: "BlacksmithQuest",
		npc: "BlacksmithQuest",
		visible: false,
		weight: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return 100;
		},
		prerequisite: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (RoomType == "PerkRoom") {
				return true;
			}
			return false;
		}
	},
	"BowyerQuest": {
		name: "BowyerQuest",
		npc: "BowyerQuest",
		visible: false,
		weight: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return 100;
		},
		prerequisite: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (RoomType == "PerkRoom") {
				return true;
			}
			return false;
		}
	},
	"ShadyQuest": {
		name: "ShadyQuest",
		npc: "ShadyQuest",
		visible: false,
		weight: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return 100;
		},
		prerequisite: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (RoomType == "PerkRoom") {
				return true;
			}
			return false;
		}
	},
	"ArmorerQuest": {
		name: "ArmorerQuest",
		npc: "ArmorerQuest",
		visible: false,
		weight: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return 100;
		},
		prerequisite: (RoomType, _MapMod, _data, _currentQuestList) => {
			if (RoomType == "PerkRoom") {
				return true;
			}
			return false;
		}
	},


	"LatexQuest": KDGenQuestTemplate("LatexQuest", "PinkAlchemist", "Latex", (_goddess, _flag) => {
		let point = KinkyDungeonGetRandomEnemyPoint(true);
		if (point) {
			let ens = KinkyDungeonSummonEnemy(point.x, point.y, "LatexCube", Math.max(1, Math.min(3, Math.round(KDGetEffLevel()/6))), 2.9);
			for (let enemy of ens) {
				//KinkyDungeonSetEnemyFlag(enemy, "LatexQuest", -1);
				enemy.AI = "guard";
			}

			let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["alchemist", "pink", "miniboss"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["pink", "miniboss"], undefined, {"alchemist": {mult: 4, bonus: 10}});
				if (e) {
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "LatexQuest", -1);
							KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
							ee.faction = "Latex";
							if (KDCanOverrideAI(ee))
								ee.AI = "looseguard";
							else ee.AI = KDGetAIOverride(ee, 'looseguard');
							ee.gxx = point.x;
							ee.gyy = point.y;
							ee.spawnX = point.x;
							ee.spawnY = point.y;
						}
					}
				}
			}
			count = 3 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["alchemist", "pink"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["pink"], undefined, {"alchemist": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
				let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
				if (e && epoint) {
					let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
					if (ee) {
						KinkyDungeonSetEnemyFlag(ee, "LatexQuest", -1);
						KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
						ee.faction = "Latex";
						if (KDCanOverrideAI(ee))
							ee.AI = "looseguard";
						else ee.AI = KDGetAIOverride(ee, 'looseguard');
						ee.gxx = point.x;
						ee.gyy = point.y;
						ee.spawnX = point.x;
						ee.spawnY = point.y;
					}
				}
			}

		}
	}, 1, ["latexRestraints", "latexRestraintsHeavy"]),

	"WillQuest": KDGenQuestTemplate("WillQuest", "Elf", "Will", (_goddess, _flag) => {
		let point = KinkyDungeonGetRandomEnemyPoint(true);
		if (point) {
			let count = 4 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["mummy"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["mummy"], undefined, {"mummy": {mult: 2, bonus: 10}}, ["miniboss", "boss", "submissive"]);
				let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
				if (e && epoint) {
					let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
					if (ee) {
						KinkyDungeonSetEnemyFlag(ee, "WillQuest", -1);
						KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
						ee.faction = "Debate";
						if (KDCanOverrideAI(ee))
							ee.AI = "guard";
						else ee.AI = KDGetAIOverride(ee, 'guard');
						ee.gxx = point.x;
						ee.gyy = point.y;
						ee.spawnX = point.x;
						ee.spawnY = point.y;
					}
				}
			}
			count = 4 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["elf"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["elf"], undefined, {"elf": {mult: 2, bonus: 10}}, ["miniboss", "boss", "turret"]);
				let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
				if (e && epoint) {
					let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
					if (ee) {
						KinkyDungeonSetEnemyFlag(ee, "WillQuest", -1);
						KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
						ee.faction = "Debate";
						if (KDCanOverrideAI(ee))
							ee.AI = "guard";
						else ee.AI = KDGetAIOverride(ee, 'guard');
						ee.gxx = point.x;
						ee.gyy = point.y;
						ee.spawnX = point.x;
						ee.spawnY = point.y;
					}
				}
			}

		}
	}, 1.5, ["mithrilCuffs", "leatherRestraints", "leatherRestraintsHeavy"]),

	"RopeQuest": KDGenQuestTemplate("RopeQuest", "RopeKraken", "Rope", (_goddess, _flag) => {
		let point = KinkyDungeonGetRandomEnemyPoint(true);
		if (point) {
			let e = KinkyDungeonSummonEnemy(point.x, point.y, "RopeKraken", Math.max(1, Math.min(6, Math.round(KDGetEffLevel()/6))), 2.9);
			for (let enemy of e) {
				KinkyDungeonSetEnemyFlag(enemy, "RopeQuest", -1);
				KinkyDungeonSetEnemyFlag(enemy, "questtarget", -1);
				enemy.gxx = point.x;
				enemy.gyy = point.y;
				enemy.spawnX = point.x;
				enemy.spawnY = point.y;
				enemy.AI = "looseguard";
			}
		}
	}, 2, ["dressRestraints", "leatherRestraints", "leatherRestraintsHeavy"]),

	"LeatherQuest": KDGenQuestTemplate("LeatherQuest", "ChainBeing", "Leather", (_goddess, _flag) => {
		let point = KinkyDungeonGetRandomEnemyPoint(true);
		if (point) {
			let beings = ["ChainBeing", "CorruptedAdventurer", "ShadowGhast"];
			let ens = KinkyDungeonSummonEnemy(point.x, point.y, beings[Math.floor(KDRandom() * beings.length)], Math.max(2, Math.min(6, Math.round(KDGetEffLevel()/4))), 2.9);
			for (let enemy of ens) {
				KinkyDungeonSetEnemyFlag(enemy, "LeatherQuest", -1);
				KinkyDungeonSetEnemyFlag(enemy, "questtarget", -1);
				enemy.AI = "guard";
				enemy.faction = "Rebel";
			}

			let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["dragon", "miniboss"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["dragon", "miniboss"], undefined, {"dragon": {mult: 4, bonus: 10}});
				if (e) {
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
						if (ee) {
							//KinkyDungeonSetEnemyFlag(ee, "LeatherQuest", -1);
							ee.faction = "Rebel";
							if (KDCanOverrideAI(ee))
								ee.AI = "looseguard";
							else ee.AI = KDGetAIOverride(ee, 'looseguard');
							ee.gxx = point.x;
							ee.gyy = point.y;
							ee.spawnX = point.x;
							ee.spawnY = point.y;
						}
					}
				}
			}

			count = 3 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["dragonheart"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["dragon"], undefined, {"dragon": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
				let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
				if (e && epoint) {
					let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
					if (ee) {
						//KinkyDungeonSetEnemyFlag(ee, "LeatherQuest", -1);
						ee.faction = "Rebel";
						if (KDCanOverrideAI(ee))
							ee.AI = "looseguard";
						else ee.AI = KDGetAIOverride(ee, 'looseguard');
						ee.gxx = point.x;
						ee.gyy = point.y;
						ee.spawnX = point.x;
						ee.spawnY = point.y;
					}
				}
			}

		}
	}, 1, ["dragonRestraints", "leatherRestraints", "leatherRestraintsHeavy"]),

	"MetalQuest": KDGenQuestTemplate("MetalQuest", "Drone", "Metal", (_goddess, _flag) => {
		let point = KinkyDungeonGetRandomEnemyPoint(true);
		if (point) {
			let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["oldrobot", "robot", "miniboss"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["robot", "miniboss"], undefined, {"oldrobot": {mult: 2, bonus: 10}}, ["turret"]);
				if (e) {
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "MetalQuest", -1);
							KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
							ee.faction = "Virus";
							if (KDCanOverrideAI(ee))
								ee.AI = "looseguard";
							else ee.AI = KDGetAIOverride(ee, 'looseguard');
							ee.gxx = point.x;
							ee.gyy = point.y;
							ee.spawnX = point.x;
							ee.spawnY = point.y;
						}
					}
				}
			}

			count = 3 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["robot", "oldrobot"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["robot"], undefined, {"oldrobot": {mult: 2, bonus: 10}}, ["miniboss", "boss", "turret"]);
				let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
				if (e && epoint) {
					let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
					if (ee) {
						KinkyDungeonSetEnemyFlag(ee, "MetalQuest", -1);
						KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
						ee.faction = "Virus";
						if (KDCanOverrideAI(ee))
							ee.AI = "looseguard";
						else ee.AI = KDGetAIOverride(ee, 'looseguard');
						ee.gxx = point.x;
						ee.gyy = point.y;
						ee.spawnX = point.x;
						ee.spawnY = point.y;
					}
				}
			}

		}
	}, 0.7, ["cyberdollrestraints", "cyberdollcuffs", "cyberdollheavy", "controlharness", "blacksteelRestraints"]),

	"ConjureQuest": KDGenQuestTemplate("ConjureQuest", "WitchShock", "Conjure", (_goddess, _flag) => {
		let point = KinkyDungeonGetRandomEnemyPoint(true);
		if (point) {
			let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["witch", "apprentice", "miniboss"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["witch", "miniboss"], undefined, {"witch": {mult: 2, bonus: 10}});
				if (e) {
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "ConjureQuest", -1);
							KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
							ee.faction = "DubiousWitch";
							if (KDCanOverrideAI(ee))
								ee.AI = "guard";
							else ee.AI = KDGetAIOverride(ee, 'guard');
							ee.gxx = point.x;
							ee.gyy = point.y;
							ee.spawnX = point.x;
							ee.spawnY = point.y;
						}
					}
				}
			}

			count = 3 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["apprentice", "witch"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["mage"], undefined, {"witch": {mult: 4, bonus: 10}, "apprentice": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
				let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
				if (e && epoint) {
					let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
					if (ee) {
						KinkyDungeonSetEnemyFlag(ee, "ConjureQuest", -1);
						KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
						ee.faction = "DubiousWitch";
						if (KDCanOverrideAI(ee))
							ee.AI = "guard";
						else ee.AI = KDGetAIOverride(ee, 'guard');
						ee.gxx = point.x;
						ee.gyy = point.y;
						ee.spawnX = point.x;
						ee.spawnY = point.y;
					}
				}
			}

		}
	}, 1, ["dressRestraints", "latexRestraints"]),

	"ElementsQuest": KDGenQuestTemplate("ElementsQuest", "DemonStar", "Elements", (_goddess, _flag) => {
		let point = KinkyDungeonGetRandomEnemyPoint(true);
		if (point) {
			let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["demon", "miniboss"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["demon", "miniboss"], undefined, {"demon": {mult: 2, bonus: 10}});
				if (e) {
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "ElementsQuest", -1);
							KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
							ee.faction = "Extraplanar";
							if (KDCanOverrideAI(ee))
								ee.AI = "looseguard";
							else ee.AI = KDGetAIOverride(ee, 'looseguard');
							ee.gxx = point.x;
							ee.gyy = point.y;
							ee.spawnX = point.x;
							ee.spawnY = point.y;
						}
					}
				}
			}

			count = 3 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["demon"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["demon"], undefined, {"demon": {mult: 2, bonus: 10}}, ["miniboss", "boss"]);
				let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
				if (e && epoint) {
					let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
					if (ee) {
						KinkyDungeonSetEnemyFlag(ee, "ElementsQuest", -1);
						KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
						ee.faction = "Extraplanar";
						if (KDCanOverrideAI(ee))
							ee.AI = "looseguard";
						else ee.AI = KDGetAIOverride(ee, 'looseguard');
						ee.gxx = point.x;
						ee.gyy = point.y;
						ee.spawnX = point.x;
						ee.spawnY = point.y;
					}
				}
			}

		}
	}, 1, ["steelbondage", "crystalRestraints", "leatherRestraints", "leatherRestraintsHeavy"]),

	"IllusionQuest": KDGenQuestTemplate("IllusionQuest", "DragonShadow", "Illusion", (_goddess, _flag) => {
		let point = KinkyDungeonGetRandomEnemyPoint(true);
		if (point) {
			let count = 1 + KDRandom() * Math.min(3, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["shadowclan", "miniboss"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["shadowclan", "miniboss"], undefined, {"shadowclan": {mult: 2, bonus: 10}});
				if (e) {
					let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
					if (epoint) {
						let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
						if (ee) {
							KinkyDungeonSetEnemyFlag(ee, "IllusionQuest", -1);
							KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
							ee.faction = "ShadowClan";
							if (KDCanOverrideAI(ee))
								ee.AI = "guard";
							else ee.AI = KDGetAIOverride(ee, 'guard');
							ee.gxx = point.x;
							ee.gyy = point.y;
							ee.spawnX = point.x;
							ee.spawnY = point.y;
						}
					}
				}
			}
			count = 4 + KDRandom() * Math.min(8, KDGetEffLevel()/3);
			for (let i = 0; i < count; i++) {
				let e = KinkyDungeonGetEnemy(["shadowclan"], MiniGameKinkyDungeonLevel + 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
					["shadowclan"], undefined, {"shadowclan": {mult: 2, bonus: 10}}, ["miniboss", "boss"]);
				let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
				if (e && epoint) {
					let ee = DialogueCreateEnemy(epoint.x, epoint.y, e.name);
					if (ee) {
						KinkyDungeonSetEnemyFlag(ee, "IllusionQuest", -1);
						KinkyDungeonSetEnemyFlag(ee, "questtarget", -1);
						ee.faction = "ShadowClan";
						if (KDCanOverrideAI(ee))
							ee.AI = "guard";
						else ee.AI = KDGetAIOverride(ee, 'guard');
						ee.gxx = point.x;
						ee.gyy = point.y;
						ee.spawnX = point.x;
						ee.spawnY = point.y;
					}
				}
			}

		}
	}, 1, ["shadowLatexRestraints", "shadowLatexRestraintsHeavy", "obsidianRestraints"])
};



function KDQuestList(count: number, mods: Record<string, KDQuest>, RoomType: string, MapMod: string, data: any): KDQuest[] {
	let ret: KDQuest[] = [];
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

function KDQuestWorldgenStart(quests: string[]) {
	if (quests) {
		for (let q of quests) {
			if (KDQuests[q] && KDQuests[q].worldgenstart) {
				KDQuests[q].worldgenstart();
			}
		}
	}
}

function KDQuestTick(quests: string[], delta: number) {
	if (quests) {
		for (let q of quests) {
			if (KDQuests[q] && KDQuests[q].tick) {
				KDQuests[q].tick(delta);
			}
		}
	}
}

function KDRemoveQuest(quest: string) {
	if (!KDGameData.Quests)
		KDGameData.Quests = [];
	else if (KDGameData.Quests.indexOf(quest) > -1)
		KDGameData.Quests.splice(KDGameData.Quests.indexOf(quest), 1);
}

function KDAddQuest(quest: string) {
	if (!KDGameData.Quests) KDGameData.Quests = [];
	if (!KDGameData.Quests.includes(quest)) {
		if (KDQuests[quest]?.accept) {
			KDQuests[quest].accept();
		}
		KDGameData.Quests.push(quest);
		KinkyDungeonSendTextMessage(10, TextGet("KDNewQuest"), "#ffffff", 2);
	}
}

function KDHasQuest(quest: string): boolean {
	if (!KDGameData.Quests) return false;
	return KDGameData.Quests.includes(quest);
}

let KDQuestsIndex = 0;
let KDQuestsVisible = 0;
let KDMaxQuests = 7;


function KinkyDungeonDrawQuest() {
	let xOffset = -125;
	let yStart = 200;
	let xStart = 500;
	let spacing = 100;
	let II = 0;
	let ytt = 120;

	if (KDGameData.Quests) {
		for (let q of KDGameData.Quests) {
			if (KDQuests[q]?.visible) {
				if (II < KDQuestsIndex + KDMaxQuests && II >= KDQuestsIndex) {
					let width = 1050;

					FillRectKD(kdcanvas, kdpixisprites, "questrec" + q, {
						Left: xStart + xOffset + 100,
						Top: yStart + (II-KDQuestsIndex)*spacing - 40,
						Width: width,
						Height: 80,
						Color: "#000000",
						LineWidth: 1,
						zIndex: -18,
						alpha: 0.3
					});
					DrawRectKD(kdcanvas, kdpixisprites, "questrec2" + q, {
						Left: xStart + xOffset + 100,
						Top: yStart + (II-KDQuestsIndex)*spacing - 40,
						Width: width,
						Height: 80,
						Color: "#000000",
						LineWidth: 1,
						zIndex: -18,
						alpha: 0.9
					});

					DrawTextFitKD(TextGet("KDQuest_" + q), xStart + xOffset + 200, yStart + (II-KDQuestsIndex)*spacing, 850, "#ffffff", KDTextGray0, 28, "left");
					KDDraw(kdcanvas, kdpixisprites, "kdquest" + q, KinkyDungeonRootDirectory + "Enemies/" + KDQuests[q]?.npc + ".png",
						xStart + xOffset + 100, yStart + (II-KDQuestsIndex)*spacing - 36, 72, 72);
					if (DrawButtonKDEx("kdquestquit" + q, (_b) => {
						if (!KDQuests[q]?.nocancel)
							KDRemoveQuest(q);
						return true;
					}, true, xStart + xOffset + 1200, yStart + (II-KDQuestsIndex)*spacing - 36, 220, 72,
					TextGet("KDQuestListCancel"), KDQuests[q]?.nocancel ? KDTextGray3 : "#ffffff",
					KinkyDungeonRootDirectory + "UI/X.png", "", false, true, KDButtonColor, undefined, true))
						DrawTextFitKD(TextGet(KDQuests[q]?.nocancel ? "KDQuestListDescCancelFail" : "KDQuestListDescCancel"),
							xStart + xOffset + 625, ytt, 1000, "#ffffff", KDTextGray0, 20, "center", 70);
				}

				II++;
			}
		}
	}

	KDQuestsVisible = II;

	if (KDQuestsVisible == 0) {
		let x = 1225 + xOffset;

		DrawTextFitKD(TextGet("KDNoQuests"), x, 300, 1050, "#ffffff", KDTextGray0, 24);
		//DrawTextFitKD(TextGet("KDNoQuests"),
		//xStart + xOffset + 625, ytt, 1000, "#ffffff", KDTextGray0, 20, "center", 70);
	}

	if (KDQuestsVisible > KDMaxQuests) {
		DrawButtonKDEx("questUp", (_b) => {
			KDQuestsIndex -= 2;
			return true;
		}, true, xStart, yStart - spacing, 90, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Up.png");
		DrawButtonKDEx("questDown", (_b) => {
			KDQuestsIndex += 2;
			return true;
		}, true, xStart, yStart + KDMaxQuests*spacing, 90, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Down.png");


		KDQuestsIndex = Math.max(0, Math.min(KDQuestsIndex, KDQuestsVisible - Math.round(KDMaxQuests/2)));
	} else {
		KDQuestsIndex = 0;
	}


	KDDrawLoreRepTabs(xOffset);
}

function KDGetQuestData(quest: string): any {
	if (KDGameData.QuestData) return KDGameData.QuestData[quest] || {};
	return {};
}

function KDSetQuestData(quest: string, data: any) {
	if (!KDGameData.QuestData) KDGameData.QuestData = {};
	KDGameData.QuestData[quest] = data;
}

/**
 * @param Name
 * @param Icon
 * @param Goddess
 * @param spawnFunction
 * @param restraintsCountMult
 * @param restraintsTags
 * @param [Loot]
 * @param [Rep]
 */
function KDGenQuestTemplate(Name: string, Icon: string, Goddess: string, spawnFunction: (Goddess: string, Flag: string) => void, restraintsCountMult: number, restraintsTags: string[], Loot?: string, Rep: number = KDDefaultGoddessQuestRep): KDQuest {
	if (!Loot) Loot = Name;
	let quest: KDQuest = {
		name: Name,
		npc: Icon,
		visible: true,
		nocancel: true,
		accept: () => {
			if (KinkyDungeonStatsChoice.get("BoundCrusader")) {
				KDPlayerEffectRestrain(undefined, 1, restraintsTags, "Goddess", false, true, false, false, false, "Divine", {
					Progressive: false,
					ProgressiveSkip: false,
					DontPreferWill: false,
					Keep: true,
				});
				for (let i = 0; i < 2; i++) {
					KDPlayerEffectRestrain(undefined, 1, restraintsTags, "Goddess", false, true, false, false, false, "Divine", {
						Progressive: true,
						ProgressiveSkip: true,
						DontPreferWill: false,
						Keep: true,
					});
				}
			}
			KDSetQuestData(Name, {
				QuestLocation: KDCurrentWorldSlot,
				QuestRoom: KDMapData.RoomType,
			});
			KDMapData.QuestsAccepted++;
			KinkyDungeonSetFlag(Name, -1, -1);
			spawnFunction(Goddess, Name);
		},
		worldgenstart: () => {
		},
		tick: (delta) => {
			if (KDMapData.RoomType == "PerkRoom") {
				KDRemoveQuest(Name);
				KinkyDungeonChangeRep(Goddess, -KDDefaultGoddessQuestRep);
				KinkyDungeonSendTextMessage(10, TextGet("KDQuestFail_" + Name), "#ffffff", 1);
				KDPlayerEffectRestrain(undefined, Math.round(restraintsCountMult * (1 + KDGetEffLevel()/3)), restraintsTags, "Goddess", false, true, false, false, false, "Divine", {
					Progressive: true,
					DontPreferWill: true,
					Keep: true,
				});
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Evil" + ".ogg");
				KinkyDungeonSendEvent("afterFailGoddessQuest", {quest: Name, goddess: Goddess});
			}
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
					KinkyDungeonLoot(KDGetEffLevel(), (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), Name);
				}
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");

				KinkyDungeonChangeRep(Goddess, (!KinkyDungeonFlags.get("QuestFirstRep")) ? 2.5 + Rep : Rep);
				KinkyDungeonSetFlag("QuestFirstRep", -1, 1);
				KinkyDungeonSendTextMessage(10, TextGet("KDQuestSucceed" + (KinkyDungeonGoddessRep.Ghost > 1 ? "Sub" : "") + "_" + Name), "#ffffff", 1);
				KDRemoveQuest(Name);
				for (let inv of KinkyDungeonAllRestraintDynamic()) {
					if (inv.item.lock == "Divine") KinkyDungeonLock(inv.item, "");
				}
			}
		},
		weight: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return 10;
		},
		prerequisite: (_RoomType, _MapMod, _data, _currentQuestList) => {
			return false;
		},
		tags: [Goddess],
	};

	return quest;
}
