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
		if (KDGetGlobalEntity(value.id) && KDGetGlobalEntity(value.id).FacilityAction != value.Facility) {
			KDChangeEntityFacilityAction(KDGetGlobalEntity(value.id), value.Facility);
		}

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

	} else if (value.spawned) {
		if (KDGetGlobalEntity(value.id) && KDGetGlobalEntity(value.id).FacilityAction != value.Facility) {
			KDChangeEntityFacilityAction(KDGetGlobalEntity(value.id), value.Facility);
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
	} else if (entity.FacilityAction == undefined) entity.FacilityAction = "Return";
}


function KDSetServantSpawnTemplate(e: entity) {
	if (e) {
		e.allied = 9999;
		e.hostile = 0;
		e.boundLevel = 0;
		KDNPCRefreshBondage(e.id);
		KinkyDungeonSetEnemyFlag(e, "NoFollow", -1);
		e.hp = e.Enemy.maxhp;
	}
}
function KDSetPrisonerSpawnTemplate(e: entity) {
	if (e) {
		e.boundLevel = 0;
		KDNPCRefreshBondage(e.id);
		e.hp = e.Enemy.maxhp;
	}
}