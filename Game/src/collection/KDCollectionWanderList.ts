

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
				let point = KDMapData.Labels?.ServantEntrance ? KDMapData.Labels.ServantEntrance[0] : null;
				if (!point) {
					delete entity.FacilityAction;
					return;
				}
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
	LoungeReturn: {
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
				let point = KDMapData.Labels?.LoungeEntrance ? KDMapData.Labels.LoungeEntrance[0] : null;

				if (!point) {
					delete entity.FacilityAction;
					return;
				}
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
		onChangeFacility: (value, entity, fromFacility, toFacility) => {return "LoungeReturn";},
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
					if (e) {
						KDSetServantSpawnTemplate(e);
						e.FacilityAction = "Management";
					}
				}
			} else {
				let point = KDMapData.Labels?.ServantEntrance ? KDMapData.Labels.ServantEntrance[0] : {x: 1, y: 3};
				let e = DialogueCreateEnemy(point.x, point.y, value.type, value.id, true);
				if (e) {
					KDSetServantSpawnTemplate(e);
					e.FacilityAction = "Management";
				}
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
	Warden: {
		spawnRoom: "Summit",
		spawnCondition: (value) => {
			// if they are already spawned they appear in a random place
			let entity = KinkyDungeonFindID(value.id);
			if (value.spawned && !entity) {
				let point = KinkyDungeonGetRandomEnemyPoint(true, false, undefined);
				if (point) {
					let e = DialogueCreateEnemy(point.x, point.y, value.type, value.id, true);
					if (e) {
						KDSetServantSpawnTemplate(e);
						e.FacilityAction = "Warden";
					}
				}
			} else {
				let point = KDMapData.Labels?.ServantEntrance ? KDMapData.Labels.ServantEntrance[0] : {x: 1, y: 3};
				let e = DialogueCreateEnemy(point.x, point.y, value.type, value.id, true);
				if (e) {
					KDSetServantSpawnTemplate(e);
					e.FacilityAction = "Warden";
				}
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
		onChangeFacility: (value, entity, fromFacility, toFacility) => {return toFacility == "Warden" ? toFacility : "Return";},
	},


	CuddleLounge: {
		spawnRoom: "Summit",
		spawnCondition: (value) => {

			if (value.status) {
				// if they are already spawned they appear in a random place
				let entity = KinkyDungeonFindID(value.id);
				if (value.spawned && !entity) {
					let point = KinkyDungeonGetRandomEnemyPoint(true, false, undefined,);
					if (point) {
						let e = DialogueCreateEnemy(point.x, point.y, value.type, value.id, true);
						if (e) {
							KDSetServantSpawnTemplate(e);
							e.FacilityAction = "CuddleLounge";
						}
					}
				} else {
					let point = KDMapData.Labels?.LoungeEntrance ? KDMapData.Labels.LoungeEntrance[0] : {x: 1, y: 3};
					let e = DialogueCreateEnemy(point.x, point.y, value.type, value.id, true);
					if (e) {
						KDSetServantSpawnTemplate(e);
						e.FacilityAction = "CuddleLounge";
					}

				}
			}

			return null;
		},
		// Set to spawned, dont need to do anything special
		spawnConditionRemote: (value) => {
			if (value.status)
				value.spawned = true;
			return null;
		},

		// Maintenance condition
		maintain: (value, entity, delta) => {
			let point = KDMapData.Labels?.Lounge ? KDMapData.Labels.Lounge[0] : null;
			if (point) {
				entity.AI = "looseguard";
				entity.gxx = point.x;
				entity.gyy = point.y;
			}
			if (point && !KDIDHasFlag(entity.id, "loungeInteract")) {
				KDSetIDFlag(entity.id, "loungeInteract", 14);
				let eligibleIDs = [];
				let presentIDs = [];
				let removeIDs = [];
				if (KDGameData.FacilitiesData["Prisoners_CuddleLounge"]) {
					eligibleIDs = KDGameData.FacilitiesData["Prisoners_CuddleLounge"].filter((id) => {
						return !KinkyDungeonFindID(id)
							&& (!KDIsNPCPersistent(id)
								|| (KDGetPersistentNPC(id)?.room == "Summit" || !KDGetPersistentNPC(id)?.room))
					});
					presentIDs = KDGameData.FacilitiesData["Prisoners_CuddleLounge"].filter((id) => {
						return KinkyDungeonFindID(id);
					});
					for (let e of KDMapData.Entities) {
						if (KDIsImprisoned(e)
							&& !eligibleIDs.includes(e.id)
							&& !presentIDs.includes(e.id)) {
								if (!KDIDHasFlag(e.id, "cuddleTime")
									&& KDistChebyshev(point.x - e.x, point.y - e.y) > 4.5) {
										presentIDs.push(e.id);
										removeIDs.push(e.id);
								}
							}
						else if (KDIsImprisoned(e)
							&& presentIDs.includes(e.id)) {
								if (!KDIDHasFlag(e.id, "cuddleTime")
									&& KDistChebyshev(point.x - e.x, point.y - e.y) > 4.5) {
										removeIDs.push(e.id);
								}
						}
					}
				}

				if ((presentIDs.length > 0 || removeIDs.length > 0) && (KDRandom() < 0.33 || eligibleIDs.length == 0)) {
					// Play with prisoner
					let prisonerID = removeIDs.length > 0 ?
						removeIDs[0]
						: presentIDs[Math.floor(KDRandom() * presentIDs.length)];
					let prisoner = KinkyDungeonFindID(prisonerID);
					if (prisoner) {
						KDSetIDFlag(entity.id, "overrideMove", 18);
						if (KDistChebyshev(entity.x - prisoner.x, entity.y - prisoner.y) < 1.5) {
							// Despawn if not prisoner
							if (!KDGameData.FacilitiesData["Prisoners_CuddleLounge"].includes(prisoner.id)
								|| prisonerID == removeIDs[0]) {
								if (!KDIDHasFlag(prisoner.id, "cuddleTime")) {
									// Despawn
									KDFreeNPC(prisoner);
									KDRemoveEntity(prisoner, false, false, true);
									if (KDGameData.Collection[prisoner.id + ""]) {
										KDGameData.Collection[prisoner.id + ""].spawned = false;
									}
								}
							} else {
								KDSetIDFlag(entity.id, "loungeInteract", 50);
								KDSetIDFlag(entity.id, "wander", 17);
							}
							entity.gx = entity.x;
							entity.gy = entity.y;
						} else {
							let pp = KinkyDungeonGetNearbyPoint(prisoner.x, prisoner.y, true, undefined, true);
							if (!pp) pp = KinkyDungeonGetNearbyPoint(prisoner.x, prisoner.y, true, undefined, undefined);
							if (!pp) pp = KinkyDungeonGetNearbyPoint(entity.x, entity.y, true, undefined, undefined);

							if (pp) {
								entity.gx = pp.x;
								entity.gy = pp.y;
							}
						}
					}
				} else if (eligibleIDs.length > 0 && KDRandom() < 0.5) {
					let furn = KinkyDungeonNearestJailPoint(
						entity.x - 3 + Math.floor(KDRandom()*3),
						entity.y - 3 + Math.floor(KDRandom()*3),
						["furniture"],
						undefined, undefined, true,
						(x, y, pp) => {
							return KDistChebyshev(x - point.x, y - point.y) <= 4.5;
						}
					);

					if (furn) {
						KDSetIDFlag(entity.id, "overrideMove", 18);
						if (KDistChebyshev(entity.x - furn.x, entity.y - furn.y) < 1.5) {
							// Spawn a prisoner
							let vid = eligibleIDs[Math.floor(KDRandom() * eligibleIDs.length)];
							let vv = KDGameData.Collection[vid + ""];
							if (vv) {
								let en = DialogueCreateEnemy(furn.x, furn.y, vv.type, vv.id, true);
								KDSetPrisonerSpawnTemplate(en);

								let tile = KinkyDungeonTilesGet(furn.x + ',' + furn.y);
								let ff = tile ? KDFurniture[tile.Furniture] : undefined;
								let rest = ff ? KinkyDungeonGetRestraint(
									{tags: [ff.restraintTag]}, MiniGameKinkyDungeonLevel,
									(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
									true,
									"",
									true,
									false,
									false, undefined, true) : undefined;
								KDImprisonEnemy(en, true, "PrisonerJailOwn", rest ? {
									name: rest.name,
									lock: "White",
									id: KinkyDungeonGetItemID(),
									faction: KDDefaultNPCBindPalette,
								} : undefined);

								KDSetIDFlag(en.id, "cuddleTime", 80);
							}

							entity.gx = entity.x;
							entity.gy = entity.y;
						} else {
							let pp = KinkyDungeonGetNearbyPoint(furn.x, furn.y, true, undefined, true);
							if (pp) {
								entity.gx = pp.x;
								entity.gy = pp.y;
							}
						}
					}

				}

			}
		},

		// If its not the same it is changed
		onChangeFacility: (value, entity, fromFacility, toFacility) => {return toFacility == "CuddleLounge" ? toFacility : "LoungeReturn";},
	},
};
