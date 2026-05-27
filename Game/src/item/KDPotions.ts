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

interface PotionEffect {
	playerEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult,
	entityEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult,
	tileEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult,
}


function KDGetPotionRange(item: item, itemEffect: string) {
	// TODO
	return KDItemEffects[itemEffect].range;
}

function KDPotionOnUse(itemEffect: string, inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number,
	playerEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult,
	entityEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult,
	tileEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult,
): ItemEffectResult {

	let item = KDConsumable(inv);
	if (!target && !tx && !ty && user == KDPlayer()) {
		return KDTargetConsumable(inv, quantity, itemEffect);
	} else {
		if (!target) target = KinkyDungeonEntityAt(tx, ty);
		if (target?.player) {
			return playerEffect(inv, quantity, user, target, tx, ty);
		} else if (target) {
			return entityEffect(inv, quantity, user, target, tx, ty);
		} else {
			return tileEffect(inv, quantity, user, target, tx, ty);
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

	if (target == user && KDConsumable(item)?.needMouth) {
		if (target.player) {
			if (!KinkyDungeonCanTalk()) {
				KinkyDungeonSendActionMessage(7, TextGet("KDInvalidTargetSelf_Gagged"),
					KDBaseOrange, 2);
				return {
					success: false,
					componentfailure: "Mouth",
					failureChance: 0,
					miscastChance: 0,
					miscast: false,
					time: 0,
					quantity: 0,
					delayed: false,
				};
			}
			
		} else if (!KDEnemyCanTalk(target)) {
			KinkyDungeonSendActionMessage(7, TextGet("KDInvalidTarget_Gagged"),
				KDBaseOrange, 2);
			return {
				success: false,
				componentfailure: "Mouth",
				failureChance: 0,
				miscastChance: 0,
				miscast: false,
				time: 0,
				quantity: 0,
				delayed: false,
			};
		}
	}
	
	if (KDStandardConsumableHandsCheck(inv, quantity)) {
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
	return {
		success: false,
		componentfailure: "",
		failureChance: 0,
		miscastChance: 0,
		miscast: false,
		time: 0,
		quantity: 0,
		delayed: false,
	};
}

