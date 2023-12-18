'use strict';


/**
 * @type {Record<string, (target, damage, playerEffect, spell, faction, bullet, entity) => {sfx: string, effect: boolean}>}
 */
let KDPlayerEffects = {
	"MagicRope": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		if (dmg.happened) {
			let roped = KDPlayerEffectRestrain(spell, playerEffect.count || 2, playerEffect.tags, undefined, false, false, false, false);

			if (roped) KDSendStatus('bound', "WeakMagicRopeArms", "spell_" + spell.name);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonMagic" + (playerEffect.msg || "Rope")).KDReplaceOrAddDmg( dmg.string)
				, "#ff0000", playerEffect.time);

			if (roped) return {sfx: "MagicSlash", effect: true}; 
		}
		return {sfx: "Shield", effect: false};
	},
	"EnvDamage": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage, flags: playerEffect?.flags}, bullet);
		if (dmg.happened) {
			KinkyDungeonSendTextMessage(Math.min(playerEffect.power, 5), TextGet("KinkyDungeonDamageSelf").KDReplaceOrAddDmg(dmg.string), "#ff0000", 1);
			return {sfx: "DamageWeak", effect: true};
		}
		
		return {sfx: undefined, effect: false};
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
			let dmg = KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			if (dmg.happened) {
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
	
				KinkyDungeonSendTextMessage(3, TextGet("KDObserverCurseApply").KDReplaceOrAddDmg(dmg.string), "#ff5555", 1);
				return {sfx: "Evil", effect: true};
			}
		}
			
		return {sfx: "Shield", effect: false};
	},
	"TheShadowCurse": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let applied = "";

		for (let i = 0; i < playerEffect.count; i++) {
			let curse = KDGetByWeight(KinkyDungeonGetCurseByListWeighted(["Common"], "", false, 0, 100));
			let restraint = KDChooseRestraintFromListGroupPri(
				KDGetRestraintsEligible({tags: ['leatherRestraints', 'leatherRestraintsHeavy', "obsidianRestraints", "shadowlatexRestraints"]}, 10, 'grv', true, undefined, undefined, undefined, false, undefined, undefined, undefined, undefined, curse),
				KDRestraintGroupProgressiveOrderFun)?.name;

			if (restraint && KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(restraint), 0, true, "", true, false, undefined, "Observer", true, curse)) {
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
		let dmg = KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);

		if (dmg.happened) {
			let applyCurse = KinkyDungeonStatWill < 0.1;

			KinkyDungeonSendTextMessage(3, TextGet("KDEpicenterCurseDamage").KDReplaceOrAddDmg(dmg.string), "#ff5555", 2);
	
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
		}
		
		return {sfx: "Shield", effect: false};
	},
	"MaidChastity": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		
		if (KinkyDungeonFlags.get("ChastityBelts")) {
			// Tease the player
			/*if (KinkyDungeonFlags.get("Vibes")) {
				let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
				KinkyDungeonSendTextMessage(Math.min(playerEffect.power, 5), TextGet("KDMaidforceHeadVibe").KDReplaceOrAddDmg(dmg.string), "#ff9999", 1);
				if (dmg.happened) return {sfx: "Vibe", effect: true}; return {sfx: undefined, effect: false};
			}*/
		} else {
			if (KDTestSpellHits(spell, 1.0, 1.0)) {
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
		}
		return {sfx: undefined, effect: false};
	},
	"ShadowBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
				let dmg = KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				if (!dmg.happened) return{sfx: "Shield", effect: false};
				KDPlayerEffectRestrain(spell, playerEffect.count, ["shadowHands"], "Ghost", false, false, false, false);
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonShadowBolt").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);
		}
		return {sfx: "Evil", effect: true};
	},
	"BearTrapStun": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let dmg = KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		if (!dmg.happened) return{sfx: "Shield", effect: false};
		KDStunTurns(playerEffect.time);
		KinkyDungeonSendTextMessage(4, TextGet("KDBearTrapHit").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time+1);

		return {sfx: "Clang", effect: true};
	},
	"RubberBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KDPlayerEffectRestrain(spell, playerEffect.count, ["redLatexBasic"], "Dollsmith", false, false, false, false);

			KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRubberBolt").KDReplaceOrAddDmg( dmg.string), "yellow", 1);
			
		}
		return {sfx: "Dollify", effect: true};
	},
	"EncaseBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KDPlayerEffectRestrain(spell, playerEffect.count, ["latexEncaseRandom"], "Dollsmith", false, false, false, false);

			KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonEncaseBolt").KDReplaceOrAddDmg( dmg.string), "yellow", 1);
			
		}
		return {sfx: "Dollify", effect: true};
	},
	"EnemyWindBlast": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 1.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			let dist = playerEffect.dist;
			for (let i = 0; i < dist; i++) {
				let newX = target.x + Math.round(1 * Math.sign(bullet.vx));
				let newY = target.y + Math.round(1 * Math.sign(bullet.vy));
				if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(newX, newY)) && KinkyDungeonNoEnemy(newX, newY, true)
				&& (dist == 1 || KinkyDungeonCheckProjectileClearance(target.x, target.y, newX, newY))) {
					KDMovePlayer(newX, newY, false);
				}
			}
			KinkyDungeonSendTextMessage(4, TextGet("KDEnemyWindBlast").KDReplaceOrAddDmg( dmg.string), "yellow", 1);
			
		}
		return {sfx: "Fwosh", effect: true};
	},
	"PushAway": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 1.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			if (dmg.happened) {
				let dist = playerEffect.dist;
				for (let i = 0; i < dist; i++) {
					let newX = target.x + Math.round(1 * Math.sign(entity.x));
					let newY = target.y + Math.round(1 * Math.sign(entity.y));
					if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(newX, newY)) && KinkyDungeonNoEnemy(newX, newY, true)
					&& (dist == 1 || KinkyDungeonCheckProjectileClearance(target.x, target.y, newX, newY))) {
						KDMovePlayer(newX, newY, false);
					}
				}
				KinkyDungeonSendTextMessage(4, TextGet(playerEffect.msg || "KDEnemyWindBlast").KDReplaceOrAddDmg( dmg.string), "#ffff00", 1);
			}
			
		}
		return {sfx: "Fwosh", effect: true};
	},
	"GravityPull": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 1.0, 0.0)) {
			let dist = playerEffect.dist;
			for (let i = 0; i < dist; i++) {
				let dd = KDistEuclidean(KinkyDungeonPlayerEntity.x - bullet.x, KinkyDungeonPlayerEntity.y - bullet.y);
				let newX = Math.round(KinkyDungeonPlayerEntity.x + (bullet.x - KinkyDungeonPlayerEntity.x)/dd);
				let newY = Math.round(KinkyDungeonPlayerEntity.y + (bullet.y - KinkyDungeonPlayerEntity.y)/dd);
				if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(newX, newY)) && KinkyDungeonNoEnemy(newX, newY, true)
				&& (dist == 1 || KinkyDungeonCheckProjectileClearance(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, newX, newY))) {
					KDMovePlayer(newX, newY, false);
				}
			}
			if (playerEffect.power) {
				let dmg = KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage});
				KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonGravityPull2").KDReplaceOrAddDmg( dmg.string), "#8800ff", 2);
			} else {
				KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonGravityPull"), "#8800ff", 2);
			}
			KDStunTurns(1);
		}
		return {sfx: "Evil", effect: true};
	},
	"LatexBubble": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.5, 0.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: "LatexBubble",
				aura: "#2789cd",
				aurasprite: "LatexBubble",
				noAuraColor: true,
				buffSprite: true,
				type: "meleeDamageBuff",
				power: -0.3,
				duration: playerEffect.time,
				tags: ["debuff"],
			});
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: "LatexBubble2",
				type: "Blindness",
				power: 4,
				duration: playerEffect.time,
				tags: ["debuff"],
			});
			KinkyDungeonSendTextMessage(4, TextGet("KDLatexBubble").KDReplaceOrAddDmg( dmg.string), "#2789cd", 1);
		}
		return {sfx: "Fwosh", effect: true};
	},
	"WaterBubble": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.5, 0.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: "WaterBubble",
				aura: "#2789cd",
				aurasprite: "WaterBubble",
				noAuraColor: true,
				buffSprite: true,
				type: "Accuracy",
				power: -0.5,
				duration: playerEffect.time,
				tags: ["debuff"],
			});
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: "WaterBubble2",
				type: "SlowLevel",
				power: 3,
				duration: playerEffect.time,
				tags: ["debuff", "slow"],
			});
			KinkyDungeonSendTextMessage(4, TextGet("KDWaterBubble").KDReplaceOrAddDmg( dmg.string), "#2789cd", 1);
		}
		return {sfx: "Fwosh", effect: true};
	},
	"EncaseBoltDrone": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			if (KDGameData.MovePoints >= 0) {
				KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonEncaseBoltDroneSlow").KDReplaceOrAddDmg( dmg.string), "yellow", 1);
			} else {
				KDPlayerEffectRestrain(spell, playerEffect.count, ["latexEncaseRandom"], "Dollsmith", false, false, false, false);
				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonEncaseBoltDrone").KDReplaceOrAddDmg( dmg.string), "yellow", 1);
			}
			
		}
		return {sfx: "Dollify", effect: true};
	},
	"RubberMissile": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		if (!dmg.happened) return{sfx: "Shield", effect: false};
		KDPlayerEffectRestrain(spell, playerEffect.count, ["latexEncaseRandom"], "Dollsmith");

		KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRubberMissile").KDReplaceOrAddDmg( dmg.string), "yellow", 1);

		return {sfx: "Lightning", effect: true};
	},
	"ObsidianBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KDPlayerEffectRestrain(spell, playerEffect.count, ["obsidianRestraints"], "Elemental", false, false, false, false);

			KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonObsidianBolt").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);
			
		}
		return {sfx: "Evil", effect: true};
	},
	"MithrilBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KDPlayerEffectRestrain(spell, playerEffect.count, ["mithrilRope"], "Elemental", false, false, false, false);

			KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonMithrilBolt").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);
			
		}
		return {sfx: "Evil", effect: true};
	},
	"LockBullet": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 1.0, 1.0)) {
			
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (dmg.happened) {
				//KDPlayerEffectRestrain(spell, playerEffect.count, ["mithrilRope"], "Elemental", false, false, false, false);

				let Lockable = KinkyDungeonPlayerGetLockableRestraints();
				let Lstart = 0;
				let Lmax = Lockable.length-1;
				let locked = false;
				if (Lmax >= 0) {
					Lstart = Math.floor(Lmax*KDRandom()); // Lock one at random
					for (let L = Lstart; L <= Lmax; L++) {
						let l = playerEffect.type ? KDProcessLock(playerEffect.type) : KinkyDungeonGenerateLock(true, undefined, undefined, undefined, {bullet: bullet});
						KinkyDungeonLock(Lockable[L], l); // Lock it!
						KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonLockBullet").KDReplaceOrAddDmg( dmg.string)
							.replace("LKTYP", TextGet(`Kinky${l}LockType`)), "orange", 1);
						locked = true;
					}
				}

				if (!locked) {
					if (dmg.string)
						KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonLockBulletFail")
							.replace("Dmgdlt", dmg.string), "yellow", 1);
					if (!KinkyDungeonFlags.get("slowSpellFlag")) {
						KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1);
						KinkyDungeonSetFlag("slowSpellFlag", playerEffect.time || 2);
					}
				}
			} else return {sfx: "Shield", effect: false};
			
		}
		return {sfx: "LockHeavy", effect: true};
	},
	"CelestialBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KDPlayerEffectRestrain(spell, playerEffect.count, ["celestialRopes"], "Angel", false, false, false, false);

			KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonCelestialBolt").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);
			
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
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		if (dmg.happened) {
			KDPlayerEffectRestrain(spell, playerEffect.count, [playerEffect.kind], "Demon");
			KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonStarBondage").KDReplaceOrAddDmg( dmg.string), "#ff5555", 4);
		} else return {sfx: "Shield", effect: false};

		return {sfx: "Evil", effect: true};
	},
	"MoonBondage": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		if (KDTestSpellHits(spell, 0.0, 0.2)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};

			KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonMoonBondage").KDReplaceOrAddDmg( dmg.string), "#ff5555", 1);
			KDPlayerEffectRestrain(spell, playerEffect.count, [playerEffect.kind], "Demon");
		}
		return {sfx: "Evil", effect: true};
	},
	"FuukaOrb": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		KDTripleBuffKill("FuukaOrb", KinkyDungeonPlayerEntity, 300, (tt) => {
			// Nothing!
		}, "Sealing", (tt) => {
			if (tt?.player) {
				KinkyDungeonApplyBuffToEntity(tt, {
					id: "FuukaOrb",
					duration: 300,
					tags: ["removeNewMap", "removeDefeat"],
					power: 1,
					type: "SlowLevel",
					aura: "#ff6767",
					buffSprite: true,
					aurasprite: "AuraSeal",
				});
			}
		}, (tt) => {
			KinkyDungeonApplyBuffToEntity(tt, {
				id: "FuukaOrb",
				duration: 300,
				tags: ["removeNewMap", "removeDefeat"],
				power: 3,
				type: "SlowLevel",
				aura: "#ff6767",
				buffSprite: true,
				aurasprite: "AuraSeal",
			});
		},  (tt) => {

			KinkyDungeonApplyBuffToEntity(tt, {
				id: "FuukaOrb",
				duration: 300,
				tags: ["removeNewMap", "removeDefeat"],
				power: 100,
				type: "SlowLevel",
				aura: "#ff6767",
				buffSprite: true,
				aurasprite: "AuraSeal",
			});
		}, );
		return {sfx: "Evil", effect: true};
	},
	"ShadowSeal": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		KinkyDungeonApplyBuffToEntity(target, {
			id: "ShadowSeal",
			duration: 10,
			tags: ["removeNewMap", "removeDefeat"],
			power: 100,
			type: "SlowLevel",
			aura: "#ff6767",
			buffSprite: true,
			aurasprite: "AuraSeal",
		});
		KinkyDungeonMakeNoise(10, target.x, target.y);
		KinkyDungeonSendTextMessage(8, TextGet("KDShadowSeal"), "#aa55ff", 4);
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
			return {sfx: "Struggle", effect: true};
		}
		return {sfx: "RubberBolt", effect: false};
	},
	"SarcoEngulf": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		if (!dmg.happened) return{sfx: "Shield", effect: false};
		let added = [];
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
			KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonRopeEngulf").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
			effect = true;
		} else {
			let RopeDresses = ["Leotard", "Bikini", "Lingerie"];
			if (!RopeDresses.includes(KinkyDungeonCurrentDress)) {
				KinkyDungeonSetDress(RopeDresses[Math.floor(Math.random() * RopeDresses.length)], "");
				KinkyDungeonDressPlayer();
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonHexEngulfDress").KDReplaceOrAddDmg( dmg.string), "#ff0000", 3);
				effect = true;
			}
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeMagicHogtie"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["ropeMagicHogtie"], faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSarcoEngulf").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
				effect = true;
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
	"Bind": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 1.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			let restraintAdd = KinkyDungeonGetRestraint({tags: [playerEffect.tag]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, [playerEffect.tag], faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpell" + spell.name + "Bind").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
				effect = true;
			} else {
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpell" + spell.name + "Damage").KDReplaceOrAddDmg(dmg.string), "#ff0000", 2);
				if (dmg.happened) effect = true;
			}
			return {sfx: "Struggle", effect: effect};
			
		}
		return {sfx: "Miss", effect: effect};
	},
	"AmpuleBlue": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 1.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			effect = true;
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["latexRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["latexRestraints"], faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpellShatterBind" + spell.name).KDReplaceOrAddDmg( dmg.string), "#ff0000", 1);
				effect = true;
			} else {
				if (KinkyDungeonCurrentDress != "BlueSuit") {
					KinkyDungeonSetDress("BlueSuit", "Latex");
					KinkyDungeonDressPlayer();
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpellShatterDress" + spell.name).KDReplaceOrAddDmg( dmg.string), "#ff0000", 1);
					effect = true;
				} else {
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpellShatter" + spell.name).KDReplaceOrAddDmg( dmg.string), "#ff0000", 1);
				}

			}
			return {sfx: "Dollify", effect: effect};
		}
		return {sfx: "Miss", effect: effect};
		
	},
	"Hairpin": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.2, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonHairpin").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
			effect = true;
		}
		return {sfx: "Miss", effect: effect};
	},
	
	"Blind": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (Math.round(
			playerEffect.time * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "lightDamageResist"))
		) > 0) {
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonBlindSelf"), "#ff0000", Math.round(
				playerEffect.time * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "lightDamageResist"))
			));
			effect = true;
		}
		
		return {sfx: "Damage", effect: effect};
	},
	"DamageNoMsg": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		if (dmg.happened) effect = true;
		return {sfx: "DamageWeak", effect: effect};
	},
	"Ignition": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		if (!dmg.happened) return{sfx: "Shield", effect: false};
		effect = true;
		KinkyDungeonSendTextMessage(playerEffect.power, TextGet("KinkyDungeonBuffIgniteDamage").KDReplaceOrAddDmg(dmg.string), "#ff0000", 1);
		return {sfx: "FireSpell", effect: effect};
	},
	"IceBolt": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
		
			KinkyDungeonSendTextMessage(Math.min(spell.power, 5), TextGet("KDEffectWitchBoulder").KDReplaceOrAddDmg(dmg.string), "#ff0000", 1);
			effect = true;
		
			return {sfx: "Freeze", effect: effect};
		}
		return {sfx: "Bones", effect: effect};
	},
	"WitchBoulder": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 1.0, 0.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KDGameData.KneelTurns = 2;
			KinkyDungeonSendTextMessage(Math.min(spell.power, 5), TextGet("KDEffectWitchBoulder").KDReplaceOrAddDmg(dmg.string), "#ff0000", 1);
			effect = true;
			
			return {sfx: "ClangDeep", effect: effect};
		}
		return {sfx: "Miss", effect: effect};
	},
	"Damage": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		if (!dmg.happened) return{sfx: "Shield", effect: false};
		KinkyDungeonSendTextMessage(Math.min(spell.power, 5), TextGet("KinkyDungeonDamageSelf").KDReplaceOrAddDmg(dmg.string), "#ff0000", 1);
		effect = true;
		return {sfx: undefined, effect: effect};
	},

	"SingleChain": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["chainRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["chainRestraints"], faction, false, false, false, false);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleChain").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
				effect = true;
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);

			}
			effect = true;
			return {sfx: "Chain", effect: effect};
		}
		return {sfx: "ArmorHit", effect: effect};
	},
	"SingleMagicBind": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			let restraintAdd = KinkyDungeonGetRestraint({tags: playerEffect.tags}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, playerEffect.tags, faction, false, false, false, false);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingle" + (playerEffect.msg || "Chain")).KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
				effect = true;
			}
			//KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			effect = true;
			return {sfx: playerEffect.sfx || "Chain", effect: effect};
		}
		return {sfx: "ArmorHit", effect: effect};
	},
	
	"RubberBullets": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.5, 0.2)) {
			let dmg = spell.power ? KinkyDungeonDealDamage({damage: playerEffect.power || spell.power, type: playerEffect.damage || spell.damage}, bullet) : {happened: 0, string: "null"};
			if (spell.power && !dmg) return {sfx: "Shield", effect: false};
			if (KDRandom() < 0.25 && KinkyDungeonStatWill < KinkyDungeonStatWillMax/2) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["slimeRestraintsRandom"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["slimeRestraintsRandom"], faction, false, false, false, false);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonRubberBulletsAttach").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
				}
			} else KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonRubberBullets").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
			
			effect = true;
			return {sfx: "RubberBolt", effect: effect};
		}
		return {sfx: "Miss", effect: effect};
	},
	"HeatBlast": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
			KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns || 0, KDGameData.SlowMoveTurns + 2);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonHeatBlast").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time + 1);
			effect = true;
			return {sfx: "Lightning", effect: effect};
		}
		return {sfx: "MetalBang", effect: effect};
	},
	"RobotShock": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonRobotShock").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
			
			effect = true;
			return {sfx: "Shock", effect: effect};
		}
		return {sfx: "Shield", effect: effect};
	},
	"MysticShock": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonMysticShock").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
			
			effect = true;
			return {sfx: "Evil", effect: effect};
		}
		return {sfx: "Shield", effect: effect};
	},
	"CrystalBind": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["crystalRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["crystalRestraints"], faction, false, false, false, false);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
			}//else if (KDGameData.PrisonerState != 'jail' && KDGameData.PrisonerState != 'parole') {
			//KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			//}
			KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonCrystalBind").KDReplaceOrAddDmg( dmg.string), "#ff0000", 3);
			effect = true;
			return {sfx: "MagicSlash", effect: effect};
		}
		return {sfx: "MetalHit", effect: effect};
	},
	"CoronaShock": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 0.5)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["celestialRopes"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["celestialRopes"], faction, false, false, false, false);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
			}// else if (KDGameData.PrisonerState != 'jail' && KDGameData.PrisonerState != 'parole') {
			//KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			//}
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
			//KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonCoronaShock").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
			effect = true;
			return {sfx: "Shock", effect: effect};
		}
		return {sfx: "Shield", effect: effect};
	},
	"RemoveLowLevelRope": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
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
		return {sfx: "", effect: effect};
	},
	"MiniSlime": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") < 0.45 && KDRandom() < 0.33) {
				KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonMiniSlime2").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
			} else
				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonMiniSlime").KDReplaceOrAddDmg( dmg.string), "#ff0000", 1);
			effect = true;
		}

		return {sfx: "RubberBolt", effect: effect};
	},
	"Slime": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.5, 0.5)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") < 0.45) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["slimeRestraintsRandomLight"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["slimeRestraintsRandomLight"], faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					effect = true;
				}
				KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
			}
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSlime").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);

			effect = true;
		}
		return {sfx: "RubberBolt", effect: effect};
	},
	"LiquidMetalPatch": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 1.0, 0.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage, flags: ["EnvDamage"]}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") < 0.45 && (KDGameData.KneelTurns > 0 || KDGameData.SlowMoveTurns || KDGameData.MovePoints < 0 || KinkyDungeonStatWill == 0)) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["liquidMetalRestraints"]}, MiniGameKinkyDungeonLevel + playerEffect?.power || spell?.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["liquidMetalRestraints"], faction);
					effect = true;
				}
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonLiquidMetalSlowEngulf").KDReplaceOrAddDmg( dmg.string), "#aaaaaa", playerEffect.time || 2);
			} else
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonLiquidMetal").KDReplaceOrAddDmg( dmg.string), "#aaaaaa", playerEffect.time || 2);

			effect = true;
		}
		return {sfx: "RubberBolt", effect: effect};
	},
	"LiquidMetalEngulf": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 1.0, 0.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") < 1) {
				let count = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") < 0.45 ? 3 : (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") < 0.75 ? 2 : 1)
				for (let i = 0; i < count; i++) {
					let restraintAdd = KinkyDungeonGetRestraint({tags: ["liquidMetalRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
					if (restraintAdd) {
						KDPlayerEffectRestrain(spell, 1, ["liquidMetalRestraints"], faction);
						KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
						effect = true;
					}
				}
				
				
				KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
			}
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonLiquidMetalEngulf").KDReplaceOrAddDmg( dmg.string), "#aaaaaa", playerEffect.time);

			effect = true;
		}
		return {sfx: "RubberBolt", effect: effect};
	},

	"SporesHappy": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		if (!dmg.happened) return{sfx: "Shield", effect: false};
		KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSporesHappy").KDReplaceOrAddDmg( dmg.string), "#63ab3f", 2);
		effect = true;
		return {sfx: "Damage", effect: effect};
	},
	"Flummox": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Flummox", type: "Flummox", duration: 5, power: 1.0, player: true, mushroom: true, tags: ["overlay", "darkness"]});
			KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonFlummox").KDReplaceOrAddDmg( dmg.string), "#a583ff", 2);
			effect = true;
			return {sfx: "MagicSlash", effect: effect};
		}
		
		return {sfx: "Shield", effect: effect};
	},
	"SporesSick": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		if (!dmg.happened) return{sfx: "Shield", effect: false};
		KinkyDungeonSleepiness += 1.5 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "happygasDamageResist") * 2);
		KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSporesSick").KDReplaceOrAddDmg( dmg.string), "#63ab3f", 2);
		effect = true;
		return {sfx: "Damage", effect: effect};
	},
	"PoisonDagger": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonSendTextMessage(6, TextGet("KDPoisonDagger").KDReplaceOrAddDmg( dmg.string), "#33ff00", 2);
			// TODO make this get more intense over time
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "PoisonDagger", aura: "#22ff44", type: "SleepinessPoison", power: 1, duration: playerEffect.time, player: true, enemies: false, tags: ["sleep"], range: 1.5});
			effect = true;
			return {sfx: "Damage", effect: effect};
		}
		
		return {sfx: "ClangLight", effect: effect};
	},
	"Spores": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		if (!dmg.happened) return{sfx: "Shield", effect: false};
		KinkyDungeonSleepiness = Math.max(KinkyDungeonSleepiness, 6
			* KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "happygasDamageResist") * 2));
		KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSpores").KDReplaceOrAddDmg( dmg.string), "#a583ff", 2);
		return {sfx: "Damage", effect: effect};
	},

	"SlimeTrap": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		let slimeWalker = false;
		for (let inv of KinkyDungeonAllRestraint()) {
			if (KDRestraint(inv).slimeWalk) {
				slimeWalker = true;
				break;
			}
		}
		if (!slimeWalker && KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			
			if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") < 0.45) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["slimeRestraintsRandomLight"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KDPlayerEffectRestrain(spell, 1, ["slimeRestraintsRandomLight"], faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					effect = true;
				}
			}
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSlime").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);

			
			effect = true;
		}
		return {sfx: "RubberBolt", effect: effect};
	},
	"NurseBola": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["nurseCuffRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["nurseCuffRestraints"], faction, false, false, false, false);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonNurseBola").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
				effect = true;
			}
			return {sfx: "Struggle", effect: effect};
		}
		
		return {sfx: "WoodBlock", effect: effect};
	},
	"BanditBola": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
			
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["ropeRestraints"], faction, false, false, false, false);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleRope").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
				effect = true;
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);
			}
			effect = true;
			return {sfx: "Struggle", effect: effect};
		}
		
		return {sfx: "Miss", effect: effect};
	},
	"SingleRope": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["ropeRestraints"], faction, false, false, false, false);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleRope").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
				effect = true;
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);
			}
			effect = true;
			return {sfx: "Struggle", effect: effect};
		}
		
		return {sfx: "Miss", effect: effect};
	},
	"RestrainingDevice": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.2, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
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
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonRestrainingDevice").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
				effect = true;
			} else {
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonRestrainingDeviceStun").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);
			}
			effect = true;
			return {sfx: "FutureLock", effect: effect};
		}
		
		return {sfx: "Clang", effect: effect};
	},
	"Glue": (target, damage, playerEffect, spell, faction, bullet, entity) => {
			
		if (playerEffect.power) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonGlueSlowDamage").KDReplaceOrAddDmg( dmg.string), "yellow", 2);
		}
		let effect = false;
		let added = [];
		let GlueRes = 1;
		if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") >= 0.7) GlueRes = 3;
		else if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") >= 0.35) GlueRes = 2;
		for (let i = 0; i < Math.ceil((playerEffect.count || 1) / GlueRes); i++) {
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
			//KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
			//KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonGlueSlow"), "yellow", playerEffect.time);
			effect = true;
		}
		return {sfx: "RubberHit", effect: effect};
	},
	"RopeEngulf": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		
		
		let effect = false;
		if (KDTestSpellHits(spell, 0.5, 0.5)) {
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
				}
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

			}
			return {sfx: "Struggle", effect: effect};
		}
		
		return {sfx: "Miss", effect: effect};
	},
	"RopeEngulfWeak": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.5, 0.5)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
		
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
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonRopeEngulfWeak").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
				effect = true;
			} else {
				let RopeDresses = ["Leotard", "Bikini", "Lingerie"];
				if (!RopeDresses.includes(KinkyDungeonCurrentDress)) {
					KinkyDungeonSetDress(RopeDresses[Math.floor(Math.random() * RopeDresses.length)], "");
					KinkyDungeonDressPlayer();
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonRopeEngulfDress"), "#ff0000", 3);
					effect = true;
				}
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);

				effect = true;
			}
			return {sfx: "Struggle", effect: effect};
		}
		
		return {sfx: "Miss", effect: effect};
	},
	"VineEngulf": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.5, 0.5)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
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
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonVineEngulf").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
				effect = true;
			} else {
				let RopeDresses = ["GreenLeotard", "Lingerie"];
				if (!RopeDresses.includes(KinkyDungeonCurrentDress) && KinkyDungeonCurrentDress != "Elven") {
					KinkyDungeonSetDress(RopeDresses[Math.floor(Math.random() * RopeDresses.length)], "");
					KinkyDungeonDressPlayer();
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonVineEngulfDress"), "#ff0000", 3);
					effect = true;
				}
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);

				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}
			return {sfx: "Struggle", effect: effect};
		}
		
		return {sfx: "Miss", effect: effect};
	},
	"ObsidianEngulf": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		if (!dmg.happened) return{sfx: "Shield", effect: false};
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
			KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonObsidianEngulf").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
			effect = true;
		} else {
			KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);

		}
		KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
		effect = true;
		return {sfx: "Evil", effect: effect};
	},
	"CharmWraps": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.5, 0.5)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			
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
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonCharmWraps").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
				effect = true;
			} else {
				let CharmDresses = ["Leotard", "Bikini", "Lingerie"];
				if (!CharmDresses.includes(KinkyDungeonCurrentDress) && KinkyDungeonCurrentDress != "Prisoner") {
					KinkyDungeonSetDress(CharmDresses[Math.floor(Math.random() * CharmDresses.length)], "");
					KinkyDungeonDressPlayer();
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCharmWrapsDress"), "#ff0000", 3);
					effect = true;
				}
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);

			}
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			effect = true;
			return {sfx: "MagicSlash", effect: effect};
		}
		
		return {sfx: "Shield", effect: effect};
	},
	"EnchantedArrow": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		
		let effect = false;

		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
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
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonEnchantedArrow").KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
				effect = true;
			} else {
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell").KDReplaceOrAddDmg( dmg.string), "yellow", playerEffect.time);

			}
			effect = true;
			return {sfx: "MagicSlash", effect: effect};
		}
		
		return {sfx: "Miss", effect: effect};
	},
	"TrapBindings": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;

		if (KDTestSpellHits(spell, 0.5, 0.5)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
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
				KinkyDungeonSendTextMessage(6, TextGet(playerEffect.text).KDReplaceOrAddDmg( dmg.string), "#ff0000", 2);
				effect = true;
			} else {
				let PossibleDresses = ["Leotard", "Bikini", "Lingerie"];
				if (!PossibleDresses.includes(KinkyDungeonCurrentDress)) {
					KinkyDungeonSetDress(PossibleDresses[Math.floor(Math.random() * PossibleDresses.length)], "");
					KinkyDungeonDressPlayer();
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonTrapBindingsDress").KDReplaceOrAddDmg( dmg.string), "#ff0000", 3);
					effect = true;
				}
				// else if (!playerEffect.noGuard && KDGameData.PrisonerState != 'jail' && KDGameData.PrisonerState != 'parole') {
				//KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
				//}

			}
			return {sfx: "", effect: effect};
		}
		
		return {sfx: "Miss", effect: effect};
	},
	"NurseSyringe": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg.happened) return{sfx: "Shield", effect: false};
			KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNurseSyringe").KDReplaceOrAddDmg( dmg.string), "#ff0000", 8);
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "NurseSyringe", aura: "#22ff44", type: "SleepinessPoison", power: 1, duration: playerEffect.time, player: true, enemies: false, tags: ["sleep"], range: 1.5});
			effect = true;
			return {sfx: "Damage", effect: effect};
		}
		return {sfx: "Miss", effect: effect};
	},
	"TrapSleepDart": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonTrapSleepDart"), "#ff0000", 8);
		KDStunTurns(Math.round(8 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "poisonDamageResist"))));
		KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, Math.round(8 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "poisonDamageResist"))));
		KinkyDungeonSleepiness = Math.max(KinkyDungeonSleepiness, Math.round(8 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "poisonDamageResist"))));
		KinkyDungeonAlert = 5;
		effect = true;
		return {sfx: "Damage", effect: effect};
	},
	"Drench": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;

		let dmg = (spell.power > 0 && spell.damage == 'acid') ? 
			KinkyDungeonDealDamage({damage: playerEffect.power || spell.power, type: playerEffect.damage || spell.damage}, bullet)
			: {happened: 0, string: TextGet("KDNoDamage")};
		if (!dmg.happened) return{sfx: "Shield", effect: false};

		KinkyDungeonSendTextMessage(4, TextGet("KDEffectDrench").KDReplaceOrAddDmg( dmg.string), "#9999ff", 3);
		for (let b of spell.buffs) {
			if (b.id.includes("Drenched")) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, b);
			}
		}
		return {sfx: "Damage", effect: effect};
	},
	"LustBomb": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.5, 0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg) return {sfx: "Shield", effect: false};
			
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonLustBomb").KDReplaceOrAddDmg( dmg.string), "pink", 4);
			effect = true;
			return {sfx: "Damage", effect: effect};
		}
		
		return {sfx: "Damage", effect: effect};
	},
	"TrapLustCloud": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.5, 0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg) return {sfx: "Shield", effect: false};
			
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonTrapLustCloud").KDReplaceOrAddDmg( dmg.string), "pink", 4);
			effect = true;
			return {sfx: "Damage", effect: effect};
		}
		
		return {sfx: "Damage", effect: effect};
	},
	"TrapSPCloud": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.5, 0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg) return {sfx: "Shield", effect: false};
			
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonTrapSPCloud").KDReplaceOrAddDmg( dmg.string), "yellow", 4);
			effect = true;
			KDGameData.StaminaPause = 10;
			return {sfx: "Damage", effect: effect};
		}
		
		return {sfx: "Damage", effect: effect};
	},


	
	
	"ShadowBind": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.5, 0.5)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg) return {sfx: "Shield", effect: false};
			KinkyDungeonStatBind = Math.max(0, playerEffect.time);
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonShadowBind").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
			effect = true;
			return {sfx: "Evil", effect: effect};
		}
		return {sfx: "Miss", effect: effect};
	},
	"Chill": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		let sfx = "";
		let dmg = {happened: 1, string: TextGet("KDNoDamage")};
		if (playerEffect.power > 0 && !KinkyDungeonFlags.get("chill")) {
			dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
		}
		if (dmg.happened && (KinkyDungeonPlayerBuffs.Drenched || KinkyDungeonPlayerBuffs.Chilled)) {
			sfx = "Freeze";
			KinkyDungeonStatFreeze = Math.max(0, playerEffect.time);
			KinkyDungeonSleepTime = CommonTime() + KinkyDungeonFreezeTime;
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonFreeze").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
		} else {
			sfx = "Bones";
			KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1);
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonChill").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
		}
		KinkyDungeonSetFlag("chill", 1);
		effect = true;
		return {sfx: sfx, effect: effect};
	},
	"Freeze": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, (bullet?.vx || bullet?.vy) ? 0 : 0.5, (bullet?.vx || bullet?.vy) ? 1.0 : 0.5)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg) return {sfx: "Shield", effect: false};
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonFreeze").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
			
			KinkyDungeonStatFreeze = Math.max(0, playerEffect.time);
			KinkyDungeonSleepTime = CommonTime() + KinkyDungeonFreezeTime;
			effect = true;
			return {sfx: "Freeze", effect: effect};
		}

		return {sfx: "Shield", effect: effect};
	},
	"ShadowStrike": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;


		if (KDTestSpellHits(spell, 0.0, 1.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg) return {sfx: "Shield", effect: false};
			effect = true;
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["shadowRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KDPlayerEffectRestrain(spell, 1, ["shadowRestraints"], faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
			}
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpellShadowStrike").KDReplaceOrAddDmg( dmg.string), "#ff0000", 1);
			return {sfx: "Evil", effect: effect};
		}
		return {sfx: "Miss", effect: effect};
	},
	"Shock": (target, damage, playerEffect, spell, faction, bullet, entity) => {
		let effect = false;
		if (KDTestSpellHits(spell, 0.5, 0.0)) {
			let dmg = KinkyDungeonDealDamage({damage: playerEffect?.power || spell?.power || 1, type: playerEffect?.damage || spell?.damage || damage}, bullet);
			if (!dmg) return {sfx: "Shield", effect: false};
				if (Math.round(
					playerEffect.time * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "electricDamageResist"))
				) > 0)
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, Math.round(
					playerEffect.time * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "electricDamageResist"))
				));
				if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "electricDamageResist") < 1)
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonShock").KDReplaceOrAddDmg( dmg.string), "#ff0000", playerEffect.time);
				effect = true;
				return {sfx: "Shock", effect: effect};
			}
		return {sfx: "Crackling", effect: effect};
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
 * @param {string} [Lock]
 * @param {object} [options]
 * @param {boolean} [options.Progressive]
 * @param {boolean} [options.DontPreferWill]
 * @param {boolean} [options.RequireWill]
 * @returns {{r:restraint, v: ApplyVariant}[]}
 */
function KDPlayerEffectRestrain(spell, count, tags, faction, noDeep, bypass, allowEvade = false, allowBlock = false, allowBondageResist = true, Lock, options) {
	let restraintsToAdd = [];
	let player = KinkyDungeonPlayerEntity;
	/*if (allowBlock || allowBondageResist) {
		if ((spell?.power || 0) * 0.5 > KDGameData.Shield) return [];
	}*/
	for (let i = 0; i < count; i++) {
		let restraintAdd = options?.Progressive ? (
			KDChooseRestraintFromListGroupPriWithVariants(
				KDGetRestraintsEligible({tags: tags}, MiniGameKinkyDungeonLevel + (spell?.power || 0), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], bypass, Lock, !options?.DontPreferWill, undefined, false, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true, undefined, {
					ApplyVariants: true,
				}),
				KDRestraintGroupProgressiveOrderFun)
		) : (
			KDGetRestraintWithVariants({tags: tags}, MiniGameKinkyDungeonLevel + (spell?.power || 0), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], bypass, Lock, !options?.DontPreferWill)
		)

		if (!restraintAdd && !options?.RequireWill) {
			restraintAdd = options?.Progressive ? (
				KDChooseRestraintFromListGroupPriWithVariants(
					KDGetRestraintsEligible({tags: tags}, MiniGameKinkyDungeonLevel + (spell?.power || 0), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], bypass, Lock, false, undefined, false, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true, undefined, {
						ApplyVariants: true,
					}),
					KDRestraintGroupProgressiveOrderFun)
			) : (
				KDGetRestraintWithVariants({tags: tags}, MiniGameKinkyDungeonLevel + (spell?.power || 0), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], bypass, Lock, false)
			)
		}
		
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
		}, undefined, spell, Lock);
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
	let blockedAtk = allowBlock && (KDRandom() * AIData.accuracy < (1 - playerBlock) * allowBlock);
	if (!missed && !blockedAtk) {
		return true;
	} else {
		if (missed) {
			if (spell) {
				KinkyDungeonSendEvent("missPlayerSpell", {spell: spell, player: player});
				KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonSpellBindMiss").replace("EnemyName", TextGet("KinkyDungeonSpell" + (spell.name || ""))), "lightgreen", 1);
			}
			KDDamageQueue.push({floater: TextGet("KDMissed"), Entity: {x: player.x - 0.5, y: player.y - 0.5}, Color: "#88ff88", Time: 2, Delay: 0});
		} else if (blockedAtk) {
			if (spell) {
				KinkyDungeonSendEvent("blockPlayerSpell", {spell: spell, player: player});
				KinkyDungeonSendTextMessage(2, TextGet("KinkyDungeonSpellBindBlock").replace("EnemyName", TextGet("KinkyDungeonSpell" + (spell.name || ""))), "lightgreen", 1);
			}
			KDDamageQueue.push({floater: TextGet("KDBlocked"), Entity: {x: player.x - 0.5, y: player.y - 0.5}, Color: "#88ff88", Time: 2, Delay: 0});
		}
		return false;
	}
}

function KinkyDungeonPlayerEffect(target, damage, playerEffect, spell, faction, bullet, entity) {
	if (!playerEffect.name) return;
	if (damage == "inert") return;
	let effect = false;
	let sfx = spell ? spell.hitsfx : undefined;
	if (!sfx) sfx = (playerEffect.power && playerEffect.power < 2) ? "DamageWeak" : "Damage";
	if (playerEffect.hitTag && !KDPlayerHitBy.includes(playerEffect.hitTag)) KDPlayerHitBy.push(playerEffect.hitTag);
	else if (playerEffect.hitTag) return;
	if (!playerEffect.chance || KDRandom() < playerEffect.chance) {
		if (KDPlayerEffects[playerEffect.name]) {
			let ret = KDPlayerEffects[playerEffect.name](target, damage, playerEffect, spell, faction, bullet, entity);
			if (ret.sfx && ret.sfx != "Null") sfx = ret.sfx;
			effect = ret.effect;
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
function KDTripleBuffKill(Name, Target, time, FinalEffect = (target) => KinkyDungeonPassOut(), buffType = "Blindness", FirstEffect = (target) => {}, SecondEffect = (target) => {}, ThirdEffect = (target) => {},) {
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


// @ts-ignore
if (!String.prototype.KDReplaceOrAddDmg) {
	// @ts-ignore
    String.prototype.KDReplaceOrAddDmg = function(dmg, replaceString = "DamageTaken", replaceString2 = "DamageDealt") {
        if (this.includes(replaceString)) return this.replace(replaceString, dmg);
        if (this.includes(replaceString2)) return this.replace(replaceString2, dmg);
        return this + ` (${dmg})`;
    };
}
