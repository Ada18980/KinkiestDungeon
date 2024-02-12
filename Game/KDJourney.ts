"use strict";

let KDJourneySlotTypes : Record<string, (Predecessor: KDJourneySlot, x: number, y: number) => KDJourneySlot> = {
	basic: (Predecessor, x, y) => {
		return {
			x: x,
			y: y,
			Checkpoint: Predecessor?.Checkpoint || 'grv',
			color: "#ffffff",
			Connections: [], // Temporarily empty
			EscapeMethod: "Key", // TODO
			MapMod: "",
			RoomType: "",
			type: 'basic',
			protected: false,
			visited: false,
		};
	}
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