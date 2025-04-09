
function KDRemoveMasterwork(remover: entity) {
	// only if it was a normal unlock
	let toUnlock = KinkyDungeonAllRestraintDynamic().filter((r) => {
		return KDRestraint(r.item)?.shrine?.includes("Masterwork");
	}).map((r) => {return r.item});
	let max = toUnlock.length;
	for (let i = 0; i < max; i++) {
		for (let r of toUnlock) {
			if (KinkyDungeonRemoveRestraintSpecific(r, true, false, false, false, false, remover).length > 0) {
				toUnlock.splice(toUnlock.indexOf(r), 1);
				KinkyDungeonSendTextMessage(
					10, TextGet("KDMasterworkLockRemove")
						.replace("${Restraint}",
							KDGetItemName(r))
					, KDBaseLightGreen, 1);
				break;
			}
		}
	}
}


function KDCountMasterworks(player: entity, worn: boolean = true, inventory: boolean = true) {
	let count = 0;
	if (player == KDPlayer()) {
		if (worn)
			for (let r of KinkyDungeonAllRestraintDynamic()) {
				if (KDRestraint(r.item)?.shrine?.includes("Masterwork")) {
					count++;
				}
			}
		if (inventory)
			for (let inv of KinkyDungeonAllLooseRestraint()) {
				if (KDRestraint(inv)?.shrine?.includes("Masterwork")) {
					count += inv.quantity || 1;
				}
			}

	}
	return count;
}


function KDGetNeededMasterworkCount() {
	return KinkyDungeonStatsChoice.get("NoBlindfolds") ?
		KDDialogueParams.MasterworkCount - 1
		: KDDialogueParams.MasterworkCount;
}



function KDHasMasterworkSet(player: entity) {
	if (player == KDPlayer()) {
		// Only need 4 if no blindfolds perk
		let requiredItems = KDGetNeededMasterworkCount();
		let count = 0;
		for (let r of KinkyDungeonAllRestraintDynamic()) {
			if (KDRestraint(r.item)?.shrine?.includes("Masterwork")) {
				count++;
			}
			if (count >= requiredItems) break;
		}

		if (count >= requiredItems) return true;
	}
	return false;
}


/**
 * Helper function used to summon cursed epicenters
 * @param x
 * @param y
 */
function KDSummonMasterworkTrap(x: number, y: number): entity {
	let enemy = KinkyDungeonGetEnemy(["masterworkTrap"], KDGetEffLevel(),KDCurrIndex(), '0', ["masterwork"]);
	if (enemy) {
		let point = {x: x, y: y};//KinkyDungeonGetNearbyPoint(x, y, true);
		if (point) {
			let en = DialogueCreateEnemy(point.x, point.y, enemy.name);

			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/SummonCurse.ogg");
			KinkyDungeonSendTextMessage(8, TextGet("KDSummonMasterGear"), "#9074ab", 5);
			KDDisableAutoWait();
			return en;
		}
	}
}
