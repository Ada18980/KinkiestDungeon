"use strict";



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
	if (Curse == "5Keys" && KinkyDungeonRedKeys >= 5) {
		return true;
	} else if (Curse == "GhostLock" && KinkyDungeonItemCount("Ectoplasm") >= 25) {
		return true;
	} else if (Curse == "MistressKey" && KinkyDungeonItemCount("MistressKey") > 0) {
		return true;
	}
	return false;
}

function KinkyDungeonCurseUnlock(group, Curse) {
	let unlock = true;
	let keep = false;
	if (Curse == "GhostLock") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.Ectoplasm, -25);
	} else if (Curse == "5Keys") {
		KinkyDungeonRedKeys -= 5;
	} else if (Curse == "MistressKey") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.MistressKey, -1);
	}

	if (unlock) {
		KDSendStatus('escape', KinkyDungeonGetRestraintItem(group).name, "Curse");
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseUnlock" + Curse), "#99FF99", 2);
		KinkyDungeonRemoveRestraint(group, keep);
	}
}