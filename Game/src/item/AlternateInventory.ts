let KDAlternateInventoryScreens: {[_:string] : (selected: KDFilteredInventoryItem, xOffset: number, yOffset: number, prefix: string) => boolean} = {
	ConfigHotbar: (selected: KDFilteredInventoryItem, xOffset: number, yOffset: number, prefix: string) => {
		KDDrawHotbar(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale - 15, yOffset + canvasOffsetY_ui + 50, selected.item.name, (I) => {
			if (KinkyDungeonConsumableChoices[I] || KinkyDungeonWeaponChoices[I] || KinkyDungeonArmorChoices[I] || KinkyDungeonSpellChoices[I] >= 0) {
				KDSendInput("spellRemove", {I:I});
			} else {
				KinkyDungeonClickItemChoice(I, selected.item.name);
			}
		});
		DrawButtonKDEx(prefix + "KDBack", (_bdata) => {
			KDConfigHotbar = !KDConfigHotbar;
			return true;
		}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 185, yOffset + canvasOffsetY_ui + 483*KinkyDungeonBookScale - 250, 190, 55, TextGet("KDBack"), KDBaseWhite, "");
		return true;
	},
	ConfigPalette: (selected: KDFilteredInventoryItem, xOffset: number, yOffset: number, prefix: string) => {
		let currentItem: item = selected.item;
		KDDrawCustomPalettes(KDGetPalettes(KinkyDungeonPlayer), KinkyDungeonPlayer.ID + "_",
		1300, 250, KDPaletteWidth, 72,
			currentItem?.forceFaction != undefined ? currentItem?.forceFaction || "" : "-1", (palette) => {

			if (currentItem) {
				if (currentItem.forceFaction == palette) {
					delete currentItem.forceFaction;
				} else {
					currentItem.forceFaction = palette;
					currentItem.faction = palette;
				}
				KDRefreshCharacter.set(KinkyDungeonPlayer, true);
				KinkyDungeonCheckClothesLoss = true;
				KinkyDungeonDressPlayer();
			}

		}, "KDSetRestraintPaletteSelect");

		if (currentItem) {
			DrawCheckboxKDEx(
				"savePrefPal",
				(d) => {
					KDPalettePrefs[KDRestraint(currentItem)?.name] = currentItem.forceFaction;
					KDSaveToggles();
					return true;
				}, true,
				canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 40,
				yOffset + canvasOffsetY_ui + 483*KinkyDungeonBookScale + 70, 50, 50,
				TextGet("KDSavePaletteRestraint"),
				(currentItem.forceFaction == undefined && KDPalettePrefs[KDRestraint(currentItem)?.name] == undefined)
				|| (currentItem.forceFaction != undefined && KDPalettePrefs[KDRestraint(currentItem)?.name] === currentItem.forceFaction),
				false, KDBaseWhite
			);
			DrawCheckboxKDEx(
				"savePrefPalEnch",
				(d) => {
					KDPalettePrefsEnchanted[KDRestraint(currentItem)?.name] = currentItem.forceFaction;
					KDSaveToggles();
					return true;
				}, true,
				canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 40,
				yOffset + canvasOffsetY_ui + 483*KinkyDungeonBookScale + 130, 50, 50,
				TextGet("KDSavePaletteRestraintEnch"),
				(currentItem.forceFaction == undefined && KDPalettePrefsEnchanted[KDRestraint(currentItem)?.name] == undefined)
				|| (currentItem.forceFaction != undefined && KDPalettePrefsEnchanted[KDRestraint(currentItem)?.name] === currentItem.forceFaction),
				false, KDBaseWhite
			);
		}


		DrawButtonKDEx(prefix + "KDBack", (_bdata) => {
			KDConfigRestraintColor = !KDConfigRestraintColor;
			return true;
		}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 185,
		yOffset + canvasOffsetY_ui + 483*KinkyDungeonBookScale + 0, 190, 55, TextGet("KDBack"), KDBaseWhite, "");

		return true;
	},

	GenericRaw: (selected: KDFilteredInventoryItem, xOffset: number, yOffset: number, prefix: string) => {
		if (selected) {
			let currentItem: item = selected.item;

			KDDrawGenericCharacterRestrainingUI(
				Object.values(KDRestraintGenericTypes), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale - 250,
				yOffset + canvasOffsetY_ui + 100, undefined, // TODO support currentItem
				undefined, -1, undefined, currentItem, false, undefined,
				2, 8, 260,
				(currentItem, restraint, item, count) => {
					// Add new one
					if (KDCanAddRestraint(
						restraint,
						false,
						undefined, false, undefined, // TODO currentItem support
						true, true, undefined, false, undefined,
					undefined, undefined)) {
						let player = KDPlayer();

						KDSendInput("equipRestraintGeneric", {
							duration: 1,
							quantity: count,
							item: item,
							name: restraint.name,
							container: KDInventoryActionContainer(player),
							inventoryVariant: undefined,// TODO add special ropes
							group: restraint.Group, curse: undefined, // TODO add special cursed stuff
							currentItem: KinkyDungeonGetRestraintItem(restraint.Group)?.name,
							events: Object.assign([], restraint.events)
						});
					}
				}, (restraint: restraint) => {
					return KDCanAddRestraint(
						restraint,
						false,
						undefined, false, undefined, // TODO currentItem support
						true, true, undefined, false, undefined,
					undefined, undefined);
				}
			)
		}


		DrawButtonKDEx(prefix + "KDBack", (_bdata) => {
			KDResetAlternateInventoryRender();
			return true;
		}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 185,
		yOffset + canvasOffsetY_ui + 483*KinkyDungeonBookScale + 0, 190, 55, TextGet("KDBack"), KDBaseWhite, "");

		return true;
	},
}

let KDCurrentAlternateInventory = "";

function KDRenderAlternateInventory(selected: KDFilteredInventoryItem, xOffset: number, yOffset: number, prefix: string): boolean {
	if (selected && KDConfigHotbar) {
		return KDAlternateInventoryScreens.ConfigHotbar(selected, xOffset, yOffset, prefix);
	} else if (selected && KDConfigRestraintColor) {
		return KDAlternateInventoryScreens.ConfigPalette(selected, xOffset, yOffset, prefix);
	} else if (KDCurrentAlternateInventory && KDAlternateInventoryScreens[KDCurrentAlternateInventory]) {
		return KDAlternateInventoryScreens[KDCurrentAlternateInventory](selected, xOffset, yOffset, prefix);
	}
	return false;
}