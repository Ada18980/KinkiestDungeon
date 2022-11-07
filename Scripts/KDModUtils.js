'use strict';

function addTextKey(Name, Text) {
	for (let screen of TextAllScreenCache.entries())
		if (screen[0].includes("KinkyDungeon")) {
			screen[1].cache[Name] = Text;
		} else console.log("ERROR LOADING TEXT!!!");
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
 * @param {object} props
 * A list of restraint props to be applied.  At minimum, the "name", "Group" and "Asset" props should be provided.
 *
 * @returns The created restraint.
 */
function KinkyDungeonCreateRestraint(props) {
	if (!props.name || !props.Group || !props.Asset) {
		throw new Error('name, Group and Asset props must be provided.');
	}

	const restraint = ({
		...cloneDeep(defaultRestraint),
		...props
	});

	KinkyDungeonRestraints.push(restraint);
	return restraint;
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