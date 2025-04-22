"use strict";

/** Current container being looked in by the UI */
let KDUI_CurrentContainer: string = "";
let KDUI_ContainerBackScreen: string = "Game";
let KDUI_Container_LastSelected = "";

interface KDContainer {
	name: string,
	location?: WorldCoord,
	point?: KDPoint,
	items: Record<string, item>,
	lock: string,
	type: string,
	validation?: string,
	filters?: string[],
}

function KDAddContainer(name: string, point?: KDPoint, location?: WorldCoord, appendCoords: boolean = true, filters?: string[]): KDContainer {
	let container: KDContainer = {
		name: name || "",
		location: location,
		point: point,
		items: {},
		lock: "",
		type: name || "",
		filters: filters,
	};
	if (appendCoords) {
		container.name = KDGetContainerName(container.name, point, location);
	}
	if (!KDGameData.Containers[container.name])
		KDGameData.Containers[container.name] = container;
	return KDGameData.Containers[container.name];
}

function KDGetContainerName(name: string, point?: KDPoint, location?: WorldCoord): string {
	if (point) {
		name = name + `_,${point.x},${point.y}`;
	}
	if (location) {
		name = name + `_L,${location.mapX},${location.mapY},${location.room}`;
	}
	return name;
}

function KDGetContainer(name: string, point?: KDPoint, location?: WorldCoord, create: boolean = false, filters?: string[]): KDContainer {
	let id = KDGetContainerName(name, point, location);
	if (create && !KDGameData.Containers[id]) {
		KDAddContainer(name, point, location, true, filters);
	}

	return KDGameData.Containers[id];
}
function KDGetContainerFromTile(name: string, tile: any,
	point?: KDPoint, location?: WorldCoord, create: boolean = false, filters?: string[]): KDContainer {
	let id = tile?.Container ? tile.Container :
		KDGetContainerName(name, point, location);
	if (create && !KDGameData.Containers[id]) {
		KDAddContainer(tile?.Container ? tile.Container : name, point, location, !tile?.Container,
			filters || tile?.ContainerFilters);
	}

	return KDGameData.Containers[id];
}


function KDDrawContainer(name: string, xOffset = -125, filters = [Restraint, Outfit], invMsg?: string) {
	let x = 1225 + xOffset;
	let takeItem = (inv: item) => {
		if (!invMsg) {

			if (container.items[inv?.name]
				&& (inv.type != Weapon || !KinkyDungeonInventoryGetWeapon(inv.name))
			) {
				let item = KinkyDungeonInventoryGetSafe(inv.name);
				if (!item) {
					item = JSON.parse(JSON.stringify(container.items[inv.name]));
					item.quantity = 1;
					KDErrorText = "";
					KinkyDungeonInventoryAdd(item);
				} else if ((item.quantity || 0) < KDMaxInventoryStorage(item, KDPlayer())) {
					item.quantity = (item.quantity || 1) + 1;
					KDErrorText = "";
				} else {
					KDErrorText = TextGet("KDNotEnoughInventorySpace") + '\n' +
						TextGet("KDMaxNum").replace("${Num}", "" + (KDMaxInventoryStorage(item, KDPlayer()) || 1));
					KDErrorTextTime = CommonTime();
					return;
				}
				if (container.items[inv.name].quantity > 1) {
					container.items[inv.name].quantity -= 1;
				} else {
					delete container.items[inv.name];
				}
			}
		}

	};
	let transferItem = (inv: item) => {
		if (!invMsg) {
			let type = KDGetItemType(inv);
			if (filters.includes(type)) return; // Cant transfer wrong items
			let item = KinkyDungeonInventoryGetSafe(inv?.name);
			KDErrorText = "";
			if (item && KDCanDrop(item)) {
				if (!container?.items[inv.name]) {
					container.items[inv.name] = JSON.parse(JSON.stringify(item));
					container.items[inv.name].quantity = 0;
				}
				container.items[inv.name].quantity = (container.items[inv.name].quantity || 0) + 1;
				if (item.quantity > 1) {
					item.quantity -= 1;
				} else {
					KinkyDungeonInventoryRemoveSafe(KinkyDungeonInventoryGetSafe(inv.name));
				}
			} else {
				KDErrorText = TextGet("KDCantDrop");
				KDErrorTextTime = CommonTime();
			}
		}
	}

	let filter = KinkyDungeonCurrentFilter;
	let container = KDGameData.Containers[name];

	KDDrawInventoryFilters(xOffset - 120, -20 - 40 + 7 * filters.length, filters,
		["All"], 60);

	let filteredInventory = KinkyDungeonFilterInventory(filter, undefined, undefined, undefined, undefined, KDInvFilter,
		undefined, filters
	);

	DrawTextFitKD(TextGet("KDContainerType_" + container?.type),
		xOffset + 1600, 270, 500, KDBaseWhite, undefined, 28, undefined, 70);

	//DrawTextFitKD("<->",
	//	xOffset + 1300, 750, 200, KDBaseWhite, undefined, 48, undefined, 70);

	let YourInv = invMsg ? {
		selected: null,
		tooltipItem: null,
	} : KDDrawInventoryContainer(-1000, 100, filteredInventory, filter, filter,
	(inv: KDFilteredInventoryItem, x, y, w, h, different) => {
		if (!different && !KDUI_Container_LastSelected) {
			transferItem(inv.item);
		}
		KDUI_Container_LastSelected = "";
	}, (inv) => {
		return (inv.item.type == Weapon && inv.item.name == KinkyDungeonPlayerWeapon) ? "#e64539" : KDTextGray1;
	}, "");

	if (invMsg) {
		DrawTextFitKD(TextGet(invMsg),
		xOffset + 850, 550, 500, KDBaseWhite, undefined, 32, undefined, 70);

	}

	let filteredInventory2 = KinkyDungeonFilterInventory(filter, undefined, undefined, undefined, undefined, KDInvFilter,
		KDGameData.Containers[name]?.items
	);

	let ContainerInv = KDDrawInventoryContainer(-165, 100, filteredInventory2, filter, filter,
		(inv: KDFilteredInventoryItem, x, y, w, h, different) => {
		if (!different && KDUI_Container_LastSelected) {
			takeItem(inv.item);
		}
		KDUI_Container_LastSelected = "Chest";
	}, (inv) => {
		return (KinkyDungeonInventoryGetWeapon(inv.item.name)) ? "#e64539" : KDTextGray1;
	}, "Chest", true);


	let selectedItem = KDUI_Container_LastSelected == "Chest" ?
		ContainerInv.selected
		: YourInv.selected;

	let ii = 0;
	let spacing = 60;
	if (selectedItem?.item) {

		let item: item = selectedItem.item;
		let XX = 950;
		let YY = -80;

		DrawRectKD(kdcanvas, kdpixisprites, "itemcard", {
			Left: XX - 375,
			Top: YY + 170,
			Height: 120,
			Width: 1050,
			Color: "#000000",
			alpha: 0.8,
			zIndex: -1,
			LineWidth: 2,
		})
		FillRectKD(kdcanvas, kdpixisprites, "itemcardbg", {
			Left: XX - 375,
			Top: YY + 170,
			Height: 120,
			Width: 1050,
			Color: "#000000",
			alpha: 0.2,
			zIndex: -1,
			LineWidth: 2,
		})

		KDDraw(kdcanvas, kdpixisprites, "preview",
			selectedItem.preview,
			XX - 365,
			YY + 175,
			100, 100, undefined, {
				zIndex: 129,
			}, undefined, undefined, undefined, true);

		let data = {
			extraLines: [],
			extraLineColor: [],
			extraLineColorBG: [],
			extraLinesPre: [],
			extraLineColorPre: [],
			extraLineColorBGPre: [],
			SelectedItem: item,
			item: item,
		};
		KinkyDungeonSendEvent("inventoryTooltip", data);
		let mult = KDGetFontMult();

		let unidentified = KinkyDungeonStatsChoice.get("UnidentifiedWear") && KDIsUnidentified(item);
		let prefix = "KinkyDungeonInventoryItem";
		if (item.type == Restraint || item.type == LooseRestraint) {
			prefix = "Restraint";
		}


		let textSplit = KinkyDungeonWordWrap((unidentified && prefix == "Restraint")
			? TextGet(`${prefix}${KDRestraint(item).name}Desc`)
			: TextGet(prefix + KDItem(item)?.name + "Desc"), 15*mult, 40*mult).split('\n');
		let textSplit2 = KinkyDungeonWordWrap((unidentified && prefix == "Restraint")
			? TextGet(`${prefix}${KDRestraint(item).name}Desc2`)
			: TextGet(prefix + KDItem(item)?.name + "Desc2"), 15*mult, 40*mult).split('\n');

		let i = 0;
		let descSpacing = 20;
		let fSize = 16;
		const encoder = new TextEncoder();
		DrawTextFitKD(`${KDGetItemName(item)} - ${TextGet("KinkyDungeonRarity" +
			(KDRestraint(item) ? Math.max(0, Math.min(Math.floor(
				(KDRestraint(item).displayPower || KDRestraint(item).power)/5
			),10))
			: (KDConsumable(item)?.rarity || KDWeapon(item)?.rarity || 0))
		)}`,
			XX, YY + 200 + i * descSpacing, 500, KDBaseWhite, undefined, fSize + 4, undefined, 70);
		i++;
		i++;
		for (let N = 0; N < textSplit.length; N++) {
			DrawTextFitKD(textSplit[N],
				XX, YY + 200 + i * descSpacing, 380 * (encoder.encode(textSplit[N]).length / 40), KDBaseWhite, undefined, fSize, undefined, 70);
			i++;
		}
		i = 0;
		for (let N = 0; N < data.extraLinesPre.length; N++) {
			DrawTextFitKD(data.extraLinesPre[N],
				XX + 420, YY + 200 + i * descSpacing, 380 * (encoder.encode(data.extraLinesPre[N]).length / 40), data.extraLineColorPre[N], data.extraLineColorBGPre[N], fSize, undefined, 70);
			i++;
		}
		for (let N = 0; N < textSplit2.length; N++) {
			DrawTextFitKD(textSplit2[N],
				XX + 420, YY + 200 + i * descSpacing, 380 * (encoder.encode(textSplit2[N]).length / 40), KDBaseWhite, undefined, fSize, undefined, 70);
			i++;
		}
		if ((unidentified && item.type == Restraint) || (!unidentified)) {
			for (let N = 0; N < data.extraLines.length; N++) {
				DrawTextFitKD(data.extraLines[N],
					XX + 420, YY + 200 + i * descSpacing, 380 * (encoder.encode(data.extraLines[N]).length / 40), data.extraLineColor[N], data.extraLineColorBG[N], fSize, undefined, 70);
				i++;
			}
		}




		// Take
		// Take all
		// Take 5

		DrawButtonKDEx(
			"takeAllExcess", () => {
				let q = selectedItem.item.quantity;
				let maxAmt = KDMaxInventoryStorage(selectedItem.item, KDPlayer());
				if (KDUI_Container_LastSelected == "Chest") {
					for (let i = 1; i < (q || 1) && KinkyDungeonInventoryGet(selectedItem.item.name)?.quantity < maxAmt; i++) takeItem(selectedItem.item);
				} else for (let i = 1; i < (q || 1) && KinkyDungeonInventoryGet(selectedItem.item.name)?.quantity > maxAmt; i++) transferItem(selectedItem.item);
				return true;
			}, true, 1020, 600 + ii++*spacing, 200, spacing - 10,
			TextGet(KDUI_Container_LastSelected == "Chest" ? "KDRefill" : "KDAddAllExcess").replace("ITMN", KDGetItemName(item)),
			KDBaseWhite, undefined, undefined, undefined, true,
			KDButtonColor, undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySpell[0]),
				hotkeyPress: KinkyDungeonKeySpell[0],
			}
		);

		DrawButtonKDEx(
			"take1", () => {
				if (KDUI_Container_LastSelected == "Chest") {
					takeItem(selectedItem.item);
				} else transferItem(selectedItem.item);
				return true;
			}, true, 1020, 600 + ii++*spacing, 200, spacing - 10,
			TextGet(KDUI_Container_LastSelected == "Chest" ? "KDTake1" : "KDAdd1").replace("ITMN", KDGetItemName(item)),
			KDBaseWhite, undefined, undefined, undefined, true, KDButtonColor, undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySpell[1]),
				hotkeyPress: KinkyDungeonKeySpell[1],
			}
		);
		DrawButtonKDEx(
			"take5", () => {
				if (KDUI_Container_LastSelected == "Chest") {
					for (let i = 0; i < 5; i++) takeItem(selectedItem.item);
				} else for (let i = 0; i < 5; i++) transferItem(selectedItem.item);
				return true;
			}, true, 1020, 600 + ii++*spacing, 200, spacing - 10,
			TextGet(KDUI_Container_LastSelected == "Chest" ? "KDTake5" : "KDAdd5").replace("ITMN", KDGetItemName(item)),
			KDBaseWhite, undefined, undefined, undefined, true, KDButtonColor, undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySpell[2]),
				hotkeyPress: KinkyDungeonKeySpell[2],
			}
		);
		DrawButtonKDEx(
			"takeALL", () => {
				let q = selectedItem.item.quantity;
				if (KDUI_Container_LastSelected == "Chest") {
					for (let i = 0; i < (q || 1); i++) takeItem(selectedItem.item);
				} else for (let i = 0; i < (q || 1); i++) transferItem(selectedItem.item);
				return true;
			}, true, 1020, 600 + ii++*spacing, 200, spacing - 10,
			TextGet(KDUI_Container_LastSelected == "Chest" ? "KDTakeAll" : "KDAddAll").replace("ITMN", KDGetItemName(item)),
			KDBaseWhite, undefined, undefined, undefined, true, KDButtonColor, undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySpell[3]),
				hotkeyPress: KinkyDungeonKeySpell[3],
			}
		);
		DrawButtonKDEx(
			"takeALL1", () => {
				let q = selectedItem.item.quantity;
				if (KDUI_Container_LastSelected == "Chest") {
					for (let i = 1; i < (q || 1); i++) takeItem(selectedItem.item);
				} else for (let i = 1; i < (q || 1); i++) transferItem(selectedItem.item);
				return true;
			}, true, 1020, 600 + ii++*spacing, 200, spacing - 10,
			TextGet(KDUI_Container_LastSelected == "Chest" ? "KDTakeAll1" : "KDAddAll1").replace("ITMN", KDGetItemName(item)),
			KDBaseWhite, undefined, undefined, undefined, true, KDButtonColor, undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySpell[4]),
				hotkeyPress: KinkyDungeonKeySpell[4],
			}
		);
	}

	let InvToTransfer = filteredInventory;
	let InvToTransferExcess = filteredInventory;
	let InvToTransfer2 = filteredInventory2;
	let InvToTransferExcess2 = filteredInventory2;

	if (InvToTransfer) {
		DrawButtonKDEx(
			"DepositAll", () => {
				for (let inv of InvToTransfer) {
					if (!(KDGameData.ItemPriority[inv.name] > 9)) {
						let q = inv.item.quantity;
						for (let i = 0; i < (q || 1); i++) transferItem(inv.item);
					}

				}

				return true;
			}, InvToTransfer.length > 0, 655, 920, 175, 60,
			TextGet("KDDepositEverything"),
			InvToTransfer.length > 0 ? KDBaseWhite : "#999999", undefined, undefined, undefined, true,
			KDButtonColor, undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySpell[5]),
				hotkeyPress: KinkyDungeonKeySpell[5],
			}
		);

		InvToTransferExcess = InvToTransferExcess.filter(
			(inv) => {
				return KinkyDungeonInventoryGet(inv.item.name)?.quantity
					&& KDMaxInventoryStorage(inv.item, KDPlayer()) < 1000000;
			}
		);

		DrawButtonKDEx(
			"DepositAllExcess", () => {
				for (let inv of InvToTransferExcess) {
					if (inv.item.quantity > KDMaxInventoryStorage(inv.item, KDPlayer())) {
						let q = inv.item.quantity;
						for (let i = 0; i < (q || 1) &&
							(KinkyDungeonInventoryGet(inv.item.name)?.quantity || 1)
							> KDMaxInventoryStorage(inv.item, KDPlayer()); i++)
							transferItem(inv.item);
					}

				}

				return true;
			}, InvToTransferExcess.length > 0, 465, 920, 175, 60,
			TextGet("KDDepositEverythingExcess"),
			InvToTransferExcess.length > 0 ? KDBaseWhite : "#999999", undefined, undefined, undefined, true,
			KDButtonColor, undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySpell[6]),
				hotkeyPress: KinkyDungeonKeySpell[6],
			}
		);

		DrawButtonKDEx(
			"TakeAll", () => {
				for (let inv of InvToTransfer2) {
					let q = inv.item.quantity;
					for (let i = 0; i < (q || 1); i++) takeItem(inv.item);
				}

				return true;
			}, InvToTransfer2.length > 0, 1490, 920, 175, 60,
			TextGet("KDTakeEverything"),
			InvToTransfer2.length > 0 ? KDBaseWhite : "#999999", undefined, undefined, undefined, true,
			KDButtonColor, undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySpell[5]),
				hotkeyPress: KinkyDungeonKeySpell[5],
			}
		);

		InvToTransferExcess2 = InvToTransferExcess2.filter(
			(inv) => {
				return KinkyDungeonInventoryGet(inv.item.name)?.quantity
					&& KDMaxInventoryStorage(inv.item, KDPlayer()) < 1000000;
			}
		);

		DrawButtonKDEx(
			"TakeAllExcess", () => {
				for (let inv of InvToTransferExcess2) {
					if (!!KinkyDungeonInventoryGet(inv.item.name)
						&& (KinkyDungeonInventoryGet(inv.item.name)?.quantity || 1)
							< KDMaxInventoryStorage(inv.item, KDPlayer())) {

						let q = inv.item.quantity;
						for (let i = 0; i < (q || 1) &&
						(KinkyDungeonInventoryGet(inv.item.name)?.quantity || 1)
							< KDMaxInventoryStorage(inv.item, KDPlayer()); i++) takeItem(inv.item);
					}
				}


				return true;
			}, InvToTransferExcess2.length > 0, 1300, 920, 175, 60,
			TextGet("KDTakeEverythingExcess"),
				InvToTransferExcess2.length > 0 ? KDBaseWhite : "#999999", undefined, undefined, undefined, true,
			KDButtonColor, undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySpell[6]),
				hotkeyPress: KinkyDungeonKeySpell[6],
			}
		);
	}


	DrawButtonKDEx(
		"backbutton", () => {
			KinkyDungeonDrawState = KDUI_ContainerBackScreen ? KDUI_ContainerBackScreen : "Game";
			return true;
		}, true, 1020, 920, 200, 64, TextGet("KDContainerBack_" + KDUI_ContainerBackScreen),
		KDBaseWhite, undefined
	)

	KDDrawInventoryTabs(xOffset);
}



function KDCanDrop(item: item) {
	return (!KDWeapon(item) || !isUnarmed(KDWeapon(item)));
}

function KDValidateContainer(container: KDContainer): string {
	if (KDSpecialContainers[container.name]) {
		let val = KDSpecialContainers[container.name](container);
		if (val) return val;
	}
	if (container.validation && KDContainerVal[container.validation]) {
		let val = KDContainerVal[container.validation](container);
		if (val) return val;
	}
	return "";
}

let KDSpecialContainers = {
	WardenChest: (container: KDContainer) => {
		return (KDGameData.RoomType == "Summit" || KDGameData.RoomType == "PerkRoom") ? "" : "KDWardenNeedSummit";
	},
	PlayerChest: (container: KDContainer) => {
		return "";//return (KDGameData.RoomType == "Summit" || KDGameData.RoomType == "PerkRoom") ? "" : "KDPlayerChestNeedSummit";
	}
};
let KDContainerVal = {
};