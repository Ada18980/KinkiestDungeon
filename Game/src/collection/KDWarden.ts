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
				KinkyDungeonCurrentFilter = "All";
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
	if (!delta) return;
	let facility = "Warden";
	let wardenPower = 0;
	let WardenItems = KDGetContainer("WardenChest")?.items || {};
	KDGameData.FacilitiesData.Warden_TightenedCount = 0;
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



		// Another thing the warden does--collects restraints and items
		for (let value of Object.values(KDGameData.Collection)) {
			if (!value.status && !KDNPCUnavailable(value.id, value.status)) {
				let entity = KDGetGlobalEntity(value.id);
				if (entity.items) {
					let restraints = entity.items.filter((str) => {
						return KDRestraint({name: str});
					});
					for (let item of restraints) {
						if (WardenItems[item]) WardenItems[item].quantity = (WardenItems[item].quantity || 1) + 1;
						else {
							if (KinkyDungeonRestraintVariants[item]) {
								WardenItems[item] = KDGetInventoryVariant(
									KinkyDungeonRestraintVariants[item], undefined,
									KinkyDungeonRestraintVariants[item].curse,
									"", item);

							} else {
								WardenItems[item] = {
								name: item,
								//curse: curse,
								id: KinkyDungeonGetItemID(),
								type: LooseRestraint,
								//events:events,
								quantity: 1,
								showInQuickInv: KinkyDungeonRestraintVariants[item] != undefined,};
							}
						}
						// Delete from inv
						entity.items.splice(entity.items.indexOf(item), 1);
					}
				}

			}
		}

		let entries: KDCollectionEntry[] = [];
		for (let value of Object.values(KDGameData.Collection)) {
			if (!value.status && KDValidateEscapeGrace(value) && !KDNPCUnavailable(value.id, value.status)) {
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
						let rest = KDRestraint(testItem);
						if (!rest)
							continue;
						let slot = KDGetNPCBindingSlotForItem(rest, value.id, false);

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
								KDGameData.FacilitiesData.Warden_TightenedCount += 1;
								currentBondage = KDGetExpectedBondageAmountTotal(value.id, undefined, false);
						}
					}

				}
				// In this next part, we apply restraint tightening
				KDNPCRefreshBondage(value.id, -1, false, false,
					KDGetContainer("WardenChest", undefined, undefined, true, KDWardenChestFilters).items);
				KDValidateEscapeGrace(value);
			}
		}

	}
}
let KDWardenChestFilters = [Restraint, Outfit, Consumable, Weapon];