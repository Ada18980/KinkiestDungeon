interface PersistentNPCScript {
	/** Number of turns between wanders */
	cooldown: number,
	/** Whether or not NPC is willing to wander */
	filter: (id: number, mapData: KDMapDataType) => boolean,
	/** Chance of wandering this CD cycle */
	chance: (id: number, mapData: KDMapDataType) => number,
	/** Actually perform the wander activity */
	doScript: (id: number, mapData: KDMapDataType, entity: entity) => boolean,
}


let KDPersistentScriptList: Record<string, PersistentNPCScript> = {
	/** n/a */
	Default: {
		cooldown: 400,
		filter: (id, mapData) => {
			let npc = KDGetPersistentNPC(id);
			return KinkyDungeonCurrentTick > (npc.nextScriptTick || 0);
		},
		chance: (id, mapData) => {
			return 0;
		},
		doScript: (id, mapData, entity) => {
			// Chill and be well
			return true;
		},
	},
	/** n/a */
	MaidKnightAndSquire: {
		cooldown: 40,
		filter: (id, mapData) => {
			let npc = KDGetPersistentNPC(id);
			return KinkyDungeonCurrentTick > (npc.nextScriptTick || 0);
		},
		chance: (id, mapData) => {
			return 1;
		},
		doScript: (id, mapData, entity) => {
			let npc = KDGetPersistentNPC(id);
			let maidKnightID = npc.data?.MaidKnightHeavyID;
			let maidSquireID = npc.data?.MaidKnightLightID;
			let angered = false;
			if (id == maidKnightID) {
				if (KDGameData.Collection[maidSquireID + ""] && KDGetPersistentNPC(maidSquireID)?.collect) {
					angered = true;
				}
			} else if (id == maidSquireID) {
				if (KDGameData.Collection[maidKnightID + ""] && KDGetPersistentNPC(maidKnightID)?.collect) {
					angered = true;
				}
			}
			if (angered) {
				if (!npc.data) npc.data = {};
				npc.data.wanderTarget = KDGetCurrentLocation();
				// TODO make it so they look for clues to the player
			}
			return true;
		},
	},
};