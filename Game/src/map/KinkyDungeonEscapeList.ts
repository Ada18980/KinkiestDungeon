"use strict";

interface KinkyDungeonEscapeType {
	selectValid: boolean,
	requireMaxQuests?: boolean,
	filterRandom?: (roomType: string, mapMod: string, level: number, faction: string) => number,
	//filter?: (roomType: string, mapMod: string, level: number, faction: string) => number,
	check: ()=>boolean,
	minimaptext: ()=>string,
	doortext: ()=>string,
	worldgenstart?: ()=>void,
}

let KinkyDungeonEscapeTypes: Record<string, KinkyDungeonEscapeType> = {
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
		filterRandom: (r, m, l, f) => {
			return l > 2 ? 1 : 0;
		},
		worldgenstart: () => {
			let enemytype = KinkyDungeonGetEnemy([], KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
				undefined, undefined, undefined, ["nokillescape"]);
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
					KinkyDungeonSetEnemyFlag(ens[0], "no_pers_wander", -1);
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
	"WolfServer": {
		selectValid: true,

		filterRandom: (roomType, mapMod, level, faction) => {
			return (level > 2 && faction == "Nevermere") ? 10 : 0;
		},

		worldgenstart: () => {
			let enemytype = KinkyDungeonGetEnemy(["wolfServer"], KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
				["wolfServer"], undefined, {"server": {mult: 4, bonus: 10}}, ["nokillescape"]);
			let enemynumber = 3;
			if (KinkyDungeonStatsChoice.get("extremeMode")) enemynumber = 5;
			else if (KinkyDungeonStatsChoice.get("hardMode")) enemynumber = 4;

			let data = {enemy: enemytype.name, number: enemynumber};
			KinkyDungeonSendEvent("calcEscapeWolfServerTarget", data);
			KDMapData.KillTarget = data.enemy;
			KDMapData.KillQuota = data.number;

			let maxBoringness = Math.max(...KDMapExtraData.Boringness);
			for (let i = 0; i < data.number; i++) {
				let point = KinkyDungeonGetRandomEnemyPointCriteria((x, y) => {
					return KinkyDungeonBoringGet(x, y) > 0.3 * maxBoringness;
				}, true, false);
				if (!point) point = KinkyDungeonGetRandomEnemyPointCriteria((x, y) => {
					return KinkyDungeonBoringGet(x, y) > 0;
				}, true, false);
					if (!point) point = KinkyDungeonGetRandomEnemyPoint(true)
				if (point) {
					let ens = KinkyDungeonSummonEnemy(point.x, point.y, data.enemy, 1, 2.9);
					KinkyDungeonSetEnemyFlag(ens[0], "killtarget", -1);
					KinkyDungeonSetEnemyFlag(ens[0], "no_pers_wander", -1);
					ens[0].faction = "Nevermere";

					// Summon some permanent guards

					for (let i = 0; i < 2; i++) {
						let point = KinkyDungeonGetNearbyPoint(ens[0].x, ens[0].y, true);

						if (point) {
							let e = KinkyDungeonGetEnemy(["nevermere"],
								MiniGameKinkyDungeonLevel + 2,
								(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
							["nevermere"], undefined,
							{"wolfgirl": {mult: 4, bonus: 10}}, ["miniboss", "boss"]);
							if (e) {
								let ee = DialogueCreateEnemy(point.x, point.y, e.name);
								if (ee) {
									ee.faction = "Nevermere";
									ee.AI = "looseguard";
									KinkyDungeonSetEnemyFlag(ens[0], "no_pers_wander", -1);
									KDRunCreationScript(ee, KDGetCurrentLocation());
								}
							}
						}
					}
				}
			}
		},
		check: () => {
			if (!KDMapData.KillTarget) //if this wasnt the escapemethod when this floor was created, spawn targets now
				KinkyDungeonEscapeTypes.Kill.worldgenstart();

			if (KDFactionAllied("Player", "Nevermere")) return true;

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
				return TextGet(KDFactionAllied("Player", "Nevermere") ? "KDEscapeMinimap_Bypass_WolfServer" : "KDEscapeMinimap_Pass_WolfServer");
			else
				return TextGet("KDEscapeMinimap_Fail_WolfServer").replace("NUMBER", KDMapData.KillQuota.toString()).replace("TYPE",TextGet("Name" + KDMapData.KillTarget));
		},
		doortext: () => {
			return TextGet("KDEscapeDoor_WolfServer");
		},
	},
	"DroneNode": {
		selectValid: true,

		filterRandom: (roomType, mapMod, level, faction) => {
			if (level < 5) return 0;
			return (faction == "AncientRobot" || faction == "Dollsmith" || faction == "Virus") ? 10 : 0;
		},

		worldgenstart: () => {
			let faction = KDGetMainFaction();
			let robot = (faction == "AncientRobot" || faction == "Virus") ? "robot" : "oldrobot";
			let filter = (faction == "AncientRobot" || faction == "Virus") ? ["oldrobot"] : [];
			let enemytype = KinkyDungeonGetEnemy(["robotServer", robot], KDGetEffLevel(),
				(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0',
				["robotServer", "drone", robot], undefined,
				{"server": {mult: 4, bonus: 10}}, ["nokillescape", ...filter]);
			let enemynumber = 3;
			if (KinkyDungeonStatsChoice.get("extremeMode")) enemynumber = 5;
			else if (KinkyDungeonStatsChoice.get("hardMode")) enemynumber = 4;

			let data = {enemy: enemytype.name, number: enemynumber};
			KinkyDungeonSendEvent("calcEscapeDroneNodeTarget", data);
			KDMapData.KillTarget = data.enemy;
			KDMapData.KillQuota = data.number;

			let maxBoringness = Math.max(...KDMapExtraData.Boringness);
			for (let i = 0; i < data.number; i++) {
				let point = KinkyDungeonGetRandomEnemyPointCriteria((x, y) => {
					return KinkyDungeonBoringGet(x, y) > 0.3 * maxBoringness;
				}, true, false);
				if (!point) point = KinkyDungeonGetRandomEnemyPointCriteria((x, y) => {
					return KinkyDungeonBoringGet(x, y) > 0;
				}, true, false);
					if (!point) point = KinkyDungeonGetRandomEnemyPoint(true)
				if (point) {
					let ens = KinkyDungeonSummonEnemy(point.x, point.y, data.enemy, 1, 2.9);
					KinkyDungeonSetEnemyFlag(ens[0], "killtarget", -1);
					KinkyDungeonSetEnemyFlag(ens[0], "no_pers_wander", -1);
					ens[0].faction = faction;

					// Summon some permanent guards

					for (let i = 0; i < 2; i++) {
						let point = KinkyDungeonGetNearbyPoint(ens[0].x, ens[0].y, true);

						if (point) {
							let e = KinkyDungeonGetEnemy(["drone", robot],
								MiniGameKinkyDungeonLevel + 2,
								(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
								'0',
							["drone", robot], undefined,
							{"drone": {mult: 4, bonus: 10}, [robot]: {mult: 4, bonus: 1}},
							["miniboss", "boss", ...filter]);
							if (e) {
								let ee = DialogueCreateEnemy(point.x, point.y, e.name);
								if (ee) {
									ee.faction = faction;
									ee.AI = "looseguard";
									KinkyDungeonSetEnemyFlag(ens[0], "no_pers_wander", -1);
									KinkyDungeonSetEnemyFlag(ens[0], "led", -1);
									KDRunCreationScript(ee, KDGetCurrentLocation());
								}
							}
						}
					}
				}
			}
		},
		check: () => {
			if (!KDMapData.KillTarget) //if this wasnt the escapemethod when this floor was created, spawn targets now
				KinkyDungeonEscapeTypes.Kill.worldgenstart();

			if (KDFactionAllied("Player", "AncientRobot")) return true;

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
				return TextGet(KDFactionAllied("Player", "Nevermere") ?
				"KDEscapeMinimap_Bypass_DroneNode"
				: "KDEscapeMinimap_Pass_DroneNode");
			else
				return TextGet("KDEscapeMinimap_Fail_DroneNode").replace("NUMBER",
			KDMapData.KillQuota.toString()).replace("TYPE",TextGet("Name" + KDMapData.KillTarget));
		},
		doortext: () => {
			return TextGet("KDEscapeDoor_DroneNode");
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
	"SealSigil": {
		selectValid: false,
		check: () => {
			return KDGameData.DragonCaptured || !!KDGameData.Collection[KDGameData.DragonTarget + ""] || KDGameData.SigilsErased >= KDGameData.SealErasedQuota;
		},
		minimaptext: () => {
			let escape = KinkyDungeonEscapeTypes.SealSigil.check();
			if (escape)
				return TextGet(KDGameData.DragonCaptured ? "KDEscapeMinimap_PassKill_SealSigil"
					: "KDEscapeMinimap_Pass_SealSigil");
			else
				return TextGet("KDEscapeMinimap_Fail_SealSigil").replace("NUMBER",
				"" + Math.round(KDGameData.SealErasedQuota - KDGameData.SigilsErased)
			);
		},
		doortext: () => {
			return TextGet("KDEscapeDoor_SealSigil");
		},
		worldgenstart: () => {
			let quota = 1;
			if (KinkyDungeonStatsChoice.get("extremeMode")) {
				quota = 3;
			}
			else if (KinkyDungeonStatsChoice.get("hardMode")){
				quota = 2;
			}
			let data = {number: quota};

			KinkyDungeonSendEvent("calcEscapeSealSigilQuota", data);
			KDGameData.SealErasedQuota = data.number;
			KDGameData.SigilsErased = 0;
			KDGameData.DragonCaptured = true;

			// Gets all lairs, and if one of them is a persistent dragon we assign it, otherwise fail
			for (let outpost of Object.keys(KDGetWorldMapLocation(
				KDCoordToPoint(
					KDGetCurrentLocation()))?.lairs)) {
				if (KDPersonalAlt[outpost]?.OwnerNPC) {

					let NPC = KDGetPersistentNPC(KDPersonalAlt[outpost]?.OwnerNPC);
					if (NPC && (NPC.trueEntity || NPC.entity)) {
						let enemy = KinkyDungeonGetEnemyByName((NPC.trueEntity || NPC.entity).Enemy);
						if (enemy?.tags?.dragongirl || enemy?.tags?.dragonqueen) {
							KDGameData.DragonTarget = KDPersonalAlt[outpost].OwnerNPC;
							KDGameData.DragonCaptured = false;
							return;
						}
					}
				}
			}
		},
	},
};

function KDEscapeWorldgenStart(method: string) {
	if (method) {
		if (KinkyDungeonEscapeTypes[method] && KinkyDungeonEscapeTypes[method].worldgenstart) {
			KinkyDungeonEscapeTypes[method].worldgenstart();
		}
	}
}
