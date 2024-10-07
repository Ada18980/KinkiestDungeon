"use strict";

/**
 * Script happens when you display an object message
 */
let KDObjectMessages: Record<string, () => void> = {
	"Ghost": () => KinkyDungeonGhostMessage(),
	"Angel": () => KinkyDungeonAngelMessage(),
	"Food": () => KinkyDungeonFoodMessage(),
	"Elevator": () => KinkyDungeonElevatorMessage(),
};
/**
 * Script happens when you move to an object
 * MUTUALLY exclusive with KDObjectDraw, as this
 * overrides the default behavior of clicking on the object and bringing up a modal
 */
let KDObjectClick: Record<string, (x: number, y: number) => void> = {
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
		let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
		if (!KDGameData.ElevatorsUnlocked) KDGameData.ElevatorsUnlocked = {};
		if (!KDGameData.ElevatorsUnlocked[MiniGameKinkyDungeonLevel]) {
			if ((!altType?.elevatorCondition && !KDMapData.Entities.some((enemy) => {
				return KDEnemyRank(enemy) > 2 && (KDHostile(enemy) || KinkyDungeonAggressive(enemy)) && !KDHelpless(enemy);
			})) || (altType?.elevatorCondition && altType.elevatorCondition(x, y))) {
				KDGameData.ElevatorsUnlocked[MiniGameKinkyDungeonLevel] = KDGameData.RoomType; // Unlock!
				let tile = KinkyDungeonTilesGet(x + ',' + y);
				if (tile) {
					tile.Overlay = "Elevator";
				}
			}
		}
		if (KDGameData.ElevatorsUnlocked[MiniGameKinkyDungeonLevel]) {
			KDStartDialog("Elevator", "", true, "");
		} else
			KinkyDungeonElevatorMessage();
	},
	"Oriel": (_x, _y) => {
		KDStartDialog("Oriel", "", true, "");
	},
};
/**
 * Script happens when you interact to an object
 */
let KDObjectInteract: Record<string, (x: number, y: number, dist?: number) => void> = {
	"DollDropoff": (x, y, dist) => {
		if (dist != undefined ? dist : KDistChebyshev(x - KDPlayer().x, y - KDPlayer().y) < 1.5)
			//if (!KinkyDungeonGetRestraintItem("ItemDevices")) {
			KDGameData.InteractTargetX = x;
			KDGameData.InteractTargetY = y;
			KDStartDialog("DollDropoff", "", true);
			//}
	},
	"Furniture": (x, y, dist) => {
		if (dist != undefined ? dist : KDistChebyshev(x - KDPlayer().x, y - KDPlayer().y) < 1.5)
			//if (!KinkyDungeonGetRestraintItem("ItemDevices")) {
			KDGameData.InteractTargetX = x;
			KDGameData.InteractTargetY = y;
			KDStartDialog("Furniture", "", true);
			//}
	},
	"Door": (x, y) => {
		if (KinkyDungeonMapGet(x, y) == 'D') {
			KDAttemptDoor(x, y);
		} else if (!KinkyDungeonEntityAt(x, y, false, undefined, undefined, true)) {
			KinkyDungeonCloseDoor(x, y);
		}
	},
};
/**
 * Script happens when you interact to an tile
 */
let KDTileInteract: Record<string, (x: number, y: number, dist?: number) => void> = {
	'B': (x, y, dist) => {
		if (dist != undefined ? dist : KDistChebyshev(x - KDPlayer().x, y - KDPlayer().y) < 1.5)
			if (!KinkyDungeonFlags.get("slept") && !KinkyDungeonFlags.get("nobed") && KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.49) {
				KDGameData.InteractTargetX = x;
				KDGameData.InteractTargetY = y;
				KDStartDialog("Bed", "", true);
			}
	},
	'c': (x, y, dist) => {
		if (dist != undefined ? dist : KDistChebyshev(x - KDPlayer().x, y - KDPlayer().y) < 1.5)
			KDGameData.InteractTargetX = x;
			KDGameData.InteractTargetY = y;
			// Open container
			KDUI_CurrentContainer = KDGetContainer("Chest", {x: x, y: y}, KDGetCurrentLocation(),
				true)?.name;
			if (KDUI_CurrentContainer) {
				KDUI_ContainerBackScreen = KinkyDungeonDrawState;
				KinkyDungeonDrawState = "Container";
				KinkyDungeonCurrentFilter = "All";
				KDUI_Container_LastSelected = "Chest";
			}
	},
};
/**
 * Script to handle click in an object's modal
 * tbh should remove this soon
 */
let KDObjectHandle: Record<string, () => boolean> = {
	"Charger": () => KinkyDungeonHandleCharger(),
};
/**
 * Determines if an object has an interface and also if it pauses the game when you click on it
 * You dont need an interface (for example the updated food table) but then you need
 * an entry in KDObjectClick instead.
 */
let KDObjectDraw: Record<string, () => void> = {
	"Ghost": () => KinkyDungeonDrawGhost(),
	"Angel": () => KinkyDungeonDrawAngel(),
	"Charger": () => KinkyDungeonDrawCharger(),
	"Tablet": () => KinkyDungeonDrawTablet(),
	//"Food": () => KinkyDungeonDrawFood(),
	"Lock": () => KinkyDungeonDrawLock(),
	"Shrine": () => KinkyDungeonDrawShrine(),
	"Door": () => KinkyDungeonDrawDoor(),
	Orb: () => KDDrawOrb(),
};

function KinkyDungeonDrawDoor() {
	if (KinkyDungeonTargetTile.Lock) {
		KDModalArea_height = 400;
		KDModalArea_width = 1000;
		let action = false;
		//if (KDLocks[KinkyDungeonTargetTile.Lock].pickable
		//|| KDLocks[KinkyDungeonTargetTile.Lock].unlockable
		//|| KDLocks[KinkyDungeonTargetTile.Lock].commandable) {
		action = true;
		KDModalArea = true;
		KDModalArea_y = 700;
		//}
		DrawButtonKDEx("ModalDoorPick", () => {
			if (KinkyDungeonTargetTile)
				if (KinkyDungeonItemCount("Pick") > 0 && (KDLocks[KinkyDungeonTargetTile.Lock].canPick({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation}))) {
					// Done, converted to input
					KDSendInput("pick", {targetTile: KinkyDungeonTargetTileLocation});
					return true;
				}
			return true;
		}, true, KDModalArea_x + 450, KDModalArea_y + 100, 250, 60, TextGet("KinkyDungeonPickDoor"),
		(KDLocks[KinkyDungeonTargetTile.Lock].pickable)
			? (KDLocks[KinkyDungeonTargetTile.Lock].canPick({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation}) ? "#ffffff" : "#ff5555")
			: "#888888", "", "");

		DrawButtonKDEx("ModalDoorUnlock", () => {
			if (KinkyDungeonTargetTile)
				if ((KDLocks[KinkyDungeonTargetTile.Lock].canUnlock({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation}))) {
					// Done, converted to input
					KDSendInput("unlock", {targetTile: KinkyDungeonTargetTileLocation});
					return true;
				}
			return true;
		}, true, KDModalArea_x + 175, KDModalArea_y + 100, 250, 60, TextGet("KinkyDungeonUnlockDoor"),
		(KDLocks[KinkyDungeonTargetTile.Lock].unlockable) ?
			(KDLocks[KinkyDungeonTargetTile.Lock].canUnlock({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation}) ? "#ffffff" : "#ff5555")
			: "#888888", "", "");
		let spell = KinkyDungeonFindSpell("CommandWord", true);
		DrawButtonKDEx("ModalDoorCmd", () => {
			if (KinkyDungeonTargetTile)
				if (((KinkyDungeonTargetTile.Lock.includes("Purple") && KinkyDungeonStatMana > KinkyDungeonGetManaCost(KinkyDungeonFindSpell("CommandWord", true))))) {
					// Done, converted to input
					KDSendInput("commandunlock", {targetTile: KinkyDungeonTargetTileLocation});
					return true;
				}
			return true;
		}, true, KDModalArea_x + 725, KDModalArea_y + 100, 250, 60, TextGet("KinkyDungeonUnlockDoorPurple"),
		KDLocks[KinkyDungeonTargetTile.Lock].commandable
			? ((KinkyDungeonStatMana >= KinkyDungeonGetManaCost(spell)) ? "#ffffff" : "#ff5555")
			: "#888888",
		"", "");

		if (KDLocks[KinkyDungeonTargetTile.Lock].specialActions) {
			KDLocks[KinkyDungeonTargetTile.Lock].specialActions(KinkyDungeonTargetTile, KinkyDungeonPlayerEntity);
		}


		if (!action) DrawTextKD(TextGet("KinkyDungeonLockedDoor"), KDModalArea_x + 300, KDModalArea_y + 150, "#ffffff", "#333333");

		if (KinkyDungeonTargetTile.Lock)
			DrawTextKD(TextGet("Kinky" + KinkyDungeonTargetTile.Lock + "Lock"), KDModalArea_x + 25, KDModalArea_y + 150, "#ffffff", "#333333");
	} else {
		KDModalArea = true;
		DrawButtonVis(KDModalArea_x + 25, KDModalArea_y + 100, 250, 60, TextGet("KinkyDungeonCloseDoor"), "#ffffff");
	}
}

/** Chest lock */
function KinkyDungeonDrawLock() {
	if (KinkyDungeonTargetTile.Lock) {
		KDModalArea_height = 400;
		KDModalArea_width = 1000;
		let action = false;
		if ((KDLocks[KinkyDungeonTargetTile.Lock].pickable)) {
			action = true;
			KDModalArea = true;
			DrawButtonKDEx("ModelLockPick", () => {
				if (KinkyDungeonTargetTile)
					if (KinkyDungeonItemCount("Pick") > 0 && (KDLocks[KinkyDungeonTargetTile.Lock].canPick({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation}))) {
						// Done, converted to input
						KDSendInput("pick", {targetTile: KinkyDungeonTargetTileLocation});
						return true;
					}
				return true;
			}, true, KDModalArea_x + 313, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonPickDoor"),
			(KDLocks[KinkyDungeonTargetTile.Lock].canPick({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation})) ? "#ffffff" : "#ff5277", "", "");
		}

		if ((KDLocks[KinkyDungeonTargetTile.Lock].unlockable)) {
			action = true;
			KDModalArea = true;
			DrawButtonKDEx("ModalLockUnlock", () => {
				if (KinkyDungeonTargetTile)
					if ((KDLocks[KinkyDungeonTargetTile.Lock].canUnlock({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation}))) {
						// Done, converted to input
						KDSendInput("unlock", {targetTile: KinkyDungeonTargetTileLocation});
						return true;
					}
				return true;
			}, true, KDModalArea_x + 175, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonUnlockDoor"),
			(KDLocks[KinkyDungeonTargetTile.Lock].canUnlock({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation})) ? "#ffffff" : "#ff5277", "", "");
		}
		if ((KinkyDungeonTargetTile.Lock.includes("Purple"))) {
			action = true;
			KDModalArea = true;
			let spell = KinkyDungeonFindSpell("CommandWord", true);
			DrawButtonKDEx("ModalLockCmd", () => {
				if (KinkyDungeonTargetTile)
					if (((KinkyDungeonTargetTile.Lock.includes("Purple") && KinkyDungeonStatMana > KinkyDungeonGetManaCost(KinkyDungeonFindSpell("CommandWord", true))))) {
						// Done, converted to input
						KDSendInput("commandunlock", {targetTile: KinkyDungeonTargetTileLocation});
						return true;
					}
				return true;
			}, true, KDModalArea_x + 175, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonUnlockDoorPurple"),
			(KinkyDungeonStatMana >= KinkyDungeonGetManaCost(spell)) ? "#ffffff" : "#ff5277",
			"", "");
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

function KinkyDungeonFoodMessage(Tile?: any) {
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
	if (!KDModalArea) KDStatChoice = "";
	KDModalArea = true;
	//DrawTextKD(TextGet("KinkyDungeonCharger"), KDModalArea_x + 200, KDModalArea_y + 50, "white", KDTextGray2);
	if (KinkyDungeonTargetTile) {
		if (KinkyDungeonTargetTile.Name == "Heart") {
			KDDrawHeartTablet();
		} else {
			DrawButtonKDEx("Tablet",(_bdata) => {
				KDSendInput("tabletInteract", {action: "read", targetTile: KinkyDungeonTargetTileLocation});
				KinkyDungeonTargetTile = null;
				KinkyDungeonTargetTileLocation = "";
				return true;
			}, true, KDModalArea_x + 25, KDModalArea_y + 25, 400, 60, TextGet("KinkyDungeonTabletRead"), "white", "", "");
		}
	}
}

function KinkyDungeonDrawFood() {
	KDModalArea = true;
	if (KinkyDungeonTargetTile && KinkyDungeonTargetTile.Food && KinkyDungeonTargetTile.Food != "Plate") {
		DrawButtonKDEx("Food",(_bdata) => {
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

let KDAlwaysUnlockedElevFloors = {
	"Summit": true
};
let KDElevatorFloorIndex = {
	Summit: {
		Floor: 0,
		RoomType: "Summit",
		MapMod: undefined,
		Checkpoint: "vault",
		MapFaction: "Player",
		EscapeMethod: "None",
	},
};

/**
 * @param num
 */
function KDIsElevatorFloorUnlocked(num: string | number): boolean {
	return typeof num === "string" ? (KDGameData.ElevatorsUnlocked[num] || KDAlwaysUnlockedElevFloors[num])
		: num != MiniGameKinkyDungeonLevel && KDGameData.ElevatorsUnlocked[num];
}

/**
 * @param floor
 */
function KDElevatorToFloor(floor: number, RoomType: string) {
	// Only works if the map has been generated
	let slot = KDWorldMap['0,' + floor];
	if (slot) {
		if (RoomType) {
			let subslot = KDElevatorFloorIndex[RoomType] || (slot.data ? slot.data[RoomType] : null);
			if (subslot) {
				let params = KinkyDungeonMapParams[subslot.Checkpoint] || (slot.data[slot.main]?.Checkpoint ? KinkyDungeonMapParams[slot.data[slot.main].Checkpoint] : undefined);
				MiniGameKinkyDungeonLevel = floor;
				KinkyDungeonCreateMap(params,
					RoomType,
					undefined,
					floor,
					undefined,
					undefined,
					subslot.MapFaction,
					{x: 0, y: floor},
					true,
					undefined,
					undefined,
					subslot.EscapeMethod);
				KDMovePlayer(KDMapData.StartPosition.x, KDMapData.StartPosition.y, true);
			}
		} else {
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
}

let KDBuyableStats = [
	"SP",
	"MP",
	"WP",
	"AP",
];

let KDStat = {
	AP: {
		getMax: (_player) => {return KinkyDungeonStatDistractionMax;},
		getCurrent: (_player) => {return KinkyDungeonStatDistraction;},
	},
	SP: {
		getMax: (_player) => {return KinkyDungeonStatStaminaMax;},
		getCurrent: (_player) => {return KinkyDungeonStatStamina;},
	},
	MP: {
		getMax: (_player) => {return KinkyDungeonStatManaMax;},
		getCurrent: (_player) => {return KinkyDungeonStatMana;},
	},
	WP: {
		getMax: (_player) => {return KinkyDungeonStatWillMax;},
		getCurrent: (_player) => {return KinkyDungeonStatWill;},
		getAmnt2: (amnt: number) => {return 0.01*Math.floor(100*amnt*0.02);},
	},
};

let KDStatChoice = "";

function KDDrawHeartTablet() {
	let modalHeight = 200 + 50 * KDBuyableStats.length;

	KDModalArea_y = 800 - modalHeight;
	KDModalArea_height = modalHeight + 100;
	KDModalArea_width = 900;

	FillRectKD(kdcanvas, kdpixisprites, "modalbg", {
		Left: KDModalArea_x,
		Top: KDModalArea_y,// + 25 - modalHeight,
		Width: KDModalArea_width,
		Height: modalHeight + 25,
		Color: KDButtonColor,
		LineWidth: 1,
		zIndex: 60,
		alpha: 0.8,
	});
	DrawRectKD(kdcanvas, kdpixisprites, "modalbg2", {
		Left: KDModalArea_x,
		Top: KDModalArea_y,// + 25 - modalHeight,
		Width: KDModalArea_width,
		Height: modalHeight + 25,
		Color: KDBorderColor,
		LineWidth: 1,
		zIndex: 60.1,
		alpha: 1.0,
	});

	DrawTextFitKD(TextGet("KDStatBuy1"),
		KDModalArea_x + 450, KDModalArea_y + 70, 800, "#ffffff", undefined, 28,);
	DrawTextFitKD(TextGet("KDStatBuy2"),
		KDModalArea_x + 450, KDModalArea_y + 100, 800, "#ffffff", undefined, 28,);

	let II = 0;
	for (let stat of KDBuyableStats) {
		let statMax = KDStat[stat].getMax(KinkyDungeonPlayerEntity);
		let canBuy = statMax < KDMaxStat;

		let amount = 2.5;
		if (statMax >= 20) amount -= 0.5;
		if (statMax >= 30) amount -= 1;

		DrawButtonKDEx("heartbuy" + stat, (_bdata) => {
			//KDSendInput("shrineBuy", {type: type, shopIndex: KinkyDungeonShopIndex});
			if (canBuy)
				KDStatChoice = stat;
			return true;
		}, true, KDModalArea_x + 50, KDModalArea_y + 155 + 60 * II, 200, 45, TextGet("KDStatBuy" + stat), "#ffffff", "", "", false,
		!canBuy, KDStatChoice == stat ? KDTextGray3 : KDTextGray2);
		DrawTextFitKD(TextGet(canBuy ? "KDStatBuyTemplate" : "KDStatBuyMax")
			.replace("AMNT1", "" + Math.floor(10 * statMax))
			.replace("AMNT2", "" + Math.floor(10 * (statMax + amount))),
		KDModalArea_x + 50 + 210, KDModalArea_y + 155 + 60 * II + 22, 100, "#ffffff", undefined, 16, "left");
		II++;
	}

	if (KDStatChoice) {
		let amount = 2.5;

		let statMax = KDStat[KDStatChoice].getMax(KinkyDungeonPlayerEntity);
		if (statMax >= 20) amount -= 0.5;
		if (statMax >= 30) amount -= 1;
		let amnt = Math.floor(amount * 10);
		let amnt2 = KDStat[KDStatChoice].getAmnt2 ? KDStat[KDStatChoice].getAmnt2(amnt) : 0;
		DrawTextFitKD(TextGet("KDStatBuy" + KDStatChoice + "Desc").replace("AMNT", "" + amnt),
			KDModalArea_x + 625, KDModalArea_y + 220, 450, "#ffffff", undefined, 20,);
		if (TextGet("KDStatBuy" + KDStatChoice + "Desc2") != "KDStatBuy" + KDStatChoice + "Desc2")
			DrawTextFitKD(TextGet("KDStatBuy" + KDStatChoice + "Desc2").replace("AMNT", "" + amnt2),
				KDModalArea_x + 625, KDModalArea_y + 220 + 25, 450, "#ffffff", undefined, 20,);

		DrawButtonKDEx("heartbuyconfirm", (_bdata) => {
			KDSendInput("heart", {type: KDStatChoice, targetTile: KinkyDungeonTargetTileLocation, amount: amount});
			return true;
		}, true, KDModalArea_x + 500, KDModalArea_y + 300, 250, 45, TextGet("KDStatBuyConfirm"), "#ffffff", "", "", false,
		false, KDTextGray2);
	}

}


function KDDrawOrb() {
	KDModalArea = true;
	let modalHeight = 150 + 55 * Object.entries(KinkyDungeonShrineBaseCosts).length;

	KDModalArea_y = 800 - modalHeight;
	KDModalArea_height = modalHeight + 100;
	KDModalArea_width = 900;

	FillRectKD(kdcanvas, kdpixisprites, "modalbg", {
		Left: KDModalArea_x,
		Top: KDModalArea_y,// + 25 - modalHeight,
		Width: KDModalArea_width,
		Height: modalHeight + 25,
		Color: KDButtonColor,
		LineWidth: 1,
		zIndex: 60,
		alpha: 0.8,
	});
	DrawRectKD(kdcanvas, kdpixisprites, "modalbg2", {
		Left: KDModalArea_x,
		Top: KDModalArea_y,// + 25 - modalHeight,
		Width: KDModalArea_width,
		Height: modalHeight + 25,
		Color: KDBorderColor,
		LineWidth: 1,
		zIndex: 60.1,
		alpha: 1.0,
	});


	let tile = KinkyDungeonTilesGet(KinkyDungeonTargetTileLocation);
	let spell = tile?.Spell ? KinkyDungeonFindSpell(tile.Spell) : null;

	if (tile) {
		KDOrbX = parseInt(KinkyDungeonTargetTileLocation.split(',')[0]);
		KDOrbY = parseInt(KinkyDungeonTargetTileLocation.split(',')[1]);
	}

	DrawTextFitKD(TextGet("KinkyDungeonOrbIntro" + (KinkyDungeonStatsChoice.get("randomMode") ? (
		(!spell || KDHasSpell(spell.name)) ? "KinkyRandom" : "Kinky") : ""))
		.replace("SHCL", TextGet("KinkyDungeonSpellsSchool" + spell?.school))
		.replace("SPLNME", TextGet("KinkyDungeonSpell" + spell?.name)),
	KDModalArea_x + 450, KDModalArea_y + 70, 800, "#ffffff", undefined, 28,);
	DrawTextFitKD(TextGet("KinkyDungeonOrbIntro2"),
		KDModalArea_x + 450, KDModalArea_y + 100, 800, "#ffffff", undefined, 28,);

	let i = 0;
	let XX = KDModalArea_x + 150;
	let spacing = 44;
	let yPad = 200;
	for (let shrine in KinkyDungeonShrineBaseCosts) {
		let value = KinkyDungeonGoddessRep[shrine];

		if (value != undefined) {
			let color = "#e7cf1a";
			if (value < -10) {
				if (value < -30) color = "#ff5277";
				else color = "#ff8933";
			} else if (value > 10) {
				if (value > 30) color = "#4fd658";
				else color = "#9bd45d";
			}
			DrawButtonKDEx("orbspell" + shrine, (_b) => {
				KDSendInput("orb", {shrine: shrine, Amount: 1, Rep: 1 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "DivinePrivilege")), x: KDOrbX, y: KDOrbY});
				return true;
			}, true, XX, yPad + KDModalArea_y + spacing * i - 27, 250, spacing - 8, TextGet("KinkyDungeonShrine" + shrine), "white", undefined, undefined, undefined, false, KDTextGray2);
			DrawProgressBar( 375 + XX, yPad + KDModalArea_y + spacing * i - (spacing-8)/4, 200, spacing/2, 50 + value, color, KDTextGray2);
			if (KinkyDungeonShrineBaseCosts[shrine])
				KDDrawRestraintBonus(shrine,  275 + XX + 30, yPad + KDModalArea_y + spacing * i, undefined, 24);

			i++;
		}

	}

	DrawButtonKDEx("orbspellrandom", (_b) => {
		let shrine = Object.keys(KinkyDungeonShrineBaseCosts)[Math.floor(KDRandom() * Object.keys(KinkyDungeonShrineBaseCosts).length)];
		KDSendInput("orb", {shrine: shrine, Amount: 1, Rep: 0.9 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "DivinePrivilege")), x: KDOrbX, y: KDOrbY});
		KinkyDungeonDrawState = "Game";
		return true;
	}, true,  XX, yPad + KDModalArea_y + spacing * i - 27 + 30, 250, spacing - 8, TextGet("KinkyDungeonSurpriseMe"), "white", undefined, undefined, undefined, false, KDTextGray2);
	i += 2;

}
