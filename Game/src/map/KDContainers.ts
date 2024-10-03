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
}

function KDAddContainer(name: string, point?: KDPoint, location?: WorldCoord, appendCoords: boolean = true): KDContainer {
	let container = {
		name: name || "",
		location: location,
		point: point,
		items: {},
		lock: "",
		type: name || "",
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

function KDGetContainer(name: string, point?: KDPoint, location?: WorldCoord, create: boolean = false): KDContainer {
	let id = KDGetContainerName(name, point, location);
	if (create && !KDGameData.Containers[id]) {
		KDAddContainer(name, point, location, true);
	}

	return KDGameData.Containers[id];
}


function KDDrawContainer(name: string, xOffset = -125) {
	let x = 1225 + xOffset;

	let filter = KinkyDungeonCurrentFilter;

	KDDrawInventoryFilters(xOffset - 60, 50, [Restraint, Outfit]);

	let filteredInventory = KinkyDungeonFilterInventory(filter, undefined, undefined, undefined, undefined, KDInvFilter);

	DrawTextFitKD(TextGet("KDContainerType_" + KDGameData.Containers[name]?.type),
		xOffset + 1600, 270, 500, "#ffffff", undefined, 28, undefined, 70);

	DrawTextFitKD("<->",
		xOffset + 1300, 750, 200, "#ffffff", undefined, 48, undefined, 70);

	let YourInv = KDDrawInventoryContainer(-900, 100, filteredInventory, filter, filter,
	(inv: KDFilteredInventoryItem, x, y, w, h) => {
		// TODO
		KDUI_Container_LastSelected = "";
	}, (inv) => {
		return (inv.item.type == Weapon && inv.item.name == KinkyDungeonPlayerWeapon) ? "#e64539" : KDTextGray1;
	}, "");

	let filteredInventory2 = KinkyDungeonFilterInventory(filter, undefined, undefined, undefined, undefined, KDInvFilter,
		KDGameData.Containers[name]?.items
	);

	let ContainerInv = KDDrawInventoryContainer(-165, 100, filteredInventory2, filter, filter,
		(inv: KDFilteredInventoryItem, x, y, w, h) => {
		// TODO
		KDUI_Container_LastSelected = "Chest";
	}, (inv) => {
		return (KinkyDungeonInventoryGetWeapon(inv.item.name)) ? "#e64539" : KDTextGray1;
	}, "Chest", true);


	let selectedItem = KDUI_Container_LastSelected == "Chest" ?
		ContainerInv.selected
		: YourInv.selected;

	if (selectedItem?.item) {

		let item = selectedItem.item;
		let XX = 1400;
		let YY = -200;

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
		let textSplit = KinkyDungeonWordWrap(TextGet("KinkyDungeonInventoryItem" + KDMapData.ShopItems[KinkyDungeonShopIndex].name + "Desc"),
			15*mult, 40*mult).split('\n');
		let textSplit2 = KinkyDungeonWordWrap(TextGet("KinkyDungeonInventoryItem" + KDMapData.ShopItems[KinkyDungeonShopIndex].name +  "Desc2"),
			15*mult, 40*mult).split('\n');
		let i = 0;
		let descSpacing = 20;
		let fSize = 16;
		const encoder = new TextEncoder();
		DrawTextFitKD(`${KDGetItemName(item)} - ${TextGet("KinkyDungeonRarity" +
			(KDRestraint(item) ? Math.max(0, Math.min(Math.floor(
				KDRestraint(item).displayPower || KDRestraint(item).power
			),10))
			: (KDConsumable(item)?.rarity || KDWeapon(item)?.rarity || 0))
		)}`,
			XX, YY + 200 + i * descSpacing, 500, "#ffffff", undefined, fSize + 4, undefined, 70);
		i++;
		i++;
		for (let N = 0; N < textSplit.length; N++) {
			DrawTextFitKD(textSplit[N],
				XX, YY + 200 + i * descSpacing, 380 * (encoder.encode(textSplit[N]).length / 40), "#ffffff", undefined, fSize, undefined, 70);
			i++;
		}
		i = 0;
		for (let N = 0; N < data.extraLinesPre.length; N++) {
			DrawTextFitKD(data.extraLinesPre[N],
				XX + 400, YY + 200 + i * descSpacing, 380 * (encoder.encode(data.extraLinesPre[N]).length / 40), data.extraLineColorPre[N], data.extraLineColorBGPre[N], fSize, undefined, 70);
			i++;
		}
		for (let N = 0; N < textSplit2.length; N++) {
			DrawTextFitKD(textSplit2[N],
				XX + 400, YY + 200 + i * descSpacing, 380 * (encoder.encode(textSplit2[N]).length / 40), "#ffffff", undefined, fSize, undefined, 70);
			i++;
		}
		for (let N = 0; N < data.extraLines.length; N++) {
			DrawTextFitKD(data.extraLines[N],
				XX + 400, YY + 200 + i * descSpacing, 380 * (encoder.encode(data.extraLines[N]).length / 40), data.extraLineColor[N], data.extraLineColorBG[N], fSize, undefined, 70);
			i++;
		}
	}

	DrawButtonKDEx(
		"backbutton", () => {
			KinkyDungeonDrawState = KDUI_ContainerBackScreen ? KDUI_ContainerBackScreen : "Game";
			return true;
		}, true, 1300, 900, 350, 64, TextGet("KDContainerBack_" + KDUI_ContainerBackScreen),
		"#ffffff", undefined
	)

	KDDrawInventoryTabs(xOffset);
}

