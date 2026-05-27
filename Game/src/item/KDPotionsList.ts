
let KDPotionTypes: Record<string, PotionEffect> = {
	Strength: {
		playerEffect: (inv, quantity, user, target, tx, ty) => {
			KinkyDungeonSendActionMessage(7, TextGet("KDUseSelf_" + KDConsumable(inv).contains),
			KDBaseMint, 2);
			KinkyDungeonApplyBuffToEntity(target,
				{id: "PotionStrength", aura: "#ff8800", type: "BoostStruggle_Struggle", duration: 50, power: 0.05,
					events: [
						{trigger: "beforePlayerAttack", type: "BoostDamage", prereq: "damageType", kind: "melee", power: 2},
						{trigger: "calcDisplayDamage", type: "BoostDamage", prereq: "damageType", kind: "melee", power: 2},
						{type: "StruggleBonusUpTo", power: 0.15, StruggleType: "Struggle", trigger: "calcEscapePenalty",
							msg: "KinkyDungeonSpellStrengthStruggle"}
					],
					tags: ["struggle"]},
			);

			return { success: true, consumed: quantity, time: 1, componentfailure: "", miscast: false,
				affected: [target],
			};
		},
		entityEffect: (inv, quantity, user, target, tx, ty) => {
			// buff NPC strength if possible
			if (target.Enemy?.attack?.includes("Melee")) {

				if (KDFactionFavorable(KDGetFaction(user), KDGetFaction(target))
					|| (user == KDPlayer() && KDGetModifiedOpinionID(target.id) > 0)) {
						KinkyDungeonSendActionMessage(7, TextGet("KDUseTarget_" + KDConsumable(inv).contains)
						.replace("${Target}", KDEnemyName(target)),
						KDBaseMint, 2);
						KinkyDungeonApplyBuffToEntity(target,
							{id: "PotionStrength", aura: "#ff8800",
								type: "StrugglePower", duration: 50, power: 0.5,
								tags: ["struggle"]},
						);
						if (KinkyDungeonMeleeDamageTypes.includes(target.Enemy.dmgType || "grope")) {
							KinkyDungeonApplyBuffToEntity(target,
								{id: "PotionStrength2",
									type: "AttackDmg", duration: 50, power: 2.0,
									tags: ["struggle"]},
							);
						}

					return {success: true, consumed: 1, time: 1, componentfailure: "", miscast: false,
						affected: [target],
					};
				} else {
					KinkyDungeonSendActionMessage(7, TextGet("KDUseTargetRefusePotion")
						.replace("${Target}", KDEnemyName(target)),
						KDBaseMint, 2);

					return {success: false, consumed: 0, time: 0, componentfailure: "", miscast: false,
						affected: [],
					};
				}
			} else {
				KinkyDungeonSendActionMessage(7, TextGet("KDInvalidTarget_" + KDConsumable(inv).contains),
				KDBaseOrange, 1);
				return {success: false, consumed: 0, time: 0, componentfailure: "", miscast: false, affected: []};
			}
		},
		tileEffect: (inv, quantity, user, target, tx, ty) => {
			KinkyDungeonSendActionMessage(7, TextGet("KDUseTile_" + KDConsumable(inv).contains),
				KDBaseMint, 2);
			KDCreateEffectTile(tx, ty, {
				name: "Water",
				duration: 50,
			}, 0);
			return {success: true, consumed: 1, time: 1, componentfailure: "", miscast: false,
				affected: [],
			};
		}
	},
	Humanity: {
		playerEffect: (inv, quantity, user, target, tx, ty) => {
			if (!KinkyDungeonStatsChoice.get("SpeciesDoll")) {
				KinkyDungeonSendActionMessage(7, TextGet("KDInvalidTarget_" + KDConsumable(inv).contains),
				KDBaseOrange, 1);
				return {success: false, consumed: 0, time: 0, componentfailure: "", miscast: false, affected: []};
			} else {
				KinkyDungeonSendActionMessage(7, TextGet("KDUseSelf_" + KDConsumable(inv).contains),
				KDBaseMint, 2);
				KDMakeIntoHuman(target)

				return { success: true, consumed: quantity, time: 1, componentfailure: "", miscast: false,
					affected: [target],
				};
			}
			
		},
		entityEffect: (inv, quantity, user, target, tx, ty) => {
			// buff NPC strength if possible
			if (target.Enemy?.tags?.dollconvertible) {
				// TODO
				if (KDFactionFavorable(KDGetFaction(user), KDGetFaction(target))
					|| (user == KDPlayer() && KDGetModifiedOpinionID(target.id) > 0)) {
						KinkyDungeonSendActionMessage(7, TextGet("KDUseTarget_" + KDConsumable(inv).contains)
						.replace("${Target}", KDEnemyName(target)),
						KDBaseMint, 2);
						KDMakeIntoHuman(target)


					return {success: true, consumed: 1, time: 1, componentfailure: "", miscast: false,
						affected: [target],
					};
				} else {
					KinkyDungeonSendActionMessage(7, TextGet("KDUseTargetRefusePotion")
						.replace("${Target}", KDEnemyName(target)),
						KDBaseMint, 2);

					return {success: false, consumed: 0, time: 0, componentfailure: "", miscast: false,
						affected: [],
					};
				}
			} else {
				KinkyDungeonSendActionMessage(7, TextGet("KDInvalidTarget_" + KDConsumable(inv).contains),
				KDBaseOrange, 1);
				return {success: false, consumed: 0, time: 0, componentfailure: "", miscast: false, affected: []};
			}
		},
		tileEffect: (inv, quantity, user, target, tx, ty) => {
			KinkyDungeonSendActionMessage(7, TextGet("KDUseTile_" + KDConsumable(inv).contains),
				KDBaseOrange, 2);
			return {success: false, consumed: 1, time: 1, componentfailure: "", miscast: false,
				affected: [],
			};
		}
	}
}

let KDPotionActions: Record<string, ItemEffect> = {
	PotionDrink: {
		name: "PotionDrink", ...KDBasicPotionFields,
		delayedTags: ["Action", "Remove", "Restrain"],
		components: [], range: 1.5,
		onUse: function (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number): ItemEffectResult {
			return KDPotionOnUse("PotionDrink", inv, quantity, user, target, tx, ty,
				(inv, quantity, user, target, tx, ty) => {
					// do based on potion type
					return KDPotionTypes[KDConsumable(inv).contains].playerEffect(inv, quantity, user, target, tx, ty);
				},
				(inv, quantity, user, target, tx, ty) => {
					// do based on potion type
					return KDPotionTypes[KDConsumable(inv).contains].entityEffect(inv, quantity, user, target, tx, ty);
				},
				(inv, quantity, user, target, tx, ty) => {
					// do based on potion type
					return KDPotionTypes[KDConsumable(inv).contains].tileEffect(inv, quantity, user, target, tx, ty);
				}
			)
		},
	}
}

for (let entry of Object.entries(KDPotionActions)) {
	KDItemEffects[entry[0]] = entry[1];
}