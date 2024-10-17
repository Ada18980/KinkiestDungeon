"use strict";


let KDPreventAccidentalClickTime = 0;
let KDInventoryActionSpacing = 76;
let KDInventoryActionPerRow = 6;


let KinkyDungeonFilters = [
	Consumable,
	Restraint,
	Weapon,
	Outfit,
	LooseRestraint,
	Armor,
];

let KDInventoryActionsDefault: Record<string, (item: item) => string[]> = {
	restraint: (item) => {
		let ret: string[] = [];
		ret.push("Favorite");
		if (!KDGetCurse(item)) {
			ret.push("Struggle");
			if (KinkyDungeonGetAffinity(false, "Sharp", KDRestraint(item)?.Group)) {
				ret.push("Cut");
			}
			if (item.lock) {
				ret.push("Unlock", "Pick");
			} else if (KinkyDungeonIsLockable(KDRestraint(item))) {
				ret.push("Remove");
				ret.push("Lock");
			}
		} else {
			ret.push("CurseInfo", "CurseStruggle");
			if (KinkyDungeonCurseAvailable(item, KDGetCurse(item))) ret.push("CurseUnlock");
		}
		return ret;
	},
	looserestraint: (_item) => {
		let ret: string[] = [];
		ret.push("Equip");
		ret.push("Favorite");
		ret.push("Drop");
		ret.push("Hotbar");
		ret.push("Disassemble");

		return ret;
	},
	weapon: (_item) => {
		let ret: string[] = [];
		ret.push("Equip");
		ret.push("Favorite");
		ret.push("Drop");
		ret.push("QuickSlot1");
		ret.push("QuickSlot2");
		ret.push("QuickSlot3");
		ret.push("QuickSlot4");
		if (KDGameData.Offhand == _item.name)
			ret.push("RemoveOffhand");
		else if (KDGameData.InventoryAction != "Offhand")
			ret.push("Offhand");
		ret.push("Hotbar");
		return ret;
	},
	consumable: (_item) => {
		let ret: string[] = [];
		ret.push("Use");
		ret.push("Favorite");
		ret.push("Drop");
		ret.push("Hotbar");
		return ret;
	},
	outfit: (_item) => {
		let ret: string[] = [];
		ret.push("Equip");
		ret.push("Favorite");
		ret.push("Drop");
		return ret;
	},
};

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

let KinkyDungeonRestraintVariants: Record<string, KDRestraintVariant> = {};

let KinkyDungeonWeaponVariants: Record<string, KDWeaponVariant> = {};

let KinkyDungeonConsumableVariants: Record<string, KDConsumableVariant> = {};


/**
 * @param item
 */
function KDGetRestraintVariant(item: item): KDRestraintVariant {
	// @ts-ignore
	return KinkyDungeonRestraintVariants[item.inventoryVariant || item.inventoryAs || item.name];
}
/**
 * @param item
 */
function KDGetConsumableVariant(item: item): KDConsumableVariant {
	// @ts-ignore
	return KinkyDungeonConsumableVariants[item.inventoryVariant || item.inventoryAs || item.name];
}
/**
 * @param item
 */
function KDGetWeaponVariant(item: item): KDWeaponVariant {
	// @ts-ignore
	return KinkyDungeonWeaponVariants[item.inventoryVariant || item.inventoryAs || item.name];
}

let KDInventoryUseIconConfig: Record<string, boolean> = {};
KDInventoryUseIconConfig[Weapon] = true;
KDInventoryUseIconConfig[Consumable] = true;
KDInventoryUseIconConfig[LooseRestraint] = true;
KDInventoryUseIconConfig[Restraint] = true;
KDInventoryUseIconConfig[Armor] = true;
KDInventoryUseIconConfig.All = true;


/** Index of current filters for each filter type */
let KDFilterIndex: Record<string, number> = {};
let KDMaxFilters = 14;

/** List of current filters for each filter type */
let KDFilterFilters: Record<string, Record<string, boolean>> = {};
KDFilterFilters[LooseRestraint] = {
	Special: false,
	Mundane: false,
	QuickBind: false,
	Rope: false,
	Leather: false,
	Metal: false,
	Latex: false,
	Tape: false,
	Toys: false,
	Wrapping: false,
	Ties: false,
	Belts: false,
	Cuffs: false,
	Collars: false,
	Gags: false,
	Boots: false,

	Chains: false,
	Mittens: false,
	Harnesses: false,
	Corsets: false,
	ChastityBelts: false,
	ChastityBras: false,
	Armbinders: false,
	Boxbinders: false,
	Straitjackets: false,
	Legbinders: false,
	Cyber: false,
	Devices: false,
	Disassemble: false,
	Raw: false,
};
KDFilterFilters[Armor] = {
	Enchanted: false,
	Mundane: false,
	Light: false,
	Heavy: false,
	Mage: false,
	Accessory: false,

	Head: false,
	Chest: false,

	Arms: false,
	Gloves: false,

	Torso: false,
	Panties: false,

	Legs: false,
	Boots: false,
};
KDFilterFilters[Restraint] = {
	Special: false,
	Mundane: false,
	Armor: false,
	Restraint: false,
	Ancient: false,
	Cursed: false,

	Rope: false,
	Leather: false,
	Metal: false,
	Latex: false,
	Locked: false,
	Unlocked: false,

	Blocked: false,
	Unblocked: false,
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


let KDSpecialFilters: Record<string, Record<string, (item: item, handle: boolean) => boolean>> = {
	looserestraint: {
		Special: (item, handle) => {
			if (handle) KDFilterFilters[LooseRestraint].Mundane = false;
			return KDRestraintSpecial(item);
		},
		Mundane: (item, handle) => {
			if (handle) KDFilterFilters[LooseRestraint].Special = false;
			return !(KDRestraintSpecial(item));
		},
		Disassemble: (item, _handle) => {
			return KDRestraint(item)?.disassembleAs != undefined;
		},
		QuickBind: (item, _handle) => {
			return KDRestraint(item)?.quickBindCondition != undefined;
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

		Head: (item, _handle) => {
			return KDRestraint(item)?.Group == "ItemHead" || KDRestraint(item)?.Group == "ItemMouth" || KDRestraint(item)?.Group == "ItemNeck";
		},
		Neck: (item, _handle) => {
			return KDRestraint(item)?.Group == "ItemNeck";
		},
		Chest: (item, _handle) => {
			return KDRestraint(item)?.Group == "ItemBreast";
		},
		Arms: (item, _handle) => {
			return KDRestraint(item)?.Group == "ItemArms";
		},
		Gloves: (item, _handle) => {
			return KDRestraint(item)?.Group == "ItemHands";
		},
		Torso: (item, _handle) => {
			return KDRestraint(item)?.Group == "ItemTorso";
		},
		Panties: (item, _handle) => {
			return KDRestraint(item)?.Group == "ItemPelvis";
		},
		Legs: (item, _handle) => {
			return KDRestraint(item)?.Group == "ItemLegs";
		},
		Ankles: (item, _handle) => {
			return KDRestraint(item)?.Group == "ItemFeet";
		},
		Boots: (item, _handle) => {
			return KDRestraint(item)?.Group == "ItemBoots";
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
		Divine: (item, _handle) => {
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
		Ability: (item, _handle) => {
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
		Toy: (item, _handle) => {
			return KDWeapon(item)?.tags?.includes("toy");
		},
		Bondage: (item, _handle) => {
			return KDWeapon(item)?.tags?.includes("bondage");
		},
		Utility: (item, _handle) => {
			return KDWeapon(item)?.tags?.includes("utility");
		},
		Staff: (item, _handle) => {
			return KDWeapon(item)?.tags?.includes("staff");
		},
		Shield: (item, _handle) => {
			return KDWeapon(item)?.tags?.includes("shield");
		},
		Tease: (item, _handle) => {
			return KinkyDungeonTeaseDamageTypes.includes(KDWeapon(item)?.type) || KDWeapon(item)?.tease;
		},
	},
	restraint: {
		Special: (item, handle) => {
			if (handle) KDFilterFilters[Restraint].Mundane = false;
			return (KDRestraint(item)?.armor && KinkyDungeonRestraintVariants[item.inventoryVariant || item.name] != undefined)
				|| (!KDRestraint(item)?.armor && (KDRestraintSpecial(item)));
		},
		Enchanted: (item, handle) => {
			if (handle) KDFilterFilters[Restraint].Mundane = false;
			return (KDRestraint(item)?.armor && KinkyDungeonRestraintVariants[item.inventoryVariant || item.name] != undefined);
		},
		Good: (item, _handle) => {
			return (KDRestraint(item)?.good);
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
		Locked: (item, handle) => {
			if (handle) KDFilterFilters[Restraint].Unlocked = false;
			return !(!item.lock);
		},
		Unlocked: (item, handle) => {
			if (handle) KDFilterFilters[Restraint].Locked = false;
			return !item.lock;
		},
		Blocked: (item, handle) => {
			if (handle) KDFilterFilters[Restraint].Unblocked = false;
			return KDGroupBlocked(KDRestraint(item)?.Group) || !KDDynamicLinkListSurface(item).includes(item);
		},
		Unblocked: (item, handle) => {
			if (handle) KDFilterFilters[Restraint].Blocked = false;
			return !(KDGroupBlocked(KDRestraint(item)?.Group) || !KDDynamicLinkListSurface(item).includes(item));
		},
		Restraint: (item, handle) => {
			if (handle) KDFilterFilters[Restraint].Armor = false;
			return !KDRestraint(item)?.armor;
		},
		Cursed: (item, _handle) => {
			return KDGetCurse(item) != undefined;
		},
	},
};

let KinkyDungeonCurrentFilter = KinkyDungeonFilters[0];
let KinkyDungeonCurrentPageInventory = 0;

let KinkyDungeonShowInventory = false;
let KinkyDungeonInventoryOffset = 0;
let KinkyDungeonContainerOffset = 0;

let KDConfirmOverInventoryAction = false;

function KDCloseQuickInv() {
	KinkyDungeonShowInventory = false;
	for (let invStat of Object.keys(KDInventoryStatus)) {
		KDInventoryStatus[invStat] = false;
	}
	KDSortInventory(KinkyDungeonPlayerEntity);
	KDInventoryStatus.HideQuickInv = false;
}

function KDRestraintSpecial(item: Named): boolean {
	return KDRestraint(item)?.enchanted
		|| KDRestraint(item)?.special
		|| KDRestraint(item)?.showInQuickInv
		|| (item as item).showInQuickInv;
}

let KDWeaponSwitchPref = 0;

function KDSwitchWeapon(weapon?: string, pref?: number) {
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
	//let filter = KinkyDungeonCurrentFilter;
	//if (KDFilterTransform[KinkyDungeonCurrentFilter]) filter = KDFilterTransform[KinkyDungeonCurrentFilter];

	let filteredInventory = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter, undefined, undefined, undefined, undefined, KDInvFilter);



	if (CommonTime() < KDPreventAccidentalClickTime) return false;

	if (KinkyDungeonDrawInventorySelected(filteredInventory[KinkyDungeonCurrentPageInventory], undefined, undefined, xOffset)) {
		/*if (filter == Consumable && MouseIn(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 350, 55)) {
			let item = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter, undefined, undefined, undefined, undefined, KDInvFilter)[KinkyDungeonCurrentPageInventory];
			if (!item || !item.name) return true;


			KDSendInput("consumable", {item: item.name, quantity: 1});
			//KinkyDungeonAttemptConsumable(item.name, 1);
		}*/

	}
	KDConfirmOverInventoryAction = false;

	return true;
}

function KinkyDungeonInventoryAddWeapon(Name: string) {
	if (!KinkyDungeonInventoryGetWeapon(Name) && KinkyDungeonWeapons[Name])
		KinkyDungeonInventoryAdd({name:Name, type:Weapon, events: Object.assign([], KinkyDungeonWeapons[Name].events), id: KinkyDungeonGetItemID()});
}

function KinkyDungeonInventoryAddLoose(Name: string, UnlockCurse?: string, faction?: string, quantity: number = 1) {
	if (!KinkyDungeonInventoryGetLoose(Name) || UnlockCurse)
		KinkyDungeonInventoryAdd({faction: faction, name: Name, type: LooseRestraint, curse: UnlockCurse,
			events:KDRestraint(KinkyDungeonGetRestraintByName(Name)).events, quantity: quantity, id: KinkyDungeonGetItemID()});
	else {
		KinkyDungeonInventoryGetLoose(Name).quantity += quantity;
	}
}

function KinkyDungeonInventoryAddOutfit(Name: string) {
	if (!KinkyDungeonInventoryGetOutfit(Name) && KinkyDungeonOutfitCache.has(Name))
		KinkyDungeonInventoryAdd({name:Name, type:Outfit, id: KinkyDungeonGetItemID()});
}

function KDInvAddWeapon(container: KDContainer | null, Name: string) {
	if (container) {
		container.items[Name] = {name:Name, type:Weapon, events: Object.assign([], KinkyDungeonWeapons[Name].events), id: KinkyDungeonGetItemID()};
	} else {
		if (!KinkyDungeonInventoryGetWeapon(Name) && KinkyDungeonWeapons[Name])
			KinkyDungeonInventoryAdd({name:Name, type:Weapon, events: Object.assign([], KinkyDungeonWeapons[Name].events), id: KinkyDungeonGetItemID()});
	}
}

function KDInvAddLoose(container: KDContainer | null, Name: string, UnlockCurse?: string, faction?: string, quantity: number = 1) {
	if (container) {
		if (!container.items[Name]) {
			container.items[Name] = {faction: faction, name: Name, type: LooseRestraint, curse: UnlockCurse,
				events:KDRestraint(KinkyDungeonGetRestraintByName(Name)).events, quantity: quantity, id: KinkyDungeonGetItemID()};
		} else {
			container.items[Name].quantity = (container.items[Name].quantity || 1) + quantity;
		}
	} else {
		if (!KinkyDungeonInventoryGetLoose(Name) || UnlockCurse)
			KinkyDungeonInventoryAdd({faction: faction, name: Name, type: LooseRestraint, curse: UnlockCurse,
				events:KDRestraint(KinkyDungeonGetRestraintByName(Name)).events, quantity: quantity, id: KinkyDungeonGetItemID()});
		else {
			KinkyDungeonInventoryGetLoose(Name).quantity += quantity;
		}
	}
}

/**
 * @param item
 */
function KDInventoryType(item: item): string {return item.type;}

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
 * @param item
 */
function KinkyDungeonInventoryAdd(item: item) {
	let type = KDInventoryType(item);
	if (KinkyDungeonInventory.has(type)) {
		KinkyDungeonInventory.get(type).set(item.name, item);
	}
}

/**
 * @param item
 */
function KDInvAdd(container: KDContainer | null, item: item) {
	if (container) {
		container.items[item.name] = item;
	} else {
		let type = KDInventoryType(item);
		if (KinkyDungeonInventory.has(type)) {
			KinkyDungeonInventory.get(type).set(item.name, item);
		}
	}
}

/**
 * @param item
 */
function KinkyDungeonInventoryRemove(item: item) {
	if (item) {
		let type = KDInventoryType(item);
		if (KinkyDungeonInventory.has(type)) {
			KinkyDungeonInventory.get(type).delete(item.name);
		}
	}
}
/**
 * Does not remove equipped restraints
 * @param item
 */
function KinkyDungeonInventoryRemoveSafe(item: item) {
	if (item) {
		let type = KDInventoryType(item);
		if (type != Restraint && KinkyDungeonInventory.has(type)) {
			KinkyDungeonInventory.get(type).delete(item.name);
		}
	}
}

/**
 * @param Name
 */
function KinkyDungeonInventoryGet(Name: string): item | null {
	for (let m of KinkyDungeonInventory.values()) {
		if (m.has(Name)) return m.get(Name);
	}
	return null;
}

/**
 * @param Name
 */
function KinkyDungeonInventoryGetSafe(Name: string): item | null {
	for (let m of KinkyDungeonInventory.entries()) {
		if (m[0] != Restraint && m[1].has(Name)) return m[1].get(Name);
	}
	return null;
}

/**
 * @param Name
 */
function KinkyDungeonInventoryGetLoose(Name: string): item | null {
	return KinkyDungeonInventory.get(LooseRestraint).get(Name);
}
/**
 * @param Name
 */
function KinkyDungeonInventoryGetWorn(Name: string): item | null {
	return KinkyDungeonInventory.get(Restraint).get(Name);
}



/**
 * @param Name
 */
function KinkyDungeonInventoryGetConsumable(Name: string): item | null {
	return KinkyDungeonInventory.get(Consumable).get(Name);
}

/**
 * @param Name
 */
function KinkyDungeonInventoryGetWeapon(Name: string): item | null {
	return KinkyDungeonInventory.get(Weapon).get(Name);
}

/**
 * @param Name
 */
function KinkyDungeonInventoryGetOutfit(Name: string): item | null {
	return KinkyDungeonInventory.get(Outfit).get(Name);
}

/**
 * Returns list
 */
function KinkyDungeonAllRestraint(): item[] {
	return KinkyDungeonInventory.get(Restraint) ? Array.from(KinkyDungeonInventory.get(Restraint).values()) : [];
}
/**
 * Returns list
 */
function KDAllInventorySafe(): item[] {
	return [
		...Array.from(KinkyDungeonInventory.get(LooseRestraint).values()),
		...Array.from(KinkyDungeonInventory.get(Consumable).values()),
		...Array.from(KinkyDungeonInventory.get(Weapon).values()),
	];
}


/**
 * Returns list of tuples of restraints, including dynamics and their hosts
 */
function KinkyDungeonAllRestraintDynamic(): { item: item, host: item }[] {
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
 */
function KinkyDungeonAllLooseRestraint(): item[] {
	return KinkyDungeonInventory.get(LooseRestraint) ? Array.from(KinkyDungeonInventory.get(LooseRestraint).values()) : [];
}
/**
 * Returns list
 */
function KinkyDungeonAllConsumable(): item[] {
	return KinkyDungeonInventory.get(Consumable) ? Array.from(KinkyDungeonInventory.get(Consumable).values()) : [];
}
/**
 * Returns list
 */
function KinkyDungeonAllOutfit(): item[] {
	return KinkyDungeonInventory.get(Outfit) ? Array.from(KinkyDungeonInventory.get(Outfit).values()) : [];
}
/**
 * Returns list
 */
function KinkyDungeonAllWeapon(): item[] {
	return KinkyDungeonInventory.get(Weapon) ? Array.from(KinkyDungeonInventory.get(Weapon).values()) : [];
}

/*for (let item of KinkyDungeonInventory.get(LooseRestraint).values()) {
	if (item.looserestraint && item.looserestraint.name == Name) return item;
}
return null;*/

type itemPreviewEntry = {
	name:             any;
	item:             any;
	preview:          string;
	preview2?:        string;
	previewcolor?:    string;
	previewcolorbg?:  string;
	key?:             string;
}

/**
 * @param item
 */
function KDGetItemPreview(item: NamedAndTyped): itemPreviewEntry {
	let ret: itemPreviewEntry = null;
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
 * @param Group
 */
function KDGetGroupPreviewImage(Group: string): string {
	try {
		if (KDTex(KinkyDungeonRootDirectory + `Items/Group/${Group}.png`)?.valid) return KinkyDungeonRootDirectory + `Items/Group/${Group}.png`;
	} catch (e) {
		console.log(e);
	}

	return KinkyDungeonRootDirectory + `Items/Restraint.png`;
}


/**
 * @param restraint
 */
function KDGetRestraintPreviewImage(restraint: restraint): string {
	if (KDModFiles[KinkyDungeonRootDirectory + `Items/Restraint/${restraint.preview || restraint.name}.png`]
		|| PIXI.Assets.cache.has(KinkyDungeonRootDirectory + `Items/Restraint/${restraint.preview || restraint.name}.png`))
		return KDModFiles[KinkyDungeonRootDirectory + `Items/Restraint/${restraint.preview || restraint.name}.png`] || KinkyDungeonRootDirectory + `Items/Restraint/${restraint.preview || restraint.name}.png`;
	for (let tag of restraint.shrine) {
		if (KDModFiles[KinkyDungeonRootDirectory + `Items/Restraint/${tag}.png`]
			|| PIXI.Assets.cache.has(KinkyDungeonRootDirectory + `Items/Restraint/${tag}.png`))
			return KDModFiles[KinkyDungeonRootDirectory + `Items/Restraint/${tag}.png`] || KinkyDungeonRootDirectory + `Items/Restraint/${tag}.png`;
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
 * @param Filter
 * @param [enchanted]
 * @param [ignoreHidden]
 * @param [ignoreFilters]
 * @param [click] - this filter will be handled and thus updates the filters
 * @param [namefilter]
 */
function KinkyDungeonFilterInventory(Filter: string, enchanted?: boolean, ignoreHidden?: boolean, ignoreFilters?: boolean, click?: string, namefilter?: string,
	overrideInventory?: Record<string, item>, ignoreFilterList: string[] = []
): itemPreviewEntry[] {
	let filter_orig = Filter;
	if (KDFilterTransform[Filter]) Filter = KDFilterTransform[Filter];

	let ret = [];
	let values: item[] = overrideInventory ? Object.values(overrideInventory).filter((inv) => {
			return Filter == "All" || inv.type == Filter;
		}) :
		(Filter == "All" ? KDAllInventorySafe().filter((inv) => {return !ignoreFilterList.includes(inv.type);})
		: (Filter == Restraint ? KinkyDungeonAllRestraintDynamic().map((inv) => {return inv.item;})
		: Array.from(KinkyDungeonInventory.get(Filter).values())));
	if (values) {
		for (let item of values) {
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
						case Restraint: // Fallthrough
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
			//let pre = (item.type == LooseRestraint || item.type == Restraint) ? "Restraint" : "KinkyDungeonInventoryItem";
			if (preview
				&& (item.type != LooseRestraint || (!enchanted || KDRestraint(item).enchanted || KDRestraint(item).showInQuickInv || item.showInQuickInv))
				&& (!namefilter
					|| KDGetItemName(preview.item).toLocaleLowerCase().includes(namefilter.toLocaleLowerCase()))
					|| (item.type == Weapon && TextGet("KinkyDungeonDamageType" + KDWeapon(item)?.type).toLocaleLowerCase().includes(namefilter.toLocaleLowerCase())
					|| ((item.type == LooseRestraint || item.type == Restraint) && KDRestraint(item)?.shrine?.some((tag) => {
						return tag.toLocaleLowerCase().includes(namefilter.toLocaleLowerCase());
					}
					))
					|| ((item.type == LooseRestraint || item.type == Restraint) && (item.events || KDRestraint(item)?.events)?.some((e) => {
						return TextGet("KinkyDungeonDamageType" + (e.damage || e.kind)).toLocaleLowerCase().includes(namefilter.toLocaleLowerCase())
						|| e.damage?.toLocaleLowerCase().includes(namefilter.toLocaleLowerCase())
						|| e.kind?.toLocaleLowerCase().includes(namefilter.toLocaleLowerCase())
						|| e.original?.toLocaleLowerCase().includes(namefilter.toLocaleLowerCase());
					}
					)))
			) {
				if (item.type == Restraint) {
					if (item.lock) {
						let locktype = KDLocks[item.lock];
						if (locktype) {
							let restraint = item;

							let affinity = KDGetRestraintAffinity(restraint, {StruggleType: "Unlock"});
							let struggleGroup = KDRestraint(item)?.Group;
							/**
							 */
							let data: KDStruggleData = {
								minSpeed: KDMinEscapeRate,
								handBondage: 0,
								handsBound: false,
								armsBound: false,
								query: true,
								cutBonus: 0,
								restraint: restraint,
								struggleType: "Unlock",
								struggleGroup: struggleGroup,
								escapeChance: 0,
								origEscapeChance: 0,
								origLimitChance: 0.12,
								limitChance: 0,
								helpChance: 0,
								cutSpeed: 0.25,
								affinity: affinity,
								noise: 0,
								strict: KinkyDungeonStrictness(true, struggleGroup, restraint),
								hasAffinity: KinkyDungeonGetAffinity(false, affinity, struggleGroup),
								restraintEscapeChance: KDRestraint(restraint).escapeChance.Unlock,
								cost: KinkyDungeonStatStaminaCostStruggle,
								wcost: KinkyDungeonStatWillCostStruggle,
								escapePenalty: -KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StrugglePower"),
								willEscapePenalty: KDGetWillPenalty("Unlock"),
								canCut: KinkyDungeonWeaponCanCut(false, false),
								canCutMagic: KinkyDungeonWeaponCanCut(false, true),
								toolBonus: 0.0,
								toolMult: 1.0,
								buffBonus: 0.0,
								failSuffix: "",
								buffMult: KinkyDungeonHasWill(0.01, false) ? 1.0 : 0.75,
								struggleTime: 1.0,
								restriction: KDGameData.Restriction || 0,
								speedMult: KinkyDungeonHasHelp() ? 2.0 : 1.0,
								escapeSpeed: 0,
								maxLimit: 1,
								result: "",
								lockType: (restraint.lock && KDLocks[restraint.lock]) ? KDLocks[restraint.lock] : null,

								extraLim: 0,
								extraLimPenalty: 0,
								extraLimThreshold: 0,
							};

							if (locktype.canUnlock(data)) {
								preview.key = "UI/restraint_key";
							} else {
								preview.key = "UI/restraint_nokey";
							}
						}

					} else if (KDGetCurse(item)) {
						preview.key = "Locks/" + (KDCurses[KDGetCurse(item)]?.customIcon_hud || "Curse");
					}
				}

				ret.push(preview);
			}
			/*if (item.dynamicLink) {
				let link = item.dynamicLink;
				for (let I = 0; I < 30; I++) {
					preview = KDGetItemPreview(link);
					if (preview && (link.type == Restraint) && (!namefilter || TextGet(pre + ("" + preview.name)).toLocaleLowerCase().includes(namefilter.toLocaleLowerCase())))
						ret.push(preview);
					if (link.dynamicLink) {
						link = link.dynamicLink;
					} else I = 1000;
				}
			}*/

		}
	}

	return ret;
}

/**
 * @param item
 * @param [noscroll]
 * @param [treatAsHover]
 * @param [xOffset]
 */
function KinkyDungeonDrawInventorySelected (
	 item:           {name: any, item: item, preview: string, preview2?: string, key?: string},
	noscroll?:       boolean,
	_treatAsHover?:  boolean,
	xOffset:         number = 0
)
{
	if (!noscroll) {
		if (KDToggles.SpellBook) {
			KDTextTan = KDTextTanSB;
			KDBookText = KDBookTextSB;
			KDDraw(kdcanvas, kdpixisprites, "magicBook",
				KinkyDungeonRootDirectory + "MagicBookNew.png", xOffset + canvasOffsetX_ui, canvasOffsetY_ui, 640*KinkyDungeonBookScale, 520*KinkyDungeonBookScale, undefined, {
					zIndex: 128,
				});
		} else {
			KDTextTan = KDTextTanNew;
			KDBookText = KDBookTextNew;
			FillRectKD(kdcanvas, kdpixisprites, "magicBook", {
				Left: canvasOffsetX_ui + xOffset + 70,
				Top: canvasOffsetY_ui + 90,
				Width: 590*KinkyDungeonBookScale - 75,
				Height: 450*KinkyDungeonBookScale - 50,
				Color: "#161920",
				LineWidth: 1,
				zIndex: 128,
				alpha: 1,
			});
			DrawRectKD(kdcanvas, kdpixisprites, "magicBook2", {
				Left: canvasOffsetX_ui + xOffset + 70,
				Top: canvasOffsetY_ui + 90,
				Width: 590*KinkyDungeonBookScale - 75,
				Height: 450*KinkyDungeonBookScale - 50,
				Color: KDBorderColor,
				LineWidth: 1,
				zIndex: 128,
				alpha: 0.9
			});
		}





		//DrawImageZoomCanvas(, MainCanvas, 0, 0, 640, 483, canvasOffsetX_ui, canvasOffsetY_ui, 640*KinkyDungeonBookScale, 483*KinkyDungeonBookScale, false);
	}
	if (!item) return false;
	let name = item.name;
	let prefix = "KinkyDungeonInventoryItem";
	let nameText = KDGetItemName(item.item);
	if (item.item.type == Restraint || item.item.type == LooseRestraint) {
		prefix = "Restraint";
	}


	DrawTextFitKD(nameText, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5, 300, KDBookText, KDTextTan, undefined, undefined, 129);
	//let wrapAmount = KDBigLanguages.includes(TranslationLanguage) ? 9 : 22;
	let mult = KDGetFontMult();
	let textSplit = KinkyDungeonWordWrap(TextGet(prefix + name + "Desc"), 12*mult, 26*mult).split('\n');
	let textSplit2 = KinkyDungeonWordWrap(TextGet(prefix + name + "Desc2"), 12*mult, 28*mult).split('\n');

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

		if (item.item.type == Restraint) {
			let lock = item.item.lock;
			if (KDGetCurse(item.item)) {
				lock = KDCurses[KDGetCurse(item.item)]?.customIcon_hud || "Curse";
			}
			let size = 56;
			if (lock) {
				KDDraw(kdcanvas, kdpixisprites, "preview_lock",
					KinkyDungeonRootDirectory + "Locks/" + lock + ".png", xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35 - size/2 + 70, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 40 + (100 - size)/2, 56, 56, undefined, {
						zIndex: 129,
					}, undefined, undefined, undefined, true);
			}
		}
		/*if (item.preview2) {
			let size = 56;
			KDDraw(kdcanvas, kdpixisprites, "preview2",
				item.preview2, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35 - size/2 - 20 - size, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 40 + (100 - size)/2, 56, 56, undefined, {
					zIndex: 129,
				}, undefined, undefined, undefined, true);
		}*/
		//} else {
		// Draw desc2//}

		if (item.item.type == Restraint || item.item.type == LooseRestraint) {
			let restraint = KDRestraint(item.item);
			let pp = (restraint.displayPower != undefined ? restraint.displayPower : restraint.power);
			pp /= 5; // inflection point between 8 (mythic) and 9 (angelic) should be around 47 power
			DrawTextKD(TextGet("KinkyDungeonRestraintLevel").replace("RestraintLevel", "" + Math.max(1, restraint.displayPower != undefined ? restraint.displayPower : restraint.power)).replace("Rarity", TextGet("KinkyDungeonRarity" + Math.max(0, Math.min(Math.floor(pp),10)))),
				xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 408, KDBookText, KDTextTan, 22, undefined, 130);
			DrawTextKD(
			restraint.escapeChance ? (item.item.lock ? (TextGet("KinkyLocked") + " " + TextGet("Kinky" + item.item.lock + "LockType")) :
				(restraint.DefaultLock && !restraint.HideDefaultLock ? (TextGet("KinkyLocked") + " " + TextGet("Kinky" + restraint.DefaultLock + "LockType")) :
				((item.item.type == Restraint && KDGetCurse(item.item)) ? TextGet("KinkyCursed") : TextGet("KinkyUnlocked"))))
			: (restraint.escapeChance.Pick != null ? TextGet("KinkyLockable") : TextGet("KinkyNonLockable")),
			xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 375, KDBookText, KDTextTan, 30, undefined, 130);

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
				DrawTextFitKD(TextGet("KDGoddess") + goddesses, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 435, 300, KDBookText, KDTextTan, 22, undefined, 130);
		} else if (item.item.type == Consumable) {
			let consumable = KDConsumable(item.item);
			DrawTextKD(TextGet("KinkyDungeonConsumableQuantity") + item.item.quantity, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 375, KDBookText, KDTextTan, 30, undefined, 130);
			DrawTextKD(TextGet("KinkyDungeonRarity") + TextGet("KinkyDungeonRarity" + consumable.rarity), xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 410, KDBookText, KDTextTan, 22, undefined, 130);
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
			DrawTextFitKD(st, xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 24, 300, KDBookText, KDTextTan, 18, undefined, 129);

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
						mult = KDGetFontMult();
						textSplit = KinkyDungeonWordWrap(TextGet("KDWeaponTagD_" + tags[tagi]), 13*1.3*mult, 30*1.3*mult).split('\n');
					}
				}
			}


			let bindEff = weapon.bindEff || (KinkyDungeonBindingDamageTypes.includes(weapon.type) ? 1 : 0);
			let bind = weapon.bind;
			let off = (bindEff || bind) ? 75 : 0;
			let offCost = (weapon.cutBonus) ? 75 : 0;

			DrawTextKD(TextGet("KinkyDungeonWeaponDamage") + Math.round(weapon.damage * 10), xOffset - off + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 350, KDBookText, KDTextTan, 24, undefined, 130);
			if (off) DrawTextKD(TextGet("KinkyDungeonWeaponDamageBind") + (bind ? Math.round(bind * 10) : (bindEff ? Math.round(bindEff * 100) + "%" : "")), xOffset + off + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 350, KDBookText, KDTextTan, 24, undefined, 130);

			DrawTextKD(TextGet("KinkyDungeonWeaponCrit") + Math.round((weapon.crit || KDDefaultCrit) * 100) + "%", xOffset - off + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 380, KDBookText, KDTextTan, 24, undefined, 130);
			if (off) DrawTextKD(TextGet("KinkyDungeonWeaponBindCrit") + Math.round((weapon.bindcrit || KDDefaultBindCrit) * 100) + "%", xOffset + off + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 380, KDBookText, KDTextTan, 24, undefined, 130);

			DrawTextKD(TextGet("KinkyDungeonWeaponAccuracy") + Math.round(weapon.chance * 100) + "%", xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 410, KDBookText, KDTextTan, 24, undefined, 130);
			let cost = -KinkyDungeonStatStaminaCostAttack;
			if (weapon.staminacost) cost = weapon.staminacost;
			DrawTextKD(TextGet("KinkyDungeonWeaponStamina") + Math.round(10*cost), offCost + xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 440, KDBookText, KDTextTan, 24, undefined, 130);

			if (weapon.cutBonus)
				DrawTextKD(TextGet("KinkyDungeonWeaponCutPower").replace("AMNT", Math.round(100*weapon.cutBonus) + ""),
					-offCost + xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35,
					canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 440, KDBookText, KDTextTan, 24, undefined, 130);


		}


		for (let N = 0; N < textSplit.length; N++) {
			DrawTextFitKD(textSplit[N],
				xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5  + 155 + i * 23, 330, KDBookText, KDTextTan, 20, undefined, 130); i++;}

	} else {
		for (let N = 0; N < textSplit.length; N++) {
			DrawTextFitKD(textSplit[N],
				xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 25, 640*KinkyDungeonBookScale/2.5, KDBookText, KDTextTan, 24, undefined, 130); i++;}
	}
	i = 0;
	for (let N = 0; N < data.extraLinesPre.length; N++) {
		DrawTextFitKD(data.extraLinesPre[N],
			xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1.0/3.35), canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 32, 640*KinkyDungeonBookScale/2.5, data.extraLineColorPre[N], data.extraLineColorBGPre[N], 24, undefined, 130); i++;}
	for (let N = 0; N < textSplit2.length; N++) {
		DrawTextFitKD(textSplit2[N],
			xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1.0/3.35), canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 32, 640*KinkyDungeonBookScale/2.5, KDBookText, KDTextTan, 24, undefined, 130); i++;}
	for (let N = 0; N < data.extraLines.length; N++) {
		DrawTextFitKD(data.extraLines[N],
			xOffset + canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1.0/3.35), canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 32, 640*KinkyDungeonBookScale/2.5, data.extraLineColor[N], data.extraLineColorBG[N], 24, undefined, 130); i++;}

	i = 0;

	return true;
}

let KDInventoryDrawContainerHotkeys = {
	Chest: {
		up: () => {return KinkyDungeonKey[5]},
		down: () => {return KinkyDungeonKey[7]},
		left: () => {return KinkyDungeonKey[1]},
		right: () => {return KinkyDungeonKey[3]},
	},
}

let KinkyDungeonCurrentPageContainer = 0;

/**
 * @param xOffset
 * @param yOffset
 * @param filteredInventory
 * @param filter
 * @param CurrentFilter
 * @param [itemcallback]
 * @param [colorcallback]
 * @returns {{selected: KDFilteredInventoryItem, tooltipitem: KDFilteredInventoryItem}}
 */
function KDDrawInventoryContainer (
	xOffset:            number,
	yOffset:            number,
	filteredInventory:  KDFilteredInventoryItem[],
	filter:             string,
	CurrentFilter:      string,
	itemcallback?:      (item: KDFilteredInventoryItem, x: number, y: number, w: number, h: number, different: boolean) => void,
	colorcallback?:     (item: KDFilteredInventoryItem) => string,
	prefix: string = "",
	nosearch?: boolean,
): {selected: KDFilteredInventoryItem, tooltipitem: KDFilteredInventoryItem}
{
	if (prefix) {
		if (KinkyDungeonCurrentPageContainer >= filteredInventory.length) KinkyDungeonCurrentPageContainer = 0;
	} else {
		if (KinkyDungeonCurrentPageInventory >= filteredInventory.length) KinkyDungeonCurrentPageInventory = 0;
	}


	let tooltipitem = null;


	if (!nosearch) {
		DrawTextFitKD(
			TextGet("KDInvFilter")
				.replace("ITMNS", TextGet("KinkyDungeonCategoryFilter" + CurrentFilter)),
			1460 + xOffset + 350/2, yOffset + 150 - 20, 200, "#ffffff", KDTextGray0, 18, "center");
		let TF = KDTextField(prefix + "InvFilter", 1460 + xOffset, yOffset + 150, 350, 54, "text", "", "45");
		if (TF.Created) {
			KDInvFilter = "";
			TF.Element.oninput = (_event: any) => {
				KDInvFilter = ElementValue("InvFilter");
			};
		}
	}


	let selected = filteredInventory[
		prefix ? KinkyDungeonCurrentPageContainer
			: KinkyDungeonCurrentPageInventory
	];
	if (filteredInventory) {
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
			}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 185, yOffset + canvasOffsetY_ui + 483*KinkyDungeonBookScale - 250, 190, 55, TextGet("KDBack"), "#ffffff", "");

		} else {
			KDConfigHotbar = false;
			for (let i = 0; i < numRows*maxList && yy < maxList; i++) {
				let xBonus = 0;
				if (KDFilterFilters[CurrentFilter] && Object.keys(KDFilterFilters[CurrentFilter]).length/2 > yy + (xx + 1 >= (rowsLong) ? 1 : 0)) {
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
				let index = i + (prefix ? KinkyDungeonContainerOffset : KinkyDungeonInventoryOffset);
				if (filteredInventory[index] && filteredInventory[index].item) {
					let text = KDGetItemName(filteredInventory[index].item);
					let suff = "";
					if (filteredInventory[index].item.quantity) {
						suff = " x" + filteredInventory[index].item.quantity;
					}

					if (DrawButtonKDExScroll(prefix + "invchoice_" + i, (amount) => {
						if (prefix) {
							KinkyDungeonContainerOffset = Math.max(0, Math.min(filteredInventory.length + 2 - numRows*3,
								(KinkyDungeonContainerOffset) + numRows*Math.sign(amount)*Math.ceil(Math.abs(amount)/b_height/numRows/b_width)));
						} else {
							KinkyDungeonInventoryOffset = Math.max(0, Math.min(filteredInventory.length + 2 - numRows*3,
							(KinkyDungeonInventoryOffset) + numRows*Math.sign(amount)*Math.ceil(Math.abs(amount)/b_height/numRows/b_width)));
						}
					}, (_bdata) => {
						let diff = false;
						if (prefix) {
							if (KinkyDungeonCurrentPageContainer != index) diff = true;
							KinkyDungeonCurrentPageContainer = index;
						} else {
							if (KinkyDungeonCurrentPageInventory != index) diff = true;
							KinkyDungeonCurrentPageInventory = index;
						}

						if (itemcallback) itemcallback(filteredInventory[index],
							canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135,
							yOffset + canvasOffsetY_ui + 50 + b_height * yy,
							b_width-padding, b_height-padding, diff
						);
						return true;
					}, true, canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135, yOffset + canvasOffsetY_ui + 50 + b_height * yy,
					b_width-padding, b_height-padding,
					useIcons ? ("") : (text + suff),
					"#ffffff",//useIcons ? "#ffffff" : index == KinkyDungeonCurrentPageInventory ? "#ffffff" : "#888888",
					useIcons ? filteredInventory[index].preview || "" : "",
					undefined, undefined, index !=
						(prefix ? KinkyDungeonCurrentPageContainer : KinkyDungeonCurrentPageInventory),
					colorcallback ? colorcallback(filteredInventory[index]) : KDTextGray1, undefined, undefined, {
						scaleImage: true,
					}) && !tooltipitem) {
						tooltipitem = filteredInventory[index];
					}
					if (useIcons && filteredInventory[index].preview2)
						KDDraw(kdcanvas, kdpixisprites, prefix + "invchoice_2_" + i,
							filteredInventory[index].preview2, canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135, yOffset + canvasOffsetY_ui + 50 + b_height * yy, b_width-padding, b_height-padding,
							undefined, {
								zIndex: 100.1,
								alpha: 0.9,
							});
					if (filteredInventory[index].previewcolor) {
						KDDraw(kdcanvas, kdpixisprites, prefix + "invchoice_halo" + i,
							KinkyDungeonRootDirectory + "UI/ItemAura.png", canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135, yOffset + canvasOffsetY_ui + 50 + b_height * yy, b_width-padding, b_height-padding,
							undefined, {
								zIndex: 100.003,
								tint: string2hex(filteredInventory[index].previewcolor),
								alpha: 0.9,
							});
					}
					if (filteredInventory[index].previewcolorbg) {
						KDDraw(kdcanvas, kdpixisprites, prefix + "invchoice_halobg" + i,
							KinkyDungeonRootDirectory + "UI/ItemAuraBG.png", canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135, yOffset + canvasOffsetY_ui + 50 + b_height * yy, b_width-padding, b_height-padding,
							undefined, {
								zIndex: 100.002,
								tint: string2hex(filteredInventory[index].previewcolorbg),
								alpha: 0.8,
							});
					}
					if (KDGameData.ItemPriority && KDGameData.ItemPriority[filteredInventory[index].item?.name|| filteredInventory[index].item.name] > 0) {
						KDDraw(kdcanvas, kdpixisprites, prefix + "invchoice_star" + i,
							KinkyDungeonRootDirectory + "UI/Star.png",
							canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135, yOffset + canvasOffsetY_ui + 50 + b_height * yy, undefined, undefined,
							undefined, {
								zIndex: 100.2,
							});
					}
					if (filteredInventory[index].key) {
						KDDraw(kdcanvas, kdpixisprites, prefix + "invchoice_key" + i,
							KinkyDungeonRootDirectory + filteredInventory[index].key + ".png",
							canvasOffsetX_ui + xOffset + xx * b_width + b_width - 36 + 640*KinkyDungeonBookScale + 135, yOffset + 4 + canvasOffsetY_ui + 50 + b_height * yy, 28, 28,
							undefined, {
								zIndex: 100.2,
							});
					}
					if (filteredInventory[index].item.quantity != undefined) {
						DrawTextKD("" + filteredInventory[index].item.quantity, canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 140, yOffset + canvasOffsetY_ui + 50 + b_height * yy + 18, "#ffffff", undefined, 18, "left");
					}

					if (KDGameData.InventoryAction && KDInventoryAction[KDGameData.InventoryAction]?.itemlabel
						&& (!KDInventoryAction[KDGameData.InventoryAction].show || KDInventoryAction[KDGameData.InventoryAction].show(KDPlayer(), filteredInventory[index].item))
						&& (!KDInventoryAction[KDGameData.InventoryAction].valid || KDInventoryAction[KDGameData.InventoryAction].valid(KDPlayer(), filteredInventory[index].item))
					)
						DrawTextFitKD(KDInventoryAction[KDGameData.InventoryAction].itemlabel(KinkyDungeonPlayerEntity, filteredInventory[index].item),
							36 + canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 140, yOffset + canvasOffsetY_ui + 50 + b_height * yy + (useIcons ? 72 : 36) - 9,  72, KDInventoryAction[KDGameData.InventoryAction].itemlabelcolor ? KDInventoryAction[KDGameData.InventoryAction].itemlabelcolor(KinkyDungeonPlayerEntity, filteredInventory[index].item) : "#ffffff",
							KDTextGray0, 18, "center");
				} else {
					if (i + (prefix ? KinkyDungeonContainerOffset : KinkyDungeonInventoryOffset) > filteredInventory.length + numRows*3) {
						if (prefix) {
							KinkyDungeonContainerOffset = Math.max(0, filteredInventory.length + numRows*3 - i);
						} else {
							KinkyDungeonInventoryOffset = Math.max(0, filteredInventory.length + numRows*3 - i);
						}
					}
					//break;
					// Instead of breaking, we fill in the missing squares
					DrawButtonKDExScroll(prefix + "invchoice_" + i, (amount) => {
						if (prefix) {
								KinkyDungeonContainerOffset = Math.max(0, Math.min(filteredInventory.length + 2 - numRows*3,
								KinkyDungeonContainerOffset + numRows*Math.sign(amount)*Math.ceil(Math.abs(amount)/b_height/numRows/b_width)));
							} else {
								KinkyDungeonInventoryOffset = Math.max(0, Math.min(filteredInventory.length + 2 - numRows*3,
								KinkyDungeonInventoryOffset + numRows*Math.sign(amount)*Math.ceil(Math.abs(amount)/b_height/numRows/b_width)));
							}
					}, (_bdata) => {
						//KinkyDungeonCurrentPageInventory = index;
						return true;
					}, true, canvasOffsetX_ui + xOffset + xx * b_width + 640*KinkyDungeonBookScale + 135, yOffset + canvasOffsetY_ui + 50 + b_height * yy, b_width-padding, b_height-padding,
					"",
					"#ffffff",
					"",
					undefined, undefined,
					index != (prefix ? KinkyDungeonCurrentPageContainer : KinkyDungeonCurrentPageInventory),
					KDTextGray1, undefined, undefined, {
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


			DrawButtonKDEx(prefix + "invScrollUp", (_bdata) => {
				if (filteredInventory.length > 0) {
					if ((prefix ? KinkyDungeonContainerOffset : KinkyDungeonInventoryOffset) > 0) {
						if (prefix) {
							KinkyDungeonContainerOffset = Math.max(0, KinkyDungeonContainerOffset - numRows*3);
						} else {
							KinkyDungeonInventoryOffset = Math.max(0, KinkyDungeonInventoryOffset - numRows*3);
						}
					}
				}
				return true;
			}, true,
			canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 526, yOffset + canvasOffsetY_ui, 90, 44, "", KinkyDungeonInventoryOffset > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.png",
			undefined, undefined, undefined, undefined, undefined, undefined, {
				hotkey: KDHotkeyToText(KDInventoryDrawContainerHotkeys[prefix] ?
					KDInventoryDrawContainerHotkeys[prefix].up() : KinkyDungeonKey[4]),
				hotkeyPress: KDInventoryDrawContainerHotkeys[prefix] ?
					KDInventoryDrawContainerHotkeys[prefix].up() : KinkyDungeonKey[4],
			});
			DrawButtonKDEx(prefix + "invScrollDown", (_bdata) => {
				if (filteredInventory.length > 0) {
					if ((prefix ? KinkyDungeonContainerOffset : KinkyDungeonInventoryOffset) + numRows*3 < filteredInventory.length + 2) {
						if (prefix) {
							KinkyDungeonContainerOffset += numRows*3;
						} else {
							KinkyDungeonInventoryOffset += numRows*3;
						}
					}
				}
				return true;
			}, true,
			canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 526, yOffset + 480*KinkyDungeonBookScale + canvasOffsetY_ui - 4, 90, 44, "", ((prefix ? KinkyDungeonContainerOffset : KinkyDungeonInventoryOffset) + 24 < filteredInventory.length) ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.png",
			undefined, undefined, undefined, undefined, undefined, undefined, {
				hotkey: KDHotkeyToText(KDInventoryDrawContainerHotkeys[prefix] ?
					KDInventoryDrawContainerHotkeys[prefix].down() : KinkyDungeonKey[6]),
				hotkeyPress: KDInventoryDrawContainerHotkeys[prefix] ?
					KDInventoryDrawContainerHotkeys[prefix].down() : KinkyDungeonKey[6],
			});
		}
	}
	if (KDFilterFilters[CurrentFilter] && !KDConfigHotbar) {
		if (KDFilterIndex[CurrentFilter] == undefined) {
			KDFilterIndex[CurrentFilter] = 0;
		}
		let filters = Object.entries(KDFilterFilters[CurrentFilter]);
		let activeUp = false;
		let activeDown = false;
		let index = KDFilterIndex[CurrentFilter];
		for (let i = 0; i < filters.length - index + 2 * KDMaxFilters + 1; i++) {
			let xx = 0;
			let yy = i - index;
			let show = i >= index && i < index + KDMaxFilters && i < filters.length;
			if (!show && i < filters.length &&  KDFilterFilters[CurrentFilter][filters[i][0]]) {
				if (i < index) {
					activeUp = true;
				} else {
					activeDown = true;
				}
			}
			let scroll = (amount: number) => {
				if (filters.length > KDMaxFilters)
					return Math.max(0,
						Math.min(Object.keys(KDFilterFilters[CurrentFilter]).length - KDMaxFilters/2,
							3 * Math.sign(amount) + index
						)
					);
				return 0;
			};
			if (index > 0 && i == index) {
				// Draw up button
				DrawButtonKDExScroll(prefix + "invchoice_filter_" + i, (amount) => {
					KDFilterIndex[CurrentFilter] = scroll(amount);
				}, (_bdata) => {
					KDFilterIndex[CurrentFilter] = scroll(-1);
					return true;
				}, true, canvasOffsetX_ui + xOffset + xx * 200 + 640*KinkyDungeonBookScale + 132, yOffset + canvasOffsetY_ui + 50 + 40 * yy, 159, 36,
				"", "#ffffff", KinkyDungeonRootDirectory + "Up.png", undefined, undefined, !activeUp,
				KDTextGray1, 20, undefined, {
					centered: true,
					scaleImage: false,
					hotkey: KDHotkeyToText(KinkyDungeonKey[0]),
					hotkeyPress: KinkyDungeonKey[0],
				});
			} else if (filters.length > KDMaxFilters && i == KDMaxFilters + index - 1 &&
				scroll(1) != scroll(0) // Test for limit
			) {
				// Draw down button
				DrawButtonKDExScroll(prefix + "invchoice_filter_" + i, (amount) => {
					KDFilterIndex[CurrentFilter] = scroll(amount);
				}, (_bdata) => {
					KDFilterIndex[CurrentFilter] = scroll(1);
					return true;
				}, true, canvasOffsetX_ui + xOffset + xx * 200 + 640*KinkyDungeonBookScale + 132, yOffset + canvasOffsetY_ui + 50 + 40 * yy, 159, 36,
				"", "#ffffff", KinkyDungeonRootDirectory + "Down.png", undefined, undefined, !activeDown,
				KDTextGray1, 20, undefined, {
					centered: true,
					scaleImage: false,
					hotkey: KDHotkeyToText(KinkyDungeonKey[2]),
					hotkeyPress: KinkyDungeonKey[2],
				});
			} else if (i - index < KDMaxFilters && i - index >= 0) {
				// Draw filter
				DrawButtonKDExScroll(prefix + "invchoice_filter_" + i, (amount) => {
					if (filters.length > KDMaxFilters)
						KDFilterIndex[CurrentFilter] = Math.max(0,
							Math.min(Object.keys(KDFilterFilters[CurrentFilter]).length - KDMaxFilters/2,
								3 * Math.sign(amount) + index
							)
						);
				}, (_bdata) => {
					if (show) {
						KDFilterFilters[CurrentFilter][filters[i][0]] = !KDFilterFilters[CurrentFilter][filters[i][0]];
						if (prefix) {
							KinkyDungeonContainerOffset = 0;
						} else {
							KinkyDungeonInventoryOffset = 0;
						}
						KinkyDungeonFilterInventory(CurrentFilter, undefined, undefined, undefined, filters[i][0], KDInvFilter);
					}
					return true;
				}, true, canvasOffsetX_ui + xOffset + xx * 200 + 640*KinkyDungeonBookScale + 132, yOffset + canvasOffsetY_ui + 50 + 40 * yy, 159, 36,
				show ? TextGet("KDFilterFilters" + filters[i][0]) : "", (show && filters[i][1]) ? "#ffffff" : "#aaaaaa", undefined, undefined, undefined, (!show || !filters[i][1]),
				KDTextGray1, 20);
			}


		}
	}
	return {selected: selected, tooltipitem: tooltipitem};
}

function KDDrawInventoryFilters(xOffset, yOffset = 0, filters = [], addFilters = []) {

	let defaultIndex = 0;
	//if (KinkyDungeonFilterInventory(KinkyDungeonFilters[0], undefined, undefined, undefined, undefined, KDInvFilter).length == 0) {
	//	defaultIndex = 1;
	//}

	let KDFilters = [...addFilters, ...KinkyDungeonFilters];

	let selected = "";
	let first = "";
	let II = 0;
	for (let I = 0; I < KDFilters.length; I++) {
		if (filters.includes(KDFilters[I])) continue;
		if (!first) first = KDFilters[I];
		let col = KDTextGray2;
		if (KinkyDungeonFilterInventory(KDFilters[I], false, false, true).length > 0) {
			col = "#888888";
		}
		//if (KDFilters.indexOf(KinkyDungeonCurrentFilter) == I) {
		//	KinkyDungeonCurrentFilter = KDFilters[defaultIndex];
		//	KDPreventAccidentalClickTime = CommonTime() + 1200;
		//}

		if (!KDConfigHotbar)
			DrawButtonKDEx("categoryfilter" + I, (_bdata) => {
				KinkyDungeonCurrentFilter = KDFilters[I];

				KinkyDungeonCurrentPageInventory = 0;
				KinkyDungeonCurrentPageContainer = 0;
				return true;
			}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale - 55, yOffset + canvasOffsetY_ui + 115 + II*65, 180, 60,
			TextGet("KinkyDungeonCategoryFilter" + KDFilters[I]),
				(KinkyDungeonCurrentFilter == KDFilters[I]) ? "White" : col, "", "");

		if (KinkyDungeonCurrentFilter == KDFilters[I]) selected = KDFilters[I];
		II++;
	}
	if (!selected && first) KinkyDungeonCurrentFilter = first;
}

function KinkyDungeonDrawInventory() {
	let xOffset = -125;
	KinkyDungeonDrawMessages(true, 550, true, 600);


	KDDrawInventoryTabs(xOffset, true);

	KDDrawInventoryFilters(xOffset);
	let filter = KinkyDungeonCurrentFilter;
	if (KDFilterTransform[KinkyDungeonCurrentFilter]) filter = KDFilterTransform[KinkyDungeonCurrentFilter];
	let filteredInventory = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter, undefined, undefined, undefined, undefined, KDInvFilter);


	let ss = KDDrawInventoryContainer(xOffset, 0, filteredInventory, filter, KinkyDungeonCurrentFilter);
	let selected = ss.selected;
	KDDrawHotbarBottom(selected, undefined, undefined, -432, true);

	if (KinkyDungeonDrawInventorySelected(filteredInventory[KinkyDungeonCurrentPageInventory], undefined, undefined, xOffset) && !KDConfigHotbar) {

		let inventoryActions: string[] = [];

		for (let action of Object.entries(KDInventoryActionsDefault)) {
			if (filter == action[0]) {
				inventoryActions.push(...action[1](filteredInventory[KinkyDungeonCurrentPageInventory].item));
			}
		}

		if (KDGameData.InventoryAction) {
			inventoryActions.push(KDGameData.InventoryAction);
			if (KDInventoryAction[KDGameData.InventoryAction]?.alsoShow) inventoryActions.push(...KDInventoryAction[KDGameData.InventoryAction].alsoShow);
		}

		if (inventoryActions.length > 0) {
			let XX = canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale - 2;
			let YY = canvasOffsetY_ui + 483*KinkyDungeonBookScale - 5;
			let YYTooltip = YY - 30;
			let II = 0;
			for (let action of inventoryActions) {
				if (!KDInventoryAction[action]?.show || KDInventoryAction[action]?.show(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item)) {
					if (KDInventoryAction[action]) {
						if (KDInventoryAction[action]?.label
							&& (!KDInventoryAction[action].show || KDInventoryAction[action].show(KDPlayer(), filteredInventory[KinkyDungeonCurrentPageInventory].item))
							&& (!KDInventoryAction[action].valid || KDInventoryAction[action].valid(KDPlayer(), filteredInventory[KinkyDungeonCurrentPageInventory].item))
						)
							DrawTextFitKD(KDInventoryAction[action].label(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item),
								XX + II*KDInventoryActionSpacing + 34, YY + 72 - 9, 72, KDInventoryAction[action].labelcolor ? KDInventoryAction[action].labelcolor(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item) : "#ffffff",
								KDTextGray0, 18, "center");
						if (DrawButtonKDEx("invAction" + action, (_bdata) => {
							KDSendInput("inventoryAction", {action: action, player: KinkyDungeonPlayerEntity, item: filteredInventory[KinkyDungeonCurrentPageInventory].item});
							return true;
						}, true, XX + II*KDInventoryActionSpacing, YY, 74, 74, "", "",
						KinkyDungeonRootDirectory + KDInventoryAction[action].icon(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item) + ".png",
						"",
						!KDInventoryAction[action].valid(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item),
						true, KDInventoryAction[action].valid(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item) ? KDButtonColor : "rgba(255, 50, 50, 0.5)",
						undefined, undefined, {centered: true,
							hotkey: KDInventoryAction[action].hotkey ? KDInventoryAction[action].hotkey() : undefined,
							hotkeyPress: KDInventoryAction[action].hotkeyPress ? KDInventoryAction[action].hotkeyPress() : undefined,

						},
						)) {
							DrawTextFitKD(KDInventoryAction[action].text ?
								KDInventoryAction[action].text(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item)
								: TextGet("KDInventoryAction" + action),
							XX, YYTooltip, KDInventoryActionSpacing*6, "#ffffff", KDTextGray0, 24, "left");
						}
					}

					II++;
					if (II > KDInventoryActionPerRow) {
						II = 0;
						YY += KDInventoryActionSpacing;
					}
				}

			}
		} else {

			if (filter == Restraint) {
				let item = filteredInventory[KinkyDungeonCurrentPageInventory].item;
				let itemIndex = KDGetItemLinkIndex(item, false);
				DrawButtonKDEx("struggleItem", (_bdata) => {
					if (itemIndex >= 0 && KDCanStruggle(item)) {
						let r = KDRestraint(item);
						let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
						KDSendInput("struggle", {group: sg.group, index: itemIndex, type: "Struggle"});
					}
					return true;
				}, itemIndex >= 0 && KDCanStruggle(item), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 275, 55, TextGet("KinkyDungeonStruggle"),
				(itemIndex >= 0 && KDCanRemove(item)) ? "#ffffff" : "#888888", "", "");
				DrawButtonKDEx("removeItem", (_bdata) => {
					if (itemIndex >= 0 && KDCanRemove(item)) {
						let r = KDRestraint(item);
						let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
						KDSendInput("struggle", {group: sg.group, index: itemIndex, type: (item.lock) ? "Unlock" : "Remove"});
					}
					return true;
				}, itemIndex >= 0 && KDCanRemove(item), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 25, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 60, 275, 55, TextGet("KinkyDungeon" + ((item.lock) ? "Unlock" : "Remove")),
				(itemIndex >= 0 && KDCanRemove(item)) ? "#ffffff" : "#888888", "", "");

				if (KDGameData.InventoryAction) {
					DrawButtonKDEx("inventoryAction", (_bdata) => {
						KDSendInput("inventoryAction", {player: KinkyDungeonPlayerEntity, item: filteredInventory[KinkyDungeonCurrentPageInventory].item});
						return true;
					}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale + 60, 275, 55,
						KDInventoryAction[KDGameData.InventoryAction] && KDInventoryAction[KDGameData.InventoryAction].text ? KDInventoryAction[KDGameData.InventoryAction].text(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item) : TextGet("KDInventoryAction" + KDGameData.InventoryAction),
						KDInventoryAction[KDGameData.InventoryAction] && KDInventoryAction[KDGameData.InventoryAction].valid(KinkyDungeonPlayerEntity, filteredInventory[KinkyDungeonCurrentPageInventory].item)
						? "#ffffff" : "#888888",
						"", "", undefined, undefined, undefined, undefined, undefined, {
							hotkey: KDInventoryAction[KDGameData.InventoryAction].hotkey ? KDInventoryAction[KDGameData.InventoryAction].hotkey() : undefined,
							hotkeyPress: KDInventoryAction[KDGameData.InventoryAction].hotkeyPress ? KDInventoryAction[KDGameData.InventoryAction].hotkeyPress() : undefined,
						});
				}
			}
		}

	}
	if (KinkyDungeonCurrentPageInventory >= filteredInventory.length) KinkyDungeonCurrentPageInventory = Math.max(0, KinkyDungeonCurrentPageInventory - 1);

	if (KinkyDungeonCurrentPageInventory > 0) {
		DrawButtonKDEx("invlastpage", (_bdata) => {
			if (KinkyDungeonCurrentPageInventory > 0) {
				KinkyDungeonCurrentPageInventory -= 1;
				return true;
			}
			return true;
		}, true, canvasOffsetX_ui + xOffset + 100 + 50, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 50, TextGet("KinkyDungeonBookLastPage"), "White", "", "", undefined, true, KDButtonColor,
		undefined, undefined, {
			hotkey: KDHotkeyToText(KinkyDungeonKey[1]),
			hotkeyPress: KinkyDungeonKey[1],
		});
	}
	if (KinkyDungeonCurrentPageInventory < filteredInventory.length-1) {
		DrawButtonKDEx("invnextpage", (_bdata) => {
			if (KinkyDungeonCurrentPageInventory < filteredInventory.length-1) {
				KinkyDungeonCurrentPageInventory += 1;
				return true;
			}
			return true;
		}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale - 375, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 50, TextGet("KinkyDungeonBookNextPage"), "White", "", "", undefined, true, KDButtonColor,
		undefined, undefined, {
			hotkey: KDHotkeyToText(KinkyDungeonKey[3]),
			hotkeyPress: KinkyDungeonKey[3],
		});
	}

}

function KinkyDungeonSendInventoryEvent(Event: string, data: any) {
	if (!KDMapHasEvent(KDEventMapInventory, Event)) return;
	let iteration = 0;
	let stack = true;
	KDGetItemEventCache();
	if (!KDItemEventCache.get(Event)) return;
	while ((stack) && iteration < 100) {
		stack = false;
		for (let item of KinkyDungeonAllRestraint()) {
			if (!KDItemEventCache.get(Event)?.get(KDRestraint(item)?.Group)) continue;
			let curse = KDGetCurse(item);
			if (item.dynamicLink)
				for (let d_item of KDDynamicLinkList(item)) {
					let oldEvents = d_item.events;
					let d_curse = KDGetCurse(d_item);
					if (oldEvents)
						for (let e of oldEvents) {
							if (e.inheritLinked && e.trigger === Event && (!e.curse || d_curse) && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
								if (iteration == (e.delayedOrder ? e.delayedOrder : 0)) {
									KinkyDungeonHandleInventoryEvent(Event, e, d_item, data);
								} else {
									stack = true;
								}

							}
						}
					if (d_curse && KDCurses[d_curse]?.events) {
						for (let e of KDCurses[d_curse].events) {
							if (e.trigger === Event && (!e.curse || d_curse) && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
								if (iteration == (e.delayedOrder ? e.delayedOrder : 0)) {
									KinkyDungeonHandleInventoryEvent(Event, e, d_item, data);
								} else {
									stack = true;
								}
							}
						}
					}
				}
			if (item.events) {
				for (let e of item.events) {
					if (e.trigger === Event && (!e.curse || curse) && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
						if (iteration == (e.delayedOrder ? e.delayedOrder : 0)) {
							KinkyDungeonHandleInventoryEvent(Event, e, item, data);
						} else {
							stack = true;
						}
					}
				}
			}
			if (curse && KDCurses[curse]?.events) {
				for (let e of KDCurses[curse].events) {
					if (e.trigger === Event && (!e.curse || curse) && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
						if (iteration == (e.delayedOrder ? e.delayedOrder : 0)) {
							KinkyDungeonHandleInventoryEvent(Event, e, item, data);
						} else {
							stack = true;
						}
					}
				}
			}
		}
		iteration += 1;
	}
}


function KDSendNPCRestraintEvent(Event: string, data: any) {
	let iteration = 0;
	let stack = true;
	KDGetItemEventCache();
	while ((stack) && iteration < 100) {
		stack = false;
		for (let item of Object.values(data.NPCRestraintEvents as Record<string, NPCRestraint>)) {
			let curse = KDGetCurse(item);

			if (item.events) {
				for (let e of item.events) {
					if (e.trigger === Event && (!e.curse || curse)) {
						if (iteration == (e.delayedOrder ? e.delayedOrder : 0)) {
							KinkyDungeonHandleInventoryEvent(Event, e, item, data);
						} else {
							stack = true;
						}
					}
				}
			}
			if (curse && KDCurses[curse]?.events) {
				for (let e of KDCurses[curse].events) {
					if (e.trigger === Event && (!e.curse || curse) && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
						if (iteration == (e.delayedOrder ? e.delayedOrder : 0)) {
							KinkyDungeonHandleInventoryEvent(Event, e, item, data);
						} else {
							stack = true;
						}
					}
				}
			}
		}
		iteration += 1;
	}
}

function KinkyDungeonSendInventorySelectedEvent(Event: string, data: any) {
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

function KinkyDungeonSendInventoryIconEvent(Event: string, data: any) {
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

function KinkyDungeonQuickGrid(I: number, Width: number, Height: number, Xcount: number): KDPoint {
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
		TF.Element.oninput = (_event: any) => {
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
		DrawButtonKDEx("inventorysort", (_bdata) => {
			if (!KDGameData.HiddenItems)
				KDGameData.HiddenItems = {};
			for (let invStat of Object.keys(KDInventoryStatus)) {
				if (invStat == "SortQuickInv") KDInventoryStatus[invStat] = !KDInventoryStatus[invStat];
				else KDInventoryStatus[invStat] = false;
			}
			KDSortInventory(KinkyDungeonPlayerEntity);
			return true;
		}, true, 630, 545, 120, 60, "", KDButtonColor, KinkyDungeonRootDirectory + "InvSort.png", undefined, false, !KDInventoryStatus.SortQuickInv);

		DrawButtonKDEx("inventoryhide", (_bdata) => {
			if (!KDGameData.HiddenItems)
				KDGameData.HiddenItems = {};
			for (let invStat of Object.keys(KDInventoryStatus)) {
				if (invStat == "HideQuickInv") KDInventoryStatus[invStat] = !KDInventoryStatus[invStat];
				else KDInventoryStatus[invStat] = false;
			}
			KDSortInventory(KinkyDungeonPlayerEntity);
			return true;
		}, true, 630, 625, 120, 60, "", KDButtonColor, KinkyDungeonRootDirectory + "InvHide.png", undefined, false, !KDInventoryStatus.HideQuickInv);

		DrawButtonKDEx("inventorydrop", (_bdata) => {
			for (let invStat of Object.keys(KDInventoryStatus)) {
				if (invStat == "DropQuickInv") KDInventoryStatus[invStat] = !KDInventoryStatus[invStat];
				else KDInventoryStatus[invStat] = false;
			}
			KDSortInventory(KinkyDungeonPlayerEntity);
			return true;
		}, true, 630, 705, 120, 60, "", KDButtonColor, KinkyDungeonRootDirectory + "InvDrop.png", undefined, false, !KDInventoryStatus.DropQuickInv);


		// Quick loadouts
		let QL_y = 260;
		DrawButtonKDEx("quickLoadout_save", (_bdata) => {
			KDQuickLoadoutSave = !KDQuickLoadoutSave;
			return true;
		}, true, 630, QL_y, 120, 60, TextGet("KDQuickLoadoutSave"), "#dddddd", "", undefined, false, !KDQuickLoadoutSave, KDButtonColor);

		if (KDQuickLoadoutSave) {
			DrawCheckboxKDEx("QuickLoadout_Weapon", (_bdata) => {
				KDGameData.QuickLoadout_Weapon = !KDGameData.QuickLoadout_Weapon;
				return true;
			}, true, 510, 110, 64, 64, TextGet("KDQuickLoadout_Weapon"), KDGameData.QuickLoadout_Weapon, false, "#ffffff");

			DrawCheckboxKDEx("QuickLoadout_Merge", (_bdata) => {
				KDGameData.QuickLoadout_Merge = !KDGameData.QuickLoadout_Merge;
				return true;
			}, true, 510, 180, 64, 64, TextGet("KDQuickLoadout_Merge"), KDGameData.QuickLoadout_Merge, false, "#ffffff");
		}

		for (let i = 1; i <= KDNumOfQuickLoadouts; i++) {
			DrawButtonKDEx("quickLoadout_num_" + i, (_bdata) => {
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
		DrawButtonKDEx("quickinvbg2_button", (_bdata) => {
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
				(_bdata)=> {
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
				DrawButtonKDEx("consumablesiconfav" + c + (KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] ? "b" : "a"), (_bdata) => {
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
				(_bdata)=> {
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
				DrawButtonKDEx("weaponsiconfavOfffav" + w + (KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] ? "b" : "a"), (_bdata) => {
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
				(_bdata)=> {
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
						if (KDToggles.OnlySelfQuickInv || KDRestraint(item.item)?.good || KDRestraint(item.item)?.armor) {
							let equipped = false;
							let newItem = null;
							let currentItem = null;
							let linkable = null;

							if (item
								&& item.item) {
								newItem = KDRestraint(item.item);
								if (newItem) {
									currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
									if (!currentItem) equipped = false;
									else {
										if (KDDebugLink) {
											linkable = KDCanAddRestraint(KDRestraint(newItem), true, "", false, currentItem, true, true);
										} else {
											//linkable = KDCurrentItemLinkable(currentItem, newItem);
											linkable = KDCanAddRestraint(KDRestraint(newItem), false, "", false, currentItem, true, true);

										}
										if (linkable) {
											equipped = false;
										} else equipped = true;
									}
								}
							}
							if (!equipped && newItem) {
								if (KDSendInput("equip", {name: item.item.name,
									inventoryVariant: item.item.name != newItem.name ?
										item.item.name : undefined,
									faction: item.item.faction,
									group: newItem.Group, curse: item.item.curse, currentItem: currentItem ? currentItem.name : undefined, events: Object.assign([], item.item.events)})) return true;
							}
						} else
							KDSendInput("quickRestraint", {item: item.item.name, quantity: 1});

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
				DrawButtonKDEx("restraintsiconfav" + w + (KDGameData.ItemPriority && KDGameData.ItemPriority[item.item?.name|| item.name] ? "b" : "a"), (_bdata) => {
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
			DrawTextKD("" + (item.item.quantity || 1), point.x, 1000 - V - Rheight + point.y, "#ffffff", undefined, 18, "left");

		}
	}
}

function KinkyDungeonhandleQuickInv(NoUse?: boolean): boolean {


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
 * @param name
 * @param [player]
 * @param [playerDropped]
 */
function KDDropItemInv(name: string, player?: entity, playerDropped: boolean = true) {
	let item = KinkyDungeonInventoryGetLoose(name) || KinkyDungeonInventoryGet(name);
	if (!player) player = KinkyDungeonPlayerEntity;
	if (item && item.type != Restraint && item.name != KinkyDungeonPlayerWeapon
		&& KDCanDrop(item)) { // We cant drop equipped items
		// Drop one of them
		if (item.quantity > 1) {
			item.quantity -= 1;
		} else KinkyDungeonInventoryRemove(item);

		let dropped = {x:player.x, y:player.y, name: name, amount: 1, playerDropped: playerDropped};

		KDMapData.GroundItems.push(dropped);

		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
	}
}

/**
 * @param player
 */
function KDSortInventory(_player: entity) {
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

function KDLoadQuickLoadout(num: number, clearFirst: boolean) {
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
					refreshedWeapons = true;
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
						inventoryVariant: item != newItem.name ?
							item : undefined,
						group: newItem.Group,
						curse: restraintItem.curse,
						faction: restraintItem.faction,
						currentItem: currentItem ? currentItem.name : undefined,
						events: Object.assign([], KinkyDungeonInventoryGetLoose(item).events)});
					//events: Object.assign([], restraintItem.events)
				}
			}
		}
	}
}

function KDSaveQuickLoadout(num: number) {
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
			loadout.push(item.inventoryVariant || item.name);
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
 * @param Name
 */
function KDRemoveInventoryVariant(Name: string, _Prefix: string = "Restraint") {
	delete KinkyDungeonRestraintVariants[Name];
}
/**
 * @param Name
 */
function KDRemoveWeaponVariant(Name: string, _Prefix: string = "KinkyDungeonInventoryItem") {
	delete KinkyDungeonWeaponVariants[Name];
}
/**
 * @param Name
 */
function KDRemoveConsumableVariant(Name: string, _Prefix: string = "KinkyDungeonInventoryItem") {
	delete KinkyDungeonConsumableVariants[Name];
}

/**
 * @param [worn]
 * @param [loose]
 * @param [lost]
 * @param [ground]
 * @param [hotbar]
 * @param [entities]
 * @param [npcrestraints]
 */
function KDPruneInventoryVariants(worn: boolean = true, loose: boolean = true, lost: boolean = true, ground: boolean = true, hotbar: boolean = true, entities: boolean = true, npcrestraints: boolean = true, containers: boolean = true) {
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

		if (!KDGameData.PersistentItems) KDGameData.PersistentItems = {};
		for (let plist of Object.values(KDGameData.PersistentItems)) {
			for (let name of Object.keys(plist)) {
				if (KinkyDungeonRestraintVariants[name]) {
					found[name] = true;
				}
				if (KinkyDungeonConsumableVariants[name]) {
					found[name] = true;
				}
				if (KinkyDungeonWeaponVariants[name]) {
					found[name] = true;
				}
			}
		}
	}
	if (entities) {
		let list = KDMapData.Entities;
		for (let enemy of list) {
			if (enemy.items) {
				for (let inv of enemy.items) {
					if (KinkyDungeonRestraintVariants[inv]) {
						found[inv] = true;
					}
					if (KinkyDungeonConsumableVariants[inv]) {
						found[inv] = true;
					}
					if (KinkyDungeonWeaponVariants[inv]) {
						found[inv] = true;
					}
				}
			}
		}

	}
	if (npcrestraints && KDGameData.NPCRestraints) {
		for (let list of Object.values(KDGameData.NPCRestraints)) {
			for (let restraint of Object.values(list)) {
				if (restraint?.name) {
					found[restraint.name] = true;
				}
				if (restraint?.inventoryVariant) {
					found[restraint.inventoryVariant] = true;
				}
			}
		}
	}
	if (containers && KDGameData.Containers) {
		for (let con of Object.values(KDGameData.Containers)) {
			for (let restraint of Object.keys(con.items)) {
				found[restraint] = true;
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
 * @param item
 * @param variant
 * @param [prefix]
 * @param [curse]
 */
function KDMorphToInventoryVariant(item: item, variant: KDRestraintVariant, prefix: string = "", curse?: string) {
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
	KDUpdateItemEventCache = true;
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
	KDUpdateItemEventCache = true;
}

/**
 * Adds an weapon variant to the player's inventory
 * @param variant
 * @param [prefix]
 * @param [forceName]
 * @param [suffix]
 */
function KDGiveWeaponVariant(variant: KDWeaponVariant, prefix: string = "", forceName?: string, suffix: string = "", container?: KDContainer) {
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
	if (container) {
		if (container.items[newname]) {
			container.items[newname].quantity = (container.items[newname].quantity || 1) + 1;
		} else {
			container.items[newname] = {name: newname, id: KinkyDungeonGetItemID(), type: Weapon, events:events, quantity: q, showInQuickInv: true,};
		}
	} else {
		if (KinkyDungeonInventoryGet(newname)) q = KinkyDungeonInventoryGet(newname).quantity + 1;
		KinkyDungeonInventoryAdd({name: newname, id: KinkyDungeonGetItemID(), type: Weapon, events:events, quantity: q, showInQuickInv: true,});
	}
}

/**
 * Adds an Consumable variant to the player's inventory
 * @param variant
 * @param [prefix]
 * @param [forceName]
 * @param [suffix]
 * @param [Quantity]
 */
function KDGiveConsumableVariant(variant: KDConsumableVariant, prefix: string = "", forceName?: string, suffix: string = "", Quantity: number = 1, container?: KDContainer) {
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
	if (container) {
		if (container.items[newname]) {
			container.items[newname].quantity = (container.items[newname].quantity || 1) + 1;
		} else {
			container.items[newname] = {name: newname, id: KinkyDungeonGetItemID(), type: Consumable, events:events, quantity: q, showInQuickInv: true,};
		}
	} else {
		if (KinkyDungeonInventoryGet(newname)) q = KinkyDungeonInventoryGet(newname).quantity + Quantity;
		KinkyDungeonInventoryAdd({name: newname, id: KinkyDungeonGetItemID(), type: Consumable, events:events, quantity: q, showInQuickInv: true,});
	}
}
/**
 * Adds an inventory variant to the player's inventory
 * @param variant
 * @param [prefix]
 * @param [curse]
 * @param [ID]
 * @param [forceName]
 * @param [suffix]
 * @param [faction]
 * @param [powerBonus]
 * @param [quantity]
 */
function KDGiveInventoryVariant(variant: KDRestraintVariant, prefix: string = "", curse: string = undefined, ID: string = "", forceName?: string, suffix: string = "", faction: string = "", powerBonus?: number, quantity: number = 1, container?: KDContainer) {
	let origRestraint = KinkyDungeonGetRestraintByName(variant.template);
	let events = origRestraint.events ? JSON.parse(JSON.stringify(origRestraint.events)) : [];
	let newname = forceName ? forceName : (prefix + variant.template + (ID || (KinkyDungeonGetItemID() + "")) + (curse ? curse : ""));
	if (prefix) variant.prefix = prefix;
	if (suffix) variant.suffix = suffix;
	if (curse) {
		variant = JSON.parse(JSON.stringify(variant));
		variant.curse = curse;
	}
	if (powerBonus) variant.power = powerBonus;
	if (!KinkyDungeonRestraintVariants[newname])
		KinkyDungeonRestraintVariants[newname] = variant;
	if (variant.events)
		Object.assign(events, variant.events);
	let q = quantity;
	if (container) {
		if (container.items[newname]) {
			container.items[newname].quantity = (container.items[newname].quantity || 1) + 1;
		} else {
			container.items[newname] = {faction: faction, name: newname, curse: curse, id: KinkyDungeonGetItemID(), type: LooseRestraint, events:events, quantity: q, showInQuickInv: true,};
		}
	} else {
		if (KinkyDungeonInventoryGet(newname)) q = KinkyDungeonInventoryGet(newname).quantity + quantity;
		KinkyDungeonInventoryAdd({faction: faction, name: newname, curse: curse, id: KinkyDungeonGetItemID(), type: LooseRestraint, events:events, quantity: q, showInQuickInv: true,});
	}
}


/**
 * Creates an inventory variant item
 * @param variant
 * @param [prefix]
 * @param [curse]
 * @param [ID]
 * @param [forceName]
 * @param [suffix]
 * @param [faction]
 * @param [powerBonus]
 * @param [quantity]
 */
function KDGetInventoryVariant(variant: KDRestraintVariant, prefix: string = "", curse: string = undefined, ID: string = "", forceName?: string, suffix: string = "", faction: string = "", powerBonus?: number, quantity: number = 1): item {
	let origRestraint = KinkyDungeonGetRestraintByName(variant.template);
	let events = origRestraint.events ? JSON.parse(JSON.stringify(origRestraint.events)) : [];
	let newname = forceName ? forceName : (prefix + variant.template + (ID || (KinkyDungeonGetItemID() + "")) + (curse ? curse : ""));
	if (prefix) variant.prefix = prefix;
	if (suffix) variant.suffix = suffix;
	if (curse) {
		variant = JSON.parse(JSON.stringify(variant));
		variant.curse = curse;
	}
	if (powerBonus) variant.power = powerBonus;
	if (!KinkyDungeonRestraintVariants[newname])
		KinkyDungeonRestraintVariants[newname] = variant;
	if (variant.events)
		Object.assign(events, variant.events);
	let q = quantity;
	return {faction: faction, name: newname, curse: curse, id: KinkyDungeonGetItemID(), type: LooseRestraint, events:events, quantity: q, showInQuickInv: true,};
}
/**
 * Adds an inventory variant to the player's inventory
 * @param variant
 * @param [prefix]
 * @param [Tightness]
 * @param [Bypass]
 * @param [Lock]
 * @param [Keep]
 * @param [Trapped]
 * @param [faction]
 * @param [Deep] - whether or not it can go deeply in the stack
 * @param [curse] - Curse to apply
 * @param [securityEnemy] - Bypass is treated separately for these groups
 * @param [useAugmentedPower] - Augment power to keep consistency
 * @param [inventoryAs] - inventoryAs for the item
 * @param [ID]
 * @param [suffix]
 * @param [powerBonus]
 */
function KDEquipInventoryVariant (
	variant:             KDRestraintVariant,
	prefix:              string = "",
	Tightness?:          number,
	Bypass?:             boolean,
	Lock?:               string,
	Keep?:               boolean,
	Trapped?:            boolean,
	faction?:            string,
	Deep?:               boolean,
	curse?:              string,
	securityEnemy?:      entity,
	useAugmentedPower?:  boolean,
	_inventoryAs?:       string,
	ID:                  string = "",
	suffix:              string = "",
	powerBonus:          number = 0
)
{
	KDUpdateItemEventCache = true;
	let origRestraint = KinkyDungeonGetRestraintByName(variant.template);
	let events = origRestraint.events ? JSON.parse(JSON.stringify(origRestraint.events)) : [];
	let newname = prefix + variant.template + (ID || (KinkyDungeonGetItemID() + "")) + (curse ? curse : "");
	if (prefix) variant.prefix = prefix;
	if (suffix) variant.suffix = suffix;
	if (curse) {
		variant = JSON.parse(JSON.stringify(variant));
		variant.curse = curse;
	}
	if (powerBonus) variant.power = powerBonus;
	if (!KinkyDungeonRestraintVariants[newname])
		KinkyDungeonRestraintVariants[newname] = variant;
	if (variant.events)
		Object.assign(events, variant.events);
	return KinkyDungeonAddRestraintIfWeaker(origRestraint, Tightness, Bypass, Lock, Keep, Trapped, events, faction, Deep, curse, securityEnemy, useAugmentedPower, newname, undefined, undefined, undefined,
		powerBonus
	);
}

/**
 * @param item
 */
function KDItem(item: Named): weapon | restraint | outfit | consumable {
	return KDRestraint(item) || KDConsumable(item) || KDWeapon(item) || KDOutfit(item) || KinkyDungneonBasic[item?.name];
}
/**
 * @param item
 */
function KDItemNoRestraint(item: Named): weapon | outfit | consumable {
	return KDConsumable(item) || KDWeapon(item) || KDOutfit(item) || KinkyDungneonBasic[item?.name];
}

/**
 * @param name
 * @param [quantity]
 */
function KDGiveItem(name: string, quantity: number = 1): boolean {

	if (KinkyDungeonWeaponVariants[name]) {
		KDGiveWeaponVariant(KinkyDungeonWeaponVariants[name], undefined, name);
		return true;
	} else if (KDWeapon({name: name})) {
		if (!KinkyDungeonInventoryGetWeapon(name))
			KinkyDungeonInventoryAddWeapon(name);
		else return false;
		return true;
	} else if (KinkyDungeonConsumableVariants[name]) {
		KDGiveConsumableVariant(KinkyDungeonConsumableVariants[name], undefined, name, undefined, quantity);
		return true;
	} else if (KDConsumable({name: name})) {
		KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable(name), quantity);
		return true;
	} else if (KinkyDungeonRestraintVariants[name]) {
		let variant = KinkyDungeonRestraintVariants[name];
		KDGiveInventoryVariant(variant, undefined, variant.curse, undefined, name, KinkyDungeonRestraintVariants[name].suffix, undefined, undefined, quantity);
		return true;
	} else if (KDRestraint({name: name})) {
		let restraint = KDRestraint({name: name});
		if (!KinkyDungeonInventoryGetLoose(name)) {
			KinkyDungeonInventoryAdd({name: name, type: LooseRestraint, events:restraint.events, quantity: quantity, id: KinkyDungeonGetItemID()});
		} else {
			if (!KinkyDungeonInventoryGetLoose(name).quantity) KinkyDungeonInventoryGetLoose(name).quantity = 0;
			KinkyDungeonInventoryGetLoose(name).quantity += quantity;
		}
		return true;
	} else if (KDOutfit({name: name})) {
		if (!KinkyDungeonInventoryGet(name)) {
			KinkyDungeonInventoryAdd({name: name, type: Outfit, id: KinkyDungeonGetItemID()});
		}
		else return false;
		return true;
	} else if (KinkyDungneonBasic[name]) {
		KDAddBasic(KinkyDungneonBasic[name]);
		return true;
	}
	return false;
}

function KDDrawHotbarBottom(selected: KDFilteredInventoryItem, spells: boolean, selectSpell: spell, xshift: number = 0, allowOverflow: boolean = false) {
	if (KDToggles.BuffSide) allowOverflow = true;
	let i = 0;
	let HotbarStart = 995 - 70;
	let hotBarSpacing = 72;
	let hotBarX = 790 + hotBarSpacing + xshift;

	DrawButtonKDEx("CycleSpellButton", () => {
		KDCycleSpellPage(false, false, true);
		return true;
	}, true, hotBarX + 713, HotbarStart, 72, 72, `${KDSpellPage + 1}`, "#ffffff",
	KinkyDungeonRootDirectory + "UI/Cycle.png", undefined, undefined, true, undefined, 28, undefined, {
		hotkey: KDHotkeyToText(KinkyDungeonKeySpellPage[0]),
		scaleImage: true,
		centered: true,
		centerText: true,
	});
	KDCullSpellChoices();

	//if (!KDToggles.TransparentUI) {
	DrawRectKD(
		kdcanvas, kdpixisprites, "Ahotbarborder", {
			Left: hotBarX - 5, Top: HotbarStart - 5, Width: 72 * 11,
			Height: 82,
			Color: KDUIColorHighlight, alpha: KDUIAlphaHighlight, zIndex: -20,
			LineWidth: 2,
		}
	);
	FillRectKD(
		kdcanvas, kdpixisprites, "Ahotbarbg", {
			Left: hotBarX - 5, Top: HotbarStart - 5, Width: 72 * 11,
			Height: 82,
			Color: KDUIColor, alpha: 1, zIndex: -10
		}
	);
	//}



	for (i = 0; i < KinkyDungeonSpellChoiceCountPerPage; i++) {
		let index = i + KDSpellPage * KinkyDungeonSpellChoiceCountPerPage;
		let buttonDim = {
			x: hotBarX + hotBarSpacing*i,
			y: HotbarStart,
			w: 72,
			h: 72,
			wsmall: 36,
			hsmall: 36,
		};


		if (KinkyDungeonSpells[KinkyDungeonSpellChoices[index]] && !KinkyDungeonSpells[KinkyDungeonSpellChoices[index]].passive) {
			let spell = KinkyDungeonSpells[KinkyDungeonSpellChoices[index]];

			// Render MP cost
			let data = {
				spell: spell,
				cost: Math.round(KinkyDungeonGetManaCost(
					spell,
					!spell.active && spell.passive,
					!spell.active && spell.type == "passive") * 10) + "mp",
				color: "#ccddFF",
			};
			if (data.cost == "0mp") {
				let c2 = Math.round(KinkyDungeonGetStaminaCost(spell) * 10) + "sp";
				if (c2 != "0sp") {
					data.cost = c2;
				}
			}
			if (data.cost == "0mp") {
				let c2 = Math.round(KinkyDungeonGetChargeCost(spell) * 10) + "c";
				if (c2 != "0c") {
					data.cost = c2;
				}
			}
			if (spell.customCost && KDCustomCost[spell.customCost]) {
				KDCustomCost[spell.customCost](data);
			}

			DrawTextFitKD(data.cost == "0mp" ? TextGet("KDFree") : data.cost, buttonDim.x + buttonDim.w/2, buttonDim.y+buttonDim.h-7, buttonDim.w,
				data.color, "#333333", 12, "center", 110);

			// Draw the main spell icon
			if (spell.type == "passive" && KinkyDungeonSpellChoicesToggle[index]) {
				FillRectKD(kdcanvas, kdpixisprites, "rectspella" + i, {
					Left: buttonDim.x-2,
					Top: buttonDim.y-2,
					Width: buttonDim.w+4,
					Height: buttonDim.h+4,
					Color: "#dbdbdb",
					zIndex: 70,
				});
				FillRectKD(kdcanvas, kdpixisprites, "rectspellb" + i, {
					Left: buttonDim.x,
					Top: buttonDim.y,
					Width: buttonDim.w,
					Height: buttonDim.h,
					Color: "#101010",
					zIndex: 70.1,
				});
			}


			DrawButtonKDEx("SpellHotbar" + index,
				() => {
					let I = index;
					if (spells) {
						if (KinkyDungeonSpells[KinkyDungeonSpellChoices[I]] == spell) {
							KDSendInput("spellRemove", {I:I});
						} else {
							if (KinkyDungeonSpellChoices.includes(KinkyDungeonCurrentPage)) {
								KDSendInput("spellRemove", {I:KinkyDungeonSpellChoices.indexOf(KinkyDungeonCurrentPage)});
							}
							KinkyDungeonClickSpellChoice(I, KinkyDungeonCurrentPage);
						}
					} else if (KinkyDungeonConsumableChoices[I] || KinkyDungeonWeaponChoices[I] || KinkyDungeonArmorChoices[I] || KinkyDungeonSpellChoices[I] >= 0) {
						KDSendInput("spellRemove", {I:I});
					} else if (selected) {
						KinkyDungeonClickItemChoice(I, selected.item.name);
					}
					return true;
				},
				true,
				buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, "", "rgba(0, 0, 0, 0)",
				KinkyDungeonRootDirectory + "Spells/" + spell.name + ".png", "", false, true,
				undefined, undefined, undefined, {
					hotkey: KDHotkeyToText(KinkyDungeonKeySpell[i]),
					scaleImage: true,
				});
			if (KinkyDungeoCheckComponentsPartial(spell, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true).length > 0) {
				let sp = KinkyDungeoCheckComponents(spell).failed.length > 0 ? "SpellFail" : "SpellFailPartial";
				KDDraw(kdcanvas, kdpixisprites, "spellFail" + "SpellCast" + i, KinkyDungeonRootDirectory + "Spells/" + sp + ".png",
					buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, undefined, {
						zIndex: 72,
					});
			}
			if (KDHasUpcast(spell.name)) {
				KDDraw(kdcanvas, kdpixisprites, "spellCanUpcast" + i, KinkyDungeonRootDirectory + "Spells/" + "CanUpcast" + ".png",
					buttonDim.x, buttonDim.y, 72, 72, undefined, {
						zIndex: 71,
					});
			}

			if (MouseIn(buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h)) {
				DrawTextFitKD(TextGet("KinkyDungeonSpell"+ spell.name),
					600, buttonDim.y - 140, 300, "#ffffff", "#333333", undefined, "center");
			}
			// Render number
			//DrawTextFitKD((i+1) + "", buttonDim.x + 10, buttonDim.y + 13, 25, "#ffffff", KDTextGray0, 18, undefined, 101);


			//let cost = KinkyDungeonGetManaCost(spell) + TextGet("KinkyDungeonManaCost") + comp;
		} else if (KinkyDungeonConsumableChoices[index] || KinkyDungeonWeaponChoices[index] || KinkyDungeonArmorChoices[index]) {
			let item = KinkyDungeonConsumableChoices[index] || KinkyDungeonWeaponChoices[index] || KinkyDungeonArmorChoices[index];
			let arm = KinkyDungeonArmorChoices[index];
			let consumable = KinkyDungeonConsumableChoices[index];
			let wep = KinkyDungeonWeaponChoices[index];
			// Draw the main icon
			let name = item;
			if (arm && KinkyDungeonRestraintVariants[arm]) name = KinkyDungeonRestraintVariants[arm].template;
			if (consumable && KinkyDungeonConsumableVariants[consumable]) name = KinkyDungeonConsumableVariants[consumable].template;
			if (wep && KinkyDungeonWeaponVariants[wep]) name = KinkyDungeonWeaponVariants[wep].template;
			if (KDGetItemPreview({name: item, type: consumable ? Consumable : (arm ? LooseRestraint : Weapon)})) {
				DrawButtonKDEx("UseItem" + index,
					() => {
						let I = index;
						if (spells) {
							if (KinkyDungeonSpells[KinkyDungeonSpellChoices[I]] == selectSpell) {
								KDSendInput("spellRemove", {I:I});
							} else {
								if (KinkyDungeonSpellChoices.includes(KinkyDungeonCurrentPage)) {
									KDSendInput("spellRemove", {I:KinkyDungeonSpellChoices.indexOf(KinkyDungeonCurrentPage)});
								}
								KinkyDungeonClickSpellChoice(I, KinkyDungeonCurrentPage);
							}
						} else {
							if (KinkyDungeonConsumableChoices[I] || KinkyDungeonWeaponChoices[I] || KinkyDungeonArmorChoices[I] || KinkyDungeonSpellChoices[I] >= 0) {
								KDSendInput("spellRemove", {I:I});
							} else {
								KinkyDungeonClickItemChoice(I, selected.item.name);
							}
						}

						return true;
					},
					true,
					buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, "", "rgba(0, 0, 0, 0)",
					KDGetItemPreview({name: item, type: consumable ? Consumable : (arm ? LooseRestraint : Weapon)}).preview, "", false, true,
					undefined, undefined, undefined, {
						hotkey: KDHotkeyToText(KinkyDungeonKeySpell[i]),
						scaleImage: true,
					});

				if (MouseIn(buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h)) {
					DrawTextFitKD(TextGet((arm ? "Restraint" : ("KinkyDungeonInventoryItem")) + name),
						buttonDim.x, buttonDim.y - 140, 300,
						"#ffffff", "#333333", undefined, "center");
				}
				// Render number
				//DrawTextFitKD((i+1) + "", buttonDim.x + 10, buttonDim.y + 13, 25, "#ffffff", KDTextGray0, 18, undefined, 101);
				if (consumable) {
					let con = KinkyDungeonInventoryGetConsumable(consumable);
					if (con) {
						DrawTextFitKD((con.quantity || 0) + 'x',
							buttonDim.x + buttonDim.w-1,
							buttonDim.y + buttonDim.h - 9,
							buttonDim.hsmall, "#ffffff", KDTextGray0, 18, "right");
					}
				}
			}
			if (!KinkyDungeonInventoryGet(item)) {
				let sp = "SpellFail";
				KDDraw(kdcanvas, kdpixisprites, "spellFail" + "SpellCast" + i, KinkyDungeonRootDirectory + "Spells/" + sp + ".png",
					buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, undefined, {
						zIndex: 72,
					});
				//DrawImage(KinkyDungeonRootDirectory + "Spells/" + sp + ".png", buttonDim.x + 2, buttonDim.y + 2,);
			}

		} else if (selected || spells) {

			DrawButtonKDEx("UseItem" + index,
				() => {
					let I = index;
					if (spells) {
						if (KinkyDungeonSpells[KinkyDungeonSpellChoices[I]] == selectSpell) {
							KDSendInput("spellRemove", {I:I});
						} else {
							if (KinkyDungeonSpellChoices.includes(KinkyDungeonCurrentPage)) {
								KDSendInput("spellRemove", {I:KinkyDungeonSpellChoices.indexOf(KinkyDungeonCurrentPage)});
							}
							KinkyDungeonClickSpellChoice(I, KinkyDungeonCurrentPage);
						}
					} else
						KinkyDungeonClickItemChoice(I, selected.item.name);
					return true;
				},
				true,
				buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, "", "rgba(0, 0, 0, 0)",
				"", "", false, true,
				undefined, undefined, undefined, {
					hotkey: KDHotkeyToText(KinkyDungeonKeySpell[i]),
					scaleImage: true,
				});
		}
		let icon = 0;
		let maxSmallIcons = allowOverflow ? 7 : 3;
		// Draw icons for the other pages, if applicable
		for (let page = 1; page < maxSmallIcons && page <= Math.floor((KinkyDungeonSpellChoiceCount - 1) / KinkyDungeonSpellChoiceCountPerPage); page += 1) {
			let pg = KDSpellPage + page;
			if (pg > Math.floor((KinkyDungeonSpellChoiceCount) / KinkyDungeonSpellChoiceCountPerPage)) pg -= 1 + Math.floor((KinkyDungeonSpellChoiceCount - 1) / KinkyDungeonSpellChoiceCountPerPage);

			// Now we have our page...
			let indexPaged = (i + pg * KinkyDungeonSpellChoiceCountPerPage) % (KinkyDungeonSpellChoiceCount);
			let spellPaged = KinkyDungeonSpells[KinkyDungeonSpellChoices[indexPaged]];
			let item = KinkyDungeonConsumableChoices[indexPaged] || KinkyDungeonWeaponChoices[indexPaged] || KinkyDungeonArmorChoices[indexPaged];
			let arm = KinkyDungeonArmorChoices[indexPaged];
			let consumable = KinkyDungeonConsumableChoices[indexPaged];
			//let weapon = KinkyDungeonWeaponChoices[index];
			// Draw the main spell icon
			let buttonDimSmall = {
				x: buttonDim.x-1 + (buttonDim.wsmall) * ((page - 1) % 2),
				y: buttonDim.y-1 - (buttonDim.hsmall) * (1 + Math.floor((page - 1)/2)),
			};
			if (spellPaged) {
				if (spellPaged.type == "passive" && KinkyDungeonSpellChoicesToggle[indexPaged]) {
					FillRectKD(kdcanvas, kdpixisprites, page + "pgspell" + i, {
						Left: buttonDimSmall.x - 1 - 4,
						Top: buttonDimSmall.y - 1 - 4,
						Width: buttonDim.wsmall+2,
						Height: buttonDim.hsmall+2,
						Color: "#dbdbdb",
						zIndex: 70,
					});
					FillRectKD(kdcanvas, kdpixisprites, page + "pgspell2" + i, {
						Left: buttonDimSmall.x - 4,
						Top: buttonDimSmall.y - 4,
						Width: buttonDim.wsmall,
						Height: buttonDim.hsmall,
						Color: "#101010",
						zIndex: 70.1,
					});
				}
				icon += 1;
				DrawButtonKDEx("ASpellHotbar" + indexPaged, () => {
					let I = indexPaged;
					if (spells) {
						if (KinkyDungeonSpells[KinkyDungeonSpellChoices[I]] == selectSpell) {
							KDSendInput("spellRemove", {I:I});
						} else {
							if (KinkyDungeonSpellChoices.includes(KinkyDungeonCurrentPage)) {
								KDSendInput("spellRemove", {I:KinkyDungeonSpellChoices.indexOf(KinkyDungeonCurrentPage)});
							}
							KinkyDungeonClickSpellChoice(I, KinkyDungeonCurrentPage);
						}
					} else {
						if (KinkyDungeonConsumableChoices[I] || KinkyDungeonWeaponChoices[I] || KinkyDungeonArmorChoices[I] || KinkyDungeonSpellChoices[I] >= 0) {
							KDSendInput("spellRemove", {I:I});
						} else {
							KinkyDungeonClickItemChoice(I, selected.item.name);
						}
					}

					return true;
				}, true, buttonDimSmall.x - 4, buttonDimSmall.y - 4, buttonDim.wsmall - 2, buttonDim.hsmall - 2, "",
				KDButtonColor, "", "", false, true, KDButtonColor, undefined, undefined, {zIndex: 50});
				KDDraw(kdcanvas, kdpixisprites, "spellIcon" + icon + "," + indexPaged, KinkyDungeonRootDirectory + "Spells/" + spellPaged.name + ".png"
					,buttonDimSmall.x - 4, buttonDimSmall.y - 4, buttonDim.wsmall, buttonDim.hsmall, undefined, {
						zIndex: 71,
					});
				if ((KinkyDungeoCheckComponents(spellPaged).failed.length > 0 || (spellPaged.components.includes("Verbal") && !KinkyDungeonStatsChoice.get("Incantation") && KinkyDungeonGagTotal() > 0 && !spellPaged.noMiscast))) {
					let sp = "SpellFail";
					if (spellPaged.components.includes("Verbal") && !KinkyDungeonStatsChoice.get("Incantation") && KinkyDungeonGagTotal() < 1) {
						sp = "SpellFailPartial";
					}
					KDDraw(kdcanvas, kdpixisprites, "spellFail" + icon + "," + page + "," + indexPaged, KinkyDungeonRootDirectory + "Spells/" + sp + ".png",
						buttonDimSmall.x - 4, buttonDimSmall.y - 4, buttonDim.wsmall, buttonDim.hsmall, undefined, {
							zIndex: 72,
						});

					//DrawImageEx(KinkyDungeonRootDirectory + "Spells/" + sp + ".png", buttonDim.x + 2 - buttonDim.wsmall * page, buttonDim.y + 2, {
					//Width: buttonDim.wsmall,
					//Height: buttonDim.hsmall,
					//});
				}
			} else if (item) {
				icon += 1;
				let prev = KDGetItemPreview({name: item, type: consumable ? Consumable : (arm ? LooseRestraint : Weapon)});
				if (prev) {
					KDDraw(kdcanvas, kdpixisprites, "spellIcon" + icon + "," + indexPaged,  prev.preview
						,buttonDimSmall.x - 4, buttonDimSmall.y - 4, buttonDim.wsmall, buttonDim.hsmall, undefined, {
							zIndex: 71,
						});
					if (prev.preview2)
						KDDraw(kdcanvas, kdpixisprites, "spellIcon2" + icon + "," + indexPaged,  prev.preview2
							,buttonDimSmall.x - 4, buttonDimSmall.y - 4, buttonDim.wsmall, buttonDim.hsmall, undefined, {
								zIndex: 71,
							});
					DrawButtonKDEx("AHotbarItem" + indexPaged, () => {
						let I = indexPaged;
						if (spells) {
							if (KinkyDungeonSpells[KinkyDungeonSpellChoices[I]] == selectSpell) {
								KDSendInput("spellRemove", {I:I});
							} else {
								if (KinkyDungeonSpellChoices.includes(KinkyDungeonCurrentPage)) {
									KDSendInput("spellRemove", {I:KinkyDungeonSpellChoices.indexOf(KinkyDungeonCurrentPage)});
								}
								KinkyDungeonClickSpellChoice(I, KinkyDungeonCurrentPage);
							}
						} else {
							if (KinkyDungeonConsumableChoices[I] || KinkyDungeonWeaponChoices[I] || KinkyDungeonArmorChoices[I] || KinkyDungeonSpellChoices[I] >= 0) {
								KDSendInput("spellRemove", {I:I});
							} else {
								KinkyDungeonClickItemChoice(I, selected.item.name);
							}
						}

						return true;
					}, true, buttonDimSmall.x - 4, buttonDimSmall.y - 4, buttonDim.wsmall - 2, buttonDim.hsmall - 2, "",
					KDButtonColor, "", "", false, true, KDButtonColor, undefined, undefined, {zIndex: 50});

				}


				if (consumable) {
					let con = KinkyDungeonInventoryGetConsumable(consumable);
					//if (con) {
					DrawTextFitKD((con?.quantity || 0) + "x", buttonDimSmall.x + buttonDim.hsmall - 1, buttonDimSmall.y + buttonDim.hsmall - 6, 50,
						"#ffffff", KDTextGray0, 12, "right");
					//}
				}

				if (!KinkyDungeonInventoryGet(item)) {
					let sp = "SpellFail";
					KDDraw(kdcanvas, kdpixisprites, "spellFail" + icon + "," + page + "," + indexPaged, KinkyDungeonRootDirectory + "Spells/" + sp + ".png",
						buttonDimSmall.x - 4, buttonDimSmall.y - 4, buttonDim.wsmall, buttonDim.hsmall, undefined, {
							zIndex: 72,
						});
				}
			} else if (selected || spells) {
				icon += 1;
				/*KDDraw(kdcanvas, kdpixisprites, "spellIcon" + icon + "," + indexPaged,  prev.preview
					,buttonDimSmall.x - 4, buttonDimSmall.y - 4, buttonDim.wsmall, buttonDim.hsmall, undefined, {
						zIndex: 71,
					});*/
				DrawButtonKDEx("AHotbarItem" + indexPaged, () => {
					let I = indexPaged;
					if (spells) {
						if (KinkyDungeonSpells[KinkyDungeonSpellChoices[I]] == selectSpell) {
							KDSendInput("spellRemove", {I:I});
						} else {
							if (KinkyDungeonSpellChoices.includes(KinkyDungeonCurrentPage)) {
								KDSendInput("spellRemove", {I:KinkyDungeonSpellChoices.indexOf(KinkyDungeonCurrentPage)});
							}
							KinkyDungeonClickSpellChoice(I, KinkyDungeonCurrentPage);
						}
					} else
						KinkyDungeonClickItemChoice(I, selected.item.name);
					return true;
				}, true, buttonDimSmall.x - 4, buttonDimSmall.y - 4, buttonDim.wsmall - 2, buttonDim.hsmall - 2, "",
				KDButtonColor, "", "", false, true, KDButtonColor, undefined, undefined, {zIndex: 50});

			}
		}
	}
}




function KinkyDungeonAttemptQuickRestraint(Name: string): boolean {
	if (KDGameData.SleepTurns > 0 || KDGameData.SlowMoveTurns > 0) return false;
	let item = KinkyDungeonInventoryGetLoose(Name);
	if (!item) return false;

	//KDCloseQuickInv();
	if (KinkyDungeonDrawState == "Inventory") KinkyDungeonDrawState = "Game";
	if (item) {
		KinkyDungeonTargetingSpell = KDBondageSpell;
		KinkyDungeonTargetingSpellItem = item;
		KinkyDungeonTargetingSpellWeapon = null;
	}

	return true;
}
