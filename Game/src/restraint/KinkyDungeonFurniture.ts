'use strict';


let KDFurniture = {
	"Cage": {
		floor: "Floor",
		sprite: "Cage",
		restraintTag: "cage",
		restraintSetTags: {
			// fiddle or yoke
			"steelbondage": 1,
			// leash and collar
			"leashing": 2,
		},
		tickFunction: (_delta) => {
			if (!KDGameData.PrisonerState) {
				let power = 0;
				if (KDBoundPowerLevel >= 0.35) power = 2;
				else if (KDBoundPowerLevel >= 0.1) power = 1;
				if (power >= 2) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage2", type: "Sneak", duration: 1, power: 9.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "move", "cast"]});
				} else if (power >= 1) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage2", type: "Sneak", duration: 1, power: 2.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "move", "cast"]});
				}
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), "lightgreen", 1, true);
			}
		}
	},
	"DisplayStand": {
		floor: "Floor",
		sprite: "DisplayStand",
		restraintTag: "displaystand",
		restraintSetTags: {
			"trap": 5,
		},
		tickFunction: (_delta) => {
			if (!KDGameData.PrisonerState) {
				let power = 0;
				if (KDBoundPowerLevel >= 0.35) power = 2;
				else if (KDBoundPowerLevel >= 0.1) power = 1;
				if (power >= 2) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage2", type: "Sneak", duration: 1, power: 9.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "move", "cast"]});
				} else if (power >= 1) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage2", type: "Sneak", duration: 1, power: 2.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "move", "cast"]});
				}
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), "lightgreen", 1, true);
			}
		}
	},
	"LatexDisplayStand": {
		floor: "Floor",
		sprite: "LatexDisplayStand",
		restraintTag: "latexdollstand",
		restraintSetTags: {
			"latexRestraints": 5,
			"latexRestraintsHeavy": 2,
		},
		forceFaction: "Rubber",
		tickFunction: (_delta) => {
			if (!KDGameData.PrisonerState) {
				let power = 0;
				if (KDBoundPowerLevel >= 0.35) power = 2;
				else if (KDBoundPowerLevel >= 0.1) power = 1;
				if (power >= 2) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage2", type: "Sneak", duration: 1, power: 9.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "move", "cast"]});
				} else if (power >= 1) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage2", type: "Sneak", duration: 1, power: 2.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "move", "cast"]});
				}
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), "lightgreen", 1, true);
			}
		}
	},
	"FutureBox": {
		floor: "Floor",
		sprite: "FutureBox",
		restraintTag: "futurebox",
		restraintSetTags: {
			"cyberDollRestraints": 8,
		},
		tickFunction: (_delta) => {
			// Nothing yet TODO add special features like dressing the player
		}
	},
	"Sarcophagus": {
		floor: "Brickwork",
		sprite: "Sarcophagus",
		restraintTag: "sarcophagus",
		restraintSetTags: {
			"mummyRestraints": 8,
		},
		tickFunction: (_delta) => {
			// Nothing yet TODO add special features like dressing the player
		}
	},
	"IceBase": {
		floor: "Brickwork",
		sprite: "IceBase",
		restraintTag: "iceEncase",
		restraintSetTags: {
			"iceCuffs": 4,
			"iceRestraints": 4,
		},
		tickFunction: (_delta) => {
			// Nothing
		}
	},
	"VineBase": {
		floor: "RubbleLooted",
		sprite: "VineBase",
		restraintTag: "vineSuspend",
		restraintSetTags: {
			"vineRestraints": 10,
		},
		tickFunction: (_delta) => {
			// Nothing yet TODO add special features like dressing the player
		}
	},
	"ShadowBase": {
		floor: "Brickwork",
		sprite: "ShadowBase",
		restraintTag: "shadowBall",
		restraintSetTags: {
			"shadowLatexRestraints": 5,
		},
		tickFunction: (_delta) => {
			// Nothing yet
		}
	},
	"CrystalBase": {
		floor: "RubbleLooted",
		sprite: "CrystalBase",
		restraintTag: "crystalEncase",
		restraintSetTags: {
			"crystalRestraints": 5,
		},
		tickFunction: (_delta) => {
			// Nothing yet
		}
	},
	"Bed": {
		floor: "Floor",
		sprite: "Bed",
		restraintTag: "bed",
		tickFunction: (_delta) => {
			// Small stamina regen :)
			KDChangeStamina("bed", "sleep", "tick", 0.1, true, 0, false);
		}
	},
	"DisplayEgyptian": {
		floor: "Floor",
		sprite: "DisplayEgyptian",
		restraintTag: "displaystand",
		restraintSetTags: {
			"mummyRestraints": 8,
		},
		tickFunction: (_delta) => {
			if (!KDGameData.PrisonerState) {
				let power = 0;
				if (KDBoundPowerLevel >= 0.35) power = 2;
				else if (KDBoundPowerLevel >= 0.1) power = 1;
				if (power >= 2) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage2", type: "Sneak", duration: 1, power: 9.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "darkness", "move", "cast"]});
				} else if (power >= 1) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "cage2", type: "Sneak", duration: 1, power: 2.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "darkness", "move", "cast"]});
				}
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), "lightgreen", 1, true);
			}
		}
	},
};
