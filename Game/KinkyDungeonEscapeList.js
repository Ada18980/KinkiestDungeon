"use strict";

let KinkyDungeonEscapeTypes = {
	"None": {
		selectValid: false,
		check: () => {
			return true;
		},
		minimaptext: () => {
			let escape = KinkyDungeonEscapeTypes.None.check();
			if (escape)
				return TextGet("KDEscapeMinimap_Pass_None");
			else
				return TextGet("KDEscapeMinimap_Fail_None");
		},
		doortext: () => {
			return TextGet("KDEscapeDoor_None");
		},
	},
	"Key": {
		selectValid: true,
		worldgenstart: () => {
			let quota = 1;
			if (KinkyDungeonStatsChoice.get("escapekey")) {
				KDMapData.KeyQuota = quota;
			} else {
				if (KinkyDungeonStatsChoice.get("extremeMode")) quota = 3;
				else if (KinkyDungeonStatsChoice.get("hardMode")) quota = 2;
				let data = {number: quota};
				KinkyDungeonSendEvent("calcEscapeKeyQuota", data);
				KDMapData.KeyQuota = data.number;
			}
		},
		check: () => {
			return KDMapData.KeysHeld >= KDMapData.KeyQuota;

		},
		minimaptext: () => {
			let escape = KinkyDungeonEscapeTypes.Key.check();
			if (escape)
				return TextGet("KDEscapeMinimap_Pass_Key");
			else
				return TextGet("KDEscapeMinimap_Fail_Key").replace("NUMBER", (KDMapData.KeyQuota - KDMapData.KeysHeld).toString());
		},
		doortext: () => {
			return TextGet("KDEscapeDoor_Key");
		},
	},
	"Kill": {
		selectValid: true,
		worldgenstart: () => {
			let enemytype = KinkyDungeonGetEnemy([], KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0');
			let enemynumber = 3;
			if (KinkyDungeonStatsChoice.get("extremeMode")) enemynumber = 5;
			else if (KinkyDungeonStatsChoice.get("hardMode")) enemynumber = 4;

			let data = {enemy: enemytype.name, number: enemynumber};
			KinkyDungeonSendEvent("calcEscapeKillTarget", data);
			KDMapData.KillTarget = data.enemy;
			KDMapData.KillQuota = data.number;
			for (let i = 0; i < data.number; i++) {
				let point = KinkyDungeonGetRandomEnemyPoint(true);
				if (point) {
					let ens = KinkyDungeonSummonEnemy(point.x, point.y, data.enemy, 1, 2.9);
					KinkyDungeonSetEnemyFlag(ens[0], "killtarget", -1);
				}
			}
		},
		check: () => {
			if (!KDMapData.KillTarget) //if this wasnt the escapemethod when this floor was created, spawn targets now
				KinkyDungeonEscapeTypes.Kill.worldgenstart();

			var count = 0;
			for (let enemy of KDMapData.Entities) {
				if (KDEnemyHasFlag(enemy, "killtarget")) {
					count++;
				}
			}
			KDMapData.KillQuota = count;
			return KDMapData.KillQuota <= 0;
		},
		minimaptext: () => {
			let escape = KinkyDungeonEscapeTypes.Kill.check();
			if (escape)
				return TextGet("KDEscapeMinimap_Pass_Kill");
			else
				return TextGet("KDEscapeMinimap_Fail_Kill").replace("NUMBER", KDMapData.KillQuota.toString()).replace("TYPE",TextGet("Name" + KDMapData.KillTarget));
		},
		doortext: () => {
			return TextGet("KDEscapeDoor_Kill");
		},
	},
	"Miniboss": {
		selectValid: true,
		worldgenstart: () => {
			let category = "miniboss";
			if (KinkyDungeonStatsChoice.get("extremeMode")) category = "boss";

			let enemytype = KinkyDungeonGetEnemy([category], KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',[category]);
			if (!enemytype) { //fallback if it cant find a boss
				category = "miniboss";
				enemytype = KinkyDungeonGetEnemy([category], KDGetEffLevel()+4,(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', [category]);
			}
			if (!enemytype) { //fallback if it cant find a miniboss
				category = "witch";
				enemytype = KinkyDungeonGetEnemy([category], KDGetEffLevel()+4,(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', [category]);
			}
			let data = {enemy: enemytype.name};
			KinkyDungeonSendEvent("calcEscapeMinibossTarget", data);
			KDMapData.KillTarget = data.enemy;
			let point = KinkyDungeonGetRandomEnemyPoint(true);
			if (point) {
				let ens = KinkyDungeonSummonEnemy(point.x, point.y, data.enemy, 1, 2.9);
				KinkyDungeonSetEnemyFlag(ens[0], "killtarget", -1);
				if (KinkyDungeonStatsChoice.get("hardMode") || KinkyDungeonStatsChoice.get("extremeMode")) KDMakeHighValue(ens[0]);
			}
		},
		check: () => {
			if (!KDMapData.KillTarget) //if this wasnt the escapemethod when this floor was created, spawn targets now
				KinkyDungeonEscapeTypes.Miniboss.worldgenstart();

			for (let enemy of KDMapData.Entities) {
				if (KDEnemyHasFlag(enemy, "killtarget")) {
					return false;
				}
			}
			return true;
		},
		minimaptext: () => {
			let escape = KinkyDungeonEscapeTypes.Miniboss.check();
			if (escape)
				return TextGet("KDEscapeMinimap_Pass_Miniboss");
			else
				return TextGet("KDEscapeMinimap_Fail_Miniboss").replace("TYPE",TextGet("Name" + KDMapData.KillTarget));
		},
		doortext: () => {
			return TextGet("KDEscapeDoor_Miniboss");
		},
	},
	"Chest": {
		selectValid: true,
		worldgenstart: () => {
			let count = 0;
			for (let X = 1; X < KDMapData.GridWidth - 1; X++) {
				for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
					if (KinkyDungeonMapGet(X, Y) == 'C' && KinkyDungeonTilesGet(X+','+Y)?.Lock == undefined) {
						if (KinkyDungeonFindPath(KDMapData.StartPosition.x, KDMapData.StartPosition.y, X, Y, false, false, false, KinkyDungeonMovableTilesSmartEnemy) != undefined) {
							count++;
						}
					}
				}
			}
			let quota = 5;
			if (KinkyDungeonStatsChoice.get("extremeMode")) {
				quota = 9;
			}
			else if (KinkyDungeonStatsChoice.get("hardMode")){
				quota = 7;
				count = Math.floor(count*.75);
			}
			else {
				count = Math.floor(count*.5);
			}

			if (quota > count) quota = count;
			let data = {number: quota};
			KinkyDungeonSendEvent("calcEscapeChestQuota", data);
			KDMapData.ChestQuota = data.number;
		},
		check: () => {
			if (KDMapData.ChestQuota < 0)
				KinkyDungeonEscapeTypes.Chest.worldgenstart();
			return KDMapData.ChestsOpened >= KDMapData.ChestQuota;
		},
		minimaptext: () => {
			let escape = KinkyDungeonEscapeTypes.Chest.check();
			if (escape)
				return TextGet("KDEscapeMinimap_Pass_Chest");
			else
				return TextGet("KDEscapeMinimap_Fail_Chest").replace("NUMBER", (KDMapData.ChestQuota - KDMapData.ChestsOpened).toString());
		},
		doortext: () => {
			return TextGet("KDEscapeDoor_Chest");
		},
	},
	"Trap": {
		selectValid: true,
		worldgenstart: () => {
			let count = 0;
			for (let X = 1; X < KDMapData.GridWidth - 1; X++) {
				for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
					if (KinkyDungeonTilesGet(X+','+Y)?.Trap != undefined) {
						if (KinkyDungeonFindPath(KDMapData.StartPosition.x, KDMapData.StartPosition.y, X, Y, false, false, false, KinkyDungeonMovableTilesSmartEnemy) != undefined) {
							count++;
						}
					}
				}
			}
			let quota = 10;
			if (KinkyDungeonStatsChoice.get("extremeMode")) {
				quota = 20;
			}
			else if (KinkyDungeonStatsChoice.get("hardMode")){
				quota = 15;
				count = Math.floor(count*.75);
			}
			else {
				count = Math.floor(count*.5);
			}
			if (quota > count) quota = count;
			let data = {number: quota};
			KinkyDungeonSendEvent("calcEscapeTrapQuota", data);
			KDMapData.TrapQuota = data.number;
		},
		check: () => {
			if (KDMapData.TrapQuota < 0)
				KinkyDungeonEscapeTypes.Trap.worldgenstart();
			return KDMapData.TrapsTriggered >= KDMapData.TrapQuota;
		},
		minimaptext: () => {
			let escape = KinkyDungeonEscapeTypes.Trap.check();
			if (escape)
				return TextGet("KDEscapeMinimap_Pass_Trap");
			else
				return TextGet("KDEscapeMinimap_Fail_Trap").replace("NUMBER", (KDMapData.TrapQuota - KDMapData.TrapsTriggered).toString());
		},
		doortext: () => {
			return TextGet("KDEscapeDoor_Trap");
		},
	},
	"Quest": {
		selectValid: true,
		requireMaxQuests: true,
		worldgenstart: () => {
			let quota = 1;
			if (KinkyDungeonStatsChoice.get("extremeMode")) quota = 3;
			else if (KinkyDungeonStatsChoice.get("hardMode")) quota = 2;
			let data = {number: quota};
			KinkyDungeonSendEvent("calcEscapeQuestQuota", data);
			KDMapData.QuestQuota = data.number;
		},
		check: () => {
			if (KDMapData.QuestQuota < 0)
				KinkyDungeonEscapeTypes.Quest.worldgenstart();
			return KDMapData.QuestsAccepted >= KDMapData.QuestQuota;
		},
		minimaptext: () => {
			let escape = KinkyDungeonEscapeTypes.Quest.check();
			if (escape)
				return TextGet("KDEscapeMinimap_Pass_Quest");
			else
				return TextGet("KDEscapeMinimap_Fail_Quest").replace("NUMBER", (KDMapData.QuestQuota - KDMapData.QuestsAccepted).toString());
		},
		doortext: () => {
			return TextGet("KDEscapeDoor_Quest");
		},
	},
	"Boss": {
		selectValid: false,
		check: () => {
			return KinkyDungeonFlags.has("BossUnlocked") || (KDMapData.Entities.length == 0 || KDMapData.Entities.filter((en) => {return en.Enemy?.tags?.stageBoss;}).length == 0);
		},
		minimaptext: () => {
			let escape = KinkyDungeonEscapeTypes.Boss.check();
			if (escape)
				return TextGet("KDEscapeMinimap_Pass_Boss");
			else
				return TextGet("KDEscapeMinimap_Fail_Boss");
		},
		doortext: () => {
			return TextGet("KDEscapeDoor_Boss");
		},
	},
};

function KDEscapeWorldgenStart(method) {
	if (method) {
		if (KinkyDungeonEscapeTypes[method] && KinkyDungeonEscapeTypes[method].worldgenstart) {
			KinkyDungeonEscapeTypes[method].worldgenstart();
		}
	}
}
