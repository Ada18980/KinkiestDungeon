"use strict";



let KDLocks: Record<string, KDLockType> = {
	"Rubber": {
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return Enemy?.Enemy?.tags.rubber || Enemy?.Enemy?.tags.slime || Enemy?.Enemy?.tags.latex;
		},
		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return false;
		},
		weight: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return 0;
		},

		consume_key: false,
		lockmult: 1.1,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.5, // Multiplies the picking rate
		pick_diff: -0.1, // Added to the item's pick difficulty

		canPick: (_data) => {
			return false;
		},
		doPick: (_data) => {
			return false;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return false;
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Knife",
		canUnlock: (_data) => {
			return KinkyDungeonGetAffinity(false, "Sharp");
		},
		doUnlock: (_data) => {
			return true;
		},
		removeKeys: (_data) => {

		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
	"Crystal": {
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return Enemy?.Enemy?.tags.crystal || Enemy?.Enemy?.tags.chaos || Enemy?.Enemy?.tags.elemental;
		},
		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return false;
		},
		weight: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return 0;
		},

		consume_key: false,
		lockmult: 2.0,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.5, // Multiplies the picking rate
		pick_diff: -0.1, // Added to the item's pick difficulty

		canPick: (_data) => {
			return false;
		},
		doPick: (_data) => {
			return false;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return false;
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Knife",
		canUnlock: (_data) => {
			return KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax * 0.25;
		},
		doUnlock: (data) => {
			KinkyDungeonSendTextMessage(10, TextGet("KDCrystalUnlock"), "#ffff00", 2);
			KinkyDungeonLock(data.item, "ExCrystal");
			KinkyDungeonChangeDistraction(-1);
			return false;
		},
		removeKeys: (_data) => {

		},
		failUnlock: (_data) => {
			return "Fail";
		},
		penalty: {
			"Struggle": 0.05,
			"Cut": 0.1,
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
	"ExCrystal": {
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 0 || Enemy?.Enemy?.tags.crystal || Enemy?.Enemy?.tags.chaos || Enemy?.Enemy?.tags.elemental;
		},
		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return false;
		},
		weight: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return 0;
		},

		consume_key: false,
		lockmult: 1.5,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.5, // Multiplies the picking rate
		pick_diff: -0.1, // Added to the item's pick difficulty

		canPick: (_data) => {
			return true;
		},
		doPick: (_data) => {
			return true;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return KDRandom()*1.5 < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (_data) => {
			return KinkyDungeonItemCount("RedKey") > 0 || KinkyDungeonInventoryGet("CuffKeys") != undefined;
		},
		doUnlock: (data) => {
			if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.25) {
				KinkyDungeonSendTextMessage(10, TextGet("KDCrystalLock"), "#ffff00", 2);
				KinkyDungeonLock(data.item, "Crystal");
				return false;
			}
			return true;
		},
		removeKeys: (data) => {
			if (data?.unlock && !KinkyDungeonInventoryGet("CuffKeys") && KinkyDungeonItemCount("RedKey") > 0) {
				KDAddConsumable("RedKey", -1);
				KinkyDungeonSendTextMessage(4, TextGet("KDConvertToHandcuffsKey"), "lightgreen", 2);
				KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("CuffKeys"), 1);
			} else if (!data?.unlock) {
				if (KinkyDungeonItemCount("RedKey") > 0) {
					KDAddConsumable("RedKey", -1);
					KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
				} else if (KinkyDungeonInventoryGet("CuffKeys")) {
					KinkyDungeonDropItem({name: "CuffKeys"}, KinkyDungeonPlayerEntity, true, true);
					KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("CuffKeys"), -1);
				}
			}
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return Enemy?.Enemy?.tags.robot || Enemy?.Enemy?.tags.cyborg || Enemy?.Enemy?.tags.dollsmith || Enemy?.Enemy?.tags.cyberaccess || KDEnemyHasFlag(Enemy, "cyberaccess");
		},

		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return false;
		},
		weight: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return 0;
		},

		consume_key: false,
		lockmult: 2.9,
		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.5, // Multiplies the picking rate
		pick_diff: -0.1, // Added to the item's pick difficulty

		hackPick: true,

		canPick: (_data) => {
			return false;
		},
		doPick: (_data) => {
			return false;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return false;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "KeyCard",
		canUnlock: (_data) => {
			return KinkyDungeonInventoryGet("KeyCard") != undefined;
		},
		unlock_diff: -1.0,
		doUnlock: (data) => {
			//if (!data.NoEvent)
			//	KDCyberUnlock(data, 20);
			return true;
		},
		removeKeys: (_data) => {
			if (!_data?.unlock) {
				KDAddConsumable("KeyCard", -1);
				KinkyDungeonDropItem({name: "KeyCard"}, KinkyDungeonPlayerEntity, true);
			} else {
				KDCyberUnlock(_data, 20);
			}
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return Enemy?.Enemy?.tags.robot || Enemy?.Enemy?.tags.cyborg || Enemy?.Enemy?.tags.dollsmith || Enemy?.Enemy?.tags.cyberaccess || KDEnemyHasFlag(Enemy, "cyberaccess");
		},

		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return false;
		},
		weight: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
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

		canPick: (_data) => {
			return false;
		},
		doPick: (_data) => {
			return false;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return false;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "KeyCard",
		canUnlock: (_data) => {
			return KinkyDungeonInventoryGet("KeyCard") != undefined;
		},
		unlock_diff: -1.0,
		doUnlock: (data) => {
			//if (!data.NoEvent)
			//	KDCyberUnlock(data, 50);
			return true;
		},
		removeKeys: (_data) => {
			if (!_data?.unlock) {
				KDAddConsumable("KeyCard", -1);
				KinkyDungeonDropItem({name: "KeyCard"}, KinkyDungeonPlayerEntity, true);
			} else {
				KDCyberUnlock(_data, 50);
			}
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return Enemy?.Enemy?.tags.robot || Enemy?.Enemy?.tags.cyborg || Enemy?.Enemy?.tags.dollsmith || Enemy?.Enemy?.tags.cyberaccess || KDEnemyHasFlag(Enemy, "cyberaccess");
		},

		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return false;
		},
		weight: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
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

		canPick: (_data) => {
			return false;
		},
		doPick: (_data) => {
			return false;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return false;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "KeyCard",
		canUnlock: (_data) => {
			return KinkyDungeonInventoryGet("KeyCard") != undefined;
		},
		unlock_diff: -1.0,
		doUnlock: (data) => {
			//if (!data.NoEvent)
			//	KDCyberUnlock(data, 150);
			return true;
		},
		removeKeys: (_data) => {
			if (!_data?.unlock) {
				KDAddConsumable("KeyCard", -1);
				KinkyDungeonDropItem({name: "KeyCard"}, KinkyDungeonPlayerEntity, true);
			} else {
				KDCyberUnlock(_data, 150);
			}
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 0;
		},
		filter: (_Guaranteed, Floor, _AllowGold, _Type) => {
			return Floor < 11;
		},
		weight: (_Guaranteed, Floor, _AllowGold, _Type) => {
			return Math.max(10, 100 - Floor * 10);
		},

		consume_key: false,
		lockmult: 1.4,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.5, // Multiplies the picking rate
		pick_diff: -0.1, // Added to the item's pick difficulty

		canPick: (_data) => {
			return true;
		},
		doPick: (_data) => {
			return true;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return KDRandom()*1.5 < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (_data) => {
			return KinkyDungeonItemCount("RedKey") > 0 || KinkyDungeonInventoryGet("CuffKeys") != undefined;
		},
		doUnlock: (_data) => {
			return true;
		},
		removeKeys: (data) => {
			if (data?.unlock && !KinkyDungeonInventoryGet("CuffKeys") && KinkyDungeonItemCount("RedKey") > 0) {
				KDAddConsumable("RedKey", -1);
				KinkyDungeonSendTextMessage(4, TextGet("KDConvertToHandcuffsKey"), "lightgreen", 2);
				KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("CuffKeys"), 1);
			} else if (!data?.unlock) {
				if (KinkyDungeonItemCount("RedKey") > 0) {
					KDAddConsumable("RedKey", -1);
					KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
				} else if (KinkyDungeonInventoryGet("CuffKeys")) {
					KinkyDungeonDropItem({name: "CuffKeys"}, KinkyDungeonPlayerEntity, true, true);
					KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("CuffKeys"), -1);
				}
			}
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 1;
		},
		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return true;
		},
		weight: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return 50;
		},

		consume_key: true,
		lockmult: 1.7,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (_data) => {
			return true;
		},
		doPick: (_data) => {
			return true;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return KDRandom() < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (_data) => {
			return KinkyDungeonItemCount("RedKey") > 0;
		},
		doUnlock: (_data) => {

			return true;
		},
		removeKeys: (data) => {
			KDAddConsumable("RedKey", -1);
			if (!data?.unlock) {
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 1;
		},
		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return true;
		},
		weight: (_Guaranteed, Floor, _AllowGold, _Type, _Data) => {
			return 15 + Floor * 3;
		},

		consume_key: true,
		lockmult: 1.8,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty
		pick_lim: 0.15, // Added to the item's pick limitchance

		canPick: (_data) => {
			return true;
		},
		doPick: (_data) => {
			return true;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return KDRandom() < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (_data) => {
			return KinkyDungeonItemCount("RedKey") > 0;
		},
		doUnlock: (_data) => {

			return true;
		},
		removeKeys: (data) => {
			KDAddConsumable("RedKey", -1);
			if (!data?.unlock) {
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 1;
		},
		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return true;
		},
		weight: (_Guaranteed, Floor, _AllowGold, _Type, _Data) => {
			return 15 + Floor * 3;
		},

		consume_key: true,
		lockmult: 1.9,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 1.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty
		pick_lim: 0.3, // Added to the item's pick limitchance

		canPick: (_data) => {
			return true;
		},
		doPick: (_data) => {
			return true;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return KDRandom() < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (_data) => {
			return KinkyDungeonItemCount("RedKey") > 0;
		},
		doUnlock: (_data) => {

			return true;
		},
		removeKeys: (data) => {
			if (!data?.unlock) {
				KDAddConsumable("RedKey", -1);
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 2;
		},
		filter: (_Guaranteed, Floor, _AllowGold, _Type, _Data) => {
			return Floor > 2;
		},
		weight: (_Guaranteed, Floor, _AllowGold, _Type, _Data) => {
			return 16 + Floor * 4;
		},

		consume_key: true,
		lockmult: 2.2,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 0.5, // Multiplies the picking rate
		pick_diff: -1.0, // Added to the item's pick difficulty
		pick_lim: 1.0, // Added to the item's pick limitchance

		canPick: (_data) => {
			return true;
		},
		doPick: (_data) => {
			return true;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return KDRandom() < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (_data) => {
			return KinkyDungeonItemCount("RedKey") > 0;
		},
		doUnlock: (_data) => {

			return true;
		},
		removeKeys: (data) => {
			KDAddConsumable("RedKey", -1);
			if (!data?.unlock) {
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 2;
		},
		filter: (_Guaranteed, Floor, _AllowGold, _Type, _Data) => {
			return Floor > 1;
		},
		weight: (_Guaranteed, Floor, _AllowGold, _Type, _Data) => {
			return 20 + Floor * 5;
		},

		consume_key: true,
		lockmult: 2,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 0.5, // Multiplies the picking rate
		pick_diff: -0.25, // Added to the item's pick difficulty
		pick_lim: 0.3, // Added to the item's pick limitchance

		canPick: (_data) => {
			let pick = KinkyDungeonInventoryGet("DiscPick");
			//if (!data.noMsg) KinkyDungeonSendTextMessage(10, TextGet("KDNeedDiscPick"), "#ffffff", 2, true);
			return pick != undefined;
		},
		doPick: (_data) => {
			return true;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return KDRandom() < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (_data) => {
			return KinkyDungeonItemCount("RedKey") > 0;
		},
		doUnlock: (_data) => {

			return true;
		},
		removeKeys: (data) => {
			KDAddConsumable("RedKey", -1);
			if (!data?.unlock) {
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 3 || (Enemy?.Enemy?.unlockCommandLevel > 1 && KDEnemyCanTalk(Enemy));
		},
		filter: (_Guaranteed, Floor, _AllowGold, Type, _Data) => {
			return Type != "Door" && Floor > 4;
		},
		weight: (_Guaranteed, Floor, _AllowGold, _Type, _Data) => {
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

		canPick: (_data) => {
			return false;
		},
		doPick: (_data) => {
			return false;
		},
		failPick: (_data) => {
			return "Break";
		},
		breakChance: (_data) => {
			return true;
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Blue",
		canUnlock: (_data) => {
			return KinkyDungeonItemCount("BlueKey") > 0;
		},
		doUnlock: (_data) => {
			return true;
		},
		removeKeys: (data) => {
			KDAddConsumable("BlueKey", -1);
			if (!data?.unlock) {
				KinkyDungeonDropItem({name: data.keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			}
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 3 || Enemy?.Enemy?.tags.robot || Enemy?.Enemy?.tags.cyborg || (Enemy?.Enemy?.unlockCommandLevel > 2 && KDEnemyCanTalk(Enemy));
		},
		filter: (_Guaranteed, Floor, AllowGold, _Type, _Data) => {
			return AllowGold && Floor > 10;
		},
		weight: (_Guaranteed, Floor, _AllowGold, _Type, _Data) => {
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

		canPick: (_data) => {
			return false;
		},
		doPick: (_data) => {
			return false;
		},
		failPick: (_data) => {
			return "Break";
		},
		breakChance: (_data) => {
			return true;
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Mistress",
		canUnlock: (_data) => {
			return KinkyDungeonItemCount("MistressKey") > 0;
		},
		doUnlock: (_data) => {
			return true;
		},
		removeKeys: (data) => {
			if (!data?.unlock && KinkyDungeonItemCount("MistressKey") > 0) {
				KinkyDungeonDropItem({name: "MistressKey"}, KinkyDungeonPlayerEntity, true);
			}
			KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("MistressKey"), -1);
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		doLock: (data) => {
			if (data.item && !data.link) {
				if (!data.item.data) data.item.data = {};
				data.item.data.lockTimer = MiniGameKinkyDungeonLevel + 2;
			}
		},
		// Start of level -- for gold locks and others
		levelStart: (item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 4 || Enemy?.Enemy?.tags.angel || Enemy?.Enemy?.tags.holy;
		},
		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return false;
		},
		weight: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
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

		canPick: (_data) => {
			return false;
		},
		doPick: (_data) => {
			return false;
		},
		failPick: (_data) => {
			return "Break";
		},
		breakChance: (_data) => {
			return true;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Blue",
		canUnlock: (_data) => {
			return false;
		},
		doUnlock: (_data) => {
			return true;
		},
		removeKeys: (_data) => {
			//
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks and others
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 4 || Enemy?.Enemy?.tags.angel || Enemy?.Enemy?.tags.holy;
		},
		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return false;
		},
		weight: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
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

		canPick: (_data) => {
			return false;
		},
		doPick: (_data) => {
			return false;
		},
		failPick: (_data) => {
			return "Break";
		},
		breakChance: (_data) => {
			return true;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Blue",
		canUnlock: (_data) => {
			return false;
		},
		doUnlock: (_data) => {
			return true;
		},
		removeKeys: (_data) => {
			//
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks and others
		levelStart: (_item) => {
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
		canNPCPass: (_xx, _yy, _MapTile, Enemy) => {
			return KDEnemyRank(Enemy) > 3 || (Enemy?.Enemy?.unlockCommandLevel > 0 &&KDEnemyCanTalk(Enemy));
		},
		filter: (_Guaranteed, _Floor, _AllowGold, _Type, _Data) => {
			return true;
		},
		weight: (_Guaranteed, _Floor, _AllowGold, _Type, Data) => {
			return 30 + 30 * (Data?.enemy?.Enemy.unlockCommandLevel > 0 ? Data?.enemy?.Enemy.unlockCommandLevel : (Data?.enemy ? -1 : 0));
		},

		consume_key: false,
		lockmult: 2.2,

		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_speed: 0.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (_data) => {
			return false;
		},
		doPick: (_data) => {
			return false;
		},
		failPick: (_data) => {
			return "Fail";
		},
		breakChance: (_data) => {
			return false;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Blue",
		canUnlock: (_data) => {
			return false;
		},
		doUnlock: (_data) => {
			return true;
		},
		removeKeys: (_data) => {
			//
		},
		failUnlock: (_data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (_item) => {
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
 * @returns {boolean}
 */
function KDCyberHostile(player: entity): boolean {
	let faction = player.player ? "Player" : KDGetFaction(player);
	if (faction == "Player") {
		return KDGameData.HostileFactions.includes("AncientRobot") || (
			KDGameData.PrisonerState == 'chase' && KDFactionRelation(KDGetMainFaction(), "AncientRobot") > 0.11
		);
	}
	return KDFactionRelation(faction, "AncientRobot") < -0.45;
}

/**
 * @param player
 */
function KDCyberAccess(player: entity): boolean {
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
 * @param player
 */
function KDCyberLink(player: entity): boolean {
	if (player.player) {
		return KinkyDungeonPlayerTags.get("CyberLink") || KinkyDungeonFlags.get("CyberLink");
	}
	return player.Enemy?.tags.cyberlink;
}
/**
 * @param player
 */
function KDTryHack(player: entity): boolean {
	return KDRandom() < (KDCyberLink(player) ? 0.5 : 0);
}

function KDCyberUnlock(data: any, base: number = 20): boolean {
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

function KDCyberActions(_data: any, player: entity, base: number) {
	DrawButtonKDEx("ModalDoorSwipe", () => {
		if (KinkyDungeonTargetTile)
			KDSendInput("swipe", {targetTile: KinkyDungeonTargetTileLocation, base: base});
		return true;
	}, true, KDModalArea_x + 175, KDModalArea_y + 25, 250, 60, TextGet("KinkyDungeonSwipeDoor"),
	(KinkyDungeonInventoryGet("KeyCard")) ? "#ffffff" : "#ff5555", "", "");

	DrawButtonKDEx("ModalDoorScan", () => {
		if (KinkyDungeonTargetTile)
			KDSendInput("scan", {targetTile: KinkyDungeonTargetTileLocation, base: base});
		return true;
	}, true, KDModalArea_x + 450, KDModalArea_y + 25, 250, 60, TextGet("KinkyDungeonScanDoor"),
	!KDIsBlindfolded(player)
		? "#ffffff" : "#ff5555", "", "");

	DrawButtonKDEx("ModalDoorHack", () => {
		if (KinkyDungeonTargetTile)
			KDSendInput("hack", {targetTile: KinkyDungeonTargetTileLocation, base: base});
		return true;
	}, true, KDModalArea_x + 725, KDModalArea_y + 25, 250, 60, TextGet("KinkyDungeonHackDoor"),
	KDCanHack(player)
		? "#ffffff" : "#ff5555", "", "");
}
