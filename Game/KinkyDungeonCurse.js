"use strict";



/**
 * Unlockcurse list. This is always referenced dynamically when the restraint is picked up
 */
let KDCurseUnlockList = {
	"Common": [
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
	"CursedCollar": [
		"CursedDamage",
	],
	"CursedCollar2": [
		"CursedDamage",
	],
};

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
		level: 10,
		weight: (item) => {
			return 1;
		},
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
		level: 15,
		weight: (item) => {
			return 1;
		},
		condition: (item) => {
			return KinkyDungeonItemCount("DollID") >= 8;
		},
		remove: (item, host) => {
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.DollID, -8);
		}
	},
	"CursedCollar": {
		powerMult: 10,
		lock: true,
		noShrine: true,
		activatecurse: true,
		level: 30,
		weight: (item) => {
			return 1;
		},
		condition: (item) => {
			for (let inv of KinkyDungeonAllRestraintDynamic()) {
				if (KDGetCurse(inv.item) == "CursedDamage") return false;
			}
			return true;
		},
		remove: (item, host) => {
			//KinkyDungeonChangeConsumable(KinkyDungeonConsumables.MistressKey, -1);
		}
	},
	"CursedDamage": {
		powerMult: 10,
		lock: true,
		noShrine: true,
		activatecurse: true,
		level: 9,
		weight: (item) => {
			return 1;
		},
		condition: (item) => {
			return false;
		},
		remove: (item, host) => {},
		customInfo: (item, Curse) => {
			KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseInfo" + Curse)
				.replace("RestraintName", TextGet("Restraint" + KDRestraint(item).name))
				.replace("AMNT", "" + (Math.round(10 * ((KDItemDataQuery(item, "cursedDamageHP") || 0) - (KDItemDataQuery(item, "cursedDamage") || 0))) || "???")),
			"#ffffff", 2);
		},
		events: [
			{type: "cursedDamage", trigger: "afterPlayerDamage", mult: 1.0, power: 20, limit: 40},
		],
	},
	"MistressKey": {
		powerMult: 4,
		lock: true,
		noShrine: true,
		customIcon_RemoveFailure: "Locks/Gold",
		level: 10,
		weight: (item) => {
			return 1;
		},
		condition: (item) => {
			return KinkyDungeonItemCount("MistressKey") > 0;
		},
		remove: (item, host) => {
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.MistressKey, -1);
		}
	},
	"5Keys" : {
		lock: true,
		level: 3,
		weight: (item) => {
			return 3;
		},
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
		level: 1,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {
			return KinkyDungeonRedKeys >= 1;
		},
		remove: (item, host) => {
			KinkyDungeonRedKeys -= 1;
		}
	},
	"BlueLock" : {
		lock: true,
		activatecurse: true,
		level: 4,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {
			return KinkyDungeonBlueKeys >= 1;
		},
		remove: (item, host) => {
			KinkyDungeonBlueKeys -= 1;
		}
	},
	"TakeDamageFire" : {
		powerMult: 2.2,
		activatecurse: true,
		level: 4,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {return false;},
		remove: (item, host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 3, damage: "fire", trigger: "beforePlayerDamage", kind: "CurseMelt"},
			{type: "RemoveOnDmg", power: 1, count: 3, damage: "crush", trigger: "beforePlayerDamage", kind: "CurseMelt"},
		],
	},
	"TakeDamageIce" : {
		powerMult: 2.2,
		activatecurse: true,
		level: 4,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {return false;},
		remove: (item, host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 4, damage: "ice", trigger: "beforePlayerDamage", kind: "CurseExtinguish"},
			{type: "RemoveOnDmg", power: 1, mult: 0.5, count: 4, damage: "acid", trigger: "beforePlayerDamage", kind: "CurseExtinguish"},
			{type: "RemoveOnETTag", power: 0.1, count: 4, tags: ["ice"], trigger: "tickAfter", kind: "CurseExtinguish"},
			{type: "RemoveOnETTag", power: 0.4, count: 4, tags: ["water"], trigger: "tickAfter", kind: "CurseExtinguish"},
			//{type: "RemoveOnBuffName", trigger: "tick", kind: "Drenched"},
			//{type: "RemoveOnBuffName", trigger: "tick", kind: "Chilled"},
		],
	},
	"TakeDamageElectric" : {
		powerMult: 2.2,
		activatecurse: true,
		level: 4,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {return false;},
		remove: (item, host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 2, damage: "electric", trigger: "beforePlayerDamage", kind: "CurseShock"}
		],
	},
	"TakeDamageGlue" : {
		powerMult: 2.2,
		activatecurse: true,
		level: 4,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {return false;},
		remove: (item, host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 5, damage: "glue", trigger: "beforePlayerDamage", kind: "CurseGlue"}
		],
	},
	"TakeDamageChain" : {
		powerMult: 2.2,
		activatecurse: true,
		level: 4,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {return false;},
		remove: (item, host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 5, damage: "chain", trigger: "beforePlayerDamage", kind: "CurseChain"}
		],
	},
	"Will" : {
		powerMult: 2,
		activatecurse: true,
		level: 2,
		weight: (item) => {
			return 10;
		},
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
		activatecurse: true,
		level: 2,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {
			return KinkyDungeonStatMana + KinkyDungeonStatManaPool >= 20;
		},
		remove: (item, host) => {
			KinkyDungeonChangeMana(-20, false, 0, true, true);
		}
	},
	"ShrineWill" : {
		powerMult: 2.5,
		activatecurse: true,
		level: 2,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Will";
			});
		}, remove: (item, host) => {/* For free! */}},
	"ShrineElements" : {
		powerMult: 2.5,
		activatecurse: true,
		level: 2,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Elements";
			});
		}, remove: (item, host) => {/* For free! */}},
	"ShrineConjure" : {
		powerMult: 2.5,
		activatecurse: true,
		level: 2,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Conjure";
			});
		}, remove: (item, host) => {/* For free! */}},
	"ShrineIllusion" : {
		powerMult: 2.5,
		activatecurse: true,
		level: 2,
		weight: (item) => {
			return 10;
		},
		condition: (item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Illusion";
			});
		}, remove: (item, host) => {/* For free! */}},
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
	"Common": {
		level: 1,
		variant: (restraint, newRestraintName) => {
			return KDAddEventVariant(restraint, newRestraintName, [
				// We add this to ALL cursed items (including dormant curses)
				{trigger: "curseCount", type: "add", power: 1},
			], 4, "", {commonCurse: 10});
		}
	},
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
function KDAddEventVariant(restraint, newRestraintName, ev, power = 4, lock = undefined, enemyTags = {basicCurse: 10}) {
	// Sanitize to avoid duped pointer
	ev = JSON.parse(JSON.stringify(ev));
	KinkyDungeonDupeRestraintText(restraint.name, newRestraintName);
	/** @type {KinkyDungeonEvent[]} */
	let events = ev.concat(restraint.events);
	let escapeChance = Object.assign({}, restraint.escapeChance);
	Object.assign(escapeChance, {
		Struggle: Math.min(restraint.escapeChance.Struggle, -0.2),
		Cut: Math.min(restraint.escapeChance.Cut || 1.0, -0.1),
	});
	return {
		//protection: 0,
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
	} else if (KDCurses[Curse].customInfo) {
		KDCurses[Curse].customInfo(item, Curse);
	} else {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseInfo" + Curse), "White", 2);
	}
}

function KinkyDungeonCurseStruggle(item, Curse) {
	if (Curse == "MistressKey") {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseStruggle" + Curse + item.name), "White", 2);
	} else if (KDCurses[Curse].customStruggle) {
		KDCurses[Curse].customStruggle(item, Curse);
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
	let keep = true;
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