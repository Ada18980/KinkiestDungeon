"use strict";

/**
 * onApply: occurs when applied
 * condition: required to remove it
 * remove: happens when removing
 * events: these events are added to the restraint
 * @type {Record<string, KDCursedDef>} */
let KDCurses = {
	"GhostLock" : {
		powerMult: 5,
		lock: true,
		condition: (item) => {
			return KinkyDungeonItemCount("Ectoplasm") >= 25;
		},
		remove: (item, host) => {
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.Ectoplasm, -25);
		}
	},
	"DollLock" : {
		powerMult: 4,
		lock: true,
		condition: (item) => {
			return KinkyDungeonItemCount("DollID") >= 8;
		},
		remove: (item, host) => {
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.DollID, -8);
		}
	},
	"MistressKey": {
		powerMult: 4,
		lock: true,
		noShrine: true,
		customIcon_RemoveFailure: "Locks/Gold",
		condition: (item) => {
			return KinkyDungeonItemCount("MistressKey") > 0;
		},
		remove: (item, host) => {
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.MistressKey, -1);
		}
	},
	"5Keys" : {
		lock: true,
		condition: (item) => {
			return KinkyDungeonRedKeys >= 5;
		},
		remove: (item, host) => {
			KinkyDungeonRedKeys -= 5;
		}
	},
	"Key" : {
		powerMult: 2.1,
		lock: true,
		condition: (item) => {
			return KinkyDungeonRedKeys >= 1;
		},
		remove: (item, host) => {
			KinkyDungeonRedKeys -= 1;
		}
	},
	"BlueLock" : {
		lock: true,
		condition: (item) => {
			return KinkyDungeonBlueKeys >= 1;
		},
		remove: (item, host) => {
			KinkyDungeonBlueKeys -= 1;
		}
	},
	"TakeDamageFire" : {
		powerMult: 2.2,
		condition: (item) => {return false;},
		remove: (item, host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 3, damage: "fire", trigger: "beforePlayerDamage", kind: "CurseMelt"},
			{type: "RemoveOnDmg", power: 1, count: 3, damage: "crush", trigger: "beforePlayerDamage", kind: "CurseMelt"},
		],
	},
	"TakeDamageIce" : {
		powerMult: 2.2,
		condition: (item) => {return false;},
		remove: (item, host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 4, damage: "ice", trigger: "beforePlayerDamage", kind: "CurseExtinguish"},
			{type: "RemoveOnDmg", power: 1, count: 4, damage: "acid", trigger: "beforePlayerDamage", kind: "CurseExtinguish"},
			{type: "RemoveOnDmg", power: 1, count: 4, damage: "stun", trigger: "beforePlayerDamage", kind: "CurseExtinguish"},
			{type: "RemoveOnBuffName", trigger: "tick", kind: "Drenched"},
			{type: "RemoveOnBuffName", trigger: "tick", kind: "Chilled"},
		],
	},
	"TakeDamageElectric" : {
		powerMult: 2.2,
		condition: (item) => {return false;},
		remove: (item, host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 2, damage: "electric", trigger: "beforePlayerDamage", kind: "CurseShock"}
		],
	},
	"TakeDamageGlue" : {
		powerMult: 2.2,
		condition: (item) => {return false;},
		remove: (item, host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 5, damage: "glue", trigger: "beforePlayerDamage", kind: "CurseGlue"}
		],
	},
	"TakeDamageChain" : {
		powerMult: 2.2,
		condition: (item) => {return false;},
		remove: (item, host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 5, damage: "chain", trigger: "beforePlayerDamage", kind: "CurseChain"}
		],
	},
	"Will" : {
		powerMult: 2,
		onApply: (item, host) => {
			KinkyDungeonChangeWill(-1);
		},
		condition: (item) => {
			return KinkyDungeonStatWill >= KinkyDungeonStatWillMax*0.99;
		},
		remove: (item, host) => {
			// For free!
		}
	},
	"Mana" : {
		powerMult: 2,
		condition: (item) => {
			return KinkyDungeonStatMana + KinkyDungeonStatManaPool >= 20;
		},
		remove: (item, host) => {
			KinkyDungeonChangeMana(-20, false, 0, true, true);
		}
	},
	"ShrineWill" : {
		powerMult: 2.5,
		condition: (item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Will";
			});
		}, remove: (item, host) => {/* For free! */}},
	"ShrineElements" : {
		powerMult: 2.5,
		condition: (item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Elements";
			});
		}, remove: (item, host) => {/* For free! */}},
	"ShrineConjure" : {
		powerMult: 2.5,
		condition: (item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Conjure";
			});
		}, remove: (item, host) => {/* For free! */}},
	"ShrineIllusion" : {
		powerMult: 2.5,
		condition: (item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Illusion";
			});
		}, remove: (item, host) => {/* For free! */}},
};

let KDEventCurseModular = {
	"Light": [
		{type: "ItemLight", trigger: "getLights", power: 3.5, color: "#ffff55", inheritLinked: true},
		{trigger: "tick", type: "sneakBuff", power: -1.0, inheritLinked: true},
		{trigger: "drawSGTooltip", type: "curseInfo", msg: "Illumination", color: "#ff5555", inheritLinked: true},
	],
	"Attraction": [
		{type: "CurseAttraction", trigger: "calcPlayChance", power: 0.5, inheritLinked: true},
		{trigger: "drawSGTooltip", type: "curseInfo", msg: "Attraction", color: "#ff5555", inheritLinked: true}
	],
	"Sensitivity": [
		{type: "CurseSensitivity", trigger: "calcOrgThresh", power: 0.5, inheritLinked: true},
		{trigger: "drawSGTooltip", type: "curseInfo", msg: "Sensitivity", color: "#ff5555", inheritLinked: true}
	],
	"Submission": [
		{type: "CurseSubmission", trigger: "orgasm", power: 10, inheritLinked: true},
		{trigger: "drawSGTooltip", type: "curseInfo", msg: "Submission", color: "#ff5555", inheritLinked: true}
	],
	"Distraction": [
		{type: "multDistractionPos", trigger: "changeDistraction", power: 1.5, inheritLinked: true},
		{trigger: "drawSGTooltip", type: "curseInfo", msg: "Distraction", color: "#ff5555", inheritLinked: true}
	],
	"Breathlessness": [
		{type: "multStaminaPos", trigger: "changeStamina", power: 0.6, inheritLinked: true},
		{trigger: "drawSGTooltip", type: "curseInfo", msg: "Breathlessness", color: "#ff5555", inheritLinked: true}
	],
	"Futility": [
		{type: "multWillPos", trigger: "changeWill", power: 0.25, inheritLinked: true},
		{trigger: "drawSGTooltip", type: "curseInfo", msg: "Futile", color: "#ff5555", inheritLinked: true}
	],
	"Tickle": [
		{trigger: "tick", type: "tickleDrain", power: -0.02, inheritLinked: true},
		{trigger: "drawSGTooltip", type: "curseInfo", msg: "Tickle", color: "#ff5555", inheritLinked: true}
	],
	"Punish": [
		{trigger: "playerAttack", type: "cursePunish", chance: 1, damage: "souldrain", power: 1, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerCurse", inheritLinked: true},
		{trigger: "playerCast", type: "cursePunish", chance: 1, damage: "souldrain", power: 1, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerCurse", inheritLinked: true},
		{trigger: "drawSGTooltip", type: "curseInfo", msg: "Punish", color: "#ff5555", inheritLinked: true}
	],
};

/**
 * TODO
curseInfoAnimation,"Curse of Animation: Causes loose restraints to animate and attack you!"
curseInfoSensitivity,"Curse of Sensitivity: Makes it easier to lose control of yourself."
 */

/** Cursed variants of restraints
 * @type {Record<string, KDCursedVar>}
 */
let KDCursedVars = {
	"Light": {
		level: 1,
		variant: (restraint, newRestraintName) => {
			return KDAddEventVariant(restraint, newRestraintName, [
				...KDEventCurseModular.Light
			]);}},
	"Attraction": {
		level: 1,
		variant: (restraint, newRestraintName) => {
			return KDAddEventVariant(restraint, newRestraintName, [
				...KDEventCurseModular.Attraction
			]);}},
	"Sensitivity": {
		level: 1,
		variant: (restraint, newRestraintName) => {
			return KDAddEventVariant(restraint, newRestraintName, [
				...KDEventCurseModular.Sensitivity
			]);}},
	"Submission": {
		level: 1,
		variant: (restraint, newRestraintName) => {
			return KDAddEventVariant(restraint, newRestraintName, [
				...KDEventCurseModular.Submission
			]);}},
	"Distraction": {
		level: 1,
		variant: (restraint, newRestraintName) => {
			return KDAddEventVariant(restraint, newRestraintName, [
				...KDEventCurseModular.Distraction
			]);}},
	"Breathlessness": {
		level: 1,
		variant: (restraint, newRestraintName) => {
			return KDAddEventVariant(restraint, newRestraintName, [
				...KDEventCurseModular.Breathlessness
			]);}},
	"Futility": {
		level: 1,
		variant: (restraint, newRestraintName) => {
			return KDAddEventVariant(restraint, newRestraintName, [
				...KDEventCurseModular.Futility
			]);}},
	"Tickle": {
		level: 1,
		variant: (restraint, newRestraintName) => {
			return KDAddEventVariant(restraint, newRestraintName, [
				...KDEventCurseModular.Tickle
			]);
		}
	},
	"Punish": {
		level: 1,
		variant: (restraint, newRestraintName) => {
			return KDAddEventVariant(restraint, newRestraintName, [
				...KDEventCurseModular.Punish
			]);
		}
	},
};


/**
 * Contains a list of curse variant types
 * Can be modified dynamically so mods can add basic curses
 */
let KDCurseVariantList = {
	"Basic": [
		"Tickle",
		"Punish",
		"Light",
		"Attraction",
		"Submission",
		"Distraction",
		"Breathlessness",
		"Futility",
		"Sensitivity",
	],
};
/**
 * Unlockcurse list. This is always referenced dynamically when the restraint is picked up
 */
let KDCurseUnlockList = {
	"Basic": [
		"ShrineWill",
		"ShrineIllusion",
		"ShrineElements",
		"ShrineConjure",
		"BlueLock",
		"Will",
		"TakeDamageFire",
		"TakeDamageElectric",
		"TakeDamageIce",
		"TakeDamageGlue",
		"TakeDamageChain",
		"Mana",
	],
};

/**
 * Bestows an event-type curse onto an item by adding events
 * @param {item} item
 * @param {KinkyDungeonEvent[]} ev
 */
function KDBestowCurse(item, ev) {
	// Sanitize to avoid duped pointer
	ev = JSON.parse(JSON.stringify(ev));
	if (!item.events) item.events = [];
	// Add curse to events
	for (let e of Object.values(ev)) {
		e.curse = true;
		item.events.push(e);
	}
}

/**
 *
 * @param {restraint} restraint
 * @param {string} newRestraintName
 * @param {KinkyDungeonEvent[]} ev
 * @param {number} power
 * @param {string} lock
 * @param {Record<string, number>} enemyTags
 * @returns {any}
 */
function KDAddEventVariant(restraint, newRestraintName, ev, power = 4, lock = "Purple", enemyTags = {basicCurse: 10}) {
	// Sanitize to avoid duped pointer
	ev = JSON.parse(JSON.stringify(ev));
	KinkyDungeonDupeRestraintText(restraint.name, newRestraintName);
	/** @type {KinkyDungeonEvent[]} */
	let events = ev.concat(restraint.events);
	let escapeChance = {
		Struggle: Math.min(restraint.escapeChance.Struggle, 0-.2),
		Cut: Math.min(restraint.escapeChance.Cut || 1.0, -0.1),
		Pick: Math.min(restraint.escapeChance.Pick || 1.0, 0.1),
	};
	return {
		protectionCursed: true,
		escapeChance: escapeChance,
		DefaultLock: lock,
		HideDefaultLock: true,
		magic: true,
		events: events,
		power: power,
		good: false,
		enemyTags: Object.assign({}, enemyTags),
		shrine: restraint.shrine?.concat(["Cursed"]),
		inventoryAsSelf: restraint.inventoryAsSelf || restraint.inventoryAs || restraint.name,
		displayPower: restraint.displayPower || restraint.power,
	};
}

function KinkyDungeonCurseInfo(item, Curse) {
	if (Curse == "MistressKey" && KinkyDungeonItemCount("MistressKey")) {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseInfoMistressKeyHave").replace("KeyAmount", "" + KinkyDungeonItemCount("MistressKey")), "White", 2);
	} else {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseInfo" + Curse), "White", 2);
	}
}

function KinkyDungeonCurseStruggle(item, Curse) {
	if (Curse == "MistressKey") {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseStruggle" + Curse + item.name), "White", 2);
	} else KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseStruggle" + Curse), "White", 2);

}

function KinkyDungeonCurseAvailable(item, Curse) {
	if (KDCurses[Curse] && KDCurses[Curse].condition(item)) {
		return true;
	}
	return false;
}

/**
 *
 * @param {string} group
 * @param {number} index
 * @param {string} Curse
 */
function KinkyDungeonCurseUnlock(group, index, Curse) {
	let unlock = true;
	let keep = false;
	let restraint = KinkyDungeonGetRestraintItem(group);
	let host = restraint;
	if (index) {
		let surfaceItems = KDDynamicLinkListSurface(restraint);
		if (surfaceItems[index]) {
			host = surfaceItems[index - 1];
			restraint = surfaceItems[index];
		}
		else console.log("Error! Please report the item combination and screenshot to Ada!");
	}

	if (KDCurses[Curse]) {
		KDCurses[Curse].remove(restraint, host);
	}

	if (unlock) {
		KDSendStatus('escape', KinkyDungeonGetRestraintItem(group).name, "Curse");
		KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonCurseUnlock" + Curse), "#99FF99", 2);
		if (restraint != host) {
			KinkyDungeonRemoveDynamicRestraint(host, keep, undefined, KinkyDungeonPlayerEntity);
		} else {
			KinkyDungeonRemoveRestraint(group, keep, undefined, undefined, undefined, undefined, KinkyDungeonPlayerEntity);
		}
	}
}

/**
 * @param {string} curse
 * @returns {number}
 */
function KDCursePower(curse) {
	if (KDCurses[curse]) {
		return KDCurses[curse].powerMult || 3;
	}
	return 1;
}