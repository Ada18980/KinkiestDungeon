'use strict';

/**
 * @type {Record<string, (damage, playerEffect, spell, faction, bullet) => {sfx: string, effect: boolean}>}
 */
let KDPlayerEffects = {
	"EnvDamage": (damage, playerEffect, spell, faction, bullet) => {
		let dmg = KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
		KinkyDungeonSendTextMessage(Math.min(playerEffect.power, 5), TextGet("KinkyDungeonDamageSelf").replace("DamageDealt", dmg.string), "#ff0000", 1);
		if (dmg.happened) return {sfx: undefined, effect: true}; return {sfx: undefined, effect: false};
	},
	"MaidChastity": (damage, playerEffect, spell, faction, bullet) => {
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
	}
};


function KinkyDungeonPlayerEffect(damage, playerEffect, spell, faction, bullet) {
	if (!playerEffect.name) return;
	let effect = false;
	let sfx = spell ? spell.hitsfx : undefined;
	if (!sfx) sfx = (playerEffect.power && playerEffect.power < 2) ? "DamageWeak" : "Damage";
	if (damage == "inert") return;
	if (playerEffect.hitTag && !KDPlayerHitBy.includes(playerEffect.hitTag)) KDPlayerHitBy.push(playerEffect.hitTag);
	else if (playerEffect.hitTag) return;
	if (!playerEffect.chance || KDRandom() < playerEffect.chance) {
		if (KDPlayerEffects[playerEffect.name]) {
			let ret = KDPlayerEffects[playerEffect.name](damage, playerEffect, spell, faction, bullet);
			if (ret.sfx) sfx = ret.sfx;
			effect = ret.effect;
		} else if (playerEffect.name == "Ampule") {
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSpellShatter" + spell.name), "#ff0000", 1);
			effect = true;
		} else if (playerEffect.name == "AmpuleBlue") {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["latexRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
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
				let dmg = KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
				if (dmg.happened) effect = true;
			}
		} else if (playerEffect.name == "Bind") {
			let restraintAdd = KinkyDungeonGetRestraint({tags: [playerEffect.tag]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
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
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
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
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			let dmg = KinkyDungeonDealDamage({damage: Math.max((spell.aoepower) ? spell.aoepower : 0, spell.power), type: spell.damage}, bullet);
			KinkyDungeonSendTextMessage(Math.min(spell.power, 5), TextGet("KDEffectWitchBoulder").replace("DamageDealt", dmg.string), "#ff0000", 1);
			if (dmg.happened) effect = true;
		} else if (playerEffect.name == "IceBolt") {
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			let dmg = KinkyDungeonDealDamage({damage: Math.max((spell.aoepower) ? spell.aoepower : 0, spell.power), type: spell.damage}, bullet);
			KinkyDungeonSendTextMessage(Math.min(spell.power, 5), TextGet("KDEffectWitchBoulder").replace("DamageDealt", dmg.string), "#ff0000", 1);
			if (dmg.happened) effect = true;
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
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonHairpin"), "#ff0000", playerEffect.time);
			if (spell.power > 0) {
				effect = true;
				KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
			}
			effect = true;
		} else if (playerEffect.name == "MagicRope") {
			let roped = false;
			roped = roped || KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WeakMagicRopeArms"), 0, false, undefined, false, false, undefined, faction) > 0;
			roped = roped || KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WeakMagicRopeLegs"), 0, false, undefined, false, false, undefined, faction) > 0;

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
						KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
						KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
						effect = true;
					}
					//effect = KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("StickySlime"), 0, false, undefined, false, false, undefined, faction) > 0;
					//if (effect) KDSendStatus('bound', "StickySlime", "spell_" + spell.name);
					//KinkyDungeonMovePoints = -1;
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
					KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					effect = true;
				}
				//effect = KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("StickySlime"), 0, false, undefined, false, false, undefined, faction) > 0;
				//if (effect) KDSendStatus('bound', "StickySlime", "spell_" + spell.name);
				KinkyDungeonMovePoints = -1;
			}
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSlime"), "#ff0000", playerEffect.time);

			if (spell.power > 0) {
				effect = true;
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			}
		} else if (playerEffect.name == "MiniSlime") {
			if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") < 0.45 && KDRandom() < 0.33) {
				KinkyDungeonMovePoints = -1;
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
			KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonShock"), "#ff0000", playerEffect.time);
			effect = true;
		} else if (playerEffect.name == "CoronaShock") {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["celestialRopes"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
			}// else if (KDGameData.PrisonerState != 'jail' && KDGameData.PrisonerState != 'parole') {
			//KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			//}
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonCoronaShock"), "#ff0000", playerEffect.time);
			effect = true;
		} else if (playerEffect.name == "CrystalBind") {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["crystalRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
			}//else if (KDGameData.PrisonerState != 'jail' && KDGameData.PrisonerState != 'parole') {
			//KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			//}
			KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonCrystalBind"), "#ff0000", 3);
			effect = true;
		} else if (playerEffect.name == "MysticShock") {
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonMysticShock"), "#ff0000", playerEffect.time);
			if (spell.power > 0) {
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			}
			effect = true;
		} else if (playerEffect.name == "RobotShock") {
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonRobotShock"), "#ff0000", playerEffect.time);
			if (spell.power > 0) {
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			}
			effect = true;
		} else if (playerEffect.name == "HeatBlast") {
			KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, playerEffect.time);
			KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
			KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns || 0, KinkyDungeonSlowMoveTurns + 2);
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonHeatBlast"), "#ff0000", playerEffect.time + 1);
			if (spell.power > 0) {
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			}
			effect = true;
		}  else if (playerEffect.name == "RubberBullets") {
			if (KDRandom() < 0.25 && KinkyDungeonStatWill < KinkyDungeonStatWillMax/2) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["slimeRestraintsRandom"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonRubberBulletsAttach"), "#ff0000", 2);
				}
			} else KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonRubberBullets"), "#ff0000", 2);
			if (spell.power > 0) {
				KinkyDungeonDealDamage({damage: KinkyDungeonStatWill < KinkyDungeonStatWillMax/2 ? spell.power : spell.power*1.5, type: spell.damage}, bullet);
			}
			effect = true;
		} else if (playerEffect.name == "SingleChain") {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["chainRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleChain"), "#ff0000", playerEffect.time);
				effect = true;
			} else {
				KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}

		} else  if (playerEffect.name == "SingleMagicChain") {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["chainRestraintsMagic"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleChain"), "#ff0000", playerEffect.time);
				effect = true;
			}

		} else if (playerEffect.name == "Spores") {
			KinkyDungeonSleepiness = Math.max(KinkyDungeonSleepiness, 6);
			KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSpores"), "#a583ff", 2);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			effect = true;
		} else if (playerEffect.name == "PoisonDagger") {
			KinkyDungeonSendTextMessage(6, TextGet("KDPoisonDagger"), "#green", 2);
			KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "PoisonDagger", aura: "#22ff44", type: "Sleepiness", power: 1, duration: playerEffect.time, player: true, enemies: false, tags: ["sleep"], range: 1.5});
			effect = true;
		} else if (playerEffect.name == "SporesSick") {
			KinkyDungeonSleepiness += 1.5;
			KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSporesSick"), "#63ab3f", 2);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			effect = true;
		} else if (playerEffect.name == "Flummox") {
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "Flummox", type: "Flummox", duration: 5, power: 1.0, player: true, mushroom: true, tags: ["overlay", "darkness"]});
			KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonFlummox"), "#a583ff", 2);
			KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
			effect = true;
		} else if (playerEffect.name == "NurseBola") {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["nurseCuffRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction)) {
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonNurseBola"), "#ff0000", playerEffect.time);
				effect = true;
			}

		} else if (playerEffect.name == "SingleRope" || playerEffect.name == "BanditBola") {
			if (playerEffect.name == "BanditBola") {
				KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
			}
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
			if (restraintAdd) {
				KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction);
				KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSingleRope"), "#ff0000", playerEffect.time);
				effect = true;
			} else {
				KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}

		} else if (playerEffect.name == "RestrainingDevice") {
			let added = [];
			for (let i = 0; i < playerEffect.count; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["hitechCables"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction)) {
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
				KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonRestrainingDeviceStun"), "yellow", playerEffect.time);
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}

		} else if (playerEffect.name == "Glue") {
			let added = [];
			if (KinkyDungeonLastAction == "Move")
				for (let i = 0; i < playerEffect.count; i++) {
					let restraintAdd = KinkyDungeonGetRestraint({tags: ["glueRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
					if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction)) {
						KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
						added.push(restraintAdd);
						effect = true;
					}
				}
			if (added.length > 0) {
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonGlue"), "yellow", 2);
				effect = true;
			} else {
				KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonGlueSlow"), "yellow", playerEffect.time);
				if (playerEffect.power) {
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonGlueSlowDamage").replace("DamageDealt", playerEffect.power), "yellow", 2);
					KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
				} else KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonGlueSlow"), "yellow", playerEffect.time);
				effect = true;
			}

		} else if (playerEffect.name == "RopeEngulf") {
			let added = [];
			for (let i = 0; i < playerEffect.power; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeMagicStrong", "ropeAuxiliary", "clothRestraints", "tapeRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction)) {
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
					if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction)) {
						KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
						KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonRopeEngulf"), "#ff0000", 2);
						effect = true;
					} else {
						let buff1 = {id: "KrakenEngulf", type: "Blindness", duration: 8, power: 1.0, player: true, tags: []};
						let buff2 = {id: "KrakenEngulf2", type: "Blindness", duration: 8, power: 2.0, player: true, tags: []};
						let buff3 = {id: "KrakenEngulf3", type: "Blindness", duration: 8, power: 4.0, player: true, tags: []};
						if (KinkyDungeonPlayerBuffs[buff3.id]) {
							KinkyDungeonPassOut();
						} else if (KinkyDungeonPlayerBuffs[buff2.id]) {
							KinkyDungeonSendTextMessage(9, TextGet("KinkyDungeonRopeEngulfEnd3"), "#ff0000", 4);
							KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, buff1);
							KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, buff2);
							KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, buff3);
						}  else if (KinkyDungeonPlayerBuffs[buff1.id]) {
							KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonRopeEngulfEnd2"), "#ff0000", 4);
							KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, buff1);
							KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, buff2);
						} else {
							KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonRopeEngulfEnd1"), "#ff0000", 4);
							KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, buff1);
						}
					}

					//KinkyDungeonSetFlag("kraken", 4);
				}
			}
		} else if (playerEffect.name == "RopeEngulfWeak") {
			let added = [];
			for (let i = 0; i < playerEffect.power; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["ropeRestraints", "ropeRestraints2", "ropeRestraintsWrist"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction)) {
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
					KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);
					KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
					effect = true;
				}
			}
		} else if (playerEffect.name == "VineEngulf") {
			let added = [];
			for (let i = 0; i < playerEffect.power; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["vineRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction)) {
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
					KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);
					KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
					effect = true;
				}
			}
		}  else if (playerEffect.name == "ObsidianEngulf") {
			let added = [];
			for (let i = 0; i < playerEffect.count; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["obsidianRestraints"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction)) {
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					added.push(restraintAdd);
					effect = true;
				}
			}
			if (added.length > 0) {
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonObsidianEngulf"), "#ff0000", 2);
				effect = true;
			} else {
				KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}
		} else if (playerEffect.name == "CharmWraps") {
			let added = [];
			for (let i = 0; i < playerEffect.power; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["ribbonRestraintsLight"]}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction)) {
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
					KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);
					KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
					effect = true;
				}
			}
		} else if (playerEffect.name == "EnchantedArrow") {
			let added = [];
			for (let i = 0; i < playerEffect.count; i++) {
				let ropeRests = ["mithrilRope"];
				if (KinkyDungeonStatStamina < KinkyDungeonStatStamina * 0.25) {
					ropeRests.push("mithrilRopeHogtie");
				}
				let restraintAdd = KinkyDungeonGetRestraint({tags: ropeRests}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction)) {
					KDSendStatus('bound', restraintAdd.name, "spell_" + spell.name);
					added.push(restraintAdd);
					effect = true;
				}
			}
			if (added.length > 0) {
				KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonEnchantedArrow"), "#ff0000", 2);
				effect = true;
			} else {
				KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1); // This is to prevent stunlock while slowed heavily
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonSlowedBySpell"), "yellow", playerEffect.time);
				KinkyDungeonDealDamage({damage: spell.power, type: spell.damage}, bullet);
				effect = true;
			}

		} else if (playerEffect.name == "TrapBindings") {
			let added = [];
			for (let i = 0; i < playerEffect.count; i++) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: playerEffect.tags}, MiniGameKinkyDungeonLevel + spell.power, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd && KinkyDungeonAddRestraintIfWeaker(restraintAdd, spell.power, false, undefined, false, false, undefined, faction)) {
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
				if (playerEffect.power > 0 && playerEffect.damage) {
					KinkyDungeonDealDamage({damage: playerEffect.power, type: playerEffect.damage}, bullet);
				}
			}
		} else if (playerEffect.name == "NurseSyringe") {
			KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNurseSyringe"), "#ff0000", 8);
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "NurseSyringe", aura: "#22ff44", type: "Sleepiness", power: 1, duration: playerEffect.time, player: true, enemies: false, tags: ["sleep"], range: 1.5});
			effect = true;
		} else if (playerEffect.name == "TrapSleepDart") {
			KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonTrapSleepDart"), "#ff0000", 8);
			KinkyDungeonSlowMoveTurns = 8;
			KinkyDungeonStatBlind = 8;
			KinkyDungeonSleepiness = 8;
			KinkyDungeonAlert = 5;
			effect = true;
		} else if (playerEffect.name == "Drench") {
			KinkyDungeonSendTextMessage(4, TextGet("KDEffectDrench"), "#9999ff", 3);
			for (let b of spell.buffs) {
				if (b.id.includes("Drenched")) {
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, b);
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
				KinkyDungeonMovePoints = Math.max(-1, KinkyDungeonMovePoints-1);
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

	if (sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "/Audio/" + sfx + ".ogg");
	if (effect) KinkyDungeonInterruptSleep();

	return effect;
}