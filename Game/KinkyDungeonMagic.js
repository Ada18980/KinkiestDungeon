"use strict";
let KinkyDungeonManaCost = 10; // The base mana cost of a spell, multiplied by the spell's level

let KDEmpowerSprite = "Empower";
let KDMaxEmpower = 3; // Max upcast level

let KDConfirmClearSpells = false;

let KinkyDungeonBookScale = 1.3;

let KDFlashMana = 0;

let KinkyDungeonMysticSeals = 0; // Mystic seals are used to unlock a spell from one of 3 books:
// 0 Ars Pyrotecnica - Elemental magic such as fireballs, ice, wind, etc
// 1 Codex Imaginus - Conjuring things such as weapons and restraints, and also enchanting (and disenchanting)
// 2 Clavicula Romantica - Illusory magic, disorientation and affecting enemy AI

// Magic book image source: https://www.pinterest.es/pin/54324739242326557/

// Note that you have these 3 books in your inventory at the start; you select the page open in each of them but you need to have hands free or else you can only turn to a random page at a time. If you are blind, you also can't see any page after you turn the page

let KinkyDungeonCurrentBook = "Elements";
let KinkyDungeonCurrentPage = 0;
let KinkyDungeonCurrentSpellsPage = 0;
let KinkyDungeonBooks = ["Elements", "Conjure", "Illusion"];
let KinkyDungeonPreviewSpell = null;

let KinkyDungeonSpellChoices = [0, 1, 2];
/** @type {string[]} */
let KinkyDungeonWeaponChoices = [];
/** @type {string[]} */
let KinkyDungeonArmorChoices = [];
/** @type {string[]} */
let KinkyDungeonConsumableChoices = [];

let KinkyDungeonSpellChoicesToggle = [true, true];
let KinkyDungeonSpellChoiceCount = 30;
let KinkyDungeonSpellChoiceCountPerPage = 10;
let KDSpellPage = 0;

let KinkyDungeonSpellOffset = 100;
let KinkyDungeonSpellChoiceOffset = 80;

let KDPlayerHitBy = [];

let KinkyDungeonMiscastPityModifier = 0; // Current value
let KinkyDungeonMiscastPityModifierIncrementPercentage = 0.5; // Percent of the base hit chance to add

/** @type {Record<string, KDSpellComponent>} */
let KDSpellComponentTypes = {
	"Verbal": {
		stringShort: (ret) => {
			return TextGet("KDShortCompVerbal");
		},
		stringLong: (spell) => {
			return TextGet("KinkyDungeonComponentsVerbal");
		},
		check: (spell, x, y) => {
			let gagTotal = (KinkyDungeonStatsChoice.get("Incantation") && KinkyDungeonGagTotal() > 0) ? 1.0 : KinkyDungeonGagTotal();
			if (gagTotal >= 0.99 && !(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "NoVerbalComp") > 0)) return false;

			return true;
		},
		ignore: (spell, x, y) => {
			return (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "NoVerbalComp") > 0);
		},
		partialMiscastChance: (spell, x, y) => {
			let gagTotal = (KinkyDungeonStatsChoice.get("Incantation") && KinkyDungeonGagTotal() > 0) ? 1.0 : KinkyDungeonGagTotal();
			if (KinkyDungeonStatsChoice.get("SmoothTalker") && gagTotal < 0.99) gagTotal = 0;
			return Math.max(0, Math.min(1, gagTotal));
		},
		partialMiscastType: (spell, x, y) => {
			return "Gagged";
		},
	},
	"Arms": {
		stringShort: (ret) => {
			return TextGet("KDShortCompArms");
		},
		stringLong: (spell) => {
			return TextGet("KinkyDungeonComponentsArms");
		},
		check: (spell, x, y) => {
			if (!(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "NoArmsComp") > 0)) {
				if (KinkyDungeonStatsChoice.get("SomaticPlus") && KDHandBondageTotal(false) < 0.99) return true;
				if (KinkyDungeonStatsChoice.get("SomaticMinus") && KinkyDungeonIsHandsBound(false, false, 0.01)) return false;
				return !KinkyDungeonIsArmsBound(false, false);
			}
			return true;
		},
		ignore: (spell, x, y) => {
			return (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "NoArmsComp") > 0);
		},
		partialMiscastChance: (spell, x, y) => {
			if (!KinkyDungeonIsArmsBound(false, false) && !KinkyDungeonStatsChoice.get("SomaticMinus")) return 0;
			let handsTotal = (!KinkyDungeonStatsChoice.get("SomaticPlus") && KinkyDungeonIsHandsBound(false, false, 0.01)) ? 1.0 : KDHandBondageTotal(false);
			return Math.max(0, Math.min(1, handsTotal));
		},
		partialMiscastType: (spell, x, y) => {
			if (KinkyDungeonStatsChoice.get("SomaticMinus")) return "Arms";
			if (KinkyDungeonStatsChoice.get("SomaticPlus")) return "Fingers";
			return "Bug";
		},
	},
	"Legs": {
		stringShort: (ret) => {
			return TextGet("KDShortCompLegs");
		},
		stringLong: (spell) => {
			return TextGet("KinkyDungeonComponentsLegs");
		},
		check: (spell, x, y) => {
			if ((KinkyDungeonSlowLevel > (KinkyDungeonStatsChoice.get("HeelWalker") ? 2 : 1) || (!KinkyDungeonStatsChoice.get("HeelWalker") && KinkyDungeonLegsBlocked())) && !(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "NoLegsComp") > 0)) return false;
			return true;
		},
		ignore: (spell, x, y) => {
			return (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "NoLegsComp") > 0);
		},
		partialMiscastChance: (spell, x, y) => {
			if (KinkyDungeonStatsChoice.get("HeelWalker")) {
				if (KinkyDungeonSlowLevel > 1) return 0.5;
			} else if (KinkyDungeonSlowLevel > 0) return 0.25;
			return 0;
		},
		partialMiscastType: (spell, x, y) => {
			if (KinkyDungeonStatsChoice.get("PoorForm")) return "PoorForm";
			return "Legs";
		},
	},

};

function KinkyDungeonSearchSpell(list, name) {
	for (let spell of list) {
		if (spell.name == name) {
			return spell;
		}
	}
	return null;
}

let KDSpellMemo = {};

/**
 * 
 * @param {string} name 
 * @param {boolean} SearchEnemies 
 * @returns {spell}
 */
function KinkyDungeonFindSpell(name, SearchEnemies = false) {
	if (KDSpellMemo[name]) return KDSpellMemo[name];
	if (SearchEnemies) {
		let spell = KinkyDungeonSearchSpell(KinkyDungeonSpellListEnemies, name);
		if (spell) {
			KDSpellMemo[name] = spell;
			return spell;
		}
	}
	let spell2 = KinkyDungeonSearchSpell(KinkyDungeonSpellsStart, name);
	if (spell2) {
		KDSpellMemo[name] = spell2;
		return spell2;
	}
	for (let key in KinkyDungeonSpellList) {
		let list = KinkyDungeonSpellList[key];
		let spell = KinkyDungeonSearchSpell(list, name);
		if (spell) {
			KDSpellMemo[name] = spell;
			return spell;
		}
	}
	return KinkyDungeonSearchSpell(KinkyDungeonSpells, name);
}

function KinkyDungeonDisableSpell(Name) {
	for (let i = 0; i < KinkyDungeonSpellChoices.length; i++) {
		if (KinkyDungeonSpells[KinkyDungeonSpellChoices[i]] && KinkyDungeonSpells[KinkyDungeonSpellChoices[i]].name == Name) {
			KinkyDungeonSpellChoicesToggle[i] = false;
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
		}
	}
}

let KinkyDungeonSpellPress = "";

function KinkyDungeonResetMagic() {
	KDClearChoices();
	KinkyDungeonSpellChoiceCount = 30;
	KinkyDungeonSpells = [];
	Object.assign(KinkyDungeonSpells, KinkyDungeonSpellsStart); // Copy the dictionary
	KinkyDungeonMysticSeals = 1.3;
	KinkyDungeonSpellPress = "";
	KinkyDungeonCurrentPage = 0;
	KinkyDungeonCurrentSpellsPage = 0;
	KinkyDungeonSpellPoints = 3;
	KDSpellPage = 0;
	if (KinkyDungeonStatsChoice.get("randomMode")) {
		KinkyDungeonSpells.push({name: "ApprenticeFire", hideLearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeWater", hideLearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeEarth", hideLearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeAir", hideLearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeIce", hideLearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeLightning", hideLearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);

		KinkyDungeonSpells.push({name: "ApprenticeLeather", hideLearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeRope", hideLearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeMetal", hideLearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeSummon", hideLearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeLatex", hideLearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticePhysics", hideLearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);

		KinkyDungeonSpells.push({name: "ApprenticeShadow", hideLearned: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeLight", hideLearned: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeMystery", hideLearned: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeKnowledge", hideLearned: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeProjection", hideLearned: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);


		//KinkyDungeonSpells.push({name: "SpellChoiceUp1", school: "Any", manacost: 0, components: [], spellPointCost: 1, level:3, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"});
		//KinkyDungeonSpells.push({name: "SpellChoiceUp2", school: "Any", manacost: 0, components: [], spellPointCost: 1, level:4, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"});
		//KinkyDungeonSpells.push({name: "SpellChoiceUp3", school: "Any", manacost: 0, components: [], spellPointCost: 1, level:5, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"});
	}
}

/**
 *
 * @param {string} name
 * @returns {boolean}
 */
function KDHasSpell(name) {
	for (let s of KinkyDungeonSpells) {
		if (s.name == name) return true;
	}
	return false;
}

/**
 *
 * @param {string} name
 * @param {number} Level - Spell level. Set to -1 to allow any level
 * @returns {spell}
 */
function KDGetUpcast(name, Level) {
	if (Level < 0) {
		for (let sp of KinkyDungeonSpells) {
			if (sp.upcastFrom && sp.upcastFrom == name) {
				return sp;
			}
		}
	} else {
		for (let i = Level; i > 0; i--) {
			for (let sp of KinkyDungeonSpells) {
				if (i == sp.upcastLevel && sp.upcastFrom && sp.upcastFrom == name) {
					return sp;
				}
			}
		}
	}
	return null;
}

/**
 *
 * @param {string} name
 * @returns {boolean}
 */
function KDHasUpcast(name) {
	for (let sp of KinkyDungeonSpells) {
		if (sp.upcastFrom && sp.upcastFrom == name) {
			return true;
		}
	}
	return false;
}
/**
 *
 * @returns {boolean}
 */
function KDCanUpcast() {
	for (let i of KinkyDungeonSpellChoices) {
		let spell = KinkyDungeonSpells[i];
		if (spell) {
			let upcast = KDGetUpcast(spell.name, -1);
			if (upcast) {
				return true;
			}
		}

	}
	return false;
}

function KDEmpower(data, entity) {
	let Level = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellEmpower");
	if (!KDCanUpcast()) {
		KinkyDungeonSendActionMessage(10, TextGet("KDSpellEmpowerFail"), "#ffffff", 1);
	} else {
		KinkyDungeonTargetingSpell = null;
		// Success, we upcast
		let newLevel = Math.min(KDMaxEmpower, Level + 1);
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Empower",
			aura: "#aaaaff",
			type: "SpellEmpower",
			maxCount: 1,
			currentCount: 1,
			power: newLevel,
			duration: 13,
			tags: ["cast", "upcast"],
		});
		KinkyDungeonSendActionMessage(5, TextGet("KDSpellEmpowerMsg").replace("LEVEL", "" + newLevel), "#aaaaff", 2);
		KinkyDungeonAdvanceTime(1, true);
	}
}

function KinkyDungeoCheckComponentsPartial(spell, x, y, includeFull) {

	let failedcomp = [];
	let failedcompFull = [];

	if (spell.components)
		for (let comp of spell.components) {
			if (includeFull && !KDSpellComponentTypes[comp].check(spell, x, y)) {
				failedcompFull.push(comp);
			} else if (KDSpellComponentTypes[comp].partialMiscastChance(spell, x, y) > 0) {
				failedcomp.push(comp);
			}
		}

	let data = {
		spell: spell,
		failed: failedcompFull,
		partial: failedcomp,
		x: x || KinkyDungeonPlayerEntity.x,
		y: y || KinkyDungeonPlayerEntity.y};
	KinkyDungeonSendEvent("calcCompPartial", data);
	if (includeFull) {
		return [...data.partial, ...data.failed];
	}
	return data.partial;
}

function KinkyDungeoCheckComponents(spell, x, y) {
	let failedcomp = [];

	if (spell.components)
		for (let comp of spell.components) {
			if (!KDSpellComponentTypes[comp].check(spell, x, y)) {
				failedcomp.push(comp);
			}
		}

	let data = {
		spell: spell,
		failed: failedcomp,
		x: x || KinkyDungeonPlayerEntity.x,
		y: y || KinkyDungeonPlayerEntity.y};
	KinkyDungeonSendEvent("calcComp", data);
	return data.failed;
}

function KinkyDungeonHandleSpellChoice(SpellChoice) {
	let spell = KinkyDungeonHandleSpellCast(KDGetUpcast(KinkyDungeonSpells[SpellChoice].name,
		KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellEmpower")) || KinkyDungeonSpells[SpellChoice]);
	return spell;
}

/**
 *
 * @param {spell} spell
 * @param {number} [x]
 * @param {number} [y]
 * @returns {boolean}
 */
function KDSpellIgnoreComp(spell, x, y) {
	let ignore = true;
	if (spell?.components) {
		for (let c of spell.components) {
			if (!KDSpellComponentTypes[c]?.ignore || !KDSpellComponentTypes[c].ignore(spell, x, y)) ignore = false;
		}
	}

	return ignore
	|| (KinkyDungeonStatsChoice.get("Slayer") && spell.school == "Elements")
	|| (KinkyDungeonStatsChoice.get("Conjurer") && spell.school == "Conjure")
	|| (KinkyDungeonStatsChoice.get("Magician") && spell.school == "Illusion");
}

function KinkyDungeonHandleSpellCast(spell) {
	if (KinkyDungeoCheckComponents(spell).length == 0 || (
		KDSpellIgnoreComp(spell)
	)) {
		if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell))
			&& (!spell.staminacost || KinkyDungeonHasStamina(spell.staminacost)))
			return spell;
		else {
			KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonNoMana"), "#ff0000", 1);
			KDFlashMana = 1000;
		}
	} else {
		KinkyDungeonTargetingSpell = null;
		KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonComponentsFail" + KinkyDungeoCheckComponents(spell)[0]), "#ff0000", 1);
	}
	return null;
}

function KinkyDungeonClickSpell(i) {
	let spell = null;
	let clicked = false;
	if (KinkyDungeonSpells[KinkyDungeonSpellChoices[i]]) {
		if (KinkyDungeonSpells[KinkyDungeonSpellChoices[i]] && KinkyDungeonSpells[KinkyDungeonSpellChoices[i]].type == "passive") {
			KDSendInput("toggleSpell", {i: i});
			if (KinkyDungeonSpellChoicesToggle[i] && KinkyDungeonSpells[KinkyDungeonSpellChoices[i]].cancelAutoMove) {
				KinkyDungeonFastMove = false;
				KinkyDungeonFastMoveSuppress = false;
			}
			KinkyDungeonSpellPress = "";
			clicked = true;
		} else {
			spell = KinkyDungeonHandleSpellChoice(KinkyDungeonSpellChoices[i]);
			clicked = true;
		}
	} else if (KinkyDungeonConsumableChoices[i] && KinkyDungeonInventoryGetConsumable(KinkyDungeonConsumableChoices[i])?.quantity > 0) {
		KDSendInput("consumable", {item: KinkyDungeonConsumableChoices[i], quantity: 1});
		KinkyDungeonSpellPress = "";
		clicked = true;
	} else if (KinkyDungeonWeaponChoices[i] && KinkyDungeonInventoryGetWeapon(KinkyDungeonWeaponChoices[i])) {
		KDSendInput("switchWeapon", {weapon: KinkyDungeonWeaponChoices[i]});
		KinkyDungeonSpellPress = "";
		clicked = true;
	} else if (KinkyDungeonArmorChoices[i] && KinkyDungeonInventoryGetLoose(KinkyDungeonArmorChoices[i])) {
		let item = KinkyDungeonInventoryGetLoose(KinkyDungeonArmorChoices[i]);
		let equipped = false;
		let newItem = null;
		let currentItem = null;

		if (item) {
			newItem = KDRestraint(item);
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
			KDSendInput("equip", {name: item.name,
				inventoryVariant: item.name != newItem.name ?
					item.name : undefined,
					faction: item.faction,
				group: newItem.Group, curse: item.curse, currentItem: currentItem ? currentItem.name : undefined, events: Object.assign([], item.events)});
		}
		KinkyDungeonSpellPress = "";
		clicked = true;
	}
	return {spell: spell, clicked: clicked};
}

let KDSwapSpell = -1;

function KinkyDungeonHandleSpell(ind) {
	let clicked = false;
	let spell = null;
	if (!ind) {
		for (let i = 0; i < KinkyDungeonSpellChoiceCountPerPage; i++) {
			let index = i + KDSpellPage*KinkyDungeonSpellChoiceCountPerPage;

			if (KinkyDungeonSpellPress == KinkyDungeonKeySpell[i]) {
				let result = KinkyDungeonClickSpell(index);
				spell = result.spell;
				clicked = result.clicked;
			}
		}
		for (let ii = 0; ii < KinkyDungeonSpellChoiceCount; ii++) {
			if (MouseInKD("SpellCast" + ii) || MouseInKD("UseItem" + ii)) {
				let result = KinkyDungeonClickSpell(ii);
				spell = result.spell;
				clicked = result.clicked;
			}
		}
	} else {
		let result = KinkyDungeonClickSpell(ind);
		spell = result.spell;
		clicked = result.clicked;
	}

	if (spell) {
		// Otherwise.
		KinkyDungeonTargetingSpell = spell;
		KDModalArea = false;
		KinkyDungeonTargetTile = null;
		KinkyDungeonTargetTileLocation = null;
		KinkyDungeonSendActionMessage(5, TextGet("KinkyDungeonSpellTarget" + spell.name).replace("SpellArea", "" + Math.floor(spell.aoe)), "white", 0.1, true);
		return true;
	}
	if (clicked) return true;
	return false;
}

/**
 *
 * @param {spell} Spell
 * @returns {number}
 */
function KinkyDungeonGetStaminaCost(Spell, Passive, Toggle) {
	let data = {
		passive: Passive,
		toggle: Toggle,
		spell: Spell,
		cost: Spell.staminacost || 0,
		costscale: KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StaminaCostMult")),
	};
	KinkyDungeonSendEvent("calcStamina", data);
	if (data.costscale) data.cost = Math.floor(1000* data.cost * data.costscale)/1000;
	//if (data.costscale > 0) data.cost = Math.max(0, data.cost); // Keep it from rounding to 0
	if (data.lvlcostscale && Spell.level && Spell.staminacost) data.cost += Spell.level * data.lvlcostscale;
	KinkyDungeonSendEvent("beforeMultStamina", data);
	KinkyDungeonSendEvent("calcMultStamina", data);
	KinkyDungeonSendEvent("afterMultStamina", data);
	KinkyDungeonSendEvent("afterCalcStamina", data);

	return data.cost;
}

/**
 *
 * @param {spell} Spell
 * @returns {number}
 */
function KinkyDungeonGetManaCost(Spell, Passive, Toggle) {
	let data = {
		passive: Passive,
		toggle: Toggle,
		spell: Spell,
		cost: Spell.manacost,
		costscale: KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "ManaCostMult")),
		lvlcostscale: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "ManaCostLevelMult"),
	};
	KinkyDungeonSendEvent("calcMana", data);
	if (data.costscale) data.cost = Math.floor(1000* data.cost * data.costscale)/1000;
	//if (data.costscale > 0) data.cost = Math.max(0, data.cost); // Keep it from rounding to 0
	if (data.lvlcostscale && Spell.level && Spell.manacost) data.cost += Spell.level * data.lvlcostscale;
	KinkyDungeonSendEvent("beforeMultMana", data);
	KinkyDungeonSendEvent("calcMultMana", data);
	KinkyDungeonSendEvent("afterMultMana", data);
	KinkyDungeonSendEvent("afterCalcMana", data);

	if (KinkyDungeonStatsChoice.get("Slayer") && Spell.school == "Elements" && KinkyDungeoCheckComponents(Spell).length > 0) data.cost *= 2;
	if (KinkyDungeonStatsChoice.get("Conjurer") && Spell.school == "Conjure" && KinkyDungeoCheckComponents(Spell).length > 0) data.cost *= 2;
	if (KinkyDungeonStatsChoice.get("Magician") && Spell.school == "Illusion" && KinkyDungeoCheckComponents(Spell).length > 0) data.cost *= 2;

	return data.cost;
}

/**
 *
 * @param {spell} Spell
 * @returns {number}
 */
function KinkyDungeonGetChargeCost(Spell, Passive, Toggle) {
	let data = {
		passive: Passive,
		toggle: Toggle,
		spell: Spell,
		cost: Spell.chargecost || 0,
		costscale: KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "ChargeCostMult")),
	};
	KinkyDungeonSendEvent("calcCharge", data);
	if (data.costscale) data.cost = Math.floor(1000* data.cost * data.costscale)/1000;
	KinkyDungeonSendEvent("beforeMultCharge", data);
	KinkyDungeonSendEvent("calcMultCharge", data);
	KinkyDungeonSendEvent("afterMultCharge", data);
	KinkyDungeonSendEvent("afterCalcCharge", data);

	return data.cost;
}

/**
 *
 * @param {spell} Spell
 * @returns {number}
 */
function KinkyDungeonGetCost(Spell) {
	let cost = Spell.level;
	if (Spell.spellPointCost) cost = Spell.spellPointCost;
	//if (Spell.level > 1 && !Spell.passive && KinkyDungeonStatsChoice.get("Novice")) cost *= 2;
	if (Spell.classSpecific && KDGameData.Class != Spell.classSpecific) cost *= 2;
	let bonus = 0;
	if (Spell.increasingCost) {
		for (let s of KinkyDungeonSpells) {
			if (s != Spell && s.increasingCost) bonus += 1;
		}
		if (KinkyDungeonStatsChoice.get("Studious")) bonus = Math.max(-1, bonus - 2);
	}
	return cost + bonus;
}

function KinkyDungeonMakeNoise(radius, noiseX, noiseY, hideShockwave) {
	let data = {
		radius: radius,
		x: noiseX,
		y: noiseY,
		enemiesHeard: [],
		particle: !hideShockwave,
	};
	KinkyDungeonSendEvent("beforeNoise", data);
	for (let e of KDMapData.Entities) {
		if ((!e.aware || e.idle) && (!e.action || e.action == "investigatesound") && !e.Enemy.tags.deaf && !KDAmbushAI(e) && KDistEuclidean(e.x - data.x, e.y - data.y) <= data.radius) {
			e.gx = data.x;
			e.gy = data.y;
			e.action = "investigatesound";
			KDAddThought(e.id, "Search", 2, 2 + 3*KDistEuclidean(e.x - data.x, e.y - data.y));
			data.enemiesHeard.push(e);
		}
	}
	KinkyDungeonSendEvent("afterNoise", data);
}

/**
 *
 * @param {number} targetX
 * @param {number} targetY
 * @param {spell} spell
 * @param {*} enemy
 * @param {*} player
 * @param {*} bullet
 * @param {string} [forceFaction]
 * @param {any} [castData]
 * @returns {{result: string, data: any}}
 */
function KinkyDungeonCastSpell(targetX, targetY, spell, enemy, player, bullet, forceFaction, castData) {
	let entity = KinkyDungeonPlayerEntity;
	let moveDirection = KinkyDungeonMoveDirection;
	let flags = {
		miscastChance: KinkyDungeonMiscastChance,
	};

	let faction = spell.allySpell ? "Player" : (spell.enemySpell ? "Enemy" : "Player");
	if (forceFaction) faction = forceFaction;
	else {
		if (!enemy && !bullet && player) faction = "Player";
		else if (enemy) {
			let f = KDGetFaction(enemy);
			if (f) faction = f;
		} else if (bullet && bullet.bullet) {
			let f = bullet.bullet.faction;
			if (f) faction = f;
		}
		if (spell.faction) faction = spell.faction;
	}




	let gaggedMiscastFlag = false;
	let gaggedMiscastType = "Gagged";
	let lastPartialChance = 0;


	if (!enemy && !bullet && player && spell.components && !KDSpellIgnoreComp(spell)) {
		for (let c of spell.components) {
			if (KDSpellComponentTypes[c]?.partialMiscastChance && KDSpellComponentTypes[c].check(spell, targetX, targetY)) {
				let partialMiscastChance = KDSpellComponentTypes[c].partialMiscastChance(spell, targetX, targetY);
				if (partialMiscastChance > 0) {
					if (lastPartialChance == 0 || KDRandom() < partialMiscastChance) {
						lastPartialChance = partialMiscastChance;
						gaggedMiscastType = KDSpellComponentTypes[c].partialMiscastType(spell, targetX, targetY);
					}
					flags.miscastChance = flags.miscastChance + Math.max(0, 1 - flags.miscastChance) * (partialMiscastChance);
					gaggedMiscastFlag = true;
				}

			}
		}
	}


	let data = Object.assign({...castData}, {
		spell: spell,
		bulletfired: null,
		target: null,
		targetX: targetX,
		targetY: targetY,
		originX: KinkyDungeonPlayerEntity.x,
		originY: KinkyDungeonPlayerEntity.y,
		flags: flags,
		enemy: enemy,
		bullet: bullet,
		player: player,
		delta: 1,
		gaggedMiscastFlag: gaggedMiscastFlag,
		channel: spell.channel,
		castID: KinkyDungeonGetSpellID(),
		manacost: (!enemy && !bullet && player) ? KinkyDungeonGetManaCost(spell) : 0,
	});



	if (!enemy && !bullet && player) {
		KinkyDungeonSendEvent("beforeCast", data);
	}
	let tX = targetX;
	let tY = targetY;
	let miscast = false;
	let selfCast = !enemy && !bullet && player && targetX == KinkyDungeonPlayerEntity.x && targetY == KinkyDungeonPlayerEntity.y;
	if (!enemy && !player && !bullet) {
		moveDirection = {x:0, y:0, delta:1};
	}

	//let noiseX = targetX;
	//let noiseY = targetY;

	if (enemy && player) {
		entity = enemy;
		moveDirection = KinkyDungeonGetDirection(player.x - entity.x, player.y - entity.y);
		flags.miscastChance = 0;
	}
	if (bullet) {
		entity = bullet;
		if (bullet.bullet.cast) {
			moveDirection = {x:bullet.bullet.cast.mx, y:bullet.bullet.cast.my, delta: 1};
		} else {
			moveDirection = {x:0, y:0, delta: 0};
		}
		flags.miscastChance = 0;
	}
	if (!spell.noMiscast && !enemy && !bullet && player && Math.min(1, KDRandom() + KinkyDungeonMiscastPityModifier) < flags.miscastChance) {
		// Increment the pity timer
		KinkyDungeonMiscastPityModifier += KinkyDungeonMiscastPityModifierIncrementPercentage * Math.max(1 - flags.miscastChance, 0);

		if (gaggedMiscastFlag)
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSpellMiscast" + gaggedMiscastType), "#FF8800", 2);
		else
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSpellMiscast"), "#FF8800", 2);

		moveDirection = {x:0, y:0, delta:1};
		tX = entity.x;
		tY = entity.y;
		miscast = true;

		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/ " + (spell.miscastSfx || "SoftShield") + ".ogg");
		KinkyDungeonSendEvent("miscast", data);

		return {result: "Miscast", data: data};
	}



	let spellRange = spell.range * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "spellRange"));

	if (spell.type != "bolt" && spell.effectTilePre) {
		KDCreateAoEEffectTiles(tX,tY, spell.effectTilePre, spell.effectTileDurationModPre, (spell.aoe) ? spell.aoe : 0.5);
	}

	let originaltX = tX;
	let originaltY = tY;
	let originalSpeed = spell.speed;
	let castCount = spell.shotgunCount ? spell.shotgunCount : 1;
	let base = spell.shotgunSpread ? KDRandom()*Math.PI*2 : 0;
	for (let castI = 0; castI < castCount; castI++) {
		// Reset tx
		tX = originaltX;
		tY = originaltY;
		// Project out to shotgundistance
		if (spell.shotgunDistance) {
			let dx = tX - entity.x;
			let dy = tY - entity.y;
			let dmult = KDistEuclidean(dx, dy);
			if (dmult != 0) dmult = 1/dmult;

			tX = entity.x + dx*dmult * spell.shotgunDistance;
			tY = entity.y + dy*dmult * spell.shotgunDistance;
		}
		// Add spread
		if (spell.shotgunSpread) {
			if (spell.shotgunFan) {
				let dx = tX - entity.x;
				let dy = tY - entity.y;
				let dmult = KDistEuclidean(dx, dy);
				let ang = Math.atan2(dy, dx) - spell.shotgunSpread + 2 * spell.shotgunSpread * (castCount > 1 ? ((castI / (castCount - 1))) : KDRandom());
				tX = entity.x + Math.cos(ang)*(spell.shotgunDistance || dmult);
				tY = entity.y + Math.sin(ang)*(spell.shotgunDistance || dmult);
			} else {
				let ang = base + 2 * Math.PI * (castCount > 1 ? ((castI / (castCount - 1))) : KDRandom());// * 2 * Math.PI;
				tX += spell.shotgunSpread * ((castI+1) / castCount) * Math.cos(ang);
				tY += spell.shotgunSpread * ((castI+1) / castCount) * Math.sin(ang);
			}
		}

		let speed = originalSpeed;
		// Add speedSpread
		if (spell.shotgunSpeedBonus && castCount > 1) {
			speed += spell.shotgunSpeedBonus * (castI / (castCount - 1));
		}


		let cast = spell.spellcast ? Object.assign({}, spell.spellcast) : undefined;

		if (cast) {
			if (cast.target == "target") {
				if (tX == entity.x + moveDirection.x && tY == entity.y + moveDirection.y && !cast.noTargetMoveDir) {
					cast.tx = tX + moveDirection.x;
					cast.ty = tY + moveDirection.y;
				} else {
					cast.tx = tX;
					cast.ty = tY;
				}
			} else if (cast.target == "origin") {
				cast.tx = entity.x;
				cast.ty = entity.y;
			}
			if (cast.directional) {
				if (cast.randomDirection) {
					let slots = [];
					for (let XX = -1; XX <= 1; XX++) {
						for (let YY = -1; YY <= 1; YY++) {
							if ((XX != 0 || YY != 0) && KinkyDungeonNoEnemy(entity.x + XX, entity.y + YY, true) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(entity.x + XX, entity.y + YY))) slots.push({x:XX, y:YY});
						}
					}
					if (slots.length > 0) {
						let slot = slots[Math.floor(KDRandom() * slots.length)];
						cast.mx = slot.x;
						cast.my = slot.y;
						moveDirection.x = slot.x;
						moveDirection.y = slot.y;
					} else {
						cast.mx = moveDirection.x;
						cast.my = moveDirection.y;
					}
				} else if (cast.randomDirectionPartial || cast.randomDirectionFallback) {
					if (cast.randomDirectionFallback && (!cast.alwaysRandomBuff || !KDEntityHasBuff(entity, cast.alwaysRandomBuff))
						&& KinkyDungeonNoEnemy(entity.x + moveDirection.x, entity.y + moveDirection.y, true)
						&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(entity.x + moveDirection.x, entity.y + moveDirection.y))) {

						cast.mx = moveDirection.x;
						cast.my = moveDirection.y;
					} else {
						let slots = [];
						let dist = KDistEuclidean(entity.x - tX, entity.y - tY);
						for (let XX = -1; XX <= 1; XX++) {
							for (let YY = -1; YY <= 1; YY++) {
								if ((XX != 0 || YY != 0) && KinkyDungeonNoEnemy(entity.x + XX, entity.y + YY, true) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(entity.x + XX, entity.y + YY))
									&& (entity.x + XX != tX || entity.y + YY != tY)
									&& KDistEuclidean(entity.x + XX - tX, entity.y + YY - tY) <= dist + 0.1) slots.push({x:XX, y:YY});
							}
						}
						if (slots.length > 0) {
							let slot = slots[Math.floor(KDRandom() * slots.length)];
							cast.mx = slot.x;
							cast.my = slot.y;
							moveDirection.x = slot.x;
							moveDirection.y = slot.y;
						} else {
							cast.mx = moveDirection.x;
							cast.my = moveDirection.y;
							if (entity.x + cast.mx == tX && entity.y + cast.my == tY) {
								cast.tx += moveDirection.x;
								cast.ty += moveDirection.y;
							}
						}
					}
				} else {
					cast.mx = moveDirection.x;
					cast.my = moveDirection.y;
				}

			}
			if (cast.aimAtTarget && KinkyDungeonEnemyAt(targetX, targetY) && KDCanSeeEnemy(KinkyDungeonEnemyAt(targetX, targetY), KDistEuclidean(entity.x - targetX, entity.y - targetY))) {
				cast.targetID = KinkyDungeonEnemyAt(targetX, targetY).id;
			}
		}


		if (spell.type == "bolt") {
			let size = (spell.size) ? spell.size : 1;
			let xx = entity.x;
			let yy = entity.y;
			//noiseX = entity.x;
			//noiseY = entity.y;
			if (!spell.noDirectionOffset) {
				if (!bullet || (bullet.spell && bullet.spell.cast && bullet.spell.cast.offset)) {
					xx += moveDirection.x;
					yy += moveDirection.y;
				}
			}

			if (spell.effectTilePre) {
				KDCreateAoEEffectTiles(tX-entity.x,tY - entity.y, spell.effectTilePre, spell.effectTileDurationModPre, (spell.aoe) ? spell.aoe : 0.5);
			}
			let b = KinkyDungeonLaunchBullet(xx, yy,
				tX-entity.x,tY - entity.y,
				speed, {noSprite: spell.noSprite, faction: faction, name:spell.name, block: spell.block, width:size, height:size, summon:spell.summon,
					targetX: tX, targetY: tY,
					source: entity?.player ? -1 : entity?.id, cast: cast, dot: spell.dot,
					bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
					bulletSpin: spell.bulletSpin,
					effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
					effectTileTrail: spell.effectTileTrail, effectTileDurationModTrail: spell.effectTileDurationModTrail, effectTileTrailAoE: spell.effectTileTrailAoE,
					passthrough: spell.noTerrainHit, noEnemyCollision: spell.noEnemyCollision, alwaysCollideTags: spell.alwaysCollideTags, nonVolatile:spell.nonVolatile, noDoubleHit: spell.noDoubleHit,
					pierceEnemies: spell.pierceEnemies, piercing: spell.piercing, events: spell.events,
					lifetime:miscast || selfCast ? 1 : (spell.bulletLifetime ? spell.bulletLifetime : 1000), origin: {x: entity.x, y: entity.y}, range: spellRange, hit:spell.onhit,
					damage: {evadeable: spell.evadeable,  noblock: spell.noblock, damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, bindEff: spell.bindEff,
						shield_crit: spell?.shield_crit, // Crit thru shield
						shield_stun: spell?.shield_stun, // stun thru shield
						shield_freeze: spell?.shield_freeze, // freeze thru shield
						shield_bind: spell?.shield_bind, // bind thru shield
						shield_snare: spell?.shield_snare, // snare thru shield
						shield_slow: spell?.shield_slow, // slow thru shield
						shield_distract: spell?.shield_distract, // Distract thru shield
						shield_vuln: spell?.shield_vuln, // Vuln thru shield
						bind: spell.bind, crit: spell.crit, bindcrit: spell.bindcrit, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags}, spell: spell}, miscast);
			b.visual_x = entity.x;
			b.visual_y = entity.y;
			data.bulletfired = b;
		} else if (spell.type == "inert" || spell.type == "dot") {
			let sz = spell.size;
			if (!sz) sz = 1;
			if (spell.meleeOrigin) {
				if (!spell.noDirectionOffset) {
					tX = entity.x + moveDirection.x;
					tY = entity.y + moveDirection.y;
				} else {
					tX = entity.x;
					tY = entity.y;
				}
			}
			let b = KinkyDungeonLaunchBullet(tX, tY,
				moveDirection.x,moveDirection.y,
				0, {
					noSprite: spell.noSprite, faction: faction, name:spell.name, block: spell.block, width:sz, height:sz, summon:spell.summon,
					targetX: tX, targetY: tY,
					source: entity?.player ? -1 : entity?.id, lifetime:spell.delay +
						(spell.delayRandom ? Math.floor(KDRandom() * spell.delayRandom) : 0), cast: cast, dot: spell.dot, events: spell.events, alwaysCollideTags: spell.alwaysCollideTags,
					bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
					bulletSpin: spell.bulletSpin,
					passthrough:(spell.CastInWalls || spell.WallsOnly || spell.noTerrainHit), hit:spell.onhit, noDoubleHit: spell.noDoubleHit, effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
					damage: spell.type == "inert" ? null : {evadeable: spell.evadeable, noblock: spell.noblock,  damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff,
						shield_crit: spell?.shield_crit, // Crit thru shield
						shield_stun: spell?.shield_stun, // stun thru shield
						shield_freeze: spell?.shield_freeze, // freeze thru shield
						shield_bind: spell?.shield_bind, // bind thru shield
						shield_snare: spell?.shield_snare, // snare thru shield
						shield_slow: spell?.shield_slow, // slow thru shield
						shield_distract: spell?.shield_distract, // Distract thru shield
						shield_vuln: spell?.shield_vuln, // Vuln thru shield
						bindEff: spell.bindEff,
						bind: spell.bind, crit: spell.crit, bindcrit: spell.bindcrit, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags}, spell: spell
				}, miscast);
			data.bulletfired = b;
		} else if (spell.type == "hit") {
			let sz = spell.size;
			if (!sz) sz = 1;
			if (spell.meleeOrigin) {
				if (!spell.noDirectionOffset) {
					tX = entity.x + moveDirection.x;
					tY = entity.y + moveDirection.y;
				} else {
					tX = entity.x;
					tY = entity.y;
				}
			}
			let b = {x: tX, y:tY,
				vx: moveDirection.x,vy: moveDirection.y, born: 1,
				bullet: {noSprite: spell.noSprite, faction: faction, name:spell.name, block: spell.block, width:sz, height:sz, summon:spell.summon,
					targetX: tX, targetY: tY,
					source: entity?.player ? -1 : entity?.id, lifetime:spell.lifetime, cast: cast, dot: spell.dot, events: spell.events, aoe: spell.aoe,
					passthrough:(spell.CastInWalls || spell.WallsOnly || spell.noTerrainHit), hit:spell.onhit, noDoubleHit: spell.noDoubleHit, effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
					damage: {evadeable: spell.evadeable, noblock: spell.noblock,  damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, bindEff: spell.bindEff,
						shield_crit: spell?.shield_crit, // Crit thru shield
						shield_stun: spell?.shield_stun, // stun thru shield
						shield_freeze: spell?.shield_freeze, // freeze thru shield
						shield_bind: spell?.shield_bind, // bind thru shield
						shield_snare: spell?.shield_snare, // snare thru shield
						shield_slow: spell?.shield_slow, // slow thru shield
						shield_distract: spell?.shield_distract, // Distract thru shield
						shield_vuln: spell?.shield_vuln, // Vuln thru shield
						bind: spell.bind, bindcrit: spell.bindcrit, crit: spell.crit, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags}, spell: spell}};
			KinkyDungeonBulletHit(b, 1);
			data.bulletfired = b;
		} else if (spell.type == "buff") {
			let aoe = spell.aoe;
			let casted = false;
			if (!aoe) aoe = 0.1;
			if (Math.sqrt((KinkyDungeonPlayerEntity.x - targetX) * (KinkyDungeonPlayerEntity.x - targetX) + (KinkyDungeonPlayerEntity.y - targetY) * (KinkyDungeonPlayerEntity.y - targetY)) <= aoe) {
				for (let buff of spell.buffs) {
					if (buff.player) {
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff);
						if (KinkyDungeonPlayerEntity.x == targetX && KinkyDungeonPlayerEntity.y == targetY) data.target = KinkyDungeonPlayerEntity;
						casted = true;
					}
				}
			}
			for (let e of KDMapData.Entities) {
				if (Math.sqrt((e.x - targetX) * (e.x - targetX) + (e.y - targetY) * (e.y - targetY)) <= aoe) {
					for (let buff of spell.buffs) {
						if (!spell.filterTags || KDMatchTags(spell.filterTags, e)) {
							if (!e.buffs) e.buffs = {};
							KinkyDungeonApplyBuffToEntity(e, buff);
							if (e.x == targetX && e.y == targetY) data.target = e;
							casted = true;
						}
					}
				}
			}
			if (!casted)
				return {result: "Fail", data: data};
		} else if (spell.type == "special") {
			let ret = KinkyDungeonSpellSpecials[spell.special](spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast);
			if (ret) {
				if (!enemy && !bullet && player && ret == "Cast") {
					KinkyDungeonSendEvent("playerCast", data);
					if (spell.school) KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "cast_" + spell.school.toLowerCase(), 1);
					KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "cast", 1);
					if (spell.tags) {
						for (let t of spell.tags) {
							KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "cast_" + t, 1);
						}
					}
					if (data.channel) {
						KinkyDungeonSetFlag("channeling", data.channel);
						KDGameData.SlowMoveTurns = Math.max(KDGameData.SlowMoveTurns, data.channel);
						KinkyDungeonSleepTime = CommonTime() + 200;
					}
					if (spell.components) {
						for (let comp of spell.components) {
							if (KDSpellComponentTypes[comp].cast)
								KDSpellComponentTypes[comp].cast(spell, data);
						}
					}
					KinkyDungeonSendEvent("afterPlayerCast", data);
				}
				return {result: ret, data: data};
			}
		}
	}

	tX = originaltX;
	tY = originaltY;

	if (spell.extraCast) {
		for (let extraCast of spell.extraCast)
			KinkyDungeonCastSpell(targetX, targetY, KinkyDungeonFindSpell(extraCast.spell, true), undefined, undefined, undefined);
	}

	/*if (spell.noise && !(spell.delay > 0)) {
		KinkyDungeonMakeNoise(spell.noise, noiseX, noiseY);
	}*/

	if (!enemy && !bullet && player) { // Costs for the player
		KinkyDungeonSetFlag("PlayerCombat", 8);

		if (data.targetingSpellItem) {
			KinkyDungeonChangeConsumable(KinkyDungeonTargetingSpellItem, -(KinkyDungeonTargetingSpellItem.useQuantity ? KinkyDungeonTargetingSpellItem.useQuantity : 1));
			KinkyDungeonTargetingSpellItem = null;
			if (!spell.noAggro)
				KinkyDungeonAggroAction('item', {});
		} else if (data.targetingSpellWeapon) {
			let special = KinkyDungeonPlayerDamage ? KinkyDungeonPlayerDamage.special : null;
			if (special) {
				let energyCost = KinkyDungeonPlayerDamage.special.energyCost;
				if (KDGameData.AncientEnergyLevel < energyCost) return {result: "Fail", data: data};
				if (energyCost) KinkyDungeonChangeCharge(- energyCost);

				KinkyDungeonSendEvent("playerCastSpecial", data);
				KinkyDungeonSendEvent("afterPlayerCastSpecial", data);
			}
			KinkyDungeonTargetingSpellWeapon = null;
			if (!spell.noAggro)
				KinkyDungeonAggroAction('item', {});
		} else {
			if (!spell.noAggro)
				KinkyDungeonAggroAction('magic', {});
			if (spell.school) KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "cast_" + spell.school.toLowerCase(), 1);
		}
		KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (data.channel ? data.channel - 1 : 0));
		KDSendSpellCast(spell.name);

		KinkyDungeonSendEvent("playerCast", data);

		//let cost = spell.staminacost ? spell.staminacost : KinkyDungeonGetCost(spell.level);

		//KinkyDungeonStatWillpowerExhaustion += spell.exhaustion + 1;
		KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "cast", 1);
		if (spell.tags) {
			for (let t of spell.tags) {
				KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "cast_" + t, 1);
			}
		}
		KinkyDungeonChangeMana(-data.manacost);
		if (spell.staminacost) KinkyDungeonChangeStamina(-spell.staminacost, false, true);
		if (data.channel) {
			KinkyDungeonSetFlag("channeling", data.channel);
			KDGameData.SlowMoveTurns = Math.max(KDGameData.SlowMoveTurns, data.channel);
			KinkyDungeonSleepTime = CommonTime() + 200;
		}
		if (spell.components) {
			for (let comp of spell.components) {
				if (KDSpellComponentTypes[comp].cast)
					KDSpellComponentTypes[comp].cast(spell, data);
			}
		}
		KinkyDungeonSendEvent("afterPlayerCast", data);
		KinkyDungeonLastAction = "Spell";
		KinkyDungeonMiscastPityModifier = 0;
	} else {
		KinkyDungeonSendEvent("spellCast", data);
	}

	return {result: "Cast", data: data};
}

function KinkyDungeonClickSpellChoice(I, CurrentSpell) {
	// Set spell choice
	KDSendInput("spellChoice", {I:I, CurrentSpell: CurrentSpell});
	//if (KinkyDungeonTextMessageTime > 0 && KinkyDungeonTextMessagePriority > 3)
	//KinkyDungeonDrawState = "Game";
	if (KinkyDungeonSpellChoicesToggle[I] && KinkyDungeonSpells[KinkyDungeonSpellChoices[I]].cancelAutoMove) {
		KinkyDungeonFastMove = false;
		KinkyDungeonFastMoveSuppress = false;
	}
}

function KinkyDungeonClickItemChoice(I, name) {
	KDSendInput("itemChoice", {I:I, name: name});
}

function KinkyDungeonHandleMagic() {
	//if (KinkyDungeonPlayer.CanInteract()) { // Allow turning pages
	let xOffset = -125;


	if (KinkyDungeonSpells[KinkyDungeonCurrentPage] && !KinkyDungeonPreviewSpell) {

		if (MouseIn(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale * 0.5 - 200, canvasOffsetY_ui - 70 + 483*KinkyDungeonBookScale, 400, 60)) {
			KDSendInput("spellCastFromBook", {CurrentSpell: KinkyDungeonCurrentPage});
			KinkyDungeonTargetingSpell = KinkyDungeonHandleSpellCast(KinkyDungeonSpells[KinkyDungeonCurrentPage]);
			KDModalArea = false;
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = null;
			KinkyDungeonDrawState = "Game";
		}
	} else if (KinkyDungeonPreviewSpell && MouseIn(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 40, canvasOffsetY_ui + 125, 225, 60)) {
		if (KinkyDungeonPreviewSpell.hideLearned) KinkyDungeonDrawState = "MagicSpells";
		KDSendInput("spellLearn", {SpellName: KinkyDungeonPreviewSpell.name});
		return true;
	}

	KDConfirmClearSpells = false;

	return true;
}

function KDGetPrerequisite(spell) {
	if (!spell.prerequisite) return "";
	if (typeof spell.prerequisite === "string") {
		return TextGet("KinkyDungeonSpell" + spell.prerequisite);
	}
	let str = "";
	for (let pr of spell.prerequisite) {
		if (!str) {
			str = TextGet("KinkyDungeonSpell" + pr);
		} else {
			str = str + "/" + TextGet("KinkyDungeonSpell" + pr);
		}
	}
	return str;
}

/**
 *
 * @param {spell} spell
 * @returns {boolean}
 */
function KinkyDungeonCheckSpellPrerequisite(spell) {
	if (!spell) return true;
	if (spell.upcastFrom && !KDHasSpell(spell.upcastFrom)) return false;
	if (spell.blockedBy && spell.blockedBy.some((sp) => {return KDHasSpell(sp);})) return false;
	if (spell.arousalMode && !KinkyDungeonStatsChoice.get("arousalMode")) return false;

	// Prerequisite
	if (!spell.prerequisite) return true;
	if (typeof spell.prerequisite === "string") {
		let spell_prereq = KinkyDungeonSearchSpell(KinkyDungeonSpells, spell.prerequisite);
		if (spell_prereq) return true;
		return false;
	} else {
		for (let pr of spell.prerequisite) {
			let spell_prereq = KinkyDungeonSearchSpell(KinkyDungeonSpells, pr);
			if (spell_prereq) return true;
		}
		return false;
	}
}

// Patch un-translated english string display issue in chinese Language game mode
// the using detect lib from https://github.com/richtr/guessLanguage.js
// i rewrite the origin lib useless callback mode to return mode
// now only fix chinese
function KinkyDungeonDetectLanguageForMaxWidth(str, maxWidthTranslate, maxWidthEnglish) {
	try {
		if (KDBigLanguages.includes(TranslationLanguage) && guessLanguage) {
			let languageName = guessLanguage.name(str);
			// console.log('KinkyDungeonDetectLanguageForMaxWidth languageName', languageName);
			if (languageName === "unknown") {
				return maxWidthTranslate;
			} else if (KDBigLanguages2.includes(languageName)) {
				return maxWidthTranslate;
			} else if (languageName === "English") {
				return maxWidthEnglish;
			} else {
				// if not Chinese then all are english fallback
				return maxWidthEnglish;
			}
		} else {
			return maxWidthEnglish;
		}
	} catch (e) {
		return maxWidthEnglish;
	}
}

// https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
function KinkyDungeonWordWrap(str, maxWidthTranslate, maxWidthEnglish) {
	let newLineStr = "\n";
	let res = '';
	// console.log('KinkyDungeonDetectLanguageForMaxWidth before', str, maxWidth);
	let maxWidth = KinkyDungeonDetectLanguageForMaxWidth(str, maxWidthTranslate, maxWidthEnglish);
	// console.log('KinkyDungeonDetectLanguageForMaxWidth after', maxWidth);

	// Check language
	if (maxWidth == maxWidthTranslate){
		//CJK
		while (str.length > maxWidth) {
			let found = false;
			let maxCJKWidth = maxWidth;

			for (let i = 0; i <= maxCJKWidth+1; i++) {
				//Numbers are calculated as 0.5 characters,Space are calculated as 0 characters
				if (KinkyDungeonTestWhite(str.charAt(i),"Num")) {maxCJKWidth += 0.5;}
				if (KinkyDungeonTestWhite(str.charAt(i),"English")) {maxCJKWidth += 1;}
				if (KinkyDungeonTestWhite(str.charAt(i),"CJKP") && (maxCJKWidth-i) <= 2) {
					//Inserts new line at first punctuation and seventh character of the line
					res = res + [str.slice(0, i+1), newLineStr].join('');
					str = str.slice(i + 1);
					found = true;
					break;
				}
			}

			//Round up
			maxCJKWidth = Math.ceil(maxCJKWidth);

			if (!found) {
				if ((str.length - maxCJKWidth) <= 2) {
					//If the last line does not satisfy at least 2 characters, the last 2 characters are moved to the previous line
					res += [str.slice(0, maxCJKWidth+3), newLineStr].join('');
					str = str.slice(maxCJKWidth+3);
				} else if ((str.length - maxCJKWidth) <= 5){
					//If the last line does not satisfy at least 5 characters, the last character of the previous line is moved to the last line
					res += [str.slice(0, maxCJKWidth-1), newLineStr].join('');
					str = str.slice(maxCJKWidth-1);
				} else {
					res += [str.slice(0, maxCJKWidth), newLineStr].join('');
					str = str.slice(maxCJKWidth);
				}
			}
		}
	} else {
		//Engilsh
		while (str.length > maxWidth) {
			let found = false;
			if (str.slice(0, maxWidth).indexOf("\n") >= 0) {
				let i = str.indexOf("\n");
				res = res + [str.slice(0, i), newLineStr].join('');
				str = str.slice(i + 1);
				found = true;
			} else
			// Inserts new line at first whitespace of the line
				for (let i = maxWidth - 1; i >= 0; i--) {
					if (KinkyDungeonTestWhite(str.charAt(i),"English")) {
						res = res + [str.slice(0, i), newLineStr].join('');
						str = str.slice(i + 1);
						found = true;
						break;
					}
				}
			// Inserts new line at maxWidth position, the word is too long to wrap
			if (!found) {
				res += [str.slice(0, maxWidth), newLineStr].join('');
				str = str.slice(maxWidth);
			}

		}
	}


	return res + str;
}

function KinkyDungeonTestWhite(x,language) {
	if (language == "English") {
		let white = new RegExp(/^\s$/);
		return white.test(x.charAt(0));
	}
	if (language == "CJKP") {
		return CJKcheck(x.charAt(0),3,"test");
	}
	if (language == "Num") {
		let white = new RegExp(/^[0-9.]$/);
		return white.test(x.charAt(0));
	}
}

function KDSchoolColor(school) {
	switch (school) {
		case "Elements": return "#ff4444";
		case "Conjure": return "#77cc99";
		case "Illusion": return "#8877ff";
	}

	return KDTextTan;
}

function KinkyDungeonDrawMagic() {
	KinkyDungeonDrawMessages(true);
	let xOffset = -125;

	FillRectKD(kdcanvas, kdpixisprites, "mainmagicbg", {
		Left: canvasOffsetX_ui + xOffset + 40,
		Top: canvasOffsetY_ui - 60,
		Width: 1965 - (canvasOffsetX_ui + 40),
		Height: 815,
		Color: "#000000",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.3
	});
	DrawRectKD(kdcanvas, kdpixisprites, "mainmagicbg2", {
		Left: canvasOffsetX_ui + xOffset + 40,
		Top: canvasOffsetY_ui - 60,
		Width: 1965 - (canvasOffsetX_ui + 40),
		Height: 815,
		Color: "#000000",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.9
	});
	KDDraw(kdcanvas, kdpixisprites, "magicbook", KinkyDungeonRootDirectory + "MagicBook.png", canvasOffsetX_ui + xOffset, canvasOffsetY_ui, 640*KinkyDungeonBookScale, 483*KinkyDungeonBookScale);

	if (KinkyDungeonSpells[KinkyDungeonCurrentPage] || KinkyDungeonPreviewSpell) {
		let spell = KinkyDungeonPreviewSpell ? KinkyDungeonPreviewSpell : KinkyDungeonSpells[KinkyDungeonCurrentPage];

		let SchoolColor = KDTextTan;
		if (spell.school) SchoolColor = KDSchoolColor(spell.school);

		if (!spell.passive)
			KDDraw(kdcanvas, kdpixisprites, "kdspellPreview", KinkyDungeonRootDirectory + "Spells/" + spell.name + ".png",
				canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35 - 100, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 45, 200, 200, undefined, {
					zIndex: 129,
				}, undefined, undefined, undefined, true);


		DrawTextFitKD(TextGet("KinkyDungeonSpell"+ spell.name), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5, 640*KinkyDungeonBookScale * 0.35, "#000000", SchoolColor);
		DrawTextFitKD(TextGet("KinkyDungeonSpellsSchool" + spell.school), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 40, 640*KinkyDungeonBookScale * 0.35, "#000000", SchoolColor);

		if (spell.prerequisite) {
			DrawTextFitKD(TextGet("KDPrerequisite"), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale*0.6 + 80, 640*KinkyDungeonBookScale * 0.35, KDTextGray0, KDTextTan, 24);
			DrawTextFitKD(KDGetPrerequisite(spell), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale*0.6 + 105, 640*KinkyDungeonBookScale * 0.35, KDTextGray0, KDTextTan, 24);
		}

		if (spell.upcastFrom) {
			DrawTextFitKD(TextGet("KDUpcastFrom").replace("SPELL", TextGet("KinkyDungeonSpell" + spell.upcastFrom)),
				canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale*0.6 + 25, 640*KinkyDungeonBookScale * 0.35, KDTextGray0, KDTextTan, 24);
			DrawTextFitKD(TextGet("KDUpcastLevel").replace("LEVEL", "" + spell.upcastLevel),
				canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale*0.6, 640*KinkyDungeonBookScale * 0.35, KDTextGray0, KDTextTan, 24);
		}

		if (KinkyDungeonPreviewSpell)
			DrawTextKD(TextGet("KinkyDungeonMagicCost") + KinkyDungeonGetCost(spell), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale*0.6 + 185, KDTextGray0, KDTextTan, 24);
		DrawTextKD(TextGet("KinkyDungeonMagicManaCost") + (spell.manacost * 10), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale*0.6 + 160, KDTextGray0, KDTextTan, 24);
		let textSplit = KinkyDungeonWordWrap(TextGet("KinkyDungeonSpellDescription"+ spell.name).replace(/[|]+/g, "\n").replace("DamageDealt", "" + (spell.power * 10)).replace("Duration", spell.time).replace("LifeTime", spell.lifetime).replace("DelayTime", spell.delay).replace("BlockAmount", "" + (10 * spell.block)), 14, 32).split('\n');

		let i = 0;
		for (let N = 0; N < textSplit.length; N++) {
			DrawTextKD(textSplit[N],
				canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale*(1-1/3), canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 36, KDTextGray0, KDTextTan, 24); i++;}

		i = 0;
		if (spell.components?.length > 0) {

			for (let comp of spell.components) {
				DrawTextKD(KDSpellComponentTypes[comp].stringLong(spell), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale*(1-1/3), canvasOffsetY_ui + 483*KinkyDungeonBookScale/2 + 215 - 40*i, KDTextGray0, KDTextTan); i++;
			}
			DrawTextKD(TextGet("KinkyDungeonComponents"), canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale*(1-1/3), canvasOffsetY_ui + 483*KinkyDungeonBookScale/2 + 215 - 40*i, "#000000", KDTextTan); i = 1;

		}

		if (!KinkyDungeonPreviewSpell) {

			if (!spell.passive && !spell.upcastFrom) {
				KDDrawHotbar(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 40, canvasOffsetY_ui + 50, spell.name, (I) => {
					if (KinkyDungeonSpells[KinkyDungeonSpellChoices[I]] == spell) {
						KDSendInput("spellRemove", {I:I});
					} else {
						if (KinkyDungeonSpellChoices.includes(KinkyDungeonCurrentPage)) {
							KDSendInput("spellRemove", {I:KinkyDungeonSpellChoices.indexOf(KinkyDungeonCurrentPage)});
						}
						KinkyDungeonClickSpellChoice(I, KinkyDungeonCurrentPage);
					}
				});
			}


			if (!spell.passive && !(spell.type == "passive") && !spell.upcastFrom)
				DrawButtonVis(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale * 0.5 - 200, canvasOffsetY_ui - 70 + 483*KinkyDungeonBookScale, 400, 60, TextGet("KinkyDungeonSpellCastFromBook")
					.replace("XXX", KinkyDungeonStatsChoice.has("Disorganized") ? "3" : (KinkyDungeonStatsChoice.has("QuickDraw") ? "No" : "1")), "White", "", "", false, true, KDButtonColor);
		} else {
			let cost = KinkyDungeonGetCost(spell);
			DrawButtonVis(canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale + 40, canvasOffsetY_ui + 125, 225, 60, TextGet("KinkyDungeonSpellsBuy"),
				(KinkyDungeonSpellPoints >= cost && KinkyDungeonCheckSpellPrerequisite(spell)) ? "White" : "Pink", "", "");
		}
	}

	if (KinkyDungeonCurrentPage > 0) {
		DrawButtonKDEx("magiclastpage", (bdata) => {
			if (KinkyDungeonCurrentPage > 0) {
				if (KinkyDungeonPreviewSpell) KinkyDungeonPreviewSpell = undefined;
				else {
					KinkyDungeonCurrentPage -= 1;
					for (let i = 0; i < 30; i++)
						if (KinkyDungeonCurrentPage > 0 && KinkyDungeonSpells[KinkyDungeonCurrentPage] && (KinkyDungeonSpells[KinkyDungeonCurrentPage].hide)) KinkyDungeonCurrentPage -= 1;
				}
				return true;
			}
			return true;
		}, true, canvasOffsetX_ui + xOffset + 100, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60, TextGet("KinkyDungeonBookLastPage"), "White", "", "", false, true, KDButtonColor);
	}
	if (KinkyDungeonCurrentPage < KinkyDungeonSpells.length-1) {
		DrawButtonKDEx("magicnextpage", (bdata) => {
			if (KinkyDungeonCurrentPage < KinkyDungeonSpells.length-1) {
				if (KinkyDungeonPreviewSpell) KinkyDungeonPreviewSpell = undefined;
				else {
					KinkyDungeonCurrentPage += 1;
					for (let i = 0; i < 30; i++)
						if (KinkyDungeonSpells[KinkyDungeonCurrentPage] && KinkyDungeonSpells[KinkyDungeonCurrentPage].hide) KinkyDungeonCurrentPage += 1;
				}
				return true;
			}

			return true;
		}, true, canvasOffsetX_ui + xOffset + 640*KinkyDungeonBookScale - 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60, TextGet("KinkyDungeonBookNextPage"), "White", "", "", false, true, KDButtonColor);
	}
	if (KDSwapSpell != -1) {
		DrawTextKD(TextGet("KinkyDungeonMagicSpellsQuick").replace("SPELLNAME", TextGet("KinkyDungeonSpell" + KinkyDungeonSpells[KinkyDungeonSpellChoices[KDSwapSpell]].name)), canvasOffsetX_ui + xOffset + 600, 900, "white", KDTextGray0);
	} else {
		DrawTextKD(TextGet("KinkyDungeonSpellsLevels")
			.replace("SPELLPOINTS", "" + KinkyDungeonSpellPoints), canvasOffsetX_ui + xOffset + 600, 890, "white", KDTextGray0);
	}

}


let selectedFilters = ["learnable"];
let genericfilters = ['learnable', 'unlearned', 'learned', 'noupgrade', 'yesupgrade', "upcast"];


let KDSpellListIndex = 0;
let KDSpellListIndexVis = 0;
let KDMaxSpellPerColumn = 8;
let KDMaxSpellYY = 480;

function KDFilterSpellPages() {
	if (!KDGameData.AllowedSpellPages) KDGameData.AllowedSpellPages = {};
	let pages = [];
	for (let i = 0; i < KinkyDungeonLearnableSpells.length; i++) {
		if (KDGameData.AllowedSpellPages[KinkyDungeonSpellPages[i]] || KinkyDungeonSpellPagesDefault[KinkyDungeonSpellPages[i]]) {
			pages.push(KinkyDungeonLearnableSpells[i]);
		}
	}
	return pages;
}
function KDFilterSpellPageNames() {
	if (!KDGameData.AllowedSpellPages) KDGameData.AllowedSpellPages = {};
	let pages = [];
	for (let i = 0; i < KinkyDungeonLearnableSpells.length; i++) {
		if (KDGameData.AllowedSpellPages[KinkyDungeonSpellPages[i]] || KinkyDungeonSpellPagesDefault[KinkyDungeonSpellPages[i]]) {
			pages.push(KinkyDungeonSpellPages[i]);
		}
	}
	return pages;
}

function KDCorrectCurrentSpellPage(pages) {
	let ret = 0;
	for (let i = 0; i < KinkyDungeonCurrentSpellsPage; i++) {
		if (!KDGameData.AllowedSpellPages[KinkyDungeonSpellPages[i]]) {
			ret += 1;
		}
	}
	return ret;
}

let KDMagicFilter = "";

/**
 *
 * @param {spell} spell
 * @returns {boolean}
 */
function KDFilterSpell(spell) {
	let prereq = spell ? KinkyDungeonCheckSpellPrerequisite(spell) : false;
	let prereqHost = spell ? prereq ||
		(spell.upcastFrom && KinkyDungeonCheckSpellPrerequisite(KinkyDungeonFindSpell(spell.upcastFrom))) ||
		(KDToggles.ShowSameCatSpells && typeof spell.prerequisite == "string" && spell.prerequisite && !KinkyDungeonFindSpell(spell.prerequisite)?.increasingCost && KinkyDungeonCheckSpellPrerequisite(KinkyDungeonFindSpell(spell.prerequisite)))
		: false;
	let learned = spell ? KinkyDungeonSpellIndex(spell.name) >= 0 : false;
	// Youve learned the spell tree
	let upgrade = spell ? spell.passive : false;
	let passive = spell ? spell.type == "passive" : false;
	let upcast = spell ? spell.upcastFrom : false;
	return (!spell.hideLearned || !learned)
	&& (!spell.hide)
	&& (!spell.hideUnlearnable || prereq || learned)
	&& (learned || !spell.hideWithout || KDHasSpell(spell.hideWithout))
	&& (!spell.hideWith || !KDHasSpell(spell.hideWith))
	&& (!spell.arousalMode || KinkyDungeonStatsChoice.has("arousalMode"))
	&& (selectedFilters.length == 0 || (selectedFilters.every((element) => {return genericfilters.includes(element) || (spell.tags && spell.tags.includes(element));})))
	&& (!selectedFilters.includes("learnable") || (prereq || learned || prereqHost))
	&& (!selectedFilters.includes("unlearned") || (!learned))
	&& (!selectedFilters.includes("learned") || (learned))
	&& (!selectedFilters.includes("noupgrade") || (!upgrade && !upcast))
	&& (!selectedFilters.includes("yesupgrade") || (upgrade || passive))
	&& (!selectedFilters.includes("upcast") || (upcast))
	&& (!KDMagicFilter
		|| TextGet("KinkyDungeonSpell" + (spell.name)).toLocaleLowerCase().includes(KDMagicFilter.toLocaleLowerCase())
		|| spell.tags?.some((tag) => {return tag.toLocaleLowerCase().includes(KDMagicFilter.toLocaleLowerCase());}));
}

function KinkyDungeonListSpells(Mode) {
	let xOffset = -125;

	FillRectKD(kdcanvas, kdpixisprites, "mainmagicspellsbg", {
		Left: canvasOffsetX_ui + xOffset - 25,
		Top: canvasOffsetY_ui - 150,
		Width: 1990 - (canvasOffsetX_ui),
		Height: 945,
		Color: "#000000",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.3
	});
	DrawRectKD(kdcanvas, kdpixisprites, "mainmagicspellsbg2", {
		Left: canvasOffsetX_ui + xOffset - 25,
		Top: canvasOffsetY_ui - 150,
		Width: 1990 - (canvasOffsetX_ui),
		Height: 945,
		Color: "#000000",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.9
	});

	let i = 0;
	//let ii = 0;
	//let maxY = 560;
	let XX = 0;
	let spacing = 52;
	let subspell_reduction = 20;
	let ypadding = 3;
	let yPad = 120 + MagicSpellsUIShift;
	let buttonwidth = 280;
	let filterWidth = 190;
	let xpadding = 20;
	let col = 0;
	let ypadding_min = -2;

	let weight = 5;
	KDSpellListIndexVis = (KDSpellListIndex + KDSpellListIndexVis * (weight-1)) / weight;

	let pages = KDFilterSpellPages();
	let currentPage = Math.min(KinkyDungeonCurrentSpellsPage, pages.length - 1);
	let spellPages = currentPage == 0 ?
		[ // Dynamically generate known spells
			KinkyDungeonSpells.filter((spell) => {return !spell.passive && spell.components && spell.components[0] == "Verbal";}).map((spell) => {return spell.name;}),
			KinkyDungeonSpells.filter((spell) => {return !spell.passive && spell.components && spell.components[0] == "Arms";}).map((spell) => {return spell.name;}),
			KinkyDungeonSpells.filter((spell) => {return !spell.passive && spell.components && spell.components[0] == "Legs";}).map((spell) => {return spell.name;}),
			KinkyDungeonSpells.filter((spell) => {return !spell.passive && (!spell.components ||
				(spell.components[0] != "Verbal" && spell.components[0] != "Arms" && spell.components[0] != "Legs"));}).map((spell) => {return spell.name;}),
			KinkyDungeonSpells.filter((spell) => {return spell.passive && (!spell.components ||
				(spell.components[0] != "Verbal" && spell.components[0] != "Arms" && spell.components[0] != "Legs"));}).map((spell) => {return spell.name;}),
		]
		: pages[currentPage];

	if (currentPage == 0 && spellPages[3] && spellPages[4]) {
		spellPages[3] = [...spellPages[3], ...spellPages[4]]
		spellPages.splice(4, 1);
	}
	let pageNames = KDFilterSpellPageNames();
	let columnLabels = KDColumnLabels[currentPage] || (KDGameData.AllowedSpellPages?.length ? KDGameData.AllowedSpellPages[pageNames[currentPage]] : undefined);
	let extraFilters = filtersExtra[currentPage];

	// Draw filters
	let cutoff = false;
	if (Mode == "Draw") {
		let x = 4 * (buttonwidth + xpadding);
		let y = 25 + canvasOffsetY_ui;
		let filterlist = Object.assign([], filters);
		if (extraFilters) {
			for (let ff of extraFilters) {
				filterlist.push(ff);
			}
		}
		// Now we have our total filters, time to draw
		for (let f of filterlist) {
			let ticked = selectedFilters.includes(f);
			DrawButtonKDEx("filter" + f, (bdata) => {
				if (selectedFilters.includes(f))
					selectedFilters.splice(selectedFilters.indexOf(f), 1);
				else
					selectedFilters.push(f);
				return true;
			}, true, canvasOffsetX_ui + xOffset + x + 30, y, filterWidth, 32, TextGet("KinkyDungeonFilter" + f), selectedFilters.includes(f) ? "#ffffff" : "#999999", ticked ? (KinkyDungeonRootDirectory + "UI/Tick.png") : "", "", false, true, KDButtonColor, 22);
			y += 38;
		}
	}

	if (columnLabels) {
		for (let column = 0; column < columnLabels.length; column++) {
			let x = canvasOffsetX_ui + xOffset + column * (buttonwidth + xpadding);
			let y = yPad - 40 + canvasOffsetY_ui;
			DrawTextKD(TextGet("KinkyDungeonColumn" + columnLabels[column]), x + buttonwidth/2, y + 20, "#ffffff", KDTextGray0);
		}
	}


	let longestList = 0;
	for (let pg of spellPages) {
		longestList = Math.max(longestList, pg.filter(
			(sp) => {
				return KDFilterSpell(KinkyDungeonFindSpell(sp));
			}
		).length);
	}
	if (KDSpellListIndex > longestList) KDSpellListIndex = 0;

	DrawTextFitKD(
		TextGet("KDMagicFilter")
			.replace("ITMNS", TextGet("KinkyDungeonCategoryFilter" + KinkyDungeonCurrentFilter)),
		1720 + xOffset + 200/2, 120 - 20, 200, "#ffffff", KDTextGray0, 18, "center");
	let TF = KDTextField("MagicFilter", 1720 + xOffset, 120, 200, 45, "text", "", "45");
	if (TF.Created) {
		KDMagicFilter = "";
		TF.Element.oninput = (event) => {
			KDMagicFilter = ElementValue("MagicFilter");

		};
	}

	// Draw the spells themselves
	for (let pg of spellPages) {
		let column = col;//Math.floor((spacing * i) / (maxY));
		i = 0;
		let iii = 0;

		let YY = 0;
		for (let sp of pg) {
			let spell = KinkyDungeonFindSpell(sp, false);

			if (spell
				&& (KDSwapSpell == -1 || KinkyDungeonSpellIndex(spell.name) >= 0)
				//&& i < KDMaxSpellPerColumn
				&& YY < KDMaxSpellYY + spacing
				&& KDFilterSpell(spell)
			) {

				if (iii < Math.round(KDSpellListIndexVis)) {
					iii += 1;
					continue;
				}
				XX = column * (buttonwidth + xpadding);
				//ii = i;// - column * Math.ceil(maxY / spacing);

				if (!spell.upcastFrom && i > 0) {
					YY += ypadding;
				}

				let cost = KinkyDungeonGetCost(spell);
				let suff = `${cost}`;
				let yy = yPad + canvasOffsetY_ui + YY + (spell.upcastFrom ? 2 : 0);
				let h = spacing - ypadding + (spell.upcastFrom ? -subspell_reduction : 0);
				let w = buttonwidth + (spell.upcastFrom ? -30 : 0);
				let xx = canvasOffsetX_ui + xOffset + XX + (spell.upcastFrom ? 30 : 0);

				if (Mode == "Draw") {
					let color = KDSwapSpell == -1 ? "#bcbcbc" : "#777777";
					let index = KinkyDungeonSpellIndex(spell.name);
					if (index >= 0 && (KDSwapSpell == -1 || !KinkyDungeonSpellChoices.includes(index))) {
						color = "#ffffff";
						suff = "";
					} else if (!KinkyDungeonCheckSpellPrerequisite(spell)) {
						color = "#555555";
						//suff = "";
					}
					if (!spell.passive)
						KDDraw(kdcanvas, kdpixisprites, "spIcon" + spell.name, KinkyDungeonRootDirectory + "Spells/" + spell.name + ".png",
							xx,
							yy,
							h,
							h,
							undefined,
							{
								zIndex: 110,
								alpha: index >= 0 ? 1.0 : 0.5
							},
						);
					if (index >= 0)
						KDDraw(kdcanvas, kdpixisprites, "spIconTick" + spell.name, KinkyDungeonRootDirectory + "UI/" + "CheckSmall" + ".png",
							xx + w - 30,
							yy + h/2-15,
							30,
							30,
							undefined,
							{
								zIndex: 110,
							},
						);

					DrawButtonKDExScroll("spellmagiclist" + spell.name,
						(amount) => {
							KDSpellListIndex = Math.max(0, Math.min(longestList - KDMaxSpellPerColumn + 1,
								KDSpellListIndex + Math.round(amount/h)));
						},
						(bdata) => {
							if (spell) {
								if (KDSwapSpell == -1) {
									KinkyDungeonSetPreviewSpell(spell);
								} else if (!spell.upcastFrom) {
									let ind = KinkyDungeonSpellIndex(spell.name);
									if (!KinkyDungeonSpellChoices.includes(ind)) {
										KinkyDungeonClickSpellChoice(KDSwapSpell, ind);
										KinkyDungeonDrawState = "Game";
									}
								}
								return true;
							}
						}, true,
						xx,
						yy,
						w,
						h,
						"", color,
						"", "", false, true, (index >= 0) ? "#070707" : "#040404",
						// Image: KinkyDungeonSpellChoices.includes(index) ? (KinkyDungeonRootDirectory + "UI/Tick.png") : ""
						(spell.upcastFrom ? 20 : 24),
						false,
						{
							alpha: index >= 0 ? 0.9 : 0.9,
							zIndex: 20,
						});
					DrawTextFitKD(TextGet("KinkyDungeonSpell" + spell.name),
						xx + h + 2 + (spell.upcastFrom ? 0 : 8),
						yy + h/2,
						w - h*1.75, color, undefined, (spell.upcastFrom ? 18 : 22), "left", undefined, undefined, false);
					DrawTextFitKD(suff,
						xx + w - 8,
						yy + h/2,
						h, KinkyDungeonSpellPoints >= cost ? color : "#ff5555", undefined, 20, "right", undefined, undefined, false);
				} else if (Mode == "Click") {
					if (MouseIn(xx,
						yy,
						w,
						h,)) return spell;
				}
				i++;
				YY += h + ypadding_min;
			} else if (YY >= KDMaxSpellYY + spacing) {cutoff = true;}
		}
		col++;
	}
	
	if ( KDSpellListIndex > 0)
		DrawButtonKDEx("spellsUp", (bdata) => {
			KDSpellListIndex = Math.max(0, KDSpellListIndex - 3);
			return true;
		}, KDSpellListIndex > 0, 910, 800, 90, 40, "", KDSpellListIndex > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.png");
	if (cutoff)
		DrawButtonKDEx("spellsDown", (bdata) => {
			KDSpellListIndex = Math.max(0, Math.min(longestList - KDMaxSpellPerColumn + 1, KDSpellListIndex + 3));
			return true;
		}, KDSpellListIndex < longestList - KDMaxSpellPerColumn + 1, 1160, 800, 90, 40, "", KDSpellListIndex < longestList - KDMaxSpellPerColumn + 1 ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.png");


	let procList = pageNames;
	let adjLists = GetAdjacentList(procList, currentPage, 1);
	let left = adjLists.left;
	let right = adjLists.right;

	let center = canvasOffsetX_ui + xOffset + 705;
	let tabWidth = 200;
	let tabHeight = 35;
	
	if (left.length < 3) center -= tabWidth * (3 - left.length);
	else if (right.length < 3) center += tabWidth * (3 - right.length);

	DrawButtonVis(
		center - tabWidth/2, 30, tabWidth, tabHeight + 10,
		TextGet("KinkyDungeonSpellsPage" + pageNames[currentPage]),
		//TextGet("KinkyDungeonSpellsPage" + KinkyDungeonCurrentSpellsPage)
		//.replace("NUM", "" + (currentPage + 1))
		//.replace("TOTAL", "" + (pages.length)) + ": " + TextGet("KinkyDungeonSpellsPage" + pageNames[currentPage]),
		"#ffffff", "", undefined, undefined, false, KDButtonColor);

	drawHorizList(right, center + tabWidth + 1, 40, 200, tabHeight, 3 + Math.max(0, 3 - left.length), 24, (data) => {
		return (bdata) => {
			KinkyDungeonCurrentSpellsPage = procList.indexOf(data.name);
			return true;
		};
	}, "KinkyDungeonSpellsPage", false);
	drawHorizList(left.reverse(), center - tabWidth - 1, 40, 200, tabHeight, 3 + Math.max(0, 3 - right.length), 24, (data) => {
		return (bdata) => {
			KinkyDungeonCurrentSpellsPage = procList.indexOf(data.name);
			return true;
		};
	}, "KinkyDungeonSpellsPage", true);

	return undefined;
}

let MagicSpellsUIShift = -80;

function KinkyDungeonDrawMagicSpells() {
	let xOffset = -125;

	KinkyDungeonListSpells("Draw");



	//DrawTextKD(TextGet("KinkyDungeonSpellsPoints") + KinkyDungeonSpellPoints, 650, 900, "white", KDTextGray0);

	/*MainCanvas.beginPath();
	MainCanvas.lineWidth = 3;
	MainCanvas.strokeStyle = KDBorderColor;
	MainCanvas.moveTo(canvasOffsetX_ui + xOffset, canvasOffsetY_ui + 70 + MagicSpellsUIShift);
	MainCanvas.lineTo(canvasOffsetX_ui + xOffset + 1150, canvasOffsetY_ui + 70 + MagicSpellsUIShift);
	MainCanvas.stroke();
	MainCanvas.closePath();

	MainCanvas.textAlign = "center";*/
	if (KDSwapSpell != -1) {
		DrawTextKD(TextGet(
			"KinkyDungeonMagicSpellsQuick").replace(
			"SPELLNAME",
				(KinkyDungeonSpells[KinkyDungeonSpellChoices[KDSwapSpell]]) ?
				TextGet("KinkyDungeonSpell" + KinkyDungeonSpells[KinkyDungeonSpellChoices[KDSwapSpell]].name)
				: TextGet("KinkyDungeonSpellNone")),
		canvasOffsetX_ui + xOffset + 600, 900, "white", KDTextGray0);
	} else {
		DrawTextKD(TextGet("KinkyDungeonSpellsLevels")
			.replace("SPELLPOINTS", "" + KinkyDungeonSpellPoints), canvasOffsetX_ui + xOffset + 600, 890, "white", KDTextGray0);
	}
	//DrawButtonVis(canvasOffsetX_ui + xOffset + 0, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50, TextGet("KinkyDungeonSpellsPageBackFast"), "White", "", "", false, false, KDButtonColor);
	//DrawButtonVis(canvasOffsetX_ui + xOffset + 1100, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50, TextGet("KinkyDungeonSpellsPageNextFast"), "White", "", "", false, false, KDButtonColor);
	//DrawButtonVis(canvasOffsetX_ui + xOffset + 55, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50, TextGet("KinkyDungeonSpellsPageBack"), "White", "", "", false, false, KDButtonColor);
	//DrawButtonVis(canvasOffsetX_ui + xOffset + 1045, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50, TextGet("KinkyDungeonSpellsPageNext"), "White", "", "", false, false, KDButtonColor);
}


function KinkyDungeonHandleMagicSpells() {
	/*let xOffset = -125;

	let pages = KDFilterSpellPages();

	if (MouseIn(canvasOffsetX_ui + xOffset + 50, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50)) {
		if (KinkyDungeonCurrentSpellsPage > 0) KinkyDungeonCurrentSpellsPage -= 1;
		else KinkyDungeonCurrentSpellsPage = pages.length - 1;
		KDSpellListIndex = 0;
		selectedFilters = selectedFilters.filter((filter) => {
			return filters.includes(filter);
		});
		return true;
	} else if (MouseIn(canvasOffsetX_ui + xOffset + 1045, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50)) {
		if (KinkyDungeonCurrentSpellsPage < pages.length - 1) KinkyDungeonCurrentSpellsPage += 1;
		else KinkyDungeonCurrentSpellsPage = 0;
		KDSpellListIndex = 0;
		selectedFilters = selectedFilters.filter((filter) => {
			return filters.includes(filter);
		});
		return true;
	} else if (MouseIn(canvasOffsetX_ui + xOffset + 0, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50)) {
		if (KinkyDungeonCurrentSpellsPage > 0) {
			if (KinkyDungeonCurrentSpellsPage > 2) KinkyDungeonCurrentSpellsPage -= 3;
			else KinkyDungeonCurrentSpellsPage = 0;
		} else KinkyDungeonCurrentSpellsPage = pages.length - 1;
		KDSpellListIndex = 0;
		selectedFilters = selectedFilters.filter((filter) => {
			return filters.includes(filter);
		});
		return true;
	} else if (MouseIn(canvasOffsetX_ui + xOffset + 1100, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50)) {
		if (KinkyDungeonCurrentSpellsPage < pages.length - 1)  {
			if (KinkyDungeonCurrentSpellsPage < pages.length - 3) KinkyDungeonCurrentSpellsPage += 3;
			else KinkyDungeonCurrentSpellsPage = pages.length - 1;
		}
		else KinkyDungeonCurrentSpellsPage = 0;
		selectedFilters = selectedFilters.filter((filter) => {
			return filters.includes(filter);
		});
		KDSpellListIndex = 0;
		return true;
	}*/

	return true;
}

function KinkyDungeonSpellIndex(Name) {
	for (let i = 0; i < KinkyDungeonSpells.length; i++) {
		if (KinkyDungeonSpells[i].name == Name) return i;
	}
	return -1;
}

function KinkyDungeonSetPreviewSpell(spell) {
	let index = KinkyDungeonSpellIndex(spell.name);
	KinkyDungeonPreviewSpell = index >= 0 ? null : spell;
	if (!KinkyDungeonPreviewSpell) KinkyDungeonCurrentPage = index;
	KinkyDungeonDrawState = "Magic";
}

function KinkyDungeonGetCompList(spell) {
	let ret = "";
	if (spell.components)
		for (let c of spell.components) {
			if (ret) ret = ret + "/";
			ret = ret + (KDSpellComponentTypes[c].stringShort(ret));
		}

	//if (ret)
	//return "(" + ret + ")";
	//else
	return ret;
}

function KinkyDungeonSendMagicEvent(Event, data, forceSpell) {
	if (!KDMapHasEvent(KDEventMapSpell, Event)) return;
	for (let i = 0; i < KinkyDungeonSpellChoices.length; i++) {
		let spell = 
			(KinkyDungeonSpells[KinkyDungeonSpellChoices[i]]
				? KDGetUpcast(KinkyDungeonSpells[KinkyDungeonSpellChoices[i]].name, KDEntityBuffedStat(KinkyDungeonPlayerEntity, "SpellEmpower"))
				: null)
			|| KinkyDungeonSpells[KinkyDungeonSpellChoices[i]];
		if (spell && spell.events) {
			for (let e of spell.events) {
				if (e.trigger == Event && ((KinkyDungeonSpellChoicesToggle[i] && spell.type == "passive") || spell.type != "passive" || e.always || spell.name == forceSpell?.name)) {
					KinkyDungeonHandleMagicEvent(Event, e, spell, data);
				}
			}
		}
	}
	for (let i = 0; i < KinkyDungeonSpells.length; i++) {
		let spell = KinkyDungeonSpells[i];
		if (spell && (spell.passive) && spell.events) {
			for (let e of spell.events) {
				if (e.trigger == Event) {
					KinkyDungeonHandleMagicEvent(Event, e, spell, data);
				}
			}
		}
	}
}


function KDCastSpellToEnemies(fn, tX, tY, spell) {
	let enList = KDNearbyEnemies(tX, tY, spell.aoe);
	let cast = false;

	if (enList.length > 0) {
		for (let en of enList) {
			if (fn(en)) cast = true;
		}
	}

	return cast;
}

/**
 * Returns true if the enemy matches one of the tags
 * @param {string[]} tags
 * @param {entity} entity
 * @returns {boolean}
 */
function KDMatchTags(tags, entity) {
	if (tags) {
		for (let tag of tags) {
			if (entity?.Enemy?.tags[tag]) return true;
		}
	}
	return false;
}


function KinkyDungeonLoadSpellsConfig() {
	let spellsChoice = localStorage.getItem('KinkyDungeonSpellsChoice' + KinkyDungeonSpellsConfig);
	if (spellsChoice) {
		//KinkyDungeonSpellChoices = [];
		KDClearChoices();
		let list = JSON.parse(spellsChoice);
		for (let spell of list) {
			if (KDHasSpell(spell)) {
				KinkyDungeonSpellChoices.push(KinkyDungeonSpells.findIndex((sp) => {
					return sp.name == spell;
				}));
			} else {
				KinkyDungeonSpellChoices.push(-1);
			}

			if (KinkyDungeonInventoryGetConsumable(spell)) {
				KinkyDungeonConsumableChoices.push(spell);
			} else {
				KinkyDungeonConsumableChoices.push("");
			}

			if (KinkyDungeonInventoryGetWeapon(spell)) {
				KinkyDungeonWeaponChoices.push(spell);
			} else {
				KinkyDungeonWeaponChoices.push("");
			}

			if (KinkyDungeonInventoryGet(spell)) {
				KinkyDungeonArmorChoices.push(spell);
			} else {
				KinkyDungeonArmorChoices.push("");
			}
		}
	}
}
function KinkyDungeonSaveSpellsConfig() {
	let list = KinkyDungeonSpellChoices.map((index) => {return KinkyDungeonSpells[index]?.name;});
	for (let i = 0; i < KinkyDungeonSpellChoiceCount; i++) {
		if (KinkyDungeonConsumableChoices[i]) list[i] = KinkyDungeonConsumableChoices[i];
		else if (KinkyDungeonWeaponChoices[i]) list[i] = KinkyDungeonWeaponChoices[i];
		else if (KinkyDungeonArmorChoices[i]) list[i] = KinkyDungeonArmorChoices[i];
	}
	localStorage.setItem('KinkyDungeonSpellsChoice' + KinkyDungeonSpellsConfig, JSON.stringify(list));
}

function KDDrawHotbar(xLoc, yLoc, name, fn) {
	let w = 225;
	let h = 50;
	let x_start = xLoc;
	let y_start = yLoc;
	for (let I = 0; I < KinkyDungeonSpellChoiceCount; I++) {
		let x = x_start + w * Math.floor(I / KinkyDungeonSpellChoiceCountPerPage);
		let y = y_start + h * (I % KinkyDungeonSpellChoiceCountPerPage);

		let spell = "";
		let label = "";
		let armor = "";
		let weapon = "";
		let consumable = "";
		if (KinkyDungeonSpells[KinkyDungeonSpellChoices[I]]) {
			spell = KinkyDungeonSpells[KinkyDungeonSpellChoices[I]].name;
			label = TextGet("KinkyDungeonSpell" + spell);
			KDDraw(kdcanvas, kdpixisprites, "kdspellPreview" + spell, KinkyDungeonRootDirectory + "Spells/" + spell + ".png", x - h, y, h, h);
		} else {
			spell = KinkyDungeonConsumableChoices[I] || KinkyDungeonWeaponChoices[I] || KinkyDungeonArmorChoices[I];
			armor = KinkyDungeonArmorChoices[I];
			if (armor && KinkyDungeonRestraintVariants[armor]) spell = KinkyDungeonRestraintVariants[armor].template;
			weapon = KinkyDungeonWeaponChoices[I];
			if (weapon && KinkyDungeonWeaponVariants[weapon]) spell = KinkyDungeonWeaponVariants[weapon].template;
			consumable = KinkyDungeonConsumableChoices[I];
			if (weapon && KinkyDungeonConsumableVariants[consumable]) spell = KinkyDungeonConsumableVariants[consumable].template;
			if (spell && KDGetItemPreview({name: spell, type: KinkyDungeonConsumableChoices[I] ? Consumable : (armor ? LooseRestraint : Weapon)})) {
				label = TextGet((armor ? "Restraint" : "KinkyDungeonInventoryItem") + spell);
				KDDraw(kdcanvas, kdpixisprites, "kdspellPreview" + spell, KDGetItemPreview({name: spell, type: KinkyDungeonConsumableChoices[I] ? Consumable : (armor ? LooseRestraint : Weapon)}).preview, x - h, y, h, h);
			}
		}

		DrawTextFitKD(`${1 + (I % KinkyDungeonSpellChoiceCountPerPage)}`, x - h, y + h*0.5, 50, "#efefef", "#888888", 18);
		DrawButtonKDEx("SpellSlotBook" + I, (bdata) => {
			fn(I);
			return true;
		}, true, x, y, w - 25 - h, h - 5, label,
		spell == name ? "White" : KDTextGray3, "", "");
	}

	DrawButtonKDEx("KDSpellsClear", (bdata) => {
		if (!KDConfirmClearSpells) {
			KDConfirmClearSpells = true;
			KinkyDungeonSendTextMessage(10, TextGet("KDConfirmSpellsClear"), "#ffffff", 2, true);
		} else {
			KDClearChoices();
		}
		return true;
	}, true, 1800, 940, 190, 50, TextGet("KinkyDungeonClearConfig"), "#ffffff", "");

	DrawButtonKDEx("KDSpellsConfig1", (bdata) => {
		KinkyDungeonSpellsConfig = "1";
		KinkyDungeonLoadSpellsConfig();
		return true;
	}, true, xLoc, 800, 150, 54,
	localStorage.getItem('KinkyDungeonSpellsChoice' + 1) ? TextGet("KinkyDungeonLoadConfig") + "1" : "x", KinkyDungeonSpellsConfig == "1" ? "#ffffff" : "#888888", "");

	DrawButtonKDEx("KDSpellsConfig2", (bdata) => {
		KinkyDungeonSpellsConfig = "2";
		KinkyDungeonLoadSpellsConfig();
		return true;
	}, true, xLoc + 225, 800, w - 25 - h, 54,
	localStorage.getItem('KinkyDungeonSpellsChoice' + 2) ? TextGet("KinkyDungeonLoadConfig") + "2" : "x", KinkyDungeonSpellsConfig == "2" ? "#ffffff" : "#888888", "");

	DrawButtonKDEx("KDSpellsConfig3", (bdata) => {
		KinkyDungeonSpellsConfig = "3";
		KinkyDungeonLoadSpellsConfig();
		return true;
	}, true, xLoc + 450, 800, w - 25 - h, 54,
	localStorage.getItem('KinkyDungeonSpellsChoice' + 2) ? TextGet("KinkyDungeonLoadConfig") + "3" : "x", KinkyDungeonSpellsConfig == "3" ? "#ffffff" : "#888888", "");

	DrawButtonKDEx("KDSaveSpellsConfig1", (bdata) => {
		KinkyDungeonSpellsConfig = "1";
		KinkyDungeonSaveSpellsConfig();
		return true;
	}, true, xLoc, 860, w - 25 - h, 54, TextGet("KinkyDungeonSaveConfig") + "1", KinkyDungeonSpellsConfig == "1" ? "#ffffff" : "#888888", "");

	DrawButtonKDEx("KDSaveSpellsConfig2", (bdata) => {
		KinkyDungeonSpellsConfig = "2";
		KinkyDungeonSaveSpellsConfig();
		return true;
	}, true, xLoc + 225, 860, w - 25 - h, 54, TextGet("KinkyDungeonSaveConfig") + "2", KinkyDungeonSpellsConfig == "2" ? "#ffffff" : "#888888", "");

	DrawButtonKDEx("KDSaveSpellsConfig3", (bdata) => {
		KinkyDungeonSpellsConfig = "3";
		KinkyDungeonSaveSpellsConfig();
		return true;
	}, true, xLoc + 450, 860, w - 25 - h, 54, TextGet("KinkyDungeonSaveConfig") + "3", KinkyDungeonSpellsConfig == "3" ? "#ffffff" : "#888888", "");

}

function KDClearChoices() {
	KinkyDungeonSpellChoices = [];
	KinkyDungeonSpellChoicesToggle = [];
	KinkyDungeonWeaponChoices = [];
	KinkyDungeonArmorChoices = [];
	KinkyDungeonConsumableChoices = [];
}

function KDGetRandomSpell(maxSpellLevel = 4) {
	let spell = null;
	let spellList = [];
	for (let k of Object.keys(KinkyDungeonSpellList)) {
		for (let sp of KinkyDungeonSpellList[k]) {
			if (KinkyDungeonCheckSpellPrerequisite(sp) && sp.school == k && !sp.secret && !sp.passive) {
				for (let iii = 0; iii < maxSpellLevel - sp.level; iii++)
					spellList.push(sp);
			}
		}
	}

	for (let sp of KinkyDungeonSpells) {
		for (let S = 0; S < spellList.length; S++) {
			if (sp.name == spellList[S].name) {
				spellList.splice(S, 1);
				S--;
			}
		}
	}

	spell = spellList[Math.floor(KDRandom() * spellList.length)];

	return spell;
}