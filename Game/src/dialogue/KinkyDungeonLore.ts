"use strict";


let KDLore: Record<string, Record<string, Lore>> = {
};

let KinkyDungeonCurrentLore = "Cover";
let KDLoreImg: Record<string, string> = {};
let KDLoreEnemy: Record<string, string> = {};
let KinkyDungeonCurrentLoreTab: string = "Default";
let KinkyDungeonCurrentLoreTabs: string[] = ["Default"];
let KinkyDungeonCurrentLoreItems: string[] = [];
let KinkyDungeonCurrentLoreItemOffset = 0;
let KinkyDungeonCurrentLoreTabOffset = 0;
let KinkyDungeonLoreScale = 1.5;
let KinkyDungeonRepeatLoreChance = 0.4; // Chance you will find a duplicate piece of lore
let KinkyDungeonGenericLoreChance = 0.33; // Chance you will find a generic note instead of a previous note

let KinkyDungeonNewLoreList: string[] = localStorage.getItem("kdnewLore") ? JSON.parse(localStorage.getItem("kdnewLore")) : ["Cover"];

function KinkyDungeonNewLore() {
	let availableLore: string[] = [];

	let exploredLore: Record<string, number> = localStorage.getItem("kdexpLore") ? JSON.parse(localStorage.getItem("kdexpLore")) : {Cover: 1};
	let newLore = localStorage.getItem("kdnewLore") ? JSON.parse(localStorage.getItem("kdnewLore")) : ["Cover"];

	let altType = KDGetAltType(MiniGameKinkyDungeonLevel, KDMapData.MapMod, KDMapData.RoomType);

	let checkpoint = (altType?.loreCheckpoint || KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint);

	if (!exploredLore || Object.keys(exploredLore).length == 0) {
		availableLore = [];
		for (let lore of Object.keys(KDLore[checkpoint])) {
			if (!KDLore[checkpoint][lore].condition || KDLore[checkpoint][lore].condition())
				availableLore.push(lore);
		}
	} else if (KDLore[checkpoint]) {
		for (let lore of Object.keys(KDLore[checkpoint])) {
			if (!KDLore[checkpoint][lore].condition || KDLore[checkpoint][lore].condition())
				availableLore.push(lore);
		}

		if (Math.random() < KinkyDungeonRepeatLoreChance) {
			for (let lore of Object.keys(KDLore.Default)) {
				if (!KDLore.Default[lore].condition || KDLore.Default[lore].condition())
					availableLore.push(lore);
			}
			//availableLore = Object.keys(KDLore.Default);
		}//else Object.values(KDLore).forEach((tab) => {availableLore.push(...Object.keys(tab));});

	}

	let result = false;

	if (availableLore.length > 0) {
		KinkyDungeonCurrentLore = availableLore[Math.floor(Math.random() * availableLore.length)];
		if (!exploredLore[KinkyDungeonCurrentLore]) {

			KinkyDungeonSendActionMessage(5, TextGet("ItemPickupLore"), "white", 2, false, false, undefined, "Items");
			exploredLore[KinkyDungeonCurrentLore] = 1;
			newLore.push(KinkyDungeonCurrentLore);

			KinkyDungeonCurrentLoreTab = "Default";
			for (let tab of Object.keys(KDLore)) {
				if (KDLore[tab][KinkyDungeonCurrentLore] && !KDLore[tab][KinkyDungeonCurrentLore].noShow) {
					KinkyDungeonCurrentLoreTab = tab;
					break;
				}
			}
		} else {
			KinkyDungeonSendActionMessage(4, TextGet("ItemPickupLoreOld"), "gray", 2, false, false, undefined, "Ambient");
			KinkyDungeonCurrentLore = CommonRandomItemFromList("", Object.keys(KDLore.Default));
		}
		result = true;
	} else {
		KinkyDungeonCurrentLore = CommonRandomItemFromList("", Object.keys(KDLore.Default));
		if (!exploredLore[KinkyDungeonCurrentLore]) {

			KinkyDungeonSendActionMessage(5, TextGet("ItemPickupLore"), "white", 2, false, false, undefined, "Items");
			exploredLore[KinkyDungeonCurrentLore] = 1;
			newLore.push(KinkyDungeonCurrentLore);

			KinkyDungeonCurrentLoreTab = "Default";
			for (let tab of Object.keys(KDLore)) {
				if (KDLore[tab][KinkyDungeonCurrentLore] && !KDLore[tab][KinkyDungeonCurrentLore].noShow) {
					KinkyDungeonCurrentLoreTab = tab;
					break;
				}
			}
		} else {
			KinkyDungeonSendActionMessage(4, TextGet("ItemPickupLoreOld"), "gray", 2, false, false, undefined, "Ambient");
			KinkyDungeonCurrentLore = CommonRandomItemFromList("", Object.keys(KDLore.Default));
		}
	}

	localStorage.setItem("kdexpLore", JSON.stringify(exploredLore));
	KinkyDungeonNewLoreList = newLore;
	localStorage.setItem("kdnewLore", JSON.stringify(newLore));

	KinkyDungeonUpdateTabs(exploredLore);

	return result;
}

function KinkyDungeonUpdateTabs(exploredLore: Record<string, number>) {
	KinkyDungeonCurrentLoreTabs = ["Default"];
	for (let lore of Object.keys(exploredLore)) {
		for (let tab of Object.keys(KDLore)) {
			if (KDLore[tab][lore] && !KDLore[tab][lore].noShow) KinkyDungeonCurrentLoreTabs.push(tab);
		}
	}
}

function KinkyDungeonDrawLore() {
	let xOffset = -125;


	let x = 1300;

	if (KDToggles.SpellBook) {
		KDTextTan = KDTextTanSB;
		KDBookText = KDBookTextSB;
		KDDraw(kdcanvas, kdpixisprites, "magicbook", KinkyDungeonRootDirectory + "MagicBookNew.png", canvasOffsetX_ui - 100, canvasOffsetY_ui - 100, 640*KinkyDungeonLoreScale, 520*KinkyDungeonLoreScale);
	} else {
		KDTextTan = KDTextTanNew;
		KDBookText = KDBookTextNew;
		FillRectKD(kdcanvas, kdpixisprites, "magicbook", {
			Left: canvasOffsetX_ui,
			Top: canvasOffsetY_ui- 20,
			Width: 550*KinkyDungeonLoreScale - 30,
			Height: 400*KinkyDungeonLoreScale,
			Color: "#161920",
			LineWidth: 1,
			zIndex: -19,
			alpha: 1
		});
		DrawRectKD(kdcanvas, kdpixisprites, "magicbook2", {
			Left: canvasOffsetX_ui,
			Top: canvasOffsetY_ui - 20,
			Width: 550*KinkyDungeonLoreScale - 30,
			Height: 400*KinkyDungeonLoreScale,
			Color: KDBorderColor,
			LineWidth: 1,
			zIndex: -19,
			alpha: 0.9
		});
	}



	// Draw the current note

	//let wrapAmount = KDBigLanguages.includes(TranslationLanguage) ? 19 : 45;
	let loreName = TextGet("KDLoreTitle" + KinkyDungeonCurrentLore);
	let loreOrig = TextGet("KDLoreText" + KinkyDungeonCurrentLore).split('|');
	let lore = [];
	let mult = KDGetFontMult();
	if (KDLoreEnemy[KinkyDungeonCurrentLore]) mult *= 0.74;
	for (let str of loreOrig) {
		lore.push(...(KinkyDungeonWordWrap(str, 26*mult, 60*mult).split('\n')));
	}
	let i = 0;
	DrawTextFitKD(loreName,
		0.75 * 640*KinkyDungeonLoreScale * 0.525
		+ canvasOffsetX_ui - 100 + 640*KinkyDungeonLoreScale/8, canvasOffsetY_ui - 100 + 483*KinkyDungeonLoreScale/6 + i * 40, 0.75 * 640*KinkyDungeonLoreScale, KDBookText, KDTextTan, 36, "center");
	if (KDLoreImg[KinkyDungeonCurrentLore]) {
		i += 0.7;
		let imgwidth = 200;
		let images = KDLoreImg[KinkyDungeonCurrentLore].split('|');
		for (let ii = 0; ii < images.length; ii++) {
			KDDraw(kdcanvas, kdpixisprites, "kdlorimage" + ii,
				KinkyDungeonRootDirectory + images[ii],
				0.75 * 640*KinkyDungeonLoreScale * (0.525) + imgwidth * ii - (imgwidth/2 * (images.length))
			+ canvasOffsetX_ui - 100 + 640*KinkyDungeonLoreScale/8, canvasOffsetY_ui - 100 + 483*KinkyDungeonLoreScale/6 + i * 40,
				imgwidth, imgwidth, 0, undefined, undefined, undefined, undefined, true
			);
		}
	}
	if (KDLoreEnemy[KinkyDungeonCurrentLore] && KinkyDungeonGetEnemyByName(KDLoreEnemy[KinkyDungeonCurrentLore])) {
		let enemy = KinkyDungeonGetEnemyByName(KDLoreEnemy[KinkyDungeonCurrentLore]);
		let armor = (enemy.armor || 0);
		let spellResist = (enemy.spellResist || 0);
		let block_phys = (enemy.Resistance?.block_phys || 0);
		let block_magic = (enemy.Resistance?.block_magic || 0);
		let TooltipList = [];

		if (block_phys) {
			let st = TextGet("KinkyDungeonTooltipBlockPhys").replace("AMOUNT", "" + Math.round(10* block_phys)
			);
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: KDTextGray0,
				size: 20,
			});
		}
		if (block_magic) {
			let st = TextGet("KinkyDungeonTooltipBlockMagic").replace("AMOUNT", "" + Math.round(10* block_magic)
			);
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: KDTextGray0,
				size: 20,
			});
		}
		if (armor) {
			let st = TextGet("KinkyDungeonTooltipArmor").replace("AMOUNT", "" + Math.round(10* armor) + (block_phys ? `(+${Math.round(10* block_phys)})` : ""));
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: KDTextGray0,
				size: 20,
			});
		}
		if (spellResist) {
			let st = TextGet("KinkyDungeonTooltipSpellResist").replace("AMOUNT", "" + Math.round(10* spellResist) + (block_magic ? `(+${Math.round(10* block_magic)})` : ""));
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: KDTextGray0,
				size: 20,
			});
		}
		if (enemy.tags.unstoppable) {
			let st = TextGet("KDunstoppable");
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: "#000000",
				size: 20,
			});
		} else if (enemy.tags.unflinching) {
			let st = TextGet("KDunflinching");
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: "#000000",
				size: 20,
			});
		} else if (enemy.tags.relentless) {
			let st = TextGet("KDrelentless");
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: "#000000",
				size: 20,
			});
		}
		if (enemy.tags?.bulwark) {
			let st = TextGet("KDBulwark");
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: "#000000",
				size: 20,
			});
		}
		if (enemy.Resistance?.toughArmorAlways) {
			let st = TextGet("KDAbsoluteArmor");
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: "#000000",
				size: 20,
			});
		} else if (enemy.Resistance?.toughArmor) {
			let st = TextGet("KDToughArmor");
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: "#000000",
				size: 20,
			});
		}

		if (enemy.disarm) {
			let dt = KinkyDungeonDamageTypes[enemy.dmgType];
			if (dt) {
				let st = TextGet("KDTooltipDisarm").replace("DISARMCHANCE", "" + Math.round(enemy.disarm * 100));
				TooltipList.push({
					str: st,
					fg: "#ffaa55",
					bg: "#000000",
					size: 20,
				});
			}
		}

		if (enemy.dmgType) {
			let dt = KinkyDungeonDamageTypes[enemy.dmgType];
			if (dt) {
				let st = TextGet("KinkyDungeonTooltipDealsDamage").replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + enemy.dmgType));
				TooltipList.push({
					str: st,
					fg: dt.color,
					bg: dt.bg,
					size: 20,
				});
			}
		}
		if (enemy.blindSight > 0) {
			let st = TextGet("KDBlindsight");
			TooltipList.push({
				str: st,
				fg: "#ffffff",
				bg: "#000000",
				size: 20,
			});
		}

		let map = Object.assign({}, enemy.tags);
		if (enemy.spellResist)
			map.magic = true;
		if (enemy.Resistance?.profile) {
			for (let p of enemy.Resistance?.profile) {
				for (let dt of Object.keys(KDResistanceProfiles[p])) {
					map[dt] = true;
				}
			}
		}
		let list = Array.from(Object.keys(map));
		let magic = false;
		let repeats: Record<string, boolean> = {};
		//for (let t of list) {
		let t = list;
		for (let dt of Object.values(KinkyDungeonDamageTypes)) {
			if ((t.includes(dt.name + "resist") || t.includes(dt.name + "weakness") || t.includes(dt.name + "immune") || t.includes(dt.name + "severeweakness"))
				|| (dt.name == "magic" && t.includes("magic"))) {
				let mm = 1.0;
				if (t.includes(dt.name + "resist")) mm = 0.5;
				else if (t.includes(dt.name + "weakness")) mm = 1.5;
				else if (t.includes(dt.name + "immune")) mm = 0;
				else if (t.includes(dt.name + "severeweakness")) mm = 2.0;
				if (dt.name == "magic" && !magic) {
					magic = true;
				}
				let st = TextGet("KinkyDungeonTooltipWeakness")
					.replace("MULTIPLIER", "" + Math.round(mm * 100)/100)
					.replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType"+ dt.name));
				let name = TextGet("KinkyDungeonDamageType"+ dt.name);

				if (!repeats.DR) {
					TooltipList.push({
						str: "",
						fg: "#ffffff",
						bg: "#000000",
						size: 10,
					});
					TooltipList.push({
						str: TextGet("KDTooltipDamageResists"),
						fg: "#ffffff",
						bg: "#000000",
						size: 20,
					});
					repeats.DR = true;
				}
				if (!repeats[name])
					TooltipList.push({
						str: st,
						fg: dt.color,
						bg: dt.bg,
						size: 18,
					});
				repeats[name] = true;
			}
		}

		let extra = 5;
		let YY = canvasOffsetY_ui - 20 + 400*KinkyDungeonLoreScale;
		TooltipList.forEach((listItem) => {
			YY -= (extra + listItem.size);
		});
		for (let listItem of TooltipList) {
			DrawTextFitKD(listItem.str,
				canvasOffsetX_ui - 100 + 640*KinkyDungeonLoreScale/8 + 0.575 * 640*KinkyDungeonLoreScale,
				YY,
				0.22 * 640*KinkyDungeonLoreScale,
				listItem.fg, listItem.bg,
				listItem.size, "left", 0);
			YY += extra + listItem.size;
		}
	}
	i = KDLoreImg[KinkyDungeonCurrentLore] ? 6 : 2;
	for (let N = 0; N < lore.length; N++) {
		DrawTextFitKD(lore[N],
			canvasOffsetX_ui - 100 + 640*KinkyDungeonLoreScale/8, canvasOffsetY_ui - 100 + 483*KinkyDungeonLoreScale/6 + i * 40, 0.75 * 640*KinkyDungeonLoreScale, KDBookText, KDTextTan, 20, "left"); i++;}

	if (KinkyDungeonNewLoreList.includes(KinkyDungeonCurrentLore)) {
		KinkyDungeonNewLoreList.splice(KinkyDungeonNewLoreList.indexOf(KinkyDungeonCurrentLore), 1);
		localStorage.setItem("kdnewLore", JSON.stringify(KinkyDungeonNewLoreList));
	}


	// Draw the tabs
	let tabs = Object.values(KDLore);
	let tabNames = Object.keys(KDLore);
	let numTabs = 20;
	for (i = 0; i < numTabs; i++) {
		if (i + KinkyDungeonCurrentLoreTabOffset < tabs.length) {
			let newLore = false;

			for (let ll of KinkyDungeonNewLoreList) {
				if ((i == -1 && KDLore.Default[ll]) || (i >= 0 && KDLore[tabNames[i + KinkyDungeonCurrentLoreTabOffset]][ll])) {
					newLore = true;
					break;
				}
			}

			if (i == -1) {
				DrawButtonKDEx("loretab" + i, (_b) => {
					KinkyDungeonCurrentLoreTab = "Default";
					KinkyDungeonUpdateLore(localStorage.getItem("kdexpLore") ? JSON.parse(localStorage.getItem("kdexpLore")) : {});
					return true;
				}, true, x + 300, 142 + i * 42, 230, 40, TextGet("KinkyDungeonCheckpointLore-1"),
				"" == KinkyDungeonCurrentLoreTab ? "#ffffff" : (newLore ? "#88ff88" : "#ffffff"), undefined, undefined, undefined, KinkyDungeonCurrentLoreTab != "", KDButtonColor);
			} else {
				let index = i;
				DrawButtonKDEx("loretab" + i, (_b) => {
					if (tabNames[index + KinkyDungeonCurrentLoreTabOffset]) {
						KinkyDungeonCurrentLoreTab = tabNames[index + KinkyDungeonCurrentLoreTabOffset];
						KinkyDungeonUpdateLore(localStorage.getItem("kdexpLore") ? JSON.parse(localStorage.getItem("kdexpLore")) : {});
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


		DrawButtonKDEx("loreUp", (_b) => {
			if (KinkyDungeonCurrentLoreTabOffset > 0) KinkyDungeonCurrentLoreTabOffset -= 3;
			return true;
		}, true, x + 370, 30, 90, 40, "", KinkyDungeonCurrentLoreTabOffset > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.png");
		DrawButtonKDEx("loreDown", (_b) => {
			if (numTabs + KinkyDungeonCurrentLoreTabOffset < KinkyDungeonCurrentLoreTabs.length) KinkyDungeonCurrentLoreTabOffset += 3;
			return true;
		}, true, x + 370, 930, 90, 40, "", numTabs + KinkyDungeonCurrentLoreTabOffset < KinkyDungeonCurrentLoreTabs.length ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.png");
	}

	let numNotes = 57;

	// Draw the lore itself
	DrawButtonKDEx("loreCurrentUp", (_b) => {
		if (KinkyDungeonCurrentLoreItemOffset > 0) KinkyDungeonCurrentLoreItemOffset -= 3;
		return true;
	}, true, x + 100, 80, 90, 40, "", KinkyDungeonCurrentLoreItemOffset > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.png");
	DrawButtonKDEx("loreCurrentDown", (_b) => {
		if (numNotes + KinkyDungeonCurrentLoreItemOffset < KinkyDungeonCurrentLoreItems.length) KinkyDungeonCurrentLoreItemOffset += 3;
		return true;
	}, true, x + 100, 860, 90, 40, "", numNotes + KinkyDungeonCurrentLoreItemOffset < KinkyDungeonCurrentLoreItems.length ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.png");
	for (i = 0; i < numNotes; i++) {
		let ii = Math.floor(i / 2);
		let xx = i % 2;
		if (i + KinkyDungeonCurrentLoreItemOffset < KinkyDungeonCurrentLoreItems.length) {
			let loreNum = KinkyDungeonCurrentLoreItems[i + KinkyDungeonCurrentLoreItemOffset];
			DrawButtonKDEx("loreItem" + loreNum, (_b) => {
				KinkyDungeonCurrentLore = loreNum;
				return true;
			}, true, x + 150 * xx, 142 + (ii) * 42, 145, 40, TextGet("KDLoreLabel" + loreNum),
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

function KDDrawLoreRepTabs(xOffset: number = -125) {
	FillRectKD(kdcanvas, kdpixisprites, "mainlorebg", {
		Left: canvasOffsetX_ui + xOffset,
		Top: canvasOffsetY_ui - 150,
		Width: 1965 - (canvasOffsetX_ui),
		Height: 1000 - (canvasOffsetY_ui - 150),
		Color: KDInvBG,
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.7
	});
	DrawRectKD(kdcanvas, kdpixisprites, "mainlorebg2", {
		Left: canvasOffsetX_ui + xOffset,
		Top: canvasOffsetY_ui - 150,
		Width: 1965 - (canvasOffsetX_ui),
		Height: 1000 - (canvasOffsetY_ui - 150),
		Color: "#222222",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.9
	});
	let scrollFunc = (amount: number) => {
		switch (KinkyDungeonDrawState) {
			case  "Logbook": KinkyDungeonDrawState = amount < 0 ? "Quest"  : "Reputation"; break;
			case  "Reputation": KinkyDungeonDrawState = amount < 0 ? "Logbook"  : "Quest"; break;
			case  "Quest": KinkyDungeonDrawState = amount < 0 ? "Reputation"  : "JourneyMap"; break;
			case  "JourneyMap": KinkyDungeonDrawState = amount < 0 ? "Quest"  : "Logbook"; break;
			//case  "Collection": KinkyDungeonDrawState = amount < 0 ? "Reputation"  : "Facilities"; break;
			//case  "Facilities": KinkyDungeonDrawState = amount < 0 ? "Collection"  : "Logbook"; break;
		}
	};
	let xxstart = 530;
	let yy = 40;
	let num = 4;
	let width = 1100 / num;
	let II = 0;
	DrawButtonKDExScroll("TabLore", scrollFunc, (_b) => {
		KinkyDungeonDrawState = "Logbook";
		return true;
	}, true, xxstart + II*width, yy, width - 10, 40, TextGet("KinkyDungeonLog"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Logbook", KDButtonColor); II++;
	DrawButtonKDExScroll("TabRep", scrollFunc, (_b) => {
		KinkyDungeonDrawState = "Reputation";
		return true;
	}, true, xxstart + II*width, yy, width - 10, 40, TextGet("KinkyDungeonReputation"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Reputation", KDButtonColor); II++;
	DrawButtonKDExScroll("TabQuest", scrollFunc, (_b) => {
		KinkyDungeonDrawState = "Quest";
		return true;
	}, true, xxstart + II*width, yy, width - 10, 40, TextGet("KinkyDungeonQuest"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Quest", KDButtonColor); II++;
	DrawButtonKDExScroll("TabJourneyMap", scrollFunc, (_b) => {
		KinkyDungeonDrawState = "JourneyMap";
		return true;
	}, true, xxstart + II*width, yy, width - 10, 40, TextGet("KinkyDungeonJourneyMap"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "JourneyMap", KDButtonColor); II++;
	/*DrawButtonKDExScroll("TabCollection", scrollFunc, (b) => {
		KinkyDungeonDrawState = "Collection";
		return true;
	}, true, xxstart + II*width, yy, width - 10, 40, TextGet("KinkyDungeonCollection"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Collection", KDButtonColor); II++;
	DrawButtonKDExScroll("TabFacilities", scrollFunc, (b) => {
		KinkyDungeonDrawState = "Facilities";
		return true;
	}, true, xxstart + II*width, yy, width - 10, 40, TextGet("KinkyDungeonFacilities"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Facilities", KDButtonColor); II++;
*/

}

let KDInvBG = "#222222";


function KDDrawInventoryTabs(xOffset: number, drawBG: boolean = true): void {
	if (drawBG) {
		FillRectKD(kdcanvas, kdpixisprites, "mainlorebg", {
			Left: canvasOffsetX_ui + xOffset,
			Top: canvasOffsetY_ui - 150,
			Width: 1965 - (canvasOffsetX_ui),
			Height: 1000 - (canvasOffsetY_ui - 150),
			Color: KDInvBG,
			LineWidth: 1,
			zIndex: -19,
			alpha: 0.7
		});
		DrawRectKD(kdcanvas, kdpixisprites, "mainlorebg2", {
			Left: canvasOffsetX_ui + xOffset,
			Top: canvasOffsetY_ui - 150,
			Width: 1965 - (canvasOffsetX_ui),
			Height: 1000 - (canvasOffsetY_ui - 150),
			Color: "#000000",
			LineWidth: 1,
			zIndex: -19,
			alpha: 0.9
		});
	}
	let scrollFunc = (amount: number) => {
		switch (KinkyDungeonDrawState) {
			case  "Inventory": KinkyDungeonDrawState = amount < 0 ? "Facilities"  : "Collection"; break;
			case  "Collection": KinkyDungeonDrawState = amount < 0 ? "Inventory"  : "Facilities"; break;
			case  "Facilities": KinkyDungeonDrawState = amount < 0 ? "Collection"  : "Inventory"; break;
		}
	};
	let xxstart = 530;
	let yy = 40;
	let num = 4;
	let width = 1100 / num;
	let II = 0;
	DrawButtonKDExScroll("TabLore", scrollFunc, (_b) => {
		KinkyDungeonDrawState = "Inventory";
		return true;
	}, true, xxstart + II*width, yy, width - 10, 40, TextGet("KinkyDungeonInventory"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Inventory", KDButtonColor); II++;
	DrawButtonKDExScroll("TabCollection", scrollFunc, (_b) => {
		KinkyDungeonDrawState = "Collection";
		KDRefreshCharacter.set(KinkyDungeonPlayer, true);
		KDCollectionTab = "";
		KDCurrentFacilityTarget = "";
		KDFacilityCollectionCallback = null;
		return true;
	}, true, xxstart + II*width, yy, width - 10, 40, TextGet("KinkyDungeonCollection"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Collection", KDButtonColor); II++;
	DrawButtonKDExScroll("TabFacilities", scrollFunc, (b) => {
		KinkyDungeonDrawState = "Facilities";
		return true;
	}, true, xxstart + II*width, yy, width - 10, 40, TextGet("KinkyDungeonFacilities"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonDrawState != "Facilities", KDButtonColor); II++;


}



/**
 * @param exploredLore
 */
function KinkyDungeonUpdateLore(exploredLore: Record<string, number>) {
	KinkyDungeonCurrentLoreItems = [];
	if (!KinkyDungeonCurrentLoreTab) KinkyDungeonCurrentLoreTab = "Default";
	if (KDLore[KinkyDungeonCurrentLoreTab])
		for (let lore of Object.entries(KDLore[KinkyDungeonCurrentLoreTab])) {
			if (!lore[1].noShow && exploredLore[lore[0]]) {
				KinkyDungeonCurrentLoreItems.push(lore[0]);
			}
		}
}

function KinkyDungeonHandleLore() {
	return true;
}

/**
 * @param tabs
 * @param id
 * @param label
 * @param title
 * @param text
 * @param [condition]
 * @param [image]
 * @param [noShow]
 * @param [enemy]
 */
function KDNewLore(tabs: string | string[], id: string, label: string, title: string, text: string, condition?: () => boolean, image?: string, noShow?: string[], enemy?: string) {
	addTextKey("KDLoreText" + id, text);
	addTextKey("KDLoreTitle" + id, title);
	addTextKey("KDLoreLabel" + id, label);

	if (image) {
		KDLoreImg[id] = image;
	}
	if (enemy) {
		KDLoreEnemy[id] = enemy;
	}

	tabs = (typeof tabs === "string") ? [tabs] : tabs;

	for (let tab of tabs) {
		if (!KDLore[tab]) {
			KDLore[tab] = {};
		}

		KDLore[tab][id] = {
			condition: condition,
			noShow: !noShow ? undefined : noShow.includes(tab)
		};
	}
}
