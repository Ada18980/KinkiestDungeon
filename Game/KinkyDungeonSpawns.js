"use strict";



function KinkyDungeonAddTags(tags, Floor) {
	let security = (KinkyDungeonGoddessRep.Prisoner + 50);

	if (Floor % KDLevelsPerCheckpoint >= 2 || Floor % KDLevelsPerCheckpoint == 0 || KinkyDungeonDifficulty >= 20) tags.push("secondhalf");
	if (Floor % KDLevelsPerCheckpoint >= 3 || Floor % KDLevelsPerCheckpoint == 0 || KinkyDungeonDifficulty >= 40) tags.push("lastthird");

	let angeredGoddesses = [];

	if (KinkyDungeonGoddessRep.Rope < KDANGER) angeredGoddesses.push({tag: "ropeAnger", type: "rope"});
	if (KinkyDungeonGoddessRep.Rope < KDRAGE) angeredGoddesses.push({tag: "ropeRage", type: "rope"});
	if (KinkyDungeonGoddessRep.Leather < KDANGER) angeredGoddesses.push({tag: "leatherAnger", type: "rope"});
	if (KinkyDungeonGoddessRep.Leather < KDRAGE) angeredGoddesses.push({tag: "leatherRage", type: "rope"});
	if (KinkyDungeonGoddessRep.Metal < KDANGER) angeredGoddesses.push({tag: "metalAnger", type: "rope"});
	if (KinkyDungeonGoddessRep.Metal < KDRAGE) angeredGoddesses.push({tag: "metalRage", type: "rope"});
	if (KinkyDungeonGoddessRep.Latex < KDANGER) angeredGoddesses.push({tag: "latexAnger", type: "rope"});
	if (KinkyDungeonGoddessRep.Latex < KDRAGE) angeredGoddesses.push({tag: "latexRage", type: "rope"});
	if (KinkyDungeonGoddessRep.Elements < KDANGER) angeredGoddesses.push({tag: "elementsAnger", type: "rope"});
	if (KinkyDungeonGoddessRep.Elements < KDRAGE) angeredGoddesses.push({tag: "elementsRage", type: "rope"});
	if (KinkyDungeonGoddessRep.Conjure < KDANGER) angeredGoddesses.push({tag: "conjureAnger", type: "rope"});
	if (KinkyDungeonGoddessRep.Conjure < KDRAGE) angeredGoddesses.push({tag: "conjureRage", type: "rope"});
	if (KinkyDungeonGoddessRep.Illusion < KDANGER) angeredGoddesses.push({tag: "illusionAnger", type: "rope"});
	if (KinkyDungeonGoddessRep.Illusion < KDRAGE) angeredGoddesses.push({tag: "illusionRage", type: "rope"});
	if (KinkyDungeonGoddessRep.Will < KDANGER) angeredGoddesses.push({tag: "willAnger", type: "rope"});
	if (KinkyDungeonGoddessRep.Will < KDRAGE) angeredGoddesses.push({tag: "willRage", type: "rope"});

	for (let pair of KDFactionRelations.get("Player").entries()) {
		if (pair[1] > 0.5) {
			tags.push(pair[0] + "Friendly");
		} else if (pair[1] < -0.5) {
			tags.push(pair[0] + "Enemy");
		}
		if (pair[1] > 0.75) {
			tags.push(pair[0] + "Allied");
		} else if (pair[1] < -0.75) {
			tags.push(pair[0] + "Wanted");
		}
		if (pair[1] > 0.9) {
			tags.push(pair[0] + "Loved");
		} else if (pair[1] < -0.9) {
			tags.push(pair[0] + "Hated");
		}
	}

	if (angeredGoddesses.length > 0) {
		let rage = false;
		for (let a of angeredGoddesses) {
			if (!rage && a.tag && a.tag.includes("Rage")) {
				rage = true;
				tags.push("goddessRage");
			}
		}
		for (let i = 0; i < 2; i++) {
			let tag = angeredGoddesses[Math.floor(angeredGoddesses.length * KDRandom())];
			if (tag && !tags.includes(tag.tag)) {
				for (let a of angeredGoddesses) {
					if (a.type == tag.type) {
						tags.push(a.tag);
					}
				}
			}
		}
		tags.push("goddessAnger");
	}


	let overrideTags = [];
	if (KinkyDungeonGoddessRep.Will < -45) {tags.push("plant"); tags.push("beast");}
	if (KinkyDungeonGoddessRep.Metal < -45) tags.push("robot");
	if (KinkyDungeonGoddessRep.Leather < -45) tags.push("bandit");
	if (KinkyDungeonGoddessRep.Illusion < -45) tags.push("ghost");
	if (KinkyDungeonGoddessRep.Conjure < -45) tags.push("witch");
	if (KinkyDungeonGoddessRep.Conjure < -45) tags.push("book");
	if (KinkyDungeonGoddessRep.Elements < -45) tags.push("elemental");
	if (KinkyDungeonGoddessRep.Latex < -45) tags.push("slime");
	if (KinkyDungeonGoddessRep.Rope < -45) tags.push("construct");

	if (KinkyDungeonGoddessRep.Will >= 0) {tags.push("posWill");}
	if (KinkyDungeonGoddessRep.Metal >= 0) tags.push("posMetal");
	if (KinkyDungeonGoddessRep.Leather >= 0) tags.push("posLeather");
	if (KinkyDungeonGoddessRep.Illusion >= 0) tags.push("posIllusion");
	if (KinkyDungeonGoddessRep.Conjure >= 0) tags.push("posConjure");
	if (KinkyDungeonGoddessRep.Elements >= 0) tags.push("posElements");
	if (KinkyDungeonGoddessRep.Latex >= 0) tags.push("posLatex");
	if (KinkyDungeonGoddessRep.Rope >= 0) tags.push("posRope");

	if (security > 0) tags.push("jailbreak");
	if (security > 40) tags.push("highsecurity");

	return overrideTags;
}

let KDPerkToggleTags = [
	"NoNurse",
];

/**
 *
 * @param {string[]} enemytags
 * @param {number} Level
 * @param {string} Index
 * @param {string} Tile
 * @param {string[]} [requireTags]
 * @param {boolean} [requireHostile]
 * @param {Record<string, {bonus: number, mult: number}>} [bonusTags]
 * @param {string[]} [filterTags]
 * @param {string[]} [requireSingleTag]
 * @returns {enemy}
 */
function KinkyDungeonGetEnemy(enemytags, Level, Index, Tile, requireTags, requireHostile, bonusTags, filterTags, requireSingleTag) {
	let enemyWeightTotal = 0;
	let enemyWeights = [];
	let tags = Object.assign([], enemytags);
	for (let t of KDPerkToggleTags) {
		if (KinkyDungeonStatsChoice.get(t)) {
			tags.push(t);
		}
	}

	for (let enemy of KinkyDungeonEnemies) {
		let effLevel = Level + 25 * KinkyDungeonNewGame;
		let weightMulti = 1.0;
		let weightBonus = 0;

		if (!KinkyDungeonStatsChoice.get("arousalMode") && enemy.arousalMode) weightMulti = 0;

		if (enemy.shrines) {
			for (let shrine of enemy.shrines) {
				if (KinkyDungeonGoddessRep[shrine]) {
					let rep = KinkyDungeonGoddessRep[shrine];
					if (rep > 0) weightMulti *= Math.max(0, 1 - rep/100); // ranges from 1 to 0.5
					else if (rep < 0) {
						weightMulti = Math.max(weightMulti, Math.max(1, 1 - rep/100)); // ranges from 1 to 2
						weightBonus = Math.max(weightBonus, Math.min(10, -rep/10));
						//effLevel += -rep/2.5;
					}
				}
			}
		}

		let noOverride = ["boss", "miniboss", "elite", "minor"];
		let overrideFloor = false;
		for (let t of tags) {
			if (!enemy.noOverrideFloor && !noOverride.includes(t)) {
				// We don't override the floor just for having the seniority tags specified
				if (enemy.tags[t]) {
					overrideFloor = true;
					weightMulti *= 1.25;
				}
			} else {
				// We DO override if the enemy has outOfBoxWeightMult, otherwise we apply a penalty.
				if (enemy.outOfBoxWeightMult) {
					weightMulti *= 1.25;
				} else {
					weightMulti *= 0.1;
				}
			}
		}
		if (bonusTags)
			for (let t of Object.entries(bonusTags)) {
				if (enemy.tags[t[0]]) {
					weightBonus += t[1].bonus;
					weightMulti *= t[1].mult;
				}
			}

		if (effLevel >= enemy.minLevel && (!enemy.maxLevel || effLevel < enemy.maxLevel)
			&& (!filterTags || !filterTags.some((tag) => {return enemy.tags[tag];}))
			&& (!requireHostile || !enemy.faction || KDFactionRelation("Player", enemy.faction) <= -0.5)
			&& (overrideFloor || enemy.allFloors || !enemy.floors || enemy.floors[Index])
			&& (KinkyDungeonGroundTiles.includes(Tile) || !enemy.tags.spawnFloorsOnly)) {
			let rt = true;
			let rst = false;
			if (requireTags)
				for (let t of requireTags) {
					if (!enemy.tags[t]) {rt = false; break;}
				}
			if (requireSingleTag)
				for (let t of requireSingleTag) {
					if (enemy.tags[t]) {rst = true; break;}
				}
			else rst = true;
			if (rt && rst) {
				enemyWeights.push({enemy: enemy, weight: enemyWeightTotal});
				let weight = enemy.weight + weightBonus;
				if (enemy.terrainTags.increasingWeight)
					weight += enemy.terrainTags.increasingWeight * Math.floor(Level/KDLevelsPerCheckpoint);
				if (!enemy.terrainTags.grate && tags.includes("grate"))
					weight -= 1000;
				for (let tag of tags)
					if (enemy.terrainTags[tag]) weight += enemy.terrainTags[tag];

				if (weight > 0)
					enemyWeightTotal += Math.max(0, weight*weightMulti);
			}
		}
	}

	let selection = KDRandom() * enemyWeightTotal;

	for (let L = enemyWeights.length - 1; L >= 0; L--) {
		if (selection > enemyWeights[L].weight) {
			if (enemyWeights[L].enemy.name == "Mimic") console.log("Mimic says boo");
			return enemyWeights[L].enemy;
		}
	}
}

/**
 *
 * @param {string} name
 * @returns {enemy}
 */
function KinkyDungeonGetEnemyByName(name) {
	return KinkyDungeonEnemies.find(element => element.name == name);
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {boolean} noTransgress
 * @param {boolean} normalDrops
 * @param {string[]} [requireTags]
 * @returns {entity}
 */
function KinkyDungeonCallGuard(x, y, noTransgress, normalDrops, requireTags) {
	//if (!noTransgress)
	// KinkyDungeonAggroAction('call', {});
	let point = KinkyDungeonGetNearbyPoint(x, y, true, undefined, true, true);
	if (!point) point = KinkyDungeonGetRandomEnemyPoint(true);
	if (point) {
		if (!KinkyDungeonJailGuard()) {
			// Jail tag
			let jt = KDGameData.GuardFaction?.length > 0 ? KinkyDungeonFactionTag[KDGameData.GuardFaction[Math.floor(KDRandom() * KDGameData.GuardFaction.length)]] : "guardCall";

			let Enemy =  KinkyDungeonGetEnemy(["Guard", jt], MiniGameKinkyDungeonLevel, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', requireTags ? requireTags : [jt, "jail"], true, undefined, ["gagged"]);
			if (!Enemy) {
				Enemy = KinkyDungeonGetEnemy(["Guard", jt], MiniGameKinkyDungeonLevel, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', [jt, "jail"], false, undefined, ["gagged"]);
				if (!Enemy) {
					jt = "guardCall";
					Enemy = KinkyDungeonGetEnemy(["Guard", jt], MiniGameKinkyDungeonLevel, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', [jt, "jail"], false);
				}
			}
			let guard = {summoned: true, noRep: true, noDrop: !normalDrops, Enemy: Enemy, id: KinkyDungeonGetEnemyID(),
				x:KinkyDungeonStartPosition.x, y:KinkyDungeonStartPosition.y, gx: point.x, gy: point.y,
				hp: (Enemy && Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, movePoints: 0, attackPoints: 0};
			KDGameData.KinkyDungeonJailGuard = guard.id;
			KDAddEntity(guard);
			return guard;
		} else {
			KinkyDungeonJailGuard().gx = point.x;
			KinkyDungeonJailGuard().gy = point.y;
			KinkyDungeonJailGuard().gxx = point.x;
			KinkyDungeonJailGuard().gyy = point.y;
			if (KinkyDungeonFindPath(KinkyDungeonJailGuard().x, KinkyDungeonJailGuard().y, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, false, true, KinkyDungeonMovableTilesSmartEnemy) < 15) {
				let p = KinkyDungeonGetRandomEnemyPoint(true, true, undefined, 20, 10);
				KinkyDungeonJailGuard().x = p.x;
				KinkyDungeonJailGuard().y = p.y;
			}
			return KinkyDungeonJailGuard();
		}
	}
	return null;
}

let KinkyDungeonTotalSleepTurns = 0;
let KinkyDungeonSearchTimer = 0;
let KinkyDungeonSearchTimerMin = 60;
let KinkyDungeonFirstSpawn = false;
let KinkyDungeonSearchStartAmount = 30;
let KinkyDungeonSearchHuntersAmount = 90;
let KinkyDungeonSearchEntranceAdjustAmount = 130;
let KinkyDungeonSearchEntranceChaseAmount = 160;

function KinkyDungeonHandleWanderingSpawns(delta) {
	if (KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel) && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel).spawns) return;
	if (KDGameData.RoomType && KinkyDungeonAltFloor(KDGameData.RoomType) && !KinkyDungeonAltFloor(KDGameData.RoomType).spawns) return;
	let effLevel = MiniGameKinkyDungeonLevel + KinkyDungeonDifficulty;
	let HunterAdjust = KinkyDungeonDifficulty;
	let EntranceAdjust = KinkyDungeonDifficulty/2;
	let BaseAdjust = KinkyDungeonDifficulty/10;
	if (KinkyDungeonStatsChoice.get("SearchParty")) {
		BaseAdjust *= 1.2;
		BaseAdjust += KinkyDungeonSearchStartAmount;
		HunterAdjust += KinkyDungeonSearchHuntersAmount - 50;
		EntranceAdjust += KinkyDungeonSearchEntranceAdjustAmount - 30;
		effLevel += 12;
	}
	let sleepTurnsSpeedMult = 100;
	let sleepTurnsPerExtraSpawnLevel = 25;
	let baseChance = ((KDGameData.SleepTurns > 0 && (KinkyDungeonStatStamina > KinkyDungeonStatStaminaMax - 10 * KinkyDungeonStatStaminaRegenSleep || KDGameData.SleepTurns < 11)) ? 0.05 : 0.0005) * Math.sqrt(Math.max(1, effLevel)) * (1 + KinkyDungeonTotalSleepTurns / sleepTurnsSpeedMult);

	let Queue = [];
	if (KDGameData.RespawnQueue && KDGameData.RespawnQueue.length > 0) {
		let firstEnemy = KDGameData.RespawnQueue[Math.floor(KDRandom() * KDGameData.RespawnQueue.length)];
		for (let e of KDGameData.RespawnQueue) {
			if (KDFactionRelation(e.faction, firstEnemy.faction) >= 0.1) {
				Queue.push(e);
			}
		}
	}
	if (Queue.length > 0) baseChance = 0.07 * Math.sqrt(Math.max(1, effLevel));
	// Chance of bothering with random spawns this turn
	if (delta > 0 && KDRandom() < baseChance && KinkyDungeonSearchTimer > KinkyDungeonSearchTimerMin) {
		let hunters = false;
		let spawnLocation = KinkyDungeonStartPosition;
		let spawnPlayerExclusionRadius = 11;
		if ((KinkyDungeonTotalSleepTurns > KinkyDungeonSearchStartAmount - BaseAdjust || Queue.length > 0) && KinkyDungeonEntities.length < Math.min(100, (!KinkyDungeonAggressive()) ? (5 + effLevel/15) : (20 + effLevel/KDLevelsPerCheckpoint))) {
			if (KinkyDungeonTotalSleepTurns > KinkyDungeonSearchHuntersAmount - HunterAdjust) hunters = true;
			if (((KinkyDungeonTotalSleepTurns > KinkyDungeonSearchEntranceAdjustAmount - EntranceAdjust || Queue.length > 0) && KDistChebyshev(KinkyDungeonPlayerEntity.x - KinkyDungeonEndPosition.x, KinkyDungeonPlayerEntity.y - KinkyDungeonEndPosition.y) > spawnPlayerExclusionRadius && KDRandom() < 0.5)
				|| KDistChebyshev(KinkyDungeonPlayerEntity.x - KinkyDungeonStartPosition.x, KinkyDungeonPlayerEntity.y - KinkyDungeonStartPosition.y) < spawnPlayerExclusionRadius) spawnLocation = KinkyDungeonEndPosition;

			if (KinkyDungeonVisionGet(spawnLocation.x, spawnLocation.y) < 1 || KinkyDungeonSeeAll) {
				KinkyDungeonSearchTimer = 0;
				let count = 0;
				let maxCount = (2 + Math.min(5, Math.round(MiniGameKinkyDungeonLevel/10))) * Math.sqrt(1 + KinkyDungeonTotalSleepTurns / sleepTurnsSpeedMult);
				if (KinkyDungeonStatsChoice.get("SearchParty")) {
					maxCount *= 2;
				}
				// Spawn a killsquad!
				let tags = [];
				KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);
				tags.push("boss");

				let miniboss = false;
				let requireTags = ["search"];
				if (hunters) {
					requireTags = ["hunter"];
					tags.push("secondhalf");
					if (KinkyDungeonTotalSleepTurns > KinkyDungeonSearchEntranceChaseAmount)
						tags.push("thirdhalf");
				}

				tags.push("bandit");

				let qq = Queue.length > 0 ? Queue[Math.floor(KDRandom() * Queue.length)] : null;

				let Enemy = qq ?
					KinkyDungeonGetEnemyByName(qq.enemy)
					: KinkyDungeonGetEnemy(
						tags, MiniGameKinkyDungeonLevel + KinkyDungeonDifficulty/5 + Math.round(KinkyDungeonTotalSleepTurns / sleepTurnsPerExtraSpawnLevel),
						KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
						KinkyDungeonMapGet(spawnLocation.x, spawnLocation.y), requireTags, true);
				let EnemiesSummoned = [];
				// We are going to reroll the ghost decision just to provide some grace for players who are well and truly stuck
				KinkyDungeonMakeGhostDecision();
				while (Enemy && count < maxCount) {
					let point = KinkyDungeonGetNearbyPoint(spawnLocation.x, spawnLocation.y, true);
					if (point) {
						let X = point.x;
						let Y = point.y;
						EnemiesSummoned.push(Enemy.name);
						let e = {tracking: true, summoned: true, faction: qq ? qq.faction : undefined, Enemy: Enemy, id: KinkyDungeonGetEnemyID(), x:X, y:Y, hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, movePoints: 0, attackPoints: 0};
						KDAddEntity(e);
						KinkyDungeonSetEnemyFlag(e, "NoFollow", -1);
						let shop = KinkyDungeonGetShopForEnemy(e);
						if (shop) {
							KinkyDungeonSetEnemyFlag(e, "Shop", -1);
							KinkyDungeonSetEnemyFlag(e, shop, -1);
						}

						if (Enemy.tags.minor) count += 0.1; else count += 1; // Minor enemies count as 1/10th of an enemy
						if (Enemy.tags.boss) {
							count += 3 * Math.max(1, 100/(100 + KinkyDungeonDifficulty));
							tags.push("boss");
						} // Boss enemies count as 4 normal enemies
						else if (Enemy.tags.elite) count += Math.max(1, 1000/(2000 + 20*KinkyDungeonDifficulty + KinkyDungeonTotalSleepTurns)); // Elite enemies count as 1.5 normal enemies
						if (Enemy.tags.miniboss) {
							if (!miniboss) tags.push("boss");
							miniboss = true; // Adds miniboss as a tag
						}


						KDGameData.RespawnQueue.splice(KDGameData.RespawnQueue.indexOf(qq), 1);
						Queue.splice(Queue.indexOf(qq), 1);

						if (Enemy.summon) {
							for (let sum of Enemy.summon) {
								if (!sum.chance || KDRandom() < sum.chance)
									KinkyDungeonSummonEnemy(X, Y, sum.enemy, sum.count, sum.range, sum.strict);
							}
						}
					} else count += 0.1;

					qq = Queue.length > 0 ? Queue[Math.floor(KDRandom() * Queue.length)] : null;

					Enemy = qq ?
						KinkyDungeonGetEnemyByName(qq.enemy)
						: KinkyDungeonGetEnemy(tags, MiniGameKinkyDungeonLevel + effLevel/KDLevelsPerCheckpoint, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], KinkyDungeonMapGet(spawnLocation.x, spawnLocation.y), requireTags);
				}
				if (EnemiesSummoned.length > 0 && KinkyDungeonFirstSpawn) {
					KinkyDungeonFirstSpawn = false;
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonFirstSpawn"), "white", KDGameData.SleepTurns + 5);
				}
				if (KinkyDungeonTotalSleepTurns > KinkyDungeonSearchEntranceChaseAmount && !KinkyDungeonHuntDownPlayer && KDGameData.SleepTurns < 3) {
					KinkyDungeonHuntDownPlayer = true;
					KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonHuntDownPlayer"), "#ff0000", KDGameData.SleepTurns + 10);
				}
				console.log(EnemiesSummoned);
			}
		}
		// Only increment the timer when not in jail
	} else if (!(KDGameData.PrisonerState == 'jail')) KinkyDungeonSearchTimer += delta;

	// Trigger when there is no hunter timer or is 0
	if (!(KDGameData.HunterTimer > 0)) {
		// If undefined we set it so that it starts ticking down
		if (KDGameData.HunterTimer == undefined) KDGameData.HunterTimer = HunterPulse;
		else {
			// If defined and 0 then we check if hunters are still alive, spawn if not,
			if (!KDGameData.Hunters) KDGameData.Hunters = [];
			let hunters = KDGameData.Hunters.map((id) => {return KinkyDungeonFindID(id);});

			let spawnLocation = {x: KinkyDungeonStartPosition.x, y: KinkyDungeonStartPosition.y};

			if (hunters.length > 0 || KDistChebyshev(spawnLocation.x - KinkyDungeonPlayerEntity.x, spawnLocation.y - KinkyDungeonPlayerEntity.y) < 10) {
				// Hunters still exist, or player is too close, simple pulse
				KDGameData.HunterTimer = Math.max(KDGameData.HunterTimer, HunterPulse);
			} else {
				// Hunters are dead, we spawn more
				/**
				 * @type {entity[]}
				 */
				let eToSpawn = [];
				KDGameData.Hunters = [];

				// Determine enemies to spawn

				// Spawn them
				for (let e of eToSpawn) {
					let point = KinkyDungeonGetNearbyPoint(spawnLocation.x, spawnLocation.y, true);
					if (point) {
						e.x = point.x;
						e.y = point.y;
						KDAddEntity(e);
						KDGameData.Hunters.push(e.id);
					}
				}
			}

		}
	}
	// Decrement the hunter timer
	if (KDGameData.HunterTimer > 0) KDGameData.HunterTimer = Math.max(0, KDGameData.HunterTimer - delta);
}

/** The defauilt interval between hunter checks */
let HunterPulse = 25;
/** Cooldown for hunter spawns */
let HunterSpawnTimer = 120;