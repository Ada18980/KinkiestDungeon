'use strict';

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
		default_state: "Storage",
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
						let uniformCheck = KDPrisonGetGroups(player, ["cyborg"]);
						if (uniformCheck.groupsToStrip.length > 0 || uniformCheck.itemsToApply.length > 0) {
							return "Uniform";
						}
					}
					return "Jail";
				},
			},
			FurnitureTravel: {name: "FurnitureTravel",
				substate: true,
				substateTimeout: 80,
				refreshState: "Intro",
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
						let uniformCheck = KDPrisonGetGroups(player, ["cyborg"]);
						if (uniformCheck.groupsToStrip.length > 0) {
							return "UniformRemoveExtra";
						} else if (uniformCheck.itemsToApply.length > 0) {
							return "UniformApply";
						}

						// If we are in uniform we go back
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
					KDPrisonCommonGuard(player);

					if (KDPrisonIsInFurniture(player)) {
						// Remove one per turn


						// Stay in the current state
						return KDCurrentPrisonState(player);
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
					KDPrisonCommonGuard(player);

					if (KDPrisonIsInFurniture(player)) {
						// Remove one per turn


						// Stay in the current state
						return KDCurrentPrisonState(player);
					}
					// Otherwise go to travel state
					return KDGoToSubState(player, "FurnitureTravel");
				},
			},
		},
	},
};
