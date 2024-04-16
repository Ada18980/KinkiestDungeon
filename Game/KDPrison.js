'use strict';

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
					return "Intro";
				},
				update: (delta) => {
					let player = KinkyDungeonPlayerEntity;
					// Suppress standard guard call behavior
					KinkyDungeonSetFlag("SuppressGuardCall", 10);
					let guard = KDGetNearestFactionGuard(player.x, player.y);
					KDGameData.JailGuard = guard.id;
					return "Intro";
				},
			},
		},
	},
};

/**
 * @param {number} x
 * @param {number} y
 * @returns {entity}
 */
function KDGetNearestFactionGuard(x, y) {
	let condition = (en) => {
		return (KDEnemyHasFlag(en, "mapguard")
			|| (
				KDGetFaction(en) == KDGetMainFaction()
				&& en.Enemy?.tags.jailer
			)) && !KDHelpless(en) && !KinkyDungeonIsDisabled(en);
	};

	if (KinkyDungeonJailGuard() && condition(KinkyDungeonJailGuard())) return KinkyDungeonJailGuard();

	let dist = KDMapData.GridWidth*KDMapData.GridWidth + KDMapData.GridHeight*KDMapData.GridHeight;
	let cand = null;
	let dd = dist;
	let entities = KDNearbyEnemies(x, y, 10).filter((en) => {return condition(en);});
	if (entities.length == 0) entities = KDMapData.Entities;
	for (let en of entities) {
		if (condition(en)) {
			dd = KDistEuclidean(x-en.x, y-en.y);
			if (dd < dist) {
				dist = dd;
				cand = en;
			}
		}
	}
	return cand;
}