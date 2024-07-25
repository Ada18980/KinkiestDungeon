'use strict';

let KDCYBERPOWER = 19;
let KDPRISONGROUPS = [
	[
		"ItemHead",
		"ItemEars",
	],
	[
		"ItemMouth",
	],
	[
		"ItemNeck",
	],
	[
		"ItemArms",
		"ItemHands",
	],
	[
		"ItemTorso",
		"ItemBreast",
		"ItemPelvis",
	],
	[
		"ItemNipples",
		"ItemVulva",
		"ItemButt",
		"ItemVulvaPiercings",
	],
	[
		"ItemLegs",
		"ItemFeet",
		"ItemBoots",
	],
	[
		"ItemDevices",
	],
];

/**
 * @type {Record<string, KDPrisonType>}
 */
let KDPrisonTypes = {
	Summit: {
		name: "Summit",
		default_state: "BusinessAsUsual",
		starting_state: "BusinessAsUsual",
		update: (delta) => {
			KinkyDungeonSetFlag("noPlay", 12);
			let player = KDPlayer();

			if (player.x == 18 && player.y == 20 && KinkyDungeonGetRestraintItem("ItemDevices")) {
				if (KDRandom() < 0.2 && !KinkyDungeonEntityAt(18, 21)) {
					KinkyDungeonSendTextMessage(10, TextGet("KDSummitSafeguard"), "#88ff88", 10);
					KDMovePlayer(18, 21, false);
				}
			}

			// Escapees
			for (let entity of KDMapData.Entities) {
				if (!KDHelpless(entity) && !KDIsHopeless(entity)
					&& KDGameData.Collection[entity.id + ""]?.escaped) {
						if (KDistChebyshev(entity.x - 11, entity.y - 21) > 0.5) {
							entity.gx = 11;
							entity.gy = 21;
							entity.gxx = 11;
							entity.gyy = 21;
						} else {
							// Despawn and remove from collection
							KDNPCEscape(entity);
						}
				}
			}
		},
		states: {
			BusinessAsUsual: {name: "BusinessAsUsual",
				init: (params) => {

					return "";
				},
				update: (delta) => {
					let player = KinkyDungeonPlayerEntity;
					return "BusinessAsUsual";
				},
			},
			Rebel: {name: "Rebel",
				init: (params) => {
					return "";
				},
				update: (delta) => {
					return "BusinessAsUsual";
				},
				updateStack: (delta) => {
					KinkyDungeonSetFlag("noPlay", 10);
				},
			},

		},
	},
	DollStorage: {
		name: "DollStorage",
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
								KinkyDungeonAttachTetherToEntity(1.5, gg, doll, "DollLeash", "#00ffff", 6);
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
					if (Enemy && !KinkyDungeonEnemyAt(KDMapData.EndPosition.x, KDMapData.EndPosition.y)) {
						let en = DialogueCreateEnemy(KDMapData.EndPosition.x, KDMapData.EndPosition.y, Enemy.name);
						KDProcessCustomPatron(Enemy, en, 0.5);
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
								KDProcessCustomPatron(Enemy, en, 0.5);
								en.AI = "looseguard";
								en.faction = "Enemy";
								en.keys = true;
								KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
								KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
							}

						}
					}
					if (KDMapData.Labels && KDMapData.Labels.Patrol) {
						for (let l of KDMapData.Labels.Deploy) {
							let tag = "robot";
							let Enemy = KinkyDungeonGetEnemy([tag], MiniGameKinkyDungeonLevel + 4, 'bel', '0', [tag], undefined, {[tag]: {mult: 4, bonus: 10}}, ["boss", "oldrobot", "miniboss", "elite"]);
							if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)) {
								let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
								KDProcessCustomPatron(Enemy, en, 0.1);
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

						let uniformCheck = KDPrisonGetGroups(player, ["cyborg"], "Cyber", KDCYBERPOWER);
						if ((uniformCheck.groupsToStrip.length > 0 && !KinkyDungeonFlags.get("failStrip")) || uniformCheck.itemsToApply.length > 0) {
							return "Uniform";
						}

						if (!KinkyDungeonFlags.get("trainingCD")) {
							return "Training";
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
						let uniformCheck = KDPrisonGetGroups(player, ["cyborg"], "Cyber", KDCYBERPOWER);
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
								let uniformCheck = KDPrisonGetGroups(player, ["cyborg"], "Cyber", KDCYBERPOWER);
								if (uniformCheck.groupsToStrip.length == 0) {
									return KDPopSubstate(player);
								}
								// if we have a future crate we use its own features
								if (KinkyDungeonPlayerTags.get("FutureDress"))
									KinkyDungeonSetFlag("futureDressRemove", 2);
								else {
									let succeedAny = false;
									for (let grp of uniformCheck.groupsToStrip) {
										if (succeedAny) break;
										let rr = KinkyDungeonGetRestraintItem(grp);
										if (rr) {
											let restraintStack = KDDynamicLinkList(rr, true);
											if (restraintStack.length > 0) {
												let succeed = false;
												for (let r of restraintStack) {
													if (!uniformCheck.itemsToKeep[KDRestraint(r)?.name] && KinkyDungeonRestraintPower(r, true) < KDCYBERPOWER) {
														succeed = KinkyDungeonRemoveRestraintSpecific(r, false, false, false).length > 0;
														if (succeed) {
															let msg = TextGet("KinkyDungeonRemoveRestraints")
																.replace("EnemyName", TextGet("Name" + guard.Enemy.name));
															//let msg = TextGet("Attack" + guard.Enemy.name + "RemoveRestraints");
															if (r) msg = msg.replace("OldRestraintName", KDGetItemName(r));
															KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
															break;
														}
													}
												}

												// If we only fail...
												if (!succeed) {
													// nothing yet
												} else {
													succeedAny = true;
													break;
												}
											}
										}
									}

									// If we REALLY only fail...
									if (!succeedAny) {
										KinkyDungeonSetFlag("failStrip", 100);
										return KDPopSubstate(player);
									}
								}

								// Stay in the current state
								return KDCurrentPrisonState(player);
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
								// Add one per turn
								let uniformCheck = KDPrisonGetGroups(player, ["cyborg"], "Cyber", KDCYBERPOWER);
								if (uniformCheck.itemsToApply.length == 0) {
									return KDPopSubstate(player);
								}
								// if we have a future crate we use its own features
								if (KinkyDungeonPlayerTags.get("FutureDress"))
									KinkyDungeonSetFlag("futureDressAdd", 2);
								else {
									let restraint = uniformCheck.itemsToApply[0];
									if (restraint) {
										if (KinkyDungeonAddRestraintIfWeaker(
											KinkyDungeonGetRestraintByName(restraint.item),
											2, KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined,
											"Cyber", false, false, undefined, KDGetMainFaction(),
											KinkyDungeonStatsChoice.has("TightRestraints") ? true : undefined,
											undefined, KinkyDungeonJailGuard(),
											false, undefined, undefined, undefined,
											restraint.variant ? KDApplyVariants[restraint.variant] : undefined,
										)) {
											let msg = TextGet("KinkyDungeonAddRestraints")
												.replace("EnemyName", TextGet("Name" + guard.Enemy.name));
											//let msg = TextGet("Attack" + guard.Enemy.name + "RemoveRestraints");
											msg = msg.replace("NewRestraintName", KDGetItemNameString(restraint.item));
											KinkyDungeonSendTextMessage(9, msg, "yellow", 1);
										}
									}
								}

								// Stay in the current state
								return KDCurrentPrisonState(player);
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
						let uniformCheck = KDPrisonGetGroups(player, ["cyborg"], "Cyber", KDCYBERPOWER);
						if (uniformCheck.itemsToApply.length > 0) {
							return KDGoToSubState(player, "Uniform");
						}

						// Stay in the current state, but increment the storage timer, return to jail state if too much
						KinkyDungeonFlags.set("PrisonStorageTimer", (KinkyDungeonFlags.get("PrisonStorageTimer") || 0) + delta * 2);
						if (KinkyDungeonFlags.get("PrisonStorageTimer") > 300) {
							// Go to jail state for training
							KinkyDungeonSetFlag("PrisonCyberTrainingFlag", 10);
							return KDSetPrisonState(player, "Jail");
						}
						return KDCurrentPrisonState(player);
					}
					// Go to jail state for further processing
					return KDSetPrisonState(player, "Jail");
				},
			},
			/**
			 * Training state, assigns the player to one of various trainings
			 */
			Training: {name: "Training",
				init: (params) => {
					return "";
				},
				update: (delta) => {
					let player = KinkyDungeonPlayerEntity;

					let label = KDMapData.Labels?.Training ? KDMapData.Labels.Training[0] : null;
					let rad = 3;
					if (label && (KDistEuclidean(label.x - player.x, label.y - player.y) > rad)) {
						return KDGoToSubState(player, "TrainingTravel");
					}

					if (!KinkyDungeonFlags.get("trainingCD")) {
						KinkyDungeonSetFlag("trainingCD", 300);

						return KDGoToSubState(player, "LatexTraining");
					}

					// Go to jail state for further processing
					return KDSetPrisonState(player, "Jail");
				},
				updateStack: (delta) => {
					// Always reveals the thing
					let label = KDMapData.Labels?.Training ? KDMapData.Labels.Training[0] : null;
					let rad = 5;
					if (label) {
						for (let x = label.x - rad; x <= label.x + rad; x++)
							for (let y = label.y - rad; y <= label.y + rad; y++)
								KDRevealTile(x, y, 8);
					}
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

			LatexTraining: {name: "LatexTraining",
				init: (params) => {
					return "";
				},
				update: (delta) => {
					let player = KinkyDungeonPlayerEntity;

					// End when training ends
					if (!KinkyDungeonFlags.get("trainingStart")) {
						// End the latex training flags too
						KinkyDungeonSetFlag("latexTrainingStart", 0);
						return KDPopSubstate(player);
					}

					// Only progress the training if player is inside
					let guard = KDPrisonCommonGuard(player);

					let label = KDMapData.Labels?.Training ? KDMapData.Labels.Training[0] : null;
					let rad = 5;
					if (label && (KDistChebyshev(label.x - player.x, label.y - player.y) < rad)) {
						// Start the training and initialize the field
						if (!KinkyDungeonFlags.get("latexTraining") && !KinkyDungeonFlags.get("latexTrainingStart")) {
							KinkyDungeonSetFlag("latexTraining", 30);
							KinkyDungeonSetFlag("latexTrainingStart", KinkyDungeonFlags.get("trainingStart"));
							if (guard) {
								guard.path = undefined;
								KinkyDungeonSetEnemyFlag(guard, "wander", 0);
							}

							KDBreakTether(player);
							KDForceWanderFar(player, 13);
							KDResetAllAggro(player);
							KDResetAllIntents(false, 30, player);
							KDGameData.PrisonerState = 'jail';


							for (let xx of [label.x + 3, label.x - 3]) {
								let e = DialogueCreateEnemy(xx, label.y, "LatexSprayer");
								e.faction = "Ambush";
								e.vp = 2;
								e.aware = true;
								e.hostile = KinkyDungeonFlags.get("latexTraining");
								e.summoned = false; // They can drop loot
								KinkyDungeonSetEnemyFlag(e, "noignore", KinkyDungeonFlags.get("latexTraining"));
								KinkyDungeonApplyBuffToEntity(e, KDTrainingUnit); // Training unit
							}

							//Create training doors
							let labels = KDMapData.Labels?.TrainingDoor;
							if (labels?.length > 0) {
								for (let td of labels) {
									KinkyDungeonMapSet(td.x, td.y, "D");
									let door = KinkyDungeonTilesGet(td.x + ',' + td.y);
									if (!door) door = KinkyDungeonTilesSet(td.x + ',' + td.y, {});
									door.Type = "Door";
									door.Lock = "Cyber";
									door.ReLock = true;
									door.Jail = true;
								}
							}
						}

						// TODO progress training
						let enemiesNear = KDNearbyEnemies(label.x, label.y, rad+2);
						for (let en of enemiesNear) {
							if (en.faction != "Ambush" && KDGetFaction(en) != "Player") {
								if (!KDEnemyHasFlag(en, "trainingLeave")) {
									KDWanderEnemy(en);
									KinkyDungeonSetEnemyFlag(en, "trainingLeave", 10);
								}
							}
						}
						// Remove training started flag to finish off the training
						if (!KinkyDungeonFlags.get("latexTraining"))
							KinkyDungeonSetFlag("trainingStart", 0);

						// Stay in training state
						return KDCurrentPrisonState(player);
					}

					return KDPopSubstate(player);
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

					let jailPointNearest = KinkyDungeonNearestJailPoint(player.x, player.y, ["storage"], undefined, undefined);
					if (!(jailPointNearest && jailPointNearest.x == player.x && jailPointNearest.y == player.y))
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
			TrainingTravel: {name: "TrainingTravel",
				init: (params) => {
					return "";
				},
				update: (delta) => {
					let player = KinkyDungeonPlayerEntity;

					let label = KDMapData.Labels?.Training ? KDMapData.Labels.Training[0] : null;
					let rad = 3;

					let lostTrack = KDLostJailTrack(player);
					if (lostTrack == "Unaware") {
						return KDSetPrisonState(player, "Jail");
					}

					if (label && (KDistEuclidean(label.x - player.x, label.y - player.y) > rad) && KDPlayerLeashable(player)) {
						// We are not in a furniture, so we conscript the guard
						let guard = KDPrisonCommonGuard(player);
						if (guard) {
							// Assign the guard to a furniture intentaction
							let action = "leashToPoint";
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
					KinkyDungeonSetFlag("trainingStart", 300);
					return KDPopSubstate(player);
				},
			},
		},
	},
};

/**
 *
 * @param {entity} player
 * @returns {boolean}
 */
function KDLostJailTrack(player) {
	let label = KDMapData.Labels?.Training ? KDMapData.Labels.Training[0] : null;
	let rad = 4;
	if (KDistChebyshev(player.x - label.x, player.y - label.y) < rad) return "InTraining";
	if (KinkyDungeonPlayerTags.get("Furniture")) return "Furniture";
	if (!KinkyDungeonLeashingEnemy()) {
		let unaware = true;
		for (let en of KDMapData.Entities) {
			if (en.aware && KDGetFaction(en) == "Enemy" && !(en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner) ) {
				unaware = false;
			}
		}
		if (unaware) {
			// We dont do anything
			return "Unaware";
		}
	}
	return "";
}


