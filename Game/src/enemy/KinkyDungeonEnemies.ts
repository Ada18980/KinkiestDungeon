"use strict";

let KDEnemyStruggleHPExp = 0.8;

let KDOpinionThreshold = 12;

let KDDebugOverlay2 = false;

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
	"Stamina",
	"Bind",
	"Effect",
	"Stun",
	"Blind",
	"Slow",
];

let KDPlayerNoiseSources = {
	// TODO add events
	Movement: {
		calc: (_player: entity) => {
			return KinkyDungeonFlags.get("moved") ? (
				4
			) : 0;
		}
	},
	Sprint: {
		calc: (_player: entity) => {
			return KinkyDungeonFlags.get("sprinted") ? (
				9
			) : 0;
		}
	},
};


let KDAnims: Record<string, (entity: entity) => boolean> = {
	breathing: (Entity) => {
		if (!Entity.animTime) Entity.animTime = CommonTime() + Math.floor(KDRandom() * 1000);
		Entity.scaleY *= (0.986 - 0.014*Math.sin(Math.PI/2 + 2 * Math.PI * KDAnimQuantize(KDBreathAnimTime/2, CommonTime() - Entity.animTime)/(KDBreathAnimTime)));
		Entity.scaleX *= (1.005 - 0.005*Math.sin(-Math.PI/2 + 2 * Math.PI * KDAnimQuantize(KDBreathAnimTime/2, CommonTime() - Entity.animTime)/(KDBreathAnimTime)));
		Entity.offY += -0.005*Math.sin(-Math.PI/2 + 2 * Math.PI * KDAnimQuantize(KDBreathAnimTime/2, CommonTime() - Entity.animTime)/(KDBreathAnimTime));
		return true;
	},
	squishy: (Entity) => {
		if (!Entity.animTime) Entity.animTime = CommonTime() + Math.floor(KDRandom() * 1000);
		Entity.scaleY *= (1 - 0.12*Math.sin(Math.PI + 2 * Math.PI * KDAnimQuantize(KDSquishyAnimTime/4, CommonTime() - Entity.animTime)/(KDSquishyAnimTime)));
		Entity.scaleX *= (1 - 0.08*Math.sin(2 * Math.PI * KDAnimQuantize(KDSquishyAnimTime/4, CommonTime() - Entity.animTime)/(KDSquishyAnimTime)));
		Entity.offY += -0.04*Math.sin(2 * Math.PI * KDAnimQuantize(KDSquishyAnimTime/4, CommonTime() - Entity.animTime)/(KDSquishyAnimTime));
		return true;
	},
	squishyAmbush: (Entity) => {
		if (!Entity.ambushtrigger) return false;
		if (!Entity.animTime) Entity.animTime = CommonTime() + Math.floor(KDRandom() * 1000);
		Entity.scaleY *= (1 - 0.12*Math.sin(Math.PI + 2 * Math.PI * KDAnimQuantize(KDSquishyAnimTime/4, CommonTime() - Entity.animTime)/(KDSquishyAnimTime)));
		Entity.scaleX *= (1 - 0.08*Math.sin(2 * Math.PI * KDAnimQuantize(KDSquishyAnimTime/4, CommonTime() - Entity.animTime)/(KDSquishyAnimTime)));
		Entity.offY += -0.04*Math.sin(2 * Math.PI * KDAnimQuantize(KDSquishyAnimTime/4, CommonTime() - Entity.animTime)/(KDSquishyAnimTime));
		return true;
	},
};

/**
 * Quantizes a number
 * @param amount
 * @param step
 */
function KDAnimQuantize(step: number, amount: number): number {
	if (!KDToggles.RetroAnim) return amount;
	return Math.round(amount/step) * step;
}


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
 * @param Name
 */
function KinkyDungeonGetEnemyByName(Name: string | enemy): enemy {
	if (typeof Name != "string") return Name;
	if (KDEnemiesCache.size > 0) {
		return KDEnemiesCache.get(Name) || KinkyDungeonEnemies.find(element => element.name === Name);
	} else {
		KinkyDungeonRefreshEnemiesCache();
		return KDEnemiesCache.get(Name) || KinkyDungeonEnemies.find(element => element.name === Name);
	}
}

/**
 * @param x
 * @param y
 * @param [filter]
 * @param [any]
 * @param [qualified] - Exclude jails where the player doesnt meet conditions
 * @param [unnocupied] - No enemy in the jail
 */
function KinkyDungeonNearestJailPoint(x: number, y: number, filter?: string[], any?: boolean, qualified?: boolean, unnocupied?: boolean, criteria?: (x, y, point) => boolean): KDJailPoint {
	let filt = filter ? filter : ["jail", "dropoff"];
	let dist = 100000;
	let point = null;
	let leash = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
	let furniture = KinkyDungeonGetRestraintItem("ItemDevices");
	for (let p of KDMapData.JailPoints) {
		if (!any && p.type && !filt.includes(p.type)) continue;
		if (qualified && p.requireLeash && !leash) continue;
		if (qualified && p.requireFurniture && !furniture) continue;
		if (unnocupied && KinkyDungeonEntityAt(p.x, p.y)) continue;
		if (criteria && !criteria(p.x, p.y, p)) continue;
		if (KinkyDungeonEntityAt(p.x, p.y, undefined, undefined, undefined, false)
			&& KDIsImprisoned(KinkyDungeonEntityAt(p.x, p.y))) continue;
		let d = Math.max(Math.abs(x - p.x), Math.abs(y - p.y));
		if (d < dist) {
			dist = d;
			point = p;
		}
	}

	return point;
}

function KDLockNearbyJailDoors(x: number, y: number) {
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
 * @param [filter]
 * @param [exclude]
 */
function KinkyDungeonRandomJailPoint(filter?: string[], exclude?: KDJailPoint[]): KDJailPoint {
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

function KinkyDungeonNearestPatrolPoint(x: number, y: number): number {
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

let KinkyDungeonFlags: Map<string, number> = new Map();

/**
 * @param Flag
 * @param Duration - In turns
 * @param [Floors] - Optional, makes this flag expire in this many floors
 */
function KinkyDungeonSetFlag(Flag: string, Duration: number, Floors?: number) {
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

function KinkyDungeonUpdateFlags(delta: number) {
	for (let f of KinkyDungeonFlags.keys()) {
		if (KinkyDungeonFlags.get(f) != -1) {
			if (KinkyDungeonFlags.get(f) > 0) KinkyDungeonFlags.set(f, KinkyDungeonFlags.get(f) - delta);
			if (KinkyDungeonFlags.get(f) <= 0 && KinkyDungeonFlags.get(f) != -1) KinkyDungeonFlags.delete(f);
		}
	}
}

function KinkyDungeonGetPatrolPoint(index: number, radius: number, Tiles: string) {
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
 * @param enemy
 * @param [override]
 */
function KDGetBindAmp(enemy: entity, override?: number): number {
	if (!KDAllied(enemy)) return override != undefined ? override : KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BindAmp"));
	return 1;
}

/**
 * Bound and unable to do anything
 * @param enemy
 */
function KDHelpless(enemy: entity): boolean {
	return enemy && !enemy.player && (enemy.hp <= 0.52 || enemy.boundLevel > KDNPCStruggleThreshMult(enemy) * enemy.Enemy.maxhp) && KDBoundEffects(enemy) > 3;
}

/**
 * Bound with no way out
 * @param enemy
 */
function KDIsHopeless(enemy: entity): boolean {
	return enemy && !enemy.player && (enemy.boundLevel > KDNPCStruggleThreshMult(enemy) * enemy.Enemy.maxhp) && KDBoundEffects(enemy) > 3;
}

function KDEnemyVisionRadius(enemy: entity): number {
	let data = {
		enemy: enemy,
		radius: enemy.Enemy.visionRadius || 2,
		mult: KinkyDungeonMultiplicativeStat(-KDEntityBuffedStat(enemy, "VisionRad")),
		bonusBefore: 0.0,
		bonusAfter: 0.0,
	};
	KinkyDungeonSendEvent("calcEnemyVision", data);

	return (data.bonusBefore + data.radius) * data.mult + data.bonusAfter;
}

function KinkyDungeonNearestPlayer(enemy: entity, _requireVision?: boolean, decoy?: boolean, visionRadius?: number, _AI_Data?: KDAIData) {
	if (enemy && enemy.Enemy && !visionRadius) {
		visionRadius = KDEnemyVisionRadius(enemy);
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
				if (KDHelpless(e) || KDIsImprisoned(e)) continue;
				if (KDGetFaction(e) == "Natural") continue;
				if (enemy.Enemy.noTargetSilenced && e.silence > 0) continue;
				if ((e.Enemy && !e.Enemy.noAttack && KDHostile(enemy, e))) {
					if (e.Enemy?.tags?.scenery && KDAllied(enemy) && !KDEnemyHasFlag(e, "targetedForAttack")) continue;
					let dist = Math.sqrt((e.x - enemy.x)*(e.x - enemy.x)
						+ (e.y - enemy.y)*(e.y - enemy.y));
					let pdist_enemy =
						(KDGetFaction(enemy) == "Player"
						&& !KDEnemyHasFlag(enemy, "NoFollow")
						&& !KDEnemyHasFlag(enemy, "StayHere")
						&& (enemy.Enemy.allied || KDIsInParty(enemy) || (!KDGameData.PrisonerState || KDGameData.PrisonerState == "chase")))
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
							if (enemy.rage || !e.Enemy.lowpriority || (enemy.gx == e.x && enemy.gy == e.y)
									|| (!KinkyDungeonCheckLOS(enemy, KinkyDungeonPlayerEntity, pdist, visionRadius, true, true)
									|| !KinkyDungeonCheckPath(enemy.x, enemy.y, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, false, true))) {
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

/**
 * @param enemy
 */
function KDEnemyHidden(enemy: entity): boolean {
	if (enemy?.Enemy?.tags?.timestealth && !KDEnemyHasFlag(enemy, "timereveal") && !KinkyDungeonFlags.get("TimeSlow")) {
		return KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) > 1.5;
	}

	return KDEnemyHasFlag(enemy, "hidden");
}

function KinkyDungeonInDanger() {
	for (let b of KDMapData.Bullets) {
		let bdist = 1.5;
		if (b.vx && b.vy) bdist = 2*Math.sqrt(b.vx*b.vx + b.vy*b.vy);
		if (KinkyDungeonVisionGet(Math.round(b.x), Math.round(b.y)) > 0 && Math.max(Math.abs(b.x - KinkyDungeonPlayerEntity.x), Math.abs(b.y - KinkyDungeonPlayerEntity.y)) < bdist) {
			return true;
		}
	}
	let nearby = KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KDGameData.MaxVisionDist + 1, undefined, true);
	for (let enemy of nearby) {
		let playerDist = KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y);
		if (KinkyDungeonVisionGet(enemy.x, enemy.y) > 0) {
			if (((enemy.revealed && !enemy.Enemy.noReveal) || !enemy.Enemy.stealth || KinkyDungeonSeeAll || playerDist <= enemy.Enemy.stealth + 0.1) && !KDEnemyHidden(enemy) && !(KinkyDungeonGetBuffedStat(enemy.buffs, "Sneak") > 0 && playerDist > 1.5)) {
				if (((!KDHelpless(enemy) && KinkyDungeonAggressive(enemy)) || (playerDist < 1.5 && !KDIsImprisoned(enemy)))) {
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

function KDAmbushAI(enemy: entity): boolean {
	let AI = enemy.AI ? enemy.AI : enemy.Enemy.AI;
	let AIType = KDAIType[AI];
	if (AIType) return AIType.ambush;
	return false;
}

let KinkyDungeonFastMoveSuppress = false;
let KinkyDungeonFastStruggleSuppress = false;
let KDInDanger = false;

function KinkyDungeonDrawEnemies(_canvasOffsetX: number, _canvasOffsetY: number, CamX: number, CamY: number) {
	let reenabled = false;
	let reenabled2 = false;
	let wasInDanger = KDInDanger;
	KDInDanger = false;

	if (KinkyDungeonFastMoveSuppress) {
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
				if ((!wasInDanger && KDGameData.FocusControlToggle?.AutoPathSuppressBeforeCombat)
					|| (KDGameData.FocusControlToggle?.AutoPathStepDuringCombat)) {
					if (KDGameData.FocusControlToggle?.AutoPathStepDuringCombat && KinkyDungeonFlags.get("startPath") && KinkyDungeonFastMovePath.length > 0) {
						KinkyDungeonFastMovePath = [KinkyDungeonFastMovePath[0]];
					} else {
						KinkyDungeonFastMovePath = [];
					}
				}

				// Cancel fast move if there is no current path
				if (KinkyDungeonFastMovePath?.length == 0 &&
					(
						KDGameData.FocusControlToggle?.AutoPathSuppressDuringCombat
					)
				) {
					KinkyDungeonFastMoveSuppress = true;
					KinkyDungeonFastMove = false;
					reenabled = false;
				}
			}

			KDInDanger = true;
		}
	}
	let nearby = KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KDGameData.MaxVisionDist + 1, undefined, true);
	for (let enemy of nearby) {
		let sprite = enemy.Enemy.name;
		KinkyDungeonUpdateVisualPosition(enemy, KinkyDungeonDrawDelta);
		let tx = enemy.visual_x;
		let ty = enemy.visual_y;
		let playerDist = KDistChebyshev((enemy.x - KinkyDungeonPlayerEntity.x), (enemy.y - KinkyDungeonPlayerEntity.y));
		if (enemy.x >= CamX && enemy.y >= CamY && enemy.x < CamX + KinkyDungeonGridWidthDisplay && enemy.y < CamY + KinkyDungeonGridHeightDisplay
			&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0 && KDCanSeeEnemy(enemy, playerDist)) {
			if (((enemy.revealed && !enemy.Enemy.noReveal) || !enemy.Enemy.stealth || KDAllied(enemy) || KDHelpless(enemy) || KinkyDungeonSeeAll || playerDist <= enemy.Enemy.stealth + 0.1) && !KDEnemyHidden(enemy) && !(KinkyDungeonGetBuffedStat(enemy.buffs, "Sneak", true) > 0 && playerDist > 1.5)) {
				enemy.revealed = true;
				if (((KinkyDungeonAggressive(enemy) && playerDist <= 6.9) || (playerDist < 1.5 && enemy.playWithPlayer))) {
					if ((KDHostile(enemy) || enemy.rage) && KinkyDungeonVisionGet(enemy.x, enemy.y) > 0 && KinkyDungeonFastMove &&
						!enemy.Enemy.tags.harmless &&
						(!KDAmbushAI(enemy) || enemy.ambushtrigger)) {
						if ((!wasInDanger && KDGameData.FocusControlToggle?.AutoPathSuppressBeforeCombat)
							|| (KDGameData.FocusControlToggle?.AutoPathStepDuringCombat && !KinkyDungeonFlags.get("startPath"))) {
							if (KinkyDungeonFastMove && !KinkyDungeonFastMoveSuppress && !reenabled)
								KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Click.ogg");
							if (KDGameData.FocusControlToggle?.AutoPathStepDuringCombat && KinkyDungeonFlags.get("startPath") && KinkyDungeonFastMovePath.length > 0) {
								KinkyDungeonFastMovePath = [KinkyDungeonFastMovePath[0]];
							} else {
								KinkyDungeonFastMovePath = [];
							}
						}

						// Cancel fast move if there is no current path
						if (KinkyDungeonFastMovePath?.length == 0 &&
							(
								KDGameData.FocusControlToggle?.AutoPathSuppressDuringCombat

							)
						) {
							KinkyDungeonFastMoveSuppress = true;
							KinkyDungeonFastMove = false;
							reenabled = false;
						}
						KDInDanger = true;
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
				if (KDToggles.EnemyAura && enemy.buffs && !KDHelpless(enemy) && (!KDGetAI(enemy) || !KDAIType[KDGetAI(enemy)] || !KDAIType[KDGetAI(enemy)].ambush || enemy.ambushtrigger)) {
					let aura_scale = 0;
					let aura_scale_max = 0;
					for (let b of Object.values(enemy.buffs)) {
						if (b && b.aura && b.duration > 0) {
							aura_scale_max += 1;
						}
					}
					let sp = sprite;
					let dir = "Enemies/";
					if (KDToggles.OutlineAura) {
						let buffSprite = "";
						let buffSpritePower = 0;
						//let sprite = enemy.Enemy.name;
						if (enemy.buffs) {
							for (let b of Object.values(enemy.buffs)) {
								if (b?.replaceSpriteBound && KDBoundEffects(enemy) > 3 && (b.replacePower || b.power > buffSpritePower)) {
									buffSpritePower = b.replacePower || b.power;
									buffSprite = b.replaceSpriteBound;
								} else if (b?.replaceSprite && (b.replacePower || b.power > buffSpritePower)) {
									buffSpritePower = b.replacePower || b.power;
									buffSprite = b.replaceSprite;
								}
							}
						}

						if (buffSprite) sprite = buffSprite;


						if (!enemy.Enemy.bound || (KDBoundEffects(enemy) < 4 && !KDHelpless(enemy))) {
							sp = sprite;
							if (!enemy.ambushtrigger && enemy.Enemy.GFX?.AmbushSprite && KDAmbushAI(enemy)) sp = enemy.Enemy.GFX.AmbushSprite;
							else if (enemy.CustomSprite && !buffSprite) sp = "CustomSprite/" + enemy.CustomSprite;
						} else {
							sp = buffSprite || enemy.Enemy.bound;
							dir = "EnemiesBound/";
							if (enemy.CustomSprite && !buffSprite) {
								dir = "Enemies/";
								sp = "CustomSpriteBound/" + enemy.CustomSprite;
							}
						}
					}

					if (aura_scale_max > 0) {
						let buffs = Object.values(enemy.buffs);
						buffs = buffs.sort((a, b) => {return b.duration - a.duration;});
						for (let b of buffs) {
							if (b && b.aura && b.duration > 0 && !(b.aurasprite == "Null") && (b.showHelpless || !KDHelpless(enemy))) {
								let s = aura_scale;
								if (StandalonePatched && KDToggles.OutlineAura && !(b.noAuraColor && b.aurasprite)) {



									let o = {filters: [KDGetOutlineFilter(string2hex(b.aura), 1.0, 0.1, 1)], zIndex: -1 - s};

									let w = (1 + 0.25 * s) * (enemy.Enemy.GFX?.spriteWidth || KinkyDungeonGridSizeDisplay);//(1 + 0.25 * s) *
									let h = (1 + 0.25 * s) * (enemy.Enemy.GFX?.spriteHeight || KinkyDungeonGridSizeDisplay);

									let spr = KDDraw(kdenemyboard, kdpixisprites, enemy.id + "," + b.id, KinkyDungeonRootDirectory + dir + sp + ".png",
										(tx + (enemy.offX || 0) - CamX)*KinkyDungeonGridSizeDisplay - ((enemy.flip ? -1 : 1) * w - KinkyDungeonGridSizeDisplay)/2,
										(ty + (enemy.offY || 0) - CamY)*KinkyDungeonGridSizeDisplay - (h - KinkyDungeonGridSizeDisplay)/2,
										w, h, undefined, o);
									if (enemy.flip && spr?.scale.x > 0) spr.scale.x = -spr.scale.x;
									else if (!enemy.flip && spr?.scale.x < 0) spr.scale.x = -spr.scale.x;
								} else {

									let w = enemy.Enemy.GFX?.spriteWidth || KinkyDungeonGridSizeDisplay;
									let h = enemy.Enemy.GFX?.spriteHeight || KinkyDungeonGridSizeDisplay;
									// Legacy
									if (b.noAuraColor && b.aurasprite) {
										KDDraw(kdenemyboard, kdpixisprites, enemy.id + "," + b.id, KinkyDungeonRootDirectory + "Aura/" + (b.aurasprite ? b.aurasprite : "Aura") + ".png",
											(tx + (enemy.offX || 0) - CamX)*KinkyDungeonGridSizeDisplay - (w - KinkyDungeonGridSizeDisplay)/2,
											(ty + (enemy.offY || 0) - CamY)*KinkyDungeonGridSizeDisplay - (h - KinkyDungeonGridSizeDisplay)/2,
											w, h, undefined, {
												zIndex: 2,
											});
									} else {
										KDDraw(kdenemyboard, kdpixisprites, enemy.id + "," + b.id, KinkyDungeonRootDirectory + "Aura/" + (b.aurasprite ? b.aurasprite : "Aura") + ".png",
											(tx - CamX)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s + KinkyDungeonGridSizeDisplay * (1 + s) * 0.167,
											(ty - CamY)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s + KinkyDungeonGridSizeDisplay * (1 + s) * 0.167,
											KinkyDungeonGridSizeDisplay * (1 + s) * 0.67,
											KinkyDungeonGridSizeDisplay * (1 + s) * 0.67,
											undefined, {
												tint: string2hex(b.aura),
												zIndex: 2,
											});
									}
								}
								aura_scale += 1/aura_scale_max;
							}
						}
					}
				}

				sprite = KDDrawEnemySprite(kdenemyboard, enemy, tx, ty, CamX, CamY);
			}
		} else {
			// Can't see the enemy so we draw sound instead
			if (KDCanHearEnemy(KinkyDungeonPlayerEntity, enemy)) {
				let w = enemy.Enemy.GFX?.spriteWidth || KinkyDungeonGridSizeDisplay;
				let h = enemy.Enemy.GFX?.spriteHeight || KinkyDungeonGridSizeDisplay;
				let o = StandalonePatched ?
					undefined
					: {tint: 0x888888, blendMode: PIXI.BLEND_MODES.SCREEN};

				let spr = KDDraw(kdgamesound, kdpixisprites, "spr_sound_" + enemy.id, KinkyDungeonRootDirectory + (KDBoundEffects(enemy) > 3 ? "EnemiesBound/" : "Enemies/") + sprite + ".png",
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

function KDDrawEnemySprite(board: PIXIContainer, enemy: entity, tx: number, ty: number, CamX: number, CamY: number, StaticView?: boolean, zIndex: number = 0, id: string = ""): string {
	let buffSprite = "";
	let buffSpritePower = 0;
	let sprite = enemy.Enemy.name;
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

	let o: any = null;

	// Generate the NPC if applicable
	if ((KDToggles.ShowJailedNPCSprites && KDIsImprisoned(enemy))) {
		KDQuickGenNPC(enemy, enemy.CustomName != undefined);
	}

	if (!enemy.Enemy.bound || (KDBoundEffects(enemy) < 4 && !KDHelpless(enemy))) {
		let sp = sprite;
		if (!enemy.ambushtrigger && enemy.Enemy.GFX?.AmbushSprite && KDAmbushAI(enemy)) sp = enemy.Enemy.GFX.AmbushSprite;
		else if (enemy.CustomSprite && !buffSprite) sp = "CustomSprite/" + enemy.CustomSprite;
		let w = (enemy.Enemy.GFX?.spriteWidth || KinkyDungeonGridSizeDisplay) * (enemy.scaleX || 1);
		let h = (enemy.Enemy.GFX?.spriteHeight || KinkyDungeonGridSizeDisplay) * (enemy.scaleY || 1);
		let color = (enemy.Enemy.GFX?.lighting) ? KDGetLightColor(enemy.x, enemy.y) : undefined;
		if (color) {
			if (!o) o = {tint: color};
		}
		if (zIndex) {
			if (!o) o = {zIndex: zIndex};
			else o.zIndex = zIndex;
		}
		if ((KDToggles.ShowJailedNPCSprites && KDIsImprisoned(enemy))
			&& KDNPCChar.get(enemy.id)) {
			let char = KDNPCChar.get(enemy.id);
			// We refresh
			if (enemy.refreshSprite
				|| !kdpixisprites.get("xspr_" + enemy.id + id)) {
				if (char)
					KDRefreshCharacter.set(char, true);
				if (!NPCTags.get(char)) {
					NPCTags.set(char, new Map());
				}
				NPCTags.set(char, KinkyDungeonUpdateRestraints(char, enemy.id, 0));
				enemy.refreshSprite = false;
			}
			KinkyDungeonDressPlayer(char, false, false, KDGameData.NPCRestraints ? KDGameData.NPCRestraints[enemy.id + ''] : undefined);

			kdpixisprites.set("xspr_" + enemy.id + id, {});
			kdSpritesDrawn.set("xspr_" + enemy.id + id, true);

			let size = Math.max(w, h);
			DrawCharacter(char,
				(tx + (enemy.offX || 0) - CamX)*KinkyDungeonGridSizeDisplay - (1)*(w - KinkyDungeonGridSizeDisplay)/2 + size * 0.25,
				(ty + (enemy.offY || 0) - CamY)*KinkyDungeonGridSizeDisplay - (h - KinkyDungeonGridSizeDisplay)/2 + size/6,
				size/1100, false, board, undefined, CHIBIMOD, 0, enemy.flip, undefined, "spr_" + enemy.id + id);

		} else {
			let spr = KDDraw(board, kdpixisprites, "spr_" + enemy.id + id, KinkyDungeonRootDirectory + "Enemies/" + sp + ".png",
				(tx + (enemy.offX || 0) - CamX + ((enemy.flip && !StaticView) ? 1 : 0))*KinkyDungeonGridSizeDisplay - ((enemy.flip && !StaticView) ? -1 : 1)*(w - KinkyDungeonGridSizeDisplay)/2,
				(ty + (enemy.offY || 0) - CamY)*KinkyDungeonGridSizeDisplay - (h - KinkyDungeonGridSizeDisplay)/2,
				w, h, undefined, o);
			if (!StaticView) {
				if (enemy.flip && spr?.scale.x > 0) spr.scale.x = -spr.scale.x;
				else if (!enemy.flip && spr?.scale.x < 0) spr.scale.x = -spr.scale.x;
			}
		}


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
		if (color) {
			if (!o) o = {tint: color};
		}
		if (zIndex) {
			if (!o) o = {zIndex: zIndex};
			else o.zIndex = zIndex;
		}
		if (((KDToggles.ShowJailedNPCSprites && KDIsImprisoned(enemy)))
			&& KDNPCChar.get(enemy.id)) {
			let char = KDNPCChar.get(enemy.id);
			// We refresh
			if (enemy.refreshSprite
				|| !kdpixisprites.get("xspr_" + enemy.id + id)) {
				if (char)
					KDRefreshCharacter.set(char, true);
				if (!NPCTags.get(char)) {
					NPCTags.set(char, new Map());
				}
				NPCTags.set(char, KinkyDungeonUpdateRestraints(char, enemy.id, 0));
				enemy.refreshSprite = false;
			}
			KinkyDungeonDressPlayer(char, false, false, KDGameData.NPCRestraints ? KDGameData.NPCRestraints[enemy.id + ''] : undefined);

			kdpixisprites.set("xspr_" + enemy.id + id, {}); // Hijack pixisprites due to desired functionality
			kdSpritesDrawn.set("xspr_" + enemy.id + id, true);

			let size = Math.max(w, h);
			DrawCharacter(char,
				(tx + (enemy.offX || 0) - CamX)*KinkyDungeonGridSizeDisplay - (1)*(w - KinkyDungeonGridSizeDisplay)/2 + size * 0.25,
				(ty + (enemy.offY || 0) - CamY)*KinkyDungeonGridSizeDisplay - (h - KinkyDungeonGridSizeDisplay)/2+ size/6,
				size/1100, false, board, undefined, CHIBIMOD, 0, enemy.flip, undefined, "spr_" + enemy.id + id);

		} else {
			let spr = KDDraw(board, kdpixisprites, "spr_" + enemy.id + id, KinkyDungeonRootDirectory + dir + sp + ".png",
				(tx + (enemy.offX || 0) - CamX + ((enemy.flip && !StaticView) ? 1 : 0))*KinkyDungeonGridSizeDisplay - ((enemy.flip && !StaticView) ? -1 : 1)*(w - KinkyDungeonGridSizeDisplay)/2,
				(ty + (enemy.offY || 0) - CamY)*KinkyDungeonGridSizeDisplay - (h - KinkyDungeonGridSizeDisplay)/2,
				w, h, undefined, o);
			if (!StaticView) {
				if (enemy.flip && spr?.scale.x > 0) spr.scale.x = -spr.scale.x;
				else if (!enemy.flip && spr?.scale.x < 0) spr.scale.x = -spr.scale.x;
			}
		}
	}
	return sprite;
}

/**
 * @param Entity
 */
function KDAnimEnemy(Entity: entity): { offX: number, offY: number } {
	let offX = 0;
	let offY = 0;
	let offamount = 0.25;
	let resetAnim = true;


	let noAmbushWait = !(Entity.Enemy && KDAmbushAI(Entity) && !Entity.ambushtrigger);



	if (noAmbushWait && KDToggles.EnemyAnimations && Entity.Enemy && (Entity.Enemy.Animations || Entity.Enemy.bound)) {
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

	if (noAmbushWait && KDToggles.EnemyAnimations && Entity.Enemy && KDIsFlying(Entity) && !(KDBoundEffects(Entity) > 3 || KDHelpless(Entity))) {
		if (resetAnim) {
			Entity.offY = 0;
			Entity.offX = 0;
			Entity.scaleX = 1;
			Entity.scaleY = 1;
		}
		if (!Entity.animTime) Entity.animTime = CommonTime() + Math.floor(KDRandom() * 1000);
		Entity.offY += 0.05*Math.sin(2 * Math.PI * KDAnimQuantize(KDFloatAnimTime/8, CommonTime() - Entity.animTime)/(KDFloatAnimTime));
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
		if (noAmbushWait && KDToggles.EnemyAnimations && Entity.Enemy && (KDBoundEffects(Entity) > 3 || KDHelpless(Entity) || Entity.bind > 0) && !KinkyDungeonIsStunned(Entity)) {
			if (resetAnim) {
				Entity.offY = 0;
				Entity.offX = 0;
				Entity.scaleX = 1;
				Entity.scaleY = 1;
			}
			if (!Entity.animTime) Entity.animTime = CommonTime();
			Entity.offX += 0.04*Math.sin(2 * Math.PI * KDAnimQuantize(KDAnimTime/4, CommonTime() - Entity.animTime)/(KDAnimTime));
			resetAnim = false;
		}
	}
	if (resetAnim || !noAmbushWait)  {
		delete Entity.offY;
		delete Entity.offX;
		delete Entity.scaleX;
		delete Entity.scaleY;
		delete Entity.animTime;
	}
	return {offX: offX, offY: offY};
}


function KDSetCollFlag(id: number, flag: string, duration: number) {
	let entry = KDGameData.Collection["" + id];
	if (entry) {
		if (!entry.flags) entry.flags = {};
		if (entry.flags[flag]) {
			if (duration == 0) {
				delete entry.flags[flag];// = undefined;
				return;
			}
			if (entry.flags[flag] == -1) return;
			if (entry.flags[flag] < duration) entry.flags[flag] = duration;
		} else if (duration) entry.flags[flag] = duration;
	}
}

/**
 * @param id
 * @param flag
 */
function KDCollHasFlag(id: number, flag: string): boolean {
	let entry = KDGameData.Collection["" + id];
	if (entry?.flags)
		return (entry.flags && (entry.flags[flag] > 0 || entry.flags[flag] == -1));
	return false;
}

function KinkyDungeonSetEnemyFlag(enemy: entity, flag: string, duration?: number) {
	KDSetCollFlag(enemy.id, flag, duration);
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
 * @param id
 * @param flag
 * @param duration
 */
function KDSetIDFlag(id: number, flag: string, duration: number) {
	if (id == -1) {
		KinkyDungeonSetFlag(flag, duration);
	}
	let enemy = KDGetGlobalEntity(id);
	if (!enemy) {
		KDSetCollFlag(id, flag, duration);
		return;
	}
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
 * @param enemy
 * @param flag
 */
function KDEnemyHasFlag(enemy: entity, flag: string): boolean {
	return (enemy.flags && (enemy.flags[flag] > 0 || enemy.flags[flag] == -1))
		|| KDCollHasFlag(enemy.id, flag);
}
/**
 * @param id
 * @param flag
 */
function KDIDHasFlag(id: number, flag: string): boolean {
	if (id == -1) {
		return KinkyDungeonFlags.get(flag) > 0;
	}
	let enemy = KDGetGlobalEntity(id);
	if (enemy)
		return (enemy.flags && (enemy.flags[flag] > 0 || enemy.flags[flag] == -1))
			|| KDCollHasFlag(enemy.id, flag);
	else return enemy ? KDCollHasFlag(enemy.id, flag) : false;
}

/**
 * @param enemy
 * @param flag
 */
function KDEntityHasFlag(enemy: entity, flag: string): boolean {
	if (enemy.player) {
		return KinkyDungeonFlags.get(flag) > 0;
	}
	return (enemy.flags && (enemy.flags[flag] > 0 || enemy.flags[flag] == -1));
}

function KinkyDungeonDrawEnemiesStatus(canvasOffsetX: number, canvasOffsetY: number, CamX: number, CamY: number) {

	let nearby = KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KDGameData.MaxVisionDist + 1, undefined, true);
	for (let enemy of nearby) {
		if (KDAmbushAI(enemy) && !enemy.ambushtrigger) continue;
		let tx = enemy.visual_x;
		let ty = enemy.visual_y;
		let helpless = KDHelpless(enemy);
		let playerDist = Math.max(Math.abs(enemy.x - KinkyDungeonPlayerEntity.x), Math.abs(enemy.y - KinkyDungeonPlayerEntity.y));
		if (KDDebugOverlay2) {
			if (KDCommanderRoles.get(enemy.id)) {
				DrawTextFitKD(KDCommanderRoles.get(enemy.id),
					canvasOffsetX + (enemy.x - CamX)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2,
					canvasOffsetY + (enemy.y - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/3, 100, "white", "black");
			}
			KDTetherGraphics.lineStyle(2, string2hex(KDGetColor(enemy)), 1);
			KDTetherGraphics.moveTo((enemy.x - CamX + 0.5)*KinkyDungeonGridSizeDisplay, (enemy.y - CamY + 0.5)*KinkyDungeonGridSizeDisplay);
			KDTetherGraphics.lineTo((enemy.gx - CamX + 0.5)*KinkyDungeonGridSizeDisplay, (enemy.gy - CamY + 0.5)*KinkyDungeonGridSizeDisplay);
		}

		if (enemy.x >= CamX && enemy.y >= CamY && enemy.x < CamX + KinkyDungeonGridWidthDisplay && enemy.y < CamY + KinkyDungeonGridHeightDisplay
			&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0 && KDCanSeeEnemy(enemy, playerDist)) {
			let bindLevel = KDBoundEffects(enemy);
			if (((enemy.revealed && !enemy.Enemy.noReveal) || !enemy.Enemy.stealth || KDHelpless(enemy) || KinkyDungeonSeeAll || playerDist <= enemy.Enemy.stealth + 0.1) && !KDEnemyHidden(enemy) && !(KinkyDungeonGetBuffedStat(enemy.buffs, "Sneak", true) > 0)) {
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
				} else if (enemy.teleporting > 0) {
					KDDraw(kdenemystatusboard, kdpixisprites, "frz" + enemy.id, KinkyDungeonRootDirectory + "Conditions/Teleporting.png",
						(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
							zIndex: 2.11,
						});
				}
			}
		}
	}
}

let KDLastEnemyWarningDelta = 0;

function KinkyDungeonDrawEnemiesWarning(_canvasOffsetX: number, _canvasOffsetY: number, CamX: number, CamY: number) {

	let delta = CommonTime() - KDLastEnemyWarningDelta;
	KDLastEnemyWarningDelta = CommonTime();
	if (KDToggles.ForceWarnings || KDMouseInPlayableArea()) {
		let nearby = KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KDGameData.MaxVisionDist + 1, undefined, true);
		for (let enemy of nearby) {
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

						KDDraw(kdwarningboardOver, kdpixisprites, tx + "," + ty + "_w" + enemy.id, KinkyDungeonRootDirectory + ((KDAllied(enemy)) ? "WarningAlly" : "WarningColor" + special) + ".png",
							(tx - CamX+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay, (ty - CamY+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay*scale, KinkyDungeonGridSizeDisplay*scale, undefined, {
								tint: color,
								zIndex: 2.22 + 0.001 * (enemy.Enemy.power ? enemy.Enemy.power : 0),
							});
						KDDraw(kdwarningboard, kdpixisprites, tx + "," + ty + "_w_b" + enemy.id, KinkyDungeonRootDirectory + "WarningBacking" + ".png",
							(tx - CamX+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay, (ty - CamY+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay*scale, KinkyDungeonGridSizeDisplay*scale, undefined, {
								tint: color,
								zIndex: 0.21 + 0.001 * (enemy.Enemy.power ? enemy.Enemy.power : 0),
							});

						KDDraw(kdwarningboard, kdpixisprites, tx + "," + ty + "_w_b_h" + enemy.id, KinkyDungeonRootDirectory + "WarningBackingHighlight" + ".png",
							(tx - CamX+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay, (ty - CamY+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay*scale, KinkyDungeonGridSizeDisplay*scale, undefined, {
								zIndex: 0.20,
							});
						KDDraw(kdwarningboard, kdpixisprites, tx + "," + ty + "_w_h" + enemy.id, KinkyDungeonRootDirectory + ((KDAllied(enemy)) ? "WarningHighlightAlly" : "WarningHighlight" + special) + ".png",
							(tx - CamX+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay - 1, (ty - CamY+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay - 1,
							KinkyDungeonGridSizeDisplay*scale + 2, KinkyDungeonGridSizeDisplay*scale + 2, undefined, {
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
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, Math.atan2(ty - enemy.y, tx - enemy.x) || 0, {
							tint: color,
							zIndex: -0.05,
						}, true);
				}
			}
			if (enemy.Enemy.spells && (enemy.Enemy.spellRdy && (!KDAmbushAI(enemy) || enemy.ambushtrigger)) && !(enemy.castCooldown > 1) && (!(enemy.silence > 0) && !(enemy.stun > 0) && !(enemy.freeze > 0) && !(enemy.teleporting > 0) && !KDHelpless(enemy))) {
				let tx = enemy.visual_x;
				let ty = enemy.visual_y;
				//  && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(tx, ty))
				if (tx >= CamX && ty >= CamY && tx < CamX + KinkyDungeonGridWidthDisplay && ty < CamY + KinkyDungeonGridHeightDisplay
					&& KDCanSeeEnemy(enemy, Math.max(Math.abs(enemy.x - KinkyDungeonPlayerEntity.x), Math.abs(enemy.y - KinkyDungeonPlayerEntity.y)))
					&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0) {
					KDDraw(kdenemyboard, kdpixisprites, enemy.id + "_spellRdy", KinkyDungeonRootDirectory + "SpellReady.png",
						(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, enemy.Enemy.color ? {
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
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, binder.Enemy.color ? {
							tint: string2hex(binder.Enemy.color),
							zIndex: -2.1,
						} : undefined);
				}
			}
		}
	}
}

function KinkyDungeonBar (
	x:           number,
	y:           number,
	w:           number,
	h:           number,
	value:       number,
	foreground:  string = "#66FF66",
	background:  string = "#e64539",
	orig:        number = undefined,
	origColor:   string = "#ff4444",
	notches:     number[] = undefined,
	notchcolor:  string = "#ffffff",
	notchbg:     string = "#ffffff",
	zIndex:      number = 55
)
{
	KinkyDungeonBarTo(kdcanvas, x, y, w, h, value, foreground, background, orig, origColor, notches, notchcolor, notchbg, zIndex);
}

function KinkyDungeonBarTo (
	canvas:      PIXIContainer,
	x:           number,
	y:           number,
	w:           number,
	h:           number,
	value:       number,
	foreground:  string = "#66FF66",
	background:  string = "#e64539",
	orig:        number = undefined,
	origColor:   string = "#ff4444",
	notches:     number[] = undefined,
	notchcolor:  string = "#ffffff",
	notchbg:     string = "#ffffff",
	zIndex:      number = 55
)
{
	if (value < 0) value = 0;
	if (value > 100) value = 100;
	let reverse = w < 0;
	if (w < 0) w *= -1;
	let id = x + "," + y + "," + w + "," + h + foreground;
	if (background != "none")
		FillRectKD(canvas, kdpixisprites, id + '1', {
			Left: x + 1,
			Top: y + 1,
			Width: w - 2,
			Height: h - 2,
			Color: "#000000",
			LineWidth: 1,
			zIndex: zIndex+value*0.0001,
		});
	FillRectKD(canvas, kdpixisprites, id + '2', {
		Left: reverse ? x - 2 + w - Math.floor((w - 4) * value / 100) : x + 2,
		Top: y + 2,
		Width: Math.floor((w - 4) * value / 100),
		Height: h - 4,
		Color: foreground,
		LineWidth: 1,
		zIndex: zIndex + .1,
	});
	if (background != "none")
		FillRectKD(canvas, kdpixisprites, id + '3', {
			Left: reverse ? x + 2 : Math.floor(x + 2 + (w - 4) * value / 100),
			Top: y + 2,
			Width: Math.floor((w - 4) * (100 - value) / 100),
			Height: h - 4,
			Color: background,
			LineWidth: 1,
			zIndex: zIndex + .2,
		});
	if (orig != undefined)
		FillRectKD(canvas, kdpixisprites, id + '4', {
			Left: reverse ? Math.max(
				Math.floor(x - 2 + w - (w - 4) * orig / 100),
				Math.floor(x - 2 + w - (w - 4) * value / 100)
			) - Math.floor((w - 4) * Math.abs(value - orig) / 100): Math.min(
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
				FillRectKD(canvas, kdpixisprites, id + '5' + n, {
					Left: reverse ? x - 4 + w - Math.floor((w - 4) * n) - 1
						: x + Math.floor((w - 4) * n) - 1,
					Top: y + 2,
					Width: 3,
					Height: h - h,
					Color: notchbg,
					LineWidth: 1,
					zIndex: zIndex + .4,
				});
				FillRectKD(canvas, kdpixisprites, id + '6' + n, {
					Left: reverse ? x - 4 + w - Math.floor((w - 4) * n)
						: x + Math.floor((w - 4) * n),
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
 * @param enemy
 * @param [playerDist]
 */
function KDCanSeeEnemy(enemy: entity, playerDist?: number): boolean {
	if (enemy.player) return true; // Player!!!
	if (playerDist == undefined) playerDist = KDistChebyshev(KinkyDungeonPlayerEntity.x - enemy.x, KinkyDungeonPlayerEntity.y - enemy.y);
	return (((enemy.revealed && !enemy.Enemy.noReveal) || !enemy.Enemy.stealth || KDHelpless(enemy) || KDAllied(enemy) || KinkyDungeonSeeAll || playerDist <= enemy.Enemy.stealth + 0.1)
		&& !KDEnemyHidden(enemy)
		&& !(KinkyDungeonGetBuffedStat(enemy.buffs, "Sneak") > 0 && playerDist > 1.5)
		&& (playerDist <= KDMaxEnemyViewDist(enemy) || (KDGameData.RevealedTiles && KDGameData.RevealedTiles[enemy.x + ',' + enemy.y] > 0)));
}

function KDMaxEnemyViewDist(enemy: entity) {
	let data = {
		blindMult: (KinkyDungeonStatsChoice.get("Blackout") || KinkyDungeonStatsChoice.get("TotalBlackout")) ? 100 : 2,
	};
	//KinkyDungeonSendEvent("calcEnemyRad", data);
	if (enemy.hp < enemy.Enemy.maxhp || enemy.attackPoints > 0) return KDGameData.MaxVisionDist;
	if (KinkyDungeonBlindLevel < 2) return KDGameData.MaxVisionDist;
	else return Math.max(KinkyDungeonStatsChoice.get("TotalBlackout") ? 0.5 : 1.5, KDGameData.MaxVisionDist - KinkyDungeonBlindLevel * data.blindMult);
}

function KDEnemyHasHelp(enemy: entity): boolean {
	return (KDNearbyEnemies(enemy.x, enemy.y, 1.5).some((en) => {
		return en != enemy
			&& en.Enemy.bound
			&& !KDHelpless(en)
			&& KDBoundEffects(en) < 4
			&& !KDEnemyHasFlag(en, "imprisoned")
			&& !KinkyDungeonIsDisabled(en)
			&& KDFactionRelation(KDGetFaction(enemy), KDGetFaction(en))
				>= Math.max(0.1, KDFactionRelation("Player", KDGetFaction(en)));
	}) || (
		KDAllied(enemy)
		&& !!KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y)));
}

/**
 * @param enemy
 * @param force
 * @param defaultSpeed
 */
function KDGetEnemyStruggleMod(enemy: entity, force: boolean, defaultSpeed: boolean, hasHelp?: boolean): number {
	let level = KDBoundEffects(enemy);
	let mult = (force || enemy.hp > 0.51) ? 0.1 : 0;

	if (!force && KDIsImprisoned(enemy)) return 0; // Cant help imprisoned enemies, have to free them

	if (mult > 0 && !defaultSpeed) {
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
	} else {
		mult *= 3; // Default Speed is 3x unbound level
	}

	if (hasHelp == undefined) {
		hasHelp = KDEnemyHasHelp(enemy);;
	}
	if (!defaultSpeed && enemy.hp > 0.51 && hasHelp) {
		mult += KDAllied(enemy)
			&& KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y)
			&& !KinkyDungeonIsHandsBound(true, true)
			? 1.0
			: 0.15;
	}
	if (!defaultSpeed && enemy.boundLevel >= enemy.Enemy.maxhp) mult *= 1.0 + (enemy.boundLevel/enemy.Enemy.maxhp - 1) * 0.5;
	if (!defaultSpeed && enemy.hp > 0.52) mult *= 0.5 + enemy.hp / enemy.Enemy.maxhp;
	if (!defaultSpeed && mult > 0) {
		if (KinkyDungeonGetBuffedStat(enemy.buffs, "Lockdown")) mult *= KinkyDungeonGetBuffedStat(enemy.buffs, "Lockdown");
	}

	return mult;
}

/**
 * @param enemy
 * @param vibe
 */
function KDGetEnemyDistractRate(enemy: entity, vibe: number): number {
	if (vibe) return -(enemy.Enemy.maxhp**0.5) * (0.1 + 0.05 * vibe);
	if (KDEnemyHasFlag(enemy, "d_turn")) return 0;
	let level = KDBoundEffects(enemy);
	let mult = enemy.distraction/enemy.Enemy.maxhp > 0.9 ? 0.02 : (enemy.distraction/enemy.Enemy.maxhp > 0.5 ? 0.075 : 0.1);
	if (KDStrictPersonalities.includes(enemy.personality)) mult = mult * 2;
	else if (!KDLoosePersonalities.includes(enemy.personality)) mult = mult * 1.5;

	return mult * enemy.Enemy.maxhp / (1 + level * 0.35);
}

/**
 * @param enemy
 * @param vibe
 */
function KDGetEnemyDistractionDamage(enemy: entity, vibe: number): number {
	if (vibe <= 0) return 0;
	let mult = Math.max(0.25, enemy.distraction/enemy.Enemy.maxhp) * 0.05 * vibe;
	if (enemy.hp <= 1 || enemy.hp <= enemy.Enemy.maxhp * 0.101) return 0;
	return Math.min(Math.max(0.2 * enemy.Enemy.maxhp**0.75, 1), mult * enemy.hp);
}
/**
 * @param enemy
 */
function KDGetEnemyReleaseDamage(enemy: entity, nokill: boolean = true): any {
	let data = {
		enemy: enemy,
		damage: enemy.Enemy.maxhp * Math.max(0.1, enemy.desire / enemy.Enemy.maxhp),
		type: "charm",
		nokill: nokill,
	};
	KinkyDungeonSendEvent("enemyOrgasm", data);
	return data;
}

let KDMaxBindingBars = 8;

/**
 * @param currentval
 * @param targetval
 * @param rate
 * @param minrate - Minimum rate
 * @param delta
 * @param eps -epsilon, threshold for making the value eqyal exactly
 */
function KDEaseValue(delta: number, currentval: number, targetval: number, rate: number, minrate: number, eps: number = 0.1): number {
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

/**
 * @param enemy
 */
function KDGetMaxShield(enemy: entity): number {
	return enemy?.Enemy?.shield + KDEntityBuffedStat(enemy, "MaxShield");
}

/**
 * @param enemy
 */
function KDGetShieldRegen(enemy: entity): number {
	return (enemy?.Enemy?.shieldregen || 0) + KDEntityBuffedStat(enemy, "ShieldRegen");
}

function KDEaseBars(enemy: entity, delta: number) {
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
}

function KinkyDungeonDrawEnemiesHP(delta: number, canvasOffsetX: number, canvasOffsetY: number, CamX: number, CamY: number, _CamXoffset: number, CamYoffset: number) {
	KDDialogueSlots = {};
	let tooltip = false;
	//let bindAmpModBase = KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BindAmp"));
	let nearby = KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KDGameData.MaxVisionDist + 1, undefined, true);
	for (let enemy of nearby) {
		let xx = enemy.visual_x ? enemy.visual_x : enemy.x;
		let yy = enemy.visual_y ? enemy.visual_y : enemy.y;
		let maxHP = Math.max(enemy.Enemy?.maxhp, KDGetMaxShield(enemy) || enemy.shield || 0);
		let hpbarMult = Math.min(1, enemy.Enemy.maxhp / maxHP);
		let shieldbarMult = (KDGetMaxShield(enemy) || enemy.shield) ? Math.min(1, (KDGetMaxShield(enemy) || enemy.shield) / enemy.Enemy.maxhp) : 1;



		// Handle enemy bars

		KDEaseBars(enemy, delta);

		let playerDist = Math.max(Math.abs(enemy.x - KinkyDungeonPlayerEntity.x), Math.abs(enemy.y - KinkyDungeonPlayerEntity.y));
		if (enemy.x >= CamX && enemy.y >= CamY && enemy.x < CamX + KinkyDungeonGridWidthDisplay && enemy.y < CamY + KinkyDungeonGridHeightDisplay
			&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0 && !KDIsImprisoned(enemy)) {
			let II = 0;
			// Draw bars
			if ((!enemy.Enemy.stealth || KDAllied(enemy) || KDHelpless(enemy) || playerDist <= enemy.Enemy.stealth + 0.1) && !KDEnemyHidden(enemy) && !(KinkyDungeonGetBuffedStat(enemy.buffs, "Sneak") > 0 && playerDist > 1.5)) {

				if ((enemy.ambushtrigger || !KDAIType[KDGetAI(enemy)]?.ambush)) {
					// Handle dodge and block tokens
					if (KDCanBlock(enemy)) {

						if (enemy.blocks >= 1) {
							let pipY = -15 + canvasOffsetY + (yy - CamY + 1)*KinkyDungeonGridSizeDisplay;
							let pipSpacing = -0.5 * (KinkyDungeonGridSizeDisplay-25)/2;
							for (let pip = 0; pip < enemy.blocks && pip < 2; pip++) {
								if (pip == 0)
									DrawRectKD(kdenemystatusboard, kdpixisprites, enemy.id + "Bpip" + pip, {
										Left: canvasOffsetX + 15 + (xx - CamX)*KinkyDungeonGridSizeDisplay,
										Top: pipY,
										Width: 10,
										Height: 10,
										Color: "#ffffff",
										zIndex: 10,
										LineWidth: 2,
									});
								else {
									DrawCrossKD(kdenemystatusboard, kdpixisprites, enemy.id + "Bpip+" + pip, {
										Left: canvasOffsetX + 15 + (xx - CamX)*KinkyDungeonGridSizeDisplay,
										Top: pipY + 4,
										Width: 6,
										Height: 6,
										Color: "#ffffff",
										zIndex: 10,
										LineWidth: 2,
									});
								}
								pipY += pipSpacing;
							}
						}
					}

					if (KDCanDodge(enemy)) {
						if (enemy.dodges >= 1) {
							let pipY = 15 + canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay;
							let pipSpacing = 0.5 * (KinkyDungeonGridSizeDisplay-25)/2;
							for (let pip = 0; pip + 1 <= enemy.dodges && pip < 2; pip++) {
								if (pip == 1 || enemy.dodges < 2)
									DrawCircleKD(kdenemystatusboard, kdpixisprites, enemy.id + "Dpip" + pip, {
										Left: canvasOffsetX + 15 + (xx - CamX)*KinkyDungeonGridSizeDisplay,
										Top: pipY,
										Width: 10,
										Height: 10,
										Color: "#ffffff",
										zIndex: 10,
										LineWidth: 2,
									});
								else {
									DrawCrossKD(kdenemystatusboard, kdpixisprites, enemy.id + "Dpip+" + pip, {
										Left: canvasOffsetX + 15 + (xx - CamX)*KinkyDungeonGridSizeDisplay,
										Top: pipY + 4,
										Width: 6,
										Height: 6,
										Color: "#ffffff",
										zIndex: 10,
										LineWidth: 2,
									});
								}
								pipY += pipSpacing;
							}
						}
					}

					if ((KDAllied(enemy) || enemy.distraction > 0 || ((enemy.lifetime != undefined || enemy.playerdmg || (enemy.shield) || enemy.hp < enemy.Enemy.maxhp || enemy.boundTo || enemy.boundLevel))) && KDCanSeeEnemy(enemy, playerDist)) {



						let spacing = 6;
						// Draw binding bars
						let helpless = KDHelpless(enemy);
						let bindAmpMod = 1;//KDGetBindAmp(enemy, bindAmpModBase);
						let maxbars = Math.min(KDMaxBindingBars, 1 + KDNPCStruggleThreshMult(enemy));
						if (enemy.boundLevel != undefined && enemy.boundLevel > 0) {
							if (!helpless) {
								let visualbond = bindAmpMod * enemy.visual_boundlevel;
								let bindingBars = Math.ceil( visualbond / enemy.Enemy.maxhp);
								let hasHelp = KDEnemyHasHelp(enemy);
								let SM = KDGetEnemyStruggleMod(enemy, false, false, hasHelp);
								let futureBound = KDPredictStruggle(enemy, SM, 1, hasHelp ? 0 : maxbars);
								for (let i = 0; i < bindingBars && i < maxbars; i++) {
									if (i > 0) II++;
									let mod = visualbond - bindAmpMod * futureBound.boundLevel;
									// Part that will be struggled out of
									KinkyDungeonBarTo(kdenemystatusboard, canvasOffsetX + (xx - CamX + 0.1)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay + 12 - 15 - spacing*II,
										KinkyDungeonGridSizeDisplay * 0.8, 7, Math.min(1, (visualbond - i * enemy.Enemy.maxhp) / enemy.Enemy.maxhp) * 100, "#ffffff", "#52333f");
									// Separator between part that will be struggled and not
									KinkyDungeonBarTo(kdenemystatusboard, 1 + canvasOffsetX + (xx - CamX + 0.1)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay + 12 - 15 - spacing*II,
										KinkyDungeonGridSizeDisplay * 0.8, 7, Math.min(1, (visualbond - mod - i * enemy.Enemy.maxhp) / enemy.Enemy.maxhp) * 100, "#444444", "none");

								}
								II -= Math.max(0, Math.min(bindingBars-1, maxbars-1));
								// Temp value of bondage level, decremented based on special bound level and priority
								let bb = 0;
								let bcolor = "#ffae70";
								let bondage = [];
								if (futureBound.specialBoundLevel) {
									for (let b of Object.entries(futureBound.specialBoundLevel) as [string, any][]) {
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
								for (let i = 0; i < bindingBars && i < maxbars; i++) {
									if (i > 0) II++;
									// Determine current bondage type
									let bars = false;
									for (let bi = bondage.length - 1; bi >= 0; bi--) {
										let b = bondage[bi];
										// Filter out anything that doesnt fit currently
										if (b.level > i * enemy.Enemy.maxhp) {
											bcolor = KDSpecialBondage[b.name] ? KDSpecialBondage[b.name].color : "#ffae70";
											// Struggle bars themselves
											KinkyDungeonBarTo(kdenemystatusboard, canvasOffsetX + (xx - CamX + 0.1)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay + 12 - 15 - spacing*II,
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
							if (enemy.hp < enemy.Enemy.maxhp || KDAllied(enemy) || enemy.boundTo || enemy.shield > 0) {
								// Draw hp bar
								let fg = enemy.boundTo ? (KDAllied(enemy) ? "#77aaff" : "#dd88ff") : (KDAllied(enemy) ? "#00ff88" : "#ff5555");
								let bg = KDAllied(enemy) ? "#aa0000" : "#000000";
								KinkyDungeonBarTo(kdenemystatusboard, canvasOffsetX + (xx - CamX + (enemy.boundTo? 0.1 : 0.05))*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - 15 - II * spacing,
									hpbarMult * KinkyDungeonGridSizeDisplay * (enemy.boundTo? 0.8 : 0.9), enemy.boundTo? 7 : 9, enemy.visual_hp / enemy.Enemy.maxhp * 100, fg, bg);

								if (enemy.shield > 0) {
									KinkyDungeonBarTo(kdenemystatusboard, canvasOffsetX + (xx - CamX + (enemy.boundTo? 0.1 : 0.05))*KinkyDungeonGridSizeDisplay,
										canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - 15 - 5 - II * spacing,
										shieldbarMult * KinkyDungeonGridSizeDisplay * (enemy.boundTo? 0.8 : 0.9), 8, enemy.shield / KDGetMaxShield(enemy) * 100, '#92e8c0', bg);

								}
								II++;
							}
							if (enemy.Enemy.maxmana > 0) {
								KinkyDungeonBarTo(kdenemystatusboard, canvasOffsetX + (xx - CamX + (enemy.boundTo? 0.1 : 0.05))*KinkyDungeonGridSizeDisplay,
									canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - 15 + 5 - II * spacing,
									KinkyDungeonGridSizeDisplay * (enemy.boundTo? 0.8 : 0.9), 5, (enemy.mana || 0) / enemy.Enemy.maxmana * 100, '#4f6ab8', "#000000");

							}


							if (enemy.distraction > 0) {
								// Draw distraction bar
								KinkyDungeonBarTo(kdenemystatusboard, canvasOffsetX + (xx - CamX + 0.1)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - 15 - II * spacing,
									KinkyDungeonGridSizeDisplay * 0.8, 6, enemy.distraction / enemy.Enemy.maxhp * 100, "#fda1ff", "#9300ff");
								if (enemy.desire > 0)
									KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_ar_heart", KinkyDungeonRootDirectory + (enemy.distraction >= 0.9 * enemy.Enemy.maxhp ? "UI/HeartExtreme.png" : "UI/Heart.png"),
										-7 + canvasOffsetX + (xx - CamX + enemy.desire / enemy.Enemy.maxhp * 0.8 + 0.1)*KinkyDungeonGridSizeDisplay,
										-4 + canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - 15 - II * spacing,
										14, 14 , undefined, {
											zIndex: 63,
										});
								II++;
							}

							if (enemy.lifetime != undefined && enemy.maxlifetime > 0 && enemy.lifetime <= enemy.maxlifetime && enemy.maxlifetime < 999 && ((!enemy.Enemy.hidetimerbar && !enemy.hideTimer) || KDAllied(enemy))) {
								// Draw lifetime bar
								KinkyDungeonBarTo(kdenemystatusboard, canvasOffsetX + (xx - CamX + (enemy.boundTo? 0.1 : 0.05))*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - 15 - II * spacing,
									KinkyDungeonGridSizeDisplay * (enemy.boundTo? 0.8 : 0.9), 8, enemy.visual_lifetime / enemy.maxlifetime * 100, "#cccccc", "#000000"); II++;
							}
						}

						if (enemy.teleporting > 0 && enemy.teleportingmax > 1 && enemy.teleporting < enemy.teleportingmax) {
							// Draw lifetime bar
							KinkyDungeonBarTo(kdenemystatusboard, canvasOffsetX + (xx - CamX + (enemy.boundTo? 0.1 : 0.05))*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - 15 - II * spacing,
								KinkyDungeonGridSizeDisplay * (enemy.boundTo? 0.8 : 0.9), 8, (enemy.teleportingmax - enemy.teleporting) / enemy.teleportingmax * 100, "#92e8c0", "#4c6885"); II++;
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
					if ((KDToggles.ForceWarnings || KDMouseInPlayableArea()) && (enemy.Enemy.specialdialogue || enemy.specialdialogue)) {
						KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_th", KinkyDungeonRootDirectory + "Conditions/Dialogue.png",
							canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 23,
							});
					}
					let bb = false;
					if (KDToggles.ShowNPCStatuses && enemy.Enemy.bound && KDThoughtBubbles.has(enemy.id)) {
						let bubble = KDThoughtBubbles.get(enemy.id);
						if (bubble.index + bubble.duration >= KinkyDungeonCurrentTick && (enemy.ambushtrigger || !KDAIType[KDGetAI(enemy)]?.ambush)) {
							bb = true;
							let name = CommonTime() % 1000 < 500 ? "Thought" : bubble.name;
							if (name != "Thought" || !((enemy.lifetime != undefined || enemy.hp < enemy.Enemy.maxhp || enemy.boundLevel)))
								KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_th", KinkyDungeonRootDirectory + `Conditions/Thought/${name}.png`,
									canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
									KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
										zIndex: 23,
									});
						}
					}
					if (!KDHelpless(enemy) && !KDIsImprisoned(enemy)) {
						if (!KinkyDungeonAggressive(enemy) && ((!KDAllied(enemy) && !enemy.Enemy.specialdialogue && !bb) || KDEnemyHasFlag(enemy, "Shop")) && !enemy.playWithPlayer && enemy.Enemy.movePoints < 90 && !KDAmbushAI(enemy)) {
							KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_shop", KinkyDungeonRootDirectory + ((KDEnemyHasFlag(enemy, "Shop")) ? "Conditions/Shop.png" : (KDAllied(enemy) ? "Conditions/Heart.png" : "Conditions/Peace.png")),
								canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
								KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
									zIndex: 22,
								});
						} else if (!bb && enemy.aware && KDHostile(enemy) && enemy.vp >= 0.5 && KDEnemyHasFlag(enemy, "targ_player") && enemy.Enemy && !enemy.Enemy.noAlert && enemy.Enemy.movePoints < 90 && !KDAmbushAI(enemy)) {
							KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_aw", KinkyDungeonRootDirectory + "Conditions/Aware.png",
								canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
								KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
									zIndex: 22,
								});
						} else if (!bb && enemy.vp > 0.01 && KDHostile(enemy) && enemy.Enemy && !enemy.Enemy.noAlert && enemy.Enemy.movePoints < 90 && !KDAmbushAI(enemy)) {
							let sneakThreshold = enemy.Enemy.sneakThreshold ? enemy.Enemy.sneakThreshold : 2;
							if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak")) sneakThreshold = Math.max(0.1, sneakThreshold + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak"));
							if (enemy.vp > sneakThreshold/2) {
								KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_vp", KinkyDungeonRootDirectory + "Conditions/vp.png",
									canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
									KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
										zIndex: 22,
									});
							}
							if (enemy.vp < sneakThreshold)
								KinkyDungeonBarTo(kdenemystatusboard,
									canvasOffsetX + (xx - CamX + 0.15)*KinkyDungeonGridSizeDisplay,
									canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - 0,
									KinkyDungeonGridSizeDisplay * 0.7, 7, enemy.vp / sneakThreshold * 100, "#ffffff", "#333333");
						}
						if (enemy.vulnerable > 0)
							KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_vuln", KinkyDungeonRootDirectory + "Conditions/" + (
								KDToughArmor(enemy) ? "VulnerableBlocked" : "Vulnerable") + ".png",
							canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2 + yboost,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 22,
							});
					}
					if (!tooltip && (((!KDAmbushAI(enemy) || enemy.ambushtrigger)
					&& (MouseIn(canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay)
						|| MouseIn(canvasOffsetX + (enemy.x - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (enemy.y - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay))
						|| (KDGameData.CurrentDialog && KDGetSpeaker() == enemy)))) {
						let faction = KDGetFaction(enemy);
						if (faction && (!KinkyDungeonHiddenFactions.has(faction) || KinkyDungeonTooltipFactions.includes(faction))) {
							let tt = TextGet("KinkyDungeonFaction" + faction);
							let ttlength = 10;
							if (CJKcheck(tt,2)){
								DrawTextFitKD(tt, canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, yboost + canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/3, 10 + tt.length * 8, "white", "black");
								yboost += -2*KinkyDungeonGridSizeDisplay/7;
							} else {
								let ttCJKcheck1 = CJKcheck(tt,1);
								let ttCJKcheck2 = CJKcheck(tt);

								if (ttCJKcheck1  &&  typeof (ttCJKcheck1) != 'boolean'){
									for (const i in ttCJKcheck1){ttlength += ttCJKcheck1[i].length * 8;}
								}
								if (ttCJKcheck2  &&  typeof (ttCJKcheck2) != 'boolean'){
									for (const i in ttCJKcheck2){ttlength += ttCJKcheck2[i].length * 16;}
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

							if (nameCJKcheck1  &&  typeof (nameCJKcheck1) != 'boolean'){
								for (const i in nameCJKcheck1){namelength += nameCJKcheck1[i].length * 8;}
							}
							if (nameCJKcheck2  && typeof (nameCJKcheck2) != 'boolean'){
								for (const i in nameCJKcheck2){namelength += nameCJKcheck2[i].length * 16;}
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
					let dialogueOffset = 6;
					while (dialogueOffset < 300 && (KDDialogueSlots[yboost + canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/1.5 - dialogueOffset])) {
						dialogueOffset += 18;
					}
					KDDialogueSlots[yboost + canvasOffsetY + (yy - CamY - CamYoffset)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/1.5 - dialogueOffset] = true;

					let dialougelenth = 30;
					if (CJKcheck(enemy.dialogue,2)){
						DrawTextFitKDTo(kdenemydialoguecanvas, enemy.dialogue,
							canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2,
							yboost + canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - dialogueOffset, 120 + enemy.dialogue.length * 8, enemy.dialogueColor, "#000000", 18, undefined, 30);
					} else {
						let dialougeCJKcheck1 = CJKcheck(enemy.dialogue,1);
						let dialougeCJKcheck2 = CJKcheck(enemy.dialogue);

						if (dialougeCJKcheck1  &&  typeof (dialougeCJKcheck1) != 'boolean'){
							for (const i in dialougeCJKcheck1){dialougelenth += dialougeCJKcheck1[i].length * 8;}
						}
						if (dialougeCJKcheck2  &&  typeof (dialougeCJKcheck2) != 'boolean'){
							for (const i in dialougeCJKcheck2){dialougelenth += dialougeCJKcheck2[i].length * 16;}
						}
						DrawTextFitKDTo(kdenemystatusboard, enemy.dialogue,
							canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2,
							yboost + canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/1.5 - dialogueOffset, dialougelenth, enemy.dialogueColor, "#000000", 18, undefined, 30);
					}
				}
			}
		}
	}
}

let KDDialogueSlots = {};

/**
 * @param enemy
 */
function KDEnemyName(enemy: entity): string {
	return enemy.CustomName || KDGetName(enemy.id) || TextGet("Name" + enemy.Enemy?.name);
}
/**
 * @param enemy
 */
function KDEnemyNameColor(enemy: entity): string {
	return enemy.CustomNameColor || KDGetNameColor(enemy.id);
}

function KDGetName(id: number): string {
	return KDGameData.Collection[id + ""]?.name || (KDIsNPCPersistent(id) ? KDGetPersistentNPC(id).Name : "");
}
function KDGetNameColor(id: number): string {
	return KDGameData.Collection[id + ""]?.color || "#ffffff";
}

/**
 * Resyncs the boundlevel so it matches en.specialBoundLevel
 * Or else sets it to 0
 * @param en
 */
function KDResyncBondage(en: entity) {
	if (en.specialBoundLevel) {
		en.boundLevel = 0;
		for (let value of Object.values(en.specialBoundLevel)) {
			en.boundLevel += value;
		}
		if (en.boundLevel == 0) {
			en.specialBoundLevel = undefined;
		}
	} else if (en.boundLevel) {
		en.boundLevel = 0;
	}
}

/**
 * Sets the bondage of an enemy to be the expected amount
 * @param en
 * @param mode -1 is downgrade only, +1 is upgrade only
 */
function KDSetToExpectedBondage(en: entity, mode: number = 0) {
	let expected = KDGetExpectedBondageAmount(en.id,en);
	let expectedSum = 0;
	if (expected) for (let value of Object.values(expected)) {
		expectedSum += value;
	}
	if (mode == 0) {
		if (expectedSum > 0) {
			en.boundLevel = expectedSum;
			en.specialBoundLevel = JSON.parse(JSON.stringify(expected));
		} else {
			en.boundLevel = 0;
			en.specialBoundLevel = undefined;
		}
	} else if (mode > 0) {
		if (expectedSum > (en.boundLevel || 0)) {
			KDResyncBondage(en);
			if (!en.specialBoundLevel) en.specialBoundLevel = {};
			for (let entry of Object.entries(expected)) {
				en.specialBoundLevel[entry[0]] = Math.max(en.specialBoundLevel[entry[0]] || 0, entry[1]);
			}
			KDResyncBondage(en);
		}
	} else if (mode < 0) {
		if (expectedSum > 0 && expectedSum < (en.boundLevel || 0)) {
			KDResyncBondage(en);
			if (!en.specialBoundLevel) en.specialBoundLevel = {};
			for (let entry of Object.entries(expected)) {
				en.specialBoundLevel[entry[0]] = Math.min(en.specialBoundLevel[entry[0]] || 0, entry[1] || 0);
			}
			KDResyncBondage(en);
		} else if (expectedSum == 0) {
			en.boundLevel = 0;
			en.specialBoundLevel = undefined;
		}
	}
}

/**
 * @param en
 */
function KDFreeNPC(en: entity) {
	if (en.specialdialogue && KDEnemyHasFlag(en, "imprisoned")) {
		en.specialdialogue = undefined;
	}
	KinkyDungeonSetEnemyFlag(en, "imprisoned", 0);
	if (!KDGameData.NPCRestraints) KDGameData.NPCRestraints = {};
	else if (KDGameData.NPCRestraints["" + en.id]?.Device) {
		KDSetNPCRestraint(en.id, "Device", undefined);
	}
	if (KDGameData.Collection[en.id + ""] && KDIsNPCPersistent(en.id)) {
		KDGetPersistentNPC(en.id).collect = true; // Collect them)
	}
	if (en.hp < 0.52) en.hp = 0.52;
	KDSetToExpectedBondage(en, 0);
	KDUpdatePersistentNPC(en.id);
}

/**
 * @param id
 */
function KDFreeNPCID(id: number) {
	let en = KDGetGlobalEntity(id);
	KDFreeNPC(en);
}

let KDDrewEnemyTooltip = "";
let KDDrewEnemyTooltipThisFrame = "";

let KDCurrentEnemyTooltip: entity = null;

/**
 * @param enemy
 * @param offset
 */
function KDDrawEnemyTooltip(enemy: entity, offset: number): number {
	let analyze = KDGameData.Collection[enemy.id + ""] || KinkyDungeonFlags.get("AdvTooltips") || KDHasSpell("ApprenticeKnowledge");
	// Previously this was dependent on using a spell called Analyze. Now it is enabled by default if you have Knowledge
	let TooltipList = [];
	if (KDEnemyName(enemy))
		TooltipList.push({
			str: KDEnemyName(enemy),
			fg: KDEnemyNameColor(enemy),
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

	KDCurrentEnemyTooltip = enemy;

	KDQuickGenNPC(enemy, enemy.CustomName != undefined || !!enemy.Enemy?.outfit);

	if (KDNPCChar.get(enemy.id)) {
		if (KDDrewEnemyTooltip && KDDrewEnemyTooltip != "" + enemy.id) {
			KDDrewEnemyTooltip = "";
		}
		KDDrewEnemyTooltipThisFrame = "" + enemy.id;
		TooltipList.push({
			str: "",
			fg: "#ffffff",
			bg: "#000000",
			size: 144,
			center: true,
			npcSprite: KDNPCChar.get(enemy.id),
			id: enemy.id,
		});
	}

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

	if (KDIsDistracted(enemy)) statuses.push({name: "Distracted", count: undefined});
	if (enemy.vulnerable > 0) statuses.push({name: "Vulnerable", count: undefined});
	if (KDIsFlying(enemy)) statuses.push({name: "Flying", count: undefined});
	if (KDEntityBuffedStat(enemy, "Vibration")) statuses.push({name: "Vibed", count: undefined});
	if (enemy.stun > 0) statuses.push({name: "Stunned", count:  Math.round(enemy.stun)});
	if (enemy.bind > 0) statuses.push({name: "Bind", count:  Math.round(enemy.bind)});
	if (enemy.silence > 0) statuses.push({name: "Silence", count:  Math.round(enemy.silence)});
	if (enemy.disarm > 0) statuses.push({name: "Disarm", count:  Math.round(enemy.disarm)});
	if (enemy.blind > 0) statuses.push({name: "Blind", count:  Math.round(enemy.blind)});
	if (enemy.slow > 0 || KDEntityBuffedStat(enemy, "MoveSpeed") < 0) statuses.push({name: "Slow", count:  Math.round(enemy.slow)});
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
	if (!enemy.Enemy.tags?.nobrain && !enemy.Enemy.tags?.scenery && KDIsHumanoid(enemy)) {
		let opinion = Math.max(-3, Math.min(3, Math.round(KDGetModifiedOpinion(enemy)/KDOpinionThreshold)));
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
	let block_phys = (enemy.Enemy.Resistance?.block_phys || 0) + KinkyDungeonGetBuffedStat(enemy.buffs, "BlockPhys");
	let block_magic = (enemy.Enemy.Resistance?.block_magic || 0) + KinkyDungeonGetBuffedStat(enemy.buffs, "BlockMagic");
	//let evasion = KinkyDungeonMultiplicativeStat(enemy.Enemy.evasion)
	//* KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(enemy.buffs, "Evasion"));

	if (block_phys) {
		let st = TextGet("KinkyDungeonTooltipBlockPhys").replace("AMOUNT", "" + Math.round(10* block_phys)
		);
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: KDTextGray0,
			size: 20,
		});
	}
	if (block_magic) {
		let st = TextGet("KinkyDungeonTooltipBlockMagic").replace("AMOUNT", "" + Math.round(10* block_magic)
		);
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: KDTextGray0,
			size: 20,
		});
	}
	if (armor) {
		let st = TextGet("KinkyDungeonTooltipArmor").replace("AMOUNT", "" + Math.round(10* armor) + (block_phys ? `(+${Math.round(10* block_phys)})` : "")
			+ (armorBreak ? ` - ${Math.round(10* armorBreak)}` : ""));
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: KDTextGray0,
			size: 20,
		});
	}
	if (spellResist) {
		let st = TextGet("KinkyDungeonTooltipSpellResist").replace("AMOUNT", "" + Math.round(10* spellResist) + (block_magic ? `(+${Math.round(10* block_magic)})` : "")
			+ (spellResistBreak ? ` - ${Math.round(10* spellResistBreak)}` : ""));
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: KDTextGray0,
			size: 20,
		});
	}
	/*if (evasion != 1.0) {
		let st = TextGet("KinkyDungeonTooltipEvasion").replace("AMOUNT", "" + Math.round(100 - 100 * evasion));
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: KDTextGray0,
			size: 20,
		});
	}*/
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
	} else if (enemy.Enemy.tags.relentless) {
		let st = TextGet("KDrelentless");
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: "#000000",
			size: 20,
		});
	}
	if (KDEntityBlocksExp(enemy)) {
		let st = TextGet("KDBulwark");
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: "#000000",
			size: 20,
		});
	}
	if (KDAbsoluteArmor(enemy)) {
		let st = TextGet("KDAbsoluteArmor");
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: "#000000",
			size: 20,
		});
	} else if (KDToughArmor(enemy)) {
		let st = TextGet("KDToughArmor");
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: "#000000",
			size: 20,
		});
	}
	if (KinkyDungeonGetBuffedStat(enemy.buffs, "StunResist")) {
		let st = TextGet("KDStunResist");
		TooltipList.push({
			str: st,
			fg: "#ffffff",
			bg: "#000000",
			size: 20,
		});
	}

	let accuracy = KDEnemyAccuracy(enemy, KDPlayer());
	if (accuracy < 1) {
		let st = TextGet("KinkyDungeonTooltipDealsAccuracy").replace(
			"AMNT", "" + Math.round(100 * (accuracy))
		);
		TooltipList.push({
			str: st,
			fg: "#e64539",
			bg: "#000000",
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
	}

	if (KDGameData.NPCRestraints[enemy.id]) {
		let renderedID = {};
		let items = Object.values(KDGameData.NPCRestraints[enemy.id]).filter((item) => {
			let ret = !renderedID[item.id];
			renderedID[item.id] = true;
			return ret;
		});
		if (items.length > 0) {
			TooltipList.push({
				str: "",
				fg: "#ffaa55",
				bg: "#000000",
				size: 8,
			});
			TooltipList.push({
				str: TextGet("KDTooltipInventoryWorn"),
				fg: "#ffffff",
				bg: "#000000",
				size: 20,
			});

			for (let i = 0; i < 6 && i < items.length; i++) {
				TooltipList.push({
					str: TextGet(KDGetItemName(items[i], Restraint)),
					fg: "#ffffff",
					bg: "#000000",
					size: 18,
				});
			}
			if (items.length > 6) {
				TooltipList.push({
					str: TextGet("KDTooltipInventoryFull").replace("NUMBER", "" + (items.length - 6)),
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
				str: KDGetItemNameString(enemy.items[i]),
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
		let repeats = {};	// Record<string, boolean>?
		//for (let t of list) {
		let t = list;
		for (let dt of Object.values(KinkyDungeonDamageTypes)) {
			if ((t.includes(dt.name + "resist") || t.includes(dt.name + "weakness") || t.includes(dt.name + "immune") || t.includes(dt.name + "severeweakness"))
				|| (dt.name == "magic" && t.includes("magic"))) {
				let mult = 1.0;
				if (t.includes(dt.name + "resist")) mult = 0.5;
				else if (t.includes(dt.name + "weakness")) mult = 1.5;
				else if (t.includes(dt.name + "immune")) mult = 0;
				else if (t.includes(dt.name + "severeweakness")) mult = 2.0;
				if (dt.name == "magic" && !magic) {
					magic = true;
				}
				let st = TextGet("KinkyDungeonTooltipWeakness")
					.replace("MULTIPLIER", "" + Math.round(mult * 100)/100)
					.replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType"+ dt.name));
				let name = TextGet("KinkyDungeonDamageType"+ dt.name);

				if (!repeats['DR']) {
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
					repeats['DR'] = true;
				}
				if (!repeats[name])
					TooltipList.push({
						str: st,
						fg: dt.color,
						bg: dt.bg,
						size: 18,
					});
				repeats[name] = true;
			}
		}
		//}
	}
	return KDDrawTooltip(TooltipList, offset);
}



/**
 * @param enemy
 * @param offset
 */
function KDDrawEnemyDialogue(enemy: entity, offset: number): number {
	// Previously this was dependent on using a spell called Analyze. Now it is enabled by default if you have Knowledge
	let TooltipList = [];
	if (KDEnemyName(enemy))
		TooltipList.push({
			str: KDEnemyName(enemy),
			fg: KDEnemyNameColor(enemy),
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

	KDCurrentEnemyTooltip = enemy;

	KDQuickGenNPC(enemy, true);

	if (KDNPCChar.get(enemy.id)) {
		if (KDDrewEnemyTooltip && KDDrewEnemyTooltip != "d" + enemy.id) {
			KDDrewEnemyTooltip = "";
		}
		KDDrewEnemyTooltipThisFrame = "d" + enemy.id;
		TooltipList.push({
			str: "",
			fg: "#ffffff",
			bg: "#000000",
			size: 500,
			center: true,
			npcSprite: KDNPCChar.get(enemy.id),
			id: enemy.id,
		});
	}

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

	return KDDrawTooltip(TooltipList, offset);
}

function KDGetColor(enemy: entity): string {
	//return "#ffffff";
	if (enemy?.CustomNameColor) return enemy.CustomNameColor;
	if (enemy?.['color']) return enemy['color'];
	if (enemy?.Enemy.color) return enemy.Enemy.color;
	return "#ffffff";
}

let KDChampionMax = 10;

/**
 * @param enemy
 * @returns Whether or not it was a Champion capture
 */
function KinkyDungeonCapture(enemy: entity): boolean {
	let msg = "KinkyDungeonCapture";
	//let goddessCapture = false;
	msg = "KinkyDungeonCaptureBasic";
	KDDropStolenItems(enemy);
	KinkyDungeonSetEnemyFlag(enemy, "questtarget", 0);
	if (KDIsImprisoned(enemy)) KDFreeNPC(enemy);
	if (KDIsNPCPersistent(enemy.id)) {
		KDGetPersistentNPC(enemy.id).collect = true;
		KDGetPersistentNPC(enemy.id).captured = false;
		KDUpdatePersistentNPC(enemy.id);
	}
	KinkyDungeonSendEvent("afterCapture", {enemy: enemy});
	KinkyDungeonSendActionMessage(10,
		TextGet(msg).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)).replace("GODDESS", TextGet("KinkyDungeonShrine" + KDGameData.Champion)),
		"lightgreen", 2, false, false, undefined, "Kills");
	return false;
}

/**
 * @param enemy
 */
function KDDropStolenItems(enemy: entity) {
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
 * @param enemy
 * @param E
 */
function KinkyDungeonEnemyCheckHP(enemy: entity, E: number): boolean {
	if (enemy.hp <= 0 && !KDIsImprisoned(enemy)) {
		let noRepHit = false;
		KinkyDungeonSendEvent("death", {enemy: enemy});
		if (((KDBoundEffects(enemy) > 3 && enemy.boundLevel > 0) || KDEntityHasFlag(enemy, "cap")) && KDHostile(enemy) && !enemy.Enemy.tags.nocapture && enemy.playerdmg) {
			KDDropStolenItems(enemy);
			if (!KinkyDungeonCapture(enemy)) noRepHit = true;
		} else {
			KDDropStolenItems(enemy);
			if (enemy == KinkyDungeonKilledEnemy) {
				if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 10)
					KinkyDungeonSendActionMessage(9, TextGet("Kill"+enemy.Enemy.name), "orange", 2, false, false, undefined, "Kills");
				KinkyDungeonKilledEnemy = null;
			}
		}


		if (!(enemy.lifetime < 9000)) {
			if (enemy.playerdmg) {
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
				let amount = KDGetEnemyRep(enemy);


				if (amount && !noRepHit && !enemy.Enemy.Reputation?.noRepLoss) {
					KinkyDungeonChangeFactionRep(faction, -amount);

					// For being near a faction
					let boostfactions = [];
					let hurtfactions = [];
					for (let e of KDMapData.Entities) {
						let dist = KDistChebyshev(e.x - enemy.x, e.y - enemy.y);
						if (dist < 10) {
							let faction2 = KDGetFaction(e);
							if (!KinkyDungeonHiddenFactions.has(faction2)) {
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


		KinkyDungeonSendEvent("kill", {enemy: enemy, capture: KDBoundEffects(enemy) > 3 && enemy.boundLevel > 0 && KDHostile(enemy) && !enemy.Enemy.tags.nocapture});

		if (!enemy.droppedItems)
			KDDropItems(enemy);


		KDRemoveEntity(enemy, true, true, false, E);
		return true;
	} else if (KDHelpless(enemy) && !KDIsImprisoned(enemy)) {
		KDDropStolenItems(enemy);
		if (!enemy.droppedItems)
			KDDropItems(enemy);
	}
	return false;
}

/**
 * @param enemy
 */
function KDDropItems(enemy: entity) {
	if (!enemy.noDrop && (enemy.playerdmg || !enemy.summoned) && !enemy.droppedItems) {
		KinkyDungeonItemDrop(enemy.x, enemy.y, enemy.Enemy.dropTable, enemy.summoned);
		enemy.droppedItems = true;
		let dropped = null;
		if (enemy.data && enemy.data.shop && KDShops[enemy.data.shop] && KDShops[enemy.data.shop].itemsdrop) {
			for (let i of KDShops[enemy.data.shop].itemsdrop) {
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
 * @param Enemy
 * @returns - If the NPC is eligible to use favors
 */
function KDFavorNPC(Enemy: entity): boolean {
	// Only enemies which are not temporarily allied, or summoned by you, or specifically allied (like angels), are eligible to show up in dialogue
	return Enemy && !Enemy.allied && !Enemy.Enemy.allied;
}

/**
 * @param Enemy
 * @returns - Gets the favor with the enemy
 */
function KDGetFavor(Enemy: entity): number {
	if (KDGameData.Favors)
		return KDGameData.Favors[KDGetFactionOriginal(Enemy)] ? KDGameData.Favors[KDGetFactionOriginal(Enemy)] : 0;
	return 0;
}

/**
 * @param Enemy
 * @param Amount
 */
function KDChangeFavor(Enemy: entity, Amount: number) {
	KDModFavor(KDGetFactionOriginal(Enemy), Amount);
}

function KDAddFavor(Faction: string, Amount: number) {
	KDModFavor(Faction, Math.abs(Amount));
}

function KDModFavor(Faction: string, Amount: number) {
	if (!KDGameData.Favors) KDGameData.Favors = {};
	if (!KDGameData.Favors[Faction]) KDGameData.Favors[Faction] = 0;
	KDGameData.Favors[Faction] = Math.max(KDGameData.Favors[Faction] + Amount, 0);
}

function KinkyDungeonCheckLOS(enemy: entity, player: any, distance: number, maxdistance: number, allowBlind: boolean, allowBars: boolean, maxFails?: number): boolean {
	let bs = (enemy && enemy.Enemy && enemy.Enemy.blindSight) ? enemy.Enemy.blindSight : 0;
	if (KinkyDungeonStatsChoice.get("KillSquad")) bs += 3.5;
	if (player.player && enemy.Enemy && (enemy.Enemy.playerBlindSight || KDAllied(enemy))) bs = enemy.Enemy.playerBlindSight;
	return distance <= maxdistance && ((allowBlind && bs >= distance) || KinkyDungeonCheckPath(enemy.x, enemy.y, player.x, player.y, allowBars, false, maxFails));
}

function KinkyDungeonTrackSneak(enemy: entity, delta: number, player: any, darkmult?: number): number {
	if (!enemy.vp) enemy.vp = 0;
	if (!player.player) return 1;

	let data = {
		sneakThreshold: enemy.Enemy.sneakThreshold ? enemy.Enemy.sneakThreshold : 2,
		deltaMult: 0.7/Math.max(1, (1 + KinkyDungeonSubmissiveMult))*(enemy.Enemy.Awareness?.senseSpeed || 1),
		visibility: 1.0,
		darkmult: darkmult * (KinkyDungeonStatsChoice.get("Stalker") ? 2.5: 1.25),
		enemy: enemy,
		delta: delta,
		player: player,
	};
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak")) data.sneakThreshold = Math.max(0.51, data.sneakThreshold + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak"));

	if (KDGameData.Outfit) {
		let outfit = KinkyDungeonGetOutfit(KDGameData.Outfit);
		if (outfit && outfit.visibility)
			data.visibility *= outfit.visibility;
	}

	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowDetection")) data.visibility *= KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowDetection"));

	if (KinkyDungeonStatsChoice.get("Conspicuous")) data.visibility *= KDConspicuousMult;
	else if (KinkyDungeonStatsChoice.get("Stealthy")) data.visibility *= KDStealthyMult;

	KinkyDungeonSendEvent('calcSneak', data);

	if (data.darkmult) {
		data.deltaMult *= KDPlayerLight/(data.darkmult + KDPlayerLight);
	}
	enemy.vp = Math.min(data.sneakThreshold * 2, enemy.vp + delta*data.deltaMult*data.visibility);
	return (enemy.vp/data.sneakThreshold);
}

function KinkyDungeonMultiplicativeStat(Stat: number): number {
	if (Stat > 0) {
		return 1 / (1 + Stat);
	}
	if (Stat < 0) {
		return 1 - Stat;
	}

	return 1;
}
function KDBlockDodgeStat(Stat: number): number {
	if (Stat > 0) {
		return 1 / (1 + Stat);
	}
	if (Stat < 0) {
		return 1 / (1 - Stat);
	}

	return 1;
}

/**
 *
 * @param x
 * @param y
 * @param dist
 * @param [hostileEnemy] - Select enemies hostile to this one
 * @param [cheb] - use chebyshev distance
 * @param [nonhostileEnemy] - Select enemies not hostile to this one
 */
function KDNearbyEnemies(x: number, y: number, dist: number, hostileEnemy?: entity, cheb?: boolean, nonhostileEnemy?: entity): entity[] {
	let cache = KDGetEnemyCache();
	let list = [];
	if (!cache) {
		if (cheb) {
			for (let e of KDMapData.Entities) {
				if (KDistChebyshev(x - e.x, y - e.y) <= dist && (!hostileEnemy || KDHostile(e, hostileEnemy)) && (!nonhostileEnemy || !KDHostile(e, hostileEnemy))) list.push(e);
			}
		} else {
			for (let e of KDMapData.Entities) {
				if (KDistEuclidean(x - e.x, y - e.y) <= dist && (!hostileEnemy || KDHostile(e, hostileEnemy)) && (!nonhostileEnemy || !KDHostile(e, hostileEnemy))) list.push(e);
			}
		}

	} else {
		let e = null;
		if (cheb) {
			for (let X = Math.floor(x - dist); X < Math.ceil(x + dist); X++)
				for (let Y = Math.floor(y - dist); Y < Math.ceil(y + dist); Y++)
					if (KDistChebyshev(X - x, Y - y) <= dist) {
						e = cache.get(X + "," + Y);
						if (e && (!hostileEnemy || KDHostile(e, hostileEnemy))) list.push(e);
					}
		} else {
			for (let X = Math.floor(x - dist); X < Math.ceil(x + dist); X++)
				for (let Y = Math.floor(y - dist); Y < Math.ceil(y + dist); Y++)
					if (KDistEuclidean(X - x, Y - y) <= dist) {
						e = cache.get(X + "," + Y);
						if (e && (!hostileEnemy || KDHostile(e, hostileEnemy))) list.push(e);
					}
		}

	}
	return list;
}


/**
 * @param x
 * @param y
 * @param dist
 */
function KDNearbyTiles(x: number, y: number, dist: number): {x: number, y: number, tile: any}[] {
	let list = [];
	for (let X = Math.floor(x - dist); X < Math.ceil(x + dist); X++)
		for (let Y = Math.floor(y - dist); Y < Math.ceil(y + dist); Y++)
			if (KDistEuclidean(X - x, Y - y) <= dist) {
				if (KinkyDungeonTilesGet(X + ',' + Y)) list.push({x: X, y: Y, tile: KinkyDungeonTilesGet(X + ',' + Y)});
			}
	return list;
}


/**
 * @param x
 * @param y
 * @param dist
 */
function KDNearbyMapTiles(x: number, y: number, dist: number): {x: number, y: number, tile: any}[] {
	let list = [];
	for (let X = Math.floor(x - dist); X < Math.ceil(x + dist); X++)
		for (let Y = Math.floor(y - dist); Y < Math.ceil(y + dist); Y++)
			if (KDistEuclidean(X - x, Y - y) <= dist) {
				list.push({x: X, y: Y, tile: KinkyDungeonMapGet(X, Y)});
			}
	return list;
}

/**
 * @param x
 * @param y
 * @param dist
 * @param [neutralEnemy]
 */
function KDNearbyNeutrals(x: number, y: number, dist: number, neutralEnemy?: entity): entity[] {
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
 * @param avoidPlayer
 * @param [onlyPlayer]
 * @param [Enemy]
 * @param [playerDist]
 * @param [minDist]
 * @param [maxDist]
 */
function KinkyDungeonGetRandomEnemyPoint (
	avoidPlayer:  boolean,
	onlyPlayer?:  boolean,
	Enemy?:       entity,
	playerDist:   number =  6,
	minDist:      number =  6,
	ignoreOL:     boolean =  false,
	maxDist:      number =  100
): KDPoint
{
	return KinkyDungeonGetRandomEnemyPointCriteria(undefined, avoidPlayer, onlyPlayer, Enemy, playerDist, minDist, ignoreOL, maxDist);
}

/**
 * @param entity
 * @param ignoreID  - ignores any entity with this ID standing on a point
 * @param ignoreEntity - Ignores any entity standing on a point
 */
function KDGetNearestInterestingLabel (
	x:             number,
	y:             number,
	entity:        entity,
	ignoreID:      number,
	ignoreEntity:  boolean,
	typeFilter:    string = "",
	maxDist:       number = 1000,
	_navigable:    boolean = true
): KDLabel
{
	if (!KDMapData.Labels) return null;
	let filtered: KDLabel[] = [];
	if (typeFilter) {
		if (!KDMapData.Labels[typeFilter]) return null;
		for (let l of KDMapData.Labels[typeFilter]) {
			if (l.interesting &&
				KDPointWanderable(l.x, l.y) &&
				(l.faction && entity && l.faction == KDGetFaction(entity)) && (
				ignoreEntity
				|| (ignoreID && KinkyDungeonNoEnemyExceptID(l.x, l.y, true, ignoreID))
				|| (!ignoreID && KinkyDungeonNoEnemy(l.x, l.y, true))
			)) {
				filtered.push(l);
			}
		}
	} else {
		for (let t of Object.values(KDMapData.Labels)) {
			for (let l of t) {
				if (l.interesting &&
					KDPointWanderable(l.x, l.y) &&
					(l.faction && entity && l.faction == KDGetFaction(entity)) && (
					ignoreEntity
					|| (ignoreID && KinkyDungeonNoEnemyExceptID(l.x, l.y, true, ignoreID))
					|| (!ignoreID && KinkyDungeonNoEnemy(l.x, l.y, true))
				)) {
					filtered.push(l);
				}
			}
		}
	}

	let dist = maxDist;
	let label: KDLabel = null;
	let dd = dist;
	for (let l of filtered) {
		if (KDistChebyshev(l.x - x, l.y - y) > dist) continue;
		dd = KDistEuclidean(l.x - x, l.y - y);
		if (dd < dist) {
			dist = dd;
			label = l;
		}
	}
	return label;
}


/**
 * @param entity
 * @param ignoreID  - ignores any entity with this ID standing on a point
 * @param ignoreEntity - Ignores any entity standing on a point
 */
function KDGetNearestGuardLabel (
	x:             number,
	y:             number,
	entity:        entity,
	ignoreID:      number,
	ignoreEntity:  boolean,
	typeFilter:    string = "",
	maxDist:       number = 1000,
	_navigable:    boolean = true
): KDLabel
{
	if (!KDMapData.Labels) return null;
	let filtered: KDLabel[] = [];
	if (typeFilter) {
		if (!KDMapData.Labels[typeFilter]) return null;
		for (let l of KDMapData.Labels[typeFilter]) {
			if (l.guard &&
				KDPointWanderable(l.x, l.y) &&
				(l.faction && entity && l.faction == KDGetFaction(entity)) && (
				ignoreEntity
				|| (ignoreID && KinkyDungeonNoEnemyExceptID(l.x, l.y, true, ignoreID))
				|| (!ignoreID && KinkyDungeonNoEnemy(l.x, l.y, true))
			)) {
				filtered.push(l);
			}
		}
	} else {
		for (let t of Object.values(KDMapData.Labels)) {
			for (let l of t) {
				if (l.guard &&
					KDPointWanderable(l.x, l.y) &&
					(l.faction && entity && l.faction == KDGetFaction(entity)) && (
					ignoreEntity
					|| (ignoreID && KinkyDungeonNoEnemyExceptID(l.x, l.y, true, ignoreID))
					|| (!ignoreID && KinkyDungeonNoEnemy(l.x, l.y, true))
				)) {
					filtered.push(l);
				}
			}
		}
	}

	let dist = maxDist;
	let label: KDLabel = null;
	let dd = dist;
	for (let l of filtered) {
		if (KDistChebyshev(l.x - x, l.y - y) > dist) continue;
		dd = KDistEuclidean(l.x - x, l.y - y);
		if (dd < dist) {
			dist = dd;
			label = l;
		}
	}
	return label;
}

let RandomPathList = [];

/**
 * @param criteria
 * @param avoidPlayer
 * @param onlyPlayer
 * @param [Enemy]
 * @param [playerDist]
 * @param [minDist]
 * @param [maxDist]
 */
function KinkyDungeonGetRandomEnemyPointCriteria (
	criteria:     (x: number, y:number) => boolean,
	avoidPlayer:  boolean,
	onlyPlayer:   boolean,
	Enemy?:       entity,
	playerDist:   number = 6,
	minDist:      number = 6,
	ignoreOL:     boolean = false,
	maxDist:      number = 100
): KDPoint
{
	let tries = 0;
	let points = RandomPathList;

	while (tries < 100) {
		let point = points[Math.floor(points.length * KDRandom())];
		if (point) {
			let X = point.x;//1 + Math.floor(KDRandom()*(KDMapData.GridWidth - 1));
			let Y = point.y;//1 + Math.floor(KDRandom()*(KDMapData.GridHeight - 1));
			let PlayerEntity = KinkyDungeonNearestPlayer({x:X, y:Y});

			if (
				(!maxDist || !Enemy || KDistChebyshev(Enemy.x - X, Enemy.y - Y) < maxDist)
				&& ((!avoidPlayer || Math.sqrt((X - PlayerEntity.x) * (X - PlayerEntity.x) + (Y - PlayerEntity.y) * (Y - PlayerEntity.y)) > minDist)
				&& (!onlyPlayer || Math.sqrt((X - PlayerEntity.x) * (X - PlayerEntity.x) + (Y - PlayerEntity.y) * (Y - PlayerEntity.y)) <= playerDist))
				&& (!KinkyDungeonPointInCell(X, Y)) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y))
				&& (!Enemy || KinkyDungeonNoEnemyExceptSub(X, Y, true, Enemy))
				&& (ignoreOL || !KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OL || (Enemy && KinkyDungeonTilesGet(Enemy.x + "," + Enemy.x)?.Jail && KinkyDungeonTilesGet(X + "," + Y).Jail))
				&& (!criteria || criteria(X, Y))) {
				return {x: X, y:Y};
			}
		}
		tries += 1;
	}

	return undefined;
}

/**
 * @param x
 * @param y
 * @param [allowNearPlayer]
 * @param [Enemy]
 * @param [Adjacent]
 * @param [ignoreOL] allow using offlimits spaces
 * @param [callback]
 */
function KinkyDungeonGetNearbyPoint (
	x:                number,
	y:                number,
	allowNearPlayer:  boolean = false,
	Enemy?:           entity,
	Adjacent?:        boolean,
	ignoreOL?:        boolean,
	callback?:        (x: number, y: number) => boolean,
	allowOrigin?: 	  boolean,
	allowInsideEnemy?:boolean,
): KDPoint
{
	let slots = [];
	for (let X = -Math.ceil(1); X <= Math.ceil(1); X++)
		for (let Y = -Math.ceil(1); Y <= Math.ceil(1); Y++) {
			if ((X != 0 || Y != 0 || allowOrigin) && KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(x + X, y + Y))) {
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
		if (slot && (allowInsideEnemy || KinkyDungeonNoEnemyExceptSub(slot.x, slot.y, false, Enemy)) && (ignoreOL || KDPointWanderable(slot.x, slot.y))
			&& (allowNearPlayer || Math.max(Math.abs(KinkyDungeonPlayerEntity.x - slot.x), Math.abs(KinkyDungeonPlayerEntity.y - slot.y)) > 1.5)
			&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(slot.x, slot.y))
			&& (!callback || callback(slot.x, slot.y))) {
			foundslot = {x: slot.x, y: slot.y};

			C = 100;
		} else slots.splice(C, 1);
	}
	return foundslot;
}


/**
 * @param enemy
 * @param delta
 */
function KinkyDungeonTickFlagsEnemy(enemy: entity, delta: number) {
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
 * @param enemy
 */
function KinkyDungeonHasStatus(enemy: entity): boolean {
	return enemy &&
		(enemy.bind > 0
			|| enemy.slow > 0
			|| enemy.stun > 0
			|| enemy.freeze > 0
			|| enemy.silence > 0
			|| KinkyDungeonIsSlowed(enemy)
			|| KDBoundEffects(enemy) > 0);
}

/**
 * @param enemy
 */
function KinkyDungeonIsStunned(enemy: entity): boolean {
	return enemy && (enemy.stun > 0 || enemy.freeze > 0);
}

/**
 * @param enemy
 */
function KinkyDungeonIsDisabled(enemy: entity): boolean {
	return enemy && (KinkyDungeonIsStunned(enemy) || KDBoundEffects(enemy) > 3);
}


/**
 * @param enemy
 */
function KinkyDungeonIsSlowed(enemy: entity): boolean {
	return enemy && ((KDBoundEffects(enemy) > 0 && KDBoundEffects(enemy) < 4) || enemy.slow > 0 || enemy.bind > 0 || KinkyDungeonGetBuffedStat(enemy.buffs, "MoveSpeed") < 0);
}


/**
 * @param enemy
 */
function KinkyDungeonCanCastSpells(enemy: entity): boolean {
	return enemy && !(KinkyDungeonIsDisabled(enemy) || KDGetEnemyMiscast(enemy) >= 1.0);
}


interface KDMiscastEventData {
	enemy: entity,
	miscast: number,
	distractionbonus: number,
	silencebonus: number,
}

/**
 * @param enemy
 */
function KDGetEnemyMiscast(enemy: entity): number {
	if (enemy) {
		let data: KDMiscastEventData = {
			enemy: enemy,
			miscast: KDEntityBuffedStat(enemy, "Miscast"),
			distractionbonus: enemy.distraction > 0 ? enemy.distraction / enemy.Enemy.maxhp * 0.8 : 0,
			silencebonus: Math.max(0, Math.min((enemy.silence || 0) * 0.1)),
		};
		KinkyDungeonSendEvent("calcEnemyMiscast", data);
		data.miscast += data.distractionbonus;
		data.miscast += data.silencebonus;
		return data.miscast;
	}
	return 0;
}

/** Can the enemy be bound in principle */
function KDCanBind(enemy: entity): boolean {
	return (enemy?.Enemy?.bound != undefined);
}

function KDBoundEffects(enemy: entity): number {
	if (!enemy.Enemy.bound) return 0;
	if (KDIsImprisoned(enemy)) return 4;
	if (!enemy.boundLevel) return 0;
	let boundLevel = enemy.boundLevel ? enemy.boundLevel : 0;
	let bindAmp = 1;//KDGetBindAmp(enemy); //KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BindAmp"));
	boundLevel *= bindAmp;
	let mult = 1;
	if (enemy.Enemy.tags.unstoppable) mult = 3;
	else if (enemy.Enemy.tags.unflinching) mult = 2;
	if (boundLevel >= enemy.Enemy.maxhp * mult || (enemy.hp <= 0.1*enemy.Enemy.maxhp && Math.max(boundLevel, 0.1) > enemy.hp)) return 4; // Totally tied
	if (boundLevel > enemy.Enemy.maxhp*0.75 * mult) return 3;
	if (boundLevel > enemy.Enemy.maxhp*0.5 * mult) return 2;
	if (boundLevel > enemy.Enemy.maxhp*0.25 * mult) return 1;
	return 0;
}


function KinkyDungeonUpdateEnemies(maindelta: number, Allied: boolean) {
	KDGameData.tickAlertTimer = false;
	KDGameData.HostileFactions = [];
	let visionMod = 1.0;
	let defeat = false;

	let timeDelta = KinkyDungeonFlags.get('TimeSlowTick') ? 1 : maindelta;
	let enemyDelta = {};
	for (let entity of KDMapData.Entities) {
		if (KDIsTimeImmune(entity)) {
			enemyDelta[entity.id] = timeDelta;
			if (timeDelta > 0) {
				KinkyDungeonSetEnemyFlag(entity, "timereveal", 2 + KinkyDungeonFlags.get('TimeSlow'));
			}
		} else {
			enemyDelta[entity.id] = maindelta;
		}
	}

	if (KinkyDungeonLeashingEnemy() && !KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity, KinkyDungeonLeashingEnemy())) {
		KDGameData.KinkyDungeonLeashingEnemy = 0;
	}

	/*if (KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)]) {
		if (KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)].brightness) {
			visionMod = Math.min(1.0, Math.max(0.5, KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)].brightness / 8));
		}
	}*/

	if (Allied) {
		KinkyDungeonUpdateDialogue(KinkyDungeonPlayerEntity, maindelta);
		let KinkyDungeonSummons = 0;
		for (let i = KDMapData.Entities.length-1; i >= 0; i--) {
			let enemy = KDMapData.Entities[i];
			KinkyDungeonUpdateDialogue(enemy, enemyDelta[enemy.id] || maindelta);
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
				if (jaildoor && jaildoor.Type == "Door" && KDShouldUnLock(xx, yy, jaildoor)) {
					jaildoor.OGLock = jaildoor.Lock;
					jaildoor.Lock = undefined;
				}
			}

		}

	}

	KDGameData.DollCount = 0;

	let altType = KDGetAltType(MiniGameKinkyDungeonLevel);

	// Loop 1
	for (let enemy of KDMapData.Entities) {
		let delta = enemyDelta[enemy.id] || maindelta;
		if ((Allied && KDAllied(enemy)) || (!Allied && !KDAllied(enemy))) {

			let tile = KinkyDungeonTilesGet(enemy.x + "," + enemy.y);
			if (tile?.OL && (enemy.gxx != enemy.x || enemy.gyy != enemy.y)) {
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

				if (!enemy.aware && !enemy.ignore) KDEnemyAddSound(enemy, enemy.Enemy.Sound?.alertAmount != undefined ? enemy.Enemy.Sound?.alertAmount : KDDefaultEnemyAlertSound);

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
			if (enemy.castCooldownUnique) {
				for (let cd of Object.entries(enemy.castCooldownUnique)) {
					enemy.castCooldownUnique[cd[0]] = Math.max(0, cd[1]-delta);
					if (enemy.castCooldownUnique[cd[0]] <= 0)
						KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "castCooldownUnique", spell: cd[0]});
				}

			}

			let restraints = (KDGameData.NPCRestraints && KDGameData.NPCRestraints[enemy.id + ""])
				? Object.values(KDGameData.NPCRestraints[enemy.id + ""])
				: [];
			for (let item of restraints) {
				let status = KDRestraintBondageStatus(item);

				if (status.belt) {
					KinkyDungeonApplyBuffToEntity(enemy, KDChastity, {});
				}
				if (status.toy) {
					KinkyDungeonApplyBuffToEntity(enemy, KDToy, {});
				}
				if (status.plug) {
					KinkyDungeonApplyBuffToEntity(enemy, KDEntityBuffedStat(enemy, "Plug") > 0 ? KDDoublePlugged : KDPlugged, {});
				}
				if (status.blind) {
					enemy.blind = Math.max(enemy.blind || 0, status.blind);
				}
				if (status.silence) {
					enemy.silence = Math.max(enemy.silence || 0, status.silence);
				}
				if (status.bind) {
					enemy.bind = Math.max(enemy.bind || 0, status.bind);
				}
				if (status.slow) {
					enemy.slow = Math.max(enemy.slow || 0, status.slow);
				}
				if (status.disarm) {
					enemy.disarm = Math.max(enemy.disarm || 0, status.disarm);
				}
				if (status.reduceaccuracy) {
					KinkyDungeonApplyBuffToEntity(enemy,
						KDRestraintReduceAccuracy,
						{
							power: status.reduceaccuracy,
						},
					);
				}
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
			if (!(enemy.stun > 0 || enemy.freeze > 0 || enemy.teleporting > 0) && (enemy.hp > 0.52)) {
				KDEnemyStruggleTurn(enemy, delta, KDNPCStruggleThreshMult(enemy), false, false);
			}
			let vibe = KDEntityMaxBuffedStat(enemy, "Vibration");
			if (enemy.distraction > 0 || vibe) {
				let DD = KDGetEnemyDistractionDamage(enemy, vibe);
				if (DD > 0) {
					KinkyDungeonDamageEnemy(enemy, {
						damage: DD,
						type: "charm",
						nocrit: true,
						flags: ["BurningDamage"],
					}, true, true);
				}


				let DR = KDGetEnemyDistractRate(enemy, vibe);
				if (enemy.distraction > enemy.Enemy.maxhp) {
					enemy.distraction = enemy.Enemy.maxhp;
					KDAddThought(enemy.id, "Embarrassed", 10, 5);
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
				KDAddDistraction(enemy, -delta * DR, DR > 0 ? 0 : 0.5);


				if (enemy.distraction <= 0) {
					KDAddThought(enemy.id, "Annoyed", 5, 1);
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "boundLevel"});
				}
			}

			if (KDGetMaxShield(enemy) > 0 && KDGetShieldRegen(enemy) > 0) {
				if (!enemy.shield) enemy.shield = 0;
				let maxshield = KDGetMaxShield(enemy) - Math.max(KDEntityBuffedStat(enemy, "ShieldNoRegen"));
				if (enemy.shield < maxshield) enemy.shield = Math.max(enemy.shield, Math.min(enemy.shield + delta * KDGetShieldRegen(enemy), maxshield));
				// Regen shield
			}

			if (enemy.shield && KDEntityBuffedStat(enemy, "ShieldDrain") > 0) {
				if (enemy.shield>0) enemy.shield = Math.max(0, enemy.shield - delta * (KDEntityBuffedStat(enemy, "ShieldDrain") - Math.max(0, KDGetShieldRegen(enemy))));
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
			if (enemy.immobile > 0) {
				enemy.immobile -= delta;
				if (enemy.immobile <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "immobile"});
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
				if (enemy.dodges > 0) enemy.dodges = Math.max(0, enemy.dodges - delta * 1);
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
			}
			if (enemy.channel > 0) {
				enemy.warningTiles = [];
				if (enemy.channel > 0) enemy.channel -= delta;

				if (enemy.channel <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "channel"});
			}
			if (enemy.teleporting > 0) {
				enemy.warningTiles = [];
				if (enemy.teleporting > 0) enemy.teleporting -= delta;

				if (enemy.teleporting <= 0)
					KinkyDungeonSendEvent("enemyStatusEnd", {enemy: enemy, status: "teleporting"});
			}
			let maxblock = KDGetMaxBlock(enemy);
			let maxdodge = KDGetMaxDodge(enemy);
			if (enemy.vp > 0) {
				if (!enemy.blockedordodged && !KinkyDungeonIsDisabled(enemy)) {
					if (enemy.aware) {

						let blockRate = (enemy.Enemy.block || 0) + KDEntityBuffedStat(enemy, "Block") + KDEntityBuffedStat(enemy, "AttackSpeed");

						if (maxblock > 0 && blockRate > -9 && !(enemy.blocks >= maxblock)) {
							if (!enemy.blocks) enemy.blocks = 0;
							// Roll for a token
							let mult = KDBlockDodgeStat(blockRate);
							enemy.blocks += Math.min(1, KDRandom() * KDGetBaseBlock(enemy) / mult);
						}
						//Only raise guard in the right conditions

						let dodgeRate = (enemy.Enemy.evasion || 0) + KDEntityBuffedStat(enemy, "Dodge") + KDEntityBuffedStat(enemy, "MoveSpeed");

						if (maxdodge > 0 && dodgeRate > -9 && !(enemy.dodges >= maxdodge)) {
							if (!enemy.dodges) enemy.dodges = 0;
							// Roll for a token
							let mult = KDBlockDodgeStat(dodgeRate);
							enemy.dodges += Math.min(1, KDRandom() * KDGetBaseDodge(enemy) / mult);
						}
					}
				} else if (delta > 0 && enemy.blockedordodged) {
					enemy.blockedordodged -= delta;
					if (enemy.blockedordodged <= 0) delete enemy.blockedordodged;
				}
			} else if (!enemy.aware || enemy.ignore) {
				delete enemy.blockedordodged;
				delete enemy.dodges;
				delete enemy.blocks;
			}
			if (enemy.blocks > maxblock) enemy.blocks = Math.max(0, maxblock);
			if (enemy.dodges > maxdodge) enemy.dodges = Math.max(0, maxdodge);

		}
	}

	KDGameData.otherPlaying = 0;
	//let defeatEnemy = undefined;
	// Loop 2
	for (let E = 0; E < KDMapData.Entities.length; E++) {
		let enemy = KDMapData.Entities[E];
		let delta = enemyDelta[enemy.id] || maindelta;
		if ((Allied && KDAllied(enemy)) || (!Allied && !KDAllied(enemy))) {
			if (enemy.vulnerable > 0) enemy.vulnerable -= delta;
			else enemy.vulnerable = 0;
			if (enemy.Enemy.tags.nonvulnerable && enemy.vulnerable) enemy.vulnerable = 0;
			if (!(KDGameData.KinkyDungeonPenance && KinkyDungeonAngel()) || enemy == KinkyDungeonAngel()) {
				// Delete the enemy
				if (KinkyDungeonEnemyCheckHP(enemy, E)) { E -= 1; continue;}

				let player = (!KinkyDungeonAngel()) ? KinkyDungeonNearestPlayer(enemy, false, true, enemy.Enemy.visionRadius ? (KDEnemyVisionRadius(enemy) + ((enemy.lifetime > 0 && enemy.Enemy.visionSummoned) ? enemy.Enemy.visionSummoned : 0)) : 0, AIData) : KinkyDungeonPlayerEntity;
				if (player) {
					if (player.player) KinkyDungeonSetEnemyFlag(enemy, "targ_player", 1);
					else if (KDGetFaction(player) == "Player") KinkyDungeonSetEnemyFlag(enemy, "targ_ally", 1);
					else KinkyDungeonSetEnemyFlag(enemy, "targ_npc", 1);
					if (KinkyDungeonAggressive(enemy, player)) {
						KinkyDungeonSetEnemyFlag(enemy, "aggression", 1);
					}
				}


				if (enemy.Enemy.convertTiles) {
					let tile = KinkyDungeonMapGet(enemy.x, enemy.y);
					for (let c of enemy.Enemy.convertTiles) {
						if (c.from == tile && c.to) {
							KinkyDungeonMapSet(enemy.x, enemy.y, c.to);
						}
					}
				}

				KinkyDungeonHandleTilesEnemy(enemy, delta);

				if (enemy.Enemy.triggersTraps || KinkyDungeonIsStunned(enemy)) {
					KinkyDungeonHandleTraps(enemy, enemy.x, enemy.y, true);
				}

				let idle = true;
				//let bindLevel = KDBoundEffects(enemy);

				KinkyDungeonSendEvent("beforeEnemyLoop", {
					enemy: enemy,
					Wornitems: KDGameData.NPCRestraints[enemy.id] ?
						Object.values(KDGameData.NPCRestraints[enemy.id])
							.filter((rest) => {return rest.events})
							.map((rest) => {return rest.id;})
						: [],
					NPCRestraintEvents:
						KDGameData.NPCRestraints[enemy.id]
				});

				if (!(
					KinkyDungeonIsDisabled(enemy)
					|| KDHelpless(enemy)
					|| enemy.channel > 0
					|| enemy.teleporting > 0
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
						KDCustomDefeatEnemy = enemy;
						let fac = KDGetFaction(enemy);
						if (!KDFactionProperties[fac]) {
							fac = KDGetFactionOriginal(enemy);
						}
						if (KDFactionProperties[fac]?.customDefeat) {
							KDCustomDefeat = KDFactionProperties[fac]?.customDefeat;
						}
					} else {
						KDMaintainEnemyAction(enemy, delta);
					}

					//TODO pass items to more dominant nearby enemies
					if (enemy.items && !KDEnemyHasFlag(enemy, "shop")) {
						let light = KinkyDungeonVisionGet(enemy.x, enemy.y);
						if (light == 0 && !enemy.aware && KDRandom() < 0.2 && !KDIsImprisoned(enemy)) {
							//KDClearItems(enemy);
							if (!altType?.norestock)
								KDRestockRestraints(enemy, enemy.Enemy.RestraintFilter?.restockPercent || 0.5);
							if (enemy.hp < 0.5 * enemy.Enemy.maxhp) {
								// Todo unify heal
								enemy.hp = Math.min(enemy.Enemy.maxhp, enemy.hp + 0.1);
							}
						}
					}

					if (idle && enemy.hp > 0) {
						if (KDCanIdleFidget(enemy)) {
							let checkX = enemy.flip ? enemy.x - 3 : enemy.x + 3;
							if (KDRandom() < 0.1
								|| KinkyDungeonCheckPath(enemy.x, enemy.y, checkX, enemy.y, true, true, 1)) {
								enemy.flip = !enemy.flip;
								KinkyDungeonSetEnemyFlag(enemy, "fidget", 10);
							}
						}

						// Removed for non guards because its fun to find tied up girls around
						if (enemy == KinkyDungeonJailGuard())
							KDCaptureNearby(enemy);

						if (['s','S','H'].includes(KinkyDungeonMapGet(enemy.x, enemy.y)) && KDEnemyHasFlag(enemy, "despawn")) {
							KDClearItems(enemy);
							KDRemoveEntity(enemy, false, false, true);
						}

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
						&& !enemy.CurrentAction
						&& (!enemy.action || !KDEnemyAction[enemy.action]?.holdleash)
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

				if (enemy.movePoints == 0 && enemy.attackPoints == 0 && !(enemy.warningTiles?.length > 0) && !enemy.sprinted) {
					KDEnemyChangeSprint(enemy, -delta);
				}
				enemy.sprinted = false;

				KinkyDungeonHandleTilesEnemy(enemy, delta);

				if (enemy.vp > 0 && (!enemy.path || enemy.path.length < 4)) {
					let sneakThreshold = enemy.Enemy.sneakThreshold ? enemy.Enemy.sneakThreshold : 2;
					if (enemy.vp > sneakThreshold * 2 && !enemy.aware) {
						let sneak = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak");
						if (sneak > 0)
							enemy.vp = Math.max(sneakThreshold + 1, Math.max(Math.min(enemy.vp, sneakThreshold), enemy.vp * 0.7 - 0.1*delta));
					}
					if (!player?.player || KDistChebyshev(enemy.x - player.x, enemy.y - player.y) > 2.5) {
						enemy.vp = Math.max(0, enemy.vp - 0.04*delta);
					}

				}

				// Updates the NPC's persistence record if available
				// This does not MAKE the NPC persistent, only updates it if they are
				// We do, however, make
				KDUpdatePersistentNPC(enemy.id, KDGameData.Collection[enemy.id + ""] != undefined);

				// Delete the enemy
				if (KinkyDungeonEnemyCheckHP(enemy, E))
				{ E -= 1;}
				else if (KDGetFaction(enemy) != "Player") {
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
					} else if (
						!KinkyDungeonFindID(enemy.boundTo)
						|| KDHelpless(KinkyDungeonFindID(enemy.boundTo))
						|| (enemy.weakBinding
							&& KinkyDungeonIsDisabled(KinkyDungeonFindID(enemy.boundTo))))
						enemy.hp = 0;
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
					let opMod = KDOpinionRepMod(enemy, KDPlayer());
					for (let f of KDGameData.HostileFactions) {
						let f2 = KDGetFaction(enemy);
						if ((KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'parole')
							&& KDFactionRelation(f2, "Jail") > -0.05 && KDFactionRelation(f, "Jail") < 0) {
							continue;
						}
						if ((f2 != "Player") && (
							// Either the player has aggroed second faction for some reason or this faction is dishonorable
							KDGetHonor(f, f2) < 0
							|| !KDFactionHostile("Player", f2)
						)
							&& (
								(KDFactionRelation(f, f2) > 0.15 && KDFactionRelation(f, f2) < 0.5 && // Favored
									KDFactionRelation("Player", f2) + opMod < 0) // Angered + 0.1
								|| (KDFactionRelation(f, f2) >= 0.5 && // Allied
									KDFactionRelation("Player", f2) + opMod < 0.3) // Not thankful + 0.1
							)
						) {
							if (!(enemy.hostile > 0) &&
								(enemy.Enemy.tags.jail || enemy.Enemy.tags.jailer || KDGetEnemyPlayLine(enemy))) {
								let h = f == (KDGetFaction(enemy)) ? "Defend" : "Honor";
								let suff = KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) + h : h;
								let index = ("" + Math.floor(Math.random() * 3));

								if ((!enemy.dialogue || !enemy.dialogueDuration) && !enemy.playWithPlayer)
									KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailChase" + suff + index).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 7, (!KDGameData.PrisonerState) ? 3 : 5);
							}
							KDMakeHostile(enemy, KDMaxAlertTimerAggro * 0.5);
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
			if (KDGameData.AlertTimer < 3*KDMaxAlertTimer) KDGameData.AlertTimer += maindelta;
		} else if (KDGameData.AlertTimer > 0) {
			KDGameData.AlertTimer -= maindelta * 3;
		}
		if (KDGameData.AlertTimer >= KDMaxAlertTimer) {
			KinkyDungeonStartChase(undefined, "Alert");
		}

		if (KDMapData.PrisonType) {
			let prisonType = KDPrisonTypes[KDMapData.PrisonType];
			if (!KDMapData.PrisonState) KDMapData.PrisonState = prisonType.default_state;
			let prisonState = KDMapData.PrisonState;
			let newState = KDPrisonTypes[KDMapData.PrisonType]?.update ? KDPrisonTypes[KDMapData.PrisonType].update(timeDelta) : "";
			if (newState && newState != KDMapData.PrisonState) {
				if (prisonType.states[prisonState].finally) prisonType.states[prisonState].finally(timeDelta, newState, false);
				KDMapData.PrisonState = newState;
				KinkyDungeonSendEvent("postPrisonStateForce", {delta: timeDelta});
			}
			if (KDMapData.PrisonStateStack?.length > 0) {
				for (let s of KDMapData.PrisonStateStack) {
					if (prisonType.states[s].updateStack) prisonType.states[s].updateStack(timeDelta);
				}
				KinkyDungeonSendEvent("postPrisonUpdateStack", {delta: timeDelta});
			}
			if (prisonState) {
				newState = prisonType.states[prisonState].update(timeDelta);
				if (newState != KDMapData.PrisonState) {
					if (prisonType.states[prisonState].finally) prisonType.states[prisonState].finally(timeDelta, newState, false);
					KDMapData.PrisonState = newState;
					KinkyDungeonSendEvent("postPrisonStateChange", {delta: timeDelta});
				}
				KinkyDungeonSendEvent("postPrisonUpdate", {delta: timeDelta});
			}
		} else {
			KinkyDungeonHandleJailSpawns(maindelta);
			KinkyDungeonHandleWanderingSpawns(maindelta);
		}
		KinkyDungeonAlert = 0;
	}

	if (defeat) {
		if (KDCustomDefeat && KDCustomDefeats[KDCustomDefeat]) KDCustomDefeats[KDCustomDefeat](KDCustomDefeatEnemy);
		else if (!KinkyDungeonFlags.get("CustomDefeat"))
			KinkyDungeonDefeat(KinkyDungeonFlags.has("LeashToPrison"), KDCustomDefeatEnemy);
	}
	KDCustomDefeat = "";
	KDCustomDefeatEnemy = null;
}

let KDCustomDefeat: string = "";
let KDCustomDefeatEnemy: entity = null;

function KDMakeHostile(enemy: entity, timer?: number) {
	if (!timer) timer = KDMaxAlertTimerAggro;
	if (!enemy.hostile) enemy.hostile = timer;
	else enemy.hostile = Math.max(enemy.hostile, timer);

	delete enemy.ceasefire;
	delete enemy.allied;
}

/**
 * Makes an enemy vulnerable if you are behind them
 * @param enemy
 */
function KDCheckVulnerableBackstab(enemy: entity): boolean {
	if (KinkyDungeonAggressive(enemy) && enemy != KinkyDungeonLeashingEnemy()) {
		if (KDistChebyshev(enemy.fx - enemy.x, enemy.fy - enemy.y) < 1.5 && !enemy.Enemy.tags.noflank) {
			if (enemy.fx && enemy.fx) {
				if (enemy.x * 2 - enemy.fx == KinkyDungeonPlayerEntity.x && enemy.y * 2 - enemy.fy == KinkyDungeonPlayerEntity.y) {
					KDAddThought(enemy.id, "Annoyed", 4, 1);
					enemy.vulnerable = Math.max(enemy.vulnerable, 1);
					return true;
				}
			} else if (!enemy.fx && !enemy.fy) {
				let xmod = 0;
				if (!enemy.Enemy?.nonDirectional) {
					xmod = enemy.flip ? 1 : -1;
				}
				if (enemy.x + xmod == KinkyDungeonPlayerEntity.x && enemy.y == KinkyDungeonPlayerEntity.y) {
					KDAddThought(enemy.id, "Confused", 4, 1);
					enemy.vulnerable = Math.max(enemy.vulnerable, 1);
					return true;
				}
			}
		}
	}
	return false;
}

/**
 * @param enemy
 */
function KDGetAI(enemy: entity): string {
	if (enemy.AI) return enemy.AI;
	else return enemy.Enemy.AI;
}

let KDThoughtBubbles: Map<number, {name: string, priority: number, duration: number, index: number}> = new Map();

function KDAddThought(id: number, name: string, priority: number, duration: number) {
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

function KDGetEnemyPlayLine(enemy: entity): string {
	return enemy.playLine || enemy.Enemy.playLine || "";
}

/**
 * @param enemy
 */
function KDEnemyCanTalk(enemy: entity): boolean {
	return enemy?.Enemy && !enemy.Enemy.tags?.gagged && (enemy.Enemy.tags.jailer || enemy.Enemy.tags.jail || KDGetEnemyPlayLine(enemy)) && !(enemy.silence > 0);
}

let AIData: KDAIData = {};

/**
 * @param enemy
 * @param player
 * @param delta
 * @param visionMod
 * @param playerItems
 */
function KinkyDungeonEnemyLoop(enemy: entity, player: any, delta: number, visionMod: number, playerItems: item[]): {idle: boolean, defeat: boolean, defeatEnemy: entity} {
	AIData = {};

	if (!enemy.Enemy.maxhp) {
		enemy.Enemy = KinkyDungeonGetEnemyByName(enemy.Enemy.name);
	}



	//let allied = KDAllied(enemy);
	//let hostile = KDHostile(enemy);

	AIData.playerItems = playerItems;
	AIData.player = player;
	AIData.defeat = false;
	AIData.idle = true;
	AIData.moved = false;
	AIData.ignore = false;
	AIData.visionMod = visionMod;
	AIData.followRange = enemy.Enemy.followRange == 1 ? 1.5 : enemy.Enemy.followRange;
	AIData.visionRadius = enemy.Enemy.visionRadius ? (KDEnemyVisionRadius(enemy) + ((enemy.lifetime > 0 && enemy.Enemy.visionSummoned) ? enemy.Enemy.visionSummoned : 0)) : 0;
	AIData.visionRadius = Math.max(1.5, AIData.visionRadius + KinkyDungeonGetBuffedStat(enemy.buffs, "Vision"));
	let AIType = KDAIType[enemy.AI ? enemy.AI : enemy.Enemy.AI];
	if (AIData.visionMod && AIData.visionRadius > 1.5) AIData.visionRadius = Math.max(1.5, AIData.visionRadius * AIData.visionMod);
	AIData.chaseRadius = (enemy.Enemy.Awareness?.chaseradius != undefined) ? enemy.Enemy.Awareness.chaseradius
		: 10 + 1.5*(Math.max(AIData.followRange, 0)) + 1.5*Math.max(AIData.visionRadius ? AIData.visionRadius : 0, enemy.Enemy.blindSight ? enemy.Enemy.blindSight : 0);
	AIData.blindSight = (enemy && enemy.Enemy && enemy.Enemy.blindSight) ? enemy.Enemy.blindSight : 0;
	if (KinkyDungeonStatsChoice.get("KillSquad")) {
		AIData.visionRadius *= 1.2;
		AIData.chaseRadius *= 1.2;
		AIData.blindSight += 3.5;
		if (AIData.blindSight > AIData.visionRadius) {
			AIData.visionRadius = AIData.blindSight;
		}
		if (AIData.blindSight > AIData.chaseRadius) {
			AIData.chaseRadius = AIData.blindSight;
		}
	}
	AIData.ignoreLocks = enemy.Enemy.keys || enemy.keys || enemy == KinkyDungeonLeashingEnemy() || enemy == KinkyDungeonJailGuard() || (KDEnemyHasFlag(enemy, "keys"));
	AIData.harmless = (KinkyDungeonPlayerDamage.damage <= enemy.Enemy.armor || !KinkyDungeonHasWill(0.1))
		&& !KinkyDungeonFlags.has("PlayerCombat")
		&& !KinkyDungeonCanTalk()
		&& (!KinkyDungeonCanUseWeapon() || KinkyDungeonPlayerDamage?.unarmed)
		&& KinkyDungeonSlowLevel > 1;

	AIData.directionOffset = enemy.Enemy.nonDirectional ? 0 : (enemy.flip ? Math.max(1, AIData.visionRadius - 2) : -Math.max(1, AIData.visionRadius - 2));

	AIData.playerDist = KDistEuclidean(enemy.x - player.x, enemy.y - player.y);
	AIData.playerDistDirectional = KDistEuclidean(enemy.x + AIData.directionOffset - player.x, enemy.y - player.y);
	if (AIData.playerDistDirectional < AIData.playerDist && AIData.playerDist < Math.abs(AIData.directionOffset)) AIData.playerDistDirectional = 0; // Within AIData.directionOffset
	AIData.hostile = KDHostile(enemy, player);
	AIData.allied = KDAllied(enemy);
	AIData.aggressive = KinkyDungeonAggressive(enemy, player);
	AIData.domMe = (player.player && AIData.aggressive) ? false : KDCanDom(enemy);


	AIData.leashing = enemy.Enemy.tags.leashing && (KDFactionRelation(KDGetFaction(enemy), "Jail")) > -0.5;
	AIData.highdistraction = KDIsDistracted(enemy);
	AIData.distracted = AIData.highdistraction
		&& KDLoosePersonalities.includes(enemy.personality)
		&& AIData.playerDist > 2.5 && KDRandom() < (KDGetFaction(enemy) == "Player" ? 0.1 : 0.4);
	// Check if the enemy ignores the player
	if (player.player && (enemy.aware || enemy.vp > 0) && !KDAllied(enemy) && !KDEnemyHasFlag(enemy, "noignore")) {
		if (AIData.playerDist < 1.5 && KinkyDungeonAllRestraint().some((r) => {return KDRestraint(r).ignoreNear;})) AIData.ignore = true;
		if (!AIData.leashing && !KinkyDungeonHasWill(0.1) && KinkyDungeonAllRestraint().some((r) => {return KDRestraint(r).ignoreIfNotLeash;})) AIData.ignore = true;

		if (enemy != KinkyDungeonLeashingEnemy() && enemy != KinkyDungeonJailGuard() && (!KinkyDungeonFlags.has("PlayerCombat") || enemy.Enemy.tags.ignorebrat)) {
			if (enemy.Enemy.tags.ignorenoSP && !KinkyDungeonHasWill(0.1)) AIData.ignore = true;
			if (((enemy.Enemy.tags.ignoreharmless)) && (!enemy.warningTiles || enemy.warningTiles.length == 0)
				&& !(KDGameData.PrisonerState == 'chase' && KDFactionRelation(KDGetFaction(enemy), KDGetMainFaction()) > 0.09) // Dont ignore if the enemy is hunting the player for escape
				&& AIData.harmless && (!enemy.Enemy.ignorechance || KDRandom() < enemy.Enemy.ignorechance || !KinkyDungeonHasWill(0.1))) AIData.ignore = true;
			if (enemy.Enemy.tags.ignoretiedup && (!enemy.warningTiles || enemy.warningTiles.length == 0) && enemy.lifetime == undefined
				&& !KinkyDungeonCanUseWeapon() && !KinkyDungeonCanTalk() && KinkyDungeonSlowLevel > 1
				&& (!enemy.Enemy.ignorechance || KDRandom() < enemy.Enemy.ignorechance || !KinkyDungeonHasWill(0.1))) AIData.ignore = true;
			if (enemy.Enemy.tags.ignoregagged && (!enemy.warningTiles || enemy.warningTiles.length == 0) && enemy.lifetime == undefined
				&& !KinkyDungeonCanTalk()
				&& (!enemy.Enemy.ignorechance || KDRandom() < enemy.Enemy.ignorechance || !KinkyDungeonHasWill(0.1))) AIData.ignore = true;
			if (enemy.Enemy.tags.ignoreboundhands && (!enemy.warningTiles || enemy.warningTiles.length == 0) && enemy.lifetime == undefined
				&& (KinkyDungeonPlayerDamage.damage <= enemy.Enemy.armor || !KinkyDungeonHasWill(0.1)) && !KinkyDungeonCanUseWeapon()
				&& (!enemy.Enemy.ignorechance || KDRandom() < enemy.Enemy.ignorechance || !KinkyDungeonHasWill(0.1))) AIData.ignore = true;
		}
		if (enemy.Enemy.ignoreflag) {
			for (let f of enemy.Enemy.ignoreflag) {
				if (KinkyDungeonFlags.get(f) || KinkyDungeonPlayerTags.get(f)) AIData.ignore = true;
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
	if (player?.player && KinkyDungeonFlags.get("forceIgnore")) AIData.ignore = true;

	AIData.MovableTiles = KinkyDungeonMovableTilesEnemy;
	AIData.AvoidTiles = "" + KDDefaultAvoidTiles;
	if (enemy.Enemy.tags && enemy.Enemy.tags.opendoors) AIData.MovableTiles = KinkyDungeonMovableTilesSmartEnemy;
	else if (enemy == KinkyDungeonLeashingEnemy() || enemy == KinkyDungeonJailGuard()) AIData.MovableTiles = KinkyDungeonMovableTilesSmartEnemy;
	if (enemy.Enemy.ethereal) {
		AIData.AvoidTiles = "";
		AIData.MovableTiles = AIData.MovableTiles + "1X";
	} else if ((enemy.Enemy.squeeze || enemy.Enemy.earthmove) && KinkyDungeonLeashingEnemy()?.id != enemy.id) {
		AIData.MovableTiles = AIData.MovableTiles + (enemy.Enemy.earthmove ? '4' : '') + (enemy.Enemy.squeeze ? 'b' : '');
		AIData.AvoidTiles = "";
	}

	let attackPre = "";
	AIData.attack = enemy.Enemy.attack;
	AIData.range = (enemy.Enemy.attackRange == 1 ? 1.5 : enemy.Enemy.attackRange) + KinkyDungeonGetBuffedStat(enemy.buffs, "AttackRange");
	AIData.width = enemy.Enemy.attackWidth + KinkyDungeonGetBuffedStat(enemy.buffs, "AttackWidth");
	AIData.bindLevel = KDBoundEffects(enemy);
	AIData.accuracy = KDEnemyAccuracy(enemy, player);

	AIData.vibe = false;
	AIData.damage = enemy.Enemy.dmgType;
	AIData.power = enemy.Enemy.power + KinkyDungeonGetBuffedStat(enemy.buffs, "AttackPower");

	AIData.targetRestraintLevel = 0.25 + (enemy.aggro && !enemy.playWithPlayer ? enemy.aggro : 0) + 0.004 * Math.max(0, KDGetEffSecurityLevel(KDGetFaction(enemy) || KDGetFactionOriginal(enemy)) + 50);
	if (enemy.aggro > 0 && delta > 0 && enemy.aggro > enemy.hp / enemy.Enemy.maxhp) enemy.aggro = enemy.aggro * 0.95;
	if (KinkyDungeonStatsChoice.has("NoWayOut") || (enemy.playWithPlayer > 0 && !KinkyDungeonAggressive(enemy)) || enemy.hp < enemy.Enemy.maxhp * 0.5 || !KDIsHumanoid(enemy))
		AIData.targetRestraintLevel = Math.max(0.7, AIData.targetRestraintLevel);
	if (enemy.Enemy.Behavior?.thorough) AIData.targetRestraintLevel = Math.max(AIData.targetRestraintLevel, enemy.Enemy.Behavior?.thorough);
	AIData.addLeash = AIData.leashing && KDBoundPowerLevel >= AIData.targetRestraintLevel && (!KinkyDungeonPlayerTags.get("Collars") || !KinkyDungeonGetRestraintItem("ItemNeckRestraints"));
	if (!AIData.addLeash && AIData.leashing && enemy.IntentLeashPoint && (!KinkyDungeonPlayerTags.get("Collars") || !KinkyDungeonGetRestraintItem("ItemNeckRestraints"))) AIData.addLeash = true;

	if (player.player && enemy.Enemy.tags && AIData.leashing && (!KinkyDungeonHasWill(0.1) || AIData.addLeash) && enemy.aware) {
		AIData.followRange = 1.5;
		if (!AIData.attack.includes("Bind")) {
			attackPre = attackPre + "Bind";
			AIData.attack = attackPre + AIData.attack;
		}
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
	let specialCondition = enemy.Enemy.specialAttack != undefined && (!enemy.specialCD || enemy.specialCD <= 0) && (!enemy.Enemy.specialMinRange || AIData.playerDist > enemy.Enemy.specialMinRange);
	let specialConditionSpecial = (enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialCondition) ? KDSpecialConditions[enemy.Enemy.specialCondition].criteria(enemy, AIData) : true;

	let updateSpecial = () => {
		specialCondition = enemy.Enemy.specialAttack != undefined && (!enemy.specialCD || enemy.specialCD <= 0) && (!enemy.Enemy.specialMinRange || AIData.playerDist > enemy.Enemy.specialMinRange)
			&& (!enemy.Enemy.specialCharges || enemy.specialCharges > 0);
		specialConditionSpecial = (enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialCondition) ? KDSpecialConditions[enemy.Enemy.specialCondition].criteria(enemy, AIData) : specialCondition;

		AIData.hitsfx = (enemy.Enemy && enemy.Enemy.hitsfx) ? enemy.Enemy.hitsfx : "";
		AIData.attack = attackPre + enemy.Enemy.attack;
		AIData.range = (enemy.Enemy.attackRange == 1 ? 1.5 : enemy.Enemy.attackRange) + KinkyDungeonGetBuffedStat(enemy.buffs, "AttackRange");
		AIData.width = enemy.Enemy.attackWidth + KinkyDungeonGetBuffedStat(enemy.buffs, "AttackWidth");
		AIData.damage = enemy.Enemy.dmgType;
		AIData.power = enemy.Enemy.power + KinkyDungeonGetBuffedStat(enemy.buffs, "AttackPower");

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
			if (KDSpecialConditions[enemy.Enemy.specialCondition]?.resetCD) enemy.specialCD = enemy.Enemy.specialCD;
		}
	};
	updateSpecial();

	if (KDEnemyHasFlag(enemy, "nobind")) {
		AIData.addMoreRestraints = false;
	} else {
		AIData.addMoreRestraints = !AIData.leashing || (AIData.attack.includes("Bind")
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
	}


	if (!enemy.Enemy.attackWhileMoving && AIData.range > AIData.followRange) {
		AIData.followRange = AIData.range;
	}
	if (player.player && enemy.Enemy && enemy.Enemy.playerFollowRange) AIData.followRange = enemy.Enemy.playerFollowRange == 1.5 ? 1.5 : enemy.Enemy.playerFollowRange;

	if (!enemy.warningTiles) enemy.warningTiles = [];
	AIData.canSensePlayer = !AIData.distracted
		&& (KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.visionRadius, true, true)
		|| KDCanHearEnemy(enemy,player, 1.0));
	if (AIData.canSensePlayer && !AIData.distracted) {
		AIData.canSeePlayer = KinkyDungeonCheckLOS(enemy, player, AIData.playerDistDirectional, AIData.visionRadius, false, false);
		AIData.canSeePlayerChase = (enemy.aware ?
			AIData.canSensePlayer
			|| KDCanHearEnemy(enemy,player, 2.0) // Better hearing due to paying attention
			|| KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.chaseRadius, false, false)
			: AIData.canSensePlayer); // Reduced awareness
		AIData.canSeePlayerMedium = KinkyDungeonCheckLOS(enemy, player, AIData.playerDistDirectional, AIData.visionRadius/2, false, true);
		AIData.canSeePlayerClose = KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.visionRadius/2, false, true);
		AIData.canSeePlayerVeryClose = KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.visionRadius/3, false, true);
		AIData.canShootPlayer = KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.visionRadius, false, true);
	}

	if (!player.player && AIData.canShootPlayer && KDHostile(enemy, player)) {
		enemy.aware = true;
	}


	if (KinkyDungeonLastTurnAction && AIData.canSeePlayer) {
		if (!enemy.aggro) enemy.aggro = 0;
		enemy.aggro += KinkyDungeonLastTurnAction == "Struggle" ? 0.1 :
			(KinkyDungeonLastTurnAction == "Spell" ? 0.3 :
				(KinkyDungeonLastTurnAction == "Attack" ? 0.25 :
					0.01));
	}

	if ((enemy.Enemy.projectileAttack || enemy.Enemy.projectileTargeting) && (!AIData.canShootPlayer || !KinkyDungeonCheckProjectileClearance(enemy.x, enemy.y, player.x, player.y, !player.player))) AIData.followRange = 1.5;

	if (!AIData.aggressive && !enemy.Enemy.alwaysHostile && !(enemy.rage > 0) && AIData.canSeePlayer && player.player && !KDAllied(enemy)
		&& ((!KinkyDungeonFlags.has("nojailbreak") && !KinkyDungeonPlayerInCell(true, true)) || KinkyDungeonLastTurnAction == "Struggle" || KinkyDungeonLastAction == "Struggle")) {
		if (enemy.Enemy.tags.jailer || enemy.Enemy.tags.jail || enemy.Enemy.tags.leashing) {
			if (
				(!KinkyDungeonFlags.has("nojailbreak") && !KinkyDungeonPlayerInCell(true, true))
				&& (KDGameData.PrisonerState == 'jail' || (KDGameData.PrisonerState == 'parole' && KDPlayerIsRestricted(player, enemy))) // Restricted areas
				&& !KDIsPlayerTethered(KinkyDungeonPlayerEntity)
				&& KinkyDungeonSlowLevel < 9)
				KinkyDungeonAggroAction('jailbreak', {enemy: enemy, force: true});
			else if (KDGameData.PrisonerState == 'parole' && !KinkyDungeonIsArmsBound() && !KDEnemyHasFlag(enemy, "Shop"))
				KinkyDungeonAggroAction('unrestrained', {enemy: enemy});
			else if ((KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'jail') && (KinkyDungeonLastTurnAction == "Struggle" || KinkyDungeonLastAction == "Struggle"))
				KinkyDungeonAggroAction('struggle', {enemy: enemy});
		}
		AIData.ignore = !AIData.aggressive && (!enemy.playWithPlayer || !player.player);
	}

	let sneakThreshold = enemy.Enemy.sneakThreshold ? enemy.Enemy.sneakThreshold : 2;
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak")) sneakThreshold = Math.max(0.1, sneakThreshold + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak"));


	let aware = (enemy.vp > sneakThreshold || KDEnemyReallyAware(enemy, player));

	AIData.playAllowed = false;
	AIData.startedDialogue = false;
	AIData.playChance = 0.1;
	if (!enemy.personality) enemy.personality = KDGetPersonality(enemy);

	if (KDMapData.KeysHeld > 0) AIData.playChance += 0.25;
	if (AIData.playerDist < 1.5) AIData.playChance += 0.1;


	if (AIData.playerDist < AIData.visionRadius / 2) AIData.playChance += 0.1;
	if (AIData.playerDist < 1.5) AIData.playChance += 0.3;

	if (KDAllied(enemy) || (!AIData.hostile && KDGameData.PrisonerState != "jail" && KDGameData.PrisonerState != "parole" && !KinkyDungeonStatsChoice.has("Submissive"))) AIData.playChance *= 0.07; // Drastically reduced chance to play if not hostile
	else {
		if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed) {
			AIData.playChance += 0.25;
		}
		if (playerItems?.length > 0 || KinkyDungeonItemCount("RedKey") > 0) {
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

	AIData.playChance = KDCalcPlayChance(AIData.playChance, enemy);

	let playData = {
		playChance: AIData.playChance,
		AIData: AIData,
		enemy: enemy,
		player: player,
	};
	KinkyDungeonSendEvent("calcPlayChance", playData);
	AIData.playChance = playData.playChance;
	if (KinkyDungeonFlags.get("noPlay")) AIData.playChance = 0;
	AIData.canTalk = KDEnemyCanTalk(enemy);

	if (KDEnemyHasFlag(enemy, "forcePlay")) AIData.playChance = 1.0;

	if (KinkyDungeonCanPlay(enemy) && enemy != KinkyDungeonJailGuard() && !KinkyDungeonFlags.get("NPCCombat") && !enemy.Enemy.alwaysHostile
		&& !(enemy.rage > 0) && !(enemy.hostile > 0)
		&& player.player && AIData.canSeePlayer && (aware) && !KinkyDungeonInJail(KDJailFilters)) {
		AIData.playAllowed = true;

		if (KDEnemyHasFlag(enemy, "allyPlay")) AIData.ignoreNoAlly = true;
		if (!(enemy.playWithPlayerCD > 0) && !(enemy.playWithPlayer > 0) && KDRandom() < AIData.playChance && (!KDAllied(enemy) || AIData.ignoreNoAlly)) {
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

	AIData.canAggro = player && (((AIData.hostile && (AIData.aggressive || !KDEnemyHasFlag(enemy, "notouchie")))
		|| (player.player && enemy.playWithPlayer && !AIData.domMe && !KDEnemyHasFlag(enemy, "notouchie")))
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
					|| KinkyDungeonFlags
						.get("overrideleashprotection") // The player is leashed but something allows her to be attacked anyway
					|| ((AIData.addMoreRestraints
						|| (
							KDPlayer().x == (enemy.fx||0)
							&& KDPlayer().y == (enemy.fy||0)
						)
						|| (
							KDPlayer().x == enemy.gx
							&& KDPlayer().y == enemy.gy
						)
						|| enemy.attackPoints > 0
						|| KDEnemyHasFlag(enemy, "playerBlocking"))
						&& (
							KDIsPlayerTetheredToLocation(player, enemy.x, enemy.y, enemy) // The player is attached to this enemy
							|| enemy.id == KinkyDungeonLeashingEnemy()?.id // The player is being leashed by this enemy
						))
					|| (enemy.IntentLeashPoint && (
						KDistChebyshev(enemy.x- enemy.IntentLeashPoint.x, enemy.y- enemy.IntentLeashPoint.y) < 1.5
					))
					|| KinkyDungeonFlags.has("PlayerCombat") // If the player is fighting back
				// Basically the result of all this is that only the leashing enemy will attack a leashed player
				// Unless the player is resisting being leashed
				)
			)) ?
			// If we meet the above conditions, we still have to consult whether or not the intent action gates it
			// If we dont have an intent action, then we have the default gate
			((intentAction?.decideAttack) ?
				(intentAction.decideAttack(enemy, player, AIData, AIData.allied, AIData.hostile, AIData.aggressive))
				: KDGateAttack(enemy))
			// Otherwise if we dont meet the conditions we dont want to attack
			: false
	);
	AIData.wantsToTease = AIData.canAggro && (
		(player.player && enemy.playWithPlayer && !KinkyDungeonAggressive(enemy) && !AIData.domMe && !KDEnemyHasFlag(enemy, "notouchie"))
		&& (!player.player // NPCs will aggro NPCs no questions asked
			|| ( // However there are situations where the player will not get attacked
				!AIData.ignore // For example if the player is ignored
				&& ( // In order to be attacked the player must fulfill one of these conditions
					( // The most common is that the player is not currently leashed
						!KDGameData.KinkyDungeonLeashedPlayer
						|| !KDIsPlayerTethered(player))
					|| KinkyDungeonFlags
						.get("overrideleashprotection") // The player is leashed but something allows her to be attacked anyway
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


	AIData.sneakMult = 0.05;

	if (AIData.canSeePlayer) AIData.sneakMult += 0.15;
	if (AIData.canSeePlayerMedium) AIData.sneakMult += 0.2;
	if (AIData.canSeePlayerClose) AIData.sneakMult += 0.2;
	if (AIData.canSeePlayerVeryClose) AIData.sneakMult += 0.4;
	//if (KinkyDungeonAlert > 0) AIData.sneakMult += 1;

	if (KinkyDungeonLastAction == "" || (KinkyDungeonSlowLevel > 1 && KinkyDungeonLastAction == "Move")) AIData.sneakMult *= 0.5;
	else if (KinkyDungeonLastAction == "Cast" || KinkyDungeonLastAction == "Attack" || KinkyDungeonLastAction == "Move") AIData.sneakMult *= 1.5;

	if (enemy.vp > 0.2 && (!KDForcedToGround() && KinkyDungeonCanStand())) AIData.sneakMult += 0.1;
	if (enemy.vp > 0.5 && (!KDForcedToGround() && KinkyDungeonCanStand())) AIData.sneakMult += 0.3;

	AIData.sneakMult *= KinkyDungeonMultiplicativeStat(-KDEntityBuffedStat(enemy, "sneakMult"));

	let sneakPerc = (AIData.canSensePlayer || AIData.canSeePlayer || AIData.canShootPlayer || AIData.canSeePlayerChase) ?
		KinkyDungeonTrackSneak(enemy, delta * (AIData.sneakMult), player, (AIData.canSeePlayerClose) ? 0 : (enemy.Enemy.tags.darkvision ? 0.5 : 1.5))
		: 0;



	if ((!AIData.aggressive && player.player
		&& KDEnemyHasFlag(enemy, "seePlayer")) || enemy == KinkyDungeonLeashingEnemy()) {
		enemy.aware = true;
		sneakPerc = 1;
	}

	if (
		// If the player is visible
		(AIData.canSensePlayer || AIData.canSeePlayer || AIData.canShootPlayer || AIData.canSeePlayerChase)
		// If we SEE the player as opposed to just being able to
		&& sneakPerc >= 0.5) {

		if (AIData.aggressive)
			KinkyDungeonSetEnemyFlag(enemy, "wander", 0); // Reset wander timer


		if (!KDEnemyHasFlag(enemy, "StayHere")) {
			// Enemies that arent told to hold still will decide to follow their targets
			if (KDEnemyHasFlag(enemy, "Defensive")) {
				// Defensive AI will follow the player
				if (!KDEnemyHasFlag(enemy, "NoFollow")) {
					enemy.gx = KinkyDungeonPlayerEntity.x;
					enemy.gy = KinkyDungeonPlayerEntity.y;
				}
			} else if (
				// Dont chase the player if ignoring
				!AIData.ignore
				&& !KDEnemyHasFlag(enemy, "dontChase")
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
					KinkyDungeonSetEnemyFlag(enemy, "wander", Math.floor(4 + 6 * KDRandom()));
				} else {
					// Go to the target directly
					enemy.gx = player.x;
					enemy.gy = player.y;
					KinkyDungeonSetEnemyFlag(enemy, "wander", Math.floor(4 + 6 * KDRandom()));
				}
			}
		}
		if (sneakPerc > 0.99 && (AIData.canSensePlayer || AIData.canSeePlayer || AIData.canShootPlayer)) {
			if (!enemy.aware && AIData.aggressive && !KDHelpless(enemy)) {
				KDAddThought(enemy.id, "Aware", 3, 3);
				if (KDRandom() < actionDialogueChanceIntense)
					KinkyDungeonSendDialogue(enemy,
						TextGet("KinkyDungeonRemindJailChase" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Alert")
							.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy),
						4, 5, false, true);
			}
			if (!enemy.aware) KDEnemyAddSound(enemy, enemy.Enemy.Sound?.alertAmount != undefined ? enemy.Enemy.Sound?.alertAmount : KDDefaultEnemyAlertSound);
			let wasAware = enemy.aware;
			enemy.aware = true;
			// Share aggro
			if (!AIData.ignore
				&& player.player
				&& KDHostile(enemy)
				&& AIData.aggressive
				&& KDEnemyCanSignalOthers(enemy) && !enemy.Enemy.tags.minor && (!(enemy.silence > 0 || enemy.Enemy.tags.gagged) || enemy.Enemy.tags.alwaysAlert)) {

				if (!KDEntityHasFlag(enemy, "shoutforhelp")) {
					KinkyDungeonMakeNoiseSignal(enemy, 1, wasAware);
					KinkyDungeonSetEnemyFlag(enemy, "shoutforhelp",
						Math.floor((10 - KDEnemyRank(enemy)) * (1 + KDRandom())));
				}

				if (!enemy.rage) {
					let ent = KDNearbyEnemies(enemy.x, enemy.y, KinkyDungeonEnemyAlertRadius);
					for (let e of ent) {
						if (KDHostile(e) && KinkyDungeonAggressive(e) && !enemy.rage && e != enemy) {
							if (player.player && KDPlayerLight < 1.5) {
								if (!e.aware && !KDEnemyHasFlag(e, "dontChase")) {
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
	}

	AIData.ignoreRanged = AIData.canShootPlayer && KinkyDungeonAllRestraint().some((r) => {return KDRestraint(r).ignoreSpells;});
	// Close the gap to leash
	if ((AIData.ignoreRanged || (!enemy.Enemy.alwaysKite && AIData.harmless)) && AIData.leashing) AIData.followRange = 1.5;
	if (enemy == KinkyDungeonJailGuard() || enemy == KinkyDungeonLeashingEnemy()) {
		AIData.followRange = 1.5;
	}

	AIData.kite = false;
	AIData.kiteChance = enemy.Enemy.kiteChance ? enemy.Enemy.kiteChance : 0.75;
	if (AIData.canSeePlayer && (!player.player || AIData.aggressive) && enemy.Enemy && enemy.Enemy.kite && !enemy.usingSpecial && (!player.player || KinkyDungeonHasWill(0.1)) && (enemy.attackPoints <= 0 || enemy.Enemy.attackWhileMoving) && AIData.playerDist <= enemy.Enemy.kite && (AIData.aggressive || !player.player)) {
		if (!enemy.Enemy.dontKiteWhenDisabled || !(KDPlayerIsDisabled()))
			if (!enemy.Enemy.noKiteWhenHarmless || !AIData.harmless)
				if (AIData.kiteChance >= 1 || KDRandom() < AIData.kiteChance)
					if (!AIData.ignoreRanged)
						AIData.kite = true;
	}

	if (!AIData.aggressive && player.player && (enemy.playWithPlayer || KDAllied(enemy))) {
		if (enemy.playWithPlayer && AIData.domMe && KDIsBrat(enemy)) {
			AIData.followRange = 4.9;
			AIData.kite = true;
		} else
			AIData.followRange = 1.5;
	}
	//else, AIData.aggressive &&
	if (enemy.attackPoints && !enemy.Enemy.attackWhileMoving && AIData.followRange < ((enemy.usingSpecial ? enemy.Enemy.specialRange : undefined) || AIData.range)
		&& enemy.Enemy.attack?.includes("Melee")) {
		AIData.followRange = Math.max(1.5, (enemy.usingSpecial ? enemy.Enemy.specialRange : undefined) || AIData.range || AIData.followRange);
	}

	if ((AIType.resetguardposition(enemy, player, AIData)) && (!enemy.gxx || !enemy.gyy)) {
		enemy.gxx = enemy.gx;
		enemy.gyy = enemy.gy;
	}

	if (KDEnemyHasFlag(enemy, "runAway")) {
		AIData.followRange = 5.9;
		if (AIData.playerDist > 1.5 || KDRandom() < 0.75)
			AIData.kite = true;
	}

	// Movement loop

	// If an enemy was trying to attack the player but the player got behind them somehow, they get stunned
	let flanked = KDCheckVulnerableBackstab(enemy);
	if (player.player && flanked && !enemy.stun && !enemy.Enemy.tags.nosurpriseflank && !KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
		enemy.vulnerable = Math.max(1, enemy.vulnerable||0);
	}

	// Whether or not the enemy should hold when nearby
	// Summons are mainly the ones who should behave like this
	AIData.holdStillWhenNear = !(
		(enemy == KinkyDungeonLeashingEnemy() && !AIData.wantsToAttack)
		|| (KDEnemyHasFlag(enemy, "overrideMove"))
	)
		&& (
			AIData.aggressive
			|| (!enemy.Enemy.attackWhileMoving && enemy.warningTiles.length > 0)
			|| enemy.Enemy.Behavior?.holdStillWhenNear
			|| (player.player && enemy.Enemy.allied && !enemy.Enemy.Behavior?.behaveAsEnemy
				&& KDAllied(enemy) && !KDEnemyHasFlag(enemy, "NoFollow")
				&& !KDEnemyHasFlag(enemy, "StayHere"))
		);


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
					if (KDEnemyHasFlag(enemy, "Defensive") && !KDEnemyHasFlag(enemy, "StayHere") && !KDEnemyHasFlag(enemy, "dontChase")) {
						enemy.gx = KinkyDungeonPlayerEntity.x;
						enemy.gy = KinkyDungeonPlayerEntity.y;
					}
					if (KDEnemyHasFlag(enemy, "StayHere") && (KDEnemyHasFlag(enemy, "Defensive") && !KinkyDungeonFlags.get("PlayerCombat")))
						AIData.dontFollow = true;
					if (KDHostile(enemy)) {
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
					enemy.path = null;
				}
			}


			let rThresh = enemy.Enemy.RestraintFilter?.powerThresh || (KDDefaultRestraintThresh + (Math.max(0, enemy.Enemy.power - 1) || 0));

			AIData.wantsToLeash = !KinkyDungeonFlags.get("PlayerDommed");
			AIData.focusOnLeash = (!KinkyDungeonFlags.has("PlayerCombat") && KDEnemyHasFlag(enemy, "focusLeash")) || (
				enemy == KinkyDungeonLeashingEnemy()
				&& !AIData.addLeash && (
					!AIData.addMoreRestraints
                || !KinkyDungeonAggressive(enemy, KinkyDungeonPlayerEntity)
				|| !AIData.wantsToAttack
				|| !KinkyDungeonGetRestraint(
					{tags: KDGetTags(enemy, enemy.usingSpecial)}, KDGetEffLevel() + (enemy.Enemy.RestraintFilter?.levelBonus || enemy.Enemy.power || 0) + (AIData.attack.includes("Suicide") ? 10 : 0),
					(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
					enemy.Enemy.bypass,
					enemy.Enemy.useLock ? enemy.Enemy.useLock : "",
					!(enemy.Enemy.ignoreStaminaForBinds || (enemy.usingSpecial && enemy.Enemy.specialIgnoreStam)) && !AIData.attack.includes("Suicide"),
					!AIData.addMoreRestraints && !enemy.usingSpecial && AIData.addLeash,
					!KinkyDungeonStatsChoice.has("TightRestraints"),
					KDGetExtraTags(enemy, enemy.usingSpecial, true),
					false,
					{
						maxPower: rThresh + 0.01,
						looseLimit: true,
						onlyUnlimited: true,
						ignore: enemy.items,
					}, enemy, undefined, true)));

			AIData.SlowLeash = !KinkyDungeonAggressive(enemy, player) && KDEntityHasFlag(player, "leashtug");
			AIData.moveTowardPlayer =
				// We can move
				!KDIsImmobile(enemy)
				// We are willing to move
				&& !KDEnemyHasFlag(enemy, "dontChase")
				// We are willing to move
				&& (!KDEnemyHasFlag(enemy, "Defensive") || !KDEnemyHasFlag(enemy, "StayHere"))
				// We want to move
				&& AIType.chase(enemy, player, AIData)
				// We are not ignoring the target
				&& !AIData.ignore
				// We aren't prevented from following the target
				&& !AIData.dontFollow
				// We are aware of the target OR we are allied and are following
				&& (enemy.aware || AIData.allyFollowPlayer)
				// Player is within our max chase range
				&& (AIData.playerDist <= AIData.chaseRadius && AIData.canSeePlayerChase)
				// We aren't already following a path or stationed at our current point
				// TODO evaluate whether we should check gxx and gyy instead of gx and gy (station point vs goto point)
				&& ((enemy.gx != enemy.x || enemy.gy != enemy.y || enemy.path || enemy.fx || enemy.fy
					|| (KDAllied(enemy) && (!KDEnemyHasFlag(enemy, "Defensive") || KinkyDungeonFlags.get("PlayerCombat")))) ? true : false);

			// Also if the enemy is supposed to go to the player (goal x and y are same as players) and the enemy can see, it just does it
			// Party members get a free pass too on sight
			if (player && !AIData.ignore && ((KDEnemyReallyAware(enemy, player) && AIData.canSensePlayer) || KDIsInParty(enemy)) && enemy.gx == player.x && enemy.gy == player.y) {
				AIData.moveTowardPlayer = true;
			}

			// try 12 times to find a moveable tile, with some random variance
			// First part is player chasing behavior

			if (// We aren't focusing on pulling
				!AIData.focusOnLeash
				// We want to move toward the target instead of our goal
				&& AIData.moveTowardPlayer) {
				//enemy.aware = true;

				if (AIData.kite ? true : KDistChebyshev(enemy.x - player.x, enemy.y - player.y) > AIData.followRange) {
					for (let T = 0; T < 12; T++) {
						let dir = KDGetDir(enemy, player);
						let splice = false;
						if (T >= 8 || (enemy.path && !AIData.canSeePlayer) || (!AIData.canSeePlayer && !(enemy.Enemy.stopToCast && AIData.canShootPlayer))) {
							// Allies are a little smarter and can always see the player usually
							if (!enemy.path && (AIData.allied || KinkyDungeonAlert || KDEnemyReallyAware(enemy, player) || AIData.canSeePlayer)) {
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
									KDEnemyHasFlag(enemy, "blocked") || KDEnemyHasFlag(enemy, "blockedenemy"), KDEnemyHasFlag(enemy, "blocked") && enemy != KinkyDungeonLeashingEnemy(),
									AIData.ignoreLocks, AIData.MovableTiles,
									undefined, undefined, undefined, enemy,
									!enemy.CurrentAction && enemy != KinkyDungeonJailGuard() && !KDEnemyHasFlag(enemy, "longPath")); // Give up and pathfind
							}
							if (enemy.path) {
								if (enemy.path && enemy.path.length > 0 && Math.max(Math.abs(enemy.path[0].x - enemy.x),Math.abs(enemy.path[0].y - enemy.y)) < 1.5) {
									dir = {x: enemy.path[0].x - enemy.x, y: enemy.path[0].y - enemy.y, delta: KDistChebyshev(enemy.path[0].x - enemy.x, enemy.path[0].y - enemy.y)};
									if (!KinkyDungeonNoEnemyExceptSub(enemy.x + dir.x, enemy.y + dir.y, false, enemy)
										|| !AIData.MovableTiles.includes(KinkyDungeonMapGet(enemy.path[0].x, enemy.path[0].y))) {
										if (AIData.MovableTiles.includes(KinkyDungeonMapGet(enemy.path[0].x, enemy.path[0].y))) {
											KinkyDungeonSetEnemyFlag(enemy, "blockedenemy", 15);
										}
										KDBlockedByPlayer(enemy, dir);
										KinkyDungeonSetEnemyFlag(enemy, "failpath", (enemy == KinkyDungeonJailGuard() || enemy == KinkyDungeonLeashingEnemy()) ? 2 : 20);
										KinkyDungeonSetEnemyFlag(enemy, "blocked", 4);

										enemy.path = null;
									} else {
										splice = true;
									}
								} else {
									enemy.path = null;
									KinkyDungeonSetEnemyFlag(enemy, "failpath", (enemy == KinkyDungeonJailGuard() || enemy == KinkyDungeonLeashingEnemy()) ? 2 : 20);
									if (!AIData.canSensePlayer) {
										if (enemy.aware) KDAddThought(enemy.id, "Lose", 1, 4);
										enemy.aware = false;
									}

									//dir = KinkyDungeonGetDirectionRandom(0, 0); // Random...
								}
							}
						} else if (T > 2 && T < 8) dir = KinkyDungeonGetDirectionRandom(dir.x * 10, dir.y * 10); // Fan out a bit
						if (dir.delta > 1.5) {
							enemy.path = null;
							KinkyDungeonSetEnemyFlag(enemy, "failpath", 20);
						}
						else if (KinkyDungeonEnemyCanMove(enemy, dir, AIData.MovableTiles, AIData.AvoidTiles, AIData.ignoreLocks, T)) {
							if (KinkyDungeonEnemyTryMove(enemy, dir, delta, enemy.x + dir.x, enemy.y + dir.y, true)) AIData.moved = true;
							if (AIData.moved && splice && enemy.path) enemy.path.splice(0, 1);
							AIData.idle = false;

							// If we moved we will pick a candidate for next turns attempt
							if (AIData.moved) {
								dir = enemy.movePoints >= 1 ? KDGetDir(enemy, player, KinkyDungeonGetDirection) : KDGetDir(enemy, player);
								if (KinkyDungeonEnemyCanMove(enemy, dir, AIData.MovableTiles, AIData.AvoidTiles, AIData.ignoreLocks, T)) {
									if (!KinkyDungeonEnemyTryMove(enemy, dir, 0, enemy.x + dir.x, enemy.y + dir.y, true)) {
										// Use up spare move points
										enemy.fx = enemy.x + dir.x;
										enemy.fy = enemy.y + dir.y;
									}
								}
							} else {
								KDBlockedByPlayer(enemy, dir);
							}
							break;
						} else {
							KDBlockedByPlayer(enemy, dir);
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
					if (player.player) {
						if (!enemy.IntentLeashPoint) {
							if ((AIData.aggressive)) {
								KDAssignLeashPoint(enemy);
								enemy.gx = AIData.nearestJail.x;
								enemy.gy = AIData.nearestJail.y;
							}
						} else {
							enemy.gx = enemy.IntentLeashPoint.x;
							enemy.gy = enemy.IntentLeashPoint.y;
						}
					}

					if (enemy.x == enemy.gx && enemy.y == enemy.gy) {
						enemy.gx = player.x;
						enemy.gy = player.y;
					}
				} else if (!AIData.canSensePlayer) {
					if (KDEnemyReallyAware(enemy, player) && KinkyDungeonAggressive(enemy, player)) {
						enemy.path = null;
					}
					enemy.aware = false;
				}
				for (let T = 0; T < 8; T++) {
					let dir = KDGetDir(enemy, {x: enemy.gx, y: enemy.gy}, KinkyDungeonGetDirection);
					let splice = false;
					let pathThresh = (enemy == KinkyDungeonJailGuard() || enemy == KinkyDungeonLeashingEnemy()) ? 3 : 8;
					if (T > 2 && T < pathThresh) dir = KinkyDungeonGetDirectionRandom(dir.x * 10, dir.y * 10); // Fan out a bit
					if (T >= pathThresh || enemy.path || !KinkyDungeonCheckPath(enemy.x, enemy.y, enemy.gx, enemy.gy) || KDEnemyHasFlag(enemy, "forcepath")) {
						if (!enemy.path && !KDEnemyHasFlag(enemy, "genpath")) {
							enemy.path = KinkyDungeonFindPath(
								enemy.x, enemy.y, enemy.gx, enemy.gy,
								KDEnemyHasFlag(enemy, "blocked") || KDEnemyHasFlag(enemy, "blockedenemy") || enemy == KinkyDungeonLeashingEnemy(),
								KDEnemyHasFlag(enemy, "blocked") && enemy != KinkyDungeonLeashingEnemy(),
								AIData.ignoreLocks, AIData.MovableTiles,
								undefined, undefined, undefined, enemy, enemy != KinkyDungeonJailGuard() && enemy != KinkyDungeonLeashingEnemy() && !KDEnemyHasFlag(enemy, "longPath")); // Give up and pathfind
							KinkyDungeonSetEnemyFlag(enemy, "genpath", (enemy == KinkyDungeonJailGuard() || enemy == KinkyDungeonLeashingEnemy()) ? 1 : (KinkyDungeonTilesGet(enemy.x + ',' + enemy.y)?.OL ? 2 + Math.floor(KDRandom() * 4) : 10 + Math.floor(KDRandom() * 30)));
						}
						if (enemy.path) {
							if (enemy.path && enemy.path.length > 0 && Math.max(Math.abs(enemy.path[0].x - enemy.x),Math.abs(enemy.path[0].y - enemy.y)) < 1.5) {
								dir = {x: enemy.path[0].x - enemy.x, y: enemy.path[0].y - enemy.y, delta: KDistChebyshev(enemy.path[0].x - enemy.x, enemy.path[0].y - enemy.y)};
								if (!KinkyDungeonNoEnemyExceptSub(enemy.x + dir.x, enemy.y + dir.y, false, enemy)
									|| !AIData.MovableTiles.includes(KinkyDungeonMapGet(enemy.path[0].x, enemy.path[0].y))) {
									if (AIData.MovableTiles.includes(KinkyDungeonMapGet(enemy.path[0].x, enemy.path[0].y))) {
										KinkyDungeonSetEnemyFlag(enemy, "blockedenemy", 15);
									}
									KDBlockedByPlayer(enemy, dir);
									KinkyDungeonSetEnemyFlag(enemy, "failpath", (enemy == KinkyDungeonJailGuard() || enemy == KinkyDungeonLeashingEnemy()) ? 2 : 20);
									KinkyDungeonSetEnemyFlag(enemy, "blocked", 4);

									enemy.path = null;
								} else {
									splice = true;
								}
							} else {
								KDBlockedByPlayer(enemy, dir);
								enemy.path = null;
								KinkyDungeonSetEnemyFlag(enemy, "failpath", (enemy == KinkyDungeonJailGuard() || enemy == KinkyDungeonLeashingEnemy()) ? 2 : 20);
							}
						} else {
							KinkyDungeonSetEnemyFlag(enemy, "longPath", 24);
						}

					}
					if (dir.delta > 1.5) {enemy.path = null;}
					else if (
						(T > 7 || AIData.moveTowardPlayer || (
							enemy.x + dir.x == enemy.gx
							&& enemy.y + dir.y == enemy.gy
						) || !KDPointWanderable(enemy.gx, enemy.gy) || !KDPointWanderable(enemy.x, enemy.y) || KDPointWanderable(enemy.x + dir.x, enemy.y + dir.y) || KDEnemyHasFlag(enemy, "forcepath"))
						&& KinkyDungeonEnemyCanMove(enemy, dir, AIData.MovableTiles, AIData.AvoidTiles, AIData.ignoreLocks, T)) {
						if (AIData.SlowLeash) {
							// Don't tug too hard
							AIData.idle = false;// If we moved we will pick a candidate for next turns attempt
							enemy.fx = enemy.x;
							enemy.fy = enemy.y;
						} else {
							if (KinkyDungeonEnemyTryMove(enemy, dir, delta, enemy.x + dir.x, enemy.y + dir.y, enemy.action && KDEnemyAction[enemy.action]?.sprint)) AIData.moved = true;
							if (AIData.moved && splice && enemy.path) enemy.path.splice(0, 1);
							AIData.idle = false;// If we moved we will pick a candidate for next turns attempt
							if (AIData.moved) {
								dir = enemy.movePoints >= 1 ? KDGetDir(enemy, {x: enemy.gx, y: enemy.gy}, KinkyDungeonGetDirection)
									: KDGetDir(enemy, {x: enemy.gx, y: enemy.gy});
								if (KinkyDungeonEnemyCanMove(enemy, dir, AIData.MovableTiles, AIData.AvoidTiles, AIData.ignoreLocks, T)) {
									if (!KinkyDungeonEnemyTryMove(enemy, dir, 0, enemy.x + dir.x, enemy.y + dir.y, enemy.action && KDEnemyAction[enemy.action]?.sprint)) {
										// Use up spare move points
										enemy.fx = enemy.x + dir.x;
										enemy.fy = enemy.y + dir.y;
									}
								}
							}
						}
						break;
					} else {
						if (!KDPointWanderable(enemy.x + dir.x, enemy.y + dir.y)) {
							KinkyDungeonSetEnemyFlag(enemy, "forcepath", 3);
						}

						KDBlockedByPlayer(enemy, dir);
						enemy.fx = undefined;
						enemy.fy = undefined;
						if (KinkyDungeonPlayerEntity.x == enemy.x + dir.x && KinkyDungeonPlayerEntity.y == enemy.y + dir.y) enemy.path = null;
					}
				}
			} else if (!AIData.moveTowardPlayer && (Math.abs(enemy.x - enemy.gx) < 2 || Math.abs(enemy.y - enemy.gy) < 2)) AIData.patrolChange = true;

			if (enemy.leash?.entity && KDAcceptsLeash(enemy, enemy.leash)) {
				let leasher = KDLookupID(enemy.leash.entity);
				if (leasher && !leasher.idle && (leasher.gx != leasher.x || leasher.gy != leasher.y)) {
					enemy.gx = leasher.gx;
					enemy.gy = leasher.gy;
					KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 1);
				}

			}

			/** QoL for party members to follow you */
			let allyHoming = (AIData.allyFollowPlayer && KDIsInParty(enemy) && enemy.idle && !enemy.aware);

			if ((allyHoming || !KDEnemyHasFlag(enemy, "Defensive"))
				&& !KDEnemyHasFlag(enemy, "StayHere")
				&& !KDEnemyHasFlag(enemy, "overrideMove")
				&& !KDIsImmobile(enemy)
				&& !AIType.aftermove(enemy, player, AIData)
				&& (allyHoming
					|| (!AIData.moveTowardPlayer && !KDEnemyHasFlag(enemy, "dontChase")))) {

				if (AIType.resetguardposition(enemy, player, AIData)
					&& !AIData.allyFollowPlayer
					&& Math.max(Math.abs(enemy.x - enemy.gx), Math.abs(enemy.y - enemy.gy)) < 1.5 && enemy.gxx && enemy.gyy) {
					enemy.gx = enemy.gxx;
					enemy.gy = enemy.gyy;
				}

				if (allyHoming) {
					// TODO add mechanism for allies finding where you are
					enemy.gx = KDPlayer().x;
					enemy.gy = KDPlayer().y;
				} else {
					let wanderfar = AIType.wander_far(enemy, player, AIData) || KDEnemyHasFlag(enemy, "forceWFar");
					let wandernear = AIType.wander_near(enemy, player, AIData);
					if ((wanderfar || wandernear) && !AIData.allyFollowPlayer && (!enemy.Enemy.allied && !KDEnemyHasFlag(enemy, "StayHere")) && !KDEnemyHasFlag(enemy, "StayHere") && enemy.movePoints < 1 && (!enemy.aware || !AIData.aggressive || enemy.ignore)) {
						if ((Math.max(Math.abs(enemy.x - enemy.gx), Math.abs(enemy.y - enemy.gy)) < 2.5 || (KDRandom() < 0.02 && KDEnemyHasFlag(enemy, "failpath"))) || (!(enemy.vp > 0.05) && (!enemy.path || KDRandom() < 0.1))) {
							AIData.master = KinkyDungeonFindMaster(enemy).master;
							if (!KDEnemyHasFlag(enemy, "wander")) {
								if (!AIData.master && wanderfar) {
									if (!AIType.wanderfar_func || !AIType.wanderfar_func(enemy, player, AIData)) {
										// long distance hunt
										let newPoint = KinkyDungeonGetRandomEnemyPointCriteria((X, Y) => {
											return KDistChebyshev(enemy.x - X, enemy.y - Y) < 24;
										}, false,
										enemy.tracking && KinkyDungeonHuntDownPlayer && KDGameData.PrisonerState != "parole" && KDGameData.PrisonerState != "jail");
										if (newPoint) {
											// Gravitate toward interesting stuff
											let np =
												(['guard', 'ambush', 'looseguard'].includes(KDGetAI(enemy)))
												? KDGetNearestGuardLabel(newPoint.x, newPoint.y, enemy, undefined, false, "Patrol", 8)
												: KDGetNearestInterestingLabel(newPoint.x, newPoint.y, enemy, undefined, false, "Patrol", 8);
											if (np) {
												newPoint.x = np.x;
												newPoint.y = np.y;
												np.assigned = enemy.id;
											}
											enemy.gx = newPoint.x;
											enemy.gy = newPoint.y;
											KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
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
												KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
											} else if (KDRandom() < cohesion) {
												let minDist = enemy.Enemy.cohesionRange ? enemy.Enemy.cohesionRange : AIData.visionRadius;
												let ent = KDNearbyEnemies(enemy.x, enemy.y, minDist);
												for (let e of ent) {
													if (e == enemy) continue;
													if (['guard', 'ambush', 'looseguard'].includes(KDGetAI(enemy))) continue;
													if (['guard', 'ambush', 'looseguard'].includes(KDGetAI(e))) continue;
													if (!(
														(enemy.Enemy.clusterWith && !e.Enemy.tags[enemy.Enemy.clusterWith])
														|| e.Enemy.clusterWith && !enemy.Enemy.tags[enemy.Enemy.clusterWith]
													)) continue;
													if (KDGetFaction(e) != KDGetFaction(enemy)) continue;
													if (KinkyDungeonTilesGet(e.x + "," + e.y) && KinkyDungeonTilesGet(e.x + "," + e.y).OL) continue;
													let dist = KDistEuclidean(e.x - enemy.x, e.y - enemy.y);
													if (dist < minDist) {
														minDist = dist;
														let ePoint = KinkyDungeonGetNearbyPoint(ex, ey, false);
														if (ePoint) {
															ex = ePoint.x;
															ey = ePoint.y;
															KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
														}
													}
												}
											}
											let newPoint = KinkyDungeonGetNearbyPoint(ex, ey, false);
											if (newPoint && (KDGetFaction(enemy) != "Player" || !KinkyDungeonPointInCell(newPoint.x, newPoint.y))) {
												// Gravitate toward interesting stuff
												let np =
													(['guard', 'ambush', 'looseguard'].includes(KDGetAI(enemy)))
													? KDGetNearestGuardLabel(newPoint.x, newPoint.y, enemy, enemy.id, false, "Patrol", 8)
													: KDGetNearestInterestingLabel(newPoint.x, newPoint.y, enemy, enemy.id, false, "Patrol", 8);
												if (np) {
													newPoint.x = np.x;
													newPoint.y = np.y;
													np.assigned = enemy.id;
												}
												if (!AIType.strictwander || KinkyDungeonCheckPath(enemy.x, enemy.y, newPoint.x, newPoint.y)) {
													enemy.gx = newPoint.x;
													enemy.gy = newPoint.y;
													KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
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
	}


	if (enemy.usingSpecial && !enemy.specialCD) enemy.specialCD = 0;

	let minRange = enemy.Enemy.attackMinRange || 0;
	if (enemy.usingSpecial && enemy.Enemy.specialMinRange != undefined) minRange = enemy.Enemy.specialMinRange;

	let KDOperateTease = () => {
		let teaseAttack = KDGetTeaseAttack(enemy, player, AIData);
		if (teaseAttack) {
			let dodged = false;
			let blocked = false;
			if (teaseAttack.dodgeable && !KDEnemyHasFlag(enemy, "allyPlay")) {
				let BaseEvasion = KinkyDungeonMultiplicativeStat(0.25 + AIData.accuracy - 1);
				let playerEvasion = 1.01 * ((player.player) ?
					KinkyDungeonPlayerEvasion(true)
					: KinkyDungeonMultiplicativeStat(((player.Enemy && player.Enemy.evasion) ? player.Enemy.evasion : 0))
						* KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(player.buffs, "Evasion")));
				if (KDRandom() < BaseEvasion-playerEvasion) dodged = true;
			}
			if (teaseAttack.blockable && !dodged && !KDEnemyHasFlag(enemy, "allyPlay")) {
				let BaseBlock = KinkyDungeonMultiplicativeStat(0.0 + AIData.accuracy - 1);
				let playerBlock = 1.01 * ((player.player) ?
					KinkyDungeonPlayerBlock(true)
					: KinkyDungeonMultiplicativeStat(((player.Enemy && player.Enemy.block) ? player.Enemy.block : 0))
						* KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(player.buffs, "Block")));
				if (KDRandom() < BaseBlock-playerBlock) blocked = true;
			}

			teaseAttack.apply(enemy, player, AIData, blocked, dodged, KDGetTeaseDamageMod(enemy));
		}
	};

	// Attack loop
	AIData.playerDist = Math.sqrt((enemy.x - player.x)*(enemy.x - player.x) + (enemy.y - player.y)*(enemy.y - player.y));
	let canAttack = !(enemy.disarm > 0)
		&& AIData.wantsToAttack
		&& (!player?.player || !enemy.Enemy.followLeashedOnly || KDPlayerDeservesPunishment(enemy, player) || KDGameData.KinkyDungeonLeashedPlayer < 1 || KinkyDungeonLeashingEnemy()?.id == enemy.id || KinkyDungeonFlags.get("overrideleashprotection"))
		&& (enemy.warningTiles.length > 0 || (enemy.aware && (!player.player || enemy.vp > 0.25) && KDCanDetect(enemy, player)) || (!KDAllied(enemy) && !AIData.hostile))
		&& !AIData.ignore
		&& (!minRange || (AIData.playerDist > minRange))
		&& (AIData.attack.includes("Melee") || (enemy.Enemy.tags && AIData.leashing && !KinkyDungeonHasWill(0.1)))
		&& (!AIData.ignoreRanged || AIData.playerDist < 1.5)
		&& AIType.attack(enemy, player, AIData)
		&& KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.range, !enemy.Enemy.projectileAttack, !enemy.Enemy.projectileAttack);
	let first = true;
	let canTease = !canAttack
		&& !(enemy.disarm > 0)
		&& AIData.wantsToTease
		&& (!player?.player || !enemy.Enemy.followLeashedOnly || KDPlayerDeservesPunishment(enemy, player) || KDGameData.KinkyDungeonLeashedPlayer < 1 || KinkyDungeonLeashingEnemy()?.id == enemy.id || KinkyDungeonFlags.get("overrideleashprotection"))
		&& (enemy.warningTiles.length > 0 || (enemy.aware && (!player.player || enemy.vp > 0.25) && KDCanDetect(enemy, player)) || (!KDAllied(enemy) && !AIData.hostile))
		&& !AIData.ignore
		&& (!minRange || (AIData.playerDist > minRange))
		&& (AIData.attack.includes("Melee") || (enemy.Enemy.tags && AIData.leashing && !KinkyDungeonHasWill(0.1)))
		&& (!AIData.ignoreRanged || AIData.playerDist < 1.5)
		&& AIType.attack(enemy, player, AIData)
		&& KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.range, !enemy.Enemy.projectileAttack, !enemy.Enemy.projectileAttack);

	if (player.player && !canAttack && canTease && enemy.playWithPlayer && !KinkyDungeonAggressive(enemy)) {
		KDOperateTease();
	}
	while (canAttack && (first || enemy.attackBonus > 0)) {//Player is adjacent
		AIData.idle = false;
		enemy.revealed = true;
		if (!first) {
			updateSpecial();
		}

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
			if (!KinkyDungeonEnemyTryAttack(enemy, player, attackTiles, first ? delta : 0, enemy.x + dir.x, enemy.y + dir.y, (enemy.usingSpecial && enemy.Enemy.specialAttackPoints) ? enemy.Enemy.specialAttackPoints : ap, undefined, undefined, enemy.usingSpecial, AIData.refreshWarningTiles, AIData.attack, AIData.MovableTiles)) {
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

				if (first && AIData.attack.includes("Bonus") && !enemy.movePoints) {
					if (!enemy.attackBonus) enemy.attackBonus = 0;
					enemy.attackBonus += enemy.Enemy.attackBonus || 1; // bonus means they can attack again
				}

				// Enemies can take advantage of you~
				KDOperateTease();
			} else { // Attack lands!
				enemy.revealed = true;
				let hit = ((enemy.usingSpecial && enemy.Enemy.specialAttackPoints) ? enemy.Enemy.specialAttackPoints : ap) <= 1;
				for (let tile of enemy.warningTiles) {
					if (enemy.x + tile.x == player.x && enemy.y + tile.y == player.y) {
						hit = true;
						break;
					}
				}

				KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", enemy.Enemy?.attackPoints || 2);

				KDEnemyAddSound(enemy, enemy.Enemy.Sound?.attackAmount != undefined ? enemy.Enemy.Sound?.attackAmount : KDDefaultEnemyAttackSound);

				let playerEvasion = 1.01 * (player.player) ? KinkyDungeonPlayerEvasion(true)
					: KinkyDungeonMultiplicativeStat(((player.Enemy && player.Enemy.evasion) ? player.Enemy.evasion : 0)) * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(player.buffs, "Evasion"));

				let playerBlock = 1.01 * (player.player) ? KinkyDungeonPlayerBlock(true)
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
						KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonAttackMiss" + (KDGameData.Crouch ? "Crouch" : "")).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "#44aa44", 1,
							false, false, undefined, "Combat");

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
						KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonAttackBlock").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "#44aa44", 1,
							false, false, undefined, "Combat");

						if (KDRandom() < actionDialogueChance)
							KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Block").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 4);
					} else {
						KinkyDungeonSendEvent("blockEnemy", {enemy: enemy, player: player, preData: preData});
					}
					KDAddThought(enemy.id, "Annoyed", 4, 1);

					if (AIData.attack.includes("Dash") && !enemy.Enemy.Dash?.noDashOnBlock) {
						KDDash(enemy, player, AIData.MovableTiles);
					}
					if (first && AIData.attack.includes("Bonus") && !enemy.movePoints) {
						if (!enemy.attackBonus) enemy.attackBonus = 0;
						enemy.attackBonus += enemy.Enemy.attackBonus || 1; // bonus means they can attack again
					}
					hit = false;
				}
				if (hit) {
					if (KDRandom() < actionDialogueChanceIntense && !enemy.playWithPlayer)
						KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "HitPlayer").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 3, 5);
					let replace = [];
					let restraintAdd: {r: restraint, v: ApplyVariant, iv: string}[] = [];
					let restraintFromInventory = [];
					let willpowerDamage = 0;
					let staminaDamage = 0;
					let msgColor = "#f0dc41";
					let Locked = false;
					let Effected = false;
					let Stun = false;
					let Blind = false;
					let priorityBonus = 0;
					let addedRestraint = false;

					let happened = 0;
					let bound = 0;

					if (player.player && !KDEnemyHasFlag(enemy, "noleash")) {
						if (player.player
							&& AIData.playerDist <= AIData.range
							&& ((AIData.aggressive || AIData.attack.includes("Pull") && !enemy.playWithPlayer) || enemy.IntentLeashPoint)
							&& ( // If we are already leashing or pulling or we are a leashing type that is able to leash
								((!enemy.Enemy.noLeashUnlessExhausted || !KinkyDungeonHasWill(0.1))
								&& enemy.Enemy.tags
								&& AIData.leashing)//&& KDGetFaction(enemy) != "Ambush")
								|| AIData.attack.includes("Pull")
								|| enemy.IntentLeashPoint
							)
							// Only attempt to leash if the player is not already being leashed
							&& (KDGameData.KinkyDungeonLeashedPlayer < 1 || KinkyDungeonLeashingEnemy() == enemy)
							&& (!KinkyDungeonPlayerTags.get("Furniture") || enemy.IntentLeashPoint || KDSelfishLeash(enemy))
						) {
							AIData.intentToLeash = true;

							let wearingLeash = false;
							if (!wearingLeash && !AIData.attack.includes("Pull"))
								wearingLeash = KinkyDungeonIsWearingLeash();
							AIData.leashed = wearingLeash || AIData.attack.includes("Pull");

							if (AIData.leashed) {

								let leashToExit = AIData.leashing && !KinkyDungeonHasWill(0.1) && AIData.playerDist < 1.5;
								if (!enemy.IntentLeashPoint) {
									KDAssignLeashPoint(enemy);
								}

								let leashPos = AIData.aggressive ? (AIData.nearestJail) : {x: enemy.x, y: enemy.y, type: "", radius: 1};
								let findMaster = undefined;
								if (enemy.CurrentAction == 'jailLeashTour') {
									// TODO replace with intent action
									leashPos = {x: enemy.NextJailLeashTourWaypointX, y: enemy.NextJailLeashTourWaypointY, type: "", radius: 1};
								} else
								if (enemy.IntentLeashPoint) leashPos = enemy.IntentLeashPoint;
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
								let l = enemy.Enemy.attackLock ? KDProcessLock(enemy.Enemy.attackLock) : KinkyDungeonGenerateLock(true, KDGetEffLevel() + enemy.Enemy.power || 0, undefined, "Enemy", {enemy: enemy});
								KinkyDungeonLock(Lockable[L], l); // Lock it!
								priorityBonus += KDRestraint(Lockable[L]).power;
							}
							Locked = true;
							happened += 1;
							if (enemy.usingSpecial && Locked && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Lock")) {
								enemy.specialCD = enemy.Enemy.specialCD;
							}
							if (KDRandom() < actionDialogueChanceIntense && !enemy.playWithPlayer)
								KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Lock").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 4);

						} else if (AIData.attack.includes("Bind")
							&& (((enemy.Enemy.smartBind && !KinkyDungeonFlags.get("PlayerCombat"))
								|| (!enemy.usingSpecial && !enemy.Enemy.bindOnDisable) || (enemy.usingSpecial && !enemy.Enemy.bindOnDisableSpecial)) || !KinkyDungeonHasWill(0.01) || !KinkyDungeonHasStamina(2.5)
								|| !KinkyDungeonCanStand() || KDForcedToGround())) {

							if (AIData.addMoreRestraints || AIData.addLeash || enemy.usingSpecial) {
								if (!AIData.intentToLeash && !KinkyDungeonFlags.get("Released") && enemy.Enemy.bound
									&& KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y) && KDGameData.KinkyDungeonLeashedPlayer < 1
									&& KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Furniture
									&& !KinkyDungeonPlayerTags.has("Furniture")
									&& KDFurniture[KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Furniture]) {
									let furn = KDFurniture[KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Furniture];
									if (furn) {
										let rest = KDGetRestraintWithVariants(
											{tags: [furn.restraintTag]}, KDGetEffLevel() + (enemy.Enemy.RestraintFilter?.levelBonus || enemy.Enemy.power || 0),
											(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
											true,
											"",
											!KDPlayerIsStunned(),
											false,
											false);
										replace.push({keyword:"RestraintAdded", value: KDGetRestraintName(rest.r, rest.v)});
										restraintAdd.push({r: rest.r, v: rest.v, iv: rest.iv});
										addedRestraint = true;
									}
								} else {
									let numTimes = 1;
									if (enemy.Enemy.multiBind) numTimes = enemy.Enemy.multiBind;
									for (let times = 0; times < numTimes; times++) {
										// Note that higher power enemies get a bonus to the floor restraints appear on
										let rThresh = enemy.Enemy.RestraintFilter?.powerThresh || (KDDefaultRestraintThresh + (Math.max(0, enemy.Enemy.power - 1) || 0));
										let rest = KDGetRestraintWithVariants(
											{tags: KDGetTags(enemy, enemy.usingSpecial)}, KDGetEffLevel() + (enemy.Enemy.RestraintFilter?.levelBonus || enemy.Enemy.power || 0),
											(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
											enemy.Enemy.bypass,
											enemy.Enemy.useLock ? enemy.Enemy.useLock : "",
											!(KDPlayerIsStunned() || enemy.Enemy.ignoreStaminaForBinds || (enemy.usingSpecial && enemy.Enemy.specialIgnoreStam)) && !AIData.attack.includes("Suicide"),
											!AIData.addMoreRestraints && !enemy.usingSpecial && AIData.addLeash,
											!KinkyDungeonStatsChoice.has("TightRestraints"),
											KDGetExtraTags(enemy, enemy.usingSpecial, true),
											false,
											{
												//minPower: rThresh,
												//onlyLimited: !enemy.Enemy.RestraintFilter?.limitedRestraintsOnly,
												ignore: [...restraintAdd.map((rst) => {return rst.r.name;})],
												looseLimit: true,
												require: enemy.Enemy.RestraintFilter?.unlimitedRestraints ? undefined : enemy.items,
											}, enemy, undefined, true, undefined, {
												allowLowPower: KDRandom() < 0.5,
												extraOptions: enemy.items,
											});

										if (!rest) {
											rest = KDGetRestraintWithVariants(
												{tags: KDGetTags(enemy, enemy.usingSpecial)}, KDGetEffLevel() + (enemy.Enemy.RestraintFilter?.levelBonus || enemy.Enemy.power || 0),
												(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
												enemy.Enemy.bypass,
												enemy.Enemy.useLock ? enemy.Enemy.useLock : "",
												!(KDPlayerIsStunned() || enemy.Enemy.ignoreStaminaForBinds || (enemy.usingSpecial && enemy.Enemy.specialIgnoreStam)) && !AIData.attack.includes("Suicide"),
												!AIData.addMoreRestraints && !enemy.usingSpecial && AIData.addLeash,
												!KinkyDungeonStatsChoice.has("TightRestraints"),
												KDGetExtraTags(enemy, enemy.usingSpecial, true),
												false,
												{
													maxPower: rThresh + 0.01,
													looseLimit: true,
													onlyUnlimited: true,
													ignore: [...(enemy.items || []), ...restraintAdd.map((rst) => {return rst.r.name;})],
												}, enemy, undefined, true, undefined, {
													allowLowPower: KDRandom() < 0.5,
												});
										} else {
											restraintFromInventory.push(rest.iv || rest.r.name);
										}
										if (rest) {
											replace.push({keyword:"RestraintAdded", value: KDGetRestraintName(rest.r, rest.v)});
											restraintAdd.push({r: rest.r, v: rest.v, iv: rest.iv});
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
								|| Math.abs(enemy.x - leashPos.x) > 0.5
								|| Math.abs(enemy.y - leashPos.y) > 0.5)
							) {
								if (!KinkyDungeonHasWill(0.1) && KDRandom() < 0.25) KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
								// Leash pullback
								if (AIData.playerDist < 1.5) {
									let path = KinkyDungeonFindPath(enemy.x, enemy.y, leashPos.x, leashPos.y, true, false, true, KinkyDungeonMovableTilesSmartEnemy, undefined, undefined, undefined, enemy);
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
											let formerx = enemy.x;
											let formery = enemy.y;
											KDMoveEntity(enemy, leashPoint.x, leashPoint.y, true, false, undefined, true);
											KDMovePlayer(formerx, formery, false);
											KinkyDungeonTargetTile = null;
											KinkyDungeonTargetTileLocation = "";
											AIData.hitsfx = "Struggle";
											for (let invItem of KinkyDungeonAllRestraintDynamic()) {
												let inv = invItem.item;
												if (KDRestraint(inv).removeOnLeash) {
													KinkyDungeonRemoveRestraintSpecific(inv, false);
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
											KinkyDungeonSetFlag("grabbed", 4);

											if (AIData.leashing && !KDPlayerIsImmobilized() && !KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity, enemy)) {
												KinkyDungeonAttachTetherToEntity(2.5, enemy, player);
												KinkyDungeonSetFlag("leashtug", 3);
											}
											//KinkyDungeonSetFlag("nojailbreak", KDGameData.KinkyDungeonLeashedPlayer);
											KinkyDungeonSetFlag("nojailbreak", 12);
											if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Pull")) {
												enemy.specialCD = enemy.Enemy.specialCD;
											}
											if (KinkyDungeonMapGet(enemy.x, enemy.y) == 'D')  {
												KinkyDungeonMapSet(enemy.x, enemy.y, 'd');
												if (KinkyDungeonTilesGet(enemy.x + ',' +enemy.y)
													&& KinkyDungeonTilesGet(enemy.x + ',' +enemy.y).Type == "Door"
													&& KDShouldUnLock(enemy.x, +enemy.y, KinkyDungeonTilesGet(enemy.x + ',' +enemy.y))) {
													KinkyDungeonTilesGet(enemy.x + ',' +enemy.y).OGLock = KinkyDungeonTilesGet(enemy.x + ',' +enemy.y).Lock;
													KinkyDungeonTilesGet(enemy.x + ',' +enemy.y).Lock = undefined;
												}
											}

											if (KDRandom() < actionDialogueChanceIntense)
												KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Leash").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 3);
											KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonLeashGrab").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "#ff8933", 1,
												false, false, undefined, "Combat");
										}
									}
								} else if (!(player?.player && KinkyDungeonFlags.get("forceMoved"))) {
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

											if (player.player)
												KDMovePlayer(leashPoint.x, leashPoint.y, false);
											else
												KDMoveEntity(player, leashPoint.x, leashPoint.y, false);
											let msg = "KinkyDungeonLeashGrab";
											if (enemy.Enemy.pullMsg) msg = "Attack" + enemy.Enemy.name + "Pull";

											if (KDRandom() < actionDialogueChanceIntense)
												KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Pull").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 3);
											KinkyDungeonSendTextMessage(8, TextGet(msg).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "#ff8933", 1,
												false, false, undefined, "Combat");
										}
									}
								}
							}
						}
					}
					let Dash = false;


					let data: any = {};
					if (AIData.attack.includes("Dash") && (enemy.Enemy.dashThruWalls || AIData.canSeePlayer)) {
						let d = KDDash(enemy, player, AIData.MovableTiles);
						Dash = d.Dash;
						happened += d.happened;
					}
					if (first && AIData.attack.includes("Bonus") && !enemy.movePoints) {
						if (!enemy.attackBonus) enemy.attackBonus = 0;
						enemy.attackBonus += enemy.Enemy.attackBonus || 1; // bonus means they can attack again
					}
					if (AIData.attack.includes("Will") || willpowerDamage > 0 || KDEnemyHasFlag(enemy, "alwayswill")) {
						if (willpowerDamage == 0)
							willpowerDamage += AIData.power;
						let buffdmg = KinkyDungeonGetBuffedStat(enemy.buffs, "AttackDmg");
						if (buffdmg) willpowerDamage = Math.max(0, willpowerDamage + buffdmg);
						msgColor = "#ff5555";
						if (enemy.usingSpecial && willpowerDamage > 0 && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Will")) {
							enemy.specialCD = enemy.Enemy.specialCD;
						}
					}
					if (AIData.attack.includes("Stamina") || staminaDamage > 0) {
						if (staminaDamage == 0)
							staminaDamage += AIData.power;
						let buffdmg = KinkyDungeonGetBuffedStat(enemy.buffs, "StaminaDmg");
						if (buffdmg) staminaDamage = Math.max(0, staminaDamage + buffdmg + enemy.Enemy.staminaDamage);
						msgColor = "#ff5555";
						if (enemy.usingSpecial && staminaDamage > 0 && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Stamina")) {
							enemy.specialCD = enemy.Enemy.specialCD;
						}
					}
					let dmgString = "";
					if (player.player) {
						KinkyDungeonTickBuffTag(enemy, "hit", 1);
						if (restraintAdd && restraintAdd.length > 0) {
							msgColor = "#ff8933";
							bound += KDRunBondageResist(enemy, KDGetFaction(enemy), restraintAdd,(r) => {
								KDDamageQueue.push({floater: TextGet("KDBlockedRestraint"), Entity: {x: enemy.x - 0.5, y: enemy.y - 0.5}, Color: "#88ff88", Time: 2, Delay: 0});
								for (let rep of replace) {
									if (rep.keyword == "RestraintAdded") rep.value = TextGet("KDRestraintBlockedItem");
								}
								if (!r)
									KinkyDungeonSendTextMessage(1, TextGet("KDBondageResistBlockTotal"), "#f0dc41", 1,
										false, false, undefined, "Combat");
								msgColor = "#f0dc41";
								bound += 1;
								if (willpowerDamage == 0)
									willpowerDamage += AIData.power;
							},
							restraintFromInventory).length*2;
						}

						if (restraintAdd && restraintAdd.length == 0 && AIData.attack.includes("Bind")) {
							if ((!KinkyDungeonHasWill(0.1) || (enemy.Enemy.Attack?.mustBindorFail)) && enemy.Enemy.failAttackflag) {
								if (!enemy.Enemy.failAttackflagChance || KDRandom() < enemy.Enemy.failAttackflagChance)
									for (let f of enemy.Enemy.failAttackflag) {
										KinkyDungeonSetFlag(f, enemy.Enemy.failAttackflagDuration || 12);
										KDSetIDFlag(enemy.id, "wander", 0);
									}
							}
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
							staminaDamage: staminaDamage,
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
						if (!dmg.happened) {
							// Sometimes enemies will flinch for a turn if their attack did nothing
							if (KDRandom() < 0.4) KinkyDungeonSetEnemyFlag(enemy, "failAttack", 1);
						}
						data.happened += dmg.happened;
						if (staminaDamage) {
							KinkyDungeonChangeStamina(-staminaDamage, false, 1, false, KDGetStamDamageThresh());
							data.happened += staminaDamage;
						}
						if (!enemy.playWithPlayer)
							KinkyDungeonSetFlag("NPCCombat",  3);
						happened = data.happened;
						dmgString = dmg.string || TextGet("KDNoDamage");
						replace.push({keyword:"DamageTaken", value: dmgString});
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
						let damaged = KinkyDungeonDamageEnemy(player, {type: enemy.Enemy.dmgType, damage: dmg}, false, true, undefined, undefined, enemy);
						if (!(damaged > 0)) {
							// Sometimes enemies will flinch for a turn if their attack did nothing
							if (KDRandom() < 0.7) KinkyDungeonSetEnemyFlag(enemy, "failAttack", 1);
						}
						happened += damaged;
						KinkyDungeonSetFlag("NPCCombat",  3);
						KinkyDungeonTickBuffTag(enemy, "hit", 1);
						if (happened > 0) {
							// Decrement play timer on a hit, less if they are on furniture
							if (enemy.playWithPlayer) {
								if (!KDEntityHasFlag(enemy, "playOpin")) {
									KDAddOpinionPersistent(enemy.id, 10);
									KinkyDungeonSetEnemyFlag(enemy, "playOpin", -1);
								}
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
							if (!enemy.Enemy.failAttackflagChance || KDRandom() < enemy.Enemy.failAttackflagChance)
								for (let f of enemy.Enemy.failAttackflag) {
									KinkyDungeonSetFlag(f, enemy.Enemy.failAttackflagDuration || 12);
									KDSetIDFlag(enemy.id, "wander", 0);
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

						let sfx = (AIData.hitsfx) ? AIData.hitsfx :
						AIData.damage == "pain" ? "Slap"
						: (AIData.damage == "grope" ? "Grope"
							: (AIData.damage == "tickle" ? "Tickle"
								: (data.damage > 1 ? "Damage" : "DamageWeak")))
							;
						if (enemy.usingSpecial && enemy.Enemy.specialsfx) sfx = enemy.Enemy.specialsfx;
						KinkyDungeonSendEvent("hit", data);
						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg", enemy);
						let text = TextGet("Attack"+enemy.Enemy.name + suffix).KDReplaceOrAddDmg(dmgString);
						if (replace)
							for (let R = 0; R < replace.length; R++)
								text = text.replace(replace[R].keyword, "" + replace[R].value);
						KinkyDungeonSendTextMessage(happened+priorityBonus, text, msgColor, 1,
							false, false, undefined, "Self");
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

		first = false;
	}
	if (first) {
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
		&& !KDEnemyHasFlag(enemy, "nocast")
		&& (!enemy.Enemy.enemyCountSpellLimit || KDMapData.Entities.length < enemy.Enemy.enemyCountSpellLimit)
		&& ((!player.player || (AIData.aggressive || (KDGameData.PrisonerState == 'parole' && enemy.Enemy.spellWhileParole))))
		&& (!enemy.blind || enemy.blind < 0.01 || AIData.playerDist < 2.99)
		&& (!enemy.Enemy.noSpellDuringAttack || enemy.attackPoints < 1)
		&& (!enemy.Enemy.noSpellsWhenHarmless || !AIData.harmless)
		&& (!enemy.Enemy.noSpellsLowSP || KinkyDungeonHasWill(0.1) || KinkyDungeonFlags.has("PlayerCombat"))
		&& (!enemy.Enemy.noSpellLeashing || KinkyDungeonLeashingEnemy()?.id != enemy.id || KDGameData.KinkyDungeonLeashedPlayer < 1)
		&& (!enemy.Enemy.followLeashedOnly || (KDGameData.KinkyDungeonLeashedPlayer < 1 || KinkyDungeonLeashingEnemy()?.id == enemy.id))
		&& (AIData.hostile || (!player.player && (KDHostile(player) || enemy.rage)))
		&& ((KDEnemyReallyAware(enemy, player) && (KDCanDetect(enemy, player))) || (!KDAllied(enemy) && !AIData.hostile))
		&& !AIData.ignore && (!AIData.moved || enemy.Enemy.castWhileMoving) && enemy.Enemy.attack.includes("Spell")
		&& !AIData.ignoreRanged
		&& AIType.spell(enemy, player, AIData)
		&& KinkyDungeonCheckLOS(enemy, player, AIData.playerDist, AIData.visionRadius, false, true) && enemy.castCooldown <= 0) {
			AIData.idle = false;
			let spellchoice: string = null;
			let spell: spell = null;
			let spelltarget: entity = undefined;

			let spellPriority = [];
			if (enemy.Enemy.Magic?.priority) {
				spellPriority = Object.entries(enemy.Enemy.Magic.priority);
				spellPriority.sort((a, b) => {
					return b[1] - a[1];
				});
			}


			for (let tries = 0; tries < 6 + spellPriority.length; tries++) {
				spelltarget = null;
				if (tries < spellPriority.length) {
					spellchoice = spellPriority[tries][0];
				} else {
					spellchoice = enemy.Enemy.spells[Math.floor(KDRandom()*enemy.Enemy.spells.length)];
				}
				spell = KinkyDungeonFindSpell(spellchoice, true);
				if (spell?.targetPlayerOnly && !player.player) spell = null;
				if (spell && (enemy.blind > 0 && (spell.projectileTargeting)) && !KDCanHearEnemy(enemy, player, 1.2)) spell = null;
				if (spell && ((!spell.castRange && AIData.playerDist > KDGetSpellRange(spell)) || (spell.castRange && AIData.playerDist > spell.castRange))) spell = null;
				if (spell && spell.specialCD && enemy.castCooldownSpecial > 0) spell = null;
				if (spell && enemy.castCooldownUnique && enemy.castCooldownUnique[spell.name] > 0) spell = null;
				if (spell && spell.noFirstChoice && tries <= 2) spell = null;
				if (spell && spell.projectileTargeting && !KinkyDungeonCheckProjectileClearance(enemy.x, enemy.y, player.x, player.y, !player.player && !spell.noFF)) spell = null;
				if (spell && spell.buff) {
					if (enemy.Enemy.buffallies || spell.buffallies) {
					// Select a random nearby ally of the enemy
						let nearAllies = [];
						for (let e of KDMapData.Entities) {
							if ((e != enemy || spell.selfbuff) && (!spell.heal || e.hp < e.Enemy.maxhp - spell.power*0.5)
							&& e.aware && !KinkyDungeonHasBuff(e.buffs, spell.name)
							&& !e.rage
							&& ((KDAllied(enemy) && KDAllied(e)) || (!KDHostile(enemy, e)
								&& KDFactionRelation(KDGetFaction(e), KDGetFaction(enemy)) >= 0.1))
							&& Math.sqrt((enemy.x - e.x)*(enemy.x - e.x) + (enemy.y - e.y)*(enemy.y - e.y)) < KDGetSpellRange(spell)
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
								KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonSpellCast" + spell.name).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "#ffffff", 2,
									false, false, undefined, "Combat");
								break;
							}
						} else spell = null;
					} else {
						spelltarget = enemy;
						if (spell.castCondition && (!KDCastConditions[spell.castCondition] && !KDCastConditions[spell.castCondition](enemy, enemy, spell))) spell = null;
					}
				} else if (spell?.castCondition && (KDCastConditions[spell.castCondition] && !KDCastConditions[spell.castCondition](enemy, player, spell))) spell = null;
				let minSpellRange = (spell && spell.minRange != undefined) ? spell.minRange : ((spell && (spell.selfcast || (enemy.Enemy.selfCast && enemy.Enemy.selfCast[spell.name]) || spell.buff || (spell.range && KDGetSpellRange(spell) < 1.6))) ? 0 : 1.5);
				if (spell && spell.heal && spelltarget.hp >= spelltarget.Enemy.maxhp) spell = null;
				if (spell && !(!minSpellRange || (AIData.playerDist > minSpellRange))) spell = null;
				if (spell && !(!spell.minRange || (AIData.playerDist > spell.minRange))) spell = null;
				if (spell) break;
			}
			if (spell && !enemy.Enemy.noMiscast && KDRandom() < KDGetEnemyMiscast(enemy)) {
				if (player == KinkyDungeonPlayerEntity) KinkyDungeonSendTextMessage(4,
					TextGet(enemy.Enemy.miscastmsg || "KDEnemyMiscast").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "#ff88ff", 2,
					false, false, undefined, "Combat");
				if (spell?.components?.includes("Verbal")) KinkyDungeonSetEnemyFlag(enemy, "verbalcast", 2);

				KinkyDungeonCastSpell(enemy.x, enemy.y,
				KinkyDungeonFindSpell("EnemyMiscast", true), enemy, player);
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + (enemy.Enemy.miscastsfx || "SoftShield") + ".ogg", enemy);
				KinkyDungeonSendEvent("enemyMiscast", {spell: spell, enemy: enemy, player: player, AIData: AIData});

				if (KDRandom() < actionDialogueChanceIntense)
					KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailMiscast" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : ""))
						.replace("EnemyName", TextGet("Name" + enemy.Enemy.name))
						.replace("SPL", TextGet("KinkyDungeonSpell" + spell.name)), KDGetColor(enemy), 2, 3);

				KDEnemyAddSound(enemy, enemy.Enemy.Sound?.castAmount != undefined ? enemy.Enemy.Sound?.castAmount : KDDefaultEnemyCastSound);
			} else if (spell) {
				if (spell.channel && !enemy.Enemy.noChannel) enemy.channel = spell.channel;
				enemy.castCooldown = spell.manacost*enemy.Enemy.spellCooldownMult + enemy.Enemy.spellCooldownMod + 1;
				if (spell.specialCD)
					enemy.castCooldownSpecial = spell.specialCD;
				if (enemy.Enemy.Magic?.castCooldownUnique && enemy.Enemy.Magic.castCooldownUnique[spell.name] != undefined) {
					if (!enemy.castCooldownUnique) enemy.castCooldownUnique = {};
					enemy.castCooldownUnique[spell.name] = enemy.Enemy.Magic.castCooldownUnique[spell.name];
				}
				let xx = player.x;
				let yy = player.y;
				if (AIData.playerDist > 1.5 && enemy.blind > 0) {
					let pp = KinkyDungeonGetNearbyPoint(xx, yy, true, undefined, true,
						true, undefined, true, true
					);
					if (pp) {
						xx = pp.x;
						yy = pp.y;
					}
				}

				if (spelltarget) {
					xx = spelltarget.x;
					yy = spelltarget.y;
				}
				if (spell.extraDist) {
					xx += spell.extraDist * (xx - enemy.x) / AIData.playerDist;
					yy += spell.extraDist * (yy - enemy.y) / AIData.playerDist;
				}
				if (spell && (spell.selfcast || (enemy.Enemy.selfCast && enemy.Enemy.selfCast[spell.name]))) {
					xx = enemy.x;
					yy = enemy.y;
					if (!spell.noCastMsg)
						KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonSpellCast" + spell.name).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "#ff8844", 4, undefined, undefined, enemy,
							"Combat");
				} else if (spell && spell.msg) {

					if (!spell.noCastMsg)
						KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonSpellCast" + spell.name).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), "#ff8844", 4, undefined, undefined, enemy,
							"Combat");
				}


				if (spell && KinkyDungeonCastSpell(xx, yy, spell, enemy, player).result == "Cast" && spell.sfx) {
					if (spell?.components?.includes("Verbal")) KinkyDungeonSetEnemyFlag(enemy, "verbalcast", 3);
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

				if (KDRandom() < actionDialogueChanceIntense)
					KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailCast" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : ""))
						.replace("EnemyName", TextGet("Name" + enemy.Enemy.name))
						.replace("SPL", TextGet("KinkyDungeonSpell" + spell.name)), KDGetColor(enemy), 2, 3);

				KDEnemyAddSound(enemy, enemy.Enemy.Sound?.castAmount != undefined ? enemy.Enemy.Sound?.castAmount : KDDefaultEnemyCastSound);

			//console.log("casted "+ spell.name);
			}
		}
		if (AIData.vibe || (enemy.Enemy.RemoteControl?.remote && AIData.playerDist < enemy.Enemy.RemoteControl?.remote && player?.player)) {
			KinkyDungeonSendEvent("remoteVibe", {enemy: enemy.Enemy.name, power: enemy.Enemy.RemoteControl?.remoteAmount ? enemy.Enemy.RemoteControl?.remoteAmount : 5, overcharge: AIData.vibe, noSound: AIData.vibe});
		}
		if (AIData.aggressive && AIData.canSensePlayer && enemy.Enemy.RemoteControl?.punishRemote && AIData.playerDist < enemy.Enemy.RemoteControl?.punishRemote && player?.player) {
			KinkyDungeonSendEvent("remotePunish", {enemy});
		}


		if (enemy.aware && enemy.idle && (!KDEnemyHasFlag(enemy, "targ_player") ? (enemy.vp || 0) < sneakThreshold : ((enemy.vp || 0) < sneakThreshold * 0.25 && !enemy.path && !AIData.canSensePlayer))) {
			if (enemy.aware) KDAddThought(enemy.id, "Lose", 1, 4);
			enemy.aware = false;
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

	if (AIData.ignore) enemy.ignore = true;
	else delete enemy.ignore;

	return {idle: AIData.idle, defeat: AIData.defeat, defeatEnemy: enemy};
}

// Unique ID for enemies, to prevent bullets from hitting them
// Dont want to pass object handles around
function KinkyDungeonGetEnemyID() {
	if (KinkyDungeonEnemyID > 100000000) KinkyDungeonEnemyID = 1;
	return KinkyDungeonEnemyID++;
}
// Unique ID for enemies, to prevent bullets from hitting them
// Dont want to pass object handles around
function KinkyDungeonGetSpellID() {
	if (KinkyDungeonSpellID > 100000000) KinkyDungeonSpellID = 1;
	return KinkyDungeonSpellID++;
}
// Unique ID for items for identification reasons
// Dont want to pass object handles around
function KinkyDungeonGetItemID() {
	if (KDGameData.ItemID > 100000000 || KDGameData.ItemID == undefined) KDGameData.ItemID = 1;
	return KDGameData.ItemID++;
}

// Unique ID for items for identification reasons
// Dont want to pass object handles around
function KinkyDungeonGetRegimentID() {
	if (KDGameData.RegimentID > 100000000 || KDGameData.RegimentID == undefined) KDGameData.RegimentID = 1;
	return KDGameData.RegimentID++;
}

let KinkyDungeonEnemyID = 1;
let KinkyDungeonSpellID = 1;

function KinkyDungeonNoEnemy(x: number, y: number, Player?: boolean): boolean {

	if (KinkyDungeonEnemyAt(x, y)) return false;
	if (Player)
		for (let player of KinkyDungeonPlayers)
			if ((player.x == x && player.y == y)) return false;
	return true;
}

/**
 * @param enemy
 * @param [strict]
 */
function KDIsImmobile(enemy: entity, strict?: boolean): boolean {
	return enemy?.Enemy && (enemy.Enemy.immobile || enemy.immobile > 0 || (!strict && enemy.Enemy.tags?.immobile) || KDEnemyHasFlag(enemy, "imprisoned"));
}

// e = potential sub
// Enemy = leader
/**
 *
 * @param e - Target enemy
 * @param Enemy - Enemy trying to move
 * @returns
 */
function KinkyDungeonCanSwapWith(e: entity, Enemy: entity): boolean {
	if ((
		(KDIsImmobile(e) && (e.Enemy.immobile))
		|| e.Enemy?.pathcondition
	) &&
		(!e.Enemy?.pathcondition || !(
			KDPathConditions[e.Enemy.pathcondition]
			&& !KDPathConditions[e.Enemy.pathcondition].query(Enemy, e)
		))) return false; // Fail path conditions
	if (e && KDEnemyHasFlag(e, "noswap")) return false; // Definition of noSwap
	if (Enemy && KDEnemyHasFlag(Enemy, "donotswap")) return false; // Definition of noSwap

	if (Enemy && Enemy.Enemy && Enemy.Enemy.ethereal && e && e.Enemy && !e.Enemy.ethereal) return false; // Ethereal enemies NEVER have seniority, this can teleport other enemies into walls
	if (Enemy && Enemy.Enemy && (Enemy.Enemy.squeeze && KinkyDungeonMapGet(Enemy.x, Enemy.y) == 'b') && e && e.Enemy && !e.Enemy.squeeze) return false; // Squeeze enemies NEVER have seniority, this can teleport other enemies into walls
	if (Enemy && Enemy.Enemy && (Enemy.Enemy.earthmove && KinkyDungeonMapGet(Enemy.x, Enemy.y) == '4') && e && e.Enemy && !e.Enemy.earthmove) return false; // Squeeze enemies NEVER have seniority, this can teleport other enemies into walls

	if (!e.Enemy.tags || (e.Enemy.tags.scenery && !Enemy.Enemy.tags.scenery))
		return true;

	// Only jailguard or aggressive enemy is allowed to swap into offlimits spaces unless hostile

	// Should not swap or block the leasher
	if (e == KinkyDungeonLeashingEnemy() && Enemy) return false;
	if (KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, e.x, e.y, e)) return false; // KD Tethered to entity
	if (e == KinkyDungeonJailGuard() && Enemy != KinkyDungeonLeashingEnemy()) return false;
	if (Enemy == KinkyDungeonLeashingEnemy() || KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, Enemy.x, Enemy.y, Enemy)) return true;
	if (Enemy == KinkyDungeonJailGuard()) return true;
	if (KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, Enemy.x, Enemy.y, Enemy)) return true; // KD Tethered to entity

	// I HAVE THINGS TO DO
	if (e && KDEnemyHasFlag(Enemy, "overrideMove") && !KDEnemyHasFlag(e, "overrideMove")) return true;
	if (e && !KDEnemyHasFlag(Enemy, "overrideMove") && KDEnemyHasFlag(e, "overrideMove")) return false;

	if (KinkyDungeonTilesGet(e.x + "," + e.y) && KinkyDungeonTilesGet(e.x + "," + e.y).OL && Enemy != KinkyDungeonJailGuard() && Enemy != KinkyDungeonLeashingEnemy() && !KinkyDungeonAggressive(Enemy)) return false;


	if (e.idle && !Enemy.idle) return true;
	if (KDBoundEffects(e) > 3) return true;
	else if (!e.Enemy.tags || (e.Enemy.tags.minor && !Enemy.Enemy.tags.minor))
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
	if (KDEnemyHasFlag(e, "CMDR_stationed") && !KDEnemyHasFlag(Enemy, "CMDR_stationed")) return true;
	if (KDEnemyHasFlag(e, "allowpass") && !KDEnemyHasFlag(Enemy, "allowpass")) return true;
	return false;
}

function KinkyDungeonNoEnemyExceptSub(x: number, y: number, Player: boolean, Enemy: entity): boolean {
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

function KinkyDungeonNoEnemyExceptID(x: number, y: number, Player: boolean, ID: number): boolean {
	let e = KinkyDungeonEnemyAt(x, y);
	if (e) {
		if (ID && e?.id == ID) return true;
		return false;
	}
	if (Player)
		for (let pp of KinkyDungeonPlayers)
			if ((pp.x == x && pp.y == y)) return false;
	return true;
}

function KinkyDungeonEnemyAt(x: number, y: number): entity {
	let cache = KDGetEnemyCache();
	if (cache) return cache.get(x + "," + y);
	for (let enemy of KDMapData.Entities) {
		if (enemy.x == x && enemy.y == y)
			return enemy;
	}
	return null;
}

/**
 * @param x
 * @param y
 * @param [requireVision]
 * @param [vx] - vision x, usually player x
 * @param [vy] - vision y, usually player y
 * @param [player]
 */
function KinkyDungeonEntityAt(x: number, y: number, requireVision: boolean = false, vx?: number, vy?: number, player: boolean = true): entity {
	if (player && KinkyDungeonPlayerEntity.x == x && KinkyDungeonPlayerEntity.y == y) return KinkyDungeonPlayerEntity;
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

let KDDefaultEnemySprint = 1.5;

function KinkyDungeonEnemyTryMove (
	enemy:      entity,
	Direction:  { x: number, y: number, delta: number },
	delta:      number,
	x:          number,
	y:          number,
	canSprint:  boolean
)
{
	let speedMult = KinkyDungeonGetBuffedStat(enemy.buffs, "MoveSpeed") ? KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(enemy.buffs, "MoveSpeed")) : 1;
	if (canSprint && KDEnemyCanSprint(enemy)) {
		speedMult *= enemy.Enemy.sprintspeed || KDDefaultEnemySprint;
		KDEnemyChangeSprint(enemy, delta);
		enemy.sprinted = true;
	}

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

		if (!ee && KinkyDungeonMapGet(enemy.x, enemy.y) == 'd' && enemy.Enemy
			&& (enemy.Enemy.tags.closedoors
			|| (enemy.Enemy.tags.opendoors && KinkyDungeonTilesGet(x + ',' +y)?.OGLock))
			&& !(KDGameData.KinkyDungeonLeashedPlayer > 0 || KinkyDungeonFlags.has("noclosedoors"))
			&& ((dist > 5) ||
				(KinkyDungeonTilesGet(enemy.x + "," + enemy.y) && KDHostile(enemy) && (KinkyDungeonTilesGet(enemy.x + "," + enemy.y).Jail || KinkyDungeonTilesGet(enemy.x + "," + enemy.y).ReLock) && !KinkyDungeonFlags.has("nojailbreak")))) {
			KinkyDungeonMapSet(enemy.x, enemy.y, 'D');
			if ((KDGameData.PrisonerState == 'jail' || KinkyDungeonTilesGet(enemy.x + "," + enemy.y)?.OGLock)
				&& KinkyDungeonTilesGet(enemy.x + "," + enemy.y)
				&& KDHostile(enemy)
				&& (KinkyDungeonTilesGet(enemy.x + "," + enemy.y).Jail || KinkyDungeonTilesGet(enemy.x + "," + enemy.y).ReLock || KinkyDungeonTilesGet(enemy.x + "," + enemy.y).OGLock)
				&& (!KinkyDungeonFlags.has("nojailbreak") || KinkyDungeonTilesGet(enemy.x + "," + enemy.y)?.OGLock)
				&& KDShouldLock(enemy.x, enemy.y, KinkyDungeonTilesGet(enemy.x + ',' +enemy.y))) {
				KinkyDungeonTilesGet(enemy.x + "," + enemy.y).Type = "Door";
				KinkyDungeonTilesGet(enemy.x + "," + enemy.y).Lock =  KinkyDungeonTilesGet(enemy.x + "," + enemy.y).OGLock || "Red";
				KDUpdateDoorNavMap();
			}
			if (dist < 10) {
				KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonHearDoorCloseNear"), "#dddddd", 4,
					false, false, undefined, "Ambient");
			} else if (dist < 20)
				KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonHearDoorCloseFar"), "#999999", 4,
					false, false, undefined, "Ambient");
		}

		if (ee && KinkyDungeonCanSwapWith(ee, enemy)) {
			let move = 1;
			if (ee.Enemy?.pathcondition
				&& KDPathConditions[ee.Enemy.pathcondition]
				&& KDPathConditions[ee.Enemy.pathcondition].doPassthrough
			) {
				move = KDPathConditions[ee.Enemy.pathcondition].doPassthrough(enemy, ee, KDMapData);
			}
			if (move == 1) {
				KDMoveEntity(ee, enemy.x, enemy.y, false,undefined, undefined, true);
				KinkyDungeonSetEnemyFlag(enemy, "fidget", 0);
				ee.warningTiles = [];
				ee.movePoints = 0;
				ee.stun = 1;
				KinkyDungeonSetEnemyFlag(ee, "donotswap", 4);
				KinkyDungeonSetEnemyFlag(ee, "fidget", 0);
			} else if (move == 0) {
				return false;
			}
		} else if (KinkyDungeonEntityAt(enemy.x + Direction.x, enemy.y + Direction.y)?.player) {
			KDMovePlayer(enemy.x, enemy.y, false, false, false, true);
		}
		if (!ee || !KinkyDungeonEnemyAt(enemy.x + Direction.x, enemy.y + Direction.y)) {
			KDMoveEntity(enemy, enemy.x + Direction.x, enemy.y + Direction.y, true,undefined, undefined, true);
			KinkyDungeonSetEnemyFlag(enemy, "nofidget", 3);
		}

		if (KinkyDungeonMapGet(x, y) == 'D' && enemy.Enemy && enemy.Enemy.tags.opendoors) {
			KinkyDungeonMapSet(x, y, 'd');
			if (KinkyDungeonTilesGet(x + ',' +y)
				&& KinkyDungeonTilesGet(x + ',' +y).Type == "Door"
				&& KDShouldUnLock(x, y, KinkyDungeonTilesGet(x + ',' +y))) {
				KinkyDungeonTilesGet(x + ',' +y).OGLock = KinkyDungeonTilesGet(x + ',' +y).Lock;
				KinkyDungeonTilesGet(x + ',' +y).Lock = undefined;
			}
			if (dist < 5) {
				KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonHearDoorOpenNear"), "#dddddd", 4,
					false, false, undefined, "Ambient");
			} else if (dist < 15)
				KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonHearDoorOpenFar"), "#999999", 4,
					false, false, undefined, "Ambient");
		}

		return true;
	}
	return false;
}

function KinkyDungeonEnemyTryAttack (
	enemy:                entity,
	player:               any,
	Tiles:                any,
	delta:                number,
	_x:                   number,
	_y:                   number,
	points:               number,
	_replace:             any,
	_msgColor:            any,
	_usingSpecial:        boolean,
	refreshWarningTiles:  boolean,
	attack:               string,
	MovableTiles:         string
): boolean
{
	if (!enemy.Enemy.noCancelAttack && !refreshWarningTiles && points > 1) {
		let playerIn = false;
		for (let T = 0; T < Tiles.length; T++) {
			let ax = enemy.x + Tiles[T].x;
			let ay = enemy.y + Tiles[T].y;

			if (player.x == ax && player.y == ay && (!enemy.Enemy.strictAttackLOS || KinkyDungeonCheckProjectileClearance(enemy.x, enemy.y, player.x, player.y, false))) {
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
	if (enemy.attackBonus) {
		enemy.attackPoints += enemy.attackBonus * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(enemy.buffs, "AttackSpeed"));
		enemy.attackBonus = 0;
	}
	if (!enemy.playWithPlayer)
		KinkyDungeonSetFlag("NPCCombat",  3);

	if (enemy.attackPoints >= points) {
		enemy.attackPoints = enemy.attackPoints - points;
		return true;
	}
	return false;
}

type warningTileEntry = {
	x:         number;
	y:         number;
	visual_x:  number;
	visual_y:  number;
	scale:     number;
}

function KinkyDungeonGetWarningTilesAdj(enemy: entity): warningTileEntry[] {
	let arr: warningTileEntry[] = [];

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
 * @param player
 */
function KDCanPickpocketPlayer(_player: entity): boolean {
	return !KinkyDungeonHasWill(5) || KDIsPlayerTethered(KinkyDungeonPlayerEntity);
}

function KDCanPickpocket(enemy: entity) {
	if (enemy.Enemy.attack?.includes("Suicide")) return false;
	if (KDEnemyHasFlag(enemy, "allyPlay")) return false;
	if (KinkyDungeonFlags.has("pickpocket")) return false;
	if (KDAllied(enemy)) return false;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).enclose) return false;
	}
	return KDHostile(enemy) || ((KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'parole') && KinkyDungeonPlayerTags.has("Furniture"));
}


function KinkyDungeonGetWarningTiles(dx: number, dy: number, range: number, width: number, forwardOffset: number = 1, enemy: entity): warningTileEntry[] {
	if (range == 1 && width == 8) return KinkyDungeonGetWarningTilesAdj(enemy);

	let arr: warningTileEntry[] = [];
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
 * @param enemy
 */
function KinkyDungeonFindMaster(enemy: entity): { master: entity; dist: number; info: any; } {
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

function KinkyDungeonEnemyCanMove(enemy: entity, dir: { x: number, y: number, delta: number }, MovableTiles: string, AvoidTiles: string, ignoreLocks: boolean, Tries: number) {
	if (!dir) return false;
	let master = enemy.master || enemy.Enemy.master;
	let xx = enemy.x + dir.x;
	let yy = enemy.y + dir.y;
	if (master && (!master.aggressive || !enemy.aware || enemy.ignore)) {
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
		&& KinkyDungeonNoEnemyExceptSub(xx, yy, !KinkyDungeonLeashingEnemy(), enemy);
}

/**
 * @param id
 * @param [mapData]
 * @returns {entity}
 */
function KinkyDungeonFindID(id: number, mapData?: KDMapDataType): entity {
	if (!mapData || mapData == KDMapData) {
		if (KDIDCache.get(id)) return KDIDCache.get(id);
		for (let e of KDMapData.Entities) {
			if (e.id == id) return e;
		}
	} else {
		for (let e of mapData.Entities) {
			if (e.id == id) return e;
		}
	}
	return null;
}

/**
 *
 * @param {number} id
 * @returns {entity}
 */
function KDLookupID(id: number, allowPlayer: boolean = true): entity {
	if (allowPlayer && id == -1) return KDPlayer();
	if (KDIDCache.get(id)) return KDIDCache.get(id);
	for (let e of KDMapData.Entities) {
		if (e.id == id) return e;
	}
	return null;
}

function KDDash(enemy: entity, player: entity, MovableTiles: string): { happened: number, Dash: boolean } {
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
			enemy.movePoints = 0;
			enemy.path = null;
			happened += 1;
			if (enemy.usingSpecial && enemy.Enemy.specialAttack != undefined && enemy.Enemy.specialAttack.includes("Dash")) {
				enemy.specialCD = enemy.Enemy.specialCD;
			}
		}
	}
	return {happened: happened, Dash: Dash};
}

function KinkyDungeonSendEnemyEvent(Event: string, data: any) {
	if (!KDMapHasEvent(KDEventMapEnemy, Event)) return;
	KDGetEnemyCache();
	if (KDEnemyEventCache.get(Event))
		for (let enemy of KDMapData.Entities) {
			if (enemy.Enemy.events && KDEnemyEventCache.get(Event).get(enemy.id)) {
				for (let e of enemy.Enemy.events) {
					if (e.trigger === Event) {
						KinkyDungeonHandleEnemyEvent(Event, e, enemy, data);
					}
				}
			}
		}
}


/**
 * @param enemy
 * @param data
 * @param play
 * @param allied
 * @param hostile
 * @param aggressive
 */
function KDGetIntentEvent(enemy: entity, data: any, play: boolean, allied: boolean, hostile: boolean, aggressive: boolean): (enemy: entity, aiData: KDAIData) => void {
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
	return (_e, _a) => {};
}

/**
 * @param enemy
 * @param target
 */
function KDGetDir(enemy: entity, target: any, func: typeof KinkyDungeonGetDirectionRandom = KinkyDungeonGetDirectionRandom): { x: number, y: number, delta: number } {
	return (enemy.fx && enemy.fy) ?
		AIData.kite ? func(enemy.x - target.x, enemy.y - target.y) : {x: Math.max(-1, Math.min(1, enemy.fx - enemy.x)), y: Math.max(-1, Math.min(1, enemy.fy - enemy.y)), delta: 1} :
		(AIData.kite ? func(enemy.x - target.x, enemy.y - target.y) : func(target.x - enemy.x, target.y - enemy.y));
}


/**
 * @param enemy
 */
function KDPullResistance(enemy: entity): number {
	let tags = enemy?.Enemy?.tags;
	if (!tags) return;
	return tags.unstoppable ? 0.25 : (tags.unflinching ? 0.5 : 1.0);
}

/**
 * @param power
 * @param enemy
 * @param [allowNeg]
 */
function KDPushModifier(power: number, enemy: entity, allowNeg: boolean = false): number {
	let pushPower = power;
	if (KinkyDungeonIsSlowed(enemy) || enemy.bind > 0) pushPower += 1;
	if (KDEntityHasBuff(enemy, "Chilled")) pushPower += 1;
	if (enemy.freeze) pushPower += 3;
	if (KDEntityBuffedStat(enemy, "Knockback")) pushPower += KDEntityBuffedStat(enemy, "Knockback");
	if (enemy.Enemy.tags.stunimmune) pushPower -= 2;
	else if (enemy.Enemy.tags.stunresist) pushPower -= 1;
	if (enemy.Enemy.tags.unstoppable) pushPower -= 3;
	else if (enemy.Enemy.tags.unflinching || enemy.Enemy.tags.slowresist || enemy.Enemy.tags.slowimmune) pushPower -= 1;
	if (allowNeg) return pushPower;
	return Math.max(0, pushPower);
}

/**
 * @param enemy
 * @param amount
 * @param [type]
 * @param [Damage]
 * @param [Msg]
 * @param [Delay]
 */
function KDTieUpEnemy(enemy: entity, amount: number, type: string = "Leather", Damage?: any, Msg?: any, Delay?: any): any {
	if (!enemy) return 0;
	let data = {
		amount: amount,
		specialAmount: amount,
		type: type, // Type of BONDAGE, e.g. leather, rope, etc
		Damage: Damage,
		Msg: Msg,
		amntAdded: 0,
	};

	KinkyDungeonSendEvent("bindEnemy", data);

	if (data.type) {
		if (!enemy.specialBoundLevel)
			enemy.specialBoundLevel = {};
		let orig = enemy.specialBoundLevel[type] || 0;
		enemy.specialBoundLevel[type] = Math.max(0, (enemy.specialBoundLevel[type] || 0) + data.specialAmount);
		data.amntAdded = (enemy.specialBoundLevel[type] || 0) - orig;
	}
	if (data.amount || data.amntAdded != undefined) {
		enemy.boundLevel = Math.max(0, (enemy.boundLevel || 0) + (data.amntAdded != undefined ? data.amntAdded : data.amount));
	}

	if (data.Msg) {
		KDDamageQueue.push({floater: TextGet("KDTieUp").replace("AMNT",
			Math.round((data.amntAdded != undefined ? data.amntAdded : data.amount)*10) + ""),
		Entity: enemy, Color: "#ff8933", Delay: Delay});
	}

	return data;
}

/**
 * @param enemy
 * @param struggleMod
 * @param delta
 * @param [allowStruggleAlwaysThresh]
 */
function KDPredictStruggle(enemy: entity, struggleMod: number, delta: number, allowStruggleAlwaysThresh?: number): any {
	let data = {
		enemy: enemy,
		struggleMod: struggleMod,
		delta: delta,
		boundLevel: enemy.boundLevel || 0,
		specialBoundLevel: enemy.specialBoundLevel ? Object.assign({}, enemy.specialBoundLevel): {},
		minBoundAmounts: {},
		minBoundLevel: 0,
	};

	if (allowStruggleAlwaysThresh && enemy.boundLevel > enemy.Enemy.maxhp * allowStruggleAlwaysThresh) {
		// In this block we limit the NPC from struggling below any certain amount limited by restraints, but only if the total binding is above the restraint level
		// Note that if this gets below the expected amount then the NPC can get totally free
		let expected = KDGetExpectedBondageAmount(enemy.id, enemy);
		for (let bt of Object.entries(expected)) {
			data.minBoundAmounts[bt[0]] = (data.minBoundAmounts[bt[0]] || 0) + bt[1];
			data.minBoundLevel += bt[1];
		}
	}


	let minLevel = Math.max(data.minBoundLevel,
		(enemy.buffs && KinkyDungeonGetBuffedStat(enemy.buffs, "MinBoundLevel"))
			? KinkyDungeonGetBuffedStat(enemy.buffs, "MinBoundLevel")
			: 0);

	if (Object.keys(data.specialBoundLevel).length < 1) {
		// Simple math, reduce bound level, dont have to worry.
		data.struggleMod *= (10 + Math.pow(Math.max(0.01, enemy.hp ** KDEnemyStruggleHPExp), 0.75));
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
				totalCost *= 10/(10 + hBoost * Math.pow(enemy.hp, 0.9));
			totalCost *= 3/(3 + (pBoost * enemy.Enemy.power || 0));
			totalCost *= 2/(2 + (mBoost * enemy.Enemy.unlockCommandLevel || 0));

			let effect = Math.min(data.struggleMod, totalCost);
			let difference = layer[1] * (totalCost ? (effect / totalCost) : 1);
			let origBL = data.boundLevel;
			data.boundLevel = Math.max(minLevel, data.boundLevel - difference);
			data.specialBoundLevel[layer[0]] -= Math.max(0, origBL - data.boundLevel);

			if (data.minBoundAmounts[layer[0]] && data.specialBoundLevel[layer[0]] <= data.minBoundAmounts[layer[0]]) {
				if (data.specialBoundLevel[layer[0]] < data.minBoundAmounts[layer[0]]) {
					data.struggleMod -= effect;
					data.specialBoundLevel[layer[0]] = data.minBoundAmounts[layer[0]];
				}
				// No struggle mod change
			} else {
				data.struggleMod -= effect;
			}
			if (data.specialBoundLevel[layer[0]] <= 0) delete data.specialBoundLevel[layer[0]];
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
 * @param enemy - the enemy to check if the player can domme
 * @param ignoreRelative - ignore the relative determinants
 */
function KDCanDom(enemy: entity, ignoreRelative: boolean = false): boolean {
	if (!ignoreRelative) {
		if ((enemy == KinkyDungeonJailGuard() || enemy == KinkyDungeonLeashingEnemy())) return false;
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
 */
function KDPlayerIsNotDom(): boolean {
	return KDGameData.KinkyDungeonLeashedPlayer > 1 || KinkyDungeonStatsChoice.get("Submissive") || KDPlayerIsTied();
}
/**
 * Returns true if player has any level of bondage
 */
function KDPlayerIsTied(): boolean {
	return KinkyDungeonSlowLevel > 1 || KinkyDungeonGagTotal() > 0.25 || KinkyDungeonIsArmsBound() || KinkyDungeonIsHandsBound() ;
}


/**
 * is this entity objectively subby
 * @param entity
 */
function KDIsSubbyPersonality(entity: entity): boolean {
	if (entity && !entity.player) {
		if (KDCanDom(entity, true)) return true;
	}
	return false;
}

/**
 * is this entity objectively bratty
 * @param entity
 */
function KDIsBrattyPersonality(entity: entity): boolean {
	if (entity && !entity.player) {
		if (KDIsSubbyPersonality(entity) && KinkyDungeonStatsChoice.get("OnlyBrats")) return true;
		if (KDEnemyPersonalities[entity.personality]?.brat || KDEnemyHasFlag(entity, "forcebrat")) return true;
	}
	return false;
}

/**
 * Is this entity bratty to the player
 * @param enemy
 */
function KDIsBrat(enemy: entity): boolean {
	if (KinkyDungeonStatsChoice.get("OnlyBrats")) return true;
	if (KinkyDungeonStatsChoice.get("NoBrats")) return false;
	if (!KDEnemyPersonalities[enemy.personality]?.brat && !KDEnemyHasFlag(enemy, "forcebrat")) return false;
	if (KDPlayerIsNotDom()) return false;
	return true;
}

/**
 * Captures helpless enemies near the enemy
 * @param enemy
 */
function KDCaptureNearby(enemy: entity) {
	let enemies = KDNearbyEnemies(enemy.x, enemy.y, 1.5, enemy);
	for (let en of enemies) {
		if (KDHelpless(en) && en.hp < 0.52) {
			en.hp = 0;
		}
	}
}

/**
 * @param enemy
 * @param guaranteed
 */
function KinkyDungeonGetLoadoutForEnemy(enemy: entity, guaranteed: boolean): string {
	if (enemy.Enemy.tags.noshop) return "";
	let loadout_list: Record<string, number> = {};
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
 * @param key - The base text key
 * @param enemy - The enemy
 * @param useName - Whether to use the enemy name or faction
 */
function KinkyDungeonGetTextForEnemy(key: string, enemy: entity, useName: boolean = false): string {
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
		|| (KinkyDungeonStatBlind > 0 || KinkyDungeonStatBind > 0 || KinkyDungeonStatFreeze > 0 || (KinkyDungeonFlags.get("playerStun") && !KinkyDungeonFlags.get("channeling")) || KDGameData.SleepTurns > 0);
}

function KDPlayerIsStunned() {
	return KinkyDungeonStatBlind > 0 || KinkyDungeonFlags.get("playerStun") || KDGameData.SleepTurns > 0 || KinkyDungeonStatFreeze > 0;
}
function KDPlayerIsImmobilized() {
	return KinkyDungeonSlowLevel > 9 || KinkyDungeonGetRestraintItem("ItemDevices");
}

function  KDPlayerIsSlowed() {
	return KinkyDungeonSlowLevel > 1 || KDPlayerIsStunned() || KinkyDungeonSleepiness > 0
		|| (KDGameData.MovePoints < 0 || KDGameData.KneelTurns > 0);
}


function KDEnemyReallyAware(enemy: entity, player: any): boolean {
	return (enemy.aware && (!player?.player || enemy.vp > 0.5));
}

/**
 * @param enemy
 */
function KDGetAwareTooltip(enemy: entity): {suff: string, color: string} {
	if (KDGameData.CurrentDialog && KDGetSpeaker() == enemy && (enemy.aware || enemy.vp > 2)) return {
		suff: "Talking",
		color: "#ffffff",
	};
	if (KDEnemyReallyAware(enemy, KinkyDungeonPlayerEntity)) {
		if (KDHostile(enemy)) {
			if (enemy.ignore) return {
				suff: "AwareIgnore",
				color: "#ffff55",
			};
			return {
				suff: "Aware",
				color: "#ff5555",
			};
		} else return {
			suff:  "AwareFriendly",
			color: "#ffffff",
		};
	}
	if (enemy.aware && enemy.ignore) return {
		suff: "AwareIgnore",
		color: "#ffff55",
	};
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
		color: "#f0dc41",
	};
	return {
		suff: "Unnoticed",
		color: "#88ff88",
	};
}

/**
 * @param lock
 */
function KDProcessLock(lock: string): string {
	if (lock == "Red") return KDRandomizeRedLock();
	else return lock;
}


let KDDefaultRestraintThresh = 3;

/**
 * @param enemy
 * @param restMult
 */
function KDRestockRestraints(enemy: entity, restMult: number) {
	if ((enemy.Enemy.attack?.includes("Bind") || enemy.Enemy.specialAttack?.includes("Bind"))
		&& !enemy.Enemy.RestraintFilter?.noRestock && !KDEnemyHasFlag(enemy, "restocked")) {
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
 * @param enemy
 * @param restMult
 */
function KDDetermineBaseRestCount(enemy: entity, restMult: number): number {
	let rCount = 1;
	if (enemy.Enemy.RestraintFilter?.unlimitedRestraints && !enemy.Enemy.RestraintFilter?.forceStock)
		return 0;
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
 * @param enemy
 * @param restMult
 * @param [count]
 */
function KDStockRestraints(enemy: entity, restMult: number, count?: number) {
	if (!enemy.items) enemy.items = [];
	let rCount = count || KDDetermineBaseRestCount(enemy, restMult);
	let rThresh = enemy.Enemy.RestraintFilter?.powerThresh || (KDDefaultRestraintThresh + (Math.max(0, enemy.Enemy.power - 1) || 0));
	if (rCount > 0) enemy.items = enemy.items || [];
	for (let i = 0; i < rCount; i++) {
		let r = KDGetRestraintWithVariants(
			{tags: KDGetTags(enemy, false)}, KDGetEffLevel() + (enemy.Enemy.RestraintFilter?.levelBonus || enemy.Enemy.power || 0),
			(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
			enemy.Enemy.bypass,
			enemy.Enemy.useLock ? enemy.Enemy.useLock : "",
			false,
			false,
			false,
			KDGetExtraTags(enemy, true, i < 3 && (
				KDEnemyIsTemporary(enemy) ? enemy.tempitems?.length < 3
				: enemy.items?.length < 3
			)),
			true,
			{
				minPower: rThresh,
				noUnlimited: !enemy.Enemy.RestraintFilter?.limitedRestraintsOnly,
				onlyLimited: enemy.Enemy.RestraintFilter?.limitedRestraintsOnly,//!enemy.Enemy.RestraintFilter?.invRestraintsOnly,
				looseLimit: !enemy.Enemy.RestraintFilter?.limitedRestraintsOnly,
				ignore: enemy.items.concat(enemy.Enemy.RestraintFilter?.ignoreInitial || []),
				ignoreTags: enemy.Enemy.RestraintFilter?.ignoreInitialTag,
			}, undefined, undefined, true, enemy.items);

		if (r) {
			let rest = r.r;
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
 * @param enemy
 * @param loadout
 */
function KDSetLoadout(enemy: entity, loadout: string) {
	if (loadout) {
		let temp = enemy.Enemy.startingItems ? Object.assign([], enemy.Enemy.startingItems) : [];
		enemy.items = Object.assign(temp, KDLoadouts[loadout].items);
	}
	if ((!enemy.Enemy.RestraintFilter?.unlimitedRestraints || enemy.Enemy.RestraintFilter?.requiredItems)
		&& (enemy.Enemy.attack?.includes("Bind") || enemy.Enemy.RestraintFilter?.requiredItems || enemy.Enemy.specialAttack?.includes("Bind"))) {
		let restMult = KDLoadouts[loadout]?.restraintMult || 1;
		KDStockRestraints(enemy, restMult);
	}
}

function KDClearItems(enemy: entity) {
	if (enemy.items) {
		for (let item of enemy.items) {
			KDAddLostItemSingle(item);
		}
		enemy.items = undefined;
	}
}

/**
 * @param item
 * @param quantity
 */
function KDAddLostItemSingle(item: string, _quantity: number = 1): boolean {
	if (KDWeapon({name: item})) {
		KinkyDungeonAddLostItems([{name: item, type: Weapon, id: KinkyDungeonGetItemID()}], false);
		return true;
	} else if (KDRestraint({name: item}) && (
		KinkyDungeonRestraintVariants[item]
		|| (KDRestraint({name: item}).armor && !KDRestraint({name: item})?.noRecover)
		|| KDRestraintSpecial({name: item}))) {
		KinkyDungeonAddLostItems([{name: item, type: LooseRestraint, events: KDGetEventsForRestraint(item), quantity: 1, id: KinkyDungeonGetItemID()}], false);
		return true;
	} else if (KDConsumable({name: item})) {
		KinkyDungeonAddLostItems([{name: item, type: Consumable, quantity: 1, id: KinkyDungeonGetItemID()}], false);
		return true;
	}
	return false;
}

/**
 * @param enemy
 * @param player
 * @param [allowBlind]
 */
function KDCanDetect(enemy: entity, player: entity, allowBlind: boolean = false): boolean {
	if (player?.player != true) {
		return KinkyDungeonCheckLOS(enemy, player, 1, 10, true, true, 2);
	}
	let invisibility = KDEntityBuffedStat(player, "Invisible");
	return (KinkyDungeonTrackSneak(enemy, 0, player) > 0.99 || (AIData.playerDist < Math.max(1.5 - invisibility, allowBlind ? AIData.blindSight : 0) && ((enemy.vp > 0.1 && enemy.aware) ||
		(enemy.gx == player.x && enemy.gy == player.y))));
}

/**
 * @param enemy
 * @param type
 */
function KDGetSecurity(enemy: entity, type: string): number {
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
 * @param enemy
 * @param bonus
 */
function KDReduceBinding(enemy: entity, bonus: number) {
	let bindingPercent = enemy.boundLevel > 0 ? (((Math.max(0, enemy.boundLevel - bonus)) / enemy.boundLevel) || 0) : 0;
	enemy.boundLevel = Math.max(0, enemy.boundLevel - bonus);
	if (enemy.specialBoundLevel)
		for (let key of Object.keys(enemy.specialBoundLevel)) {
			enemy.specialBoundLevel[key] *= bindingPercent;
		}
}

/**
 * Helper function to determine if a character needs punishing
 * @param enemy
 * @param player
 */
function KDPlayerDeservesPunishment(_enemy: entity, player: entity): boolean {
	if (player.player) {
		if (KinkyDungeonFlags.get("PlayerCombat")) return true;
	} else {
		return true;
	}
}

/**
 * @param enemy
 */
function KDPlugEnemy(enemy: entity) {
	let plugAmount = KDEntityBuffedStat(enemy, "Plug");
	if (!plugAmount)
		KDApplyGenBuffs(enemy, "Plugged", 9999);
	else if (plugAmount == 1) {
		KinkyDungeonExpireBuff(enemy, "Plugged");
		KDApplyGenBuffs(enemy, "DoublePlugged", 9998);
	}
}

/**
 * @param enemy
 * @param removeSpecial
 */
function KDGetTags(enemy: entity, removeSpecial: boolean): Record<string, boolean> {
	/*let addOn = enemy.Enemy.bound ? Object.assign({}, KDExtraEnemyTags) : undefined;
	if (addOn) {

		let effLevel = KDGetEffLevel();

		if (KinkyDungeonStatsChoice.has("TightRestraints")) {
			effLevel *= KDTightRestraintsMult;
			effLevel += KDTightRestraintsMod;
		}
		for (let entry of Object.entries(addOn)) {
			if (entry[1] > 0 && effLevel < entry[1]) delete addOn[entry[0]];
			else addOn[entry[0]] = true;
		}
	}*/

	let tags = Object.assign({}, enemy.Enemy.tags);
	//if (addOn) Object.assign(tags, addOn);
	if (removeSpecial && enemy.Enemy.specialRemoveTags) {
		for (let t of enemy.Enemy.specialRemoveTags) {
			delete tags[t];
		}
	}

	return tags;
}

/**
 * @param enemy
 * @param useSpecial
 */
function KDGetExtraTags(enemy: entity, useSpecial: boolean, useGlobalExtra: boolean): Record<string, number> {
	let addOn: Record<string, number> = enemy.Enemy.bound ? Object.assign({}, useGlobalExtra ? KDExtraEnemyTags : {}) : undefined;
	if (addOn) {
		/*let effLevel = KDGetEffLevel();

		if (KinkyDungeonStatsChoice.has("TightRestraints")) {
			effLevel *= KDTightRestraintsMult;
			effLevel += KDTightRestraintsMod;
		}*/
		//for (let entry of Object.entries(addOn)) {
		//if (entry[1] > 0 && effLevel < entry[1]) delete addOn[entry[0]];
		//else
		//addOn[entry[0]] = true;
		//}
	}

	let tags = addOn ? Object.assign({}, addOn) : {};
	if (useSpecial && enemy.Enemy.specialExtraTags) {
		for (let t of enemy.Enemy.specialExtraTags) {
			tags[t] = 0;
		}
	}

	return tags;
}

/**
 * @param enemy
 * @param faction
 * @param restraintsToAdd
 * @param blockFunction
 * @param [restraintFromInventory]
 * @param [spell]
 * @param [Lock]
 * @param [Keep]
 */
function KDRunBondageResist (
	enemy:                    entity,
	faction:                  string,
	restraintsToAdd:          {r: restraint, v: ApplyVariant, iv: string}[],
	blockFunction:            (r?: any) => void,
	restraintFromInventory?:  string[],
	spell?:                   spell,
	Lock?:                    string,
	Keep?:                    boolean
): { r:restraint, v: ApplyVariant, iv: string}[]
{
	let restraintblock = KDCalcRestraintBlock();
	let restraintpower = 0;
	for (let r of restraintsToAdd) {
		if (r)
			restraintpower += Math.max(1, r.r.power);
	}
	let added: { r:restraint, v: ApplyVariant, iv: string}[] = [];
	let name = enemy ? TextGet("Name" + enemy.Enemy.name) : (spell ? TextGet("KinkyDungeonSpell" + spell.name) : "");
	if (enemy && ((enemy.Enemy.power * 0.5) || 0) < KDGameData.Shield) {
		restraintblock = -1;
	} else if (spell && (spell.power*0.5 || 0) < KDGameData.Shield) {
		restraintblock = -1;
	} else if (KDEntityBuffedStat(KinkyDungeonPlayerEntity, "bondageImmune")) {
		KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "bondageResist", 1);
		restraintblock = -1;
	} else if (restraintblock > 0)
		restraintblock = KDRestraintBlockPower(restraintblock, restraintpower + (enemy?.Enemy.power || spell?.power || 0));
	if (!restraintblock || KDRandom() < restraintblock) { // lower = FAILING, it gets smaller the more block
		let protection = 0;
		let multiPower = restraintsToAdd.length;
		let targetGroups = {};
		for (let r of restraintsToAdd) {
			targetGroups[r.r.Group] = true;
		}
		// Calculate power of an attack vs protection
		let protectRestraints = KinkyDungeonAllRestraint().filter((r) => {return KDRestraint(r).protection > 0;});
		for (let r of protectRestraints) {
			if (r && KDRestraint(r).protection
				&& (KDRestraint(r).protectionTotal || targetGroups[KDRestraint(r).Group])
				&& (!KDRestraint(r).protectionCursed || !KDGetCurse(r) || !KDCurses[KDGetCurse(r)].activatecurse)) {
				protection += KDRestraint(r).protection;
			}
		}

		let count = 0;
		if (protection >= multiPower) {
			for (let r of protectRestraints) {
				if (count < multiPower) {
					// @ts-ignore
					if (KinkyDungeonDropItem({name: r.inventoryVariant || r.inventoryAs || r.name}, KinkyDungeonPlayerEntity, false, true, true)) {
						KinkyDungeonRemoveRestraintSpecific(r, false,
							undefined, undefined, undefined, undefined,
							undefined, true);
						KinkyDungeonSendTextMessage(
							5, TextGet("KDArmorBlock")
								.replace("ArmorName", KDGetItemName(r))
								.replace("EnemyName", name),
							"#ff8933", 1,
							false, false, undefined, "Combat");
					} else {
						KinkyDungeonSendTextMessage(
							5, TextGet("KDArmorBlockBug")
								.replace("ArmorName", KDGetItemName(r))
								.replace("EnemyName", name),
							"#ff8933", 1,
							false, false, undefined, "Combat");
					}


				}
				count += KDRestraint(r).protection;
			}
			blockFunction();
		} else {
			for (let r of restraintsToAdd) {
				let bb = 0;
				if (count >= protection) {
					if (r.iv && KinkyDungeonRestraintVariants[r.iv]) {
						bb =  KDEquipInventoryVariant(KinkyDungeonRestraintVariants[r.iv], "",
							((enemy ? enemy.Enemy.power + KDEnemyRank(enemy) : 0) || spell?.power || 0),
						KinkyDungeonStatsChoice.has("MagicHands") ? true : enemy?.Enemy.bypass, (enemy?.Enemy.useLock ? enemy.Enemy.useLock : (r.r.DefaultLock || Lock)),
						Keep, undefined, enemy?.Enemy.applyFaction || faction || enemy?.Enemy.defaultFaction, KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined,
						undefined, enemy, true, undefined, undefined, undefined) * 2;
					} else {
						bb = KinkyDungeonAddRestraintIfWeaker(r.r, ((enemy ? enemy.Enemy.power + KDEnemyRank(enemy) : 0) || spell?.power || 0),
						KinkyDungeonStatsChoice.has("MagicHands") ? true : enemy?.Enemy.bypass, (enemy?.Enemy.useLock ? enemy.Enemy.useLock : (r.r.DefaultLock || Lock)),
						Keep, undefined, undefined, enemy?.Enemy.applyFaction || faction || enemy?.Enemy.defaultFaction,
						KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined,
						undefined, enemy, true, undefined, undefined, undefined, r.v) * 2;

					}
					if (bb) {
						if (KDGroupBlocked(r.r.Group) && !enemy?.Enemy.bypass) {
							KinkyDungeonSendTextMessage(
								5, TextGet("KDBypasses")
									.replace("RestraintName", KDGetRestraintName(r.r))
									.replace("EnemyName", name),
								"#f0dc41", 1,
								false, false, undefined, "Combat");
						}
						if (restraintFromInventory && enemy && restraintFromInventory.includes(r.iv || r.r.name)) {
							restraintFromInventory.splice(restraintFromInventory.indexOf(r.iv || r.r.name), 1);
							if (enemy.items?.includes(r.iv || r.r.name)) {
								enemy.items.splice(enemy.items.indexOf(r.iv || r.r.name), 1);
							}
						}
						added.push(r);
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
 * @param enemy
 */
function KDAssignLeashPoint(enemy: entity) {
	AIData.nearestJail = KinkyDungeonNearestJailPoint(enemy.x, enemy.y);

	if (!AIData.nearestJail
		|| KinkyDungeonFlags.has("LeashToPrison")
		|| (
			KDSelfishLeash(enemy)
		)) AIData.nearestJail = Object.assign({type: "jail", radius: 1}, KDMapData.StartPosition);
}

/**
 * Assigns the point an enemy leashes the player to indirectly
 * @param enemy
 */
function KDSelfishLeash(enemy: entity): boolean {
	if (enemy.faction == "Ambush") return false;
	return KDEnemyUnfriendlyToMainFaction(enemy) || KDFactionRelation(KDGetFaction(enemy), "Jail") < -0.2;
}

/**
 * Enemy is not friendly to the jail faction
 * @param enemy
 */
function KDEnemyUnfriendlyToMainFaction(enemy: entity): boolean {
	if (!enemy) return false;
	let mainFaction = KDGetMainFaction();
	return KDGetFaction(enemy) != mainFaction
		&& KDFactionRelation(KDGetFaction(enemy), mainFaction) < -0.05;
}

/**
 *
 * @returns {string}
 */
function KDGetMainFaction(): string {
	let mainFaction = KDMapData.MapFaction;
	if (!mainFaction && KDMapData.JailFaction && KDMapData.JailFaction.length > 0) mainFaction = KDMapData.JailFaction[0];
	if (!mainFaction && KDMapData.GuardFaction && KDMapData.GuardFaction.length > 0) mainFaction = KDMapData.GuardFaction[0];
	return mainFaction;
}

/**
 * @param player
 */
function KDPlayerLeashed(player: entity): boolean {
	if (player?.player) {
		let r = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
		if (r && KDRestraint(r)?.leash) {
			return true;
		}
	}
	return false;
}

/**
 * @param player
 */
function KDPlayerLeashable(player: entity): boolean {
	if (player?.player) {
		return KinkyDungeonPlayerTags.get("Collars");
	}
	return false;
}


/**
 * @param en
 */
function KDEnemyCanBeVibed(en: entity): boolean {
	return KDEntityBuffedStat(en, "Plug") > 0 || KDEntityBuffedStat(en, "Toy") > 0;
}

/**
 * @param enemy
 * @param delta
 */
function KDEnemySoundDecay(enemy: entity, delta: number) {
	let data = {
		enemy: enemy,
		decay: enemy.Enemy.Sound?.decay != undefined ? enemy.Enemy.Sound?.decay : 1,
		base: enemy.Enemy.Sound?.baseAmount != undefined ? enemy.Enemy.Sound?.baseAmount : (KDDefaultSound(enemy)),
	};
	KinkyDungeonSendEvent("enemySoundDecay", data);
	if (enemy.sound == undefined) enemy.sound = 0;

	enemy.sound = Math.max(data.base, enemy.sound - delta * data.decay);
}

/**
 * @param enemy
 */
function KDDefaultSound(enemy: entity): number {
	let mult = 1;
	if (enemy.Enemy) {
		if (enemy.Enemy.tags.construct) mult *= 0.5;
		else if (enemy.Enemy.tags.scenery) mult *= 0.5;
		else if (enemy.Enemy.tags.mushroom) mult *= 0.5;
		else if (enemy.Enemy.tags.plant) mult *= 0.5;
		else if (enemy.Enemy.tags.mummy) mult *= 0.65;
		else if (enemy.Enemy.tags.elf) mult *= 0.65;

		if (KDIsImmobile(enemy)) mult -= 0.5;
	}
	return Math.max(mult, 0)*KDDefaultEnemyIdleSound;
}

/**
 * Only the noisiest thing counts
 * @param enemy
 * @param amount
 * @param [novisual]
 */
function KDEnemyAddSound(enemy: entity, amount: number, novisual: boolean = false) {
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
			&& (!KDCanSeeEnemy(enemy) && !(KinkyDungeonVisionGet(enemy.x, enemy.y) > 0))) {
			let vol = KDCanHearSound(KinkyDungeonPlayerEntity, enemy.sound, enemy.x, enemy.y, 1.5);
			if (vol > 0) {
				if (!KDEventData.shockwaves) KDEventData.shockwaves = [];
				KDEventData.shockwaves.push({
					x: enemy.x,
					y: enemy.y,
					radius: Math.min(4, vol) * 0.3 + 0.25,
					sprite: "Particles/ShockwaveEnemy.png",
				});
			}

		}
	}
}

/**
 * @param entity
 * @param enemy
 * @param mult
 */
function KDCanHearEnemy(entity: entity, enemy: entity, mult: number = 1.0): boolean {
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
		} else {
			let ret = KinkyDungeonGetHearingRadius(entity);
			let data = {
				player: entity,
				enemy: enemy,
				hearingRadius: ret.radius,
				hearingMult: ret.mult,
				sound: enemy?.player ? KDPlayerSound(enemy) : enemy.sound,
				dist: KDistChebyshev(entity.x - enemy.x, entity.y - enemy.y),
			};
			KinkyDungeonSendEvent("enemyCanHear", data);
			if (data.dist < data.hearingRadius * mult && data.sound * data.hearingMult * mult >= data.dist - 0.5)
				return KinkyDungeonCheckPath(entity.x, entity.y, enemy.x, enemy.y, true, false, mult * (0.5 + data.hearingMult), true);
		}
		return false;
	}
	return false;
}

/**
 * @param entity
 */
function KDPlayerSound(entity: entity): number {
	return entity.sound;
}

/**
 * @param entity
 * @param sound
 * @param x
 * @param y
 * @param mult
 */
function KDCanHearSound(entity: entity, sound: number, x: number, y: number, mult: number = 1.0): number {
	if (sound > 0) {
		if (entity?.player) {
			let ret = KinkyDungeonGetHearingRadius();
			let data = {
				player: entity,
				enemy: null,
				hearingRadius: ret.radius,
				hearingMult: ret.mult,
				sound: sound,
				dist: KDistChebyshev(entity.x - x, entity.y - y),
			};
			KinkyDungeonSendEvent("playerCanHear", data);
			if (data.dist < data.hearingRadius * mult && data.sound * data.hearingMult * mult >= data.dist - 0.5)
				return Math.max(0, -0.1 + data.sound * data.hearingMult * mult
					/Math.max(1, data.dist - 0.5)
					/(1 + KinkyDungeonCheckPathCount(entity.x, entity.y, x, y, true, false,
						Math.max(mult * (0.5 + data.hearingMult), 4), true)));
			return 0;
		} else {
			let ret = KDEntitySenses(entity);
			let data = {
				player: entity,
				enemy: null,
				hearingRadius: ret.radius,
				hearingMult: ret.mult,
				sound: sound,
				dist: KDistChebyshev(entity.x - x, entity.y - y),
			};
			KinkyDungeonSendEvent("enemyCanHear", data);
			if (data.dist < data.hearingRadius * mult && data.sound * data.hearingMult * mult >= data.dist - 0.5)
				return Math.max(0, -0.1 + data.sound * data.hearingMult * mult
					/Math.max(1, data.dist - 0.5)
					/(1 + KinkyDungeonCheckPathCount(entity.x, entity.y, x, y, true, false,
						Math.max(mult * (0.5 + data.hearingMult), 4), true)));
			return 0;
		}
	}
	return 0;
}

/**
 * @param x
 * @param y
 */
function KDPointWanderable(x: number, y: number): boolean {
	let enemy = KinkyDungeonEntityAt(x, y);
	if (enemy && !enemy.player && KDEnemyHasFlag(enemy, "tryNotToSwap")) return false;
	return KDMapData.RandomPathablePoints[x + ',' + y] != undefined;
}

/**
 * @param enemy
 * @param player
 */
function KDOverrideIgnore(enemy: entity, player: entity): boolean {
	if (player.player) {
		if (enemy.IntentAction && (
			KDIntentEvents[enemy.IntentAction]?.overrideIgnore
		))
			return true;
	}
	return false;
}

/**
 * @param enemy
 */
function KDIsFlying(enemy: entity): boolean {
	return enemy.Enemy.tags?.flying || KDEnemyHasFlag(enemy, "flying");
}

/**
 * @param enemy
 */
function KDEnemyCanSignal(enemy: entity): boolean {
	return !enemy.Enemy.tags?.nosignal && !(enemy.silence > 0);
}

/**
 * @param enemy
 */
function KDEnemyCanSignalOthers(enemy: entity): boolean {
	return KDEnemyCanSignal(enemy) && !KDEnemyHasFlag(enemy, "nosignalothers");
}



/**
 * @param enemy
 * @param Data
 * @param [requireTags]
 */
function KDGetDialogueTrigger(enemy: entity, Data: KDAITriggerData, requireTags?: string[]): string {
	let WeightTotal = 0;
	let Weights = [];
	for (let e of Object.entries(KDDialogueTriggers)) {
		let trigger = e[1];
		let weight = 0;
		if ((!trigger.blockDuringPlaytime || enemy.playWithPlayer < 1 || !enemy.playWithPlayer)
			&& (!trigger.noAlly || !KDAllied(enemy) || Data.ignoreNoAlly)
			&& (!trigger.talk || Data.canTalk)
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
			if (!hastag) end = true;
			if (!end && (!trigger.prerequisite || trigger.prerequisite(enemy, Data.playerDist, Data))) {
				weight = trigger.weight(enemy, Data.playerDist);
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
 * @param enemy
 */
function KDCanOverrideAI(enemy: entity): boolean {
	let AI = KDGetAI(enemy);
	if (KDAIType[AI] && KDAIType[AI].noOverride) return false;
	return true;
}

/**
 * @param enemy
 * @param index
 */
function KDGetAIOverride(enemy: entity, index: string): string {
	let AI = KDGetAI(enemy);
	if (KDAIType[AI] && KDAIType[AI].override) return KDAIType[AI].override[index];
	return undefined;
}

/**
 * @param Enemy
 * @param index
 */
function KDGetAITypeOverride(Enemy: enemy, index: string): string {
	let AI = Enemy.AI;
	if (KDAIType[AI] && KDAIType[AI].override) return KDAIType[AI].override[index];
	return undefined;
}

/**
 * @param enemy
 */
function KDMakeHighValue(enemy: entity) {
	KinkyDungeonApplyBuffToEntity(enemy, {
		id: "HighValue",
		type: "MoveSpeed",
		power: 0.1,
		duration: 9999, infinite: true,
		tags: ["removeOnRemove"],
	});

	// Hitpoint bonuses
	let hp = Math.max(10, enemy.Enemy.maxhp) * (1.5 + Math.round(KDRandom()*5)/10);
	enemy.Enemy = JSON.parse(JSON.stringify(enemy.Enemy));
	enemy.Enemy.maxhp = hp;
	enemy.hp = hp;
	enemy.modified = true;

	// MS bonus
	if (KDRandom() * 0.5) {
		KinkyDungeonApplyBuffToEntity(enemy, {
			id: "HighValue_MS",
			type: "MoveSpeed",
			power: 0.1 * Math.ceil(KDRandom()*10),
			duration: 9999, infinite: true,
		});
	}

	// AS bonus
	if (KDRandom() * 0.5) {
		KinkyDungeonApplyBuffToEntity(enemy, {
			id: "HighValue_AS",
			type: "AttackSpeed",
			power: 0.1 * Math.ceil(KDRandom()*10),
			duration: 9999, infinite: true,
		});
	}

	// Power bonus
	if (KDRandom() * 0.5) {
		let power = enemy.Enemy.power + Math.round(KDRandom() * 3);
		enemy.Enemy.power = power;
	}

	// Items
	if (!enemy.items) enemy.items = [];
	for (let i = Math.round(KDRandom()*3) ; i < 1; i++) {
		enemy.items.unshift("AncientPowerSource");
	}
	for (let i = Math.round(KDRandom()*2) ; i < 1; i++) {
		enemy.items.unshift("PotionMana");
	}
	for (let i = Math.round(KDRandom()*3) ; i < 0; i++) {
		enemy.items.unshift("PotionWill");
	}

	let list = KDGetSpecialBuffList(enemy, ["HighValue"]);
	let buff = KDGetByWeight(list);
	if (buff) {
		KDSpecialBuffs[buff].apply(enemy, ["HighValue"]);
		list[buff] = 0;
	}
	buff = KDGetByWeight(list);
	if (buff) {
		KDSpecialBuffs[buff].apply(enemy, ["HighValue"]);
	}
}

/**
 * Gets a list of curses applied to the item
 * @param enemy
 * @param types
 */
function KDGetSpecialBuffList(enemy: entity, types: string[]): Record<string, number> {
	let ret: Record<string, number> = {};
	for (let obj of Object.keys(KDSpecialBuffs)) {
		if (KDSpecialBuffs[obj].filter(enemy, types))
			ret[obj] = KDSpecialBuffs[obj].weight(enemy, types);
	}
	return ret;
}



/**
 * @param enemy
 */
function KDEnemyRank(enemy: entity): number {
	let tags = enemy.Enemy.tags;
	if (tags) {
		if (tags.stageBoss) return 5;
		if (tags.boss) return 4;
		if (tags.miniboss) return 3;
		if (tags.elite) return 2;
		if (tags.minor) return 0;
	}
	return 1;
}
/**
 * @param enemy
 */
function KDEnemyTypeRank(enemy: enemy): number {
	let tags = enemy.tags;
	if (tags) {
		if (tags.stageBoss) return 5;
		if (tags.boss) return 4;
		if (tags.miniboss) return 3;
		if (tags.elite) return 2;
		if (tags.minor) return 0;
	}
	return 1;
}

/**
 * @param enemy
 */
function KDEnemyCanSprint(enemy: entity): boolean {
	let amt = enemy.Enemy.stamina || 0;
	return (enemy.exertion || 0) < amt;
}
/**
 * @param enemy
 */
function KDEnemyChangeSprint(enemy: entity, amt: number) {
	enemy.exertion = Math.max(0, amt + (enemy.exertion || 0));
}

let KDShopMoneyBase = 150;
let KDShopMoneyPerFloor = 50;
let KDShopMoneyPerRank = 40;

/**
 * @param enemy
 * @param [dontSet]
 */
function KDSetShopMoney(enemy: entity, dontSet?: boolean): number {
	let money = KDShopMoneyBase + KDShopMoneyPerFloor * KDGetEffLevel() + KDShopMoneyPerRank * (KDEnemyRank(enemy)**2);
	KinkyDungeonSendEvent("shopMoney", {enemy: enemy, dontSet: dontSet});
	if (!dontSet)
		enemy.gold = money;
	return money;
}


/**
 * @param enemy
 * @returns true if the NPC is in the party
 */
function KDIsInParty(enemy: entity): boolean {
	if (!KDGameData.Party) KDGameData.Party = []; // Null protection
	for (let pm of (KDGameData.Party)) {
		if (pm.id == enemy.id) {
			return true;
		}
	}
	return false;
}
/**
 * @param id
 * @returns true if the NPC is in the party
 */
function KDIsInPartyID(id: number): boolean {
	if (!KDGameData.Party) KDGameData.Party = []; // Null protection
	for (let pm of (KDGameData.Party)) {
		if (pm.id == id) {
			return true;
		}
	}
	return false;
}

/**
 * @param enemy
 * @returns true if the NPC has been previously captured
 */
function KDIsInCapturedParty(enemy: entity): boolean {
	if (!KDGameData.CapturedParty) KDGameData.CapturedParty = []; // Null protection
	for (let pm of (KDGameData.CapturedParty)) {
		if (pm.id == enemy.id) {
			return true;
		}
	}
	return false;
}

/**
 * @param id
 * @returns true if the NPC has been previously captured
 */
function KDIsInCapturedPartyID(id: number): boolean {
	if (!KDGameData.CapturedParty) KDGameData.CapturedParty = []; // Null protection
	for (let pm of (KDGameData.CapturedParty)) {
		if (pm.id == id) {
			return true;
		}
	}
	return false;
}

/**
 * Returns the enemies in the map data based on the party members
 * @returns Array of enemies from KDMapData.Entities
 */
function KDGetPartyRefs(): entity[] {
	if (!KDGameData.Party) KDGameData.Party = []; // Null protection
	let ret = [];
	for (let pm of (KDGameData.Party)) {
		let entity = KinkyDungeonFindID(pm.id);
		if (entity) ret.push(entity);
	}
	return ret;
}

/**
 * @param enemy
 */
function KDCapturedPartyMemberIsOnMap(_enemy: entity): entity {
	if (!KDGameData.CapturedParty) KDGameData.CapturedParty = []; // Null protection
	for (let pm of (KDGameData.CapturedParty)) {
		let entity = KinkyDungeonFindID(pm.id);
		if (entity) return entity;
	}
	return null;
}

/**
 * @param enemy
 * @returns - Returns true if the NPC was added
 */
function KDAddToParty(enemy: entity): boolean {
	if (KDIsInParty(enemy)) return false;
	if (KDGameData.Party.length >= KDGameData.MaxParty) return false;
	// Add a copy to the party
	enemy.faction = "Player";
	KDGameData.Party.push(JSON.parse(JSON.stringify(enemy)));
	if (KDCapturable(enemy)) {
		if (!KDGameData.Collection[enemy.id + ""])
			KDAddCollection(enemy, undefined, "Guest");
		KDGetPersistentNPC(enemy.id).collect = true; // Collect them
	}
	if (KDGameData.Collection[enemy.id + ""]?.Facility) {
		KDGameData.Collection[enemy.id + ""].Facility = "";
	}
	return true;

}

/**
 * @param enemy
 * @returns - Returns true if the NPC was added
 */
function KDAddToCapturedParty(enemy: entity): boolean {
	if (!KDCapturable(enemy)) return false;
	if (KDIsInCapturedParty(enemy)) return false;
	// Add a copy to the party
	KDGameData.CapturedParty.push(JSON.parse(JSON.stringify(enemy)));
	return true;

}

/**
 * Removes a party member and optionally adds to capture list
 * @param enemy - The enemy to be removed
 * @param capture - Whether to add to CapturedParty
 * @returns - Whether the party member was found or not
 */
function KDRemoveFromParty(enemy: entity, capture: boolean): boolean {
	if (!KDGameData.Party) KDGameData.Party = []; // Null protection
	if (!KDGameData.CapturedParty) KDGameData.CapturedParty = [];
	for (let pm of (KDGameData.Party)) {
		if (pm.id == enemy.id) {
			KDGameData.Party.splice(KDGameData.Party.indexOf(pm), 1);
			let enn = KinkyDungeonGetEnemyByName(enemy.Enemy);
			if (capture && (!enemy.maxlifetime || enemy.maxlifetime > 9000) && enn?.bound && KDCapturableType(enn)) {
				//if (!enemy.hostile) { // In the future player will be able to keep as slaves
				KDAddToCapturedParty(pm);
				//}
			}
			return true;
		}
	}
	return false;
}


/**
 * @param entity
 * @param [makepersistent] - If true, the game will update the npc to be persistent
 * @param [dontteleportpersistent] - If true, the game will create a new NPC not a persistent one
 * @param [noLoadout] - if true, will not restock the NPC
 * @param [mapData] - map data to update
 */
function KDAddEntity(entity: entity, makepersistent?: boolean, dontteleportpersistent?: boolean, noLoadout?: boolean, mapData?: KDMapDataType): entity {
	if (!mapData) mapData = KDMapData;
	let data = {
		enemy: entity,
		x: entity.x,
		y: entity.y,
		type: entity.Enemy,
		typeOverride: false,
		data: undefined,
		loadout: undefined,
		persistent: makepersistent,
		mapData: mapData,
	};

	if (mapData == KDMapData) {
		KDUpdateEnemyCache = true;
		KDGetEnemyCache();
	}

	if (!dontteleportpersistent && KDIsNPCPersistent(data.enemy.id) && KinkyDungeonFindID(data.enemy.id)) {
		// Move the enemy instead of creating

		let npc = KinkyDungeonFindID(data.enemy.id, mapData);

		KDUnPackEnemy(data.enemy);
		npc.x = data.x;
		npc.y = data.y;
		if (KDIsNPCPersistent(data.enemy.id) && !KDGetAltType(MiniGameKinkyDungeonLevel)?.keepPrisoners)
			KDGetPersistentNPC(data.enemy.id).collect = false;

		if (data.enemy.hp <= 0.5) data.enemy.hp = 0.51;

		if (mapData == KDMapData)
			KDUpdateEnemyCache = true;

		return npc;
	} else if (!dontteleportpersistent && KDDeletedIDs[data.enemy.id]) {
		return null;
	}

	let createpersistent = false;

	if (makepersistent || KDPersistentNPCs["" + data.enemy.id]) {
		let npc = KDGetPersistentNPC(data.enemy.id);
		if (npc) {
			data.enemy = npc.entity;
			if (typeof npc.entity.Enemy == "string") {
				npc.entity.Enemy = KinkyDungeonGetEnemyByName(npc.entity.Enemy);
			} else if (!data.enemy.Enemy.maxhp) {
				KDUnPackEnemy(data.enemy);
			}
			npc.entity.x = data.x;
			npc.entity.y = data.y;
			KDUpdateEnemyCache = true;
		} else {
			createpersistent = true;
		}
	}
	KinkyDungeonSendEvent("addEntity", data);
	mapData.Entities.push(data.enemy);
	if (!noLoadout)
		KDSetLoadout(data.enemy, data.loadout);
	if (!data.enemy.data && data.enemy.Enemy.data) data.enemy.data = data.enemy.Enemy.data;
	if (data.data) {
		if (!data.enemy.data) data.enemy.data = {};
		Object.assign(data.enemy.data, data.data);
	}
	if (data.enemy.Enemy?.startBuffs) {
		if (!data.enemy.buffs) data.enemy.buffs = {};
		let buffs = JSON.parse(JSON.stringify(data.enemy.Enemy?.startBuffs));
		if (buffs)
			for (let b of buffs)
				data.enemy.buffs[b.id] = b;
	}
	if (mapData == KDMapData)
		KDUpdateEnemyCache = true;

	// In case it wasnt made already
	if (createpersistent) KDGetPersistentNPC(data.enemy.id);


	// Note: you have to do this yourself if you are manipulating enemies on other maps
	if ((mapData == KDMapData) && KDIsNPCPersistent(data.enemy.id) && !KDGetAltType(MiniGameKinkyDungeonLevel)?.keepPrisoners)
		KDGetPersistentNPC(data.enemy.id).collect = false;
	return data.enemy;
}

function KDSpliceIndex(index: number, num: number = 1) {
	if (KDMapData.Entities[index]) {
		KDCommanderRoles.delete(KDMapData.Entities[index].id);
	}
	KDMapData.Entities.splice(index, num);
	KDUpdateEnemyCache = true;
}

/**
 * Removes an enemy and does some stuff like party management, etc to keep things sanitary
 * @param enemy
 * @param [kill]
 * @param [capture]
 * @param [noEvent]
 * @param [forceIndex]
 */
function KDRemoveEntity(enemy: entity, kill?: boolean, capture?: boolean, noEvent?: boolean, forceIndex?: number): boolean {
	let data = {
		enemy: enemy,
		kill: kill,
		capture: capture,
		cancel: false,
	};
	if (!noEvent)
		KinkyDungeonSendEvent("removeEnemy", data);



	if (data.cancel) return false;
	if (data.kill || data.capture) {
		KDDropStolenItems(enemy);
		enemy.items = [];
		enemy.playerdmg = undefined;
		enemy.hostile = 0;
		enemy.ceasefire = 0;
		if (KDEnemyHasFlag(enemy, "killtarget")) KDSetIDFlag(enemy.id, "killtarget", 0);
		KinkyDungeonRemoveBuffsWithTag(enemy, ["removeOnRemove"]);

		//enemy.noDrop = true;
		if (KDIsNPCPersistent(enemy.id)) {
			if (KDGetPersistentNPC(enemy.id).collect
				|| KDGetAltType(MiniGameKinkyDungeonLevel)?.keepPrisoners
				|| (enemy.playerdmg > 0 && KDistChebyshev(enemy.x - KDPlayer().x, enemy.y - KDPlayer().y) < 8)) {
				KDGetPersistentNPC(enemy.id).captured = false;
				KDGetPersistentNPC(enemy.id).collect = true;

				if (enemy.hp < 0.52) enemy.hp = 0.52;
				if (KDGameData.Collection[enemy.id + ""]) {
					KDGameData.Collection[enemy.id + ""].escaped = false;
				}
			} else {
				KDGetPersistentNPC(enemy.id).captured = true;
				KDGetPersistentNPC(enemy.id).captureFaction = KDMapData.MapFaction;
			}
		}
		if (KDGameData.SpawnedPartyPrisoners && KDGameData.SpawnedPartyPrisoners[enemy.id + ""]) {
			KDAddToCapturedParty(enemy);
		} else {
			KDRemoveFromParty(data.enemy, data.capture && KDGetFaction(data.enemy) == "Player");
		}
	}
	if (KDIsNPCPersistent(enemy.id) && KDGetPersistentNPC(enemy.id)) {
		KDGetPersistentNPC(enemy.id).jailed = undefined;
	}

	KDSpliceIndex(forceIndex || KDMapData.Entities.indexOf(data.enemy), 1);
	KDUpdateEnemyCache = true;

	if (kill) {
		if (enemy.Enemy?.SFX?.death) {
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + enemy.Enemy.SFX.death + ".ogg", enemy);
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
	}
	return true;
}

/**
 * Gets the max block of an enemy
 * @param entity
 */
function KDGetMaxBlock(entity: entity): number {
	if (!((entity.Enemy.block || entity.Enemy.maxblock != undefined || (KDIsHumanoid(entity) && !entity.Enemy.tags?.submissive)))) return 0;
	let mod = KDEntityBuffedStat(entity, "MaxBlock");
	if (entity.Enemy?.maxblock != undefined) return Math.max(0, entity.Enemy?.maxblock + mod);
	return Math.max(0, mod + Math.max(1, KDEnemyRank(entity)));
}

/**
 * Gets the max block of an enemy
 * @param entity
 */
function KDGetMaxDodge(entity: entity): number {
	if (entity.Enemy?.alwaysEvade || KDIsImmobile(entity)) return 0;
	let mod = KDEntityBuffedStat(entity, "MaxDodge");
	if (entity.Enemy?.maxdodge != undefined) return Math.max(0, entity.Enemy?.maxdodge + mod);
	return Math.max(0, mod + Math.max(1, KDEnemyRank(entity)));
}


/**
 * Gets the max block of an enemy
 * @param entity
 */
function KDGetBaseBlock(entity: entity): number {
	let mod = KDEntityBuffedStat(entity, "BlockRate");

	/*let spellResist = entity.Enemy.spellResist || -1;
	if (KDEntityBuffedStat(entity, "SpellResist")) spellResist += KDEntityBuffedStat(entity, "SpellResist");
	if (KDEntityBuffedStat(entity, "SpellResistBreak")) spellResist -= Math.min(Math.max(0, spellResist), KDEntityBuffedStat(entity, "SpellResistBreak"));
	let armor = entity.Enemy.armor || -1;
	if (KDEntityBuffedStat(entity, "Armor")) armor += KDEntityBuffedStat(entity, "Armor");
	if (KDEntityBuffedStat(entity, "ArmorBreak")) armor -= Math.min(Math.max(0, armor), KDEntityBuffedStat(entity, "ArmorBreak"));

	let armorBonus = Math.max(spellResist, armor) + Math.max(0, 0.5 * Math.min(spellResist, armor));
	if (entity.Enemy.tags?.meleeresist) armorBonus += 3;
	else if (entity.Enemy.tags?.meleeimmune) armorBonus += 5;
	let attackBonus = 2 - entity.Enemy.attackPoints;*/

	return Math.max(0, mod + entity.Enemy.block);//0.05 * (1 + KDEnemyRank(entity)) / (1 + KinkyDungeonMultiplicativeStat(attackBonus + armorBonus)));
}

/**
 * Gets the max block of an enemy
 * @param entity
 */
function KDGetBaseDodge(entity: entity): number {
	let mod = KDEntityBuffedStat(entity, "DodgeRate");


	let moveBonus = 2 - entity.Enemy.movePoints;
	if (entity.Enemy.attack?.includes("Dash")) moveBonus += 5;
	else if (entity.Enemy.specialAttack?.includes("Dash")) moveBonus += 3;
	if (entity.Enemy.kite) moveBonus += 1;
	if (entity.Enemy.tags?.melee) moveBonus += 1;
	let staminabonus = 0.2 * (entity.Enemy.stamina != undefined ? entity.Enemy.stamina : 6) * (entity.Enemy.sprintspeed || 1.7);
	let reflexBonus = Math.max(0, (entity.Enemy.stealth ? 4 / entity.Enemy.stealth : 0)) + Math.max(0, (entity.Enemy.blindSight ? 4 / entity.Enemy.blindSight : 0));

	return Math.max(0, mod + 0.1 * (1 + KDEnemyRank(entity)) / (1 + KinkyDungeonMultiplicativeStat(staminabonus + moveBonus + reflexBonus)));
}

/**
 * Returns the amount of hp a single block protects an enemy from
 * @param entity
 */
function KDGetBlockAmount(entity: entity): number {
	let mod = KDEntityBuffedStat(entity, "BlockAmount");

	if (entity.Enemy?.blockAmount) return Math.max(0, entity.Enemy?.blockAmount + mod);
	return (1 + mod + 0.5*(KDEnemyRank(entity)));
}

/**
 * Returns if the enemy can block
 * @param enemy
 */
function KDCanBlock(enemy: entity): boolean {
	return !KDHelpless(enemy) && !KinkyDungeonIsDisabled(enemy) && !enemy.vulnerable;
}

/**
 * Returns if the enemy can dodge
 * @param enemy
 */
function KDCanDodge(enemy: entity): boolean {
	return !KDIsImmobile(enemy) && !KDHelpless(enemy) && (!KinkyDungeonFlags.get("TimeSlow") || KDIsTimeImmune(enemy)) && !(enemy.bind > 0) && !KinkyDungeonIsDisabled(enemy) && KinkyDungeonGetNearbyPoint(enemy.x, enemy.y, true, undefined, true, true, (x, y) => {return x != enemy.x && y != enemy.y;}) != undefined;
}

/**
 * @param enemy
 */
function KDIsTimeImmune(enemy: entity): boolean {
	return enemy?.player || enemy?.Enemy.tags?.timeimmune;
}

/**
 * @param entity
 * @param amount
 * @param desireMult
 */
function KDAddDistraction(entity: entity, amount: number, desireMult: number = 0.25): number {
	if (entity?.Enemy?.nonHumanoid) return 0;
	let origDistraction = entity.distraction || 0;
	entity.distraction = Math.max(entity.desire || 0, Math.min(entity.Enemy.maxhp, (entity.distraction || 0) + amount));

	entity.desire = Math.max(0, Math.min(entity.Enemy.maxhp, (entity.desire || 0) + amount * desireMult));
	if (amount > 0) {
		KinkyDungeonSetEnemyFlag(entity, "d_turn", 2);
	}
	return entity.distraction - origDistraction;
}

/**
 * @param entity
 */
function KDToughArmor(entity: entity): boolean {
	return (entity?.aware && (entity.Enemy?.Resistance?.toughArmor || (KDEntityBuffedStat(entity, "ToughArmor") > 0)))
		|| KDAbsoluteArmor(entity);
}

/**
 * @param entity
 */
function KDAbsoluteArmor(entity: entity): boolean {
	return entity?.Enemy?.Resistance?.toughArmorAlways || (KDEntityBuffedStat(entity, "ToughArmorAlways") > 0);
}

/**
 * @param enemy
 */
function KDIsDisarmed(enemy: entity): boolean {
	return (enemy.disarm > 0);
}

/**
 * @param enemy
 */
function KDHasArms(enemy: entity): boolean {
	return !enemy.Enemy?.tags?.noarms;
}

/**
 * @param player
 * @param enemy
 */
function KDPlayerFacingAway(player: any, enemy: entity): boolean {
	let dx = player.x - enemy.x;
	let dy = player.y - enemy.y;
	if ((dx && player.facing_x && (Math.sign(player.facing_x) == Math.sign(dx)))
		|| (dy && player.facing_y && (Math.sign(player.facing_y) == Math.sign(dy)))
	) {
		return true;
	}


	return false;

}

/**
 * @param enemy
 * @param player
 * @param AData
 */
function KDGetTeaseAttack(enemy: entity, player: entity, AData: KDAIData): KDTeaseAttack {
	let list = enemy.Enemy.bound ? "Basic" : "";
	if (enemy.Enemy.teaseAttacks) list = enemy.Enemy.teaseAttacks;
	if (list && KDTeaseAttackLists[list]) {
		let candidates = KDTeaseAttackLists[list].filter((str) => {
			return KDTeaseAttacks[str]?.filter(enemy, player, AData);
		});
		let maxPri = 0;
		for (let c of candidates) {
			maxPri = Math.max(KDTeaseAttacks[c].priority, maxPri);
		}
		candidates = candidates.filter((str) => {
			return KDTeaseAttacks[str].priority >= maxPri - 1.5*KDRandom();
		});
		if (candidates.length > 0) {
			let chosen = candidates[Math.floor(KDRandom() * candidates.length)];
			return KDTeaseAttacks[chosen];
		}
		return null;
	}
	return null;
}

function KDBasicTeaseAttack(enemy: entity, player: entity, noglobal?: boolean): boolean {
	return  player.player
	    &&  KDistChebyshev(enemy.x-player.x, enemy.y - player.y) < 1.5
	    &&  !KDEnemyHasFlag(enemy, "teaseAtkCD")
	    &&  (noglobal || !KinkyDungeonFlags.get("globalteaseAtkCD"))
	    &&  !KinkyDungeonIsDisabled(enemy)
	    &&  !(enemy.vulnerable > 0)
	    &&  !KDEnemyHasFlag(enemy, "targetedForAttack");
}


/**
 * @param enemy
 */
function KDGetVibeToys(enemy: entity): string[] {
	if (!enemy.items) return [];
	return enemy.items.filter((item) => {return KDRestraint({name: item})?.shrine?.includes("Vibes");});
}

/**
 * @param enemy
 */
function KDGetTeaseDamageMod(enemy: entity): number {
	let rank = KDEnemyRank(enemy);
	let mod = enemy.Enemy?.teaseMod || (
		rank == 0 ? 0.25 : (0.4 + 0.12*rank)
	);
	mod *= KinkyDungeonMultiplicativeStat(-KDEntityBuffedStat(enemy, "TeaseDamage"));
	return mod;
}

function KDPlayerIsRestricted(player: any, enemy: entity): boolean {
	if (player.player && KDFactionRelation("Player", KDGetFaction(enemy)) < 0.35) {
		let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
		if (altType?.restricted) return true;
		return false;
	}
	return false;
}

function KDGetUnassignedGuardTiles(type = "Patrol", ignoreNegative = false) {
	if (KDMapData.Labels) return [];
	let labels = KDMapData.Labels[type];
	let ret = [];
	if (labels) {
		for (let l of labels) {
			if (!ignoreNegative || l.assigned >= 0) {
				let en = KinkyDungeonFindID(l.assigned);
				if (!en || KDHelpless(en)) {
					ret.push(l);
				}
			}
		}
	}
	return ret;
}

/**
 * @param enemy
 */
function KDCanIdleFidget(enemy: entity): boolean {
	return enemy?.idle && !enemy.Enemy?.nonDirectional && !enemy.Enemy?.tags?.nofidget
		&& (!KDEnemyHasFlag(enemy, "fidget") || KDEntityHasBuffTags(enemy, "adren"))
		&& !KDEnemyHasFlag(enemy, "nofidget");
}

function KDRescueRepGain(en: entity) {
	let faction = KDGetFaction(en);
	if (!en.summoned && !en.maxlifetime && !KinkyDungeonHiddenFactions.has(faction)) {
		if (!KDIDHasFlag(en.id, "rescuedRep")) {
			KinkyDungeonChangeFactionRep(faction,
				(KDFactionRelation("Player", faction) > 0.25 ? 0.5 : 1)
				* (KinkyDungeonFlags.get("rescuedFloor" + faction) ? 0.01 : 0.05));
			KDSetIDFlag(en.id, "rescuedRep", -1);
			KinkyDungeonSetFlag("rescuedFloor" + faction, -1, 1);
		}
	}
}

/**
 * @param rescueType
 * @param en
 * @param makePlayer
 */
function KDRescueEnemy(rescueType: string, en: entity, makePlayer: boolean = true): boolean {
	if (!KDHelpless(en) && !(en.boundLevel > 0.01)) {

		let newType = "";
		if (en.Enemy?.rescueTo) {
			newType = en.Enemy?.rescueTo[rescueType];
		}
		if (newType) {
			let enemyType = KinkyDungeonGetEnemyByName(newType);
			if (enemyType) {
				en.Enemy = JSON.parse(JSON.stringify(enemyType));
			}
			en.hp = Math.min(en.Enemy.maxhp, en.hp);
			en.hostile = 0;
			if (makePlayer)
				en.faction = "Player";
			return true;
		}
	}
	return false;
}

/**
 * @param enemy
 */
function KDGetEnemyTypeName(enemy: entity): string {
	return enemy.CustomName || TextGet("Name" + enemy.Enemy.name);
}

/**
 *
 * @param {entity} enemy
 * @param {AIData} AID
 * @returns {boolean}
 */
function KDGateAttack(enemy: entity, AID?: KDAIData): boolean {
	return !((!enemy.attackPoints && KDEnemyHasFlag(enemy, "runAway") && (!AID || AID.kite)) || KDEnemyHasFlag(enemy, "attackFail"));
}

/**
 * @param enemy
 * @param leash
 */
function KDAcceptsLeash(enemy: entity, _leash: KDLeashData): boolean {
	return enemy.Enemy?.tags?.submissive || (enemy.personality && KDLoosePersonalities.includes(enemy.personality));
}

/**
 * @param enemy
 * @param player
 */
function KDEnemyAccuracy(enemy: entity, player: entity): number {
	let accuracy = enemy.Enemy.accuracy ? enemy.Enemy.accuracy : 1.0;
	if (enemy.distraction) accuracy = accuracy / (1 + 1.5 * enemy.distraction / enemy.Enemy.maxhp);
	if (enemy.boundLevel) accuracy = accuracy / (1 + 0.5 * enemy.boundLevel / enemy.Enemy.maxhp);
	if (enemy.blind > 0) accuracy = AIData.playerDist > 1.5 ? 0 : accuracy * 0.5;

	if (player?.player) {
		if (accuracy < 1 && KDistChebyshev(enemy.x - player.x, enemy.y - player.y) < 1.5) {
			let penalty = KDPlayerEvasionPenalty();
			if (penalty > 0) {
				if (!KinkyDungeonStatsChoice.get("tut_AccuracyClose")) {
					KinkyDungeonStatsChoice.set("tut_AccuracyClose", true);
					KinkyDungeonSendTextMessage(10, TextGet("tut_AccuracyClose2"), "#ffffff", 5);
					KinkyDungeonSendTextMessage(10, TextGet("tut_AccuracyClose1"), "#ffffff", 5);
				}
			}
			accuracy += penalty;
		}
	} else if (player?.Enemy) {
		if (player.bind > 0) accuracy *= 3;
		else if (player.slow > 0) accuracy *= 2;
		if ((player.stun > 0 || player.freeze > 0)) accuracy *= 5;
		else {
			if (player.distraction > 0) accuracy *= 1 + 2 * Math.min(1, player.distraction / player.Enemy.maxhp);
			if (player) accuracy *= 1 + 0.25 * KDBoundEffects(player);
		}
		if (player.vulnerable) accuracy *= KDVulnerableHitMult;
	}

	accuracy *= KinkyDungeonMultiplicativeStat(-KDEntityBuffedStat(enemy, "Accuracy"));
	accuracy *= KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(enemy, "AccuracyPenalty"));

	return Math.min(1, accuracy);
}

/**
 * @param enemy
 */
function KDIsDistracted(enemy: entity): boolean {
	return enemy.distraction > 0 && enemy.distraction >= enemy.Enemy.maxhp * 0.9;
}

/**
 * @param Enemy
 */
function KDEnemyRelease(Enemy: entity): boolean {
	let damageData = KDGetEnemyReleaseDamage(Enemy);
	KinkyDungeonDamageEnemy(Enemy, damageData, true, true, undefined, undefined, undefined, 0.99, undefined, true, false);
	if (KinkyDungeonVisionGet(Enemy.x, Enemy.y)) {
		KinkyDungeonSendTextMessage(1, TextGet("KDEnemyLetGo")
			.replace("ENMY", TextGet("Name" + Enemy.Enemy.name))
			.replace("AMNT", "" + Math.round(10*damageData.damage)),
		"#e7cf1a", 2, undefined, undefined, undefined, "Combat");
	}
	Enemy.distraction = 0;
	Enemy.desire = 0;
	KDAddThought(Enemy.id, "Embarrassed", 10, 5);
	return true;
}


function KDBlockedByPlayer(enemy: entity, dir: { x: number, y: number, delta: number }) {
	if ((KDPlayer().x != enemy.gx
		|| KDPlayer().y != enemy.gy)
		&& KDPlayer().x == enemy.x + dir.x
		&& KDPlayer().y == enemy.y + dir.y) {
		KinkyDungeonSetEnemyFlag(enemy, "playerBlocking", 6);
		if (!KinkyDungeonGetRestraintItem("ItemDevices") && !KDIsPlayerTetheredToEntity(KDPlayer(), enemy))
			KinkyDungeonSendDialogue(enemy, TextGet("KDDialogue_StepAside" + (!KDEnemyCanTalk(enemy) ? "Gagged" : (enemy.personality || "")))
				.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
			KDGetColor(enemy), 3, 10);
	}
}

/**
 * @param enemy
 * @param delta
 * @param [allowStruggleAlwaysThresh]
 * @param [force]
 * @param [defaultSpeed]
 */
function KDEnemyStruggleTurn(enemy: entity, delta: number, allowStruggleAlwaysThresh?: number, force: boolean = false, defaultSpeed: boolean = false) {
	if (enemy.boundLevel > 0) {
		let hasHelp = KDEnemyHasHelp(enemy);
		let SM = KDGetEnemyStruggleMod(enemy, force, defaultSpeed, hasHelp);
		let newBound = KDPredictStruggle(enemy, SM, delta, hasHelp ? 0 : allowStruggleAlwaysThresh);
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

	if (enemy.specialBoundLevel) {
		let sum = 0;
		for (let entry of Object.values(enemy.specialBoundLevel)) {
			sum += entry;
		}
		if (sum > 0) {
			for (let entry of Object.keys(enemy.specialBoundLevel)) {
				enemy.specialBoundLevel[entry] *= enemy.boundLevel / sum;
			}
		} else {
			enemy.specialBoundLevel = {};
		}
	}

	/** Do NPC restraint struggling */
	let struggleNPCTarget = KDNPCStruggleTick(enemy.id, delta);
	if (struggleNPCTarget) {
		let result = KDNPCDoStruggle(enemy.id,
			struggleNPCTarget.slot,
			struggleNPCTarget.inv,
			KDEntityHasFlag(enemy, "bound") ? 0 :
				-0.1 * struggleNPCTarget.target + 0.1 * (enemy.strugglePoints || 0) +
				(1 + struggleNPCTarget.points) / (3 + struggleNPCTarget.target + struggleNPCTarget.points)
		);
		if (result == "Struggle") {
			if (!enemy.strugglePoints) enemy.strugglePoints = 0;
			enemy.strugglePoints += delta;
		} else if (result != "Struggle") {
			if (struggleNPCTarget.inv.conjured && result == "Remove") result = "ConjuredRemove";
			KinkyDungeonSendTextMessage(3, TextGet("KDNPCEscape" + result)
				.replace("ENMY", KDEnemyName(enemy))
				.replace("ITMN", KDGetItemName(struggleNPCTarget.inv, Restraint)),
			"#ffffff", 2);
			delete enemy.strugglePoints;
		}
	} else {
		if (enemy.strugglePoints > 0) enemy.strugglePoints -= delta;
		else delete enemy.strugglePoints
	}
}

/**
 * @param enemy
 */
function KDGetEnemyRep(enemy: entity): number {
	let faction = KDGetFaction(enemy);
	let amount = 0;
	if (!KinkyDungeonHiddenFactions.has(faction)) {

		if (enemy.Enemy.tags?.scenery) amount = 0;
		else {
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


	}
	return amount;
}
/**
 * @param enemy
 * @param faction
 */
function KDGetEnemyTypeRep(enemy: enemy, faction: string): number {
	let amount = 0;
	if (!KinkyDungeonHiddenFactions.has(faction)) {

		if (enemy.tags?.scenery) amount = 0;
		else {
			if (enemy && enemy.tags && enemy.tags.boss)
				amount = 0.04;
			else if (enemy && enemy.tags && enemy.tags.miniboss)
				amount = 0.02;
			else if (enemy && enemy.tags && enemy.tags.elite)
				amount = 0.01;
			if (enemy && enemy.tags && !enemy.tags.minor)
				amount = 0.004;
			if (enemy && enemy.tags && enemy.tags.minor)
				amount = KDRandom() < 0.33 ? 0.004 : 0.001;
		}


	}
	return amount;
}

/**
 * @param enemy
 * @param force
 */
function KDQuickGenNPC(enemy: entity, force: boolean) {
	let value: KDCollectionEntry | KDPersistentNPC = KDGameData.Collection[enemy.id + ""];
	if (force && !value && !KDIsNPCPersistent(enemy.id)) {
		value = KDGetVirtualCollectionEntry(enemy.id);
	}
	if ((value || KDIsNPCPersistent(enemy.id))) {
		let id = value?.id || KDGetPersistentNPC(enemy.id).id;

		let enemyType = enemy.Enemy;
		if (!enemyType.style) return; // Dont make one for enemies without styles
		let NPC = null;
		if (!KDNPCChar.get(id)) {
			NPC = suppressCanvasUpdate(() => CharacterLoadNPC(id, KDEnemyName(enemy), value?.Palette));
			KDNPCChar.set(id, NPC);
			KDNPCChar_ID.set(NPC, id);
			value = value || KDGetPersistentNPC(enemy.id);
			// Use a pointer
			KDNPCStyle.set(NPC, value);
			if (!value.bodystyle && !value.facestyle && !value.hairstyle) {
				if (enemyType?.style || enemyType.style) {
					if (KDModelStyles[enemyType?.style || enemyType.style]) {
						let style = KDModelStyles[enemyType?.style || enemyType.style];
						if (!value.bodystyle && style.Bodystyle) {
							value.bodystyle = style.Bodystyle[Math.floor(Math.random() * style.Bodystyle.length)];
						}
						if (!value.hairstyle && style.Hairstyle) {
							value.hairstyle = style.Hairstyle[Math.floor(Math.random() * style.Hairstyle.length)];
						}
						if (!value.facestyle && style.Facestyle) {
							value.facestyle = style.Facestyle[Math.floor(Math.random() * style.Facestyle.length)];
						}
						if (!value.cosplaystyle && style.Cosplay) {
							value.cosplaystyle = style.Cosplay[Math.floor(Math.random() * style.Cosplay.length)];
						}

					}
				}
			}

			// Draw once to create the model
			// Kinda a hack...
			DrawCharacter(NPC, PIXIWidth, PIXIHeight, 0.1);
			if (enemyType?.outfit || enemyType.outfit) {
				KinkyDungeonSetDress(
					value?.outfit || enemyType.outfit,
					value?.outfit || enemyType.outfit, NPC, true);
			}
			KDRefreshCharacter.set(NPC, true);
		} else {
			NPC = KDNPCChar.get(id);
			KDNPCChar_ID.set(NPC, id);
		}
	}
}

/**
 * Function for filtering various things that would make it impossible for an NPC to play with the player
 * @param enemy
 */
function KDPlayPossible(enemy: entity): boolean {
	return enemy?.Enemy && !enemy.Enemy.tags?.nobrain && !enemy.Enemy.tags?.noplay && !enemy.Enemy.Behavior?.noPlay;
}

/**
 * @param target
 * @param player
 */
function KDCanApplyBondage(target: entity, player: entity, extraCondition: (t: entity, p: entity) => boolean = undefined): boolean {
	if (player?.player) {
		return (extraCondition ? extraCondition(target, player) : false)
			|| (KDEntityBuffedStat(KinkyDungeonPlayerEntity, "TimeSlow")
				> KDEntityBuffedStat(target, "TimeSlow"))
			|| (KinkyDungeonIsDisabled(target))
			|| KDWillingBondage(target, player);
	}
	return KinkyDungeonIsDisabled(target);
}

/**
 * @param target
 * @param player
 */
function KDWillingBondage(target: entity, player: entity): boolean {
	return (KDIsDistracted(target) && KDLoosePersonalities.includes(target.personality))
		|| (player?.player && (target.playWithPlayer && KDCanDom(target)));
}
