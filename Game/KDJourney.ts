"use strict";

let KDJourneyGraphics = new PIXI.Graphics;
KDJourneyGraphics.zIndex = -0.1;
let KDGameBoardAddedJourney = false;

let KDJourneySlotTypes : Record<string, (Predecessor: KDJourneySlot, x: number, y: number) => KDJourneySlot> = {
	basic: (Predecessor, x, y) => {
		return {
			type: 'basic',
			x: x,
			y: y,
			Checkpoint: Predecessor?.Checkpoint || 'grv',
			color: "#ffffff",
			Connections: [], // Temporarily empty
			EscapeMethod: "Key", // TODO
			MapMod: "",
			RoomType: "",
			protected: false,
			visited: false,
		};
	},
	shop: (Predecessor, x, y) => {
		return {
			type: 'shop',
			x: x,
			y: y,
			Checkpoint: 'shoppe',
			color: "#ffffff",
			Connections: [],
			EscapeMethod: "None",
			MapMod: "",
			RoomType: "",
			protected: false,
			visited: false,
		};
	},
	boss: (Predecessor, x, y) => {
		return {
			type: 'boss',
			x: x,
			y: y,
			Checkpoint: Object.keys(KinkyDungeonMapIndex)[x % KDLevelsPerCheckpoint],
			color: "#ffffff",
			Connections: [],
			EscapeMethod: "Boss",
			MapMod: "",
			RoomType: "",
			protected: false,
			visited: false,
		};
	},
};

/**
 *
 * @param Width - Length of the JourneyArea being created
 * @param PreviousSlot - the JourneySlot preceding this one
 */
function KDCreateJourneyArea(Width: number, PreviousSlot: KDJourneySlot, FinalConnection: KDJourneySlot): KDJourneySlot[] {
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
				{x:1, y: - 1},
				{x:1, y: + 0},
				{x:1, y: + 1},
			];
			for (let f of forks) {
				// For each form we create a slot if its not there
				let newfork = createdSlots[(slot.x + f.x) + ',' + (slot.y + f.y)];
				if (!newfork) {
					// Create the slot
					newfork = KDJourneySlotSuccessor(slot, f.x, f.y);
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

function KDJourneySlotSuccessor(Slot: KDJourneySlot, xOffset: number, yOffset: number) : KDJourneySlot {
	// Temp function for testing
	// TODO add proper weights
	let type = "basic";
	return KDJourneySlotTypes[type](Slot, Slot.x + xOffset, Slot.y + yOffset);
}

/**
 * Culls the journey map
 * Removes all slots with no connections
 * Max of 100 to prevent infinite loops
 * Does not affect protected slots
 */
function KDCullJourneyMap(x: number, y: number) {
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
	console.log(`Cullec ${deleted} journey slots`);
}

function KDRenderJourneyMap(X: number, Y: number, Width: number = 7, Height: number = 5, ScaleX: number = 136, ScaleY: number = 100, xOffset: number = 1000, yOffset: number = 350, spriteSize: number = 72) {
	KDJourneyGraphics.clear();
	if (!KDGameBoardAddedJourney) {
		kdcanvas.addChild(KDJourneyGraphics);
		KDGameBoardAddedJourney = true;
	}

	let slots: Record<string, KDJourneySlot> = {};
	let minX = X;
	let maxX = X + Width;
	let minY = Y - Height;
	let maxY = Y + Height;

	// Add all slots to the rendering queue
	for (let slot of Object.values(KDGameData.JourneyMap)) {
		if (slot.x >= minX && slot.y >= minY && slot.x <= maxX && slot.y <= maxY) {
			slots[(slot.x) + ',' + (slot.y)] = slot;
		}
	}

	// Draw each slot
	for (let slot of Object.values(slots)) {
		let sprite = "UI/NavMap/" + slot.type;
		if (slot.x == KDGameData.JourneyX && slot.y == KDGameData.JourneyY) {

			KDJourneyGraphics.lineStyle(2, 0xffffff);
			KDJourneyGraphics.drawCircle(
				xOffset + ScaleX*(slot.x - X),
				yOffset + ScaleY*(slot.y - Y),
				spriteSize * 0.75
			);
		}
		KDDraw(kdcanvas, kdpixisprites, "navmap" + slot.x + ',' + slot.y,
			KinkyDungeonRootDirectory + sprite + '.png',
			xOffset + ScaleX*(slot.x - X) - spriteSize/2,
			yOffset + ScaleY*(slot.y - Y) - spriteSize/2,
			spriteSize, spriteSize, undefined,
		);
		if (slot.x < maxX)
			for (let c of slot.Connections) {
				KDDrawJourneyLine(
					xOffset + ScaleX*(slot.x - X) + spriteSize/4,
					yOffset + ScaleY*(slot.y - Y),
					xOffset + ScaleX*(c.x - X) - spriteSize/4,
					yOffset + ScaleY*(c.y - Y),
				)
			}
	}

}

function KDInitJourneyMap() {
	let simpleFirst = true;

	KDGameData.JourneyMap = {};
	KDGameData.JourneyX = 0;
	KDGameData.JourneyY = 0;

	let start = KDJourneySlotTypes.shop(null, 0, 0);
	let bosses = [];
	for (let i = 0; i + KDLevelsPerCheckpoint < KinkyDungeonMaxLevel; i += KDLevelsPerCheckpoint) {
		let boss = KDJourneySlotTypes[KinkyDungeonBossFloor(i + KDLevelsPerCheckpoint) ? 'boss' : 'basic'](null, i + KDLevelsPerCheckpoint, 0);
		if (i == 0 && simpleFirst) {
			let first = KDJourneySlotTypes.basic(start, i + 1, 0);
			start.Connections.push({x: i + 1, y: 0});
			KDCommitJourneySlots([start, first, ...KDCreateJourneyArea(KDLevelsPerCheckpoint - 2, first, boss)]);
		} else {
			KDCommitJourneySlots([start, ...KDCreateJourneyArea(KDLevelsPerCheckpoint - 1, start, boss)]);
		}
		bosses.push(boss);
		start = boss;
	}




}

function KDDrawJourneyLine(x1: number, y1: number, x2: number, y2: number) {
	KDJourneyGraphics.lineStyle(2, 0xffffff, 1);
	KDJourneyGraphics.moveTo(x1, y1);
	KDJourneyGraphics.lineTo(x2, y2);
	return;
}