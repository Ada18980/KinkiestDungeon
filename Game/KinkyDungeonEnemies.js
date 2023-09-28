"use strict";

let KDEnemiesCache = new Map();

let KinkyDungeonSummonCount = 2;
let KinkyDungeonEnemyAlertRadius = 2;
let KDStealthyMult = 0.75;
let KDConspicuousMult = 1.5;

let commentChance = 0.03;
let actionDialogueChance = 0.1;
let actionDialogueChanceIntense = 0.4;

/** Default noisiness level of moving enemies */
let KDDefaultEnemyMoveSound = 6;
let KDDefaultEnemyAttackSound = 10;
let KDDefaultEnemyCastSound = 8;
let KDDefaultEnemyIdleSound = 2;
let KDDefaultEnemyAlertSound = 5;

let KDEventableAttackTypes = [
	"Lock",
	"Will",
	"Bind",
	"Effect",
	"Stun",
	"Blind",
	"Slow",
];


/** @type {Record<string, (entity) => boolean>} */
let KDAnims = {
	breathing: (Entity) => {
		if (!Entity.animTime) Entity.animTime = CommonTime() + Math.floor(KDRandom() * 1000);
		Entity.scaleY *= (1 - 0.02*Math.sin(Math.PI + 2 * Math.PI * (CommonTime() - Entity.animTime)/(KDBreathAnimTime)));
		Entity.scaleX *= (1 - 0.015*Math.sin(2 * Math.PI * (CommonTime() - Entity.animTime)/(KDBreathAnimTime)));
		Entity.offY += -0.007*Math.sin(2 * Math.PI * (CommonTime() - Entity.animTime)/(KDBreathAnimTime));
		return true;
	},
	squishy: (Entity) => {
		if (!Entity.animTime) Entity.animTime = CommonTime() + Math.floor(KDRandom() * 1000);
		Entity.scaleY *= (1 - 0.15*Math.sin(Math.PI + 2 * Math.PI * (CommonTime() - Entity.animTime)/(KDSquishyAnimTime)));
		Entity.scaleX *= (1 - 0.1*Math.sin(2 * Math.PI * (CommonTime() - Entity.animTime)/(KDSquishyAnimTime)));
		Entity.offY += -0.05*Math.sin(2 * Math.PI * (CommonTime() - Entity.animTime)/(KDSquishyAnimTime));
		return true;
	},
	squishyAmbush: (Entity) => {
		if (!Entity.ambushtrigger) return false;
		if (!Entity.animTime) Entity.animTime = CommonTime() + Math.floor(KDRandom() * 1000);
		Entity.scaleY *= (1 - 0.15*Math.sin(Math.PI + 2 * Math.PI * (CommonTime() - Entity.animTime)/(KDSquishyAnimTime)));
		Entity.scaleX *= (1 - 0.1*Math.sin(2 * Math.PI * (CommonTime() - Entity.animTime)/(KDSquishyAnimTime)));
		Entity.offY += -0.05*Math.sin(2 * Math.PI * (CommonTime() - Entity.animTime)/(KDSquishyAnimTime));
		return true;
	},
};


/**
 * Refreshes the enemies map
 */
function KinkyDungeonRefreshEnemiesCache() {
	KDEnemiesCache = new Map();
	for (let enemy of KinkyDungeonEnemies) {
		KDEnemiesCache.set(enemy.name, enemy);
	}
}


/**
 *
 * @param {string} Name
 * @returns {enemy}
 */
function KinkyDungeonGetEnemyByName(Name) {
	if (KDEnemiesCache.size > 0) {
		return KDEnemiesCache.get(Name);
	} else {
		KinkyDungeonRefreshEnemiesCache();
		return KDEnemiesCache.get(Name);
	}
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string[]} [filter]
 * @param {boolean} [any]
 * @param {boolean} [qualified] - Exclude jails where the player doesnt meet conditions
 * @returns {KDJailPoint}
 */
function KinkyDungeonNearestJailPoint(x, y, filter, any, qualified) {
	let filt = filter ? filter : ["jail", "dropoff"];
	let dist = 100000;
	let point = null;
	let leash = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
	let furniture = KinkyDungeonGetRestraintItem("ItemDevices");
	for (let p of KDMapData.JailPoints) {
		if (!any && p.type && !filt.includes(p.type)) continue;
		if (qualified && p.requireLeash && !leash) continue;
		if (qualified && p.requireFurniture && !furniture) continue;
		let d = Math.max(Math.abs(x - p.x), Math.abs(y - p.y));
		if (d < dist) {
			dist = d;
			point = p;
		}
	}

	return point;
}

function KDLockNearbyJailDoors(x, y) {
	let jail = KinkyDungeonNearestJailPoint(x, y);
	if (jail) {
		let radius = jail.radius + 1;
		if (radius)
			for (let X = x - Math.ceil(radius); X <= x + Math.ceil(radius); X++)
				for (let Y = y - Math.ceil(radius); Y <= y + Math.ceil(radius); Y++)
					if (KinkyDungeonTilesGet(X + ',' + Y)?.Jail && KinkyDungeonMapGet(X, Y) == 'd') {
						KinkyDungeonMapSet(X, Y, 'D');
						KinkyDungeonTilesGet(X + ',' + Y).Lock = "Red";
					}
	}
}

/**
 *
 * @param {string[]} [filter]
 * @param {{x: number, y: number, type: string, radius: number}[]} [exclude]
 * @returns {{x: number, y: number, type: string, radius: number}}
 */
function KinkyDungeonRandomJailPoint(filter, exclude) {
	let filt = filter ? filter : ["jail"];
	let points = [];
	for (let p of KDMapData.JailPoints) {
		if (p.type && !filt.includes(p.type)) continue;
		if (!exclude || exclude.includes(p)) continue;
		points.push(p);
	}
	if (points.length > 0) return points[Math.floor(KDRandom() * points.length)];
	return null;
}

function KinkyDungeonNearestPatrolPoint(x, y) {
	let dist = 100000;
	let point = -1;
	for (let p of KDMapData.PatrolPoints) {
		let d = Math.max(Math.abs(x - p.x), Math.abs(y - p.y));
		if (d < dist) {
			dist = d;
			point = KDMapData.PatrolPoints.indexOf(p);
		}
	}

	return point;
}

/** @type {Map<string, number>} */
let KinkyDungeonFlags = new Map();

/**
 *
 * @param {string} Flag
 * @param {number} Duration - In turns
 * @param {number} [Floors] - Optional, makes this flag expire in this many floors
 */
function KinkyDungeonSetFlag(Flag, Duration, Floors) {
	if (!KinkyDungeonFlags.get(Flag) || Duration <= 0 || (KinkyDungeonFlags.get(Flag) > 0 && KinkyDungeonFlags.get(Flag) < Duration)) {
		KinkyDungeonFlags.set(Flag, Duration);
		if (Duration == 0) {
			KinkyDungeonFlags.delete(Flag);
		} else if (Floors != undefined) {
			if (!KDGameData.TempFlagFloorTicks)
				KDGameData.TempFlagFloorTicks = {};
			// handle optional floor count flag setting logic
			if (!KDGameData.TempFlagFloorTicks[Flag] || KDGameData.TempFlagFloorTicks[Flag] < Floors) {
				KDGameData.TempFlagFloorTicks[Flag] = Floors;
			}
			if (Floors === 0) {
				delete KDGameData.TempFlagFloorTicks[Flag];
			}
		}
	}
}

function KinkyDungeonUpdateFlags(delta) {
	for (let f of KinkyDungeonFlags.keys()) {
		if (KinkyDungeonFlags.get(f) != -1) {
			if (KinkyDungeonFlags.get(f) > 0) KinkyDungeonFlags.set(f, KinkyDungeonFlags.get(f) - delta);
			if (KinkyDungeonFlags.get(f) <= 0 && KinkyDungeonFlags.get(f) != -1) KinkyDungeonFlags.delete(f);
		}
	}
}

function KinkyDungeonGetPatrolPoint(index, radius, Tiles) {
	let p = KDMapData.PatrolPoints[index];
	let t = Tiles ? Tiles : KinkyDungeonMovableTilesEnemy;
	if (p) {
		for (let i = 0; i < 8; i++) {
			let XX = p.x + Math.round(KDRandom() * 2 * radius - radius);
			let YY = p.y + Math.round(KDRandom() * 2 * radius - radius);
			if (t.includes(KinkyDungeonMapGet(XX, YY)) && (KDPointWanderable(XX, YY))) {
				return {x: XX, y: YY};
			}
		}
	}
	return p;
}

/**
 *
 * @param {entity} enemy
 * @param {number} [override]
 * @returns {number}
 */
function KDGetBindAmp(enemy, override) {
	if (!KDAllied(enemy)) return override != undefined ? override : KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BindAmp"));
	return 1;
}

function KDHelpless(enemy) {
	return enemy && !enemy.player && (enemy.hp <= enemy.Enemy.maxhp * 0.1 || enemy.hp <= 0.52 || enemy.boundLevel > 10 * enemy.Enemy.maxhp) && KDBoundEffects(enemy) > 3;
}

function KinkyDungeonNearestPlayer(enemy, requireVision, decoy, visionRadius, AI_Data) {
	if (enemy && enemy.Enemy && !visionRadius) {
		visionRadius = enemy.Enemy.visionRadius;
		if (enemy.blind && !enemy.aware) visionRadius = 1.5;
	}
	if (decoy) {
		let pdist = Math.sqrt((KinkyDungeonPlayerEntity.x - enemy.x)*(KinkyDungeonPlayerEntity.x - enemy.x)
			+ (KinkyDungeonPlayerEntity.y - enemy.y)*(KinkyDungeonPlayerEntity.y - enemy.y));
		let nearestVisible = undefined;

		if (enemy.Enemy.focusPlayer && KinkyDungeonCheckLOS(enemy, KinkyDungeonPlayerEntity, pdist, visionRadius, false, false) && !KinkyDungeonCheckPath(enemy.x, enemy.y, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, false, true)) pdist = 1.5;
		let hostile = KDHostile(enemy);
		let nearestDistance = (hostile) ? pdist - 0.1 : 100000;
		if (KDGetFaction(enemy) == "Player"
			&& (KDEnemyHasFlag(enemy, "NoFollow")
			|| KDEnemyHasFlag(enemy, "StayHere")))
			nearestDistance = 100000;

		if ((enemy.Enemy.visionRadius || enemy.Enemy.blindSight) && !(enemy.Enemy.noAttack && !enemy.Enemy.spells)) {
			let ent = KDNearbyEnemies(enemy.x, enemy.y, Math.min(nearestDistance, visionRadius));
			for (let e of ent) {
				if (e == enemy) continue;
				if (KDHelpless(e)) continue;
				if (KDGetFaction(e) == "Natural") continue;
				if (enemy.Enemy.noTargetSilenced && e.silence > 0) continue;
				if ((e.Enemy && !e.Enemy.noAttack && KDHostile(enemy, e))) {
					let dist = Math.sqrt((e.x - enemy.x)*(e.x - enemy.x)
						+ (e.y - enemy.y)*(e.y - enemy.y));
					let pdist_enemy =
						(KDGetFaction(enemy) == "Player"
						&& !KDEnemyHasFlag(enemy, "NoFollow")
						&& !KDEnemyHasFlag(enemy, "StayHere")
						&& (enemy.Enemy.allied || (!KDGameData.PrisonerState || KDGameData.PrisonerState == "chase")))
						? KDistChebyshev(e.x - KinkyDungeonPlayerEntity.x, e.y - KinkyDungeonPlayerEntity.y) :
						-1;
					if (pdist_enemy > 0 && pdist_enemy < 1.5 && hostile) KinkyDungeonSetFlag("AIHelpPlayer", 4);
					if (pdist_enemy > 0 && KinkyDungeonFlags.get("AIHelpPlayer") && dist > 2.5) {
						if (pdist_enemy > 2.5) dist += 2;
						else dist = Math.max(1.01 + dist/4, dist/3);
					}
					if (dist <= nearestDistance && (pdist_enemy <= 0 ||
						((KinkyDungeonVisionGet(e.x, e.y) > 0 || pdist_enemy < 5 || e == KinkyDungeonJailGuard() || enemy == KinkyDungeonJailGuard()) && (pdist_enemy < 8 || enemy.Enemy.followRange > 1))
					)) {
						if (KinkyDungeonCheckLOS(enemy, e, dist, visionRadius, true, true)
							&& (KinkyDungeonVisionGet(e.x, e.y) > 0 || KinkyDungeonVisionGet(enemy.x, enemy.y) > 0 || e.aware || enemy.aware || e == KinkyDungeonJailGuard() || enemy == KinkyDungeonJailGuard())) {
							if (enemy.rage || !e.Enemy.lowpriority
									|| (!KinkyDungeonCheckLOS(enemy, KinkyDungeonPlayerEntity, pdist, visionRadius, true, true) || !KinkyDungeonCheckPath(enemy.x, enemy.y, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, false, true))) {
								nearestVisible = e;
								nearestDistance = dist;
							}
						}
					}
				}
			}
		}
		if (nearestVisible) return nearestVisible;
	}
	return KinkyDungeonPlayerEntity;
}

function KinkyDungeonInDanger() {
	for (let b of KDMapData.Bullets) {
		let bdist = 1.5;
		if (b.vx && b.vy) bdist = 2*Math.sqrt(b.vx*b.vx + b.vy*b.vy);
		if (KinkyDungeonVisionGet(Math.round(b.x), Math.round(b.y)) > 0 && Math.max(Math.abs(b.x - KinkyDungeonPlayerEntity.x), Math.abs(b.y - KinkyDungeonPlayerEntity.y)) < bdist) {
			return true;
		}
	}
	for (let enemy of KDMapData.Entities) {
		let playerDist = Math.max(Math.abs(enemy.x - KinkyDungeonPlayerEntity.x), Math.abs(enemy.y - KinkyDungeonPlayerEntity.y));
		if (KinkyDungeonVisionGet(enemy.x, enemy.y) > 0) {
			if (((enemy.revealed && !enemy.Enemy.noReveal) || !enemy.Enemy.stealth || KinkyDungeonSeeAll || playerDist <= enemy.Enemy.stealth + 0.1) && !(KinkyDungeonGetBuffedStat(enemy.buffs, "Sneak") > 0 && playerDist > 1.5)) {
				if (((!KDHelpless(enemy) && KinkyDungeonAggressive(enemy)) || playerDist < 1.5)) {
					if ((KDHostile(enemy) || enemy.rage) && KinkyDungeonVisionGet(enemy.x, enemy.y) > 0 &&
					(!KDAmbushAI(enemy) || enemy.ambushtrigger)) {
						return true;
					}
					if ((KDHostile(enemy) || enemy.rage) && KinkyDungeonVisionGet(enemy.x, enemy.y) > 0 &&
					(!KDAmbushAI(enemy) || enemy.ambushtrigger)) {
						return true;
					}
				}
			}
		}
	}

	return false;
}

function KDAmbushAI(enemy) {
	let AI = enemy.AI ? enemy.AI : enemy.Enemy.AI;
	let AIType = KDAIType[AI];
	if (AIType) return AIType.ambush;
	return false;
}

let KinkyDungeonFastMoveSuppress = false;
let KinkyDungeonFastStruggleSuppress = false;
function KinkyDungeonDrawEnemies(canvasOffsetX, canvasOffsetY, CamX, CamY) {
	let reenabled = false;
	let reenabled2 = false;
	if (KinkyDungeonFastMoveSuppress) { //&& !CommonIsMobile
		KinkyDungeonFastMove = true;
		KinkyDungeonFastMovePath = [];
		KinkyDungeonFastMoveSuppress = false;
		reenabled = true;
	}
	if (KinkyDungeonFastStruggleSuppress) {
		KinkyDungeonFastStruggle = true;
		KinkyDungeonFastStruggleType = "";
		KinkyDungeonFastStruggleGroup = "";
		KinkyDungeonFastStruggleSuppress = false;
		reenabled2 = true;
	}
	for (let b of KDMapData.Bullets) {
		let bdist = 1.5;
		if (b.vx && b.vy) bdist = 2*Math.sqrt(b.vx*b.vx + b.vy*b.vy);
		if (KinkyDungeonVisionGet(Math.round(b.x), Math.round(b.y)) > 0 && Math.max(Math.abs(b.x - KinkyDungeonPlayerEntity.x), Math.abs(b.y - KinkyDungeonPlayerEntity.y)) < bdist) {
			if (KinkyDungeonFastStruggle) {
				if (KinkyDungeonFastStruggle && !KinkyDungeonFastStruggleSuppress && !reenabled2)
					KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Click.ogg");
				KinkyDungeonFastStruggle = false;
				KinkyDungeonFastStruggleGroup = "";
				KinkyDungeonFastStruggleType = "";
				reenabled2 = false;
				//if (!CommonIsMobile)
				KinkyDungeonFastStruggleSuppress = true;
			}
			if (KinkyDungeonFastMove) {
				if (KinkyDungeonFastMove && !KinkyDungeonFastMoveSuppress && !reenabled)
					KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Click.ogg");
				KinkyDungeonFastMove = false;
				KinkyDungeonFastMovePath = [];
				reenabled = false;
				//if (!CommonIsMobile)
				KinkyDungeonFastMoveSuppress = true;
			}
		}
	}

	for (let enemy of KDMapData.Entities) {
		let sprite = enemy.Enemy.name;
		KinkyDungeonUpdateVisualPosition(enemy, KinkyDungeonDrawDelta);
		let tx = enemy.visual_x;
		let ty = enemy.visual_y;
		let playerDist = KDistChebyshev((enemy.x - KinkyDungeonPlayerEntity.x), (enemy.y - KinkyDungeonPlayerEntity.y));
		if (enemy.x >= CamX && enemy.y >= CamY && enemy.x < CamX + KinkyDungeonGridWidthDisplay && enemy.y < CamY + KinkyDungeonGridHeightDisplay
			&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0 && KDCanSeeEnemy(enemy, playerDist)) {
			if (((enemy.revealed && !enemy.Enemy.noReveal) || !enemy.Enemy.stealth || KDHelpless(enemy) || KinkyDungeonSeeAll || playerDist <= enemy.Enemy.stealth + 0.1) && !(KinkyDungeonGetBuffedStat(enemy.buffs, "Sneak", true) > 0 && playerDist > 1.5)) {
				enemy.revealed = true;
				if (((KinkyDungeonAggressive(enemy) && playerDist <= 6.9) || (playerDist < 1.5 && enemy.playWithPlayer))) {
					if ((KDHostile(enemy) || enemy.rage) && KinkyDungeonVisionGet(enemy.x, enemy.y) > 0 && KinkyDungeonFastMove &&
						!enemy.Enemy.tags.harmless &&
						(!KDAmbushAI(enemy) || enemy.ambushtrigger)) {
						if (KinkyDungeonFastMove && !KinkyDungeonFastMoveSuppress && !reenabled)
							KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Click.ogg");
						KinkyDungeonFastMove = false;
						KinkyDungeonFastMovePath = [];
						reenabled = false;
						if (!CommonIsMobile)
							KinkyDungeonFastMoveSuppress = true;
					}
					if ((KDHostile(enemy) || enemy.rage) && KinkyDungeonVisionGet(enemy.x, enemy.y) > 0 && KinkyDungeonFastStruggle &&
						!enemy.Enemy.tags.harmless &&
						(!KDAmbushAI(enemy) || enemy.ambushtrigger)) {
						if (KinkyDungeonFastStruggle && !KinkyDungeonFastStruggleSuppress && !reenabled2)
							KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Click.ogg");
						KinkyDungeonFastStruggle = false;
						KinkyDungeonFastStruggleGroup = "";
						KinkyDungeonFastStruggleType = "";
						reenabled2 = false;
						if (!CommonIsMobile)
							KinkyDungeonFastStruggleSuppress = true;
					}
				}
				if (enemy.buffs) {
					let aura_scale = 0;
					let aura_scale_max = 0;
					for (let b of Object.values(enemy.buffs)) {
						if (b && b.aura && b.duration > 0) {
							aura_scale_max += 1;
						}
					}
					if (aura_scale_max > 0) {
						let buffs = Object.values(enemy.buffs);
						buffs = buffs.sort((a, b) => {return b.duration - a.duration;});
						for (let b of buffs) {
							if (b && b.aura && b.duration > 0 && !(b.aurasprite == "Null") && (!b.hideHelpless || !KDHelpless(enemy))) {
								aura_scale += 1/aura_scale_max;
								let s = aura_scale;
								if (b.noAuraColor) {
									KDDraw(kdenemyboard, kdpixisprites, enemy.id + "," + b.id, KinkyDungeonRootDirectory + "Aura/" + (b.aurasprite ? b.aurasprite : "Aura") + ".png",
										(tx - CamX)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s + KinkyDungeonGridSizeDisplay * (1 + s) * 0.167,
										(ty - CamY)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s + KinkyDungeonGridSizeDisplay * (1 + s) * 0.167,
										KinkyDungeonSpriteSize * (1 + s) * 0.67,
										KinkyDungeonSpriteSize * (1 + s) * 0.67, undefined, {
											zIndex: 2,
										});
								} else {
									KDDraw(kdenemyboard, kdpixisprites, enemy.id + "," + b.id, KinkyDungeonRootDirectory + "Aura/" + (b.aurasprite ? b.aurasprite : "Aura") + ".png",
										(tx - CamX)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s + KinkyDungeonGridSizeDisplay * (1 + s) * 0.167,
										(ty - CamY)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s + KinkyDungeonGridSizeDisplay * (1 + s) * 0.167,
										KinkyDungeonSpriteSize * (1 + s) * 0.67,
										KinkyDungeonSpriteSize * (1 + s) * 0.67,
										undefined, {
											tint: string2hex(b.aura),
											zIndex: 2,
										});
								}

							}
						}
					}
				}

				let buffSprite = "";
				let buffSpritePower = 0;
				if (enemy.buffs) {
					for (let b of Object.values(enemy.buffs)) {
						if (b.replaceSpriteBound && KDBoundEffects(enemy) > 3 && (b.replacePower || b.power > buffSpritePower)) {
							buffSpritePower = b.replacePower || b.power;
							buffSprite = b.replaceSpriteBound;
						} else if (b.replaceSprite && (b.replacePower || b.power > buffSpritePower)) {
							buffSpritePower = b.replacePower || b.power;
							buffSprite = b.replaceSprite;
						}
					}
				}

				if (buffSprite) sprite = buffSprite;

				if (!enemy.Enemy.bound || (KDBoundEffects(enemy) < 4 && !KDHelpless(enemy))) {
					let sp = sprite;
					if (!enemy.ambushtrigger && enemy.Enemy.GFX?.AmbushSprite && KDAmbushAI(enemy)) sp = enemy.Enemy.GFX.AmbushSprite;
					else if (enemy.CustomSprite && !buffSprite) sp = "CustomSprite/" + enemy.CustomSprite;
					let w = (enemy.Enemy.GFX?.spriteWidth || KinkyDungeonGridSizeDisplay) * (enemy.scaleX || 1);
					let h = (enemy.Enemy.GFX?.spriteHeight || KinkyDungeonGridSizeDisplay) * (enemy.scaleY || 1);
					let color = (enemy.Enemy.GFX?.lighting) ? KDGetLightColor(enemy.x, enemy.y) : undefined;
					let spr = KDDraw(kdenemyboard, kdpixisprites, "spr_" + enemy.id, KinkyDungeonRootDirectory + "Enemies/" + sp + ".png",
						(tx + (enemy.offX || 0) - CamX + (enemy.flip ? 1 : 0))*KinkyDungeonGridSizeDisplay - (enemy.flip ? -1 : 1)*(w - KinkyDungeonGridSizeDisplay)/2,
						(ty + (enemy.offY || 0) - CamY)*KinkyDungeonGridSizeDisplay - (h - KinkyDungeonGridSizeDisplay)/2,
						w, h, undefined, color != undefined ? {tint: color} : undefined);
					if (enemy.flip && spr?.scale.x > 0) spr.scale.x = -spr.scale.x;
					else if (!enemy.flip && spr?.scale.x < 0) spr.scale.x = -spr.scale.x;
				} else {
					let sp = buffSprite || enemy.Enemy.bound;
					let dir = "EnemiesBound/";
					if (enemy.CustomSprite && !buffSprite) {
						dir = "Enemies/";
						sp = "CustomSpriteBound/" + enemy.CustomSprite;
					}
					let w = (enemy.Enemy.GFX?.spriteWidth || KinkyDungeonGridSizeDisplay) * (enemy.scaleX || 1);
					let h = (enemy.Enemy.GFX?.spriteHeight || KinkyDungeonGridSizeDisplay) * (enemy.scaleY || 1);
					let color = (enemy.Enemy.GFX?.lighting) ? KDGetLightColor(enemy.x, enemy.y) : undefined;
					let spr = KDDraw(kdenemyboard, kdpixisprites, "spr_" + enemy.id, KinkyDungeonRootDirectory + dir + sp + ".png",
						(tx + (enemy.offX || 0) - CamX + (enemy.flip ? 1 : 0))*KinkyDungeonGridSizeDisplay - (enemy.flip ? -1 : 1)*(w - KinkyDungeonGridSizeDisplay)/2,
						(ty + (enemy.offY || 0) - CamY)*KinkyDungeonGridSizeDisplay - (h - KinkyDungeonGridSizeDisplay)/2,
						w, h, undefined, color != undefined ? {tint: color} : undefined);
					if (enemy.flip && spr?.scale.x > 0) spr.scale.x = -spr.scale.x;
					else if (!enemy.flip && spr?.scale.x < 0) spr.scale.x = -spr.scale.x;
				}
			}
		} else {
			// Can't see the enemy so we draw sound instead
			if (KDCanHearEnemy(KinkyDungeonPlayerEntity, enemy)) {
				let w = enemy.Enemy.GFX?.spriteWidth || KinkyDungeonGridSizeDisplay;
				let h = enemy.Enemy.GFX?.spriteHeight || KinkyDungeonGridSizeDisplay;
				let o = StandalonePatched ?
					undefined
					: {tint: 0x888888, blendMode: PIXI.BLEND_MODES.SCREEN};

				let spr = KDDraw(kdgamesound, kdpixisprites, "spr_sound_" + enemy.id, KinkyDungeonRootDirectory + "Enemies/" + sprite + ".png",
					(tx + (enemy.offX || 0) - CamX + (enemy.flip ? 1 : 0))*KinkyDungeonGridSizeDisplay - (w - KinkyDungeonGridSizeDisplay)/2,
					(ty + (enemy.offY || 0) - CamY)*KinkyDungeonGridSizeDisplay - (h - KinkyDungeonGridSizeDisplay)/2,
					w, h, undefined, o);
				if (enemy.flip && spr?.scale.x > 0) spr.scale.x = -spr.scale.x;
				else if (!enemy.flip && spr?.scale.x < 0) spr.scale.x = -spr.scale.x;
			}

		}
	}
	if (reenabled && KinkyDungeonFastMove) {
		KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Click.ogg");
	} else if (reenabled2 && KinkyDungeonFastStruggle) {
		KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Click.ogg");
	}
}

/**
 *
 * @param {entity} Entity
 *
 */
function KDAnimEnemy(Entity) {
	let offX = 0;
	let offY = 0;
	let offamount = 0.25;
	let resetAnim = true;


	if (KDToggles.EnemyAnimations && Entity.Enemy && (Entity.Enemy.Animations || Entity.Enemy.bound)) {
		Entity.offY = 0;
		Entity.offX = 0;
		Entity.scaleX = 1;
		Entity.scaleY = 1;

		let anim = Entity.Enemy.Animations;
		if (anim)
			for (let a of anim) {
				if (KDAnims[a] && KDAnims[a](Entity)) {
					resetAnim = false;
				}
			}
		if (!anim && Entity.Enemy.bound && KDAnims.breathing(Entity)) {
			resetAnim = false;
		}
	}

	if (KDToggles.EnemyAnimations && Entity.Enemy && KDIsFlying(Entity) && !(KDBoundEffects(Entity) > 3 || KDHelpless(Entity))) {
		if (resetAnim) {
			Entity.offY = 0;
			Entity.offX = 0;
			Entity.scaleX = 1;
			Entity.scaleY = 1;
		}
		if (!Entity.animTime) Entity.animTime = CommonTime() + Math.floor(KDRandom() * 1000);
		Entity.offY += 0.05*Math.sin(2 * Math.PI * (CommonTime() - Entity.animTime)/(KDFloatAnimTime));
		resetAnim = false;
	}

	if (Entity.fx && Entity.fy && (Entity.fx != Entity.x || Entity.fy != Entity.y) && Entity.Enemy && !KDIsImmobile(Entity)) {
		if (Entity.fx != Entity.x) {
			offX = offamount * Math.sign(Entity.fx - Entity.x);
		}
		if (Entity.fy != Entity.y) {
			offY = offamount * Math.sign(Entity.fy - Entity.y);
		}
	} else {
		if (KDToggles.EnemyAnimations && Entity.Enemy && (KDBoundEffects(Entity) > 3 || KDHelpless(Entity) || Entity.bind > 0) && !KinkyDungeonIsStunned(Entity)) {
			if (resetAnim) {
				Entity.offY = 0;
				Entity.offX = 0;
				Entity.scaleX = 1;
				Entity.scaleY = 1;
			}
			if (!Entity.animTime) Entity.animTime = CommonTime();
			Entity.offX += 0.05*Math.sin(2 * Math.PI * (CommonTime() - Entity.animTime)/(KDAnimTime));
			resetAnim = false;
		}
	}
	if (resetAnim)  {
		delete Entity.offY;
		delete Entity.offX;
		delete Entity.scaleX;
		delete Entity.scaleY;
		delete Entity.animTime;
	}
	return {offX: offX, offY: offY};
}

/**
 *
 * @param {entity} enemy
 * @param {string} flag
 * @returns {boolean}
 */
function KDEnemyHasFlag(enemy, flag) {
	return (enemy.flags && (enemy.flags[flag] > 0 || enemy.flags[flag] == -1));
}

function KinkyDungeonDrawEnemiesStatus(canvasOffsetX, canvasOffsetY, CamX, CamY) {
	for (let enemy of KDMapData.Entities) {
		let tx = enemy.visual_x;
		let ty = enemy.visual_y;
		let helpless = KDHelpless(enemy);
		let playerDist = Math.max(Math.abs(enemy.x - KinkyDungeonPlayerEntity.x), Math.abs(enemy.y - KinkyDungeonPlayerEntity.y));
		if (enemy.x >= CamX && enemy.y >= CamY && enemy.x < CamX + KinkyDungeonGridWidthDisplay && enemy.y < CamY + KinkyDungeonGridHeightDisplay
			&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0 && KDCanSeeEnemy(enemy, playerDist)) {
			let bindLevel = KDBoundEffects(enemy);
			if (((enemy.revealed && !enemy.Enemy.noReveal) || !enemy.Enemy.stealth || KDHelpless(enemy) || KinkyDungeonSeeAll || playerDist <= enemy.Enemy.stealth + 0.1) && !(KinkyDungeonGetBuffedStat(enemy.buffs, "Sneak", true) > 0)) {
				if (enemy.stun > 0) {
					KDDraw(kdenemystatusboard, kdpixisprites, "stun" + enemy.id, KinkyDungeonRootDirectory + "Conditions/Stun.png",
						(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
							zIndex: 2.1,
						});
				}
				if (KDToggles.ShowNPCStatuses || MouseIn((tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay)) {
					if (enemy.silence > 1 && !helpless) {
						KDDraw(kdenemystatusboard, kdpixisprites, "sil" + enemy.id, KinkyDungeonRootDirectory + "Conditions/Silence.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					}
					if (enemy.blind > 1 && !helpless) {
						KDDraw(kdenemystatusboard, kdpixisprites, "bli" + enemy.id, KinkyDungeonRootDirectory + "Conditions/Blind.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					}
					if (enemy.disarm > 1 && !helpless) {
						KDDraw(kdenemystatusboard, kdpixisprites, "dis" + enemy.id, KinkyDungeonRootDirectory + "Conditions/Disarm.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					}
					if (enemy.bind > 1 && bindLevel < 4) {
						KDDraw(kdenemystatusboard, kdpixisprites, "bind" + enemy.id, KinkyDungeonRootDirectory + "Conditions/Bind.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.11,
							});
					}
					if ((enemy.slow > 1 || KinkyDungeonGetBuffedStat(enemy.buffs, "MoveSpeed", true) < 0) && bindLevel < 4) {
						KDDraw(kdenemystatusboard, kdpixisprites, "spd" + enemy.id, KinkyDungeonRootDirectory + "Conditions/Slow.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					}
					if (KinkyDungeonGetBuffedStat(enemy.buffs, "AttackDmg", true) > 0) {
						KDDraw(kdenemystatusboard, kdpixisprites, "atkb" + enemy.id, KinkyDungeonRootDirectory + "Conditions/Buff.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					}
					if (KinkyDungeonGetBuffedStat(enemy.buffs, "AttackDmg", true) < 0 && bindLevel < 4) {
						KDDraw(kdenemystatusboard, kdpixisprites, "atkdb" + enemy.id, KinkyDungeonRootDirectory + "Conditions/Debuff.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					}
					if (KinkyDungeonGetBuffedStat(enemy.buffs, "SpellResist") < 0 && enemy.Enemy.spellResist > 0) {
						KDDraw(kdenemystatusboard, kdpixisprites, "spresd" + enemy.id, KinkyDungeonRootDirectory + "Conditions/ShieldDebuff.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					} else if (KinkyDungeonGetBuffedStat(enemy.buffs, "SpellResist") > 0) {
						KDDraw(kdenemystatusboard, kdpixisprites, "spres" + enemy.id, KinkyDungeonRootDirectory + "Conditions/ShieldBuff.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					}
					if (KinkyDungeonGetBuffedStat(enemy.buffs, "Armor") < 0 && enemy.Enemy.armor > 0) {
						KDDraw(kdenemystatusboard, kdpixisprites, "armd" + enemy.id, KinkyDungeonRootDirectory + "Conditions/ArmorDebuff.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.11,
							});
					} else if (KinkyDungeonGetBuffedStat(enemy.buffs, "Armor") > 0) {
						KDDraw(kdenemystatusboard, kdpixisprites, "arm" + enemy.id, KinkyDungeonRootDirectory + "Conditions/ArmorBuff.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.11,
							});
					}
					if (KinkyDungeonGetBuffedStat(enemy.buffs, "Evasion") > 0) {
						KDDraw(kdenemystatusboard, kdpixisprites, "evab" + enemy.id, KinkyDungeonRootDirectory + "Conditions/EvasionBuff.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					}
					if (KinkyDungeonGetBuffedStat(enemy.buffs, "Block") > 0) {
						KDDraw(kdenemystatusboard, kdpixisprites, "blkb" + enemy.id, KinkyDungeonRootDirectory + "Conditions/BlockBuff.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					}
					if (KinkyDungeonGetBuffedStat(enemy.buffs, "DamageReduction") > 0) {
						KDDraw(kdenemystatusboard, kdpixisprites, "shield" + enemy.id, KinkyDungeonRootDirectory + "Conditions/ShieldBuff.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					}
					if (KinkyDungeonGetBuffedStat(enemy.buffs, "DamageAmp", true) > 0) {
						KDDraw(kdenemystatusboard, kdpixisprites, "amp" + enemy.id, KinkyDungeonRootDirectory + "Conditions/DamageAmp.png",
							(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 2.1,
							});
					}
				}

				if (enemy.freeze > 0) {
					KDDraw(kdenemystatusboard, kdpixisprites, "frz" + enemy.id, KinkyDungeonRootDirectory + "Conditions/Freeze.png",
						(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
							zIndex: 2.1,
						});
				}
			}
		}
	}
}

let KDLastEnemyWarningDelta = 0;

function KinkyDungeonDrawEnemiesWarning(canvasOffsetX, canvasOffsetY, CamX, CamY) {

	let delta = CommonTime() - KDLastEnemyWarningDelta;
	KDLastEnemyWarningDelta = CommonTime();
	if (KDToggles.ForceWarnings || KDMouseInPlayableArea()) {
		for (let enemy of KDMapData.Entities) {
			if (enemy.warningTiles) {
				for (let t of enemy.warningTiles) {
					let scale = t.scale || 0.01;
					if (scale < 1) t.scale = Math.max(0, Math.min(1, (t.scale || 0) + delta * 0.008/KDAnimSpeed));
					else scale = 1;
					let tx = enemy.x + t.x*scale;
					let ty = enemy.y + t.y*scale;
					let txx = enemy.x + t.x;
					let tyy = enemy.y + t.y;
					if (!KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(txx, tyy)) && KinkyDungeonNoEnemy(txx, tyy, true)) continue;
					let special = enemy.usingSpecial ? "Special" : "";
					let attackMult = KinkyDungeonGetBuffedStat(enemy.buffs, "AttackSlow", true);
					let attackPoints = enemy.attackPoints - attackMult + 1.1;
					//let preHit = false;
					if (((enemy.usingSpecial && enemy.Enemy.specialAttackPoints) ? enemy.Enemy.specialAttackPoints : enemy.Enemy.attackPoints) > attackPoints) {
						special = special + "Basic";
						//preHit = true;
					}
					//  && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(tx, ty))
					if (txx >= CamX && tyy >= CamY && txx < CamX + KinkyDungeonGridWidthDisplay && tyy < CamY + KinkyDungeonGridHeightDisplay && !(txx == enemy.x && tyy == enemy.y)) {
						let color = enemy.Enemy.color ? string2hex(enemy.Enemy.color) : 0xff5555;

						KDDraw(kdgameboard, kdpixisprites, tx + "," + ty + "_w" + enemy.id, KinkyDungeonRootDirectory + ((KDAllied(enemy)) ? "WarningAlly" : "WarningColor" + special) + ".png",
							(tx - CamX+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay, (ty - CamY+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonSpriteSize*scale, KinkyDungeonSpriteSize*scale, undefined, {
								tint: color,
								zIndex: 2.22 + 0.001 * (enemy.Enemy.power ? enemy.Enemy.power : 0),
							});
						KDDraw(kdgameboard, kdpixisprites, tx + "," + ty + "_w_b" + enemy.id, KinkyDungeonRootDirectory + "WarningBacking" + ".png",
							(tx - CamX+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay, (ty - CamY+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonSpriteSize*scale, KinkyDungeonSpriteSize*scale, undefined, {
								tint: color,
								zIndex: 0.21 + 0.001 * (enemy.Enemy.power ? enemy.Enemy.power : 0),
							});

						KDDraw(kdgameboard, kdpixisprites, tx + "," + ty + "_w_b_h" + enemy.id, KinkyDungeonRootDirectory + "WarningBackingHighlight" + ".png",
							(tx - CamX+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay, (ty - CamY+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonSpriteSize*scale, KinkyDungeonSpriteSize*scale, undefined, {
								zIndex: 0.20,
							});
						KDDraw(kdgameboard, kdpixisprites, tx + "," + ty + "_w_h" + enemy.id, KinkyDungeonRootDirectory + ((KDAllied(enemy)) ? "WarningHighlightAlly" : "WarningHighlight" + special) + ".png",
							(tx - CamX+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay - 1, (ty - CamY+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay - 1,
							KinkyDungeonSpriteSize*scale + 2, KinkyDungeonSpriteSize*scale + 2, undefined, {
								zIndex: 2.2,
							});
					}
				}
			}
			let mp = enemy.Enemy.movePoints + KDBoundEffects(enemy) * 0.5;
			let ms = KinkyDungeonGetBuffedStat(enemy.buffs, "MoveSpeed") ? KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(enemy.buffs, "MoveSpeed")) : 1;
			if (enemy.fx && enemy.fy && enemy.movePoints >= mp - ms - 0.0001) {
				let tx = enemy.fx;
				let ty = enemy.fy;
				if (tx >= CamX && ty >= CamY && tx < CamX + KinkyDungeonGridWidthDisplay && ty < CamY + KinkyDungeonGridHeightDisplay
					&& KDCanSeeEnemy(enemy, Math.max(Math.abs(enemy.x - KinkyDungeonPlayerEntity.x), Math.abs(enemy.y - KinkyDungeonPlayerEntity.y)))
					&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0) {
					let color = enemy.Enemy.color ? string2hex(enemy.Enemy.color) : 0xff5555;
					KDDraw(kdenemystatusboard, kdpixisprites, tx + "," + ty + "_w_m" + enemy.id, KinkyDungeonRootDirectory + ("WarningMove") + ".png",
						(tx - CamX + 0.5)*KinkyDungeonGridSizeDisplay - 1, (ty - CamY + 0.5)*KinkyDungeonGridSizeDisplay - 1,
						KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, Math.atan2(ty - enemy.y, tx - enemy.x) || 0, {
							tint: color,
							zIndex: -0.05,
						}, true);
				}
			}
			if (enemy.Enemy.spells && (enemy.Enemy.spellRdy && (!KDAmbushAI(enemy) || enemy.ambushtrigger)) && !(enemy.castCooldown > 1) && (!(enemy.silence > 0) && !(enemy.stun > 0) && !(enemy.freeze > 0) && !KDHelpless(enemy))) {
				let tx = enemy.visual_x;
				let ty = enemy.visual_y;
				//  && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(tx, ty))
				if (tx >= CamX && ty >= CamY && tx < CamX + KinkyDungeonGridWidthDisplay && ty < CamY + KinkyDungeonGridHeightDisplay
					&& KDCanSeeEnemy(enemy, Math.max(Math.abs(enemy.x - KinkyDungeonPlayerEntity.x), Math.abs(enemy.y - KinkyDungeonPlayerEntity.y)))
					&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0) {
					KDDraw(kdenemyboard, kdpixisprites, enemy.id + "_spellRdy", KinkyDungeonRootDirectory + "SpellReady.png",
						(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, enemy.Enemy.color ? {
							tint: string2hex(enemy.Enemy.color),
							zIndex: -2,
						} : undefined);
				}
			}
			if (enemy.weakBinding) { //  || enemy.specialBinding
				let tx = enemy.visual_x;
				let ty = enemy.visual_y;
				let binder = KinkyDungeonFindID(enemy.boundTo);
				//  && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(tx, ty))
				if (binder && tx >= CamX && ty >= CamY && tx < CamX + KinkyDungeonGridWidthDisplay && ty < CamY + KinkyDungeonGridHeightDisplay
					&& KDCanSeeEnemy(enemy, Math.max(Math.abs(enemy.x - KinkyDungeonPlayerEntity.x), Math.abs(enemy.y - KinkyDungeonPlayerEntity.y)))
					&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0) {
					KDDraw(kdenemyboard, kdpixisprites, enemy.id + "_weakB", KinkyDungeonRootDirectory + "WeakBinding.png",
						(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, binder.Enemy.color ? {
							tint: string2hex(binder.Enemy.color),
							zIndex: -2.1,
						} : undefined);
				}
			}
		}
	}
}

function KinkyDungeonBar(x, y, w, h, value, foreground = "#66FF66", background = "#ff0000", orig = undefined, origColor = "#ff4444", notches = undefined, notchcolor = "#ffffff", notchbg = "#ffffff", zIndex = 55) {
	if (value < 0) value = 0;
	if (value > 100) value = 100;
	let id = x + "," + y + "," + w + "," + h + foreground;
	if (background != "none")
		FillRectKD(kdcanvas, kdpixisprites, id + '1', {
			Left: x + 1,
			Top: y + 1,
			Width: w - 2,
			Height: h - 2,
			Color: "#000000",
			LineWidth: 1,
			zIndex: zIndex+value*0.0001,
		});
	FillRectKD(kdcanvas, kdpixisprites, id + '2', {
		Left: x + 2,
		Top: y + 2,
		Width: Math.floor((w - 4) * value / 100),
		Height: h - 4,
		Color: foreground,
		LineWidth: 1,
		zIndex: zIndex + .1,
	});
	if (background != "none")
		FillRectKD(kdcanvas, kdpixisprites, id + '3', {
			Left: Math.floor(x + 2 + (w - 4) * value / 100),
			Top: y + 2,
			Width: Math.floor((w - 4) * (100 - value) / 100),
			Height: h - 4,
			Color: background,
			LineWidth: 1,
			zIndex: zIndex + .2,
		});
	if (orig != undefined)
		FillRectKD(kdcanvas, kdpixisprites, id + '4', {
			Left: Math.min(
				Math.floor(x + 2 + (w - 4) * orig / 100),
				Math.floor(x + 2 + (w - 4) * value / 100)
			),
			Top: y + 2,
			Width: Math.floor((w - 4) * Math.abs(value - orig) / 100),
			Height: h - 4,
			Color: origColor,
			LineWidth: 1,
			zIndex: zIndex + .3,
		});
	if (notches) {
		for (let n of notches) {
			if (n > 0 && n < 1) {
				FillRectKD(kdcanvas, kdpixisprites, id + '5' + n, {
					Left: x + Math.floor((w - 4) * n) - 1,
					Top: y + 2,
					Width: 3,
					Height: h - h,
					Color: notchbg,
					LineWidth: 1,
					zIndex: zIndex + .4,
				});
				FillRectKD(kdcanvas, kdpixisprites, id + '6' + n, {
					Left: x + Math.floor((w - 4) * n),
					Top: y + 2,
					Width: 1,
					Height: h - 4,
					Color: notchcolor,
					LineWidth: 1,
					zIndex: zIndex + .5,
				});
			}
		}
	}
}

/**
 *
 * @param {entity} enemy
 * @param {number} [playerDist]
 * @returns {boolean}
 */
function KDCanSeeEnemy(enemy, playerDist) {
	if (playerDist == undefined) playerDist = KDistChebyshev(KinkyDungeonPlayerEntity.x - enemy.x, KinkyDungeonPlayerEntity.y - enemy.y);
	return (((enemy.revealed && !enemy.Enemy.noReveal) || !enemy.Enemy.stealth || KDHelpless(enemy) || KinkyDungeonSeeAll || playerDist <= enemy.Enemy.stealth + 0.1)
		&& !(KinkyDungeonGetBuffedStat(enemy.buffs, "Sneak") > 0 && playerDist > 1.5)
		&& playerDist <= KDMaxEnemyViewDist(enemy));
}

function KDMaxEnemyViewDist(enemy) {
	let data = {
		blindMult: (KinkyDungeonStatsChoice.get("Blackout") || KinkyDungeonStatsChoice.get("TotalBlackout")) ? 100 : 2,
	};
	//KinkyDungeonSendEvent("calcEnemyRad", data);
	if (enemy.hp < enemy.Enemy.maxhp || enemy.attackPoints > 0) return KDMaxVisionDist;
	if (KinkyDungeonBlindLevel < 2) return KDMaxVisionDist;
	else return Math.max(1.5, KDMaxVisionDist - KinkyDungeonBlindLevel * data.blindMult);
}

/**
 *
 * @param {entity} enemy
 * @returns {number}
 */
function KDGetEnemyStruggleMod(enemy) {
	let level = KDBoundEffects(enemy);
	let mult = 0.1;

	if (enemy.boundLevel > enemy.Enemy.maxhp * 10) {
		mult = 0;
	}
	if (mult > 0) {
		if (enemy.disarm > 0) mult *= 0.5;
		if (enemy.silence > 0) mult *= 0.75;
		if (enemy.blind > 0) mult *= 0.75;
		if (enemy.bind > 0) mult *= 0.5;
		else if (enemy.slow > 0) mult *= 0.75;
		if (level > 3) mult *= 3; // Struggle faster when bound heavily, because they're using all their energy to try to escape
		if (enemy.vulnerable > 0 || enemy.attackPoints > 0) mult *= 0.5; // They're busy
		if (enemy.boundLevel > 0) {
			mult *= Math.pow(1.5, -enemy.boundLevel / enemy.Enemy.maxhp); // The more you tie, the stricter the bondage gets
		}
		if (enemy.distraction > 0) mult *= 1 / (1 + 2 * enemy.distraction / enemy.Enemy.maxhp);
	}

	if (!KDEnemyHasFlag(enemy, "imprisoned") && enemy.hp > 0.51 && KDNearbyEnemies(enemy.x, enemy.y, 1.5).some((en) => {
		return en != enemy && en.Enemy.bound && !KDHelpless(enemy) && KDBoundEffects(en) < 3 && !KDEnemyHasFlag(en, "imprisoned") && !KinkyDungeonIsDisabled(en) && KDFactionRelation(KDGetFaction(enemy), KDGetFaction(en)) >= Math.max(0.1, KDFactionRelation("Player", KDGetFaction(en)));
	})) {
		mult += 0.15;
	}
	if (mult > 0) {
		if (KinkyDungeonGetBuffedStat(enemy.buffs, "Lockdown")) mult *= KinkyDungeonGetBuffedStat(enemy.buffs, "Lockdown");
	}

	return mult;
}

/**
 *
 * @param {entity} enemy
 * @param {number} vibe
 * @returns {number}
 */
function KDGetEnemyDistractRate(enemy, vibe) {
	if (vibe) return -(enemy.Enemy.maxhp**0.5) * (0.1 + 0.05 * vibe);
	let level = KDBoundEffects(enemy);
	let mult = enemy.distraction/enemy.Enemy.maxhp > 0.9 ? 0.02 : (enemy.distraction/enemy.Enemy.maxhp > 0.5 ? 0.04 : 0.06);
	if (KDStrictPersonalities.includes(enemy.personality)) mult = mult * 2;
	else if (!KDLoosePersonalities.includes(enemy.personality)) mult = mult * 1.5;

	return mult * enemy.Enemy.maxhp / (1 + level * 0.25);
}

/**
 *
 * @param {entity} enemy
 * @param {number} vibe
 * @returns {number}
 */
function KDGetEnemyDistractionDamage(enemy, vibe) {
	if (vibe <= 0) return 0;
	let mult = Math.max(0.25, enemy.distraction/enemy.Enemy.maxhp) * 0.05 * vibe;
	if (enemy.hp <= 1 || enemy.hp <= enemy.Enemy.maxhp * 0.101) return 0;
	return Math.min(Math.max(0.2 * enemy.Enemy.maxhp**0.75, 1), mult * enemy.hp);
}

let KDMaxBindingBars = 3;

/**
 *
 * @param {number} currentval
 * @param {number} targetval
 * @param {number} rate
 * @param {number} minrate - Minimum rate
 * @param {number} delta
 * @param {number} eps -epsilon, threshold for making the value eqyal exactly
 * @returns {number}
 */
function KDEaseValue(delta, currentval, targetval, rate, minrate, eps = 0.1) {
	let val = currentval;
	let diff = Math.abs(targetval - currentval);
	let amount = diff * rate * delta;
	let effamount = Math.max(minrate * delta, amount);
	let eps_real = Math.max(eps, effamount);
	if (val > targetval + eps_real || val < targetval - eps_real) {
		val = val + (targetval - currentval) * effamount;
	} else val = targetval;
	return val;
}

let KDBarAdvanceRate = 1.9/1000;
let KDBarAdvanceRateMin = 1.0/1000;

function KinkyDungeonDrawEnemiesHP(delta, canvasOffsetX, canvasOffsetY, CamX, CamY, CamXoffset, CamYoffset) {
	KDDialogueSlots = {};
	let tooltip = false;
	//let bindAmpModBase = KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BindAmp"));
	for (let enemy of KDMapData.Entities) {
		// Handle enemy bars
		if (enemy.boundLevel != undefined && !(enemy.visual_boundlevel == enemy.boundLevel)) {
			enemy.visual_boundlevel = KDEaseValue(delta, enemy.visual_boundlevel || 0, enemy.boundLevel, KDBarAdvanceRate, KDBarAdvanceRateMin * enemy.Enemy.maxhp);
		}
		if (enemy.hp != undefined && !(enemy.visual_hp == enemy.hp)) {
			enemy.visual_hp = KDEaseValue(delta, enemy.visual_hp != undefined ? enemy.visual_hp : enemy.Enemy.maxhp, enemy.hp, KDBarAdvanceRate, KDBarAdvanceRateMin * enemy.Enemy.maxhp);
		}
		if (enemy.distraction != undefined && !(enemy.visual_distraction == enemy.distraction)) {
			enemy.visual_distraction = KDEaseValue(delta, enemy.visual_distraction || 0, enemy.distraction, KDBarAdvanceRate, KDBarAdvanceRateMin * enemy.Enemy.maxhp);
		}
		if (enemy.lifetime != undefined && !(enemy.visual_lifetime == enemy.lifetime)) {
			enemy.visual_lifetime = KDEaseValue(delta, enemy.visual_lifetime || 0, enemy.lifetime, KDBarAdvanceRate, KDBarAdvanceRateMin * enemy.maxlifetime);
		}

		let playerDist = Math.max(Math.abs(enemy.x - KinkyDungeonPlayerEntity.x), Math.abs(enemy.y - KinkyDungeonPlayerEntity.y));
		if (enemy.x >= CamX && enemy.y >= CamY && enemy.x < CamX + KinkyDungeonGridWidthDisplay && enemy.y < CamY + KinkyDungeonGridHeightDisplay
			&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0) {
			let xx = enemy.visual_x ? enemy.visual_x : enemy.x;
			let yy = enemy.visual_y ? enemy.visual_y : enemy.y;
			let II = 0;
			// Draw bars
			if ((!enemy.Enemy.stealth || KDHelpless(enemy) || playerDist <= enemy.Enemy.stealth + 0.1) && !(KinkyDungeonGetBuffedStat(enemy.buffs, "Sneak") > 0 && playerDist > 1.5)) {
				if ((KDAllied(enemy) || enemy.distraction > 0 || ((enemy.lifetime != undefined || enemy.hp < enemy.Enemy.maxhp || enemy.boundTo || enemy.boundLevel))) && KDCanSeeEnemy(enemy, playerDist)) {
					let spacing = 6;
					// Draw binding bars
					let helpless = KDHelpless(enemy);
					let bindAmpMod = 1;//KDGetBindAmp(enemy, bindAmpModBase);
					if (enemy.boundLevel != undefined && enemy.boundLevel > 0) {
						if (!helpless) {
							let visualbond = bindAmpMod * enemy.visual_boundlevel;
							let bindingBars = Math.ceil( visualbond / enemy.Enemy.maxhp);
							let SM = KDGetEnemyStruggleMod(enemy);
							let futureBound = KDPredictStruggle(enemy, SM, 1);
							for (let i = 0; i < bindingBars && i < KDMaxBindingBars; i++) {
								if (i > 0) II++;
								let mod = visualbond - bindAmpMod * futureBound.boundLevel;
								// Part that will be struggled out of
								KinkyDungeonBar(canvasOffsetX + (xx - CamX + 0.1 - CamXoffset)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay + 12 - 15 - spacing*II,
									KinkyDungeonGridSizeDisplay * 0.8, 7, Math.min(1, (visualbond - i * enemy.Enemy.maxhp) / enemy.Enemy.maxhp) * 100, "#ffffff", "#52333f");
								// Separator between part that will be struggled and not
								KinkyDungeonBar(1 + canvasOffsetX + (xx - CamX + 0.1 - CamXoffset)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay + 12 - 15 - spacing*II,
									KinkyDungeonGridSizeDisplay * 0.8, 7, Math.min(1, (visualbond - mod - i * enemy.Enemy.maxhp) / enemy.Enemy.maxhp) * 100, "#444444", "none");

							}
							II -= Math.max(0, Math.min(bindingBars-1, KDMaxBindingBars-1));
							// Temp value of bondage level, decremented based on special bound level and priority
							let bb = 0;
							let bcolor = "#ffae70";
							let bondage = [];
							if (futureBound.specialBoundLevel) {
								for (let b of Object.entries(futureBound.specialBoundLevel)) {
									bondage.push({name: b[0], amount: b[1] * bindAmpMod, level: 0, pri: KDSpecialBondage[b[0]].priority});
								}
								bondage = bondage.sort((a, b) => {
									return b.pri - a.pri;
								});
							} else {
								bondage.push({name: "Normal", amount: 0, level: futureBound.boundLevel, pri: 0});
							}

							for (let b of bondage) {
								if (!b.level) {
									b.level = bb + b.amount;
									bb = b.level;
								}
							}
							for (let i = 0; i < bindingBars && i < KDMaxBindingBars; i++) {
								if (i > 0) II++;
								// Determine current bondage type
								let bars = false;
								for (let bi = bondage.length - 1; bi >= 0; bi--) {
									let b = bondage[bi];
									// Filter out anything that doesnt fit currently
									if (b.level > i * enemy.Enemy.maxhp) {
										bcolor = KDSpecialBondage[b.name] ? KDSpecialBondage[b.name].color : "#ffae70";
										// Struggle bars themselves
										KinkyDungeonBar(canvasOffsetX + (xx - CamX + 0.1 - CamXoffset)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay + 12 - 15 - spacing*II,
											KinkyDungeonGridSizeDisplay * 0.8, 7, Math.min(1, (Math.max(0, b.level - i * enemy.Enemy.maxhp)) / enemy.Enemy.maxhp) * 100, bcolor, "none",
											undefined, undefined, bars ? [0.25, 0.5, 0.75] : undefined, bars ? "#85522c" : undefined, bars ? "#85522c" : undefined, 57.5 + b.pri*0.01);
										bars = true;
									}

								}

							}
						} else {
							// TODO draw a lock or some other icon
						}
					}
					// Draw HP bar
					if (!helpless) {

						if (enemy.hp < enemy.Enemy.maxhp || KDAllied(enemy) || enemy.boundTo) {
							// Draw hp bar
							let fg = enemy.boundTo ? (KDAllied(enemy) ? "#77aaff" : "#dd88ff") : (KDAllied(enemy) ? "#00ff88" : "#ff5555");
							let bg = KDAllied(enemy) ? "#aa0000" : "#000000";
							KinkyDungeonBar(canvasOffsetX + (xx - CamX - CamXoffset + (enemy.boundTo? 0.1 : 0.05))*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay - 15 - II * spacing,
								KinkyDungeonGridSizeDisplay * (enemy.boundTo? 0.8 : 0.9), enemy.boundTo? 7 : 9, enemy.visual_hp / enemy.Enemy.maxhp * 100, fg, bg); II++;
						}

						if (enemy.distraction > 0) {
							// Draw distraction bar
							KinkyDungeonBar(canvasOffsetX + (xx - CamX - CamXoffset + 0.1)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay - 15 - II * spacing,
								KinkyDungeonGridSizeDisplay * 0.8, 6, enemy.distraction / enemy.Enemy.maxhp * 100, "#fda1ff", "#9300ff");
							KDDraw(kdcanvas, kdpixisprites, enemy.id + "_ar_heart", KinkyDungeonRootDirectory + (enemy.distraction >= 0.9 * enemy.Enemy.maxhp ? "UI/HeartExtreme.png" : "UI/Heart.png"),
								-7 + canvasOffsetX + (xx - CamX - CamXoffset + enemy.visual_distraction / enemy.Enemy.maxhp * 0.8 + 0.1)*KinkyDungeonGridSizeDisplay,
								-4 + canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay - 15 - II * spacing,
								14, 14 , undefined, {
									zIndex: 63,
								});
							II++;
						}

						if (enemy.lifetime != undefined && enemy.maxlifetime > 0 && enemy.maxlifetime < 999 && ((!enemy.Enemy.hidetimerbar && !enemy.hideTimer) || KDAllied(enemy))) {
							// Draw lifetime bar
							KinkyDungeonBar(canvasOffsetX + (xx - CamX - CamXoffset + (enemy.boundTo? 0.1 : 0.05))*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay - 15 - II * spacing,
								KinkyDungeonGridSizeDisplay * (enemy.boundTo? 0.8 : 0.9), 8, enemy.visual_lifetime / enemy.maxlifetime * 100, "#cccccc", "#000000"); II++;
						}
					}
				}
			}


			// Draw status bubbles
			let canSee = KDCanSeeEnemy(enemy, playerDist);
			let canHear = KDCanHearEnemy(KinkyDungeonPlayerEntity, enemy);
			if (canSee || canHear) {
				// Draw thought bubbles
				let yboost = II * -20;
				if (canSee) {
					if (enemy.Enemy.specialdialogue || enemy.specialdialogue) {
						KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_th", KinkyDungeonRootDirectory + "Conditions/Dialogue.png",
							canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
							KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
								zIndex: 23,
							});
					}
					let bb = false;
					if (enemy.Enemy.bound && KDThoughtBubbles.has(enemy.id)) {
						let bubble = KDThoughtBubbles.get(enemy.id);
						if (bubble.index + bubble.duration >= KinkyDungeonCurrentTick && (enemy.ambushtrigger || !KDAIType[KDGetAI(enemy)]?.ambush)) {
							bb = true;
							let name = CommonTime() % 1000 < 500 ? "Thought" : bubble.name;
							if (name != "Thought" || !((enemy.lifetime != undefined || enemy.hp < enemy.Enemy.maxhp || enemy.boundLevel)))
								KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_th", KinkyDungeonRootDirectory + `Conditions/Thought/${name}.png`,
									canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
									KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
										zIndex: 23,
									});
						}
					}
					if (!KDHelpless(enemy)) {
						if (!KinkyDungeonAggressive(enemy) && ((!KDAllied(enemy) && !enemy.Enemy.specialdialogue && !bb) || KDEnemyHasFlag(enemy, "Shop")) && !enemy.playWithPlayer && enemy.Enemy.movePoints < 90 && !KDAmbushAI(enemy)) {
							KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_shop", KinkyDungeonRootDirectory + ((KDEnemyHasFlag(enemy, "Shop")) ? "Conditions/Shop.png" : (KDAllied(enemy) ? "Conditions/Heart.png" : "Conditions/Peace.png")),
								canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
								KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
									zIndex: 22,
								});
						} else if (!bb && enemy.aware && KDHostile(enemy) && enemy.vp > 0 && enemy.Enemy && !enemy.Enemy.noAlert && enemy.Enemy.movePoints < 90 && !KDAmbushAI(enemy)) {
							KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_aw", KinkyDungeonRootDirectory + "Conditions/Aware.png",
								canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
								KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
									zIndex: 22,
								});
						} else if (!bb && enemy.vp > 0.01 && KDHostile(enemy) && enemy.Enemy && !enemy.Enemy.noAlert && enemy.Enemy.movePoints < 90 && !KDAmbushAI(enemy)) {
							let sneakThreshold = enemy.Enemy.sneakThreshold ? enemy.Enemy.sneakThreshold : 2;
							if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak")) sneakThreshold = Math.max(0.1, sneakThreshold + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak"));
							if (enemy.vp > sneakThreshold/2) {
								KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_vp", KinkyDungeonRootDirectory + "Conditions/vp.png",
									canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
									KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
										zIndex: 22,
									});
							}
							if (enemy.vp < sneakThreshold)
								KinkyDungeonBar(
									canvasOffsetX + (xx - CamX - CamXoffset + 0.15)*KinkyDungeonGridSizeDisplay,
									canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay - 0,
									KinkyDungeonGridSizeDisplay * 0.7, 7, enemy.vp / sneakThreshold * 100, "#ffffff", "#333333");
						}
						if (enemy.vulnerable > 0)
							KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_vuln", KinkyDungeonRootDirectory + "Conditions/Vulnerable.png",
								canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
								KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
									zIndex: 22,
								});
					}
					if (!tooltip && (((!KDAmbushAI(enemy) || enemy.ambushtrigger)
					&& (MouseIn(canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay)
						|| MouseIn(canvasOffsetX + (enemy.x - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (enemy.y - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay))
						|| (KDGameData.CurrentDialog && KDGetSpeaker() == enemy)))) {
						let faction = KDGetFaction(enemy);
						if (faction && (!KinkyDungeonHiddenFactions.includes(faction) || KinkyDungeonTooltipFactions.includes(faction))) {
							let tt = TextGet("KinkyDungeonFaction" + faction);
							let ttlength = 10;
							if (CJKcheck(tt,2)){
								DrawTextFitKD(tt, canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, yboost + canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/3, 10 + tt.length * 8, "white", "black");
								yboost += -2*KinkyDungeonGridSizeDisplay/7;
							} else {
								let ttCJKcheck1 = CJKcheck(tt,1);
								let ttCJKcheck2 = CJKcheck(tt);

								if (ttCJKcheck1){
									let i;
									for (i in ttCJKcheck1){ttlength += ttCJKcheck1[i].length * 8;}
								}
								if (ttCJKcheck2){
									let i;
									for (i in ttCJKcheck2){ttlength += ttCJKcheck2[i].length * 16;}
								}
								DrawTextFitKD(tt, canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, yboost + canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/3, ttlength, "white", "black");
								yboost += -3*KinkyDungeonGridSizeDisplay/8;
							}
						}

						let name = TextGet("Name" + enemy.Enemy.name);
						let namelength = 10;
						if (CJKcheck(name,2)){
							DrawTextFitKD(name, canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, yboost + canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/3, 10 + name.length * 8, "white", "black");
						} else {
							let nameCJKcheck1 = CJKcheck(name,1);
							let nameCJKcheck2 = CJKcheck(name);

							if (nameCJKcheck1){
								let i;
								for (i in nameCJKcheck1){namelength += nameCJKcheck1[i].length * 8;}
							}
							if (nameCJKcheck2){
								let i;
								for (i in nameCJKcheck2){namelength += nameCJKcheck2[i].length * 16;}
							}
							DrawTextFitKD(name, canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, yboost + canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/3, namelength, "white", "black");
						}

						if (enemy.CustomName) {
							DrawTextKD(enemy.CustomName, canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, yboost + canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/1.5, enemy.CustomNameColor, "black");
						}
						tooltip = true;
					}
				}

				if (enemy.dialogue && !tooltip) {
					let dialogueOffset = 0;
					while (dialogueOffset < 300 && (KDDialogueSlots[yboost + canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/1.5 - dialogueOffset])) {
						dialogueOffset += 18;
					}
					KDDialogueSlots[yboost + canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/1.5 - dialogueOffset] = true;

					let dialougelenth = 10;
					if (CJKcheck(enemy.dialogue,2)){
						DrawTextFitKD(enemy.dialogue,
							canvasOffsetX + (xx - CamX - CamXoffset)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2,
							yboost + canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/1.5 - dialogueOffset, 10 + enemy.dialogue.length * 8, enemy.dialogueColor, "#000000", 18, undefined, 20);
					} else {
						let dialougeCJKcheck1 = CJKcheck(enemy.dialogue,1);
						let dialougeCJKcheck2 = CJKcheck(enemy.dialogue);

						if (dialougeCJKcheck1){
							let i;
							for (i in dialougeCJKcheck1){dialougelenth += dialougeCJKcheck1[i].length * 8;}
						}
						if (dialougeCJKcheck2){
							let i;
							for (i in dialougeCJKcheck2){dialougelenth += dialougeCJKcheck2[i].length * 16;}
						}
						DrawTextFitKD(enemy.dialogue,
							canvasOffsetX + (xx - CamX - CamXoffset)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2,
							yboost + canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/1.5 - dialogueOffset, dialougelenth, enemy.dialogueColor, "#000000", 18, undefined, 20);
					}
				}
			}
		}
	}
}

let KDDialogueSlots = {};

/**
 *
 * @param {entity} enemy
 * @param {number} offset
 * @returns {number}
 */
function KDDrawEnemyTooltip(enemy, offset) {
	let analyze = KDHasSpell("ApprenticeKnowledge");
	// Previously this was dependent on using a spell called Analyze. Now it is enabled by default if you have Knowledge
	let TooltipList = [];
	if (enemy.CustomName)
		TooltipList.push({
			str: enemy.CustomName,
			fg: enemy.CustomNameColor || "#ffffff",
			bg: "#000000",
			size: 28,
			center: true,
		});
	TooltipList.push({
		str: TextGet("Name" + enemy.Enemy.name),
		fg: enemy.Enemy.color || "#ff5555",
		bg: "#000000",
		size: 24,
		center: true,
	});
	TooltipList.push({
		str: TextGet("KDTooltipHP") + Math.round(enemy.hp*10) + "/" + Math.round(enemy.Enemy.maxhp * 10),
		fg: "#ffffff",
		bg: "#000000",
		size: 20,
		center: true,
	});
	if (enemy.boundLevel) {
		TooltipList.push({
			str: TextGet("KDTooltipBinding") + Math.round(enemy.boundLevel/enemy.Enemy.maxhp*100) + "%",
			fg: "#ffae70",
			bg: "#000000",
			size: 20,
			center: true,
		});
	}
	if (enemy.boundTo) {
		TooltipList.push({
			str: TextGet(enemy.weakBinding ? "KDTooltipWeakBinding" : "KDTooltipNormalBinding"),
			fg: KDHostile(enemy) ? "#88ff88" : "#ff5555",
			bg: "#000000",
			size: 14,
			center: true,
		});
		let caster = KinkyDungeonFindID(enemy.boundTo);
		if (caster || caster?.player)
			TooltipList.push({
				str: TextGet("KDTooltipBoundTo").replace("ENEMYNAME", TextGet("Name" + caster.Enemy.name)),
				fg: KDHostile(enemy) ? "#88ff88" : "#ff5555",
				bg: "#000000",
				size: 14,
				center: true,
			});
		else
			TooltipList.push({
				str: TextGet("KDTooltipDisappearing"),
				fg: "#ff5555",
				bg: "#000000",
				size: 14,
				center: true,
			});
	}
	let statuses = [];

	if (enemy.vulnerable) statuses.push({name: "Vulnerable", count: undefined});
	if (KDIsFlying(enemy)) statuses.push({name: "Flying", count: undefined});
	if (KDEntityBuffedStat(enemy, "Vibration")) statuses.push({name: "Vibed", count: undefined});
	if (enemy.stun) statuses.push({name: "Stunned", count:  Math.round(enemy.stun)});
	if (enemy.bind) statuses.push({name: "Bind", count:  Math.round(enemy.bind)});
	if (enemy.slow) statuses.push({name: "Slow", count:  Math.round(enemy.slow)});
	if (enemy.silence) statuses.push({name: "Silence", count:  Math.round(enemy.silence)});
	if (enemy.disarm) statuses.push({name: "Disarm", count:  Math.round(enemy.disarm)});
	if (enemy.blind) statuses.push({name: "Blind", count:  Math.round(enemy.blind)});
	if (enemy.slow || KDEntityBuffedStat(enemy, "MoveSpeed") < 0) statuses.push({name: "Slow", count:  Math.round(enemy.slow)});
	if (KDBoundEffects(enemy)) statuses.push({name: "Bound" + (KDHelpless(enemy) ? 10 : KDBoundEffects(enemy))});
	if (KDEntityBuffedStat(enemy, "Plug")) statuses.push({name: "Plug", count: undefined});
	if (KDEntityBuffedStat(enemy, "Chastity")) statuses.push({name: "Belt", count: undefined});

	if (statuses.length > 0) {
		let strings = [""];
		let strr = "";
		let count = 0;
		let maxcount = 4;
		for (let stat of statuses) {
			count += 1;
			if (count > maxcount) {
				strr = "";
				strings.push("");
			}
			if (strr) strr = strr + ", ";
			strr = strr + `${TextGet("KDStatusTooltipEnemy" + stat.name)}`;
			if (stat.count) strr = strr + ` (${stat.count})`;
			strings[strings.length - 1] = strr;
		}
		for (let stringlisted of strings)
			TooltipList.push({
				str: stringlisted,
				fg: "#dddddd",
				bg: "#000000",
				size: 14,
				center: true,
			});
	}


	TooltipList.push({
		str: "",
		fg: "#ffaa55",
		bg: "#000000",
		size: 12,
	});
	if (!enemy.Enemy.tags?.nobrain) {
		let opinion = Math.max(-3, Math.min(3, Math.round(KDGetModifiedOpinion(enemy)/10)));
		let str = TextGet("KDTooltipOpinion"+opinion);
		TooltipList.push({
			str: str,
			fg: "#ffffff",
			bg: KDTextGray0,
			size: 20,
		});

		let ttt = KDGetAwareTooltip(enemy);
		TooltipList.push({
			str: TextGet("KDTooltipAware" + ttt.suff),
			fg: ttt.color,
			bg: "#000000",
			size: 20,
		});
	}
	let armor = (enemy.Enemy.armor || 0) + KinkyDungeonGetBuffedStat(enemy.buffs, "Armor");
	let spellResist = (enemy.Enemy.spellResist || 0) + KinkyDungeonGetBuffedStat(enemy.buffs, "SpellResist");
	let armorBreak = KinkyDungeonGetBuffedStat(enemy.buffs, "ArmorBreak");
	let spellResistBreak = KinkyDungeonGetBuffedStat(enemy.buffs, "SpellResistBreak");
	let evasion = KinkyDungeonMultiplicativeStat(enemy.Enemy.evasion)
		* KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(enemy.buffs, "Evasion"));
	if (armor) {
		let st = TextGet("KinkyDungeonTooltipArmor").replace("AMOUNT", "" + Math.round(10* armor)
			+ (armorBreak ? ` - ${Math.round(10* armorBreak)}` : ""));
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: KDTextGray0,
			size: 20,
		});
	}
	if (spellResist) {
		let st = TextGet("KinkyDungeonTooltipSpellResist").replace("AMOUNT", "" + Math.round(10* spellResist)
			+ (spellResistBreak ? ` - ${Math.round(10* spellResistBreak)}` : ""));
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: KDTextGray0,
			size: 20,
		});
	}
	if (evasion != 1.0) {
		let st = TextGet("KinkyDungeonTooltipEvasion").replace("AMOUNT", "" + Math.round(100 - 100 * evasion));
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: KDTextGray0,
			size: 20,
		});
	}

	if (analyze) {
		if (enemy.Enemy.disarm) {
			let dt = KinkyDungeonDamageTypes[enemy.Enemy.dmgType];
			if (dt) {
				let st = TextGet("KDTooltipDisarm").replace("DISARMCHANCE", "" + Math.round(enemy.Enemy.disarm * 100));
				TooltipList.push({
					str: st,
					fg: "#ffaa55",
					bg: "#000000",
					size: 20,
				});
			}
		}

		if (enemy.Enemy.dmgType) {
			let dt = KinkyDungeonDamageTypes[enemy.Enemy.dmgType];
			if (dt) {
				let st = TextGet("KinkyDungeonTooltipDealsDamage").replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + enemy.Enemy.dmgType));
				TooltipList.push({
					str: st,
					fg: dt.color,
					bg: dt.bg,
					size: 20,
				});
			}
		}
		if (enemy.Enemy.blindSight > 0) {
			let st = TextGet("KDBlindsight");
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: "#000000",
				size: 20,
			});
		}
		if (enemy.Enemy.tags.unstoppable) {
			let st = TextGet("KDunstoppable");
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: "#000000",
				size: 20,
			});
		} else if (enemy.Enemy.tags.unflinching) {
			let st = TextGet("KDunflinching");
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: "#000000",
				size: 20,
			});
		}
	}

	if (enemy.items && enemy.items.length > 0) {
		TooltipList.push({
			str: "",
			fg: "#ffaa55",
			bg: "#000000",
			size: 8,
		});
		TooltipList.push({
			str: TextGet("KDTooltipInventory"),
			fg: "#ffffff",
			bg: "#000000",
			size: 20,
		});

		for (let i = 0; i < 6 && i < enemy.items.length; i++) {
			TooltipList.push({
				str: TextGet(KinkyDungeonGetRestraintByName(enemy.items[i]) ? "Restraint" + enemy.items[i] : "KinkyDungeonInventoryItem" + enemy.items[i]),
				fg: "#ffffff",
				bg: "#000000",
				size: 18,
			});
		}
		if (enemy.items.length > 6) {
			TooltipList.push({
				str: TextGet("KDTooltipInventoryFull").replace("NUMBER", "" + (enemy.items.length - 6)),
				fg: "#ffffff",
				bg: "#000000",
				size: 18,
			});
		}


		TooltipList.push({
			str: "",
			fg: "#ffaa55",
			bg: "#000000",
			size: 8,
		});
	}

	if (analyze) {
		let map = Object.assign({}, enemy.Enemy.tags);
		if (enemy.Enemy.spellResist)
			map.magic = true;
		if (enemy.Enemy.Resistance?.profile) {
			for (let p of enemy.Enemy.Resistance?.profile) {
				for (let dt of Object.keys(KDResistanceProfiles[p])) {
					map[dt] = true;
				}
			}
		}
		let list = Array.from(Object.keys(map));
		let magic = false;
		let repeats = {};
		for (let t of list) {
			for (let dt of Object.values(KinkyDungeonDamageTypes)) {
				if ((t == dt.name + "resist" || t == dt.name + "weakness" || t == dt.name + "immune" || t == dt.name + "severeweakness")
					|| (dt.name == "magic" && t.includes("magic") && enemy.Enemy.spellResist)) {
					let mult = 1.0;
					if (t == dt.name + "resist") mult = 0.5;
					else if (t == dt.name + "weakness") mult = 1.5;
					else if (t == dt.name + "immune") mult = 0;
					else if (t == dt.name + "severeweakness") mult = 2.0;
					if (dt.name == "magic" && !magic && enemy.Enemy.spellResist) {
						magic = true;
						mult *= KinkyDungeonMultiplicativeStat(enemy.Enemy.spellResist);
					}
					let st = TextGet("KinkyDungeonTooltipWeakness").replace("MULTIPLIER", "" + Math.round(mult * 100)/100).replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType"+ dt.name));

					if (!repeats.DR) {
						TooltipList.push({
							str: "",
							fg: "#ffffff",
							bg: "#000000",
							size: 10,
						});
						TooltipList.push({
							str: TextGet("KDTooltipDamageResists"),
							fg: "#ffffff",
							bg: "#000000",
							size: 20,
						});
						repeats.DR = true;
					}
					if (!repeats[st])
						TooltipList.push({
							str: st,
							fg: dt.color,
							bg: dt.bg,
							size: 18,
						});
					repeats[st] = true;
				}
			}
		}
	}
	return KDDrawTooltip(TooltipList, offset);
}

function KDGetColor(enemy) {
	//return "#ffffff";
	if (enemy?.CustomNameColor) return enemy.CustomNameColor;
	if (enemy?.color) return enemy.color;
	if (enemy?.Enemy.color) return enemy.Enemy.color;
	return "#ffffff";
}

let KDChampionMax = 10;

/**
 *
 * @param {entity} enemy
 * @returns {boolean} Whether or not it was a Champion capture
 */
function KinkyDungeonCapture(enemy) {
	let msg = "KinkyDungeonCapture";
	let goddessCapture = false;
	if (enemy.lifetime != undefined && enemy.lifetime < 999) {
		msg = "KinkyDungeonCaptureBasic";
	} else if (KDGameData.Champion) {
		if (KDGameData.ChampionCurrent < KDChampionMax) {
			msg = "KinkyDungeonCaptureGoddess";
			let disapproval = 0;
			goddessCapture = true;
			let spell = KinkyDungeonFindSpell("Summon", true);
			if (spell) {
				KinkyDungeonCastSpell(enemy.x, enemy.y, spell, undefined, undefined, undefined);
			}
			// Is the player wearing something related to the goddess?
			if (KinkyDungeonStatsChoice.has("BoundCrusader")) {
				let uniform = ["Rope", "Leather", "Metal", "Latex"];
				if (uniform.includes(KDGameData.Champion)) uniform = [KDGameData.Champion];
				let restraints = [];
				for (let u of uniform) {
					for (let r of KinkyDungeonGetRestraintsWithShrine(u, true, true, true)) {
						restraints.push(r);
					}
				}
				let minAmount = 1;
				if (KinkyDungeonGoddessRep[KDGameData.Champion] > 10) minAmount = 2;
				if (KinkyDungeonGoddessRep[KDGameData.Champion] > 30) minAmount = 3;
				if (restraints.length < minAmount) {
					msg = "KinkyDungeonCaptureGoddess" + (minAmount == 1 ? "Low" : "None") + (uniform.includes(KDGameData.Champion) ? "Uniform" : "Restraint");
					if (minAmount == 1)
						disapproval = 1;
					else
						disapproval = 2;
				}
			}
			if (disapproval == 0) {
				KinkyDungeonChangeRep(KDGameData.Champion, KinkyDungeonGoddessRep[KDGameData.Champion] < -10 ? 1 :
					(KinkyDungeonGoddessRep[KDGameData.Champion] > 30 ? 0.25 : 0.5));
				KDGameData.ChampionCurrent += 1;
			} else goddessCapture = false;
		} else msg = "KinkyDungeonCaptureMax";
	} else msg = "KinkyDungeonCaptureBasic";

	KinkyDungeonSendEvent("capture", {enemy: enemy});
	KinkyDungeonSendActionMessage(6, TextGet(msg).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)).replace("GODDESS", TextGet("KinkyDungeonShrine" + KDGameData.Champion)), "lightgreen", 2);
	return goddessCapture;
}

/**
 *
 * @param {entity} enemy
 */
function KDDropStolenItems(enemy) {
	if (enemy.items) {
		for (let name of enemy.items) {
			if (!enemy.tempitems || !enemy.tempitems.includes(name)) {
				let item = {x:enemy.x, y:enemy.y, name: name};
				KDMapData.GroundItems.push(item);
			}
		}
		enemy.items = [];
		enemy.tempitems = undefined;
	}
}

/**
 *
 * @param {entity} enemy
 * @param {number} E
 * @returns {boolean}
 */
function KinkyDungeonEnemyCheckHP(enemy, E) {
	if (enemy.hp <= 0) {
		let noRepHit = false;
		KinkyDungeonSendEvent("death", {enemy: enemy});
		KDSpliceIndex(E, 1);
		KinkyDungeonSendEvent("kill", {enemy: enemy, capture: KDBoundEffects(enemy) > 3 && enemy.boundLevel > 0 && KDHostile(enemy) && !enemy.Enemy.tags.nocapture});
		if (KDBoundEffects(enemy) > 3 && enemy.boundLevel > 0 && KDHostile(enemy) && !enemy.Enemy.tags.nocapture && enemy.playerdmg) {
			KDDropStolenItems(enemy);
			if (!KinkyDungeonCapture(enemy)) noRepHit = true;
		} else {
			KDDropStolenItems(enemy);
			if (enemy == KinkyDungeonKilledEnemy) {
				if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 10)
					KinkyDungeonSendActionMessage(4, TextGet("Kill"+enemy.Enemy.name), "orange", 2);
				KinkyDungeonKilledEnemy = null;
			}
		}


		if (!(enemy.lifetime < 9000)) {
			if (enemy.playerdmg && !(!KinkyDungeonAggressive(enemy) && KDHelpless(enemy) && KDCanDom(enemy))) {
				if (enemy.Enemy && enemy.Enemy.tags && enemy.Enemy.tags.boss)
					KinkyDungeonChangeRep("Ghost", -3);
				else if (enemy.Enemy && enemy.Enemy.tags && enemy.Enemy.tags.miniboss)
					KinkyDungeonChangeRep("Ghost", -1);
				else if (enemy.Enemy && enemy.Enemy.tags && enemy.Enemy.tags.elite && KDRandom() < 0.33)
					KinkyDungeonChangeRep("Ghost", -1);


				if (enemy.rep)
					for (let rep of Object.keys(enemy.rep))
						KinkyDungeonChangeRep(rep, enemy.rep[rep]);

				if (enemy.factionrep)
					for (let rep of Object.keys(enemy.factionrep))
						KinkyDungeonChangeFactionRep(rep, enemy.factionrep[rep]);

				if (enemy.Enemy.rep && !KDEnemyHasFlag(enemy, "norep"))
					for (let rep of Object.keys(enemy.Enemy.rep))
						KinkyDungeonChangeRep(rep, enemy.Enemy.rep[rep]);

				if (enemy.Enemy.factionrep && !KDEnemyHasFlag(enemy, "norep"))
					for (let rep of Object.keys(enemy.Enemy.factionrep))
						KinkyDungeonChangeFactionRep(rep, enemy.Enemy.factionrep[rep]);

				if (KinkyDungeonStatsChoice.has("Vengeance")) {
					KinkyDungeonChangeDistraction(Math.max(0, Math.ceil(Math.pow(enemy.Enemy.maxhp, 0.7))), false, 0.75);
				}

				let faction = KDGetFaction(enemy);
				let amount = 0;

				if (!KinkyDungeonHiddenFactions.includes(faction)) {
					if (enemy.Enemy && enemy.Enemy.tags && enemy.Enemy.tags.boss)
						amount = 0.04;
					else if (enemy.Enemy && enemy.Enemy.tags && enemy.Enemy.tags.miniboss)
						amount = 0.02;
					else if (enemy.Enemy && enemy.Enemy.tags && enemy.Enemy.tags.elite)
						amount = 0.01;
					if (enemy.Enemy && enemy.Enemy.tags && !enemy.Enemy.tags.minor)
						amount = 0.004;
					if (enemy.Enemy && enemy.Enemy.tags && enemy.Enemy.tags.minor)
						amount = KDRandom() < 0.33 ? 0.004 : 0.001;

				}
				if (amount && !noRepHit && !enemy.Enemy.Reputation?.noRepLoss) {
					KinkyDungeonChangeFactionRep(faction, -amount);

					// For being near a faction
					let boostfactions = [];
					let hurtfactions = [];
					for (let e of KDMapData.Entities) {
						let dist = KDistChebyshev(e.x - enemy.x, e.y - enemy.y);
						if (dist < 10) {
							let faction2 = KDGetFaction(e);
							if (!KinkyDungeonHiddenFactions.includes(faction2)) {
								if (KDFactionRelation(faction, faction2) < -0.1 && !boostfactions.includes(faction2)) {
									boostfactions.push(faction2);
									let mult = 1.0;
									if (amount > 0) {
										if (KDFactionRelation("Player", faction2) > 0.5)
											mult *= 0.05;
										else if (KDFactionRelation("Player", faction2) > 0.25)
											mult *= 0.5;
									}
									KinkyDungeonChangeFactionRep(faction2, 0.5 * amount * mult * -KDFactionRelation(faction, faction2));
									// Add a favor
									KDAddFavor(faction2, amount);
								} else
								if (KDFactionRelation(faction, faction2) > 0.1 && !hurtfactions.includes(faction2)) {
									hurtfactions.push(faction2);
									KinkyDungeonChangeFactionRep(faction2, 0.5 * amount * -KDFactionRelation(faction, faction2));
								}
							}
						}
					}
				}
			} else if (!enemy.summoned && !KDIsImmobile(enemy) && !enemy.Enemy.tags.temporary) {
				if (!KDGameData.RespawnQueue) KDGameData.RespawnQueue = [];
				KDGameData.RespawnQueue.push({enemy: enemy.Enemy.name, faction: KDGetFaction(enemy)});
			}
		}

		if (enemy.ondeath) {
			for (let o of enemy.ondeath) {
				KDOndeath[o.type](enemy, o);
			}
		}
		if (enemy.Enemy.ondeath) {
			for (let o of enemy.Enemy.ondeath) {
				KDOndeath[o.type](enemy, o);
			}
		}
		KDDropItems(enemy);

		return true;
	} else if (KDHelpless(enemy)) {
		KDDropStolenItems(enemy);
		if (!enemy.droppedItems)
			KDDropItems(enemy);
	}
	return false;
}

/**
 *
 * @param {entity} enemy
 */
function KDDropItems(enemy) {
	if (!enemy.noDrop && (enemy.playerdmg || !enemy.summoned) && !enemy.droppedItems) {
		KinkyDungeonItemDrop(enemy.x, enemy.y, enemy.Enemy.dropTable, enemy.summoned);
		enemy.droppedItems = true;
		let dropped = null;
		if (enemy.data && enemy.data.shop && KDShops[enemy.data.shop] && KDShops[enemy.data.shop].items) {
			for (let i of KDShops[enemy.data.shop].items) {
				if (!enemy.tempitems || !enemy.tempitems.includes(i)) {
					dropped = {x:enemy.x, y:enemy.y, name: i};
					KDMapData.GroundItems.push(dropped);
				}
			}
		}
		if (KDEnemyHasFlag(enemy, "Shop")) {
			dropped = {x:enemy.x, y:enemy.y, name: "Gold", amount: 100};
			KDMapData.GroundItems.push(dropped);
		}
	}
}


/**
 *
 * @param {entity} Enemy
 * @returns {boolean} - If the NPC is eligible to use favors
 */
function KDFavorNPC(Enemy) {
	// Only enemies which are not temporarily allied, or summoned by you, or specifically allied (like angels), are eligible to show up in dialogue
	return Enemy && !Enemy.allied && !Enemy.Enemy.allied;
}

/**
 *
 * @param {entity} Enemy
 * @returns {number} - Gets the favor with the enemy
 */
function KDGetFavor(Enemy) {
	if (KDGameData.Favors)
		return KDGameData.Favors[KDGetFactionOriginal(Enemy)] ? KDGameData.Favors[KDGetFactionOriginal(Enemy)] : 0;
	return 0;
}

/**
 *
 * @param {entity} Enemy
 * @param {number} Amount
 */
function KDChangeFavor(Enemy, Amount) {
	KDModFavor(KDGetFactionOriginal(Enemy), Amount);
}

function KDAddFavor(Faction, Amount) {
	KDModFavor(Faction, Math.abs(Amount));
}
function KDModFavor(Faction, Amount) {
	if (!KDGameData.Favors) KDGameData.Favors = {};
	if (!KDGameData.Favors[Faction]) KDGameData.Favors[Faction] = 0;
	KDGameData.Favors[Faction] = Math.max(KDGameData.Favors[Faction] + Amount, 0);
}

function KinkyDungeonCheckLOS(enemy, player, distance, maxdistance, allowBlind, allowBars, maxFails) {
	let bs = (enemy && enemy.Enemy && enemy.Enemy.blindSight) ? enemy.Enemy.blindSight : 0;
	if (KinkyDungeonStatsChoice.get("KillSquad")) bs += 20;
	if (player.player && enemy.Enemy && (enemy.Enemy.playerBlindSight || KDAllied(enemy.Enemy))) bs = enemy.Enemy.playerBlindSight;
	return distance <= maxdistance && ((allowBlind && bs >= distance) || KinkyDungeonCheckPath(enemy.x, enemy.y, player.x, player.y, allowBars, false, maxFails));
}

function KinkyDungeonTrackSneak(enemy, delta, player, darkmult) {
	if (!enemy.vp) enemy.vp = 0;
	if (!player.player) return true;
	let sneakThreshold = enemy.Enemy.sneakThreshold ? enemy.Enemy.sneakThreshold : 2;
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak")) sneakThreshold = Math.max(0.1, sneakThreshold + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak"));
	let deltaMult = 0.7/Math.max(1, (1 + KinkyDungeonSubmissiveMult));
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowDetection")) deltaMult *= KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowDetection"));
	if (KDGameData.Outfit) {
		let outfit = KinkyDungeonGetOutfit(KDGameData.Outfit);
		if (outfit && outfit.visibility)
			deltaMult *= outfit.visibility;
	}
	if (KinkyDungeonStatsChoice.get("Conspicuous")) deltaMult *= KDConspicuousMult;
	else if (KinkyDungeonStatsChoice.get("Stealthy")) deltaMult *= KDStealthyMult;
	if (darkmult) {
		deltaMult *= KDPlayerLight/(darkmult + KDPlayerLight);
	}
	enemy.vp = Math.min(sneakThreshold * 2, enemy.vp + delta*deltaMult);
	return (enemy.vp > sneakThreshold);
}

function KinkyDungeonMultiplicativeStat(Stat) {
	if (Stat > 0) {
		return 1 / (1 + Stat);
	}
	if (Stat < 0) {
		return 1 - Stat;
	}

	return 1;
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} dist
 * @param {entity} [hostileEnemy]
 * @returns {entity[]}
 */
function KDNearbyEnemies(x, y, dist, hostileEnemy) {
	let cache = KDGetEnemyCache();
	let list = [];
	if (!cache) {
		for (let e of KDMapData.Entities) {
			if (KDistEuclidean(x - e.x, y - e.y) <= dist && (!hostileEnemy || KDHostile(e, hostileEnemy))) list.push(e);
		}
	} else {
		let e = null;
		for (let X = Math.floor(x - dist); X < Math.ceil(x + dist); X++)
			for (let Y = Math.floor(y - dist); Y < Math.ceil(y + dist); Y++)
				if (KDistEuclidean(X - x, Y - y) <= dist) {
					e = cache.get(X + "," + Y);
					if (e && (!hostileEnemy || KDHostile(e, hostileEnemy))) list.push(e);
				}
	}
	return list;
}


/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} dist
 * @returns {{x: number, y: number, tile: any}[]}
 */
function KDNearbyTiles(x, y, dist) {
	let list = [];
	for (let X = Math.floor(x - dist); X < Math.ceil(x + dist); X++)
		for (let Y = Math.floor(y - dist); Y < Math.ceil(y + dist); Y++)
			if (KDistEuclidean(X - x, Y - y) <= dist) {
				if (KinkyDungeonTilesGet(X + ',' + Y)) list.push({x: X, y: Y, tile: KinkyDungeonTilesGet(X + ',' + Y)});
			}
	return list;
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} dist
 * @param {entity} [neutralEnemy]
 * @returns {entity[]}
 */
function KDNearbyNeutrals(x, y, dist, neutralEnemy) {
	let cache = KDGetEnemyCache();
	let list = [];
	if (!cache) {
		for (let e of KDMapData.Entities) {
			if (KDistEuclidean(x - e.x, y - e.y) <= dist && (!neutralEnemy || !KDHostile(e, neutralEnemy))) list.push(e);
		}
	} else {
		let e = null;
		for (let X = Math.floor(x - dist); X < Math.ceil(x + dist); X++)
			for (let Y = Math.floor(y - dist); Y < Math.ceil(y + dist); Y++)
				if (KDistEuclidean(X - x, Y - y) <= dist) {
					e = cache.get(X + "," + Y);
					if (e && (!neutralEnemy || !KDHostile(e, neutralEnemy))) list.push(e);
				}
	}
	return list;
}

/**
 *
 * @param {*} avoidPlayer
 * @param {*} onlyPlayer
 * @param {*} Enemy
 * @param {*} playerDist
 * @param {*} minDist
 * @returns {{x: number, y: number}}
 */
function KinkyDungeonGetRandomEnemyPoint(avoidPlayer, onlyPlayer, Enemy, playerDist = 6, minDist = 6, ignoreOffLimits = false) {
	return KinkyDungeonGetRandomEnemyPointCriteria(undefined, avoidPlayer, onlyPlayer, Enemy, playerDist, minDist, ignoreOffLimits);
}

/**
 *
 * @param {*} criteria
 * @param {*} avoidPlayer
 * @param {*} onlyPlayer
 * @param {*} Enemy
 * @param {*} playerDist
 * @param {*} minDist
 * @returns {{x: number, y: number}}
 */
function KinkyDungeonGetRandomEnemyPointCriteria(criteria, avoidPlayer, onlyPlayer, Enemy, playerDist = 6, minDist = 6, ignoreOffLimits = false) {
	let tries = 0;

	while (tries < 100) {
		let points = Object.values(KDMapData.RandomPathablePoints);
		let point = points[Math.floor(points.length * KDRandom())];
		if (point) {
			let X = point.x;//1 + Math.floor(KDRandom()*(KDMapData.GridWidth - 1));
			let Y = point.y;//1 + Math.floor(KDRandom()*(KDMapData.GridHeight - 1));
			let PlayerEntity = KinkyDungeonNearestPlayer({x:X, y:Y});

			if (((!avoidPlayer || Math.sqrt((X - PlayerEntity.x) * (X - PlayerEntity.x) + (Y - PlayerEntity.y) * (Y - PlayerEntity.y)) > minDist)
				&& (!onlyPlayer || Math.sqrt((X - PlayerEntity.x) * (X - PlayerEntity.x) + (Y - PlayerEntity.y) * (Y - PlayerEntity.y)) <= playerDist))
				&& (!KinkyDungeonPointInCell(X, Y)) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y))
				&& (!Enemy || KinkyDungeonNoEnemyExceptSub(X, Y, true, Enemy))
				&& (ignoreOffLimits || !KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits || (Enemy && KinkyDungeonTilesGet(Enemy.x + "," + Enemy.x)?.Jail && KinkyDungeonTilesGet(X + "," + Y).Jail))
				&& (!criteria || criteria(X, Y))) {
				return {x: X, y:Y};
			}
		}
		tries += 1;
	}

	return undefined;
}

function KinkyDungeonGetNearbyPoint(x, y, allowNearPlayer=false, Enemy, Adjacent, ignoreOffLimits, callback) {
	let slots = [];
	for (let X = -Math.ceil(1); X <= Math.ceil(1); X++)
		for (let Y = -Math.ceil(1); Y <= Math.ceil(1); Y++) {
			if ((X != 0 || Y != 0) && KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(x + X, y + Y))) {
				// We add the slot and those around it
				slots.push({x:x + X, y:y + Y});
				slots.push({x:x + X, y:y + Y});
				slots.push({x:x + X, y:y + Y});
				if (!Adjacent)
					for (let XX = -Math.ceil(1); XX <= Math.ceil(1); XX++)
						for (let YY = -Math.ceil(1); YY <= Math.ceil(1); YY++) {
							if ((Math.abs(X + XX) > 1 || Math.abs(Y + YY) > 1) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x + XX + X, y + YY + Y))) {
								slots.push({x:x + XX + X, y:y + YY + Y});
								slots.push({x:x + XX + X, y:y + YY + Y});
								for (let XXX = -Math.ceil(1); XXX <= Math.ceil(1); XXX++)
									for (let YYY = -Math.ceil(1); YYY <= Math.ceil(1); YYY++) {
										if ((Math.abs(X + XX + XXX) > 2 || Math.abs(Y + YY + YYY) > 2) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x + XX + XXX + X, y + YYY + YY + Y))) {
											slots.push({x:x + XXX + XX + X, y:y + YYY + YY + Y});
										}
									}
							}
						}
			}
		}

	let foundslot = undefined;
	for (let C = 0; C < 100; C++) {
		let slot = slots[Math.floor(KDRandom() * slots.length)];
		if (slot && KinkyDungeonNoEnemyExceptSub(slot.x, slot.y, false, Enemy) && (ignoreOffLimits || KDPointWanderable(slot.x, slot.y))
			&& (allowNearPlayer || Math.max(Math.abs(KinkyDungeonPlayerEntity.x - slot.x), Math.abs(KinkyDungeonPlayerEntity.y - slot.y)) > 1.5)
			&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(slot.x, slot.y))
			&& (!callback || callback(slot.x, slot.y))) {
			foundslot = {x: slot.x, y: slot.y};

			C = 100;
		} else slots.splice(C, 1);
	}
	return foundslot;
}

function KinkyDungeonSetEnemyFlag(enemy, flag, duration) {
	if (!enemy.flags) enemy.flags = {};
	if (enemy.flags[flag]) {
		if (duration == 0) {
			delete enemy.flags[flag];// = undefined;
			return;
		}
		if (enemy.flags[flag] == -1) return;
		if (enemy.flags[flag] < duration) enemy.flags[flag] = duration;
	} else if (duration) enemy.flags[flag] = duration;
}

/**
 *
 * @param {entity} enemy
 * @param {number} delta
 */
function KinkyDungeonTickFlagsEnemy(enemy, delta) {
	if (enemy.flags) {
		for (let f of Object.entries(enemy.flags)) {
			if (f[1] == -1) continue;
			if (f[1] <= delta) delete enemy.flags[f[0]];
			if (f[1] > 0) enemy.flags[f[0]] = f[1] - delta;
		}
	}
}

let KinkyDungeonDamageTaken = false;
let KinkyDungeonTorsoGrabCD = 0;
let KinkyDungeonHuntDownPlayer = false;

/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KinkyDungeonHasStatus(enemy) {
	return enemy && (enemy.bind > 0 || enemy.slow > 0 || enemy.stun > 0 || enemy.freeze > 0 || enemy.silence > 0 || KinkyDungeonIsSlowed(enemy) || KDBoundEffects(enemy) > 0);
}

/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KinkyDungeonIsStunned(enemy) {
	return enemy && (enemy.stun > 0 || enemy.freeze > 0);
}

/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KinkyDungeonIsDisabled(enemy) {
	return enemy && (KinkyDungeonIsStunned(enemy) || KDBoundEffects(enemy) > 3);
}


/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KinkyDungeonIsSlowed(enemy) {
	return enemy && ((KDBoundEffects(enemy) > 0 && KDBoundEffects(enemy) < 4) || enemy.slow > 0 || enemy.bind > 0 || KinkyDungeonGetBuffedStat(enemy.buffs, "MoveSpeed") < 0);
}


/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KinkyDungeonCanCastSpells(enemy) {
	return enemy && !(KinkyDungeonIsDisabled(enemy) || enemy.silence > 0);
}

function KDCanBind(enemy) {
	return (enemy?.Enemy?.bound != undefined);
}

function KDBoundEffects(enemy) {
	if (!enemy.Enemy.bound) return 0;
	if (!enemy.boundLevel) return 0;
	let boundLevel = enemy.boundLevel ? enemy.boundLevel : 0;
	let bindAmp = 1;//KDGetBindAmp(enemy); //KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BindAmp"));
	boundLevel *= bindAmp;
	if (boundLevel >= enemy.Enemy.maxhp || (enemy.hp <= 0.1*enemy.Enemy.maxhp && boundLevel > enemy.hp)) return 4; // Totally tied
	if (boundLevel > enemy.Enemy.maxhp*0.75) return 3;
	if (boundLevel > enemy.Enemy.maxhp*0.5) return 2;
	if (boundLevel > enemy.Enemy.maxhp*0.25) return 1;
	return 0;
}


function KinkyDungeonUpdateEnemies(delta, Allied) {
	KDGameData.tickAlertTimer = false;
	KDGameData.HostileFactions = [];
	let visionMod = 1.0;
	let defeat = false;

	if (KinkyDungeonLeashingEnemy() && !KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity, KinkyDungeonLeashingEnemy())) {
		KDGameData.KinkyDungeonLeashingEnemy = 0;
	}

	/*if (KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]]) {
		if (KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]].brightness) {
			visionMod = Math.min(1.0, Math.max(0.5, KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]].brightness / 8));
		}
	}*/

	if (Allied) {
		KinkyDungeonUpdateDialogue(KinkyDungeonPlayerEntity, delta);
		let KinkyDungeonSummons = 0;
		for (let i = KDMapData.Entities.length-1; i >= 0; i--) {
			let enemy = KDMapData.Entities[i];
			KinkyDungeonUpdateDialogue(enemy, delta);
			if (KDAllied(enemy) && enemy.summoned && enemy.Enemy.allied && enemy.Enemy.CountLimit && (!enemy.lifetime || enemy.lifetime > 999)) {
				KinkyDungeonSummons += 1;
				if (KinkyDungeonSummons > KinkyDungeonSummonCount) {
					enemy.hp -= Math.max(0.1 * enemy.hp) + 1;
				}
			}
		}
	} else {
		if (KinkyDungeonTorsoGrabCD > 0) KinkyDungeonTorsoGrabCD -= 1;

		if (KDGameData.KinkyDungeonLeashedPlayer > 0) {
			KDGameData.KinkyDungeonLeashedPlayer -= 1;

			let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			if (nearestJail) {
				let xx = nearestJail.x;
				let yy = nearestJail.y;
				let jaildoor = KDGetJailDoor(xx, yy).tile;
				if (jaildoor && jaildoor.Type == "Door") {
					jaildoor.Lock = undefined;
				}
			}

		}
		KinkyDungeonUpdateFlags(delta);
	}

	KDGameData.DollCount = 0;

	// Loop 1
	for (let enemy of KDMapData.Entities) {
		if ((Allied && KDAllied(enemy)) || (!Allied && !KDAllied(enemy))) {

			let tile = KinkyDungeonTilesGet(enemy.x + "," + enemy.y);
			if (tile?.OffLimits) {
				// We remove certain flags when enemies are in an 'offlimits' area so we can get them out
				KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
			}
			if (enemy.Enemy.tags.doll) KDGameData.DollCount += 1;


			let master = KinkyDungeonFindMaster(enemy);
			if (master.master && enemy.aware) {

				if (!master.master.aware) KDEnemyAddSound(master.master, master.master.Enemy.Sound?.alertAmount != undefined ? master.master.Enemy.Sound?.alertAmount : KDDefaultEnemyAlertSound);

				master.master.aware = true;
			}
			if (master.master && master.master.aware) {

				if (!enemy.aware) KDEnemyAddSound(enemy, enemy.Enemy.Sound?.alertAmount != undefined ? enemy.Enemy.Sound?.alertAmount : KDDefaultEnemyAlertSound);

				enemy.aware = true;
			}
			if (master.info && master.info.dependent && !master.master) enemy.hp = -10000;
			else if (master.info?.dependent) enemy.boundTo = master.master.id;

			if (!enemy.castCooldown) enemy.castCooldown = 0;
			if (enemy.castCooldown > 0) {
				let cdmult = enemy.distraction ? 1 / (1 + enemy.distraction / enemy.Enemy.maxhp) : 1;
				cdmult = cdmult * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(enemy.buffs, "CastSpeed"));
				enemy.castCooldown = Math.max(0, enemy.castCooldown-delta * cdmult);
				if (enemy.castCooldown <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "specialCD"});
			}
			if (!enemy.castCooldownSpecial) enemy.castCooldownSpecial = 0;
			if (enemy.castCooldownSpecial > 0) {
				enemy.castCooldownSpecial = Math.max(0, enemy.castCooldownSpecial-delta);
				if (enemy.castCooldownSpecial <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "castCooldownSpecial"});
			}

			if (enemy.Enemy.specialCharges && enemy.specialCharges <= 0) enemy.specialCD = 999;
			KinkyDungeonTickFlagsEnemy(enemy, delta);
			if (enemy.specialCD > 0) {
				enemy.specialCD -= delta;
				if (enemy.specialCD <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "specialCD"});
			}
			if (enemy.slow > 0) {
				enemy.slow -= delta;
				if (enemy.slow <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "slow"});
			}
			if (enemy.boundLevel > 0 && !(enemy.stun > 0 || enemy.freeze > 0) && (enemy.hp > enemy.Enemy.maxhp * 0.1)) {
				let SM = KDGetEnemyStruggleMod(enemy);
				let newBound = KDPredictStruggle(enemy, SM, delta);
				enemy.boundLevel = newBound.boundLevel;
				enemy.specialBoundLevel = newBound.specialBoundLevel;

				let SR = SM * (10 + Math.pow(Math.max(0.01, enemy.hp), 0.75));
				if (SR <= 0 || KDRandom() < 0.1) {
					KDAddThought(enemy.id, "GiveUp", 5, SR <= 0 ? 4 : 1);
				} else {
					if (KDLoosePersonalities.includes(enemy.personality)) {
						KDAddThought(enemy.id, "Embarrassed", 2, 4);
					} else if (KDStrictPersonalities.includes(enemy.personality)) {
						KDAddThought(enemy.id, "Struggle", 2, 2);
					} else {
						KDAddThought(enemy.id, "Annoyed", 2, 2);
					}
				}

				if (enemy.boundLevel <= 0) {
					KDAddThought(enemy.id, "Annoyed", 5, 1);
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "boundLevel"});
				}
			}
			let vibe = KDEntityMaxBuffedStat(enemy, "Vibration");
			if (enemy.distraction > 0 || vibe) {
				let DD = KDGetEnemyDistractionDamage(enemy, vibe);
				if (DD > 0) {
					KinkyDungeonDamageEnemy(enemy, {
						damage: DD,
						type: "charm",
					}, true, true);
				}


				let DR = KDGetEnemyDistractRate(enemy, vibe);
				if (enemy.distraction > enemy.Enemy.maxhp) {
					enemy.distraction = enemy.Enemy.maxhp;
					KDAddThought(enemy.id, "Embarrassed", 7, 1);
				} else {
					if (DR <= 0 || KDRandom() < 0.1) {
						KDAddThought(enemy.id, "GiveUp", 5, DR <= 0 ? 4 : 1);
					} else {
						if (KDLoosePersonalities.includes(enemy.personality)) {
							KDAddThought(enemy.id, "Play", 1, 4);
						} else if (KDStrictPersonalities.includes(enemy.personality)) {
							KDAddThought(enemy.id, "Annoyed", 1, 3);
						} else {
							KDAddThought(enemy.id, "Embarrassed", 1, 2);
						}
					}
				}
				enemy.distraction = Math.max(0, Math.min((enemy.distraction || 0) - delta * DR, enemy.Enemy.maxhp));


				if (enemy.distraction <= 0) {
					KDAddThought(enemy.id, "Annoyed", 5, 1);
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "boundLevel"});
				}
			}

			let bindLevel = KDBoundEffects(enemy);
			let statusBonus = 1;
			if (enemy.Enemy.tags.unstoppable) statusBonus *= 4;
			else if (enemy.Enemy.tags.unflinching) statusBonus *= 2;

			if (enemy.Enemy.rage) enemy.rage = 9999;
			if (enemy.bind > 0) {
				enemy.bind -= delta;
				if (enemy.bind <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "bind"});
			}
			if (enemy.rage > 0) {
				enemy.rage -= delta;
				if (enemy.rage <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "rage"});
			}
			if (enemy.hostile > 0) {
				enemy.hostile -= delta;
				if (enemy.hostile <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "hostile"});
			}
			if (enemy.allied > 0 && enemy.allied < 9000) {
				enemy.allied -= delta;
				if (enemy.allied <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "allied"});
			}
			if (enemy.ceasefire > 0 && enemy.ceasefire < 9000) {
				enemy.ceasefire -= delta;
				if (enemy.ceasefire <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "ceasefire"});
			}
			if (enemy.blind > 0 && bindLevel < 4) {
				enemy.blind -= delta * statusBonus / (1 + 1*bindLevel);
				if (enemy.blind <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "blind"});
			}
			if (enemy.disarm > 0 && bindLevel < 4) {
				enemy.disarm -= delta * statusBonus / (1 + 1*bindLevel);
				if (enemy.disarm <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "disarm"});
			}
			if (enemy.playWithPlayer > 0) {
				enemy.playWithPlayer -= delta;
				if (enemy.playWithPlayer <= 0) {
					if (!KinkyDungeonAggressive(enemy) && !KinkyDungeonFlags.get("noResetIntentFull")) {
						KDResetIntent(enemy, AIData);
						KDAddThought(enemy.id, "Happy", 5, 1);
					}
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "playWithPlayer"});
				}
			} else enemy.playWithPlayer = 0;
			if (enemy.playWithPlayerCD > 0) {
				enemy.playWithPlayerCD -= delta;
				if (enemy.playWithPlayerCD <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "playWithPlayerCD"});
			}
			if (enemy.silence > 0 && bindLevel < 4) {
				enemy.silence -= delta * statusBonus / (1 + 1*bindLevel);
				if (enemy.silence <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "silence"});
			}
			if (enemy.disarmflag > 0 && enemy.Enemy.disarm && KinkyDungeonLastAction != "Attack") {
				enemy.disarmflag = Math.max(0, enemy.disarmflag - enemy.Enemy.disarm);
				if (enemy.disarmflag <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "disarmflag"});
			}
			if (enemy.stun > 0 || enemy.freeze > 0) {
				enemy.warningTiles = [];
				enemy.disarmflag = 0;
				enemy.fx = undefined;
				enemy.fy = undefined;
				let smult = 1 - 0.167 * KDBoundEffects(enemy);
				let fmult = KDHelpless(enemy) ? 0.1 : 1 - 0.2 * KDBoundEffects(enemy);
				if (enemy.stun > 0 && enemy.stun <= delta*smult)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "stun"});
				if (enemy.freeze > 0 && enemy.freeze <= delta*fmult)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "freeze"});
				if (enemy.stun > 0) enemy.stun = Math.max(enemy.stun - delta * smult, 0);
				if (enemy.freeze > 0) enemy.freeze = Math.max(enemy.freeze - delta * fmult, 0);
			} else if (enemy.channel > 0) {
				enemy.warningTiles = [];
				if (enemy.channel > 0) enemy.channel -= delta;

				if (enemy.channel <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "channel"});
			}
		}
	}

	KDGameData.otherPlaying = 0;
	let defeatEnemy = undefined;
	// Loop 2
	for (let E = 0; E < KDMapData.Entities.length; E++) {
		let enemy = KDMapData.Entities[E];
		if ((Allied && KDAllied(enemy)) || (!Allied && !KDAllied(enemy))) {
			if (enemy.vulnerable > 0) enemy.vulnerable -= delta;
			else enemy.vulnerable = 0;
			if (enemy.Enemy.tags.nonvulnerable && enemy.vulnerable) enemy.vulnerable = 0;
			if (!(KDGameData.KinkyDungeonPenance && KinkyDungeonAngel()) || enemy == KinkyDungeonAngel()) {
				// Delete the enemy
				if (KinkyDungeonEnemyCheckHP(enemy, E)) { E -= 1; continue;}

				let player = (!KinkyDungeonAngel()) ? KinkyDungeonNearestPlayer(enemy, false, true, enemy.Enemy.visionRadius ? (enemy.Enemy.visionRadius + ((enemy.lifetime > 0 && enemy.Enemy.visionSummoned) ? enemy.Enemy.visionSummoned : 0)) : 0, AIData) : KinkyDungeonPlayerEntity;


				if (enemy.Enemy.convertTiles) {
					let tile = KinkyDungeonMapGet(enemy.x, enemy.y);
					for (let c of enemy.Enemy.convertTiles) {
						if (c.from == tile && c.to) {
							KinkyDungeonMapSet(enemy.x, enemy.y, c.to);
						}
					}
				}

				KinkyDungeonHandleTilesEnemy(enemy, delta);

				if (enemy.Enemy.triggersTraps) {
					KinkyDungeonHandleTraps(enemy, enemy.x, enemy.y, true);
				}

				let idle = true;
				//let bindLevel = KDBoundEffects(enemy);

				if (!(
					KinkyDungeonIsDisabled(enemy)
					|| KDHelpless(enemy)
					|| enemy.channel > 0
				)) {
					let start = performance.now();

					let playerItems = [];
					if (player.player) {
						for (let inv of KinkyDungeonAllWeapon()) {
							if (inv.name != "Unarmed")
								playerItems.push(inv);
						}
						for (let inv of KinkyDungeonAllConsumable()) {
							playerItems.push(inv);
						}
					}

					let ret = KinkyDungeonEnemyLoop(enemy, player, delta, visionMod, playerItems);
					if (enemy.playWithPlayer) KDGameData.otherPlaying += 1;
					idle = ret.idle;
					if (ret.defeat) {
						defeat = true;
						defeatEnemy = enemy;
					}

					//TODO pass items to more dominant nearby enemies
					if (enemy.items && !KDEnemyHasFlag(enemy, "shop")) {
						let light = KinkyDungeonVisionGet(enemy.x, enemy.y);
						if (light == 0 && !enemy.aware && KDRandom() < 0.2) {
							//KDClearItems(enemy);
							KDRestockRestraints(enemy, enemy.Enemy.RestraintFilter?.restockPercent || 0.5);
						}
					}

					if (idle && enemy.hp > 0) {
						// Removed for non guards because its fun to find tied up girls around
						if (enemy == KinkyDungeonJailGuard())
							KDCaptureNearby(enemy);
					}

					let end = performance.now();
					if (KDDebug)
						console.log(`Took ${end - start} milliseconds to run loop for enemy ${enemy.Enemy.name}`);
				} else {
					// These happen when an enemy is disabled
					enemy.disarmflag = 0;
					enemy.fx = undefined;
					enemy.fy = undefined;
				}

				if (KDHelpless(enemy)) enemy.playWithPlayer = 0;

				if (idle) {
					// These happen when an enemy is disabled or not doing anything
					enemy.movePoints = 0;
					enemy.attackPoints = 0;
					enemy.warningTiles = [];

					// Also let go of leashes here
					if (enemy == KinkyDungeonLeashingEnemy() && (
						!enemy.playWithPlayer
						&& !enemy.IntentAction
						&& !enemy.IntentLeashPoint
						&& !KinkyDungeonFlags.get("PlayerDommed")
						&& !KinkyDungeonAggressive(enemy, KinkyDungeonPlayerEntity)
					)) {
						KDBreakTether(KinkyDungeonPlayerEntity);
					}

					KDEnemySoundDecay(enemy, delta);
				} else {
					KDEnemyAddSound(enemy, enemy.Enemy.Sound?.moveAmount != undefined ? enemy.Enemy.Sound?.moveAmount : KDDefaultEnemyMoveSound);
				}


				KinkyDungeonHandleTilesEnemy(enemy, delta);

				if (enemy.vp > 0 && (!enemy.path || enemy.path.length < 4)) {
					let sneakThreshold = enemy.Enemy.sneakThreshold ? enemy.Enemy.sneakThreshold : 2;
					if (enemy.vp > sneakThreshold * 2 && !enemy.aware) {
						let sneak = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak");
						if (sneak > 0)
							enemy.vp = Math.max(sneakThreshold + 1, Math.max(Math.min(enemy.vp, sneakThreshold), enemy.vp * 0.7 - 0.1*delta));
					}
					if (!player?.player || KDistChebyshev(enemy.x - player.x, enemy.y - player.y) > 2.5) {
						enemy.vp = Math.max(0, enemy.vp - 0.10*delta);
					}

				}

				// Delete the enemy
				if (KinkyDungeonEnemyCheckHP(enemy, E)) { E -= 1;} else {
					if (enemy.aware && (enemy.lifetime == undefined || enemy.lifetime > 9000) && !enemy.Enemy.tags.temporary && !enemy.Enemy.tags.peaceful) {
						if (enemy.hostile > 0 && enemy.hostile < 9000 && (KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'jail')) {
							if (!(enemy.silence > 0) && KDEnemyCanSignalOthers(enemy)) {
								KDGameData.tickAlertTimer = true;
								if (KDistChebyshev(KinkyDungeonPlayerEntity.x - enemy.x, KinkyDungeonPlayerEntity.y - enemy.y) < 9 && !KDGameData.HostileFactions.includes(KDGetFaction(enemy))) {
									KDGameData.HostileFactions.push(KDGetFaction(enemy));
								}
							}
						} else if (KinkyDungeonAggressive(enemy)) {
							if (!(enemy.silence > 0) && KDEnemyCanSignalOthers(enemy)) {
								KDGameData.tickAlertTimer = true;
								if (KDistChebyshev(KinkyDungeonPlayerEntity.x - enemy.x, KinkyDungeonPlayerEntity.y - enemy.y) < 9 && !KDGameData.HostileFactions.includes(KDGetFaction(enemy))) {
									KDGameData.HostileFactions.push(KDGetFaction(enemy));
								}
							}
						}
					}
				}
				if (enemy.Enemy.regen && (enemy.hp > 0.01 || enemy.Enemy.regen < 0)) enemy.hp = Math.min(enemy.Enemy.maxhp, enemy.hp + enemy.Enemy.regen * delta);
				if (enemy.Enemy.lifespan || enemy.lifetime != undefined) {
					if (enemy.lifetime == undefined) enemy.lifetime = enemy.Enemy.lifespan;
					if (enemy.lifetime <= 9000)
						enemy.lifetime -= delta;
					if (enemy.lifetime <= 0) enemy.hp = -10000;
				}
				if (enemy.boundTo) {
					if (enemy.boundTo == -1) {
						if (KDPlayerIsDefeated()) enemy.hp = 0;
						if (enemy.weakBinding && KDPlayerIsStunned()) enemy.hp = Math.max(0, enemy.hp - enemy.Enemy.maxhp*0.2);
					} else if (!KinkyDungeonFindID(enemy.boundTo) || KDHelpless(KinkyDungeonFindID(enemy.boundTo)) || (enemy.weakBinding && KinkyDungeonIsDisabled(KinkyDungeonFindID(enemy.boundTo)))) enemy.hp = 0;
				}
				if (enemy.fx && !enemy.Enemy.noFlip) {
					if (Math.sign(enemy.fx - enemy.x) < 0) {
						delete enemy.flip;
					} else if (Math.sign(enemy.fx - enemy.x) > 0) {
						enemy.flip = true;
					}
				}
			}
		}
	}


	if (!Allied) {
		// vulnerability calc
		for (let i = KDMapData.Entities.length-1; i >= 0; i--) {
			let enemy = KDMapData.Entities[i];
			// Make it so you can backstab enemies while your allies fight them
			KDCheckVulnerableBackstab(enemy);
			// Alert enemies if youve aggroed one
			if (!KDAllied(enemy) && !(enemy.ceasefire > 0)) {
				if (!(enemy.hostile > 0)
					&& KDGameData.HostileFactions.length > 0
					&& !KinkyDungeonAggressive(enemy)
					&& !enemy.Enemy.tags.peaceful
					&& (enemy.vp > 0.5 || enemy.lifetime < 900
						|| (!KDHostile(enemy)
							&& KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 7))) {
					for (let f of KDGameData.HostileFactions) {
						let f2 = KDGetFaction(enemy);
						if ((f2 != "Player") && (
							// Either the player has aggroed second faction for some reason or this faction is dishonorable
							KDGetHonor(f, f2) < 0
							|| !KDFactionHostile("Player", f2)
						)
							&& (
								(KDFactionRelation(f, f2) > 0.15 && KDFactionRelation(f, f2) < 0.5 && // Favored
									KDFactionRelation("Player", f2) < 0.2)
								|| (KDFactionRelation(f, f2) >= 0.5 && // Allied
									KDFactionRelation("Player", f2) < 0.4)
							)
						) {
							if (!(enemy.hostile > 0) &&
								(enemy.Enemy.tags.jail || enemy.Enemy.tags.jailer || KDGetEnemyPlayLine(enemy))) {
								let h = f == (KDGetFaction(enemy)) ? "Defend" : "Honor";
								let suff = KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) + h : h;
								let index = ("" + Math.floor(Math.random() * 3));

								if (!enemy.dialogue || !enemy.dialogueDuration)
									KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailChase" + suff + index).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 7, (!KDGameData.PrisonerState) ? 3 : 5);
							}
							KDMakeHostile(enemy, KDMaxAlertTimer);
						}
					}
				}
			}
		}

		let alertingFaction = false;
		for (let f of KDGameData.HostileFactions) {
			if (KDFactionRelation("Jail", f) > -0.01 && KDFactionRelation("Chase", f) > -0.01) {
				alertingFaction = true;
			}
		}
		if (KDGameData.tickAlertTimer && (KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'jail') && alertingFaction) {
			if (KDGameData.AlertTimer < 3*KDMaxAlertTimer) KDGameData.AlertTimer += delta;
		} else if (KDGameData.AlertTimer > 0) {
			KDGameData.AlertTimer -= delta * 3;
		}
		if (KDGameData.AlertTimer >= KDMaxAlertTimer) {
			KinkyDungeonStartChase(undefined, "Alert");
		}

		KinkyDungeonHandleJailSpawns(delta);
		KinkyDungeonHandleWanderingSpawns(delta);
		KinkyDungeonAlert = 0;
	}

	if (defeat) {
		if (KDCustomDefeat) KDCustomDefeat();
		else if (!KinkyDungeonFlags.get("CustomDefeat"))
			KinkyDungeonDefeat(KinkyDungeonFlags.has("LeashToPrison"), defeatEnemy);
	}
	KDCustomDefeat = null;
}

/** @type {() => void} */
let KDCustomDefeat = null;

function KDMakeHostile(enemy, timer) {
	if (!timer) timer = KDMaxAlertTimerAggro;
	if (!enemy.hostile) enemy.hostile = timer;
	else enemy.hostile = Math.max(enemy.hostile, timer);
}

/**
 * Makes an enemy vulnerable if you are behind them
 * @param {entity} enemy
 */
function KDCheckVulnerableBackstab(enemy) {
	if (KinkyDungeonAggressive(enemy) && enemy != KinkyDungeonLeashingEnemy()) {
		if (enemy.fx && enemy.fy && KDistChebyshev(enemy.fx - enemy.x, enemy.fy - enemy.y) < 1.5 && !enemy.Enemy.tags.noflank) {
			if (enemy.x * 2 - enemy.fx == KinkyDungeonPlayerEntity.x && enemy.y * 2 - enemy.fy == KinkyDungeonPlayerEntity.y) {
				KDAddThought(enemy.id, "Annoyed", 4, 1);
				enemy.vulnerable = Math.max(enemy.vulnerable, 1);
				return true;
			}
		}
	}
	return false;
}

/**
 *
 * @param {entity} enemy
 * @returns {string}
 */
function KDGetAI(enemy) {
	if (enemy.AI) return enemy.AI;
	else return enemy.Enemy.AI;
}

/**
 * @type {Map<number, {name: string, priority: number, duration: number, index: number}>}
 */
let KDThoughtBubbles = new Map();

function KDAddThought(id, name, priority, duration) {
	let pri = -1;
	let n = "";
	let i = 0;
	let d = 1;
	if (KDThoughtBubbles.has(id)) {
		pri = KDThoughtBubbles.get(id).priority;
		n = KDThoughtBubbles.get(id).name;
		d = KDThoughtBubbles.get(id).duration;
		i = KDThoughtBubbles.get(id).index;
	}
	// Different name means the bubble is refreshed
	if (priority > pri || (n != name && KinkyDungeonCurrentTick > d + i) || (n != name && priority >= pri)) {
		KDThoughtBubbles.set(id, {
			name: name,
			priority: priority,
			duration: duration,
			index: KinkyDungeonCurrentTick,
		});
	}
}

function KDGetEnemyPlayLine(enemy) {
	return enemy.playLine || enemy.Enemy.playLine || "";
}

/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDEnemyCanTalk(enemy) {
	return enemy.Enemy && !enemy.Enemy.tags?.gagged && (enemy.Enemy.tags.jailer || enemy.Enemy.tags.jail || KDGetEnemyPlayLine(enemy)) && !(enemy.silence > 0);
}

/** @type {KDAIData} */
let AIData = {};

/**
 *
 * @param {entity} enemy
 * @param {*} player
 * @param {number} delta
 * @param {number} visionMod
 * @param {item[]} playerItems
 * @returns {{idle: boolean, defeat: boolean, defeatEnemy: entity}}
 */
function KinkyDungeonEnemyLoop(enemy, player, delta, visionMod, playerItems) {
	AIData = {};

	//let allied = KDAllied(enemy);
	//let hostile = KDHostile(enemy);

	AIData.player = player;
	AIData.defeat = false;
	AIData.idle = true;
	AIData.moved = false;
	AIData.ignore = false;
	AIData.visionMod = visionMod;
	AIData.followRange = enemy.Enemy.followRange == 1 ? 1.5 : enemy.Enemy.followRange;
	AIData.visionRadius = enemy.Enemy.visionRadius ? (enemy.Enemy.visionRadius + ((enemy.lifetime > 0 && enemy.Enemy.visionSummoned) ? enemy.Enemy.visionSummoned : 0)) : 0;
	let AIType = KDAIType[enemy.AI ? enemy.AI : enemy.Enemy.AI];
	if (AIData.visionMod && AIData.visionRadius > 1.5) AIData.visionRadius = Math.max(1.5, AIData.visionRadius * AIData.visionMod);
	AIData.chaseRadius = (enemy.Enemy.Awareness?.chaseradius != undefined) ? enemy.Enemy.Awareness.chaseradius
		: 10 + 1.5*(Math.max(AIData.followRange, 0)) + 1.5*Math.max(AIData.visionRadius ? AIData.visionRadius : 0, enemy.Enemy.blindSight ? enemy.Enemy.blindSight : 0);
	AIData.blindSight = (enemy && enemy.Enemy && enemy.Enemy.blindSight) ? enemy.Enemy.blindSight : 0;
	if (KinkyDungeonStatsChoice.get("KillSquad")) {
		AIData.visionRadius *= 2;
		AIData.chaseRadius *= 2;
		AIData.blindSight += 20;
		if (AIData.blindSight > AIData.visionRadius) {
			AIData.visionRadius = AIData.blindSight;
		}
		if (AIData.blindSight > AIData.chaseRadius) {
			AIData.chaseRadius = AIData.blindSight;
		}
	}
	AIData.ignoreLocks = enemy.Enemy.keys || enemy.keys || enemy == KinkyDungeonJailGuard() || (KDEnemyHasFlag(enemy, "keys"));
	AIData.harmless = (KinkyDungeonPlayerDamage.dmg <= enemy.Enemy.armor || !KinkyDungeonHasWill(0.1)) && !KinkyDungeonFlags.has("PlayerCombat") && !KinkyDungeonCanTalk() && !KinkyDungeonCanUseWeapon() && KinkyDungeonSlowLevel > 1;

	AIData.directionOffset = enemy.Enemy.nonDirectional ? 0 : (enemy.flip ? Math.max(1, AIData.visionRadius - 2) : -Math.max(1, AIData.visionRadius - 2));

	AIData.playerDist = KDistEuclidean(enemy.x - player.x, enemy.y - player.y);
	AIData.playerDistDirectional = KDistEuclidean(enemy.x + AIData.directionOffset - player.x, enemy.y - player.y);
	if (AIData.playerDistDirectional < AIData.playerDist && AIData.playerDist < Math.abs(AIData.directionOffset)) AIData.playerDistDirectional = 0; // Within AIData.directionOffset
	AIData.hostile = KDHostile(enemy, player);
	AIData.allied = KDAllied(enemy);
	AIData.aggressive = KinkyDungeonAggressive(enemy, player);
	AIData.domMe = (player.player && AIData.aggressive) ? false : KDCanDom(enemy);

	AIData.leashing = enemy.Enemy.tags.leashing && (KDFactionRelation(KDGetFaction(enemy), "Jail")) > -0.5;
	AIData.highdistraction = enemy.distraction > 0 && enemy.distraction >= enemy.Enemy.maxhp * 0.9;
	AIData.distracted = AIData.highdistraction && KDLoosePersonalities.includes(enemy.personality);
	// Check if the enemy ignores the player
	if (player.player && !KDAllied(enemy)) {
		if (AIData.playerDist < 1.5 && KinkyDungeonAllRestraint().some((r) => {return KDRestraint(r).ignoreNear;})) AIData.ignore = true;
		if (!AIData.leashing && !KinkyDungeonHasWill(0.1) && KinkyDungeonAllRestraint().some((r) => {return KDRestraint(r).ignoreIfNotLeash;})) AIData.ignore = true;

		if (enemy != KinkyDungeonLeashingEnemy() && enemy != KinkyDungeonJailGuard() && (!KinkyDungeonFlags.has("PlayerCombat") || enemy.Enemy.tags.ignorebrat)) {
			if (enemy.Enemy.tags.ignorenoSP && !KinkyDungeonHasWill(0.1)) AIData.ignore = true;
			if ((KDGetFaction(enemy) == "Ambush" || enemy.Enemy.tags.ignoreharmless) && (!enemy.warningTiles || enemy.warningTiles.length == 0)
				&& AIData.harmless && (!enemy.Enemy.ignorechance || KDRandom() < enemy.Enemy.ignorechance || !KinkyDungeonHasWill(0.1))) AIData.ignore = true;
			if (enemy.Enemy.tags.ignoretiedup && (!enemy.warningTiles || enemy.warningTiles.length == 0) && enemy.lifetime == undefined
				&& !KinkyDungeonCanUseWeapon() && !KinkyDungeonCanTalk() && KinkyDungeonSlowLevel > 1
				&& (!enemy.Enemy.ignorechance || KDRandom() < enemy.Enemy.ignorechance || !KinkyDungeonHasWill(0.1))) AIData.ignore = true;
			if (enemy.Enemy.tags.ignoregagged && (!enemy.warningTiles || enemy.warningTiles.length == 0) && enemy.lifetime == undefined
				&& !KinkyDungeonCanTalk()
				&& (!enemy.Enemy.ignorechance || KDRandom() < enemy.Enemy.ignorechance || !KinkyDungeonHasWill(0.1))) AIData.ignore = true;
			if (enemy.Enemy.tags.ignoreboundhands && (!enemy.warningTiles || enemy.warningTiles.length == 0) && enemy.lifetime == undefined
				&& (KinkyDungeonPlayerDamage.dmg <= enemy.Enemy.armor || !KinkyDungeonHasWill(0.1)) && !KinkyDungeonCanUseWeapon()
				&& (!enemy.Enemy.ignorechance || KDRandom() < enemy.Enemy.ignorechance || !KinkyDungeonHasWill(0.1))) AIData.ignore = true;
		}
		if (enemy.Enemy.ignoreflag) {
			for (let f of enemy.Enemy.ignoreflag) {
				if (KinkyDungeonFlags.get(f)) AIData.ignore = true;
			}
		}
		// Instead of leashing we ignore
		if (enemy.Enemy.tags.leashing && !AIData.leashing && !KinkyDungeonHasWill(0.1) && !KinkyDungeonCanUseWeapon() && KDIsPlayerTethered(player)) {
			AIData.ignore = true;
		}
		if (!AIData.aggressive && !(enemy.rage > 0) && !enemy.Enemy.alwaysHostile && (!enemy.playWithPlayer || !player.player)) AIData.ignore = true;
		if (AIData.distracted) AIData.ignore = true;

		// If the player is already being held by another NPC and is not resisting
		if (KinkyDungeonFlags.get("PlayerDommed") && !KDPlayerDeservesPunishment(enemy, player)) AIData.ignore = true;
	}

	if (KDOverrideIgnore(enemy, player)) AIData.ignore = false;

	AIData.MovableTiles = KinkyDungeonMovableTilesEnemy;
	AIData.AvoidTiles = "" + KDDefaultAvoidTiles;
	if (enemy.Enemy.tags && enemy.Enemy.tags.opendoors) AIData.MovableTiles = KinkyDungeonMovableTilesSmartEnemy;
	if (enemy.Enemy.ethereal) {
		AIData.AvoidTiles = "";
		AIData.MovableTiles = AIData.MovableTiles + "1X";
	} else if (enemy.Enemy.squeeze && KinkyDungeonLeashingEnemy()?.id != enemy.id) {
		AIData.MovableTiles = AIData.MovableTiles + 'b';
		AIData.AvoidTiles = "";
	}

	AIData.attack = enemy.Enemy.attack;
	AIData.range = (enemy.Enemy.attackRange == 1 ? 1.5 : enemy.Enemy.attackRange) + KinkyDungeonGetBuffedStat(enemy.buffs, "AttackRange");
	AIData.width = enemy.Enemy.attackWidth + KinkyDungeonGetBuffedStat(enemy.buffs, "AttackWidth");
	AIData.bindLevel = KDBoundEffects(enemy);
	AIData.accuracy = enemy.Enemy.accuracy ? enemy.Enemy.accuracy : 1.0;
	if (enemy.distraction) AIData.accuracy = AIData.accuracy / (1 + 1.5 * enemy.distraction / enemy.Enemy.maxhp);
	if (AIData.bindLevel) AIData.accuracy = AIData.accuracy / (1 + 0.5 * AIData.bindLevel);
	if (enemy.blind > 0) AIData.accuracy = 0;
	AIData.vibe = false;
	AIData.damage = enemy.Enemy.dmgType;
	AIData.power = enemy.Enemy.power + KinkyDungeonGetBuffedStat(enemy.buffs, "AttackPower");

	AIData.targetRestraintLevel = 0.25 + (enemy.aggro && !enemy.playWithPlayer ? enemy.aggro : 0) + 0.004 * (KinkyDungeonGoddessRep.Prisoner + 50);
	if (enemy.aggro > 0 && delta > 0 && enemy.aggro > enemy.hp / enemy.Enemy.maxhp) enemy.aggro = enemy.aggro * 0.95;
	if (KinkyDungeonStatsChoice.has("NoWayOut") || (enemy.playWithPlayer > 0 && !KinkyDungeonAggressive(enemy)) || enemy.hp < enemy.Enemy.maxhp * 0.5 || !KDIsHumanoid(enemy)) AIData.targetRestraintLevel = 999;
	if (enemy.Enemy.Behavior?.thorough) AIData.targetRestraintLevel = Math.max(AIData.targetRestraintLevel, enemy.Enemy.Behavior?.thorough);
	AIData.addLeash = AIData.leashing && KDBoundPowerLevel >= AIData.targetRestraintLevel && (!KinkyDungeonGetRestraintItem("ItemNeck") || !KinkyDungeonGetRestraintItem("ItemNeckRestraints"));
	if (!AIData.addLeash && AIData.leashing && enemy.IntentLeashPoint && (!KinkyDungeonGetRestraintItem("ItemNeck") || !KinkyDungeonGetRestraintItem("ItemNeckRestraints"))) AIData.addLeash = true;

	if (enemy.Enemy.tags && AIData.leashing && (!KinkyDungeonHasWill(0.1) || AIData.addLeash)) {
		AIData.followRange = 1.5;
		if (!AIData.attack.includes("Bind")) AIData.attack = "Bind" + AIData.attack;
	}

	AIData.refreshWarningTiles = false;

	AIData.hitsfx = (enemy.Enemy && enemy.Enemy.hitsfx) ? enemy.Enemy.hitsfx : "";
	// Only target the player for alerts
	if (KinkyDungeonAlert && player.player && AIData.playerDist < KinkyDungeonAlert) {
		if (KDPlayerLight < 1.5 && AIData.playerDist < KinkyDungeonAlert*0.5) {
			if (!enemy.aware && AIData.aggressive) KDAddThought(enemy.id, "Blind", 3, 3);
		} else {
			if (!enemy.aware && AIData.aggressive) {
				KDAddThought(enemy.id, "Aware", 3, 3);
				if (KDRandom() < actionDialogueChanceIntense)
					KinkyDungeonSendDialogue(enemy,
						TextGet("KinkyDungeonRemindJailChase" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Alert")
							.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy),
						4, 5, false, true);
			}

			if (!enemy.aware) KDEnemyAddSound(enemy, enemy.Enemy.Sound?.alertAmount != undefined ? enemy.Enemy.Sound?.alertAmount : KDDefaultEnemyAlertSound);

			enemy.aware = true;

			if (!enemy.aggro) enemy.aggro = 0;
			enemy.aggro += 0.1;
		}

	}
	let specialCondition = enemy.Enemy.specialAttack != undefined && (!enemy.specialCD || enemy.specialCD <= 0) && (!enemy.Enemy.specialMinrange || AIData.playerDist > enemy.Enemy.specialMinrange);
	let specialConditionSpecial = (enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialCondition) ? KDSpecialConditions[enemy.Enemy.specialCondition].criteria(enemy, AIData) : true;
	if (specialCondition && specialConditionSpecial) {
		AIData.attack = AIData.attack + enemy.Enemy.specialAttack;
		if (!enemy.attackPoints) {
			AIData.refreshWarningTiles = !enemy.usingSpecial;
			enemy.usingSpecial = true;
		}

		if (enemy.Enemy && enemy.Enemy.hitsfxSpecial) AIData.hitsfx = enemy.Enemy.hitsfxSpecial;

		if (enemy.Enemy.specialRemove) AIData.attack = AIData.attack.replace(enemy.Enemy.specialRemove, "");
		if (enemy.Enemy.specialRange && enemy.usingSpecial) {
			AIData.range = enemy.Enemy.specialRange == 1 ? 1.5 : enemy.Enemy.specialRange;
		}
		if (enemy.Enemy.specialWidth && enemy.usingSpecial) {
			AIData.width = enemy.Enemy.specialWidth;
		}
		if (enemy.Enemy.specialPower && enemy.usingSpecial) {
			AIData.power = enemy.Enemy.specialPower;
		}
		if (enemy.Enemy.specialDamage && enemy.usingSpecial) {
			AIData.damage = enemy.Enemy.specialDamage;
		}
	}
	if (enemy.usingSpecial && !specialConditionSpecial) {
		enemy.usingSpecial = false;
		if (KDSpecialConditions[enemy.Enemy.specialCondition].resetCD) enemy.specialCD = enemy.Enemy.specialCD;
	}

	AIData.addMoreRestraints = KinkyDungeonStatsChoice.has("NoWayOut") || !AIData.leashing || (AIData.attack.includes("Bind")
		&& (
			KDBoundPowerLevel < AIData.targetRestraintLevel // General restraint level
			|| (enemy.Enemy.Behavior && (
				enemy.Enemy.Behavior.ensureGroupTied?.some((group) => {return KinkyDungeonGetRestraintItem(group) != undefined;}) // Some enemies won't stop until these groups are filled
				|| enemy.Enemy.Behavior.ensurePlayerTag?.some((tag) => {return KinkyDungeonPlayerTags.has(tag);}) // Some enemies won't stop until these tags are had
				|| (KinkyDungeonStatsChoice.get("arousalMode") &&
					(enemy.Enemy.Behavior.ensureGroupTied?.some((group) => {return KinkyDungeonGetRestraintItem(group) != undefined;}) // Some enemies won't stop until these groups are filled
					|| enemy.Enemy.Behavior.ensurePlayerTag?.some((tag) => {return KinkyDungeonPlayerTags.has(tag);})))) // Some enemies won't stop until these tags are had
			)
			|| !KinkyDungeonIsArmsBound() // All enemies should bind arms or have ignore tag
		)
	);

	if (!enemy.Enemy.attackWhileMoving && AIData.range > AIData.followRange) {
		AIData.followRange = AIData.range;
	}
	if (player.player && enemy.Enemy && enemy.Enemy.playerFollowRange) AIData.followRange = enemy.Enemy.playerFollowRange == 1.5 ? 1.5 : enemy.Enemy.playerFollowRange;

	if (!enemy.warningTiles) enemy.warningTiles = [];
	AIData.canSensePlayer = !AIData.distracted
		&& KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.visionRadius, true, true);
	if (AIData.canSensePlayer && !AIData.distracted) {
		AIData.canSeePlayer = KinkyDungeonCheckLOS(enemy, player, AIData.playerDistDirectional, AIData.visionRadius, false, false);
		AIData.canSeePlayerChase = (enemy.aware ? KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.chaseRadius, false, false) : false);
		AIData.canSeePlayerMedium = KinkyDungeonCheckLOS(enemy, player, AIData.playerDistDirectional, AIData.visionRadius/2, false, true);
		AIData.canSeePlayerClose = KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.visionRadius/2, false, true);
		AIData.canSeePlayerVeryClose = KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.visionRadius/3, false, true);
		AIData.canShootPlayer = KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.visionRadius, false, true);
	}


	if (KinkyDungeonLastTurnAction && AIData.canSeePlayer) {
		if (!enemy.aggro) enemy.aggro = 0;
		enemy.aggro += KinkyDungeonLastTurnAction == "Struggle" ? 0.1 :
			(KinkyDungeonLastTurnAction == "Spell" ? 0.3 :
				(KinkyDungeonLastTurnAction == "Attack" ? 0.25 :
					0.01));
	}

	if ((enemy.Enemy.projectileAttack || enemy.Enemy.projectileTargeting) && (!AIData.canShootPlayer || !KinkyDungeonCheckProjectileClearance(enemy.x, enemy.y, player.x, player.y))) AIData.followRange = 1.5;

	if (!AIData.aggressive && !enemy.Enemy.alwaysHostile && !(enemy.rage > 0) && AIData.canSeePlayer && player.player && !KDAllied(enemy)
		&& ((!KinkyDungeonFlags.has("nojailbreak") && !KinkyDungeonPlayerInCell(true, true)) || KinkyDungeonLastTurnAction == "Struggle" || KinkyDungeonLastAction == "Struggle")) {
		if (enemy.Enemy.tags.jailer || enemy.Enemy.tags.jail || enemy.Enemy.tags.leashing) {
			if (KDGameData.PrisonerState == 'parole' && !KinkyDungeonIsArmsBound() && !KDEnemyHasFlag(enemy, "Shop"))
				KinkyDungeonAggroAction('unrestrained', {enemy: enemy});
			else if ((KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'jail') && (KinkyDungeonLastTurnAction == "Struggle" || KinkyDungeonLastAction == "Struggle"))
				KinkyDungeonAggroAction('struggle', {enemy: enemy});
			else if (
				(!KinkyDungeonFlags.has("nojailbreak") && !KinkyDungeonPlayerInCell(true, true))
				&& KDGameData.PrisonerState == 'jail'
				&& !KDIsPlayerTethered(KinkyDungeonPlayerEntity)
				&& KinkyDungeonSlowLevel < 9)
				KinkyDungeonAggroAction('jailbreak', {enemy: enemy});
		}
		AIData.ignore = !AIData.aggressive && (!enemy.playWithPlayer || !player.player);
	}

	let sneakThreshold = enemy.Enemy.sneakThreshold ? enemy.Enemy.sneakThreshold : 2;
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak")) sneakThreshold = Math.max(0.1, sneakThreshold + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak"));

	AIData.playAllowed = false;
	AIData.startedDialogue = false;
	AIData.playChance = 0.1;
	if (KDGameData.JailKey) AIData.playChance += 0.25;
	if (AIData.playerDist < 1.5) AIData.playChance += 0.1;

	if (!enemy.personality) enemy.personality = KDGetPersonality(enemy);

	if (AIData.playerDist < enemy.Enemy.visionRadius / 2) AIData.playChance += 0.1;
	if (AIData.playerDist < 1.5) AIData.playChance += 0.3;

	if (KDAllied(enemy) || (!AIData.hostile && KDGameData.PrisonerState != "jail" && KDGameData.PrisonerState != "parole" && !KinkyDungeonStatsChoice.has("Submissive"))) AIData.playChance *= 0.07; // Drastically reduced chance to play if not hostile
	else {
		if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed) {
			AIData.playChance += 0.25;
		}
		if (playerItems?.length > 0 || KinkyDungeonRedKeys > 0) {
			AIData.playChance += 0.2;
			if (playerItems.length > 6) {
				AIData.playChance += 0.5;
			}
		}
	}
	if (AIData.domMe) {
		AIData.playChance += 0.2;
	} else if (!KDPlayerIsTied()) {
		AIData.playChance *= 0.4;
	}
	// Reduce chance of play in combat
	if (KinkyDungeonFlags.get("PlayerCombat")) AIData.playChance *= 0.2;
	if (!KinkyDungeonFlags.get("wander")) AIData.playChance *= 0.75;
	if (enemy.path?.length > 2) AIData.playChance *= 0.1;
	if (KDGameData.otherPlaying > 0) AIData.playChance *= Math.max(0.05, 1 - 0.35 * KDGameData.otherPlaying);

	if (KDEnemyHasFlag(enemy, "Shop")) AIData.playChance = 0;
	if (KinkyDungeonFlags.get("playLikely")) AIData.playChance += 0.5;


	if (KinkyDungeonStatsChoice.get("Undeniable")) {
		if (AIData.playChance < 0.1) AIData.playChance = 0.1;
		else AIData.playChance = 0.9;
	}
	let aware = (enemy.vp > sneakThreshold || enemy.aware);

	let playData = {
		playChance: AIData.playChance,
		AIData: AIData,
		enemy: enemy,
		player: player,
	};
	KinkyDungeonSendEvent("calcPlayChance", playData);
	AIData.playChance = playData.playChance;

	if (KDEnemyHasFlag(enemy, "forcePlay")) AIData.playChance = 1.0;

	if (KinkyDungeonCanPlay(enemy) && enemy != KinkyDungeonJailGuard() && !KinkyDungeonFlags.get("NPCCombat") && !enemy.Enemy.alwaysHostile && !(enemy.rage > 0) && !(enemy.hostile > 0) && player.player && AIData.canSeePlayer && (aware) && KDEnemyCanTalk(enemy) && !KinkyDungeonInJail(KDJailFilters)) {
		AIData.playAllowed = true;
		if (!(enemy.playWithPlayerCD > 0) && !(enemy.playWithPlayer > 0) && KDRandom() < AIData.playChance && !KDAllied(enemy)) {
			AIData.playEvent = true;
		}
	}

	// Intent events
	if (enemy.vp < 0.01 && !KDEnemyHasFlag(enemy, "noResetIntent")) {
		KDResetIntent(enemy, AIData);
	}

	if (player.player && AIData.canSeePlayer && aware && !enemy.IntentAction) {
		let event = KDGetIntentEvent(enemy, AIData, AIData.playEvent, KDAllied(enemy), AIData.hostile, AIData.aggressive);
		if (event) event(enemy, AIData);
	}


	if (KinkyDungeonCanPutNewDialogue() && AIData.playerDist <= KinkyDungeonMaxDialogueTriggerDist && player.player) {
		let dialogue = KDGetDialogueTrigger(enemy, AIData);
		if (dialogue) {
			KDStartDialog(dialogue,enemy.Enemy.name, true, enemy.personality, enemy);
			AIData.startedDialogue = true;
		}
	}

	// Intro line
	if (enemy.aware && (enemy.Enemy.bound || enemy.intro || enemy.Enemy.intro) && player?.player && (enemy.CustomName || enemy.intro || enemy.Enemy.intro) && !KDEnemyHasFlag(enemy, "PatronIntro")) {
		KinkyDungeonSendDialogue(enemy, (
			enemy.intro || TextGet("KinkyDungeonRemindJail" + (enemy.Enemy.intro || (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "")) + "Intro")
		)
			.replace("EnemyName", TextGet("Name" + enemy.Enemy.name))
			.replace("PTRN", enemy.CustomName), KDGetColor(enemy), 12, 10);
		KinkyDungeonSetEnemyFlag(enemy, "PatronIntro", 9999);
	}

	let intentAction = (enemy.IntentAction && KDIntentEvents[enemy.IntentAction]) ? KDIntentEvents[enemy.IntentAction] : null;

	if (!AIData.aggressive && player.player && (enemy.playWithPlayer || (intentAction && intentAction.forceattack))) AIData.ignore = false;

	AIData.canAggro = player && ((AIData.hostile
		|| (player.player && enemy.playWithPlayer && !AIData.domMe))
		|| (!player.player && (
			!player.Enemy
			|| KDHostile(player)
			|| enemy.rage > 0)));
	AIData.wantsToAttack = AIData.canAggro && (
		(!player.player // NPCs will aggro NPCs no questions asked
			|| ( // However there are situations where the player will not get attacked
				!AIData.ignore // For example if the player is ignored
				&& ( // In order to be attacked the player must fulfill one of these conditions
					( // The most common is that the player is not currently leashed
						!KDGameData.KinkyDungeonLeashedPlayer
						|| !KDIsPlayerTethered(player))
					|| KinkyDungeonFlags.get("overrideleashprotection") // The player is leashed but something allows her to be attacked anyway
					|| KDIsPlayerTetheredToLocation(player, enemy.x, enemy.y, enemy) // The player is attached to this enemy
					|| enemy.id == KinkyDungeonLeashingEnemy()?.id // The player is being leashed by this enemy
					|| KinkyDungeonFlags.has("PlayerCombat") // If the player is fighting back
				// Basically the result of all this is that only the leashing enemy will attack a leashed player
				// Unless the player is resisting being leashed
				)
			)) ?
			// If we meet the above conditions, we still have to consult whether or not the intent action gates it
			((intentAction?.decideAttack) ?
				(intentAction.decideAttack(enemy, player, AIData, AIData.allied, AIData.hostile, AIData.aggressive))
				: true)
			// Otherwise if we dont meet the conditions we dont want to attack
			: false
	);
	AIData.wantsToCast = player && (
		(!player.player || ( // We cast spells at NPCs since enemies dont want to capture NPCs (yet)
			!AIData.ignore
			&& (player.player && (
				// Unlike attacking, we only cast spells at a leashed player if they are resisting
				(!KDGameData.KinkyDungeonLeashedPlayer || !KDIsPlayerTethered(player))
				|| KinkyDungeonFlags.get("PlayerCombat")))
		)) ?
		// Same thing as attacking but for spells
		((intentAction?.decideSpell) ?
			(intentAction.decideSpell(enemy, player, AIData, AIData.allied, AIData.hostile, AIData.aggressive))
			: true)
		// Otherwise if we dont meet the conditions we dont want to cast
		: false);

	AIData.sneakMult = 0.25;
	if (AIData.canSeePlayerMedium) AIData.sneakMult += 0.45;
	if (AIData.canSeePlayerClose) AIData.sneakMult += 0.25;
	if (AIData.canSeePlayerVeryClose) AIData.sneakMult += 0.5;
	if (KinkyDungeonAlert > 0) AIData.sneakMult += 1;
	if (
		// If the player is visible
		(AIData.canSensePlayer || AIData.canSeePlayer || AIData.canShootPlayer || AIData.canSeePlayerChase)
		// If we SEE the player as opposed to just being able to
		&& KinkyDungeonTrackSneak(enemy, delta * (AIData.sneakMult), player, (AIData.canSensePlayer) ? 0 : (enemy.Enemy.tags.darkvision ? 0.5 : 1.5))) {


		if (!KDEnemyHasFlag(enemy, "StayHere")) {
			// Enemies that arent told to hold still will decide to follow their targets
			if (KDEnemyHasFlag(enemy, "Defensive")) {
				// Defensive AI will follow the player
				enemy.gx = KinkyDungeonPlayerEntity.x;
				enemy.gy = KinkyDungeonPlayerEntity.y;
			} else if (
				// Dont chase the player if ignoring
				!AIData.ignore
				// We want to track the target
				&& AIType.trackvisibletarget(enemy, player, AIData)
				&& (
					// We will follow the player if aggressive, playing, or not told to not follow
					AIData.aggressive || enemy.playWithPlayer || !KDEnemyHasFlag(enemy, "NoFollow"))
			) {
				let pp = KDistChebyshev(enemy.x - player.x, enemy.y - player.y) < 1.5 ? null : KinkyDungeonGetNearbyPoint(player.x, player.y, true, undefined, true);
				if (pp) {
					// Go to a place near the target
					enemy.gx = pp.x;
					enemy.gy = pp.y;
				} else {
					// Go to the target directly
					enemy.gx = player.x;
					enemy.gy = player.y;
				}
			}
		}
		if (AIData.canSensePlayer || AIData.canSeePlayer || AIData.canShootPlayer) {
			if (!enemy.aware && AIData.aggressive) {
				KDAddThought(enemy.id, "Aware", 3, 3);
				if (KDRandom() < actionDialogueChanceIntense)
					KinkyDungeonSendDialogue(enemy,
						TextGet("KinkyDungeonRemindJailChase" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Alert")
							.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy),
						4, 5, false, true);
			}
			if (!enemy.aware) KDEnemyAddSound(enemy, enemy.Enemy.Sound?.alertAmount != undefined ? enemy.Enemy.Sound?.alertAmount : KDDefaultEnemyAlertSound);
			enemy.aware = true;
			// Share aggro
			if (AIData.hostile && AIData.aggressive && !enemy.rage && KDEnemyCanSignalOthers(enemy) && !enemy.Enemy.tags.minor && (!(enemy.silence > 0 || enemy.Enemy.tags.gagged) || enemy.Enemy.tags.alwaysAlert)) {
				let ent = KDNearbyEnemies(enemy.x, enemy.y, KinkyDungeonEnemyAlertRadius);
				for (let e of ent) {
					if (KDHostile(e) && KinkyDungeonAggressive(e) && !enemy.rage && e != enemy) {
						if (player.player && KDPlayerLight < 1.5) {
							if (!e.aware) {
								KDAddThought(e.id, "Blind", 3, 3);
								e.path = null;
								let pp = KinkyDungeonGetNearbyPoint(player.x, player.y, true, undefined, true);
								if (pp) {
									e.gx = pp.x;
									e.gy = pp.y;
								} else {
									e.gx = player.x;
									e.gy = player.y;
								}

							}
						} else {
							if (!e.aware) KDAddThought(e.id, "Confused", 3, 3);

							if (!enemy.aware) KDEnemyAddSound(enemy, enemy.Enemy.Sound?.alertAmount != undefined ? enemy.Enemy.Sound?.alertAmount : KDDefaultEnemyAlertSound);

							e.aware = true;
						}

					}
				}
			}
		}
	}

	AIData.ignoreRanged = AIData.canShootPlayer && KinkyDungeonAllRestraint().some((r) => {return KDRestraint(r).ignoreSpells;});
	// Close the gap to leash
	if ((AIData.ignoreRanged || (!enemy.Enemy.alwaysKite && AIData.harmless)) && AIData.leashing) AIData.followRange = 1.5;
	if (enemy == KinkyDungeonJailGuard() || enemy == KinkyDungeonLeashingEnemy()) AIData.followRange = 1.5;

	AIData.kite = false;
	AIData.kiteChance = enemy.Enemy.kiteChance ? enemy.Enemy.kiteChance : 0.75;
	if (AIData.canSeePlayer && (!player.player || AIData.aggressive) && enemy.Enemy && enemy.Enemy.kite && !enemy.usingSpecial && (!player.player || KinkyDungeonHasWill(0.1)) && (enemy.attackPoints <= 0 || enemy.Enemy.attackWhileMoving) && AIData.playerDist <= enemy.Enemy.kite && (AIData.hostile || !player.player)) {
		if (!enemy.Enemy.dontKiteWhenDisabled || !(KDPlayerIsDisabled()))
			if (!enemy.Enemy.noKiteWhenHarmless || !AIData.harmless)
				if (AIData.kiteChance >= 1 || KDRandom() < AIData.kiteChance)
					if (!AIData.ignoreRanged)
						AIData.kite = true;
	}

	if (!AIData.aggressive && player.player && (enemy.playWithPlayer || KDAllied(enemy))) {
		if (AIData.domMe && KDIsBrat(enemy)) {
			AIData.followRange = 3.9;
			AIData.kite = true;
		} else
			AIData.followRange = 1.5;
	} else if (AIData.aggressive && enemy.attackPoints && !enemy.Enemy.attackWhileMoving && AIData.followRange < ((enemy.usingSpecial ? enemy.Enemy.specialRange : undefined) || AIData.range)
		&& enemy.Enemy.attack?.includes("Melee")) {
		AIData.followRange = Math.max(1.5, (enemy.usingSpecial ? enemy.Enemy.specialRange : undefined) || AIData.range || AIData.followRange);
	}

	if ((AIType.resetguardposition(enemy, player, AIData)) && (!enemy.gxx || !enemy.gyy)) {
		enemy.gxx = enemy.gx;
		enemy.gyy = enemy.gy;
	}
	// Movement loop

	// If an enemy was trying to attack the player but the player got behind them somehow, they get stunned
	let flanked = KDCheckVulnerableBackstab(enemy);
	if (player.player && flanked && !enemy.stun && !enemy.Enemy.tags.nosurpriseflank && !KDIsPlayerTethered(KinkyDungeonPlayerEntity) && KinkyDungeonFlags.get("teleported")) {
		enemy.stun = 1;
	}

	// Whether or not the enemy should hold when nearby
	// Summons are mainly the ones who should behave like this
	AIData.holdStillWhenNear = AIData.aggressive || enemy.Enemy.Behavior?.holdStillWhenNear || (player.player && enemy.Enemy.allied && !enemy.Enemy.Behavior?.behaveAsEnemy
		&& KDAllied(enemy) && !KDEnemyHasFlag(enemy, "NoFollow") && !KDEnemyHasFlag(enemy, "StayHere"));

	if (!AIData.startedDialogue) {
		if (
			!AIType.beforemove(enemy, player, AIData)
			&& (
				(enemy.Enemy.attackWhileMoving && enemy != KinkyDungeonLeashingEnemy())
				|| AIData.ignore
				|| !(
					KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.followRange, enemy.attackPoints < 1 || !(enemy.Enemy.projectileTargeting || enemy.Enemy.projectileAttack), false)
					&& enemy.aware
					&& (
						AIData.wantsToAttack
						|| AIData.holdStillWhenNear
					)
				)
				|| AIData.kite
			)
		) {
			if (!enemy.gx) enemy.gx = enemy.x;
			if (!enemy.gy) enemy.gy = enemy.y;

			AIData.idle = true;
			AIData.patrolChange = false;
			AIData.allyFollowPlayer = false;
			AIData.dontFollow = false;

			if (AIType.follower(enemy, player, AIData)) {
				if (KDAllied(enemy) && player.player) {
					if (!KDEnemyHasFlag(enemy, "NoFollow") && !KDEnemyHasFlag(enemy, "StayHere")) {
						AIData.allyFollowPlayer = true;
					} else {
						AIData.dontFollow = true;
						if (enemy.gx == player.x && enemy.gy == player.y && !KDEnemyHasFlag(enemy, "StayHere")) {
							//enemy.gx = undefined;
							//enemy.gy = undefined;
						}
					}
				} else {
					if (KDEnemyHasFlag(enemy, "Defensive") && !KDEnemyHasFlag(enemy, "StayHere")) {
						enemy.gx = KinkyDungeonPlayerEntity.x;
						enemy.gy = KinkyDungeonPlayerEntity.y;
					}
					if (KDEnemyHasFlag(enemy, "StayHere") || KDEnemyHasFlag(enemy, "Defensive"))
						AIData.dontFollow = true;
					if (AIData.hostile) {
						KinkyDungeonSetEnemyFlag(enemy, "StayHere", 0);
						KinkyDungeonSetEnemyFlag(enemy, "Defensive", 0);
					} else if (!KDAllied(enemy)) {
						KinkyDungeonSetEnemyFlag(enemy, "Defensive", 0);
					}
				}
			}

			// First we will cancel the path if Gx or Gy has been updated
			if (enemy.path?.length > 0) {
				let lastPoint = enemy.path[enemy.path.length-1];
				if ((enemy.gx && lastPoint.x != enemy.gx) || (enemy.gy && lastPoint.y != enemy.gy)) {
					enemy.path = undefined;
				}
			}


			let rThresh = enemy.Enemy.RestraintFilter?.powerThresh || (KDDefaultRestraintThresh + (Math.max(0, enemy.Enemy.power - 1) || 0));

			AIData.wantsToLeash = !KinkyDungeonFlags.get("PlayerDommed");
			AIData.focusOnLeash = (
				enemy == KinkyDungeonLeashingEnemy()
				&& !AIData.addLeash && (
					!AIData.addMoreRestraints
                || !KinkyDungeonAggressive(enemy, KinkyDungeonPlayerEntity)
				|| !AIData.wantsToAttack
				|| !KinkyDungeonGetRestraint(
					{tags: KDGetTags(enemy, enemy.usingSpecial)}, KDGetEffLevel() + (enemy.Enemy.power || 0),
					KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
					enemy.Enemy.bypass,
					enemy.Enemy.useLock ? enemy.Enemy.useLock : "",
					!(enemy.Enemy.ignoreStaminaForBinds || (enemy.usingSpecial && enemy.Enemy.specialIgnoreStam)) && !AIData.attack.includes("Suicide"),
					!AIData.addMoreRestraints && !enemy.usingSpecial && AIData.addLeash,
					!KinkyDungeonStatsChoice.has("TightRestraints"),
					KDGetExtraTags(enemy, enemy.usingSpecial),
					false,
					{
						maxPower: rThresh + 0.01,
						looseLimit: true,
						onlyUnlimited: true,
						ignore: enemy.items,
					}, enemy, undefined, true)));
			AIData.moveTowardPlayer =
				// We can move
				!KDIsImmobile(enemy)
				// We want to move
				&& AIType.chase(enemy, player, AIData)
				// We are not ignoring the target
				&& !AIData.ignore
				// We aren't prevented from following the target
				&& !AIData.dontFollow
				// We are aware of the target OR we are allied and are following
				&& (enemy.aware || AIData.allyFollowPlayer)
				// Player is within our max chase range
				&& AIData.playerDist <= AIData.chaseRadius
				// We aren't already following a path or stationed at our current point
				// TODO evaluate whether we should check gxx and gyy instead of gx and gy (station point vs goto point)
				&& ((enemy.gx != enemy.x || enemy.gy != enemy.y || enemy.path || enemy.fx || enemy.fy) ? true : false);

			// Also if the enemy is supposed to go to the player (goal x and y are same as players) and the enemy can see, it just does it
			if (player && enemy.aware && AIData.canSensePlayer && enemy.gx == player.x && enemy.gy == player.y) {
				AIData.moveTowardPlayer = true;
			}

			// try 12 times to find a moveable tile, with some random variance
			// First part is player chasing behavior

			if (// We aren't focusing on pulling
				!AIData.focusOnLeash
				// We want to move toward the target instead of our goal
				&& AIData.moveTowardPlayer) {
				//enemy.aware = true;

				if (KDistChebyshev(enemy.x - player.x, enemy.y - player.y) > AIData.followRange) {
					for (let T = 0; T < 12; T++) {
						let dir = KDGetDir(enemy, player);
						let splice = false;
						if (T > 2 && T < 8) dir = KinkyDungeonGetDirectionRandom(dir.x * 10, dir.y * 10); // Fan out a bit
						if (T >= 8 || (enemy.path && !AIData.canSeePlayer) || (!AIData.canSeePlayer && !(enemy.Enemy.stopToCast && AIData.canShootPlayer))) {
							if (!enemy.path && (KinkyDungeonAlert || (enemy.vp > 0 && enemy.aware) || AIData.canSeePlayer)) {
								if (!AIData.canSeePlayer) {
									if (AIData.canShootPlayer) {
										KDAddThought(enemy.id, "Shoot", 4, 2);
									} else if (AIData.canSensePlayer) {
										KDAddThought(enemy.id, "Sense", 2, 6);
									} else {
										KDAddThought(enemy.id, "Search", 2, 6);
									}
								}
								enemy.path = KinkyDungeonFindPath(enemy.x, enemy.y, player.x, player.y,
									KDEnemyHasFlag(enemy, "blocked"), KDEnemyHasFlag(enemy, "blocked"),
									enemy == KinkyDungeonLeashingEnemy() || AIData.ignoreLocks, AIData.MovableTiles,
									undefined, undefined, undefined, enemy, enemy != KinkyDungeonJailGuard() && !KDEnemyHasFlag(enemy, "longPath")); // Give up and pathfind
							} if (enemy.path && enemy.path.length > 0 && Math.max(Math.abs(enemy.path[0].x - enemy.x),Math.abs(enemy.path[0].y - enemy.y)) < 1.5) {
								dir = {x: enemy.path[0].x - enemy.x, y: enemy.path[0].y - enemy.y, delta: KDistChebyshev(enemy.path[0].x - enemy.x, enemy.path[0].y - enemy.y)};
								if (!KinkyDungeonNoEnemyExceptSub(enemy.x + dir.x, enemy.y + dir.y, false, enemy)
									|| !AIData.MovableTiles.includes(KinkyDungeonMapGet(enemy.path[0].x, enemy.path[0].y))) {
									enemy.path = undefined;
									KinkyDungeonSetEnemyFlag(enemy, "failpath", enemy == KinkyDungeonJailGuard() ? 2 : 20);
									KinkyDungeonSetEnemyFlag(enemy, "blocked", 24);
								}
								splice = true;
							} else {
								enemy.path = undefined;
								KinkyDungeonSetEnemyFlag(enemy, "failpath", enemy == KinkyDungeonJailGuard() ? 2 : 20);
								if (!AIData.canSensePlayer) {
									if (enemy.aware) KDAddThought(enemy.id, "Lose", 1, 4);
									enemy.aware = false;
								}

								//dir = KinkyDungeonGetDirectionRandom(0, 0); // Random...
							}
						}
						if (dir.delta > 1.5) {
							enemy.path = undefined;
							KinkyDungeonSetEnemyFlag(enemy, "failpath", 20);
						}
						else if (KinkyDungeonEnemyCanMove(enemy, dir, AIData.MovableTiles, AIData.AvoidTiles, AIData.ignoreLocks, T)) {
							if (KinkyDungeonEnemyTryMove(enemy, dir, delta, enemy.x + dir.x, enemy.y + dir.y)) AIData.moved = true;
							if (AIData.moved && splice && enemy.path) enemy.path.splice(0, 1);
							AIData.idle = false;

							// If we moved we will pick a candidate for next turns attempt
							if (AIData.moved) {
								dir = KDGetDir(enemy, player);
								if (KinkyDungeonEnemyCanMove(enemy, dir, AIData.MovableTiles, AIData.AvoidTiles, AIData.ignoreLocks, T)) {
									enemy.fx = enemy.x + dir.x;
									enemy.fy = enemy.y + dir.y;
								}
							}
							break;
						} else {
							enemy.fx = undefined;
							enemy.fy = undefined;
						}
					}
				} else {
					enemy.fx = undefined;
					enemy.fy = undefined;
				}

			} else if (
				// We can move
				!KDIsImmobile(enemy)
				// We want to move
				&& AIType.move(enemy, player, AIData)
				// We are not where we want to be
				&& (Math.abs(enemy.x - enemy.gx) > 0 || Math.abs(enemy.y - enemy.gy) > 0))  {
				if (AIData.focusOnLeash && AIData.moveTowardPlayer && AIData.wantsToLeash) {
					// Only break awareness if the AI cant chase player
					if (!enemy.IntentLeashPoint) {
						KDAssignLeashPoint(enemy);
						enemy.gx = AIData.nearestJail.x;
						enemy.gy = AIData.nearestJail.y;
					} else {
						enemy.gx = enemy.IntentLeashPoint.x;
						enemy.gy = enemy.IntentLeashPoint.y;
					}
					if (enemy.x == enemy.gx && enemy.y == enemy.gy) {
						enemy.gx = player.x;
						enemy.gy = player.y;
					}
				} else if (!AIData.canSensePlayer) {
					if (enemy.aware && KinkyDungeonAggressive(enemy, player)) {
						enemy.path = undefined;
					}
					enemy.aware = false;
				}
				for (let T = 0; T < 8; T++) {
					let dir = KDGetDir(enemy, {x: enemy.gx, y: enemy.gy});
					let splice = false;
					if (T > 2 && T < 8) dir = KinkyDungeonGetDirectionRandom(dir.x * 10, dir.y * 10); // Fan out a bit
					if (T >= 8 || enemy.path || !KinkyDungeonCheckPath(enemy.x, enemy.y, enemy.gx, enemy.gy)) {
						if (!enemy.path && !KDEnemyHasFlag(enemy, "genpath")) {
							enemy.path = KinkyDungeonFindPath(
								enemy.x, enemy.y, enemy.gx, enemy.gy,
								enemy == KinkyDungeonJailGuard() || KDEnemyHasFlag(enemy, "blocked"), KDEnemyHasFlag(enemy, "blocked"),
								enemy == KinkyDungeonLeashingEnemy() || AIData.ignoreLocks, AIData.MovableTiles,
								undefined, undefined, undefined, enemy, enemy != KinkyDungeonJailGuard() && !KDEnemyHasFlag(enemy, "longPath")); // Give up and pathfind
							KinkyDungeonSetEnemyFlag(enemy, "genpath", enemy == KinkyDungeonJailGuard() ? 1 : 100);
						}
						if (enemy.path && enemy.path.length > 0 && Math.max(Math.abs(enemy.path[0].x - enemy.x),Math.abs(enemy.path[0].y - enemy.y)) < 1.5) {
							dir = {x: enemy.path[0].x - enemy.x, y: enemy.path[0].y - enemy.y, delta: KDistChebyshev(enemy.path[0].x - enemy.x, enemy.path[0].y - enemy.y)};
							if (!KinkyDungeonNoEnemyExceptSub(enemy.x + dir.x, enemy.y + dir.y, false, enemy)
								|| !AIData.MovableTiles.includes(KinkyDungeonMapGet(enemy.path[0].x, enemy.path[0].y))) {
								enemy.path = undefined;
								KinkyDungeonSetEnemyFlag(enemy, "failpath", enemy == KinkyDungeonJailGuard() ? 2 : 20);
								KinkyDungeonSetEnemyFlag(enemy, "blocked", 24);
							}
							splice = true;
						} else {
							enemy.path = undefined;
							KinkyDungeonSetEnemyFlag(enemy, "failpath", enemy == KinkyDungeonJailGuard() ? 2 : 20);
						}
					}
					if (dir.delta > 1.5) {enemy.path = undefined;}
					else if (
						(T > 7 || AIData.moveTowardPlayer || !KDPointWanderable(enemy.gx, enemy.gy) || !KDPointWanderable(enemy.x, enemy.y) || KDPointWanderable(enemy.x + dir.x, enemy.y + dir.y))
						&& KinkyDungeonEnemyCanMove(enemy, dir, AIData.MovableTiles, AIData.AvoidTiles, AIData.ignoreLocks, T)) {
						if (KinkyDungeonEnemyTryMove(enemy, dir, delta, enemy.x + dir.x, enemy.y + dir.y)) AIData.moved = true;
						if (AIData.moved && splice && enemy.path) enemy.path.splice(0, 1);
						AIData.idle = false;// If we moved we will pick a candidate for next turns attempt
						if (AIData.moved) {
							dir = KDGetDir(enemy, {x: enemy.gx, y: enemy.gy});
							if (KinkyDungeonEnemyCanMove(enemy, dir, AIData.MovableTiles, AIData.AvoidTiles, AIData.ignoreLocks, T)) {
								enemy.fx = enemy.x + dir.x;
								enemy.fy = enemy.y + dir.y;
							}
						}
						break;
					} else {
						enemy.fx = undefined;
						enemy.fy = undefined;
						if (KinkyDungeonPlayerEntity.x == enemy.x + dir.x && KinkyDungeonPlayerEntity.y == enemy.y + dir.y) enemy.path = undefined;
					}
				}
			} else if (!AIData.moveTowardPlayer && (Math.abs(enemy.x - enemy.gx) < 2 || Math.abs(enemy.y - enemy.gy) < 2)) AIData.patrolChange = true;

			if (!KDIsImmobile(enemy) && !AIType.aftermove(enemy, player, AIData) && !AIData.moveTowardPlayer) {
				if (AIType.resetguardposition(enemy, player, AIData) && !AIData.allyFollowPlayer && Math.max(Math.abs(enemy.x - enemy.gx), Math.abs(enemy.y - enemy.gy)) < 1.5 && enemy.gxx && enemy.gyy) {
					enemy.gx = enemy.gxx;
					enemy.gy = enemy.gyy;
				}
				let wanderfar = AIType.wander_far(enemy, player, AIData);
				let wandernear = AIType.wander_near(enemy, player, AIData);
				if ((wanderfar || wandernear) && !AIData.allyFollowPlayer && (!enemy.Enemy.allied && !KDEnemyHasFlag(enemy, "StayHere")) && !KDEnemyHasFlag(enemy, "StayHere") && enemy.movePoints < 1 && (!enemy.aware || !AIData.aggressive)) {
					if ((Math.max(Math.abs(enemy.x - enemy.gx), Math.abs(enemy.y - enemy.gy)) < 1.5 || (KDRandom() < 0.02 && KDEnemyHasFlag(enemy, "failpath"))) || (!(enemy.vp > 0.05) && (!enemy.path || KDRandom() < 0.1))) {
						AIData.master = KinkyDungeonFindMaster(enemy).master;
						if (!KDEnemyHasFlag(enemy, "wander")) {
							if (!AIData.master && wanderfar) {
								if (!AIType.wanderfar_func || !AIType.wanderfar_func(enemy, player, AIData)) {
									// long distance hunt
									let newPoint = KinkyDungeonGetRandomEnemyPoint(false,
										enemy.tracking && KinkyDungeonHuntDownPlayer && KDGameData.PrisonerState != "parole" && KDGameData.PrisonerState != "jail");
									if (newPoint) {
										enemy.gx = newPoint.x;
										enemy.gy = newPoint.y;
									}
								}
								KinkyDungeonSetEnemyFlag(enemy, "wander", AIType.wanderDelay_long(enemy) || 50);
							} else if (wandernear) {
								KinkyDungeonSetEnemyFlag(enemy, "wander", AIType.wanderDelay_short(enemy) || 20);
								if (!AIType.wandernear_func || !AIType.wandernear_func(enemy, player, AIData)) {
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
											let ent = KDNearbyEnemies(enemy.x, enemy.y, minDist);
											for (let e of ent) {
												if (e == enemy) continue;
												if (['guard', 'ambush'].includes(KDGetAI(enemy))) continue;
												if (!(
													(enemy.Enemy.clusterWith && !e.Enemy.tags[enemy.Enemy.clusterWith])
													|| e.Enemy.clusterWith && !enemy.Enemy.tags[enemy.Enemy.clusterWith]
												)) continue;
												if (KDGetFaction(e) != KDGetFaction(enemy)) continue;
												if (KinkyDungeonTilesGet(e.x + "," + e.y) && KinkyDungeonTilesGet(e.x + "," + e.y).OffLimits) continue;
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
										let newPoint = KinkyDungeonGetNearbyPoint(ex, ey, false);
										if (newPoint && (KDGetFaction(enemy) != "Player" || !KinkyDungeonPointInCell(newPoint.x, newPoint.y))) {
											if (!AIType.strictwander || KinkyDungeonCheckPath(enemy.x, enemy.y, newPoint.x, newPoint.y)) {
												enemy.gx = newPoint.x;
												enemy.gy = newPoint.y;
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	if (enemy.aware && enemy.idle && !enemy.path && !AIData.canSensePlayer && !enemy.vp) {
		if (enemy.aware) KDAddThought(enemy.id, "Lose", 1, 4);
		enemy.aware = false;
	}

	if (enemy.usingSpecial && !enemy.specialCD) enemy.specialCD = 0;

	let minRange = enemy.Enemy.attackMinRange || 0;
	if (enemy.usingSpecial && enemy.Enemy.specialMinRange != undefined) minRange = enemy.Enemy.specialMinRange;

	// Attack loop
	AIData.playerDist = Math.sqrt((enemy.x - player.x)*(enemy.x - player.x) + (enemy.y - player.y)*(enemy.y - player.y));
	let canAttack = !(enemy.disarm > 0)
		&& AIData.wantsToAttack
		&& (!player?.player || !enemy.Enemy.followLeashedOnly || KDPlayerDeservesPunishment(enemy, player) || KDGameData.KinkyDungeonLeashedPlayer < 1 || KinkyDungeonLeashingEnemy()?.id == enemy.id || KinkyDungeonFlags.get("overrideleashprotection"))
		&& ((enemy.aware && KDCanDetect(enemy, player)) || (!KDAllied(enemy) && !AIData.hostile))
		&& !AIData.ignore
		&& (!minRange || (AIData.playerDist > minRange))
		&& (AIData.attack.includes("Melee") || (enemy.Enemy.tags && AIData.leashing && !KinkyDungeonHasWill(0.1)))
		&& (!AIData.ignoreRanged || AIData.playerDist < 1.5)
		&& AIType.attack(enemy, player, AIData)
		&& KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.range, !enemy.Enemy.projectileAttack, !enemy.Enemy.projectileAttack);
	if (canAttack) {//Player is adjacent
		AIData.idle = false;
		enemy.revealed = true;

		let dir = KinkyDungeonGetDirection(player.x - enemy.x, player.y - enemy.y);

		if (enemy.usingSpecial && !specialConditionSpecial) {
			enemy.usingSpecial = false;
			if (KDSpecialConditions[enemy.Enemy.specialCondition].resetCD) enemy.specialCD = enemy.Enemy.specialCD;
		}

		if (!AIData.moved || enemy.Enemy.attackWhileMoving) {
			let moveMult = KDBoundEffects(enemy) * 0.5;
			let attackMult = KinkyDungeonGetBuffedStat(enemy.buffs, "AttackSlow");
			let attackTiles = enemy.warningTiles ? enemy.warningTiles : [dir];
			let ap = (KDGameData.MovePoints < 0 && !KinkyDungeonHasWill(0.1) && KinkyDungeonLeashingEnemy()?.id == enemy.id) ? enemy.Enemy.movePoints+moveMult+1 : enemy.Enemy.attackPoints + attackMult;
			if (!KinkyDungeonEnemyTryAttack(enemy, player, attackTiles, delta, enemy.x + dir.x, enemy.y + dir.y, (enemy.usingSpecial && enemy.Enemy.specialAttackPoints) ? enemy.Enemy.specialAttackPoints : ap, undefined, undefined, enemy.usingSpecial, AIData.refreshWarningTiles, AIData.attack, AIData.MovableTiles)) {
				if (enemy.warningTiles.length == 0 || (AIData.refreshWarningTiles && enemy.usingSpecial)) {
					let minrange = enemy.Enemy.tilesMinRange ? enemy.Enemy.tilesMinRange : 1;
					if (enemy.usingSpecial && enemy.Enemy.tilesMinRangeSpecial) minrange = enemy.Enemy.tilesMinRangeSpecial;
					if ((!enemy.usingSpecial && enemy.attackPoints > 0) || enemy.specialCD < 1) {
						enemy.fx = player.x;
						enemy.fy = player.y;
						enemy.warningTiles = KinkyDungeonGetWarningTiles(player.x - enemy.x, player.y - enemy.y, AIData.range, AIData.width, minrange, enemy);
						let playerIn = false;
						for (let tile of enemy.warningTiles) {
							if (KinkyDungeonPlayerEntity.x == enemy.x + tile.x && KinkyDungeonPlayerEntity.y == enemy.y + tile.y) {playerIn = true; break;}
						}
						if (!playerIn) {
							enemy.fx = player.x;
							enemy.fy = player.y;
						}
					}
					if (AIData.refreshWarningTiles && enemy.usingSpecial) enemy.attackPoints = Math.min(enemy.attackPoints, delta);
				} else {
					let playerIn = false;
					for (let tile of enemy.warningTiles) {
						if (player.x == enemy.x + tile.x && player.y == enemy.y + tile.y) {playerIn = true; break;}
					}
					if (!playerIn) {
						if (enemy.Enemy.specialRange && enemy.usingSpecial && enemy.Enemy.specialCDonAttack) {
							enemy.specialCD = enemy.Enemy.specialCD;
							if (enemy.Enemy.stunOnSpecialCD) enemy.stun = enemy.Enemy.stunOnSpecialCD;
							if (AIData.attack.includes("Dash") && !enemy.Enemy.Dash?.noDashOnSidestep) {
								KDDash(enemy, player, AIData.MovableTiles);
							}
						}
						if (enemy.Enemy.specialWidth && enemy.usingSpecial && enemy.Enemy.specialCDonAttack) {
							enemy.specialCD = enemy.Enemy.specialCD;
							if (enemy.Enemy.stunOnSpecialCD) enemy.stun = enemy.Enemy.stunOnSpecialCD;
							if (AIData.attack.includes("Dash") && !enemy.Enemy.Dash?.noDashOnSidestep) {
								KDDash(enemy, player, AIData.MovableTiles);
							}
						}
					}
				}
				// Easier to evase harness grabs
				let BaseBlock = KinkyDungeonMultiplicativeStat(0.0 + AIData.accuracy - 1);
				let BaseEvasion = KinkyDungeonMultiplicativeStat(0.25 + AIData.accuracy - 1);
				let playerEvasion = 1.01 * (player.player) ? KinkyDungeonPlayerEvasion()
					: KinkyDungeonMultiplicativeStat(((player.Enemy && player.Enemy.evasion) ? player.Enemy.evasion : 0)) * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(player.buffs, "Evasion"));
				let playerBlock = 1.01 * (player.player) ? KinkyDungeonPlayerBlock()
					: KinkyDungeonMultiplicativeStat(((player.Enemy && player.Enemy.block) ? player.Enemy.block : 0)) * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(player.buffs, "Block"));
				if (AIData.playerDist < 1.5 && player.player && AIData.attack.includes("Bind") && enemy.Enemy.bound && KDRandom() >= BaseEvasion-playerEvasion && KDRandom() >= BaseBlock-playerBlock && KDGameData.MovePoints > -1 && KinkyDungeonTorsoGrabCD < 1 && KinkyDungeonLastAction == "Move") {
					let caught = false;
					for (let tile of enemy.warningTiles) {
						if (enemy.x + tile.x == player.x && enemy.y + tile.y == player.y) {
							caught = true;
							break;
						}
					}
					if (caught) {
						let harnessChance = 0;
						let harnessRestraintName = "";
						let list = KinkyDungeonAllRestraint();
						let list2 = [];
						for (let restraint of list) {
							if (KDRestraint(restraint) && KDRestraint(restraint).harness) {
								harnessChance += 1;
								list2.push(KDRestraint(restraint).name);
							}
						}
						let rest = list2[Math.floor(KDRandom() * list2.length)];
						if (rest) harnessRestraintName = rest;

						if (harnessChance > 0) {
							let roll = KDRandom();
							let bonus = 0;
							if (!KinkyDungeonCanStand()) bonus += KinkyDungeonTorsoGrabChanceBonus;
							if (KinkyDungeonStatWill < 0.01) bonus += KinkyDungeonTorsoGrabChanceBonus;
							for (let T = 0; T < harnessChance; T++) {
								roll = Math.min(roll, KDRandom());
							}
							if (roll < KinkyDungeonTorsoGrabChance + bonus) {
								KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
								let msg = TextGet("KinkyDungeonTorsoGrab").replace("RestraintName", TextGet("Restraint" + harnessRestraintName)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name));

								KinkyDungeonSendTextMessage(5, msg, "yellow", 1);

								if (KDRandom() < actionDialogueChance)
									KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Grab").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 4);

								KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Grab.ogg", enemy);
								KinkyDungeonTorsoGrabCD = 2;
							}
						}
					}
				}
			} else { // Attack lands!
				enemy.revealed = true;
				let hit = ((enemy.usingSpecial && enemy.Enemy.specialAttackPoints) ? enemy.Enemy.specialAttackPoints : ap) <= 1;
				for (let tile of enemy.warningTiles) {
					if (enemy.x + tile.x == player.x && enemy.y + tile.y == player.y) {
						hit = true;
						break;
					}
				}

				KDEnemyAddSound(enemy, enemy.Enemy.Sound?.attackAmount != undefined ? enemy.Enemy.Sound?.attackAmount : KDDefaultEnemyAttackSound);

				let playerEvasion = 1.01 * (player.player) ? KinkyDungeonPlayerEvasion()
					: KinkyDungeonMultiplicativeStat(((player.Enemy && player.Enemy.evasion) ? player.Enemy.evasion : 0)) * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(player.buffs, "Evasion"));

				let playerBlock = 1.01 * (player.player) ? KinkyDungeonPlayerBlock()
					: KinkyDungeonMultiplicativeStat(((player.Enemy && player.Enemy.block) ? player.Enemy.block : 0)) * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(player.buffs, "Block"));

				if (hit) {
					if (player.player) {
						KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "incomingHit", 1);
					} else
						KinkyDungeonTickBuffTag(player, "incomingHit", 1);
				}
				let eventable = KDEventableAttackTypes.some((type) => {return AIData.attack.includes(type);});
				let dash = AIData.attack.includes("Dash");

				let preDataPreBlock = {
					playerEvasion: playerEvasion,
					playerBlock: playerBlock,
					eventable: eventable || (dash && enemy.Enemy.Dash?.EventOnDashMiss) || (dash && enemy.Enemy.Dash?.EventOnDashMiss),
					attack: AIData.attack,
					enemy: enemy,
					damagetype: AIData.damage,
					attacker: enemy,
					target: player,
					hit: hit,
					accuracy: AIData.accuracy,
					EvasionRoll: KDRandom(),
					BlockRoll: KDRandom(),
					BaseEvasion: 1,
					BaseBlock: 1,
				};
				KinkyDungeonSendEvent("beforeAttackCalculation", preDataPreBlock);
				KinkyDungeonSendEvent("doAttackCalculation", preDataPreBlock);

				preDataPreBlock.BaseEvasion *= KinkyDungeonMultiplicativeStat(0.0 + preDataPreBlock.accuracy - 1);
				preDataPreBlock.BaseBlock *= KinkyDungeonMultiplicativeStat(0.0 + preDataPreBlock.accuracy - 1);

				let missed = (eventable || (dash && enemy.Enemy.Dash?.EventOnDashMiss)) && preDataPreBlock.EvasionRoll < preDataPreBlock.BaseEvasion - preDataPreBlock.playerEvasion;
				let blockedAtk = (eventable || (dash && enemy.Enemy.Dash?.EventOnDashBlock)) && preDataPreBlock.BlockRoll < preDataPreBlock.BaseBlock - preDataPreBlock.playerBlock;
				let preData = {
					playerEvasion: preDataPreBlock.playerEvasion,
					playerBlock: preDataPreBlock.playerBlock,
					BaseEvasion: preDataPreBlock.BaseEvasion,
					BaseBlock: preDataPreBlock.BaseBlock,
					EvasionRoll: preDataPreBlock.EvasionRoll,
					BlockRoll: preDataPreBlock.BlockRoll,
					accuracy: preDataPreBlock.accuracy,
					eventable: eventable || (dash && enemy.Enemy.Dash?.EventOnDashMiss) || (dash && enemy.Enemy.Dash?.EventOnDashMiss),
					attack: AIData.attack,
					enemy: enemy,
					damagetype: AIData.damage,
					attacker: enemy,
					target: player,
					missed: missed,
					blocked: blockedAtk,
					hit: hit,
					preBlockData: preDataPreBlock,
				};
				KinkyDungeonSendEvent("beforeAttack", preData);

				if (!hit || missed) {
					let sfx = (enemy.Enemy && enemy.Enemy.misssfx) ? enemy.Enemy.misssfx : "Miss";
					KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg", enemy);
					if (player.player) {
						KinkyDungeonSendEvent("missPlayer", {enemy: enemy, player: player});
						KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonAttackMiss").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "lightgreen", 1);

						if (KDRandom() < actionDialogueChance)
							KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Miss").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 4);
					} else {
						KinkyDungeonSendEvent("missEnemy", {enemy: enemy, player: player});
					}
					KDAddThought(enemy.id, "Annoyed", 4, 1);

					enemy.vulnerable = Math.max(enemy.vulnerable, 1);
					if (dash && !enemy.Enemy.Dash?.noDashOnMiss) {
						KDDash(enemy, player, AIData.MovableTiles);
					}
					hit = false;
				}
				if (hit && blockedAtk) {
					let sfx = (enemy.Enemy && enemy.Enemy.blocksfx) ? enemy.Enemy.blocksfx : "WoodBlock";
					KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg", enemy);
					if (player.player) {
						KinkyDungeonSendEvent("blockPlayer", {enemy: enemy, player: player, preData: preData});
						KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonAttackBlock").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "lightgreen", 1);

						if (KDRandom() < actionDialogueChance)
							KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Block").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 4);
					} else {
						KinkyDungeonSendEvent("blockEnemy", {enemy: enemy, player: player, preData: preData});
					}
					KDAddThought(enemy.id, "Annoyed", 4, 1);

					if (AIData.attack.includes("Dash") && !enemy.Enemy.Dash?.noDashOnBlock) {
						KDDash(enemy, player, AIData.MovableTiles);
					}
					hit = false;
				}
				if (hit) {
					if (KDRandom() < actionDialogueChanceIntense)
						KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "HitPlayer").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 3, 5);
					let replace = [];
					let restraintAdd = [];
					let restraintFromInventory = [];
					let willpowerDamage = 0;
					let msgColor = "#ffff00";
					let Locked = false;
					let Effected = false;
					let Stun = false;
					let Blind = false;
					let priorityBonus = 0;
					let addedRestraint = false;

					let happened = 0;
					let bound = 0;

					if (player.player) {
						if (player.player
							&& AIData.playerDist < AIData.range
							&& (AIData.aggressive || AIData.attack.includes("Pull") || enemy.IntentLeashPoint)
							&& ( // If we are already leashing or pulling or we are a leashing type that is able to leash
								((!enemy.Enemy.noLeashUnlessExhausted || !KinkyDungeonHasWill(0.1))
								&& enemy.Enemy.tags
								&& AIData.leashing && KDGetFaction(enemy) != "Ambush")
								|| AIData.attack.includes("Pull")
								|| enemy.IntentLeashPoint
							)
							// Only attempt to leash if the player is not already being leashed
							&& (KDGameData.KinkyDungeonLeashedPlayer < 1 || KinkyDungeonLeashingEnemy() == enemy)) {
							AIData.intentToLeash = true;

							let wearingLeash = false;
							if (!wearingLeash && !AIData.attack.includes("Pull"))
								wearingLeash = KinkyDungeonIsWearingLeash();
							AIData.leashed = wearingLeash || AIData.attack.includes("Pull");

							if (AIData.leashed) {

								let leashToExit = AIData.leashing && !KinkyDungeonHasWill(0.1) && AIData.playerDist < 1.5;

								KDAssignLeashPoint(enemy);

								let leashPos = AIData.nearestJail;
								let findMaster = undefined;
								if (!leashToExit && enemy.Enemy.pullTowardSelf && (Math.abs(player.x - enemy.x) > 1.5 || Math.abs(player.y - enemy.y) > 1.5)) {
									findMaster = enemy;
									if (findMaster) leashPos = {x: findMaster.x, y: findMaster.y, type: "", radius: 1};
								} else {
									if (AIData.attack.includes("Pull") && (enemy.master || enemy.Enemy.master)) {
										/*let masterDist = 1000;
										for (let e of KDMapData.Entities) {
											let dist = Math.sqrt((e.x - enemy.x) * (e.x - enemy.x) + (e.y - enemy.y)*(e.y - enemy.y));
											if ((!enemy.Enemy.master.maxDist || dist < enemy.Enemy.master.maxDist)
												&& dist < masterDist
												&& (!enemy.Enemy.master.loose || KinkyDungeonCheckLOS(enemy, e, dist, 100, false))) {
												masterDist = Math.sqrt((e.x - enemy.x) * (e.x - enemy.x) + (e.y - enemy.y)*(e.y - enemy.y));
												findMaster = e;
											}
										}*/
										let fm = KinkyDungeonFindMaster(enemy);
										findMaster = fm.master;
										if (findMaster) leashPos = {x: findMaster.x, y: findMaster.y, type: "", radius: 1};
									}
								}

								if (enemy.IntentLeashPoint) leashPos = enemy.IntentLeashPoint;

								if (AIData.playerDist < 1.5 || (AIData.attack.includes("Pull")) || !KinkyDungeonGetRestraintItem("ItemDevices"))
									AIData.leashPos = leashPos;
							}
						}

						if (AIData.attack.includes("Lock") && KinkyDungeonPlayerGetLockableRestraints().length > 0) {
							let Lockable = KinkyDungeonPlayerGetLockableRestraints();
							let Lstart = 0;
							let Lmax = Lockable.length-1;
							if (!enemy.Enemy.attack.includes("LockAll")) {
								Lstart = Math.floor(Lmax*KDRandom()); // Lock one at random
							}
							for (let L = Lstart; L <= Lmax; L++) {
								let l = enemy.Enemy.attackLock ? KDProcessLock(enemy.Enemy.attackLock) : KinkyDungeonGenerateLock(true);
								KinkyDungeonLock(Lockable[L], l); // Lock it!
								priorityBonus += KDRestraint(Lockable[L]).power;
							}
							Locked = true;
							happened += 1;
							if (enemy.usingSpecial && Locked && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Lock")) {
								enemy.specialCD = enemy.Enemy.specialCD;
							}
							if (KDRandom() < actionDialogueChanceIntense)
								KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Lock").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 4);

						} else if (AIData.attack.includes("Bind")
							&& ((!enemy.usingSpecial && !enemy.Enemy.bindOnDisable) || (enemy.usingSpecial && !enemy.Enemy.bindOnDisableSpecial) || !KinkyDungeonHasWill(0.01) || !KinkyDungeonHasStamina(2.5) || KDIsKneeling() || KDIsHogtied())) {

							if (AIData.addMoreRestraints || AIData.addLeash || enemy.usingSpecial) {
								if (!AIData.intentToLeash && !KinkyDungeonFlags.get("Released") && enemy.Enemy.bound
									&& KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y) && KDGameData.KinkyDungeonLeashedPlayer < 1
									&& KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Furniture
									&& !KinkyDungeonPlayerTags.has("Furniture")
									&& KDFurniture[KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Furniture]) {
									let furn = KDFurniture[KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Furniture];
									if (furn) {
										let rest = KinkyDungeonGetRestraint(
											{tags: [furn.restraintTag]}, KDGetEffLevel() + (enemy.Enemy.power || 0),
											KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
											true,
											"",
											!KDPlayerIsStunned(),
											false,
											false);
										replace.push({keyword:"RestraintAdded", value: TextGet("Restraint" + rest.name)});
										restraintAdd.push(rest);
										addedRestraint = true;
									}
								} else {
									let numTimes = 1;
									if (enemy.Enemy.multiBind) numTimes = enemy.Enemy.multiBind;
									for (let times = 0; times < numTimes; times++) {
										// Note that higher power enemies get a bonus to the floor restraints appear on
										let rThresh = enemy.Enemy.RestraintFilter?.powerThresh || (KDDefaultRestraintThresh + (Math.max(0, enemy.Enemy.power - 1) || 0));
										let rest = KinkyDungeonGetRestraint(
											{tags: KDGetTags(enemy, enemy.usingSpecial)}, KDGetEffLevel() + (enemy.Enemy.power || 0),
											KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
											enemy.Enemy.bypass,
											enemy.Enemy.useLock ? enemy.Enemy.useLock : "",
											!(KDPlayerIsStunned() || enemy.Enemy.ignoreStaminaForBinds || (enemy.usingSpecial && enemy.Enemy.specialIgnoreStam)) && !AIData.attack.includes("Suicide"),
											!AIData.addMoreRestraints && !enemy.usingSpecial && AIData.addLeash,
											!KinkyDungeonStatsChoice.has("TightRestraints"),
											KDGetExtraTags(enemy, enemy.usingSpecial),
											false,
											{
												//minPower: rThresh,
												//onlyLimited: !enemy.Enemy.RestraintFilter?.limitedRestraintsOnly,
												looseLimit: true,
												require: enemy.Enemy.RestraintFilter?.unlimitedRestraints ? undefined : enemy.items,
											}, enemy, undefined, true);

										if (!rest) {
											rest = KinkyDungeonGetRestraint(
												{tags: KDGetTags(enemy, enemy.usingSpecial)}, KDGetEffLevel() + (enemy.Enemy.power || 0),
												KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
												enemy.Enemy.bypass,
												enemy.Enemy.useLock ? enemy.Enemy.useLock : "",
												!(KDPlayerIsStunned() || enemy.Enemy.ignoreStaminaForBinds || (enemy.usingSpecial && enemy.Enemy.specialIgnoreStam)) && !AIData.attack.includes("Suicide"),
												!AIData.addMoreRestraints && !enemy.usingSpecial && AIData.addLeash,
												!KinkyDungeonStatsChoice.has("TightRestraints"),
												KDGetExtraTags(enemy, enemy.usingSpecial),
												false,
												{
													maxPower: rThresh + 0.01,
													looseLimit: true,
													onlyUnlimited: true,
													ignore: enemy.items,
												}, enemy, undefined, true);
										} else {
											restraintFromInventory.push(rest.name);
										}
										if (rest) {
											replace.push({keyword:"RestraintAdded", value: TextGet("Restraint" + rest.name)});
											restraintAdd.push(rest);
											addedRestraint = true;
										}
									}
									if (enemy.usingSpecial && addedRestraint && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Bind")) {
										enemy.specialCD = enemy.Enemy.specialCD;
									}
									if (!addedRestraint && enemy.Enemy.fullBoundBonus) {
										willpowerDamage += enemy.Enemy.fullBoundBonus; // Some enemies deal bonus damage if they cannot put a binding on you
									}
								}
							} else if (enemy.Enemy.fullBoundBonus) {
								willpowerDamage += enemy.Enemy.fullBoundBonus; // Some enemies deal bonus damage if they cannot put a binding on you
							}
						}
					}


					if (AIData.attack.includes("Vibe")) {
						AIData.vibe = true;
					}
					if (AIData.intentToLeash) {
						let leashPos = AIData.leashPos;
						if (AIData.leashPos) {
							if (leashPos && leashPos == enemy.IntentLeashPoint && Math.abs(enemy.x - leashPos.x) <= 1.5 && Math.abs(enemy.y - leashPos.y) <= 1.5) {
								if (enemy.IntentAction && KDIntentEvents[enemy.IntentAction] && KDIntentEvents[enemy.IntentAction].arrive) {
									KDIntentEvents[enemy.IntentAction].arrive(enemy, AIData);
								} else {
									KDResetIntent(enemy, AIData);
								}
							}
							else if (enemy.Enemy.tags.leashing && AIData.nearestJail && leashPos == AIData.nearestJail && Math.abs(enemy.x - leashPos.x) <= 1 && Math.abs(enemy.y - leashPos.y) <= 1) {
								AIData.defeat = true;
								if (leashPos && leashPos.x == KDMapData.StartPosition.x && leashPos.y == KDMapData.StartPosition.y) {
									KinkyDungeonSetFlag("LeashToPrison", 1);
								}
								KDGameData.KinkyDungeonLeashedPlayer = 3 + ap * 2;
								KDGameData.KinkyDungeonLeashingEnemy = enemy.id;
								KDBreakTether(KinkyDungeonPlayerEntity);
							}
							else if (leashPos && (
								(AIData.attack.includes("Pull") && enemy.x == leashPos.x && enemy.y == leashPos.y)
								|| Math.abs(enemy.x - leashPos.x) > 1.5
								|| Math.abs(enemy.y - leashPos.y) > 1.5)
							) {
								if (!KinkyDungeonHasWill(0.1) && KDRandom() < 0.25) KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
								// Leash pullback
								if (AIData.playerDist < 1.5) {
									let path = KinkyDungeonFindPath(enemy.x, enemy.y, leashPos.x, leashPos.y, false, false, true, KinkyDungeonMovableTilesSmartEnemy, undefined, undefined, undefined, enemy);
									if (path && path.length > 0) {
										let leashPoint = path[0];
										let enemySwap = KinkyDungeonEnemyAt(leashPoint.x, leashPoint.y);
										if ((!enemySwap || !enemySwap.Enemy.noDisplace) && Math.max(Math.abs(leashPoint.x - enemy.x), Math.abs(leashPoint.y - enemy.y)) <= 1.5) {
											KDGameData.KinkyDungeonLeashedPlayer = 3 + ap * 2;
											KDGameData.KinkyDungeonLeashingEnemy = enemy.id;
											if (enemySwap) {
												enemySwap.x = KinkyDungeonPlayerEntity.x;
												enemySwap.y = KinkyDungeonPlayerEntity.y;
												enemySwap.warningTiles = [];
											}
											if (AIData.leashing && !KDPlayerIsImmobilized() && !KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity))
												KinkyDungeonAttachTetherToEntity(2.5, enemy);
											KDMovePlayer(enemy.x, enemy.y, false);
											KinkyDungeonTargetTile = null;
											KinkyDungeonTargetTileLocation = "";
											KDMoveEntity(enemy, leashPoint.x, leashPoint.y, true, false, undefined, true);
											AIData.hitsfx = "Struggle";
											for (let inv of KinkyDungeonAllRestraint()) {
												if (KDRestraint(inv).removeOnLeash) {
													KinkyDungeonRemoveRestraint(KDRestraint(inv).Group, false);
													if (KDRestraint(inv).Group == "ItemDevices") {
														KinkyDungeonSetFlag("Released", 15);
														KinkyDungeonSetFlag("nojailbreak", 15);
													}
												}
											}
											if (!KinkyDungeonHasWill(0.1)) {
												KDStunTurns(enemy.Enemy.movePoints + moveMult - 1);
												KinkyDungeonSleepTime = CommonTime() + 200;
											}
											KinkyDungeonSetFlag("nojailbreak", KDGameData.KinkyDungeonLeashedPlayer);
											if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Pull")) {
												enemy.specialCD = enemy.Enemy.specialCD;
											}
											if (KinkyDungeonMapGet(enemy.x, enemy.y) == 'D')  {
												KinkyDungeonMapSet(enemy.x, enemy.y, 'd');
												if (KinkyDungeonTilesGet(enemy.x + ',' +enemy.y) && KinkyDungeonTilesGet(enemy.x + ',' +enemy.y).Type == "Door")
													KinkyDungeonTilesGet(enemy.x + ',' +enemy.y).Lock = undefined;
											}

											if (KDRandom() < actionDialogueChanceIntense)
												KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Leash").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 3);
											if (!KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonLeashGrab").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "yellow", 1))
												KinkyDungeonSendActionMessage(1, TextGet("KinkyDungeonLeashGrab").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "yellow", 1);
										}
									}
								} else {
									// Simple pull
									let path = KinkyDungeonFindPath(player.x, player.y, leashPos.x, leashPos.y, true, false, false, KinkyDungeonMovableTilesEnemy, undefined, undefined, undefined, enemy);
									let pullDist = enemy.Enemy.pullDist ? enemy.Enemy.pullDist : 1;
									if (path && path.length > 0) {
										let leashPoint = path[Math.min(Math.max(0,path.length-2), Math.floor(Math.max(0, pullDist-1)))];
										if (!KinkyDungeonEnemyAt(leashPoint.x, leashPoint.y)
											&& Math.sqrt((leashPoint.x - enemy.x) * (leashPoint.x - enemy.x) + (leashPoint.y - enemy.y) * (leashPoint.y - enemy.y)) < AIData.playerDist
											&& Math.sqrt((leashPoint.x - player.x) * (leashPoint.x - player.x) + (leashPoint.y - player.y) * (leashPoint.y - player.y)) <= pullDist * 1.45) {
											if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Pull")) {
												enemy.specialCD = enemy.Enemy.specialCD;
											}
											KDGameData.KinkyDungeonLeashedPlayer = 2;
											KDGameData.KinkyDungeonLeashingEnemy = enemy.id;
											player.x = leashPoint.x;
											player.y = leashPoint.y;
											let msg = "KinkyDungeonLeashGrab";
											if (enemy.Enemy.pullMsg) msg = "Attack" + enemy.Enemy.name + "Pull";

											if (KDRandom() < actionDialogueChanceIntense)
												KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Pull").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 3);
											if (!KinkyDungeonSendTextMessage(8, TextGet(msg).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "yellow", 1))
												KinkyDungeonSendActionMessage(3, TextGet(msg).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "yellow", 1);
										}
									}
								}
							}
						}
					}
					let Dash = false;
					let attackBlocked = false;

					if (player.player && AIData.attack.includes("Bind") && !attackBlocked && KDCanPickpocketPlayer(player)
						&& !enemy.Enemy.nopickpocket && enemy.Enemy.bound && !KDGameData.JailKey && KDCanPickpocket(enemy)) {
						let item = playerItems.length > 0 ? playerItems[Math.floor(KDRandom() * playerItems.length)] : undefined;
						let picked = false;
						// If the player's location is trapped she will get disarmed
						if ((KDIsPlayerTethered(KinkyDungeonPlayerEntity) || KinkyDungeonSlowLevel > 9) && KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed
							&& KinkyDungeonIsArmsBound() && KDRandom() < 0.5) {
							// Disarm the player
							KinkyDungeonDisarm(enemy, "Leash");
							picked = true;
						} else if (KDGameData.KinkyDungeonLeashedPlayer < 1 && item && playerItems.length > 0
							&& KinkyDungeonIsArmsBound() && ((!KinkyDungeonPlayerDamage || item.name != KinkyDungeonPlayerDamage.name) || KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.05) && KDRandom() < 0.5) {
							if (item.type == Weapon) {
								if (item.name == KinkyDungeonPlayerDamage?.name)
									KinkyDungeonDisarm(enemy, "Leash");
								else
									KinkyDungeonInventoryRemove(item);
								//KinkyDungeonAddLostItems([item], false);
								if (!enemy.items) enemy.items = [item.name];
								else if (!enemy.items.includes(item.name))
									enemy.items.push(item.name);
							} else if (item.type == Consumable) {
								KinkyDungeonChangeConsumable(KinkyDungeonConsumables[item.name], -1);
								/** @type {item} */
								let item2 = Object.assign({}, item);
								//KinkyDungeonAddLostItems([item2], false);
								item2.quantity = 1;
								if (!enemy.items) enemy.items = [item.name];
								enemy.items.push(item.name);
							}
							if (item) {
								KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStealItem").replace("ITEMSTOLEN", TextGet("KinkyDungeonInventoryItem" + item.name)), "yellow", 2);
								picked = true;
							}
						} else if (KDGameData.KinkyDungeonLeashedPlayer < 1 && KinkyDungeonLockpicks > 0 && KDRandom() < 0.5) {
							KinkyDungeonLockpicks -= 1;
							KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonStealPick"), "yellow", 2);
							if (!enemy.items) enemy.items = ["Pick"];
							enemy.items.push("Pick");
							picked = true;
						} else if (KDGameData.KinkyDungeonLeashedPlayer < 1 && KinkyDungeonRedKeys > 0) {
							KinkyDungeonRedKeys -= 1;
							KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonStealRedKey"), "yellow", 2);
							if (!enemy.items) enemy.items = ["RedKey"];
							enemy.items.push("RedKey");
							picked = true;
						} else if (KDGameData.KinkyDungeonLeashedPlayer < 1 && KinkyDungeonBlueKeys > 0) {
							KinkyDungeonBlueKeys -= 1;
							KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonStealBlueKey"), "yellow", 2);
							if (!enemy.items) enemy.items = ["BlueKey"];
							enemy.items.push("BlueKey");
							picked = true;
						}
						/*else if (KinkyDungeonEnchantedBlades > 0 && KDRandom() < 0.5) {
							KinkyDungeonEnchantedBlades -= 1;
							KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonStealEnchKnife"), "yellow", 2);
							if (!enemy.items) enemy.items = ["EnchKnife"];
							enemy.items.push("knife");
						}*/
						if (picked) {
							KinkyDungeonSetFlag("pickpocket", 1);
							KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Miss.ogg", enemy);
							if (KDRandom() < actionDialogueChanceIntense)
								KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Pickpocket").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 1);

						}
					}
					let data = {};
					if (AIData.attack.includes("Dash") && (enemy.Enemy.dashThruWalls || AIData.canSeePlayer)) {
						let d = KDDash(enemy, player, AIData.MovableTiles);
						Dash = d.Dash;
						happened += d.happened;
					}
					if (AIData.attack.includes("Will") || willpowerDamage > 0) {
						if (willpowerDamage == 0)
							willpowerDamage += AIData.power;
						let buffdmg = KinkyDungeonGetBuffedStat(enemy.buffs, "AttackDmg");
						if (buffdmg) willpowerDamage = Math.max(0, willpowerDamage + buffdmg);
						msgColor = "#ff5555";
						if (enemy.usingSpecial && willpowerDamage > 0 && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Will")) {
							enemy.specialCD = enemy.Enemy.specialCD;
						}
					}
					if (player.player) {
						KinkyDungeonTickBuffTag(enemy, "hit", 1);
						if (restraintAdd && restraintAdd.length > 0) {
							msgColor = "#ff5555";
							bound += KDRunBondageResist(enemy, KDGetFaction(enemy), restraintAdd,(r) => {
								KDDamageQueue.push({floater: TextGet("KDBlockedRestraint"), Entity: {x: enemy.x - 0.5, y: enemy.y - 0.5}, Color: "#88ff88", Time: 2, Delay: 0});
								for (let rep of replace) {
									if (rep.keyword == "RestraintAdded") rep.value = TextGet("KDRestraintBlockedItem");
								}
								if (!r)
									KinkyDungeonSendTextMessage(1, TextGet("KDBondageResistBlockTotal"), "#88ff88", 1);
								msgColor = "#ff8800";
								attackBlocked = true;
								bound += 1;
								if (willpowerDamage == 0)
									willpowerDamage += AIData.power;
							},
							restraintFromInventory).length*2;
						}


						if (AIData.attack.includes("Slow")) {
							KDGameData.MovePoints = Math.max(KDGameData.MovePoints - 2, -1);
							if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Slow")) {
								enemy.specialCD = enemy.Enemy.specialCD;
							}
							happened += 1;
						}
						if (AIData.attack.includes("Effect") && enemy.Enemy.effect) {
							let affected = KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, enemy.Enemy.effect.damage, enemy.Enemy.effect.effect, enemy.Enemy.effect.spell, KDGetFaction(enemy), undefined, enemy);
							if (affected && enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Effect")) {
								enemy.specialCD = enemy.Enemy.specialCD;
							}
							Effected = true;
							happened += 1;
						}
						if (AIData.attack.includes("Stun")) {
							let time = enemy.Enemy.stunTime ? enemy.Enemy.stunTime : 1;
							KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, time);
							KDGameData.MovePoints = Math.max(Math.min(-1, -time+1), KDGameData.MovePoints-time); // This is to prevent stunlock while slowed heavily
							if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Stun")) {
								enemy.specialCD = enemy.Enemy.specialCD;
							}
							happened += 1;
							priorityBonus += 3*time;
							Stun = true;
							if (KDRandom() < actionDialogueChanceIntense)
								KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Stun").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 3);

						}
						if (AIData.attack.includes("Blind")) {
							let time = enemy.Enemy.blindTime ? enemy.Enemy.blindTime : 1;
							KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, time);
							if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Blind")) {
								enemy.specialCD = enemy.Enemy.specialCD;
							}
							happened += 1;
							priorityBonus += 3*time;
							Blind = true;
						}
						happened += bound;

						data = {
							attack: AIData.attack,
							enemy: enemy,
							bound: bound,
							damage: willpowerDamage,
							damagetype: AIData.damage,
							restraintsAdded: restraintAdd,
							attacker: enemy,
							target: player,
							happened: happened,
							player: player,
						};
						KinkyDungeonSendEvent("beforeDamage", data);
						KDDelayedActionPrune(["Hit"]);
						let dmg = KinkyDungeonDealDamage({damage: data.damage, type: data.damagetype});
						data.happened += dmg.happened;
						if (!enemy.playWithPlayer)
							KinkyDungeonSetFlag("NPCCombat",  3);
						happened = data.happened;
						replace.push({keyword:"DamageTaken", value: dmg.string});
					} else { // if (KDRandom() <= playerEvasion)
						if (AIData.attack.includes("Slow")) {
							if (player.movePoints)
								player.movePoints = Math.max(player.movePoints - 1, 0);
							if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Slow")) {
								enemy.specialCD = enemy.Enemy.specialCD;
							}
							happened += 1;
						}
						if (AIData.attack.includes("Stun")) {
							let time = enemy.Enemy.stunTime ? enemy.Enemy.stunTime : 1;
							if (!player.stun) player.stun = time;
							else player.stun = Math.max(time, player.stun);
							if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Stun")) {
								enemy.specialCD = enemy.Enemy.specialCD;
							}
							happened += 1;
						}
						if (AIData.attack.includes("Blind")) {
							let time = enemy.Enemy.blindTime ? enemy.Enemy.blindTime : 1;
							if (!player.blind) player.blind = time;
							else player.blind = Math.max(time, player.blind);
							if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Blind")) {
								enemy.specialCD = enemy.Enemy.specialCD;
							}
							happened += 1;
						}
						if (AIData.attack.includes("Silence")) {
							let time = enemy.Enemy.silenceTime ? enemy.Enemy.silenceTime : 1;
							KDSilenceEnemy(player, time);
							if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Blind")) {
								enemy.specialCD = enemy.Enemy.specialCD;
							}
							happened += 1;
						}


						let dmg = AIData.power;
						let buffdmg = KinkyDungeonGetBuffedStat(enemy.buffs, "AttackDmg");
						if (buffdmg) dmg = Math.max(0, dmg + buffdmg);
						if (enemy.Enemy.fullBoundBonus) {
							dmg += enemy.Enemy.fullBoundBonus; // Some enemies deal bonus damage if they cannot put a binding on you
						}
						happened += KinkyDungeonDamageEnemy(player, {type: enemy.Enemy.dmgType, damage: dmg}, false, true, undefined, undefined, enemy);
						KinkyDungeonSetFlag("NPCCombat",  3);
						KinkyDungeonTickBuffTag(enemy, "hit", 1);
						if (happened > 0) {
							// Decrement play timer on a hit, less if they are on furniture
							if (enemy.playWithPlayer) {
								KDAddOpinion(enemy, 10);
								enemy.playWithPlayer = Math.max(0, enemy.playWithPlayer - (!KinkyDungeonPlayerTags.has("Furniture") ? 2 : 1) * Math.max(1, ((enemy.usingSpecial && enemy.Enemy.specialAttackPoints) ? enemy.Enemy.specialAttackPoints : enemy.Enemy.attackPoints))); // Decrement each attack....
								if (enemy.playWithPlayer == 0 && !KinkyDungeonFlags.get("noResetIntentFull")) KDResetIntent(enemy, AIData);
							}
							let sfx = (AIData.hitsfx) ? AIData.hitsfx : "DealDamage";
							KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg", enemy);
						}
					}

					if (AIData.attack.includes("Suicide")) {
						if ((!enemy.Enemy.suicideOnAdd && !enemy.Enemy.suicideOnLock && !enemy.Enemy.suicideOnEffect)
							|| (enemy.Enemy.suicideOnAdd && addedRestraint)
							|| (enemy.Enemy.suicideOnLock && Locked)
							|| (enemy.Enemy.suicideOnEffect && Effected)
							|| (!player.player && AIData.attack.includes("Bind") && enemy.Enemy.suicideOnAdd)) {
							enemy.hp = 0;
						} else if ((!KinkyDungeonHasWill(0.1) || (enemy.Enemy.Attack?.mustBindorFail)) && enemy.Enemy.failAttackflag) {
							for (let f of enemy.Enemy.failAttackflag) {
								KinkyDungeonSetFlag(f, enemy.Enemy.failAttackflagDuration || 12);
							}
						}
					}

					if (enemy.usingSpecial && enemy.specialCD > 0 && enemy.Enemy.specialCharges) {
						if (enemy.specialCharges == undefined) enemy.specialCharges = enemy.Enemy.specialCharges-1;
						else enemy.specialCharges -= 1;
					}

					if (happened > 0 && player.player) {
						let suffix = "";
						if (Stun) suffix = "Stun";
						else if (Blind) suffix = "Blind";
						else if (Locked) suffix = "Lock";
						else if (bound > 0) suffix = "Bind";
						if (Dash) suffix = "Dash";
						if (enemy.usingSpecial && enemy.Enemy.specialMsg) suffix = "Special";

						let sfx = (AIData.hitsfx) ? AIData.hitsfx : (data.damage > 1 ? "Damage" : "DamageWeak");
						if (enemy.usingSpecial && enemy.Enemy.specialsfx) sfx = enemy.Enemy.specialsfx;
						KinkyDungeonSendEvent("hit", data);
						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg", enemy);
						let text = TextGet("Attack"+enemy.Enemy.name + suffix);
						if (replace)
							for (let R = 0; R < replace.length; R++)
								text = text.replace(replace[R].keyword, "" + replace[R].value);
						KinkyDungeonSendTextMessage(happened+priorityBonus, text, msgColor, 1);
						if (!enemy.Enemy.tags.temporary && AIData.attack.includes("Bind") && KDCanPickpocket(enemy))
							KinkyDungeonLoseJailKeys(true, undefined, enemy);
					}
				}
				KinkyDungeonTickBuffTag(enemy, "damage", 1);

				enemy.warningTiles = [];
				if (enemy.usingSpecial) enemy.usingSpecial = false;
			}
		} else {
			enemy.warningTiles = [];
			enemy.attackPoints = 0;
			if (enemy.usingSpecial) enemy.usingSpecial = false;
			enemy.fx = enemy.x + dir.x;
			enemy.fy = enemy.y + dir.y;
		}
	} else {
		enemy.warningTiles = [];
		enemy.attackPoints = 0;
	}

	enemy.moved = (AIData.moved || enemy.movePoints > 0);
	enemy.idle = AIData.idle && !(AIData.moved || enemy.attackPoints > 0);
	if (enemy.idle) {
		enemy.fx = undefined;
		enemy.fy = undefined;
	}


	if (!AIType.afteridle || !AIType.afteridle(enemy, player, AIData)) {
		// Spell loop
		if (AIData.wantsToCast
		&& (!enemy.Enemy.enemyCountSpellLimit || KDMapData.Entities.length < enemy.Enemy.enemyCountSpellLimit)
		&& ((!player.player || (AIData.aggressive || (KDGameData.PrisonerState == 'parole' && enemy.Enemy.spellWhileParole))))
		&& (!enemy.silence || enemy.silence < 0.01)
		&& (!enemy.blind || enemy.blind < 0.01 || AIData.playerDist < 2.99)
		&& (!enemy.Enemy.noSpellDuringAttack || enemy.attackPoints < 1)
		&& (!enemy.Enemy.noSpellsWhenHarmless || !AIData.harmless)
		&& (!enemy.Enemy.noSpellsLowSP || KinkyDungeonHasWill(0.1) || KinkyDungeonFlags.has("PlayerCombat"))
		&& (!enemy.Enemy.noSpellLeashing || KinkyDungeonLeashingEnemy()?.id != enemy.id || KDGameData.KinkyDungeonLeashedPlayer < 1)
		&& (!enemy.Enemy.followLeashedOnly || (KDGameData.KinkyDungeonLeashedPlayer < 1 || KinkyDungeonLeashingEnemy()?.id == enemy.id))
		&& (AIData.hostile || (!player.player && (KDHostile(player) || enemy.rage)))
		&& ((enemy.aware && (KDCanDetect(enemy, player))) || (!KDAllied(enemy) && !AIData.hostile))
		&& !AIData.ignore && (!AIData.moved || enemy.Enemy.castWhileMoving) && enemy.Enemy.attack.includes("Spell")
		&& !AIData.ignoreRanged
		&& AIType.spell(enemy, player, AIData)
		&& KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.visionRadius, false, true) && enemy.castCooldown <= 0) {
			AIData.idle = false;
			let spellchoice = null;
			let spell = null;
			let spelltarget = undefined;

			for (let tries = 0; tries < 6; tries++) {
				spelltarget = null;
				spellchoice = enemy.Enemy.spells[Math.floor(KDRandom()*enemy.Enemy.spells.length)];
				spell = KinkyDungeonFindSpell(spellchoice, true);
				if (spell && (enemy.blind > 0 && (spell.projectileTargeting))) spell = null;
				if (spell && ((!spell.castRange && AIData.playerDist > spell.range) || (spell.castRange && AIData.playerDist > spell.castRange))) spell = null;
				if (spell && spell.specialCD && enemy.castCooldownSpecial > 0) spell = null;
				if (spell && spell.noFirstChoice && tries <= 2) spell = null;
				if (spell && spell.projectileTargeting && !KinkyDungeonCheckProjectileClearance(enemy.x, enemy.y, player.x, player.y)) spell = null;
				if (spell && spell.buff) {
					if (enemy.Enemy.buffallies || spell.buffallies) {
					// Select a random nearby ally of the enemy
						let nearAllies = [];
						for (let e of KDMapData.Entities) {
							if ((e != enemy || spell.selfbuff) && (!spell.heal || e.hp < e.Enemy.maxhp - spell.power*0.5)
							&& e.aware && !KinkyDungeonHasBuff(e.buffs, spell.name)
							&& !e.rage
							&& ((KDAllied(enemy) && KDAllied(e)) || (KDHostile(enemy) && KDHostile(e) || KDFactionRelation(KDGetFaction(e), KDGetFaction(enemy)) >= 0.1))
							&& Math.sqrt((enemy.x - e.x)*(enemy.x - e.x) + (enemy.y - e.y)*(enemy.y - e.y)) < spell.range
							&& (!spell.castCondition || (KDCastConditions[spell.castCondition] && KDCastConditions[spell.castCondition](enemy, e, spell)))) {
								let allow = !spell.filterTags;
								if (spell.filterTags && KDMatchTags(spell.filterTags, e)) allow = true;
								if (allow)
									nearAllies.push(e);
							}
						}
						if (nearAllies.length > 0) {
							let e = nearAllies[Math.floor(KDRandom() * nearAllies.length)];
							if (e) {
								spelltarget = e;
								KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonSpellCast" + spell.name).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "white", 2);
								break;
							}
						} else spell = null;
					} else {
						spelltarget = enemy;
						if (spell.castCondition && (!KDCastConditions[spell.castCondition] && !KDCastConditions[spell.castCondition](enemy, enemy, spell))) spell = null;
					}
				} else if (spell?.castCondition && (KDCastConditions[spell.castCondition] && !KDCastConditions[spell.castCondition](enemy, player, spell))) spell = null;
				let minSpellRange = (spell && spell.minRange != undefined) ? spell.minRange : ((spell && (spell.selfcast || spell.buff || (spell.range && spell.range < 1.6))) ? 0 : 1.5);
				if (spell && spell.heal && spelltarget.hp >= spelltarget.Enemy.maxhp) spell = null;
				if (spell && !(!minSpellRange || (AIData.playerDist > minSpellRange))) spell = null;
				if (spell && !(!spell.minRange || (AIData.playerDist > spell.minRange))) spell = null;
				if (spell) break;
			}
			if (spell && enemy.distraction && !enemy.Enemy.noMiscast && KDRandom() < enemy.distraction / enemy.Enemy.maxhp * 0.8) {
				if (player == KinkyDungeonPlayerEntity) KinkyDungeonSendTextMessage(4,
					TextGet(enemy.Enemy.miscastmsg || "KDEnemyMiscast").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "#88ff88", 2);
				KinkyDungeonCastSpell(enemy.x, enemy.y, KinkyDungeonFindSpell("EnemyMiscast", true), enemy, player);
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + (enemy.Enemy.miscastsfx || "SoftShield") + ".ogg", enemy);
				KinkyDungeonSendEvent("enemyMiscast", {spell: spell, enemy: enemy, player: player, AIData: AIData});

				KDEnemyAddSound(enemy, enemy.Enemy.Sound?.castAmount != undefined ? enemy.Enemy.Sound?.castAmount : KDDefaultEnemyCastSound);
			} else if (spell) {
				if (spell.channel && !enemy.Enemy.noChannel) enemy.channel = spell.channel;
				enemy.castCooldown = spell.manacost*enemy.Enemy.spellCooldownMult + enemy.Enemy.spellCooldownMod + 1;
				if (spell.specialCD)
					enemy.castCooldownSpecial = spell.specialCD;
				let xx = player.x;
				let yy = player.y;
				if (spelltarget) {
					xx = spelltarget.x;
					yy = spelltarget.y;
				}
				if (spell && spell.selfcast) {
					xx = enemy.x;
					yy = enemy.y;
					if (!spell.noCastMsg)
						KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonSpellCast" + spell.name).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "white", 4, undefined, undefined, enemy);
				} else if (spell && spell.msg) {
					if (!spell.noCastMsg)
						KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonSpellCast" + spell.name).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "white", 4, undefined, undefined, enemy);
				}


				if (spell && KinkyDungeonCastSpell(xx, yy, spell, enemy, player).result == "Cast" && spell.sfx) {
					if (!enemy.Enemy.noFlip) {
						if (Math.sign(xx - enemy.x) < 0) {
							delete enemy.flip;
						} else if (Math.sign(xx - enemy.x) > 0) {
							enemy.flip = true;
						}
					}
					if (enemy.Enemy.suicideOnSpell) enemy.hp = 0;
					KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + spell.sfx + ".ogg", enemy);
				}

				KinkyDungeonSendEvent("enemyCast", {spell: spell, spelltarget: spelltarget, enemy: enemy, player: player, AIData: AIData});

				KDEnemyAddSound(enemy, enemy.Enemy.Sound?.castAmount != undefined ? enemy.Enemy.Sound?.castAmount : KDDefaultEnemyCastSound);

			//console.log("casted "+ spell.name);
			}
		}
		if (AIData.vibe || (enemy.Enemy.RemoteControl?.remote && AIData.playerDist < enemy.Enemy.RemoteControl?.remote)) {
			KinkyDungeonSendEvent("remoteVibe", {enemy: enemy.Enemy.name, power: enemy.Enemy.RemoteControl?.remoteAmount ? enemy.Enemy.RemoteControl?.remoteAmount : 5, overcharge: AIData.vibe, noSound: AIData.vibe});
		}
		if (AIData.aggressive && AIData.canSensePlayer && enemy.Enemy.RemoteControl?.punishRemote && AIData.playerDist < enemy.Enemy.RemoteControl?.punishRemote) {
			KinkyDungeonSendEvent("remotePunish", {enemy});
		}
	}

	if (enemy.IntentAction && KDIntentEvents[enemy.IntentAction] && KDIntentEvents[enemy.IntentAction].maintain) {
		KDIntentEvents[enemy.IntentAction].maintain(enemy, delta, AIData);
	}

	if (enemy.playWithPlayer > 0 && !AIData.aggressive) {
		KinkyDungeonApplyBuffToEntity(enemy, KDEager);
		if (AIData.domMe)
			KinkyDungeonApplyBuffToEntity(enemy, KDMasochist);
	}

	if (enemy.usingSpecial && (AIData.idle || (AIData.moved && !enemy.Enemy.attackWhileMoving)) && enemy.Enemy.specialCDonAttack) {
		enemy.specialCD = enemy.Enemy.specialCD;
	}
	if (enemy.specialCD > 0) enemy.usingSpecial = false;

	if (AIData.idle) KDAddThought(enemy.id, "Idle", 0.5, 3);
	return {idle: AIData.idle, defeat: AIData.defeat, defeatEnemy: enemy};
}

// Unique ID for enemies, to prevent bullets from hitting them
// Dont want to pass object handles around in case we ever allow saving a room
function KinkyDungeonGetEnemyID() {
	if (KinkyDungeonEnemyID > 100000000) KinkyDungeonEnemyID = 0;
	return KinkyDungeonEnemyID++;
}
// Unique ID for enemies, to prevent bullets from hitting them
// Dont want to pass object handles around in case we ever allow saving a room
function KinkyDungeonGetSpellID() {
	if (KinkyDungeonSpellID > 100000000) KinkyDungeonSpellID = 0;
	return KinkyDungeonSpellID++;
}
// Unique ID for items for identification reasons
// Dont want to pass object handles around in case we ever allow saving a room
function KinkyDungeonGetItemID() {
	if (KDGameData.ItemID > 100000000 || KDGameData.ItemID == undefined) KDGameData.ItemID = 0;
	return KDGameData.ItemID++;
}

let KinkyDungeonEnemyID = 1;
let KinkyDungeonSpellID = 1;

function KinkyDungeonNoEnemy(x, y, Player) {

	if (KinkyDungeonEnemyAt(x, y)) return false;
	if (Player)
		for (let player of KinkyDungeonPlayers)
			if ((player.x == x && player.y == y)) return false;
	return true;
}

/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDIsImmobile(enemy) {
	return enemy && (enemy.Enemy.immobile || enemy.Enemy.tags?.immobile || KDEnemyHasFlag(enemy, "imprisoned"));
}

// e = potential sub
// Enemy = leader
/**
 *
 * @param {entity} e - Target enemy
 * @param {entity} Enemy - Enemy trying to move
 * @returns
 */
function KinkyDungeonCanSwapWith(e, Enemy) {
	if (KDIsImmobile(e)) return false; // Definition of noSwap
	if (e && KDEnemyHasFlag(e, "noswap")) return false; // Definition of noSwap

	if (KinkyDungeonTilesGet(e.x + "," + e.y) && KinkyDungeonTilesGet(e.x + "," + e.y).OffLimits && Enemy != KinkyDungeonJailGuard() && !KinkyDungeonAggressive(Enemy)) return false;
	// Only jailguard or aggressive enemy is allowed to swap into offlimits spaces unless hostile

	if (Enemy && Enemy.Enemy && Enemy.Enemy.ethereal && e && e.Enemy && !e.Enemy.ethereal) return false; // Ethereal enemies NEVER have seniority, this can teleport other enemies into walls
	if (Enemy && Enemy.Enemy && Enemy.Enemy.squeeze && e && e.Enemy && !e.Enemy.squeeze) return false; // Squeeze enemies NEVER have seniority, this can teleport other enemies into walls

	// Should not swap or block the leasher
	if (e == KinkyDungeonLeashingEnemy() && Enemy) return false;
	if (KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, e.x, e.y, e)) return false; // KD Tethered to entity
	if (e == KinkyDungeonJailGuard() && Enemy != KinkyDungeonLeashingEnemy()) return false;
	if (Enemy == KinkyDungeonLeashingEnemy()) return true;
	if (Enemy == KinkyDungeonJailGuard()) return true;
	if (KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, Enemy.x, Enemy.y, Enemy)) return true; // KD Tethered to entity

	if (KDBoundEffects(e) > 3) return true;
	if (!e.Enemy.tags || (e.Enemy.tags.minor && !Enemy.Enemy.tags.minor))
		return true;
	else if (Enemy && Enemy.Enemy && Enemy.Enemy.tags && Enemy.Enemy.tags.elite) {
		if (!e.Enemy.tags || (!e.Enemy.tags.elite && !e.Enemy.tags.miniboss && !e.Enemy.tags.boss))
			return true;
	} else if (Enemy && Enemy.Enemy && Enemy.Enemy.tags && Enemy.Enemy.tags.miniboss) {
		if (!e.Enemy.tags || (!e.Enemy.tags.miniboss && !e.Enemy.tags.boss))
			return true;
	} else if (Enemy && Enemy.Enemy && Enemy.Enemy.tags && Enemy.Enemy.tags.boss) {
		if (!e.Enemy.tags || (!e.Enemy.tags.boss))
			return true;
	}
	return false;
}

function KinkyDungeonNoEnemyExceptSub(x, y, Player, Enemy) {
	let e = KinkyDungeonEnemyAt(x, y);
	if (e && e.Enemy) {
		if (e.Enemy.master && Enemy && Enemy.Enemy && e.Enemy.master.type == Enemy.Enemy.name) return true;
		let seniority = Enemy ? KinkyDungeonCanSwapWith(e, Enemy) : false;
		return seniority;
	}
	if (Player)
		for (let pp of KinkyDungeonPlayers)
			if ((pp.x == x && pp.y == y)) return false;
	return true;
}

function KinkyDungeonEnemyAt(x, y) {
	let cache = KDGetEnemyCache();
	if (cache) return cache.get(x + "," + y);
	for (let enemy of KDMapData.Entities) {
		if (enemy.x == x && enemy.y == y)
			return enemy;
	}
	return null;
}

function KinkyDungeonEntityAt(x, y, requireVision, vx, vy) {
	if (KinkyDungeonPlayerEntity.x == x && KinkyDungeonPlayerEntity.y == y) return KinkyDungeonPlayerEntity;
	let cache = KDGetEnemyCache();
	if (!requireVision && cache) return cache.get(x + "," + y);
	else if (cache) {
		let enemy = cache.get(x + "," + y);
		if (KDCanSeeEnemy(enemy, KDistEuclidean(x - vx, y - vy))) return enemy;
	}
	for (let enemy of KDMapData.Entities) {
		if (enemy.x == x && enemy.y == y && (!requireVision || KDCanSeeEnemy(enemy, KDistEuclidean(x - vx, y - vy))))
			return enemy;
	}
	return null;
}

function KinkyDungeonEnemyTryMove(enemy, Direction, delta, x, y) {
	let speedMult = KinkyDungeonGetBuffedStat(enemy.buffs, "MoveSpeed") ? KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(enemy.buffs, "MoveSpeed")) : 1;
	if (enemy.bind > 0) enemy.movePoints += speedMult * delta/10;
	else if (enemy.slow > 0) enemy.movePoints += speedMult * delta/2;
	else enemy.movePoints += KDGameData.SleepTurns > 0 ? 4*delta * speedMult : delta * speedMult;

	let moveMult = KDBoundEffects(enemy) * 0.5;

	if (enemy.movePoints > 0) {
		enemy.fx = enemy.x + Direction.x;
		enemy.fy = enemy.y + Direction.y;
	}

	if (enemy.movePoints >= enemy.Enemy.movePoints + moveMult) {
		enemy.movePoints = Math.max(0, enemy.movePoints - enemy.Enemy.movePoints + moveMult);
		let dist = Math.abs(x - KinkyDungeonPlayerEntity.x) + Math.abs(y - KinkyDungeonPlayerEntity.y);

		let ee = KinkyDungeonEnemyAt(enemy.x + Direction.x, enemy.y + Direction.y);

		if (!ee && KinkyDungeonMapGet(enemy.x, enemy.y) == 'd' && enemy.Enemy && enemy.Enemy.tags.closedoors && !(KDGameData.KinkyDungeonLeashedPlayer > 0 || KinkyDungeonFlags.has("noclosedoors"))
			&& ((dist > 5) ||
				(KinkyDungeonTilesGet(enemy.x + "," + enemy.y) && KDHostile(enemy) && (KinkyDungeonTilesGet(enemy.x + "," + enemy.y).Jail || KinkyDungeonTilesGet(enemy.x + "," + enemy.y).ReLock) && !KinkyDungeonFlags.has("nojailbreak")))) {
			KinkyDungeonMapSet(enemy.x, enemy.y, 'D');
			if (KDGameData.PrisonerState == 'jail' && KinkyDungeonTilesGet(enemy.x + "," + enemy.y) && KDHostile(enemy) && (KinkyDungeonTilesGet(enemy.x + "," + enemy.y).Jail || KinkyDungeonTilesGet(enemy.x + "," + enemy.y).ReLock)
				&& !KinkyDungeonFlags.has("nojailbreak")) {
				KinkyDungeonTilesGet(enemy.x + "," + enemy.y).Lock = "Red";
				KDUpdateDoorNavMap();
			}
			if (dist < 10) {
				KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonHearDoorCloseNear"), "#dddddd", 4);
			} else if (dist < 20)
				KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonHearDoorCloseFar"), "#999999", 4);
		}

		if (ee && KinkyDungeonCanSwapWith(ee, enemy)) {
			KDMoveEntity(ee, enemy.x, enemy.y, false,undefined, undefined, true);
			ee.warningTiles = [];
			ee.movePoints = 0;
			ee.stun = 1;
		}
		if (!ee || !KinkyDungeonEnemyAt(enemy.x + Direction.x, enemy.y + Direction.y))
			KDMoveEntity(enemy, enemy.x + Direction.x, enemy.y + Direction.y, true,undefined, undefined, true);

		if (KinkyDungeonMapGet(x, y) == 'D' && enemy.Enemy && enemy.Enemy.tags.opendoors) {
			KinkyDungeonMapSet(x, y, 'd');
			if (KinkyDungeonTilesGet(x + ',' +y) && KinkyDungeonTilesGet(x + ',' +y).Type == "Door")
				KinkyDungeonTilesGet(x + ',' +y).Lock = undefined;
			if (dist < 5) {
				KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonHearDoorOpenNear"), "#dddddd", 4);
			} else if (dist < 15)
				KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonHearDoorOpenFar"), "#999999", 4);
		}

		return true;
	}
	return false;
}

function KinkyDungeonEnemyTryAttack(enemy, player, Tiles, delta, x, y, points, replace, msgColor, usingSpecial, refreshWarningTiles, attack, MovableTiles) {
	if (!enemy.Enemy.noCancelAttack && !refreshWarningTiles && points > 1) {
		let playerIn = false;
		for (let T = 0; T < Tiles.length; T++) {
			let ax = enemy.x + Tiles[T].x;
			let ay = enemy.y + Tiles[T].y;

			if (player.x == ax && player.y == ay && (!enemy.Enemy.strictAttackLOS || KinkyDungeonCheckProjectileClearance(enemy.x, enemy.y, player.x, player.y))) {
				playerIn = true;
				break;
			}
		}

		if (!playerIn && Tiles.length > 0) {
			if (enemy.Enemy.specialRange && enemy.usingSpecial && enemy.Enemy.specialCDonAttack) {
				enemy.specialCD = enemy.Enemy.specialCD;
				enemy.attackPoints = 0;
				enemy.warningTiles = [];
				enemy.usingSpecial = false;
				if (enemy.Enemy.stunOnSpecialCD) enemy.stun = enemy.Enemy.stunOnSpecialCD;
				if (attack.includes("Dash") && !enemy.Enemy.Dash?.noDashOnSidestep) {
					KDDash(enemy, player, MovableTiles);
				}
				return false;
			}
			if (enemy.Enemy.specialWidth && enemy.usingSpecial && enemy.Enemy.specialCDonAttack) {
				enemy.specialCD = enemy.Enemy.specialCD;
				enemy.attackPoints = 0;
				enemy.warningTiles = [];
				enemy.usingSpecial = false;
				if (enemy.Enemy.stunOnSpecialCD) enemy.stun = enemy.Enemy.stunOnSpecialCD;
				if (attack.includes("Dash") && !enemy.Enemy.Dash?.noDashOnSidestep) {
					KDDash(enemy, player, MovableTiles);
				}
				return false;
			}
		}
	}

	enemy.attackPoints += delta * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(enemy.buffs, "AttackSpeed"));
	if (!enemy.playWithPlayer)
		KinkyDungeonSetFlag("NPCCombat",  3);

	if (enemy.attackPoints >= points) {
		enemy.attackPoints = enemy.attackPoints - points;
		return true;
	}
	return false;
}

function KinkyDungeonGetWarningTilesAdj(enemy) {
	let arr = [];

	arr.push({x:1, y:1, visual_x:enemy.x, visual_y:enemy.y, scale: 0});
	arr.push({x:0, y:1, visual_x:enemy.x, visual_y:enemy.y, scale: 0});
	arr.push({x:1, y:0, visual_x:enemy.x, visual_y:enemy.y, scale: 0});
	arr.push({x:-1, y:-1, visual_x:enemy.x, visual_y:enemy.y, scale: 0});
	arr.push({x:-1, y:1, visual_x:enemy.x, visual_y:enemy.y, scale: 0});
	arr.push({x:1, y:-1, visual_x:enemy.x, visual_y:enemy.y, scale: 0});
	arr.push({x:-1, y:0, visual_x:enemy.x, visual_y:enemy.y, scale: 0});
	arr.push({x:0, y:-1, visual_x:enemy.x, visual_y:enemy.y, scale: 0});

	return arr;
}


/**
 * Returns whether or not the player can be pickpocketed
 * Current conditions are:
 *  - Player has less than 50 willpower
 * @param {entity} player
 * @returns {boolean}
 */
function KDCanPickpocketPlayer(player) {
	return !KinkyDungeonHasWill(5) || KDIsPlayerTethered(KinkyDungeonPlayerEntity);
}

function KDCanPickpocket(enemy) {
	if (KDEnemyHasFlag(enemy, "allyPlay")) return false;
	if (KinkyDungeonFlags.has("pickpocket")) return false;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).enclose) return false;
	}
	return KDHostile(enemy) || ((KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'parole') && KinkyDungeonPlayerTags.has("Furniture"));
}


function KinkyDungeonGetWarningTiles(dx, dy, range, width, forwardOffset = 1, enemy) {
	if (range == 1 && width == 8) return KinkyDungeonGetWarningTilesAdj(enemy);

	let arr = [];
	/*
	let cone = 0.78539816 * (width-0.9)/2;
	let angle_player = Math.atan2(dx, dy) + ((width % 2 == 0) ? ((KDRandom() > 0.5) ? -0.39269908 : 39269908) : 0);
	if (angle_player > Math.PI) angle_player -= Math.PI;
	if (angle_player < -Math.PI) angle_player += Math.PI;

	for (let X = -range; X <= range; X++)
		for (let Y = -range; Y <= range; Y++) {
			let angle = Math.atan2(X, Y);

			let angleDiff = angle - angle_player;
			angleDiff += (angleDiff>Math.PI) ? -2*Math.PI : (angleDiff<-Math.PI) ? 2*Math.PI : 0;

			if (Math.abs(angleDiff) < cone + 0.22/Math.max(Math.abs(X), Math.abs(Y)) && Math.sqrt(X*X + Y*Y) < range + 0.5) arr.push({x:X, y:Y});
		}
	*/
	let dist = Math.sqrt(dx*dx + dy*dy);
	let radius = Math.ceil(width/2);
	if (dist > 0) {
		let x_step = dx/dist;
		let y_step = dy/dist;

		for (let d = forwardOffset; d <= range; d++) {
			let xx = x_step * d;
			let yy = y_step * d;
			for (let X = Math.floor(xx-radius); X <= Math.ceil(xx+radius); X++)
				for (let Y = Math.floor(yy-radius); Y <= Math.ceil(yy+radius); Y++) {
					let dd = Math.sqrt((X - xx)*(X - xx) + (Y - yy)*(Y - yy));
					let dd2 = Math.sqrt(X*X+Y*Y);
					if (dd < width*0.49 && dd2 < range + 0.5) {
						let dupe = false;
						for (let a of arr) {
							if (a.x == X && a.y == Y) {dupe = true; break;}
						}
						if (!dupe) arr.push({x:X, y:Y, visual_x:enemy.x, visual_y:enemy.y, scale: 0});
					}
				}
		}
	}

	return arr;
}

/**
 *
 * @param {entity} enemy
 * @returns {{master: entity; dist: number; info: any;}}
 */
function KinkyDungeonFindMaster(enemy) {
	let findMaster = undefined;
	let masterDist = 1000;
	let masterInfo = enemy.master || enemy.Enemy.master;
	if (masterInfo) {
		for (let e of KDMapData.Entities) {
			if (e.Enemy.name == masterInfo.type || (masterInfo.masterTag && e.Enemy.tags && e.Enemy.tags[masterInfo.masterTag])) {
				let dist = Math.sqrt((e.x - enemy.x) * (e.x - enemy.x) + (e.y - enemy.y)*(e.y - enemy.y));
				if ((!masterInfo.maxDist || dist < masterInfo.maxDist)
					&& dist < masterDist
					&& (!masterInfo.loose || KinkyDungeonCheckLOS(enemy, e, dist, 100, false, false))) {
					masterDist = Math.sqrt((e.x - enemy.x) * (e.x - enemy.x) + (e.y - enemy.y)*(e.y - enemy.y));
					findMaster = e;
				}
			}
		}
	}
	return {master: findMaster, dist: masterDist, info: masterInfo};
}

function KinkyDungeonEnemyCanMove(enemy, dir, MovableTiles, AvoidTiles, ignoreLocks, Tries) {
	if (!dir) return false;
	let master = enemy.master || enemy.Enemy.master;
	let xx = enemy.x + dir.x;
	let yy = enemy.y + dir.y;
	if (master && (!master.aggressive || !enemy.aware)) {
		let fm = KinkyDungeonFindMaster(enemy);
		let findMaster = fm.master;
		let masterDist = fm.dist;
		if (findMaster) {
			if (Math.sqrt((xx - findMaster.x) * (xx - findMaster.x) + (yy - findMaster.y) * (yy - findMaster.y)) > master.range
				&& Math.sqrt((xx - findMaster.x) * (xx - findMaster.x) + (yy - findMaster.y) * (yy - findMaster.y)) > masterDist) return false;
		}
	}
	return MovableTiles.includes(KinkyDungeonMapGet(xx, yy)) && ((Tries && Tries > 5) || !AvoidTiles.includes(KinkyDungeonMapGet(enemy.x + dir.x, enemy.y + dir.y)))
		&& (ignoreLocks || !KinkyDungeonTilesGet((xx) + "," + (yy)) || !(KinkyDungeonTilesGet((xx) + "," + (yy)).Lock))
		&& KinkyDungeonNoEnemyExceptSub(xx, yy, true, enemy);
}

function KinkyDungeonFindID(id) {
	for (let e of KDMapData.Entities) {
		if (e.id == id) return e;
	}
	return null;
}

function KDDash(enemy, player, MovableTiles) {
	let happened = 0;
	let Dash = false;
	// Check player neighbor tiles
	let tiles = [];
	for (let X = player.x-1; X <= player.x+1; X++)
		for (let Y = player.y-1; Y <= player.y+1; Y++) {
			let tile = KinkyDungeonMapGet(X, Y);
			if ((X != 0 || Y != 0) && !(!KinkyDungeonNoEnemy(X, Y, true) || !MovableTiles.includes(tile) || (tile == 'D' && !enemy.Enemy.ethereal))) {
				tiles.push({x:X, y:Y});
			}
		}
	if (tiles.length > 0) {
		let tile = tiles[Math.floor(KDRandom()*tiles.length)];
		if (enemy.Enemy.dashThrough) {
			let tiled = 0;
			for (let t of tiles) {
				let dist = Math.sqrt((enemy.x - t.x)*(enemy.x - t.x) + (enemy.y - t.y)*(enemy.y - t.y));
				if (dist > tiled) {
					tile = t;
					tiled = dist;
				}
			}
		} else {
			let tiled = Math.sqrt((enemy.x - tile.x)*(enemy.x - tile.x) + (enemy.y - tile.y)*(enemy.y - tile.y));
			for (let t of tiles) {
				let dist = Math.sqrt((enemy.x - t.x)*(enemy.x - t.x) + (enemy.y - t.y)*(enemy.y - t.y));
				if (dist < tiled) {
					tile = t;
					tiled = dist;
				}
			}
		}
		if (tile && (tile.x != player.x || tile.y != player.y) && (tile.x != KinkyDungeonPlayerEntity.x || tile.y != KinkyDungeonPlayerEntity.y) && MovableTiles.includes(KinkyDungeonMapGet(tile.x, tile.y))) {
			Dash = true;
			KDMoveEntity(enemy, tile.x, tile.y, true);
			enemy.path = undefined;
			happened += 1;
			if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Dash")) {
				enemy.specialCD = enemy.Enemy.specialCD;
			}
		}
	}
	return {happened: happened, Dash: Dash};
}

function KinkyDungeonSendEnemyEvent(Event, data) {
	if (!KDMapHasEvent(KDEventMapEnemy, Event)) return;
	for (let enemy of KDMapData.Entities) {
		if (enemy.Enemy.events) {
			for (let e of enemy.Enemy.events) {
				if (e.trigger === Event) {
					KinkyDungeonHandleEnemyEvent(Event, e, enemy, data);
				}
			}
		}
	}
}

/**
 *
 * @param {entity} enemy
 * @param {any} data
 * @param {boolean} aggressive
 * @returns {(enemy, AIData) => void}
 */
function KDGetIntentEvent(enemy, data, play, allied, hostile, aggressive) {
	let eventWeightTotal = 0;
	let eventWeights = [];

	for (let event of Object.values(KDIntentEvents)) {
		if (((event.aggressive && aggressive) || (event.nonaggressive && !aggressive))
			&& (!event.play || play)
			&& (!event.noplay || !play)) {
			eventWeights.push({event: event, weight: eventWeightTotal});
			eventWeightTotal += event.weight(enemy, data, allied, hostile, aggressive);
		}
	}

	let selection = KDRandom() * eventWeightTotal;

	for (let L = eventWeights.length - 1; L >= 0; L--) {
		if (selection > eventWeights[L].weight) {
			return eventWeights[L].event.trigger;
		}
	}
	return (e, a) => {};
}

function KDAddEntity(entity) {
	let data = {
		enemy: entity,
		x: entity.x,
		y: entity.y,
		type: entity.Enemy,
		typeOverride: false,
		data: undefined,
		loadout: undefined,
	};
	KinkyDungeonSendEvent("addEntity", data);
	KDMapData.Entities.push(entity);
	KDSetLoadout(entity, data.loadout);
	if (!entity.data && entity.Enemy.data) entity.data = entity.Enemy.data;
	if (data.data) {
		if (!entity.data) entity.data = {};
		Object.assign(entity.data, data.data);
	}
	KDUpdateEnemyCache = true;
}
function KDSpliceIndex(index, num = 1) {
	KDMapData.Entities.splice(index, num);
	KDUpdateEnemyCache = true;
}

/**
 *
 * @param {entity} enemy
 * @param {any} target
 * @returns {{x: number, y: number, delta: number}}
 */
function KDGetDir(enemy, target) {
	return (enemy.fx && enemy.fy) ?
		AIData.kite ? KinkyDungeonGetDirectionRandom(enemy.x - target.x, enemy.y - target.y) : {x: Math.max(-1, Math.min(1, enemy.fx - enemy.x)), y: Math.max(-1, Math.min(1, enemy.fy - enemy.y)), delta: 1} :
		(AIData.kite ? KinkyDungeonGetDirectionRandom(enemy.x - target.x, enemy.y - target.y) : KinkyDungeonGetDirectionRandom(target.x - enemy.x, target.y - enemy.y));
}


/**
 *
 * @param {entity} enemy
 * @returns {number}
 */
function KDPullResistance(enemy) {
	let tags = enemy?.Enemy?.tags;
	if (!tags) return;
	return tags.unstoppable ? 0.25 : (tags.unflinching ? 0.5 : 1.0);
}

/**
 *
 * @param {number} power
 * @param {entity} enemy
 * @param {boolean} allowNeg
 * @returns {number}
 */
function KDPushModifier(power, enemy, allowNeg = false) {
	let pushPower = power;
	if (KinkyDungeonIsSlowed(enemy) || enemy.bind > 0) pushPower += 1;
	if (KDEntityHasBuff(enemy, "Chilled")) pushPower += 1;
	if (enemy.Enemy.tags.stunimmune) pushPower -= 2;
	else if (enemy.Enemy.tags.stunresist) pushPower -= 1;
	if (enemy.Enemy.tags.unstoppable) pushPower -= 3;
	else if (enemy.Enemy.tags.unflinching || enemy.Enemy.tags.slowresist || enemy.Enemy.tags.slowimmune) pushPower -= 1;
	if (allowNeg) return pushPower;
	return Math.max(0, pushPower);
}

/**
 *
 * @param {entity} enemy
 * @param {number} amount
 * @param {string} type
 * @param {any} Damage
 * @returns {*}
 */
function KDTieUpEnemy(enemy, amount, type = "Leather", Damage, Msg, Delay) {
	if (!enemy) return 0;
	let data = {
		amount: amount,
		specialAmount: amount,
		type: type, // Type of BONDAGE, e.g. leather, rope, etc
		Damage: Damage,
		Msg: Msg,
	};

	KinkyDungeonSendEvent("bindEnemy", data);

	if (data.amount) {
		enemy.boundLevel = (enemy.boundLevel || 0) + data.amount;
	}
	if (data.type) {
		if (!enemy.specialBoundLevel)
			enemy.specialBoundLevel = {};
		enemy.specialBoundLevel[type] = (enemy.specialBoundLevel[type] || 0) + data.specialAmount;
	}

	if (data.Msg) {
		KDDamageQueue.push({floater: TextGet("KDTieUp").replace("AMNT", Math.round(data.amount*10) + ""), Entity: enemy, Color: "#ff8800", Delay: Delay});
	}

	return data;
}

/**
 *
 * @param {entity} enemy
 * @param {number} struggleMod
 * @param {number} delta
 * @returns {any}
 */
function KDPredictStruggle(enemy, struggleMod, delta) {
	let data = {
		enemy: enemy,
		struggleMod: struggleMod,
		delta: delta,
		boundLevel: enemy.boundLevel || 0,
		specialBoundLevel: enemy.specialBoundLevel ? Object.assign({}, enemy.specialBoundLevel): {},
	};

	let minLevel = (enemy.buffs && KinkyDungeonGetBuffedStat(enemy.buffs, "MinBoundLevel")) ? KinkyDungeonGetBuffedStat(enemy.buffs, "MinBoundLevel") : 0;

	if (Object.keys(data.specialBoundLevel).length < 1) {
		// Simple math, reduce bound level, dont have to worry.
		data.struggleMod *= (10 + Math.pow(Math.max(0.01, enemy.hp), 0.75));
		data.boundLevel = Math.max(Math.min(Math.max(0, data.boundLevel), minLevel), data.boundLevel - data.delta * data.struggleMod);
	} else {
		// We go layer by layer
		let bondage = Object.entries(data.specialBoundLevel);
		bondage = bondage.sort((a, b) => {
			return KDSpecialBondage[a[0]].priority - KDSpecialBondage[b[0]].priority;
		});
		// These are the base resources, we exhaust till they are out
		data.struggleMod *= 2;

		let i = 0;
		while (i < bondage.length
			&& data.struggleMod > 0
			&& data.boundLevel > 0) {
			let layer = bondage[i];
			let type = KDSpecialBondage[layer[0]];
			let hBoost = type.healthStruggleBoost;
			let pBoost = type.powerStruggleBoost;
			let mBoost = type.mageStruggleBoost;
			let sr = type.struggleRate;

			if (sr <= 0) {
				i = bondage.length;
				// We are done, cant struggle past here
			}
			// Otherwise
			let totalCost = layer[1] / sr;
			if (enemy.hp > 1)
				totalCost *= 10/(10 + hBoost * Math.pow(enemy.hp, 0.75));
			totalCost *= 3/(3 + (pBoost * enemy.Enemy.power || 0));
			totalCost *= 2/(2 + (mBoost * enemy.Enemy.unlockCommandLevel || 0));

			let effect = Math.min(data.struggleMod, totalCost);
			let difference = layer[1] * (effect / totalCost);
			let origBL = data.boundLevel;
			data.boundLevel = Math.max(minLevel, data.boundLevel - difference);
			data.specialBoundLevel[layer[0]] -= Math.max(0, origBL - data.boundLevel);
			if (data.specialBoundLevel[layer[0]] <= 0) delete data.specialBoundLevel[layer[0]];
			data.struggleMod -= effect;
			if (data.struggleMod <= 0) data.struggleMod = 0;
			i++;
		}
		// We can only struggle as much as the current struggle layer
		// If we have complicated types we have to do advanced differential calculus
	}

	return data;
}

let KDDomThresh_Loose = 0.5;
let KDDomThresh_Normal = 0.0;
let KDDomThresh_Strict = -0.4;

let KDDomThresh_Variance = 0.15; // random variance
let KDDomThresh_PerkMod = -0.5;

/**
 * @param {entity} enemy - the enemy to check if the player can domme
 * @param {boolean} ignoreRelative - ignore the relative determinants
 * @returns {boolean}
 */
function KDCanDom(enemy, ignoreRelative = false) {
	if (!ignoreRelative) {
		if (enemy == KinkyDungeonJailGuard()) return false;
		if (KDGameData.KinkyDungeonLeashedPlayer > 0) return false;
	}
	if (!enemy.Enemy.bound) return false;
	if (KDEnemyHasFlag(enemy, "isSubbing")) return true;
	if (KDEnemyHasFlag(enemy, "isDomming")) return false;
	if (enemy.Enemy.tags.nosub) return false;
	if (!ignoreRelative) {
		if (KinkyDungeonIsArmsBound(false, true) || KinkyDungeonIsHandsBound(false, true, 0.1) || KinkyDungeonGagTotal() > 0.1) return false;
	}
	// Very bad pseudo RNG based on enemy.id as seed
	// TODO replace with better prng with variable seed
	if (enemy.domVariance == undefined) enemy.domVariance = (KDEnemyPersonalities[enemy.personality]?.domVariance || KDDomThresh_Variance) * (2 * KDRandom() - 1);
	let modifier = (KinkyDungeonGoddessRep.Ghost + 50)/100 + enemy.domVariance;
	if (!ignoreRelative) {
		if (KinkyDungeonStatsChoice.get("Dominant")) modifier += KDDomThresh_PerkMod;
	}
	if (KDEnemyPersonalities[enemy.personality] && KDEnemyPersonalities[enemy.personality].domThresh) return modifier <= KDEnemyPersonalities[enemy.personality].domThresh;
	if (KDLoosePersonalities.includes(enemy.personality)) return modifier <= KDDomThresh_Loose;
	if (KDStrictPersonalities.includes(enemy.personality)) return modifier <= KDDomThresh_Strict;

	if (!ignoreRelative) {
		if (KDPlayerIsNotDom()) return false;
	}
	return modifier <= KDDomThresh_Normal;
}

/**
 * Returns true if any non-dominant activities are currently being performed on the player which compromises their ability to dominate
 * @returns {boolean}
 */
function KDPlayerIsNotDom() {
	return KDGameData.KinkyDungeonLeashedPlayer > 1 || KinkyDungeonStatsChoice.get("Submissive") || KDPlayerIsTied();
}
/**
 * Returns true if player has any level of bondage
 * @returns {boolean}
 */
function KDPlayerIsTied() {
	return KinkyDungeonSlowLevel > 1 || KinkyDungeonGagTotal() > 0.25 || KinkyDungeonIsArmsBound() || KinkyDungeonIsHandsBound() ;
}


/**
 * is this entity objectively subby
 * @param {entity} entity
 * @returns {boolean}
 */
function KDIsSubbyPersonality(entity) {
	if (entity && !entity.player) {
		if (KDCanDom(entity, true)) return true;
	}
	return false;
}

/**
 * is this entity objectively bratty
 * @param {entity} entity
 * @returns {boolean}
 */
function KDIsBrattyPersonality(entity) {
	if (entity && !entity.player) {
		if (KDIsSubbyPersonality(entity) && KinkyDungeonStatsChoice.get("OnlyBrats")) return true;
		if (KDEnemyPersonalities[entity.personality]?.brat || KDEnemyHasFlag(entity, "forcebrat")) return true;
	}
	return false;
}

/**
 * Is this entity bratty to the player
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDIsBrat(enemy) {
	if (KinkyDungeonStatsChoice.get("OnlyBrats")) return true;
	if (KinkyDungeonStatsChoice.get("NoBrats")) return false;
	if (!KDEnemyPersonalities[enemy.personality]?.brat && !KDEnemyHasFlag(enemy, "forcebrat")) return false;
	if (KDPlayerIsNotDom()) return false;
	return true;
}

/**
 * Captures helpless enemies near the enemy
 * @param {entity} enemy
 */
function KDCaptureNearby(enemy) {
	let enemies = KDNearbyEnemies(enemy.x, enemy.y, 1.5, enemy);
	for (let en of enemies) {
		if (KDHelpless(en) && en.hp < 0.52) {
			en.hp = 0;
		}
	}
}

/**
 *
 * @param {entity} enemy
 * @param {boolean} guaranteed
 * @returns {string}
 */
function KinkyDungeonGetLoadoutForEnemy(enemy, guaranteed) {
	if (enemy.Enemy.tags.noshop) return "";
	/** @type {Record<string, number>} */
	let loadout_list = {};
	for (let s of Object.values(KDLoadouts)) {
		let end = false;
		if (s.tags) {
			for (let t of s.tags) {
				if (!enemy.Enemy.tags[t]) {
					end = true;
					break;
				}
			}
		}
		if (s.forbidtags) {
			for (let t of s.forbidtags) {
				if (enemy.Enemy.tags[t]) {
					end = true;
					break;
				}
			}
		}
		let hasTag = !s.singletag;
		if (!end && s.singletag) {
			for (let t of s.singletag) {
				if (enemy.Enemy.tags[t]) {
					hasTag = true;
					break;
				}
			}
		}
		let hasTag2 = !s.singletag2;
		if (!end && s.singletag2) {
			for (let t of s.singletag2) {
				if (enemy.Enemy.tags[t]) {
					hasTag = true;
					break;
				}
			}
		}
		if (!hasTag) end = true;
		if (!hasTag2) end = true;
		if (!end) { // (guaranteed || !s.chance || KDRandom() < s.chance)
			/*for (let i = 0; i < (s.multiplier || 1); i++)
				loadout_list.push(s.name);*/
			loadout_list[s.name] = (s. chance || 1) * (s.multiplier || 1);
		}
	}
	if (!guaranteed) {
		loadout_list.Null = 1;
	}
	//if (Object.entries() > 0) {
	let ret = KDGetByWeight(loadout_list);
	if (ret != "Null") return ret;
	//}
	//return loadout_list[Math.floor(KDRandom() * loadout_list.length)];
	return "";
}

/**
 * Gets the text for a key, suffixed with the enemy faction or name if available. Otherwise falls back to just the key
 * @param {string} key - The base text key
 * @param {entity} enemy - The enemy
 * @param {boolean} useName - Whether to use the enemy name or faction
 * @returns {string}
 */
function KinkyDungeonGetTextForEnemy(key, enemy, useName = false) {
	const enemyKey = `${key}${useName ? enemy.Enemy.name : enemy.Enemy.faction}`;
	let text = TextGet(enemyKey);
	if (!text || text.endsWith(enemyKey)) {
		// Couldn't find enemy-specific text - fall back to just the key
		text = TextGet(key);
	}
	return text;
}


function KDPlayerIsDefeated() {
	return KinkyDungeonFlags.get("playerDefeated");
}

function KDPlayerIsDisabled() {
	return KinkyDungeonFlags.get("playerDisabled")
		|| (KinkyDungeonStatBlind > 0 || KinkyDungeonStatBind > 0 || KinkyDungeonStatFreeze > 0 || (KinkyDungeonSlowMoveTurns > 0 && !KinkyDungeonFlags.get("channeling")) || KDGameData.SleepTurns > 0);
}
function KDPlayerIsStunned() {
	return KDPlayerIsDisabled() || KinkyDungeonFlags.get("playerStun")
		|| (KDGameData.MovePoints < 0 || KDGameData.KneelTurns > 0 || KinkyDungeonSleepiness > 0);
}
function KDPlayerIsImmobilized() {
	return KinkyDungeonSlowLevel > 9 || KinkyDungeonGetRestraintItem("ItemDevices");
}

/**
 *
 * @param {entity} enemy
 * @returns {{suff: string, color: string}}
 */
function KDGetAwareTooltip(enemy) {
	if (KDGameData.CurrentDialog && KDGetSpeaker() == enemy && (enemy.aware || enemy.vp > 2)) return {
		suff: "Talking",
		color: "#ffffff",
	};
	if (enemy.aware) {
		if (KDHostile(enemy)) {
			return {
				suff: "Aware",
				color: "#ff5555",
			};
		} else return {
			suff:  "AwareFriendly",
			color: "#ffffff",
		};
	}
	if (enemy.vp > 2) return {
		suff: "DangerHigh",
		color: "#ff5555",
	};
	if (enemy.vp > 0.5) return {
		suff: "Danger",
		color: "#ffaa55",
	};
	if (enemy.vp > 0) return {
		suff: "Suspicious",
		color: "#ffff00",
	};
	return {
		suff: "Unnoticed",
		color: "#88ff88",
	};
}

/**
 *
 * @param {string} lock
 * @returns {string}
 */
function KDProcessLock(lock) {
	if (lock == "Red") return KDRandomizeRedLock();
	else return lock;
}


let KDDefaultRestraintThresh = 3;

/**
 *
 * @param {entity} enemy
 * @param {number} restMult
 */
function KDRestockRestraints(enemy, restMult) {
	if ((enemy.Enemy.attack?.includes("Bind") || enemy.Enemy.specialAttack?.includes("Bind")) && !enemy.Enemy.RestraintFilter?.noRestock && !KDEnemyHasFlag(enemy, "restocked")) {
		let rCount = KDDetermineBaseRestCount(enemy, restMult);
		if ((enemy.items?.length || 0) < rCount) {
			KDStockRestraints(enemy, restMult, rCount - (enemy.items?.length || 0));
			KinkyDungeonSetEnemyFlag(enemy, "restocked", 200);
		}
		if (enemy.Enemy.RestraintFilter?.requiredItems) {
			if (!enemy.items) enemy.items = [];
			for (let item of enemy.Enemy.RestraintFilter?.requiredItems) {
				if (!enemy.items.includes(item)) enemy.items.unshift(item);
			}
		}
	}
}

/**
 *
 * @param {entity} enemy
 * @param {number} restMult
 * @returns {number}
 */
function KDDetermineBaseRestCount(enemy, restMult) {
	let rCount = 1;
	if (enemy.Enemy.tags.boss) rCount += 6;
	else if (enemy.Enemy.tags.miniboss) rCount += 3;
	else if (enemy.Enemy.tags.elite) rCount += 2;
	else if (!enemy.Enemy.tags.minor) rCount += 1;
	if (enemy.Enemy.RestraintFilter?.bonusRestraints) rCount += enemy.Enemy.RestraintFilter?.bonusRestraints;
	if (KinkyDungeonStatsChoice.has("TightRestraints")) {
		rCount *= 2;
		rCount += 1;
	}
	return Math.ceil(rCount * restMult);
}

/**
 *
 * @param {entity} enemy
 * @param {number} restMult
 * @param {number} [count]
 */
function KDStockRestraints(enemy, restMult, count) {
	if (!enemy.items) enemy.items = [];
	let rCount = count || KDDetermineBaseRestCount(enemy, restMult);
	let rThresh = enemy.Enemy.RestraintFilter?.powerThresh || (KDDefaultRestraintThresh + (Math.max(0, enemy.Enemy.power - 1) || 0));
	if (rCount > 0) enemy.items = enemy.items || [];
	for (let i = 0; i < rCount; i++) {
		let rest = KinkyDungeonGetRestraint(
			{tags: KDGetTags(enemy, false)}, KDGetEffLevel() + (enemy.Enemy.power || 0),
			KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
			enemy.Enemy.bypass,
			enemy.Enemy.useLock ? enemy.Enemy.useLock : "",
			false,
			false,
			false,
			KDGetExtraTags(enemy, true),
			true,
			{
				minPower: rThresh,
				noUnlimited: !enemy.Enemy.RestraintFilter?.limitedRestraintsOnly,
				onlyLimited: enemy.Enemy.RestraintFilter?.limitedRestraintsOnly,//!enemy.Enemy.RestraintFilter?.invRestraintsOnly,
				looseLimit: !enemy.Enemy.RestraintFilter?.limitedRestraintsOnly,
				ignore: enemy.items.concat(enemy.Enemy.RestraintFilter?.ignoreInitial || []),
				ignoreTags: enemy.Enemy.RestraintFilter?.ignoreInitialTag,
			}, undefined, undefined, true, enemy.items);
		if (rest) {
			enemy.items.push(rest.name);
			if (KDEnemyIsTemporary(enemy)) {
				if (!enemy.tempitems) enemy.tempitems = [];
				enemy.tempitems.push(rest.name);
			}
		}
	}

	if (enemy.Enemy.RestraintFilter?.requiredItems) {
		if (!enemy.items) enemy.items = [];
		for (let item of enemy.Enemy.RestraintFilter?.requiredItems) {
			if (!enemy.items.includes(item)) enemy.items.unshift(item);
		}
	}
}

/**
 *
 * @param {entity} enemy
 * @param {string} loadout
 */
function KDSetLoadout(enemy, loadout) {
	if (loadout) {
		let temp = enemy.Enemy.startingItems ? Object.assign([], enemy.Enemy.startingItems) : [];
		enemy.items = Object.assign(temp, KDLoadouts[loadout].items);
	}
	if (!enemy.Enemy.RestraintFilter?.unlimitedRestraints && (enemy.Enemy.attack?.includes("Bind") || enemy.Enemy.specialAttack?.includes("Bind"))) {
		let restMult = KDLoadouts[loadout]?.restraintMult || 1;
		KDStockRestraints(enemy, restMult);
	}
}

function KDClearItems(enemy) {
	if (enemy.items) {
		for (let item of enemy.items) {
			KDAddLostItemSingle(item);
		}
		enemy.items = undefined;
	}
}

/**
 *
 * @param {string} item
 * @param {number} quantity
 * @returns {boolean}
 */
function KDAddLostItemSingle(item, quantity = 1) {
	if (KinkyDungeonFindWeapon(item)) {
		KinkyDungeonAddLostItems([{name: item, type: Weapon, id: KinkyDungeonGetItemID()}], false);
		return true;
	} else if (KinkyDungeonGetRestraintByName(item) && (KinkyDungeonGetRestraintByName(item).armor || KDRestraintSpecial(item))) {
		KinkyDungeonAddLostItems([{name: item, type: LooseRestraint, quantity: 1, id: KinkyDungeonGetItemID()}], false);
		return true;
	} else if (KinkyDungeonFindConsumable(item)) {
		KinkyDungeonAddLostItems([{name: item, type: Consumable, quantity: 1, id: KinkyDungeonGetItemID()}], false);
		return true;
	}
	return false;
}

/**
 *
 * @param {entity} enemy
 * @param {entity} player
 * @returns {boolean}
 */
function KDCanDetect(enemy, player, allowBlind = false) {
	let invisibility = KDEntityBuffedStat(player, "Invisible");
	return (KinkyDungeonTrackSneak(enemy, 0, player) || (AIData.playerDist < Math.max(1.5 - invisibility, allowBlind ? AIData.blindSight : 0) && enemy.aware));
}

/**
 *
 * @param {entity} enemy
 * @param {string} type
 * @returns {number}
 */
function KDGetSecurity(enemy, type) {
	// Base securities; inherited from BaseSecurity but otherwise populated by the Security matrix of the enemy
	let security = KDBaseSecurity[type] != undefined ? KDBaseSecurity[type] : -100;
	if (enemy?.Enemy?.Security && enemy.Enemy.Security[type])
		security = enemy.Enemy.Security[type];

	// Add factional securities
	let faction = KDGetFactionOriginal(enemy);
	if (KDFactionSecurityMod[faction] && KDFactionSecurityMod[faction][type] != undefined) security = Math.max(security + KDFactionSecurityMod[faction][type], KDFactionSecurityMod[faction][type]);

	// If the enemy is cleared to have security, increase it based on rank
	if (security >= -10) {
		if (enemy.Enemy.tags.boss) security += 4;
		else if (enemy.Enemy.tags.miniboss) security += 3;
		else if (enemy.Enemy.tags.elite) security += 2;
		else if (!enemy.Enemy.tags.minor) security += 1;
	}
	return security;
}

/**
 * Reduces the enemy's binding by a certain amount
 * @param {entity} enemy
 * @param {number} bonus
 */
function KDReduceBinding(enemy, bonus) {
	let bindingPercent = enemy.boundLevel > 0 ? (((Math.max(0, enemy.boundLevel - bonus)) / enemy.boundLevel) || 0) : 0;
	enemy.boundLevel = Math.max(0, enemy.boundLevel - bonus);
	if (enemy.specialBoundLevel)
		for (let key of Object.keys(enemy.specialBoundLevel)) {
			enemy.specialBoundLevel[key] *= bindingPercent;
		}
}

/**
 * Helper function to determine if a character needs punishing
 * @param {entity} enemy
 * @param {entity} player
 */
function KDPlayerDeservesPunishment(enemy, player) {
	if (player.player) {
		if (KinkyDungeonFlags.get("PlayerCombat")) return true;
	} else {
		return true;
	}
}

/**
 *
 * @param {entity} enemy
 */
function KDPlugEnemy(enemy) {
	let plugAmount = KDEntityBuffedStat(enemy, "Plug");
	if (!plugAmount)
		KDApplyGenBuffs(enemy, "Plugged", 9999);
	else if (plugAmount == 1) {
		KinkyDungeonExpireBuff(enemy, "Plugged");
		KDApplyGenBuffs(enemy, "DoublePlugged", 9998);
	}
}

/**
 *
 * @param {entity} enemy
 * @param {boolean} removeSpecial
 * @returns {Record<string, boolean>}
 */
function KDGetTags(enemy, removeSpecial) {
	let addOn = enemy.Enemy.bound ? KDExtraEnemyTags : undefined;

	let tags = Object.assign({}, enemy.Enemy.tags);
	if (addOn) Object.assign(tags, addOn);
	if (removeSpecial && enemy.Enemy.specialRemoveTags) {
		for (let t of enemy.Enemy.specialRemoveTags) {
			delete tags[t];
		}
	}

	return tags;
}

/**
 *
 * @param {entity} enemy
 * @param {boolean} useSpecial
 * @returns {Record<string, boolean>}
 */
function KDGetExtraTags(enemy, useSpecial) {
	let addOn = enemy.Enemy.bound ? KDExtraEnemyTags : undefined;

	let tags = addOn ? Object.assign({}, addOn) : {};
	if (useSpecial && enemy.Enemy.specialExtraTags) {
		for (let t of enemy.Enemy.specialExtraTags) {
			tags[t] = 0;
		}
	}

	return tags;
}

/**
 *
 * @param {entity} enemy
 * @param {string} faction
 * @param {restraint[]} restraintsToAdd
 * @param {(item) => void} blockFunction
 * @param {string[]} [restraintFromInventory]
 * @param {spell} [spell]
 * @returns {restraint[]}
 */
function KDRunBondageResist(enemy, faction, restraintsToAdd, blockFunction, restraintFromInventory, spell) {
	let restraintblock = KinkyDungeonGetPlayerStat("RestraintBlock");
	let restraintpower = 0;
	for (let r of restraintsToAdd) {
		if (r)
			restraintpower += Math.max(1, r.power);
	}
	let added = [];
	let name = enemy ? TextGet("Name" + enemy.Enemy.name) : (spell ? TextGet("KinkyDungeonSpell" + spell.name) : "");

	restraintblock = KDRestraintBlockPower(restraintblock, restraintpower + (enemy?.Enemy.power || spell?.power || 0));
	if (!restraintblock || KDRandom() < restraintblock) {
		let protection = 0;
		let multiPower = restraintsToAdd.length;
		let targetGroups = {};
		for (let r of restraintsToAdd) {
			targetGroups[r.Group] = true;
		}
		// Calculate power of an attack vs protection
		let protectRestraints = KinkyDungeonAllRestraint().filter((r) => {return KDRestraint(r).protection > 0;});
		for (let r of protectRestraints) {
			if (r && KDRestraint(r).protection && (!KDRestraint(r).protectionCursed || !KDGetCurse(r) || !KDCurses[KDGetCurse(r)].activatecurse)) {
				protection += KDRestraint(r).protection;
			}
		}

		let count = 0;
		if (protection >= multiPower) {
			for (let r of protectRestraints) {
				if (count < multiPower) {
					KinkyDungeonRemoveRestraint(KDRestraint(r).Group, true);
					KinkyDungeonSendTextMessage(
						5, TextGet("KDArmorBlock")
							.replace("ArmorName", TextGet("Restraint" + r.name))
							.replace("EnemyName", name),
						"#ffff00", 1);
				}
				count += KDRestraint(r).protection;
			}
			blockFunction();
		} else {
			for (let r of restraintsToAdd) {
				let bb = 0;
				if (count >= protection) {
					bb = KinkyDungeonAddRestraintIfWeaker(r, (enemy?.Enemy.power || spell?.power || 0), KinkyDungeonStatsChoice.has("MagicHands") ? true : enemy?.Enemy.bypass, enemy?.Enemy.useLock ? enemy.Enemy.useLock : undefined, undefined, undefined, undefined, faction, KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined, enemy, true) * 2;
					if (bb) {
						if (KDGroupBlocked(r.Group) && !enemy?.Enemy.bypass) {
							KinkyDungeonSendTextMessage(
								5, TextGet("KDBypasses")
									.replace("RestraintName", TextGet("Restraint" + r.name))
									.replace("EnemyName", name),
								"#ffff00", 1);
						}
						if (restraintFromInventory && enemy && restraintFromInventory.includes(r.name)) {
							restraintFromInventory.splice(restraintFromInventory.indexOf(r.name), 1);
							if (enemy.items?.includes(r.name)) {
								enemy.items.splice(enemy.items.indexOf(r.name), 1);
							}
						}
						added.push(r);
						KDSendStatus('bound', r.name, "enemy_" + name);
						count += 1;
					}
					count += 0;
				} else {
					count += 1;
				}
			}
		}
	} else {
		blockFunction();
	}

	return added;
}

/**
 * Assigns the point an enemy leashes the player to
 * @param {entity} enemy
 */
function KDAssignLeashPoint(enemy) {
	AIData.nearestJail = KinkyDungeonNearestJailPoint(enemy.x, enemy.y);

	if (!AIData.nearestJail
		|| KinkyDungeonFlags.has("LeashToPrison")
		|| (
			KDSelfishLeash(enemy)
		)) AIData.nearestJail = Object.assign({type: "jail", radius: 1}, KDMapData.StartPosition);
}

/**
 * Assigns the point an enemy leashes the player to indirectly
 * @param {entity} enemy
 */
function KDSelfishLeash(enemy) {
	return KDEnemyUnfriendlyToMainFaction(enemy) || KDFactionRelation(KDGetFaction(enemy), "Jail") < -0.2;
}

/**
 * Enemy is not friendly to the jail faction
 * @param {entity} enemy
 */
function KDEnemyUnfriendlyToMainFaction(enemy) {
	if (!enemy) return false;
	let mainFaction = KDGetMainFaction();
	return KDGetFaction(enemy) != mainFaction
		&& KDFactionRelation(KDGetFaction(enemy), mainFaction) < -0.05;
}

/**
 *
 * @returns {string}
 */
function KDGetMainFaction() {
	let mainFaction = KDMapData.MapFaction;
	if (!mainFaction && KDMapData.JailFaction && KDMapData.JailFaction.length > 0) mainFaction = KDMapData.JailFaction[0];
	if (!mainFaction && KDMapData.GuardFaction && KDMapData.GuardFaction.length > 0) mainFaction = KDMapData.GuardFaction[0];
	return mainFaction;
}

/**
 *
 * @param {entity} player
 * @returns {boolean}
 */
function KDPlayerLeashed(player) {
	if (player?.player) {
		let r = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
		if (r && KDRestraint(r)?.leash) {
			return true;
		}
	}
	return false;
}


/**
 * @param {entity} en
 * @returns {boolean}
 */
function KDEnemyCanBeVibed(en) {
	return KDEntityBuffedStat(en, "Plug") > 0 || KDEntityBuffedStat(en, "Toy") > 0;
}

/**
 *
 * @param {entity} enemy
 * @param {number} delta
 */
function KDEnemySoundDecay(enemy, delta) {
	let data = {
		enemy: enemy,
		decay: enemy.Enemy.Sound?.decay != undefined ? enemy.Enemy.Sound?.decay : 1,
		base: enemy.Enemy.Sound?.baseAmount != undefined ? enemy.Enemy.Sound?.baseAmount : KDDefaultEnemyIdleSound,
	};
	KinkyDungeonSendEvent("enemySoundDecay", data);
	if (enemy.sound == undefined) enemy.sound = 0;

	enemy.sound = Math.max(data.base, enemy.sound - delta * data.decay);
}

/**
 * Only the noisiest thing counts
 * @param {entity} enemy
 * @param {number} amount
 */
function KDEnemyAddSound(enemy, amount, novisual = false) {
	if (enemy.sound == undefined) enemy.sound = 0;
	let prevSound = enemy.sound || 0;

	let data = {
		enemy: enemy,
		amount: amount,
		base: enemy.Enemy.Sound?.baseAmount != undefined ? enemy.Enemy.Sound?.baseAmount : KDDefaultEnemyIdleSound
	};
	KinkyDungeonSendEvent("enemySoundAdd", data);

	enemy.sound = Math.max(data.base, data.amount);

	if (!novisual) {
		let mult = 0.25;
		// Draw a visual shockwave to help the player realize
		if (enemy.sound == prevSound) {
			let ret = KinkyDungeonGetHearingRadius();
			mult = 0.4 * ret.mult;
		}
		if ((enemy.sound > prevSound || (enemy.sound == prevSound && KDRandom() < mult))
			&& KDCanHearEnemy(KinkyDungeonPlayerEntity, enemy, 1.5)
			&& (!KDCanSeeEnemy(enemy) && !(KinkyDungeonVisionGet(enemy.x, enemy.y) > 0))) {
			if (!KDEventData.shockwaves) KDEventData.shockwaves = [];
			KDEventData.shockwaves.push({
				x: enemy.x,
				y: enemy.y,
				radius: enemy.sound * 0.15 + 0.5,
				sprite: "Particles/ShockwaveEnemy.png",
			});
		}
	}
}

/**
 *
 * @param {entity} entity
 * @param {entity} enemy
 * @param {number} mult
 * @returns {boolean}
 */
function KDCanHearEnemy(entity, enemy, mult = 1.0) {
	if (enemy) {
		if (entity?.player) {
			let ret = KinkyDungeonGetHearingRadius();
			let data = {
				player: entity,
				enemy: enemy,
				hearingRadius: ret.radius,
				hearingMult: ret.mult,
				sound: enemy.sound,
				dist: KDistChebyshev(entity.x - enemy.x, entity.y - enemy.y),
			};
			KinkyDungeonSendEvent("playerCanHear", data);
			if (data.dist < data.hearingRadius * mult && data.sound * data.hearingMult * mult >= data.dist - 0.5)
				return KinkyDungeonCheckPath(entity.x, entity.y, enemy.x, enemy.y, true, false, mult * (0.5 + data.hearingMult), true);
			return false;
		}
		return false;// TODO allow enemies to hear each other
	}
	return false;
}

/** */
function KDPointWanderable(x, y) {
	return KDMapData.RandomPathablePoints[x + ',' + y];
}

/**
 *
 * @param {entity} enemy
 * @param {entity} player
 * @returns {boolean}
 */
function KDOverrideIgnore(enemy, player) {
	if (player.player) {
		if (enemy.IntentAction && (
			KDIntentEvents[enemy.IntentAction]?.overrideIgnore
		))
			return true;
	}
	return false;
}

/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDIsFlying(enemy) {
	return enemy.Enemy.tags?.flying || KDEnemyHasFlag(enemy, "flying");
}
/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDEnemyCanSignal(enemy) {
	return !enemy.Enemy.tags?.nosignal && !(enemy.silence > 0);
}
/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDEnemyCanSignalOthers(enemy) {
	return KDEnemyCanSignal(enemy) && !KDEnemyHasFlag(enemy, "nosignalothers");
}



/**
 *
 * @param {entity} enemy
 * @param {KDAITriggerData} Data
 * @param {string[]} [requireTags]
 * @returns {string}
 */
function KDGetDialogueTrigger(enemy, Data, requireTags) {
	let WeightTotal = 0;
	let Weights = [];
	for (let e of Object.entries(KDDialogueTriggers)) {
		let trigger = e[1];
		let weight = 0;
		if ((!trigger.blockDuringPlaytime || enemy.playWithPlayer < 1 || !enemy.playWithPlayer)
			&& (!trigger.noAlly || !KDAllied(enemy) || Data.ignoreNoAlly)
			&& (!trigger.playRequired || Data.playAllowed)
			&& (!trigger.noCombat || !KinkyDungeonFlags.get("NPCCombat") || Data.ignoreCombat)
			&& (!trigger.nonHostile || !Data.aggressive)
			&& (!trigger.allowedPrisonStates || trigger.allowedPrisonStates.includes(KDGameData.PrisonerState))
			&& (!trigger.allowedPersonalities || trigger.allowedPersonalities.includes(enemy.personality))
			&& (!trigger.onlyDuringPlay || enemy.playWithPlayer > 0
				|| (trigger.allowPlayExceptionSub && KDIsSubmissiveEnough(enemy))
				|| Data.allowPlayExceptionSub)) {
			let end = false;
			if (requireTags) {
				let dialogue = KDDialogue[trigger.dialogue];
				if (dialogue && dialogue.tags) {
					if (dialogue.tags.some((t) => {return !requireTags.includes(t);})) {
						end = true;
						break;
					}
				}
			}
			if (trigger.excludeTags) {
				for (let tt of trigger.excludeTags) {
					if (enemy.Enemy.tags[tt]) {
						end = true;
						break;
					}
				}
			}
			if (!end && trigger.requireTags) {
				for (let tt of trigger.requireTags) {
					if (!enemy.Enemy.tags[tt]) {
						end = true;
						break;
					}
				}
			}
			let hastag = !trigger.requireTagsSingle;
			if (!end && trigger.requireTagsSingle) {
				for (let tt of trigger.requireTagsSingle) {
					if (enemy.Enemy.tags[tt]) {
						hastag = true;
						break;
					}
				}
			}
			if (!hastag) end = true;
			hastag = !trigger.requireTagsSingle2;
			if (!end && trigger.requireTagsSingle2) {
				for (let tt of trigger.requireTagsSingle2) {
					if (enemy.Enemy.tags[tt]) {
						hastag = true;
						break;
					}
				}
			}
			if (!end && (!trigger.prerequisite || trigger.prerequisite(enemy, Data.playerDist, Data))) {
				weight =  trigger.weight(enemy, Data.playerDist);
			}
		}
		if (weight > 0) {
			Weights.push({t: trigger, weight: WeightTotal});
			WeightTotal += weight;
		}
	}

	let selection = KDRandom() * WeightTotal;

	for (let L = Weights.length - 1; L >= 0; L--) {
		if (selection > Weights[L].weight) {
			return Weights[L].t.dialogue;

		}
	}
	return "";
}

/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDCanOverrideAI(enemy) {
	let AI = KDGetAI(enemy);
	if (KDAIType[AI] && KDAIType[AI].noOverride) return false;
	return true;
}

/**
 *
 * @param {entity} enemy
 * @param {string} index
 * @returns {string}
 */
function KDGetAIOverride(enemy, index) {
	let AI = KDGetAI(enemy);
	if (KDAIType[AI] && KDAIType[AI].override) return KDAIType[AI].override[index];
	return undefined;
}
/**
 *
 * @param {enemy} Enemy
 * @param {string} index
 * @returns {string}
 */
function KDGetAITypeOverride(Enemy, index) {
	let AI = Enemy.AI;
	if (KDAIType[AI] && KDAIType[AI].override) return KDAIType[AI].override[index];
	return undefined;
}

/**
 *
 * @param {entity} enemy
 */
function KDMakeHighValue(enemy) {
	KinkyDungeonApplyBuffToEntity(enemy, {
		id: "HighValue",
		type: "MoveSpeed",
		power: 0.1,
		duration: 9999,
	});

	// Hitpoint bonuses
	let hp = Math.round(KDRandom()*10) + enemy.Enemy.maxhp * (1.5 + Math.round(KDRandom()*10)/10);
	enemy.Enemy = JSON.parse(JSON.stringify(enemy.Enemy));
	enemy.Enemy.maxhp = hp;
	enemy.hp = hp;

	// MS bonus
	if (KDRandom() * 0.5) {
		KinkyDungeonApplyBuffToEntity(enemy, {
			id: "HighValue_MS",
			type: "MoveSpeed",
			power: 0.1 * Math.ceil(KDRandom()*10),
			duration: 9999,
		});
	}

	// AS bonus
	if (KDRandom() * 0.5) {
		KinkyDungeonApplyBuffToEntity(enemy, {
			id: "HighValue_AS",
			type: "AttackSpeed",
			power: 0.1 * Math.ceil(KDRandom()*10),
			duration: 9999,
		});
	}

	// Power bonus
	if (KDRandom() * 0.5) {
		let power = enemy.Enemy.power + Math.round(KDRandom() * 3);
		enemy.Enemy.power = power;
	}

	// Items
	if (!enemy.items) enemy.items = [];
	for (let i = Math.round(KDRandom()*2) ; i < 3; i++) {
		enemy.items.unshift("AncientPowerSource");
	}
	for (let i = Math.round(KDRandom()*2) ; i < 2; i++) {
		enemy.items.unshift("PotionMana");
	}
	for (let i = Math.round(KDRandom()*2) ; i < 2; i++) {
		enemy.items.unshift("PotionWill");
	}

	let buff = KDGetByWeight(KDGetSpecialBuffList(enemy, ["HighValue"]));
	if (buff) {
		KDSpecialBuffs[buff].apply(enemy, ["HighValue"]);
	}
}

/**
 * Gets a list of curses applied to the item
 * @param {entity} enemy
 * @param {string[]} types
 * @returns {Record<string, number>}
 */
function KDGetSpecialBuffList(enemy, types) {
	/** @type {Record<string, number>} */
	let ret = {};
	for (let obj of Object.keys(KDSpecialBuffs)) {
		if (KDSpecialBuffs[obj].filter(enemy, types))
			ret[obj] = KDSpecialBuffs[obj].weight(enemy, types);
	}
	return ret;
}
