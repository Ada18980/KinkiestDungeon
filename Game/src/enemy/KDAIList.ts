'use strict';

let KDAIType: Record<string, AIType> = {
	"wander": {
		init: (_enemy, _player, _aiData) => {},
		beforemove: (_enemy, _player, _aiData) => {return false;},
		chase: (_enemy, _player, _aiData) => {return false;},
		trackvisibletarget: (_enemy, _player, _aiData) => {return true;},
		persist: (_enemy, _player, _aiData) => {return false;},
		move: (_enemy, _player, _aiData) => {return true;},
		follower: (_enemy, _player, _aiData) => {return true;},
		followsound: (_enemy, _player, _aiData) => {return true;},
		wander_near: (_enemy, _player, _aiData) => {return true;},
		wander_far: (_enemy, _player, _aiData) => {return KDRandom() < 0.2;},
		resetguardposition: (_enemy, _player, _aiData) => {return false;},
		attack: (_enemy, _player, _aiData) => {return true;},
		spell: (_enemy, _player, _aiData) => {return true;},
		aftermove: (_enemy, _player, _aiData) => {return false;},
		wanderDelay_long: (_enemy, _aiData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (_enemy, _aiData) => {return 10 + Math.floor(KDRandom() * 25);},
	},
	"hunt": {
		init: (_enemy, _player, _aiData) => {},
		beforemove: (_enemy, _player, _aiData) => {return false;},
		chase: (_enemy, _player, _aiData) => {return true;},
		trackvisibletarget: (_enemy, _player, _aiData) => {return true;},
		persist: (_enemy, _player, _aiData) => {return true;},
		move: (_enemy, _player, _aiData) => {return true;},
		follower: (_enemy, _player, _aiData) => {return true;},
		followsound: (_enemy, _player, _aiData) => {return true;},
		wander_near: (_enemy, _player, _aiData) => {return true;},
		wander_far: (_enemy, _player, _aiData) => {return KDRandom() < 0.2;},
		resetguardposition: (_enemy, _player, _aiData) => {return false;},
		attack: (_enemy, _player, _aiData) => {return true;},
		spell: (_enemy, _player, _aiData) => {return true;},
		aftermove: (_enemy, _player, _aiData) => {return false;},
		wanderDelay_long: (_enemy, _aiData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (_enemy, _aiData) => {return 10 + Math.floor(KDRandom() * 25);},
		wanderfar_func: (enemy, _player, _aiData) => {
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
		init: (_enemy, _player, _aiData) => {},
		beforemove: (_enemy, _player, _aiData) => {return false;},
		chase: (_enemy, _player, _aiData) => {return true;},
		trackvisibletarget: (_enemy, _player, _aiData) => {return true;},
		persist: (_enemy, _player, _aiData) => {return true;},
		move: (_enemy, _player, _aiData) => {return true;},
		follower: (_enemy, _player, _aiData) => {return true;},
		followsound: (_enemy, _player, _aiData) => {return true;},
		wander_near: (_enemy, _player, _aiData) => {return true;},
		wander_far: (_enemy, _player, _aiData) => {return KDRandom() < 0.4;},
		wandernear_func: (enemy, _player, aiData) => {
			if (KinkyDungeonAlert && aiData.playerDist < Math.max(4, aiData.visionRadius)) {
				enemy.gx = KinkyDungeonPlayerEntity.x;
				enemy.gy = KinkyDungeonPlayerEntity.y;
			} else {
				// Short distance
				let ex = enemy.x;
				let ey = enemy.y;
				let cohesion = enemy.Enemy.cohesion ? enemy.Enemy.cohesion : 0.5;
				let masterCloseness = enemy.Enemy.cohesion ? enemy.Enemy.cohesion : 0.7;
				if (aiData.master && KDRandom() < masterCloseness) {
					ex = aiData.master.x;
					ey = aiData.master.y;
				} else if (KDRandom() < cohesion) {
					let minDist = enemy.Enemy.cohesionRange ? enemy.Enemy.cohesionRange : aiData.visionRadius;
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
		wanderfar_func: (enemy, _player, _aiData) => {
			let newPoint = KinkyDungeonGetRandomEnemyPointCriteria((x: number, y: number) => {
				return KinkyDungeonBrightnessGet(x, y) < 4;
			}, false, enemy.tracking && KinkyDungeonHuntDownPlayer && KDGameData.PrisonerState != "parole" && KDGameData.PrisonerState != "jail");
			if (newPoint) {
				enemy.gx = newPoint.x;
				enemy.gy = newPoint.y;
				return true;
			}
			return false;
		},
		resetguardposition: (_enemy, _player, _aiData) => {return false;},
		attack: (_enemy, _player, _aiData) => {return true;},
		spell: (_enemy, _player, _aiData) => {return true;},
		aftermove: (_enemy, _player, _aiData) => {return false;},
		wanderDelay_long: (_enemy, _aiData) => {return 20 + Math.floor(KDRandom() * 15);},
		wanderDelay_short: (_enemy, _aiData) => {return 10 + Math.floor(KDRandom() * 10);},
	},
	"patrol": {
		init: (_enemy, _player, _aiData) => {},
		beforemove: (_enemy, _player, _aiData) => {return false;},
		chase: (_enemy, _player, _aiData) => {return true;},
		trackvisibletarget: (_enemy, _player, _aiData) => {return true;},
		persist: (_enemy, _player, _aiData) => {return true;},
		move: (_enemy, _player, _aiData) => {return true;},
		follower: (_enemy, _player, _aiData) => {return true;},
		followsound: (_enemy, _player, _aiData) => {return true;},
		wander_near: (_enemy, _player, _aiData) => {return true;},
		wander_far: (_enemy, _player, _aiData) => {return true;},
		resetguardposition: (_enemy, _player, _aiData) => {return false;},
		attack: (_enemy, _player, _aiData) => {return true;},
		spell: (_enemy, _player, _aiData) => {return true;},
		aftermove: (enemy, _player, aiData) => {
			if (!aiData.allyFollowPlayer && !KDEnemyHasFlag(enemy, "StayHere")) {
				let patrolChance = aiData.patrolChange ? 0.13 : 0.02;
				if (!enemy.patrolIndex) enemy.patrolIndex = KinkyDungeonNearestPatrolPoint(enemy.x, enemy.y);
				if (KDMapData.PatrolPoints[enemy.patrolIndex] && KDRandom() < patrolChance) {

					if (enemy.patrolIndex < KDMapData.PatrolPoints.length - 1) enemy.patrolIndex += 1;
					else enemy.patrolIndex = 0;

					let newPoint = KinkyDungeonGetPatrolPoint(enemy.patrolIndex, 1.4, aiData.MovableTiles);
					enemy.gx = newPoint.x;
					enemy.gy = newPoint.y;
				}
				return true;
			}
			return false;
		},
		wanderDelay_long: (_enemy, _aiData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (_enemy, _aiData) => {return 10 + Math.floor(KDRandom() * 20);},
	},
	"guard": {
		guard: true,
		init: (_enemy, _player, aiData) => {
			aiData.visionMod *= 0.7;},
		beforemove: (_enemy, _player, _aiData) => {return false;},
		chase: (enemy, player, _aiData) => {
			if (enemy.x == enemy.gxx && enemy.y == enemy.gyy) {
				if (KDistEuclidean(player.x-enemy.x, player.y-enemy.y) > 3.5) return false;
			}
			return true;
		},
		trackvisibletarget: (enemy, player, _aiData) => {
			if (enemy.x == enemy.gxx && enemy.y == enemy.gyy) {
				if (KDistEuclidean(player.x-enemy.x, player.y-enemy.y) > 3.5) return false;
			}
			return true;
		},
		persist: (_enemy, _player, _aiData) => {return false;},
		move: (_enemy, _player, _aiData) => {return true;},
		follower: (_enemy, _player, _aiData) => {return true;},
		followsound: (_enemy, _player, _aiData) => {return true;},
		wander_near: (_enemy, _player, _aiData) => {return false;},
		wander_far: (_enemy, _player, _aiData) => {return false;},
		resetguardposition: (_enemy, _player, _aiData) => {return true;},
		attack: (_enemy, _player, _aiData) => {return true;},
		spell: (_enemy, _player, _aiData) => {return true;},
		aftermove: (_enemy, _player, _aiData) => {return false;},
		wanderDelay_long: (_enemy, _aiData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (_enemy, _aiData) => {return 15 + Math.floor(KDRandom() * 30);},
	},
	"looseguard": {
		guard: true,
		strictwander: true,
		init: (_enemy, _player, _aiData) => {},
		beforemove: (_enemy, _player, _aiData) => {return false;},
		chase: (_enemy, _player, _aiData) => {return true;},
		trackvisibletarget: (enemy, player, _aiData) => {
			if (enemy.x == enemy.gxx && enemy.y == enemy.gyy) {
				if (KDistEuclidean(player.x-enemy.x, player.y-enemy.y) > 3.5) return false;
			}
			return true;
		},
		persist: (_enemy, _player, _aiData) => {return false;},
		move: (_enemy, _player, _aiData) => {return true;},
		follower: (_enemy, _player, _aiData) => {return true;},
		followsound: (_enemy, _player, _aiData) => {return true;},
		wander_near: (_enemy, _player, _aiData) => {return true;},
		wander_far: (_enemy, _player, _aiData) => {return false;},
		resetguardposition: (_enemy, _player, _aiData) => {return true;},
		attack: (_enemy, _player, _aiData) => {return true;},
		spell: (_enemy, _player, _aiData) => {return true;},
		aftermove: (_enemy, _player, _aiData) => {return false;},
		wanderDelay_long: (_enemy, _aiData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (_enemy, _aiData) => {return 15 + Math.floor(KDRandom() * 30);},
	},
	"verylooseguard": {
		guard: true,
		strictwander: true,
		init: (_enemy, _player, _aiData) => {},
		beforemove: (_enemy, _player, _aiData) => {return false;},
		chase: (_enemy, _player, _aiData) => {return true;},
		trackvisibletarget: (_enemy, _player, _aiData) => {return true;},
		persist: (_enemy, _player, _aiData) => {return false;},
		move: (_enemy, _player, _aiData) => {return true;},
		follower: (_enemy, _player, _aiData) => {return true;},
		followsound: (_enemy, _player, _aiData) => {return true;},
		wander_near: (_enemy, _player, _aiData) => {return true;},
		wander_far: (_enemy, _player, _aiData) => {return true;},
		resetguardposition: (_enemy, _player, _aiData) => {return true;},
		attack: (_enemy, _player, _aiData) => {return true;},
		spell: (_enemy, _player, _aiData) => {return true;},
		aftermove: (_enemy, _player, _aiData) => {return false;},
		wanderDelay_long: (_enemy, _aiData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (_enemy, _aiData) => {return 15 + Math.floor(KDRandom() * 30);},
	},
	"ambush": {
		ambush: true,
		ambushtile: 'X',
		init: (_enemy, _player, _aiData) => {},
		beforemove: (enemy, _player, aiData) => {
			if (aiData.playerDist < 1.5) enemy.ambushtrigger = true;
			return false;
		},
		chase: (enemy, _player, _aiData) => {return enemy.ambushtrigger;},
		trackvisibletarget: (enemy, _player, _aiData) => {return enemy.ambushtrigger;},
		persist: (enemy, _player, _aiData) => {return enemy.ambushtrigger;},
		move: (enemy, _player, aiData) => {return enemy.ambushtrigger || (enemy.Enemy.wanderTillSees && !aiData.canSeePlayer);},
		follower: (_enemy, _player, _aiData) => {return true;},
		followsound: (_enemy, _player, _aiData) => {return true;},
		wander_near: (enemy, _player, aiData) => {return (enemy.Enemy.wanderTillSees && !aiData.canSeePlayer);},
		wander_far: (_enemy, _player, _aiData) => {return false;},
		resetguardposition: (_enemy, _player, _aiData) => {return true;},
		attack: (enemy, _player, _aiData) => {return enemy.ambushtrigger;},
		spell: (enemy, _player, _aiData) => {return enemy.ambushtrigger;},
		aftermove: (_enemy, _player, _aiData) => {return false;},
		wanderDelay_long: (_enemy, _aiData) => {return 35 + Math.floor(KDRandom() * 35);},
		wanderDelay_short: (_enemy, _aiData) => {return 10 + Math.floor(KDRandom() * 25);},
	},
};
