// Pathconditions are conditions for enemies to be able to pass through an npc
// It is added on the npc being pathed

interface PathCondition {
	/** Returns true if the attemptingNPC can path through thisNPC. No side effects. */
	query: (attemptingNPC: entity, thisNPC: entity) => boolean,
	/** Returns true if this can be displaced. TODO implement */
	displaceAttempt?: (power: number, thisNPC: entity) => boolean,
	/** Returns 1 if the attemptingNPC can pass through thisNPC. Has side effects (like destroying the passthrough NPC)
	 * if you want the NPC to wait a turn before it can pass through, you can return false but set thisNPC.hp = 0 to destroy it
		returns -1 if the entity has been removed and you should NOT try to swap
	*/
	doPassthrough: (attemptingNPC: entity, thisNPC: entity, mapdata: KDMapDataType) => number,
	/** Returns true if this can be displaced. TODO implement */
	doDisplace?: (power: number, thisNPC: entity, mapdata: KDMapDataType) => boolean,
}

let KDPathConditions : Record<string, PathCondition> = {
	barrel: {
		query: (attemptingNPC: entity, thisNPC: entity) => {
			// Everyone can pass barrels
			// Even other barrels
			return true;
		},
		doPassthrough: (attemptingNPC: entity, thisNPC: entity, mapdata: KDMapDataType) => {
			// The barrel simply moves out of the way
			return 1;
		},
	},
	barricade: {
		query: (attemptingNPC: entity, thisNPC: entity) => {
			// Everyone can pass barrels
			// Even other barrels
			return true;
		},
		doPassthrough: (attemptingNPC: entity, thisNPC: entity, mapdata: KDMapDataType) => {
			// Removes the barricade for 1 turn
			if (KDRemoveEntity(thisNPC, false, false, true)
				&& !KDEnemyIsTemporary(thisNPC)) {
				KDAddRepopQueue({
					x: thisNPC.x,
					y: thisNPC.y,
					time: 1,
					entity: thisNPC,
				}, mapdata);
			}
			return -1;
		},
	},
	stonedoor: {
		query: (attemptingNPC: entity, thisNPC: entity) => {
			// Only Ranks 3 and above can pass through, or leashers
			return KDEnemyRank(attemptingNPC) >= 3
			|| KinkyDungeonJailGuard()?.id == attemptingNPC.id
			|| KinkyDungeonLeashingEnemy()?.id == attemptingNPC.id;
		},
		doPassthrough: (attemptingNPC: entity, thisNPC: entity, mapdata: KDMapDataType) => {
			// Removes the door but adds it to the map's 'repopulate' queue after 5 turns
			if (KDRemoveEntity(thisNPC, false, false, true)
				&& !KDEnemyIsTemporary(thisNPC)) {
				KDAddRepopQueue({
					x: thisNPC.x,
					y: thisNPC.y,
					time: 5,
					entity: thisNPC,
				}, mapdata);
			}
			return 0;
		},
	},
	blastdoor: {
		query: (attemptingNPC: entity, thisNPC: entity) => {
			// Only Ranks 3 and above can pass through, or robots/cyborgs/dollsmiths/wolfgirls, or leashers
			return (KDEnemyRank(attemptingNPC) >= 3
				|| attemptingNPC.Enemy?.tags.robot
				|| attemptingNPC.Enemy?.tags.trainer
				|| attemptingNPC.Enemy?.tags.cyborg
				|| attemptingNPC.Enemy?.tags.dollsmith)
			|| KinkyDungeonJailGuard()?.id == attemptingNPC.id
			|| KinkyDungeonLeashingEnemy()?.id == attemptingNPC.id;
		},
		doPassthrough: (attemptingNPC: entity, thisNPC: entity, mapdata: KDMapDataType) => {
			// Removes the door but adds it to the map's 'repopulate' queue after 5 turns
			if (KDRemoveEntity(thisNPC, false, false, true)
				&& !KDEnemyIsTemporary(thisNPC)) {
				KDAddRepopQueue({
					x: thisNPC.x,
					y: thisNPC.y,
					time: 5,
					entity: thisNPC,
				}, mapdata);
			}
			return 0;
		},
	},
};