'use strict';

/*  Ensure this aligns with ModifierEnum.  */
enum KDModifierEnum {
	restraint = 0,
	looserestraint = 0,
	weapon,
	consumable,
};

let PostTranslationRecord: [string, string][] = [];

function addTextKey(Name: string, Text: string) {
	let ct = 0;

	for (let screen of TextAllScreenCache.entries()) {
		if (screen[0].includes("KinkyDungeon")) {
			screen[1].cache[Name] = screen[1].translationcache[Text] || Text;
			PostTranslationRecord.push([Name, Text]);
		} else console.log("ERROR LOADING TEXT!!!");
	}
	if (ct == 0) KDLoadingTextKeys[Name] = Text;
}
function deleteTextKey(Name: string) {
	let ct = 0;
	for (let screen of TextAllScreenCache.entries()) {
		if (screen[0].includes("KinkyDungeon")) {
			delete screen[1].cache[Name];
		} else console.log("ERROR LOADING TEXT!!!");
	}
	if (ct == 0) delete KDLoadingTextKeys[Name];
}

const cloneDeep = (obj: any) =>
	JSON.parse(JSON.stringify(obj));

const defaultRestraint: restraint = {
	name: undefined,
	Group: undefined,
	inventory: true,
	power: 0,
	weight: 0,
	minLevel: 0,
	allFloors: true,

	escapeChance: {
		"Struggle": 10,
		"Cut": 10,
		"Remove": 10
	},

	events: [],
	enemyTags: {},
	playerTags: {},
	shrine: [],
};

/**
 * Creates a restraint using a set of reasonable defaults and adds it to the list of restraints.
 *
 * @param props
 * A list of restraint props to be applied.  At minimum, the "name", "Group" and "Asset" props should be provided.
 *
 * @param [displayName]
 * The name displayed to the user for the restraint.
 *
 * @param [flavorText]
 * Text that describes the "look and feel" of the restraint.
 *
 * @param [functionText]
 * Text that describes how the restraint operates.
 * @returns The created restraint.
 */
function KinkyDungeonCreateRestraint(props: KDRestraintProps, displayName?: string, flavorText?: string, functionText?: string): restraint {
	if (!props.name || !props.Group) {
		throw new Error('name, Group props must be provided.');
	}

	const restraint = ({
		...cloneDeep(defaultRestraint),
		...props
	});

	KinkyDungeonRestraints.push(restraint);
	if (displayName) {
		KinkyDungeonAddRestraintText(props.name, displayName, flavorText, functionText);
	}
	return restraint;
}

let KDCursedVariantsCreated: Record<string, Record<string, number>> = {};

/**
 * This function adds cursed variants to the restraint list
 * @param Restraint - The restraint to have extra variants added onto
 * @param Variants - Names of the cursed variants to apply. Must be from KDCursedVars
 */
function KinkyDungeonAddCursedVariants(Restraint: restraint, Variants: string[]): void {
	for (let v of Variants) {
		if (KDCursedVars[v]) {
			KinkyDungeonCloneRestraint(Restraint.name, Restraint.name+v, KDCursedVars[v].variant(Restraint, Restraint.name+v));
			if (!KDCursedVariantsCreated[Restraint.name]) KDCursedVariantsCreated[Restraint.name] = {};
			KDCursedVariantsCreated[Restraint.name][v] = KDCursedVars[v].level;
		}
	}
}

/**
 * Gets a list of curses applied to the item
 * @param Restraint
 * @param [includeOrig] - includes thje original item
 * @param [minLevel] - for gating curse severity
 * @param [maxLevel] - for gating curse severity
 */
function KinkyDungeonGetCurses(Restraint: string, includeOrig?: boolean, minLevel?: number, maxLevel?: number): string[] {
	if (KDCursedVariantsCreated[Restraint]) {
		let keys = Object.keys(KDCursedVariantsCreated[Restraint]).filter((key) => {
			return (!minLevel || KDCursedVariantsCreated[Restraint][key] >= minLevel)
				&& (!maxLevel || KDCursedVariantsCreated[Restraint][key] < maxLevel);
		}).map((element) => {return Restraint + element;});
		if (includeOrig) keys.push(Restraint);
		return keys;
	}
	return [];
}

/**
 * Gets a list of curses applied to the item
 * @param List
 * @param Type
 * @param [minLevel] - for gating curse severity
 * @param [maxLevel] - for gating curse severity
 */
function KinkyDungeonGetVariantEffectByList(List: string | string[], Type: ModifierEnum, minLevel?: number, maxLevel?: number): string[] {
	let temp = [];
	if (typeof List === "string") {
		List = [List];
	}
	for (let l of List) {
		if (KDModifierEffectVariantList[l]) {
			let keys = KDModifierEffectVariantList[l].filter((key: string) => {
				return (!minLevel || KDModifierEffects[key].types[Type]?.level >= minLevel)
					&& (!maxLevel || KDModifierEffects[key].types[Type]?.level < maxLevel);
			}).map((element: any) => {return element;});
			temp.push(...keys);
		}
	}
	return temp;
}

/**
 * Gets a list of curses applied to the item
 * @param List
 * @param Type
 * @param item
 * @param data - data
 * @param [minLevel] - for gating curse severity
 * @param [maxLevel] - for gating curse severity
 * @param [positive] - for gating severity
 */
function KinkyDungeonGetVariantEffectByListWeighted (
	List:      string | string[],
	Type:      ModifierEnum,
	item:      string,
	data:      KDModifierConditionData,
	minLevel?: number,
	maxLevel?: number,
	positive?: PosNeutNeg
): Record<string, number>
{
	let list = KinkyDungeonGetVariantEffectByList(List, Type, minLevel, maxLevel);
	let ret: Record<string, number> = {};
	for (let obj of list) {
		if (KDModifierEffects[obj].types[Type]?.filter(item, positive, data))
			ret[obj] = KDModifierEffects[obj].types[Type].weight(item, positive, data);
	}
	return ret;
}



/**
 * Gets a list of curses applied to the item
 * @param List
 * @param Type
 * @param [minLevel] - for gating curse severity
 * @param [maxLevel] - for gating curse severity
 */
function KinkyDungeonGetVariantConditionByList(List: string | string[], Type: ModifierEnum, minLevel?: number, maxLevel?: number): string[] {
	let temp = [];
	if (typeof List === "string") {
		List = [List];
	}
	for (let l of List) {
		if (KDModifierConditionVariantList[l]) {
			let keys = KDModifierConditionVariantList[l].filter((key: string) => {
				return (!minLevel || KDModifierConditions[key].types[Type]?.level >= minLevel)
					&& (!maxLevel || KDModifierConditions[key].types[Type]?.level < maxLevel);
			}).map((element: any) => {return element;});
			temp.push(...keys);
		}
	}
	return temp;
}

/**
 * Gets a list of curses applied to the item
 * @param List
 * @param Type
 * @param item
 * @param data - data
 * @param [minLevel] - for gating curse severity
 * @param [maxLevel] - for gating curse severity
 * @param [effect_positive] - for gating severity
 * @param [effect_neutral] - for gating severity
 * @param [effect_negative] - for gating severity
 * @returns {Record<string, number>}
 */
function KinkyDungeonGetVariantConditionByListWeighted (
	List:             string | string[],
	Type:             ModifierEnum,
	item:             string,
	data:             KDModifierConditionData,
	minLevel?:        number,
	maxLevel?:        number,
	effect_positive?: KDModifierEffect[],
	effect_neutral?:  KDModifierEffect[],
	effect_negative?: KDModifierEffect[]
): Record<string, number>
{
	let list = KinkyDungeonGetVariantConditionByList(List, Type, minLevel, maxLevel);
	let ret: Record<string, number> = {};
	for (let obj of list) {
		if (KDModifierConditions[obj].types[Type]?.filter(item, effect_positive, effect_neutral, effect_negative, data))
			ret[obj] = KDModifierConditions[obj].types[Type].weight(item, effect_positive, effect_neutral, effect_negative, data);
	}
	return ret;
}

/**
 * @param ListEffect
 * @param ListCondition
 * @param Type
 * @param item
 * @param minLevel
 * @param maxLevel
 * @param pos
 * @param data - data
 */
function KDGenerateEffectConditionPair (
	ListEffect:    string | string[],
	ListCondition: string | string[],
	Type:          ModifierEnum,
	item:          string,
	minLevel:      number,
	maxLevel:      number,
	pos:           PosNeutNeg,
	data:          KDModifierConditionData
): KinkyDungeonEvent[]
{
	let effect = KDGetByWeight(KinkyDungeonGetVariantEffectByListWeighted(ListEffect, Type, item, data, minLevel, maxLevel, pos));
	let epo = [];
	let enu = [];
	let eng = [];
	if (KDModifierEffects[effect]) {
		if (pos == PosNeutNeg.positive) epo.push(KDModifierEffects[effect]);
		if (pos == PosNeutNeg.neutral)  enu.push(KDModifierEffects[effect]);
		if (pos == PosNeutNeg.negative) eng.push(KDModifierEffects[effect]);
	} else return null;
	if (KDModifierEffects[effect].types[Type]?.onSelect) KDModifierEffects[effect].types[Type].onSelect(item, data);
	let condition = KDGetByWeight(KinkyDungeonGetVariantConditionByListWeighted(ListCondition, Type, item, data, minLevel, maxLevel, epo, enu, eng));
	if (condition)
		return KDModifierConditions[condition].types[Type].events(item, epo, enu, eng, data);
	return null;
}




/**
 * Gets a list of curses applied to the item
 * @param List
 * @param [includeOrig] - includes thje original item
 * @param [minLevel] - for gating curse severity
 * @param [maxLevel] - for gating curse severity
 */
function KinkyDungeonGetHexByList(List: string | string[], includeOrig?: boolean, minLevel?: number, maxLevel?: number): string[] {
	let temp = [];
	if (typeof List === "string") {
		List = [List];
	}
	for (let l of List) {
		if (KDHexVariantList[l]) {
			let keys = KDHexVariantList[l].filter((key: string) => {
				return (!minLevel || KDEventHexModular[key].level >= minLevel)
					&& (!maxLevel || KDEventHexModular[key].level < maxLevel);
			}).map((element: any) => {return element;});
			temp.push(...keys);
		}
	}
	if (includeOrig) temp.push("");
	return temp;
}

/**
 * Gets a list of curses applied to the item
 * @param List
 * @param item
 * @param [includeOrig] - includes thje original item
 * @param [minLevel] - for gating curse severity
 * @param [maxLevel] - for gating curse severity
 * @param [allHex] - for gating curse severity
 */
function KinkyDungeonGetHexByListWeighted(List: string | string[], item: string, includeOrig?: boolean, minLevel?: number, maxLevel?: number, allHex?: string[]): Record<string, number> {
	let list = KinkyDungeonGetHexByList(List, includeOrig, minLevel, maxLevel);
	let ret: Record<string, number> = {};
	for (let obj of list) {
		ret[obj] = KDEventHexModular[obj].weight(item, allHex, {item: item});
	}
	return ret;
}

/**
 * Gets a list of curses applied to the item
 * @param List
 * @param Type
 * @param [includeOrig] - includes thje original item
 * @param [minLevel] - for gating curse severity
 * @param [maxLevel] - for gating curse severity
 */
function KinkyDungeonGetEnchantmentsByList(List: string | string[], Type: ModifierEnum, includeOrig?: boolean, minLevel?: number, maxLevel?: number): string[] {
	let temp = [];
	if (typeof List === "string") {
		List = [List];
	}
	for (let l of List) {
		if (KDEnchantVariantList[l]) {
			let keys = KDEnchantVariantList[l].filter((key: string) => {
				return (!minLevel || KDEventEnchantmentModular[key].types[Type].level >= minLevel)
					&& (!maxLevel || KDEventEnchantmentModular[key].types[Type].level < maxLevel);
			}).map((element: any) => {return element;});
			temp.push(...keys);
		}
	}
	if (includeOrig) temp.push("");
	return temp;
}

/**
 * Gets a list of curses applied to the item
 * @param List
 * @param Type
 * @param item
 * @param [includeOrig] - includes thje original item
 * @param [minLevel] - for gating curse severity
 * @param [maxLevel] - for gating curse severity
 * @param [allEnchant] - for gating curse severity
 */
function KinkyDungeonGetEnchantmentsByListWeighted(List: string | string[], Type: ModifierEnum, item: string, includeOrig?: boolean, minLevel?: number, maxLevel?: number, allEnchant?: string[]): Record<string, number> {
	let list = KinkyDungeonGetEnchantmentsByList(List, Type, includeOrig, minLevel, maxLevel);
	let ret: Record<string, number> = {};
	for (let obj of list) {
		if (KDEventEnchantmentModular[obj].types[Type]?.filter(item, allEnchant, {item: item}))
			ret[obj] = KDEventEnchantmentModular[obj].types[Type].weight(item, allEnchant, {item: item});
	}
	return ret;
}


/**
 * Gets a list of curses applied to the item
 * @param List
 * @param [includeOrig] - includes thje original item
 * @param [minRarity] - for gating curse severity
 * @param [maxRarity] - for gating curse severity
 * @returns {string[]}
 */
function KinkyDungeonGetWeaponsByList(List: string | string[], includeOrig?: boolean, minRarity?: number, maxRarity?: number): string[] {
	let temp = [];
	if (typeof List === "string") {
		List = [List];
	}
	for (let l of List) {
		if (KDWeaponLootList[l]) {
			let keys = Object.keys(KDWeaponLootList[l]).filter((key) => {
				return (!minRarity || KinkyDungeonWeapons[key]?.rarity >= minRarity)
					&& (!maxRarity || KinkyDungeonWeapons[key]?.rarity < maxRarity);
			}).map((element) => {return element;});
			temp.push(...keys);
		}
	}
	if (includeOrig) temp.push("");
	return temp;
}

/**
 * Gets a list of curses applied to the item
 * @param WeaponList
 * @param [includeOrig] - includes thje original item
 * @param [minRarity] - for gating curse severity
 * @param [maxRarity] - for gating curse severity
 * @returns {Record<string, number>}
 */
function KinkyDungeonGetWeaponsByListWeighted(WeaponList: string, includeOrig?: boolean, minRarity?: number, maxRarity?: number): Record<string, number> {
	let list = KinkyDungeonGetWeaponsByList(WeaponList, includeOrig, minRarity, maxRarity);
	let ret: Record<string, number> = {};
	for (let obj of list) {
		if (obj)
			ret[obj] = KDWeaponLootList[WeaponList][obj];
		else ret[obj] = 1;
	}
	return ret;
}


/**
 * Gets a list of curses applied to the item
 * @param List
 * @param [includeOrig] - includes thje original item
 * @param [minLevel] - for gating curse severity
 * @param [maxLevel] - for gating curse severity
 */
function KinkyDungeonGetCurseByList(List: string | string[], includeOrig?: boolean, minLevel?: number, maxLevel?: number): string[] {
	let temp = [];
	if (typeof List === "string") {
		List = [List];
	}
	for (let l of List) {
		if (KDCurseUnlockList[l]) {
			let keys = KDCurseUnlockList[l].filter((key: string) => {
				return (!minLevel || KDCurses[key].level >= minLevel)
					&& (!maxLevel || KDCurses[key].level < maxLevel);
			}).map((element: any) => {return element;});
			temp.push(...keys);
		}
	}
	if (includeOrig) temp.push("");
	return temp;
}

/**
 * Gets a list of curses applied to the item
 * @param {string | string[]} List
 * @param {string} item
 * @param {boolean} [includeOrig] - includes thje original item
 * @param {number} [minLevel] - for gating curse severity
 * @param {number} [maxLevel] - for gating curse severity
 * @returns {Record<string, number>}
 */
function KinkyDungeonGetCurseByListWeighted(List: string | string[], item: string, includeOrig?: boolean, minLevel?: number, maxLevel?: number): Record<string, number> {
	let list = KinkyDungeonGetCurseByList(List, includeOrig, minLevel, maxLevel);
	let ret: Record<string, number> = {};
	for (let obj of list) {
		ret[obj] = KDCurses[obj].weight(item);
	}
	return ret;
}


/**
 * Creates a restraint using an existing restraint as a base and adds it to the list of restraints.
 *
 * @param clonedName
 * The name of the restraint to be cloned.
 *
 * @param newName
 * The name of the newly created restraint.
 *
 * @param props
 * A list of restraint props to be applied.  Anything that isn't supplied with be identical to the base object.
 *
 * @returns The created restraint.
 */
function KinkyDungeonCloneRestraint(clonedName: string, newName: string, props: object): restraint {
	const existingRestraint = KinkyDungeonRestraints.find(restraint => restraint.name === clonedName);

	if (!existingRestraint) {
		throw new Error(`No restraint named ${clonedName}.`);
	}

	const newRestraint = ({
		...cloneDeep(existingRestraint),
		name: newName
	});

	Object.assign(newRestraint, props);

	KinkyDungeonRestraints.push(newRestraint);

	return newRestraint;
}

/**
 * Registers text for a named restraint.
 *
 * @param name
 * The name of the restraint used by the system.
 *
 * @param displayName
 * The name displayed to the user for the restraint.
 *
 * @param flavorText
 * Text that describes the "look and feel" of the restraint.
 *
 * @param functionText
 * Text that describes how the restraint operates.
 */
function KinkyDungeonAddRestraintText(name: string, displayName: string, flavorText: string, functionText: string): void {
	const baseKey = `Restraint${name}`;

	addTextKey(baseKey, displayName);
	addTextKey(`${baseKey}Desc`, flavorText);
	addTextKey(`${baseKey}Desc2`, functionText);
}

/**
 * Registers text for a named restraint.
 *
 * @param restraint - The name of the restraint used by the system.
 * @param newRestraint - The name of the new restraint used by the system.
 */
function KinkyDungeonDupeRestraintText(restraint: string, newRestraint: string): void {
	const oldKey = `Restraint${restraint}`;
	const baseKey = `Restraint${newRestraint}`;

	addTextKey(baseKey, TextGetKD(oldKey));
	addTextKey(`${baseKey}Desc`, TextGetKD(`${oldKey}Desc`));
	addTextKey(`${baseKey}Desc2`, TextGetKD(`${oldKey}Desc2`));
}


/**
 * Returns true if the player has a perk
 */
function HasPerk(perk: string): boolean {
	return KinkyDungeonStatsChoice.has(perk);
}

/**
 * Gets the player entity (i.e. the NPC/special object hybrid that represents the player on the map)
 */
function KDPlayer(): entity {
	return KinkyDungeonPlayerEntity;
}
