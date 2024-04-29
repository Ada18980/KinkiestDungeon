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
	DollStorage: {
		name: "DollStorage",
		default_state: "Jail",
		starting_state: "Intro",
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
								en.AI = "verylooseguard";
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

					if (KDPrisonTick(player)) {
						let uniformCheck = KDPrisonGetGroups(player, ["cyborg"], "Cyber", KDCYBERPOWER);
						if (uniformCheck.groupsToStrip.length > 0 || uniformCheck.itemsToApply.length > 0) {
							return "Uniform";
						}
					}
					return "Jail";
				},
			},
			FurnitureTravel: {name: "FurnitureTravel",
				init: (params) => {
					return "";
				},
				update: (delta) => {
					let player = KinkyDungeonPlayerEntity;

					// End when the player is settled
					if (KDPrisonIsInFurniture(player)) {
						return KDPopSubstate(player);
					}
					// We are not in a furniture, so we conscript the guard
					let guard = KDPrisonCommonGuard(player);
					if (guard) {
						// Assign the guard to a furniture intentaction
						let action = KDGameData.PrisonerState == 'jail' ? "leashFurniture" : "leashFurnitureAggressive";
						if (guard.IntentAction != action)
							KDIntentEvents[action].trigger(guard, {});
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

					if (guard) {
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
										let rr = KinkyDungeonGetRestraintItem(grp);
										if (rr) {
											let restraintStack = KDDynamicLinkList(rr);
											if (restraintStack.length > 0) {
												let succeed = false;
												for (let r of restraintStack) {
													if (KinkyDungeonRestraintPower(r, false) < KDCYBERPOWER) {
														KinkyDungeonRemoveRestraintSpecific(r, false, false, false);
														let msg = TextGet("KinkyDungeonRemoveRestraints")
															.replace("EnemyName", TextGet("Name" + guard.Enemy.name));
														//let msg = TextGet("Attack" + guard.Enemy.name + "RemoveRestraints");
														if (r) msg = msg.replace("OldRestraintName", KDGetItemName(r));
														KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
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
						if (KinkyDungeonFlags.get("PrisonStorageTimer") > 0) {
							KinkyDungeonFlags.set("PrisonStorageTimer", KinkyDungeonFlags.get("PrisonStorageTimer") + delta * 2);
							if (KinkyDungeonFlags.get("PrisonStorageTimer") > 300) {
								// Go to jail state for training
								KinkyDungeonSetFlag("PrisonCyberTrainingFlag", 10);
								return KDSetPrisonState(player, "Jail");
							}
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
						if (!KinkyDungeonFlags.get("latexTraining")) {
							KinkyDungeonSetFlag("latexTraining", KinkyDungeonFlags.get("trainingStart"));
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
								e.hostile = KinkyDungeonFlags.get("latexTraining");
								e.summoned = false; // They can drop loot
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
					}

					// Stay in training state
					return KDCurrentPrisonState(player);
				},
			},
			StorageTravel: {name: "StorageTravel",
				init: (params) => {
					return "";
				},
				update: (delta) => {
					let player = KinkyDungeonPlayerEntity;


					let jailPoint = KinkyDungeonNearestJailPoint(player.x, player.y, ["storage"]);
					if (!jailPoint || jailPoint.x != player.x || jailPoint.y != player.y) {
						// We are not in a furniture, so we conscript the guard
						let guard = KDPrisonCommonGuard(player);
						if (guard) {
							// Assign the guard to a furniture intentaction
							let action = "leashStorage";
							if (guard.IntentAction != action)
								KDIntentEvents[action].trigger(guard, {});
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
					if (label && (KDistEuclidean(label.x - player.x, label.y - player.y) > rad)) {
						// We are not in a furniture, so we conscript the guard
						let guard = KDPrisonCommonGuard(player);
						if (guard) {
							// Assign the guard to a furniture intentaction
							let action = "leashToPoint";
							if (guard.IntentAction != action)
								KDIntentEvents[action].trigger(guard, {point: label, radius: 1, target: player});
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
