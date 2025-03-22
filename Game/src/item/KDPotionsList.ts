
let KDPotionTypes: Record<string, PotionEffect> = {
	Strength: {
		playerEffect: (inv, quantity, user, target, tx, ty) => {
			KinkyDungeonSendActionMessage(7, TextGet("KDUseSelf_" + KDConsumable(inv).contains),
			KDBaseMint, 2);

			// TODO

			return { success: true, consumed: quantity, time: 1, componentfailure: "", miscast: false,
				affected: [target],
			};
		},
		entityEffect: (inv, quantity, user, target, tx, ty) => {
			// buff NPC strength if possible
			if (target.Enemy?.attack?.includes("Melee")) {

				// TODO

				KinkyDungeonSendActionMessage(7, TextGet("KDUseTarget_StrengthPotion")
					.replace("${Target}", KDEnemyName(target)),
					KDBaseMint, 2);
				return {success: true, consumed: 1, time: 1, componentfailure: "", miscast: false,
					affected: [target],
				};
			} else {
				KinkyDungeonSendActionMessage(7, TextGet("KDInvalidTarget_StrengthPotion"),
				KDBaseOrange, 1);
				return {success: false, consumed: 0, time: 0, componentfailure: "", miscast: false, affected: []};
			}
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
				}
			)
		},
	}
}

for (let entry of Object.entries(KDPotionActions)) {
	KDItemEffects[entry[0]] = entry[1];
}