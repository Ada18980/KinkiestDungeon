"use strict";

let KinkyDungeonCurrentLore = -1;
/**
 * @type {any}
 */
let KinkyDungeonCurrentLoreTab = -1;
/**
 * @type {any[]}
 */
let KinkyDungeonCurrentLoreTabs = [-1];
let KinkyDungeonCurrentLoreItems = [];
let KinkyDungeonCurrentLoreItemOffset = 0;
let KinkyDungeonCurrentLoreTabOffset = 0;
let KinkyDungeonLore = [0, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28];
let KinkyDungeonCheckpointLore = {
	"Combat": [23, 24, 25, 26, 27],
	"School": [20, 21, 22, 28],
	"History": [29, 30, 31, 32, 33, 34, 35, 36, 37],
	"Enemy": [4, 5, 6, 19, 101, 102, 103, 104, 105, 106, 107, 108, 109, 111, 112, 1100, 1104, 201, 203],
	"grv": [29, 1, 19],
	"tmb": [30, 9, 1100, 1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1112],
	"cat": [31, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 9,],
	"lib": [32],
	"jng": [33, 29, 201, 202, 203, 204, 205],
	"cry": [34],
	"tmp": [35],
	"ore": [36, 1400, 1401, 1402],
	"bel": [37, 400],


};
let KinkyDungeonLoreScale = 1.5;
let KinkyDungeonRepeatLoreChance = 0.4; // Chance you will find a duplicate piece of lore
let KinkyDungeonGenericLoreChance = 0.33; // Chance you will find a generic note instead of a previous note

let KinkyDungeonNewLoreList = localStorage.getItem("kinkydungeonnewlore") ? JSON.parse(localStorage.getItem("kinkydungeonnewlore")) : [];

function KinkyDungeonNewLore() {
	let availableLore = [];
	let exploredLore = localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : [];
	let newLore = localStorage.getItem("kinkydungeonnewlore") ? JSON.parse(localStorage.getItem("kinkydungeonnewlore")) : [];

	let checkpoint = (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint);

	if (!exploredLore || exploredLore.length == 0) {
		availableLore = [0];
	} else if (KinkyDungeonCheckpointLore[checkpoint]) {
		for (let L = 0; L < KinkyDungeonCheckpointLore[checkpoint].length; L++) {
			availableLore.push(KinkyDungeonCheckpointLore[checkpoint][L]);
		}

		if (Math.random() < KinkyDungeonRepeatLoreChance) {
			if (Math.random() > KinkyDungeonGenericLoreChance) {
				availableLore = KinkyDungeonLore;
			} else {
				availableLore = [];
			}

		} else KinkyDungeonLore.forEach((element) => {if (!exploredLore.includes(element)) {availableLore.push(element);}});

	}

	let result = false;

	if (availableLore.length > 0) {
		KinkyDungeonCurrentLore = availableLore[Math.floor(Math.random() * availableLore.length)];
		if (!exploredLore.includes(KinkyDungeonCurrentLore)) {

			KinkyDungeonSendActionMessage(5, TextGet("ItemPickupLore"), "white", 2);
			exploredLore.push(KinkyDungeonCurrentLore);
			newLore.push(KinkyDungeonCurrentLore);

			KinkyDungeonCurrentLoreTab = -1;
			for (let i = 0; i < Object.keys(KinkyDungeonCheckpointLore).length; i++) {
				if (Object.values(KinkyDungeonCheckpointLore)[i].includes(KinkyDungeonCurrentLore)) {
					KinkyDungeonCurrentLoreTab = i;
					break;
				}
			}

			//ServerAccountUpdate.QueueData({ KinkyDungeonExploredLore: Player.KinkyDungeonExploredLore });
		} else {
			KinkyDungeonSendActionMessage(4, TextGet("ItemPickupLoreOld"), "gray", 2);
			KinkyDungeonCurrentLore = -(1 + Math.floor(Math.random() * 10));
		}
		result = true;
	} else {
		KinkyDungeonSendActionMessage(4, TextGet("ItemPickupLoreOld"), "gray", 2);
		KinkyDungeonCurrentLore = -(1 + Math.floor(Math.random() * 10));
	}

	localStorage.setItem("kinkydungeonexploredlore", JSON.stringify(exploredLore));
	KinkyDungeonNewLoreList = newLore;
	localStorage.setItem("kinkydungeonnewlore", JSON.stringify(newLore));

	KinkyDungeonUpdateTabs(exploredLore);

	return result;
}

function KinkyDungeonUpdateTabs(exploredLore) {
	KinkyDungeonCurrentLoreTabs = [-1];
	for (let lore of exploredLore) {
		for (let i = 0; i < Object.keys(KinkyDungeonCheckpointLore).length; i++) {
			if (Object.values(KinkyDungeonCheckpointLore)[i].includes(lore)) KinkyDungeonCurrentLoreTabs.push(Object.keys(KinkyDungeonCheckpointLore)[i]);
		}
	}
}

KinkyDungeonUpdateTabs(localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : []);

function KinkyDungeonDrawLore() {
	let xOffset = -125;


	let x = 1300;

	KDDraw(kdcanvas, kdpixisprites, "magicbook", KinkyDungeonRootDirectory + "MagicBook.webp", canvasOffsetX_ui - 100, canvasOffsetY_ui - 100, 640*KinkyDungeonLoreScale, 483*KinkyDungeonLoreScale);

	// Draw the current note

	//let wrapAmount = KDBigLanguages.includes(TranslationLanguage) ? 19 : 45;
	let loreOrig = TextGet("KinkyDungeonLore" + KinkyDungeonCurrentLore).split('|');
	let lore = [];
	for (let str of loreOrig) {
		lore.push(...(KinkyDungeonWordWrap(str, 19, 45).split('\n')));
	}
	let i = 0;
	for (let N = 0; N < lore.length; N++) {
		DrawTextFitKD(lore[N],
			canvasOffsetX_ui - 100 + 640*KinkyDungeonLoreScale/8, canvasOffsetY_ui - 100 + 483*KinkyDungeonLoreScale/6 + i * 40, 0.75 * 640*KinkyDungeonLoreScale, "#000000", KDTextTan, undefined, "left"); i++;}

	if (KinkyDungeonNewLoreList.includes(KinkyDungeonCurrentLore)) {
		KinkyDungeonNewLoreList.splice(KinkyDungeonNewLoreList.indexOf(KinkyDungeonCurrentLore), 1);
		localStorage.setItem("kinkydungeonnewlore", JSON.stringify(KinkyDungeonNewLoreList));
	}


	// Draw the tabs
	let tabs = Object.values(KinkyDungeonCheckpointLore);
	let tabNames = Object.keys(KinkyDungeonCheckpointLore);
	let numTabs = 20;
	for (i = -1; i < numTabs; i++) {
		if (i + KinkyDungeonCurrentLoreTabOffset < tabs.length) {
			let newLore = false;

			for (let ll of KinkyDungeonNewLoreList) {
				if ((i == -1 && KinkyDungeonLore.includes(ll)) || (i >= 0 && KinkyDungeonCheckpointLore[tabNames[i + KinkyDungeonCurrentLoreTabOffset]].includes(ll))) {
					newLore = true;
					break;
				}
			}

			if (i == -1) {
				DrawButtonKDEx("loretab" + i, (b) => {
					KinkyDungeonCurrentLoreTab = -1;
					KinkyDungeonUpdateLore(localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : []);
					return true;
				}, true, x + 300, 142 + i * 42, 230, 40, TextGet("KinkyDungeonCheckpointLore-1"),
				-1 == KinkyDungeonCurrentLoreTab ? "#ffffff" : (newLore ? "#88ff88" : "#ffffff"), undefined, undefined, undefined, KinkyDungeonCurrentLoreTab != -1, KDButtonColor);
			} else {
				let index = i;
				DrawButtonKDEx("loretab" + i, (b) => {
					if (tabNames[index + KinkyDungeonCurrentLoreTabOffset]) {
						KinkyDungeonCurrentLoreTab = tabNames[index + KinkyDungeonCurrentLoreTabOffset];
						KinkyDungeonUpdateLore(localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : []);
					}
					return true;
				}, true, x + 300, 142 + i * 42, 230, 40, KinkyDungeonCurrentLoreTabs.includes(tabNames[i + KinkyDungeonCurrentLoreTabOffset]) ?
					TextGet("KinkyDungeonCheckpointLore" + tabNames[i + KinkyDungeonCurrentLoreTabOffset]) :
					TextGet("KinkyDungeonCheckpointLoreUnknown"),
					tabNames[i + KinkyDungeonCurrentLoreTabOffset] == KinkyDungeonCurrentLoreTab ? "#ffffff" : (newLore ? "#88ff88" :"#ffffff"),
					undefined, undefined, undefined, tabNames[i + KinkyDungeonCurrentLoreTabOffset] != KinkyDungeonCurrentLoreTab, KDButtonColor);
			}

		} else {
			if (i + KinkyDungeonCurrentLoreTabOffset > tabs.length + 3)
				KinkyDungeonCurrentLoreTabOffset = 0;
			break;
		}


		DrawButtonKDEx("loreUp", (b) => {
			if (KinkyDungeonCurrentLoreTabOffset > 0) KinkyDungeonCurrentLoreTabOffset -= 3;
			return true;
		}, true, x + 370, 30, 90, 40, "", KinkyDungeonCurrentLoreTabOffset > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.webp");
		DrawButtonKDEx("loreDown", (b) => {
			if (numTabs + KinkyDungeonCurrentLoreTabOffset < KinkyDungeonCurrentLoreTabs.length) KinkyDungeonCurrentLoreTabOffset += 3;
			return true;
		}, true, x + 370, 930, 90, 40, "", numTabs + KinkyDungeonCurrentLoreTabOffset < KinkyDungeonCurrentLoreTabs.length ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.webp");
	}

	let numNotes = 57;

	// Draw the lore itself
	DrawButtonKDEx("loreCurrentUp", (b) => {
		if (KinkyDungeonCurrentLoreItemOffset > 0) KinkyDungeonCurrentLoreItemOffset -= 3;
		return true;
	}, true, x + 100, 80, 90, 40, "", KinkyDungeonCurrentLoreItemOffset > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.webp");
	DrawButtonKDEx("loreCurrentDown", (b) => {
		if (numNotes + KinkyDungeonCurrentLoreItemOffset < KinkyDungeonCurrentLoreItems.length) KinkyDungeonCurrentLoreItemOffset += 3;
		return true;
	}, true, x + 100, 860, 90, 40, "", numNotes + KinkyDungeonCurrentLoreItemOffset < KinkyDungeonCurrentLoreItems.length ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.webp");
	for (i = 0; i < numNotes; i++) {
		let ii = Math.floor(i / 3);
		let xx = i % 3;
		if (i + KinkyDungeonCurrentLoreItemOffset < KinkyDungeonCurrentLoreItems.length) {
			let loreNum = KinkyDungeonCurrentLoreItems[i + KinkyDungeonCurrentLoreItemOffset];
			DrawButtonKDEx("loreItem" + loreNum, (b) => {
				KinkyDungeonCurrentLore = loreNum;
				return true;
			}, true, x + 100 * xx, 142 + (ii) * 42, 90, 40, "#" + loreNum,
			loreNum == KinkyDungeonCurrentLore ? "#ffffff" : (KinkyDungeonNewLoreList.includes(loreNum) ? "#88ff88": "#ffffff"),
			undefined, undefined, undefined, loreNum != KinkyDungeonCurrentLore, KDButtonColor);
		} else {
			if (i + KinkyDungeonCurrentLoreItemOffset > KinkyDungeonCurrentLoreItems.length + 3)
				KinkyDungeonCurrentLoreItemOffset = 0;
			break;
		}
	}

	KDDrawLoreRepTabs(xOffset);
}

function KDDrawLoreRepTabs(xOffset) {
	FillRectKD(kdcanvas, kdpixisprites, "mainlorebg", {
		Left: canvasOffsetX_ui + xOffset,
		Top: canvasOffsetY_ui - 150,
		Width: 1965 - (canvasOffsetX_ui),
		Height: 945,
		Color: "#000000",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.3
	});
	DrawRectKD(kdcanvas, kdpixisprites, "mainlorebg2", {
		Left: canvasOffsetX_ui + xOffset,
		Top: canvasOffsetY_ui - 150,
		Width: 1965 - (canvasOffsetX_ui),
		Height: 945,
		Color: "#000000",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.9
	});
	let scrollFunc = (amount) => {
		switch (KinkyDungeonDrawState) {
			case  "Logbook": KinkyDungeonDrawState = amount < 0 ? "Collection"  : "Quest"; break;
			case  "Quest": KinkyDungeonDrawState = amount < 0 ? "Logbook"  : "Reputation"; break;
			case  "Reputation": KinkyDungeonDrawState = amount < 0 ? "Quest"  : "Collection"; break;
			case  "Collection": KinkyDungeonDrawState = amount < 0 ? "Reputation"  : "Logbook"; break;
		}
	};
	let xxstart = 550;
	let num = 4;
	let width = 1100 / num;
	let II = 0;
	DrawButtonKDExScroll("TabLore", scrollFunc, (b) => {
		KinkyDungeonDrawState = "Logbook";
		return true;
	}, true, xxstart + II*width, 10, width - 10, 40, TextGet("KinkyDungeonLog"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Logbook", KDButtonColor); II++;
	DrawButtonKDExScroll("TabQuest", scrollFunc, (b) => {
		KinkyDungeonDrawState = "Quest";
		return true;
	}, true, xxstart + II*width, 10, width - 10, 40, TextGet("KinkyDungeonQuest"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Quest", KDButtonColor); II++;
	DrawButtonKDExScroll("TabRep", scrollFunc, (b) => {
		KinkyDungeonDrawState = "Reputation";
		return true;
	}, true, xxstart + II*width, 10, width - 10, 40, TextGet("KinkyDungeonReputation"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Reputation", KDButtonColor); II++;
	DrawButtonKDExScroll("TabCollection", scrollFunc, (b) => {
		KinkyDungeonDrawState = "Collection";
		return true;
	}, true, xxstart + II*width, 10, width - 10, 40, TextGet("KinkyDungeonCollection"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Collection", KDButtonColor); II++;
}

function KinkyDungeonUpdateLore(exploredLore) {
	KinkyDungeonCurrentLoreItems = [];
	for (let lore of exploredLore) {
		if (KinkyDungeonCurrentLoreTab == -1 && KinkyDungeonLore.includes(lore)) {
			KinkyDungeonCurrentLoreItems.push(lore);
		} else if (KinkyDungeonCheckpointLore[KinkyDungeonCurrentLoreTab] && KinkyDungeonCheckpointLore[KinkyDungeonCurrentLoreTab].includes(lore)) {
			KinkyDungeonCurrentLoreItems.push(lore);
		}
	}
}

function KinkyDungeonHandleLore() {
	return true;
}
