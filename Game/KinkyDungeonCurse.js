"use strict";

/** @type {Record<string, {condition: (item: item) => boolean, remove: (item: item, host: item) => void}>} */
let KDCurses = {
	"GhostLock" : {
		condition: (item) => {
			return KinkyDungeonItemCount("Ectoplasm") >= 25;
		},
		remove: (item, host) => {
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.Ectoplasm, -25);
		}
	},
	"MistressKey": {
		condition: (item) => {
			return KinkyDungeonItemCount("MistressKey") > 0;
		},
		remove: (item, host) => {
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.MistressKey, -1);
		}
	},
	"5Keys" : {
		condition: (item) => {
			return KinkyDungeonRedKeys >= 5;
		},
		remove: (item, host) => {
			KinkyDungeonRedKeys -= 5;
		}
	},
};


function KinkyDungeonCurseInfo(item, Curse) {
	if (Curse == "MistressKey" && KinkyDungeonItemCount("MistressKey")) {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseInfoMistressKeyHave").replace("KeyAmount", "" + KinkyDungeonItemCount("MistressKey")), "White", 2);
	} else {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseInfo" + Curse), "White", 2);
	}
}

function KinkyDungeonCurseStruggle(item, Curse) {
	if (Curse == "MistressKey") {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseStruggle" + Curse + item.name), "White", 2);
	} else KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseStruggle" + Curse), "White", 2);

}

function KinkyDungeonCurseAvailable(item, Curse) {
	if (KDCurses[Curse] && KDCurses[Curse].condition(item)) {
		return true;
	}
	return false;
}

/**
 *
 * @param {string} group
 * @param {number} index
 * @param {string} Curse
 */
function KinkyDungeonCurseUnlock(group, index, Curse) {
	let unlock = true;
	let keep = false;
	let restraint = KinkyDungeonGetRestraintItem(group);
	let host = restraint;
	if (index) {
		let surfaceItems = KDDynamicLinkListSurface(restraint);
		if (surfaceItems[index]) {
			host = surfaceItems[index - 1];
			restraint = surfaceItems[index];
		}
		else console.log("Error! Please report the item combination and screenshot to Ada!");
	}

	if (KDCurses[Curse]) {
		KDCurses[Curse].remove(restraint, host);
	}

	if (unlock) {
		KDSendStatus('escape', KinkyDungeonGetRestraintItem(group).name, "Curse");
		KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonCurseUnlock" + Curse), "#99FF99", 2);
		if (restraint != host) {
			KinkyDungeonRemoveDynamicRestraint(host, keep);
		} else {
			KinkyDungeonRemoveRestraint(group, keep);
		}
	}
}