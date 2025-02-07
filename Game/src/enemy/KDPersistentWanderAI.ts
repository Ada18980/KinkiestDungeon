interface PersistentWanderAI {
	/** Number of turns between wanders */
	cooldown: number,
	/** Whether or not NPC is willing to wander */
	filter: (id: number, mapData: KDMapDataType) => boolean,
	/** Chance of wandering this CD cycle */
	chance: (id: number, mapData: KDMapDataType) => number,
	/** Actually perform the wander activity */
	doWander: (id: number, mapData: KDMapDataType, entity: entity) => boolean,
}


let KDPersistentWanderAIList: Record<string, PersistentWanderAI> = {
	/** Default wander AI: choose to visit one of the journey slots on a tile, or move. */
	GoToMain: {
		cooldown: 400,
		filter: (id, mapData) => {
			let npc = KDGetPersistentNPC(id);
			return KinkyDungeonCurrentTick > (npc.nextWanderTick || 0) && !npc.captured && KDNPCCanWander(npc.id);
		},
		chance: (id, mapData) => {
			return mapData == KDMapData ? 0.33 : 0.8;
		},
		doWander: (id, mapData, entity) => {
			let currentWorldPosition = KDGetNPCLocation(id);
			let targetPosition = KDGetNPCLocation(id);
			let worldSlot = KDGetWorldMapLocation({x: currentWorldPosition.mapX, y: currentWorldPosition.mapY});
			let journeySlot = KDGameData.JourneyMap[
				(worldSlot.jx != undefined ? worldSlot.jx : currentWorldPosition.mapX) + ','
				+ (worldSlot.jy != undefined ? worldSlot.jy : currentWorldPosition.mapY)];

			let fromType = 0;
			let fromIndex = "0";

			if (currentWorldPosition.mapY < KDGameData.HighestLevelCurrent
				&& journeySlot?.SideRooms.length > 0 && worldSlot?.data && KDRandom() < 0.5) {
				// 50% chance to stay or go to main
				if (currentWorldPosition.room != worldSlot.main) {
					targetPosition.room = worldSlot.main || "";

					fromType = 2;
					fromIndex = currentWorldPosition.room;

					if (fromIndex == "-1") fromType = 0;
				}
			}

			if (!KDCompareLocation(currentWorldPosition, targetPosition)) {
				if (!entity) {
					entity = mapData?.Entities.find((ent) => {
						return ent.id == id;
					});

				}
				// Despawn first

				let halt = false;
				if (entity) {
					if (KDEnemyCanDespawn(id, mapData)) {
						KDDespawnEnemy(entity, undefined, mapData);
					} else {
						let exit = KDGetNearestExitTo(targetPosition.room, targetPosition.mapX, targetPosition.mapY,
							entity.x, entity.y, mapData, true
						);
						if (!exit) {exit = KDMapData.EndPosition;}
						if (exit) {
							entity.despawnX = exit.x;
							entity.despawnY = exit.y;
							entity.goToDespawn = true;
						}
						halt = true;
					}
				}
				if (halt) return true;

				// Move the entity
				if (KDMovePersistentNPC(id, targetPosition)) {
					let npc = KDGetPersistentNPC(id);
					npc.fromType = fromType;
					npc.fromIndex = fromIndex;
				}
				return true;
			} else {
				let npc = KDGetPersistentNPC(id);
				npc.fromType = -1;
				delete npc.fromIndex;
			}

			return false;
		},
	},
	/** normal wander AI: choose to visit one of the journey slots on a tile, or move. */
	Default: {
		cooldown: 400,
		filter: (id, mapData) => {
			let npc = KDGetPersistentNPC(id);
			return KinkyDungeonCurrentTick > (npc.nextWanderTick || 0) && !npc.captured && KDNPCCanWander(npc.id);
		},
		chance: (id, mapData) => {
			return mapData == KDMapData ? 0.33 : 0.8;
		},
		doWander: (id, mapData, entity) => {
			return KDStandardWander(id, mapData, entity, () => {
				let NPC = KDGetPersistentNPC(id);
				let AITags = {
					generic: 1.0,
				};
				AITags["owner_" + id] = 1;
				if (NPC?.partyLeader) {
					AITags["owner_" + id] = 0.5;
				}
				if (NPC?.entity) {
					AITags["faction_" + KDGetFaction(NPC.entity)] = 1;
				}
				return AITags;
			});
		},
	},
	/** regular wander, but visits lair every 600 turns*/
	Dragon: {
		cooldown: 175,
		filter: (id, mapData) => {
			let npc = KDGetPersistentNPC(id);
			return KinkyDungeonCurrentTick > (npc.nextWanderTick || 0) && !npc.captured && KDNPCCanWander(npc.id);
		},
		chance: (id, mapData) => {
			if (!KDIDHasFlag(id, "LairCheck")) return 1.0;
			return mapData == KDMapData ? 0.25 : 0.75;
		},
		doWander: (id, mapData, entity) => {
			let forceLair = false;
			if (!KDIDHasFlag(id, "LairCheck")) {
				KDSetIDFlag(id, "LairCheck", 550);
				forceLair = true;
			}
			return KDStandardLairWander(id, mapData, entity, forceLair, 550, () => {
				let NPC = KDGetPersistentNPC(id);
				let AITags = {
					generic: 1.0,
				};
				AITags["owner_" + id] = 1;
				if (NPC?.partyLeader) {
					AITags["owner_" + id] = 0.5;
				}
				if (NPC?.entity) {
					AITags["faction_" + KDGetFaction(NPC.entity)] = 1;
				}
				return AITags;
			});
		},
	},
	/** regular wander unless targeted*/
	Targeted: {
		cooldown: 90,
		filter: (id, mapData) => {
			let npc = KDGetPersistentNPC(id);
			return KinkyDungeonCurrentTick > (npc.nextWanderTick || 0) && !npc.captured && KDNPCCanWander(npc.id);
		},
		chance: (id, mapData) => {
			if (KDGetPersistentNPC(id)?.data?.wanderTarget) return 1.0;
			return mapData == KDMapData ? 0.25 : 0.8;
		},
		doWander: (id, mapData, entity) => {
			let forceTarget = false;
			if (KDGetPersistentNPC(id)?.data?.wanderTarget) {
				forceTarget = true;
			}
			return KDStandardTargetedWander(id, mapData, entity, forceTarget, KDGetPersistentNPC(id)?.data?.wanderTarget, () => {
				let NPC = KDGetPersistentNPC(id);
				let AITags = {
					generic: 1.0,
				};
				AITags["owner_" + id] = 1;
				if (NPC?.partyLeader) {
					AITags["owner_" + id] = 0.5;
				}
				if (NPC?.entity) {
					AITags["faction_" + KDGetFaction(NPC.entity)] = 1;
				}
				return AITags;
			});
		},
	},
};

function KDStandardWander(id: number, mapData: KDMapDataType, entity: entity, AITagFunc: () => Record<string, number>): boolean {
	let currentWorldPosition = KDGetNPCLocation(id);
	let targetPosition = KDGetNPCLocation(id);
	let worldSlot = KDGetWorldMapLocation({x: currentWorldPosition.mapX, y: currentWorldPosition.mapY});
	let journeySlot = KDGameData.JourneyMap[
		(worldSlot.jx != undefined ? worldSlot.jx : currentWorldPosition.mapX) + ','
		+ (worldSlot.jy != undefined ? worldSlot.jy : currentWorldPosition.mapY)];

	let fromType = 0;
	let fromIndex = "0";

	if (currentWorldPosition.mapY <= KDGameData.HighestLevelCurrent
		&& journeySlot?.SideRooms.length > 0 && worldSlot?.data && KDRandom() < 0.5) {
		// 50% chance to go to a side room or go to normal
		if (currentWorldPosition.room == (worldSlot.main || "")) {
			let AITags = AITagFunc();

			let result = KDGetByWeight(KDGetPersistentWanderWeightsForRoom(
				AITags, currentWorldPosition, true
			))

			if (result) {
				targetPosition.room = result;
				fromType = 0;
			} else {
				targetPosition.room = worldSlot.main || "";
				fromType = 2;
				fromIndex = currentWorldPosition.room;

				if (fromIndex == "-1") fromType = 0;
			}
		} else {
			targetPosition.room = worldSlot.main || "";
			fromType = 2;
			fromIndex = currentWorldPosition.room;

			if (fromIndex == "-1") fromType = 0;
		}
	} else if (currentWorldPosition.room == (worldSlot.main || "")) {
		// Go up or down
		// We dont go beyond current max level
		let dy = KDRandom() < 0.5 ? -1 : 1;
		// Wont go up if its a boss level
		if (currentWorldPosition.mapY + dy == KDGameData.HighestLevelCurrent
			&& KinkyDungeonBossFloor(currentWorldPosition.mapY + dy)
		) {
			// Dont move
			dy = 0;
		}

		if (dy < 0) {
			fromType = 1;
		}

		if (dy && currentWorldPosition.mapY + dy > 0 && currentWorldPosition.mapY + dy <= KDGameData.HighestLevelCurrent) {
			targetPosition.mapY = currentWorldPosition.mapY + dy;
		}
	}

	if (!KDCompareLocation(currentWorldPosition, targetPosition)) {
		if (!entity) {
			entity = mapData?.Entities.find((ent) => {
				return ent.id == id;
			});

		}
		// Despawn first
		let halt = false;
		if (entity) {
			if (KDEnemyCanDespawn(id, mapData)){
				KDDespawnEnemy(entity, undefined, mapData);
			} else {
				let exit = KDGetNearestExitTo(targetPosition.room, targetPosition.mapX, targetPosition.mapY,
					entity.x, entity.y, mapData, true
				);
				if (!exit) {exit = KDMapData.EndPosition;}
				if (exit) {
					entity.despawnX = exit.x;
					entity.despawnY = exit.y;
					entity.goToDespawn = true;
				}
				halt = true;
			}
		}
		if (halt) return true;
		// Move the entity
		if (KDMovePersistentNPC(id, targetPosition)) {
			let npc = KDGetPersistentNPC(id);
			npc.fromType = fromType;
			npc.fromIndex = fromIndex;
		}
		return true;
	}

	return false;
}


function KDStandardLairWander(id: number, mapData: KDMapDataType, entity: entity, modeAlternate: boolean, duration: number, AITagFunc: () => Record<string, number>): boolean {
	let currentWorldPosition = KDGetNPCLocation(id);
	let targetPosition = KDGetNPCLocation(id);
	let worldSlot = KDGetWorldMapLocation({x: currentWorldPosition.mapX, y: currentWorldPosition.mapY});
	let journeySlot = KDGameData.JourneyMap[
		(worldSlot.jx != undefined ? worldSlot.jx : currentWorldPosition.mapX) + ','
		+ (worldSlot.jy != undefined ? worldSlot.jy : currentWorldPosition.mapY)];

	let fromType = 0;
	let fromIndex = "0";
	let NPC = KDGetPersistentNPC(id);

	if (modeAlternate && !(KDPersonalAlt[currentWorldPosition.room]?.OwnerNPC == id)) {
		KDSetIDFlag(id, "LairCheck", 0);
	}

	if (currentWorldPosition.mapY <= KDGameData.HighestLevelCurrent
		&& journeySlot?.SideRooms.length > 0 && worldSlot?.data && ((!modeAlternate && KDRandom() < 0.5)
		|| (modeAlternate
			// Force go to lair
			&& NPC.entity.homeCoord && (
				currentWorldPosition.mapX == NPC.entity.homeCoord.mapX
				&& currentWorldPosition.mapY == NPC.entity.homeCoord.mapY
				&& currentWorldPosition.room != NPC.entity.homeCoord.room
			)
		))) {
		// 50% chance to go to a side room or go to normal
		if (currentWorldPosition.room == (worldSlot.main || "")) {

			if ( (modeAlternate
				// Force go to lair
				&& NPC.entity.homeCoord && (
					currentWorldPosition.mapX == NPC.entity.homeCoord.mapX
					&& currentWorldPosition.mapY == NPC.entity.homeCoord.mapY
					&& currentWorldPosition.room != NPC.entity.homeCoord.room
				)
			)) {
				let lairs = KDGetLairs(worldSlot, id);
				if (lairs.length > 0) {
					let result = lairs[Math.floor(KDRandom() * lairs.length)];
					targetPosition.room = result[0];
					fromType = 0;
					KDSetIDFlag(id, "LairCheck", duration);
				}
			} else {
				let AITags = AITagFunc();

				let result = KDGetByWeight(KDGetPersistentWanderWeightsForRoom(
					AITags, currentWorldPosition, true
				))

				if (result) {
					targetPosition.room = result;
					fromType = 0;
				} else {
					targetPosition.room = worldSlot.main || "";
					fromType = 2;
					fromIndex = currentWorldPosition.room;

					if (fromIndex == "-1") fromType = 0;
				}
			}

		} else {
			targetPosition.room = worldSlot.main || "";
			fromType = 2;
			fromIndex = currentWorldPosition.room;

			if (fromIndex == "-1") fromType = 0;
		}
	} else if ((modeAlternate && NPC.entity.homeCoord && (
		currentWorldPosition.mapX != NPC.entity.homeCoord.mapX
		|| currentWorldPosition.mapY != NPC.entity.homeCoord.mapY
	)) || (!modeAlternate && currentWorldPosition.room == (worldSlot.main || ""))) {
		// Go up or down
		// We dont go beyond current max level
		let dy = KDRandom() < 0.5 ? -1 : 1;
		if (modeAlternate && NPC.entity.homeCoord) {
			if (currentWorldPosition.mapY < NPC.entity.homeCoord.mapY) dy = 1;
			else if (currentWorldPosition.mapY > NPC.entity.homeCoord.mapY) dy = -1;
		}
		// Wont go up if its a boss level
		if (currentWorldPosition.mapY + dy == KDGameData.HighestLevelCurrent
			&& KinkyDungeonBossFloor(currentWorldPosition.mapY + dy)
		) {
			// Dont move
			dy = 0;
		}

		if (dy < 0) {
			fromType = 1;
		}

		if (dy && currentWorldPosition.mapY + dy > 0 && currentWorldPosition.mapY + dy <= KDGameData.HighestLevelCurrent) {
			targetPosition.mapY = currentWorldPosition.mapY + dy;
		}
	}

	if (!KDCompareLocation(currentWorldPosition, targetPosition)) {
		if (!entity) {
			entity = mapData?.Entities.find((ent) => {
				return ent.id == id;
			});

		}
		// Despawn first

		let halt = false;
		if (entity) {
			if (KDEnemyCanDespawn(id, mapData)){
				KDDespawnEnemy(entity, undefined, mapData);
			} else {
				let exit = KDGetNearestExitTo(targetPosition.room, targetPosition.mapX, targetPosition.mapY,
					entity.x, entity.y, mapData, true
				);
				if (!exit) {exit = KDMapData.EndPosition;}
				if (exit) {
					entity.despawnX = exit.x;
					entity.despawnY = exit.y;
					entity.goToDespawn = true;
				}
				halt = true;
			}
		}
		if (halt) return true;

		// Move the entity
		if (KDMovePersistentNPC(id, targetPosition)) {
			let npc = KDGetPersistentNPC(id);
			npc.fromType = fromType;
			npc.fromIndex = fromIndex;
		}
		return true;
	}

	return false;
}

/** If modeAlternate, tries to wander toward target */
function KDStandardTargetedWander(id: number, mapData: KDMapDataType, entity: entity, modeAlternate: boolean, target: WorldCoord, AITagFunc: () => Record<string, number>): boolean {
	let currentWorldPosition = KDGetNPCLocation(id);
	let targetPosition = KDGetNPCLocation(id);
	let worldSlot = KDGetWorldMapLocation({x: currentWorldPosition.mapX, y: currentWorldPosition.mapY});
	let journeySlot = KDGameData.JourneyMap[
		(worldSlot.jx != undefined ? worldSlot.jx : currentWorldPosition.mapX) + ','
		+ (worldSlot.jy != undefined ? worldSlot.jy : currentWorldPosition.mapY)];

	let fromType = 0;
	let fromIndex = "0";
	let NPC = KDGetPersistentNPC(id);

	if (currentWorldPosition.mapY <= KDGameData.HighestLevelCurrent
		&& journeySlot?.SideRooms.length > 0 && worldSlot?.data && ((!modeAlternate && KDRandom() < 0.5)
		|| (modeAlternate
			// Force go to lair
			&& NPC.entity.homeCoord && (
				currentWorldPosition.mapX == target.mapX
				&& currentWorldPosition.mapY == target.mapY
				&& currentWorldPosition.room != target.room
			)
		))) {
		// 50% chance to go to a side room or go to normal
		if (currentWorldPosition.room == (worldSlot.main || "")) {

			if ( (modeAlternate
				// Force go to lair
				&& target && (
					currentWorldPosition.mapX == target.mapX
					&& currentWorldPosition.mapY == target.mapY
					&& currentWorldPosition.room != target.room
				)
			)) {
				targetPosition = target;
				fromType = 0;
			} else {
				let AITags = AITagFunc();

				let result = KDGetByWeight(KDGetPersistentWanderWeightsForRoom(
					AITags, currentWorldPosition, true
				))

				if (result) {
					targetPosition.room = result;
					fromType = 0;
				} else {
					targetPosition.room = worldSlot.main || "";
					fromType = 2;
					fromIndex = currentWorldPosition.room;

					if (fromIndex == "-1") fromType = 0;
				}
			}

		} else {
			targetPosition.room = worldSlot.main || "";
			fromType = 2;
			fromIndex = currentWorldPosition.room;

			if (fromIndex == "-1") fromType = 0;
		}
	} else if ((modeAlternate && target && (
		currentWorldPosition.mapX != target.mapX
		|| currentWorldPosition.mapY != target.mapY
	)) || (!modeAlternate && currentWorldPosition.room == (worldSlot.main || ""))) {
		// Go up or down
		// We dont go beyond current max level
		let dy = KDRandom() < 0.5 ? -1 : 1;
		if (modeAlternate && target) {
			if (currentWorldPosition.mapY < target.mapY) dy = 1;
			else if (currentWorldPosition.mapY > target.mapY) dy = -1;
		}
		// Wont go up if its a boss level
		if (currentWorldPosition.mapY + dy == KDGameData.HighestLevelCurrent
			&& KinkyDungeonBossFloor(currentWorldPosition.mapY + dy)
		) {
			// Dont move
			dy = 0;
		}

		if (dy < 0) {
			fromType = 1;
		}

		if (dy && currentWorldPosition.mapY + dy > 0 && currentWorldPosition.mapY + dy <= KDGameData.HighestLevelCurrent) {
			targetPosition.mapY = currentWorldPosition.mapY + dy;
		}
	}

	if (!KDCompareLocation(currentWorldPosition, targetPosition)) {
		if (!entity) {
			entity = mapData?.Entities.find((ent) => {
				return ent.id == id;
			});

		}
		// Despawn first

		let halt = false;
		if (entity) {
			if (KDEnemyCanDespawn(id, mapData)){
				KDDespawnEnemy(entity, undefined, mapData);
			} else {
				let exit = KDGetNearestExitTo(targetPosition.room, targetPosition.mapX, targetPosition.mapY,
					entity.x, entity.y, mapData, true
				);
				if (!exit) {exit = KDMapData.EndPosition;}
				if (exit) {
					entity.despawnX = exit.x;
					entity.despawnY = exit.y;
					entity.goToDespawn = true;
				}
				halt = true;
			}
		}
		if (halt) return true;

		// Move the entity
		if (KDMovePersistentNPC(id, targetPosition)) {
			let npc = KDGetPersistentNPC(id);
			npc.fromType = fromType;
			npc.fromIndex = fromIndex;
		}
		return true;
	}

	return false;
}