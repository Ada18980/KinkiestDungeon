"use strict";


let KinkyDungeonFilters = [
	Consumable,
	Restraint,
	Weapon,
	Outfit,
	LooseRestraint,
	Misc,
];

/**
 * @type {Record<string, boolean>}
 */
let KDInventoryUseIconConfig = {};
KDInventoryUseIconConfig[Weapon] = true;
KDInventoryUseIconConfig[Consumable] = true;
KDInventoryUseIconConfig[LooseRestraint] = true;
KDInventoryUseIconConfig[Restraint] = true;

/** List of current filters for each filter type */
/**
 * @type {Record<string, Record<string, boolean>>}
 */
let KDFilterFilters = {};
KDFilterFilters[LooseRestraint] = {
	Rope: false,
	Leather: false,
	Metal: false,
	Latex: false,
	Wrapping: false,
	Ties: false,
	Belts: false,
	Chains: false,
	Cuffs: false,
	Armbinders: false,
	Straitjackets: false,
	BindingDress: false,
	Gags: false,
	Boots: false,
};

let KinkyDungeonCurrentFilter = KinkyDungeonFilters[0];
let KinkyDungeonCurrentPageInventory = 0;

let KinkyDungeonShowInventory = false;
let KinkyDungeonInventoryOffset = 0;


function KDCloseQuickInv() {
	KinkyDungeonShowInventory = false;
	for (let invStat of Object.keys(KDInventoryStatus)) {
		KDInventoryStatus[invStat] = false;
	}
	KDSortInventory(KinkyDungeonPlayerEntity);
	KDInventoryStatus.HideQuickInv = false;
}

function KDSwitchWeapon() {
	let previousWeapon = KDGameData.PreviousWeapon ? KDGameData.PreviousWeapon : null;
	if (!previousWeapon || KinkyDungeonInventoryGet(previousWeapon))
		KDSendInput("switchWeapon", {weapon: previousWeapon});
}

function KinkyDungeonHandleInventory() {
	let filteredInventory = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter);

	if (KinkyDungeonCurrentPageInventory > 0 && MouseIn(canvasOffsetX_ui + 100, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60)) {
		KinkyDungeonCurrentPageInventory -= 1;
		return true;
	}
	if (KinkyDungeonCurrentPageInventory < filteredInventory.length-1 && MouseIn(canvasOffsetX_ui + 640*KinkyDungeonBookScale - 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60)) {
		KinkyDungeonCurrentPageInventory += 1;
		return true;
	}

	for (let I = 0; I < KinkyDungeonFilters.length; I++)
		//if (I == 1) // KinkyDungeonFilterInventory(KinkyDungeonFilters[I]).length > 0 ||
		if (MouseIn(canvasOffsetX_ui + 640*KinkyDungeonBookScale - 20, canvasOffsetY_ui + 115 + I*65, 225, 60)) {
			KinkyDungeonCurrentFilter = KinkyDungeonFilters[I];
			KinkyDungeonCurrentPageInventory = 0;
			return true;
		}


	if (KinkyDungeonDrawInventorySelected(filteredInventory[KinkyDungeonCurrentPageInventory])) {
		if (KinkyDungeonCurrentFilter == Consumable && MouseIn(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 60)) {
			let item = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter)[KinkyDungeonCurrentPageInventory];
			if (!item || !item.name) return true;

			KDSendInput("consumable", {item: item.name, quantity: 1});
			//KinkyDungeonAttemptConsumable(item.name, 1);
		} else if (KinkyDungeonCurrentFilter == Weapon) {
			let weapon = ((filteredInventory[KinkyDungeonCurrentPageInventory] != null) ? filteredInventory[KinkyDungeonCurrentPageInventory].name : null);
			if (weapon && weapon != "Unarmed") {
				let equipped = weapon == KinkyDungeonPlayerWeapon;
				if (MouseIn(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 60) && !equipped) {
					KDSendInput("switchWeapon", {weapon: weapon});
				} else if (MouseIn(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 70, 350, 60) && equipped) {
					KDSendInput("unequipWeapon", {weapon: weapon});
				}
			}
		} else if (KinkyDungeonCurrentFilter == Outfit && MouseIn(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 60)) {
			let outfit = ((filteredInventory[KinkyDungeonCurrentPageInventory] != null) ? filteredInventory[KinkyDungeonCurrentPageInventory].name : null);
			let toWear = KinkyDungeonGetOutfit(outfit);
			if (toWear) {
				let dress = toWear.dress;
				if (dress == "JailUniform" && KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]])
					dress = KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]].defeat_outfit;
				KDSendInput("dress", {dress: dress, outfit: outfit});
			}
		} else if (KinkyDungeonCurrentFilter == LooseRestraint && MouseIn(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 60)) {
			let equipped = false;
			let newItem = null;
			let currentItem = null;

			if (filteredInventory[KinkyDungeonCurrentPageInventory]
				&& filteredInventory[KinkyDungeonCurrentPageInventory].item) {
				newItem = KDRestraint(filteredInventory[KinkyDungeonCurrentPageInventory].item);
				if (newItem) {
					currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
					if (!currentItem
						|| (KinkyDungeonLinkableAndStricter(KDRestraint(currentItem), newItem, currentItem) &&
							((newItem.linkCategory && KDLinkCategorySize(currentItem, newItem.linkCategory) + KDLinkSize(newItem) <= 1.0)
							|| (!newItem.linkCategory && !KDDynamicLinkList(currentItem, true).some((item) => {return newItem.name == item.name;}))))) {
						equipped = false;
					} else equipped = true;
				}
			}
			if (!equipped && newItem) {
				if (KDSendInput("equip", {name: newItem.name, group: newItem.Group, curse: filteredInventory[KinkyDungeonCurrentPageInventory].item.curse, currentItem: currentItem ? currentItem.name : undefined, events: Object.assign([], filteredInventory[KinkyDungeonCurrentPageInventory].item.events)})) return true;

			}
		}

	}

	return true;
}

function KinkyDungeonInventoryAddWeapon(Name) {
	if (!KinkyDungeonInventoryGetWeapon(Name) && KinkyDungeonWeapons[Name])
		KinkyDungeonInventoryAdd({name:Name, type:Weapon, events: Object.assign([], KinkyDungeonWeapons[Name].events), id: KinkyDungeonGetItemID()});
}

function KinkyDungeonInventoryAddLoose(Name, UnlockCurse) {
	if (!KinkyDungeonInventoryGetLoose(Name) || UnlockCurse)
		KinkyDungeonInventoryAdd({name: Name, type: LooseRestraint, curse: UnlockCurse, events:KDRestraint(KinkyDungeonGetRestraintByName(Name)).events, quantity: 1, id: KinkyDungeonGetItemID()});
	else {
		KinkyDungeonInventoryGetLoose(Name).quantity += 1;
	}
}

function KinkyDungeonInventoryAddOutfit(Name) {
	if (!KinkyDungeonInventoryGetOutfit(Name) && KinkyDungeonOutfitCache.has(Name))
		KinkyDungeonInventoryAdd({name:Name, type:Outfit, id: KinkyDungeonGetItemID()});
}
/**
 *
 * @param item {item}
 * @return {string}
 */
function KDInventoryType(item) {return item.type;}

function KinkyDungeonFullInventory() {
	let ret = [];
	for (let m of KinkyDungeonInventory.values()) {
		for (let item of m.values()) {
			ret.push(item);
		}
	}
	return ret;
}

function KinkyDungeonInventoryLength() {
	let size = 0;
	for (let m of KinkyDungeonInventory.values()) {
		size += m.size;
	}
	return size;
}

/**
 *
 * @param item {item}
 */
function KinkyDungeonInventoryAdd(item) {
	let type = KDInventoryType(item);
	if (KinkyDungeonInventory.has(type)) {
		KinkyDungeonInventory.get(type).set(item.name, item);
	}
}

/**
 *
 * @param item {item}
 */
function KinkyDungeonInventoryRemove(item) {
	if (item) {
		let type = KDInventoryType(item);
		if (KinkyDungeonInventory.has(type)) {
			KinkyDungeonInventory.get(type).delete(item.name);
		}
	}
}

/**
 *
 * @param Name
 * @return {null|item}
 */
function KinkyDungeonInventoryGet(Name) {
	for (let m of KinkyDungeonInventory.values()) {
		if (m.has(Name)) return m.get(Name);
	}
	return null;
}

/**
 *
 * @param Name
 * @return {null|item}
 */
function KinkyDungeonInventoryGetLoose(Name) {
	return KinkyDungeonInventory.get(LooseRestraint).get(Name);
}

/**
 *
 * @param Name
 * @return {null|item}
 */
function KinkyDungeonInventoryGetConsumable(Name) {
	return KinkyDungeonInventory.get(Consumable).get(Name);
}

/**
 *
 * @param Name
 * @return {null|item}
 */
function KinkyDungeonInventoryGetWeapon(Name) {
	return KinkyDungeonInventory.get(Weapon).get(Name);
}

/**
 *
 * @param Name
 * @return {null|item}
 */
function KinkyDungeonInventoryGetOutfit(Name) {
	return KinkyDungeonInventory.get(Outfit).get(Name);
}

/**
 * Returns list
 * @return {item[]}
 */
function KinkyDungeonAllRestraint() {
	return KinkyDungeonInventory.get(Restraint) ? Array.from(KinkyDungeonInventory.get(Restraint).values()) : [];
}


/**
 * Returns list of tuples of restraints, including dynamics and their hosts
 * @return {{item: item, host: item}[]}
 */
function KinkyDungeonAllRestraintDynamic() {
	let ret = [];
	for (let inv of KinkyDungeonAllRestraint()) {
		ret.push({item: inv, host: null});
		if (inv.dynamicLink) {
			let link = inv.dynamicLink;
			let host = inv;
			while (link) {
				ret.push({item: link, host: host});
				link = link.dynamicLink;
			}
		}
	}
	return ret;
}

/**
 * Returns list
 * @return {item[]}
 */
function KinkyDungeonAllLooseRestraint() {
	return KinkyDungeonInventory.get(LooseRestraint) ? Array.from(KinkyDungeonInventory.get(LooseRestraint).values()) : [];
}
/**
 * Returns list
 * @return {item[]}
 */
function KinkyDungeonAllConsumable() {
	return KinkyDungeonInventory.get(Consumable) ? Array.from(KinkyDungeonInventory.get(Consumable).values()) : [];
}
/**
 * Returns list
 * @return {item[]}
 */
function KinkyDungeonAllOutfit() {
	return KinkyDungeonInventory.get(Outfit) ? Array.from(KinkyDungeonInventory.get(Outfit).values()) : [];
}
/**
 * Returns list
 * @return {item[]}
 */
function KinkyDungeonAllWeapon() {
	return KinkyDungeonInventory.get(Weapon) ? Array.from(KinkyDungeonInventory.get(Weapon).values()) : [];
}

/*for (let item of KinkyDungeonInventory.get(LooseRestraint).values()) {
	if (item.looserestraint && item.looserestraint.name == Name) return item;
}
return null;*/

/**
 *
 * @param {item} item
 * @returns {{name: any; item: any; preview: string;}}
 */
function KDGetItemPreview(item) {
	let ret = null;
	let Group = "";
	if (item.type == Restraint && KDRestraint(item).Group) Group = KDRestraint(item).Group;
	else if (item.type == LooseRestraint && KDRestraint(item).Group) Group = KDRestraint(item).Group;
	if ((item.type == Restraint || item.type == LooseRestraint) && KDRestraint(item).AssetGroup) Group = KDRestraint(item).AssetGroup;
	if (Group == "ItemMouth2" || Group == "ItemMouth3") Group = "ItemMouth";

	if (item.type == Restraint) {
		ret = {name: item.name, item: item, preview:
			StandalonePatched ? (KDTex(KinkyDungeonRootDirectory + `/Items/Restraint/${KDRestraint(item).name}.png`)?.valid ? KinkyDungeonRootDirectory + `/Items/Restraint/${KDRestraint(item).name}.png` : KinkyDungeonRootDirectory + `/Items/Restraint.png`) :
			`Assets/Female3DCG/${Group}/Preview/${KDRestraint(item).Asset}.png`
		};
	}
	else if (item.type == LooseRestraint) {
		ret = {name: KDRestraint(item).name, item: item, preview:
			StandalonePatched ? (KDTex(KinkyDungeonRootDirectory + `/Items/Restraint/${KDRestraint(item).name}.png`)?.valid ? KinkyDungeonRootDirectory + `/Items/Restraint/${KDRestraint(item).name}.png` : KinkyDungeonRootDirectory + `/Items/Restraint.png`) :
			`Assets/Female3DCG/${Group}/Preview/${KDRestraint(item).Asset}.png`};
	}
	else if (item.type == Consumable) ret = {name: KDConsumable(item).name, item: item, preview: KinkyDungeonRootDirectory + `/Items/${KDConsumable(item).name}.png`};
	else if (item.type == Weapon) ret = {name: KDWeapon(item).name, item: item, preview: KinkyDungeonRootDirectory + `/Items/${KDWeapon(item).name}.png`};
	else if (item.type == Outfit) ret = {name: KDOutfit(item) ? KDOutfit(item).name : "Prisoner", item: item, preview: KinkyDungeonRootDirectory + `/Outfits/${KDOutfit(item).name}.png`};
	//else if (item && item.name) ret.push({name: item.name, item: item, preview: ``});
	return ret;
}

/**
 *
 * @param {string} Filter
 * @param {boolean} [enchanted]
 * @param {boolean} [ignoreHidden]
 * @param {boolean} [ignoreFilters]
 * @returns {{name: any; item: any; preview: string;}[]}
 */
function KinkyDungeonFilterInventory(Filter, enchanted, ignoreHidden, ignoreFilters) {
	let ret = [];
	let category = KinkyDungeonInventory.get(Filter);
	if (category)
		for (let item of category.values()) {
			if (ignoreHidden && KDGameData.HiddenItems && KDGameData.HiddenItems[item.name]) continue;
			if (!ignoreFilters && KDFilterFilters[Filter]) {
				let filters = [];
				for (let filter of Object.entries(KDFilterFilters[Filter])) {
					if (filter[1])
						filters.push(filter[0]);
				}
				if (filters.length > 0) {
					switch (Filter) {
						case LooseRestraint: {
							if (KDRestraint(item) && !filters.every((filter) => {
								return KDRestraint(item).shrine?.includes(filter);
							})) continue;
							break;
						}
					}
				}
			}
			let preview = KDGetItemPreview(item);
			if (preview && (item.type != LooseRestraint || (!enchanted || KDRestraint(item).enchanted || KDRestraint(item).showInQuickInv)))
				ret.push(preview);
			if (item.dynamicLink) {
				let link = item.dynamicLink;
				for (let I = 0; I < 30; I++) {
					preview = KDGetItemPreview(link);
					if (preview && (link.type == Restraint))
						ret.push(preview);
					if (link.dynamicLink) {
						link = link.dynamicLink;
					} else I = 1000;
				}
			}

		}

	return ret;
}

/**
 *
 * @param {{name: any, item: item, preview: string}} item
 * @param {boolean} [noscroll]
 * @param {boolean} [treatAsHover]
 * @param {number} xOffset
 * @returns {boolean}
 */
function KinkyDungeonDrawInventorySelected(item, noscroll, treatAsHover, xOffset = 0) {
	if (!noscroll) {
		KDDraw(kdcanvas, kdpixisprites, "magicBook",
			KinkyDungeonRootDirectory + "MagicBook.png", xOffset + canvasOffsetX_ui, canvasOffsetY_ui, 640*KinkyDungeonBookScale, 483*KinkyDungeonBookScale, undefined, {
				zIndex: 128,
			});
		//DrawImageZoomCanvas(, MainCanvas, 0, 0, 640, 483, canvasOffsetX_ui, canvasOffsetY_ui, 640*KinkyDungeonBookScale, 483*KinkyDungeonBookScale, false);
	}
	if (!item) return false;
	let name = item.name;
	let prefix = "KinkyDungeonInventoryItem";
	if (item.item.type == Restraint || item.item.type == LooseRestraint) prefix = "Restraint";

	DrawTextFitKD(TextGet(prefix + name), xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5, 300, "#000000", KDTextTan, undefined, undefined, 129);
	//let wrapAmount = KDBigLanguages.includes(TranslationLanguage) ? 9 : 22;
	let textSplit = KinkyDungeonWordWrap(TextGet(prefix + name + "Desc"), 12, 28).split('\n');
	let textSplit2 = KinkyDungeonWordWrap(TextGet(prefix + name + "Desc2"), 12, 28).split('\n');


	let showpreview = (item.preview && !MouseIn(xOffset + canvasOffsetX_ui, canvasOffsetY_ui, 840, 583));


	let i = 2;
	if (showpreview) {
		//DrawPreviewBox(canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35 - 100, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 45, item.preview, "", {Background: "#00000000"});
		if (!treatAsHover) {
			KDDraw(kdcanvas, kdpixisprites, "preview",
				item.preview, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35 - 100, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 45, 200, 200, undefined, {
					zIndex: 129,
				});
		} else {
			for (let N = 0; N < textSplit.length; N++) {
				DrawTextKD(textSplit[N],
					xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 40, "#000000", KDTextTan, 24, undefined, 130); i++;}
		}

		if (item.item.type == Restraint || item.item.type == LooseRestraint) {
			let restraint = KDRestraint(item.item);
			DrawTextKD(TextGet("KinkyDungeonRestraintLevel").replace("RestraintLevel", "" + Math.max(1, restraint.displayPower != undefined ? restraint.displayPower : restraint.power)).replace("Rarity", TextGet("KinkyDungeonRarity" + Math.max(0, Math.min(Math.floor((restraint.displayPower != undefined ? restraint.displayPower : restraint.power)/3),10)))), xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 330, "#000000", KDTextTan, undefined, undefined, 130);
			DrawTextKD(
			restraint.escapeChance ? (item.item.lock ? (TextGet("KinkyLocked") + " " + TextGet("Kinky" + item.item.lock + "LockType")) :
				(restraint.DefaultLock && !restraint.HideDefaultLock ? (TextGet("KinkyLocked") + " " + TextGet("Kinky" + restraint.DefaultLock + "LockType")) : TextGet("KinkyUnlocked")))
			: (restraint.escapeChance.Pick != null ? TextGet("KinkyLockable") : TextGet("KinkyNonLockable")), xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 370, "#000000", KDTextTan, undefined, undefined, 130);

			let goddesses = "";
			if (restraint.shrine)
				for (let shrine of restraint.shrine) {
					if (KinkyDungeonGoddessRep[shrine] != undefined) {
						if (goddesses) {
							goddesses = goddesses + ", ";
						}
						goddesses = goddesses + TextGet("KinkyDungeonShrine" + shrine);
					}
				}
			if (goddesses)
				DrawTextFitKD("Goddess: " + goddesses, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 425, 300, "#000000", KDTextTan, undefined, undefined, 130);
		} else if (item.item.type == Consumable) {
			let consumable = KDConsumable(item.item);
			DrawTextKD(TextGet("KinkyDungeonConsumableQuantity") + item.item.quantity, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 330, "#000000", KDTextTan, undefined, undefined, 130);
			DrawTextKD(TextGet("KinkyDungeonRarity") + TextGet("KinkyDungeonRarity" + consumable.rarity), xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 370, "#000000", KDTextTan, undefined, undefined, 130);
		} else if (item.item.type == Weapon) {
			let weapon = KDWeapon(item.item);
			DrawTextKD(TextGet("KinkyDungeonWeaponDamage") + (weapon.dmg * 10), xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 310, "#000000", KDTextTan, undefined, undefined, 130);
			DrawTextKD(TextGet("KinkyDungeonWeaponAccuracy") + Math.round(weapon.chance * 100) + "%", xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 350, "#000000", KDTextTan, undefined, undefined, 130);
			let cost = -KinkyDungeonStatStaminaCostAttack;
			if (weapon.staminacost) cost = weapon.staminacost;
			DrawTextKD(TextGet("KinkyDungeonWeaponStamina") + Math.round(-10*cost), xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 390, "#000000", KDTextTan, undefined, undefined, 130);
		}

	} else {
		for (let N = 0; N < textSplit.length; N++) {
			DrawTextKD(textSplit[N],
				xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 40, "#000000", KDTextTan, 24, undefined, 130); i++;}
	}
	i = 0;
	for (let N = 0; N < textSplit2.length; N++) {
		DrawTextKD(textSplit2[N],
			xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1/3.35), canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 40, "#000000", KDTextTan, 24, undefined, 130); i++;}

	i = 0;

	return true;
}



function KinkyDungeonDrawInventory() {
	KinkyDungeonDrawMessages(true);

	FillRectKD(kdcanvas, kdpixisprites, "maininvbg", {
		Left: canvasOffsetX_ui + 640*KinkyDungeonBookScale - 50,
		Top: canvasOffsetY_ui - 20,
		Width: 1965 - (canvasOffsetX_ui + 640*KinkyDungeonBookScale - 50),
		Height: 735,
		Color: "#000000",
		LineWidth: 1,
		zIndex: 19,
		alpha: 0.3
	});
	DrawRectKD(kdcanvas, kdpixisprites, "maininvbg2", {
		Left: canvasOffsetX_ui + 640*KinkyDungeonBookScale - 50,
		Top: canvasOffsetY_ui - 20,
		Width: 1965 - (canvasOffsetX_ui + 640*KinkyDungeonBookScale - 50),
		Height: 735,
		Color: "#000000",
		LineWidth: 1,
		zIndex: 19,
		alpha: 0.9
	});

	let filteredInventory = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter);

	/*if (filteredInventory.length == 0) {
		// Reset all the filters first, then give up
		let skip = false;
		if (KDFilterFilters[KinkyDungeonCurrentFilter]) {
			skip = true;
			for (let f of Object.keys(KDFilterFilters[KinkyDungeonCurrentFilter])) {
				if (KDFilterFilters[KinkyDungeonCurrentFilter][f]) {
					KDFilterFilters[KinkyDungeonCurrentFilter][f] = false;
					skip = false;
				}
			}
		} else skip = true;
		if (!skip && KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter).length > 0) {
			filteredInventory = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter);
		}
	}*/


	if (KinkyDungeonCurrentPageInventory >= filteredInventory.length) KinkyDungeonCurrentPageInventory = 0;

	let defaultIndex = 0;
	if (KinkyDungeonFilterInventory(KinkyDungeonFilters[0]).length == 0) {
		defaultIndex = 1;
	}

	for (let I = 0; I < KinkyDungeonFilters.length; I++) {
		let col = KDTextGray2;
		if (KinkyDungeonFilterInventory(KinkyDungeonFilters[I], false, false, true).length > 0 || I == defaultIndex) {
			col = "#888888";
		}
		else if (KinkyDungeonFilters.indexOf(KinkyDungeonCurrentFilter) == I) KinkyDungeonCurrentFilter = KinkyDungeonFilters[defaultIndex];

		DrawButtonVis(canvasOffsetX_ui + 640*KinkyDungeonBookScale - 20, canvasOffsetY_ui + 115 + I*65, 225, 60, TextGet("KinkyDungeonCategoryFilter" + KinkyDungeonFilters[I]),
			(KinkyDungeonCurrentFilter == KinkyDungeonFilters[I]) ? "White" : col, "", "");
	}


	if (filteredInventory.length > 0) {
		DrawButtonKDEx("invScrollUp", (bdata) => {
			if (filteredInventory.length > 0) {
				if (KinkyDungeonInventoryOffset > 0) {
					KinkyDungeonInventoryOffset -= 2;
				}
			}
			return true;
		}, true,
		canvasOffsetX_ui + 640*KinkyDungeonBookScale + 526, canvasOffsetY_ui, 90, 44, "", KinkyDungeonInventoryOffset > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.png");
		DrawButtonKDEx("invScrollDown", (bdata) => {
			if (filteredInventory.length > 0) {
				if (KinkyDungeonInventoryOffset + 24 < filteredInventory.length) {
					KinkyDungeonInventoryOffset += 2;
				}
			}
			return true;
		}, true,
		canvasOffsetX_ui + 640*KinkyDungeonBookScale + 526, 480*KinkyDungeonBookScale + canvasOffsetY_ui - 4, 90, 44, "", (KinkyDungeonInventoryOffset + 24 < filteredInventory.length) ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.png");

		let useIcons = KDInventoryUseIconConfig[KinkyDungeonCurrentFilter];
		let numRows = useIcons ? 5 : 2;
		let maxList = useIcons ? 7 : 12;
		let b_width = useIcons ? 80 : 200;
		let b_height = useIcons ? 80 : 45;
		let padding = 4;
		for (let i = 0; i < numRows*maxList; i++) {
			let xx = 0;
			if (KDFilterFilters[KinkyDungeonCurrentFilter]) {
				numRows = useIcons ? 3 : 1;
				xx += useIcons ? 2 : 1;
			}
			xx += i % numRows;
			let yy = Math.floor(i / numRows);
			/** If there are defined filters we use them instead of double stacking */

			let index = i + KinkyDungeonInventoryOffset;
			if (filteredInventory[index] && filteredInventory[index].item) {
				let text = "KinkyDungeonInventoryItem" + filteredInventory[index].name;
				if (filteredInventory[index].item.type == Restraint || filteredInventory[index].item.type == LooseRestraint)
					text = "Restraint" + filteredInventory[index].name;
				let suff = "";
				if (filteredInventory[index].item.quantity) {
					suff = " x" + filteredInventory[index].item.quantity;
				}
				DrawButtonKDEx("invchoice_" + i, (bdata) => {
					KinkyDungeonCurrentPageInventory = index;
					return true;
				}, true, canvasOffsetX_ui + xx * b_width + 640*KinkyDungeonBookScale + 215, canvasOffsetY_ui + 50 + b_height * yy, b_width-padding, b_height-padding,
				useIcons ? ("") : (TextGet(text) + suff),
				"#ffffff",//useIcons ? "#ffffff" : index == KinkyDungeonCurrentPageInventory ? "#ffffff" : "#888888",
				useIcons ? filteredInventory[index].preview || "" : "",
				undefined, undefined, index != KinkyDungeonCurrentPageInventory, KDTextGray1, undefined, undefined, {
					scaleImage: true,
				});
				if (filteredInventory[index].item.quantity != undefined) {
					DrawTextKD("" + filteredInventory[index].item.quantity, canvasOffsetX_ui + xx * b_width + 640*KinkyDungeonBookScale + 220, canvasOffsetY_ui + 50 + b_height * yy + 18, "#ffffff", undefined, 18, "left");
				}
			} else {
				if (i + KinkyDungeonInventoryOffset > filteredInventory.length + 2)
					KinkyDungeonInventoryOffset = 0;
				//break;
				// Instead of breaking, we fill in the missing squares
				FillRectKD(kdcanvas, kdpixisprites, "kdInvEmptySpot" + i, {
					Left: canvasOffsetX_ui + xx * b_width + 640*KinkyDungeonBookScale + 215,
					Top: canvasOffsetY_ui + 50 + b_height * yy,
					Width: b_width-padding,
					Height: b_height-padding,
					Color: KDTextGray1,
					LineWidth: 1,
					zIndex: 20,
					alpha: 0.4,
				});
			}
		}


	}
	if (KDFilterFilters[KinkyDungeonCurrentFilter]) {
		let filters = Object.entries(KDFilterFilters[KinkyDungeonCurrentFilter]);
		for (let i = 0; i < filters.length; i++) {
			let xx = 0;
			let yy = i;
			DrawButtonKDEx("invchoice_filter_" + i, (bdata) => {
				KDFilterFilters[KinkyDungeonCurrentFilter][filters[i][0]] = !KDFilterFilters[KinkyDungeonCurrentFilter][filters[i][0]];
				KinkyDungeonInventoryOffset = 0;
				return true;
			}, true, canvasOffsetX_ui + xx * 200 + 640*KinkyDungeonBookScale + 212, canvasOffsetY_ui + 50 + 40 * yy, 159, 36,
			TextGet("KDFilterFilters" + filters[i][0]), filters[i][1] ? "#ffffff" : "#aaaaaa", undefined, undefined, undefined, !filters[i][1], KDTextGray1, 20);

		}
	}

	if (KinkyDungeonDrawInventorySelected(filteredInventory[KinkyDungeonCurrentPageInventory])) {
		if (KinkyDungeonCurrentFilter == Consumable)
			DrawButtonVis(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 60, TextGet("KinkyDungeonConsume"), "White", "", "");
		if (KinkyDungeonCurrentFilter == Weapon && filteredInventory[KinkyDungeonCurrentPageInventory].name != "Unarmed") {
			let equipped = filteredInventory[KinkyDungeonCurrentPageInventory] && filteredInventory[KinkyDungeonCurrentPageInventory].name == KinkyDungeonPlayerWeapon;
			DrawButtonVis(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 60, TextGet(equipped ? "KinkyDungeonEquipped" : "KinkyDungeonEquip"), equipped ? "grey" : "White", "", "");
			if (equipped) DrawButtonVis(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 70, 350, 60, TextGet("KinkyDungeonUnEquip"), "White", "", "");
		}
		if (KinkyDungeonCurrentFilter == Outfit) {
			let outfit = ((filteredInventory[KinkyDungeonCurrentPageInventory] != null) ? filteredInventory[KinkyDungeonCurrentPageInventory].name : "");
			let toWear = KinkyDungeonGetOutfit(outfit);
			if (toWear) {
				DrawButtonVis(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 60, TextGet("KinkyDungeonEquip"), KDGameData.Outfit == outfit ? "grey" : "White", "", "");
			}
		}
		if (KinkyDungeonCurrentFilter == LooseRestraint) {
			let equipped = false;

			if (filteredInventory[KinkyDungeonCurrentPageInventory]
				&& filteredInventory[KinkyDungeonCurrentPageInventory].item) {
				let newItem = KDRestraint(filteredInventory[KinkyDungeonCurrentPageInventory].item);
				if (newItem) {
					let currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
					if (!currentItem
						|| (KinkyDungeonLinkableAndStricter(KDRestraint(currentItem), newItem, currentItem) &&
							((newItem.linkCategory && KDLinkCategorySize(currentItem, newItem.linkCategory) + KDLinkSize(newItem) <= 1.0)
							|| (!newItem.linkCategory && !KDDynamicLinkList(currentItem, true).some((item) => {return newItem.name == item.name;}))))) {
						equipped = false;
					} else equipped = true;
				}
			}
			DrawButtonVis(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 60, TextGet("KinkyDungeonEquip"), equipped ? "grey" : "White", "", "");
		}
	}
	if (KinkyDungeonCurrentPageInventory >= filteredInventory.length) KinkyDungeonCurrentPageInventory = Math.max(0, KinkyDungeonCurrentPageInventory - 1);

	if (KinkyDungeonCurrentPageInventory > 0) {
		DrawButtonVis(canvasOffsetX_ui + 100, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60, TextGet("KinkyDungeonBookLastPage"), "White", "", "");
	}
	if (KinkyDungeonCurrentPageInventory < filteredInventory.length-1) {
		DrawButtonVis(canvasOffsetX_ui + 640*KinkyDungeonBookScale - 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60, TextGet("KinkyDungeonBookNextPage"), "White", "", "");
	}

}

function KinkyDungeonSendInventoryEvent(Event, data) {
	if (!KDMapHasEvent(KDEventMapInventory, Event)) return;
	for (let item of KinkyDungeonAllRestraint()) {
		if (item.dynamicLink)
			for (let d_item of KDDynamicLinkList(item)) {
				let oldEvents = d_item.events;
				if (oldEvents)
					for (let e of oldEvents) {
						if (e.inheritLinked && e.trigger === Event && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
							KinkyDungeonHandleInventoryEvent(Event, e, d_item, data);
						}
					}
			}
		if (item.events) {
			for (let e of item.events) {
				if (e.trigger === Event && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
					KinkyDungeonHandleInventoryEvent(Event, e, item, data);
				}
			}
		}
		if (item.curse && KDCurses[item.curse]?.events) {
			for (let e of KDCurses[item.curse].events) {
				if (e.trigger === Event && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
					KinkyDungeonHandleInventoryEvent(Event, e, item, data);
				}
			}
		}
	}
}

let KinkyDungeonInvDraw = [];

function KinkyDungeonQuickGrid(I, Width, Height, Xcount) {
	let i = 0;
	let h = 0;
	let v = 0;
	while (i < I) {
		if (h < Xcount - 1) h++; else {
			h = 0;
			v++;
		}
		i++;
	}
	return {x: Width*h, y: Height*v};
}

let KDScrollOffset = {
	"Consumable": 0,
	"Restraint": 0,
	"Weapon": 0,
};

let KDItemsPerScreen = {
	"Consumable": 18,
	"Restraint": 18,
	"Weapon": 18,
};

let KDScrollAmount = 6;
let KDInventoryStatus = {
	HideQuickInv: false,
	DropQuickInv: false,
	SortQuickInv: false,
	FilterQuickInv: false,
};

function KinkyDungeonDrawQuickInv() {
	let H = 80;
	let V = 80;
	let fC = KinkyDungeonFilterInventory(Consumable, false, !KDInventoryStatus.HideQuickInv);
	let consumables = fC.slice(KDScrollOffset.Consumable, KDScrollOffset.Consumable + KDItemsPerScreen.Consumable);
	let fW = KinkyDungeonFilterInventory(Weapon, false, !KDInventoryStatus.HideQuickInv);
	let weapons = fW.slice(KDScrollOffset.Weapon, KDScrollOffset.Weapon + KDItemsPerScreen.Weapon);
	let fR = KinkyDungeonFilterInventory(LooseRestraint, true, !KDInventoryStatus.HideQuickInv);
	let restraints = fR.slice(KDScrollOffset.Restraint, KDScrollOffset.Restraint + KDItemsPerScreen.Restraint);
	let Wheight = KinkyDungeonQuickGrid(weapons.length-1, H, V, 6).y;
	let Rheight = 480;

	KDScrollOffset.Consumable = Math.max(0, Math.min(Math.ceil((fC.length - KDItemsPerScreen.Consumable)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Consumable));
	KDScrollOffset.Restraint = Math.max(0, Math.min(Math.ceil((fR.length - KDItemsPerScreen.Consumable)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Restraint));
	KDScrollOffset.Weapon = Math.max(0, Math.min(Math.ceil((fW.length - KDItemsPerScreen.Consumable)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Weapon));

	if (fC.length > KDItemsPerScreen.Consumable) {
		DrawButtonVis(510, 5, 90, 40, "", "white", KinkyDungeonRootDirectory + "Up.png");
		DrawButtonVis(510, 50, 90, 40, "", "white", KinkyDungeonRootDirectory + "Down.png");
	}
	if (fW.length > KDItemsPerScreen.Weapon) {
		DrawButtonVis(510, 705, 90, 40, "", "white", KinkyDungeonRootDirectory + "Up.png");
		DrawButtonVis(510, 750, 90, 40, "", "white", KinkyDungeonRootDirectory + "Down.png");
	}
	if (fR.length > KDItemsPerScreen.Restraint) {
		DrawButtonVis(510, 455, 90, 40, "", "white", KinkyDungeonRootDirectory + "Up.png");
		DrawButtonVis(510, 500, 90, 40, "", "white", KinkyDungeonRootDirectory + "Down.png");
	}

	FillRectKD(kdcanvas, kdpixisprites, "quickinvbg", {
		Left: 5,
		Top: 5,
		Width: 490,
		Height: 990,
		Color: "#000000",
		LineWidth: 1,
		zIndex: 59,
		alpha: 0.9
	});

	/*DrawButtonKDEx("inventoryfilter", (bdata) => {
		if (!KDGameData.HiddenItems)
			KDGameData.HiddenItems = {};
		for (let invStat of Object.keys(KDInventoryStatus)) {
			if (invStat == "FilterQuickInv") KDInventoryStatus[invStat] = !KDInventoryStatus[invStat];
			else KDInventoryStatus[invStat] = false;
		}
		return true;
	}, true, 510, 465, 120, 60, "", KDButtonColor, KinkyDungeonRootDirectory + "InvFilter.png", undefined, false, !KDInventoryStatus.FilterQuickInv);
	*/
	DrawButtonKDEx("inventorysort", (bdata) => {
		if (!KDGameData.HiddenItems)
			KDGameData.HiddenItems = {};
		for (let invStat of Object.keys(KDInventoryStatus)) {
			if (invStat == "SortQuickInv") KDInventoryStatus[invStat] = !KDInventoryStatus[invStat];
			else KDInventoryStatus[invStat] = false;
		}
		KDSortInventory(KinkyDungeonPlayerEntity);
		return true;
	}, true, 630, 545, 120, 60, "", KDButtonColor, KinkyDungeonRootDirectory + "InvSort.png", undefined, false, !KDInventoryStatus.SortQuickInv);

	DrawButtonKDEx("inventoryhide", (bdata) => {
		if (!KDGameData.HiddenItems)
			KDGameData.HiddenItems = {};
		for (let invStat of Object.keys(KDInventoryStatus)) {
			if (invStat == "HideQuickInv") KDInventoryStatus[invStat] = !KDInventoryStatus[invStat];
			else KDInventoryStatus[invStat] = false;
		}
		KDSortInventory(KinkyDungeonPlayerEntity);
		return true;
	}, true, 630, 625, 120, 60, "", KDButtonColor, KinkyDungeonRootDirectory + "InvHide.png", undefined, false, !KDInventoryStatus.HideQuickInv);

	DrawButtonKDEx("inventorydrop", (bdata) => {
		for (let invStat of Object.keys(KDInventoryStatus)) {
			if (invStat == "DropQuickInv") KDInventoryStatus[invStat] = !KDInventoryStatus[invStat];
			else KDInventoryStatus[invStat] = false;
		}
		KDSortInventory(KinkyDungeonPlayerEntity);
		return true;
	}, true, 630, 705, 120, 60, "", KDButtonColor, KinkyDungeonRootDirectory + "InvDrop.png", undefined, false, !KDInventoryStatus.DropQuickInv);


	for (let c = 0; c < consumables.length; c++) {
		let item = consumables[c];
		if (item.preview) {
			let point = KinkyDungeonQuickGrid(c, H, V, 6);
			if (MouseIn(point.x + 1, 1+ point.y + 30, H-2, V-2)) {
				FillRectKD(kdcanvas, kdpixisprites, "consumables" + c, {
					Left: point.x,
					Top: point.y + 30,
					Width: H,
					Height: V,
					Color: KDTextGray3,
					LineWidth: 1,
					zIndex: 60,
					alpha: 0.5
				});
				KinkyDungeonDrawInventorySelected(item, false, true);
			}
			KDDraw(kdcanvas, kdpixisprites, "consumablesicon" + c,
				item.preview, point.x, point.y + 30, 80, 80, undefined, {
					zIndex: 109,
				});
			if ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.name]) || KDInventoryStatus.HideQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "consumablesiconhidden" + c,
					KinkyDungeonRootDirectory + ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.name]) ? "InvHidden.png" : "InvVisible.png"), point.x, point.y + 30, 80, 80, undefined, {
						zIndex: 110,
					});
			}
			if (KDInventoryStatus.DropQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "consumablesiconhidden" + c,
					KinkyDungeonRootDirectory + "InvItemDrop.png", point.x, point.y + 30, 80, 80, undefined, {
						zIndex: 111,
					});
			}
			if (KDInventoryStatus.SortQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "consumablesiconhidden" + c,
					KinkyDungeonRootDirectory + "InvItemSort.png", point.x, point.y + 30, 80, 80, undefined, {
						zIndex: 111,
					});
				DrawTextKD("" + (KDGameData.ItemPriority? KDGameData.ItemPriority[item.name] || 0 : 0), point.x + 40, point.y + 30 + 20, "#ffffff", undefined, 30,);
			}
			//DrawImageEx(item.preview, point.x, point.y + 30, {Width: 80, Height: 80});

			DrawTextKD("" + item.item.quantity, point.x, point.y + 30, "#ffffff", undefined, 18, "left");
		}
	}

	for (let w = 0; w < weapons.length; w++) {
		let item = weapons[w];
		if (item.preview) {
			let point = KinkyDungeonQuickGrid(w, H, V, 6);
			if (MouseIn(point.x + 1, 1+ 1000 - V - Wheight + point.y, H-2, V-2)) {
				FillRectKD(kdcanvas, kdpixisprites, "weapons" + w, {
					Left: point.x,
					Top: 1000 - V - Wheight + point.y,
					Width: H,
					Height: V,
					Color: KDTextGray3,
					LineWidth: 1,
					zIndex: 60,
					alpha: 0.5
				});
				KinkyDungeonDrawInventorySelected(item, false, true);
			}

			KDDraw(kdcanvas, kdpixisprites, "weaponsicon" + w,
				item.preview, point.x, 1000 - V - Wheight + point.y, 80, 80, undefined, {
					zIndex: 109,
				});
			if ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.name]) || KDInventoryStatus.HideQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "weaponsiconhid" + w,
					KinkyDungeonRootDirectory + ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.name]) ? "InvHidden.png" : "InvVisible.png"), point.x, 1000 - V - Wheight + point.y, 80, 80, undefined, {
						zIndex: 110,
					});
			}
			if (KDInventoryStatus.DropQuickInv && item.name != "Unarmed") {
				KDDraw(kdcanvas, kdpixisprites, "weaponsiconhid" + w,
					KinkyDungeonRootDirectory + "InvItemDrop.png", point.x, 1000 - V - Wheight + point.y, 80, 80, undefined, {
						zIndex: 110,
					});
			}
			if (KDInventoryStatus.SortQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "weaponsiconhid" + w,
					KinkyDungeonRootDirectory + "InvItemSort.png", point.x, 1000 - V - Wheight + point.y, 80, 80, undefined, {
						zIndex: 110,
					});
				DrawTextKD("" + (KDGameData.ItemPriority? KDGameData.ItemPriority[item.name] || 0 : 0), point.x + 40, 1000 - V - Wheight + point.y + 20, "#ffffff", undefined, 30,);
			}
			//DrawImageEx(item.preview, point.x, 1000 - V - Wheight + point.y, {Width: 80, Height: 80});
		}
	}

	for (let w = 0; w < restraints.length; w++) {
		let item = restraints[w];
		if (item.preview) {
			let point = KinkyDungeonQuickGrid(w, H, V, 6);
			if (MouseIn(point.x +1, 1+ 1000 - V - Rheight + point.y, H - 2, V - 2)) {
				FillRectKD(kdcanvas, kdpixisprites, "restraints" + w, {
					Left: point.x,
					Top: 1000 - V - Rheight + point.y,
					Width: H,
					Height: V,
					Color: KDTextGray3,
					LineWidth: 1,
					zIndex: 60,
					alpha: 0.5
				});
				KinkyDungeonDrawInventorySelected(item, false, true);
			}
			//DrawImageEx(item.preview, point.x, 1000 - V - Rheight + point.y, {Width: 80, Height: 80});
			KDDraw(kdcanvas, kdpixisprites, "restraintsicon" + w,
				item.preview, point.x, 1000 - V - Rheight + point.y, 80, 80, undefined, {
					zIndex: 109,
				});
			if ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.name]) || KDInventoryStatus.HideQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "restraintsiconhid" + w,
					KinkyDungeonRootDirectory + ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.name]) ? "InvHidden.png" : "InvVisible.png"), point.x, 1000 - V - Rheight + point.y, 80, 80, undefined, {
						zIndex: 109,
					});
			}
			if (KDInventoryStatus.DropQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "restraintsiconhid" + w,
					KinkyDungeonRootDirectory + "InvItemDrop.png", point.x, 1000 - V - Rheight + point.y, 80, 80, undefined, {
						zIndex: 109,
					});
			}
			if (KDInventoryStatus.SortQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "restraintsiconhid" + w,
					KinkyDungeonRootDirectory + "InvItemSort.png", point.x, 1000 - V - Rheight + point.y, 80, 80, undefined, {
						zIndex: 109,
					});
				DrawTextKD("" + (KDGameData.ItemPriority? KDGameData.ItemPriority[item.name] || 0 : 0), point.x + 40, 1000 - V - Rheight + point.y + 20, "#ffffff", undefined, 30,);
			}
		}
	}
}

function KinkyDungeonhandleQuickInv(NoUse) {


	let H = 80;
	let V = 80;
	let fC = KinkyDungeonFilterInventory(Consumable, false, !KDInventoryStatus.HideQuickInv);
	let consumables = fC.slice(KDScrollOffset.Consumable, KDScrollOffset.Consumable + KDItemsPerScreen.Consumable);
	let fW = KinkyDungeonFilterInventory(Weapon, false, !KDInventoryStatus.HideQuickInv);
	let weapons = fW.slice(KDScrollOffset.Weapon, KDScrollOffset.Weapon + KDItemsPerScreen.Weapon);
	let fR = KinkyDungeonFilterInventory(LooseRestraint, true, !KDInventoryStatus.HideQuickInv);
	let restraints = fR.slice(KDScrollOffset.Restraint, KDScrollOffset.Restraint + KDItemsPerScreen.Restraint);
	let Wheight = KinkyDungeonQuickGrid(weapons.length-1, H, V, 6).y;
	let Rheight = 480;

	if (fC.length > KDItemsPerScreen.Consumable) {
		if (MouseIn(510, 5, 90, 40)) {
			KDScrollOffset.Consumable = Math.max(0, KDScrollOffset.Consumable - KDScrollAmount);
			return true;
		}
		if (MouseIn(510, 50, 90, 40)) {
			KDScrollOffset.Consumable = Math.min(Math.ceil((fC.length - KDItemsPerScreen.Consumable)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Consumable + KDScrollAmount);
			return true;
		}
	}
	if (fW.length > KDItemsPerScreen.Weapon) {
		if (MouseIn(510, 705, 90, 40)) {
			KDScrollOffset.Weapon = Math.max(0, KDScrollOffset.Weapon - KDScrollAmount);
			return true;
		}
		if (MouseIn(510, 750, 90, 40)) {
			KDScrollOffset.Weapon = Math.min(Math.ceil((fW.length - KDItemsPerScreen.Consumable)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Weapon + KDScrollAmount);
			return true;
		}
	}
	if (fR.length > KDItemsPerScreen.Restraint) {
		if (MouseIn(510, 455, 90, 40)) {
			KDScrollOffset.Restraint = Math.max(0, KDScrollOffset.Restraint - KDScrollAmount);
			return true;
		}
		if (MouseIn(510, 500, 90, 40)) {
			KDScrollOffset.Restraint = Math.min(Math.ceil((fR.length - KDItemsPerScreen.Consumable)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Restraint + KDScrollAmount);
			return true;
		}
	}

	if (NoUse) {
		return false;
	}
	if (MouseX > 500) {
		KDCloseQuickInv();
		return false;
	}

	for (let c = 0; c < consumables.length; c++) {
		let item = consumables[c];
		if (item.preview) {
			let point = KinkyDungeonQuickGrid(c, H, V, 6);
			if (MouseIn(point.x, point.y + 30, H, V)) {
				if (KDInventoryStatus.HideQuickInv) {
					KDGameData.HiddenItems[item.name] = !KDGameData.HiddenItems[item.name];
				} else if (KDInventoryStatus.DropQuickInv) {
					KDDropItemInv(item.name);
				} else if (KDInventoryStatus.SortQuickInv) {
					if (MouseIn(point.x + H/2, point.y + 30, H/2, V)) {
						// Sort left
						if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
						if (KDGameData.ItemPriority[item.name] == undefined) KDGameData.ItemPriority[item.name] = -1;
						else if (KDGameData.ItemPriority[item.name] > -9) KDGameData.ItemPriority[item.name] -= 1;
					} else {
						// Sort right
						if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
						if (KDGameData.ItemPriority[item.name] == undefined) KDGameData.ItemPriority[item.name] = 1;
						else if (KDGameData.ItemPriority[item.name] < 9) KDGameData.ItemPriority[item.name] += 1;
					}
				}  else {
					KDSendInput("consumable", {item: item.name, quantity: 1});
				}
			}
		}
	}

	for (let w = 0; w < weapons.length; w++) {
		let item = weapons[w];
		if (item.preview) {
			let point = KinkyDungeonQuickGrid(w, H, V, 6);
			if (MouseIn(point.x, 1000 - V - Wheight + point.y, H, V)) {
				if (KDInventoryStatus.HideQuickInv) {
					KDGameData.HiddenItems[item.name] = !KDGameData.HiddenItems[item.name];
				} else if (KDInventoryStatus.DropQuickInv && item.name != "Unarmed") {
					KDDropItemInv(item.name);
				} else if (KDInventoryStatus.SortQuickInv) {
					if (MouseIn(point.x + H/2, 1000 - V - Wheight + point.y, H/2, V)) {
						// Sort left
						if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
						if (KDGameData.ItemPriority[item.name] == undefined) KDGameData.ItemPriority[item.name] = -1;
						else if (KDGameData.ItemPriority[item.name] > -9) KDGameData.ItemPriority[item.name] -= 1;
					} else {
						// Sort right
						if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
						if (KDGameData.ItemPriority[item.name] == undefined) KDGameData.ItemPriority[item.name] = 1;
						else if (KDGameData.ItemPriority[item.name] < 9) KDGameData.ItemPriority[item.name] += 1;
					}
				}  else {
					let weapon = item.name != "Unarmed" ? item.name : null;
					KDSendInput("switchWeapon", {weapon: weapon});
					KDCloseQuickInv();
				}
			}
		}
	}

	for (let w = 0; w < restraints.length; w++) {
		let item = restraints[w];
		if (item.preview) {
			let point = KinkyDungeonQuickGrid(w, H, V, 6);
			if (MouseIn(point.x, 1000 - V - Rheight + point.y, H, V)) {
				if (KDInventoryStatus.HideQuickInv) {
					KDGameData.HiddenItems[item.name] = !KDGameData.HiddenItems[item.name];
				} else if (KDInventoryStatus.DropQuickInv) {
					KDDropItemInv(item.name);
				} else if (KDInventoryStatus.SortQuickInv) {
					if (MouseIn(point.x + H/2, 1000 - V - Rheight + point.y, H/2, V)) {
						// Sort left
						if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
						if (KDGameData.ItemPriority[item.name] == undefined) KDGameData.ItemPriority[item.name] = -1;
						else if (KDGameData.ItemPriority[item.name] > -9) KDGameData.ItemPriority[item.name] -= 1;
					} else {
						// Sort right
						if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
						if (KDGameData.ItemPriority[item.name] == undefined) KDGameData.ItemPriority[item.name] = 1;
						else if (KDGameData.ItemPriority[item.name] < 9) KDGameData.ItemPriority[item.name] += 1;
					}
				} else {
					let equipped = false;
					let newItem = null;
					let currentItem = null;

					if (item
						&& item.item) {
						newItem = KDRestraint(item.item);
						if (newItem) {
							currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
							if (!currentItem
								|| (KinkyDungeonLinkableAndStricter(KDRestraint(currentItem), newItem, currentItem) &&
									((newItem.linkCategory && KDLinkCategorySize(currentItem, newItem.linkCategory) + KDLinkSize(newItem) <= 1.0)
									|| (!newItem.linkCategory && !KDDynamicLinkList(currentItem, true).some((ii) => {return newItem.name == ii.name;}))))) {
								equipped = false;
							} else equipped = true;
						}
					}
					if (!equipped && newItem) {
						if (KDSendInput("equip", {name: newItem.name, group: newItem.Group, curse: item.item.curse, currentItem: currentItem ? currentItem.name : undefined, events: Object.assign([], item.item.events)})) return true;
					}
				}

			}
		}
	}


	return false;
}

/**
 *
 * @param {string} name
 * @param {entity} [player]
 * @param {boolean} playerDropped
 */
function KDDropItemInv(name, player, playerDropped = true) {
	let item = KinkyDungeonInventoryGet(name);
	if (!player) player = KinkyDungeonPlayerEntity;
	if (item) {
		// Drop one of them
		if (item.quantity > 1) {
			item.quantity -= 1;
		} else KinkyDungeonInventoryRemove(item);

		let dropped = {x:player.x, y:player.y, name: name, amount: 1, playerDropped: playerDropped};

		KinkyDungeonGroundItems.push(dropped);

		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
	}
}

/**
 *
 * @param {entity} player
 */
function KDSortInventory(player) {
	if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
	let m = KinkyDungeonInventory.get(Consumable);
	KinkyDungeonInventory.set(Consumable, new Map([...m.entries()].sort((a,b) => (
		KDGameData.ItemPriority[b[1].name] || 0)
		- (KDGameData.ItemPriority[a[1].name] || 0)
	)));
	m = KinkyDungeonInventory.get(Weapon);
	KinkyDungeonInventory.set(Weapon, new Map([...m.entries()].sort((a,b) => (
		KDGameData.ItemPriority[b[1].name] || 0)
		- (KDGameData.ItemPriority[a[1].name] || 0)
	)));
	m = KinkyDungeonInventory.get(LooseRestraint);
	KinkyDungeonInventory.set(LooseRestraint, new Map([...m.entries()].sort((a,b) => (
		KDGameData.ItemPriority[b[1].name] || 0)
		- (KDGameData.ItemPriority[a[1].name] || 0)
	)));
}