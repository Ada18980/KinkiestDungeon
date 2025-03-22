let KDBasicPotionFields = {
	onMiscast: function (result: ItemEffectResult, inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number): ItemEffectResult {
		return result;},// potions cant miscast
	onFailure: function (result: ItemEffectResult, inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number): ItemEffectResult {
		return result;},// no adverse effects from failure yet
	canAttempt: function (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number): boolean {
		return KDCanAttemptPotion(inv, quantity, user, target, tx, ty);},
	onAttempt: function (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number): ItemAttemptResult {
		return KDAttemptPotion(inv, quantity, user, target, tx, ty);}
}

let KDPotionEffects: Record<string, ItemEffect> = {
	PotionStrength: {
		name: "Strength", ...KDBasicPotionFields,
		delayedTags: ["Action", "Remove", "Restrain"],
		components: [], range: 1.5,
		onUse: function (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number): ItemEffectResult {
			return KDPotionOnUse(inv, quantity, user, target, tx, ty,
				(inv, quantity, user, target, tx, ty) => {
					// buff player strength

					KinkyDungeonSendActionMessage(7, TextGet("KDUseSelf_StrengthPotion"),
					KDBaseMint, 2);


					return { success: true, consumed: quantity, time: 1, componentfailure: "", miscast: false,
						affected: [target],
					};
				},
				(inv, quantity, user, target, tx, ty) => {
					// buff NPC strength if possible
					if (target.Enemy?.attack?.includes("Melee")) {



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
			)
		},
	}
}

for (let entry of Object.entries(KDPotionEffects)) {
	KDItemEffects[entry[0]] = entry[1];
}

function KDGetPotionRange(item: item) {
	// TODO
	return KDItemEffects[KDConsumable(item).itemEffect].range;
}

function KDPotionOnUse(inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number,
	playerEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult,
	entityEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult,
): ItemEffectResult {

	let item = KDConsumable(inv);
			if (!target && !tx && !ty && user == KDPlayer()) {
				return KDTargetConsumable(item, quantity, KDGetPotionRange(inv));
			} else {
				if (!target) target = KinkyDungeonEntityAt(tx, ty);
				if (target?.player) {
					return playerEffect(inv, quantity, user, target, tx, ty);
				} else if (target) {
					return entityEffect(inv, quantity, user, target, tx, ty);
				}
			}

}


function KDCanAttemptPotion(inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number
): boolean {
	return KinkyDungeonCanDrink() || !!KDConsumable(inv).gagFloor;
}

function KDAttemptPotion(inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number
): ItemAttemptResult {
	let item = KDConsumable(inv);
	return {
		success: true,
		componentfailure: "",
		failureChance: 0,
		miscastChance: 0,
		miscast: false,
		time: item.delay != undefined ? item.delay : 2,
		quantity: quantity,
		delayed: !!item.delay || !!KinkyDungeonStatsChoice.has("SavourTheTaste"),
	};
}

