"use strict";


let KDPreventAccidentalClickTime = 0;

let KinkyDungeonFilters = [
	Consumable,
	Restraint,
	Weapon,
	Outfit,
	LooseRestraint,
	Armor,
];

let KDConfigHotbar = false;

let KDWeaponTags = {
	"magic" : true,
	"light" : true,
	"bow" : true,
	"noHands": true,
	"clumsy": true,
	"offhand": true,
	"shield": true,
	"heavy": true,
	"massive": true,
	"illum": true,
};

let KDInvFilter = "";

let KDFilterTransform = {
	'armor': 'looserestraint',
};

/** @type {Record<string, KDRestraintVariant>} */
let KinkyDungeonRestraintVariants = {};

/** @type {Record<string, KDWeaponVariant>} */
let KinkyDungeonWeaponVariants = {};

/** @type {Record<string, KDConsumableVariant>} */
let KinkyDungeonConsumableVariants = {};


/**
 *
 * @param {item} item
 * @returns {KDRestraintVariant}
 */
function KDGetRestraintVariant(item) {
	// @ts-ignore
	return KinkyDungeonRestraintVariants[item.inventoryVariant || item.inventoryAs || item.name];
}
/**
 *
 * @param {item} item
 * @returns {KDConsumableVariant}
 */
function KDGetConsumableVariant(item) {
	// @ts-ignore
	return KinkyDungeonConsumableVariants[item.inventoryVariant || item.inventoryAs || item.name];
}
/**
 *
 * @param {item} item
 * @returns {KDWeaponVariant}
 */
function KDGetWeaponVariant(item) {
	// @ts-ignore
	return KinkyDungeonWeaponVariants[item.inventoryVariant || item.inventoryAs || item.name];
}

/**
 * @type {Record<string, boolean>}
 */
let KDInventoryUseIconConfig = {};
KDInventoryUseIconConfig[Weapon] = true;
KDInventoryUseIconConfig[Consumable] = true;
KDInventoryUseIconConfig[LooseRestraint] = true;
KDInventoryUseIconConfig[Restraint] = true;
KDInventoryUseIconConfig[Armor] = true;

/** List of current filters for each filter type */
/**
 * @type {Record<string, Record<string, boolean>>}
 */
let KDFilterFilters = {};
KDFilterFilters[LooseRestraint] = {
	Special: false,
	Mundane: false,
	Rope: false,
	Leather: false,
	Metal: false,
	Latex: false,
	Gags: false,
	Wrapping: false,
	Ties: false,
	Belts: false,
	Cuffs: false,
	Collars: false,
	Toys: false,
	Boots: false,
};
KDFilterFilters[Armor] = {
	Enchanted: false,
	Mundane: false,
	Light: false,
	Heavy: false,
	Mage: false,
	Accessory: false,
};
KDFilterFilters[Restraint] = {
	Special: false,
	Mundane: false,
	Armor: false,
	Restraint: false,
	Ancient: false,
	Cursed: false,
};
KDFilterFilters[Weapon] = {
	Mundane: false,
	Magic: false,
	Shield: false,
	Ranged: false,
	Melee: false,
	Ability: false,
	Physical: false,
	Magical: false,
	Light: false,
	Heavy: false,
	/*Sword: false,
	Spear: false,
	Hammer: false,
	Axe: false,
	Mace: false,*/
	Staff: false,
	Toy: false,
	Bondage: false,
	Tease: false,
};


/** @type {Record<string, Record<string, (item: item, handle: boolean) => boolean>>} */
let KDSpecialFilters = {
	looserestraint: {
		Special: (item, handle) => {
			if (handle) KDFilterFilters[LooseRestraint].Mundane = false;
			return KDRestraintSpecial(item);
		},
		Mundane: (item, handle) => {
			if (handle) KDFilterFilters[LooseRestraint].Special = false;
			return !(KDRestraintSpecial(item));
		},
	},
	armor: {
		Enchanted: (item, handle) => {
			if (handle) KDFilterFilters[Armor].Mundane = false;
			return KinkyDungeonRestraintVariants[item.inventoryVariant || item.name] != undefined;
		},
		Mundane: (item, handle) => {
			if (handle) KDFilterFilters[Armor].Enchanted = false;
			return !KinkyDungeonRestraintVariants[item.inventoryVariant || item.name];
		},
	},
	weapon: {
		Mundane: (item, handle) => {
			if (handle) KDFilterFilters[Weapon].Magic = false;
			return !KDWeapon(item)?.magic && KinkyDungeonWeaponVariants[item.inventoryVariant || item.name] != undefined;
		},
		Magic: (item, handle) => {
			if (handle) KDFilterFilters[Weapon].Mundane = false;
			return KDWeapon(item)?.magic || KinkyDungeonWeaponVariants[item.inventoryVariant || item.name] != undefined;
		},
		Divine: (item, handle) => {
			return KDWeapon(item)?.tags?.includes("divine");
		},
		Ranged: (item, handle) => {
			if (handle) KDFilterFilters[Weapon].Melee = false;
			return KDWeapon(item)?.tags?.includes("ranged");
		},
		Melee: (item, handle) => {
			if (handle) KDFilterFilters[Weapon].Ranged = false;
			return !KDWeapon(item)?.tags?.includes("ranged");
		},
		Ability: (item, handle) => {
			return KDWeapon(item)?.special != undefined;
		},
		Physical: (item, handle) => {
			if (handle) KDFilterFilters[Weapon].Magical = false;
			return KinkyDungeonMeleeDamageTypes.includes(KDWeapon(item)?.type);
		},
		Magical: (item, handle) => {
			if (handle) KDFilterFilters[Weapon].Physical = false;
			return !KinkyDungeonMeleeDamageTypes.includes(KDWeapon(item)?.type);
		},
		Light: (item, handle) => {
			if (handle) KDFilterFilters[Weapon].Heavy = false;
			return KDWeapon(item)?.light;
		},
		Heavy: (item, handle) => {
			if (handle) KDFilterFilters[Weapon].Light = false;
			return KDWeapon(item)?.heavy || KDWeapon(item)?.clumsy || KDWeapon(item)?.massive;
		},
		Toy: (item, handle) => {
			return KDWeapon(item)?.tags?.includes("toy");
		},
		Bondage: (item, handle) => {
			return KDWeapon(item)?.tags?.includes("bondage");
		},
		Utility: (item, handle) => {
			return KDWeapon(item)?.tags?.includes("utility");
		},
		Staff: (item, handle) => {
			return KDWeapon(item)?.tags?.includes("staff");
		},
		Shield: (item, handle) => {
			return KDWeapon(item)?.tags?.includes("shield");
		},
		Tease: (item, handle) => {
			return KinkyDungeonTeaseDamageTypes.includes(KDWeapon(item)?.type) || KDWeapon(item)?.tease;
		},
	},
	restraint: {
		Special: (item, handle) => {
			if (handle) KDFilterFilters[Restraint].Mundane = false;
			return (KDRestraint(item)?.armor && KinkyDungeonRestraintVariants[item.inventoryVariant || item.name] != undefined)
				|| (!KDRestraint(item)?.armor && (KDRestraintSpecial(item)));
		},
		Mundane: (item, handle) => {
			if (handle) KDFilterFilters[Restraint].Special = false;
			return !(
				(KDRestraint(item)?.armor && KinkyDungeonRestraintVariants[item.inventoryVariant || item.name] != undefined)
				|| (!KDRestraint(item)?.armor && (KDRestraintSpecial(item)))
			);
		},
		Armor: (item, handle) => {
			if (handle) KDFilterFilters[Restraint].Restraint = false;
			return KDRestraint(item)?.armor;
		},
		Restraint: (item, handle) => {
			if (handle) KDFilterFilters[Restraint].Armor = false;
			return !KDRestraint(item)?.armor;
		},
		Cursed: (item, handle) => {
			return KDGetCurse(item) != undefined;
		},
	},
};

let KinkyDungeonCurrentFilter = KinkyDungeonFilters[0];
let KinkyDungeonCurrentPageInventory = 0;

let KinkyDungeonShowInventory = false;
let KinkyDungeonInventoryOffset = 0;

let KDConfirmOverInventoryAction = false;

function KDCloseQuickInv() {
	KinkyDungeonShowInventory = false;
	for (let invStat of Object.keys(KDInventoryStatus)) {
		KDInventoryStatus[invStat] = false;
	}
	KDSortInventory(KinkyDungeonPlayerEntity);
	KDInventoryStatus.HideQuickInv = false;
}

function KDRestraintSpecial(item) {
	return KDRestraint(item)?.enchanted || KDRestraint(item)?.special || KDRestraint(item)?.showInQuickInv || item.showInQuickInv;
}

let KDWeaponSwitchPref = 0;

function KDSwitchWeapon(weapon, pref) {
	if (typeof KDGameData.PreviousWeapon === 'string' || !KDGameData.PreviousWeapon) KDGameData.PreviousWeapon = [];
	//let previousWeapon = weapon || (KDGameData.PreviousWeapon ? KDGameData.PreviousWeapon[0] : null);

	if (weapon && KinkyDungeonInventoryGet(weapon)) KDSendInput("switchWeapon", {weapon: weapon, pref: pref});
	else for (let i = 0; i < KinkyDungeonKeySwitchWeapon.length; i++) {
		if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKeySwitchWeapon[i] && (KDGameData.PreviousWeapon ? KDGameData.PreviousWeapon[i] : null)
			&& KinkyDungeonInventoryGet(KDGameData.PreviousWeapon[i]))
			KDSendInput("switchWeapon", {weapon: KDGameData.PreviousWeapon[i], pref: i});
	}

	//if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKeySwitchWeapon[0] && KDGameData.PreviousWeapon ? KDGameData.PreviousWeapon[0] : null)

	/*if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKeySwitchWeapon[1]) KDClickButton("offhandswitch");//previousWeapon = KDGameData.Offhand || KDGameData.OffhandOld;
	else if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKeySwitchWeapon[2]) KDClickButton("offhandswitch2");//previousWeapon = KDGameData.OffhandReturn;
	else
	if (!previousWeapon || KinkyDungeonInventoryGet(previousWeapon))
	KDSendInput("switchWeapon", {weapon: previousWeapon});
		*/
}

function KinkyDungeonHandleInventory() {
	let xOffset = -125;
	let filter = KinkyDungeonCurrentFilter;
	if (KDFilterTransform[KinkyDungeonCurrentFilter]) filter = KDFilterTransform[KinkyDungeonCurrentFilter];

	let filteredInventory = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter, undefined, undefined, undefined, undefined, KDInvFilter);



	if (CommonTime() < KDPreventAccidentalClickTime) return false;

	if (KinkyDungeonDrawInventorySelected(filteredInventory[KinkyDungeonCurrentPageInventory], undefined, undefined, xOffset)) {
		if (filter == Consumable && MouseIn(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 55)) {
			let item = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter, undefined, undefined, undefined, undefined, KDInvFilter)[KinkyDungeonCurrentPageInventory];
			if (!item || !item.name) return true;


			KDSendInput("consumable", {item: item.name, quantity: 1});
			//KinkyDungeonAttemptConsumable(item.name, 1);
		} else if (filter == Weapon) {
			// Replaced!!
		} else if (filter == Outfit && MouseIn(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 60)) {
			let outfit = ((filteredInventory[KinkyDungeonCurrentPageInventory] != null) ? filteredInventory[KinkyDungeonCurrentPageInventory].name : null);
			let toWear = KinkyDungeonGetOutfit(outfit);
			if (toWear) {
				let dress = toWear.dress;
				if (dress == "JailUniform" && KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]])
					dress = KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]].defeat_outfit;
				KDSendInput("dress", {dress: dress, outfit: outfit});
			}
		} else if (filter == LooseRestraint && MouseIn(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 275, 60)) {
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
				if (KDGameData.InventoryAction && !KDConfirmOverInventoryAction) {
					KDConfirmOverInventoryAction = true;
					return true;
				} else if (KDSendInput("equip", {name: filteredInventory[KinkyDungeonCurrentPageInventory].item.name,
					faction: filteredInventory[KinkyDungeonCurrentPageInventory].item.faction,
					inventoryVariant: filteredInventory[KinkyDungeonCurrentPageInventory].item.name != newItem.name ?
						filteredInventory[KinkyDungeonCurrentPageInventory].item.name : undefined,
					group: newItem.Group, curse: filteredInventory[KinkyDungeonCurrentPageInventory].item.curse, currentItem: currentItem ? currentItem.name : undefined, events: Object.assign([], filteredInventory[KinkyDungeonCurrentPageInventory].item.events)})) return true;

			}
		}

	}
	KDConfirmOverInventoryAction = false;

	return true;
}

function KinkyDungeonInventoryAddWeapon(Name) {
	if (!KinkyDungeonInventoryGetWeapon(Name) && KinkyDungeonWeapons[Name])
		KinkyDungeonInventoryAdd({name:Name, type:Weapon, events: Object.assign([], KinkyDungeonWeapons[Name].events), id: KinkyDungeonGetItemID()});
}

function KinkyDungeonInventoryAddLoose(Name, UnlockCurse, faction) {
	if (!KinkyDungeonInventoryGetLoose(Name) || UnlockCurse)
		KinkyDungeonInventoryAdd({faction: faction, name: Name, type: LooseRestraint, curse: UnlockCurse, events:KDRestraint(KinkyDungeonGetRestraintByName(Name)).events, quantity: 1, id: KinkyDungeonGetItemID()});
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
 * Does not remove equipped restraints
 * @param item {item}
 */
function KinkyDungeonInventoryRemoveSafe(item) {
	if (item) {
		let type = KDInventoryType(item);
		if (type != Restraint && KinkyDungeonInventory.has(type)) {
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
function KinkyDungeonInventoryGetSafe(Name) {
	for (let m of KinkyDungeonInventory.entries()) {
		if (m[0] != Restraint && m[1].has(Name)) return m[1].get(Name);
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
 * @param {NamedAndTyped} item
 * @returns {{name: any; item: any; preview: string, preview2?: string, previewcolor?: string; previewcolorbg?: string;}}
 */
function KDGetItemPreview(item) {
	/** @type {{name: any; item: any; preview: string, preview2?: string, previewcolor?: string; previewcolorbg?: string;}} */
	let ret = null;
	let Group = "";
	if (item.type == Restraint && KDRestraint(item)?.Group) Group = KDRestraint(item).Group;
	else if (item.type == LooseRestraint && KDRestraint(item)?.Group) Group = KDRestraint(item).Group;
	if ((item.type == Restraint || item.type == LooseRestraint) && KDRestraint(item)?.AssetGroup) Group = KDRestraint(item).AssetGroup;
	if (Group == "ItemMouth2" || Group == "ItemMouth3") Group = "ItemMouth";

	if (item.type == Restraint && KDRestraint(item)) {
		let data = {
			power: -1,
			color: undefined,
			bgcolor: undefined,
			RenderedItem: item,
			item: item,
		};
		KinkyDungeonSendEvent("icon", data);
		ret = {name: item.name, item: item,
			preview: KDGetRestraintPreviewImage(KDRestraint(item)),
			preview2: KDGetGroupPreviewImage(KDRestraint(item)?.Group),
		};
		if (data.color) {
			ret.previewcolor = data.color;
		}
		if (data.bgcolor) {
			ret.previewcolorbg = data.bgcolor;
		}
	}
	else if (item.type == LooseRestraint && KDRestraint(item)) {
		let data = {
			power: -1,
			color: undefined,
			bgcolor: undefined,
			RenderedItem: item,
			item: item,
		};
		KinkyDungeonSendEvent("icon", data);
		ret = {name: KDRestraint(item).name, item: item,
			preview: KDGetRestraintPreviewImage(KDRestraint(item)),
			preview2: KDGetGroupPreviewImage(KDRestraint(item)?.Group),
		};
		if (data.color) {
			ret.previewcolor = data.color;
		}
		if (data.bgcolor) {
			ret.previewcolorbg = data.bgcolor;
		}
	}
	else if (item.type == Weapon && KDWeapon(item)) {
		let data = {
			power: -1,
			color: undefined,
			bgcolor: undefined,
			RenderedItem: item,
			item: item,
		};
		KinkyDungeonSendEvent("icon", data);
		ret = {name: KDWeapon(item).name, item: item, preview: KinkyDungeonRootDirectory + `Items/${KDWeapon(item).name}.png`};
		if (data.color) {
			ret.previewcolor = data.color;
		}
		if (data.bgcolor) {
			ret.previewcolorbg = data.bgcolor;
		}
	}
	else if (item.type == Consumable && KDConsumable(item)) {
		let data = {
			power: -1,
			color: undefined,
			bgcolor: undefined,
			RenderedItem: item,
			item: item,
		};
		KinkyDungeonSendEvent("icon", data);
		ret = {name: KDConsumable(item).name, item: item, preview: KinkyDungeonRootDirectory + `Items/${KDConsumable(item).name}.png`};
		if (data.color) {
			ret.previewcolor = data.color;
		}
		if (data.bgcolor) {
			ret.previewcolorbg = data.bgcolor;
		}
	}
	else if (item.type == Outfit) ret = {name: KDOutfit(item) ? KDOutfit(item).name : "Prisoner", item: item, preview: KinkyDungeonRootDirectory + `Outfits/${KDOutfit(item).name}.png`};
	else if (item.type == 'basic') ret = {name: item.name, item: item, preview: KinkyDungeonRootDirectory + `ShopBasic/${item.name}.png`};
	//else if (item && item.name) ret.push({name: item.name, item: item, preview: ``});
	return ret;
}


/**
 *
 * @param {string} Group
 * @returns {string}
 */
function KDGetGroupPreviewImage(Group) {
	try {
		if (KDTex(KinkyDungeonRootDirectory + `Items/Group/${Group}.png`)?.valid) return KinkyDungeonRootDirectory + `Items/Group/${Group}.png`;
	} catch (e) {
		console.log(e);
	}

	return KinkyDungeonRootDirectory + `Items/Restraint.png`;
}


/**
 *
 * @param {restraint} restraint
 * @returns {string}
 */
function KDGetRestraintPreviewImage(restraint) {
	if (PIXI.Assets.cache.has(KinkyDungeonRootDirectory + `Items/Restraint/${restraint.preview || restraint.name}.png`)) return KinkyDungeonRootDirectory + `Items/Restraint/${restraint.preview || restraint.name}.png`;
	for (let tag of restraint.shrine) {
		if (PIXI.Assets.cache.has(KinkyDungeonRootDirectory + `Items/Restraint/${tag}.png`)) return KinkyDungeonRootDirectory + `Items/Restraint/${tag}.png`;
	}


	try {
		if (KDTex(KinkyDungeonRootDirectory + `Items/Restraint/${restraint.preview || restraint.name}.png`)?.valid) return KinkyDungeonRootDirectory + `Items/Restraint/${restraint.preview || restraint.name}.png`;
	} catch (e) {
		console.log(e);
	}

	try {
		for (let tag of restraint.shrine) {
			if (KDTex(KinkyDungeonRootDirectory + `Items/Restraint/${tag}.png`)?.valid) return KinkyDungeonRootDirectory + `Items/Restraint/${tag}.png`;
		}
	} catch (e) {
		console.log(e);
	}
	return KinkyDungeonRootDirectory + `Items/Restraint.png`;
	/*return StandalonePatched ? (KDTex(KinkyDungeonRootDirectory + `Items/Restraint/${restraint.name}.png`)?.valid ? KinkyDungeonRootDirectory + `Items/Restraint/${restraint.name}.png` : KinkyDungeonRootDirectory + `Items/Restraint.png`) :
			`Assets/Female3DCG/${restraint.Group}/Preview/${restraint.Asset}.png`*/
}


/**
 *
 * @param {string} Filter
 * @param {boolean} [enchanted]
 * @param {boolean} [ignoreHidden]
 * @param {boolean} [ignoreFilters]
 * @param {string} [click] - this filter will be handled and thus updates the filters
 * @param {string} [namefilter]
 * @returns {{name: any; item: any; preview: string; preview2?: string; previewcolor?: string; previewcolorbg?: string}[]}
 */
function KinkyDungeonFilterInventory(Filter, enchanted, ignoreHidden, ignoreFilters, click, namefilter) {
	let filter_orig = Filter;
	if (KDFilterTransform[Filter]) Filter = KDFilterTransform[Filter];

	let ret = [];
	let category = KinkyDungeonInventory.get(Filter);
	if (category)
		for (let item of category.values()) {
			if (ignoreHidden && KDGameData.HiddenItems && KDGameData.HiddenItems[item.inventoryVariant || item.name]) continue;

			// Special filters here
			if (filter_orig == Armor && !KDRestraint(item)?.armor) continue;
			if (filter_orig == LooseRestraint && KDRestraint(item)?.armor) continue;
			//else if (Filter == Armor && !KDRestraint(item).armor) continue;

			// Configurable filters
			if (!ignoreFilters && KDFilterFilters[filter_orig]) {
				let filters = [];
				for (let filter of Object.entries(KDFilterFilters[filter_orig])) {
					if (filter[1])
						filters.push(filter[0]);
				}
				if (filters.length > 0) {
					switch (filter_orig) {
						case Armor:
						case Restraint:
						case LooseRestraint: {
							if (KDRestraint(item) && !filters.every((filter) => {
								if (KDSpecialFilters[filter_orig] && KDSpecialFilters[filter_orig][filter]) return KDSpecialFilters[filter_orig][filter](item, filter == click);
								return KDRestraint(item).shrine?.includes(filter);
							})) continue;
							break;
						}
						case Weapon: {
							if (KDWeapon(item) && !filters.every((filter) => {
								if (KDSpecialFilters[filter_orig] && KDSpecialFilters[filter_orig][filter]) return KDSpecialFilters[filter_orig][filter](item, filter == click);
								return KDWeapon(item)?.tags?.includes(filter);
							})) continue;
							break;
						}
					}
				}
			}

			let preview = KDGetItemPreview(item);
			let pre = (item.type == LooseRestraint || item.type == Restraint) ? "Restraint" : "KinkyDungeonInventoryItem";
			if (preview && (item.type != LooseRestraint || (!enchanted || KDRestraint(item).enchanted || KDRestraint(item).showInQuickInv || item.showInQuickInv))
				&& (!namefilter || TextGet(pre + ("" + preview.name)).toLocaleLowerCase().includes(namefilter.toLocaleLowerCase())))
				ret.push(preview);
			if (item.dynamicLink) {
				let link = item.dynamicLink;
				for (let I = 0; I < 30; I++) {
					preview = KDGetItemPreview(link);
					if (preview && (link.type == Restraint) && (!namefilter || TextGet(pre + ("" + preview.name)).toLocaleLowerCase().includes(namefilter.toLocaleLowerCase())))
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
 * @param {{name: any, item: item, preview: string, preview2?: string}} item
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
	let nameText = KDGetItemName(item.item);
	if (item.item.type == Restraint || item.item.type == LooseRestraint) {
		prefix = "Restraint";
	}


	DrawTextFitKD(nameText, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5, 300, "#000000", KDTextTan, undefined, undefined, 129);
	//let wrapAmount = KDBigLanguages.includes(TranslationLanguage) ? 9 : 22;
	let textSplit = KinkyDungeonWordWrap(TextGet(prefix + name + "Desc"), 13*1.3, 30*1.3).split('\n');
	let textSplit2 = KinkyDungeonWordWrap(TextGet(prefix + name + "Desc2"), 12, 28).split('\n');

	let data = {
		extraLines: [],
		extraLineColor: [],
		extraLineColorBG: [],
		extraLinesPre: [],
		extraLineColorPre: [],
		extraLineColorBGPre: [],
		SelectedItem: item.item,
		item: item.item,
	};
	KinkyDungeonSendEvent("inventoryTooltip", data);

	let showpreview = (item.preview);//&& !MouseIn(xOffset + canvasOffsetX_ui, canvasOffsetY_ui, 840, 583)


	let i = 2;
	if (showpreview) {
		//DrawPreviewBox(canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35 - 100, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 45, item.preview, "", {Background: "#00000000"});
		//if (!treatAsHover) {
		KDDraw(kdcanvas, kdpixisprites, "preview",
			item.preview, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35 - 50, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 40, 100, 100, undefined, {
				zIndex: 129,
			}, undefined, undefined, undefined, true);
		/*if (item.preview2)
			KDDraw(kdcanvas, kdpixisprites, "preview2",
				item.preview2, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35 - 50, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 40, 100, 100, undefined, {
					zIndex: 129.1,
				}, undefined, undefined, undefined, true);*/
		//} else {
		// Draw desc2//}

		if (item.item.type == Restraint || item.item.type == LooseRestraint) {
			let restraint = KDRestraint(item.item);
			let pp = (restraint.displayPower != undefined ? restraint.displayPower : restraint.power);
			pp /= 5; // inflection point between 8 (mythic) and 9 (angelic) should be around 47 power
			DrawTextKD(TextGet("KinkyDungeonRestraintLevel").replace("RestraintLevel", "" + Math.max(1, restraint.displayPower != undefined ? restraint.displayPower : restraint.power)).replace("Rarity", TextGet("KinkyDungeonRarity" + Math.max(0, Math.min(Math.floor(pp),10)))),
				xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 408, "#000000", KDTextTan, 22, undefined, 130);
			DrawTextKD(
			restraint.escapeChance ? (item.item.lock ? (TextGet("KinkyLocked") + " " + TextGet("Kinky" + item.item.lock + "LockType")) :
				(restraint.DefaultLock && !restraint.HideDefaultLock ? (TextGet("KinkyLocked") + " " + TextGet("Kinky" + restraint.DefaultLock + "LockType")) :
				((item.item.type == Restraint && KDGetCurse(item.item)) ? TextGet("KinkyCursed") : TextGet("KinkyUnlocked"))))
			: (restraint.escapeChance.Pick != null ? TextGet("KinkyLockable") : TextGet("KinkyNonLockable")),
			xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 375, "#000000", KDTextTan, 30, undefined, 130);

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
				DrawTextFitKD(TextGet("KDGoddess") + goddesses, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 435, 300, "#000000", KDTextTan, 22, undefined, 130);
		} else if (item.item.type == Consumable) {
			let consumable = KDConsumable(item.item);
			DrawTextKD(TextGet("KinkyDungeonConsumableQuantity") + item.item.quantity, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 375, "#000000", KDTextTan, 30, undefined, 130);
			DrawTextKD(TextGet("KinkyDungeonRarity") + TextGet("KinkyDungeonRarity" + consumable.rarity), xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 410, "#000000", KDTextTan, 22, undefined, 130);
		} else if (item.item.type == Weapon) {
			let weapon = KDWeapon(item.item);
			let magic = KDWeaponIsMagic(item.item);
			let tags = [];
			if (magic) {
				tags.push("magic");
				//DrawTextKD(TextGet("KDMagicWeapon"), xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 24, "#000000", "#8888ff", 18, undefined, 129);
			}
			if (weapon?.noHands) {
				tags.push("noHands");
			}
			if (weapon?.light) {
				tags.push("light");
			}
			if (weapon?.clumsy) {
				tags.push("clumsy");
			}
			if (weapon?.heavy) {
				tags.push("heavy");
			}
			if (weapon?.massive) {
				tags.push("massive");
			}
			if (weapon?.events) {
				if (weapon.events.some((e) => {return e.offhand;})) {
					tags.push("offhand");
				}

				//DrawTextKD(TextGet("KDMagicWeapon"), xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 24, "#000000", "#8888ff", 18, undefined, 129);
			}
			if (weapon.tags) {
				for (let t of weapon.tags) {
					if (KDWeaponTags[t]) {
						tags.push(t);
					}
				}
			}

			let st = TextGet("KinkyDungeonDamageType" + weapon.type);
			if (tags.length > 0) {
				for (let t of tags) {
					if (st) {
						st = st + ', ';
					}
					st = st + (TextGet("KDWeaponTag_" + t));
				}
			}
			DrawTextFitKD(st, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 24, 300, "#000000", KDTextTan, 18, undefined, 129);

			// Draw tag icons
			let spritesize = 46;

			if (tags.length > 6) {
				spritesize *= 6/tags.length;
			}
			let spritesize2 = spritesize + 4;
			for (let tagi = -1; tagi < tags.length; tagi++) {
				if (tagi == -1) {
					// draw the weapon damage type icon
					KDDraw(kdcanvas, kdpixisprites, "wt_" + tagi,
						KinkyDungeonRootDirectory + `Buffs/dmg${weapon.type}.png`,
						canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35 - spritesize2/2 * (tags.length - 1) + spritesize2*tagi,
						canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 46 - spritesize + 133,
						spritesize, spritesize,
						undefined, {
							zIndex: 130,
						});
				} else {
					// Draw the tag
					KDDraw(kdcanvas, kdpixisprites, "wt_" + tagi,
						KinkyDungeonRootDirectory + `Buffs/weaponTag/${tags[tagi]}.png`,
						canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35 - spritesize2/2 * (tags.length - 1) + spritesize2*tagi,
						canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 46 - spritesize + 133,
						spritesize, spritesize,
						undefined, {
							zIndex: 130,
						});
					if (MouseIn(
						canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35 - spritesize2/2 * (tags.length - 1) + spritesize2*tagi,
						canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 46 - spritesize + 133,
						spritesize, spritesize,
					)) {
						textSplit = KinkyDungeonWordWrap(TextGet("KDWeaponTagD_" + tags[tagi]), 13*1.3, 30*1.3).split('\n');
					}
				}
			}


			let bindEff = weapon.bindEff || (KinkyDungeonBindingDamageTypes.includes(weapon.type) ? 1 : 0);
			let bind = weapon.bind;
			let off = (bindEff || bind) ? 75 : 0;

			DrawTextKD(TextGet("KinkyDungeonWeaponDamage") + Math.round(weapon.dmg * 10), xOffset - off + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 350, "#000000", KDTextTan, 24, undefined, 130);
			if (off) DrawTextKD(TextGet("KinkyDungeonWeaponDamageBind") + (bind ? Math.round(bind * 10) : (bindEff ? Math.round(bindEff * 100) + "%" : "")), xOffset + off + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 350, "#000000", KDTextTan, 24, undefined, 130);

			DrawTextKD(TextGet("KinkyDungeonWeaponCrit") + Math.round((weapon.crit || KDDefaultCrit) * 100) + "%", xOffset - off + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 380, "#000000", KDTextTan, 24, undefined, 130);
			if (off) DrawTextKD(TextGet("KinkyDungeonWeaponBindCrit") + Math.round((weapon.bindcrit || KDDefaultBindCrit) * 100) + "%", xOffset + off + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 380, "#000000", KDTextTan, 24, undefined, 130);

			DrawTextKD(TextGet("KinkyDungeonWeaponAccuracy") + Math.round(weapon.chance * 100) + "%", xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 410, "#000000", KDTextTan, 24, undefined, 130);
			let cost = -KinkyDungeonStatStaminaCostAttack;
			if (weapon.staminacost) cost = weapon.staminacost;
			DrawTextKD(TextGet("KinkyDungeonWeaponStamina") + Math.round(10*cost), xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 440, "#000000", KDTextTan, 24, undefined, 130);
		}


		for (let N = 0; N < textSplit.length; N++) {
			DrawTextFitKD(textSplit[N],
				xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5  + 155 + i * 23, 350, "#000000", KDTextTan, 20, undefined, 130); i++;}

	} else {
		for (let N = 0; N < textSplit.length; N++) {
			DrawTextFitKD(textSplit[N],
				xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 25, 640*KinkyDungeonBookScale/2.5, "#000000", KDTextTan, 24, undefined, 130); i++;}
	}
	i = 0;
	for (let N = 0; N < data.extraLinesPre.length; N++) {
		DrawTextFitKD(data.extraLinesPre[N],
			xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1.07/3.35), canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 35, 640*KinkyDungeonBookScale/2.5, data.extraLineColorPre[N], data.extraLineColorBGPre[N], 24, undefined, 130); i++;}
	for (let N = 0; N < textSplit2.length; N++) {
		DrawTextFitKD(textSplit2[N],
			xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1.07/3.35), canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 35, 640*KinkyDungeonBookScale/2.5, "#000000", KDTextTan, 24, undefined, 130); i++;}
	for (let N = 0; N < data.extraLines.length; N++) {
		DrawTextFitKD(data.extraLines[N],
			xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1.07/3.35), canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 35, 640*KinkyDungeonBookScale/2.5, data.extraLineColor[N], data.extraLineColorBG[N], 24, undefined, 130); i++;}

	i = 0;

	return true;
}



function KinkyDungeonDrawInventory() {
	let xOffset = -125;
	KinkyDungeonDrawMessages(true);

	FillRectKD(kdcanvas, kdpixisprites, "maininvbg", {
		Left: canvasOffsetX_ui + xOffset + 40,
		Top: canvasOffsetY_ui - 60,
		Width: 1965 - (canvasOffsetX_ui + 40),
		Height: 815,
		Color: "#000000",
		LineWidth: 1,
		zIndex: 19,
		alpha: 0.3
	});
	DrawRectKD(kdcanvas, kdpixisprites, "maininvbg2", {
		Left: canvasOffsetX_ui + xOffset + 40,
		Top: canvasOffsetY_ui - 60,
		Width: 1965 - (canvasOffsetX_ui + 40),
		Height: 815,
		Color: "#000000",
		LineWidth: 1,
		zIndex: 19,
		alpha: 0.9
	});

	let filter = KinkyDungeonCurrentFilter;
	if (KDFilterTransform[KinkyDungeonCurrentFilter]) filter = KDFilterTransform[KinkyDungeonCurrentFilter];
	let filteredInventory = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter, undefined, undefined, undefined, undefined, KDInvFilter);

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
	if (KinkyDungeonFilterInventory(KinkyDungeonFilters[0], undefined, undefined, undefined, undefined, KDInvFilter).length == 0) {
		defaultIndex = 1;
	}

	for (let I = 0; I < KinkyDungeonFilters.length; I++) {
		let col = KDTextGray2;
		if (KinkyDungeonFilterInventory(KinkyDungeonFilters[I], false, false, true).length > 0 || I == defaultIndex) {
			col = "#888888";
		}
		else if (KinkyDungeonFilters.indexOf(KinkyDungeonCurrentFilter) == I) {
			KinkyDungeonCurrentFilter = KinkyDungeonFilters[defaultIndex];
			KDPreventAccidentalClickTime = CommonTime() + 1200;
		}

		if (!KDConfigHotbar)
			DrawButtonKDEx("categoryfilter" + I, (bdata) => {
				KinkyDungeonCurrentFilter = KinkyDungeonFilters[I];
				KinkyDungeonCurrentPageInventory = 0;
				return true;
			}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale - 55, canvasOffsetY_ui + 115 + I*65, 180, 60,
			TextGet("KinkyDungeonCategoryFilter" + KinkyDungeonFilters[I]),
				(KinkyDungeonCurrentFilter == KinkyDungeonFilters[I]) ? "White" : col, "", "");
	}


	DrawTextFitKD(
		TextGet("KDInvFilter")
			.replace("ITMNS", TextGet("KinkyDungeonCategoryFilter" + KinkyDungeonCurrentFilter)),
		1460 + xOffset + 350/2, 150 - 20, 200, "#ffffff", KDTextGray0, 18, "center");
	let TF = KDTextField("InvFilter", 1460 + xOffset, 150, 350, 54, "text", "", "45");
	if (TF.Created) {
		KDInvFilter = "";
		TF.Element.oninput = (event) => {
			KDInvFilter = ElementValue("InvFilter");
		};
	}

	let selected = filteredInventory[KinkyDungeonCurrentPageInventory];
	if (filteredInventory.length > 0) {
		let useIcons = KDInventoryUseIconConfig[filter];
		let rowsShort = useIcons ? 4 : 1;
		let rowsLong = useIcons ? 6 : 2;
		let xBonusShort = useIcons ? 2 : 1;
		let numRows = rowsLong;
		let maxList = useIcons ? 7 : 12;
		let b_width = useIcons ? 80 : 200;
		let b_height = useIcons ? 80 : 45;
		let padding = 4;
		let yy = 0;
		let xx = -1;

		if (selected && KDConfigHotbar) {
			KDDrawHotbar(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 40, canvasOffsetY_ui + 50, selected.item.name, (I) => {
				if (KinkyDungeonConsumableChoices[I] || KinkyDungeonWeaponChoices[I] || KinkyDungeonArmorChoices[I] || KinkyDungeonSpellChoices[I] >= 0) {
					KDSendInput("spellRemove", {I:I});
				} else {
					KinkyDungeonClickItemChoice(I, selected.item.name);
				}
			});
			DrawButtonKDEx("KDBack", (bdata) => {
				KDConfigHotbar = !KDConfigHotbar;
				return true;
			}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale - 60, 190, 55, TextGet("KDBack"), "#ffffff", "");

		} else {
			if (filter != Outfit)
				DrawButtonKDEx("KDAddToHotbar", (bdata) => {
					KDConfigHotbar = !KDConfigHotbar;
					return true;
				}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 190, 55, TextGet("KDAddToHotbar"), "#ffffff", "");

			KDConfigHotbar = false;
			for (let i = 0; i < numRows*maxList && yy < maxList; i++) {
				let xBonus = 0;
				if (KDFilterFilters[KinkyDungeonCurrentFilter] && Object.keys(KDFilterFilters[KinkyDungeonCurrentFilter]).length/2 > yy + (xx + 1 >= (rowsLong) ? 1 : 0)) {
					numRows = rowsShort;
					xBonus = xBonusShort;
				} else {
					numRows = rowsLong;
					xBonus = 0;
				}
				xx = (xx + 1) % (xBonus + numRows);
				if (xx == 0) {
					if (i > 0) yy++;
					xx += xBonus;
				}
				/** If there are defined filters we use them instead of double stacking */

				if (yy >= maxList) break;
				let index = i + KinkyDungeonInventoryOffset;
				if (filteredInventory[index] && filteredInventory[index].item) {
					let text = KDGetItemName(filteredInventory[index].item);
					let suff = "";
					if (filteredInventory[index].item.quantity) {
						suff = " x" + filteredInventory[index].item.quantity;
					}

					DrawButtonKDExScroll("invchoice_" + i, (amount) => {
						KinkyDungeonInventoryOffset = Math.max(0, Math.min(filteredInventory.length + 2 - numRows*3,
							KinkyDungeonInventoryOffset + numRows*Math.sign(amount)*Math.ceil(Math.abs(amount)/b_height/numRows/b_width)));
					}, (bdata) => {
						KinkyDungeonCurrentPageInventory = index;
						return true;
					}, true, canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135, canvasOffsetY_ui + 50 + b_height * yy, b_width-padding, b_height-padding,
					useIcons ? ("") : (text + suff),
					"#ffffff",//useIcons ? "#ffffff" : index == KinkyDungeonCurrentPageInventory ? "#ffffff" : "#888888",
					useIcons ? filteredInventory[index].preview || "" : "",
					undefined, undefined, index != KinkyDungeonCurrentPageInventory, KDTextGray1, undefined, undefined, {
						scaleImage: true,
					});
					if (useIcons && filteredInventory[index].preview2)
						KDDraw(kdcanvas, kdpixisprites, "invchoice_2_" + i,
							filteredInventory[index].preview2, canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135, canvasOffsetY_ui + 50 + b_height * yy, b_width-padding, b_height-padding,
							undefined, {
								zIndex: 100.1,
								alpha: 0.9,
							});
					if (filteredInventory[index].previewcolor) {
						KDDraw(kdcanvas, kdpixisprites, "invchoice_halo" + i,
							KinkyDungeonRootDirectory + "UI/ItemAura.png", canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135, canvasOffsetY_ui + 50 + b_height * yy, b_width-padding, b_height-padding,
							undefined, {
								zIndex: 100.003,
								tint: string2hex(filteredInventory[index].previewcolor),
								alpha: 0.9,
							});
					}
					if (filteredInventory[index].previewcolorbg) {
						KDDraw(kdcanvas, kdpixisprites, "invchoice_halobg" + i,
							KinkyDungeonRootDirectory + "UI/ItemAuraBG.png", canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135, canvasOffsetY_ui + 50 + b_height * yy, b_width-padding, b_height-padding,
							undefined, {
								zIndex: 100.002,
								tint: string2hex(filteredInventory[index].previewcolorbg),
								alpha: 0.8,
							});
					}
					if (filteredInventory[index].item.quantity != undefined) {
						DrawTextKD("" + filteredInventory[index].item.quantity, canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 140, canvasOffsetY_ui + 50 + b_height * yy + 18, "#ffffff", undefined, 18, "left");
					}
				} else {
					if (i + KinkyDungeonInventoryOffset > filteredInventory.length + numRows*3)
						KinkyDungeonInventoryOffset = Math.max(0, filteredInventory.length + numRows*3 - i);
					//break;
					// Instead of breaking, we fill in the missing squares
					DrawButtonKDExScroll("invchoice_" + i, (amount) => {
						KinkyDungeonInventoryOffset = Math.max(0, Math.min(filteredInventory.length + 2 - numRows*3,
							KinkyDungeonInventoryOffset + numRows*Math.sign(amount)*Math.ceil(Math.abs(amount)/b_height/numRows/b_width)));
					}, (bdata) => {
						//KinkyDungeonCurrentPageInventory = index;
						return true;
					}, true, canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135, canvasOffsetY_ui + 50 + b_height * yy, b_width-padding, b_height-padding,
					"",
					"#ffffff",
					"",
					undefined, undefined, index != KinkyDungeonCurrentPageInventory, KDTextGray1, undefined, undefined, {
						scaleImage: true,
					});


					/*FillRectKD(kdcanvas, kdpixisprites, "kdInvEmptySpot" + i, {
						Left: canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135,
						Top: canvasOffsetY_ui + 50 + b_height * yy,
						Width: b_width-padding,
						Height: b_height-padding,
						Color: KDTextGray1,
						LineWidth: 1,
						zIndex: 20,
						alpha: 0.4,
					});*/
				}
			}


			DrawButtonKDEx("invScrollUp", (bdata) => {
				if (filteredInventory.length > 0) {
					if (KinkyDungeonInventoryOffset > 0) {
						KinkyDungeonInventoryOffset = Math.max(0, KinkyDungeonInventoryOffset - numRows*3);
					}
				}
				return true;
			}, true,
			canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 526, canvasOffsetY_ui, 90, 44, "", KinkyDungeonInventoryOffset > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.png");
			DrawButtonKDEx("invScrollDown", (bdata) => {
				if (filteredInventory.length > 0) {
					if (KinkyDungeonInventoryOffset + numRows*3 < filteredInventory.length + 2) {
						KinkyDungeonInventoryOffset += numRows*3;
					}
				}
				return true;
			}, true,
			canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 526, 480*KinkyDungeonBookScale + canvasOffsetY_ui - 4, 90, 44, "", (KinkyDungeonInventoryOffset + 24 < filteredInventory.length) ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.png");
		}
	}
	if (KDFilterFilters[KinkyDungeonCurrentFilter] && !KDConfigHotbar) {
		let filters = Object.entries(KDFilterFilters[KinkyDungeonCurrentFilter]);
		for (let i = 0; i < filters.length; i++) {
			let xx = 0;
			let yy = i;
			DrawButtonKDEx("invchoice_filter_" + i, (bdata) => {
				KDFilterFilters[KinkyDungeonCurrentFilter][filters[i][0]] = !KDFilterFilters[KinkyDungeonCurrentFilter][filters[i][0]];
				KinkyDungeonInventoryOffset = 0;
				KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter, undefined, undefined, undefined, filters[i][0], KDInvFilter);
				return true;
			}, true, canvasOffsetX_ui + xOffset + xx * 200 + 640*KinkyDungeonBookScale + 132, canvasOffsetY_ui + 50 + 40 * yy, 159, 36,
			TextGet("KDFilterFilters" + filters[i][0]), filters[i][1] ? "#ffffff" : "#aaaaaa", undefined, undefined, undefined, !filters[i][1], KDTextGray1, 20);

		}
	}
	if (KinkyDungeonDrawInventorySelected(filteredInventory[KinkyDungeonCurrentPageInventory], undefined, undefined, xOffset) && !KDConfigHotbar) {
		if (filter == Consumable) {
			DrawButtonVis(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 275, 55, TextGet("KinkyDungeonConsume"), "White", "", "");
			DrawButtonKDEx("dropitem", (bdata) => {
				KDSendInput("drop", {item: filteredInventory[KinkyDungeonCurrentPageInventory].item.name});
				return true;
			}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 60, 275, 55, TextGet("KinkyDungeonDrop"), "White", "", "");
			if (KDGameData.InventoryAction) {
				DrawButtonKDEx("inventoryAction", (bdata) => {
					KDSendInput("inventoryAction", {player: KinkyDungeonPlayerEntity, item: filteredInventory[KinkyDungeonCurrentPageInventory].item});
					return true;
				}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 60, 275, 55,
				KDInventoryAction[KDGameData.InventoryAction] && KDInventoryAction[KDGameData.InventoryAction].text ? KDInventoryAction[KDGameData.InventoryAction].text(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item) : TextGet("KDInventoryAction" + KDGameData.InventoryAction),
				KDInventoryAction[KDGameData.InventoryAction] && KDInventoryAction[KDGameData.InventoryAction].valid(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item)
					? "#ffffff" : "#888888",
				"", "");
			}
		}
		if (filter == Weapon && !isUnarmed(KinkyDungeonWeapons[filteredInventory[KinkyDungeonCurrentPageInventory].name])) {
			let weapon = ((filteredInventory[KinkyDungeonCurrentPageInventory] != null) ? filteredInventory[KinkyDungeonCurrentPageInventory].item.name : null);
			let equipped = filteredInventory[KinkyDungeonCurrentPageInventory] && filteredInventory[KinkyDungeonCurrentPageInventory].item.name == KinkyDungeonPlayerWeapon;
			DrawButtonKDEx("equipwep", (bdata) => {
				KDSendInput("switchWeapon", {weapon: weapon});
				return true;
			}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 275, 55, TextGet(equipped ? "KinkyDungeonEquipped" : "KinkyDungeonEquip"), equipped ? "grey" : "White", "", "");
			if (equipped) DrawButtonKDEx("unequipwep", (bdata) => {
				KDSendInput("unequipWeapon", {weapon: weapon});
				return true;
			}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 60, 275, 55, TextGet("KinkyDungeonUnEquip"), "White", "", "");

			if (weapon) {
				if (KDGameData.InventoryAction) {
					DrawButtonKDEx("inventoryAction", (bdata) => {
						KDSendInput("inventoryAction", {player: KinkyDungeonPlayerEntity, item: filteredInventory[KinkyDungeonCurrentPageInventory].item});
						return true;
					}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 60, 275, 55,
					KDInventoryAction[KDGameData.InventoryAction] && KDInventoryAction[KDGameData.InventoryAction].text ? KDInventoryAction[KDGameData.InventoryAction].text(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item) : TextGet("KDInventoryAction" + KDGameData.InventoryAction),
					KDInventoryAction[KDGameData.InventoryAction] && KDInventoryAction[KDGameData.InventoryAction].valid(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item)
						? "#ffffff" : "#888888",
					"", "");
				}
			}
		}
		if (filter == Outfit) {
			let outfit = ((filteredInventory[KinkyDungeonCurrentPageInventory] != null) ? filteredInventory[KinkyDungeonCurrentPageInventory].name : "");
			let toWear = KinkyDungeonGetOutfit(outfit);
			if (toWear) {
				DrawButtonVis(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 60, TextGet("KinkyDungeonEquip"), KDGameData.Outfit == outfit ? "grey" : "White", "", "");
			}
		}
		if (filter == LooseRestraint) {
			let equipped = false;

			if (filteredInventory[KinkyDungeonCurrentPageInventory]
				&& filteredInventory[KinkyDungeonCurrentPageInventory].item) {
				let newItem = KDRestraint(filteredInventory[KinkyDungeonCurrentPageInventory].item);
				if (newItem) {
					/*let currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
					if (!currentItem
						|| (KinkyDungeonLinkableAndStricter(KDRestraint(currentItem), newItem, currentItem) &&
							((newItem.linkCategory && KDLinkCategorySize(currentItem, newItem.linkCategory) + KDLinkSize(newItem) <= 1.0)
							|| (!newItem.linkCategory && !KDDynamicLinkList(currentItem, true).some((item) => {return newItem.name == item.name;}))))) {
						equipped = false;
					} else equipped = true;*/
					if (!KDCanAddRestraint(newItem, false, "", true, undefined, false, true, undefined, false)) equipped = true;
				}
			}
			DrawButtonVis(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 275, 55, TextGet("KinkyDungeonEquip"),
				equipped ? "grey" : ((!KDGameData.InventoryAction || KDConfirmOverInventoryAction) ? "#ffffff" : "#ff8888"), "", "");
			DrawButtonKDEx("dropitem", (bdata) => {
				if (KDGameData.InventoryAction && !KDConfirmOverInventoryAction) {
					KDConfirmOverInventoryAction = true;
				} else
					KDSendInput("drop", {item: filteredInventory[KinkyDungeonCurrentPageInventory].item.name});
				return true;
			}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 60, 275, 55, TextGet("KinkyDungeonDrop"),
			(!KDGameData.InventoryAction || KDConfirmOverInventoryAction) ? "#ffffff" : "#ff8888", "", "");
			if (KDGameData.InventoryAction) {
				DrawButtonKDEx("inventoryAction", (bdata) => {
					KDSendInput("inventoryAction", {player: KinkyDungeonPlayerEntity, item: filteredInventory[KinkyDungeonCurrentPageInventory].item});
					return true;
				}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 60, 275, 55,
				KDInventoryAction[KDGameData.InventoryAction] && KDInventoryAction[KDGameData.InventoryAction].text ? KDInventoryAction[KDGameData.InventoryAction].text(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item) : TextGet("KDInventoryAction" + KDGameData.InventoryAction),
					KDInventoryAction[KDGameData.InventoryAction] && KDInventoryAction[KDGameData.InventoryAction].valid(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item)
					? "#ffffff" : "#888888",
					"", "");
			}
		}
		if (filter == Restraint) {
			let item = filteredInventory[KinkyDungeonCurrentPageInventory].item;
			let itemIndex = KDGetItemLinkIndex(item, false);
			DrawButtonKDEx("struggleItem", (bdata) => {
				if (itemIndex >= 0 && KDCanStruggle(item)) {
					let r = KDRestraint(item);
					let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
					KDSendInput("struggle", {group: sg.group, index: itemIndex, type: "Struggle"});
				}
				return true;
			}, itemIndex >= 0 && KDCanStruggle(item), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 275, 55, TextGet("KinkyDungeonStruggle"),
			(itemIndex >= 0 && KDCanRemove(item)) ? "#ffffff" : "#888888", "", "");
			DrawButtonKDEx("removeItem", (bdata) => {
				if (itemIndex >= 0 && KDCanRemove(item)) {
					let r = KDRestraint(item);
					let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
					KDSendInput("struggle", {group: sg.group, index: itemIndex, type: (item.lock) ? "Unlock" : "Remove"});
				}
				return true;
			}, itemIndex >= 0 && KDCanRemove(item), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 60, 275, 55, TextGet("KinkyDungeon" + ((item.lock) ? "Unlock" : "Remove")),
			(itemIndex >= 0 && KDCanRemove(item)) ? "#ffffff" : "#888888", "", "");

			if (KDGameData.InventoryAction) {
				DrawButtonKDEx("inventoryAction", (bdata) => {
					KDSendInput("inventoryAction", {player: KinkyDungeonPlayerEntity, item: filteredInventory[KinkyDungeonCurrentPageInventory].item});
					return true;
				}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 60, 275, 55,
					KDInventoryAction[KDGameData.InventoryAction] && KDInventoryAction[KDGameData.InventoryAction].text ? KDInventoryAction[KDGameData.InventoryAction].text(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item) : TextGet("KDInventoryAction" + KDGameData.InventoryAction),
					KDInventoryAction[KDGameData.InventoryAction] && KDInventoryAction[KDGameData.InventoryAction].valid(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item)
					? "#ffffff" : "#888888",
					"", "");
			}
		}
	}
	if (KinkyDungeonCurrentPageInventory >= filteredInventory.length) KinkyDungeonCurrentPageInventory = Math.max(0, KinkyDungeonCurrentPageInventory - 1);

	if (KinkyDungeonCurrentPageInventory > 0) {
		DrawButtonKDEx("invlastpage", (bdata) => {
			if (KinkyDungeonCurrentPageInventory > 0) {
				KinkyDungeonCurrentPageInventory -= 1;
				return true;
			}
			return true;
		}, true, canvasOffsetX_ui + xOffset + 100, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60, TextGet("KinkyDungeonBookLastPage"), "White", "", "", undefined, true, KDButtonColor);
	}
	if (KinkyDungeonCurrentPageInventory < filteredInventory.length-1) {
		DrawButtonKDEx("invnextpage", (bdata) => {
			if (KinkyDungeonCurrentPageInventory < filteredInventory.length-1) {
				KinkyDungeonCurrentPageInventory += 1;
				return true;
			}
			return true;
		}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale - 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60, TextGet("KinkyDungeonBookNextPage"), "White", "", "", undefined, true, KDButtonColor);
	}

}

function KinkyDungeonSendInventoryEvent(Event, data) {
	if (!KDMapHasEvent(KDEventMapInventory, Event)) return;
	for (let item of KinkyDungeonAllRestraint()) {
		let curse = KDGetCurse(item);
		if (item.dynamicLink)
			for (let d_item of KDDynamicLinkList(item)) {
				let oldEvents = d_item.events;
				let d_curse = KDGetCurse(d_item);
				if (oldEvents)
					for (let e of oldEvents) {
						if (e.inheritLinked && e.trigger === Event && (!e.curse || d_curse) && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
							KinkyDungeonHandleInventoryEvent(Event, e, d_item, data);
						}
					}
				if (d_curse && KDCurses[d_curse]?.events) {
					for (let e of KDCurses[d_curse].events) {
						if (e.trigger === Event && (!e.curse || d_curse) && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
							KinkyDungeonHandleInventoryEvent(Event, e, d_item, data);
						}
					}
				}
			}
		if (item.events) {
			for (let e of item.events) {
				if (e.trigger === Event && (!e.curse || curse) && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
					KinkyDungeonHandleInventoryEvent(Event, e, item, data);
				}
			}
		}
		if (curse && KDCurses[curse]?.events) {
			for (let e of KDCurses[curse].events) {
				if (e.trigger === Event && (!e.curse || curse) && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
					KinkyDungeonHandleInventoryEvent(Event, e, item, data);
				}
			}
		}
	}
}

function KinkyDungeonSendInventorySelectedEvent(Event, data) {
	if (!KDMapHasEvent(KDEventMapInventorySelected, Event)) return;
	let item = data.SelectedItem;
	if (item?.events) {
		for (let e of item.events) {
			if (e.trigger === Event) {
				KinkyDungeonHandleInventorySelectedEvent(Event, e, item, data);
			}
		}
	}
}

function KinkyDungeonSendInventoryIconEvent(Event, data) {
	if (!KDMapHasEvent(KDEventMapInventoryIcon, Event)) return;
	let item = data.RenderedItem;
	if (item?.events) {
		for (let e of item.events) {
			if (e.trigger === Event) {
				KinkyDungeonHandleInventoryIconEvent(Event, e, item, data);
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
	"Consumable": 24,
	"Restraint": 24,
	"Weapon": 18,
};

let KDNumOfQuickLoadouts = 3;
let KDQuickLoadoutSave = false;

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
	let fC = KinkyDungeonFilterInventory(Consumable, false, !KDInventoryStatus.HideQuickInv, undefined, undefined, KDInvFilter);
	let consumables = fC.slice(KDScrollOffset.Consumable, KDScrollOffset.Consumable + KDItemsPerScreen.Consumable);
	let fW = KinkyDungeonFilterInventory(Weapon, false, !KDInventoryStatus.HideQuickInv, undefined, undefined, KDInvFilter);
	let weapons = fW.slice(KDScrollOffset.Weapon, KDScrollOffset.Weapon + KDItemsPerScreen.Weapon);
	let fR = [
		...KinkyDungeonFilterInventory(LooseRestraint, true, !KDInventoryStatus.HideQuickInv, undefined, undefined, KDInvFilter),
		...KinkyDungeonFilterInventory(Armor, true, !KDInventoryStatus.HideQuickInv, undefined, undefined, KDInvFilter)];
	let restraints = fR.slice(KDScrollOffset.Restraint, KDScrollOffset.Restraint + KDItemsPerScreen.Restraint);
	let Wheight = KinkyDungeonQuickGrid(weapons.length-1, H, V, 6).y;
	let Rheight = 480;

	DrawTextFitKD(
		TextGet("KDInvFilterQ"),
		75 + 340/2, 350 - 20, 200, "#ffffff", KDTextGray0, 18, "center");
	let TF = KDTextField("QInvFilter", 75, 350, 340, 54, "text", "", "45");
	if (TF.Created) {
		KDInvFilter = "";
		TF.Element.oninput = (event) => {
			KDInvFilter = ElementValue("QInvFilter");
		};
	}

	KDScrollOffset.Consumable = Math.max(0, Math.min(Math.ceil((fC.length - KDItemsPerScreen.Consumable)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Consumable));
	KDScrollOffset.Restraint = Math.max(0, Math.min(Math.ceil((fR.length - KDItemsPerScreen.Restraint)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Restraint));
	KDScrollOffset.Weapon = Math.max(0, Math.min(Math.ceil((fW.length - KDItemsPerScreen.Weapon)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Weapon));

	if (fC.length > KDItemsPerScreen.Consumable) {
		DrawButtonVis(510, 105, 90, 40, "", "white", KinkyDungeonRootDirectory + "Up.png");
		DrawButtonVis(510, 150, 90, 40, "", "white", KinkyDungeonRootDirectory + "Down.png");
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
	if (KinkyDungeonControlsEnabled()) {
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


		// Quick loadouts
		let QL_y = 260;
		DrawButtonKDEx("quickLoadout_save", (bdata) => {
			KDQuickLoadoutSave = !KDQuickLoadoutSave;
			return true;
		}, true, 630, QL_y, 120, 60, TextGet("KDQuickLoadoutSave"), "#dddddd", "", undefined, false, !KDQuickLoadoutSave, KDButtonColor);

		if (KDQuickLoadoutSave) {
			DrawCheckboxKDEx("QuickLoadout_Weapon", (bdata) => {
				KDGameData.QuickLoadout_Weapon = !KDGameData.QuickLoadout_Weapon;
				return true;
			}, true, 510, 110, 64, 64, TextGet("KDQuickLoadout_Weapon"), KDGameData.QuickLoadout_Weapon, false, "#ffffff");

			DrawCheckboxKDEx("QuickLoadout_Merge", (bdata) => {
				KDGameData.QuickLoadout_Merge = !KDGameData.QuickLoadout_Merge;
				return true;
			}, true, 510, 180, 64, 64, TextGet("KDQuickLoadout_Merge"), KDGameData.QuickLoadout_Merge, false, "#ffffff");
		}

		for (let i = 1; i <= KDNumOfQuickLoadouts; i++) {
			DrawButtonKDEx("quickLoadout_num_" + i, (bdata) => {
				if (KDQuickLoadoutSave) {
					// Save the loadout
					KDGameData.CurrentLoadout = i;
					KDQuickLoadoutSave = false;
					KDSaveQuickLoadout(i);
				} else {
					if (KDGameData.CurrentLoadout != i) {
						// Load the loadout
						KDGameData.CurrentLoadout = i;
						KDLoadQuickLoadout(i, true);
					} else KDGameData.CurrentLoadout = 0;
				}

				return true;
			}, true, 630, QL_y + 70 * i, 120, 60, i + "", "#dddddd", "",
			undefined, false, KDGameData.CurrentLoadout != i || KDQuickLoadoutSave, KDButtonColor,
			undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySwitchLoadout[i]),
			});
			if (MouseIn(630, QL_y + 70 * i, 120, 60)) {
				for (let ii = 0; ii < 20 && ii < (KDGameData.QuickLoadouts ? (KDGameData.QuickLoadouts[i+""] ? KDGameData.QuickLoadouts[i+""].length : 0) : 0); ii++) {
					let item = KDGameData.QuickLoadouts[i+""][ii];
					let str = KDGetItemNameString(item);
					DrawTextKD(str, 770, QL_y + ii * 25, KinkyDungeonInventoryGet(item) ? "#ffffff" : "#ff5555", undefined, 22, "left");
				}
			}
		}

		// Dummy button for BG
		DrawButtonKDEx("quickinvbg2_button", (bdata) => {
			return true;
		}, true, 620, 250, 140, 520, "", KDButtonColor, undefined, undefined, false, true,
		"#000000", undefined, undefined, {zIndex: -1, alpha: 0.9});


	}

	for (let c = 0; c < consumables.length; c++) {
		let item = consumables[c];
		if (item.preview) {
			let point = KinkyDungeonQuickGrid(c, H, V, 6);
			if (MouseIn(point.x + 1, 1+ point.y + 30, H-2, V-2)) {
				/*FillRectKD(kdcanvas, kdpixisprites, "consumables" + c, {
					Left: point.x,
					Top: point.y + 30,
					Width: H,
					Height: V,
					Color: KDTextGray3,
					LineWidth: 1,
					zIndex: 60,
					alpha: 0.5
				});*/
				KinkyDungeonDrawInventorySelected(item, false, true);
			}

			DrawButtonKDExScroll("consumablesicon" + c,
				(amount) => {
					if (amount > 0)
						KDScrollOffset.Consumable = Math.min(Math.ceil((fC.length - KDItemsPerScreen.Consumable)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Consumable +
							Math.ceil(0.5*amount/80) * KDScrollAmount);
					else
						KDScrollOffset.Consumable = Math.max(0, KDScrollOffset.Consumable -
							Math.ceil(0.5*-amount/80) * KDScrollAmount);
				},
				(bdata)=> {
					if (!KinkyDungeonControlsEnabled()) return true;
					if (KDInventoryStatus.HideQuickInv) {
						KDGameData.HiddenItems[item.name] = !KDGameData.HiddenItems[item.name];
					} else if (KDInventoryStatus.DropQuickInv) {
						KDSendInput("drop", {item: item.item.name});
					} else if (KDInventoryStatus.SortQuickInv) {
						if (MouseIn(point.x + H/2, point.y + 30, H/2, V)) {
							// Sort left
							if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
							if (KDGameData.ItemPriority[item.item?.name|| item.name] == undefined) KDGameData.ItemPriority[item.item?.name|| item.name] = -1;
							else if (KDGameData.ItemPriority[item.item?.name|| item.name] > -9) KDGameData.ItemPriority[item.item?.name|| item.name] -= 1;
						} else {
							// Sort right
							if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
							if (KDGameData.ItemPriority[item.item?.name|| item.name] == undefined) KDGameData.ItemPriority[item.item?.name|| item.name] = 1;
							else if (KDGameData.ItemPriority[item.item?.name|| item.name] < 9) KDGameData.ItemPriority[item.item?.name|| item.name] += 1;
						}
					}  else {
						KDSendInput("consumable", {item: item.item.name, quantity: 1});
					}
					return true;
				}, true,
				point.x, point.y + 30, 80, 80,
				"", "#ffffff", item.preview, undefined, undefined, true, undefined, undefined, undefined,
				{
					zIndex: 109,
					scaleImage: true,
				}
			);
			/*
			KDDraw(kdcanvas, kdpixisprites, "consumablesicon" + c,
				item.preview, point.x, point.y + 30, 80, 80, undefined, {
					zIndex: 109,
				});*/


			if (item.previewcolor) {
				KDDraw(kdcanvas, kdpixisprites, "coniconhalo" + c,
					KinkyDungeonRootDirectory + "UI/ItemAura.png", point.x, point.y + 30, 80, 80, undefined, {
						zIndex: 108.5,
						tint: string2hex(item.previewcolor),
						alpha: 0.9,
					});
			}
			if (item.previewcolorbg) {
				KDDraw(kdcanvas, kdpixisprites, "coniconhalobg" + c,
					KinkyDungeonRootDirectory + "UI/ItemAuraBG.png", point.x, point.y + 30, 80, 80, undefined, {
						zIndex: 108.4,
						tint: string2hex(item.previewcolorbg),
						alpha: 0.8,
					});
			}

			if ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.name]) || KDInventoryStatus.HideQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "consumablesiconhidden" + c,
					KinkyDungeonRootDirectory + ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.name]) ? "InvHidden.png" : "InvVisible.png"), point.x, point.y + 30, 80, 80, undefined, {
						zIndex: 110,
					});
			} else if (KDInventoryStatus.DropQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "consumablesiconhidden" + c,
					KinkyDungeonRootDirectory + "InvItemDrop.png", point.x, point.y + 30, 80, 80, undefined, {
						zIndex: 111,
					});
			} else if (KDInventoryStatus.SortQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "consumablesiconsort" + c,
					KinkyDungeonRootDirectory + "InvItemSort.png", point.x, point.y + 30, 80, 80, undefined, {
						zIndex: 111,
					});
				DrawTextKD("" + (KDGameData.ItemPriority? KDGameData.ItemPriority[item.item?.name|| item.name] || 0 : 0), point.x + 40, point.y + 30 + 20, "#ffffff", undefined, 30,);
			} else if (MouseIn(point.x, point.y + 30, 80, 80) || KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] > 0) {
				DrawButtonKDEx("consumablesiconfav" + c + (KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] ? "b" : "a"), (bdata) => {
					if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
					if (!(KDGameData.ItemPriority[item.item?.name|| item.name] > 9)) KDGameData.ItemPriority[item.item?.name|| item.name] = 10;
					else KDGameData.ItemPriority[item.item?.name|| item.name] = 0;
					KDSortInventory(KinkyDungeonPlayerEntity);
					return true;
				},true, point.x + 80 - 32, point.y + 30, 32, 32, "", "#ffffff", KinkyDungeonRootDirectory +
					(KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] > 0 ? "UI/Star.png" : "UI/StarOff.png"),
				"", false, true, undefined, undefined, undefined, {
					zIndex: 111,
				});
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
				/*FillRectKD(kdcanvas, kdpixisprites, "weapons" + w, {
					Left: point.x,
					Top: 1000 - V - Wheight + point.y,
					Width: H,
					Height: V,
					Color: KDTextGray3,
					LineWidth: 1,
					zIndex: 60,
					alpha: 0.5
				});*/
				KinkyDungeonDrawInventorySelected(item, false, true);
			}

			DrawButtonKDExScroll("weaponsicon" + w,
				(amount) => {
					if (amount > 0)
						KDScrollOffset.Weapon = Math.min(Math.ceil((fW.length - KDItemsPerScreen.Weapon)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Weapon +
							Math.ceil(0.5*amount/80) * KDScrollAmount);
					else
						KDScrollOffset.Weapon = Math.max(0, KDScrollOffset.Weapon -
							Math.ceil(0.5*-amount/80) * KDScrollAmount);
				},
				(bdata)=> {
					if (!KinkyDungeonControlsEnabled()) return true;
					if (KDInventoryStatus.HideQuickInv) {
						KDGameData.HiddenItems[item.name] = !KDGameData.HiddenItems[item.name];
					} else if (KDInventoryStatus.DropQuickInv && item.name != "Unarmed") {
						KDSendInput("drop", {item: item.item.name});
					} else if (KDInventoryStatus.SortQuickInv) {
						if (MouseIn(point.x + H/2, 1000 - V - Wheight + point.y, H/2, V)) {
							// Sort left
							if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
							if (KDGameData.ItemPriority[item.item?.name|| item.name] == undefined) KDGameData.ItemPriority[item.item?.name|| item.name] = -1;
							else if (KDGameData.ItemPriority[item.item?.name|| item.name] > -9) KDGameData.ItemPriority[item.item?.name|| item.name] -= 1;
						} else {
							// Sort right
							if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
							if (KDGameData.ItemPriority[item.item?.name|| item.name] == undefined) KDGameData.ItemPriority[item.item?.name|| item.name] = 1;
							else if (KDGameData.ItemPriority[item.item?.name|| item.name] < 9) KDGameData.ItemPriority[item.item?.name|| item.name] += 1;
						}
					}  else {
						let weapon = item.name != "Unarmed" ? item.item.name : null;
						KDSendInput("switchWeapon", {weapon: weapon});
						KDCloseQuickInv();
					}
					return true;
				}, true,
				point.x, 1000 - V - Wheight + point.y, 80, 80,
				"", "#ffffff", item.preview, undefined, undefined, true, undefined, undefined, undefined,
				{
					zIndex: 109,
					scaleImage: true,
				}
			);
			/*KDDraw(kdcanvas, kdpixisprites, "weaponsicon" + w,
				item.preview, point.x, 1000 - V - Wheight + point.y, 80, 80, undefined, {
					zIndex: 109,
				});*/

			if (item.previewcolor) {
				KDDraw(kdcanvas, kdpixisprites, "weaponiconhalo" + w,
					KinkyDungeonRootDirectory + "UI/ItemAura.png", point.x, 1000 - V - Wheight + point.y, 80, 80, undefined, {
						zIndex: 108.5,
						tint: string2hex(item.previewcolor),
						alpha: 0.9,
					});
			}
			if (item.previewcolorbg) {
				KDDraw(kdcanvas, kdpixisprites, "weaponiconhalobg" + w,
					KinkyDungeonRootDirectory + "UI/ItemAuraBG.png", point.x, 1000 - V - Wheight + point.y, 80, 80, undefined, {
						zIndex: 108.4,
						tint: string2hex(item.previewcolorbg),
						alpha: 0.8,
					});
			}

			if ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.name]) || KDInventoryStatus.HideQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "weaponsiconhid" + w,
					KinkyDungeonRootDirectory + ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.name]) ? "InvHidden.png" : "InvVisible.png"), point.x, 1000 - V - Wheight + point.y, 80, 80, undefined, {
						zIndex: 110,
					});
			} else if (KDInventoryStatus.DropQuickInv && item.name != "Unarmed") {
				KDDraw(kdcanvas, kdpixisprites, "weaponsiconhid" + w,
					KinkyDungeonRootDirectory + "InvItemDrop.png", point.x, 1000 - V - Wheight + point.y, 80, 80, undefined, {
						zIndex: 110,
					});
			} else if (KDInventoryStatus.SortQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "weaponsiconhid" + w,
					KinkyDungeonRootDirectory + "InvItemSort.png", point.x, 1000 - V - Wheight + point.y, 80, 80, undefined, {
						zIndex: 110,
					});
				DrawTextKD("" + (KDGameData.ItemPriority? KDGameData.ItemPriority[item.item?.name|| item.name] || 0 : 0), point.x + 40, 1000 - V - Wheight + point.y + 20, "#ffffff", undefined, 30,);
			} else if (MouseIn(point.x, 1000 - V - Wheight + point.y, 80, 80) || KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] > 0) {
				DrawButtonKDEx("weaponsiconfavOfffav" + w + (KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] ? "b" : "a"), (bdata) => {
					if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
					if (!(KDGameData.ItemPriority[item.item?.name|| item.name] > 9)) KDGameData.ItemPriority[item.item?.name|| item.name] = 10;
					else KDGameData.ItemPriority[item.item?.name|| item.name] = 0;
					KDSortInventory(KinkyDungeonPlayerEntity);
					return true;
				},true, point.x + 80 - 32, 1000 - V - Wheight + point.y, 32, 32, "", "#ffffff", KinkyDungeonRootDirectory +
					(KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] > 0 ? "UI/Star.png" : "UI/StarOff.png"),
				"", false, true, undefined, undefined, undefined, {
					zIndex: 111,
				});
			}
			//DrawImageEx(item.preview, point.x, 1000 - V - Wheight + point.y, {Width: 80, Height: 80});
		}
	}

	for (let w = 0; w < restraints.length; w++) {
		let item = restraints[w];
		if (item.preview) {
			let point = KinkyDungeonQuickGrid(w, H, V, 6);
			if (MouseIn(point.x +1, 1+ 1000 - V - Rheight + point.y, H - 2, V - 2)) {
				/*FillRectKD(kdcanvas, kdpixisprites, "restraints" + w, {
					Left: point.x,
					Top: 1000 - V - Rheight + point.y,
					Width: H,
					Height: V,
					Color: KDTextGray3,
					LineWidth: 1,
					zIndex: 60,
					alpha: 0.5
				});*/
				KinkyDungeonDrawInventorySelected(item, false, true);
			}
			DrawButtonKDExScroll("restraintsicon" + w,
				(amount) => {
					if (amount > 0)
						KDScrollOffset.Restraint = Math.min(Math.ceil((fR.length - KDItemsPerScreen.Restraint)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Restraint +
							Math.ceil(0.5*amount/80) * KDScrollAmount);
					else
						KDScrollOffset.Restraint = Math.max(0, KDScrollOffset.Restraint -
							Math.ceil(0.5*-amount/80) * KDScrollAmount);
				},
				(bdata)=> {
					if (!KinkyDungeonControlsEnabled()) return true;
					if (KDInventoryStatus.HideQuickInv) {
						KDGameData.HiddenItems[item.item.name] = !KDGameData.HiddenItems[item.item.name];
					} else if (KDInventoryStatus.DropQuickInv) {
						KDSendInput("drop", {item: item.item.name});
					} else if (KDInventoryStatus.SortQuickInv) {
						if (MouseIn(point.x + H/2, 1000 - V - Rheight + point.y, H/2, V)) {
							// Sort left
							if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
							if (KDGameData.ItemPriority[item.item.name] == undefined) KDGameData.ItemPriority[item.item.name] = -1;
							else if (KDGameData.ItemPriority[item.item.name] > -9) KDGameData.ItemPriority[item.item.name] -= 1;
						} else {
							// Sort right
							if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
							if (KDGameData.ItemPriority[item.item.name] == undefined) KDGameData.ItemPriority[item.item.name] = 1;
							else if (KDGameData.ItemPriority[item.item.name] < 9) KDGameData.ItemPriority[item.item.name] += 1;
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
							if (KDSendInput("equip", {name: item.item.name,
								inventoryVariant: item.item.name != newItem.name ?
									item.item.name : undefined,
								faction: item.item.faction,
								group: newItem.Group, curse: item.item.curse, currentItem: currentItem ? currentItem.name : undefined, events: Object.assign([], item.item.events)})) return true;
						}
					}
					return true;
				}, true,
				point.x, 1000 - V - Rheight + point.y, 80, 80,
				"", "#ffffff", item.preview, undefined, undefined, true, undefined, undefined, undefined,
				{
					zIndex: 109,
					scaleImage: true,
				}
			);
			if (item.preview2)
				KDDraw(kdcanvas, kdpixisprites, "restraintsicon2" + w,
					item.preview2, point.x, 1000 - V - Rheight + point.y, 80, 80,
					undefined, {
						zIndex: 110.1,
						alpha: 0.9,
					});
			//DrawImageEx(item.preview, point.x, 1000 - V - Rheight + point.y, {Width: 80, Height: 80});
			/*KDDraw(kdcanvas, kdpixisprites, "restraintsicon" + w,
				item.preview, point.x, 1000 - V - Rheight + point.y, 80, 80, undefined, {
					zIndex: 109,
				});*/
			if (item.previewcolor) {
				KDDraw(kdcanvas, kdpixisprites, "restraintsiconhalo" + w,
					KinkyDungeonRootDirectory + "UI/ItemAura.png", point.x, 1000 - V - Rheight + point.y, 80, 80, undefined, {
						zIndex: 108.5,
						tint: string2hex(item.previewcolor),
						alpha: 0.9,
					});
			}
			if (item.previewcolorbg) {
				KDDraw(kdcanvas, kdpixisprites, "restraintsiconhalobg" + w,
					KinkyDungeonRootDirectory + "UI/ItemAuraBG.png", point.x, 1000 - V - Rheight + point.y, 80, 80, undefined, {
						zIndex: 108.4,
						tint: string2hex(item.previewcolorbg),
						alpha: 0.8,
					});
			}
			if ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.item.name]) || KDInventoryStatus.HideQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "restraintsiconhid" + w,
					KinkyDungeonRootDirectory + ((KDGameData.HiddenItems && KDGameData.HiddenItems[item.item.name]) ? "InvHidden.png" : "InvVisible.png"), point.x, 1000 - V - Rheight + point.y, 80, 80, undefined, {
						zIndex: 109,
					});
			} else if (KDInventoryStatus.DropQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "restraintsiconhid" + w,
					KinkyDungeonRootDirectory + "InvItemDrop.png", point.x, 1000 - V - Rheight + point.y, 80, 80, undefined, {
						zIndex: 109,
					});
			} else if (KDInventoryStatus.SortQuickInv) {
				KDDraw(kdcanvas, kdpixisprites, "restraintsiconsort" + w,
					KinkyDungeonRootDirectory + "InvItemSort.png", point.x, 1000 - V - Rheight + point.y, 80, 80, undefined, {
						zIndex: 109,
					});
				DrawTextKD("" + (KDGameData.ItemPriority? KDGameData.ItemPriority[item.item?.name|| item.name] || 0 : 0), point.x + 40, 1000 - V - Rheight + point.y + 20, "#ffffff", undefined, 30,);
			} else if (MouseIn(point.x, 1000 - V - Rheight + point.y, 80, 80) || KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] > 0) {
				DrawButtonKDEx("restraintsiconfav" + w + (KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] ? "b" : "a"), (bdata) => {
					if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
					if (!(KDGameData.ItemPriority[item.item?.name|| item.name] > 9)) KDGameData.ItemPriority[item.item?.name|| item.name] = 10;
					else KDGameData.ItemPriority[item.item?.name|| item.name] = 0;
					KDSortInventory(KinkyDungeonPlayerEntity);
					return true;
				},true, point.x + 80 - 32, 1000 - V - Rheight + point.y, 32, 32, "", "#ffffff", KinkyDungeonRootDirectory +
					(KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] > 0 ? "UI/Star.png" : "UI/StarOff.png"),
				"", false, true, undefined, undefined, undefined, {
					zIndex: 111,
				});
			}
		}
	}
}

function KinkyDungeonhandleQuickInv(NoUse) {


	//let H = 80;
	//let V = 80;
	let fC = KinkyDungeonFilterInventory(Consumable, false, !KDInventoryStatus.HideQuickInv, undefined, undefined, KDInvFilter);
	//let consumables = fC.slice(KDScrollOffset.Consumable, KDScrollOffset.Consumable + KDItemsPerScreen.Consumable);
	let fW = KinkyDungeonFilterInventory(Weapon, false, !KDInventoryStatus.HideQuickInv, undefined, undefined, KDInvFilter);
	//let weapons = fW.slice(KDScrollOffset.Weapon, KDScrollOffset.Weapon + KDItemsPerScreen.Weapon);
	let fR = [
		...KinkyDungeonFilterInventory(LooseRestraint, true, !KDInventoryStatus.HideQuickInv, undefined, undefined, KDInvFilter),
		...KinkyDungeonFilterInventory(Armor, true, !KDInventoryStatus.HideQuickInv, undefined, undefined, KDInvFilter)];
	//let restraints = fR.slice(KDScrollOffset.Restraint, KDScrollOffset.Restraint + KDItemsPerScreen.Restraint);
	//let Wheight = KinkyDungeonQuickGrid(weapons.length-1, H, V, 6).y;
	//let Rheight = 480;

	if (fC.length > KDItemsPerScreen.Consumable) {
		if (MouseIn(510, 105, 90, 40)) {
			KDScrollOffset.Consumable = Math.max(0, KDScrollOffset.Consumable - KDScrollAmount);
			return true;
		}
		if (MouseIn(510, 150, 90, 40)) {
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
			KDScrollOffset.Weapon = Math.min(Math.ceil((fW.length - KDItemsPerScreen.Weapon)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Weapon + KDScrollAmount);
			return true;
		}
	}
	if (fR.length > KDItemsPerScreen.Restraint) {
		if (MouseIn(510, 455, 90, 40)) {
			KDScrollOffset.Restraint = Math.max(0, KDScrollOffset.Restraint - KDScrollAmount);
			return true;
		}
		if (MouseIn(510, 500, 90, 40)) {
			KDScrollOffset.Restraint = Math.min(Math.ceil((fR.length - KDItemsPerScreen.Restraint)/KDScrollAmount) * KDScrollAmount, KDScrollOffset.Restraint + KDScrollAmount);
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


	return false;
}

/**
 *
 * @param {string} name
 * @param {entity} [player]
 * @param {boolean} playerDropped
 */
function KDDropItemInv(name, player, playerDropped = true) {
	let item = KinkyDungeonInventoryGetLoose(name) || KinkyDungeonInventoryGet(name);
	if (!player) player = KinkyDungeonPlayerEntity;
	if (item && item.type != Restraint && item.name != KinkyDungeonPlayerWeapon) { // We cant drop equipped items
		// Drop one of them
		if (item.quantity > 1) {
			item.quantity -= 1;
		} else KinkyDungeonInventoryRemove(item);

		let dropped = {x:player.x, y:player.y, name: name, amount: 1, playerDropped: playerDropped};

		KDMapData.GroundItems.push(dropped);

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

function KDLoadQuickLoadout(num, clearFirst) {
	if (clearFirst) {
		// Remove all armor that can be removed
		// TODO
	}
	let loadout = KDGameData.QuickLoadouts ? KDGameData.QuickLoadouts[num + ""] : undefined;
	if (loadout) {
		let alreadyEquipped = false;
		let refreshedWeapons = false;
		for (let item of loadout) {
			if (KinkyDungeonInventoryGetWeapon(item)) {
				if (!refreshedWeapons) {
					KDGameData.PreviousWeapon = [];
				}
				// Equip weapon
				if (!alreadyEquipped) {
					alreadyEquipped = true;
					if (item != KinkyDungeonPlayerWeapon)
						KDSendInput("switchWeapon", {weapon: item});
				} else {
					KDGameData.PreviousWeapon.push(item);
				}
			} else if (KinkyDungeonInventoryGetLoose(item)) {
				// Equip armor
				let restraintItem = KinkyDungeonInventoryGetLoose(item);
				let newItem = restraintItem ? KDRestraint(restraintItem) : undefined;
				if (newItem) {
					let currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
					KDSendInput("equip", {
						name: restraintItem.name,
						inventoryVariant: restraintItem.name != newItem.name ?
							restraintItem.name : undefined,
						group: newItem.Group,
						curse: restraintItem.curse,
						faction: restraintItem.faction,
						currentItem: currentItem ? currentItem.name : undefined,
						events: Object.assign([], restraintItem.events)});
				}
			}
		}
	}
}

function KDSaveQuickLoadout(num) {
	if (!KDGameData.QuickLoadouts) KDGameData.QuickLoadouts = {};
	let currentLoadout = KDGameData.QuickLoadouts[num + ""];

	let loadout = [];

	if (KDGameData.QuickLoadout_Weapon) {
		if (KinkyDungeonPlayerWeapon) {
			loadout.push(KinkyDungeonPlayerWeapon);
		}
		if (KDGameData.PreviousWeapon && typeof KDGameData.PreviousWeapon != 'string') {
			loadout.push(...KDGameData.PreviousWeapon);
		}
	}


	for (let item of KinkyDungeonAllRestraint()) {
		if (KDRestraint(item)?.good || KDRestraint(item)?.armor) {
			loadout.push(item.name);
		}
	}

	if (KDGameData.QuickLoadout_Merge && currentLoadout) {
		for (let item of currentLoadout) {
			let rest = KDRestraint({name: item});
			if (rest && !loadout.some((inv) => {
				return rest.Group == KDRestraint({name: inv})?.Group;
			})) {
				loadout.push(item);
			}
		}
	}



	KDGameData.QuickLoadouts[num + ""] = loadout;
}

/**
 * @param {string} Name
 */
function KDRemoveInventoryVariant(Name, Prefix="Restraint") {
	delete KinkyDungeonRestraintVariants[Name];
}
/**
 * @param {string} Name
 */
function KDRemoveWeaponVariant(Name, Prefix="KinkyDungeonInventoryItem") {
	delete KinkyDungeonWeaponVariants[Name];
}
/**
 * @param {string} Name
 */
function KDRemoveConsumableVariant(Name, Prefix="KinkyDungeonInventoryItem") {
	delete KinkyDungeonConsumableVariants[Name];
}

/**
 *
 * @param {boolean} worn
 * @param {boolean} loose
 * @param {boolean} lost
 */
function KDPruneInventoryVariants(worn = true, loose = true, lost = true, ground = true, hotbar = true) {
	let entries = Object.entries(KinkyDungeonRestraintVariants);
	let entrieswep = Object.entries(KinkyDungeonWeaponVariants);
	let entriescon = Object.entries(KinkyDungeonConsumableVariants);
	let found = {};
	if (worn) {
		let list = KinkyDungeonAllRestraintDynamic();
		for (let inv of list) {
			if ((inv.item.inventoryVariant && KinkyDungeonRestraintVariants[inv.item.inventoryVariant])) {
				found[inv.item.inventoryVariant] = true;
			}
		}
	}
	if (loose) {
		let list = KinkyDungeonAllLooseRestraint();
		if (list.length < entries.length) {
			for (let inv of list) {
				if (KinkyDungeonRestraintVariants[inv.name]) {
					found[inv.name] = true;
				}
			}
		} else {
			for (let type of entries) {
				if (KinkyDungeonInventoryGetLoose(type[0])) {
					found[type[0]] = true;
				}
			}
		}

		let listwep = KinkyDungeonAllWeapon();
		if (listwep.length < entrieswep.length) {
			for (let inv of listwep) {
				if (KinkyDungeonWeaponVariants[inv.name]) {
					found[inv.name] = true;
				}
			}
		} else {
			for (let type of entrieswep) {
				if (KinkyDungeonInventoryGetWeapon(type[0])) {
					found[type[0]] = true;
				}
			}
		}
		let listcon = KinkyDungeonAllConsumable();
		if (listcon.length < entriescon.length) {
			for (let inv of listcon) {
				if (KinkyDungeonConsumableVariants[inv.name]) {
					found[inv.name] = true;
				}
			}
		} else {
			for (let type of entriescon) {
				if (KinkyDungeonInventoryGetWeapon(type[0])) {
					found[type[0]] = true;
				}
			}
		}
	}

	if (hotbar) {
		if (KinkyDungeonWeaponChoices) {
			for (let item of KinkyDungeonWeaponChoices) {
				if (KinkyDungeonWeaponVariants[item]) found[item] = true;
			}
		}
		if (KinkyDungeonArmorChoices) {
			for (let item of KinkyDungeonArmorChoices) {
				if (KinkyDungeonRestraintVariants[item]) found[item] = true;
			}
		}
		if (KinkyDungeonConsumableChoices) {
			for (let item of KinkyDungeonConsumableChoices) {
				if (KinkyDungeonConsumableVariants[item]) found[item] = true;
			}
		}
	}

	if (lost) {
		let list = KinkyDungeonLostItems;
		for (let inv of list) {
			if (KinkyDungeonRestraintVariants[inv.name]) {
				found[inv.name] = true;
			}
			if (KinkyDungeonConsumableVariants[inv.name]) {
				found[inv.name] = true;
			}
			if (KinkyDungeonWeaponVariants[inv.name]) {
				found[inv.name] = true;
			}
		}

	}
	if (ground) {
		let list = KDMapData.GroundItems;
		for (let inv of list) {
			if (KinkyDungeonRestraintVariants[inv.name]) {
				found[inv.name] = true;
			}
			if (KinkyDungeonConsumableVariants[inv.name]) {
				found[inv.name] = true;
			}
			if (KinkyDungeonWeaponVariants[inv.name]) {
				found[inv.name] = true;
			}
		}

	}
	for (let type of entries) {
		if (!found[type[0]]) {
			KDRemoveInventoryVariant(type[0]);
		}
	}
	for (let type of entrieswep) {
		if (!found[type[0]]) {
			KDRemoveWeaponVariant(type[0]);
		}
	}
	for (let type of entriescon) {
		if (!found[type[0]]) {
			KDRemoveConsumableVariant(type[0]);
		}
	}
}

/**
 * Changes an inventory variant of an item
 * @param {item} item
 * @param {KDRestraintVariant} variant
 * @param {string} prefix
 * @param {string} curse
 */
function KDMorphToInventoryVariant(item, variant, prefix = "", curse) {
	let origRestraint = KinkyDungeonGetRestraintByName(variant.template);
	let events = origRestraint.events ? JSON.parse(JSON.stringify(origRestraint.events)) : [];
	let newname = prefix + variant.template + KinkyDungeonGetItemID() + (curse ? curse : "");
	if (prefix) variant.prefix = prefix;
	if (curse) {
		variant = JSON.parse(JSON.stringify(variant));
		variant.curse = curse;
	}
	if (!KinkyDungeonRestraintVariants[newname])
		KinkyDungeonRestraintVariants[newname] = variant;
	if (variant.events)
		Object.assign(events, variant.events);
	KDChangeItemName(item, item.type, variant.template);
	if (item.type == LooseRestraint) {
		item.name = newname;
		item.curse = curse;
		item.events = events;
		item.showInQuickInv = true;
	} else {
		item.name = variant.template;
		item.curse = curse;
		item.events = events;
		item.inventoryVariant = newname;
	}
}

/**
 * Adds an weapon variant to the player's inventory
 * @param {KDWeaponVariant} variant
 * @param {string} prefix
 */
function KDGiveWeaponVariant(variant, prefix = "", forceName, suffix = "") {
	let origWeapon = KinkyDungeonFindWeapon(variant.template);
	let events = origWeapon.events ? JSON.parse(JSON.stringify(origWeapon.events)) : [];
	let newname = forceName ? forceName : (prefix + variant.template + KinkyDungeonGetItemID());
	if (prefix) variant.prefix = prefix;
	if (suffix) variant.suffix = suffix;
	if (!KinkyDungeonWeaponVariants[newname])
		KinkyDungeonWeaponVariants[newname] = variant;
	if (variant.events)
		Object.assign(events, variant.events);
	let q = 1;
	if (KinkyDungeonInventoryGet(newname)) q = KinkyDungeonInventoryGet(newname).quantity + 1;
	KinkyDungeonInventoryAdd({name: newname, id: KinkyDungeonGetItemID(), type: Weapon, events:events, quantity: q, showInQuickInv: true,});
}

/**
 * Adds an Consumable variant to the player's inventory
 * @param {KDConsumableVariant} variant
 * @param {string} prefix
 */
function KDGiveConsumableVariant(variant, prefix = "", forceName, suffix = "", Quantity = 1) {
	//let origConsumable = KinkyDungeonFindConsumable(variant.template);
	let events = [];//TODO//origConsumable.events ? JSON.parse(JSON.stringify(origConsumable.events)) : [];
	let newname = forceName ? forceName : (prefix + variant.template + KinkyDungeonGetItemID());
	if (prefix) variant.prefix = prefix;
	if (suffix) variant.suffix = suffix;
	if (!KinkyDungeonConsumableVariants[newname])
		KinkyDungeonConsumableVariants[newname] = variant;
	if (variant.events)
		Object.assign(events, variant.events);
	let q = Quantity;
	if (KinkyDungeonInventoryGet(newname)) q = KinkyDungeonInventoryGet(newname).quantity + Quantity;
	KinkyDungeonInventoryAdd({name: newname, id: KinkyDungeonGetItemID(), type: Consumable, events:events, quantity: q, showInQuickInv: true,});
}
/**
 * Adds an inventory variant to the player's inventory
 * @param {KDRestraintVariant} variant
 * @param {string} prefix
 * @param {string} curse
 * @param {string} ID
 * @param {string} [forceName]
 */
function KDGiveInventoryVariant(variant, prefix = "", curse = undefined, ID="", forceName, suffix = "", faction = "") {
	let origRestraint = KinkyDungeonGetRestraintByName(variant.template);
	let events = origRestraint.events ? JSON.parse(JSON.stringify(origRestraint.events)) : [];
	let newname = forceName ? forceName : (prefix + variant.template + (ID || (KinkyDungeonGetItemID() + "")) + (curse ? curse : ""));
	if (prefix) variant.prefix = prefix;
	if (suffix) variant.suffix = suffix;
	if (curse) {
		variant = JSON.parse(JSON.stringify(variant));
		variant.curse = curse;
	}
	if (!KinkyDungeonRestraintVariants[newname])
		KinkyDungeonRestraintVariants[newname] = variant;
	if (variant.events)
		Object.assign(events, variant.events);
	let q = 1;
	if (KinkyDungeonInventoryGet(newname)) q = KinkyDungeonInventoryGet(newname).quantity + 1;
	KinkyDungeonInventoryAdd({faction: faction, name: newname, curse: curse, id: KinkyDungeonGetItemID(), type: LooseRestraint, events:events, quantity: q, showInQuickInv: true,});
}
/**
 * Adds an inventory variant to the player's inventory
 * @param {KDRestraintVariant} variant
 * @param {number} [Tightness]
 * @param {boolean} [Bypass]
 * @param {string} [Lock]
 * @param {boolean} [Keep]
 * @param {boolean} [Trapped]
 * @param {string} [faction]
 * @param {boolean} [Deep] - whether or not it can go deeply in the stack
 * @param {string} [curse] - Curse to apply
 * @param {entity} [securityEnemy] - Bypass is treated separately for these groups
 * @param {boolean} [useAugmentedPower] - Augment power to keep consistency
 * @param {string} [inventoryAs] - inventoryAs for the item
 * @param {string} prefix
 * @param {string} ID
 */
function KDEquipInventoryVariant(variant, prefix = "", Tightness, Bypass, Lock, Keep, Trapped, faction, Deep, curse, securityEnemy, useAugmentedPower, inventoryAs, ID = "", suffix = "") {
	let origRestraint = KinkyDungeonGetRestraintByName(variant.template);
	let events = origRestraint.events ? JSON.parse(JSON.stringify(origRestraint.events)) : [];
	let newname = prefix + variant.template + (ID || (KinkyDungeonGetItemID() + "")) + (curse ? curse : "");
	if (prefix) variant.prefix = prefix;
	if (suffix) variant.suffix = suffix;
	if (curse) {
		variant = JSON.parse(JSON.stringify(variant));
		variant.curse = curse;
	}
	if (!KinkyDungeonRestraintVariants[newname])
		KinkyDungeonRestraintVariants[newname] = variant;
	if (variant.events)
		Object.assign(events, variant.events);
	return KinkyDungeonAddRestraintIfWeaker(origRestraint, Tightness, Bypass, Lock, Keep, Trapped, events, faction, Deep, curse, securityEnemy, useAugmentedPower, newname);
}

