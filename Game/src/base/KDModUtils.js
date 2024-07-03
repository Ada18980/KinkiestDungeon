'use strict';

/**
 * @enum {PosNeutNeg}
 */
let KDPosNeutNeg = {
	positive:1,
	neutral:0,
	negative:-1,
};

/**
 * @enum {ModifierEnum}
 */
let KDModifierEnum = {
	restraint:0,
	looserestraint:0,
	weapon:1,
	consumable:2,
};

function addTextKey(Name, Text) {
	let ct = 0;
	for (let screen of TextAllScreenCache.entries()) {
		if (screen[0].includes("KinkyDungeon")) {
			screen[1].cache[Name] = screen[1].translationcache[Text] || Text;
		} else console.log("ERROR LOADING TEXT!!!");
	}
	if (ct == 0) KDLoadingTextKeys[Name] = Text;
}
function deleteTextKey(Name) {
	let ct = 0;
	for (let screen of TextAllScreenCache.entries()) {
		if (screen[0].includes("KinkyDungeon")) {
			delete screen[1].cache[Name];
		} else console.log("ERROR LOADING TEXT!!!");
	}
	if (ct == 0) delete KDLoadingTextKeys[Name];
}

const cloneDeep = (obj) =>
	JSON.parse(JSON.stringify(obj));

const defaultRestraint = {
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
	enemyTags: [],
	playerTags: [],
	shrine: [],
};

/**
 * Creates a restraint using a set of reasonable defaults and adds it to the list of restraints.
 *
 * @param {KDRestraintProps} props
 * A list of restraint props to be applied.  At minimum, the "name", "Group" and "Asset" props should be provided.
 *
 * @param {string} [displayName]
 * The name displayed to the user for the restraint.
 *
 * @param {string} [flavorText]
 * Text that describes the "look and feel" of the restraint.
 *
 * @param {string} [functionText]
 * Text that describes how the restraint operates.
 * @returns The created restraint.
 */
function KinkyDungeonCreateRestraint(props, displayName, flavorText, functionText) {
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

/**
 * @type {Record<string, Record<string, number>>}
 */
let KDCursedVariantsCreated = {
};

/**
 * This function adds cursed variants to the restraint list
 * @param {restraint} Restraint - The restraint to have extra variants added onto
 * @param {string[]} Variants - Names of the cursed variants to apply. Must be from KDCursedVars
 */
function KinkyDungeonAddCursedVariants(Restraint, Variants) {
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
 * @param {string} Restraint
 * @param {boolean} [includeOrig] - includes thje original item
 * @param {number} [minLevel] - for gating curse severity
 * @param {number} [maxLevel] - for gating curse severity
 * @returns {string[]}
 */
function KinkyDungeonGetCurses(Restraint, includeOrig, minLevel, maxLevel) {
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
 * @param {string | string[]} List
 * @param {ModifierEnum} Type
 * @param {number} [minLevel] - for gating curse severity
 * @param {number} [maxLevel] - for gating curse severity
 * @returns {string[]}
 */
function KinkyDungeonGetVariantEffectByList(List, Type, minLevel, maxLevel) {
	let temp = [];
	if (typeof List === "string") {
		List = [List];
	}
	for (let l of List) {
		if (KDModifierEffectVariantList[l]) {
			let keys = KDModifierEffectVariantList[l].filter((key) => {
				return (!minLevel || KDModifierEffects[key].types[Type]?.level >= minLevel)
					&& (!maxLevel || KDModifierEffects[key].types[Type]?.level < maxLevel);
			}).map((element) => {return element;});
			temp.push(...keys);
		}
	}
	return temp;
}

/**
 * Gets a list of curses applied to the item
 * @param {string | string[]} List
 * @param {string} item
 * @param {ModifierEnum} Type
 * @param {KDModifierConditionData} data - data
 * @param {number} [minLevel] - for gating curse severity
 * @param {number} [maxLevel] - for gating curse severity
 * @param {PosNeutNeg} [positive] - for gating severity
 * @returns {Record<string, number>}
 */
function KinkyDungeonGetVariantEffectByListWeighted(List, Type, item, data, minLevel, maxLevel, positive) {
	let list = KinkyDungeonGetVariantEffectByList(List, Type, minLevel, maxLevel);
	/** @type {Record<string, number>} */
	let ret = {};
	for (let obj of list) {
		if (KDModifierEffects[obj].types[Type]?.filter(item, positive, data))
			ret[obj] = KDModifierEffects[obj].types[Type].weight(item, positive, data);
	}
	return ret;
}



/**
 * Gets a list of curses applied to the item
 * @param {string | string[]} List
 * @param {ModifierEnum} Type
 * @param {number} [minLevel] - for gating curse severity
 * @param {number} [maxLevel] - for gating curse severity
 * @returns {string[]}
 */
function KinkyDungeonGetVariantConditionByList(List, Type, minLevel, maxLevel) {
	let temp = [];
	if (typeof List === "string") {
		List = [List];
	}
	for (let l of List) {
		if (KDModifierConditionVariantList[l]) {
			let keys = KDModifierConditionVariantList[l].filter((key) => {
				return (!minLevel || KDModifierConditions[key].types[Type]?.level >= minLevel)
					&& (!maxLevel || KDModifierConditions[key].types[Type]?.level < maxLevel);
			}).map((element) => {return element;});
			temp.push(...keys);
		}
	}
	return temp;
}

/**
 * Gets a list of curses applied to the item
 * @param {string | string[]} List
 * @param {string} item
 * @param {ModifierEnum} Type
 * @param {KDModifierConditionData} data - data
 * @param {number} [minLevel] - for gating curse severity
 * @param {number} [maxLevel] - for gating curse severity
 * @param {KDModifierEffect[]} [effect_positive] - for gating severity
 * @param {KDModifierEffect[]} [effect_neutral] - for gating severity
 * @param {KDModifierEffect[]} [effect_negative] - for gating severity
 * @returns {Record<string, number>}
 */
function KinkyDungeonGetVariantConditionByListWeighted(List, Type, item, data, minLevel, maxLevel, effect_positive, effect_neutral, effect_negative) {
	let list = KinkyDungeonGetVariantConditionByList(List, Type, minLevel, maxLevel);
	/** @type {Record<string, number>} */
	let ret = {};
	for (let obj of list) {
		if (KDModifierConditions[obj].types[Type]?.filter(item, effect_positive, effect_neutral, effect_negative, data))
			ret[obj] = KDModifierConditions[obj].types[Type].weight(item, effect_positive, effect_neutral, effect_negative, data);
	}
	return ret;
}

/**
 *
 * @param {string | string[]} ListEffect
 * @param {string | string[]} ListCondition
 * @param {string} item
 * @param {ModifierEnum} Type
 * @param {number} minLevel
 * @param {number} maxLevel
 * @param {PosNeutNeg} pos
 * @param {KDModifierConditionData} data - data
 */
function KDGenerateEffectConditionPair(ListEffect, ListCondition, Type, item, minLevel, maxLevel, pos, data) {
	let effect = KDGetByWeight(KinkyDungeonGetVariantEffectByListWeighted(ListEffect, Type, item, data, minLevel, maxLevel, pos));
	let epo = [];
	let enu = [];
	let eng = [];
	if (KDModifierEffects[effect]) {
		if (pos == KDPosNeutNeg.positive) epo.push(KDModifierEffects[effect]);
		if (pos == KDPosNeutNeg.neutral) enu.push(KDModifierEffects[effect]);
		if (pos == KDPosNeutNeg.negative) eng.push(KDModifierEffects[effect]);
	} else return null;
	if (KDModifierEffects[effect].types[Type]?.onSelect) KDModifierEffects[effect].types[Type].onSelect(item, data);
	let condition = KDGetByWeight(KinkyDungeonGetVariantConditionByListWeighted(ListCondition, Type, item, data, minLevel, maxLevel, epo, enu, eng));
	if (condition)
		return KDModifierConditions[condition].types[Type].events(item, epo, enu, eng, data);
	return null;
}




/**
 * Gets a list of curses applied to the item
 * @param {string | string[]} List
 * @param {boolean} [includeOrig] - includes thje original item
 * @param {number} [minLevel] - for gating curse severity
 * @param {number} [maxLevel] - for gating curse severity
 * @returns {string[]}
 */
function KinkyDungeonGetHexByList(List, includeOrig, minLevel, maxLevel) {
	let temp = [];
	if (typeof List === "string") {
		List = [List];
	}
	for (let l of List) {
		if (KDHexVariantList[l]) {
			let keys = KDHexVariantList[l].filter((key) => {
				return (!minLevel || KDEventHexModular[key].level >= minLevel)
					&& (!maxLevel || KDEventHexModular[key].level < maxLevel);
			}).map((element) => {return element;});
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
 * @param {string[]} [allHex] - for gating curse severity
 * @returns {Record<string, number>}
 */
function KinkyDungeonGetHexByListWeighted(List, item, includeOrig, minLevel, maxLevel, allHex) {
	let list = KinkyDungeonGetHexByList(List, includeOrig, minLevel, maxLevel);
	/** @type {Record<string, number>} */
	let ret = {};
	for (let obj of list) {
		ret[obj] = KDEventHexModular[obj].weight(item, allHex, {item: item});
	}
	return ret;
}

/**
 * Gets a list of curses applied to the item
 * @param {string | string[]} List
 * @param {ModifierEnum} Type
 * @param {boolean} [includeOrig] - includes thje original item
 * @param {number} [minLevel] - for gating curse severity
 * @param {number} [maxLevel] - for gating curse severity
 * @returns {string[]}
 */
function KinkyDungeonGetEnchantmentsByList(List, Type, includeOrig, minLevel, maxLevel) {
	let temp = [];
	if (typeof List === "string") {
		List = [List];
	}
	for (let l of List) {
		if (KDEnchantVariantList[l]) {
			let keys = KDEnchantVariantList[l].filter((key) => {
				return (!minLevel || KDEventEnchantmentModular[key].types[Type].level >= minLevel)
					&& (!maxLevel || KDEventEnchantmentModular[key].types[Type].level < maxLevel);
			}).map((element) => {return element;});
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
 * @param {ModifierEnum} Type
 * @param {boolean} [includeOrig] - includes thje original item
 * @param {number} [minLevel] - for gating curse severity
 * @param {number} [maxLevel] - for gating curse severity
 * @param {string[]} [allEnchant] - for gating curse severity
 * @returns {Record<string, number>}
 */
function KinkyDungeonGetEnchantmentsByListWeighted(List, Type, item, includeOrig, minLevel, maxLevel, allEnchant) {
	let list = KinkyDungeonGetEnchantmentsByList(List, Type, includeOrig, minLevel, maxLevel);
	/** @type {Record<string, number>} */
	let ret = {};
	for (let obj of list) {
		if (KDEventEnchantmentModular[obj].types[Type]?.filter(item, allEnchant, {item: item}))
			ret[obj] = KDEventEnchantmentModular[obj].types[Type].weight(item, allEnchant, {item: item});
	}
	return ret;
}


/**
 * Gets a list of curses applied to the item
 * @param {string | string[]} List
 * @param {boolean} [includeOrig] - includes thje original item
 * @param {number} [minRarity] - for gating curse severity
 * @param {number} [maxRarity] - for gating curse severity
 * @returns {string[]}
 */
function KinkyDungeonGetWeaponsByList(List, includeOrig, minRarity, maxRarity) {
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
 * @param {string} WeaponList
 * @param {boolean} [includeOrig] - includes thje original item
 * @param {number} [minRarity] - for gating curse severity
 * @param {number} [maxRarity] - for gating curse severity
 * @returns {Record<string, number>}
 */
function KinkyDungeonGetWeaponsByListWeighted(WeaponList, includeOrig, minRarity, maxRarity) {
	let list = KinkyDungeonGetWeaponsByList(WeaponList, includeOrig, minRarity, maxRarity);
	/** @type {Record<string, number>} */
	let ret = {};
	for (let obj of list) {
		if (obj)
			ret[obj] = KDWeaponLootList[WeaponList][obj];
		else ret[obj] = 1;
	}
	return ret;
}


/**
 * Gets a list of curses applied to the item
 * @param {string | string[]} List
 * @param {boolean} [includeOrig] - includes thje original item
 * @param {number} [minLevel] - for gating curse severity
 * @param {number} [maxLevel] - for gating curse severity
 * @returns {string[]}
 */
function KinkyDungeonGetCurseByList(List, includeOrig, minLevel, maxLevel) {
	let temp = [];
	if (typeof List === "string") {
		List = [List];
	}
	for (let l of List) {
		if (KDCurseUnlockList[l]) {
			let keys = KDCurseUnlockList[l].filter((key) => {
				return (!minLevel || KDCurses[key].level >= minLevel)
					&& (!maxLevel || KDCurses[key].level < maxLevel);
			}).map((element) => {return element;});
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
function KinkyDungeonGetCurseByListWeighted(List, item, includeOrig, minLevel, maxLevel) {
	let list = KinkyDungeonGetCurseByList(List, includeOrig, minLevel, maxLevel);
	/** @type {Record<string, number>} */
	let ret = {};
	for (let obj of list) {
		ret[obj] = KDCurses[obj].weight(item);
	}
	return ret;
}


/**
 * Creates a restraint using an existing restraint as a base and adds it to the list of restraints.
 *
 * @param {string} clonedName
 * The name of the restraint to be cloned.
 *
 * @param {string} newName
 * The name of the newly created restraint.
 *
 * @param {object} props
 * A list of restraint props to be applied.  Anything that isn't supplied with be identical to the base object.
 *
 * @returns The created restraint.
 */
function KinkyDungeonCloneRestraint(clonedName, newName, props) {
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
 * @param {string} name
 * The name of the restraint used by the system.
 *
 * @param {string} displayName
 * The name displayed to the user for the restraint.
 *
 * @param {string} flavorText
 * Text that describes the "look and feel" of the restraint.
 *
 * @param {string} functionText
 * Text that describes how the restraint operates.
 */
function KinkyDungeonAddRestraintText(name, displayName, flavorText, functionText) {
	const baseKey = `Restraint${name}`;

	addTextKey(baseKey, displayName);
	addTextKey(`${baseKey}Desc`, flavorText);
	addTextKey(`${baseKey}Desc2`, functionText);
}

/**
 * Registers text for a named restraint.
 *
 * @param {string} restraint - The name of the restraint used by the system.
 * @param {string} newRestraint - The name of the new restraint used by the system.
 *
 */
function KinkyDungeonDupeRestraintText(restraint, newRestraint) {
	const oldKey = `Restraint${restraint}`;
	const baseKey = `Restraint${newRestraint}`;

	addTextKey(baseKey, TextGetKD(oldKey));
	addTextKey(`${baseKey}Desc`, TextGetKD(`${oldKey}Desc`));
	addTextKey(`${baseKey}Desc2`, TextGetKD(`${oldKey}Desc2`));
}


/**
 * Returns true if the player has a perk
 * @param {string} perk
 * @returns {boolean}
 */
function HasPerk(perk) {
	return KinkyDungeonStatsChoice.has(perk);
}

/**
 * Gets the player entity (i.e. the NPC/special object hybrid that represents the player on the map)
 * @returns {entity}
 */
function KDPlayer() {
	return KinkyDungeonPlayerEntity;
}