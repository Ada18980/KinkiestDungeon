function KDDrawWarden(x: number, y: number, width: number): number {
	let dd = 285;
	if (y + dd < 940) {
		let yy = y;

		yy += KDDrawServantPrisonerList("Warden", x + 50, yy + 70, width, 80);


		let ii = 0;
		DrawTextFitKD(TextGet("KDWardenTightened")
			.replace("AMNT", "" + KDGameData.FacilitiesData.Warden_TightenedCount),
				x + 50, yy + 80 + 30*ii++, width-100, "#ffffff", KDTextGray0, 18, "left");
		if (!KDGetContainer("WardenChest") || Object.values(KDGetContainer("WardenChest").items).length == 0)
			DrawTextFitKD(TextGet("KDWardenNoRestraints"),
				x + 50, yy + 80 + 30*ii++, width-100, "#ffffff", KDTextGray0, 18, "left");

		DrawButtonKDEx(
			"chestbutton", () => {
				KDUI_ContainerBackScreen = KinkyDungeonDrawState;
				KinkyDungeonDrawState = "Container",
				KDUI_CurrentContainer = "WardenChest";
			}, true, x + 900, yy + 60, 80, 80, "", "#ffffff",
			KinkyDungeonRootDirectory + "UI/Safe.png", undefined, undefined, undefined, undefined, undefined, undefined, {
				centered: true,
			}
		)
	}
	return dd;
}

/** Updates the warden facility */
function KDUpdateWarden(delta: number) {
	let facility = "Warden";
	let wardenPower = 0;
	let WardenItems = KDGetContainer("WardenChest")?.items || {};

	if (KDGameData.FacilitiesData["Servants_" + facility])
		for (let servant of KDGameData.FacilitiesData["Servants_" + facility]) {
			let value = KDGameData.Collection[servant + ""];
			if (value) {
				wardenPower += 1 + KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type));
			}
		}
	if (wardenPower) {
		// If we have a warden we continue
		// Create a list of prisoners at risk of escaping

		let entries: KDCollectionEntry[] = [];
		for (let value of Object.values(KDGameData.Collection)) {
			if (KDValidateEscapeGrace(value)) {
				entries.push(value);
			}
		}

		if (entries.length > 0) {
			// If we do, then we iterate over all of them
			for (let value of entries) {
				// Get current bondage, exclusing conjured
				let currentBondage = KDGetExpectedBondageAmountTotal(value.id, undefined, false);
				// Figure out how much is needed to fully bind
				let enemy = KinkyDungeonGetEnemyByName(value.type);
				let neededBondage = enemy.maxhp * KDNPCStruggleThreshMultType(enemy);
				if (currentBondage < neededBondage) {
					// In this part we add more restraints until current bondage is acceptable
					let availableRestraints = Object.values(WardenItems);
					let iterations = 0;
					let maxIterations = availableRestraints.length;
					while (availableRestraints.length > 0
						&& iterations++ < maxIterations
						&& currentBondage < neededBondage) {
						// Get a random item to test, and remove it from available list
						let testItem = availableRestraints.splice(
							Math.floor(KDRandom() * availableRestraints.length), 1)[0];
						let slot = KDGetNPCBindingSlotForItem(KDRestraint(testItem), value.id, false);

						// Check if its valid
						if (slot) {
							// Add the item
							if (KDInputSetNPCRestraint({
								slot: slot.sgroup.id,
								id: undefined,
								faction: testItem.faction,
								restraint: testItem.name,
								restraintid: testItem.id,
								lock: "",
								variant: undefined,
								events: testItem.events,
								powerbonus: undefined,
								inventoryVariant: testItem.inventoryVariant,
								npc: value.id,
								player: -1,
							}, WardenItems))
								// If added, refresh
								currentBondage = KDGetExpectedBondageAmountTotal(value.id, undefined, false);
						}
					}

				}
				// In this next part, we apply restraint tightening
				KDNPCRefreshBondage(value.id, -1, false, false,
					KDGetContainer("WardenChest", undefined, undefined, true, KDWardenChestFilters).items);
			}
		}

	}
}
let KDWardenChestFilters = [Restraint, Outfit, Consumable, Weapon];