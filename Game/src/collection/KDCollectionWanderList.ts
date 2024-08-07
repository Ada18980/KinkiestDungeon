
let spawnPointServant = {x: 1, y: 3};

let KDCollectionWanderTypes: Record<string, CollectionWanderType> = {
	Return: {
		spawnRoom: "Summit",
		// Dummy spawn condition, should NEVER spawn NPCs because the faciltiy does not exist
		spawnCondition: (value) => {
			// if they are already spawned they instantly despawn
			if (value.spawned) {
				let entity = KinkyDungeonFindID(value.id);
				if (entity) {
					KDRemoveEntity(entity, false, false, true);
					value.spawned = false;
					delete entity.FacilityAction;
				}
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
				if (KDistChebyshev(entity.x - point.x, entity.y - point.y) < 0.5) {
					KDRemoveEntity(entity, false, false, true);
					value.spawned = false;
					delete entity.FacilityAction;
				} else {
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
	Management: {
		spawnRoom: "Summit",
		spawnCondition: (value) => {
			// if they are already spawned they appear in a random place
			let entity = KinkyDungeonFindID(value.id);
			if (value.spawned && !entity) {
				let point = KinkyDungeonGetRandomEnemyPoint(true, false, undefined);
				if (point) {
					let e = DialogueCreateEnemy(point.x, point.y, value.type, value.id, true);
					e.allied = 9999;
					KinkyDungeonSetEnemyFlag(e, "NoFollow", -1);
					e.hp = e.Enemy.maxhp;
					e.FacilityAction = "Management";
				}
			} else {
				let point = spawnPointServant; // TODO make generic
				let e = DialogueCreateEnemy(point.x, point.y, value.type, value.id, true);
				e.allied = 9999;
				KinkyDungeonSetEnemyFlag(e, "NoFollow", -1);
				e.hp = e.Enemy.maxhp;
				e.FacilityAction = "Management";
			}
			return null;
		},
		// Set to spawned, dont need to do anything special
		spawnConditionRemote: (value) => {
			value.spawned = true;
			return null;
		},

		// Maintenance condition
		maintain: (value, entity, delta) => {
			// They just kinda chill man
		},

		// If its not the same it is changed
		onChangeFacility: (value, entity, fromFacility, toFacility) => {return toFacility == "Management" ? toFacility : "Return";},
	},
};
