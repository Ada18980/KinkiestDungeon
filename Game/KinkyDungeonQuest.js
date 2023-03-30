"use strict";

let QuestCompleteWeight = 1000;

/**
 * @type {Record<string, any>}
 */
let KDQuests = {
	"DressmakerQuest": {
		name: "DressmakerQuest",
		npc: "DressmakerQuest",
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
		weight: (RoomType, MapMod, data) => {
			if (RoomType == "Tunnel") {
				let weight = 15;
				if (KinkyDungeonPlayerTags.has("BindingDress")) {
					return weight * QuestCompleteWeight;
				}
				return weight;
			}
			return 0;
		},
		prerequisite: (RoomType, MapMod, data) => {
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
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel) && !KinkyDungeonFlags.get("ApprenticeQuestSpawn")) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					KinkyDungeonSummonEnemy(point.x, point.y, "Librarian", 1, 2.9);
				}
				KinkyDungeonSetFlag("ApprenticeQuestSpawn", -1);

			}
		},
		weight: (RoomType, MapMod, data) => {
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
		prerequisite: (RoomType, MapMod, data) => {
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
		weight: (RoomType, MapMod, data) => {
			if (RoomType == "Tunnel") {
				let weight = 20;
				return weight;
			}
			return 0;
		},
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					KinkyDungeonSummonEnemy(point.x, point.y, "DragonLeaderDuelist", 1, 2.9);
				}
				KDRemoveQuest("DragonheartQuest"); // Only lasts 1 floor
			}
		},
		prerequisite: (RoomType, MapMod, data) => {
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
		weight: (RoomType, MapMod, data) => {
			if (RoomType == "Tunnel") {
				let weight = 20;
				return weight;
			}
			return 0;
		},
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					let e = KinkyDungeonGetEnemy(["maid", "miniboss"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["maid", "miniboss"], false, {"maid": {mult: 4, bonus: 10}});
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								ee.faction = "Delinquent";
								ee.factionrep = {"Maidforce": 0.01};
								ee.AI = "looseguard";
							}
						}
					}
					let count = 3 + KDRandom() * Math.min(4, KinkyDungeonDifficulty / 20);
					for (let i = 0; i < count; i++) {
						e = KinkyDungeonGetEnemy(["maid"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["maid"], false, {"maid": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								ee.faction = "Delinquent";
								ee.factionrep = {"Maidforce": 0.0025};
								ee.AI = "looseguard";
							}
						}
					}
				}
				KDRemoveQuest("MaidforceQuest"); // Only lasts 1 floor
			}
		},
		prerequisite: (RoomType, MapMod, data) => {
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
		npc: "MaidforceQuest",
		weight: (RoomType, MapMod, data) => {
			return 0;
		},
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					let e = KinkyDungeonGetEnemy(["wolfgirl", "miniboss"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["wolfgirl", "miniboss"], false, {"wolfgirl": {mult: 4, bonus: 10}});
					if (e) {
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								ee.faction = "Wolfhunter";
								ee.AI = "looseguard";
							}
						}
					}
					let count = 3 + KDRandom() * Math.min(4, KinkyDungeonDifficulty / 20);
					for (let i = 0; i < count; i++) {
						e = KinkyDungeonGetEnemy(["nevermere"], MiniGameKinkyDungeonLevel + 2, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["nevermere"], false, {"wolfgirl": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
						let epoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, false);
						if (epoint) {
							let ee = DialogueCreateEnemy(point.x, point.y, e.name);
							if (ee) {
								ee.faction = "Wolfhunter";
								ee.AI = "looseguard";
							}
						}
					}
				}
			}
		},
		prerequisite: (RoomType, MapMod, data) => {
			return false;
		}
	},
	"BanditQuest": {
		name: "BanditQuest",
		npc: "BanditQuest",
		weight: (RoomType, MapMod, data) => {
			if (RoomType == "Tunnel") {
				let weight = 20;
				return weight;
			}
			return 0;
		},
		worldgenstart: () => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					point = KinkyDungeonNearestJailPoint(point.x, point.y);
					if (point) {
						KinkyDungeonSummonEnemy(point.x, point.y, "PrisonerBandit", 1, 1.5);
					}
				}
				KDRemoveQuest("BanditPrisoner"); // Only lasts 1 floor
			}
		},
		prerequisite: (RoomType, MapMod, data) => {
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
		weight: (RoomType, MapMod, data) => {
			return 100;
		},
		prerequisite: (RoomType, MapMod, data) => {
			if (RoomType == "Tunnel") {
				return true;
			}
			return false;
		}
	},
};



function KDQuestList(count, mods, RoomType, MapMod, data) {
	let ret = [];
	for (let i = 0; i < count; i++) {
		let genWeightTotal = 0;
		let genWeights = [];

		for (let mod of Object.values(mods)) {
			if (!ret.includes(mod) && mod.prerequisite(RoomType, MapMod, data)) {
				genWeights.push({mod: mod, weight: genWeightTotal});
				genWeightTotal += mod.weight(RoomType, MapMod, data);
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

function KDQuestTick(quests) {
	if (quests) {
		for (let q of quests) {
			if (KDQuests[q] && KDQuests[q].worldgenstart) {
				KDQuests[q].worldgenstart();
			}
		}
	}
}

function KDRemoveQuest(quest) {
	if (!KDGameData.Quests)
		KDGameData.Quests = [];
	else
		KDGameData.Quests.splice(KDGameData.Quests.indexOf(quest), 1);
}
function KDAddQuest(quest) {
	if (!KDGameData.Quests) KDGameData.Quests = [];
	if (!KDGameData.Quests.includes(quest)) {
		if (KDQuests[quest]?.accept) {
			KDQuests[quest].accept();
		}
		KDGameData.Quests.push(quest);
	}
}

function KDHasQuest(quest) {
	if (!KDGameData.Quests) return false;
	return KDGameData.Quests.includes(quest);
}