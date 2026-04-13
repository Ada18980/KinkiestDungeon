KDPrisonTypes.DollStorage = {
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
				let tag = KDGetMainFaction() == "Dollsmith" ? "dollsmith" : "cyborg";
				let Enemy = KinkyDungeonGetEnemy([tag, "robot"], MiniGameKinkyDungeonLevel + 4, 'bel', '0', [tag], undefined, {[tag]: {mult: 4, bonus: 10}}, ["boss"]);
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
						let tag = KDGetMainFaction() == "Dollsmith" ? "dollsmith" : "cyborg";
						let Enemy = KinkyDungeonGetEnemy([tag, "robot"], MiniGameKinkyDungeonLevel + 4, 'bel', '0', [tag], undefined, {[tag]: {mult: 4, bonus: 10}}, ["boss"]);
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
						let tag = "robot";
						let Enemy = KinkyDungeonGetEnemy([tag], MiniGameKinkyDungeonLevel + 4, 'bel', '0', [tag], undefined, {[tag]: {mult: 4, bonus: 10}}, ["boss", "oldrobot", "miniboss", "elite"]);
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

					if (!KinkyDungeonFlags.get("trainingCD")) {
						//return "Training";
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
				KDPrisonCommonGuard(player);

				if (KDPrisonIsInFurniture(player)) {
					let uniformCheck = KDPrisonGetGroups(player, ["cyborg"], "Purple", KDJAILPOWER);
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
					guard.gx = player.x;
					guard.gy = player.y;
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
						guard.gx = player.x;
						guard.gy = player.y;
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
						// Go to jail state for training
						//KinkyDungeonSetFlag("PrisonCyberTrainingFlag", 10);
						//return KDSetPrisonState(player, "Jail");
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
		
	},
};