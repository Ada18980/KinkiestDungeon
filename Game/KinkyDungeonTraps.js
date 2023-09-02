"use strict";


/** @type {Record<string, KDTrapType>} */
let KDTrapTypes = {
	CustomSleepDart: (tile, entity, x, y) => {
		let spell = KinkyDungeonFindSpell("TrapSleepDart", true);
		if (spell) {
			// Search any tile 4 tiles up or down that have Line of Sight to the player
			let startX = x;
			let startY = y;
			let possible_coords = [
				{x: -4, y: 0}, {x: 4, y: 0}, {x: 0, y: -4}, {x: 0, y: 4},
				{x: -3, y: 0}, {x: 3, y: 0}, {x: 0, y: -3}, {x: 0, y: 3},
				{x: -2, y: 0}, {x: 2, y: 0}, {x: 0, y: -2}, {x: 0, y: 2},
			];
			let success = false;
			for (let coord of possible_coords) {
				if (KinkyDungeonCheckProjectileClearance(startX + coord.x, startY + coord.y, startX, startY)) {
					startX += coord.x;
					startY += coord.y;
					success = true;
					break;
				}
			}
			if (success) {
				// We fire the dart
				let player = KinkyDungeonEnemyAt(x, y) ? KinkyDungeonEnemyAt(x, y) : KinkyDungeonPlayerEntity;
				KinkyDungeonCastSpell(x, y, spell, { x: startX, y: startY }, player, undefined);
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Trap.ogg");
				KinkyDungeonTilesDelete(x + "," + y);
				return {
					triggered: true,
					msg: "",
				};
			} else {
				// We do sleep gas instead
				spell = KinkyDungeonFindSpell("SleepGas", true);
				if (spell) {
					KinkyDungeonCastSpell(x, y, spell, undefined, undefined, undefined);
					if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Trap.ogg");
					KinkyDungeonTilesDelete(x + "," + y);
					return {
						triggered: true,
						msg: TextGet("KinkyDungeonSpellCast" + spell.name),
					};
				}
			}
		}
		return {
			triggered: false,
			msg: "",
		};
	},
	BedTrap: (tile, entity, x, y) => {
		if (entity.player)
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("BedTrap"), 0, true);
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Trap.ogg");
		tile.Trap = undefined;
		tile.Type = undefined;
		KinkyDungeonMakeNoise(10, x, y);
		return {
			triggered: true,
			msg: TextGet("KDBedTrap"),
		};
	},
	CageTrap: (tile, entity, x, y) => {
		if (entity.player)
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("CageTrap"), 0, true);
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Trap.ogg");
		tile.Trap = undefined;
		tile.Type = undefined;
		return {
			triggered: true,
			msg: TextGet("KDCageTrap"),
		};
	},
	BarrelTrap: (tile, entity, x, y) => {
		if (entity.player)
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("BarrelTrap"), 0, true);
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Trap.ogg");
		tile.Trap = undefined;
		tile.Type = undefined;
		return {
			triggered: true,
			msg: TextGet("KDBarrelTrap"),
		};
	},
	CustomVine: (tile, entity, x, y) => {
		let restraint = KinkyDungeonGetRestraintByName("VinePlantFeet");
		if (restraint) {
			KDSendStatus('bound', tile.Trap, "trap");

			if (entity.player)
				KinkyDungeonAddRestraintIfWeaker(restraint, tile.Power, false);
		}
		let created = KinkyDungeonSummonEnemy(x, y, "VinePlant", tile.Power, 1).length;
		if (created > 0) {
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Trap.ogg");
			KinkyDungeonTilesDelete(x + "," + y);
		}
		return {
			triggered: true,
			msg: created > 0 ? "Default" : "",
		};
	},
	SpawnEnemies: (tile, entity, x, y) => {
		let radius = tile.Power > 4 ? 4 : 2;
		let created = KinkyDungeonSummonEnemy(x, y, tile.Enemy, tile.Power, radius, true, undefined, undefined, true, "Ambush", true, 1.5, true).length;
		if (created > 0) {
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Trap.ogg");
			KinkyDungeonTilesDelete(x + "," + y);
		}
		return {
			triggered: created > 0,
			msg: created > 0 ? TextGet("KinkyDungeonTrapSpawn" + tile.Enemy) : "",
		};
	},
	SpecificSpell: (tile, entity, x, y) => {
		let spell = KinkyDungeonFindSpell(tile.Spell, true);
		if (spell) {
			let xx = 0;
			let yy = 0;
			if (!tile.noVary) {
				for (let i = 0; i < 10; i++) {
					xx = Math.floor(KDRandom() * 3 - 1);
					yy = Math.floor(KDRandom() * 3 - 1);
					if (xx != 0 || yy != 0) i = 1000;
				}
			}
			KinkyDungeonCastSpell(x + xx, y + yy, spell, undefined, undefined, undefined, "Trap");
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Trap.ogg");
			KinkyDungeonTilesDelete(x + "," + y);
			let etiles = Object.values(KDGetEffectTiles(x, y)).filter((etile) => {
				return etile.tags && etile.tags.includes("runetrap");
			});
			if (etiles?.length > 0) {
				for (let et of etiles) {
					et.duration = 0;
				}
			}
		}
		return {
			triggered: spell != undefined,
			msg: "",
		};
	},


};

let KDTrapTypesStepOff = {
	DoorLock: (tile, entity, x, y) => {
		let created = 0;
		if (KinkyDungeonNoEnemy(x, y)) {
			let lifetime = tile.Lifetime ? tile.Lifetime : undefined;
			KinkyDungeonMapSet(x, y, 'D');
			let spawned = 0;
			let maxspawn = 1 + Math.round(Math.min(2 + KDRandom() * 2, KinkyDungeonDifficulty/25) + Math.min(2 + KDRandom() * 2, 0.5*MiniGameKinkyDungeonLevel/KDLevelsPerCheckpoint));
			if (tile.SpawnMult) maxspawn *= tile.SpawnMult;
			let requireTags = ["doortrap"];

			let tags = ["doortrap"];
			KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);

			for (let i = 0; i < 30; i++) {
				if (spawned < maxspawn) {
					let Enemy = KinkyDungeonGetEnemy(
						tags, MiniGameKinkyDungeonLevel,
						KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
						'0', requireTags, true);
					if (Enemy) {
						KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, Enemy.name, 1, 7, true, Enemy.tags.construct ? 23 : undefined, undefined, true, "Ambush", true, 1.5, true, undefined, true);
						if (Enemy.tags.minor) spawned += 0.4;
						else spawned += 1;
					}
				}
			}
			if (spawned > 0) {
				KinkyDungeonMapSet(x, y, 'd');
				created = KinkyDungeonSummonEnemy(x, y, "DoorLock", 1, 0, false, lifetime).length;
				if (created > 0) {
					if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/MagicSlash.ogg");
					KinkyDungeonMakeNoise(12, x, y);
					KinkyDungeonTilesDelete(x + "," + y);
					KinkyDungeonMapSet(x, y, 'D');
				}
			} else
				KinkyDungeonMapSet(x, y, 'd');
		}
		return {
			msg: created > 0 ? "Default" : "",
		};
	}
};

let KinkyDungeonTrapMoved = false;

function KinkyDungeonHandleStepOffTraps(entity, x, y, moveX, moveY) {
	let flags = {
		AllowTraps: true,
	};
	let tile = KinkyDungeonTilesGet(x + "," + y);
	if (tile && tile.StepOffTrap && !KinkyDungeonFlags.has("nojailbreak")) {
		if (!tile.StepOffTiles || tile.StepOffTiles.includes(moveX + "," + moveY)) {
			KinkyDungeonSendEvent("beforeStepOffTrap", {x:x, y:y, tile: tile, flags: flags});
			let msg = "";
			let color = "#ff0000";

			if (KDTrapTypes[tile.Trap]) {
				let res = KDTrapTypes[tile.Trap](tile, entity, x, y);
				msg = res.msg;
			}

			if (msg) {
				KDTrigPanic();

				if (msg == "Default")
					KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonTrap" + tile.StepOffTrap), color, 2);
				else
					KinkyDungeonSendTextMessage(10, msg, color, 2);
			}
		}
	}

}

function KinkyDungeonHandleTraps(entity, x, y, Moved) {
	let flags = {
		AllowTraps: true,
	};
	let tile = KinkyDungeonTilesGet(x + "," + y);
	if (tile && tile.Type == "Trap" && !KinkyDungeonFlags.has("nojailbreak")) {
		KinkyDungeonSendEvent("beforeTrap", {x:x, y:y, tile: tile, flags: flags});
		if (flags.AllowTraps && Moved) {
			let msg = "";
			let triggered = false;
			let color = "#ff0000";
			if (KinkyDungeonStatsChoice.has("Rusted") && KDRandom() < 0.25) {
				msg = TextGet("KDTrapMisfire");
			} else {
				if (KDTrapTypes[tile.Trap]) {
					let res = KDTrapTypes[tile.Trap](tile, entity, x, y);
					msg = res.msg;
					triggered = res.triggered;
				}
			}
			if (entity.player && (msg || triggered)) {
				KDTrigPanic();
			}
			if (msg) {
				if (msg == "Default")
					KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonTrap" + tile.Trap + (tile.extraTag || "")), color, 2 + KinkyDungeonSlowMoveTurns);
				else
					KinkyDungeonSendTextMessage(10, msg, color, 2 + KinkyDungeonSlowMoveTurns);
			}
		}
	}

	KinkyDungeonTrapMoved = false;
}

function KDTrigPanic() {
	if (KinkyDungeonStatsChoice.has("Panic")) {
		KinkyDungeonSendActionMessage(10, TextGet("KDPanic"), "#ff0000", 3);
		KinkyDungeonSlowMoveTurns = Math.max(KinkyDungeonSlowMoveTurns, 2);
	}
}

/**
 *
 * @returns {{ Name: string; Enemy?: string; Spell?: string; Level: number; Power: number; Weight: number; strict?: true;}[]}
 */
function KinkyDungeonGetGoddessTrapTypes() {
	/**
	 * @type {{ Name: string; Enemy?: string; Spell?: string; Level: number; Power: number; Weight: number; strict?: true;}[]}
	 */
	let trapTypes = [];
	if (KinkyDungeonGoddessRep.Rope < KDANGER) {
		trapTypes.push({ Name: "SpecificSpell", Spell: "TrapRopeWeak", Level: 0, Power: 3, Weight: 15 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "Ninja", Level: 0, Power: 3, Weight: 10 });
	}
	if (KinkyDungeonGoddessRep.Rope < KDRAGE) {
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "RopeKraken", Level: 0, Power: 1, Weight: 10 });
		trapTypes.push({ Name: "SpecificSpell", Spell: "TrapRopeStrong", Level: 0, Power: 3, Weight: 40 });
	}
	if (KinkyDungeonGoddessRep.Leather < KDANGER) {
		trapTypes.push({ Name: "SpecificSpell", Spell: "TrapLeatherWeak", Level: 0, Power: 3, Weight: 15 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "Dragon", Level: 0, Power: 3, Weight: 10 });
	}
	if (KinkyDungeonGoddessRep.Leather < KDRAGE) {
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "DragonLeader", Level: 0, Power: 2, Weight: 50 });
	}
	if (KinkyDungeonGoddessRep.Metal < KDANGER) {
		trapTypes.push({ Name: "SpecificSpell", Spell: "TrapCableWeak", Level: 0, Power: 3, Weight: 15 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "Drone", Level: 0, Power: 3, Weight: 10 });
	}
	if (KinkyDungeonGoddessRep.Metal < KDRAGE) {
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "Wolfgirl", Level: 0, Power: 3, Weight: 50 });
	}
	if (KinkyDungeonGoddessRep.Latex < KDANGER) {
		trapTypes.push({ Name: "SpecificSpell", Spell: "TrapSlimeWeak", Level: 0, Power: 3, Weight: 10 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "Alkahestor", Level: 0, Power: 1, Weight: 5 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "SmallSlime", Level: 0, Power: 6, Weight: 10 });
	}
	if (KinkyDungeonGoddessRep.Latex < KDRAGE) {
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "SlimeEnthusiast", Level: 0, Power: 2, Weight: 20 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "BigSlime", Level: 0, Power: 3, Weight: 10 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ElementalLatex", Level: 0, Power: 2, Weight: 20 });
	}
	if (KinkyDungeonGoddessRep.Elements < KDANGER) {
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ElementalFire", Level: 0, Power: 2, Weight: 5 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ElementalIce", Level: 0, Power: 2, Weight: 5 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ElementalWater", Level: 0, Power: 2, Weight: 5 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ElementalEarth", Level: 0, Power: 2, Weight: 5 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ElementalAir", Level: 0, Power: 2, Weight: 5 });
	}
	if (KinkyDungeonGoddessRep.Elements < KDRAGE) {
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ElementalFire", Level: 0, Power: 4, Weight: 10 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ElementalIce", Level: 0, Power: 4, Weight: 10 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ElementalWater", Level: 0, Power: 4, Weight: 10 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ElementalEarth", Level: 0, Power: 4, Weight: 10 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ElementalAir", Level: 0, Power: 4, Weight: 10 });
	}
	if (KinkyDungeonGoddessRep.Conjure < KDANGER) {
		trapTypes.push({ Name: "SpecificSpell", Spell: "TrapMagicChainsWeak", Level: 0, Power: 3, Weight: 15 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "TickleHand", Level: 0, Power: 6, Weight: 10 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "Dressmaker", Level: 0, Power: 2, Weight: 5 });
	}
	if (KinkyDungeonGoddessRep.Conjure < KDRAGE) {
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "Conjurer", Level: 0, Power: 1, Weight: 15 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "Dressmaker", Level: 0, Power: 2, Weight: 25 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "ConjurerTickler", Level: 0, Power: 1, Weight: 25 });
	}
	if (KinkyDungeonGoddessRep.Illusion < KDANGER) {
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "Maidforce", Level: 0, Power: 3, Weight: 15 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "MaidforcePara", Level: 0, Power: 2, Weight: 10 });
		trapTypes.push({ Name: "SpecificSpell", Spell: "TrapRopeHoly", Level: 2, Power: 3, Weight: 30 });
	}
	if (KinkyDungeonGoddessRep.Illusion < KDRAGE) {
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "Maidforce", Level: 0, Power: 4, Weight: 15 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "MaidforcePara", Level: 0, Power: 3, Weight: 15 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "MaidforceMafia", Level: 0, Power: 3, Weight: 10 });
		trapTypes.push({ Name: "SpawnEnemies", strict: true,Enemy: "MaidforceHead", Level: 0, Power: 1, Weight: 10 });
	}

	return trapTypes;
}

function KinkyDungeonGetTrap(trapTypes, Level, tags) {

	let trapWeightTotal = 0;
	let trapWeights = [];

	for (let trap of trapTypes) {
		let effLevel = Level;
		let weightMulti = 1.0;
		let weightBonus = 0;

		if (effLevel >= trap.Level) {
			trapWeights.push({trap: trap, weight: trapWeightTotal});
			let weight = trap.Weight + weightBonus;
			if (trap.terrainTags)
				for (let tag of tags)
					if (trap.terrainTags[tag]) weight += trap.terrainTags[tag];

			trapWeightTotal += Math.max(0, weight*weightMulti);

		}
	}

	let selection = KDRandom() * trapWeightTotal;

	for (let L = trapWeights.length - 1; L >= 0; L--) {
		if (selection > trapWeights[L].weight) {
			return {
				Name: trapWeights[L].trap.Name,
				Restraint: trapWeights[L].trap.Restraint,
				Enemy: trapWeights[L].trap.Enemy,
				Spell: trapWeights[L].trap.Spell,
				Power: trapWeights[L].trap.Power,
				extraTag: trapWeights[L].trap.extraTag,
			};
		}
	}

}


function KDSmokePuff(x, y, radius, density, nomsg) {
	if (!nomsg)
		KinkyDungeonSendTextMessage(2, TextGet("KDSmokePuff"), "white", 2);
	for (let X = x - Math.floor(radius); X <= x + Math.floor(radius); X++)
		for (let Y = y - Math.floor(radius); Y <= y + Math.floor(radius); Y++) {
			if ((!density || KDRandom() < density || (X == x && Y == Y)) && KDistEuclidean(X - x, Y - y) <= radius) {
				let spell = KinkyDungeonFindSpell("SmokePuff", true);
				if (spell) {
					KinkyDungeonCastSpell(X, Y, spell, undefined, undefined, undefined);
				}
			}
		}
}

function KDSteamPuff(x, y, radius, density, nomsg) {
	if (!nomsg)
		KinkyDungeonSendTextMessage(2, TextGet("KDSteamPuff"), "white", 2);
	for (let X = x - Math.floor(radius); X <= x + Math.floor(radius); X++)
		for (let Y = y - Math.floor(radius); Y <= y + Math.floor(radius); Y++) {
			if ((!density || KDRandom() < density || (X == x && Y == Y)) && KDistEuclidean(X - x, Y - y) <= radius) {
				let spell = KinkyDungeonFindSpell("SteamPuff", true);
				if (spell) {
					KinkyDungeonCastSpell(X, Y, spell, undefined, undefined, undefined);
				}
			}
		}
}