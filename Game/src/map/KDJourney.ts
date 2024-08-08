"use strict";

let KDJourneyGraphics = new PIXI.Graphics;
KDJourneyGraphics.zIndex = -0.1;
let KDJourneyGraphicsLower = new PIXI.Graphics;
KDJourneyGraphicsLower.zIndex = -10;
let KDJourneyGraphicsUpper = new PIXI.Graphics;
KDJourneyGraphicsUpper.zIndex = 0;
let KDGameBoardAddedJourney = false;

let KDMapModRefreshList: MapMod[] = [KDMapMods.None];

let KDJourneySlotTypes : Record<string, (Predecessor: KDJourneySlot, x: number, y: number, forceCheckpoint?: string) => KDJourneySlot> = {
	basic: (Predecessor, x, y, forceCheckpoint) => {
		let checkpoint : string = forceCheckpoint || Predecessor?.Checkpoint || 'grv';
		if (!forceCheckpoint)
			checkpoint = KDGetJourneySuccessorCheckpoint(checkpoint, x - (Predecessor?.x || 0));

		/*if (!forceCheckpoint && y % KDLevelsPerCheckpoint == 1) {
			let succ = Object.values(KinkyDungeonMapIndex)[Math.floor(y/KDLevelsPerCheckpoint)];
			for (let i = 0; i < 10; i++) {
				if (succ == Predecessor?.Checkpoint) {
					succ = KDGetJourneySuccessorCheckpoint(Object.values(KinkyDungeonMapIndex)[Math.floor(y/KDLevelsPerCheckpoint)], x - (Predecessor?.x || 0));
				} else {
					break;
				}
			}
			if (x - (Predecessor?.x || 0) == 0) {
				// meh
				checkpoint = succ;
			} else {
				checkpoint = KDGetJourneySuccessorCheckpoint(succ, x - (Predecessor?.x || 0));
			}
		}*/

		let slot = {
			type: 'basic',
			x: x,
			y: y,
			Checkpoint: checkpoint,
			color: KinkyDungeonMapParams[checkpoint]?.color || "#ffffff",
			Connections: [], // Temporarily empty
			protected: false,
			visited: false,
			EscapeMethod: KDGetRandomEscapeMethod(),
			MapMod: "",
			RoomType: "",
			Faction: "",
			SideRooms: [],
		};

		// We make it so basically map mods cant repeat for the same 3 generated tiles in a row
		// Helps shake things up randomly
		if (KDMapModRefreshList.length == 0) {
			KDMapModRefreshList = KDGetMapGenList(3, KDMapMods, slot);
		}
		let index = Math.floor(KDRandom() * KDMapModRefreshList.length);
		let MapMod = KDMapModRefreshList[index]?.name;
		KDMapModRefreshList.splice(index, 1);


		if (KDMapMods[MapMod]?.escapeMethod)
			slot.EscapeMethod = KDMapMods[MapMod]?.escapeMethod;
		slot.MapMod = MapMod;
		slot.RoomType = KDMapMods[MapMod]?.roomType || "";
		slot.Faction = KDMapMods[MapMod]?.faction || "";

		if (y > 1) {
			let sideTop = KDGetSideRoom(slot, true, slot.SideRooms);
			if (sideTop) {
				slot.SideRooms.push(sideTop.name);
			}
			let sideBot = KDGetSideRoom(slot, false, slot.SideRooms);
			if (sideBot) {
				slot.SideRooms.push(sideBot.name);
			}
		} else if (y == 1) {
			let sideTop = KDGetSideRoom(slot, true, slot.SideRooms, "elevatorstart");
			if (!sideTop) sideTop = KDSideRooms.ElevatorEgyptian;
			if (sideTop) {
				slot.SideRooms.push(sideTop.name);
			}
		}


		return slot;
	},
	shop: (Predecessor, x, y, forceCheckpoint) => {
		//let checkpoint : string = forceCheckpoint || 'grv';
		return {
			type: 'shop',
			x: x,
			y: y,
			Checkpoint: 'shoppe',
			color: "#ffffff",
			Connections: [],
			EscapeMethod: "",
			MapMod: "",
			RoomType: "ShopStart",
			Faction: "",
			protected: true,
			visited: false,
			SideRooms: [],
		};
	},
	boss: (Predecessor, x, y, forceCheckpoint) => {
		let checkpoint : string = forceCheckpoint
			|| KinkyDungeonBossFloor(y)?.forceCheckpoint
			|| Object.values(KinkyDungeonMapIndex)[Math.floor(Math.max(0, y - 1)/KDLevelsPerCheckpoint)]
			|| Predecessor?.Checkpoint
			|| 'grv';
		return {
			type: 'boss',
			x: x,
			y: y,
			Checkpoint: checkpoint,
			color: KinkyDungeonMapParams[checkpoint]?.color || "#ffffff",
			Connections: [],
			EscapeMethod: "Boss",
			MapMod: "",
			RoomType: "",
			Faction: "",
			protected: true,
			visited: false,
			SideRooms: [],
		};
	},
};

/**
 *
 * @param Width - Length of the JourneyArea being created
 * @param PreviousSlot - the JourneySlot preceding this one
 */
function KDCreateJourneyArea(Width: number, PreviousSlot: KDJourneySlot, FinalConnection: KDJourneySlot, continueCheckpoints?: boolean): KDJourneySlot[] {
	let slots: KDJourneySlot[] = [];
	let currentRow: KDJourneySlot[] = [];
	let nextRow: KDJourneySlot[] = [PreviousSlot];
	let createdSlots: Record<string, KDJourneySlot> = {};

	// Create the web
	for (let i = 0; i < Width; i++) {
		currentRow = nextRow;
		nextRow = [];

		for (let slot of currentRow) {
			let forks = [
				{x:+ 0, y: + 1},
				{x:+ 1, y: + 1},
				{x:- 1, y: + 1},
			];
			for (let f of forks) {
				// For each form we create a slot if its not there
				let newfork = createdSlots[(slot.x + f.x) + ',' + (slot.y + f.y)];
				if (!newfork) {
					// Create the slot
					let succ: string = undefined;
					if (slot.y % KDLevelsPerCheckpoint == 0 && continueCheckpoints && KDGameData.JourneyMap[(slot.x + f.x) + ',' + (slot.y + f.y - 2)]) {
						if (slot.x + f.x != 0) {
							succ = KDGameData.JourneyMap[(slot.x + f.x) + ',' + (slot.y + f.y - 2)].Checkpoint;
							succ = KDGetJourneySuccessorCheckpoint(succ, slot.x + f.x);
						} else {
							succ = KDGameData.JourneyProgression[Math.floor(Math.max(0, slot.y)/KDLevelsPerCheckpoint)];
						}

					}
					newfork = KDJourneySlotSuccessor(slot, f.x, f.y, succ);
					slots.push(newfork);
					nextRow.push(newfork);
					createdSlots[(slot.x + f.x) + ',' + (slot.y + f.y)] = newfork;
					if (i == Width-1 && FinalConnection) {
						newfork.Connections.push({x: FinalConnection.x, y: FinalConnection.y});
					}
				}
				// Add a connection whether created or not
				slot.Connections.push({x: newfork.x, y: newfork.y});
			}
		}
	}

	return slots;
}

function KDCommitJourneySlots(slots: KDJourneySlot[]) {
	for (let slot of slots) {
		KDGameData.JourneyMap[slot.x + ',' + slot.y] = slot;
	}
}

function KDJourneySlotSuccessor(Slot: KDJourneySlot, xOffset: number, yOffset: number, forceCheckpoint?: string) : KDJourneySlot {
	// Temp function for testing
	// TODO add proper weights
	let type = "basic";
	return KDJourneySlotTypes[type](Slot, Slot.x + xOffset, Slot.y + yOffset, forceCheckpoint);
}

/**
 * Culls the journey map
 * Removes all slots with no connections
 * Max of 100 to prevent infinite loops
 * Does not affect protected slots
 */
function KDCullJourneyMap() {
	let deleted = 0;
	for (let i = 0; i < 100; i++) {
		let connected: Record<string, boolean> = {};
		for (let slot of Object.values(KDGameData.JourneyMap)) {
			for (let c of slot.Connections) {
				connected[c.x + ',' + c.y] = true;
			}
		}
		let toDelete: Record<string, boolean> = {};

		for (let slot of Object.entries(KDGameData.JourneyMap)) {
			if (!connected[slot[0]] && !slot[1].protected && !slot[1].visited)
				toDelete[slot[0]] = true;
		}

		for (let slot of Object.keys(toDelete)) {
			delete KDGameData.JourneyMap[slot];
			deleted++;
		}
	}
	console.log(`Culled ${deleted} journey slots`);
}

function KDRenderJourneyMap(X: number, Y: number, Width: number = 5, Height: number = 7, ScaleX: number = 100, ScaleY: number = 136, xOffset: number = 1500, yOffset: number = 212, spriteSize: number = 72, TextOffset: number = 1925) {


	DrawButtonKDEx("cancelJourney", (bdata) => {
		KinkyDungeonState = "Game";
		KDGameData.JourneyTarget = null;
		return true;
	}, true, 800, 900, 400, 55, TextGet("KinkyDungeonCancel"), "white", undefined, undefined, undefined, undefined, undefined, undefined, undefined,  {
		hotkey: KDHotkeyToText(KinkyDungeonKeySkip[0]),
		hotkeyPress: KinkyDungeonKeySkip[0],
	});

	if (KDGameData.JourneyTarget && KinkyDungeonStairTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y)))
		DrawButtonKDEx("confirmJourney", (bdata) => {
			KinkyDungeonState = "Game";
			KinkyDungeonConfirmStairs = true;
			KinkyDungeonMove({x: 0, y: 0}, 1, true);
			return true;
		}, true, 1300, 900, 400, 55, TextGet("KDNavMapConfirm"), "white", undefined, undefined, undefined, undefined, undefined, undefined, undefined,  {
			hotkey: KDHotkeyToText(KinkyDungeonKeyEnter[0]),
			hotkeyPress: KinkyDungeonKeyEnter[0],
		});


	if (!KDGameBoardAddedJourney) {
		kdcanvas.addChild(KDJourneyGraphics);
		kdcanvas.addChild(KDJourneyGraphicsLower);
		kdcanvas.addChild(KDJourneyGraphicsUpper);


		KDGameBoardAddedJourney = true;
	}

	let slots: Record<string, KDJourneySlot> = {};
	let minX = X - Width;
	let maxX = X + Width;
	let minY = Y;
	let maxY = Y + Height;

	let heights : Record<string, boolean> = {};

	// Add all slots to the rendering queue
	for (let slot of Object.values(KDGameData.JourneyMap)) {
		if (slot.x >= minX && slot.y >= minY && slot.x <= maxX && slot.y <= maxY) {
			slots[(slot.x) + ',' + (slot.y)] = slot;
		}
	}

	let selectedJourney: KDJourneySlot = null;

	// Draw each slot
	for (let slot of Object.values(slots)) {
		let sprite = "UI/NavMap/" + slot.type;
		if (slot.x == KDGameData.JourneyX && slot.y == KDGameData.JourneyY) {

			KDJourneyGraphics.lineStyle(3, 0xffffff);
			KDJourneyGraphics.drawCircle(
				xOffset + ScaleX*(slot.x - X),
				yOffset + ScaleY*(slot.y - Y),
				spriteSize * 0.7
			);
		}
		KDDraw(kdcanvas, kdpixisprites, "navmap" + slot.x + ',' + slot.y,
			KinkyDungeonRootDirectory + sprite + '.png',
			xOffset + ScaleX*(slot.x - X) - spriteSize/2,
			yOffset + ScaleY*(slot.y - Y) - spriteSize/2,
			spriteSize, spriteSize, undefined, {
				tint: string2hex(slot.color)
			}
		);

		if (MouseIn(
			xOffset + ScaleX*(slot.x - X) - spriteSize/2,
			yOffset + ScaleY*(slot.y - Y) - spriteSize/2, spriteSize, spriteSize)
		) {
			if (!selectedJourney) selectedJourney = slot;
			if (mouseDown || MouseClicked) {
				MouseClicked = false;
				// Check if there is connection
				let conn = false;
				let current = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
				if (current && current.Connections.some((c) => {return c.x == slot.x && c.y == slot.y;}))
					conn = true;
				if (conn) {
					KDGameData.JourneyTarget = {
						x: slot.x,
						y: slot.y,
					};
				} else {
					KDGameData.JourneyTarget = null;
				}
			}
		}

		if (!heights["" + slot.y]) {
			heights["" + slot.y] = true;
			DrawTextFitKD(TextGet("KDNavMap_Floor").replace("NMB", "" + slot.y), TextOffset, yOffset + ScaleY*(slot.y - Y),
				200, "#ffffff", KDTextGray0, 24);
			KDJourneyGraphicsLower.lineStyle(spriteSize*2, 0x000000, 0.2);
			KDJourneyGraphicsLower.moveTo(xOffset - ScaleX*Width + 150, yOffset + ScaleY*(slot.y - Y));
			KDJourneyGraphicsLower.lineTo(xOffset + ScaleX*Width - 150, yOffset + ScaleY*(slot.y - Y));
		}
		if ((slot.x < maxX && slot.x > minX && slot.y < maxY))
			for (let c of slot.Connections) {
				let mod = 0;
				if (
					KDGameData.JourneyTarget && KDGameData.JourneyMap[KDGameData.JourneyTarget.x + ',' + KDGameData.JourneyTarget.y] != slot
				) mod = -1;
				let highlight = (slot.y <= KDGameData.JourneyY + mod)
					|| (KDGameData.JourneyTarget && KDGameData.JourneyMap[c.x + ',' + c.y] == KDGameData.JourneyMap[KDGameData.JourneyTarget.x + ',' + KDGameData.JourneyTarget.y]);
				KDDrawJourneyLine(
					xOffset + ScaleX*(slot.x - X),
					yOffset + ScaleY*(slot.y - Y) + spriteSize/4,
					xOffset + ScaleX*(c.x - X),
					yOffset + ScaleY*(c.y - Y) - spriteSize/4,
					(highlight) ? 0xffffff : 0x888888,
					highlight ? KDJourneyGraphicsUpper : undefined
				)
			}
	}

	let currentSlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];

	if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKey[2]) {
		// Down
		if (currentSlot?.Connections && currentSlot.Connections[0]) {
			KDGameData.JourneyTarget = currentSlot.Connections[0];
			selectedJourney = KDGameData.JourneyMap[KDGameData.JourneyTarget.x + ',' + KDGameData.JourneyTarget.y];
		}
	} else
	if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKey[7]) {
		// Down Right
		if (currentSlot?.Connections && currentSlot.Connections[1]) {
			KDGameData.JourneyTarget = currentSlot.Connections[1];
			selectedJourney = KDGameData.JourneyMap[KDGameData.JourneyTarget.x + ',' + KDGameData.JourneyTarget.y];
		}
	} else
	if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKey[6]) {
		// Down Left
		if (currentSlot?.Connections && currentSlot.Connections[2]) {
			KDGameData.JourneyTarget = currentSlot.Connections[2];
			selectedJourney = KDGameData.JourneyMap[KDGameData.JourneyTarget.x + ',' + KDGameData.JourneyTarget.y];
		}
	} else

	if (!selectedJourney) {
		selectedJourney = KDGameData.JourneyMap[KDGameData.JourneyTarget ? (KDGameData.JourneyTarget.x + ',' + KDGameData.JourneyTarget.y) : (KDGameData.JourneyX + ',' + KDGameData.JourneyY)];
	}

	if (selectedJourney) {
		KDJourneyGraphics.lineStyle(1, 0xffffff);
		KDJourneyGraphics.drawCircle(
			xOffset + ScaleX*(selectedJourney.x - X),
			yOffset + ScaleY*(selectedJourney.y - Y),
			spriteSize * 0.65
		);

		let x = xOffset - (Width) * ScaleX - 440 + 50;
		let y = yOffset - ScaleY/2 - spriteSize/4;
		FillRectKD(kdcanvas, kdpixisprites, "collectionselectionbg", {
			Left: x,
			Top: y,
			Width: 440,
			Height: 730,
			Color: "#000000",
			LineWidth: 1,
			zIndex: -20,
			alpha: 0.5
		});
		DrawRectKD(kdcanvas, kdpixisprites, "collectionselectionbg2", {
			Left: x,
			Top: y,
			Width: 440,
			Height: 730,
			Color: "#888888",
			LineWidth: 1,
			zIndex: -19,
			alpha: 0.9
		});


		DrawTextFitKD(TextGet("DungeonName" + selectedJourney.Checkpoint), x + 220, y + 50, 500, "#ffffff",
			(selectedJourney.color && selectedJourney.color != "#ffffff") ? selectedJourney.color : KDTextGray05, 36);
		DrawTextFitKD(TextGet("KDNavMap_Floor").replace("NMB", "" + selectedJourney.y), x + 220, y + 15, 500, "#ffffff", KDTextGray05, 18);

		let II = 0;
		let spacing = 32;
		let off = 100;
		let fontsize = 20;
		let fontsize2 = 24;
		let subspacePercent = 0.35;
		DrawTextFitKD(TextGet("KDNavMap_Faction"), x + 220, y + off + spacing*II++, 500, "#ffffff", KDTextGray05, fontsize);
		DrawTextFitKD(TextGet("KinkyDungeonFaction" + (selectedJourney.Faction || "")), x + 220, y + off + spacing*II++, 500, "#ffffff", KDTextGray05, fontsize2);
		II+= subspacePercent;
		DrawTextFitKD(TextGet("KDNavMap_RoomType"), x + 220, y + off + spacing*II++, 500, "#ffffff", KDTextGray05, fontsize);
		DrawTextFitKD(TextGet("KDRoomType_" + (selectedJourney.RoomType || "")), x + 220, y + off + spacing*II++, 500, "#ffffff", KDTextGray05, fontsize2);
		II+= subspacePercent;
		DrawTextFitKD(TextGet("KDNavMap_MapMod"), x + 220, y + off + spacing*II++, 500, "#ffffff", KDTextGray05, fontsize);
		DrawTextFitKD(TextGet("KDMapMod_" + (selectedJourney.MapMod || "")), x + 220, y + off + spacing*II++, 500, "#ffffff", KDTextGray05, fontsize2);
		II+= subspacePercent;
		DrawTextFitKD(TextGet("KDNavMap_EscapeMethod"), x + 220, y + off + spacing*II++, 500, "#ffffff", KDTextGray05, fontsize);
		DrawTextFitKD(TextGet("KDEscapeMethod_" + (selectedJourney.EscapeMethod || "")), x + 220, y + off + spacing*II++, 500, "#ffffff", KDTextGray05, fontsize2);
		II+= subspacePercent;
		if (selectedJourney.SideRooms && selectedJourney.SideRooms.length > 0) {
			DrawTextFitKD(TextGet("KDNavMap_SideRooms"), x + 220, y + off + spacing*II++, 500, "#ffffff", KDTextGray05, fontsize);
			for (let sr of selectedJourney.SideRooms)
				DrawTextFitKD(TextGet("KDSideRoom_" + (sr || "")), x + 220, y + off + spacing*II++, 500, "#ffffff", KDTextGray05, fontsize2);
			II+= subspacePercent;
		}

	}

}

function KDInitJourneyMap(Level = 0) {
	let simpleFirst = true;
	let continueCheckpoints = true;

	KDGameData.JourneyMap = {};
	KDGameData.JourneyX = 0;
	KDGameData.JourneyY = Level;

	let start = KDJourneySlotTypes.shop(null, 0, 0);
	let bosses = [];
	for (let i = 0; i + KDLevelsPerCheckpoint < KinkyDungeonMaxLevel; i += KDLevelsPerCheckpoint) {
		let boss = KDJourneySlotTypes[KinkyDungeonBossFloor(i + KDLevelsPerCheckpoint) ? 'boss' : 'basic'](null, 0, i + KDLevelsPerCheckpoint);
		if (i == 0 && simpleFirst) {
			let first = KDJourneySlotTypes.basic(start, 0, i + 1, KDGameData.JourneyProgression[0]);
			start.Connections.push({x: 0, y: i + 1});
			KDCommitJourneySlots([start, first, ...KDCreateJourneyArea(KDLevelsPerCheckpoint - 2, first, boss)]);
		} else {
			KDCommitJourneySlots([start, ...KDCreateJourneyArea(KDLevelsPerCheckpoint - 1, start, boss, continueCheckpoints && i >= KDLevelsPerCheckpoint)]);
		}
		bosses.push(boss);
		start = boss;
		if (i + 2*KDLevelsPerCheckpoint > KinkyDungeonMaxLevel) {
			KDCommitJourneySlots([boss]);
		}
	}




}

function KDDrawJourneyLine(x1: number, y1: number, x2: number, y2: number, color: number, Canvas = KDJourneyGraphics) {
	Canvas.lineStyle(2, color, 1);
	Canvas.moveTo(x1, y1);
	Canvas.lineTo(x2, y2);
	return;
}

function KDGetJourneySuccessorCheckpoint(previousCheckpoint, x) {
	let param: floorParams = KinkyDungeonMapParams[KDGameData.Journey == "Random" ? CommonRandomItemFromList(undefined, [...KDDefaultAlt, ...KDDefaultJourney]) : previousCheckpoint];
	if (param) {
		let list = param.successorSame;
		if (x > 0) list = param.successorPositive;
		else if (x < 0) list = param.successorNegative;
		let successor = KDGetByWeight(list);
		return successor;
	}
	return 'grv';
}

