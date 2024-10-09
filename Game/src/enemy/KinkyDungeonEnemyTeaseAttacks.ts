"use strict";

let KDTeaseAttackLists: KDTeaseAttackListsType = {
	Basic: [
		"SquishBreast",
		"LeashGrab",
		"SpankButt",
		"TickleArmpits",
		"TickleFeet",
		"Headpat",
		"ShoulderMassage",
		"Praise",
		"SqueezeButt",
		"VibeToy",
		"InsertToy",
		"AddStuffing",
		"AddGag",
		"Disarm",
		"Pickpocket",
		/*,
		"AddCarabiner",*/
	],
};

let KDTeaseAttacks: KDTeaseAttacksType = {
	Praise: {
		name: "Praise",
		priority: 1,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			return KDBasicTeaseAttack(enemy, player)
				&& KDEnemyCanTalk(enemy)
				&& (
					KinkyDungeonGoddessRep.Ghost + 50 >= 75
				);
		},
		apply: (enemy, _player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*(0.5 + 1.5 * (KinkyDungeonGoddessRep.Ghost + 50)/100), type: "soul"});
			let index = Math.floor(Math.random() * 3);
			let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/DamageWeak.ogg");
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + index)
				.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 3);

			if (dmg.happened) {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_Praise")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_Praise")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},
	SquishBreast: {
		name: "SquishBreast",
		priority: 1,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			return KDBasicTeaseAttack(enemy, player)
				&& !KDPlayerFacingAway(player, enemy)
				&& (
					KinkyDungeonFlags.get("armspell")
					|| (enemy.playWithPlayer && !KinkyDungeonAggressive(enemy))
				)
				&& KDHasArms(enemy)
				&& !KDIsDisarmed(enemy);
		},
		apply: (enemy, _player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*1, type: "grope"});
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Grope.ogg");
			KinkyDungeonSetFlag("grope", 4);
			if (dmg.happened) {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_SquishBreast" + (KinkyDungeonLastAction == "Cast" ? "Cast" : ""))
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_SquishBreast")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},
	SpankButt: {
		name: "SpankButt",
		priority: 2,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			return KDBasicTeaseAttack(enemy, player)
				&& (
					KinkyDungeonFlags.get("legspell")
					|| (KDPlayerFacingAway(player, enemy) && KinkyDungeonFlags.get("sprint"))
				)
				&& KDHasArms(enemy)
				&& !KDIsDisarmed(enemy);
		},
		apply: (enemy, player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			KinkyDungeonSetFlag("spank", 4);
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*1.5, type: "grope"});
			if (!(blocked || evaded))
				KinkyDungeonChangeDistraction(1*damagemod, false, 0.25);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Slap.ogg");
			if (!(blocked || evaded))
				KDChangeBalance(damagemod * (KDBaseBalanceDmgLevel + KDGameData.HeelPower) / KDBaseBalanceDmgLevel * 0.5*-KDBalanceDmgMult() * 1.5*KDFitnessMult(), true);
			if (dmg.happened) {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_SpankButt" + ( (KDPlayerFacingAway(player, enemy) && KinkyDungeonFlags.get("sprint")) ? "Sprint" : ""))
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_SpankButt")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},
	VibeToy: {
		name: "VibeToy",
		priority: 1.25,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			return KDBasicTeaseAttack(enemy, player)
				&& !KDPlayerFacingAway(player, enemy)
				&& !KDIsDisarmed(enemy)
				&& KDHasArms(enemy)
				&& (
					(KDPlayerIsSlowed()
					|| (enemy.playWithPlayer && !KinkyDungeonAggressive(enemy) && !KDPlayerFacingAway(player, enemy)))
					&& KDGetVibeToys(enemy).length > 0
					&& 1*KinkyDungeonChastityMult() < 1.5
				);
		},
		apply: (enemy, _player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*(1.5 - 1*KinkyDungeonChastityMult()), type: "charm"});
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Vibe.ogg");
			let toys = KDGetVibeToys(enemy);
			let toy = (toys.length > 0) ? toys[Math.floor(KDRandom() * toys.length)] : "";
			KinkyDungeonSetFlag("buzz", 4);
			if (dmg.happened) {
				// Half of it bypasses
				KinkyDungeonTeaseLevel += 1;
				KinkyDungeonTeaseLevelBypass += 1;
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_VibeToy" + (KDPlayerIsSlowed() ? "Slow" : ""))
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string)
						.replace("VTY", TextGet("Restraint"+toy)),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_VibeToy")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("VTY", TextGet("Restraint"+toy))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},
	InsertToy: {
		name: "InsertToy",
		priority: 3,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			return KDBasicTeaseAttack(enemy, player)
				&& !KinkyDungeonIsSlowed(enemy)
				&& !KDIsDisarmed(enemy)
				&& KDHasArms(enemy)
				&& (
					KDGetVibeToys(enemy).length > 0
					&& KDGetVibeToys(enemy).some((toy) => {
						return KDCanAddRestraint(KDRestraint({name: toy}), false, "", true, undefined, false, true);
					})
					&& (KDPlayerIsStunned() != false || (KDPlayerFacingAway(player, enemy) && !KinkyDungeonCanStand())
						|| (enemy.playWithPlayer && !KinkyDungeonAggressive(enemy) && KDPlayerFacingAway(player, enemy))
					)
				);
		},
		apply: (enemy, _player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			KinkyDungeonSetFlag("insert", 4);
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*1, type: "pierce"});
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Grope.ogg");
			let toys = KDGetVibeToys(enemy).filter((toy) => {
				return KDCanAddRestraint(KDRestraint({name: toy}), false, "", true, undefined, false, true);
			});
			let selected = (toys.length > 0) ? toys[Math.floor(KDRandom() * toys.length)] : "";
			if (dmg.happened && KinkyDungeonAddRestraintIfWeaker(selected, 0, false, "", true)) {
				enemy.items.splice(enemy.items.indexOf(selected), 1);
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_InsertToy")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string)
						.replace("VTY", TextGet("Restraint"+selected)),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_InsertToy")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("VTY", TextGet("Restraint"+selected))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},
	AddStuffing: {
		name: "AddStuffing",
		priority: 3,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			return KDBasicTeaseAttack(enemy, player)
				&& !KinkyDungeonIsSlowed(enemy)
				&& !KDIsDisarmed(enemy)
				&& KDHasArms(enemy)
				&& (
					!KDPlayerFacingAway(player, enemy)
					&& KinkyDungeonFlags.get("verbalspell")
					&& KDCanAddRestraint(KDRestraint({name: "Stuffing"}), false, "", true, undefined, false, true)
				);
		},
		apply: (enemy, _player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*1, type: "chain"});
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Struggle.ogg");
			let selected = "Stuffing";
			KinkyDungeonSetFlag("stuff", 4);
			if (dmg.happened && KinkyDungeonAddRestraintIfWeaker(selected, 0, false, "", true)) {

				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_AddStuffing")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string)
						.replace("VTY", TextGet("Restraint"+selected)),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_AddStuffing")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("VTY", TextGet("Restraint"+selected))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},
	AddGag: {
		name: "AddGag",
		priority: 4,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			if (KDBasicTeaseAttack(enemy, player)
				&& !KinkyDungeonIsSlowed(enemy)
				&& !KDIsDisarmed(enemy)
				&& KDHasArms(enemy)
				&& (
					KinkyDungeonFlags.get("verbalspell")
					&& KinkyDungeonPlayerTags.get("GagNecklance")
				)) {
				let gagType = KDGetNecklaceGagType(KDPlayer()) || "TrapGag";

				if (KDCanAddRestraint(KDRestraint({name: gagType}), false, "", true, undefined, false, true)) {
					return true;
				}
			}
			return false;
		},
		apply: (enemy, _player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*1, type: "chain"});
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Struggle.ogg");
			let selected = KDGetNecklaceGagType(KDPlayer()) || "TrapGag";


			KinkyDungeonSetFlag("stuff", 4);
			if (dmg.happened && KinkyDungeonAddRestraintIfWeaker(selected, 0, false, "", true)) {

				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_AddGag")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string)
						.replace("VTY", TextGet("Restraint"+selected)),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_AddGag")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("VTY", TextGet("Restraint"+selected))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},
	SqueezeButt: {
		name: "SqueezeButt",
		priority: 1,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			return KDBasicTeaseAttack(enemy, player)
				&& (
					KinkyDungeonFlags.get("legspell")
					|| (KDPlayerFacingAway(player, enemy) && KDPlayerIsStunned())
					|| (enemy.playWithPlayer && !KinkyDungeonAggressive(enemy) && KDPlayerFacingAway(player, enemy))
				)
				&& KDHasArms(enemy)
				&& !KDIsDisarmed(enemy);
		},
		apply: (enemy, player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*0.5, type: "grope"});
			if (!(blocked || evaded))
				KinkyDungeonChangeDistraction(1*damagemod, false, 0.25);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Grope.ogg");
			KinkyDungeonSetFlag("grope", 4);
			if (dmg.happened) {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_SqueezeButt" + (KinkyDungeonLastAction == "Move" ? "Move" : ((KDPlayerFacingAway(player, enemy) && KDPlayerIsStunned()) ? "Behind" : "")))
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_SqueezeButt")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},
	ShoulderMassage: {
		name: "ShoulderMassage",
		priority: 1,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			return KDBasicTeaseAttack(enemy, player)
				&& (
					(KDPlayerFacingAway(player, enemy) || KinkyDungeonCanStand())
					&& (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax * 0.2
						|| (enemy.playWithPlayer && !KinkyDungeonAggressive(enemy)))
					&& KDistEuclidean(player.x - enemy.x, player.y - enemy.y) < 1.1 // Only adjacent
					&& KinkyDungeonFlags.get("armspell")
				)
				&& KDHasArms(enemy)
				&& !KDIsDisarmed(enemy);
		},
		apply: (enemy, _player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*2, type: "plush"});
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Grope.ogg");
			KinkyDungeonSetFlag("soft", 4);
			if (dmg.happened) {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_ShoulderMassage")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_ShoulderMassage")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},
	Headpat: {
		name: "Headpat",
		priority: 2,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			return KDBasicTeaseAttack(enemy, player)
				&& (
					!KinkyDungeonCanStand()
					|| KinkyDungeonFlags.get("miscast")
					|| (enemy.playWithPlayer && !KinkyDungeonAggressive(enemy))
				)
				&& KDHasArms(enemy)
				&& !KDIsDisarmed(enemy);
		},
		apply: (enemy, _player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			KinkyDungeonSetFlag("headpat", 4);
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*(2 - 1.9*(KinkyDungeonGoddessRep.Ghost + 50)/100), type: "plush"});
			if ((KinkyDungeonGoddessRep.Ghost + 50)/100 > 0)
				if (!(blocked || evaded))
					KinkyDungeonChangeDistraction((KinkyDungeonGoddessRep.Ghost + 50)/100 * 2*damagemod, false, 0.5);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Grope.ogg");
			if (dmg.happened) {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_Headpat" + (KinkyDungeonLastAction == "Cast" ? "Cast" : ""))
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_Headpat")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},
	TickleArmpits: {
		name: "TickleArmpits",
		priority: 1,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			return KDBasicTeaseAttack(enemy, player)
				&& (
					KinkyDungeonFlags.get("armspell")
					|| (KinkyDungeonFlags.get("armattack") && KDPlayerFacingAway(player, enemy))
					|| (enemy.playWithPlayer && !KinkyDungeonAggressive(enemy) && KDPlayerFacingAway(player, enemy))
				)
				&& KDHasArms(enemy)
				&& !KDIsDisarmed(enemy);
		},
		apply: (enemy, player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*1, type: "tickle"});
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Tickle.ogg");
			KinkyDungeonSetFlag("tickle", 4);
			if (dmg.happened) {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_TickleArmpits" + ((enemy.playWithPlayer && !KinkyDungeonAggressive(enemy) && KDPlayerFacingAway(player, enemy)) ? "" : "Raised"))
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_TickleArmpits")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},
	TickleFeet: {
		name: "TickleFeet",
		priority: 2,
		blockable: true, dodgeable: true,
		filter: (enemy, player, _aiData) => {
			return KDBasicTeaseAttack(enemy, player)
				&& (
					KinkyDungeonFlags.get("legspell")
					|| (KinkyDungeonLastAction == "Move" && KDPlayerFacingAway(player, enemy) && !KinkyDungeonCanStand())
				)
				&& !KinkyDungeonPlayerTags.get("BootsArmor")
				&& !KinkyDungeonPlayerTags.get("Boots")
				&& KDHasArms(enemy)
				&& !KDIsDisarmed(enemy);
		},
		apply: (enemy, player, _aiData, blocked, evaded, damagemod) => {
			KinkyDungeonSetEnemyFlag(enemy, "teaseAtkCD", (enemy.Enemy?.attackPoints*2) || 4);
			KinkyDungeonSetFlag("globalteaseAtkCD", 2);
			let strip = false;
			if (player.player) {
				let CurrentDress = KinkyDungeonCurrentDress;
				let DressList = KDGetDressList()[CurrentDress];
				for (let clothes of DressList) {
					if (!clothes.Lost && (clothes.Group == "Shoes" || (
						StandalonePatched && ModelDefs[clothes.Item]?.Categories?.includes("Shoes")
					))) {
						clothes.Lost = true;
						strip = true;
					}
				}
			}
			let dmg = (blocked || evaded) ? {string: "", happened: 0} :  KinkyDungeonDealDamage({damage: damagemod*2, type: "tickle"});
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Tickle.ogg");
			KinkyDungeonSetFlag("tickle", 4);
			if (dmg.happened) {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_TickleFeet" + ((strip) ? "Remove" : ""))
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						.replace("DMGDLT", dmg.string),
					"#ff9999", 1);
			} else {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttackResist_TickleFeet")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
						+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
					"#ff9999", 1);
			}

			return true;
		},
	},

	Disarm: {
		name: "Disarm",
		priority: 10,
		blockable: true, dodgeable: true,
		filter: (enemy, player, aiData) => {
			if (KDistChebyshev(enemy.x - player.x, enemy.y - player.y) < 1.5
				&& !KinkyDungeonIsSlowed(enemy)
				&& (
					aiData.attack.includes("Bind")
					&& enemy.Enemy.disarm
					&& KinkyDungeonFlags.get("disarmFlagVulnerable")
					&& KinkyDungeonFlags.get("disarmFlagVulnerable") != 3
				)
				&& !KDIsDisarmed(enemy)) {
				return true;
			}
			return false;
		},
		apply: (enemy, _player, _aiData, blocked, evaded, _damagemod) => {
			if (!blocked && !evaded) {
				// Easier to evase harness grabs
				KinkyDungeonDisarm(enemy);
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Grope.ogg");
				KinkyDungeonSendTextMessage(4,
					TextGet("KDTeaseAttack_Disarm")
						.replace("ENMY", TextGet("Name" + enemy.Enemy.name)),
					"#ff9999", 1);
				return true;
			}
			KinkyDungeonSendTextMessage(4,
				TextGet("KDTeaseAttackResist_Disarm")
					.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
				+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
				"#ff9999", 1);
			return false;
		}
	},
	Pickpocket: {
		name: "Pickpocket",
		priority: 9,
		blockable: true, dodgeable: true,
		filter: (enemy, player, aiData) => {
			if (KDistChebyshev(enemy.x - player.x, enemy.y - player.y) < 1.5
				&& !KinkyDungeonIsSlowed(enemy)
				&& (
					player.player && aiData.attack.includes("Bind") && KDCanPickpocketPlayer(player) && !KDEnemyHasFlag(enemy, "nosteal")
					&& !enemy.Enemy.nopickpocket && KDMapData.KeysHeld==0 && KDCanPickpocket(enemy)
				) && KDPlayerIsStunned() &&
				(
					((KDIsPlayerTethered(KinkyDungeonPlayerEntity) || KinkyDungeonSlowLevel > 9) && KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed
							&& KinkyDungeonIsArmsBound())
					|| (KDGameData.KinkyDungeonLeashedPlayer < 1 && aiData.playerItems.length > 0 && aiData.playerItems.length > 0
						&& KinkyDungeonIsArmsBound() && (KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.05))
					|| (KDGameData.KinkyDungeonLeashedPlayer < 1 && KinkyDungeonItemCount("Pick") > 0)
					|| (KDGameData.KinkyDungeonLeashedPlayer < 1 && KinkyDungeonItemCount("RedKey") > 0)
					|| (KDGameData.KinkyDungeonLeashedPlayer < 1 && KinkyDungeonItemCount("BlueKey") > 0)
				)
				&& KDHasArms(enemy)
				&& !KDIsDisarmed(enemy)) {
				return true;
			}
			return false;
		},
		apply: (enemy, _player, aiData, blocked, evaded, _damagemod) => {
			if (!blocked && !evaded) {

				let item = aiData.playerItems.length > 0 ? aiData.playerItems[Math.floor(KDRandom() * aiData.playerItems.length)] : undefined;
				let picked = false;
				// If the player's location is trapped she will get disarmed
				if ((KDIsPlayerTethered(KinkyDungeonPlayerEntity) || KinkyDungeonSlowLevel > 9) && KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed
					&& KinkyDungeonIsArmsBound() && KDRandom() < 0.5) {
					// Disarm the player
					KinkyDungeonDisarm(enemy, "Leash");
					picked = true;
				} else if (KDGameData.KinkyDungeonLeashedPlayer < 1 && item && aiData.playerItems.length > 0
					&& KinkyDungeonIsArmsBound() && ((!KinkyDungeonPlayerDamage || item.name != KinkyDungeonPlayerDamage.name) || KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.05) && KDRandom() < 0.5) {
					if (item.type == Weapon) {
						if (KDWeapon(item)?.name == KinkyDungeonPlayerDamage?.name)
							KinkyDungeonDisarm(enemy, "Leash");
						else
							KinkyDungeonInventoryRemove(item);
						//KinkyDungeonAddLostItems([item], false);
						if (!enemy.items) enemy.items = [item.name];
						else if (!enemy.items.includes(item.name))
							enemy.items.push(item.name);
					} else if (item.type == Consumable) {
						KinkyDungeonChangeConsumable(KinkyDungeonConsumables[item.name], -1);
						let item2: item = Object.assign({}, item);
						//KinkyDungeonAddLostItems([item2], false);
						item2.quantity = 1;
						if (!enemy.items) enemy.items = [item.name];
						enemy.items.push(item.name);
					}
					if (item) {
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStealItem").replace("ITEMSTOLEN", KDGetItemName(item)), "yellow", 2);
						picked = true;
					}
				} else if (KDGameData.KinkyDungeonLeashedPlayer < 1 && KinkyDungeonItemCount("Pick") > 0 && KDRandom() < 0.5) {
					KDAddConsumable("Pick", -1);
					KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonStealPick"), "yellow", 2);
					if (!enemy.items) enemy.items = ["Pick"];
					enemy.items.push("Pick");
					picked = true;
				} else if (KDGameData.KinkyDungeonLeashedPlayer < 1 && KinkyDungeonItemCount("RedKey") > 0) {
					KDAddConsumable("RedKey", -1);
					KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonStealRedKey"), "yellow", 2);
					if (!enemy.items) enemy.items = ["RedKey"];
					enemy.items.push("RedKey");
					picked = true;
				} else if (KDGameData.KinkyDungeonLeashedPlayer < 1 && KinkyDungeonItemCount("BlueKey") > 0) {
					KDAddConsumable("BlueKey", -1);
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
					KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Grope.ogg");
					KinkyDungeonSetFlag("pickpocket", 1);
					if (KDRandom() < actionDialogueChanceIntense)
						KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Pickpocket").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 1);

					return true;
				}
			}
			KinkyDungeonSendTextMessage(4,
				TextGet("KDTeaseAttackResist_Pickpocket")
					.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
				+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
				"#ff9999", 1);
			return false;
		}
	},
	LeashGrab: {
		name: "LeashGrab",
		priority: 6,
		blockable: true, dodgeable: true,
		filter: (enemy, player, aiData) => {
			if (KDBasicTeaseAttack(enemy, player, true)
				&& !KinkyDungeonIsSlowed(enemy)
				&& (
					aiData.attack.includes("Bind")
					&& enemy.Enemy.bound
					&& KDGameData.MovePoints > -1
					&& KinkyDungeonTorsoGrabCD < 1
					&& (KinkyDungeonLastAction == "Move" || KinkyDungeonLastAction == "Cast")
				)
				&& KDHasArms(enemy)
				&& !KDIsDisarmed(enemy)) {
				let caught = false;
				for (let tile of enemy.warningTiles) {
					if (enemy.x + tile.x == player.x && enemy.y + tile.y == player.y) {
						caught = true;
						break;
					}
				}
				if (caught) {
					let list = KinkyDungeonAllRestraintDynamic();
					for (let restraint of list) {
						if (KDRestraint(restraint.item) && KDRestraint(restraint.item).harness) {
							return true;
						}
					}
				}
			}

			return false;
		},
		apply: (enemy, _player, _aiData, blocked, evaded, _damagemod) => {
			if (!blocked && !evaded) {
				// Easier to evase harness grabs
				let harnessChance = 0;
				let harnessRestraintName = "";
				let list = KinkyDungeonAllRestraintDynamic();
				let list2 = [];
				for (let restraint of list) {
					if (KDRestraint(restraint.item) && KDRestraint(restraint.item).harness) {
						harnessChance += 1;
						list2.push(restraint.item.name);
					}
				}
				let rest = list2[Math.floor(KDRandom() * list2.length)];
				if (rest) harnessRestraintName = rest;

				if (harnessChance > 0) {
					let roll = KDRandom();
					let bonus = 0;
					if (KDForcedToGround() || !KinkyDungeonCanStand()) bonus += KinkyDungeonTorsoGrabChanceBonus;
					if (KinkyDungeonStatWill < 0.01) bonus += KinkyDungeonTorsoGrabChanceBonus*2;
					for (let T = 0; T < harnessChance; T++) {
						roll = Math.min(roll, KDRandom());
					}
					if (roll < KinkyDungeonTorsoGrabChance + bonus) {
						KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
						let msg = TextGet("KinkyDungeonTorsoGrab").replace("RestraintName", KDGetItemNameString(harnessRestraintName)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name));

						KinkyDungeonSendTextMessage(5, msg, "#ff8933", 1);

						if (KDRandom() < actionDialogueChance)
							KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "") + "Grab").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 2, 4);

						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Grab.ogg", enemy);
						KinkyDungeonTorsoGrabCD = 3;
						KinkyDungeonSetFlag("grabbed", 3);
						return true;
					}
				}
			}
			KinkyDungeonSendTextMessage(4,
				TextGet("KDTeaseAttackResist_LeashGrab")
					.replace("ENMY", TextGet("Name" + enemy.Enemy.name))
				+ TextGet("ResistType" + (blocked ? "Block" : (evaded ? "Dodge" : ""))),
				"#ff9999", 1);
			return false;
		}
	}
};
