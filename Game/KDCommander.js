"use strict";

// The commander is designed to direct enemies to spots in order to make the player suffer
// I mean... to promote tactics and fun gameplay

/**
 * Location and location/neighbors
 * @type {Record<string, {x: number, y: number, neighbors: number}>} */
let KDCommanderChokes = null;
/**
 * Enemy ID and role
 * @type {Map<number, string>} */
let KDCommanderRoles = new Map();

let KDUpdateChokes = true;

let KDCOMMANDERMAXNEIGHBORS = 2;

let KDChokeTiles = ['d', 'D', 'g', 's', 'S', 'H'];

/**
 * The Commander determines role assignments and orders enemies
 * @param {number} delta
 */
function KDCommanderUpdate(delta) {
	/** @type {KDCommanderOrderData} */
	let data = {
		delta: delta,
		aggressive: false,
		fleeThresh: 0.6,
		VavgWeight: 2,
		combat: KinkyDungeonFlags.get("PlayerCombat") > 0,
		invalidChoke: {},
	};

	//let start = performance.now();

	KinkyDungeonSendEvent("beforeCommanderTick", data);

	if (!KDCommanderChokes || KDUpdateChokes) {
		KDCommanderUpdateChokes(data);
	}

	KDCommanderUpdateRoles(data);
	KDCommanderUpdateOrders(data);

	//console.log(performance.now() - start);
}

/**
 * Updates the current chokes on the map
 * @param {KDCommanderOrderData} data
 */
function KDCommanderUpdateChokes(data) {

	KDMovable = new Map();
	KDSmartMovable = new Map();

	KDCommanderChokes = {};
	/** @type {Record<string, {x:number, y:number}>} */
	let chokes = {};
	// Identify potential chokes
	let hp, hn, vp, vn = false;
	for (let x = 1; x < KDMapData.GridWidth - 1; x++) {
		for (let y = 1; y < KDMapData.GridHeight - 1; y++) {
			if (
				KDChokeTiles.includes(KinkyDungeonMapGet(x, y)) // is door or grate
			) {
				chokes[x+','+y] = {x:x, y: y};
			}
			else {
				hp = !KDIsSmartMovable(x + 1, y);
				hn = !KDIsSmartMovable(x - 1, y);
				vp = !KDIsSmartMovable(x, y + 1);
				vn = !KDIsSmartMovable(x, y - 1);
				if (KDIsSmartMovable(x, y)
					&& (
						((!vp && !vn) && (
							(hp && hn)
							|| ((hp || !KDIsSmartMovable(x + 2, y))
								&& (hn || !KDIsSmartMovable(x - 1, y))
							)
							|| ((hp || !KDIsSmartMovable(x + 1, y))
								&& (hn || !KDIsSmartMovable(x - 2, y))
							)
						))
						||
						((!hp && !hn) && (
							(vp && vn)
							|| ((vp || !KDIsSmartMovable(x, y + 2))
								&& (vn || !KDIsSmartMovable(x, y - 1))
							)
							|| ((vp || !KDIsSmartMovable(x, y + 1))
								&& (vn || !KDIsSmartMovable(x, y - 2))
							)
						))
					))// is part of map grid border
				{
					chokes[x+','+y] = {x:x, y: y};
				}
			}
		}
	}
	// 2nd pass
	for (let x = 1; x < KDMapData.GridWidth - 1; x++) {
		for (let y = 1; y < KDMapData.GridHeight - 1; y++) {
			hp = !KDIsSmartMovable(x + 1, y) || chokes[(x+1)+','+(y)] != undefined;
			hn = !KDIsSmartMovable(x - 1, y) || chokes[(x-1)+','+(y)] != undefined;
			vp = !KDIsSmartMovable(x, y + 1) || chokes[(x)+','+(y+1)] != undefined;
			vn = !KDIsSmartMovable(x, y - 1) || chokes[(x)+','+(y-1)] != undefined;
			if (KDIsSmartMovable(x, y)
				&& (
					((!vp && !vn) && (
						(hp && hn)
					))
					||
					((!hp && !hn) && (
						(vp && vn)
					))
				))// is part of map grid border
			{
				chokes[x+','+y] = {x:x, y: y};
			}
		}
	}

	// Add any chokes with suitable geometry
	let check = (x, y) => {
		return chokes[x+','+y] != undefined
			|| !KDIsSmartMovable(x, y);
	};
	let h = false, v = false, ho = false, vo = false, n = 0;
	for (let choke of Object.values(chokes)) {
		v = (check(choke.x, choke.y + 1) && check(choke.x, choke.y - 1));
		h = (check(choke.x + 1, choke.y) && check(choke.x - 1, choke.y));
		vo = (KDIsSmartMovable(choke.x, choke.y + 2) && KDIsSmartMovable(choke.x, choke.y - 2));
		ho = (KDIsSmartMovable(choke.x + 2, choke.y) && KDIsSmartMovable(choke.x - 2, choke.y));
		if (
			(v && ho)
			|| (h && vo)
			|| KDChokeTiles.includes(KinkyDungeonMapGet(choke.x, choke.y))
		) {
			n = 0;
			// Count neighbors. Less is better
			if (h && chokes[(choke.x+1)+','+(choke.y)]) n += 1;
			if (h && chokes[(choke.x-1)+','+(choke.y)]) n += 1;
			if (v && chokes[(choke.x)+','+(choke.y+1)]) n += 1;
			if (v && chokes[(choke.x)+','+(choke.y-1)]) n += 1;
			if (n <= KDCOMMANDERMAXNEIGHBORS && KDPointWanderable(choke.x, choke.y))
				KDCommanderChokes[choke.x+','+choke.y] = {x: choke.x, y: choke.y, neighbors: n};
		}

	}

	KDUpdateChokes = false;
}
/**
 * Updates the current roles of enemies
 * @param {KDCommanderOrderData} data
 */
function KDCommanderUpdateRoles(data) {
	if (data.delta > 0) {
		for (let enemy of KDMapData.Entities) {
			// Set roles if there isn't one
			if (!KDCommanderRoles.get(enemy.id)) {
				data.aggressive = KinkyDungeonAggressive(enemy);
				let role = KDGetByWeight(KDGetOrdersList(enemy, data));
				if (role && KDCommanderOrders[role]) {
					KDCommanderOrders[role].apply(enemy, data);
					KDCommanderRoles.set(enemy.id, role);
				}
			}
		}
	}
}


/**
 * Updates the current roles of enemies
 * @param {KDCommanderOrderData} data
 */
function KDCommanderUpdateOrders(data) {
	if (data.delta > 0) {
		for (let order of Object.entries(KDCommanderOrders)) {
			order[1].global_before(data);
		}

		for (let id of KDCommanderRoles.entries()) {
			let enemy = KinkyDungeonFindID(id[0]);
			if (enemy) {
				data.aggressive = KinkyDungeonAggressive(enemy);
				let role = KDCommanderOrders[id[1]];
				if (role) {
					if (role.maintain(enemy, data)) {
						role.update(enemy, data);
					} else {
						KDCommanderRoles.delete(enemy.id);
						role.remove(enemy, data);
					}
				}
			}
		}

		for (let order of Object.entries(KDCommanderOrders)) {
			order[1].global_after(data);
		}
	}
}

/**
 * Updates the current roles of enemies
 * @param {entity} enemy
 * @param {KDCommanderOrderData} data
 */
function KDGetOrdersList(enemy, data) {
	/** @type {Record<string, number>} */
	let ret = {};
	for (let obj of Object.keys(KDCommanderOrders)) {
		if (KDCommanderOrders[obj].filter(enemy, data))
			ret[obj] = KDCommanderOrders[obj].weight(enemy, data);
	}
	return ret;
}

let KDAwareEnemies = 0;
let KDEnemiesTargetingPlayer = 0;

let KDAssaulters = 0;
let KDAssaulterList = [];
let KDMaxAssaulters = 3; // Only this many enemies will explicitly assault you

let KDStationedChokepoints = {};
let KDStationedChokepointsDist = {};
let KD_Avg_VX = 0;
let KD_Avg_VY = 0;

/**
 * @type {Record<string, KDCommanderOrder>}
 */
let KDCommanderOrders = {
	dummy: {
		// Dummy for setting global stuff
		filter: (enemy, data) => {return false;},
		weight: (enemy, data) => {return 0;},
		apply: (enemy, data) => {},

		// Role maintenance
		maintain: (enemy, data) => {return false;},
		remove: (enemy, data) => {},
		update: (enemy, data) => {},

		// Global role variables
		global_before: ( data) => {
			KDAwareEnemies = 0;
			KDEnemiesTargetingPlayer = 0;
			for (let enemy of KDMapData.Entities) {
				if (enemy.aware && KinkyDungeonAggressive(enemy)) {
					KDAwareEnemies += 1;
				}
				if (enemy.aware && KDEnemyHasFlag(enemy, "targ_player")) {
					KDEnemiesTargetingPlayer += 1;
				}
			}
			if (data.delta > 0 && KinkyDungeonPlayerEntity.lastx && KinkyDungeonPlayerEntity.lasty) {
				KD_Avg_VX = (data.VavgWeight * KD_Avg_VX + (KinkyDungeonPlayerEntity.x - KinkyDungeonPlayerEntity.lastx)) / (1 + data.VavgWeight);
				KD_Avg_VY = (data.VavgWeight  * KD_Avg_VY + (KinkyDungeonPlayerEntity.y - KinkyDungeonPlayerEntity.lasty)) / (1 + data.VavgWeight);
			}
		},
		global_after: (data) => {

		},
	},
	assault: {
		// Assault AI basically just beelines the player
		// Only a certain number will do this
		// Role assignment
		filter: (enemy, data) => {
			if (enemy.IntentAction || !data.aggressive || KDAssaulters > KDMaxAssaulters || !enemy.aware || !KDEnemyHasFlag(enemy, "targ_player")) return false;
			return (!KDAIType[KDGetAI(enemy)]
			|| (!KDAIType[KDGetAI(enemy)].guard && (!KDAIType[KDGetAI(enemy)].ambush || enemy.ambushtrigger)));
		},
		weight: (enemy, data) => {
			return Math.max(0, 100 - 35 * KDAssaulters - (KDEnemyRank(enemy) * 20));
		},
		apply: (enemy, data) => {
			if (enemy.aware)
				KinkyDungeonSendDialogue(enemy,
					TextGet("KinkyDungeonRemindJailChase" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "CommandAssault")
						.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy),
					7, 7, false, true);
		},

		// Role maintenance
		maintain: (enemy, data) => {
			if (KDAssaulters > KDMaxAssaulters && KDRandom() < 0.2) {
				if (!KDEnemyIsTemporary(enemy))
					return false;
			}
			return (!enemy.IntentAction && data.aggressive && enemy.aware && !KinkyDungeonIsDisabled(enemy));
		},
		remove: (enemy, data) => {
			if (!KDEnemyIsTemporary(enemy)) {
				KDAssaulters -= 1;
				if (KDAssaulterList.indexOf(enemy) > -1)
					KDAssaulterList.splice(KDAssaulterList.indexOf(enemy), 1);
			}
		},
		update: (enemy, data) => {
			// Increment the number of assaulters but only if the enemy isnt temporary
			if (!KDEnemyIsTemporary(enemy)) {
				KDAssaulters += 1;
				KDAssaulterList.push(enemy);
			}

			// AI control
			enemy.gx = KinkyDungeonPlayerEntity.x;
			enemy.gy = KinkyDungeonPlayerEntity.y;
		},

		// Global role variables
		global_before: ( data) => {
			// Reset the number of assaulters
			KDAssaulters = 0;
			KDMaxAssaulters = 3;
			KDAssaulterList = [];
		},
		global_after: (data) => {

		},
	},

	defend: {
		// Defends the assaulters
		// Role assignment
		filter: (enemy, data) => {
			if (KDAssaulters < 1) return false;
			if (enemy.IntentAction || !data.aggressive || enemy.vp == 0 || !KDEnemyHasFlag(enemy, "targ_player")) return false;
			return (!KDAIType[KDGetAI(enemy)]
			|| ((!KDAIType[KDGetAI(enemy)].ambush || enemy.ambushtrigger)));
		},
		weight: (enemy, data) => {
			return data.combat ? 24 : 1;
		},
		apply: (enemy, data) => {
			if (enemy.aware || enemy.vp > 0.1)
				KinkyDungeonSendDialogue(enemy,
					TextGet("KinkyDungeonRemindJailChase" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "CommandDefend")
						.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy),
					7, 7, false, true);
		},

		// Role maintenance
		maintain: (enemy, data) => {
			return (!enemy.IntentAction && data.aggressive && enemy.vp > 0 && !KinkyDungeonIsDisabled(enemy));
		},
		remove: (enemy, data) => {},
		update: (enemy, data) => {
			// AI control
			if (enemy.idle && KDAssaulterList.length > 0) {
				let target = KDAssaulterList[Math.floor(KDRandom() * KDAssaulterList.length)];
				if (target) {
					enemy.gx = target.x;
					enemy.gy = target.y;
				}
			}
			KinkyDungeonSetEnemyFlag(enemy, "wander", 5 + Math.round(5 * KDRandom()));
		},

		// Global role variables
		global_before: ( data) => {},
		global_after: (data) => {},
	},

	guard: {
		// Guard AI will try to station at a nearby chokepoint
		// Role assignment
		filter: (enemy, data) => {
			let aware = enemy.aware || enemy.vp > 0 || KDGameData.tickAlertTimer;
			if (!enemy.IntentAction && data.aggressive && aware && !KDEnemyHasFlag(enemy, "noGuard")) {
				let xx = KinkyDungeonPlayerEntity.x + KD_Avg_VX*4;
				let yy = KinkyDungeonPlayerEntity.y + KD_Avg_VY*4;
				let d1 = KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y);
				let dist = Math.min(
					d1,
					KDistChebyshev(enemy.x - xx, enemy.y - yy)
				);
				// Only if the enemy notices the player or has left their station, and is within a radius
				return (d1 > 1.5
					|| KDAssaulters >= KDMaxAssaulters
					|| enemy.hp > enemy.Enemy.maxhp * 0.6)
					&& (dist < 12 || enemy.aware || enemy.vp > 0)
					&& (enemy.aware || enemy.x != enemy.gxx || enemy.y != enemy.gyy)
					&& (!enemy.aware || !KDEnemyIsTemporary(enemy));
			}
			return false;
		},
		weight: (enemy, data) => {
			let w = 100;
			if (enemy.Enemy.tags.minor) w = 200;
			else if (enemy.Enemy.tags.elite) w = 40;
			else if (enemy.Enemy.tags.miniboss) w = 10;
			else if (enemy.Enemy.tags.stageBoss) w = 0;
			else if (enemy.Enemy.tags.boss) w = 1;
			return (enemy.Enemy.kite || enemy.Enemy.tags?.ranged || enemy.Enemy.tags?.caster) ? w : w*0.3;
		},
		apply: (enemy, data) => {
			if (enemy.aware)
				KinkyDungeonSendDialogue(enemy,
					TextGet("KinkyDungeonRemindJailChase" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "CommandBlock")
						.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy),
					7, 7, false, true);
		},

		// Role maintenance
		maintain: (enemy, data) => {
			if (!enemy.IntentAction && !(KDEnemyHasFlag(enemy, "noGuard") || KDEnemyHasFlag(enemy, "targ_ally") || KDEnemyHasFlag(enemy, "targ_npc"))
				&& (KDGameData.tickAlertTimer || KDEnemyHasFlag(enemy, "CMDR_stationed") || KDEnemyHasFlag(enemy, "CMDR_moveToChoke"))
				&& (!enemy.aware || !KDEnemyIsTemporary(enemy))) {
				let xx = KinkyDungeonPlayerEntity.x + KD_Avg_VX*2;
				let yy = KinkyDungeonPlayerEntity.y + KD_Avg_VY*2;
				let d1 = KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y);
				let dist = Math.min(
					d1,
					KDistChebyshev(enemy.x - xx, enemy.y - yy)
				);
				return (d1 > 1.5
					|| KDAssaulters >= KDMaxAssaulters
					|| enemy.hp > enemy.Enemy.maxhp * 0.6)
				&& (dist < 24 || enemy.aware || enemy.vp > 0);
			}
			return false;
		},
		remove: (enemy, data) => {
		},
		update: (enemy, data) => {
			let choke = null;
			let fc = KDEnemyHasFlag(enemy, "failChoke");
			let dist = fc ? 14 : 7;
			if (enemy.aware || enemy.vp > 0) dist += 10;
			let d = 0, dd = 0;
			let x = enemy.x;
			let y = enemy.y;

			let xx = KinkyDungeonPlayerEntity.x;
			let yy = KinkyDungeonPlayerEntity.y;

			let weight_Cdist = 0.7;
			let weight_Pdist = 0.4;

			let reset = false;
			let rank = KDEnemyRank(enemy);


			KinkyDungeonSetEnemyFlag(enemy, "dontChase", 2);
			KinkyDungeonSetEnemyFlag(enemy, "wander", 5 + Math.round(5 * KDRandom()));
			// Look for good chokes first, prioritizing them
			if (KDStationedChokepoints[enemy.gx + "," + enemy.gy] != enemy.id && enemy.idle && !KDEnemyHasFlag(enemy, "CMDR_stationed") && !KDEnemyHasFlag(enemy, "CMDR_moveToChoke")) {


				for (let neighbors = 1; neighbors <= KDCOMMANDERMAXNEIGHBORS; neighbors ++)
					for (let X = Math.floor(x - dist); X < Math.ceil(x + dist); X++)
						for (let Y = Math.floor(y - dist); Y < Math.ceil(y + dist); Y++) {
							if (KDCommanderChokes[X + "," + Y]
								&& KDCommanderChokes[X + "," + Y].neighbors <= neighbors
							) {
								if (!data.invalidChoke[X + ',' + Y]) {
									dd = KDistChebyshev(xx - X, yy - Y);
									if (dd < 8
										&& dd > 1) {
										d = weight_Cdist * KDistEuclidean(X - x, Y - y) + weight_Pdist * dd;
										if (d < dist && (
											!KDStationedChokepoints[X + "," + Y]
											|| KDStationedChokepoints[X + "," + Y] == enemy.id
											|| KDStationedChokepointsDist[X + "," + Y] > d - rank
										)) {
											choke = KDCommanderChokes[X + "," + Y];
											dist = d;
										}
									} else {
										data.invalidChoke[X + ',' + Y] = true;
									}
								}

							}
						}

				if (choke) {
					KDStationedChokepoints[choke.x + "," + choke.y] = enemy.id;
					KDStationedChokepointsDist[choke.x + "," + choke.y] =
						weight_Cdist * KDistEuclidean(choke.x - enemy.x, choke.y - enemy.y)
						+ weight_Pdist * KDistChebyshev(choke.x - xx, choke.y - yy) - rank;
					enemy.gx = choke.x;
					enemy.gy = choke.y;
					if (enemy.x == enemy.gx && enemy.y == enemy.gy) {
						let t = 5 + Math.round(9 * KDRandom());
						KinkyDungeonSetEnemyFlag(enemy, "CMDR_stationed", t);
						KinkyDungeonSetEnemyFlag(enemy, "allowpass", t);
					} else {
						KinkyDungeonSetEnemyFlag(enemy, "CMDR_moveToChoke", 1 + Math.round(3 * KDRandom()));
						//if (!KDEnemyHasFlag(enemy, "blocked"))
						//KinkyDungeonSetEnemyFlag(enemy, "blocked", Math.round(2 * KDRandom())); // To assist in pathing
					}
				} else {
					reset = true;
					if (!KDEnemyHasFlag(enemy, "failChoke")) {
						KinkyDungeonSetEnemyFlag(enemy, "failChoke", 3);
					} else {
						KinkyDungeonSetEnemyFlag(enemy, "noGuard", 10 + Math.round(9 * KDRandom()));
					}
				}
			} else if (KDCommanderChokes[enemy.gx + "," + enemy.gy]) {
				let ddd = weight_Cdist * KDistEuclidean(enemy.gx - enemy.x, enemy.gx - enemy.y)
					+ weight_Pdist * KDistChebyshev(enemy.gx - xx, enemy.gy - yy);

				if (!KDStationedChokepoints[enemy.gx + "," + enemy.gy] || ddd - rank < KDStationedChokepointsDist[enemy.gx + "," + enemy.gy]) {
					KDStationedChokepoints[enemy.gx + "," + enemy.gy] = enemy.id;
					KDStationedChokepointsDist[enemy.gx + "," + enemy.gy] = ddd - rank;
				} else {
					reset = true;
				}
			} else reset = true;

			if (reset) {
				enemy.gx = enemy.x;
				enemy.gy = enemy.y;
				//KinkyDungeonSetEnemyFlag(enemy, "allowpass",  + Math.round(3 * KDRandom()));
				KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
				KinkyDungeonSetEnemyFlag(enemy, "noGuard", 10 + Math.round(9 * KDRandom()));
			}

		},

		// Global role variables
		global_before: ( data) => {
			KDStationedChokepoints = {};
			KDStationedChokepointsDist = {};
			data.invalidChoke = {};
		},
		global_after: (data) => {
			if (KDAssaulters == 0) {
				for (let id of KDCommanderRoles.entries()) {
					if (id[1] == "guard" && KinkyDungeonFindID(id[0])?.aware) {
						KDCommanderRoles.delete(id[0]);
					}
				}
			}
		},
	},


	flee: {
		// Run away!!!
		// Role assignment
		filter: (enemy, data) => {
			if (!enemy.IntentAction
				&& data.aggressive
				&& !KDIsImmobile(enemy)
				&& (!KDAIType[KDGetAI(enemy)]
					|| ((!KDAIType[KDGetAI(enemy)].ambush || enemy.ambushtrigger)))
				&& (enemy.hp < enemy.Enemy.maxhp * data.fleeThresh || enemy.Enemy.tags?.minor)
				&& !KDEnemyHasFlag(enemy, "targ_player")) return true;
			return false;
		},
		weight: (enemy, data) => {
			return data.combat ? 100 : 15;
		},
		apply: (enemy, data) => {
			if (enemy.aware || enemy.vp > 0.1)
				KinkyDungeonSendDialogue(enemy,
					TextGet("KinkyDungeonRemindJailPlayBrat" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + Math.floor(KDRandom() * 3))
						.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy),
					6, 8, false, true);
		},

		// Role maintenance
		maintain: (enemy, data) => {
			return (!enemy.IntentAction && data.aggressive && enemy.vp > 0 && KDEnemyHasFlag(enemy, "targ_player"));
		},
		remove: (enemy, data) => {},
		update: (enemy, data) => {
			KinkyDungeonSetEnemyFlag(enemy, "runAway", 5 + Math.round(5 * KDRandom()));
		},

		// Global role variables
		global_before: ( data) => {},
		global_after: (data) => {},
	},
};