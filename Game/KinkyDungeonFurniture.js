'use strict';
let KDFurniture = {
	"Cage": {
		floor: "Floor",
		sprite: "Cage",
		restraintTag: "cage",
		tickFunction: (delta) => {
			if (!KDGameData.PrisonerState) {
				let power = 0;
				if (KDBoundPowerLevel >= 0.35) power = 2;
				else if (KDBoundPowerLevel >= 0.1) power = 1;
				if (power >= 2) {
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage2", type: "Sneak", duration: 1, power: 9.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "move", "cast"]});
				} else if (power >= 1) {
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage2", type: "Sneak", duration: 1, power: 2.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "move", "cast"]});
				}
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), "lightgreen", 1, true);
			}
		}
	},
	"DisplayStand": {
		floor: "Floor",
		sprite: "DisplayStand",
		restraintTag: "displaystand",
		tickFunction: (delta) => {
			if (!KDGameData.PrisonerState) {
				let power = 0;
				if (KDBoundPowerLevel >= 0.35) power = 2;
				else if (KDBoundPowerLevel >= 0.1) power = 1;
				if (power >= 2) {
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage2", type: "Sneak", duration: 1, power: 9.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "move", "cast"]});
				} else if (power >= 1) {
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage2", type: "Sneak", duration: 1, power: 2.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "move", "cast"]});
				}
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), "lightgreen", 1, true);
			}
		}
	},
	"DisplayEgyptian": {
		floor: "Floor",
		sprite: "DisplayEgyptian",
		restraintTag: "displaystand",
		tickFunction: (delta) => {
			if (!KDGameData.PrisonerState) {
				let power = 0;
				if (KDBoundPowerLevel >= 0.35) power = 2;
				else if (KDBoundPowerLevel >= 0.1) power = 1;
				if (power >= 2) {
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage2", type: "Sneak", duration: 1, power: 9.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "darkness", "move", "cast"]});
				} else if (power >= 1) {
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage2", type: "Sneak", duration: 1, power: 2.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "darkness", "move", "cast"]});
				}
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), "lightgreen", 1, true);
			}
		}
	},
};