"use strict";



/**
 * @type {Record<string, KDLockType>}
 */
let KDLocks = {
	"Rubber": {
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
			DrawButtonKDEx("ModalDoorSwipe", () => {
				KDSendInput("swipe", {targetTile: KinkyDungeonTargetTileLocation});
				return true;
			}, true, KDModalArea_x + 175, KDModalArea_y + 25 - 75, 125, 60, TextGet("KinkyDungeonSwipeDoor"),
			(KinkyDungeonInventoryGet("KeyCard")) ? "#ffffff" : "#ff5555", "", "");

			DrawButtonKDEx("ModalDoorScan", () => {
				KDSendInput("scan", {targetTile: KinkyDungeonTargetTileLocation});
				return true;
			}, true, KDModalArea_x + 325, KDModalArea_y + 25 - 75, 125, 60, TextGet("KinkyDungeonScanDoor"),
			KDIsBlindfolded(player)
				? "#ffffff" : "#ff5555", "", "");

			DrawButtonKDEx("ModalDoorHack", () => {
				KDSendInput("hack", {targetTile: KinkyDungeonTargetTileLocation});
				return true;
			}, true, KDModalArea_x + 475, KDModalArea_y + 25 - 75, 125, 60, TextGet("KinkyDungeonHackDoor"),
			KDCanHack(player)
				? "#ffffff" : "#ff5555", "", "");
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
			return false;
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
		loot_locked: false,
	},
	"White": {
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
			KinkyDungeonRedKeys -= 1;
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
			KinkyDungeonRedKeys -= 1;
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
			KinkyDungeonRedKeys -= 1;
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
			KinkyDungeonRedKeys -= 1;
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
			KinkyDungeonRedKeys -= 1;
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
