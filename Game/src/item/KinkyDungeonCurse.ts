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
		"OrgasmResist",
		"Mana",
		"SacrificeMage",
	],
	"Divine": [
		"ShrineWill",
		"ShrineIllusion",
		"ShrineElements",
		"ShrineConjure",
		"OrgasmResist",
		"SacrificeMage",
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
 */
let KDCurses: Record<string, KDCursedDef> = {
	"GhostLock" : {
		powerMult: 5,
		lock: true,
		level: 10,
		weight: (_item) => {
			return 1;
		},
		condition: (_item) => {
			return KinkyDungeonItemCount("Ectoplasm") >= 25;
		},
		remove: (_item, _host, _specialMethod) => {
			if (!_specialMethod)
				KinkyDungeonChangeConsumable(KinkyDungeonConsumables.Ectoplasm, -25);
		},
	},
	"DollLock" : {
		powerMult: 4,
		lock: true,
		level: 15,
		weight: (_item) => {
			return 1;
		},
		condition: (_item) => {
			return KinkyDungeonItemCount("DollID") >= 4;
		},
		remove: (_item, _host, _specialMethod) => {
			if (!_specialMethod)
				KinkyDungeonChangeConsumable(KinkyDungeonConsumables.DollID, -4);
		}
	},
	"SpellLock1" : {
		powerMult: 2.8,
		lock: true,
		level: 4,
		weight: (_item) => {
			return 1;
		},
		condition: (_item) => {
			return KinkyDungeonSpellPoints > 0;
		},
		remove: (_item, _host, _specialMethod) => {
			if (!_specialMethod)
				KinkyDungeonSpellPoints -= 1;
		}
	},
	"SpellLock8" : {
		powerMult: 4,
		lock: true,
		level: 12,
		weight: (_item) => {
			return 1;
		},
		condition: (_item) => {
			let amount = KinkyDungeonStatsChoice.get("randomMode") ? 3 : 8;
			return KinkyDungeonSpellPoints >= amount;
		},
		remove: (_item, _host, _specialMethod) => {
			if (!_specialMethod) {
				let amount = KinkyDungeonStatsChoice.get("randomMode") ? 3 : 8;
				KinkyDungeonSpellPoints -= amount;
			}
		},
		customInfo: (item, Curse) => {
			let amount = KinkyDungeonStatsChoice.get("randomMode") ? 3 : 8;
			KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseInfo" + Curse)
				.replace("RestraintName", KDGetItemName(item))//TextGet("Restraint" + KDRestraint(item).name))
				.replace("AMNT", "" + (amount)),
			"#ffffff", 2);
		},
	},
	"CursedCollar": {
		powerMult: 10,
		lock: true,
		noShrine: true,
		activatecurse: true,
		level: 30,
		weight: (_item) => {
			return 1;
		},
		condition: (_item) => {
			for (let inv of KinkyDungeonAllRestraintDynamic()) {
				if (KDGetCurse(inv.item) == "CursedDamage") return false;
			}
			return true;
		},
		remove: (_item, _host) => {
			//KinkyDungeonChangeConsumable(KinkyDungeonConsumables.MistressKey, -1);
		}
	},
	"CursedDamage": {
		powerMult: 10,
		lock: true,
		noShrine: true,
		activatecurse: true,
		level: 9,
		customIcon_hud: "StarCurse",
		weight: (_item) => {
			return 1;
		},
		condition: (_item) => {
			return false;
		},
		remove: (_item, _host) => {},
		customInfo: (item, Curse) => {
			KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseInfo" + Curse)
				.replace("RestraintName", KDGetItemName(item))//TextGet("Restraint" + KDRestraint(item).name))
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
		weight: (_item) => {
			return 1;
		},
		condition: (_item) => {
			return KinkyDungeonItemCount("MistressKey") > 0;
		},
		remove: (_item, _host, _specialMethod) => {
			if (!_specialMethod)
				KinkyDungeonChangeConsumable(KinkyDungeonConsumables.MistressKey, -1);
		}
	},
	"5Keys" : {
		lock: true,
		level: 3,
		weight: (_item) => {
			return 3;
		},
		condition: (_item) => {
			return KinkyDungeonItemCount("RedKey") >= 5;
		},
		remove: (_item, _host, _specialMethod) => {
			if (!_specialMethod)
				KDAddConsumable("RedKey", -5);
		}
	},
	"Key" : {
		powerMult: 2.1,
		lock: true,
		level: 1,
		weight: (_item) => {
			return 10;
		},
		condition: (_item) => {
			return KinkyDungeonItemCount("RedKey") >= 1;
		},
		remove: (_item, _host, _specialMethod) => {
			if (!_specialMethod)
				KDAddConsumable("RedKey", -1);
		}
	},
	"BlueLock" : {
		lock: true,
		activatecurse: true,
		level: 4,
		weight: (_item) => {
			return 10;
		},
		condition: (_item) => {
			return KinkyDungeonItemCount("BlueKey") >= 1;
		},
		remove: (_item, _host, _specialMethod) => {
			if (!_specialMethod)
				KDAddConsumable("BlueKey", -1);
		}
	},
	"TakeDamageFire" : {
		powerMult: 2.2,
		activatecurse: true,
		level: 4,
		weight: (_item) => {
			return 10;
		},
		condition: (_item) => {return false;},
		remove: (_item, _host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 3, damage: "fire", trigger: "beforePlayerDamage", kind: "CurseMelt"},
			{type: "RemoveOnDmg", power: 1, count: 3, damage: "crush", trigger: "beforePlayerDamage", kind: "CurseMelt"},
		],
	},
	"TakeDamageIce" : {
		powerMult: 2.2,
		activatecurse: true,
		level: 4,
		weight: (_item) => {
			return 10;
		},
		condition: (_item) => {return false;},
		remove: (_item, _host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 4, damage: "ice", trigger: "beforePlayerDamage", kind: "CurseExtinguish"},
			{type: "RemoveOnDmg", power: 1, mult: 0.5, count: 4, damage: "acid", trigger: "beforePlayerDamage", kind: "CurseExtinguish"},
			{type: "RemoveOnDmg", power: 1, mult: 0.5, count: 4, damage: "soap", trigger: "beforePlayerDamage", kind: "CurseExtinguish"},
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
		weight: (_item) => {
			return 10;
		},
		condition: (_item) => {return false;},
		remove: (_item, _host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 2, damage: "electric", trigger: "beforePlayerDamage", kind: "CurseShock"},
			{type: "RemoveOnDmg", power: 1, count: 2, damage: "estim", trigger: "beforePlayerDamage", kind: "CurseShock"},
		],
	},
	"TakeDamageGlue" : {
		powerMult: 2.2,
		activatecurse: true,
		level: 4,
		weight: (_item) => {
			return 10;
		},
		condition: (_item) => {return false;},
		remove: (_item, _host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 5, damage: "glue", trigger: "beforePlayerDamage", kind: "CurseGlue"}
		],
	},
	"TakeDamageChain" : {
		powerMult: 2.2,
		activatecurse: true,
		level: 4,
		weight: (_item) => {
			return 10;
		},
		condition: (_item) => {return false;},
		remove: (_item, _host) => {},
		events: [
			{type: "RemoveOnDmg", power: 1, count: 5, damage: "chain", trigger: "beforePlayerDamage", kind: "CurseChain"}
		],
	},
	"SacrificeMage" : {
		powerMult: 2.5,
		activatecurse: true,
		level: 6,
		weight: (_item) => {
			return 10;
		},
		condition: (_item) => {return false;},
		remove: (_item, _host) => {},
		events: [
			{type: "SacrificeMage", power: 1, count: 5, mult: 1, trigger: "afterCapture", kind: "SacrificeMage"}
		],
	},
	"Will" : {
		powerMult: 2,
		activatecurse: true,
		level: 2,
		weight: (_item) => {
			return 10;
		},
		onApply: (_item, _host) => {
			KinkyDungeonChangeWill(-1);
		},
		condition: (_item) => {
			return KinkyDungeonStatWill >= KinkyDungeonStatWillMax*0.99;
		},
		remove: (_item, _host) => {
			// For free!
		}
	},
	"Mana" : {
		powerMult: 2,
		activatecurse: true,
		level: 2,
		weight: (_item) => {
			return 10;
		},
		condition: (_item) => {
			return KinkyDungeonStatMana + KinkyDungeonStatManaPool >= 20;
		},
		remove: (_item, _host, _specialMethod) => {
			if (!_specialMethod)
				KinkyDungeonChangeMana(-20, false, 0, true, true);
		}
	},
	"ShrineWill" : {
		powerMult: 2.5,
		activatecurse: true,
		level: 2,
		weight: (_item) => {
			return 10;
		},
		events: [
			{type: "ShrineUnlockWiggle", trigger: "tick", kind: "ShrineWill"}
		],
		condition: (_item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Will";
			});
		}, remove: (_item, _host) => {/* For free! */}},
	"ShrineElements" : {
		powerMult: 2.5,
		activatecurse: true,
		level: 2,
		weight: (_item) => {
			return 10;
		},
		events: [
			{type: "ShrineUnlockWiggle", trigger: "tick", kind: "ShrineElements"}
		],
		condition: (_item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Elements";
			});
		}, remove: (_item, _host) => {/* For free! */}},
	"ShrineConjure" : {
		powerMult: 2.5,
		activatecurse: true,
		level: 2,
		weight: (_item) => {
			return 10;
		},
		events: [
			{type: "ShrineUnlockWiggle", trigger: "tick", kind: "ShrineConjure"}
		],
		condition: (_item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Conjure";
			});
		}, remove: (_item, _host) => {/* For free! */}},
	"ShrineIllusion" : {
		powerMult: 2.5,
		activatecurse: true,
		level: 2,
		weight: (_item) => {
			return 10;
		},
		events: [
			{type: "ShrineUnlockWiggle", trigger: "tick", kind: "ShrineIllusion"}
		],
		condition: (_item) => {
			return KDNearbyTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((tile) => {
				return tile?.tile?.Type == "Shrine" && tile.tile.Name == "Illusion";
			});
		}, remove: (_item, _host) => {/* For free! */}},
	"OrgasmResist" : {
		powerMult: 2.9,
		activatecurse: true,
		level: 5,
		weight: (_item) => {
			return KinkyDungeonStatsChoice.get("arousalMode") ? 7 : 0;
		},
		condition: (_item) => {return false;},
		remove: (_item, _host) => {},
		events: [
			{type: "RemoveOnEdge", power: 1, count: 50, trigger: "tick", kind: "OrgasmResist", msg: "KDRemoveOnEdge"},
			{type: "IncrementRemovalVar", power: 3, count: 50, trigger: "edge", kind: "OrgasmResist", msg: "KDRemoveOnEdgeSucceed"},
			{type: "IncrementRemovalVar", power: -25, count: 50, trigger: "orgasm", kind: "OrgasmResist", msg: "KDRemoveOnEdgeFail"},
		],
	},
	"HaveOrgasm" : {
		powerMult: 2.5,
		activatecurse: true,
		level: 5,
		weight: (_item) => {
			return KinkyDungeonStatsChoice.get("arousalMode") ? 9 : 0;
		},
		condition: (_item) => {return false;},
		remove: (_item, _host) => {},
		events: [
			{type: "IncrementRemovalVar", power: 25, count: 50, trigger: "orgasm", kind: "HaveOrgasm", msg: "KDRemoveOnOrgasmFail"},
		],
	},
};



/**
 * TODO
curseInfoAnimation,"Curse of Animation: Causes loose restraints to animate and attack you!"
curseInfoSensitivity,"Curse of Sensitivity: Makes it easier to lose control of yourself."
 */

/** Cursed variants of restraints
 */
let KDCursedVars: Record<string, KDCursedVar> = {
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
 * @param item
 * @param ev
 */
function KDBestowCurse(item: item, ev: KinkyDungeonEvent[]): void {
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
 * @param restraint
 * @param newRestraintName
 * @param ev
 * @param power
 * @param lock
 * @param enemyTags
 * @param noPick
 */
function KDAddEventVariant(restraint: restraint, newRestraintName: string, ev: KinkyDungeonEvent[], power: number = 4, lock: string = undefined, enemyTags: Record<string, number> = {basicCurse: 10}, noPick: boolean = true): any {
	// Sanitize to avoid duped pointer
	ev = JSON.parse(JSON.stringify(ev));
	KinkyDungeonDupeRestraintText(restraint.name, newRestraintName);
	let events: KinkyDungeonEvent[] = ev.concat(restraint.events);
	let escapeChance = Object.assign({}, restraint.escapeChance);
	Object.assign(escapeChance, {
		Struggle: Math.min(restraint.escapeChance.Struggle, -0.2),
		Cut: Math.min(restraint.escapeChance.Cut || 1.0, -0.1),
	});
	if (!noPick) {
		Object.assign(escapeChance, {
			Pick: Math.min(restraint.escapeChance.Pick || 0, 0.1),
		});
	}
	return {
		//protection: 0,
		preview: restraint.preview || restraint.name,
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

function KinkyDungeonCurseInfo(item: item, Curse: string) {
	if (Curse == "MistressKey" && KinkyDungeonItemCount("MistressKey")) {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseInfoMistressKeyHave").replace("KeyAmount", "" + KinkyDungeonItemCount("MistressKey")), "White", 2);
	} else if (KDCurses[Curse].customInfo) {
		KDCurses[Curse].customInfo(item, Curse);
	} else {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseInfo" + Curse), "White", 2);
	}
}

function KinkyDungeonCurseStruggle(item: item, Curse: string) {
	if (Curse == "MistressKey") {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseStruggle" + Curse + item.name), "White", 2);
	} else if (KDCurses[Curse].customStruggle) {
		KDCurses[Curse].customStruggle(item, Curse);
	} else {
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonCurseStruggle" + Curse), "White", 2);
	}
}

function KinkyDungeonCurseAvailable(item: item, Curse: string) {
	if (KDCurses[Curse] && KDCurses[Curse].condition(item)) {
		return true;
	}
	return false;
}

/**
 * @param group
 * @param index
 * @param Curse
 */
function KinkyDungeonCurseUnlock(group: string, index: number, Curse: string) {
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

	let inventoryAs = restraint.inventoryVariant || restraint.name || (KDRestraint(restraint).inventoryAs);
	restraint.curse = undefined;
	if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
		KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
	}

	if (KDCurses[Curse]) {
		KDCurses[Curse].remove(restraint, host, false);
	}

	if (unlock) {
		KDSendStatus('escape', KinkyDungeonGetRestraintItem(group).name, "Curse");
		KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonCurseUnlock" + Curse), "#99FF99", 2);
		KinkyDungeonRemoveRestraintSpecific(restraint, keep, undefined, false, false, false, KinkyDungeonPlayerEntity);
	}


}

/**
 * @param curse
 */
function KDCursePower(curse: string): number {
	if (KDCurses[curse]) {
		return KDCurses[curse].powerBoost || 5;
	}
	return 0;
}

/**
 * @param curse
 */
function KDCurseMult(curse: string): number {
	if (KDCurses[curse]) {
		return KDCurses[curse].powerMult || 3;
	}
	return 1;
}
