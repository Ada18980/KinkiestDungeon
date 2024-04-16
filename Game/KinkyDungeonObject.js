"use strict";

/**
 * Script happens when you display an object message
 * @type {Record<string,() => void>}
 */
let KDObjectMessages = {
	"Ghost": () => KinkyDungeonGhostMessage(),
	"Angel": () => KinkyDungeonAngelMessage(),
	"Food": () => KinkyDungeonFoodMessage(),
	"Elevator": () => KinkyDungeonElevatorMessage(),
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
		if (tile.Food && KDFood[tile.Food] && !KDFood[tile.Food].inedible && !tile.Eaten) {
			KinkyDungeonTargetTileLocation = x + "," + y;
			KinkyDungeonTargetTile = tile;
			KDStartDialog("TableFood", "", true, "");
		} else
			KinkyDungeonFoodMessage(tile);
	},
	"Elevator": (x, y) => {
		if (!KDGameData.ElevatorsUnlocked) KDGameData.ElevatorsUnlocked = {};
		if (!KDGameData.ElevatorsUnlocked[MiniGameKinkyDungeonLevel]) {
			if (!KDMapData.Entities.some((enemy) => {return KDEnemyRank(enemy) > 2 && (KDHostile(enemy) || KinkyDungeonAggressive(enemy));})) {
				KDGameData.ElevatorsUnlocked[MiniGameKinkyDungeonLevel] = true; // Unlock!
				let tile = KinkyDungeonTilesGet(x + ',' + y);
				if (tile) {
					tile.Sprite = "Elevator";
				}
			}
		}
		if (KDGameData.ElevatorsUnlocked[MiniGameKinkyDungeonLevel]) {
			KDStartDialog("Elevator", "", true, "");
		} else
			KinkyDungeonElevatorMessage();
	},
	"Oriel": (x, y) => {
		KDStartDialog("Oriel", "", true, "");
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
		KDModalArea_height = 200;
		let action = false;
		//if (KDLocks[KinkyDungeonTargetTile.Lock].pickable
		//|| KDLocks[KinkyDungeonTargetTile.Lock].unlockable
		//|| KDLocks[KinkyDungeonTargetTile.Lock].commandable) {
		action = true;
		KDModalArea = true;
		//}
		DrawButtonKDEx("ModalDoorPick", () => {
			if (KinkyDungeonLockpicks > 0 && (KDLocks[KinkyDungeonTargetTile.Lock].canPick({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation}))) {
				// Done, converted to input
				KDSendInput("pick", {targetTile: KinkyDungeonTargetTileLocation});
				return true;
			}
			return true;
		}, true, KDModalArea_x + 325, KDModalArea_y + 25, 125, 60, TextGet("KinkyDungeonPickDoor"),
		(KDLocks[KinkyDungeonTargetTile.Lock].pickable)
			? (KDLocks[KinkyDungeonTargetTile.Lock].canPick({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation}) ? "#ffffff" : "#ff5555")
			: "#888888", "", "");

		DrawButtonKDEx("ModalDoorUnlock", () => {
			if ((KDLocks[KinkyDungeonTargetTile.Lock].canUnlock({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation}))) {
				// Done, converted to input
				KDSendInput("unlock", {targetTile: KinkyDungeonTargetTileLocation});
				return true;
			}
			return true;
		}, true, KDModalArea_x + 175, KDModalArea_y + 25, 125, 60, TextGet("KinkyDungeonUnlockDoor"),
		(KDLocks[KinkyDungeonTargetTile.Lock].unlockable) ?
			(KDLocks[KinkyDungeonTargetTile.Lock].canUnlock({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation}) ? "#ffffff" : "#ff5555")
			: "#888888", "", "");
		let spell = KinkyDungeonFindSpell("CommandWord", true);
		DrawButtonKDEx("ModalDoorCmd", () => {
			if (((KinkyDungeonTargetTile.Lock.includes("Purple") && KinkyDungeonStatMana > KinkyDungeonGetManaCost(KinkyDungeonFindSpell("CommandWord", true))))) {
				// Done, converted to input
				KDSendInput("commandunlock", {targetTile: KinkyDungeonTargetTileLocation});
				return true;
			}
			return true;
		}, true, KDModalArea_x + 475, KDModalArea_y + 25, 125, 60, TextGet("KinkyDungeonUnlockDoorPurple"),
		KDLocks[KinkyDungeonTargetTile.Lock].commandable
			? ((KinkyDungeonStatMana >= KinkyDungeonGetManaCost(spell)) ? "#ffffff" : "#ff5555")
			: "#888888",
		"", "");

		if (KDLocks[KinkyDungeonTargetTile.Lock].specialActions) {
			KDLocks[KinkyDungeonTargetTile.Lock].specialActions(KinkyDungeonTargetTile, KinkyDungeonPlayerEntity);
		}


		if (!action) DrawTextKD(TextGet("KinkyDungeonLockedDoor"), KDModalArea_x + 300, KDModalArea_y + 50, "#ffffff", "#333333");

		if (KinkyDungeonTargetTile.Lock)
			DrawTextKD(TextGet("Kinky" + KinkyDungeonTargetTile.Lock + "Lock"), KDModalArea_x + 25, KDModalArea_y + 50, "#ffffff", "#333333");
	} else {
		KDModalArea = true;
		DrawButtonVis(KDModalArea_x + 25, KDModalArea_y + 25, 250, 60, TextGet("KinkyDungeonCloseDoor"), "#ffffff");
	}
}

/** Chest lock */
function KinkyDungeonDrawLock() {
	if (KinkyDungeonTargetTile.Lock) {
		KDModalArea_height = 200;
		let action = false;
		if ((KDLocks[KinkyDungeonTargetTile.Lock].pickable)) {
			DrawButtonVis(KDModalArea_x + 313, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonPickDoor"),
			(KDLocks[KinkyDungeonTargetTile.Lock].canPick({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation})) ? "#ffffff" : "#ff0000", "", "");
			action = true;
			KDModalArea = true;
		}

		if ((KDLocks[KinkyDungeonTargetTile.Lock].unlockable)) {
			DrawButtonVis(KDModalArea_x + 175, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonUnlockDoor"),
			(KDLocks[KinkyDungeonTargetTile.Lock].canUnlock({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation})) ? "#ffffff" : "#ff0000", "", "");
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

function KinkyDungeonElevatorMessage() {
	KinkyDungeonSendActionMessage(10, TextGet("KDElevatorBroken"), "white", 3);
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
	for (let tile of Object.values(KDMapData.Tiles)) {
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




function KDHandleModalArea() {
	if (KinkyDungeonTargetTile.Type &&
		((KinkyDungeonTargetTile.Type == "Lock" && KinkyDungeonTargetTile.Lock) || (KinkyDungeonTargetTile.Type == "Door" && KinkyDungeonTargetTile.Lock))) {
		// Done, converted to input
	} else if (KinkyDungeonTargetTile.Type == "Shrine") {
		// Done, converted to input
		if (KinkyDungeonHandleShrine()) {
			return true;
			// if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
		}
	} else if (KDObjectHandle[KinkyDungeonTargetTile.Type]) {
		return KDObjectHandle[KinkyDungeonTargetTile.Type]();
	} else if (KinkyDungeonTargetTile.Type == "Door") {
		if (MouseIn(KDModalArea_x + 25, KDModalArea_y + 25, 350, 60)) {
			// Done, converted to input
			KDSendInput("closeDoor", {targetTile: KinkyDungeonTargetTileLocation});
			return true;
		}
	}
	return false;
}

/**
 *
 * @param {number} floor
 */
function KDElevatorToFloor(floor) {
	// Only works if the map has been generated
	let slot = KDWorldMap['0,' + floor];
	if (slot) {
		let subslot = slot.data.ElevatorRoom;
		if (subslot) {
			let params = KinkyDungeonMapParams[(KinkyDungeonMapIndex[subslot.Checkpoint] || subslot.Checkpoint)];
			MiniGameKinkyDungeonLevel = floor;
			KinkyDungeonCreateMap(params,
				subslot.RoomType,
				subslot.MapMod,
				floor,
				undefined,
				undefined,
				subslot.MapFaction,
				{x: 0, y: floor},
				true,
				undefined,
				undefined,
				subslot.EscapeMethod);
			KDMovePlayer(KDMapData.StartPosition.x, KDMapData.StartPosition.y - 2, true);
		}
	}
}