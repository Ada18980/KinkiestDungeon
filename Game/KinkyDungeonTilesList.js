"use strict";


/**
 * Return value: whether or not to continue to allow peripheral tile updates
 * @type {Record<string, (delta) => boolean>}
 */
let KDTileUpdateFunctions = {
	"]": (delta) => { // Happy Gas!
		KinkyDungeonChangeDistraction(1 * delta, false, 0.1);
		KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonHappyGas"), "pink", 1);
		return true;
	},
	"[": (delta) => { // Happy Gas!
		KinkyDungeonSleepiness = Math.max(KinkyDungeonSleepiness + 2, 5);
		KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSporeGas"), "pink", 1);
		return true;
	},
	"L" : (delta) => { // Barrel
		if (KinkyDungeonTiles.get(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)) {
			if (KinkyDungeonTiles.get(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Furniture == "Cage" && !KDGameData.PrisonerState) {
				let power = 0;
				if (KDBoundPowerLevel >= 0.35) power = 2;
				else if (KDBoundPowerLevel >= 0.1) power = 1;
				if (power >= 2) {
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage2", type: "Sneak", duration: 1, power: 9.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "darkness", "move", "cast"]});
				} else if (power >= 1) {
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage", type: "SlowDetection", duration: 1, power: 4.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "cage2", type: "Sneak", duration: 1, power: 2.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "darkness", "move", "cast"]});
				}
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), "lightgreen", 1, true);
			}
		} else {
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "barrel", type: "SlowDetection", duration: 1, power: 9.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "barrel3", type: "Sneak", duration: 1, power: 1.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "darkness", "move", "cast"]});
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "barrel2", type: "SlowLevel", duration: 1, power: 1, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Slow", "move", "cast"]});
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonBarrel"), "lightgreen", 1, true);
		}
		return true;
	},
	"?": (delta) =>  { // High hook
		KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonHookHigh"), "lightgreen", 1, true);
		return true;
	},
	"/": (delta) =>  { // Low hook
		KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonScrap"), "lightgreen", 1, true);
		return true;
	},
};

/**
 * @type {Record<string, (moveX, moveY) => boolean>}
 */
let KDMoveObjectFunctions = {
	'B': (moveX, moveY) => {
		if (!KinkyDungeonFlags.get("slept") && !KinkyDungeonFlags.get("nobed") && KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.95) {
			KDStartDialog("Bed", "", true);
		}
		return false;
	},
	'l': (moveX, moveY) => {
		if (!KinkyDungeonFlags.get("noleyline") && KinkyDungeonStatManaPool < KinkyDungeonStatManaPoolMax && KDTile(moveX, moveY) && KDTile(moveX, moveY).Leyline) {
			KDStartDialog("Leyline", "", true);
		}
		return false;
	},
	'D': (moveX, moveY) => { // Open the door
		let open = !KinkyDungeonStatsChoice.get("Doorknobs") || !KinkyDungeonIsHandsBound(true, true);
		if (!open) {
			if (KinkyDungeonCanUseFeet()) {
				KinkyDungeonSendActionMessage(10, TextGet("KDDoorknobFeet"), "#88ff88", 2);
				open = true;
			} else {
				let armsbound = KinkyDungeonIsArmsBound(true, true);
				if (KDRandom() < (armsbound ? KDDoorKnobChance : KDDoorKnobChanceArms)) {
					KinkyDungeonSendActionMessage(10, TextGet("KDDoorknobSuccess" + ((armsbound) ? "" : "Arms")), "#88ff88", 2);
					open = true;
				} else if (KDRandom() < (armsbound ? KDDoorAttractChance : KDDoorAttractChanceArms) && DialogueBringNearbyEnemy(moveX, moveY, 10)) {
					KinkyDungeonSendActionMessage(10, TextGet("KDDoorknobAttract" + ((armsbound) ? "" : "Arms")), "#ff5555", 2);
					KinkyDungeonMakeNoise(armsbound ? 6 : 3, moveX, moveY);
					open = true;
				} else {
					KinkyDungeonSendActionMessage(10, TextGet("KDDoorknobFail" + (armsbound ? "" : "Arms")), "#ff5555", 2);
					KinkyDungeonMakeNoise(armsbound ? 6 : 3, moveX, moveY);
					if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Locked.ogg");
				}
			}
		}
		if (open) {
			KinkyDungeonMapSet(moveX, moveY, 'd');

			// For private doors, aggro the faction
			let faction = KinkyDungeonTiles.get(moveX + "," +moveY) && KinkyDungeonTiles.get(moveX + "," +moveY).Faction ? KinkyDungeonTiles.get(moveX + "," +moveY).Faction : undefined;
			if (faction) {
				KinkyDungeonAggroFaction(faction, true);
			}

			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/DoorOpen.ogg");
		}

		return true;
	},
	'C': (moveX, moveY) => { // Open the chest
		let chestType = KinkyDungeonTiles.get(moveX + "," +moveY) && KinkyDungeonTiles.get(moveX + "," +moveY).Loot ? KinkyDungeonTiles.get(moveX + "," +moveY).Loot : "chest";
		let faction = KinkyDungeonTiles.get(moveX + "," +moveY) && KinkyDungeonTiles.get(moveX + "," +moveY).Faction ? KinkyDungeonTiles.get(moveX + "," +moveY).Faction : undefined;
		let noTrap = KinkyDungeonTiles.get(moveX + "," +moveY) && KinkyDungeonTiles.get(moveX + "," +moveY).NoTrap ? KinkyDungeonTiles.get(moveX + "," +moveY).NoTrap : false;
		let lootTrap = KinkyDungeonTiles.get(moveX + "," +moveY) && KinkyDungeonTiles.get(moveX + "," +moveY).lootTrap ? KinkyDungeonTiles.get(moveX + "," +moveY).lootTrap : undefined;
		let roll = KinkyDungeonTiles.get(moveX + "," +moveY) ? KinkyDungeonTiles.get(moveX + "," +moveY).Roll : KDRandom();
		if (faction && !KinkyDungeonChestConfirm) {
			KinkyDungeonChestConfirm = true;
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonChestFaction").replace("FACTION", TextGet("KinkyDungeonFaction" + faction)), "#ff0000", 2);
		} else {
			KinkyDungeonLoot(MiniGameKinkyDungeonLevel, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], chestType, roll, KinkyDungeonTiles.get(moveX + "," +moveY), undefined, noTrap);
			if (lootTrap) KDSpawnLootTrap(moveX, moveY, lootTrap.trap, lootTrap.mult);
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/ChestOpen.ogg");
			KinkyDungeonMapSet(moveX, moveY, 'c');
			KDGameData.AlreadyOpened.push({x: moveX, y: moveY});
			KinkyDungeonAggroAction('chest', {faction: faction});
		}
		return true;
	},
	'Y': (moveX, moveY) => { // Open the chest
		let chestType = KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] == "lib" ? "shelf" : "rubble";
		KinkyDungeonLoot(MiniGameKinkyDungeonLevel, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], chestType);
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Coins.ogg");
		KinkyDungeonMapSet(moveX, moveY, 'X');
		KDGameData.AlreadyOpened.push({x: moveX, y: moveY});
		return true;
	},
	'O': (moveX, moveY) => { // Open the chest
		if (KinkyDungeonIsPlayer())
			KinkyDungeonTakeOrb(1, moveX, moveY); // 1 spell point
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Magic.ogg");
		KDGameData.AlreadyOpened.push({x: moveX, y: moveY});
		return true;
	},
	'P': (moveX, moveY) => { // Open the chest
		if (KinkyDungeonIsPlayer()) {
			KDPerkConfirm = false;
			KinkyDungeonTakePerk(1, moveX, moveY); // 1 perk choice
		}
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Magic.ogg");
		return true;
	},
	'-': (moveX, moveY) => { // Open the chest
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonObjectChargerDestroyed"), "gray", 2);
		return true;
	},
};


/**
 * Return is whether or not something the player should know about happened
 * @type {Record<string, (delta, tile: effectTile) => boolean>}
 */
let KDEffectTileFunctionsStandalone = {
	"Inferno": (delta, tile) => {
		if (tile.duration > 4 && KDRandom() < 0.3 && !(tile.pauseDuration > 0)) {
			KDCreateAoEEffectTiles(tile.x, tile.y,  {
				name: "Ember",
				duration: 1,
			}, 4, 1.5, undefined, 0.5);
		}
		return true;
	},
	"SlimeBurning": (delta, tile) => {
		if (tile.duration > 0 && !(tile.pauseDuration > 0)) {
			KDCreateEffectTile(tile.x, tile.y, {
				name: "Inferno",
				duration: 2,
			}, 1); // Create blaze
			if (KDRandom() < 0.3) {
				KDCreateAoEEffectTiles(tile.x, tile.y,  {
					name: "Ember",
					duration: 1,
				}, 4, 1.5, undefined, 0.5);
			}
		}
		return true;
	},
	"Torch": (delta, tile) => {
		if (tile.duration > 9000) {
			tile.duration = 9999;
		}
		return true;
	},
	"TorchUnlit": (delta, tile) => {
		if (tile.duration > 9000) {
			tile.duration = 9999;
		}
		return true;
	},
	"Lantern": (delta, tile) => {
		if (tile.duration > 9000) {
			tile.duration = 9999;
		}
		return true;
	},
	"LanternUnlit": (delta, tile) => {
		if (tile.duration > 9000) {
			tile.duration = 9999;
		}
		return true;
	},
	"TorchOrb": (delta, tile) => {
		if (tile.duration > 9000) {
			tile.duration = 9999;
		}
		return true;
	},
};

function KDSlimeImmuneEntity(entity) {
	if (entity.player) {
		if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") >= 0.45) return true;
		for (let inv of KinkyDungeonAllRestraint()) {
			if (KDRestraint(inv).slimeWalk) {
				return true;
			}
		}
	} else return KDSlimeImmune(entity);
}

function KDSlimeWalker(entity) {
	if (KDSlimeImmuneEntity(entity)) return true;
	else if (!entity.player && entity.Enemy?.tags.flying) return true;
	return false;
}

function KDSlimeImmune(enemy) {
	return enemy.Enemy?.tags.slime || enemy.Enemy?.tagsglueimmune || enemy.Enemy?.tagsslimewalk || KDEntityBuffedStat(enemy, "glueDamageResist") >= 0.45;
}

/**
 * Return is whether or not something the player should know about happened
 * @type {Record<string, (delta, entity: entity, tile: effectTile) => boolean>}
 */
let KDEffectTileFunctions = {
	"SlimeBurning": (delta, entity, tile) => {
		if (!KDEntityHasBuff(entity, "Drenched")) {
			let slimeWalker = KDSlimeWalker(entity);
			if (!slimeWalker) {
				KinkyDungeonApplyBuffToEntity(entity, KDSlimed);
				return true;
			}
		}
		return false;
	},
	"Slime": (delta, entity, tile) => {
		if (tile.pauseDuration > 0) {
			// Meep
		} else if (!KDEntityHasBuff(entity, "Drenched")) {
			let slimeWalker = KDSlimeWalker(entity);
			if (!slimeWalker) {
				KinkyDungeonApplyBuffToEntity(entity, KDSlimed);
				return true;
			}
		}
		return false;
	},
	"Latex": (delta, entity, tile) => {
		if (tile.pauseDuration > 0) {
			// Meep
		} else {
			let result = false;
			// Latex slimes entities that are on it
			if (!KDEntityHasBuff(entity, "Drenched")) {
				let slimeWalker = KDSlimeWalker(entity);
				if (!slimeWalker) {
					KinkyDungeonApplyBuffToEntity(entity, KDSlimed);
					result = true;
				}
			}
			// Latex also constantly applies binding
			if (result || KDEntityBuffedStat(entity, "SlimeProgress")) {
				if (entity.player) {
					let latexData = {
						cancelDamage: false,
						dmg: KDLatexDmg,
						type: "glue",
					};
					KinkyDungeonSendEvent("tickLatexPlayer", latexData);
					if (!latexData.cancelDamage)
						KinkyDungeonDealDamage({damage: latexData.dmg, type: latexData.type});
				} else if (KDCanBind(entity)) {
					let latexData = {
						cancelDamage: entity.boundLevel > entity.Enemy.maxhp + KDLatexBind,
						enemy: entity,
						dmg: 0,
						bind: KDLatexBind,
						type: "glue",
					};
					KinkyDungeonSendEvent("tickLatex", latexData);
					if (!latexData.cancelDamage) {
						KinkyDungeonDamageEnemy(entity, {
							type: "glue",
							damage: 0,
							bind: KDLatexBind,
							flags: ["DoT"]
						}, false, true, undefined, undefined, undefined, "Rage");
						if (entity.boundLevel >= entity.Enemy.maxhp) {
							KinkyDungeonApplyBuffToEntity(entity, KDEncased);
						}
					}
				}
				return true;
			}
		}
		return false;
	},
	"Ice": (delta, entity, tile) => {
		if ((!entity.player && !entity.Enemy.tags.ice && !entity.Enemy.tags.nofreeze) || (entity.player && !KDChillWalk(entity)))
			KinkyDungeonApplyBuffToEntity(entity, KDChilled);
		if (entity.player && KinkyDungeonPlayerBuffs.Slipping)
			KDSlip({x: KinkyDungeonPlayerEntity.x - KinkyDungeonPlayerEntity.lastx, y: KinkyDungeonPlayerEntity.y - KinkyDungeonPlayerEntity.lasty});
		return true;
	},
	"Water": (delta, entity, tile) => {
		if (tile.pauseSprite == tile.name + "Frozen") {
			if (entity.player && KinkyDungeonPlayerBuffs.Slipping)
				KDSlip({x: KinkyDungeonPlayerEntity.x - KinkyDungeonPlayerEntity.lastx, y: KinkyDungeonPlayerEntity.y - KinkyDungeonPlayerEntity.lasty});
		} else if (KDWettable(entity)) {
			KinkyDungeonApplyBuffToEntity(entity, KDDrenched);
			KinkyDungeonApplyBuffToEntity(entity, KDDrenched2);
			KinkyDungeonApplyBuffToEntity(entity, KDDrenched3);
		}
		return true;
	},
	"Inferno": (delta, entity, tile) => {
		if (entity.player) {
			KinkyDungeonDealDamage({
				type: "fire",
				damage: 1,
				time: 0,
				bind: 0,
				flags: ["BurningDamage"]
			});
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonInfernoBurn"), "#ff0000", 2);
		} else {
			KinkyDungeonDamageEnemy(entity, {
				type: "fire",
				damage: 1,
				time: 0,
				bind: 0,
				flags: ["BurningDamage"]
			}, false, true, undefined, undefined, undefined);
		}
		if (KDEntityHasBuff(entity, "Drenched")) {
			KDEntityGetBuff(entity, "Drenched").duration = Math.max(0, KDEntityGetBuff(entity, "Drenched").duration - 4 * delta);
		}
		return true;
	},
};

/**
 * Return is whether or not something the player should know about happened
 * @type {Record<string, (newTile: effectTile, existingTile: effectTile) => boolean>}
 */
let KDEffectTileCreateFunctionsCreator = {
	"Ropes": (newTile, existingTile) => {
		KDInferno(newTile, existingTile, 4);
		return true;
	},
	"Vines": (newTile, existingTile) => {
		KDInferno(newTile, existingTile, 6);
		return true;
	},
	"Ice": (newTile, existingTile) => {
		if (existingTile.tags.includes("freezeover")) {
			existingTile.pauseDuration = newTile.duration;
			existingTile.pauseSprite = existingTile.name + "Frozen";
		} else if (existingTile.tags.includes("hot")) {
			newTile.duration = 0;
		}
		return true;
	},
	"Slime": (newTile, existingTile) => {
		if (existingTile.tags.includes("ice")) {
			newTile.pauseDuration = newTile.duration;
			newTile.pauseSprite = newTile.name + "Frozen";
		} else if (existingTile.tags.includes("ignite")) {
			newTile.duration = 0;
			KDCreateEffectTile(newTile.x, newTile.y, {
				name: "SlimeBurning",
				duration: existingTile.duration/2,
			}, 0);
		}
		return true;
	},
	"Latex": (newTile, existingTile) => {
		if (existingTile.tags.includes("slime")) {
			existingTile.duration = 0;
		}
		return true;
	},
	"Water": (newTile, existingTile) => {
		if (existingTile.tags.includes("ice")) {
			newTile.pauseDuration = newTile.duration;
			newTile.pauseSprite = newTile.name + "Frozen";
		}
		return true;
	},
	"Ember": (newTile, existingTile) => {
		if (existingTile.tags.includes("fire")) {
			newTile.pauseDuration = existingTile.duration;
			newTile.pauseSprite = newTile.name;
		}
		return true;
	},
};

/**
 * Return is whether or not something the player should know about happened
 * @type {Record<string, (newTile: effectTile, existingTile: effectTile) => boolean>}
 */
let KDEffectTileCreateFunctionsExisting = {
	"Ropes": (newTile, existingTile) => {
		KDInferno(existingTile, newTile, 4);
		return true;
	},
	"Vines": (newTile, existingTile) => {
		KDInferno(existingTile, newTile, 6);
		return true;
	},
	"TorchUnlit": (newTile, existingTile) => {
		if (newTile.tags.includes("fire") || newTile.tags.includes("ignite")) {
			existingTile.duration = 0;
			KDCreateEffectTile(existingTile.x, existingTile.y, {
				name: "Torch",
				duration: 9999,
			}, 0);
		}
		return true;
	},
	"Torch": (newTile, existingTile) => {
		if (newTile.tags.includes("freeze")) {
			existingTile.duration = 0;
			KDCreateEffectTile(existingTile.x, existingTile.y, {
				name: "TorchUnlit",
				duration: 9999,
			}, 0);
		}
		return true;
	},
	"Latex": (newTile, existingTile) => {
		if (newTile.tags.includes("slime")) {
			newTile.duration = 0;
		}
		return true;
	},
	"LanternUnlit": (newTile, existingTile) => {
		if (newTile.tags.includes("fire") || newTile.tags.includes("ignite")) {
			existingTile.duration = 0;
			KDCreateEffectTile(existingTile.x, existingTile.y, {
				name: "Lantern",
				duration: 9999,
			}, 0);
		}
		return true;
	},
	"SlimeBurning": (newTile, existingTile) => {
		if (newTile.tags.includes("ice") || newTile.tags.includes("water")) {
			existingTile.duration = 0;
			KDCreateEffectTile(existingTile.x, existingTile.y, {
				name: "Slime",
				duration: existingTile.duration*2,
			}, 0);
		}
		return true;
	},
};

/**
 * Return is whether or not the move should be interrupted
 * @type {Record<string, (entity, tile: effectTile, willing, dir, sprint) => {cancelmove: boolean, returnvalue: boolean}>}
 */
let KDEffectTileMoveOnFunctions = {
	"Cracked": (entity, tile, willing, dir, sprint) => {
		if (tile.pauseDuration > 0) {
			// Meep
		} else if (!entity.Enemy || (!entity.Enemy.tags.earth && !entity.Enemy.tags.unstoppable)) {
			KinkyDungeonApplyBuffToEntity(entity, KDUnsteady);
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(entity, KDUnsteady2);
				KinkyDungeonApplyBuffToEntity(entity, KDUnsteady3);
			} else if (!entity.Enemy || !entity.Enemy.tags.unflinching) {
				if (!entity.vulnerable) entity.vulnerable = 1;
				else entity.vulnerable = Math.max(entity.vulnerable, 1);
			}
		}
		return {cancelmove: false, returnvalue: false};
	},
	"Ice": (entity, tile, willing, dir, sprint) => {
		if (sprint && entity.player && willing && (dir.x || dir.y)) {
			KDSlip(dir);
			return {cancelmove: true, returnvalue: true};
		}
		return {cancelmove: false, returnvalue: false};
	},
	"Water": (entity, tile, willing, dir, sprint) => {
		if (tile.pauseSprite == tile.name + "Frozen") {
			if (sprint && entity.player && willing && (dir.x || dir.y)) {
				KDSlip(dir);
				return {cancelmove: true, returnvalue: true};
			}
		}
		return {cancelmove: false, returnvalue: false};
	},
};

let KDTorchExtinguishTypes = ["ice", "frost", "cold", "acid", "water", "stun", "glue"];
let KDSlimeExtinguishTypes = ["ice", "frost", "cold", "acid", "water"];
let KDIgnitionSources = ["fire", "electric"];

/**
 * Return is idk
 * @type {Record<string, (b, tile: effectTile, d) => boolean>}
 */
let KDEffectTileBulletFunctions = {
	"Ropes": (b, tile, d) => {
		KDIgnition(b, tile, d);
		return true;
	},
	"Vines": (b, tile, d) => {
		KDIgnition(b, tile, d);
		return true;
	},
	"SlimeBurning": (b, tile, d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if (KDSlimeExtinguishTypes.includes(type)) {
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Slime",
					duration: tile.duration*2,
				}, 0); // Put out fire
				tile.duration = 0;
			}
		}
		return true;
	},
	"Slime": (b, tile, d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if ((KDIgnitionSources.includes(type)) && b.bullet.damage.damage > 0) {
				KDCreateEffectTile(tile.x, tile.y, {
					name: "SlimeBurning",
					duration: tile.duration*0.5,
				}, 0); // Put out lantern
				tile.duration = 0;
			}
		}
		return true;
	},
	"Ember": (b, tile, d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if (type == "stun" && b.bullet.damage.damage > 1) {
				let newT = KDCreateEffectTile(tile.x, tile.y, {
					name: "Inferno",
					duration: 5,
				}, 5); // Create blaze
				if (newT)
					tile.pauseDuration = newT.duration;
			} else if ((type == "ice" || type == "frost" || type == "acid")) {
				tile.duration = 0;
				KDSmokePuff(tile.x, tile.y, 1.5, 0.1, true);
			}
		}
		return true;
	},
	"Torch": (b, tile, d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if (KDTorchExtinguishTypes.includes(type)) {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "TorchUnlit",
					duration: 9999,
				}, 0); // Put out lantern
			}
		}
		return true;
	},
	"TorchUnlit": (b, tile, d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if ((KDIgnitionSources.includes(type))) {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Torch",
					duration: 9999,
				}, 0); // Put out lantern
			}
		}
		return true;
	},
	"Lantern": (b, tile, d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if (KDTorchExtinguishTypes.includes(type)) {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "LanternUnlit",
					duration: 9999,
				}, 0); // Put out lantern
			}
		}
		return true;
	},
	"LanternUnlit": (b, tile, d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if ((KDIgnitionSources.includes(type))) {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Lantern",
					duration: 9999,
				}, 0); // Put out lantern
			}
		}
		return true;
	},
	"Ice": (b, tile, d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if ((KDIgnitionSources.includes(type)) && b.bullet.damage.damage > 0) {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Water",
					duration: 2,
				}, 5); // Create water
			} else if ((type == "ice" || type == "frost") && tile.duration < 4 && tile.duration > 0) {
				tile.duration = 4;
			}
		}
		return true;
	},
	"Water": (b, tile, d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if ((type == "ice" || type == "frost")) {
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Ice",
					duration: 3,
				}, 1); // Create ice
			} else {
				if ((KDIgnitionSources.includes(type)) && b.bullet.damage.damage > 0) {
					tile.duration = 0;
					KDSmokePuff(tile.x, tile.y, 1.5, 0.1, true);
					KDCreateEffectTile(tile.x, tile.y, {
						name: "Steam",
						duration: 6,
					}, 2); // Create steam
				}
			}
		}
		return true;
	},
};
