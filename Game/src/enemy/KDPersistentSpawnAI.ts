interface PersistentSpawnAI {
	/** Number of turns between spawn cycles */
	cooldown: number,
	/** Whether or not NPC is willing to spawn */
	filter: (id: number, mapData: KDMapDataType) => boolean,
	/** Chance of wandering this CD cycle */
	chance: (id: number, mapData: KDMapDataType) => number,
	/** Actually perform the wander activity. True = go on cooldown*/
	doSpawn: (id: number, mapData: KDMapDataType, entity?: entity) => boolean,
}

let KDPersistentSpawnAIList: Record<string, PersistentSpawnAI> = {
	/** Default spawn AI: spawns the NPC at a random point on the map, if onmap, otherwise at the startposition with delayed spawn flag */
	Default: {
		cooldown: 50,
		filter: (id, mapData) => {
			let npc = KDGetPersistentNPC(id);
			return KinkyDungeonCurrentTick > (npc.nextSpawnTick || 0) && !npc.captured && KDNPCCanWander(npc.id);
		},
		chance: (id, mapData) => {
			return mapData == KDMapData ? 0.4 : 0.1;
		},
		doSpawn: (id, mapData, entity) => {
			if (!entity && !mapData.Entities.some((ent) => {
				return ent.id == id;
			})) {
				let npc = KDGetPersistentNPC(id);
				if (!npc.entity) return false;
				let ent = KDAddEntity(npc.entity,
					false, false, true, mapData);

				if (mapData == KDMapData) {
					ent.runSpawnAI = true;
					entity = ent;
				} else {
					ent.x = mapData.StartPosition.x;
					ent.y = mapData.StartPosition.y;
					ent.runSpawnAI = true;
					return true;
				}
			}
			if (entity && entity.runSpawnAI) {
				let npc = KDGetPersistentNPC(id);
				let point = (npc.fromType == undefined || npc.fromType == -1) ? KinkyDungeonGetRandomEnemyPoint(
					true, false, undefined, undefined, 10
				) : mapData.StartPosition;
				if (npc.fromType == 1) {
					point = mapData.EndPosition;
				} else if (npc.fromType == 2) {
					if (npc.fromIndex)
						point = KDGetNearestExitTo(npc.fromIndex,
					mapData.mapX, mapData.mapY,
					point.x, point.y, mapData, true);
				}
				if (point) {
					KDMoveEntity(entity, point.x, point.y,
						false, false, false, false,
						true, mapData);
					entity.runSpawnAI = false;
					delete npc.fromIndex;
					delete npc.fromType;
					return true;
				} else {
					// Wait till next spawn cycle
					KDRemoveEntity(entity, false, false,
						true, undefined, mapData);
					return true;
				}
			}

			return false;
		},
	},
	/** Dragon spawn AI: spawns the NPC at a random point on the map, same as default atm*/
	Dragon: {
		cooldown: 50,
		filter: (id, mapData) => {
			let npc = KDGetPersistentNPC(id);
			return KinkyDungeonCurrentTick > (npc.nextSpawnTick || 0) && !npc.captured && KDNPCCanWander(npc.id);
		},
		chance: (id, mapData) => {
			if (!KDIDHasFlag(id, "LairCheck")) return 1.0;
			return mapData == KDMapData ? 0.4 : 0.1;
		},
		doSpawn: (id, mapData, entity) => {
			if (!entity && !mapData.Entities.some((ent) => {
				return ent.id == id;
			})) {
				let npc = KDGetPersistentNPC(id);
				if (!npc.entity) return false;
				let ent = KDAddEntity(npc.entity,
					false, false, true, mapData);

				if (mapData == KDMapData) {
					ent.runSpawnAI = true;
					entity = ent;
				} else {
					ent.x = mapData.StartPosition.x;
					ent.y = mapData.StartPosition.y;
					ent.runSpawnAI = true;
					return true;
				}
			}
			if (entity && entity.runSpawnAI) {
				let npc = KDGetPersistentNPC(id);
				let point = (npc.fromType == undefined || npc.fromType == -1) ? KinkyDungeonGetRandomEnemyPoint(
					true, false, undefined, undefined, 10
				) : mapData.StartPosition;
				if (npc.fromType == 1) {
					point = mapData.EndPosition;
				} else if (npc.fromType == 2) {
					if (npc.fromIndex)
						//point = mapData.ShortcutPositions[npc.fromIndex];
						point = KDGetNearestExitTo(npc.fromIndex,
					mapData.mapX, mapData.mapY,
					point.x, point.y, mapData, true);
				}
				if (point && KinkyDungeonEntityAt(point.x, point.y)) {
					let pp = point;
					point = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, true);
					if (!point) {
						point = KinkyDungeonGetNearbyPoint(pp.x, pp.y, true);
					}
				}
				if (point) {
					KDMoveEntity(entity, point.x, point.y,
						false, false, false, false,
						true, mapData);
					entity.runSpawnAI = false;
					delete npc.fromIndex;
					delete npc.fromType;
					return true;
				} else {
					// Wait till next spawn cycle
					KDRemoveEntity(entity, false, false,
						true, undefined, mapData);
					return true;
				}
			}

			return false;
		},
	},
};

