"use strict";

/**
 * Script happens when you display an object message
 * @type {Record<string,() => void>}
 */
let KDObjectMessages = {
	"Ghost": () => KinkyDungeonGhostMessage(),
	"Angel": () => KinkyDungeonAngelMessage(),
	"Food": () => KinkyDungeonFoodMessage(),
};
/**
 * Script happens when you move to an object
 * MUTUALLY exclusive with KDObjectDraw, as this
 * overrides the default behavior of clicking on the object and bringing up a modal
 * @type {Record<string,(x: number, y: number) => void>}
 */
let KDObjectClick = {
	"Food": (x, y) => {
		let tile = KinkyDungeonTilesGet(x + "," + y);
		if (tile.Food && !tile.Eaten) {
			KinkyDungeonTargetTileLocation = x + "," + y;
			KinkyDungeonTargetTile = tile;
			KDStartDialog("TableFood", "", true, "");
		} else
			KinkyDungeonFoodMessage(tile);
	},
};
/**
 * Script to handle click in an object's modal
 * tbh should remove this soon
 * @type {Record<string,() => boolean>}
 */
let KDObjectHandle = {
	"Charger": () => KinkyDungeonHandleCharger(),
};
/**
 * Determines if an object has an interface and also if it pauses the game when you click on it
 * You dont need an interface (for example the updated food table) but then you need
 * an entry in KDObjectClick instead.
 * @type {Record<string,() => void>}
 */
let KDObjectDraw = {
	"Ghost": () => KinkyDungeonDrawGhost(),
	"Angel": () => KinkyDungeonDrawAngel(),
	"Charger": () => KinkyDungeonDrawCharger(),
	"Tablet": () => KinkyDungeonDrawTablet(),
	//"Food": () => KinkyDungeonDrawFood(),
	"Lock": () => KinkyDungeonDrawLock(),
	"Shrine": () => KinkyDungeonDrawShrine(),
	"Door": () => KinkyDungeonDrawDoor(),
};

function KinkyDungeonDrawDoor() {
	if (KinkyDungeonTargetTile.Lock) {
		let action = false;
		if (KinkyDungeonLockpicks > 0 && (KinkyDungeonTargetTile.Lock.includes("Red") || KinkyDungeonTargetTile.Lock.includes("Blue"))) {
			DrawButtonVis(KDModalArea_x + 313, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonPickDoor"), "#ffffff", "", "");
			action = true;
			KDModalArea = true;
		}

		if (KinkyDungeonTargetTile.Lock.includes("Red") || KinkyDungeonTargetTile.Lock.includes("Blue")) {
			DrawButtonVis(KDModalArea_x + 175, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonUnlockDoor"),
			(KinkyDungeonTargetTile.Lock.includes("Red") && KinkyDungeonRedKeys > 0)
			|| (KinkyDungeonTargetTile.Lock.includes("Blue") && KinkyDungeonBlueKeys > 0) ? "#ffffff" : "#ff0000", "", "");
			action = true;
			KDModalArea = true;
		}

		if ((KinkyDungeonTargetTile.Lock.includes("Purple"))) {
			let spell = KinkyDungeonFindSpell("CommandWord", true);
			DrawButtonVis(KDModalArea_x + 175, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonUnlockDoorPurple"),
			(KinkyDungeonStatMana >= KinkyDungeonGetManaCost(spell)) ? "#ffffff" : "#ff0000",
			"", "");
			action = true;
			KDModalArea = true;
		}

		if (!action) DrawTextKD(TextGet("KinkyDungeonLockedDoor"), KDModalArea_x + 300, KDModalArea_y + 50, "#ffffff", "#333333");

		if (KinkyDungeonTargetTile.Lock.includes("Red"))
			DrawTextKD(TextGet("KinkyRedLock"), KDModalArea_x + 25, KDModalArea_y + 50, "#ffffff", "#333333");
		else if (KinkyDungeonTargetTile.Lock.includes("Blue"))
			DrawTextKD(TextGet("KinkyBlueLock"), KDModalArea_x + 25, KDModalArea_y + 50, "#ffffff", "#333333");
		else if (KinkyDungeonTargetTile.Lock.includes("Purple"))
			DrawTextKD(TextGet("KinkyPurpleLock"), KDModalArea_x + 50, KDModalArea_y + 50, "#ffffff", "#333333");
	} else {
		KDModalArea = true;
		DrawButtonVis(KDModalArea_x + 25, KDModalArea_y + 25, 250, 60, TextGet("KinkyDungeonCloseDoor"), "#ffffff");
	}
}

/** Chest lock */
function KinkyDungeonDrawLock() {
	if (KinkyDungeonTargetTile.Lock) {
		let action = false;
		if (KinkyDungeonLockpicks > 0 && (KinkyDungeonTargetTile.Lock.includes("Red") || KinkyDungeonTargetTile.Lock.includes("Blue"))) {
			DrawButtonVis(KDModalArea_x + 313, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonPickDoor"), "#ffffff", "", "");
			action = true;
			KDModalArea = true;
		}

		if (KinkyDungeonTargetTile.Lock.includes("Red") || KinkyDungeonTargetTile.Lock.includes("Blue")) {
			DrawButtonVis(KDModalArea_x + 175, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonUnlockDoor"),
			(KinkyDungeonTargetTile.Lock.includes("Red") && KinkyDungeonRedKeys > 0)
			|| (KinkyDungeonTargetTile.Lock.includes("Blue") && KinkyDungeonBlueKeys > 0) ? "#ffffff" : "#ff0000", "", "");
			action = true;
			KDModalArea = true;
		}
		if ((KinkyDungeonTargetTile.Lock.includes("Purple"))) {
			let spell = KinkyDungeonFindSpell("CommandWord", true);
			DrawButtonVis(KDModalArea_x + 175, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonUnlockDoorPurple"),
			(KinkyDungeonStatMana >= KinkyDungeonGetManaCost(spell)) ? "#ffffff" : "#ff0000",
			"", "");
			action = true;
			KDModalArea = true;
		}

		if (!action) DrawTextKD(TextGet("KinkyDungeonLockedDoor"), KDModalArea_x + 300, KDModalArea_y + 50, "#ffffff", "#333333");

		if (KinkyDungeonTargetTile.Lock.includes("Red"))
			DrawTextKD(TextGet("KinkyRedLock"), KDModalArea_x + 50, KDModalArea_y + 50, "#ffffff", "#333333");
		else if (KinkyDungeonTargetTile.Lock.includes("Blue"))
			DrawTextKD(TextGet("KinkyBlueLock"), KDModalArea_x + 50, KDModalArea_y + 50, "#ffffff", "#333333");
		else if (KinkyDungeonTargetTile.Lock.includes("Purple"))
			DrawTextKD(TextGet("KinkyPurpleLock"), KDModalArea_x + 50, KDModalArea_y + 50, "#ffffff", "#333333");
	}
}

function KinkyDungeonDrawGhost() {
	if (KDGameData.CurrentDialog) return;
	if (KinkyDungeonTargetTile.GhostDecision == 0) DrawTextKD(TextGet("KinkyDungeonDrawGhostHelpful"), KDModalArea_x + 200, KDModalArea_y + 50, "white", KDTextGray2);
	else DrawTextKD(TextGet("KinkyDungeonDrawGhostUnhelpful"), KDModalArea_x + 200, KDModalArea_y + 50, "white", KDTextGray2);
}
function KinkyDungeonDrawAngel() {
	DrawTextKD(TextGet("KinkyDungeonDrawAngelHelpful"), KDModalArea_x + 200, KDModalArea_y + 50, "white", KDTextGray2);
}

function KinkyDungeonGhostMessage() {

	if (KinkyDungeonTargetTile.Dialogue) {
		KDStartDialog(KinkyDungeonTargetTile.Dialogue, "Ghost", true, "", undefined);
		if (KinkyDungeonTargetTile.Msg && KDGameData.CurrentDialog) {
			KDGameData.CurrentDialogMsg = KinkyDungeonTargetTile.Msg;
		}
		return;
	} else if (KinkyDungeonTargetTile.Msg) {
		KDStartDialog("GhostInfo", "Ghost", true, "", undefined);
		if (KDGameData.CurrentDialog) {
			KDGameData.CurrentDialogMsg = KinkyDungeonTargetTile.Msg;
		}
		return;
	}
	let restraints = KinkyDungeonAllRestraint();
	let msg = "";
	if (restraints.length == 0) {
		msg = TextGet("KinkyDungeonGhostGreet" + KinkyDungeonTargetTile.GhostDecision);
	} else {
		if (KinkyDungeonTargetTile.GhostDecision <= 1) {
			msg = TextGet("KinkyDungeonGhostHelpful" + KinkyDungeonTargetTile.GhostDecision);
		} else {
			let BoundType = "Generic";
			if (!KinkyDungeonCanTalk() && Math.random() < 0.33) BoundType = "Gag";
			if ((KinkyDungeonIsHandsBound() || KinkyDungeonIsArmsBound()) && Math.random() < 0.33) BoundType = "Arms";
			if (KinkyDungeonSlowLevel > 0 && Math.random() < 0.33) BoundType = "Feet";
			if (KinkyDungeonChastityMult() > 0 && Math.random() < 0.33) BoundType = "Chaste";

			msg = TextGet("KinkyDungeonGhostUnhelpful" + BoundType + KinkyDungeonTargetTile.GhostDecision);
		}
	}
	if (msg) {
		KinkyDungeonSendActionMessage(3, msg, "white", 3);
	}
}

function KinkyDungeonAngelMessage() {
	let restraints = KinkyDungeonAllRestraint();
	let msg = "";
	if (restraints.length == 0) {
		msg = TextGet("KinkyDungeonAngelGreet");
	} else {
		msg = TextGet("KinkyDungeonAngelHelpful");
	}
	if (msg) {
		KinkyDungeonSendActionMessage(3, msg, "#ffffff", 1, true);
	}
}

function KinkyDungeonFoodMessage(Tile) {
	let tile = Tile || KinkyDungeonTargetTile;
	if (tile) {
		let msg = TextGet("KinkyDungeonFood" + (tile.Food ? tile.Food : ""));

		if (msg) {
			KinkyDungeonSendActionMessage(3, msg, "#ffffff", 1, true);
		}
	}

}

function KinkyDungeonMakeGhostDecision() {
	for (let tile of Object.values(KinkyDungeonTiles)) {
		if (tile.Type == "Ghost") {
			tile.GhostDecision = 0;

			let rep = KinkyDungeonGoddessRep.Ghost;

			if (rep > 0) tile.GhostDecision += 1;
			if (rep != undefined) {
				let mult = KinkyDungeonStatsChoice.get("Oppression") ? 1.5 : (KinkyDungeonStatsChoice.has("Dominant") ? 0.5 : 1.0);
				if (KDRandom() * 100 * mult > -rep + 75) tile.GhostDecision += 1;
				if (KDRandom() * 100 * mult > -rep + 85) tile.GhostDecision += 1;
				if (KDRandom() * 100 * mult > -rep + 95) tile.GhostDecision += 1;
			}
		}
	}
}

function KinkyDungeonDrawCharger() {
	KDModalArea = true;
	//DrawTextKD(TextGet("KinkyDungeonCharger"), KDModalArea_x + 200, KDModalArea_y + 50, "white", KDTextGray2);
	if (KinkyDungeonTargetTile && KinkyDungeonTargetTile.Light == KDChargerLight) {
		DrawButtonVis(KDModalArea_x + 25, KDModalArea_y + 25, 400, 60, TextGet("KinkyDungeonChargerRemoveCrystal"), "white", "", "");
	} else {
		DrawButtonVis(KDModalArea_x + 250, KDModalArea_y + 25, 200, 60, TextGet("KinkyDungeonChargerCharge"), KinkyDungeonInventoryGet("AncientPowerSourceSpent") ? "white" : "#888888", "", "");
		DrawButtonVis(KDModalArea_x + 25, KDModalArea_y + 25, 200, 60, TextGet("KinkyDungeonChargerPlaceCrystal"), KinkyDungeonInventoryGet("AncientPowerSource") ? "white" : "#888888", "", "");
	}


}

function KinkyDungeonDrawTablet() {
	KDModalArea = true;
	//DrawTextKD(TextGet("KinkyDungeonCharger"), KDModalArea_x + 200, KDModalArea_y + 50, "white", KDTextGray2);
	if (KinkyDungeonTargetTile) {
		DrawButtonKDEx("Tablet",(bdata) => {
			KDSendInput("tabletInteract", {action: "read", targetTile: KinkyDungeonTargetTileLocation});
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = "";
			return true;
		}, true, KDModalArea_x + 25, KDModalArea_y + 25, 400, 60, TextGet("KinkyDungeonTabletRead"), "white", "", "");
	}
}

function KinkyDungeonDrawFood() {
	KDModalArea = true;
	if (KinkyDungeonTargetTile && KinkyDungeonTargetTile.Food && KinkyDungeonTargetTile.Food != "Plate") {
		DrawButtonKDEx("Food",(bdata) => {
			KDSendInput("foodInteract", {action: "eat", targetTile: KinkyDungeonTargetTileLocation});
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = "";
			return true;
		}, true, KDModalArea_x + 25, KDModalArea_y + 25, 400, 60, TextGet("KinkyDungeonFoodEat"), "white", "", "");
	}
}

let KDChargerLight = 6.5;
let KDChargerColor = 0xffee83;
let KDLeylineLightColor = 0x4477ff;
let KDLeylineLight = 8;

function KinkyDungeonHandleCharger() {
	if (KinkyDungeonTargetTile && KinkyDungeonTargetTile.Light == KDChargerLight) {
		if (MouseIn(KDModalArea_x + 25, KDModalArea_y + 25, 400, 60) && KinkyDungeonTargetTile) {
			KDSendInput("chargerInteract", {action: "remove", targetTile: KinkyDungeonTargetTileLocation});
			return true;
		}
	} else {
		if (MouseIn(KDModalArea_x + 250, KDModalArea_y + 25, 200, 60)) {
			if (KDSendInput("chargerInteract", {action: "charge", targetTile: KinkyDungeonTargetTileLocation})) {
				KinkyDungeonTargetTile = null;
				KinkyDungeonTargetTileLocation = "";
			}
			return true;
		} else if (MouseIn(KDModalArea_x + 25, KDModalArea_y + 25, 200, 60) && KinkyDungeonTargetTile) {
			KDSendInput("chargerInteract", {action: "place", targetTile: KinkyDungeonTargetTileLocation});
			return true;
		}
	}

	return false;
}

