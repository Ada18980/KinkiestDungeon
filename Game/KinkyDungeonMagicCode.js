"use strict";

/**
 * @type {Record<string, (spell: any, data: any, targetX: any, targetY: any, tX: any, tY: any, entity: any, enemy: any, moveDirection: any, bullet: any, miscast: any, faction: any, cast: any, selfCast: any) => void | string>}
 */
let KinkyDungeonSpellSpecials = {
	"analyze": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEnemyAt(targetX, targetY);
		if (en) {
			if (!en.buffs || !en.buffs.Analyze) {
				if (!en.buffs) en.buffs = {};
				KinkyDungeonApplyBuffToEntity(en, {id: "Analyze", aura: "#ffffff", type: "DamageAmp", duration: 99999, power: 0.3, player: false, enemies: true, maxCount: 3, tags: ["defense", "damageTaken"]},);
				KinkyDungeonApplyBuffToEntity(en, {id: "Analyze2", type: "Info", duration: 99999, power: 1.0, player: false, enemies: true, tags: ["info"]},);
			} else return "Fail";
		} else {
			let tile = KinkyDungeonTilesGet(targetX + "," + targetY);
			if (tile) {
				if (tile.Loot && tile.Roll) {
					let event = KinkyDungeonLoot(MiniGameKinkyDungeonLevel, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], tile.Loot, tile.Roll, tile, true);
					if (event.trap || tile.lootTrap) KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonShrineTooltipTrap"), "#ff0000", 2);
					else KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonShrineTooltipNoTrap"), "lightgreen", 2);

				} else return "Fail";
			} else return "Fail";
		}
	},
	"BoulderKick": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEnemyAt(targetX, targetY);
		if (en) {
			if (en.Enemy.tags.summonedRock) {
				en.hp = 0;
				en.faction = "Player";
				en.rage = 0;
				en.hostile = 0;
				let spell2 = KinkyDungeonFindSpell("BoulderKicked", true);
				let size = (spell2.size) ? spell2.size : 1;
				let xx = entity.x;
				let yy = entity.y;
				if (!bullet || (bullet.spell && bullet.spell.cast && bullet.spell.cast.offset)) {
					xx += moveDirection.x;
					yy += moveDirection.y;
				}
				let b = KinkyDungeonLaunchBullet(xx, yy,
					tX-entity.x,tY - entity.y,
					spell2.speed, {noSprite: spell2.noSprite, faction: faction, name:spell2.name, block: spell2.block, width:size, height:size, summon:spell2.summon, cast: cast, dot: spell2.dot,
						bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
						effectTile: spell2.effectTile, effectTileDurationMod: spell2.effectTileDurationMod,
						effectTileTrail: spell2.effectTileTrail, effectTileDurationModTrail: spell2.effectTileDurationModTrail, effectTileTrailAoE: spell2.effectTileTrailAoE,
						passthrough: spell2.noTerrainHit, noEnemyCollision: spell2.noEnemyCollision, alwaysCollideTags: spell2.alwaysCollideTags, nonVolatile:spell2.nonVolatile, noDoubleHit: spell2.noDoubleHit,
						pierceEnemies: spell2.pierceEnemies, piercing: spell2.piercing, events: spell2.events,
						lifetime:miscast || selfCast ? 1 : (spell2.bulletLifetime ? spell2.bulletLifetime : 1000), origin: {x: entity.x, y: entity.y}, range: spell2.range, hit:spell2.onhit,
						damage: {evadeable: spell2.evadeable, noblock: spell2.noblock,  damage:spell2.power, type:spell2.damage, crit: spell2.crit, bindcrit: spell2.bindcrit, bind: spell2.bind,
							shield_crit: spell2?.shield_crit, // Crit thru shield
							shield_stun: spell2?.shield_stun, // stun thru shield
							shield_freeze: spell2?.shield_freeze, // freeze thru shield
							shield_bind: spell2?.shield_bind, // bind thru shield
							shield_snare: spell2?.shield_snare, // snare thru shield
							shield_slow: spell2?.shield_slow, // slow thru shield
							shield_distract: spell2?.shield_distract, // Distract thru shield
							shield_vuln: spell2?.shield_vuln, // Vuln thru shield
							bindEff: spell2.bindEff, distract: spell2.distract, distractEff: spell2.distractEff, boundBonus: spell2.boundBonus, time:spell2.time, flags:spell2.damageFlags}, spell: spell2}, miscast);
				b.visual_x = entity.x;
				b.visual_y = entity.y;
			} else return "Fail";
		} else return "Fail";
	},
	"Volcanism": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) =>  {
		let rocks = [];
		for (let e of KDMapData.Entities) {
			if (spell.filterTags.some((tag) => {return e.Enemy.tags[tag];}) && KDistEuclidean(targetX - e.x, targetY - e.y) <= spell.aoe
				&& (!e.buffs || !KinkyDungeonHasBuff(e.buffs, KDVolcanism.id))) {
				rocks.push(e);
			}
		}
		if (rocks.length == 0) return "Fail";
		for (let rock of rocks) {
			KinkyDungeonApplyBuffToEntity(rock, KDVolcanism);
			rock.hostile = 9999;
		}
	},
	"dress": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		KinkyDungeonSetDress(spell.outfit);
	},
	"MoiraiScissors": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let enList = KDNearbyEnemies(tX, tY, spell.range);

		if (enList.length > 0) {
			let succeed = false;
			for (let en of enList) {
				if (KDAllied(en) && en.boundLevel > 0) {
					succeed = true;
					// Free allies
					en.boundLevel = 0;
					en.specialBoundLevel = {};
				}
				if (KDHostile(en) && KDIsHumanoid(en)) {
					succeed = true;
					// Disrobe enemies
					KinkyDungeonApplyBuffToEntity(en, {
						id: "MoiraiDisrobe",
						aura: "#ff88ff",
						aurasprite: "Disrobe",
						duration: spell.time,
						power: spell.power,
						type: "charmDamageResist",
					});
					KinkyDungeonApplyBuffToEntity(en, {
						id: "MoiraiDisrobe2",
						duration: spell.time,
						power: 10,
						type: "ArmorBreak",
					});
					KinkyDungeonApplyBuffToEntity(en, {
						id: "MoiraiDisrobe3",
						duration: spell.time,
						power: 10,
						type: "SpellResistBreak",
					});
				}
			}
			if (succeed) {
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/MagicSlash.ogg");
				KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
				KinkyDungeonChangeCharge(KinkyDungeonGetChargeCost(spell));
				return "Cast";
			}

			KinkyDungeonSendActionMessage(3, TextGet("KDMoiraiFail"), "#ff5555", 2);
			return "Fail";
		}
		KinkyDungeonSendActionMessage(3, TextGet("KDMoiraiFail"), "#ff5555", 2);
		return "Fail";
	},
	"Charge": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let cost = KDAttackCost() + KDSprintCost();
		let en = KinkyDungeonEntityAt(targetX, targetY);
		let space = false;
		let dash_x = targetX;
		let dash_y = targetY;
		let push_x = targetX;
		let push_y = targetY;
		let powerful = false;
		if (en) {
			if (KinkyDungeonHasStamina(-cost)) {
				let dist = KDistChebyshev(en.x - entity.x, en.y - entity.y);
				if (dist < 1.5) {
					// if enemy is nearby we need room to push them
					push_x = en.x*2 - entity.x;
					push_y = en.y*2 - entity.y;
					if (KinkyDungeonNoEnemy(push_x, push_y) && KDIsMovable(push_x, push_y)) {
						space = true;
					}
				} else {
					// Otherwise we need a space between us and the enemy
					dash_x = Math.round((en.x + entity.x) / 2);
					dash_y = Math.round((en.y + entity.y) / 2);
					push_x = en.x + dash_x - entity.x;
					push_y = en.y + dash_y - entity.y;
					if (KinkyDungeonNoEnemy(dash_x, dash_y) && KDIsMovable(dash_x, dash_y)) {
						space = true;
					}
				}
				if (space) {
					let origHP = en.hp;
					let result = KinkyDungeonLaunchAttack(en, 1);
					if (en.hp <= origHP * 0.8 + 0.01) powerful = true;
					let failPush = true;
					if (result == "confirm" || result == "dialogue") return "Fail";
					if (result == "hit" || result == "capture") {
						if (powerful && KinkyDungeonNoEnemy(push_x, push_y) && KDIsMovable(push_x, push_y)) {
							let xx = en.x;
							let yy = en.y;
							KDMoveEntity(en, push_x, push_y, false);
							KDMovePlayer(xx, yy, true, true);
							failPush = false;
						} else if (KinkyDungeonNoEnemy(dash_x, dash_y) && KDIsMovable(dash_x, dash_y)) {
							KDMovePlayer(dash_x, dash_y, true, true);
						}
						if (failPush && powerful) {
							KinkyDungeonDamageEnemy(en, {
								type: "crush",
								damage: 0.15 * en.Enemy.maxhp,
								time: 2,
								bind: 0,
							}, false, false, spell, undefined, entity);
						}
						KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonSpellCastCharge"), "#ffff00", 1, false);
						KinkyDungeonChangeStamina(KDSprintCost());
					} else if (result == "miss") {
						if (KinkyDungeonNoEnemy(dash_x, dash_y) && KDIsMovable(dash_x, dash_y)) {
							KDMovePlayer(dash_x, dash_y, true, true);
						}
						KinkyDungeonSendTextMessage(8, TextGet("KDChargeFail_AttackMiss"), "#ff5555", 1, true);
					}
					KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Miss.ogg");
					return "Cast";
				} else {
					KinkyDungeonSendTextMessage(8, TextGet("KDChargeFail_NoSpace"), "#ff5555", 1, true);
				}
			} else {
				KinkyDungeonSendTextMessage(8, TextGet("KDChargeFail_NoStamina"), "#ff5555", 1, true);
			}
		} else {
			KinkyDungeonSendTextMessage(8, TextGet("KDChargeFail_NoTarget"), "#ff5555", 1, true);
		}
		return "Fail";
	},
	"Bondage": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEnemyAt(targetX, targetY);
		if (en) {
			if (KDCanBind(en) && (KinkyDungeonIsDisabled(en) || (en.playWithPlayer && KDCanDom(en)))) {
				KDGameData.InventoryAction = "Bondage";
				KDGameData.BondageTarget = en.id;
				KinkyDungeonDrawState = "Inventory";
				KinkyDungeonCurrentFilter = LooseRestraint;
				KinkyDungeonSendTextMessage(8, TextGet("KDBondageTarget"), "#ff5555", 1, true);
				return "Cast";
			} else {
				KinkyDungeonSendTextMessage(8, TextGet("KDBondageFailInvalidTarget"), "#ff5555", 1, true);
				return "Fail";
			}
		}
		KinkyDungeonSendTextMessage(8, TextGet("KDBondageFailNoTarget"), "#ff5555", 1, true);
		return "Fail";
	},
	"CommandWord": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		if (!KDSpellIgnoreComp(spell) && (data.gaggedMiscastFlag && KinkyDungeonGagTotal() >= 0.25)) {
			KinkyDungeonSendTextMessage(8, TextGet("KDCommandWordFail_Miscast"), "#ff5555", 1);
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/SoftShield.ogg");
			return "Miscast";
		}
		let en = KinkyDungeonEnemyAt(targetX, targetY);
		if (en) {
			if (en.boundLevel > 0) {
				if (KDHostile(en) && en.hp <= en.Enemy.maxhp * 0.1) {
					en.ceasefire = 50;
				} else if (!KDHostile(en) && en.hp <= en.Enemy.maxhp * 0.1) {
					en.faction = "Player";
					let ff = KDGetFactionOriginal(en);
					if (!KinkyDungeonHiddenFactions.includes(ff)) {
						KinkyDungeonChangeFactionRep(ff, 0.005);
					}
				}
				if (en.buffs)
					for (let b of Object.values(en.buffs)) {
						if (b.tags && b.tags.includes("commandword")) {
							b.duration = 0;
						}
					}
				en.boundLevel = Math.max(0, en.boundLevel - spell.power);
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
				return "Cast";
			}
			KinkyDungeonSendTextMessage(8, TextGet("KDCommandWordFail_NoEnemy"), "#ff5555", 1, true);
			return "Fail";
		} else if (targetX == KinkyDungeonPlayerEntity.x && targetY == KinkyDungeonPlayerEntity.y) {
			if (KinkyDungeonPlayerGetRestraintsWithLocks(KDMagicLocks).length > 0) {
				if (spell.aoe > 0) {
					for (let r of KinkyDungeonPlayerGetRestraintsWithLocks(KDMagicLocks, true)) {
						KinkyDungeonLock(r, "");
					}
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonPurpleLockRemove"), "#ffff00", 2);
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
					if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
				} else {
					KDGameData.InventoryAction = "RemoveMagicLock";
					KinkyDungeonDrawState = "Inventory";
					KinkyDungeonCurrentFilter = Restraint;
					KDGameData.InventoryActionManaCost = KinkyDungeonGetManaCost(spell);
				}
				return "Cast";
			}
			KinkyDungeonSendTextMessage(8, TextGet("KDCommandWordFail_NoLocks"), "#ff5555", 1, true);
			return "Fail";
		} else if (KinkyDungeonTilesGet(targetX + "," + targetY) && KinkyDungeonTilesGet(targetX + "," + targetY).Type == "Charger" && KinkyDungeonTilesGet(targetX + "," + targetY).NoRemove) {
			KinkyDungeonTilesGet(targetX + "," + targetY).NoRemove = false;
			KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonPurpleLockRemoveCharger"), "#ffff00", 2);
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
			return "Cast";
		}
		KinkyDungeonSendTextMessage(8, TextGet("KDCommandWordFail_NoTarget"), "#ff5555", 1, true);
		return "Fail";
	},
	"Windup": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		if (!KDEnemyHasFlag(entity, "winding")) {
			KinkyDungeonSetEnemyFlag(entity, "winding", spell.time);
			KinkyDungeonSetEnemyFlag(entity, "winding2", spell.time - 1);
		} else if (!KDEnemyHasFlag(entity, "winding2")) {
			KinkyDungeonSetEnemyFlag(entity, "windup", 9);
			KinkyDungeonApplyBuffToEntity(entity, {id: "ExtraSight", type: "Vision", duration:9, power: 7});
		}
		KinkyDungeonPlaySound(spell.sfx, entity);

		KinkyDungeonSendTextMessage(4, TextGet("KDWindup"), "#888888", 2);
		return "Cast";
	},
	"Lockdown": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEntityAt(targetX, targetY);
		if (en && !en.player && en.boundLevel > 0) {
			KinkyDungeonApplyBuffToEntity(en, {
				id: "Lockdown", aura: "#a96ef5", type: "MinBoundLevel", duration: 9000, power: Math.min(en.Enemy.maxhp + 0.01, en.boundLevel), maxCount: 1, tags: ["lock", "debuff", "commandword", "CM1"]
			});
			KinkyDungeonCastSpell(targetX, targetY, KinkyDungeonFindSpell("EffectEnemyLock1", true), undefined, undefined, undefined);
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
			return "Cast";
		} else if (en && en.player) {
			let lockable = KinkyDungeonPlayerGetLockableRestraints();
			if (lockable.length > 0) {
				for (let item of lockable) {
					KinkyDungeonLock(item, "Purple");
				}
				KinkyDungeonSendTextMessage(4, TextGet("KDSelfLock"), "#8888ff", 2);
				KinkyDungeonCastSpell(targetX, targetY, KinkyDungeonFindSpell("EffectEnemyLock1", true), undefined, undefined, undefined);
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
				return "Cast";
			}


		}

		return "Fail";
	},
	"Wall": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEnemyAt(targetX, targetY);
		if (!en) {
			let tile = KinkyDungeonMapGet(targetX, targetY);
			let door = (tile == 'D' || tile == 'd');
			let e = DialogueCreateEnemy(targetX, targetY, "Wall" + (door ? "Door" : ""));
			if (e) {
				if (door) {
					KinkyDungeonMapSet(targetX, targetY, 'D');
					if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/DoorClose.ogg");
				}
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
				return "Cast";
			}
		} else return "Fail";
	},
	"Enemy_CM1": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEnemyAt(targetX, targetY);
		if (en) {
			KinkyDungeonTickBuffTag(en, "CM1", 1);
			KinkyDungeonCastSpell(targetX, targetY, KinkyDungeonFindSpell("EffectEnemyCM" + (entity?.Enemy?.unlockCommandLevel || 1), true), undefined, undefined, undefined);
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
			if (entity?.Enemy) {
				KinkyDungeonSetEnemyFlag(entity, "commandword", entity.Enemy.unlockCommandCD || 90);
				KinkyDungeonSendActionMessage(7,
					TextGet("KDCastCM1").replace("EnemyName", TextGet("Name" + entity.Enemy.name)).replace("TargetName", TextGet("Name" + en.Enemy.name)),
					"#ff5555", 4);
			}
			return "Cast";
		}
		return "Fail";
	},
	"Chastity": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEnemyAt(targetX, targetY);
		if (en && en.Enemy.bound && KinkyDungeonIsDisabled(en) && !en.Enemy.nonHumanoid) {
			KDTieUpEnemy(en, spell.power, "Metal");
			KinkyDungeonApplyBuffToEntity(en, KDChastity);
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			return "Cast";
		} else {
			if (KinkyDungeonPlayerEntity.x == tX && KinkyDungeonPlayerEntity.y == tY) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["magicBeltForced"]}, MiniGameKinkyDungeonLevel + 10, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KinkyDungeonSendActionMessage(3, TextGet("KDZoneOfPuritySelf"), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
					KinkyDungeonAddRestraintIfWeaker(restraintAdd, 0, false, undefined, false, false, undefined, faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					return "Cast";
				}
			}
			return "Fail";
		}
	},
	"DisplayStand": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEntityAt(targetX, targetY);
		if (en && en.player) {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["displaySpell"]}, KDGetEffLevel(),KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCastSelf"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, 0, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				return "Cast";
			}


		} else if (en && KDCanBind(en) && KDHelpless(en) && !en.Enemy.nonHumanoid) {
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			// Summon a pet
			let Enemy = KinkyDungeonGetEnemyByName("PetDisplay");
			if (Enemy) {
				// Deal 0 damage to aggro
				KinkyDungeonDamageEnemy(en, {
					type: "chain",
					damage: 0,
					time: 0,
					bind: 0,
				}, false, true, undefined, undefined, entity);
				en.hp = 0;

				let doll = {
					summoned: true,
					rage: Enemy.summonRage ? 9999 : undefined,
					Enemy: Enemy,
					id: KinkyDungeonGetEnemyID(),
					x: en.x,
					y: en.y,
					hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp,
					movePoints: 0,
					attackPoints: 0
				};
				KDAddEntity(doll);

				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
				KinkyDungeonChangeCharge(0.05);
				return "Cast";
			}
			return "Fail";
		} else return "Fail";
	},
	"Petsuit": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEntityAt(targetX, targetY);
		if (en && en.player) {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["petsuitSpell"]}, KDGetEffLevel(),KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCastSelf"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, 0, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				return "Cast";
			}


		} else if (en && KDCanBind(en) && KDHelpless(en) && !en.Enemy.nonHumanoid) {
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			// Summon a pet
			let Enemy = KinkyDungeonGetEnemyByName("Pet");
			if (Enemy) {
				// Deal 0 damage to aggro
				KinkyDungeonDamageEnemy(en, {
					type: "chain",
					damage: 0,
					time: 0,
					bind: 0,
				}, false, true, undefined, undefined, entity);
				en.hp = 0;

				let doll = {
					summoned: true,
					rage: Enemy.summonRage ? 9999 : undefined,
					Enemy: Enemy,
					id: KinkyDungeonGetEnemyID(),
					x: en.x,
					y: en.y,
					hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp,
					movePoints: 0,
					attackPoints: 0
				};
				KDAddEntity(doll);

				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
				return "Cast";
			}
			return "Fail";
		} else return "Fail";
	},
	"CommandCapture": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEntityAt(targetX, targetY);
		if (en && (en.player || en.Enemy.bound)) {
			// Only bind bindable targets
			let bindTypes = [];
			let bindCounts = {};
			for (let X = -Math.ceil(spell.aoe); X <= Math.ceil(spell.aoe); X++)
				for (let Y = -Math.ceil(spell.aoe); Y <= Math.ceil(spell.aoe); Y++) {
					if (KDistEuclidean(X, Y) <= spell.aoe) {
						let loc = (tX + X) + "," + (tY + Y);
						if (KinkyDungeonEffectTilesGet(loc)) {
							for (let tile of Object.values(KinkyDungeonEffectTilesGet(loc))) {
								if (tile.tags && tile.tags.includes("bind")) {
									for (let t of tile.tags) {
										// Run the special feature per restraint type
										if (KDCommandCaptureBindings[t]) {
											bindTypes.push(t);
											if (!bindCounts[t]) bindCounts[t] = 0;
											bindCounts[t] += 1;
											KDCommandCaptureBindings[t](spell, en, faction, bullet, miscast, entity, bindCounts[t]);
										}
									}
								}
							}
						}
					}
				}
			if (bindTypes.length > 0) {
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
				if (!en.player)
					KinkyDungeonDamageEnemy(en, {
						type: "chain",
						damage: spell.power,
						time: spell.time,
						bind: spell.bind,
					}, false, false, undefined, undefined, entity);
				return "Cast";
			} else return "Fail";
		} else return "Fail";
	},
	"AnimatePuppet": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let maxCount = 3;
		let enemies = [];
		for (let X = -Math.ceil(spell.aoe); X <= Math.ceil(spell.aoe); X++)
			for (let Y = -Math.ceil(spell.aoe); Y <= Math.ceil(spell.aoe); Y++) {
				if (KDistEuclidean(X, Y) <= spell.aoe) {
					let en = KinkyDungeonEntityAt(tX+X, tY+Y);
					if (en && !en.player && en.Enemy && KDHelpless(en) && KDEntityBuffedStat(en, "SlimeProgress") >= 1.99) {
						if (KDRandom() < 0.5)
							enemies.push(en);
						else
							enemies.unshift(en);
					}
				}
			}
		if (enemies.length > 0) {
			let n = 0;
			let cost = KinkyDungeonGetManaCost(spell) / 3;
			for (let s of enemies) {
				if (n < maxCount) {
					KinkyDungeonChangeMana(-cost);
					s.hp = 0;
					let Enemy = KinkyDungeonGetEnemyByName("AllyDoll");
					let doll = {
						summoned: true,
						rage: Enemy.summonRage ? 9999 : undefined,
						Enemy: Enemy,
						id: KinkyDungeonGetEnemyID(),
						x: s.x,
						y: s.y,
						hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp,
						movePoints: 0,
						attackPoints: 0
					};
					KDAddEntity(doll);
					n += 1;
				}
			}
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			return "Cast";
		} else return "Fail";
	},
	"Animate": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let maxCount = 3;
		let slots = [];
		for (let X = -Math.ceil(spell.aoe); X <= Math.ceil(spell.aoe); X++)
			for (let Y = -Math.ceil(spell.aoe); Y <= Math.ceil(spell.aoe); Y++) {
				if (KDistEuclidean(X, Y) <= spell.aoe) {
					let loc = (tX + X) + "," + (tY + Y);
					if (KinkyDungeonEffectTilesGet(loc)) {
						for (let tile of Object.values(KinkyDungeonEffectTilesGet(loc))) {
							if (tile.tags && tile.tags.includes("slime") && !KinkyDungeonEntityAt(tX+X, tY+Y)) {
								if (KDRandom() < 0.5)
									slots.push({x: tX+X, y:tY+Y});
								else
									slots.unshift({x: tX+X, y:tY+Y});
							}
						}
					}
				}
			}
		if (slots.length > 0) {
			let n = 0;
			let cost = KinkyDungeonGetManaCost(spell) / 3;
			for (let s of slots) {
				if (n < maxCount) {
					KinkyDungeonChangeMana(-cost);
					KinkyDungeonSummonEnemy(s.x, s.y, "SmallSlime", 1, 0.5, undefined, 50, undefined, undefined, "Player");
					n += 1;
				}
			}
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			return "Cast";
		} else return "Fail";
	},
	"AnimateLarge": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let slimeCount = 0;
		let slots = [];
		for (let X = -Math.ceil(spell.aoe); X <= Math.ceil(spell.aoe); X++)
			for (let Y = -Math.ceil(spell.aoe); Y <= Math.ceil(spell.aoe); Y++) {
				if (KDistEuclidean(X, Y) <= spell.aoe) {
					let loc = (tX + X) + "," + (tY + Y);
					if (KinkyDungeonEffectTilesGet(loc)) {
						for (let tile of Object.values(KinkyDungeonEffectTilesGet(loc))) {
							if (tile.tags && tile.tags.includes("slime")) {
								if (!KinkyDungeonEntityAt(tX+X, tY+Y)) {
									if (KDRandom() < 0.5)
										slots.push({x: tX+X, y:tY+Y});
									else
										slots.unshift({x: tX+X, y:tY+Y});
								}
								slimeCount += 1;
							}
						}
					}
				}
			}
		if (slimeCount > 0 && slots.length > 0) {
			let cost = KinkyDungeonGetManaCost(spell) / 3;
			let s = slots[Math.floor(KDRandom() * slots.length)];
			KinkyDungeonChangeMana(-cost);
			KinkyDungeonSummonEnemy(s.x, s.y, "BigSlime", 1, 0.5, undefined, 90, undefined, undefined, "Player");
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			return "Cast";
		} else return "Fail";
	},
	"ElasticGrip": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		if (!KinkyDungeonCheckPath(entity.x, entity.y, tX, tY, true, false)) {
			KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonSpellCastFail"+spell.name), "#ff5555", 1);
			return "Fail";
		}
		let en = KinkyDungeonEntityAt(targetX, targetY);
		if (en && !en.player) {
			if (!KDIsImmobile(en)) {
				if (!en.player)
					KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
				let dist = Math.min(KDistEuclidean(en.x - entity.x, en.y - entity.y),
					Math.max(1, KDPushModifier(4, en))) + 0.01;
				let pullToX = entity.x;
				let pullToY = entity.y;
				KDCreateParticle(tX, tY, "ElasticGripHit");
				let lastx = en.x;
				let lasty = en.y;

				for (let i = dist; i > 0; i -= 0.2499) {
					if (KDistChebyshev(pullToX - en.x, pullToY - en.y) > 1.5) {
						let newX = pullToX + Math.round((en.x - pullToX) * i / dist);
						let newY = pullToY + Math.round((en.y - pullToY) * i / dist);
						if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(newX, newY)) && KinkyDungeonNoEnemy(newX, newY, true)
						&& (KinkyDungeonCheckProjectileClearance(en.x, en.y, newX, newY))) {
							KDMoveEntity(en, newX, newY, false, true, KDHostile(en));
							if (en.x != lastx || en.y != lasty) {
								lastx = en.x;
								lasty = en.y;
								KDCreateParticle(en.x, en.y, "ElasticGripHit");
							}
						}
					} else break;
				}


				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
				KDCreateParticle(en.x, en.y, "ElasticGripHit");

				if (!en.player)
					KinkyDungeonDamageEnemy(en, {
						type: "glue",
						damage: spell.power,
						time: spell.time,
						bind: spell.bind,
					}, false, true, undefined, undefined, entity);
				return "Cast";
			} else return "Fail";
		} else return "Fail";
	},
	"RecoverObject": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		if (!spell.aoe && !KinkyDungeonCheckPath(entity.x, entity.y, tX, tY, true, false)) {
			KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonSpellCastFailObstacle"+spell.name), "#ff5555", 1);
			return "Fail";
		}
		let tilesToCheck = [{x:targetX, y:targetY}];
		if (spell.aoe) {
			tilesToCheck = [];
			for (let x = Math.floor(-spell.aoe); x < Math.ceil(spell.aoe); x++)
				for (let y = Math.floor(-spell.aoe); y < Math.ceil(spell.aoe); y++) {
					if (AOECondition(targetX, targetY, targetX+x, targetY+y, spell.aoe, spell.aoetype, entity.x, entity.y)) {
						tilesToCheck.push({x:targetX+x, y:targetY+y});
				}
			}
		}
		let found = false;
		let grabbed = false;
		let chest = false;
		for (let tt of tilesToCheck) {
			let items = KDMapData.GroundItems.filter((item) => {return item.x == tt.x && item.y == tt.y;});
			let tile = KinkyDungeonMapGet(tt.x, tt.y);
			let allowedTiles = "CYR";
			if (items.length > 0 || allowedTiles.includes(tile)) {
				let dist = KDistEuclidean(tt.x - entity.x, tt.y - entity.y);
				let pullToX = entity.x;
				let pullToY = entity.y;
				KDCreateParticle(tX, tY, "RecoverObjectHit");
				let lastx = tt.x;
				let lasty = tt.y;
				let xxx = tt.x;
				let yyy = tt.y;
	
				for (let i = dist; i > 0; i -= 0.2499) {
					if (KDistChebyshev(pullToX - xxx, pullToY - yyy) > 1.5) {
						let newX = pullToX + Math.round((xxx - pullToX) * i / dist);
						let newY = pullToY + Math.round((yyy - pullToY) * i / dist);
						xxx = newX;
						yyy = newY;
						if (xxx != lastx || yyy != lasty) {
							lastx = xxx;
							lasty = yyy;
							KDCreateParticle(xxx, yyy, "RecoverObjectHit");
						}
					} else break;
				}
				let success = true;
				KinkyDungeonItemCheck(tt.x, tt.y, MiniGameKinkyDungeonLevel, true);
				if (allowedTiles.includes(tile)) {
					if (KDMoveObjectFunctions[tile]) {
						if (spell.aoe) KinkyDungeonChestConfirm = true;
						success = KDMoveObjectFunctions[tile](tt.x, tt.y);
						KinkyDungeonChestConfirm = false;
					}
				}
	
				if (success) {
					if (tile == 'C') chest = true;
					KDCreateParticle(tt.x, tt.y, "RecoverObjectHit");
					grabbed = true;
				}
				found = true;
			} 
		}
		if (grabbed) {
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell) * (chest ? 1.0 : 0.25));
			return "Cast";
		} else if (!found) KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonSpellCastFail"+spell.name), "#ff5555", 1);
		return "Fail";
	},
	"TelekineticSlash": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let tilesHit = [];
		for (let xx = -spell.aoe; xx <= spell.aoe; xx++) {
			for (let yy = -spell.aoe; yy <= spell.aoe; yy++) {
				if (AOECondition(targetX, targetY, targetX+xx, targetY+yy, spell.aoe, 'slash', entity.x, entity.y)) {
					tilesHit.push({x:targetX + xx, y:targetY+yy});
				}
			}
		}
		let hit = false;
		for (let tile of tilesHit) {
			let en = KinkyDungeonEnemyAt(tile.x, tile.y);
			if (en && !KDAllied(en) && !KDHelpless(en) && en.hp > 0) {
				hit = true;
				let mod = (KinkyDungeonFlags.get("KineticMastery") ? 1.5 : 0) + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "KinesisBase");
				let scaling = 0.9 * (KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "KinesisScale")));
				let data = {
					target: en,
					attackCost: 0.0, // Important
					skipTurn: false,
					spellAttack: true,
					attackData: {
						damage: spell.power + mod + KinkyDungeonPlayerDamage.dmg * scaling,
						type: KinkyDungeonPlayerDamage.type,
						distract: KinkyDungeonPlayerDamage.distract,
						distractEff: KinkyDungeonPlayerDamage.distractEff,
						bind: KinkyDungeonPlayerDamage.bind,
						bindType: KinkyDungeonPlayerDamage.bindType,
						bindEff: KinkyDungeonPlayerDamage.bindEff,
						ignoreshield: KinkyDungeonPlayerDamage.ignoreshield,
						shield_crit: KinkyDungeonPlayerDamage.shield_crit, // Crit thru shield
						shield_stun: KinkyDungeonPlayerDamage.shield_stun, // stun thru shield
						shield_freeze: KinkyDungeonPlayerDamage.shield_freeze, // freeze thru shield
						shield_bind: KinkyDungeonPlayerDamage.shield_bind, // bind thru shield
						shield_snare: KinkyDungeonPlayerDamage.shield_snare, // snare thru shield
						shield_slow: KinkyDungeonPlayerDamage.shield_slow, // slow thru shield
						shield_distract: KinkyDungeonPlayerDamage.shield_distract, // Distract thru shield
						shield_vuln: KinkyDungeonPlayerDamage.shield_vuln, // Vuln thru shield
						boundBonus: KinkyDungeonPlayerDamage.boundBonus,
						novulnerable: KinkyDungeonPlayerDamage.novulnerable,
						tease: KinkyDungeonPlayerDamage.tease}
				};
				KinkyDungeonSendEvent("beforePlayerLaunchAttack", data);
				
				KinkyDungeonAttackEnemy(en, data.attackData, 1.0);
			}
		}
		if (hit) {
			if (KinkyDungeonStatsChoice.has("BerserkerRage")) {
				KinkyDungeonChangeDistraction(0.7 + 0.5 * KinkyDungeonGetManaCost(spell), false, 0.33);
			}
			if (!KDEventData.shockwaves) KDEventData.shockwaves = [];
			KDEventData.shockwaves.push({
				x: targetX,
				y: targetY,
				radius: 1.5,
				sprite: "Particles/Slash.png",
			});
		}
		
		KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
		KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
		return "Cast";
	},
	
	
	"Swap": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		if (!KinkyDungeonCheckPath(entity.x, entity.y, tX, tY, true, false, 1, true)) {
			KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonSpellCastFail"+spell.name), "#ff5555", 1);
			return "Fail";
		}
		let en = KinkyDungeonEntityAt(targetX, targetY);
		if (en && !en.player) {
			if (!KDIsImmobile(en)) {
				let newX = entity.x;
				let newY = entity.y;
				if (!(en.Enemy.tags?.unstoppable)) {
					KDMovePlayer(en.x, en.y, true, false, false, true);
					KDMoveEntity(en, newX, newY, false, false, KDHostile(en));
	
					KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));	
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
				} else {
					let point = KinkyDungeonGetNearbyPoint(en.x, en.y, true, undefined, true, true);
					if (point) {
						KDMovePlayer(point.x, point.y, true, false, false, true);
		
						KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCastPartial"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));	
						KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
					} else {
						KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCastFail"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));	
					}
				}
				
				return "Cast";
			} else return "Fail";
		} else return "Fail";
	},
	"Awaken": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let count = 0;
		for (let X = -Math.ceil(spell.aoe); X <= Math.ceil(spell.aoe); X++)
			for (let Y = -Math.ceil(spell.aoe); Y <= Math.ceil(spell.aoe); Y++) {
				if (KDistEuclidean(X, Y) <= spell.aoe) {
					let loc = (tX + X) + "," + (tY + Y);
					if (KinkyDungeonEffectTilesGet(loc)) {
						for (let tile of Object.values(KinkyDungeonEffectTilesGet(loc))) {
							if (tile.tags && (tile.tags.includes("slime") || tile.tags.includes("latex"))) {
								//for (let t of tile.tags) {
								// Run the special feature per restraint type
								count += 1;
								KinkyDungeonCastSpell(tX + X, tY + Y, KinkyDungeonFindSpell("AwakenStrike", true), undefined, undefined, undefined, "Player");
								//}
							}
						}
					}
				}
			}
		if (count > 0) {
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			return "Cast";
		} else return "Fail";
	},
	"Spread": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let slots = [];
		for (let X = -Math.ceil(spell.aoe); X <= Math.ceil(spell.aoe); X++)
			for (let Y = -Math.ceil(spell.aoe); Y <= Math.ceil(spell.aoe); Y++) {
				if (KDistEuclidean(X, Y) <= spell.aoe) {
					let loc = (tX + X) + "," + (tY + Y);
					if (KinkyDungeonEffectTilesGet(loc)) {
						for (let tile of Object.values(KinkyDungeonEffectTilesGet(loc))) {
							if (tile.tags && (tile.tags.includes("slime"))) {
								slots.push({x: tX + X, y: tY+Y, duration: tile.duration});
							}
						}
					}
				}
			}
		if (slots.length > 0) {
			for (let s of slots) {
				for (let xx = -1; xx <= 1; xx++)
					for (let yy = -1; yy <= 1; yy++) {
						if ((xx == 0 || yy == 0) && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(s.x + xx, s.y + yy)))
							KDCreateEffectTile(s.x + xx, s.y + yy, {
								name: "Slime",
								duration: Math.max(s.duration, 12),
							}, 8);
					}

			}
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			return "Cast";
		} else return "Fail";
	},
	"CommandBind": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let count = 0;
		for (let X = -Math.ceil(spell.aoe); X <= Math.ceil(spell.aoe); X++)
			for (let Y = -Math.ceil(spell.aoe); Y <= Math.ceil(spell.aoe); Y++) {
				if (KDistEuclidean(X, Y) <= spell.aoe) {
					let loc = (tX + X) + "," + (tY + Y);
					if (KinkyDungeonEffectTilesGet(loc)) {
						for (let tile of Object.values(KinkyDungeonEffectTilesGet(loc))) {
							if (tile.tags && tile.tags.includes("bind")) {
								for (let t of tile.tags) {
									// Run the special feature per restraint type
									if (KDCommandCaptureBindings[t]) {
										count += 1;
										KDCommandBindBindings[t](spell, tX + X, tY + Y, faction, bullet, miscast, entity);
									}
								}
							}
						}
					}
				}
			}
		if (count > 0) {
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			return "Cast";
		} else return "Fail";
	},
	"Coalesce": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let count = 0;
		let finalTile = "Slime";
		let finalTilePri = -1;
		let finalTileDuration = 0;
		for (let X = -Math.ceil(spell.aoe); X <= Math.ceil(spell.aoe); X++)
			for (let Y = -Math.ceil(spell.aoe); Y <= Math.ceil(spell.aoe); Y++) {
				if (KDistEuclidean(X, Y) <= spell.aoe) {
					let loc = (tX + X) + "," + (tY + Y);
					if (KinkyDungeonEffectTilesGet(loc)) {
						for (let tile of Object.values(KinkyDungeonEffectTilesGet(loc))) {
							if (tile.tags && tile.tags.includes("slime")) {
								count += 1;
								if (tile.duration > finalTileDuration) finalTileDuration = tile.duration;
								if (tile.priority > finalTilePri) {
									finalTile = tile.name;
									finalTilePri = tile.priority;
								}
								tile.duration = 0;
								tile.pauseDuration = 0;
							}
						}
					}
				}
			}
		if (count == 0) return "Fail";

		KDCreateEffectTile(tX, tY, {
			name: finalTile,
			duration: finalTileDuration,
		}, 10);

		let enList = KDNearbyEnemies(tX, tY, spell.aoe);

		if (enList.length > 0) {
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			for (let en of enList) {
				if (en.buffs && KinkyDungeonGetBuffedStat(en.buffs, "SlimeProgress")) {
					KinkyDungeonApplyBuffToEntity(en, KDEncased);
					KinkyDungeonDamageEnemy(en, {
						type: spell.damage,
						damage: spell.power * count,
						time: spell.time,
						bind: spell.bind,
					}, false, true, undefined, undefined, entity);
					// Get a point near the target point
					let point = KinkyDungeonEntityAt(tX, tY) ? KinkyDungeonGetNearbyPoint(tX, tY, true, undefined, true) : {x:tX, y:tY};
					if (point) KDMoveEntity(en, point.x, point.y, false, true);
				}
			}
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell)/2);
		}

		KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell)/2);
		return "Cast";
	},
	"SlimeToLatex": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let count = 0;
		for (let X = -Math.ceil(spell.aoe); X <= Math.ceil(spell.aoe); X++)
			for (let Y = -Math.ceil(spell.aoe); Y <= Math.ceil(spell.aoe); Y++) {
				if (KDistEuclidean(X, Y) <= spell.aoe) {
					let loc = (tX + X) + "," + (tY + Y);
					if (KinkyDungeonEffectTilesGet(loc)) {
						for (let tile of Object.values(KinkyDungeonEffectTilesGet(loc))) {
							if (tile.tags && tile.tags.includes("slime")) {
								count += 1;
								tile.duration = 0;
								tile.pauseDuration = 0;
								KDCreateEffectTile(tX + X, tY + Y, {
									name: "Latex"
								}, 20);
							}
						}
					}
				}
			}
		if (count == 0) return "Fail";

		KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
		KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
		return "Cast";
	},
	"LiquidMetal": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let count = 0;
		for (let X = -Math.ceil(spell.aoe); X <= Math.ceil(spell.aoe); X++)
			for (let Y = -Math.ceil(spell.aoe); Y <= Math.ceil(spell.aoe); Y++) {
				if (KDistEuclidean(X, Y) <= spell.aoe) {
					let loc = (tX + X) + "," + (tY + Y);
					if (KinkyDungeonEffectTilesGet(loc)) {
						for (let tile of Object.values(KinkyDungeonEffectTilesGet(loc))) {
							if (tile.tags && tile.tags.includes("latex")) {
								count += 1;
								tile.duration = 0;
								tile.pauseDuration = 0;
								KDCreateEffectTile(tX + X, tY + Y, {
									name: "LiquidMetal"
								}, 20);
							}
						}
					}
				}
			}
		if (count == 0) return "Fail";

		KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
		KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
		return "Cast";
	},
	"CommandDisenchant": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let enList = KDNearbyEnemies(tX, tY, spell.aoe);

		if (enList.length > 0) {
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			for (let en of enList) {
				if (en.Enemy.tags.construct && (!en.buffs || !en.buffs.Disenchant1)) {
					KinkyDungeonApplyBuffToEntity(en, KDDisenchant1);
					KinkyDungeonApplyBuffToEntity(en, KDDisenchant2);
					KinkyDungeonDamageEnemy(en, {
						type: "cold",
						damage: spell.power,
						time: 0,
						bind: 0,
					}, false, true, undefined, undefined, entity);
				}
			}
			cast = true;
		}

		if (AOECondition(tX, tY, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, spell.aoe, KinkyDungeonTargetingSpell.aoetype || "")) {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, KDDisenchantSelf);
			cast = true;
		}
		if (cast) {
			KinkyDungeonChangeMana(-(1 - 0.5 * Math.min(1, (enList.length-1) / 2)) * (KinkyDungeonGetManaCost(spell)));
			return "Cast";
		} else return "Fail";
	},
	
	"DollConvert": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let enList = KDNearbyEnemies(tX, tY, spell.aoe);

		if (enList.length > 0) {
			let count = 0;
			let seen = 0;
			for (let en of enList) {
				if (!KDHelpless(en) && en.Enemy.tags?.dollmakerconvert) {
					en.hp = 0;
					let e = DialogueCreateEnemy(en.x, en.y, "DollsmithDoll");
					if (entity)
						e.faction = KDGetFaction(entity);
					count += 1;
					KDCreateEffectTile(en.x, en.y, {
						name: "Latex",
						duration: 4,
					}, 0);
					if (KinkyDungeonVisionGet(en.x, en.y) > 0)
						seen += 1;
				}
				if (count >= 3) break;
			}
			if (count > 0) {
				if (KinkyDungeonVisionGet(entity?.x||0, entity?.y||0) > 0 || seen > 0)
					KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSpellCast"+spell.name).replace("ENEMYNAME", TextGet("Name" + entity?.Enemy?.name)), "#ff4488", 2);

				return "Cast";
			}

		}
		return "Fail";
	},

	"CommandVibrate": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		if (!KDGameData.CurrentVibration && AOECondition(tX, tY, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, spell.aoe, spell.aoetype || "")
			&& (KinkyDungeonPlayerTags.get("ItemVulvaFull") || KinkyDungeonPlayerTags.get("ItemButtFull") || KinkyDungeonPlayerTags.get("ItemVulvaPiercingsFull") || KinkyDungeonPlayerTags.get("ItemNipplesPiercings"))) {

			let vibes = [];
			if (KinkyDungeonPlayerTags.get("ItemVulvaFull")) vibes.push("ItemVulva");
			if (KinkyDungeonPlayerTags.get("ItemButtFull")) vibes.push("ItemButt");
			if (KinkyDungeonPlayerTags.get("ItemVulvaPiercingsFull")) vibes.push("ItemVulvaPiercings");
			if (KinkyDungeonPlayerTags.get("ItemNipplesPiercingsFull")) vibes.push("ItemNipplesPiercings");
			KinkyDungeonStartVibration(KinkyDungeonGetRestraintItem(vibes[Math.floor(KDRandom() * vibes.length)]).name, "tease", vibes, 0.5, 30, undefined, undefined, undefined, undefined, true);

			cast = true;
		}
		cast = cast || KDCastSpellToEnemies((en) => {
			if (en.Enemy.bound && KDEnemyCanBeVibed(en)) {
				KDApplyGenBuffs(en, "Vibrate1", spell.time);
				return true;
			}
		}, tX, tY, spell);
		if (cast) {
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			KinkyDungeonChangeCharge(-KinkyDungeonGetChargeCost(spell));
			return "Cast";
		} else return "Fail";
	},
	"CommandVibrateLV2": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		if (!KDGameData.CurrentVibration && AOECondition(tX, tY, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, spell.aoe, spell.aoetype || "")
			&& (KinkyDungeonPlayerTags.get("ItemVulvaFull") || KinkyDungeonPlayerTags.get("ItemButtFull") || KinkyDungeonPlayerTags.get("ItemVulvaPiercingsFull") || KinkyDungeonPlayerTags.get("ItemNipplesPiercings"))) {

			let vibes = [];
			if (KinkyDungeonPlayerTags.get("ItemVulvaFull")) vibes.push("ItemVulva");
			if (KinkyDungeonPlayerTags.get("ItemButtFull")) vibes.push("ItemButt");
			if (KinkyDungeonPlayerTags.get("ItemVulvaPiercingsFull")) vibes.push("ItemVulvaPiercings");
			if (KinkyDungeonPlayerTags.get("ItemNipplesPiercingsFull")) vibes.push("ItemNipplesPiercings");
			KinkyDungeonStartVibration(KinkyDungeonGetRestraintItem(vibes[Math.floor(KDRandom() * vibes.length)]).name, "tease", vibes, 2.0, 15, undefined, undefined, undefined, undefined, false);

			cast = true;
		}
		cast = cast || KDCastSpellToEnemies((en) => {
			if (en.Enemy.bound && KDEnemyCanBeVibed(en)) {
				KDApplyGenBuffs(en, "Vibrate2", spell.time);
				return true;
			}
		}, tX, tY, spell);
		if (cast) {
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			KinkyDungeonChangeCharge(-KinkyDungeonGetChargeCost(spell));
			return "Cast";
		} else return "Fail";
	},
	"CommandVibrateLV3": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		if (!KDGameData.CurrentVibration && AOECondition(tX, tY, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, spell.aoe, spell.aoetype || "")
			&& (KinkyDungeonPlayerTags.get("ItemVulvaFull") || KinkyDungeonPlayerTags.get("ItemButtFull") || KinkyDungeonPlayerTags.get("ItemVulvaPiercingsFull") || KinkyDungeonPlayerTags.get("ItemNipplesPiercings"))) {

			let vibes = [];
			if (KinkyDungeonPlayerTags.get("ItemVulvaFull")) vibes.push("ItemVulva");
			if (KinkyDungeonPlayerTags.get("ItemButtFull")) vibes.push("ItemButt");
			if (KinkyDungeonPlayerTags.get("ItemVulvaPiercingsFull")) vibes.push("ItemVulvaPiercings");
			if (KinkyDungeonPlayerTags.get("ItemNipplesPiercingsFull")) vibes.push("ItemNipplesPiercings");
			KinkyDungeonStartVibration(KinkyDungeonGetRestraintItem(vibes[Math.floor(KDRandom() * vibes.length)]).name, "tease", vibes, 3.0, 10, undefined, undefined, undefined, undefined, false);

			cast = true;
		}
		cast = cast || KDCastSpellToEnemies((en) => {
			if (en.Enemy.bound && KDEntityBuffedStat(en, "Plug") > 0) {
				KDApplyGenBuffs(en, "Vibrate3", spell.time);
				return true;
			}
		}, tX, tY, spell);
		if (cast) {
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			KinkyDungeonChangeCharge(-KinkyDungeonGetChargeCost(spell));
			return "Cast";
		} else return "Fail";
	},
	"CommandOrgasm": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		if (!KDGameData.CurrentVibration && AOECondition(tX, tY, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, spell.aoe, KinkyDungeonTargetingSpell.aoetype || "")
			&& (KinkyDungeonPlayerTags.get("ItemVulvaFull") || KinkyDungeonPlayerTags.get("ItemButtFull") || KinkyDungeonPlayerTags.get("ItemVulvaPiercingsFull"))) {

			let vibes = [];
			if (KinkyDungeonPlayerTags.get("ItemVulvaFull")) vibes.push("ItemVulva");
			if (KinkyDungeonPlayerTags.get("ItemButtFull")) vibes.push("ItemButt");
			if (KinkyDungeonPlayerTags.get("ItemVulvaPiercingsFull")) vibes.push("ItemVulvaPiercings");
			KinkyDungeonStartVibration(KinkyDungeonGetRestraintItem(vibes[Math.floor(KDRandom() * vibes.length)]).name, "tease", vibes, 3.0, 10, undefined, undefined, undefined, undefined, true);
			KinkyDungeonCastSpell(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonFindSpell("OrgasmStrike", true), undefined, undefined, undefined, "Player");
			cast = true;
		}
		cast = cast || KDCastSpellToEnemies((en) => {
			if (en.Enemy.bound && en.distraction > 0) {
				let dist = en.distraction / en.Enemy.maxhp;
				if (dist >= 0.9) dist *= 2;
				KinkyDungeonDamageEnemy(en, {
					type: "charm",
					damage: spell.power * Math.max(0.1, dist),
				}, true, false, spell);
				KinkyDungeonCastSpell(en.x, en.y, KinkyDungeonFindSpell("OrgasmStrike", true), undefined, undefined, undefined, "Player");
				en.distraction = 0;
				return true;
			}
		}, tX, tY, spell);
		if (cast) {
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			return "Cast";
		} else return "Fail";
	},
	"CommandSlime": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let enList = KDNearbyEnemies(tX, tY, spell.aoe);
		let count = 0;

		if (enList.length > 0) {
			count += enList.length;
			for (let en of enList) {
				if (en.boundLevel) {
					en.boundLevel = Math.max(0, en.boundLevel - 5);
				}
				KinkyDungeonRemoveBuffsWithTag(en, ["encased", "slimed"]);
				if (en.Enemy.tags?.rescueslime && !KDEnemyIsTemporary(en)) {
					// Replace with a random adventurer. We do NOT refresh the health
					let newType = KDRandom() < 0.25 ? "Adventurer_Sub_Fighter"
						: (KDRandom() < 0.25 ? "Adventurer_Brat_Fighter"
							: KDRandom() < 0.25 ? "Adventurer_Switch_Fighter"
								: "Adventurer_Dom_Fighter");
					let enemyType = KinkyDungeonGetEnemyByName(newType);
					if (enemyType) {
						en.Enemy = JSON.parse(JSON.stringify(enemyType));
					}
					en.hp = Math.min(en.Enemy.maxhp, en.hp);
					en.hostile = 0;
					en.faction = "Player";
				}

				KinkyDungeonApplyBuffToEntity(en, KDGlueResist, {duration: 10});
			}
		}

		let tried = false;
		let playerInRange = KDistEuclidean(KinkyDungeonPlayerEntity.x - tX, KinkyDungeonPlayerEntity.y - tY) <= spell.aoe;
		if (playerInRange) {
			let active = false;
			let restraints = KinkyDungeonAllRestraint();
			for (let r of restraints) {
				if (KDRestraint(r).shrine && KDRestraint(r).shrine.includes("Slime")) {
					KinkyDungeonRemoveRestraint(KDRestraint(r).Group);
					active = true;
					tried = true;
				} else if (!tried && KDRestraint(r).shrine && KDRestraint(r).shrine.includes("SlimeHard")) {
					tried = true;
				}
			}
			if (active) count += 1;
		}

		if (count > 0) {
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			return "Cast";
		} else {
			if (tried && playerInRange) {
				KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCastFail"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			}
			return "Fail";
		}
	},
	"CommandRelease": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let enList = KDNearbyEnemies(tX, tY, spell.aoe);
		let count = 0;

		if (enList.length > 0) {
			count += enList.length;
			for (let en of enList) {
				if (en.boundLevel) {
					en.boundLevel = Math.max(0, en.boundLevel - spell.power);
				}
			}
		}

		let tried = false;
		let playerInRange = KDistEuclidean(KinkyDungeonPlayerEntity.x - tX, KinkyDungeonPlayerEntity.y - tY) <= spell.aoe;
		if (playerInRange) {
			let active = false;
			let restraints = KinkyDungeonAllRestraint();
			if (restraints.length > 0) tried = true;
			for (let r of restraints) {
				if (!r.lock && !KDGetCurse(r) && KDGetEscapeChance(KDRestraint(r), "Remove", undefined, undefined, false, false).escapeChance > 0 && !KDGroupBlocked(KDRestraint(r).Group)) {
					KinkyDungeonRemoveRestraint(KDRestraint(r).Group);
					active = true;
				}
			}
			if (active) count += 1;
		}

		if (count > 0) {
			KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
			return "Cast";
		} else {
			if (tried && playerInRange) {
				KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCastFail"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
			}
			return "Fail";
		}
	},
	"AllyToggle": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEnemyAt(targetX, targetY);
		if (en && KDAllied(en)) {
			if (en.buffs?.AllySelect) en.buffs.AllySelect.duration = 0;
			else KinkyDungeonApplyBuffToEntity(en, {
				id: "AllySelect",
				aura: "#ffffff",
				aurasprite: "Select",
				duration: 9999,
				type: "Sel",
				power: 1,
			});
			return "Cast";
		} else return "Fail";
	},
	"AllyAttention": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let list = KDNearbyEnemies(targetX, targetY, spell.aoe);
		let succeed = false;
		for (let en of list)
			if (en && KDAllied(en)) {
				KinkyDungeonApplyBuffToEntity(en, {
					id: "AllySelect",
					aura: "#ffffff",
					aurasprite: "Select",
					duration: 9999,
					type: "Sel",
					power: 1,
				});
				succeed = true;
			}
		if (succeed) return "Cast";
		return "Fail";
	},
	"AllyDeselect": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let list = KDNearbyEnemies(targetX, targetY, spell.aoe);
		let succeed = false;
		for (let en of list)
			if (en && KDAllied(en)) {
				if (en.buffs?.AllySelect) en.buffs.AllySelect.duration = 0;
				succeed = true;
			}
		if (succeed) return "Cast";
		return "Fail";
	},
	"AllyMove": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let list = KDMapData.Entities.filter((en) => {
			return !KDHelpless(en) && KDAllied(en);
		});
		let succeed = false;
		for (let en of list)
			if (en && en.buffs?.AllySelect) {
				en.gx = targetX;
				en.gy = targetY;
				KinkyDungeonSetEnemyFlag(en, "NoFollow", 9000);
				succeed = true;
			}
		if (succeed) return "Cast";
		return "Fail";
	},
	"Disarm": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		let en = KinkyDungeonEnemyAt(targetX, targetY);
		if (en) {
			let time = Math.max(1, spell.time
				- (en.Enemy.disarm ? en.Enemy.disarm : 0)
				- (en.Enemy.tags.elite ? 1 : 0)
				- (en.Enemy.tags.miniboss ? 2 : 0)
				- (en.Enemy.tags.boss ? 4 : 0));
			en.disarm = Math.max(0, time);
			return "Cast";
		} else return "Fail";
	},
	"weaponAttack": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		KinkyDungeonTargetingSpellWeapon = null;
		let en = KinkyDungeonEnemyAt(targetX, targetY);
		if (en) {
			KinkyDungeonLaunchAttack(en, 1);
			return "Cast";
		} else return "Fail";
	},
	"weaponAttackOrSpell": (spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast) => {
		KinkyDungeonTargetingSpellWeapon = null;
		let en = KinkyDungeonEnemyAt(targetX, targetY);
		if (en) {
			KinkyDungeonLaunchAttack(en, 1);
			return "Cast";
		} else {
			return KinkyDungeonActivateWeaponSpell(true) ? "Cast" : "Fail";
		}
	}
};

let KDCommandCaptureBindings = {
	"vine": (spell, entity, faction, bullet, miscast, attacker, counter) => {
		// Vines slow the target down
		if (entity.player) {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["vineRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleVine"), "#ff0000", spell.time);
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", spell.time);
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			}
		} else {
			if (!(entity.slow)) entity.slow = spell.level * 5;
		}
	},
	"rope": (spell, entity, faction, bullet, miscast, attacker, counter) => {
		// Ropes slow the target down
		if (entity.player) {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleRope"), "#ff0000", spell.time);
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", spell.time);
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			}
		} else {
			if (!(entity.slow)) entity.bind = counter * spell.level * 3;
			else entity.bind = Math.max(entity.bind, counter * spell.level * 3);
			KinkyDungeonDamageEnemy(entity, {
				type: "chain",
				damage: 0,
				time: 0,
				bind: 0,
			}, false, false, undefined, undefined, attacker);
		}
	},
	"fabric": (spell, entity, faction, bullet, miscast, attacker, counter) => {
		// Ropes slow the target down
		if (entity.player) {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["ribbonRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleFabric"), "#ff0055", spell.time);
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", spell.time);
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			}
		} else {
			if (!(entity.slow)) entity.bind = counter * spell.level * 3;
			else entity.bind = Math.max(entity.bind, counter * spell.level * 3);
			KinkyDungeonDamageEnemy(entity, {
				type: "glue",
				damage: 0,
				time: 0,
				bind: 0,
			}, false, false, undefined, undefined, attacker);
		}
	},
	"belt": (spell, entity, faction, bullet, miscast, attacker, counter) => {
		// Belts apply extra binding (10 per spell level)
		if (entity.player) {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["leatherRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleBelt"), "#ff0000", spell.time);
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", spell.time);
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			}
		} else {
			KinkyDungeonDamageEnemy(entity, {
				type: "chain",
				damage: 0,
				time: 0,
				bind: spell.level * 2.0,
			}, false, true, undefined, undefined, attacker);
		}
	},
	"chain": (spell, entity, faction, bullet, miscast, attacker, counter) => {
		// Chains deal crush damage
		if (entity.player) {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["chainRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleChain"), "#ff0000", spell.time);
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", spell.time);
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			}
		} else {
			KinkyDungeonDamageEnemy(entity, {
				type: "crush",
				damage: spell.level * 1.5,
				time: 0,
				bind: 0,
			}, false, true, undefined, undefined, attacker);
		}
	},
};


let KDCommandBindBindings = {
	"vine": (spell, x, y, faction, bullet, miscast, attacker, counter) => {
		KinkyDungeonCastSpell(x, y, KinkyDungeonFindSpell("BindVine", true), undefined, undefined, undefined, "Player");
	},
	"rope": (spell, x, y, faction, bullet, miscast, attacker, counter) => {
		KinkyDungeonCastSpell(x, y, KinkyDungeonFindSpell("BindRope", true), undefined, undefined, undefined, "Player");
	},
	"fabric": (spell, x, y, faction, bullet, miscast, attacker, counter) => {
		KinkyDungeonCastSpell(x, y, KinkyDungeonFindSpell("BindRope", true), undefined, undefined, undefined, "Player");
	},
	"chain": (spell, x, y, faction, bullet, miscast, attacker, counter) => {
		KinkyDungeonCastSpell(x, y, KinkyDungeonFindSpell("BindChain", true), undefined, undefined, undefined, "Player");
	},
	"belt": (spell, x, y, faction, bullet, miscast, attacker, counter) => {
		KinkyDungeonCastSpell(x, y, KinkyDungeonFindSpell("BindBelt", true), undefined, undefined, undefined, "Player");
	},
};
