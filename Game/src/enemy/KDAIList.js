'use strict';

/**
 * @type {Record<string, AIType>}
 */
let KDAIType = {
	"wander": {
		init: (enemy, player, AIData) => {},
		beforemove: (enemy, player, AIData) => {return false;},
		chase: (enemy, player, AIData) => {return false;},
		trackvisibletarget: (enemy, player, AIData) => {return false;},
		persist: (enemy, player, AIData) => {return false;},
		move: (enemy, player, AIData) => {return true;},
		follower: (enemy, player, AIData) => {return true;},
		followsound: (enemy, player, AIData) => {return true;},
		wander_near: (enemy, player, AIData) => {return true;},
		wander_far: (enemy, player, AIData) => {return KDRandom() < 0.2;},
		resetguardposition: (enemy, player, AIData) => {return false;},
		attack: (enemy, player, AIData) => {return true;},
		spell: (enemy, player, AIData) => {return true;},
		aftermove: (enemy, player, AIData) => {return false;},
		wanderDelay_long: (enemy, AIData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (enemy, AIData) => {return 10 + Math.floor(KDRandom() * 25);},
	},
	"hunt": {
		init: (enemy, player, AIData) => {},
		beforemove: (enemy, player, AIData) => {return false;},
		chase: (enemy, player, AIData) => {return true;},
		trackvisibletarget: (enemy, player, AIData) => {return true;},
		persist: (enemy, player, AIData) => {return true;},
		move: (enemy, player, AIData) => {return true;},
		follower: (enemy, player, AIData) => {return true;},
		followsound: (enemy, player, AIData) => {return true;},
		wander_near: (enemy, player, AIData) => {return true;},
		wander_far: (enemy, player, AIData) => {return KDRandom() < 0.2;},
		resetguardposition: (enemy, player, AIData) => {return false;},
		attack: (enemy, player, AIData) => {return true;},
		spell: (enemy, player, AIData) => {return true;},
		aftermove: (enemy, player, AIData) => {return false;},
		wanderDelay_long: (enemy, AIData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (enemy, AIData) => {return 10 + Math.floor(KDRandom() * 25);},
		wanderfar_func: (enemy, player, AIData) => {
			let newPoint = (KDRandom() < 0.4 && (enemy.spawnX || enemy.spawnY)) ? KinkyDungeonGetNearbyPoint(enemy.spawnX, enemy.spawnY, true, undefined, false, false) : KinkyDungeonGetRandomEnemyPoint(false, false);
			if (!newPoint) newPoint = KinkyDungeonGetRandomEnemyPoint(false, false);
			if (newPoint) {
				enemy.gx = newPoint.x;
				enemy.gy = newPoint.y;
				return true;
			}
			return false;
		},
	},
	"huntshadow": {
		init: (enemy, player, AIData) => {},
		beforemove: (enemy, player, AIData) => {return false;},
		chase: (enemy, player, AIData) => {return true;},
		trackvisibletarget: (enemy, player, AIData) => {return true;},
		persist: (enemy, player, AIData) => {return true;},
		move: (enemy, player, AIData) => {return true;},
		follower: (enemy, player, AIData) => {return true;},
		followsound: (enemy, player, AIData) => {return true;},
		wander_near: (enemy, player, AIData) => {return true;},
		wander_far: (enemy, player, AIData) => {return KDRandom() < 0.4;},
		wandernear_func: (enemy, player, AIData) => {
			if (KinkyDungeonAlert && AIData.playerDist < Math.max(4, AIData.visionRadius)) {
				enemy.gx = KinkyDungeonPlayerEntity.x;
				enemy.gy = KinkyDungeonPlayerEntity.y;
			} else {
				// Short distance
				let ex = enemy.x;
				let ey = enemy.y;
				let cohesion = enemy.Enemy.cohesion ? enemy.Enemy.cohesion : 0.5;
				let masterCloseness = enemy.Enemy.cohesion ? enemy.Enemy.cohesion : 0.7;
				if (AIData.master && KDRandom() < masterCloseness) {
					ex = AIData.master.x;
					ey = AIData.master.y;
				} else if (KDRandom() < cohesion) {
					let minDist = enemy.Enemy.cohesionRange ? enemy.Enemy.cohesionRange : AIData.visionRadius;
					for (let e of KDMapData.Entities) {
						if (e == enemy) continue;
						if (['guard', 'ambush'].includes(KDGetAI(enemy))) continue;
						if (enemy.Enemy.clusterWith && !e.Enemy.tags[enemy.Enemy.clusterWith]) continue;
						if (KinkyDungeonTilesGet(e.x + "," + e.y) && KinkyDungeonTilesGet(e.x + "," + e.y).OL) continue;
						let dist = KDistEuclidean(e.x - enemy.x, e.y - enemy.y);
						if (dist < minDist) {
							minDist = dist;
							let ePoint = KinkyDungeonGetNearbyPoint(ex, ey, false);
							if (ePoint) {
								ex = ePoint.x;
								ey = ePoint.y;
							}
						}
					}
				}
				let newPoint = KinkyDungeonGetNearbyPoint(ex, ey, false, undefined, undefined, undefined, (x, y) => {
					return KinkyDungeonBrightnessGet(x, y) < 4;
				});
				if (newPoint && (KDGetFaction(enemy) != "Player" || !KinkyDungeonPointInCell(newPoint.x, newPoint.y))) {
					enemy.gx = newPoint.x;
					enemy.gy = newPoint.y;
					return true;
				}
			}

			return false;
		},
		wanderfar_func: (enemy, player, AIData) => {
			let newPoint = KinkyDungeonGetRandomEnemyPointCriteria((x, y) => {
				return KinkyDungeonBrightnessGet(x, y) < 4;
			}, false, enemy.tracking && KinkyDungeonHuntDownPlayer && KDGameData.PrisonerState != "parole" && KDGameData.PrisonerState != "jail");
			if (newPoint) {
				enemy.gx = newPoint.x;
				enemy.gy = newPoint.y;
				return true;
			}
			return false;
		},
		resetguardposition: (enemy, player, AIData) => {return false;},
		attack: (enemy, player, AIData) => {return true;},
		spell: (enemy, player, AIData) => {return true;},
		aftermove: (enemy, player, AIData) => {return false;},
		wanderDelay_long: (enemy, AIData) => {return 20 + Math.floor(KDRandom() * 15);},
		wanderDelay_short: (enemy, AIData) => {return 10 + Math.floor(KDRandom() * 10);},
	},
	"patrol": {
		init: (enemy, player, AIData) => {},
		beforemove: (enemy, player, AIData) => {return false;},
		chase: (enemy, player, AIData) => {return true;},
		trackvisibletarget: (enemy, player, AIData) => {return true;},
		persist: (enemy, player, AIData) => {return true;},
		move: (enemy, player, AIData) => {return true;},
		follower: (enemy, player, AIData) => {return true;},
		followsound: (enemy, player, AIData) => {return true;},
		wander_near: (enemy, player, AIData) => {return true;},
		wander_far: (enemy, player, AIData) => {return true;},
		resetguardposition: (enemy, player, AIData) => {return false;},
		attack: (enemy, player, AIData) => {return true;},
		spell: (enemy, player, AIData) => {return true;},
		aftermove: (enemy, player, AIData) => {
			if (!AIData.followPlayer && !KDEnemyHasFlag(enemy, "StayHere")) {
				let patrolChance = AIData.patrolChange ? 0.13 : 0.02;
				if (!enemy.patrolIndex) enemy.patrolIndex = KinkyDungeonNearestPatrolPoint(enemy.x, enemy.y);
				if (KDMapData.PatrolPoints[enemy.patrolIndex] && KDRandom() < patrolChance) {

					if (enemy.patrolIndex < KDMapData.PatrolPoints.length - 1) enemy.patrolIndex += 1;
					else enemy.patrolIndex = 0;

					let newPoint = KinkyDungeonGetPatrolPoint(enemy.patrolIndex, 1.4, AIData.MovableTiles);
					enemy.gx = newPoint.x;
					enemy.gy = newPoint.y;
				}
				return true;
			}
			return false;
		},
		wanderDelay_long: (enemy, AIData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (enemy, AIData) => {return 10 + Math.floor(KDRandom() * 20);},
	},
	"guard": {
		guard: true,
		init: (enemy, player, AIData) => {
			AIData.visionMod *= 0.7;},
		beforemove: (enemy, player, AIData) => {return false;},
		chase: (enemy, player, AIData) => {
			if (enemy.x == enemy.gxx && enemy.y == enemy.gyy) {
				if (KDistEuclidean(player.x-enemy.x, player.y-enemy.y) > 3.5) return false;
			}
			return true;
		},
		trackvisibletarget: (enemy, player, AIData) => {
			if (enemy.x == enemy.gxx && enemy.y == enemy.gyy) {
				if (KDistEuclidean(player.x-enemy.x, player.y-enemy.y) > 3.5) return false;
			}
			return true;
		},
		persist: (enemy, player, AIData) => {return false;},
		move: (enemy, player, AIData) => {return true;},
		follower: (enemy, player, AIData) => {return true;},
		followsound: (enemy, player, AIData) => {return true;},
		wander_near: (enemy, player, AIData) => {return false;},
		wander_far: (enemy, player, AIData) => {return false;},
		resetguardposition: (enemy, player, AIData) => {return true;},
		attack: (enemy, player, AIData) => {return true;},
		spell: (enemy, player, AIData) => {return true;},
		aftermove: (enemy, player, AIData) => {return false;},
		wanderDelay_long: (enemy, AIData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (enemy, AIData) => {return 15 + Math.floor(KDRandom() * 30);},
	},
	"looseguard": {
		guard: true,
		strictwander: true,
		init: (enemy, player, AIData) => {},
		beforemove: (enemy, player, AIData) => {return false;},
		chase: (enemy, player, AIData) => {return true;},
		trackvisibletarget: (enemy, player, AIData) => {
			if (enemy.x == enemy.gxx && enemy.y == enemy.gyy) {
				if (KDistEuclidean(player.x-enemy.x, player.y-enemy.y) > 3.5) return false;
			}
			return true;
		},
		persist: (enemy, player, AIData) => {return false;},
		move: (enemy, player, AIData) => {return true;},
		follower: (enemy, player, AIData) => {return true;},
		followsound: (enemy, player, AIData) => {return true;},
		wander_near: (enemy, player, AIData) => {return true;},
		wander_far: (enemy, player, AIData) => {return false;},
		resetguardposition: (enemy, player, AIData) => {return true;},
		attack: (enemy, player, AIData) => {return true;},
		spell: (enemy, player, AIData) => {return true;},
		aftermove: (enemy, player, AIData) => {return false;},
		wanderDelay_long: (enemy, AIData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (enemy, AIData) => {return 15 + Math.floor(KDRandom() * 30);},
	},
	"verylooseguard": {
		guard: true,
		strictwander: true,
		init: (enemy, player, AIData) => {},
		beforemove: (enemy, player, AIData) => {return false;},
		chase: (enemy, player, AIData) => {return true;},
		trackvisibletarget: (enemy, player, AIData) => {return true;},
		persist: (enemy, player, AIData) => {return false;},
		move: (enemy, player, AIData) => {return true;},
		follower: (enemy, player, AIData) => {return true;},
		followsound: (enemy, player, AIData) => {return true;},
		wander_near: (enemy, player, AIData) => {return true;},
		wander_far: (enemy, player, AIData) => {return true;},
		resetguardposition: (enemy, player, AIData) => {return true;},
		attack: (enemy, player, AIData) => {return true;},
		spell: (enemy, player, AIData) => {return true;},
		aftermove: (enemy, player, AIData) => {return false;},
		wanderDelay_long: (enemy, AIData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (enemy, AIData) => {return 15 + Math.floor(KDRandom() * 30);},
	},
	"ambush": {
		ambush: true,
		ambushtile: 'X',
		init: (enemy, player, AIData) => {},
		beforemove: (enemy, player, AIData) => {
			if (AIData.playerDist < 1.5) enemy.ambushtrigger = true;
			return false;
		},
		chase: (enemy, player, AIData) => {return enemy.ambushtrigger;},
		trackvisibletarget: (enemy, player, AIData) => {return enemy.ambushtrigger;},
		persist: (enemy, player, AIData) => {return enemy.ambushtrigger;},
		move: (enemy, player, AIData) => {return enemy.ambushtrigger || (enemy.Enemy.wanderTillSees && !AIData.canSeePlayer);},
		follower: (enemy, player, AIData) => {return true;},
		followsound: (enemy, player, AIData) => {return true;},
		wander_near: (enemy, player, AIData) => {return (enemy.Enemy.wanderTillSees && !AIData.canSeePlayer);},
		wander_far: (enemy, player, AIData) => {return false;},
		resetguardposition: (enemy, player, AIData) => {return true;},
		attack: (enemy, player, AIData) => {return enemy.ambushtrigger;},
		spell: (enemy, player, AIData) => {return enemy.ambushtrigger;},
		aftermove: (enemy, player, AIData) => {return false;},
		wanderDelay_long: (enemy, AIData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (enemy, AIData) => {return 10 + Math.floor(KDRandom() * 25);},
	},
};
