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
let KinkyDungeonLore = [0, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22];
let KinkyDungeonCheckpointLore = {
	"School": [20, 21, 22],
	"Enemy": [4, 5, 6, 19, 101, 102, 103, 104, 105, 106, 107, 108, 109, 111, 112, 1100, 1104, 201, 203],
	/*0*/ "grv": [1, 19],
	/*1*/ "cat": [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 9,],
	/*2*/ "jng": [201, 202, 203, 204, 205],

	/*11*/ "tmb": [9, 1100, 1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112],

};
let KinkyDungeonLoreScale = 1.5;
let KinkyDungeonRepeatLoreChance = 0.4; // Chance you will find a duplicate piece of lore
let KinkyDungeonGenericLoreChance = 0.33; // Chance you will find a generic note instead of a previous note

let KinkyDungeonNewLoreList = localStorage.getItem("kinkydungeonnewlore") ? JSON.parse(localStorage.getItem("kinkydungeonnewlore")) : [];

function KinkyDungeonNewLore() {
	let availableLore = [];
	let exploredLore = localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : [];
	let newLore = localStorage.getItem("kinkydungeonnewlore") ? JSON.parse(localStorage.getItem("kinkydungeonnewlore")) : [];

	let checkpoint = KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint];

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
	DrawImageZoomCanvas(KinkyDungeonRootDirectory + "MagicBook.png", MainCanvas, 0, 0, 640, 483, canvasOffsetX_ui, canvasOffsetY_ui - 100, 640*KinkyDungeonLoreScale, 483*KinkyDungeonLoreScale, false);

	// Draw the current note
	MainCanvas.textAlign = "left";

	let wrapAmount = TranslationLanguage == 'CN' ? 19 : 45;
	let loreOrig = TextGet("KinkyDungeonLore" + KinkyDungeonCurrentLore).split('|');
	let lore = [];
	for (let str of loreOrig) {
		lore.push(...(KinkyDungeonWordWrap(str, wrapAmount, 45).split('\n')));
	}
	let i = 0;
	for (let N = 0; N < lore.length; N++) {
		DrawTextFitKD(lore[N],
			canvasOffsetX_ui + 640*KinkyDungeonLoreScale/8, canvasOffsetY_ui - 100 + 483*KinkyDungeonLoreScale/6 + i * 40, 0.75 * 640*KinkyDungeonLoreScale, "#000000", KDTextTan); i++;}

	if (KinkyDungeonNewLoreList.includes(KinkyDungeonCurrentLore)) {
		KinkyDungeonNewLoreList.splice(KinkyDungeonNewLoreList.indexOf(KinkyDungeonCurrentLore), 1);
		localStorage.setItem("kinkydungeonnewlore", JSON.stringify(KinkyDungeonNewLoreList));
	}

	MainCanvas.textAlign = "center";

	// Draw the tabs
	let tabs = Object.values(KinkyDungeonCheckpointLore);
	let tabNames = Object.keys(KinkyDungeonCheckpointLore);
	let numTabs = 20;
	for (i = -1; i < numTabs; i++) {
		if (i + KinkyDungeonCurrentLoreTabOffset < tabs.length) {
			let newLore = false;
			for (let ll of KinkyDungeonNewLoreList) {
				if ((i == -1 && KinkyDungeonLore.includes(ll)) || (i >= 0 && tabNames[i + KinkyDungeonCurrentLoreTabOffset].includes(ll))) {
					newLore = true;
					break;
				}
			}
			if (i == -1)
				DrawButtonVis(1800, 142 + i * 42, 190, 40, TextGet("KinkyDungeonCheckpointLore-1"), tabNames[i + KinkyDungeonCurrentLoreTabOffset] == KinkyDungeonCurrentLoreTab ? "white" : (newLore ? "#cdcdcd" :"#888888"));
			else
				DrawButtonVis(1800, 142 + i * 42, 190, 40, KinkyDungeonCurrentLoreTabs.includes(tabNames[i + KinkyDungeonCurrentLoreTabOffset]) ?
					TextGet("KinkyDungeonCheckpointLore" + tabNames[i + KinkyDungeonCurrentLoreTabOffset]) :
					TextGet("KinkyDungeonCheckpointLoreUnknown"),
					tabNames[i + KinkyDungeonCurrentLoreTabOffset] == KinkyDungeonCurrentLoreTab ? "white" : (newLore ? "#cdcdcd" :"#888888"));
		} else {
			if (i + KinkyDungeonCurrentLoreTabOffset > tabs.length + 3)
				KinkyDungeonCurrentLoreTabOffset = 0;
			break;
		}


		DrawButtonVis(1850, 30, 90, 40, "", KinkyDungeonCurrentLoreTabOffset > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.png");
		DrawButtonVis(1850, 930, 90, 40, "", numTabs + KinkyDungeonCurrentLoreTabOffset < KinkyDungeonCurrentLoreTabs.length ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.png");
	}

	let numNotes = 57;
	DrawButtonVis(1550, 80, 90, 40, "", KinkyDungeonCurrentLoreItemOffset > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.png");
	DrawButtonVis(1550, 860, 90, 40, "", numNotes + KinkyDungeonCurrentLoreItemOffset < KinkyDungeonCurrentLoreItems.length ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.png");
	for (i = 0; i < numNotes; i++) {
		let ii = Math.floor(i / 3);
		let xx = i % 3;
		if (i + KinkyDungeonCurrentLoreItemOffset < KinkyDungeonCurrentLoreItems.length) {
			let loreNum = KinkyDungeonCurrentLoreItems[i + KinkyDungeonCurrentLoreItemOffset];
			DrawButtonVis(1450 + 100 * xx, 142 + (ii) * 42, 90, 40, "#" + loreNum, loreNum == KinkyDungeonCurrentLore ? "white" : (KinkyDungeonNewLoreList.includes(loreNum) ? "#cdcdcd": "#888888"));
		} else {
			if (i + KinkyDungeonCurrentLoreItemOffset > KinkyDungeonCurrentLoreItems.length + 3)
				KinkyDungeonCurrentLoreItemOffset = 0;
			break;
		}
	}
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
	let tabs = Object.values(KinkyDungeonCheckpointLore);
	let tabNames = Object.keys(KinkyDungeonCheckpointLore);
	let numTabs = 20;
	for (let i = -1; i + KinkyDungeonCurrentLoreTabOffset < tabs.length && i < numTabs; i++) {
		if (MouseIn(1800, 142 + i * 42, 190, 40) && (KinkyDungeonCurrentLoreTabs.includes(tabNames[i + KinkyDungeonCurrentLoreTabOffset]) || i == -1)) {
			if (tabNames[i + KinkyDungeonCurrentLoreTabOffset]) {
				KinkyDungeonCurrentLoreTab = tabNames[i + KinkyDungeonCurrentLoreTabOffset];
				KinkyDungeonUpdateLore(localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : []);
			} else if (i == -1) {
				KinkyDungeonCurrentLoreTab = -1;
				KinkyDungeonUpdateLore(localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : []);
			}
		}
	}

	if (MouseIn(1850, 30, 90, 40) && KinkyDungeonCurrentLoreTabOffset > 0) KinkyDungeonCurrentLoreTabOffset -= 3;
	if (MouseIn(1850, 930, 90, 40) && numTabs + KinkyDungeonCurrentLoreTabOffset < KinkyDungeonCurrentLoreTabs.length) KinkyDungeonCurrentLoreTabOffset += 3;

	let numNotes = 57;
	if (MouseIn(1550, 80, 90, 40) && KinkyDungeonCurrentLoreItemOffset > 0) KinkyDungeonCurrentLoreItemOffset -= 3;
	if (MouseIn(1550, 860, 90, 40) && numNotes + KinkyDungeonCurrentLoreItemOffset < KinkyDungeonCurrentLoreItems.length) KinkyDungeonCurrentLoreItemOffset += 3;
	for (let i = 0; i < numNotes; i++) {
		let ii = Math.floor(i / 3);
		let xx = i % 3;
		if (i + KinkyDungeonCurrentLoreItemOffset < KinkyDungeonCurrentLoreItems.length) {
			let loreNum = KinkyDungeonCurrentLoreItems[i + KinkyDungeonCurrentLoreItemOffset];
			if (MouseIn(1450 + 100 * xx, 142 + (ii) * 42, 90, 40)) {
				KinkyDungeonCurrentLore = loreNum;
			}
		} else {
			break;
		}
	}

	return true;
}
