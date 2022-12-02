'use strict';

function addTextKey(Name, Text) {
	let ct = 0;
	for (let screen of TextAllScreenCache.entries()) {
		if (screen[0].includes("KinkyDungeon")) {
			screen[1].cache[Name] = Text;
		} else console.log("ERROR LOADING TEXT!!!");
	}
	if (ct == 0) KDLoadingTextKeys[Name] = Text;
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
	if (!props.name || !props.Group || !props.Asset) {
		throw new Error('name, Group and Asset props must be provided.');
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

