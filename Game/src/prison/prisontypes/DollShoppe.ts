KDPrisonTypes.DollShoppe = {
	name: "DollShoppe",
	default_state: "Jail",
	starting_state: "Intro",
	update: (delta) => {
		if (KDGameData.PrisonerState != 'parole') {
			KinkyDungeonSetFlag("noPlay", 12);
		}

		// Assign guards to deal with idle dolls
		let idleDoll: entity[] = [];
		let punishDoll: entity[] = [];
		let idleGuard: entity[] = [];
		for (let en of KDMapData.Entities) {
			if ((en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner) && !KDEnemyHasFlag(en, "conveyed_rec")) {
				if ((KDEnemyHasFlag(en, "punishdoll") || KDRandom() < 0.15) && !KDEnemyHasFlag(en, "punished")) {
					punishDoll.push(en);
					KinkyDungeonSetEnemyFlag(en, "punishdoll", 300);
				} else
					idleDoll.push(en);
			} else if (en.faction == "Enemy" && en.Enemy?.tags.jailer && en != KinkyDungeonJailGuard() && en != KinkyDungeonLeashingEnemy() && (en.idle || KDEnemyHasFlag(en, "idleg"))) {
				idleGuard.push(en);
				KinkyDungeonSetEnemyFlag(en, "idleg", 2);
			}
		}
		// For each idle doll, pick a guard to pull
		for (let doll of idleDoll) {
			let gg: entity = null;
			let dist = 11;
			for (let guard of idleGuard) {
				if (!KDEnemyHasFlag(guard, "idlegselect") && KDistChebyshev(guard.x - doll.x, guard.y - doll.y) < dist) {
					gg = guard;
					dist = KDistChebyshev(guard.x - doll.x, guard.y - doll.y);
				}
			}
			if (gg) {
				if (dist < 1.5) {
					// Set the doll as a punishment doll or delete it if there are too many
					if (punishDoll.length < 20 && !KDEnemyHasFlag(doll, "punished")) {
						KinkyDungeonSetEnemyFlag(doll, "punishdoll", 300);
						KinkyDungeonSetEnemyFlag(doll, "punished", 9999);
						KinkyDungeonSetEnemyFlag(doll, "tryNotToSwap", 9999);
						punishDoll.push(doll);
					} else {
						doll.hp = 0;
					}
				} else {
					KinkyDungeonSetEnemyFlag(gg, "idlegselect", 2);
					KinkyDungeonSetEnemyFlag(gg, "overrideMove", 10);
					gg.gx = doll.x;
					gg.gy = doll.y;
				}
			}
		}

		// For each punishment doll, pick a guard to pull
		for (let doll of punishDoll) {
			let gg: entity = null;
			let storage = KinkyDungeonNearestJailPoint(doll.x, doll.y, ["storage"], undefined, undefined);
			if (doll.x == storage?.x && doll.y == storage?.y) continue;
			let dist = 11;
			let canLeash = (guard: entity, dd: number) => {
				return guard?.Enemy && !KDEnemyHasFlag(guard, "idlegselect") && KDistChebyshev(guard.x - doll.x, guard.y - doll.y) < dd;
			}
			if (doll.leash?.entity && KDLookupID(doll.leash.entity)?.Enemy && idleGuard.some((entity) => {return entity.id == doll.leash.entity;})) {
				gg = KDLookupID(doll.leash.entity);
				dist = KDistChebyshev(gg.x - doll.x, gg.y - doll.y);
			} else {
				if (doll.leash?.reason == "DollLeash") {
					KDBreakTether(doll);
				}
				for (let guard of idleGuard) {
					if (canLeash(guard, dist)) {
						gg = guard;
						dist = KDistChebyshev(guard.x - doll.x, guard.y - doll.y);
					}
				}
			}

			if (gg) {
				if (dist < 2.5 || doll.leash?.entity == gg.id) {
					// Move the doll toward the nearest storage
					let storage = KinkyDungeonNearestJailPoint(gg.x, gg.y, ["storage"], undefined, undefined, true);
					if (storage) {
						if (dist < 1.5 && KDistChebyshev(gg.x - storage.x, gg.y - storage.y) < 1.5) {
							KDMoveEntity(doll, storage.x, storage.y, false, false, false, false);
							KDTieUpEnemy(doll, 100, "Latex", undefined, false, 0);
						} else {
							KinkyDungeonSetEnemyFlag(gg, "idlegselect", 2);
							KinkyDungeonSetEnemyFlag(gg, "overrideMove", 10);
							KinkyDungeonSetEnemyFlag(gg, "leashPrisoner", 3);
							KinkyDungeonAttachTetherToEntity(1.5, gg, doll, "DollLeash", KDBaseCyan, 6);
							gg.gx = storage.x;
							gg.gy = storage.y;
							if (dist > 1.5) {
								let path = KinkyDungeonFindPath(doll.x, doll.y, gg.x, gg.y, true, true, false, KinkyDungeonMovableTilesEnemy,
									false, false, false
								);
								if (path && path.length > 0) {
									//KDMoveEntity(doll, path[0].x, path[0].y, false, false, false, false);
									KDStaggerEnemy(doll);
								}
							}
						}
					}
				} else {
					KinkyDungeonSetEnemyFlag(gg, "idlegselect", 2);
					KinkyDungeonSetEnemyFlag(gg, "overrideMove", 10);
					gg.gx = doll.x;
					gg.gy = doll.y;
				}
			}
		}

		// If there are any guards still idle we move them to exit to despawn
		let idleGuards: entity[] = [];
		let guardCount = 0;
		for (let en of KDMapData.Entities) {
			if (en.faction == "Enemy" && !(en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner) ) {
				if (en != KinkyDungeonJailGuard() && en != KinkyDungeonLeashingEnemy() && (en.idle && !KDEnemyHasFlag(en, "idlegselect")))
					idleGuards.push(en);
				if (en.Enemy.tags.jailer) guardCount += 1;
			}
		}
		if (guardCount > 8) {
			for (let en of idleGuards) {
				KinkyDungeonSetEnemyFlag(en, "despawn", 300);
				KinkyDungeonSetEnemyFlag(en, "wander", 300);
				en.gx = KDMapData.EndPosition.x;
				en.gy = KDMapData.EndPosition.y;
			}
		} else if (!KinkyDungeonFlags.get("guardspawn")) {
			// TODO replace with map flags
			// spawn a new one
			KinkyDungeonSetFlag("guardspawn", 10);


			if (KDMapData.Labels && KDMapData.Labels.Deploy?.length > 0) {
				let l = KDMapData.Labels.Deploy[Math.floor(KDRandom() * KDMapData.Labels.Deploy.length)];
				let tag = "dressmaker";
				let Enemy = KinkyDungeonGetEnemy([tag, "dressmaker"], MiniGameKinkyDungeonLevel + 4, 'lib', '0', [tag], undefined, {[tag]: {mult: 4, bonus: 10}}, ["boss"]);
				if (Enemy && !KinkyDungeonEnemyAt(KDMapData.EndPosition.x, KDMapData.EndPosition.y)
					&& KDistChebyshev(KDPlayer().x - KDMapData.EndPosition.x, KDPlayer().y - KDMapData.EndPosition.y)
					> 7) {
					let en = DialogueCreateEnemy(KDMapData.EndPosition.x, KDMapData.EndPosition.y, Enemy.name);
					//KDProcessCustomPatron(Enemy, en, 0.5, false);
					en.AI = "looseguard";
					en.faction = "Enemy";
					en.keys = true;
					en.gxx = l.x;
					en.gyy = l.y;
					en.gx = l.x;
					en.gy = l.y;
					KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
					KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
				}
			}
		}
	},
	states: {
		Intro: {name: "Intro",
			init: (params) => {
				if (KDGameData.PrisonerState == "parole")
					KDGameData.PrisonerState = "jail";
				if (KDMapData.Labels && KDMapData.Labels.Deploy) {
					for (let l of KDMapData.Labels.Deploy) {
						let tag = "dressmaker";
						let Enemy = KinkyDungeonGetEnemy([tag, "dressmaker"], MiniGameKinkyDungeonLevel + 4, 'bel', '0', [tag], undefined, {[tag]: {mult: 4, bonus: 10}}, ["boss"]);
						if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)) {
							let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
							//KDProcessCustomPatron(Enemy, en, 0.5, false);
							en.AI = "looseguard";
							en.faction = "Enemy";
							en.keys = true;
							KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
							KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
						}

					}
				}
				if (KDMapData.Labels && KDMapData.Labels.Patrol) {
					for (let l of KDMapData.Labels.Patrol) {
						let tag = "dressmaker";
						let Enemy = KinkyDungeonGetEnemy([tag], MiniGameKinkyDungeonLevel + 4, 'bel', '0', [tag], undefined, {[tag]: {mult: 4, bonus: 10}}, ["boss", "miniboss", "elite"]);
						if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)) {
							let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
							//KDProcessCustomPatron(Enemy, en, 0.1, false);
							en.AI = "hunt";
							en.faction = "Enemy";
							en.keys = true;
							KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
							KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
						}

					}
				}
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				KDPrisonCommonGuard(player);
				return "Jail";
			},
		},
		Jail: {name: "Jail",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				KDPrisonCommonGuard(player);


				let lostTrack = KDLostJailTrack(player);
				if (lostTrack == "Unaware") {
					return KDSetPrisonState(player, "Jail");
				}

				if (KDPrisonTick(player)) {

					let uniformCheck = KDPrisonGetGroups(player, ["dressmaker"], "Purple", KDJAILPOWER);
					if ((uniformCheck.groupsToStrip.length > 0 && !KinkyDungeonFlags.get("failStrip")) || uniformCheck.itemsToApply.length > 0) {
						return "Uniform";
					}

					if (!KinkyDungeonFlags.get("transformCD") && !KinkyDungeonStatsChoice.get("NoDollTransform") && !KinkyDungeonFlags.get("Transformed")
						&& (KinkyDungeonFlags.get("annoy_puppet") || KDEntityBuffedStat(player, "Hypno_Doll") > 25)) {
						return "Transform";
					}
					
					if (!KinkyDungeonFlags.get("displayCD")) {
						KinkyDungeonFlags.set("PrisonStorageTimer", 0);
						return "Display";
					}
					
					return "Storage";
				}
				return "Jail";
			},
			updateStack: (delta) => {
				KinkyDungeonSetFlag("noPlay", 10);

			},
		},
		FurnitureTravel: {name: "FurnitureTravel",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;


				let lostTrack = KDLostJailTrack(player);
				if (lostTrack == "Unaware") {
					return KDSetPrisonState(player, "Jail");
				}

				// End when the player is settled
				if (KDPrisonIsInFurniture(player)) {
					return KDPopSubstate(player);
				}
				// We are not in a furniture, so we conscript the guard
				let guard = KDPrisonCommonGuard(player);
				if (guard) {
					// Assign the guard to a furniture intentaction
					let action = (KDGameData.PrisonerState == 'jail' && !KinkyDungeonAggressive(guard, player)) ? "leashFurniture" : "leashFurnitureAggressive";
					if (guard.IntentAction != action)
						KDIntentEvents[action].trigger(guard, {});
					if (lostTrack) {
						// Any qualifying factors means they know where you should be
						guard.gx = player.x;
						guard.gy = player.y;
						KinkyDungeonSetEnemyFlag(guard, "wander", 30)
						KinkyDungeonSetEnemyFlag(guard, "overrideMove", 10);
					}
					if (KDGameData.PrisonerState == 'jail') {
						KinkyDungeonSetEnemyFlag(guard, "notouchie", 2);
					}
				} else {
					// forbidden state
					return KDPopSubstate(player);
				}

				// Stay in the current state
				return KDCurrentPrisonState(player);
			},
		},
		Uniform: {name: "Uniform",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				let guard = KDPrisonCommonGuard(player);

				if (KDPrisonIsInFurniture(player)) {
					let action = "Follow";
					if (guard.IntentAction != action)
						KDIntentEvents[action].trigger(guard, {});
					else guard.playWithPlayer = Math.max(guard.playWithPlayer, 3);
					let uniformCheck = KDPrisonGetGroups(player, ["dressmaker"], "Purple", KDJAILPOWER);
					if (uniformCheck.groupsToStrip.length > 0 && !KinkyDungeonFlags.get("failStrip")) {
						// Create a queue
						KDGoToSubState(player, "UniformApply");
						return KDGoToSubState(player, "UniformRemoveExtra");
					} else if (uniformCheck.itemsToApply.length > 0) {
						return KDGoToSubState(player, "UniformApply");
					}

					// If we are in uniform we go to the Storage state
					return KDPopSubstate(player);
				}
				// Otherwise go to travel state
				return KDGoToSubState(player, "FurnitureTravel");
			},
		},
		UniformRemoveExtra: {name: "UniformRemoveExtra",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				let guard = KDPrisonCommonGuard(player);

				if (guard && KDPrisonIsInFurniture(player)) {
					let action = "Follow";
					if (guard.IntentAction != action)
						KDIntentEvents[action].trigger(guard, {});
					else guard.playWithPlayer = Math.max(guard.playWithPlayer, 3);
					KinkyDungeonSetEnemyFlag(guard, "overrideMove", 2);
					if (KDistChebyshev(guard.x - player.x, guard.y - player.y) < 1.5) {
						if (KDPrisonIsInFurniture(player)) {
							// Remove one per turn
							let lockType = "Purple";
							return KDDoUniformRemove(player, guard, ["dressmaker"], lockType, KDJAILPOWER);


						}
					} else {
						// Stay in the current state
						return KDCurrentPrisonState(player);
					}
				}

				// Otherwise go to travel state
				return KDGoToSubState(player, "FurnitureTravel");
			},
		},
		UniformApply: {name: "UniformApply",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				let guard = KDPrisonCommonGuard(player);

				if (KDPrisonIsInFurniture(player)) {
					if (guard) {
						let action = "Follow";
						if (guard.IntentAction != action)
							KDIntentEvents[action].trigger(guard, {});
						else guard.playWithPlayer = Math.max(guard.playWithPlayer, 3);
						KinkyDungeonSetEnemyFlag(guard, "overrideMove", 2);
						if (KDistChebyshev(guard.x - player.x, guard.y - player.y) < 1.5) {

							let lockType = "Purple";
							return KDDoUniformApply(player, guard, ["dressmaker"], lockType, KDJAILPOWER);
						}
					} else {
						// Stay in the current state
						return KDCurrentPrisonState(player);
					}
				}
				// Otherwise go to travel state
				return KDGoToSubState(player, "FurnitureTravel");
			},
		},
		Storage: {name: "Storage",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				KDPrisonCommonGuard(player);
				let jailPoint = KinkyDungeonNearestJailPoint(player.x, player.y, ["storage"]);
				
				if (!jailPoint || jailPoint.x != player.x || jailPoint.y != player.y) {
					// Move the player to the storage
					return KDGoToSubState(player, "StorageTravel");
				}

				if (KDPrisonIsInFurniture(player)) {
					let uniformCheck = KDPrisonGetGroups(player, ["dressmaker"], "Purple", KDJAILPOWER);
					if (uniformCheck.itemsToApply.length > 0) {
						return KDGoToSubState(player, "Uniform");
					}

					// Stay in the current state, but increment the storage timer, return to jail state if too much
					KinkyDungeonFlags.set("PrisonStorageTimer", (KinkyDungeonFlags.get("PrisonStorageTimer") || 0) + delta * 2);
					if (KinkyDungeonFlags.get("PrisonStorageTimer") > 300) {
						// Return to jail for figuring out what to do
						return KDSetPrisonState(player, "Jail");
					}
					return KDCurrentPrisonState(player);
				}
				// Go to jail state for further processing
				return KDSetPrisonState(player, "Jail");
			},
		},

		
		StorageTravel: {name: "StorageTravel",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;

				let lostTrack = KDLostJailTrack(player);
				if (lostTrack == "Unaware") {
					return KDSetPrisonState(player, "Jail");
				}

				let jailPointTarget = KDRandomJailPoint(player.x, player.y, ["storage"], undefined, undefined);
				let jailPointNearest = KinkyDungeonNearestJailPoint(player.x, player.y, ["storage"], undefined, undefined);
				if (!(jailPointTarget && jailPointTarget.x == player.x && jailPointTarget.y == player.y)
					&& !(jailPointNearest && jailPointNearest.x == player.x && jailPointNearest.y == player.y))
				{
					// We are not in a furniture, so we conscript the guard
					let guard = KDPrisonCommonGuard(player);
					if (guard) {
						// Assign the guard to a furniture intentaction
						let action = "leashStorage";
						if (guard.IntentAction != action) {
							KDIntentEvents[action].trigger(guard, {});
						}

						if (lostTrack) {
							// Any qualifying factors means they know where you should be
							guard.gx = player.x;
							guard.gy = player.y;
							KinkyDungeonSetEnemyFlag(guard, "wander", 30)
							KinkyDungeonSetEnemyFlag(guard, "overrideMove", 10);
						}

						if (KinkyDungeonLeashingEnemy() == guard) {
							// Make the guard focus on leashing more strongly, not attacking or pickpocketing
							KinkyDungeonSetEnemyFlag(guard, "focusLeash", 2);
						}
						KinkyDungeonSetEnemyFlag(guard, "notouchie", 2);
					} else {
						// forbidden state
						return KDPopSubstate(player);
					}

					// Stay in the current state for travel
					return KDCurrentPrisonState(player);
				}

				// End when the player is settled
				if (KDPrisonIsInFurniture(player)) {
					return KDPopSubstate(player);
				}

				// Stay in the current state
				return KDCurrentPrisonState(player);
			},
		},

		Display: {name: "Display",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;

				let label = KDMapData.Labels?.Display ? KDGetUnoccupiedLabel(KDMapData.Labels.Display, player, true, true) : null;
				let rad = 3;
				if (label && (KDistEuclidean(label.x - player.x, label.y - player.y) > rad)) {
					KDSelectLabel(player, label);
					KinkyDungeonSetFlag("displayCD", 900);
					return KDGoToSubState(player, "DisplayTravel");
				}

				if (KinkyDungeonFlags.get("displayStart")) {
					// Stay in the current state
					return KDCurrentPrisonState(player);
				}

				// Go to jail state for further processing
				return KDSetPrisonState(player, "Jail");
			},
			updateStack: (delta) => {
			},
		},

		
		DisplayTravel: {name: "DisplayTravel",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;

				let label = KDMapData.Labels?.Display ? KDGetUnoccupiedLabel(KDMapData.Labels.Display, player, true, true) : null;
				let rad = 3;

				let lostTrack = KDLostJailTrack(player);
				if (lostTrack == "Unaware") {
					return KDSetPrisonState(player, "Jail");
				}

				if (label && (KDistEuclidean(label.x - player.x, label.y - player.y) > rad) && KDPlayerLeashable(player)) {
					KDSelectLabel(player, label);
					// We are not in a furniture, so we conscript the guard
					let guard = KDPrisonCommonGuard(player);
					if (guard) {
						// Assign the guard to a furniture intentaction
						let action = "leashToPoint_Furn";
						if (guard.IntentAction != action) {
							guard.gx = player.x;
							guard.gy = player.y;
							KDIntentEvents[action].trigger(guard, {point: label, radius: 1, target: player});
						}

						if (lostTrack) {
							// Any qualifying factors means they know where you should be
							guard.gx = player.x;
							guard.gy = player.y;
							KinkyDungeonSetEnemyFlag(guard, "wander", 30)
							KinkyDungeonSetEnemyFlag(guard, "overrideMove", 10);
						}
						if (KinkyDungeonLeashingEnemy() == guard) {
							// Make the guard focus on leashing more strongly, not attacking or pickpocketing
							KinkyDungeonSetEnemyFlag(guard, "focusLeash", 2);
						}
						KinkyDungeonSetEnemyFlag(guard, "notouchie", 2);
					} else {
						// forbidden state
						return KDPopSubstate(player);
					}

					// Stay in the current state for travel
					return KDCurrentPrisonState(player);
				}

				// End
				KinkyDungeonSetFlag("displayStart", 300);
				return KDPopSubstate(player);
			},
		},
		

		Transform: {name: "Transform",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;

				let label = KDMapData.Labels?.Stand ? KDGetUnoccupiedLabel(KDMapData.Labels.Stand, player, true, true) : null;
				let rad = 3;
				if (label && (KDistEuclidean(label.x - player.x, label.y - player.y) > rad)) {
					KDSelectLabel(player, label);
					return KDGoToSubState(player, "TransformTravel");
				}

				if (!KinkyDungeonFlags.get("transformCD")) {
					KinkyDungeonSetFlag("transformCD", 3000);
					KinkyDungeonSetFlag("transformAwait", 15);
					

					return KDGoToSubState(player, "TransformAwait");
				}

				// Go to jail state for further processing
				return KDSetPrisonState(player, "Jail");
			},
			updateStack: (delta) => {
			},
			finally: (delta, currentState, stackPop) => {
				// Remove all training doors
				let labels = KDMapData.Labels?.TrainingDoor;
				if (labels?.length > 0) {
					for (let td of labels) {
						if ("dD".includes(KinkyDungeonMapGet(td.x, td.y))) {
							KinkyDungeonMapSet(td.x, td.y, '2');
							let door = KinkyDungeonTilesGet(td.x + ',' + td.y);
							if (door) {
								delete door.Type;
								delete door.Lock;
								delete door.ReLock;
							}
						}
					}
				}
			},
		},

		
		TransformAwait: {name: "TransformAwait",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				if (!KDPrisonPuppetmasterGuard(player)) {

					
					let en = DialogueCreateEnemy(KDMapData.EndPosition.x, KDMapData.EndPosition.y, "Puppetmaster");
					//KDProcessCustomPatron(Enemy, en, 0.5, false);
					en.AI = "looseguard";
					en.faction = "Dressmaker";
					en.keys = true;
					en.gxx = KDPlayer().x;
					en.gyy = KDPlayer().y;
					en.gx = KDPlayer().x;
					en.gy = KDPlayer().y;

					KDPrisonPuppetmasterGuard(player);
				}

				if (KinkyDungeonJailGuard() && (KDPrisonIsInFurniture(player)) && KinkyDungeonFlags.get("transformAwait")
					&& !KinkyDungeonStatsChoice.get("SpeciesDoll")) {
					let guard = KinkyDungeonJailGuard();
						
					let action = "initiateDialogue";
					if (guard.IntentAction != action && !KDGameData.CurrentDialog) {
						guard.gx = player.x;
						guard.gy = player.y;
						KDIntentEvents[action].trigger(guard, {});
						guard.intentDialogue = "DollTransform";
					}
					
					

					
					// Stay in the current state for travel
					return KDCurrentPrisonState(player);

				}
				// If we are in uniform we go to the Storage state
				return KDPopSubstate(player);
			},
		},
		
		TransformTravel: {name: "TransformTravel",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;

				let label = KDMapData.Labels?.Stand ? KDGetUnoccupiedLabel(KDMapData.Labels.Stand, player, true, true) : null;
				let rad = 3;

				let lostTrack = KDLostJailTrack(player);
				if (lostTrack == "Unaware") {
					return KDSetPrisonState(player, "Jail");
				}

				if (label && (KDistEuclidean(label.x - player.x, label.y - player.y) > rad || !KDPrisonIsInFurniture(player))
					&& KDPlayerLeashable(player)) {
					KDSelectLabel(player, label);
					let guard = KDPrisonCommonGuard(player);
					if (guard) {
						// Assign the guard to a furniture intentaction
						let action = "leashToPoint_Furn";
						if (guard.IntentAction != action) {
							guard.gx = player.x;
							guard.gy = player.y;
							KDIntentEvents[action].trigger(guard, {point: label, radius: 1, target: player});
						}

						if (lostTrack) {
							// Any qualifying factors means they know where you should be
							guard.gx = player.x;
							guard.gy = player.y;
							KinkyDungeonSetEnemyFlag(guard, "wander", 30)
							KinkyDungeonSetEnemyFlag(guard, "overrideMove", 10);
						}
						if (KinkyDungeonLeashingEnemy() == guard) {
							// Make the guard focus on leashing more strongly, not attacking or pickpocketing
							KinkyDungeonSetEnemyFlag(guard, "focusLeash", 2);
						}
						KinkyDungeonSetEnemyFlag(guard, "notouchie", 2);
					} else {
						// forbidden state
						return KDPopSubstate(player);
					}

					// Stay in the current state for travel
					return KDCurrentPrisonState(player);
				
					
				}

				// End
				KinkyDungeonSetFlag("transformAwaitFurniture", 6);
				return KDPopSubstate(player);
			},
		},
		
	},
};


/**
 * @param player
 */
function KDPrisonPuppetmasterGuard(player: entity, _call: boolean = false, suppressCall: boolean = true): entity {
	// Suppress standard guard call behavior
	KinkyDungeonSetFlag("SuppressGuardCall", 10);
	let guard = KDGetNearestFactionGuard(player.x, player.y, ((en: entity) => {
		return !!en.Enemy?.tags?.puppeteer && (KDEnemyHasFlag(en, "mapguard")
			|| (
				KDGetFaction(en) == KDGetMainFaction()
				&& en.Enemy?.tags.jailer
			)) && !KDHelpless(en) && !KinkyDungeonIsDisabled(en);
	}));
	if (guard)
		KDGameData.JailGuard = guard.id;

	return KinkyDungeonJailGuard();
}


function KDGetUnoccupiedLabel(labels: KDLabel[], entity?: entity, getLabelCurrentlyOn?: boolean, getSelected?: boolean) : KDLabel {
	labels = labels.filter((label) => {
		return !KinkyDungeonEntityAt(label.x, label.y) || entity == KinkyDungeonEntityAt(label.x, label.y);
	});


	
	if (getSelected && entity && KDGetLabel(entity)) {
		let lb = labels.filter((label) => {
			return label.x ==  KDGetLabel(entity).x && label.y ==  KDGetLabel(entity).y
		});
		if (lb.length > 0)
			return lb[0];
	}

	if (getLabelCurrentlyOn && entity) {
		let lb = labels.filter((label) => {
			return label.x == entity.x && label.y == entity.y;
		});
		if (lb.length > 0)
			return lb[0];
	}

	if (labels.length > 0) return CommonRandomItemFromList(null, labels);
	return null;
}

function KDSelectLabel(entity: entity, label: KDLabel) {
	if (!KDGameData.selectedLabel) KDGameData.selectedLabel = {};
	if (label && !KDGameData.selectedLabel[entity.id]) KDGameData.selectedLabel[entity.id] = label;
	else delete KDGameData.selectedLabel[entity.id];
}
function KDGetLabel(entity: entity) {
	if (!KDGameData.selectedLabel) KDGameData.selectedLabel = {};
	return KDGameData.selectedLabel[entity.id];
}