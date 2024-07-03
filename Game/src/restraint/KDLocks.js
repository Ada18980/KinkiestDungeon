"use strict";



/**
 * @type {Record<string, KDLockType>}
 */
let KDLocks = {
	"Rubber": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return Enemy?.Enemy?.tags.rubber || Enemy?.Enemy?.tags.slime || Enemy?.Enemy?.tags.latex;
		},
		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return false;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 0;
		},

		consume_key: false,
		lockmult: 1.1,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.5, // Multiplies the picking rate
		pick_diff: -0.1, // Added to the item's pick difficulty

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return false;
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Knife",
		canUnlock: (data) => {
			return KinkyDungeonGetAffinity(false, "Sharp");
		},
		doUnlock: (data) => {
			return true;
		},
		removeKeys: (data) => {

		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: false,
		loot_locked: true,
	},
	"Cyber": {
		specialActions: (tile, player) => {
			KDCyberActions(tile, player, 20);
		},
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return Enemy?.Enemy?.tags.robot || Enemy?.Enemy?.tags.cyborg || Enemy?.Enemy?.tags.dollsmith || Enemy?.Enemy?.tags.cyberaccess || KDEnemyHasFlag(Enemy, "cyberaccess");
		},

		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return false;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 0;
		},

		consume_key: false,
		lockmult: 2.9,
		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.5, // Multiplies the picking rate
		pick_diff: -0.1, // Added to the item's pick difficulty

		hackPick: true,

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return false;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "KeyCard",
		canUnlock: (data) => {
			return KinkyDungeonInventoryGet("KeyCard") != undefined;
		},
		unlock_diff: -1.0,
		doUnlock: (data) => {
			return KDCyberUnlock(data, 20);
		},
		removeKeys: (data) => {

		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: false,
		loot_locked: false,
	},
	"Cyber2": {
		specialActions: (tile, player) => {
			KDCyberActions(tile, player, 50);
		},
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return Enemy?.Enemy?.tags.robot || Enemy?.Enemy?.tags.cyborg || Enemy?.Enemy?.tags.dollsmith || Enemy?.Enemy?.tags.cyberaccess || KDEnemyHasFlag(Enemy, "cyberaccess");
		},

		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return false;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 0;
		},

		consume_key: false,
		lockmult: 3.15,
		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.5, // Multiplies the picking rate
		pick_diff: -0.1, // Added to the item's pick difficulty

		hackPick: true,

		penalty: {
			"Struggle": 0.25,
			"Cut": 0.2,
		},

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return false;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "KeyCard",
		canUnlock: (data) => {
			return KinkyDungeonInventoryGet("KeyCard") != undefined;
		},
		unlock_diff: -1.0,
		doUnlock: (data) => {
			return KDCyberUnlock(data, 50);
		},
		removeKeys: (data) => {

		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: false,
		loot_locked: false,
	},
	"Cyber3": {
		specialActions: (tile, player) => {
			KDCyberActions(tile, player, 150);
		},
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return Enemy?.Enemy?.tags.robot || Enemy?.Enemy?.tags.cyborg || Enemy?.Enemy?.tags.dollsmith || Enemy?.Enemy?.tags.cyberaccess || KDEnemyHasFlag(Enemy, "cyberaccess");
		},

		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return false;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 0;
		},

		penalty: {
			"Struggle": 0.35,
			"Cut": 0.35,
		},

		consume_key: false,
		lockmult: 3.5,
		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.5, // Multiplies the picking rate
		pick_diff: -0.1, // Added to the item's pick difficulty

		hackPick: true,

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return false;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "KeyCard",
		canUnlock: (data) => {
			return KinkyDungeonInventoryGet("KeyCard") != undefined;
		},
		unlock_diff: -1.0,
		doUnlock: (data) => {
			return KDCyberUnlock(data, 150);
		},
		removeKeys: (data) => {

		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: false,
		loot_locked: false,
	},
	"White": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 0;
		},
		filter: (Guaranteed, Floor, AllowGold, Type) => {
			return Floor < 11;
		},
		weight: (Guaranteed, Floor, AllowGold, Type) => {
			return Math.max(10, 100 - Floor * 10);
		},

		consume_key: false,
		lockmult: 1.4,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.5, // Multiplies the picking rate
		pick_diff: -0.1, // Added to the item's pick difficulty

		canPick: (data) => {
			return true;
		},
		doPick: (data) => {
			return true;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return KDRandom()*1.5 < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (data) => {
			return KinkyDungeonRedKeys > 0 || KinkyDungeonInventoryGet("CuffKeys") != undefined;
		},
		doUnlock: (data) => {
			return true;
		},
		removeKeys: (data) => {
			if (data?.unlock && !KinkyDungeonInventoryGet("CuffKeys") && KinkyDungeonRedKeys > 0) {
				KinkyDungeonRedKeys -= 1;
				KinkyDungeonSendTextMessage(4, TextGet("KDConvertToHandcuffsKey"), "lightgreen", 2);
				KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("CuffKeys"), 1);
			} else if (!data?.unlock) {
				if (KinkyDungeonRedKeys > 0) {
					KinkyDungeonRedKeys -= 1;
					KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
				} else if (KinkyDungeonInventoryGet("CuffKeys")) {
					KinkyDungeonDropItem({name: "CuffKeys"}, KinkyDungeonPlayerEntity, true, true);
					KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("CuffKeys"), -1);
				}
			}
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: false,
		loot_locked: true,
	},
	"Red": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 1;
		},
		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return true;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 50;
		},

		consume_key: true,
		lockmult: 1.7,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (data) => {
			return true;
		},
		doPick: (data) => {
			return true;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return KDRandom() < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (data) => {
			return KinkyDungeonRedKeys > 0;
		},
		doUnlock: (data) => {

			return true;
		},
		removeKeys: (data) => {
			KinkyDungeonRedKeys -= 1;
			if (!data?.unlock) {
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: false,
		loot_locked: true,
	},
	"Red_Med": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 1;
		},
		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return true;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 15 + Floor * 3;
		},

		consume_key: true,
		lockmult: 1.8,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty
		pick_lim: 0.15, // Added to the item's pick limitchance

		canPick: (data) => {
			return true;
		},
		doPick: (data) => {
			return true;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return KDRandom() < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (data) => {
			return KinkyDungeonRedKeys > 0;
		},
		doUnlock: (data) => {

			return true;
		},
		removeKeys: (data) => {
			KinkyDungeonRedKeys -= 1;
			if (!data?.unlock) {
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: false,
		loot_locked: true,
	},
	"Red_Hi": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 1;
		},
		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return true;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 15 + Floor * 3;
		},

		consume_key: true,
		lockmult: 1.9,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty
		pick_lim: 0.3, // Added to the item's pick limitchance

		canPick: (data) => {
			return true;
		},
		doPick: (data) => {
			return true;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return KDRandom() < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (data) => {
			return KinkyDungeonRedKeys > 0;
		},
		doUnlock: (data) => {

			return true;
		},
		removeKeys: (data) => {
			KinkyDungeonRedKeys -= 1;
			if (!data?.unlock) {
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: false,
		loot_locked: true,
	},
	"HiSec": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 2;
		},
		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return Floor > 2;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 16 + Floor * 4;
		},

		consume_key: true,
		lockmult: 2.2,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 0.5, // Multiplies the picking rate
		pick_diff: -1.0, // Added to the item's pick difficulty
		pick_lim: 1.0, // Added to the item's pick limitchance

		canPick: (data) => {
			return true;
		},
		doPick: (data) => {
			return true;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return KDRandom() < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (data) => {
			return KinkyDungeonRedKeys > 0;
		},
		doUnlock: (data) => {

			return true;
		},
		removeKeys: (data) => {
			KinkyDungeonRedKeys -= 1;
			if (!data?.unlock) {
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: false,
		loot_locked: true,
	},
	"Disc": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 2;
		},
		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return Floor > 1;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 20 + Floor * 5;
		},

		consume_key: true,
		lockmult: 2,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 0.5, // Multiplies the picking rate
		pick_diff: -0.25, // Added to the item's pick difficulty
		pick_lim: 0.3, // Added to the item's pick limitchance

		canPick: (data) => {
			let pick = KinkyDungeonInventoryGet("DiscPick");
			//if (!data.noMsg) KinkyDungeonSendTextMessage(10, TextGet("KDNeedDiscPick"), "#ffffff", 2, true);
			return pick != undefined;
		},
		doPick: (data) => {
			return true;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return KDRandom() < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (data) => {
			return KinkyDungeonRedKeys > 0;
		},
		doUnlock: (data) => {

			return true;
		},
		removeKeys: (data) => {
			KinkyDungeonRedKeys -= 1;
			if (!data?.unlock) {
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: false,
		loot_locked: true,
	},
	"Blue": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 3 || (Enemy?.Enemy?.unlockCommandLevel > 1 && KDEnemyCanTalk(Enemy));
		},
		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return Type != "Door" && Floor > 4;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 8 * Floor - 30;
		},

		consume_key: true,
		lockmult: 3.0,
		penalty: {
			"Struggle": 0.1,
			"Cut": 0.15,
		},

		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 0.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Break";
		},
		breakChance: (data) => {
			return true;
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Blue",
		canUnlock: (data) => {
			return KinkyDungeonBlueKeys > 0;
		},
		doUnlock: (data) => {
			return true;
		},
		removeKeys: (data) => {
			KinkyDungeonBlueKeys -= 1;
			if (!data?.unlock) {
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: true,
		loot_locked: false,
	},
	"Gold": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 3 || Enemy?.Enemy?.tags.robot || Enemy?.Enemy?.tags.cyborg || (Enemy?.Enemy?.unlockCommandLevel > 2 && KDEnemyCanTalk(Enemy));
		},
		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return AllowGold && Floor > 10;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 2 * Floor - 15;
		},

		consume_key: true,
		lockmult: 3.3,
		penalty: {
			"Struggle": 0.2,
			"Cut": 0.3,
		},

		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 0.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Break";
		},
		breakChance: (data) => {
			return true;
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Mistress",
		canUnlock: (data) => {
			return KinkyDungeonItemCount("MistressKey") > 0;
		},
		doUnlock: (data) => {
			return true;
		},
		removeKeys: (data) => {
			if (!data?.unlock && KinkyDungeonItemCount("MistressKey") > 0) {
				KinkyDungeonDropItem({name: "MistressKey"}, KinkyDungeonPlayerEntity, true);
			}
			KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("MistressKey"), -1);
		},
		failUnlock: (data) => {
			return "Fail";
		},

		doLock: (data) => {
			if (data.item && !data.link) {
				if (!data.item.data) data.item.data = {};
				data.item.data.lockTimer = MiniGameKinkyDungeonLevel + 2;
			}
		},
		// Start of level -- for gold locks and others
		levelStart: (item, data) => {
			if ((MiniGameKinkyDungeonLevel >= item.data?.lockTimer || !item.data?.lockTimer || item.data?.lockTimer >= KinkyDungeonMaxLevel)) {
				KinkyDungeonLock(item, "Blue");
				KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonGoldLockRemove"), "yellow", 2);
			}
		},
		shrineImmune: true,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: true,
		loot_locked: false,
	},
	"Divine": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 4 || Enemy?.Enemy?.tags.angel || Enemy?.Enemy?.tags.holy;
		},
		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return false;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 0;
		},

		consume_key: false,
		lockmult: 5,
		penalty: {
			"Struggle": 50,
			"Cut": 50,
		},

		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 0.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Break";
		},
		breakChance: (data) => {
			return true;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Blue",
		canUnlock: (data) => {
			return false;
		},
		doUnlock: (data) => {
			return true;
		},
		removeKeys: (data) => {
			//
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks and others
		levelStart: (item) => {
			KinkyDungeonSendTextMessage(8, TextGet("KDDivineLockReminder"), "#ffff44", 2, false, true);
		},
		shrineImmune: true,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: true,
		loot_locked: false,
	},
	"Divine2": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 4 || Enemy?.Enemy?.tags.angel || Enemy?.Enemy?.tags.holy;
		},
		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return false;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 0;
		},

		consume_key: false,
		lockmult: 5,
		penalty: {
			"Struggle": 50,
			"Cut": 50,
		},

		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 0.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Break";
		},
		breakChance: (data) => {
			return true;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Blue",
		canUnlock: (data) => {
			return false;
		},
		doUnlock: (data) => {
			return true;
		},
		removeKeys: (data) => {
			//
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks and others
		levelStart: (item) => {
		},
		shrineImmune: true,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: false,
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: true,
		loot_locked: false,
	},
	"Purple": {
		canNPCPass: (xx, yy, MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 3 || (Enemy?.Enemy?.unlockCommandLevel > 0 &&KDEnemyCanTalk(Enemy));
		},
		filter: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return true;
		},
		weight: (Guaranteed, Floor, AllowGold, Type, Data) => {
			return 30 + 30 * (Data?.enemy?.Enemy.unlockCommandLevel > 0 ? Data?.enemy?.Enemy.unlockCommandLevel : (Data?.enemy ? -1 : 0));
		},

		consume_key: false,
		lockmult: 2.2,

		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 0.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return false;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Blue",
		canUnlock: (data) => {
			return false;
		},
		doUnlock: (data) => {
			return true;
		},
		removeKeys: (data) => {
			//
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 1, // rather than calling the function (which could vary) this is for classifying the lock
		commandable: true,
		command_lesser: () => {return 1.0 ;},
		command_greater: () => {return 3.0;},
		command_supreme: () => {return 10.0;},

		loot_special: false,
		loot_locked: true,
	},
};

/**
 *
 * @param {entity} player
 * @returns {boolean}
 */
function KDCyberHostile(player) {
	let faction = player.player ? "Player" : KDGetFaction(player);
	if (faction == "Player") {
		return KDGameData.HostileFactions.includes("AncientRobot") || (
			KDGameData.PrisonerState == 'chase' && KDFactionRelation(KDGetMainFaction(), "AncientRobot") > 0.11
		);
	}
	return KDFactionRelation(faction, "AncientRobot") < -0.45;
}

/**
 *
 * @param {entity} player
 * @returns {boolean}
 */
function KDCyberAccess(player) {
	let faction = player.player ? "Player" : KDGetFaction(player);
	if (faction == "Player") {
		return !KDGameData.HostileFactions.includes("AncientRobot")
		&& !(KDGameData.PrisonerState == 'chase' && KDFactionRelation(KDGetMainFaction(), "AncientRobot") > 0.11)
		&& KDFactionRelation(faction, "AncientRobot") > 0.25
		;
	}
	return KDFactionRelation(faction, "AncientRobot") > 0.25;
}

/**
 *
 * @param {entity} player
 * @returns {boolean}
 */
function KDCyberLink(player) {
	if (player.player) {
		return KinkyDungeonPlayerTags.get("CyberLink") || KinkyDungeonFlags.get("CyberLink");
	}
	return player.Enemy?.tags.cyberlink;
}
/**
 *
 * @param {entity} player
 * @returns {boolean}
 */
function KDTryHack(player) {
	return KDRandom() < (KDCyberLink(player) ? 0.5 : 0);
}

function KDCyberUnlock(data, base = 20) {
	KDLockoutGain(KinkyDungeonPlayerEntity, data, base);
	KDGameData.LockoutChance = Math.min((KDGameData.LockoutChance || 0) + data.lockoutgain, 1);
	if (KDLockoutChance(KinkyDungeonPlayerEntity) >= 0.99) {
		data.lockout = true;
		KinkyDungeonSendEvent("beforelockout", data);
		if (data.lockout) {
			KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("KeyCard"), -1);
			KinkyDungeonSendTextMessage(10, TextGet("KDLockoutTickEnd").replace("AMNT", "" + Math.round(KDGameData.LockoutChance * 100)), "#ff5277", 2);
			KinkyDungeonSendTextMessage(10, TextGet("KDLockout"), "#ff5277", 2);
			KinkyDungeonSendEvent("lockout", data);
		}
	} else {
		KinkyDungeonSendTextMessage(10, TextGet("KDLockoutTick").replace("AMNT", "" + Math.round(KDGameData.LockoutChance * 100)), "#ff5277", 2);
	}
	return true;
}

function KDCyberActions(data, player, base) {
	DrawButtonKDEx("ModalDoorSwipe", () => {
		KDSendInput("swipe", {targetTile: KinkyDungeonTargetTileLocation, base: base});
		return true;
	}, true, KDModalArea_x + 175, KDModalArea_y + 25, 250, 60, TextGet("KinkyDungeonSwipeDoor"),
	(KinkyDungeonInventoryGet("KeyCard")) ? "#ffffff" : "#ff5555", "", "");

	DrawButtonKDEx("ModalDoorScan", () => {
		KDSendInput("scan", {targetTile: KinkyDungeonTargetTileLocation, base: base});
		return true;
	}, true, KDModalArea_x + 450, KDModalArea_y + 25, 250, 60, TextGet("KinkyDungeonScanDoor"),
	!KDIsBlindfolded(player)
		? "#ffffff" : "#ff5555", "", "");

	DrawButtonKDEx("ModalDoorHack", () => {
		KDSendInput("hack", {targetTile: KinkyDungeonTargetTileLocation, base: base});
		return true;
	}, true, KDModalArea_x + 725, KDModalArea_y + 25, 250, 60, TextGet("KinkyDungeonHackDoor"),
	KDCanHack(player)
		? "#ffffff" : "#ff5555", "", "");
}