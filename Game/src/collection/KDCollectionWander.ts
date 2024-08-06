interface CollectionWanderType {
	spawnRoom: string,
	/** returns the NPC if it spawned an NPC
	 * Note that it should respect value.spawned
	 * If spawned is true that means the NPC was spawned while the player was outside of summit
	 * This means that the spawnCondition should spawn the NPC in a position that makes sense
	*/
	spawnCondition?: (value: KDCollectionEntry, entity: entity) => entity;
	/** runs only while the NPC in the spawnroom but */
	spawnConditionRemote?: (value: KDCollectionEntry) => entity;
	/** Run each tick*/
	maintain: (value: KDCollectionEntry, entity: entity, delta: number) => void;
	/** Changes the facility of the NPC, returns the facility being moved to (default Return) */
	onChangeFacility: (value: KDCollectionEntry, entity: entity, fromFacility: string, toFacility: string) => string;
}

function KDTickCollectionWanderCollectionEntry(value: KDCollectionEntry) {
	if (value?.Facility && KDCollectionWanderTypes[value.Facility]) {
		if (KDGameData.RoomType == KDCollectionWanderTypes[value.Facility].spawnRoom
			&& KDGameData.RoomType == KDCollectionWanderTypes[value.Facility].spawnRoom
		) {
			let spawnFunction = KDCollectionWanderTypes[value.Facility].spawnCondition;
			if (spawnFunction) {
				let entity = KinkyDungeonFindID(value.id);
				if (!entity) {
					if (spawnFunction(value, entity))
						value.spawned = true;
					else value.spawned = false;
				} else if (entity.FacilityAction) value.spawned = true;
				else value.spawned = false;
			}
		} else if (KDIsNPCPersistent(value.id)
			&& (KDGetPersistentNPC(value.id)?.room == KDCollectionWanderTypes[value.Facility].spawnRoom)
			&& KDGameData.RoomType != KDCollectionWanderTypes[value.Facility].spawnRoom) {
			// Run the remote spawn function if the NPC is not in the spawnroom
			let spawnFunction = KDCollectionWanderTypes[value.Facility].spawnConditionRemote;
			if (spawnFunction) {
				if (spawnFunction(value))
					value.spawned = true;
				else value.spawned = false;
			}
		}

	}
}

function KDTickCollectionWanderEntity(entity: entity, delta: number) {
	let value = KDGameData.Collection[entity.id + ""];
	if (!value) return;
	if (entity.FacilityAction && KDCollectionWanderTypes[entity.FacilityAction]?.maintain) {
		KDCollectionWanderTypes[entity.FacilityAction]
			.maintain(value, entity, delta);
	}
}

function KDChangeEntityFacilityAction(entity: entity, action: string) {
	let value = KDGameData.Collection[entity.id + ""];
	if (!value) return;
	if (entity.FacilityAction && KDCollectionWanderTypes[entity.FacilityAction]?.onChangeFacility) {
		entity.FacilityAction = KDCollectionWanderTypes[entity.FacilityAction]
			.onChangeFacility(value, entity, entity.FacilityAction, action);
	}
}


let KDCollectionWanderTypes: Record<string, CollectionWanderType> = {
	Return: {
		spawnRoom: "Summit",
		// Dummy spawn condition, should NEVER spawn NPCs because the faciltiy does not exist
		spawnCondition: (value) => {
			// if they are already spawned they instantly despawn
			if (value.spawned) {
				let entity = KinkyDungeonFindID(value.id);
				if (entity) KDRemoveEntity(entity, false, false, true);
			}
			return null;
		},
		// Dummy spawn condition, should NEVER spawn NPCs because the faciltiy does not exist
		// Instead we just set them to spawned so they are instantly removed
		spawnConditionRemote: (value) => {
			value.spawned = true;
			return null;
		},

		// Maintenance condition
		maintain: (value, entity, delta) => {
			if (entity) {
				// Go to the dorm and despawn
				let point = {x: 1, y: 3}; // TODO make generic
				if (KDistChebyshev(entity.x - point.x, entity.y - point.y) < 0.5)
					KDRemoveEntity(entity, false, false, true);
				else {
					entity.gx = point.x;
					entity.gy = point.y;
					KinkyDungeonSetEnemyFlag(entity, "overrideMove", 12);
					if (entity.IntentAction)
						KDResetIntent(entity, undefined);
				}
			}
		},

		// Returning NPCs finish returning so they can respawn
		onChangeFacility: (value, entity, fromFacility, toFacility) => {return "Return";},
	},
};
