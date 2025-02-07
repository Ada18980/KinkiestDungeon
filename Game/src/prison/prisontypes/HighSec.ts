let KDJailStripSearchTime = 300;
let KDJailStripSearchTempTime = 50;

function KDShouldStripSearchPlayer(player: entity, allowFlag: boolean = false): boolean {
	if (!player.player) return false;
	if (KinkyDungeonCheckRelease() >= 0) return false;
	if (allowFlag && KinkyDungeonFlags.get("jailStripSearched")) return false;
	// TODO check if player has more than a few items in inventory
	/** Max consumables */
	let maxItemsCheck = 1 + 3 * (1 - KinkyDungeonCalcVisibility(player, 1));
	/** Max non unarmed weapons */
	let maxWeaponsCheck = 1;

	let currentItems = 0;
	for (let c of KinkyDungeonAllConsumable()) {
		if (KDConsumable(c)?.sub) continue; // Subby items allowed
		let inc = 1;
		if (KDConsumable(c)?.sneakChance) inc = KDConsumable(c)?.sneakChance;
		if (c.quantity == undefined) currentItems += inc;
		else currentItems += inc * c.quantity;
	}
	let currentWeapons = KinkyDungeonAllWeapon().filter((w) => {
		return !KDWeapon(w)?.unarmed;
	}).length;

	return currentItems > maxItemsCheck || currentWeapons > maxWeaponsCheck;
}
function KDDoStripSearchRemove(player: entity, guard: entity): string {
	// TODO: add the strip search station

	if (!KDGameData.CurrentDialog) {
		KDStartDialog("StripSearch",
			guard.Enemy.name,
			true,
			KDGetPersonality(guard),
			guard)
	}

	//if (KDShouldStripSearchPlayer(player)) return KDCurrentPrisonState(player);
	return KDPopSubstate(player);
}



KDPrisonTypes.HighSec = {
	name: "HighSec",
	default_state: "Jail",
	starting_state: "Intro",
	update: (delta) => {
		if (KDGameData.PrisonerState != 'parole') {
			KinkyDungeonSetFlag("noPlay", 12);
		}

		let mainFaction = KDGetMainFaction();

		// Assign guards to deal with idle dolls
		let idleGuard: entity[] = [];
		for (let en of KDMapData.Entities) {
			if ((en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner)
				&& !KDEnemyHasFlag(en, "conveyed_rec")) {
				// Is a prisoner, dont do anything (for now)
			} else if (en.faction == (mainFaction || "Enemy")
				&& en.Enemy?.tags.jailer
				&& en != KinkyDungeonJailGuard()
				&& en != KinkyDungeonLeashingEnemy()
				&& (en.idle || KDEnemyHasFlag(en, "idleg"))
				&& !en.goToDespawn) {
				idleGuard.push(en);
				KinkyDungeonSetEnemyFlag(en, "idleg", 2);
			}
		}

		// If there are any guards still idle we move them to exit to despawn
		let idleGuards: entity[] = [];
		let guardCount = 0;
		for (let en of KDMapData.Entities) {
			if (en.faction == (mainFaction || "Enemy")
				&& !en.goToDespawn
				&& !(en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner) ) {
				if (en != KinkyDungeonJailGuard() && en != KinkyDungeonLeashingEnemy() && (en.idle && !KDEnemyHasFlag(en, "idlegselect")))
					idleGuards.push(en);
				if (en.Enemy.tags.jailer) guardCount += 1;
			}
		}
		if (guardCount > 8) {
			let max = guardCount * 0.2;
			let despawning = 0;
			for (let en of idleGuards) {
				if (KDEntityHasFlag(en, "despawn")) {
					despawning++;
					continue;
				}
				if (KDEntityHasFlag(en, "spawned")) {
					continue;
				}
				if ((!en.homeCoord) || !KDCompareLocation(en.homeCoord, KDGetCurrentLocation())) {
					despawning += 1;
					KinkyDungeonSetEnemyFlag(en, "despawn", 300);
					KinkyDungeonSetEnemyFlag(en, "wander", 300);
					en.gx = KDMapData.EndPosition.x;
					en.gy = KDMapData.EndPosition.y;
					en.goToDespawn = true;
					if (despawning > max) break;
				}
			}
		} else if (!KinkyDungeonFlags.get("guardspawn")) {
			// TODO replace with map flags
			// spawn a new one
			KinkyDungeonSetFlag("guardspawn", 20);


			if (KDMapData.Labels && KDMapData.Labels.Deploy?.length > 0) {
				let l = KDMapData.Labels.Deploy[Math.floor(KDRandom() * KDMapData.Labels.Deploy.length)];

				let Enemy = KDGetJailEnemy();

				if (Enemy && !KinkyDungeonEnemyAt(KDMapData.EndPosition.x, KDMapData.EndPosition.y)
					&& KDistChebyshev(KDPlayer().x - KDMapData.EndPosition.x, KDPlayer().y - KDMapData.EndPosition.y)
						> 7) {
					let en = DialogueCreateEnemy(KDMapData.EndPosition.x, KDMapData.EndPosition.y, Enemy.name);
					//KDProcessCustomPatron(Enemy, en, 0.5, false);
					en.AI = "looseguard";
					en.faction = mainFaction || "Enemy";
					en.keys = true;
					en.gxx = l.x;
					en.gyy = l.y;
					en.gx = l.x;
					en.gy = l.y;
					KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
					KinkyDungeonSetEnemyFlag(en, "spawned", 300);
					//KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
				}
			}
		}
	},
	states: {
		Intro: {name: "Intro",
			init: (params) => {
				let mainFaction = KDGetMainFaction();
				if (KDGameData.PrisonerState == "parole" && KDGetEffSecurityLevel() >= 0)
					KDGameData.PrisonerState = "jail";
				if (KDMapData.Labels && KDMapData.Labels.Deploy) {
					for (let l of KDMapData.Labels.Deploy) {

						let Enemy = KDGetJailEnemy();

						if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)) {
							let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
							//KDProcessCustomPatron(Enemy, en, 0.5, false);
							en.AI = "looseguard";
							en.faction = mainFaction || "Enemy";
							en.keys = true;
							KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
							//KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
						}

					}
				}
				if (KDMapData.Labels && KDMapData.Labels.Patrol) {
					for (let l of KDMapData.Labels.Patrol) {

						let Enemy = KDGetJailEnemy();

						if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)) {
							let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
							//KDProcessCustomPatron(Enemy, en, 0.1, false);
							en.AI = "hunt";
							en.faction = mainFaction || "Enemy";
							en.keys = true;
							KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
							//KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
						}

					}
				}
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				KDPrisonCommonGuard(player, undefined, false);
				return "Jail";
			},
		},
		Jail: {name: "Jail",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				let TheChosenOne = false;
				if (!KinkyDungeonJailGuard()) TheChosenOne = true;
				if (!(KDGameData.GuardTimer > 0) && KDGameData.GuardSpawnTimer <= 1)
					KDPrisonCommonGuard(player, undefined, false);

				if (TheChosenOne && KinkyDungeonJailGuard()) {
					let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, ["jail"]);

					if (nearestJail) {

						let xx = nearestJail.x + KinkyDungeonJailLeashX;
						let yy = nearestJail.y;
						KDJailEvents.useCurrentGuard.trigger(
							KinkyDungeonJailGuard(),
							xx, yy
						);
					}

				}
				KinkyDungeonHandleJailSpawns(delta, KDRandom() < 0.9);


				let lostTrack = KDLostJailTrackCell(player);
				if (lostTrack == "Unaware") {
					return KDSetPrisonState(player, "Jail");
				}


				if (KDPrisonIsInFurniture(player)) {
					let lockType = "Red";
					let uniformCheck = KDPrisonGetGroups(player, undefined, lockType, KDJAILPOWER);
					if (uniformCheck.itemsToApply.length > 0) {
						return KDGoToSubState(player, "Uniform");
					}

					// Stay in the current state, but increment the storage timer, return to jail state if too much
					KinkyDungeonFlags.set("PrisonStorageTimer", (KinkyDungeonFlags.get("PrisonStorageTimer") || 0) + delta * 2);
					if (!(KinkyDungeonFlags.get("PrisonStorageTimer") > 50)) {
						// Stay a little while
						return KDCurrentPrisonState(player);
						//return KDSetPrisonState(player, "Jail");
					}
				}




				if (KDPrisonTick(player) && !KinkyDungeonFlags.get("suspendJailTick")) {
					if (KDShouldStripSearchPlayer(player, true)) {
						return "Strip";
					}
					if (KDIsPlayerTethered(KDPlayer())) {
						return "Jail";
					}
					if (!KinkyDungeonPlayerInCell()) {
						let lockType = "Red";
						let uniformCheck = KDPrisonGetGroups(player, undefined, lockType, KDJAILPOWER);
						if ((uniformCheck.groupsToStrip.length > 0 && !KinkyDungeonFlags.get("failStrip")) || uniformCheck.itemsToApply.length > 0) {
							return "Uniform";
						}
					}
					return "Cell";
				}
				return "Jail";
			},
			updateStack: (delta) => {
				KinkyDungeonSetFlag("noPlay", 10);

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
					let lockType = "Red";
					let uniformCheck = KDPrisonGetGroups(player, undefined, lockType, KDJAILPOWER);
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
				return KDGoToSubState(player, "UniformTravel");
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
							let lockType = "Red";
							return KDDoUniformRemove(player, guard, undefined, lockType, KDJAILPOWER);

						}
					} else {
						// Stay in the current state
						return KDCurrentPrisonState(player);
					}
				}

				// Otherwise go to travel state
				return KDGoToSubState(player, "UniformTravel");
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
							let lockType = "Red";
							return KDDoUniformApply(player, guard, undefined, lockType, KDJAILPOWER);
						}
					} else {
						// Stay in the current state
						return KDCurrentPrisonState(player);
					}
				}
				// Otherwise go to travel state
				return KDGoToSubState(player, "UniformTravel");
			},
		},
		UniformTravel: {name: "UniformTravel",
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


		Strip: {name: "Strip",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				KDPrisonCommonGuard(player);
				KinkyDungeonSetFlag("noWeaponStop", 10);
				if (KDPrisonIsInFurniture(player) && !KinkyDungeonFlags.get("jailStripSearched")) {
					KinkyDungeonSetFlag("jailStripSearched", KDJailStripSearchTempTime);
					return KDGoToSubState(player, "StripRemove");
				}
				// Otherwise go to travel state
				if (KDShouldStripSearchPlayer(player))
					return KDGoToSubState(player, "StripTravel");
				if (!KinkyDungeonPlayerInCell()) {
					return KDGoToSubState(player, "CellTravel");
				}
				return KDPopSubstate(player);
			},
		},
		StripRemove: {name: "StripRemove",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				let guard = KDPrisonCommonGuard(player);
				KinkyDungeonSetFlag("noWeaponStop", 10);

				if (guard && KDPrisonIsInFurniture(player)) {
					guard.gx = player.x;
					guard.gy = player.y;
					KinkyDungeonSetEnemyFlag(guard, "overrideMove", 2);
					if (KDistChebyshev(guard.x - player.x, guard.y - player.y) < 1.5) {
						if (KDPrisonIsInFurniture(player)) {
							KinkyDungeonSetFlag("jailStripSearched", KDJailStripSearchTime);
							return KDDoStripSearchRemove(player, guard);
						}
					} else {
						// Stay in the current state
						return KDCurrentPrisonState(player);
					}
				}

				return KDPopSubstate(player);
			},
		},
		StripTravel: {name: "StripTravel",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				KinkyDungeonSetFlag("noWeaponStop", 10);

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
					let action = (KDGameData.PrisonerState == 'jail'
						&& !KinkyDungeonAggressive(guard, player))
						? "leashFurniture" : "leashFurnitureAggressive";
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

		Cell: {name: "Cell",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				KDPrisonCommonGuard(player, undefined, false);


				if (KDPrisonIsInFurniture(player)) {
					// Stay in the current state, but increment the Cell timer, return to jail state if too much
					KinkyDungeonFlags.set("PrisonCellTimer", (KinkyDungeonFlags.get("PrisonCellTimer") || 0) + delta * 2);
					if (KinkyDungeonFlags.get("PrisonCellTimer") > 300) {
						// Go to jail state for training
						KinkyDungeonSetFlag("PrisonCyberTrainingFlag", 10);
						return KDSetPrisonState(player, "Jail");
					}
					return KDCurrentPrisonState(player);
				}

				if (!KinkyDungeonPlayerInCell()) {
					// Move the player to the storage
					return KDGoToSubState(player, "CellTravel");
				}

				// Go to jail state for further processing
				return KDSetPrisonState(player, "Jail");
			},
		},

		CellTravel: {name: "CellTravel",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;

				let lostTrack = KDLostJailTrack(player);
				if (lostTrack == "Unaware") {
					return KDSetPrisonState(player, "Jail");
				}

				let jailPointNearest = KinkyDungeonNearestJailPoint(player.x, player.y, ["jail"], undefined, undefined);
				if (!(jailPointNearest && jailPointNearest.x == player.x && jailPointNearest.y == player.y))
				{
					// We are not in a furniture, so we conscript the guard
					let guard = KDPrisonCommonGuard(player);
					if (guard) {
						// Assign the guard to a furniture intentaction
						let action = "leashCell";
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