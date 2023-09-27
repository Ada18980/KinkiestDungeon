'use strict';

/**
 * @type {Record<string, (target, damage, playerEffect, spell, faction, bullet, entity) => {sfx: string, effect: boolean}>}
 */
let KDPlayerEffects = {
	"EnvDamage": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let dmg = KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
		KinkyDungeonSendTextMessage(Math.min(playerEffect.power, 5), TextGet("KinkyDungeonDamageSelf").replace("DamageDealt", dmg.string), "#ff0000", 1);
		if (dmg.happened) return {sfx: undefined, effect: true}; return {sfx: undefined, effect: false};
	},
	"GhostHaunt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let count = 1;
		if (target?.player && KDEntityBuffedStat(target, "Haunting")) {
			count = KDEntityBuffedStat(target, "Haunting") + 1;
		}
		KinkyDungeonApplyBuffToEntity(target,
			{
				id: "Haunted",
				type: "Haunting",
				power: count,
				events: [
					{type: "Haunting", trigger: "tick", dist: 4.5, count: 1},
				],
				aura: "#ffffff",
				aurasprite: "Null",
				duration: 9999,});
		return {sfx: "Evil", effect: true};
	},
	"ObserverBeam": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (!KDBulletAlreadyHit(bullet, target, true)) {
			let count = 1;
			if (target?.player && KDEntityBuffedStat(target, "Cursed")) {
				count = Math.min(10, KDEntityBuffedStat(target, "Cursed") + 1);
			}
			KinkyDungeonApplyBuffToEntity(target,
				{
					id: "Cursed",
					type: "Cursed",
					power: count,
					events: [
						{type: "Cursed", trigger: "tick", count: 1},
					],
					aura: "#4488ff",
					aurasprite: "Null",
					duration: 9999,});

			let dmg = KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			KinkyDungeonSendTextMessage(3, TextGet("KDObserverCurseApply").replace("DamageDealt", dmg.string), "#ff5555", 1);
			return {sfx: "Evil", effect: true};
		}
		return {sfx: "", effect: false};
	},
	"TheShadowCurse": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let applied = "";

		for (let i = 0; i < playerEffect.count; i++) {
			let curse = KDGetByWeight(KinkyDungeonGetCurseByListWeighted(["Common"], "", false, 0, 100));
			let restraint = KDChooseRestraintFromListGroupPri(
				KDGetRestraintsEligible({tags: ['leatherRestraints', 'leatherRestraintsHeavy', "obsidianRestraints", "shadowlatexRestraints"]}, 10, 'grv', true, undefined, undefined, undefined, false, undefined, undefined, undefined, undefined, curse),
				KDRestraintGroupProgressiveOrderFun)?.name;

			if (restraint && KinkyDungeonAddRestraint(KinkyDungeonGetRestraintByName(restraint), 0, true, "", true, false, false, undefined, "Observer", false, undefined,
				curse)) {
				applied = restraint || applied;
			}
		}

		KinkyDungeonSendTextMessage(3, TextGet("KDObserverVanish" + (applied ? "Succeed" : "Fail")).replace("RNAME",
			TextGet("Restraint" + applied)), "#ff5555", 1);

		let point = KinkyDungeonGetRandomEnemyPoint(true, false, undefined, 10, 10);
		if (point) {
			KDMoveEntity(entity, point.x, point.y, false);
		}

		return {sfx: "Evil", effect: true};
	},
	"CursingCircle": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let applyCurse = KinkyDungeonStatWill < 0.1;

		let dmg = KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		KinkyDungeonSendTextMessage(3, TextGet("KDEpicenterCurseDamage").replace("DamageDealt", dmg.string), "#ff5555", 2);

		if (applyCurse) {
			if (!KinkyDungeonPlayerBuffs.CursingCircle) {
				KinkyDungeonSendTextMessage(9, TextGet("KDEpicenterCurseEffectStart"), "#8E72AA", playerEffect.time);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "CursingCircle",
					aura: "#8E72AA",
					type: "CursingCircle",
					duration: playerEffect.time,
				});
			} else {
				let happened = KDPlayerEffectRestrain(spell, playerEffect.count, [playerEffect.kind], "Curse", false, false, false, false, false);

				if (happened.length > 0) {
					for (let en of KDMapData.Entities) {
						if (en.Enemy.tags?.epicenterCursed) {
							en.hp = 0;
							en.playerdmg = 0;
						}
					}
					KinkyDungeonPlayerBuffs.CursingCircle.duration = 0;
					KinkyDungeonSendTextMessage(9, TextGet("KDEpicenterCurseEffectEnd"), "#8E72AA", 5);
				}
			}
		}
		return {sfx: "Evil", effect: true};
	},
	"MaidChastity": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KinkyDungeonFlags.get("ChastityBelts")) {
			// Tease the player
			/*if (KinkyDungeonFlags.get("Vibes")) {
				let dmg = KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
				KinkyDungeonSendTextMessage(Math.min(playerEffect.power, 5), TextGet("KDMaidforceHeadVibe").replace("DamageDealt", dmg.string), "#ff9999", 1);
				if (dmg.happened) return {sfx: "Vibe", effect: true}; return {sfx: undefined, effect: false};
			}*/
		} else {
			let restrained = false;
			for (let i = 0; i < 4; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["maidVibeRestraints"]}, MiniGameKinkyDungeonLevel + (playerEffect.level || 0), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, playerEffect.tightness || 0, false, undefined, false, false, undefined, faction)) {
					KDSendStatus('bound', restraintAdd.name, "maidhead");
					restrained = true;
				}
			}
			if (restrained)
				KinkyDungeonSendTextMessage(8, TextGet("KDMaidforceHeadBelting"), "#ff5555", 2, false, true);

			return {sfx: "LockHeavy", effect: restrained};
		}
		return {sfx: undefined, effect: false};
	},
	"ShadowBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			KDPlayerEffectRestrain(spell, playerEffect.count, ["shadowHands"], "Ghost", false, false, false, false);

			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonShadowBolt"), "yellow", playerEffect.time);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		}
		return {sfx: "Evil", effect: true};
	},
	"BearTrapStun": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		KDStunTurns(playerEffect.time);
		KinkyDungeonSendTextMessage(4, TextGet("KDBearTrapHit"), "yellow", playerEffect.time+1);
		KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		return {sfx: "Clang", effect: true};
	},
	"RubberBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			KDPlayerEffectRestrain(spell, playerEffect.count, ["redLatexBasic"], "Dollsmith", false, false, false, false);

			KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRubberBolt"), "yellow", 1);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		}
		return {sfx: "Dollify", effect: true};
	},
	"EncaseBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			KDPlayerEffectRestrain(spell, playerEffect.count, ["latexEncaseRandom"], "Dollsmith", false, false, false, false);

			KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonEncaseBolt"), "yellow", 1);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		}
		return {sfx: "Dollify", effect: true};
	},
	"EnemyWindBlast": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 1.0, 1.0)) {
			let dist = playerEffect.dist;
			for (let i = 0; i < dist; i++) {
				let newX = target.x + Math.round(1 * Math.sign(bullet.vx));
				let newY = target.y + Math.round(1 * Math.sign(bullet.vy));
				if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(newX, newY)) && KinkyDungeonNoEnemy(newX, newY, true)
				&& (dist == 1 || KinkyDungeonCheckProjectileClearance(target.x, target.y, newX, newY))) {
					KDMovePlayer(newX, newY, false);
				}
			}
			KinkyDungeonSendTextMessage(4, TextGet("KDEnemyWindBlast"), "yellow", 1);
			KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
		}
		return {sfx: "Fwosh", effect: true};
	},
	"EncaseBoltDrone": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			if (KDGameData.MovePoints >= 0) {
				KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonEncaseBoltDroneSlow"), "yellow", 1);
			} else {
				KDPlayerEffectRestrain(spell, playerEffect.count, ["latexEncaseRandom"], "Dollsmith", false, false, false, false);
				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonEncaseBoltDrone"), "yellow", 1);
			}
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		}
		return {sfx: "Dollify", effect: true};
	},
	"RubberMissile": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		KDPlayerEffectRestrain(spell, playerEffect.count, ["latexEncaseRandom"], "Dollsmith");

		KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRubberMissile"), "yellow", 1);
		KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		return {sfx: "Lightning", effect: true};
	},
	"ObsidianBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			KDPlayerEffectRestrain(spell, playerEffect.count, ["obsidianRestraints"], "Elemental", false, false, false, false);

			KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonObsidianBolt"), "yellow", playerEffect.time);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		}
		return {sfx: "Evil", effect: true};
	},
	"MithrilBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			KDPlayerEffectRestrain(spell, playerEffect.count, ["mithrilRope"], "Elemental", false, false, false, false);

			KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonMithrilBolt"), "yellow", playerEffect.time);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		}
		return {sfx: "Evil", effect: true};
	},
	"CelestialBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			KDPlayerEffectRestrain(spell, playerEffect.count, ["celestialRopes"], "Angel", false, false, false, false);

			KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonCelestialBolt"), "yellow", playerEffect.time);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		}
		return {sfx: "Evil", effect: true};
	},
	"BoundByFate": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		KDCreateAoEEffectTiles(
			bullet.x,
			bullet.y,
			{
				name: "FateBoundGround",
				duration: playerEffect.time + 1,
			}, 0, 2.5, undefined, undefined, undefined);

		KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonBoundByFate"), "yellow", playerEffect.time);
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, KDBoundByFate, {
			duration: playerEffect.time,
		});

		return {sfx: "Evil", effect: true};
	},
	"StarBondage": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonStarBondage"), "#ff5555", 4);
		KDPlayerEffectRestrain(spell, playerEffect.count, [playerEffect.kind], "Demon");

		return {sfx: "Evil", effect: true};
	},
	"MoonBondage": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let dmg = KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonMoonBondage").replace("DamageTaken", dmg.string), "#ff5555", 1);
		KDPlayerEffectRestrain(spell, playerEffect.count, [playerEffect.kind], "Demon");
		return {sfx: "Evil", effect: true};
	},
	"SlimeEngulf": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let restraintAdd = KinkyDungeonGetRestraint({tags: ["slimeRestraintsRandom"]}, MiniGameKinkyDungeonLevel + playerEffect.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
		if (!restraintAdd) {
			KDTripleBuffKill("SlimeEngulfEnd", KinkyDungeonPlayerEntity, 6, (tt) => {
				// Remove the nearby slime kraken
				let kraken = KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 10);

				// Put the player somewhere and harden all slime
				KinkyDungeonPassOut();
				for (let i = 0; i < 30; i++) {
					KDAdvanceSlime(false, "");
				}

				let master = null;
				for (let enemy of kraken) {
					if (enemy.Enemy.name == "SlimeKraken") {
						KDKickEnemy(enemy);
						master = enemy;
					}
				}
				// Recombine
				if (master)
					for (let enemy of kraken) {
						if (enemy.boundTo == master.id) {
							enemy.hp = 0;
							master.hp = Math.min(master.Enemy.maxhp, master.hp + KDMagicDefs.SlimeKraken_TentacleCost);
						}
					}

			}, "Blindness");
			return {sfx: "Evil", effect: true};
		}
		return {sfx: "RubberBolt", effect: false};
	},
	"SarcoEngulf": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let added = [];
		let effect = false;
		for (let i = 0; i < playerEffect.power; i++) {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["mummyRestraints"]}, 100, "tmb");
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["mummyRestraints"], faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				added.push(restraintAdd);
				effect = true;
			}
		}
		if (added.length > 0) {
			KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonRopeEngulf"), "#ff0000", 2);
			effect = true;
		} else {
			let RopeDresses = ["Leotard", "Bikini", "Lingerie"];
			if (!RopeDresses.includes(KinkyDungeonCurrentDress)) {
				KinkyDungeonSetDress(RopeDresses[Math.floor(Math.random() * RopeDresses.length)], "");
				KinkyDungeonDressPlayer();
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonHexEngulfDress"), "#ff0000", 3);
				effect = true;
			} else {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeMagicHogtie"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["ropeMagicHogtie"], faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSarcoEngulf"), "#ff0000", 2);
					effect = true;
				}
			}
		}
		return {sfx: "MagicSlash", effect: effect};
	},
	"SarcoHex": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let restraintAdd = KinkyDungeonGetRestraint({tags: ["mummyRestraints"]}, 100, "tmb");
		if (!restraintAdd && !KinkyDungeonPlayerTags.get("Sarcophagus")) {
			KDTripleBuffKill("SarcoHexEnd", KinkyDungeonPlayerEntity, 6, (tt) => {
				// Remove the nearby sarcokraken and all tentacles
				let kraken = KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 10);
				for (let enemy of kraken) {
					if (enemy.Enemy.name == "SarcoKraken" || enemy.Enemy.name == "SarcoMinion") enemy.hp = 0;
				}
				// Put the player somewhere
				let candidates = KDMapData.JailPoints?.filter((point) => {return point.type == "furniture";});
				if (candidates && candidates.length > 0) {
					let candidate = candidates[Math.floor(KDRandom() * candidates.length)];
					KDMovePlayer(candidate.x, candidate.y, false);
				}
				// Add the sarcophagus
				let newAdd = KinkyDungeonGetRestraint({tags: ["sarcophagus"]}, 100, "tmb");
				if (newAdd) {
					KinkyDungeonAddRestraintIfWeaker(newAdd, spell.power, false, undefined, false, false, undefined, faction);
				}
			}, "Blindness");
			return {sfx: "Evil", effect: true};
		}
		return {sfx: "Struggle", effect: false};
	},


};

/**
 *
 * @param {any} spell
 * @param {number} count
 * @param {string[]} tags
 * @param {string} faction
 * @param {boolean} [noDeep]
 * @param {boolean} [bypass] - Bypass inaccessible things
 * @returns {restraint[]}
 */
function KDPlayerEffectRestrain(spell, count, tags, faction, noDeep, bypass, allowEvade = false, allowBlock = false, allowBondageResist = true) {
	let restraintsToAdd = [];
	let player = KinkyDungeonPlayerEntity;
	for (let i = 0; i < count; i++) {
		let restraintAdd = KinkyDungeonGetRestraint({tags: tags}, MiniGameKinkyDungeonLevel + (spell?.power || 0), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);

		if (restraintAdd) {
			let playerEvasion = allowEvade ? KinkyDungeonPlayerEvasion() : 0;
			let playerBlock = allowBlock ? KinkyDungeonPlayerBlock() : 0;
			let missed = allowEvade && KDRandom() * AIData.accuracy < 1 - playerEvasion;
			let blockedAtk = allowBlock && KDRandom() * AIData.accuracy < 1 - playerBlock;
			if (!missed && !blockedAtk) {
				restraintsToAdd.push(restraintAdd);
			} else {
				if (missed) {
					KinkyDungeonSendEvent("missPlayerSpell", {spell: spell, player: player});
					KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonSpellBindMiss").replace("EnemyName", TextGet("KinkyDungeonSpell" + (spell.name || ""))), "lightgreen", 1);
					KDDamageQueue.push({floater: TextGet("KDMissed"), Entity: {x: player.x - 0.5, y: player.y - 0.5}, Color: "#88ff88", Time: 2, Delay: 0});
				} else if (blockedAtk) {
					KinkyDungeonSendEvent("blockPlayerSpell", {spell: spell, player: player});
					KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonSpellBindBlock").replace("EnemyName", TextGet("KinkyDungeonSpell" + (spell.name || ""))), "lightgreen", 1);
					KDDamageQueue.push({floater: TextGet("KDBlocked"), Entity: {x: player.x - 0.5, y: player.y - 0.5}, Color: "#88ff88", Time: 2, Delay: 0});
				}

			}
		}
	}
	if (restraintsToAdd.length > 0) {
		let rests = KDRunBondageResist(undefined, faction, restraintsToAdd,(r) => {
			KDDamageQueue.push({floater: TextGet("KDBlockedRestraint"), Entity: {x: player.x - 0.5, y: player.y - 0.5}, Color: "#88ff88", Time: 2, Delay: 0});

			if (!r)
				KinkyDungeonSendTextMessage(1, TextGet("KDBondageResistBlockTotal"), "#88ff88", 1);
		}, undefined, spell);
		KinkyDungeonSendEvent("boundBySpell", {player: KinkyDungeonPlayerEntity, restraintsAdded: rests});
		return rests;
	}
	return [];
}


function KDTestSpellHits(spell, allowEvade = 0, allowBlock = 1) {
	let player = KinkyDungeonPlayerEntity;
	let playerEvasion = allowEvade ? KinkyDungeonPlayerEvasion() : 0;
	let playerBlock = allowBlock ? KinkyDungeonPlayerBlock() : 0;
	let missed = allowEvade && KDRandom() * AIData.accuracy < (1 - playerEvasion) * allowEvade;
	let blockedAtk = allowBlock && KDRandom() * AIData.accuracy < (1 - playerBlock) * allowBlock;
	if (!missed && !blockedAtk) {
		return true;
	} else {
		if (missed) {
			KinkyDungeonSendEvent("missPlayerSpell", {spell: spell, player: player});
			KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonSpellBindMiss").replace("EnemyName", TextGet("KinkyDungeonSpell" + (spell.name || ""))), "lightgreen", 1);
			KDDamageQueue.push({floater: TextGet("KDMissed"), Entity: {x: player.x - 0.5, y: player.y - 0.5}, Color: "#88ff88", Time: 2, Delay: 0});
		} else if (blockedAtk) {
			KinkyDungeonSendEvent("blockPlayerSpell", {spell: spell, player: player});
			KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonSpellBindBlock").replace("EnemyName", TextGet("KinkyDungeonSpell" + (spell.name || ""))), "lightgreen", 1);
			KDDamageQueue.push({floater: TextGet("KDBlocked"), Entity: {x: player.x - 0.5, y: player.y - 0.5}, Color: "#88ff88", Time: 2, Delay: 0});
		}
		return false;
	}
}

function KinkyDungeonPlayerEffect(target, damage, playerEffect, spell, faction, bullet, entity) {
	if (!playerEffect.name) return;
	let effect = false;
	let sfx = spell ? spell.hitsfx : undefined;
	if (!sfx) sfx = (playerEffect.power && playerEffect.power < 2) ? "DamageWeak" : "Damage";
	if (damage == "inert") return;
	if (playerEffect.hitTag && !KDPlayerHitBy.includes(playerEffect.hitTag)) KDPlayerHitBy.push(playerEffect.hitTag);
	else if (playerEffect.hitTag) return;
	if (!playerEffect.chance || KDRandom() < playerEffect.chance) {
		if (KDPlayerEffects[playerEffect.name]) {
			let ret = KDPlayerEffects[playerEffect.name](target, damage, playerEffect, spell, faction, bullet, entity);
			if (ret.sfx != undefined) sfx = ret.sfx;
			effect = ret.effect;
		} else if (playerEffect.name == "Ampule") {
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpellShatter" + spell.name), "#ff0000", 1);
			effect = true;
		} else if (playerEffect.name == "AmpuleBlue") {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["latexRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["latexRestraints"], faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpellShatterBind" + spell.name), "#ff0000", 1);
				effect = true;
			} else {
				if (KinkyDungeonCurrentDress != "BlueSuit") {
					KinkyDungeonSetDress("BlueSuit", "Latex");
					KinkyDungeonDressPlayer();
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpellShatterDress" + spell.name), "#ff0000", 1);
					effect = true;
				} else {
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpellShatter" + spell.name), "#ff0000", 1);
				}

				if (KDTestSpellHits(spell, 0.0, 1.0)) {
					let dmg = KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
					if (dmg.happened) effect = true;
				}
			}
		} else if (playerEffect.name == "Bind") {
			let restraintAdd = KinkyDungeonGetRestraint({tags: [playerEffect.tag]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, [playerEffect.tag], faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpell" + spell.name + "Bind"), "#ff0000", 2);
				effect = true;
			} else {
				let dmg = KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpell" + spell.name + "Damage").replace("DamageDealt", dmg.string), "#ff0000", 2);
				if (dmg.happened) effect = true;
			}
		} else if (playerEffect.name == "ShadowStrike") {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["shadowRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["shadowRestraints"], faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpellShadowStrike"), "#ff0000", 1);
				effect = true;
			}
			let dmg = KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
			if (dmg.happened) effect = true;
		} else if (playerEffect.name == "Damage") {
			let dmg = KinkyDungeonDealDamage({damage: Math.max((spell.aoepower) ? spell.aoepower : 0, spell.power), type: spell.damage}, bullet);
			KinkyDungeonSendTextMessage(Math.min(spell.power, 5), TextGet("KinkyDungeonDamageSelf").replace("DamageDealt", dmg.string), "#ff0000", 1);
			if (dmg.happened) effect = true;
		} else if (playerEffect.name == "WitchBoulder") {
			if (KDTestSpellHits(spell, 1.0, 0.5)) {
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
				KDGameData.KneelTurns = 2;
				let dmg = KinkyDungeonDealDamage({damage: Math.max((spell.aoepower) ? spell.aoepower : 0, spell.power), type: spell.damage}, bullet);
				KinkyDungeonSendTextMessage(Math.min(spell.power, 5), TextGet("KDEffectWitchBoulder").replace("DamageDealt", dmg.string), "#ff0000", 1);
				if (dmg.happened) effect = true;
			}
		} else if (playerEffect.name == "IceBolt") {
			if (KDTestSpellHits(spell, 0, 1.0)) {
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
				let dmg = KinkyDungeonDealDamage({damage: Math.max((spell.aoepower) ? spell.aoepower : 0, spell.power), type: spell.damage}, bullet);
				KinkyDungeonSendTextMessage(Math.min(spell.power, 5), TextGet("KDEffectWitchBoulder").replace("DamageDealt", dmg.string), "#ff0000", 1);
				if (dmg.happened) effect = true;
			}
		} else if (playerEffect.name == "Ignition") {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
			KinkyDungeonSendTextMessage(playerEffect.power, TextGet("KinkyDungeonBuffIgniteDamage").replace("DamageDealt", dmg.string), "#ff0000", 1);
			if (dmg.happened) effect = true;
		} else if (playerEffect.name == "DamageNoMsg") {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
			if (dmg.happened) effect = true;
		} else if (playerEffect.name == "Blind") {
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonBlindSelf"), "#ff0000", playerEffect.time);
			effect = true;
		} else if (playerEffect.name == "Hairpin") {
			if (KDTestSpellHits(spell, 0, 1.0)) {
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonHairpin"), "#ff0000", playerEffect.time);
				if (spell.power > 0) {
					effect = true;
					KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
				}
				effect = true;
			}
		} else if (playerEffect.name == "MagicRope") {
			let roped = KDPlayerEffectRestrain(spell, playerEffect.count || 2, ["rest_rope_weakmagic"], undefined, false, false, false, false);

			if (roped) KDSendStatus('bound', "WeakMagicRopeArms", "spell_" + spell.name);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonMagicRopeSelf"), "#ff0000", playerEffect.time);
			if (roped)
				effect = true;
		} else if (playerEffect.name == "SlimeTrap") {
			let slimeWalker = false;
			for (let inv of KinkyDungeonAllRestraint()) {
				if (KDRestraint(inv).slimeWalk) {
					slimeWalker = true;
					break;
				}
			}
			if (!slimeWalker) {
				if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") < 0.45) {
					let restraintAdd = KinkyDungeonGetRestraint({tags: ["slimeRestraintsRandomLight"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
					if (restraintAdd) {
						KDPlayerEffectRestrain(spell, 1, ["slimeRestraintsRandomLight"], faction);
						KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
						effect = true;
					}
				}
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSlime"), "#ff0000", playerEffect.time);

				if (spell.power > 0) {
					effect = true;
					KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				}
			}
		} else if (playerEffect.name == "Slime") {
			if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") < 0.45) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["slimeRestraintsRandomLight"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["slimeRestraintsRandomLight"], faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					effect = true;
				}
				KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
			}
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSlime"), "#ff0000", playerEffect.time);

			if (spell.power > 0) {
				effect = true;
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			}
		} else if (playerEffect.name == "MiniSlime") {
			if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") < 0.45 && KDRandom() < 0.33) {
				KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonMiniSlime2"), "#ff0000", 2);
			} else
				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonMiniSlime"), "#ff0000", 1);

			if (spell.power > 0) {
				effect = true;
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			}
		} else if (playerEffect.name == "RemoveLowLevelRope") {
			let restraints = [];
			for (let inv of KinkyDungeonAllRestraint()) {
				if (KDRestraint(inv).power < 5 && KDRestraint(inv).shrine && KDRestraint(inv).shrine.includes("Rope")) {
					restraints.push(KDRestraint(inv).Group);
				}
			}
			for (let r of restraints) {
				if (effect) KDSendStatus('escape', KinkyDungeonGetRestraintItem(r).name, "spell_" + spell.name);
				KinkyDungeonRemoveRestraint(r, false);
			}
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonRemoveLowLevelRope"), "lightGreen", 2);
		} else if (playerEffect.name == "Shock") {
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonShock"), "#ff0000", playerEffect.time);
			effect = true;
		} else if (playerEffect.name == "CoronaShock") {
			if (KDTestSpellHits(spell, 0.0, 1.0)) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["celestialRopes"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["celestialRopes"], faction, false, false, false, false);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				}// else if (KDGameData.PrisonerState != 'jail' && KDGameData.PrisonerState != 'parole') {
				//KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
				//}
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonCoronaShock"), "#ff0000", playerEffect.time);
				effect = true;
			}
		} else if (playerEffect.name == "CrystalBind") {
			if (KDTestSpellHits(spell, 0.0, 1.0)) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["crystalRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["crystalRestraints"], faction, false, false, false, false);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				}//else if (KDGameData.PrisonerState != 'jail' && KDGameData.PrisonerState != 'parole') {
				//KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
				//}
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonCrystalBind"), "#ff0000", 3);
				effect = true;
			}
		} else if (playerEffect.name == "MysticShock") {
			if (KDTestSpellHits(spell, 0, 1.0)) {
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonMysticShock"), "#ff0000", playerEffect.time);
				if (spell.power > 0) {
					KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				}
				effect = true;
			}
		} else if (playerEffect.name == "RobotShock") {
			if (KDTestSpellHits(spell, 0, 1.0)) {
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonRobotShock"), "#ff0000", playerEffect.time);
				if (spell.power > 0) {
					KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				}
				effect = true;
			}
		} else if (playerEffect.name == "HeatBlast") {
			if (KDTestSpellHits(spell, 0, 1.0)) {
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns || 0, KinkyDungeonSlowMoveTurns + 2);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonHeatBlast"), "#ff0000", playerEffect.time + 1);
				if (spell.power > 0) {
					KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				}
				effect = true;
			}
		}  else if (playerEffect.name == "RubberBullets") {
			if (KDTestSpellHits(spell, 1, 0.2)) {
				if (KDRandom() < 0.25 && KinkyDungeonStatWill < KinkyDungeonStatWillMax/2) {
					let restraintAdd = KinkyDungeonGetRestraint({tags: ["slimeRestraintsRandom"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
					if (restraintAdd) {
						KDPlayerEffectRestrain(spell, 1, ["slimeRestraintsRandom"], faction, false, false, false, false);
						KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
						KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonRubberBulletsAttach"), "#ff0000", 2);
					}
				} else KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonRubberBullets"), "#ff0000", 2);
				if (spell.power > 0) {
					KinkyDungeonDealDamage({damage: KinkyDungeonStatWill < KinkyDungeonStatWillMax/2 ? spell.power : spell.power*1.5, type: spell.damage}, bullet);
				}
				effect = true;
			}
		} else if (playerEffect.name == "SingleChain") {
			if (KDTestSpellHits(spell, 0, 1.0)) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["chainRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["chainRestraints"], faction, false, false, false, false);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleChain"), "#ff0000", playerEffect.time);
					effect = true;
				} else {
					KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);

				}
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}
		} else  if (playerEffect.name == "SingleMagicChain") {
			if (KDTestSpellHits(spell, 0, 1.0)) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["chainRestraintsMagic"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["chainRestraintsMagic"], faction, false, false, false, false);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleChain"), "#ff0000", playerEffect.time);
					effect = true;
				}
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}
		} else if (playerEffect.name == "Spores") {
			KinkyDungeonSleepiness = Math.max(KinkyDungeonSleepiness, 6);
			KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSpores"), "#a583ff", 2);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			effect = true;
		} else if (playerEffect.name == "PoisonDagger") {
			if (KDTestSpellHits(spell, 0, 1.0)) {
				KinkyDungeonSendTextMessage(6, TextGet("KDPoisonDagger"), "#33ff00", 2);
				KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "PoisonDagger", aura: "#22ff44", type: "Sleepiness", power: 1, duration: playerEffect.time, player: true, enemies: false, tags: ["sleep"], range: 1.5});
				effect = true;
			}
		} else if (playerEffect.name == "SporesSick") {
			KinkyDungeonSleepiness += 1.5;
			KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSporesSick"), "#63ab3f", 2);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			effect = true;
		} else if (playerEffect.name == "Flummox") {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Flummox", type: "Flummox", duration: 5, power: 1.0, player: true, mushroom: true, tags: ["overlay", "darkness"]});
			KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonFlummox"), "#a583ff", 2);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			effect = true;
		} else if (playerEffect.name == "NurseBola") {
			if (KDTestSpellHits(spell, 0, 1.0)) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["nurseCuffRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["nurseCuffRestraints"], faction, false, false, false, false);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonNurseBola"), "#ff0000", playerEffect.time);
					effect = true;
				}
			}
		} else if (playerEffect.name == "SingleRope" || playerEffect.name == "BanditBola") {
			if (KDTestSpellHits(spell, 0, 1.0)) {
				if (playerEffect.name == "BanditBola") {
					KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				}
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["ropeRestraints"], faction, false, false, false, false);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleRope"), "#ff0000", playerEffect.time);
					effect = true;
				} else {
					KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);
				}
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}
		} else if (playerEffect.name == "RestrainingDevice") {
			if (KDTestSpellHits(spell, 0, 1.0)) {
				let added = [];
				for (let i = 0; i < playerEffect.count; i++) {
					let restraintAdd = KinkyDungeonGetRestraint({tags: ["hitechCables"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
					if (restraintAdd) {
						KDPlayerEffectRestrain(spell, 1, ["hitechCables"], faction, false, false, false, false);
						KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
						added.push(restraintAdd);
						effect = true;
					}
				}
				if (added.length > 0) {
					KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonRestrainingDevice"), "#ff0000", 2);
					effect = true;
				} else {
					KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
					KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonRestrainingDeviceStun"), "yellow", playerEffect.time);
				}
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}

		} else if (playerEffect.name == "Glue") {
			let added = [];
			if (KinkyDungeonLastAction == "Move")
				for (let i = 0; i < playerEffect.count; i++) {
					let restraintAdd = KinkyDungeonGetRestraint({tags: ["glueRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
					if (restraintAdd) {
						KDPlayerEffectRestrain(spell, 1, ["glueRestraints"], faction);
						KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
						added.push(restraintAdd);
						effect = true;
					}
				}
			if (added.length > 0) {
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonGlue"), "yellow", 2);
				effect = true;
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonGlueSlow"), "yellow", playerEffect.time);
				effect = true;
			}
			if (playerEffect.power) {
				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonGlueSlowDamage").replace("DamageDealt", playerEffect.power), "yellow", 2);
				KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
				effect = true;
			}
		} else if (playerEffect.name == "RopeEngulf") {
			let added = [];
			for (let i = 0; i < playerEffect.power; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeMagicStrong", "ropeAuxiliary", "clothRestraints", "tapeRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["ropeMagicStrong", "ropeAuxiliary", "clothRestraints", "tapeRestraints"], faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					added.push(restraintAdd);
					effect = true;
				}
			}
			if (added.length > 0) {
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonRopeEngulf"), "#ff0000", 2);
				effect = true;
			} else {
				let RopeDresses = ["Leotard", "Bikini", "Lingerie"];
				if (!RopeDresses.includes(KinkyDungeonCurrentDress)) {
					KinkyDungeonSetDress(RopeDresses[Math.floor(Math.random() * RopeDresses.length)], "");
					KinkyDungeonDressPlayer();
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonRopeEngulfDress"), "#ff0000", 3);
					effect = true;
				} else {
					//KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
					let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeMagicHogtie"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
					if (restraintAdd) {
						KDPlayerEffectRestrain(spell, 1, ["ropeMagicHogtie"], faction);
						KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
						KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonRopeEngulf"), "#ff0000", 2);
						effect = true;
					} else {
						let buff1 = {id: "KrakenEngulf", type: "Blindness", duration: 8, power: 1.0, player: true, tags: ["passout"]};
						let buff2 = {id: "KrakenEngulf2", type: "Blindness", duration: 8, power: 2.0, player: true, tags: ["passout"]};
						let buff3 = {id: "KrakenEngulf3", type: "Blindness", duration: 8, power: 4.0, player: true, tags: ["passout"]};
						if (KinkyDungeonPlayerBuffs[buff3.id]) {
							KinkyDungeonPassOut();
						} else if (KinkyDungeonPlayerBuffs[buff2.id]) {
							KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonRopeEngulfEnd3"), "#ff0000", 5);
							KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff1);
							KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff2);
							KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff3);
						}  else if (KinkyDungeonPlayerBuffs[buff1.id]) {
							KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonRopeEngulfEnd2"), "#ff0000", 4);
							KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff1);
							KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff2);
						} else {
							KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonRopeEngulfEnd1"), "#ff0000", 4);
							KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff1);
						}
					}

					//KinkyDungeonSetFlag("kraken", 4);
				}
			}
		} else if (playerEffect.name == "RopeEngulfWeak") {
			let added = [];
			for (let i = 0; i < playerEffect.power; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeRestraints", "ropeRestraints2", "ropeRestraintsWrist"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["ropeRestraints", "ropeRestraints2", "ropeRestraintsWrist"], faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					added.push(restraintAdd);
					effect = true;
				}
			}
			if (added.length > 0) {
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonRopeEngulfWeak"), "#ff0000", 2);
				effect = true;
			} else {
				let RopeDresses = ["Leotard", "Bikini", "Lingerie"];
				if (!RopeDresses.includes(KinkyDungeonCurrentDress)) {
					KinkyDungeonSetDress(RopeDresses[Math.floor(Math.random() * RopeDresses.length)], "");
					KinkyDungeonDressPlayer();
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonRopeEngulfDress"), "#ff0000", 3);
					effect = true;
				} else {
					KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);

				}
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}
		} else if (playerEffect.name == "VineEngulf") {
			let added = [];
			for (let i = 0; i < playerEffect.power; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["vineRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["vineRestraints"], faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					added.push(restraintAdd);
					effect = true;
				}
			}
			if (added.length > 0) {
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonVineEngulf"), "#ff0000", 2);
				effect = true;
			} else {
				let RopeDresses = ["GreenLeotard", "Lingerie"];
				if (!RopeDresses.includes(KinkyDungeonCurrentDress) && KinkyDungeonCurrentDress != "Elven") {
					KinkyDungeonSetDress(RopeDresses[Math.floor(Math.random() * RopeDresses.length)], "");
					KinkyDungeonDressPlayer();
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonVineEngulfDress"), "#ff0000", 3);
					effect = true;
				} else {
					KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);

				}
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}
		}  else if (playerEffect.name == "ObsidianEngulf") {
			let added = [];
			for (let i = 0; i < playerEffect.count; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["obsidianRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["obsidianRestraints"], faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					added.push(restraintAdd);
					effect = true;
				}
			}
			if (added.length > 0) {
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonObsidianEngulf"), "#ff0000", 2);
				effect = true;
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);

			}
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			effect = true;
		} else if (playerEffect.name == "CharmWraps") {
			let added = [];
			for (let i = 0; i < playerEffect.power; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["ribbonRestraintsLight"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["ribbonRestraintsLight"], faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					added.push(restraintAdd);
					effect = true;
				}
			}
			if (added.length > 0) {
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonCharmWraps"), "#ff0000", 2);
				effect = true;
			} else {
				let CharmDresses = ["Leotard", "Bikini", "Lingerie"];
				if (!CharmDresses.includes(KinkyDungeonCurrentDress) && KinkyDungeonCurrentDress != "Prisoner") {
					KinkyDungeonSetDress(CharmDresses[Math.floor(Math.random() * CharmDresses.length)], "");
					KinkyDungeonDressPlayer();
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCharmWrapsDress"), "#ff0000", 3);
					effect = true;
				} else {
					KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);

				}
			}
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			effect = true;
		} else if (playerEffect.name == "EnchantedArrow") {
			let added = [];
			for (let i = 0; i < playerEffect.count; i++) {
				let ropeRests = ["mithrilRope"];
				if (KinkyDungeonStatStamina < KinkyDungeonStatStamina * 0.25) {
					ropeRests.push("mithrilRopeHogtie");
				}
				let restraintAdd = KinkyDungeonGetRestraint({tags: ropeRests}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ropeRests, faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					added.push(restraintAdd);
					effect = true;
				}
			}
			if (added.length > 0) {
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonEnchantedArrow"), "#ff0000", 2);
				effect = true;
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);

			}
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			effect = true;

		} else if (playerEffect.name == "TrapBindings") {
			let added = [];
			for (let i = 0; i < playerEffect.count; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: playerEffect.tags}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, playerEffect.tags, faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					added.push(restraintAdd);
					effect = true;
				}
			}
			if (added.length > 0) {
				KinkyDungeonSendTextMessage(6, TextGet(playerEffect.text), "#ff0000", 2);
				effect = true;
			} else {
				let PossibleDresses = ["Leotard", "Bikini", "Lingerie"];
				if (!PossibleDresses.includes(KinkyDungeonCurrentDress)) {
					KinkyDungeonSetDress(PossibleDresses[Math.floor(Math.random() * PossibleDresses.length)], "");
					KinkyDungeonDressPlayer();
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonTrapBindingsDress"), "#ff0000", 3);
					effect = true;
				}
				// else if (!playerEffect.noGuard && KDGameData.PrisonerState != 'jail' && KDGameData.PrisonerState != 'parole') {
				//KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
				//}

			}
			if (playerEffect.power > 0 && playerEffect.damage) {
				KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
				effect = true;
			}
		} else if (playerEffect.name == "NurseSyringe") {
			if (KDTestSpellHits(spell, 1.0, 1.0)) {
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNurseSyringe"), "#ff0000", 8);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "NurseSyringe", aura: "#22ff44", type: "Sleepiness", power: 1, duration: playerEffect.time, player: true, enemies: false, tags: ["sleep"], range: 1.5});
				effect = true;
			}
		} else if (playerEffect.name == "TrapSleepDart") {
			KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonTrapSleepDart"), "#ff0000", 8);
			KDStunTurns(8);
			KinkyDungeonStatBlind = 8;
			KinkyDungeonSleepiness = 8;
			KinkyDungeonAlert = 5;
			effect = true;
		} else if (playerEffect.name == "Drench") {
			KinkyDungeonSendTextMessage(4, TextGet("KDEffectDrench"), "#9999ff", 3);
			for (let b of spell.buffs) {
				if (b.id.includes("Drenched")) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, b);
				}
			}
			if (spell.power > 0 && spell.damage == 'acid')
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		} else if (playerEffect.name == "LustBomb") {
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonLustBomb"), "pink", 4);
			if (playerEffect.power > 0) {
				KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
			}
			effect = true;
		} else if (playerEffect.name == "TrapLustCloud") {
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonTrapLustCloud"), "yellow", 4);
			if (playerEffect.power > 0) {
				KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
			}
			effect = true;
		} else if (playerEffect.name == "TrapSPCloud") {
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonTrapSPCloud"), "yellow", 4);
			if (playerEffect.power > 0) {
				KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
			}
			KDGameData.StaminaPause = 10;
			effect = true;
		} else if (playerEffect.name == "Freeze") {
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonFreeze"), "#ff0000", playerEffect.time);
			if (playerEffect.power > 0) {
				KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
			}
			KinkyDungeonStatFreeze = Math.max(0, playerEffect.time);
			KinkyDungeonSleepTime = CommonTime() + KinkyDungeonFreezeTime;
			effect = true;
		} else if (playerEffect.name == "Chill") {
			if (playerEffect.power > 0 && !KinkyDungeonFlags.get("chill")) {
				KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
			}
			if (KinkyDungeonPlayerBuffs.Drenched || KinkyDungeonPlayerBuffs.Chilled) {
				sfx = "Freeze";
				KinkyDungeonStatFreeze = Math.max(0, playerEffect.time);
				KinkyDungeonSleepTime = CommonTime() + KinkyDungeonFreezeTime;
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonFreeze"), "#ff0000", playerEffect.time);
			} else {
				sfx = "Bones";
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1);
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonChill"), "#ff0000", playerEffect.time);
			}
			KinkyDungeonSetFlag("chill", 1);
			effect = true;
		} else if (playerEffect.name == "ShadowBind") {
			KinkyDungeonStatBind = Math.max(0, playerEffect.time);
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonShadowBind"), "#ff0000", playerEffect.time);
			effect = true;
		}
	}

	if (sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
	if (effect) KinkyDungeonInterruptSleep();

	return effect;
}

/**
 * For those 'three strikes you're out' effects
 * @param {string} Name
 * @param {entity} Target
 * @param {number} time - Time for the buff to wear off
 * @param {(target: entity) => void} FinalEffect
 * @param {string} buffType - Buff effect
 */
function KDTripleBuffKill(Name, Target, time, FinalEffect = (target) => KinkyDungeonPassOut(), buffType = "Blindness", FirstEffect = (target) => {}, SecondEffect = (target) => {}, ThirdEffect = (target) => {}) {
	let buff1 = {id: Name + "1", type: buffType, duration: time + 3, power: 1.0, player: true, tags: ["passout"]};
	let buff2 = {id: Name + "2", type: buffType, duration: time + 3, power: 2.0, player: true, tags: ["passout"]};
	let buff3 = {id: Name + "3", type: buffType, duration: time + 3, power: 4.0, player: true, tags: ["passout"]};
	if (KinkyDungeonPlayerBuffs[buff3.id]) {
		FinalEffect(Target);
	} else if (KinkyDungeonPlayerBuffs[buff2.id]) {
		KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeon" + Name + "3"), "#ff5555", time + 1);
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff1);
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff2);
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff3);
		ThirdEffect(Target);
	}  else if (KinkyDungeonPlayerBuffs[buff1.id]) {
		KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeon" + Name + "2"), "#ff5555", time);
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff1);
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff2);
		SecondEffect(Target);
	} else {
		KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeon" + Name + "1"), "#ff5555", time);
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff1);
		FirstEffect(Target);
	}
}

/**
 *
 * @param {boolean} resetSlimeLevel
 * @param {string} restraint
 */
function KDAdvanceSlime(resetSlimeLevel, restraint = "") {
	let slimedParts = [];
	let potentialSlimeParts = [];
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).slimeLevel > 0) {
			slimedParts.push({
				name: KDRestraint(inv).name,
				group: KDRestraint(inv).Group,
				level: KDRestraint(inv).slimeLevel
			});
		}
	}
	for (let slime of slimedParts) {
		let index = -1;
		for (let i = 0; i < KinkyDungeonSlimeParts.length; i++) if (KinkyDungeonSlimeParts[i].group === slime.group) {
			index = i;
			break;
		}
		if (index >= 0) {
			let slime2 = undefined;
			let slime3 = undefined;
			if (index > 0) {
				for (let s of potentialSlimeParts) if (s.group === KinkyDungeonSlimeParts[index - 1].group && !(s.level > slime.level)) {
					slime2 = s;
					break;
				}
				if (!slime2 && (!KinkyDungeonStatsChoice.has("Unmasked") || !KinkyDungeonSlimeParts[index - 1].noUnmasked)) potentialSlimeParts.push({
					group: KinkyDungeonSlimeParts[index - 1].group,
					restraint: (restraint ? restraint : "") + KinkyDungeonSlimeParts[index - 1].restraint,
					level: slime.level
				});
			}
			if (index < KinkyDungeonSlimeParts.length - 1) {
				for (let s of potentialSlimeParts) if (s.group === KinkyDungeonSlimeParts[index + 1].group && !(s.level > slime.level)) {
					slime3 = s;
					break;
				}
				if (!slime3 && (!KinkyDungeonStatsChoice.has("Unmasked") || !KinkyDungeonSlimeParts[index + 1].noUnmasked)) potentialSlimeParts.push({
					group: KinkyDungeonSlimeParts[index + 1].group,
					restraint: (restraint ? restraint : "") + KinkyDungeonSlimeParts[index + 1].restraint,
					level: slime.level
				});
			}
		}
	}
	let slimed = false;
	let advance = false;
	if (potentialSlimeParts.length === 0) {
		advance = true;
	}
	else while (potentialSlimeParts.length > 0) {
		let newSlime = potentialSlimeParts[Math.floor(KDRandom() * potentialSlimeParts.length)];
		if (newSlime) {
			let added = KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(newSlime.restraint), 0, true);
			if (added) {
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSlimeSpread"), "#ff44ff", 3);
				potentialSlimeParts = [];
				if (resetSlimeLevel)
					KDEventData.SlimeLevel = -100;
				slimed = true;
			}
		}
		potentialSlimeParts.splice(potentialSlimeParts.indexOf(newSlime), 1);
	}
	if (!slimed && potentialSlimeParts.length === 0) {
		let slime = slimedParts[Math.floor(KDRandom() * slimedParts.length)];
		if (!slime) return false;
		KinkyDungeonRemoveRestraintsWithName(slime.name);
		if (KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("Hard" + slime.name), 0, true, undefined,  undefined,  undefined,  undefined,  undefined,  true)) {
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSlimeHarden"), "#ff44ff", 3);
			let slimesuit = (restraint ? restraint : "") + "SlimeSuit";

			if (KinkyDungeonCurrentDress !== slimesuit) {
				KinkyDungeonSetDress(slimesuit, "");
				KinkyDungeonDressPlayer();
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSlimeSpreadSuit"), "#ff44ff", 3);
			}
		}
		if (resetSlimeLevel)
			KDEventData.SlimeLevel = -100;
	}
	return advance;
}