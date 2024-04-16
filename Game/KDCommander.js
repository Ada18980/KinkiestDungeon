"use strict";

// The commander is designed to direct enemies to spots in order to make the player suffer
// I mean... to promote tactics and fun gameplay

/**
 * Location and location/neighbors
 * @type {Record<string, {x: number, y: number, neighbors: number}>} */
let KDCommanderChokes = null;
let KDUpdateChokes = true;

/**
 * Who is helping the struggler
 * @type {Record<string, number>} */
let KDStruggleAssisters = {};


/**
 * Enemy ID and role
 * @type {Map<number, string>} */
let KDCommanderRoles = new Map();

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
		globalIgnore: KinkyDungeonFlags.get("PlayerDommed") && !KDPlayerDeservesPunishment(undefined, KinkyDungeonPlayerEntity),
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
					if (KDBoundEffects(enemy) < 4 && role.maintain(enemy, data)) {
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
			if (data.globalIgnore) return false;
			if (enemy.ignore) return false;
			if (enemy.IntentAction || !data.aggressive || KDAssaulters > KDMaxAssaulters || !enemy.aware || !KDEnemyHasFlag(enemy, "targ_player") || KDIsImmobile(enemy) || !KDHostile(enemy)) return false;
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
			if (enemy.ignore) return false;
			if (KDAssaulters > KDMaxAssaulters && KDRandom() < 0.2) {
				if (!KDEnemyIsTemporary(enemy))
					return false;
			}
			if (enemy.ignore) return false;
			return (!enemy.IntentAction && data.aggressive && enemy.aware && !KinkyDungeonIsDisabled(enemy) && KDHostile(enemy));
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
			if (data.globalIgnore) return false;
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
			return (!enemy.IntentAction && data.aggressive && KDHostile(enemy) && enemy.vp > 0 && !KinkyDungeonIsDisabled(enemy));
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
		// Also produces barricades
		// Role assignment
		filter: (enemy, data) => {
			let fort = KinkyDungeonStatsChoice.get("Fortify_Barricade") && KDGetMainFaction() && KDFactionRelation(KDGetFaction(enemy), KDGetMainFaction()) > 0.15;
			if (!fort && data.globalIgnore) return false;
			let aware = enemy.aware || enemy.vp > 0 || KDGameData.tickAlertTimer || fort;
			if (enemy.ignore || (!enemy.aware && KDFactionRelation(KDGetFaction(enemy), KDGetMainFaction())) < -0.09) return false;
			if (!enemy.IntentAction && data.aggressive && aware && !KDIsImmobile(enemy) && !KDEnemyHasFlag(enemy, "noGuard")) {
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
					&& (dist < 12 || enemy.aware || enemy.vp > 0 || fort)
					&& (!KDAIType[KDGetAI(enemy)].ambush || enemy.ambushtrigger)
					&& (enemy.aware || enemy.x != enemy.gxx || enemy.y != enemy.gyy || fort)
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
			if (enemy.ignore) return false;
			let fort = KinkyDungeonStatsChoice.get("Fortify_Barricade") && KDGetMainFaction() && KDFactionRelation(KDGetFaction(enemy), KDGetMainFaction()) > 0.15;
			if (!enemy.IntentAction && !(KDEnemyHasFlag(enemy, "noGuard") || KDEnemyHasFlag(enemy, "targ_ally") || KDEnemyHasFlag(enemy, "targ_npc"))
				&& (KDGameData.tickAlertTimer || fort || KDEnemyHasFlag(enemy, "CMDR_stationed") || KDEnemyHasFlag(enemy, "CMDR_moveToChoke"))
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
				&& enemy != KinkyDungeonLeashingEnemy()
				&& enemy != KinkyDungeonJailGuard()
				&& (dist < 24 || enemy.aware || enemy.vp > 0 || fort);
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

			// Place barricades
			if (enemy.Enemy.bound && KDBoundEffects(enemy) < 4 && (!enemy.Enemy.tags?.minor || KDRandom() < 0.25)) {
				//let placed = false;
				let cpOverride = KinkyDungeonStatsChoice.get("Fortify_Trap");
				let ltOverride = KinkyDungeonStatsChoice.get("Fortify_Barricade") && KDGetMainFaction() && KDFactionRelation(KDGetFaction(enemy), KDGetMainFaction()) > 0.15;
				for (let xxx = enemy.x - 1; xxx <= enemy.x + 1; xxx++) {
					for (let yyy = enemy.y - 1; yyy <= enemy.y + 1; yyy++) {
						if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(xxx, yyy))
							&& !KinkyDungeonVisionGet(xxx, yyy)) {
							let checkpoint = KDStationedChokepointsDist[xxx + ',' + yyy];
							let trap = !KDEffectTileTags(xxx, yyy).trap ? KDGetTrapSpell(enemy, xxx, yyy, checkpoint) : "";
							if (trap && KDRandom() < (checkpoint ? 0.5 : (cpOverride ? 0.01 : 0))) {
								//placed = true;
								KinkyDungeonCastSpell(xxx, yyy, KinkyDungeonFindSpell(trap, true), enemy, undefined);
							} else if (KinkyDungeonNoEnemy(xxx, yyy, true) && !(
								KinkyDungeonTilesGet(xxx+','+yyy)?.OL ||
								KinkyDungeonTilesGet(xxx+','+yyy)?.Jail
							)) {
								let barricade = KDGetBarricade(enemy, xxx, yyy, checkpoint);
								if (barricade) {
									let en = DialogueCreateEnemy(xxx, yyy, barricade);
									if (en) {
										//placed = true;
										en.faction = KDGetFaction(enemy);
										let lt = KDBarricades[barricade].lifetime;
										if (lt != undefined) {
											if (!ltOverride) {
												en.maxlifetime = 50;
												en.lifetime = 200;
											}
										} else if (lt < 9000) {
											en.maxlifetime = lt*0.25;
											en.lifetime = lt;
										}
									}
								}
							}

						}
					}
				}
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
				&& (enemy.hp < enemy.Enemy.maxhp * data.fleeThresh || (enemy.Enemy.tags?.minor && !KDEnemyHasFlag(enemy, "targ_player")))) return true;
			return false;
		},
		weight: (enemy, data) => {
			return data.combat ? 100 : 15;
		},
		apply: (enemy, data) => {
			if (enemy.aware || enemy.vp > 0.1) {
				KinkyDungeonSendDialogue(enemy,
					TextGet((KDHelpless(enemy) ? "KinkyDungeonRemindJailPlayHelpless" : "KinkyDungeonRemindJailPlayBrat") + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + Math.floor(KDRandom() * 3))
						.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy),
					6, 8, false, true);
				if (KDEnemyCanTalk(enemy) && (KDHelpless(enemy) || KDBoundEffects(enemy) > 3)) {
					if (!KDEnemyHasFlag(enemy, "shoutforhelp")) {
						KinkyDungeonMakeNoise(5 + KDEnemyRank(enemy), enemy.x, enemy.y);
						KinkyDungeonSetEnemyFlag(enemy, "shoutforhelp", Math.floor((10 - KDEnemyRank(enemy)) * (1 + KDRandom())));
					}
				}
			}
		},

		// Role maintenance
		maintain: (enemy, data) => {
			return (!enemy.IntentAction && data.aggressive && KDHostile(enemy) && enemy.vp > 0 && KDEnemyHasFlag(enemy, "targ_player"));
		},
		remove: (enemy, data) => {},
		update: (enemy, data) => {
			if (KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity, enemy)) KDBreakTether(KinkyDungeonPlayerEntity);
			KinkyDungeonSetEnemyFlag(enemy, "runAway", 5 + Math.round(5 * KDRandom()));
		},

		// Global role variables
		global_before: ( data) => {},
		global_after: (data) => {},
	},

	helpStruggle: {
		// Move toward struggling allies to help them
		filter: (enemy, data) => {
			if (!enemy.IntentAction
				&& KDIsHumanoid(enemy)
				&& (enemy.attackPoints < 1)
				&& !KDIsImmobile(enemy)
				&& KDBoundEffects(enemy) < 4
				&& (!enemy.aware || KDAssaulters >= KDMaxAssaulters)
				&& (!KDAIType[KDGetAI(enemy)]
					|| ((!KDAIType[KDGetAI(enemy)].ambush || enemy.ambushtrigger)))
				&& KDNearbyEnemies(enemy.x, enemy.y, enemy.Enemy.visionRadius/2 || 1.5, undefined, true, enemy).some((en) => {
					return en != enemy && KDBoundEffects(en) > 1 && !KDIsHopeless(en) && !KDHostile(enemy, en) && (!KDStruggleAssisters[en.id] || KDStruggleAssisters[en.id] == enemy.id)
					&& !KDEnemyHasFlag(en, "imprisoned")
					&& (!KDEntityHasBuffTags(en, "commandword") || enemy.Enemy.unlockCommandLevel > 0)
					;
				})
			) return true;
			return false;
		},
		weight: (enemy, data) => {
			return data.combat ? 50 : 400;
		},
		apply: (enemy, data) => {
			if ((enemy.aware || enemy.vp > 0.1) && KDRandom() < 0.15)
				KinkyDungeonSendDialogue(enemy,
					TextGet("KinkyDungeonRemindJailChase" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "CommandDefend")
						.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy),
					7, 7, false, true);

		},

		// Role maintenance
		maintain: (enemy, data) => {
			if (!KDNearbyEnemies(enemy.x, enemy.y, enemy.Enemy.visionRadius/2 || 1.5, undefined, true, enemy).some((en) => {
				return en != enemy && KDBoundEffects(en) > 1 && !KDIsHopeless(en) && !KDHostile(enemy, en) && (!KDStruggleAssisters[en.id] || KDStruggleAssisters[en.id] == enemy.id)
				&& !KDEnemyHasFlag(en, "imprisoned")
				&& (!KDEntityHasBuffTags(en, "commandword") || enemy.Enemy.unlockCommandLevel > 0)
				;
			})) return false;
			return (!enemy.IntentAction
				&& enemy != KinkyDungeonLeashingEnemy()
				&& enemy != KinkyDungeonJailGuard()
				&& (enemy.attackPoints < 1)
				&& (!enemy.aware || KDAssaulters >= KDMaxAssaulters)
				&& KDBoundEffects(enemy) < 4);
		},
		remove: (enemy, data) => {},
		update: (enemy, data) => {
			if (!KDEnemyHasFlag(enemy, "tickHS")) {
				let search = KDNearbyEnemies(enemy.x, enemy.y, 1.5, undefined, true, enemy).filter((en) => {
					return en != enemy && KDBoundEffects(en) > 1 && !KDIsHopeless(en) && !KDHostile(enemy, en) && (!KDStruggleAssisters[en.id] || KDStruggleAssisters[en.id] == enemy.id)
					&& !KDEnemyHasFlag(en, "imprisoned")
					&& (!KDEntityHasBuffTags(en, "commandword") || enemy.Enemy.unlockCommandLevel > 0)
					;
				});
				if (search.length == 0) search = KDNearbyEnemies(enemy.x, enemy.y, enemy.Enemy.visionRadius/2 || 1.5, undefined, true, enemy).filter((en) => {
					return en != enemy && KDBoundEffects(en) > 1 && !KDIsHopeless(en) && !KDHostile(enemy, en) && (!KDStruggleAssisters[en.id] || KDStruggleAssisters[en.id] == enemy.id)
					&& !KDEnemyHasFlag(en, "imprisoned")
					&& (!KDEntityHasBuffTags(en, "commandword") || enemy.Enemy.unlockCommandLevel > 0)
					;
				});
				if (search.length > 0) {
					let help = search[Math.floor(KDRandom() * search.length)];
					if (KDistChebyshev(help.x-enemy.x, help.y-enemy.y) < 1.5) {
						enemy.gx = enemy.x;
						enemy.gy = enemy.y;
					} else {
						let point = KinkyDungeonGetNearbyPoint(help.x, help.y, true, undefined, true);
						if (point) {
							enemy.gx = point.x;
							enemy.gy = point.y;
						} else {
							enemy.gx = help.x;
							enemy.gy = help.y;
						}
					}


					KDStruggleAssisters[help.id] = enemy.id;

					if (help.hp <= 0.52 && KDistChebyshev(enemy.x - help.x, enemy.y - help.y) < 1.5) help.hp = 0.6;
				}
				KinkyDungeonSetEnemyFlag(enemy, "tickHS", 5 + Math.round(5 * KDRandom()));
			}

		},

		// Global role variables
		global_before: ( data) => {
			let struggleList = JSON.parse(JSON.stringify(KDStruggleAssisters));
			KDStruggleAssisters = {};
			for (let en of KDMapData.Entities) {
				if (struggleList[en.id] != undefined && KDCommanderRoles.get(en.id) == 'helpStruggle') {
					KDStruggleAssisters[struggleList[en.id]] = en.id;
				}
			}
		},
		global_after: (data) => {},
	},
};

/**
 *
 * @param {entity} enemy
 * @param {number} x
 * @param {number} y
 * @param {boolean} checkpoint
 * @returns {string}
 */
function KDGetBarricade(enemy, x, y, checkpoint = false, type = []) {
	/** @type {Record<string, number>} */
	let traps = {};
	let max = 0;
	let lvl = KDGetEffLevel();
	if (!checkpoint) return ""; // TODO allow optional
	for (let obj of Object.keys(KDBarricades)) {
		if (lvl >= KDBarricades[obj].minlevel && KDBarricades[obj].filter(enemy, x, y, checkpoint, type)) {
			traps[obj] = KDBarricades[obj].weight(enemy, x, y, checkpoint, type);
			if (traps[obj] > max) max = traps[obj];
		}
	}
	// Cull low level stuff
	for (let t of Object.keys(traps)) {
		if (traps[t] < max*0.1) traps[t] = 0;
	}
	return KDGetByWeight(traps);
	/*if (enemy.Enemy.tags.robot || enemy.Enemy.tags.cyborg) return "BarricadeRobot";
	if (enemy.Enemy.unlockCommandLevel > 0) return "BarricadeMagic";
	if (enemy.Enemy.Security?.level_tech > 0 || KDRandom() < 0.1 * KDEnemyRank(enemy)) return "BarricadeConcrete";
	return "Barricade";*/
}

/**
 * @type {Record<string, KDBoobyTrap>}
 */
let KDBarricades = {
	"Barricade": {
		minlevel: 2,
		filter: (enemy, x, y, checkpoint, type) => {
			return !enemy.Enemy.tags.leather && !enemy.Enemy.tags.rope && !enemy.Enemy.tags.slime && !enemy.Enemy.tags.robot && !enemy.Enemy.tags.dollsmith && !enemy.Enemy.tags.cyborg;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 1;
		},
	},
	"BarricadeBlastDoor": {
		minlevel: 4,
		filter: (enemy, x, y, checkpoint, type) => {
			let altRoom = KDGetAltType(MiniGameKinkyDungeonLevel);
			let params = KinkyDungeonMapParams[altRoom?.useGenParams ? altRoom.useGenParams : (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];
			if (params?.enemyTags?.includes("oldrobot"))
				return true;
			return false;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 100;
		},
		lifetime: 9999,
	},
	"BarricadeRobot": {
		minlevel: 4,
		filter: (enemy, x, y, checkpoint, type) => {
			return (enemy.Enemy.tags.robot || enemy.Enemy.tags.cyborg) && !enemy.Enemy.tags.oldrobot;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 20;
		},
	},
	"BarricadeMagic": {
		minlevel: 3,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.mage;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 15;
		},
	},
	"BarricadeConcrete": {
		minlevel: 7,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.Security?.level_tech > 0 || (MiniGameKinkyDungeonLevel > 3 && KDRandom() < 0.1 * KDEnemyRank(enemy));
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 11;
		},
	},
	"BarricadeMetal": {
		minlevel: 3,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.metal;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 25;
		},
	},
	"ChaoticCrystal": {
		minlevel: 2,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.chaos;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 25;
		},
	},
	"GiantMushroom": {
		minlevel: 1,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.mushroom;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 25;
		},
	},
	"BarricadeFire": {
		minlevel: 4,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.fire;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 25;
		},
	},
	"BarricadeWater": {
		minlevel: 1,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.water;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 25;
		},
	},
	"BarricadeIce": {
		minlevel: 3,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.ice;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 25;
		},
	},
	"BarricadeEarth": {
		minlevel: 5,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.earth;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 25;
		},
	},
	"BarricadeElectric": {
		minlevel: 4,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.electric;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 25;
		},
	},
	"BarricadeAir": {
		minlevel: 1,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.air;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 25;
		},
	},
	"BarricadeVine": {
		minlevel: 1,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.nature;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 25;
		},
	},
	"BarricadeShadowMetal": {
		minlevel: 3,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.shadow || enemy.Enemy.tags?.demon;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 11;
		},
	},
	"BarricadeShadow": {
		minlevel: 2,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.shadow;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 25;
		},
	},
};

/**
 *
 * @param {entity} enemy
 * @param {number} x
 * @param {number} y
 * @param {boolean} checkpoint
 * @param {string[]} type
 * @returns {string}
 */
function KDGetTrapSpell(enemy, x, y, checkpoint = false, type = []) {
	/** @type {Record<string, number>} */
	let traps = {};
	let lvl = KDGetEffLevel();
	for (let obj of Object.keys(KDBoobyTraps)) {
		if (lvl >= KDBoobyTraps[obj].minlevel && KDBoobyTraps[obj].filter(enemy, x, y, checkpoint, type))
			traps[obj] = KDBoobyTraps[obj].weight(enemy, x, y, checkpoint, type);
	}
	return KDGetByWeight(traps);
}


/**
 * @type {Record<string, KDBoobyTrap>}
 */
let KDBoobyTraps = {
	"RuneTrap_Rope": {
		minlevel: 1,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.rope || (enemy.Enemy.unlockCommandLevel > 0 && enemy.Enemy.tags?.ropeRestraints);
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 15;
		},
	},
	"RuneTrap_Belt": {
		minlevel: 2,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.leather || (enemy.Enemy.unlockCommandLevel > 0 && enemy.Enemy.tags?.leatherRestraints);
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 15;
		},
	},
	"RuneTrap_Chain": {
		minlevel: 2,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.metal || enemy.Enemy.tags?.conjurer || (enemy.Enemy.unlockCommandLevel > 0 && enemy.Enemy.tags?.chainRestraints) || enemy.Enemy.tags?.magicchain;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 15;
		},
	},
	"RuneTrap_Ribbon": {
		minlevel: 3,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.ribbon || (enemy.Enemy.unlockCommandLevel > 0 && (enemy.Enemy.tags?.ribbonRestraints || enemy.Enemy.tags?.ribbonRestraintsHarsh));
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 15;
		},
	},
	"RuneTrap_Leather": {
		minlevel: 1,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.leather || enemy.Enemy.tags?.conjurer || (enemy.Enemy.unlockCommandLevel > 0 && enemy.Enemy.tags?.leatherRestraints && enemy.Enemy.tags?.antiMagic);
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 7;
		},
	},
	"RuneTrap_Latex": {
		minlevel: 1,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.latex || enemy.Enemy.tags?.conjurer || (enemy.Enemy.unlockCommandLevel > 0 && enemy.Enemy.tags?.latexRestraints);
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 7;
		},
	},
	"RuneTrap_Rubber": {
		minlevel: 1,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.latex || enemy.Enemy.tags?.slime || (enemy.Enemy.unlockCommandLevel > 0 && (enemy.Enemy.tags?.latexEncase || enemy.Enemy.tags?.latexEncaseRandom));
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 20;
		},
	},
	"RuneTrap_VacCube": {
		minlevel: 5,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.latex || (enemy.Enemy.tags?.latexEncase || enemy.Enemy.tags?.latexEncaseRandom);
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 7;
		},
	},
	"RuneTrap_Slime": {
		minlevel: 4,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.alchemist || enemy.Enemy.tags?.slime || (enemy.Enemy.unlockCommandLevel > 0 && (enemy.Enemy.tags?.slimeRestraints || enemy.Enemy.tags?.slimeRestraintsRandom));
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 20;
		},
	},
	"RuneTrap_Vine": {
		minlevel: 1,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.elf || (enemy.Enemy.unlockCommandLevel > 0 && (enemy.Enemy.tags?.nature || enemy.Enemy.tags?.vineRestraints));
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 20;
		},
	},
	"RuneTrap_Bubble": {
		minlevel: 1,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.water;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 20;
		},
	},
	"RuneTrap_SlimeBubble": {
		minlevel: 4,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.slime;
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return 20;
		},
	},
	"RuneTrap_LatexSphere": {
		minlevel: 5,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.latex && !KinkyDungeonStatsChoice.get("bubbleOptout");
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return KinkyDungeonStatsChoice.get("bubblePref") ? 50 : 5;
		},
	},
	"RuneTrap_LatexBall": {
		minlevel: 5,
		filter: (enemy, x, y, checkpoint, type) => {
			return enemy.Enemy.tags?.latex && !KinkyDungeonStatsChoice.get("bubbleOptout");
		},
		weight: (enemy, x, y, checkpoint, type) => {
			return KinkyDungeonStatsChoice.get("bubblePref") ? 50 : 5;
		},
	},


};