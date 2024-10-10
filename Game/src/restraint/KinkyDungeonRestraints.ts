"use strict";
// Escape chances
// Struggle : How difficult it is to struggle out of the item. Shouldn't be below 0.1 as that would be too tedious. Negative values help protect against spells.
// Cut : How difficult it is to cut with a knife. Metal items should have 0, rope and leather should be low but possible, and stuff like tape should be high
// Remove : How difficult it is to get it off by unbuckling. Most items should have a high chance if they have buckles, medium chance if they have knots, and low chance if they have a difficult mechanism.
// Pick : How hard it is to pick the lock on the item. Higher level items have more powerful locks. The general formula is 0.33 for easy items, 0.1 for medium items, 0.05 for hard items, and 0.01 for super punishing items
// Unlock : How hard it is to reach the lock. Should be higher than the pick chance, and based on accessibility. Items like the

// Note that there is a complex formula for how the chances are manipulated based on whether your arms are bound. Items that bind the arms are generally unaffected, and items that bind the hands are unaffected, but they do affect each other

// Power is a scale of how powerful the restraint is supposed to be. It should roughly match the difficulty of the item, but can be higher for special items. Power 10 or higher might be totally impossible to struggle out of.


let KDWillEscapePenalty = 0.15;
let KDWillEscapePenaltyArms = 0.1;
let KDWillEscapePenaltyStart = 0.25;
let KDWillEscapePenaltyStartArms = 0.1;
let KDWillEscapePenaltyEnd = 0.05;

let KDMinEscapeRate = 0.4;
let KDMinPickRate = 0.2;
let KDStruggleTime = 3;
let KDBaseEscapeSpeed = 2.0;

let KDUpfrontWill = true;

/** Thresholds for hand bondage */
let StruggleTypeHandThresh = {
	Struggle: 0.01, // Any hand bondage will affect struggling
	Unlock: 0.7, // Unlocking requires a bit of dexterity
	Pick: 0.45, // Picking requires dexterity
	Cut: 0.7, // Cutting requires a bit of dexterity
	Remove: 0.8, // Removing only requires a solid corner
};


let KDRestraintArchetypes = ["Rope", "Latex", "Ribbon", "Leather", "Cyber", "Metal", "Armbinders", "Boxbinders", "Straitjackets", "Legbinders"];


let KDCustomAffinity: Record<string, (data : KDEventData_affinity) => boolean> = {
	Wall: (data) => {
		// Intentionally only a + shape
		if (KDNearbyMapTiles(data.entity.x, data.entity.y, 1.1)?.some((tile) => {return KinkyDungeonBlockTiles.includes(tile.tile);})) return true;
		return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
	},
	HookOrFoot: (data) => {
		if (KinkyDungeonCanUseFeetLoose(false)) {
			if (data.Message) {
				KinkyDungeonSendTextMessage(7, TextGet("KDUseFootAffinity"), "lightgreen", 2,
					false, false, undefined, "Struggle");
			}
			return true;
		}
		return KinkyDungeonGetAffinity(data.Message, "Hook", data.group);
	},
	Tug: (data) => {
		if (KinkyDungeonFlags.get("leashtug")) {
			if (data.Message) {
				KinkyDungeonSendTextMessage(7, TextGet("KDUseTugAffinity"), "lightgreen", 2,
					false, false, undefined, "Struggle");
			}
			return true;
		}
		return false;
	},
	SharpHookOrFoot: (data) => {
		if (!KinkyDungeonGetAffinity(data.Message, "Sharp", data.group)) return false;
		if (KinkyDungeonCanUseFeetLoose(false)) {
			if (data.Message) {
				KinkyDungeonSendTextMessage(7, TextGet("KDUseFootAffinity"), "lightgreen", 2,
					false, false, undefined, "Struggle");
			}
			return true;
		}
		return KinkyDungeonGetAffinity(data.Message, "Hook", data.group);
	},
	SharpTug: (data) => {
		if (!KinkyDungeonGetAffinity(data.Message, "Sharp", data.group)) return false;
		if (KinkyDungeonFlags.get("leashtug")) {
			if (data.Message) {
				KinkyDungeonSendTextMessage(7, TextGet("KDUseTugAffinity"), "lightgreen", 2,
					false, false, undefined, "Struggle");
			}
			return true;
		}
		return false;
	},
};

function KDGetTightnessEffect(escapeChance: number, struggleType: string, T: number = 0) {
	let mult = (struggleType == "Cut" || struggleType == "Remove") ? 0.5 : 1.0;
	let x1 = 1 - 0.1 * mult;
	let x2 = escapeChance > 0 ? (escapeChance - 0.03 * mult) / escapeChance : 0;
	let val = Math.max(x1, Math.min(x2, 1 - 0.05 * mult));
	val = 1 - (1 - val) * (100/(100 + T));
	return val;
}

/**
 * Returns the multiplier of a restraint based on the player's current restraint counts
 * @param player
 * @param restraint
 * @param augmentedInventory
 * @returns {number} - multiplier for apparent power
 */
function KDRestraintPowerMult(player: entity, restraint: restraint, augmentedInventory: string[]): number {
	if (player != KinkyDungeonPlayerEntity) return 1;
	if (!restraint) return 1;
	let keyProperties = restraint.shrine.filter((element) => {return KDRestraintArchetypes.includes(element);});
	let relatedRestraints = [];
	let opposedRestraints = [];
	let mult = 1.0;
	for (let rr of KinkyDungeonAllRestraintDynamic()) {
		let r = rr.item;
		if (keyProperties.some((element) => {
			return KDRestraint(r).shrine.includes(element);
		})) {
			relatedRestraints.push(r);
		} else {
			opposedRestraints.push(r);
		}
	}
	if (augmentedInventory) {
		for (let name of augmentedInventory) {
			let r = {name: name};
			if (KDRestraint(r)) {
				if (keyProperties.some((element) => {
					return KDRestraint(r).shrine.includes(element);
				})) {
					relatedRestraints.push(r);
				} else {
					opposedRestraints.push(r);
				}
			}
		}
	}
	let maxMult = 2;
	for (let r of relatedRestraints) {
		// Increase up to 10x restraint power
		mult += Math.max(0,(maxMult - mult) * (Math.max(1, KDRestraint(r).power) + Math.max(1, restraint.power)) / Math.max(1, restraint.power));
	}
	for (let r of opposedRestraints) {
		// Increase up to 10x restraint power
		mult *= 1 - Math.min(0.15, Math.max(1, restraint.power) / (Math.max(1, KDRestraint(r).power) + Math.max(1, restraint.power)));
	}

	return Math.min(2, Math.max(0.5, mult || 0));
}

function KDGetWillPenalty(StruggleType: string): number {
	let perc = KinkyDungeonStatWill/KinkyDungeonStatWillMax;
	let scale = 0;
	let scalestart = KDWillEscapePenaltyStart;
	let max = KDWillEscapePenalty;
	if (!KinkyDungeonIsArmsBound(true)) {
		scalestart = KDWillEscapePenaltyStartArms;
		max = KDWillEscapePenaltyArms;
	}
	if (perc < scalestart) {
		if (scalestart - KDWillEscapePenaltyEnd > 0)
			scale = Math.min(1.0, (scalestart - perc) / (scalestart - KDWillEscapePenaltyEnd));
		else if (perc <= 0) scale = 1.0;
	}
	return scale * max * ((StruggleType == "Cut") ? 0.5 : (StruggleType == "Struggle" ? 1.0 : 0.1));
}

let KinkyDungeonCurrentEscapingItem = null;
let KinkyDungeonCurrentEscapingMethod = null;
let KinkyDungeonStruggleTime = 0;

let KinkyDungeonMultiplayerInventoryFlag = false;
let KinkyDungeonItemDropChanceArmsBound = 0.2; // Chance to drop item with just bound arms and not bound hands.

//let KinkyDungeonKnifeBreakChance = 0.15;
let KinkyDungeonKeyJamChance = 0.33;
let KinkyDungeonKeyPickBreakAmount = 12; // Number of tries per pick on average 5-11
let KinkyDungeonKeyPickBreakAmountBase = 12; // Number of tries per pick on average 5-11
let KinkyDungeonPickBreakProgress = 0;
let KinkyDungeonKnifeBreakAmount = 10; // Number of tries per knife on average 6-12
let KinkyDungeonKnifeBreakAmountBase = 10; // Number of tries per knife on average 6-12
let KinkyDungeonKnifeBreakProgress = 0;
let KinkyDungeonEnchKnifeBreakAmount = 24; // Number of tries per knife on average
let KinkyDungeonEnchKnifeBreakAmountBase = 24; // Number of tries per knife on average
let KinkyDungeonEnchKnifeBreakProgress = 0;

let KinkyDungeonMaxImpossibleAttempts = 3; // base, more if the item is close to being impossible

let KinkyDungeonEnchantedKnifeBonus = 0.1; // Bonus whenever you have an enchanted knife

let KDLocksmithPickBonus = 0.15; // Locksmith bonus to pick effectiveness
let KDLocksmithBonus = 0.15; // Locksmith bonus to base escape chance
let KDLocksmithSpeedBonus = 2.0;
let KDCluelessPickBonus = -0.2; // Clueless background
let KDCluelessBonus = -0.25; // Clueless background
let KDCluelessSpeedBonus = 0.5;

let KDFlexibleBonus = 0.1;
let KDFlexibleSpeedBonus = 1.5;
let KDInflexibleMult = 1.25;
let KDInflexibleSpeedBonus = 0.75;

let KDUnchainedBonus = 0.1;
let KDDamselBonus = 1.3;
let KDDamselPickAmount = 6;
let KDArtistBonus = 0.1;
let KDBunnyBonus = 1.3;
let KDBunnyKnifeAmount = 5;
let KDBunnyEnchKnifeAmount = 12;
let KDSlipperyBonus = 0.1;
let KDDollBonus = 1.3;
let KDEscapeeBonus = 0.1;
let KDDragonBonus = 1.3;

let KDStrongBonus = 0.075;
let KDWeakBonus = -0.1;

let KDBondageLoverAmount = 1;

/**
 */
let KinkyDungeonRestraintsCache: Map<string, restraint> = new Map();

/**
 * gets a restraint
 * @param item
 */
function KDRestraint(item: Named): restraint {
	if (KinkyDungeonRestraintVariants[item.inventoryVariant || item.name]) return KinkyDungeonRestraintsCache.get(KinkyDungeonRestraintVariants[item.inventoryVariant || item.name].template);
	return KinkyDungeonRestraintsCache.get(item.name);
}




/**
 * gets a restraint
 * @param item
 * @param target
 */
function KDRestraintBondageMult(item: Named, target: entity): number {
	let r = KDRestraint(item);
	if (r) {
		let data = {
			item: item,
			target: target,
			restraint: r,
			type: KDRestraintBondageType(item),
			override: undefined,
			overridePriority: 0,
			mult: r.npcBondageMult || 2,
		};

		if (r.quickBindMult && target && !KinkyDungeonIsDisabled(target)) {
			data.mult *= r.quickBindMult;
			data['quickBind'] = true;
		}

		KinkyDungeonSendEvent("calcBondageMult", data);
		return data.mult * ((KDSpecialBondage[data.type]) ? (KDSpecialBondage[data.type].enemyBondageMult || 1) : 1);
	}
	return 1;
}
/**
 * gets a restraint
 * @param item
 */
function KDRestraintBondageType(item: Named): string {
	let r = KDRestraint(item);
	if (r) {
		let data = {
			item: item,
			restraint: r,
			type: "",
			override: r.npcBondageType,
			overridePriority: 0,
		};
		// Stock methodology
		if (r.shrine) {
			for (let s of r.shrine) {
				switch (s) {
					case "Metal":
						data.type = s;
						data.overridePriority = 4;
						break;
					case "Latex":
						data.type = "Slime";
						data.overridePriority = 3;
						break;
					case "Rope":
						data.type = s;
						data.overridePriority = 1;
						break;
					case "Leather":
						data.type = s;
						data.overridePriority = 2;
						break;
					case "Vine":
						data.type = s;
						data.overridePriority = 5;
						break;
					case "Ice":
						data.type = s;
						data.overridePriority = 5;
						break;
				}
			}
			if (r.magic && data.overridePriority < 4) {
				data.type = "Magic";
				data.overridePriority = 4;
			}
		}

		KinkyDungeonSendEvent("calcBondageType", data);
		return data.override || data.type;
	}
	return "Vine";
}

/**
 * gets a restraint's conditions
 * @param item
 */
function KDRestraintBondageConditions(item: Named): string[] {
	let r = KDRestraint(item);
	if (r) {
		let data = {
			item: item,
			restraint: r,
			conditions: [],
			override: undefined,
			overridePriority: 0,
		};
		// Stock methodology
		if (r.shrine.includes("Armbinders")
			|| r.shrine.includes("Boxbinders")
			|| r.shrine.includes("Yokes")
			|| r.shrine.includes("Fiddles")
			|| r.shrine.includes("BindingDress")
			|| r.shrine.includes("Straitjackets")
			|| r.shrine.includes("Petsuits")) {
			data.conditions.push("HeavyBondage");
		}

		if (r.requireAllTagsToEquip || r.requireSingleTagToEquip) {
			data.conditions.push("Extra");
		}

		KinkyDungeonSendEvent("calcBondageConditions", data);


		return data.conditions.length > 0 ? data.conditions : null;
	}
	return null;
}

/**
 * gets a restraint
 * @param item
 */
function KDRestraintBondageStatus(item: Named): KDBondageStatus {
	let r = KDRestraint(item);
	if (r) {
		let data = {
			item: item,
			restraint: r,
			/** @type {KDBondageStatus} */
			status: {
				silence: 0,
				bind: 0,
				slow: 0,
				blind: 0,
				disarm: 0,
				reduceaccuracy: 0,
				toy: 0,
				plug: 0,
				belt: 0,
				immobile: 0,
			},
			override: undefined,
			overridePriority: 0,
		};
		// Stock methodology
		let powerMult = Math.max(0.2, 0.2 * Math.max(r.power));
		if (r.gag) {
			data.status.silence = Math.ceil(powerMult * r.gag * 1.3);
		}
		if (r.blindfold) {
			data.status.blind = Math.ceil(powerMult * r.blindfold * 1.7);
		}
		if (r.freeze) {
			data.status.bind = Math.ceil(powerMult);
		}
		if (r.hobble || r.blockfeet) {
			data.status.slow = Math.ceil(powerMult * 4);
		}
		if (r.bindhands) {
			data.status.disarm = Math.ceil(powerMult * Math.max(r.bindarms ? 0.3 : 0, r.bindhands || 0.1));
		} else if (r.bindarms) {
			data.status.reduceaccuracy = powerMult * 3;
		}

		if (r.chastity || r.chastitybra) {
			data.status.belt = r.chastity ? 2 : 1;
		}
		if (r.plugSize) {
			data.status.plug = r.plugSize;
		}
		if (r.vibeLocation) {
			data.status.toy = 1;
		}

		KinkyDungeonSendEvent("calcBondageStatus", data);
		return data.override || data.status;
	}
	return {
		silence: 0,
		bind: 0,
		slow: 0,
		blind: 0,
		disarm: 0,
		reduceaccuracy: 0,
		toy: 0,
		plug: 0,
		belt: 0,
		immobile: 0,
	};
}

/**
 * gets a restraint
 * @param item
 */
function KDItemIsMagic(item: item): boolean {
	let res = KinkyDungeonRestraintsCache.get(item.name);
	if (!res.magic) return false;
	let disenchlevel = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Disenchant");
	return !(disenchlevel > res.power);
}


// Format: strict group => [list of groups the strictness applies to]
const KinkyDungeonStrictnessTable = new Map([
	["ItemHood", ["ItemHead", "ItemEars","ItemMouth","ItemMouth2","ItemMouth3"]],
	["ItemHead", ["ItemEars","ItemMouth"]],
	["ItemMouth", ["ItemMouth"]],
	["ItemNeck", ["ItemMouth", "ItemArms"]],
	["ItemArms", ["ItemHands"]],
	["ItemHands", ["ItemHands"]],
	["ItemTorso", ["ItemArms", "ItemLegs", "ItemPelvis", "ItemBreast"]],
	["ItemLegs", ["ItemFeet", "ItemBoots"]],
	["ItemFeet", ["ItemBoots"]],
]);

let KDProgressiveOrder = {

};


/** Enforces a sort of progression of restraining loosely based on strictness, useful for progressive stuff like applying curses to zones */
KDProgressiveOrder['Strict'] = [
	"ItemTorso", // Usually just makes other restraints harder
	"ItemBreast", // Goes well with belts
	"ItemPelvis", // Chastity is for good girls!
	"ItemBoots", // Typically doesnt hobble completely
	"ItemEars", //  Sensory
	"ItemHead", // Blind, but does not stop from wielding anything
	"ItemLegs", // Typically doesnt hobble completely, but sometimes does (hobbleskirts)
	"ItemHands", // Blocks weapons but no spells
	"ItemMouth", // Blocks spells and potions
	"ItemFeet", // Makes you very slow
	"ItemArms", // Blocks spells and escaping
];

/** A funner restraining order, starting with non-impactful then locking down spells and finally sealing in helplessness */
KDProgressiveOrder['Fun1'] = [
	"ItemTorso", // Usually just makes other restraints harder
	"ItemPelvis", // Chastity is for good girls!
	"ItemMouth", // Blocks spells and potions
	"ItemHands", // Blocks weapons but no spells
	"ItemLegs", // Typically doesnt hobble completely, but sometimes does (hobbleskirts)
	"ItemBreast", // Goes well with belts
	"ItemHead", // Blind, but does not stop from wielding anything
	"ItemEars", //  Sensory
	"ItemBoots", // Typically doesnt hobble completely
	"ItemArms", // Blocks spells and escaping
	"ItemFeet", // Makes you very slow
];


/** A funner restraining order, starting with non-impactful then locking down spells and finally sealing in helplessness */
KDProgressiveOrder['Fun2'] = [
	"ItemTorso", // Usually just makes other restraints harder
	"ItemPelvis", // Chastity is for good girls!
	"ItemMouth", // Blocks spells and potions
	"ItemHands", // Blocks weapons but no spells
	"ItemBoots", // Typically doesnt hobble completely
	"ItemArms", // Blocks spells and escaping
	"ItemBreast", // Goes well with belts
	"ItemLegs", // Typically doesnt hobble completely, but sometimes does (hobbleskirts)
	"ItemHead", // Blind, but does not stop from wielding anything
	"ItemFeet", // Makes you very slow
	"ItemEars", //  Sensory
];

/** A funner restraining order, starting with non-impactful then locking down spells and finally sealing in helplessness */
KDProgressiveOrder['Fun3'] = [
	"ItemPelvis", // Chastity is for good girls!
	"ItemBreast", // Goes well with belts
	"ItemMouth", // Blocks spells and potions
	"ItemHands", // Blocks weapons but no spells
	"ItemArms", // Blocks spells and escaping
	"ItemLegs", // Typically doesnt hobble completely, but sometimes does (hobbleskirts)
	"ItemBoots", // Typically doesnt hobble completely
	"ItemHead", // Blind, but does not stop from wielding anything
	"ItemFeet", // Makes you very slow
	"ItemTorso", // Usually just makes other restraints harder
	"ItemEars", //  Sensory
];

function KDGetProgressiveOrderFun() {
	return KDProgressiveOrder["Fun" + Math.floor(3 * KDRandom() + 1)];
}

let KDRestraintsCache: Map<string, {r: restraint, w:number}[]> = new Map();

let KDTetherGraphics = new PIXI.Graphics;
KDTetherGraphics.zIndex = 2;
let KDGameBoardAddedTethers = false;

/**
 * @param [modifier]
 */
function KinkyDungeonKeyGetPickBreakChance(modifier?: number): number {
	let mult = (modifier) ? modifier : 1.0;
	let chance = 0;

	KinkyDungeonPickBreakProgress += mult;

	if (KinkyDungeonPickBreakProgress > KinkyDungeonKeyPickBreakAmount/1.5) chance = (KinkyDungeonPickBreakProgress - KinkyDungeonKeyPickBreakAmount/1.5) / (KinkyDungeonKeyPickBreakAmount + 1);

	return chance;
}

/**
 * @param [modifier]
 */
function KinkyDungeonGetKnifeBreakChance(modifier?: number): number {
	let mult = (modifier) ? modifier : 1.0;
	let chance = 0;

	KinkyDungeonKnifeBreakProgress += mult;

	if (KinkyDungeonKnifeBreakProgress > KinkyDungeonKnifeBreakAmount/1.5) chance = (KinkyDungeonKnifeBreakProgress - KinkyDungeonKnifeBreakAmount/1.5) / (KinkyDungeonKnifeBreakAmount + 1);

	return chance;
}

/**
 * @param [modifier]
 */
function KinkyDungeonGetEnchKnifeBreakChance(modifier: number): number {
	let mult = (modifier) ? modifier : 1.0;
	let chance = 0;

	KinkyDungeonEnchKnifeBreakProgress += mult;

	if (KinkyDungeonEnchKnifeBreakProgress > KinkyDungeonEnchKnifeBreakAmount/1.5) chance = (KinkyDungeonEnchKnifeBreakProgress - KinkyDungeonEnchKnifeBreakAmount/1.5) / (KinkyDungeonEnchKnifeBreakAmount + 1);

	return chance;
}

/**
 * @param restraint
 */
function KinkyDungeonIsLockable(restraint: restraint): boolean {
	if (restraint && restraint.escapeChance && (restraint.escapeChance.Pick != undefined || restraint.escapeChance.Unlock != undefined)) return true;
	return false;
}

/**
 * @param item
 * @param lock
 * @param [NoEvent]
 * @param [Link]
 * @param [pick]
 */
function KinkyDungeonLock(item: item, lock: string, NoEvent: boolean = false, Link: boolean = false, pick: boolean = false): void {
	KDUpdateItemEventCache = true;
	if (lock != "") {
		if (KinkyDungeonIsLockable(KDRestraint(item))) {
			if (KDLocks[lock] && KDLocks[lock].doLock) KDLocks[lock].doLock({item: item, link: Link});
			item.lock = lock;

			item.pickProgress = 0;
		}
	} else {
		let cancel = false;
		if (KDLocks[item.lock] && KDLocks[item.lock].doUnlock)
			cancel = !KDLocks[item.lock].doUnlock({item: item, link: Link, unlock: !pick, pick: pick, NoEvent: NoEvent});
		if (!cancel) {
			item.lock = lock;
			if (!NoEvent) {
				if (item.events) {
					for (let e of item.events) {
						if (e.trigger == "postUnlock" && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
							KinkyDungeonHandleInventoryEvent("postUnlock", e, item, {item: item, id: KinkyDungeonGetItemID()});
						}
					}
				}
				KinkyDungeonSendEvent("postUnlock", {item: item});
			}
		}


	}

}

/**
 * Gets the curse of an item, ither intrinsic or applied
 * @param item
 */
function KDGetCurse(item: item): string {
	return item?.curse || KDRestraint(item)?.curse;
}

/**
 * Returns whether or not an item is 'binding,' e.g. binds arms, blindfold, etc
 * @param item
 */
function KDIsBinding(item: item): boolean {
	let r = KDRestraint(item);
	if (r) {
		return !(!(!r.nonbinding && (
			r.bindarms
			|| r.bindhands
			|| r.blindfold > 1
			|| r.gag > 0.25
			|| r.blockfeet
			|| r.freeze
			|| r.immobile
			|| r.hobble > 1
			|| r.enclose
			|| r.binding
		)));
	}
	return false;
}

/**
 * Whether a single item shall be matched by a shrine
 * @param item
 * @param shrine
 * @param ignoreGold Gold locks don't prevent shrine matching
 *   even if they are shrineImmune
 * @param ignoreShrine Curses and noShrine flag on items don't
 *   prevent shrine matching.
 * @param forceIgnoreNonBinding - for "Exclusions Apply" perk
 */
function KinkyDungeonSingleRestraintMatchesShrine(
	item: item,
	shrine: string,
	ignoreGold: boolean,
	ignoreShrine: boolean,
	forceIgnoreNonBinding: boolean,
): boolean
{
	return KinkyDungeonAllowTagMatch(item, ignoreGold, ignoreShrine, forceIgnoreNonBinding) &&
		KDRestraint(item).shrine &&
		KDRestraint(item).shrine.includes(shrine);
}

/**
 * @param item
 * @param ignoreGold
 * @param ignoreShrine
 * @param forceIgnoreNonBinding
 */
function KinkyDungeonAllowTagMatch(item: item, ignoreGold: boolean, ignoreShrine: boolean, forceIgnoreNonBinding: boolean): boolean {
	return (
		(!forceIgnoreNonBinding || KDIsBinding(item))
		&& KinkyDungeonCurseOrItemAllowMatch(item, ignoreShrine)
		&& KinkyDungeonLockAllowMatch(item, ignoreGold)
	);
}

/**
 * @param item
 * @param ignoreShrine
 */
function KinkyDungeonCurseOrItemAllowMatch(item: item, ignoreShrine: boolean): boolean {
	return (!KDRestraint(item).noShrine &&
		(!KDGetCurse(item) || !KDCurses[KDGetCurse(item)].noShrine)) ||
		ignoreShrine;
}

/**
 * @param item
 * @param ignoreGold
 */
function KinkyDungeonLockAllowMatch(item: item, ignoreGold: boolean): boolean {
	return ignoreGold || !KDLocks[item.lock]?.shrineImmune;
}

/**
 * @param shrine
 * @param [ignoreGold]
 * @param [recursive]
 * @param [ignoreShrine]
 * @param [forceIgnoreNonBinding] - for "Exclusions Apply" perk
 */
function KinkyDungeonGetRestraintsWithShrine(shrine: string, ignoreGold?: boolean, recursive?: boolean, ignoreShrine?: boolean, forceIgnoreNonBinding?: boolean): item[] {
	let ret: item[] = [];

	for (let item of KinkyDungeonAllRestraint()) {
		if (KinkyDungeonSingleRestraintMatchesShrine(item, shrine, ignoreGold, ignoreShrine, forceIgnoreNonBinding)) {
			ret.push(item);
		}
		if (recursive) {
			let link = item.dynamicLink;
			while (link) {
				if (KinkyDungeonSingleRestraintMatchesShrine(link, shrine, ignoreGold, ignoreShrine, forceIgnoreNonBinding)) {
					ret.push(link);
				}
				link = link.dynamicLink;
			}
		}
	}

	return ret;
}

/**
 * @param shrine
 * @param [forceIgnoreNonBinding] - for "Exclusions Apply" perk
 * @returns {number}
 */
function KinkyDungeonRemoveRestraintsWithShrine(shrine: string, maxCount?: number, recursive?: boolean, noPlayer?: boolean, ignoreGold?: boolean, ignoreShrine?: boolean, Keep?: boolean, forceIgnoreNonBinding?: boolean): number {
	let count = 0;

	for (let i = 0; i < (maxCount ? maxCount : 100); i++) {
		let items: item[] = KinkyDungeonAllRestraint().filter((r) => KinkyDungeonSingleRestraintMatchesShrine(r, shrine, ignoreGold, ignoreShrine, forceIgnoreNonBinding));
		// Get the most powerful item
		let item = items.length > 0 ? items.reduce((prev, current) => (KinkyDungeonRestraintPower(prev, true) > KinkyDungeonRestraintPower(current, true)) ? prev : current) : null;
		if (item) {
			if (item.curse && KDCurses[item.curse]) {
				KDCurses[item.curse].remove(item, KDGetRestraintHost(item), true);
			}
			let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
			item.curse = undefined;
			if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
				KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
			}
			KinkyDungeonRemoveRestraint(KDRestraint(item).Group, Keep, false, false, true, undefined, !noPlayer ? KinkyDungeonPlayerEntity : undefined);
			KDSendStatus('escape', item.name, "shrine_" + shrine);
			count++;
		}

		if (recursive) {
			// Get all items, including dynamically linked ones
			items = KinkyDungeonGetRestraintsWithShrine(shrine, ignoreGold, true, ignoreShrine, forceIgnoreNonBinding);

			// Get the most powerful item
			item = items.length > 0 ? items.reduce((prev, current) => (KinkyDungeonRestraintPower(prev, true) > KinkyDungeonRestraintPower(current, true)) ? prev : current) : null;
			if (item) {
				let groupItem = KinkyDungeonGetRestraintItem(KDRestraint(item).Group);
				if (groupItem == item) {
					if (item.curse && KDCurses[item.curse]) {
						KDCurses[item.curse].remove(item, KDGetRestraintHost(item), true);
					}
					let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
					item.curse = undefined;
					if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
						KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
					}
					KinkyDungeonRemoveRestraint(KDRestraint(item).Group, Keep, false, false, true, undefined, !noPlayer ? KinkyDungeonPlayerEntity : undefined);
					KDSendStatus('escape', item.name, "shrine_" + shrine);
					count++;
				} else {
					let host = groupItem;
					let link = host.dynamicLink;
					while (link) {
						if (link == item) {
							if (item.curse && KDCurses[item.curse]) {
								KDCurses[item.curse].remove(item, KDGetRestraintHost(item), true);
							}
							let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
							item.curse = undefined;
							if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
								KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
							}
							KinkyDungeonRemoveDynamicRestraint(host, Keep, false, !noPlayer ? KinkyDungeonPlayerEntity : undefined);
							KDSendStatus('escape', item.name, "shrine_" + shrine);
							count++;
							link = null;
						} else {
							host = link;
							link = link.dynamicLink;
						}
					}
				}
			}
		}
	}


	return count;
}


/**
 * @param item
 */
function KDRemoveThisItem(item: item, Keep?: boolean, NoEvent?: boolean, Shrine?: boolean, Remover?: entity): void {
	let r = KinkyDungeonGetRestraintItem(KDRestraint(item).Group);
	if (r == item) {
		KinkyDungeonRemoveRestraint(KDRestraint(item).Group, Keep, false, NoEvent, Shrine, false, Remover);
	} else {
		let host = r;
		r = r.dynamicLink;
		while (r) {
			if (r == item) {
				KinkyDungeonRemoveDynamicRestraint(host, Keep, NoEvent, Remover);
			}
			host = r;
			r = r.dynamicLink;
		}

	}
}

/**
 * @param name
 */
function KinkyDungeonRemoveRestraintsWithName(name: string): number {
	let count = 0;

	for (let inv of KinkyDungeonAllRestraintDynamic()) {
		if (inv.item.name == name) {
			if (inv.host)
				KinkyDungeonRemoveDynamicRestraint(inv.host, false, false, undefined);
			else
				KinkyDungeonRemoveRestraint(KDRestraint(inv.item).Group, false, false);
			KDSendStatus('escape', inv.item.name, "special");
			count++;
		}
	}

	return count;
}

/**
 * @param shrine
 */
function KinkyDungeonUnlockRestraintsWithShrine(shrine: string): number {
	let count = 0;

	for (let item of KinkyDungeonAllRestraint()) {
		if (item.lock && !KDRestraint(item).noShrine && (!KDGetCurse(item) || !KDCurses[KDGetCurse(item)].noShrine) && KDRestraint(item).shrine && KDRestraint(item).shrine.includes(shrine) && KDLocks[item.lock] && !KDLocks[item.lock]?.shrineImmune) {

			KinkyDungeonLock(item, "", true);
			count++;
		}
	}

	return count;
}

function KinkyDungeonPlayerGetLockableRestraints(): item[] {
	let ret: item[] = [];

	for (let item of KinkyDungeonAllRestraint()) {
		if (!item.lock && !KDGetCurse(item) && KDRestraint(item).escapeChance && KDRestraint(item).escapeChance.Pick != undefined) {
			ret.push(item);
		}
	}

	return ret;
}

/**
 * @param Locks
 */
function KinkyDungeonPlayerGetRestraintsWithLocks(Locks: string[], recursive?: boolean): item[] {
	let ret: item[] = [];

	for (let itemhost of (recursive ? KinkyDungeonAllRestraintDynamic() : KinkyDungeonAllRestraint())) {
		// @ts-ignore
		let item = itemhost.item ? itemhost.item : itemhost;
		if (item && item.lock && Locks.includes(item.lock)) {
			ret.push(item);
		}
	}

	return ret;
}

/**
 * @param lock
 */
function KinkyDungeonRemoveKeysUnlock(lock: string) {
	if (KDLocks[lock]) KDLocks[lock].removeKeys({unlock: true});
}

/**
 * @param lock
 * @param keytype
 */
function KinkyDungeonRemoveKeysDropped(lock: string, keytype: string) {
	if (KDLocks[lock]) KDLocks[lock].removeKeys({dropped: true, keytype: keytype});
}


/**
 * @param lock
 * @returns {string}
 */
function KinkyDungeonGetKey(lock: string): string {
	if (KDLocks[lock]) return KDLocks[lock].key;
	return "";
}

function KinkyDungeonHasGhostHelp(): boolean {
	return ((KinkyDungeonTargetTile && ((KinkyDungeonTargetTile.Type == "Ghost" && KinkyDungeonTargetTile.GhostDecision <= 0) || KinkyDungeonTargetTile.Type == "Angel")));
}

function KinkyDungeonHasHelp(): boolean {
	return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp() || KinkyDungeonHasAngelHelp();
}


function KinkyDungeonHasAllyHelp(): boolean {
	return (KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some(
		(enemy) => {
			return (KDEnemyHasFlag(enemy, "HelpMe") || enemy.Enemy.tags.alwayshelp)
				&& enemy.Enemy.bound
				&& !enemy.Enemy.tags.nohelp
				&& !KDHelpless(enemy)
				&& KDBoundEffects(enemy) < 4;
		})
		|| (!KinkyDungeonStatsChoice.get("NoHelp") && KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((enemy) => {
			return enemy.Enemy.bound
				&& !enemy.Enemy.tags.nohelp
				&& KDAllied(enemy)
				&& !KDHelpless(enemy)
				&& KDBoundEffects(enemy) < 4;
		}))
	);
}

KinkyDungeonSetFlag("HelpMeFlag", 20);

function KinkyDungeonHasAngelHelp(): boolean {
	return (KinkyDungeonTargetTile && KinkyDungeonTargetTile.Type == "Angel");
}

function KinkyDungeonIsWearingLeash(): boolean {
	for (let restraint of KinkyDungeonAllRestraint()) {
		if (KDRestraint(restraint) && KDRestraint(restraint).leash) {
			return true;
		}
	}
	return false;
}

let KDAffinityList = ["Hook", "Edge", "Sticky", "Sharp"];

/**
 * @param Message - Show a message?
 * @param affinity
 * @param [group]
 * @param [entity]
 */
function KinkyDungeonGetAffinity(Message: boolean, affinity: string, group?: string, entity?: entity): boolean {
	if (!entity) entity = KinkyDungeonPlayerEntity;
	let data: KDEventData_affinity = {
		forceTrue: 0,
		forceFalse: 0,
		affinity: affinity,
		group: group,
		Message: Message,
		entity: entity,
		msgedstand: false,
		canStand: KinkyDungeonCanStand() && !KDForcedToGround(),
		groupIsHigh: !group || (
			group.startsWith("ItemM")
			|| group == "ItemArms"
			|| (group == "ItemHands" || !KinkyDungeonIsArmsBound())
			|| group == "ItemEars"
			|| group == "ItemHood"
			|| group == "ItemHead"
			|| group == "ItemNeck"
			|| group == "ItemNeckAccessories"
			|| group == "ItemNeckRestraints"
		),
	};
	KinkyDungeonSendEvent("affinity", data);
	if (data.forceFalse > 0 && data.forceFalse >= data.forceTrue) return false;
	if (data.forceTrue > 0) return true;

	let effectTiles = KDGetEffectTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
	if (effectTiles)
		for (let t of Object.values(effectTiles)) {
			if (t.affinities && t.affinities.includes(affinity)) return true;
			else if (data.canStand && data.groupIsHigh && t.affinitiesStanding && t.affinitiesStanding.includes(affinity)) return true;
			else if (Message && !data.msgedstand && (!data.canStand || !data.groupIsHigh) && t.affinitiesStanding && t.affinitiesStanding.includes(affinity)) {
				data.msgedstand = true;
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonHookHighFail"), "#ff5277", 2,
					false, false, undefined, "Struggle");
			}
		}
	if (KDCustomAffinity[data.affinity]) {
		return KDCustomAffinity[data.affinity](data);
	} if (affinity == "Hook") {
		let tile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
		if (tile == '?') {
			if (data.canStand && data.groupIsHigh) return true;
			else if (!data.msgedstand && Message) KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonHookHighFail"), "#ff5277", 2,
				false, false, undefined, "Struggle");
		} else if (KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y - 1) == ',') return true;
		return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
	} else if (affinity == "Edge") {
		for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++) {
			for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
				let tile = KinkyDungeonMapGet(X, Y);
				if (KDCornerTiles[tile]) {
					return true;
				} else if (tile == 'C' && Message) {
					KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedOpenChest"), "#ff5277", 2, true,
						false, undefined, "Struggle");
				}
			}
		}
		return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
	} else if (affinity == "Sticky") {
		return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
	} else if (affinity == "Sharp") {
		if (((KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;})) || KinkyDungeonWeaponCanCut(false)) return true;
		if (KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;}) && (!KinkyDungeonIsArmsBound() || KinkyDungeonStatsChoice.has("Psychic") || KinkyDungeonWallCrackAndKnife(false))) return true;
		let tile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
		if (tile == '/') {
			if (Message)
				KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonScrapUse"), "lightgreen", 2,
					false, false, undefined, "Struggle");
			return true;
		}
		for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++) {
			for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
				let tile2 = KinkyDungeonMapGet(X, Y);
				if (tile2 == '-'
					|| tile == 'a') {
					if (Message)
						KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonScrapObjectUse"), "lightgreen", 2,
							false, false, undefined, "Struggle");
					return true;
				}
			}
		}
		return false;
	}
	return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
}

function KinkyDungeonWallCrackAndKnife(Message: boolean): boolean {
	for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++) {
		for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
			if (X == KinkyDungeonPlayerEntity.x || Y == KinkyDungeonPlayerEntity.y) {
				let tile = KinkyDungeonMapGet(X, Y);
				if (tile == '4' || tile == '\\') {
					if (!KinkyDungeonIsArmsBound(true) || (KinkyDungeonCanStand() && !KDForcedToGround())) {
						if (Message) {
							if (!KinkyDungeonIsArmsBound(true))
								KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonUseCrack"), "lightgreen", 2, true);
							else KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonUseCrackLegs"), "lightgreen", 2, true);
						}
						return true;
					} else {
						if (Message) {
							KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedCrack"), "#ff5277", 2, true);
						}
						return false;
					}
				}
			}
		}
	}
	return false;
}

/**
 * Determines if the entire dynamic item tree has at least one inaccessable item
 * @param item
 */
function KDIsTreeAccessible(item: item): boolean {
	let link = item;
	while (link && KDRestraint(link)) {
		if (KDRestraint(link).inaccessible) return false;
		link = link.dynamicLink;
	}
	return true;
}

/**
 * Determines if the entire dynamic item tree has at least one chastity item
 * @param item
 */
function KDIsTreeChastity(item: item): boolean {
	let link = item;
	while (link && KDRestraint(link)) {
		if (KDRestraint(link).chastity) return false;
		link = link.dynamicLink;
	}
	return true;
}

/**
 * Determines if the entire dynamic item tree has at least one chastity bra item
 * @param item
 */
function KDIsTreeChastityBra(item: item): boolean {
	let link = item;
	while (link && KDRestraint(link)) {
		if (KDRestraint(link).chastitybra) return false;
		link = link.dynamicLink;
	}
	return true;
}

/**
 * @param Group - Group
 * @param [External] - By enemies or by player?
 */
function KDGroupBlocked(Group: string, _External?: boolean): boolean {
	if (KinkyDungeonPlayerTags.get("ChastityLower") && ["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) return true;
	if (KinkyDungeonPlayerTags.get("ChastityUpper") && ["ItemNipples", "ItemNipplesPiercings"].includes(Group)) return true;
	if (KinkyDungeonPlayerTags.get("Block_" + Group)) return true;

	/*if (Group.includes("ItemHands")) {
		let arms = KinkyDungeonGetRestraintItem("ItemArms");
		if (arms && !KDIsTreeAccessible(arms)) return true;
	}*/

	return false;
	//let device = null;

	//if (device && KDRestraint(device) && KDRestraint(device).enclose) return true;

}

/**
 * Gets a list of restraints blocking this group
 * @param Group
 * @param External
 */
function KDGetBlockingRestraints(Group: string, _External?: boolean): item[] {
	// Create the storage system
	let map: Map<item, boolean> = new Map();
	let all = KinkyDungeonAllRestraintDynamic();
	// For this section we just create a set of items that block this one
	if (KinkyDungeonPlayerTags.get("ChastityLower") && ["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) {
		for (let item of all) {
			if (!map.get(item.item) && (KDRestraint(item.item)?.chastity)) {
				map.set(item.item, true);
			}
		}
	}
	if (KinkyDungeonPlayerTags.get("ChastityUpper") && ["ItemNipples", "ItemNipplesPiercings"].includes(Group)) {
		for (let item of all) {
			if (!map.get(item.item) && (KDRestraint(item.item)?.chastitybra)) {
				map.set(item.item, true);
			}
		}
	}
	if (KinkyDungeonPlayerTags.get("Block_" + Group)) {
		for (let item of all) {
			if (!map.get(item.item) && KDRestraint(item.item)?.shrine?.includes("Block_" + Group)) {
				map.set(item.item, true);
			}
		}
	}

	if (Group.includes("ItemHands")) {
		let arms = KinkyDungeonGetRestraintItem("ItemArms");
		if (arms) {
			let link = arms;
			while (link && KDRestraint(link)) {
				if (KDRestraint(link).inaccessible && !map.get(link)) {
					map.set(link, true);
				}
				link = link.dynamicLink;
			}
		}
	}

	// Return restraints still in the list
	return [...map.keys()];
}

/**
 * Gets a list of restraints with Security that block this
 * @param Group
 * @param External
 */
function KDGetBlockingSecurity(Group: string, External: boolean): item[] {
	let items = KDGetBlockingRestraints(Group, External);
	items = items.filter((item) => {
		return KDRestraint(item)?.Security != undefined;
	});
	return items;
}

/**
 * @param Other - false = self, true = other prisoner door etc
 * @returns - Can you use keys on target
 */
function KinkyDungeonCanUseKey(Other: boolean = true): boolean {
	return !KinkyDungeonIsHandsBound(true, Other, 0.7) || KinkyDungeonStatsChoice.has("Psychic");
}

/**
 * @param [ApplyGhost] - Can you receive help in this context?
 * @param [Other] - Is this on yourself or another?
 * @param Threshold - Threshold
 */
function KinkyDungeonIsHandsBound(ApplyGhost?: boolean, Other?: boolean, Threshold: number = 0.99): boolean {
	/*let blocked = InventoryItemHasEffect(InventoryGet(KinkyDungeonPlayer, "ItemHands"), "Block", true) || KDGroupBlocked("ItemHands");
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).bindhands) {
			blocked = true;
			break;
		}
	}*/
	let blocked = KDHandBondageTotal(Other) > Threshold;
	let help = ApplyGhost && (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp());
	if (!Other && (!ApplyGhost || !(help)) && KinkyDungeonStatsChoice.get("Butterfingers") && KinkyDungeonIsArmsBound(ApplyGhost, Other)) return true;
	return (!ApplyGhost || !(help)) &&
		blocked;
}

/**
 * Returns the total level of hands bondage, 1.0 or higher meaning unable to use hands
 * @param Other - on other or self
 * @return  - The bindhands level, sum of all bindhands properties of worn restraints
 */
function KDHandBondageTotal(Other: boolean = false): number {
	let total = 0;
	for (let rest of KinkyDungeonAllRestraintDynamic()) {
		let inv = rest.item;
		if (KDRestraint(inv).bindhands) total += KDRestraint(inv).bindhands;
		if (!Other && KDRestraint(inv).restricthands) total += KDRestraint(inv).restricthands;
	}
	if (KinkyDungeonStatsChoice.get("SomaticMinus")) total *= 2;
	else if (KinkyDungeonStatsChoice.get("SomaticPlus") && total < 0.99) total *= 0.75;
	return total;
}

function KinkyDungeonCanUseFeet(bootsPrevent: boolean = true): boolean {
	return KinkyDungeonStatsChoice.get("Flexible") && KinkyDungeonSlowLevel < 1
		&& (!bootsPrevent ||
			(!KinkyDungeonPlayerTags.get("HinderFeet")
			&& !KinkyDungeonPlayerTags.get("BoundFeet")
			&& !KinkyDungeonPlayerTags.get("Boots")
			&& !KinkyDungeonPlayerTags.get("BootsArmor")));
}

function KinkyDungeonCanUseFeetLoose(bootsPrevent: boolean = true): boolean {
	return KinkyDungeonCanUseFeet(bootsPrevent) || (
		!KDForcedToGround()
	);
}

/**
 * @param [ApplyGhost]
 * @param [Other] - Is this on yourself or another?
 */
function KinkyDungeonIsArmsBound(ApplyGhost?: boolean, _Other?: boolean): boolean {
	let blocked = KDGroupBlocked("ItemArms");
	if (!blocked)
		for (let inv of KinkyDungeonAllRestraintDynamic()) {
			if (KDRestraint(inv.item).bindarms) {
				blocked = true;
				break;
			}
		}
	return (!ApplyGhost || !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp())) &&
		blocked;
}
/**
 * @param C
 * @param [ApplyGhost]
 * @param [Other] - Is this on yourself or another?
 */
function KinkyDungeonIsArmsBoundC(C: Character, ApplyGhost?: boolean, Other?: boolean): boolean {
	if (C == KinkyDungeonPlayer) {
		return KinkyDungeonIsArmsBound(ApplyGhost, Other);
	} else {
		for (let inv of KDGetRestraintsForCharacter(C)) {
			if (KDRestraint(inv)?.bindarms) {
				return true;
			}
		}
		return false;
	}
}



/**
 * @param ApplyGhost
 * @param Group
 * @param [excludeItem]
 */
function KinkyDungeonStrictness(ApplyGhost: boolean, Group: string, excludeItem?: item): number {
	if (ApplyGhost && (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp())) return 0;
	let strictness = 0;
	for (let invItem of KinkyDungeonAllRestraintDynamic()) {
		let inv = invItem.item;
		while (inv && (!excludeItem || KDRestraint(inv).Group != Group)) {
			if (inv != excludeItem && ((KDRestraint(inv).strictness && KDRestraint(inv).strictness > strictness)))  {
				let strictGroups = KDRestraint(inv).strictnessZones || KinkyDungeonStrictnessTable.get(KDRestraint(inv).Group);
				if (strictGroups) {
					for (let s of strictGroups) {
						if (s == Group) {
							if (KDRestraint(inv).strictness > strictness)
								strictness = KDRestraint(inv).strictness;
							break;
						}
					}
				}
			}
			inv = inv.dynamicLink;
		}
	}
	// Slightly different behavior with layering, go from bottom up
	if (excludeItem) {
		let inv = KinkyDungeonGetRestraintItem(Group);
		let i = 0;
		let stack = [];
		while (inv) {
			stack.push(inv);
			inv = inv.dynamicLink;
		}
		i = stack.length - 1;
		inv = stack[i];

		while (i >= 0) {
			if (inv == excludeItem) {
				break;
			} else {
				if (inv != excludeItem && ((KDRestraint(inv).strictness && KDRestraint(inv).strictness > strictness)))  {
					let strictGroups = KDRestraint(inv).strictnessZones || KinkyDungeonStrictnessTable.get(KDRestraint(inv).Group);
					if (strictGroups) {
						for (let s of strictGroups) {
							if (s == Group) {
								if (KDRestraint(inv).strictness > strictness)
									strictness = KDRestraint(inv).strictness;
								break;
							}
						}
					}
				}
			}
			i--;
			inv = i >= 0 ? stack[i] : undefined;
		}
	}

	return strictness;
}

/**
 * Gets the list of restraint nammes affecting the Group
 * @param Group
 * @param excludeItem
 */
function KinkyDungeonGetStrictnessItems(Group: string, excludeItem: item): string[] {
	let list = [];
	for (let inv of KinkyDungeonAllRestraint()) {
		while (inv) {
			if (inv != excludeItem && KDRestraint(inv).strictness)  {
				let strictGroups = KDRestraint(inv).strictnessZones || KinkyDungeonStrictnessTable.get(KDRestraint(inv).Group);
				if (strictGroups) {
					for (let s of strictGroups) {
						if (s == Group) {
							// Add the top item
							if (KDRestraint(inv).strictness)
								list.push(KDRestraint(inv).name);
							// Add the items underneath it!!
							break;
						}
					}
				}
			}
			inv = inv.dynamicLink;
		}
	}
	return list;
}


function KinkyDungeonGetPickBaseChance(): number {
	let bonus = 0;
	if (KinkyDungeonStatsChoice.get("Locksmith")) bonus += KDLocksmithPickBonus;
	if (KinkyDungeonStatsChoice.get("Clueless")) bonus += KDCluelessPickBonus;
	if (KinkyDungeonStatsChoice.get("LocksmithMaster")) bonus += 0.15;
	return 0.33 / (1.0 + 0.02 * MiniGameKinkyDungeonLevel) + bonus;
}

function KinkyDungeonGetPickBonus(): number {
	let bonus = 0;
	if (KinkyDungeonStatsChoice.get("Locksmith")) bonus += KDLocksmithBonus;
	if (KinkyDungeonStatsChoice.get("Clueless")) bonus += KDCluelessBonus;
	if (KinkyDungeonStatsChoice.get("LocksmithMaster")) bonus += 0.15;
	return bonus;
}

function KinkyDungeonPickAttempt(): boolean {
	let Pass = "Fail";
	let escapeChance = KinkyDungeonGetPickBaseChance();
	let cost = KinkyDungeonStatStaminaCostPick;
	let wcost = KinkyDungeonStatWillCostPick;
	let lock = KinkyDungeonTargetTile.Lock;
	if (!KinkyDungeonTargetTile.pickProgress) KinkyDungeonTargetTile.pickProgress = 0;

	if (!lock) return;

	KinkyDungeonInterruptSleep();

	if (KDLocks[lock] && !KDLocks[lock].canPick({target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation})) {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggleCantPick" + lock + "Lock"), "orange", 2, true);
		Pass = "Fail";
	}

	let handsBound = KinkyDungeonIsHandsBound(false, true, 0.55) && !KinkyDungeonCanUseFeet();
	let armsBound = KinkyDungeonIsArmsBound();
	let strict = KinkyDungeonStrictness(false, "ItemHands");
	if (!strict) strict = 0;
	if (armsBound) escapeChance = Math.max(0.0, escapeChance - 0.25);
	if (handsBound && strict < 0.5) escapeChance = Math.max(0, escapeChance - 0.5);
	else if (strict) escapeChance = Math.max(0, escapeChance - strict);

	escapeChance /= 1.0 + KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax*KinkyDungeonDistractionUnlockSuccessMod;

	let chargecosts = true;
	if (wcost > 0 && !KinkyDungeonHasWill(-wcost, false)) {
		chargecosts = false;
		KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle"), "#ff5277", 2, true);
	} else if (!KinkyDungeonHasStamina(-cost, true)) {
		chargecosts = false;
		KinkyDungeonWaitMessage(true, 0);
	} else if (KinkyDungeonTargetTile && KinkyDungeonTargetTile.pickProgress >= 1){//KDRandom() < escapeChance
		Pass = "Success";
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Unlock.ogg");
	} else if (KDLocks[lock] && KDLocks[lock].breakChance({})) { // Blue locks cannot be picked or cut!
		Pass = "Break";
		KDAddConsumable("Pick", -1);
		KinkyDungeonPickBreakProgress = 0;
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/PickBreak.ogg");
	} else if (!KinkyDungeonStatsChoice.get("Psychic") && (handsBound || (armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
		KinkyDungeonDropItem({name: "Pick"}, KinkyDungeonPlayerEntity, true);
		KDAddConsumable("Pick", -1);
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Miss.ogg");
	} else {
		KinkyDungeonTargetTile.pickProgress += escapeChance;
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Pick.ogg");
	}
	KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonAttemptPick" + Pass).replace("TargetRestraint", TextGet("KinkyDungeonObject")), (Pass == "Success") ? "lightgreen" : "#ff5277", 1);
	if (chargecosts) {
		KinkyDungeonChangeStamina(cost, true);
		KinkyDungeonChangeWill(wcost);
	}
	KinkyDungeonSetFlag("tryescaping", 3);
	return Pass == "Success";
}

/**
 * @param lock
 */
function KinkyDungeonUnlockAttempt(lock: string): boolean {
	let Pass = "Fail";
	let escapeChance = 1.0;

	KinkyDungeonInterruptSleep();

	let handsBound = KinkyDungeonIsHandsBound(false, true, 0.85) && !KinkyDungeonCanUseFeet();
	let armsBound = KinkyDungeonIsArmsBound();
	let strict = KinkyDungeonStrictness(false, "ItemHands");
	if (!strict) strict = 0;
	if (armsBound) escapeChance = Math.max(0.1, escapeChance - 0.25);
	if (handsBound && strict < 0.5) escapeChance = Math.max(0, escapeChance - 0.5);
	else if (strict) escapeChance = Math.max(0, escapeChance - strict);

	if (KinkyDungeonStatsChoice.get("Psychic")) escapeChance = Math.max(escapeChance, 0.33);
	if (KDRandom() < escapeChance)
		Pass = "Success";
	KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonStruggleUnlock" + Pass).replace("TargetRestraint", TextGet("KinkyDungeonObject")), (Pass == "Success") ? "lightgreen" : "#ff5277", 1);
	if (Pass == "Success") {
		KinkyDungeonRemoveKeysUnlock(lock);
		if (KDLocks[lock] && KDLocks[lock].loot_special && KinkyDungeonTargetTile && KinkyDungeonTargetTile.Loot == "normal") KinkyDungeonSpecialLoot = true;
		else if (KDLocks[lock] && KDLocks[lock].loot_locked && KinkyDungeonTargetTile && KinkyDungeonTargetTile.Loot == "normal") KinkyDungeonLockedLoot = true;
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Unlock.ogg");
		return true;
	} else if (!KinkyDungeonStatsChoice.get("Psychic") && (handsBound || (armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
		let keytype = KinkyDungeonGetKey(lock);
		if (keytype) {
			KinkyDungeonRemoveKeysDropped(lock, keytype);
		}
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Miss.ogg");
	} else {
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Pick.ogg");
	}
	KinkyDungeonSetFlag("tryescaping", 3);
	return false;
}

/** Gets the affinity of a restraint */
function KDGetRestraintAffinity(item: item, data: any): string {
	data.item = item;
	data.affinity = "";
	data.overrideAffinity = false;
	if (KDRestraint(item) && KDRestraint(item).affinity) {
		if (KDRestraint(item).affinity[data.StruggleType]) {
			for (let a of KDRestraint(item).affinity[data.StruggleType]) {
				data.affinity = a;
				if (KinkyDungeonGetAffinity(false, a, data.StruggleGroup)) break;
			}
		}
	}
	KinkyDungeonSendEvent("beforeAffinityCalc", data);
	if (!data.overrideAffinity && data.affinity == "") {
		switch (data.StruggleType) {
			case "Struggle": data.affinity = "Hook"; break;
			case "Remove": data.affinity = "Edge"; break;
			case "Cut": data.affinity = "Sharp"; break;
			case "Pick": data.affinity = ""; break;
			case "Unlock": data.affinity = "Sticky"; break;
		}
	}
	return data.affinity;
}

function KDGetEscapeChance(restraint: item, StruggleType: string, escapeChancePre: number, limitChancePre: number, ApplyGhost: boolean, ApplyPlayerBonus: boolean, Msg?: boolean) {
	let escapeChance = escapeChancePre != undefined ? escapeChancePre : KDRestraint(restraint).escapeChance[StruggleType] != undefined ? KDRestraint(restraint).escapeChance[StruggleType] : 1.0;
	if (KDGetCurse(restraint)) escapeChance = -100;
	let lockType = (restraint.lock && KDLocks[restraint.lock]) ? KDLocks[restraint.lock] : null;
	if (lockType) {
		let extraChance = (StruggleType == "Pick" && lockType.pick_diff) ? lockType.pick_diff : 0;
		if (extraChance) escapeChance += extraChance;
		if (StruggleType == "Unlock" && lockType.unlock_diff) {
			escapeChance -= lockType.unlock_diff;
		}

	}

	let limitChance = limitChancePre != undefined ? limitChancePre : (KDRestraint(restraint).limitChance != undefined && KDRestraint(restraint).limitChance[StruggleType] != undefined) ? KDRestraint(restraint).limitChance[StruggleType] :
		((StruggleType == "Unlock" || StruggleType == "Pick") ? 0 : 0.12);

	if (ApplyPlayerBonus) {
		if (StruggleType == "Pick") {
			if (KinkyDungeonStatsChoice.get("Locksmith")) {escapeChance += KDLocksmithBonus;}
			if (KinkyDungeonStatsChoice.get("Clueless")) limitChance -= KDCluelessBonus;
		} else if (StruggleType == "Remove" || StruggleType == "Unlock") {
			if (KinkyDungeonStatsChoice.get("Flexible")) {escapeChance += KDFlexibleBonus;}
			if (KinkyDungeonStatsChoice.get("Inflexible")) limitChance *= KDInflexibleMult;
		} else if (StruggleType == "Struggle") {
			if (KinkyDungeonStatsChoice.get("Strong")) {escapeChance += KDStrongBonus;}
			if (KinkyDungeonStatsChoice.get("Weak")) limitChance -= KDWeakBonus;
		}
	}

	//if (!KinkyDungeonHasHelp()) {
	//limitChance += 0.05; // Small penalty for not having help
	//}

	if (StruggleType != "Unlock") {
		if (KinkyDungeonStatsChoice.get("HighSecurity")) {
			KinkyDungeonKeyPickBreakAmount = KDDamselPickAmount;
		} else {
			KinkyDungeonKeyPickBreakAmount = KinkyDungeonKeyPickBreakAmountBase;
		}

		if (KinkyDungeonStatsChoice.get("ShoddyKnives")) {
			KinkyDungeonKnifeBreakAmount = KDBunnyKnifeAmount;
			KinkyDungeonEnchKnifeBreakAmount = KDBunnyEnchKnifeAmount;
		} else {
			KinkyDungeonKnifeBreakAmount = KinkyDungeonKnifeBreakAmountBase;
			KinkyDungeonEnchKnifeBreakAmount = KinkyDungeonEnchKnifeBreakAmountBase;
		}
		if (KinkyDungeonStatsChoice.get("FreeSpirit") && (KDRestraint(restraint).chastity || KDRestraint(restraint).chastitybra)) escapeChance += 0.5;


		if (KinkyDungeonStatsChoice.get("Unchained") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Metal")) {
			escapeChance += (StruggleType == "Cut" ? 0.5 : 1) * KDUnchainedBonus;
		} else
		if (KinkyDungeonStatsChoice.get("Artist") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Rope")) {
			escapeChance += (StruggleType == "Cut" ? 0.5 : 1) * KDArtistBonus;
		} else
		if (KinkyDungeonStatsChoice.get("Slippery") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Latex")) {
			escapeChance += (StruggleType == "Cut" ? 0.5 : 1) * KDSlipperyBonus;
		} else
		if (KinkyDungeonStatsChoice.get("Escapee") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Leather")) {
			escapeChance += (StruggleType == "Cut" ? 0.5 : 1) * KDEscapeeBonus;
		}


		if (KinkyDungeonStatsChoice.get("Damsel") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Metal")) {
			if (escapeChance > 0)
				limitChance += escapeChance * 0.2;
			if (StruggleType != "Pick" && StruggleType != "Unlock" && limitChance > 0 && limitChance < -KDDamselBonus)
				limitChance *= KDDamselBonus;
		}
		else if (KinkyDungeonStatsChoice.get("Bunny") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Rope")) {
			if (escapeChance > 0)
				limitChance += escapeChance * 0.2;
			if (StruggleType != "Pick"  && StruggleType != "Unlock" && limitChance > 0 && limitChance < -KDBunnyBonus)
				limitChance *= KDBunnyBonus;
		}
		else if (KinkyDungeonStatsChoice.get("Doll") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Latex")) {
			if (escapeChance > 0)
				limitChance += escapeChance * 0.2;
			if (StruggleType != "Pick"  && StruggleType != "Unlock" && limitChance > 0 && limitChance < -KDDollBonus)
				limitChance *= KDDollBonus;
		}
		else if (KinkyDungeonStatsChoice.get("Dragon") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Leather")) {
			if (escapeChance > 0)
				limitChance += escapeChance * 0.2;
			if (StruggleType != "Pick"  && StruggleType != "Unlock" && limitChance > 0 && limitChance < -KDDragonBonus)
				limitChance *= KDDragonBonus;
		}
	}


	let data = {
		restraint: restraint,
		escapeChance: escapeChance,
		limitChance: limitChance,
		struggleType: StruggleType,
		escapeChancePre: escapeChancePre,
		limitChancePre: limitChancePre,
		ApplyGhost: ApplyGhost,
		ApplyPlayerBonus: ApplyPlayerBonus,
		GoddessBonus: 0,
		Msg: Msg,

	};

	let GoddessBonus = KDGetItemGoddessBonus(restraint, data);
	//if (data.escapeChance > 0)
	//data.escapeChance *= Math.max(0, 1 + GoddessBonus);
	//else
	//data.escapeChance /= Math.max(0.1, 1 + GoddessBonus);
	//data.escapeChance += GoddessBonus;
	if (GoddessBonus > 0) {
		data.escapeChance += GoddessBonus;
	} else {
		data.limitChance -= GoddessBonus;
	}
	data.GoddessBonus = GoddessBonus;

	KinkyDungeonSendEvent("perksStruggleCalc", data);

	return {
		escapeChance: data.escapeChance,
		limitChance: data.limitChance,
		escapeChanceData: data,
	};

}

let KDUnboundAffinityOverride = {
	"Sticky": true,
	"Edge": true,
	"Hook": true,
};

function KDGetDynamicItem(group: string, index: number) {
	let restraint = KinkyDungeonGetRestraintItem(group);
	let host = restraint;
	if (index) {
		let surfaceItems = KDDynamicLinkListSurface(restraint);
		let dynamicItems = KDDynamicLinkList(restraint, true);
		if (surfaceItems[index]) {
			restraint = surfaceItems[index];
			for (let h_item of dynamicItems) {
				if (h_item.dynamicLink == restraint) {
					host = h_item;
					break;
				}
			}
			//host = surfaceItems[index - 1];
		}
		else console.log("Error! Please report the item combination and screenshot to Ada!");
	}
	return {restraint: restraint, host: host};
}


/**
 * Mutates the GetStruggleData array
 * @param data
 */
function KDGetStruggleData(data: KDStruggleData): string {
	if (data.struggleType == "Cut") data.cost = KinkyDungeonStatStaminaCostTool;
	else if (data.struggleType == "Pick") data.cost = KinkyDungeonStatStaminaCostPick;
	else if (data.struggleType == "Remove") data.cost = KinkyDungeonStatStaminaCostRemove;
	else if (data.struggleType == "Unlock") data.cost = KinkyDungeonStatStaminaCostPick;
	if (data.struggleType == "Cut") data.wcost = KinkyDungeonStatWillCostTool;
	else if (data.struggleType == "Pick") data.wcost = KinkyDungeonStatWillCostPick;
	else if (data.struggleType == "Remove") data.wcost = KinkyDungeonStatWillCostRemove;
	else if (data.struggleType == "Unlock") data.wcost = KinkyDungeonStatWillCostUnlock;
	if (data.struggleType == "Unlock") data.cost = 0;
	KinkyDungeonSendEvent("beforeStruggleCalc", data);
	if (!data.restraint.pickProgress) data.restraint.pickProgress = 0;
	if (!data.restraint.struggleProgress) data.restraint.struggleProgress = 0;
	if (!data.restraint.unlockProgress) data.restraint.unlockProgress = 0;
	if (!data.restraint.cutProgress) data.restraint.cutProgress = 0;
	let EC = KDGetEscapeChance(data.restraint, data.struggleType, data.escapeChance, data.limitChance, true, true, !data.query);
	data.escapeChance = EC.escapeChance;
	data.limitChance = EC.limitChance;

	// Experimental ==> all escape chance increased by 1-progress%, all limit chance increased by the same amount


	if (KDGroupBlocked(data.struggleGroup) && !KDRestraint(data.restraint).alwaysStruggleable) {
		data.escapeChance = 0;
		if (!data.query) {
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint).Blocked) ?
					KDGetEscapeSFX(data.restraint).Blocked : "Struggle")
				+ ".ogg");
			KinkyDungeonSendActionMessage(10, TextGet("KDStruggleBlocked")
				.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)),
			"#ff5277", 2, true);
			KinkyDungeonLastAction = "Struggle";
			KinkyDungeonSendEvent("struggle", {
				restraint: data.restraint,
				group: data.struggleGroup,
				struggleType: data.struggleType,
				result: "Blocked",
			});
			return "Blocked";
		}

	}


	let toolMult = Math.max(0, 1 + data.toolBonus) * data.toolMult;
	let buffMult = Math.max(0, 1 + data.buffBonus) * data.buffMult;




	if (data.struggleType == "Pick" || data.struggleType == "Unlock") data.escapeChance += KinkyDungeonGetPickBonus()*toolMult;
	data.origEscapeChance = data.escapeChance;



	let increasedAttempts = false;

	data.handsBound = KinkyDungeonIsHandsBound(true, false, StruggleTypeHandThresh[data.struggleType]) && !KinkyDungeonCanUseFeet();
	data.handBondage = data.handsBound ? 1.0 : Math.min(1, Math.max(0, KDHandBondageTotal(false)));
	//let cancut = false;

	// Bonuses go here. Buffs dont get added to orig escape chance, but
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostStruggle")) data.escapePenalty -= KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostStruggle");
	if (data.struggleType == "Cut") {
		if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostCutting")) data.escapePenalty -= KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostCutting");
		if (data.hasAffinity) {
			if (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp() || !KinkyDungeonPlayerDamage) {
				let maxBonus = 0;
				let weaponsToTest = KinkyDungeonAllWeapon();//KinkyDungeonCanUseWeapon() ? KinkyDungeonAllWeapon() : [KinkyDungeonPlayerDamage];
				for (let inv of weaponsToTest) {
					if (KDWeapon(inv).cutBonus > maxBonus) maxBonus = KDWeapon(inv).cutBonus;
					if (KDWeapon(inv).cutBonus != undefined && KDWeaponIsMagic(inv)) data.canCutMagic = true;
				}
				data.cutBonus = maxBonus*toolMult;
				data.escapeChance += data.cutBonus;
				data.origEscapeChance += data.cutBonus;
				//if (maxBonus > 0) cancut = true;
			} else if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.cutBonus) {
				data.cutBonus = KinkyDungeonPlayerDamage.cutBonus*toolMult;
				data.escapeChance += data.cutBonus;
				data.origEscapeChance += data.cutBonus;
				//cancut = true;
			}
		}
		if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostCuttingMinimum")) data.escapeChance = Math.max(data.escapeChance, KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostCuttingMinimum"));
	}
	if (data.struggleType == "Cut" && !KDRestraint(data.restraint).magic && KinkyDungeonWeaponCanCut(false, true)) {
		data.escapeChance += KinkyDungeonEnchantedKnifeBonus*toolMult;
		data.origEscapeChance += KinkyDungeonEnchantedKnifeBonus*toolMult;
	}

	// Finger extensions will help if your hands are unbound. Some items cant be removed without them!
	// Mouth counts as a finger extension on your hands if your arms aren't tied
	let armsBound = KinkyDungeonIsArmsBound(true);
	let armsBoundOverride = false;
	let handsBoundOverride = false;

	if (KDUnboundAffinityOverride[data.affinity] && (!data.handsBound || handsBoundOverride) && (!armsBound || armsBoundOverride)) data.hasAffinity = true;

	// Bonus for using lockpick or knife
	if (data.struggleType == "Remove" &&
		(!data.handsBound && (KinkyDungeonWeaponCanCut(true) || KinkyDungeonItemCount("Pick"))
		|| (data.struggleGroup == "ItemHands" && KinkyDungeonCanTalk() && !armsBound))) {
		data.escapeChance = Math.max(data.escapeChance, Math.min(1, data.escapeChance + 0.15*toolMult));
		data.origEscapeChance = Math.max(data.origEscapeChance, Math.min(1, data.origEscapeChance + 0.15*toolMult));
	}

	// Psychic doesnt modify original chance, so that you understand its the perk helping you
	if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.25);


	// Restriction penalties AFTER bonuses
	if (data.restriction > 0 && !KinkyDungeonHasHelp()) {
		let restrictionMult =  1 - 10 / (10 + data.restriction);

		if (data.escapeChance > 0) {
			let penalty = 0;
			switch (data.struggleType) {
				case "Struggle": {
					penalty = 0.3;
					break;
				}
				case "Cut": {
					penalty = 0.6;
					break;
				}
				case "Unlock": {
					penalty = 0.3;
					break;
				}
				case "Pick": {
					penalty = 0.4;
					break;
				}
				case "Remove": {
					penalty = 0.4;
					break;
				}
			}

			data.escapePenalty += data.escapeChance * penalty * restrictionMult;
		}
	}


	let edgeBonus = 0.12*toolMult;
	// Easier to struggle if your legs are free, due to leverage
	// Slight boost to remove as well, but not as much due to the smaller movements required
	if ((data.struggleType == "Struggle" || data.struggleType == "Cut") && data.hasAffinity)
		data.escapeChance += edgeBonus * (0.4 + 0.2*Math.max(2 - KinkyDungeonSlowLevel, 0));
	else if ((data.struggleType == "Remove") && data.hasAffinity)
		data.escapeChance += edgeBonus * (0.2 + 0.15*Math.max(2 - KinkyDungeonSlowLevel, 0));


	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Lockdown")) {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonBuffLockdownTry")
			.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff5277", 1);
		data.escapeChance -= KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Lockdown") * 0.1;
	}


	if (data.escapePenalty < 0) data.escapePenalty *= buffMult;


	// Struggling is unaffected by having arms bound
	let minAmount = 0.1 - Math.max(0, 0.01*KDRestraint(data.restraint).power);
	if (data.struggleType == "Remove" && !data.hasAffinity) minAmount = 0;


	if (data.upfrontWill && !KinkyDungeonHasWill(0.01, false)) {
		data.escapePenalty += data.willEscapePenalty;
		if (data.escapeChance - data.escapePenalty + data.willEscapePenalty > 0
			&& data.escapeChance - data.escapePenalty < 0) {
			if (!data.query) {
				if (data.escapePenalty) {
					data.escapeChance -= data.escapePenalty;
				}

				// Replace with frustrated moan later~
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint).NoWill) ? KDGetEscapeSFX(data.restraint).NoWill : "Struggle")
					+ ".ogg");
				KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle")
					.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff5277", 2, true);
				KinkyDungeonLastAction = "Struggle";
				KinkyDungeonSendEvent("struggle", {
					restraint: data.restraint,
					group: data.struggleGroup,
					struggleType: data.struggleType,
					result: "Will",
				});
				return "Will";
			}
		}
	}

	if (data.escapePenalty) {
		data.escapeChance -= data.escapePenalty;
	}

	if ((data.struggleType == "Struggle") && !data.hasAffinity && data.escapeChance <= 0 && data.escapeChance >= -edgeBonus && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		let typesuff = "";
		if (!data.query) {
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint).Struggle) ? KDGetEscapeSFX(data.restraint).Struggle : "Struggle")
					+ ".ogg");
			if (data.affinity && !KinkyDungeonGetAffinity(false, data.affinity, data.struggleGroup)) typesuff = "Wrong" + data.affinity;
			if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "NeedEdge" + typesuff)
				.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff5277", 2, true);
			KinkyDungeonLastAction = "Struggle";
			KinkyDungeonSendEvent("struggle", {
				restraint: data.restraint,
				group: data.struggleGroup,
				struggleType: data.struggleType,
				result: "NeedEdge",
			});
			return "NeedEdge";
		}
	}

	let removeFail = ((data.struggleType == "Unlock" && !KinkyDungeonStatsChoice.get("Psychic")) || data.struggleType == "Pick") && !(KinkyDungeonHasHelp()) && KDGetEscapeChance(data.restraint, "Remove", undefined, undefined, false, false).escapeChance <= 0;

	if (removeFail) data.escapeChance = 0;

	if (data.escapeChance <= 0
		&& (!KDRestraint(data.restraint).alwaysEscapable
			|| !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		if (!data.restraint.attempts) data.restraint.attempts = 0;
		if (!data.query && data.restraint.attempts < KinkyDungeonMaxImpossibleAttempts) {
			increasedAttempts = true;
			data.restraint.attempts += 1;
			if (data.escapeChance <= -0.5) data.restraint.attempts += 1;
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
				+ ".ogg");
			return "Fail";
		} else {
			if (!data.query) {
				let typesuff = "";
				if (removeFail || (data.origEscapeChance <= 0 && data.helpChance)) typesuff = "3";
				else if (KDRestraint(data.restraint).specStruggleTypes && KDRestraint(data.restraint).specStruggleTypes.includes(data.struggleType)) typesuff = "2";
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
					+ ".ogg");
				if (typesuff == "" && data.failSuffix) typesuff = data.failSuffix;
				if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "Impossible" + typesuff)
					.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff5277", 2, true);
				if (EC.escapeChanceData.GoddessBonus < 0 && EC.escapeChanceData.escapeChance < 0 && EC.escapeChance - EC.escapeChanceData.GoddessBonus > 0) {
					KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonStruggle" + data.struggleType + "ImpossibleGoddess")
						.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff5277", 2, true);
				}

				if (KinkyDungeonHasStamina(-data.cost)) {
					KinkyDungeonLastAction = "Struggle";
					KinkyDungeonSendEvent("struggle", {
						restraint: data.restraint,
						group: data.struggleGroup,
						struggleType: data.struggleType,
						result: "Impossible",
					});

					KinkyDungeonChangeStamina(data.cost, true, 1);
					KinkyDungeonChangeWill(data.wcost);
					if (KinkyDungeonStatsChoice.get("BondageLover")) KinkyDungeonChangeDistraction(KDBondageLoverAmount, false, 0.1);
				}
				KinkyDungeonAdvanceTime(1);
				KinkyDungeonSetFlag("escapeimpossible", 2);
			}
			return "Impossible";
		}
	}

	// Bound arms make fine motor skill escaping more difficult in general
	if (!(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && data.struggleType != "Struggle" && armsBound) {
		if (data.struggleGroup == "ItemArms")
			data.escapeChance *= 0.8;
		else if (data.struggleGroup != "ItemHands")
			data.escapeChance *= 0.7;
		else
			data.escapeChance *= 0.6;
	}

	// Bound arms make escaping more difficult, and impossible if the chance is already slim
	if (data.struggleType != "Struggle" && armsBound) data.escapeChance = Math.max(minAmount, data.escapeChance - (data.struggleGroup != "ItemArms" ? 0.18 : 0.09));
	else if (data.struggleType == "Remove" && !armsBound && !data.handsBound) data.escapeChance = Math.max(minAmount, data.escapeChance + 0.07 * (1 - KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax));

	// Covered hands makes it harder to unlock. If you have the right removal type it makes it harder but wont make it go to 0
	if (((data.struggleType == "Unlock" && !KinkyDungeonStatsChoice.get("Psychic")) || data.struggleType == "Pick" || data.struggleType == "Remove") && data.handsBound)
		data.escapeChance = (data.struggleGroup != "ItemHands" ? 0.6 : 0.8) * Math.max((data.struggleType == "Remove" && data.hasAffinity) ?
		Math.max(0, data.escapeChance * 0.8) : 0, data.escapeChance - 0.07 - 0.1 * data.handBondage);

	if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.2);

	if ((data.struggleType == "Remove") && !data.hasAffinity && data.escapeChance == 0 && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		let typesuff = "";
		if (!data.query) {
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
				+ ".ogg");
			if (data.affinity && !KinkyDungeonGetAffinity(false, data.affinity, data.struggleGroup)) typesuff = "Wrong" + data.affinity;
			if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "NeedEdge" + typesuff)
				.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff5277", 2, true);
			KinkyDungeonLastAction = "Struggle";
			KinkyDungeonSendEvent("struggle", {
				restraint: data.restraint,
				group: data.struggleGroup,
				struggleType: data.struggleType,
				result: "NeedEdge",
			});
			return "NeedEdge";
		}
	}

	let possible = data.escapeChance > 0;
	// Strict bindings make it harder to escape unless you have help or are cutting with affinity
	if (data.strict && data.struggleType == "Struggle")
		data.escapeChance = Math.max(0, data.escapeChance - data.strict * 0.9);

	if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.2);

	if (possible && data.escapeChance == 0 && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		let typesuff = "";
		if (!data.query) {
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
				+ ".ogg");
			if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "Strict" + typesuff)
				.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff5277", 2, true);
			KinkyDungeonLastAction = "Struggle";
			KinkyDungeonSendEvent("struggle", {
				restraint: data.restraint,
				group: data.struggleGroup,
				struggleType: data.struggleType,
				result: "Strict",
			});
			return "Strict";
		}
	}

	// Reduce cutting power if you dont have hands
	if (data.struggleType == "Cut" && KinkyDungeonIsHandsBound(true)) {
		if (KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;})) {
			if (KinkyDungeonWallCrackAndKnife(true)) {
				data.escapeChance *= 0.92;
				data.limitChance *= 0.9; // Compensate by reducing limit chance a little
			} else if (!KinkyDungeonIsArmsBound(true)) {
				data.escapeChance *= 0.7;
				data.limitChance *= 0.8; // Compensate by reducing limit chance a little
			} else if (KinkyDungeonStatsChoice.get("Psychic")) {
				data.escapeChance *= 0.7; // Compensate by reducing limit chance a little
				data.limitChance *= 0.8; // Compensate by reducing limit chance a little
			} else if (data.hasAffinity) {
				data.escapeChance *= 0.5;
				data.limitChance *= 0.6; // Compensate by reducing limit chance a little
			} else {
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedGrip"), "#ff5277", 2, true);
				data.escapeChance *= 0.0;
			}
		} else if (data.hasAffinity) data.escapeChance *= 0.5;
		else data.escapeChance = 0;

		// 5.2.6 - removed because limitchance already accounts for this
		//data.escapeChance = Math.max(0, data.escapeChance - 0.05);

	}

	if (!(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && (data.struggleType == "Pick" || data.struggleType == "Unlock" || data.struggleType == "Remove")) data.escapeChance /= 1.0 + KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax*KinkyDungeonDistractionUnlockSuccessMod;

	// Blue locks make it harder to escape an item

	if (data.lockType && data.lockType.penalty && data.lockType.penalty[data.struggleType]) data.escapeChance = Math.max(0, data.escapeChance - data.lockType.penalty[data.struggleType]);


	if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.15);

	let belt = null;
	let bra = null;

	if (data.struggleGroup == "ItemVulva" || data.struggleGroup == "ItemVulvaPiercings" || data.struggleGroup == "ItemButt") belt = KinkyDungeonGetRestraintItem("ItemPelvis");
	if (belt && KDRestraint(belt) && KDRestraint(belt).chastity) data.escapeChance = 0.0;

	if (data.struggleGroup == "ItemNipples" || data.struggleGroup == "ItemNipplesPiercings") bra = KinkyDungeonGetRestraintItem("ItemBreast");
	if (bra && KDRestraint(bra) && KDRestraint(bra).chastitybra) data.escapeChance = 0.0;

	if (!data.query) {
		KinkyDungeonSetFlag(data.struggleType, 1);
		KinkyDungeonSetFlag("escaping", 1);
	}

	if (data.escapeChance <= 0
		&& (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		if (!data.restraint.attempts) data.restraint.attempts = 0;
		if (data.restraint.attempts < KinkyDungeonMaxImpossibleAttempts || increasedAttempts) {
			if (!increasedAttempts) {
				data.restraint.attempts += 0.5;
				if (data.escapeChance <= -0.5) data.restraint.attempts += 0.5;
			}
			return "Fail";
		} else {
			if (!data.query) {
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
					+ ".ogg");
				let suff = "";
				if (suff == "" && data.failSuffix) suff = data.failSuffix;
				if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) suff = suff + "Aroused";
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "ImpossibleBound" + suff)
					.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff5277", 2, true);


				if (KinkyDungeonHasStamina(-data.cost)) {
					KinkyDungeonLastAction = "Struggle";
					KinkyDungeonSendEvent("struggle", {
						restraint: data.restraint,
						group: data.struggleGroup,
						struggleType: data.struggleType,
						result: "Impossible",
					});
					KinkyDungeonChangeStamina(data.cost, true, 1);
					KinkyDungeonChangeWill(data.wcost);
					if (KinkyDungeonStatsChoice.get("BondageLover")) KinkyDungeonChangeDistraction(KDBondageLoverAmount, false, 0.1);
				}
				KinkyDungeonAdvanceTime(1);
				KinkyDungeonSetFlag("escapeimpossible", 2);
				return "Impossible";
			}
		}
	}

	if (KDRestraint(data.restraint) && KDRestraint(data.restraint).escapeMult != undefined) data.escapeChance *= KDRestraint(data.restraint).escapeMult;

	if (KDRestraint(data.restraint) && KDRestraint(data.restraint).struggleMult && KDRestraint(data.restraint).struggleMult[data.struggleType] != undefined)
		data.escapeChance *= KDRestraint(data.restraint).struggleMult[data.struggleType];
	if (KDRestraint(data.restraint) && KDRestraint(data.restraint).limitMult && KDRestraint(data.restraint).limitMult[data.struggleType] != undefined)
		data.limitChance *= KDRestraint(data.restraint).limitMult[data.struggleType];


	if (!data.upfrontWill && !KinkyDungeonHasWill(0.01, false)) {
		data.limitChance += data.willEscapePenalty;
		if (data.escapeChance - data.limitChance + data.willEscapePenalty > 0
			&& data.escapeChance - data.limitChance < 0) {
			if (!data.query) {
				// Replace with frustrated moan later~
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint).NoWill) ? KDGetEscapeSFX(data.restraint).NoWill : "Struggle")
					+ ".ogg");
				KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle")
					.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff5277", 2, true);
				KinkyDungeonLastAction = "Struggle";
				KinkyDungeonSendEvent("struggle", {
					restraint: data.restraint,
					group: data.struggleGroup,
					struggleType: data.struggleType,
					result: "Will",
				});
				return "Will";
			}
		}
	}


	if (data.escapeChance > Math.max(0, data.limitChance, data.extraLim)
		|| (KDRestraint(data.restraint).alwaysEscapable
			&& KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		// Min struggle speed is always 0.05 = 20 struggle attempts
		data.minSpeed = (KDRestraint(data.restraint).struggleMinSpeed && KDRestraint(data.restraint).struggleMinSpeed[data.struggleType]) ? KDRestraint(data.restraint).struggleMinSpeed[data.struggleType] : data.minSpeed;
		data.escapeChance = Math.max(data.escapeChance, data.minSpeed);
	}


	// Struggling is affected by tightness
	if (data.escapeChance > 0 && data.struggleType != "Unlock") {// && StruggleType == "Struggle") {
		for (let T = 0; T < data.restraint.tightness; T++) {
			data.escapeChance *= KDGetTightnessEffect(data.escapeChance, data.struggleType, T); // Tougher for each tightness, however struggling will reduce the tightness
		}
	}

	if (KDRestraint(data.restraint) && KDRestraint(data.restraint).struggleMaxSpeed && KDRestraint(data.restraint).struggleMaxSpeed[data.struggleType] != undefined)
		data.escapeChance = Math.min(data.escapeChance, KDRestraint(data.restraint).struggleMaxSpeed[data.struggleType]);



	return "";
}

/**
 * Lockpick = use tool or cut
 * Otherwise, just a normal struggle
 * @param struggleGroup
 * @param StruggleType
 * @param index
 * @param [query]
 * @param [retData]
 */
function KinkyDungeonStruggle(struggleGroup: string, StruggleType: string, index: number, query: boolean = false, retData?: KDStruggleData): string {

	if (!query && KinkyDungeonPlayerEntity && !KinkyDungeonCanTalk() && KDRandom() < KinkyDungeonGagMumbleChanceRestraint) {
		let msg = "KinkyDungeonGagStruggle" + (StruggleType != "Struggle" ? "Quiet" : "");
		let gagMsg = Math.floor(KDRandom() * 3);

		msg = msg + gagMsg;

		KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet(msg), "#ffffff", 5, 3);
	}

	if (!query)
		KinkyDungeonSetFlag("tryescaping", 3);
	let restraint = KinkyDungeonGetRestraintItem(struggleGroup);
	let host = restraint;
	if (index) {
		let surfaceItems = KDDynamicLinkListSurface(restraint);
		let dynamicItems = KDDynamicLinkList(restraint, true);
		if (surfaceItems[index]) {
			restraint = surfaceItems[index];
			for (let h_item of dynamicItems) {
				if (h_item.dynamicLink == restraint) {
					host = h_item;
					break;
				}
			}
			//host = surfaceItems[index - 1];
		}
		else console.log("Error! Please report the item combination and screenshot to Ada!");
	}
	let failSuffix = "";
	if (restraint && KDRestraint(restraint).failSuffix && KDRestraint(restraint).failSuffix[StruggleType]) {
		failSuffix = KDRestraint(restraint).failSuffix[StruggleType];
	}
	if (!restraint) return "Fail";
	KinkyDungeonCurrentEscapingItem = restraint;
	KinkyDungeonCurrentEscapingMethod = StruggleType;
	KinkyDungeonStruggleTime = CommonTime() + 750;
	let Pass = "Fail";
	let restraintEscapeChancePre = KDRestraint(restraint).escapeChance[StruggleType] != undefined ? KDRestraint(restraint).escapeChance[StruggleType] : 1.0;
	let restraintLimitChancePre = (KDRestraint(restraint).limitChance && KDRestraint(restraint).limitChance[StruggleType] != undefined) ? KDRestraint(restraint).limitChance[StruggleType] : 0.12;
	let helpChance = (KDRestraint(restraint).helpChance != undefined && KDRestraint(restraint).helpChance[StruggleType] != undefined) ? KDRestraint(restraint).helpChance[StruggleType] : 0.0;
	let limitChance = (KDRestraint(restraint).limitChance != undefined && KDRestraint(restraint).limitChance[StruggleType] != undefined) ? KDRestraint(restraint).limitChance[StruggleType] :
		((StruggleType == "Unlock" || StruggleType == "Pick") ? 0 : 0.05);
	let speedmult = (KDRestraint(restraint).speedMult != undefined && KDRestraint(restraint).speedMult[StruggleType] != undefined) ? KDRestraint(restraint).speedMult[StruggleType] :
		1;
	if (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) {
		if (!query)
			KinkyDungeonSetFlag("HelpMeFlag", 8);
		if (helpChance)
			restraintEscapeChancePre = helpChance;
		limitChance = 0;
	}
	if (KinkyDungeonHasAngelHelp()) {
		restraintEscapeChancePre += 0.1;
	}

	KinkyDungeonInterruptSleep();

	let affinity = KDGetRestraintAffinity(restraint, {StruggleType: StruggleType});

	/**
	 */
	let data: KDStruggleData = {
		minSpeed: KDMinEscapeRate,
		handBondage: 0,
		handsBound: false,
		armsBound: false,
		query: query,
		cutBonus: 0,
		restraint: restraint,
		struggleType: StruggleType,
		struggleGroup: struggleGroup,
		escapeChance: restraintEscapeChancePre,
		origEscapeChance: restraintEscapeChancePre,
		origLimitChance: restraintLimitChancePre,
		limitChance: limitChance,
		helpChance: helpChance,
		cutSpeed: 0.25,
		affinity: affinity,
		noise: StruggleType == "Struggle" ? 4 : 0,
		strict: KinkyDungeonStrictness(true, struggleGroup, restraint),
		hasAffinity: KinkyDungeonGetAffinity(!query, affinity, struggleGroup),
		restraintEscapeChance: KDRestraint(restraint).escapeChance[StruggleType],
		cost: KinkyDungeonStatStaminaCostStruggle,
		wcost: KinkyDungeonStatWillCostStruggle,
		escapePenalty: -KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StrugglePower"),
		willEscapePenalty: KDGetWillPenalty(StruggleType),
		canCut: KinkyDungeonWeaponCanCut(false, false),
		canCutMagic: KinkyDungeonWeaponCanCut(false, true),
		toolBonus: 0.0,
		toolMult: 1.0,
		buffBonus: 0.0,
		failSuffix: "",
		buffMult: 1.0,
		struggleTime: 1.0,
		restriction: KDGameData.Restriction || 0,
		speedMult: (speedmult || 1) * (KinkyDungeonHasHelp() ? 2.0 : 1.0),
		escapeSpeed: 0,
		maxLimit: 1,
		result: "",
		lockType: (restraint.lock && KDLocks[restraint.lock]) ? KDLocks[restraint.lock] : null,

		extraLim: 0,
		extraLimPenalty: 0,
		extraLimThreshold: 0,

		upfrontWill: KDUpfrontWill,
	};

	// Prevent crashes due to weirdness
	if ((data.struggleType == "Pick" || data.struggleType == "Unlock") && !data.lockType) return "Fail";

	data.escapeSpeed = KDBaseEscapeSpeed * data.speedMult;
	data.extraLim = (data.struggleType == "Pick" && data.lockType?.pick_lim) ? Math.max(0, data.lockType.pick_lim) : 0;
	data.extraLimPenalty = (data.struggleType == "Pick") ? data.extraLim * data.restraint.pickProgress : 0;
	data.extraLimThreshold = Math.min(1, (data.escapeChance / data.extraLim));

	let result = KDGetStruggleData(data);

	if (retData)
		Object.assign(retData, data);

	if (!query) {

		// Handle cases where you can't even attempt to unlock or pick
		if (data.lockType && (StruggleType == "Unlock" && !data.lockType.canUnlock(data))
			|| (StruggleType == "Pick" && data.lockType && !data.lockType.canPick(data))) {
			if (StruggleType == "Unlock")
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggleUnlockNo" + restraint.lock + "Key")
					.replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "orange", 2, true);
			else
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggleCantPick" + restraint.lock + "Lock")
					.replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "orange", 2, true);
		} else if (result != "Impossible") {

			// Limit of what you can struggle to given current limit chance
			let maxLimit = 100;


			// Main struggling block
			/*if ((data.wcost > 0 && !KinkyDungeonHasWill(-data.wcost, false)) && (data.escapeChance*0.5 <= data.willEscapePenalty && !KinkyDungeonHasWill(0.01, false))) {
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).NoWill) ? KDGetEscapeSFX(restraint).NoWill : "Struggle")
					+ ".ogg");
				KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle")
					.replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff5277", 2, true);
				KinkyDungeonLastAction = "Struggle";
				KinkyDungeonSendEvent("struggle", {
					restraint: restraint,
					group: struggleGroup,
					struggleType: StruggleType,
					result: "Will",
				});
				return "Will";
			} else */
			if (!KinkyDungeonHasStamina(-data.cost, true)) {
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).NoStamina) ? KDGetEscapeSFX(restraint).NoStamina : "Struggle")
					+ ".ogg");
				KinkyDungeonWaitMessage(true, 0);
			} else if (data.escapeChance > 0) {

				let cutStruggleProgress = Math.min(1, (data.restraint.struggleProgress || 0) + (data.restraint.cutProgress || 0));

				// One last check: check limits
				if ((data.limitChance > 0 || data.extraLim > 0) && data.escapeChance > 0) {
					let threshold = 0.75;
					if (data.limitChance > data.escapeChance) {
						threshold = Math.min(threshold, 0.9*(data.escapeChance / data.limitChance));
					}
					let limitProgress = 0;
					let maxPossible = 1;

					switch(StruggleType) {
						case "Struggle":
							limitProgress = (KDRestraint(restraint).struggleBreak ? cutStruggleProgress : data.restraint.struggleProgress) ? (
								(KDRestraint(restraint).struggleBreak ? cutStruggleProgress : data.restraint.struggleProgress) < threshold ?
									threshold * (KDRestraint(restraint).struggleBreak ? cutStruggleProgress : data.restraint.struggleProgress)
									: 1.0)
								: 0;
							if (data.limitChance > 0 && data.limitChance > data.escapeChance) {
								// Find the intercept
								maxPossible = threshold;
							}
							break;
						case "Cut":
							threshold = KDMaxCutDepth(threshold, data.cutBonus, data.origEscapeChance, data.origLimitChance);

							limitProgress = (data.restraint.cutProgress || 0) ? (
								(data.restraint.cutProgress || 0) < threshold ? threshold * (data.restraint.cutProgress || 0) : 1.0)
								: 0;
							if (data.limitChance > 0) {
								// Find the intercept
								maxPossible = threshold;
							}
							break;
						default:
							limitProgress = cutStruggleProgress ?
								Math.min(1, 1.15 - 1.15 * cutStruggleProgress)
								: 1;
							break;
					}

					/*cutStruggleProgress ? (StruggleType == "Struggle" ?
						(cutStruggleProgress < threshold ? threshold * cutStruggleProgress : 1.0) :
						Math.min(1, 1.15 - 1.15 * cutStruggleProgress))
						: (StruggleType == "Struggle" ? 0 : 1);*/
					let limitPenalty = Math.max(0, Math.min(1, limitProgress) * data.limitChance, data.extraLimPenalty);

					if (data.extraLim > data.escapeChance) {
						// Find the intercept
						maxPossible = Math.min(data.extraLimThreshold, maxPossible);
					}


					// Prevent struggling past this
					if (maxPossible < 1) maxLimit = maxPossible;

					if (data.extraLimPenalty > 0 && data.extraLimPenalty > limitPenalty) {
						data.escapeChance -= data.extraLimPenalty;
						if (data.escapeChance <= 0) {
							// Replace with frustrated moan later~
							if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint)[data.struggleType]) ? KDGetEscapeSFX(restraint)[data.struggleType] : "Struggle")
								+ ".ogg");
							KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Limit")
								.replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff5277", 2, true);
							KinkyDungeonLastAction = "Struggle";
							KinkyDungeonSendEvent("struggle", {
								restraint: restraint,
								group: struggleGroup,
								struggleType: StruggleType,
								result: "LimitExtra",
							});
							return "LimitExtra";
						}
					} else if (limitPenalty > 0) {
						data.escapeChance -= limitPenalty;
						if (data.escapeChance <= 0) {
							// Replace with frustrated moan later~
							if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint)[data.struggleType]) ? KDGetEscapeSFX(restraint)[data.struggleType] : "Struggle")
								+ ".ogg");
							KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Limit")
								.replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff5277", 2, true);
							KinkyDungeonLastAction = "Struggle";
							KinkyDungeonSendEvent("struggle", {
								restraint: restraint,
								group: struggleGroup,
								struggleType: StruggleType,
								result: "Limit",
							});
							return "Limit";
						}
					}
				}


				if (data.escapeChance <= 0) {
					if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
						+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint)[data.struggleType]) ? KDGetEscapeSFX(restraint)[data.struggleType] : "Struggle")
						+ ".ogg");
					// Replace with frustrated moan later~
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Barely")
						.replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff5277", 2, true);
					KinkyDungeonLastAction = "Struggle";
					KinkyDungeonSendEvent("struggle", {
						restraint: restraint,
						group: struggleGroup,
						struggleType: StruggleType,
						result: "Barely",
					});
					return "Barely";
				}


				// Pass block
				let progress = restraint.cutProgress ? restraint.cutProgress : 0;
				data.struggleTime *= KinkyDungeonStatsChoice.get("FranticStruggle") ? 1 : Math.max(1, KDStruggleTime - KinkyDungeonGetBuffedStat(KinkyDungeonPlayerEntity, "FastStruggle"));
				if (KinkyDungeonStatsChoice.get("FranticStruggle")) data.cost *= 1.5;

				if (((StruggleType == "Cut" && progress >= 1 - data.escapeChance)
						|| (StruggleType == "Pick" && restraint.pickProgress >= 1 - data.escapeChance)
						|| (StruggleType == "Unlock" && restraint.unlockProgress >= 1 - data.escapeChance)
						|| (StruggleType == "Remove" && progress >= 1 - data.escapeChance)
						|| (progress >= 1 - data.escapeChance))
					&& !(StruggleType == "Pick" && data.lockType && !data.lockType.canPick(data))) {
					Pass = "Success";
					if (StruggleType == "Unlock") {
						KinkyDungeonRemoveKeysUnlock(restraint.lock);
						KinkyDungeonLock(restraint, "");
					} else
						KDSuccessRemove(StruggleType, restraint, data.lockType, index, data, host);
				} else {
					// Failure block for the different failure types
					if (StruggleType == "Cut") {
						if (((data.handsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound) || (data.armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound)) && KinkyDungeonWeaponCanCut(false) && KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name) {
							if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).KnifeDrop) ? KDGetEscapeSFX(restraint).KnifeDrop : "Miss")
								+ ".ogg");
							Pass = "Drop";
							KinkyDungeonDisarm(KinkyDungeonPlayerEntity, "Cut");
						} else {
							if (KDItemIsMagic(restraint) && !data.canCutMagic) {
								if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
									+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).NoMagic) ? KDGetEscapeSFX(restraint).NoMagic : "SoftShield")
									+ ".ogg");
								Pass = "Fail";
							} else {
								if (KDSoundEnabled()) {
									if (KDItemIsMagic(restraint))
										AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
										+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).MagicCut) ? KDGetEscapeSFX(restraint).MagicCut : "Cut")
										+ ".ogg");
									else AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
										+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).Cut) ? KDGetEscapeSFX(restraint).Cut : "Cut")
										+ ".ogg");
								}
								let mult = 1.0 - 0.9 * Math.min(1.0, progress);
								if (KinkyDungeonStatsChoice.get("Flexible")) mult *= KDFlexibleSpeedBonus;
								if (KinkyDungeonStatsChoice.get("Inflexible")) mult *= KDInflexibleSpeedBonus;
								// Speed = minimum for cutting
								let speed = data.cutSpeed * mult + Math.max(0, data.escapeChance) * 0.5;
								mult *= 0.75 + 0.25 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
								KDAddDelayedStruggle(
									data.escapeSpeed * speed * (0.3 + 0.2 * KDRandom() + 0.6 * Math.max(0, (KinkyDungeonStatStamina)/KinkyDungeonStatStaminaMax)),
									data.struggleTime, StruggleType, struggleGroup, index, data,
									restraint.cutProgress, maxLimit
								);
								if (speed > 0) {
									let debris = "";
									let debrisFlag = KDRestraint(restraint).Group + "deb";
									if (!KinkyDungeonFlags.get(debrisFlag)) {
										if (KDRestraint(restraint)?.debris && KDRandom() < KDRestraint(restraint)?.debrisChance ? KDRestraint(restraint)?.debrisChance : 1.0) debris = KDRestraint(restraint)?.debris;
									}

									if (debris) {
										KinkyDungeonSetFlag(debrisFlag, 4);
										KDCreateDebris(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, {
											aoe: 1.5,
											dist: 0.5,
											kind: debris,
											number: 1,
										});
									}
								}
							}
						}
					} else if (StruggleType == "Pick") {
						if (data.lockType && data.lockType.breakChance(data)) { // Chance to break pick
							Pass = "Break";
							if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).PickBreak) ? KDGetEscapeSFX(restraint).PickBreak : "PickBreak")
								+ ".ogg");
							KDAddConsumable("Pick", -1);
							KinkyDungeonPickBreakProgress = 0;
						} else if (!KinkyDungeonStatsChoice.get("Psychic") && (data.handsBound || (data.armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
							if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).PickDrop) ? KDGetEscapeSFX(restraint).PickDrop : "Miss")
								+ ".ogg");
							Pass = "Drop";
							KinkyDungeonDropItem({name: "Pick"}, KinkyDungeonPlayerEntity, true);
							KDAddConsumable("Pick", -1);
						} else {
							if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).Pick) ? KDGetEscapeSFX(restraint).Pick : "Pick")
								+ ".ogg");
							if (!restraint.pickProgress) restraint.pickProgress = 0;
							let mult = 0.5 + 0.6 * (progress);
							if (data.lockType?.pick_speed) mult /= data.lockType.pick_speed;
							if (KinkyDungeonStatsChoice.get("Locksmith")) mult *= KDLocksmithSpeedBonus;
							if (KinkyDungeonStatsChoice.get("Clueless")) mult *= KDCluelessSpeedBonus;
							mult *= 0.5 + 0.5 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
							KDAddDelayedStruggle(
								data.escapeSpeed * mult * (data.escapeChance > 0 ? (KDMinPickRate * (data.escapeChance > 0.5 ? 2 : 1)) : 0) * (0.8 + 0.4 * KDRandom() - 0.4 * Math.max(0, (KinkyDungeonStatDistraction)/KinkyDungeonStatDistractionMax)),
								data.struggleTime, StruggleType, struggleGroup, index, data,
								restraint.pickProgress, maxLimit
							);
						}
					} else if (StruggleType == "Unlock") {
						if (!KinkyDungeonStatsChoice.get("Psychic") && (data.handsBound || (data.armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
							if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).KeyDrop) ? KDGetEscapeSFX(restraint).KeyDrop : "Miss")
								+ ".ogg");
							Pass = "Drop";
							let keytype = KinkyDungeonGetKey(restraint.lock);
							if (keytype) {
								//KinkyDungeonDropItem({name: keytype+"Key"}, KinkyDungeonPlayerEntity, true);
								KinkyDungeonRemoveKeysDropped(restraint.lock, keytype);
							}
						} else {
							if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).Pick) ? KDGetEscapeSFX(restraint).Pick : "Pick")
								+ ".ogg");
							let mult = 0.2 + 1.8 * (progress);
							if (KinkyDungeonStatsChoice.get("Flexible")) mult *= KDFlexibleSpeedBonus;
							if (KinkyDungeonStatsChoice.get("Inflexible")) mult *= KDInflexibleSpeedBonus;
							if (KinkyDungeonStatsChoice.get("Locksmith")) mult *= KDLocksmithSpeedBonus;
							mult *= 0.5 + 0.5 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
							KDAddDelayedStruggle(
								data.escapeSpeed * mult * Math.max(data.escapeChance > 0 ? data.minSpeed : 0, data.escapeChance) * (0.8 + 0.4 * KDRandom() - 0.4 * Math.max(0, (KinkyDungeonStatDistraction)/KinkyDungeonStatDistractionMax)),
								data.struggleTime, StruggleType, struggleGroup, index, data,
								restraint.unlockProgress, maxLimit
							);
						}
					} else if (StruggleType == "Remove") {
						if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
							+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).Remove) ? KDGetEscapeSFX(restraint).Remove : "Struggle")
							+ ".ogg");
						let mult = 0.3 + 1.7 * (progress * progress);
						if (KinkyDungeonStatsChoice.get("Flexible")) mult *= KDFlexibleSpeedBonus;
						if (KinkyDungeonStatsChoice.get("Inflexible")) mult *= KDInflexibleSpeedBonus;
						mult *= 0.75 + 0.25 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
						KDAddDelayedStruggle(
							data.escapeSpeed * mult * Math.max(data.escapeChance > 0 ? data.minSpeed : 0, data.escapeChance) * (0.8 + 0.4 * KDRandom() - 0.3 * Math.max(0, (KinkyDungeonStatDistraction)/KinkyDungeonStatDistractionMax)),
							data.struggleTime, StruggleType, struggleGroup, index, data,
							restraint.struggleProgress, maxLimit
						);
					} else if (StruggleType == "Struggle") {
						if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
							+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).Struggle) ? KDGetEscapeSFX(restraint).Struggle : "Struggle")
							+ ".ogg");
						let mult = 1.25 - 0.75 * (progress);
						if (KinkyDungeonStatsChoice.get("Flexible")) mult *= KDFlexibleSpeedBonus;
						if (KinkyDungeonStatsChoice.get("Inflexible")) mult *= KDInflexibleSpeedBonus;
						mult *= 0.5 + 0.5 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
						KDAddDelayedStruggle(
							data.escapeSpeed * mult * Math.max(data.escapeChance > 0 ? data.minSpeed : 0, data.escapeChance) * (0.5 + 0.4 * KDRandom() + 0.3 * Math.max(0, (KinkyDungeonStatStamina)/KinkyDungeonStatStaminaMax)),
							data.struggleTime, StruggleType, struggleGroup, index, data,
							KDRestraint(restraint)?.struggleBreak ? restraint.cutProgress : restraint.struggleProgress, maxLimit
						);
					}
				}
			}

			// Aftermath
			let suff = "";
			if (Pass == "Fail" && data.escapeChance > 0 && data.origEscapeChance <= 0) {
				if ((KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && data.helpChance) suff = "3";
				else suff = "2";
			} else if (Pass == "Fail") {
				if (suff == "" && failSuffix) suff = failSuffix;
			}
			if ((suff == "" || (Pass == "Fail" && suff == failSuffix)) && (Pass == "Fail" || Pass == "Success") && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) suff = suff + "Aroused";

			if (Pass != "Success")
				KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonStruggle" + StruggleType + Pass + suff).replace("TargetRestraint", TextGet("Restraint" + KDRestraint(restraint).name)), (Pass == "Success") ? "lightgreen" : "#ff5277", 2);

			if (KinkyDungeonHasStamina(-data.cost)) {
				KinkyDungeonChangeStamina(data.cost, true, 1);
				KinkyDungeonChangeWill(data.wcost);
				if (KinkyDungeonStatsChoice.get("BondageLover")) KinkyDungeonChangeDistraction(KDBondageLoverAmount, false, 0.1);

				if (Pass != "Success") {
					// Reduce the progress
					if (StruggleType == "Struggle") {
						restraint.pickProgress = Math.max(0, restraint.pickProgress * 0.5 - 0.01);
						restraint.unlockProgress = Math.max(0, restraint.unlockProgress * 0.5 - 0.01);
					} else if (StruggleType == "Pick") {
						restraint.unlockProgress = Math.max(0, restraint.unlockProgress * 0.5 - 0.01);
					} else if (StruggleType == "Unlock") {
						restraint.pickProgress = Math.max(0, restraint.pickProgress* 0.5 - 0.01);
					} if (StruggleType == "Remove") {
						restraint.pickProgress = Math.max(0, restraint.pickProgress* 0.5 - 0.01);
						restraint.unlockProgress = Math.max(0, restraint.unlockProgress * 0.5 - 0.01);
					}

				} else if (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp())
					KinkyDungeonChangeRep("Ghost", 1);


				KinkyDungeonSendEvent("struggle", {
					restraint: restraint,
					group: struggleGroup,
					struggleType: StruggleType,
					result: Pass,
				});
				KinkyDungeonLastAction = "Struggle";
				if (data.noise) {
					KinkyDungeonMakeNoise(data.noise, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
				}
			}

			KinkyDungeonAdvanceTime(1);
			if (Pass == "Success") KinkyDungeonCurrentEscapingItem = null;
			return Pass;
		}
		KinkyDungeonSetFlag("escapeimpossible", 2);
		return "Impossible";
	} else {
		return result || ((data.escapeChance - Math.max(0, data.limitChance, data.extraLim) > 0) ? "Success" : "Impossible");
	}

}

/**
 * "Return the first restraint item in the game that belongs to the given group."
 * @param group - The group of the restraint item you want to get.
 * @param [index] - The index of the restraint item you want to get.
 * @returns The item that matches the group.
 */
function KinkyDungeonGetRestraintItem(group: string, index?: number): item {
	for (let item of KinkyDungeonAllRestraint()) {
		if (item.type == Restraint && KDRestraint(item).Group == group) {
			if (index) {
				let link = item;
				let count = 0;
				while (count < index && link) {
					count += 1;
					link = link.dynamicLink;
				}
				if (count == index) return link;
				return null;
			}
			return item;
		}
	}
	return null;
}

/**
 * Refreshes the restraints map
 */
function KinkyDungeonRefreshRestraintsCache() {
	KinkyDungeonRestraintsCache = new Map();
	for (let r of KinkyDungeonRestraints) {
		KinkyDungeonRestraintsCache.set(r.name, r);
	}
}


/**
 * @param Name
 */
function KinkyDungeonGetRestraintByName(Name: string): restraint {
	if (KinkyDungeonRestraintsCache.size > 0) {
		// Nothing
	} else {
		KinkyDungeonRefreshRestraintsCache();
	}
	if (KinkyDungeonRestraintVariants[Name]) Name = KinkyDungeonRestraintVariants[Name].template;

	return KinkyDungeonRestraintsCache.get(Name);
}

/**
 * @param Lock
 * @param [item] - Factoring in curse
 * @param [curse] - Curse to add
 * @param [restraint] - restraint to add, checks to make sure its lockable
 */
function KinkyDungeonGetLockMult(Lock: string, item?: item, curse?: string, restraint?: restraint): number {
	if (restraint && !KinkyDungeonIsLockable(restraint)) return 1;
	let mult = 1;
	if (Lock && KDLocks[Lock]) mult = KDLocks[Lock].lockmult;
	if (item && KDGetCurse(item)) mult = KDCurseMult(KDGetCurse(item));
	if (curse) mult = KDCurseMult(curse);

	return mult;
}

let KDHeavyRestraintPrefs = [
	"More_Armbinders",
	"More_Boxbinders",
	"More_Jackets",
	"More_Yokes",
	"Less_Armbinders",
	"Less_Boxbinders",
	"Less_Jackets",
	"Less_Yokes",
];

/** Tags which the 'agnostic' option on KinkyDungeonGetRestraint does not override */
let KDNoOverrideTags = [
	"NoVibes",
	"Unmasked",
	"NoSenseDep",
	"NoHood",
	"FreeBoob",
	"Unchained",
	"Damsel",
	"NoPet",
	"NoKigu",
	"NoBlindfolds",
	"arousalMode",
	"arousalModePlug",
	"arousalModePlugNoFront",
	"arousalModePiercing",
	...KDHeavyRestraintPrefs,
];

type eligibleRestraintOptions = {
	dontAugmentWeight?:  boolean;
	ApplyVariants?:      boolean;
	dontPreferVariant?:  boolean;
	allowLowPower?:      boolean;
	ForceDeep?:          boolean;
	/** Only use with KDGetRestraintWithVariants */
	extraOptions?:       string[];
	inventoryWeight?: 	 number;
}

/**
 * Not to be confused with EligibleRestraintEntry
 */
type eligibleRestraintItem = {
	restraint:  restraint;
	variant?:   ApplyVariant;
	weight:     number;
	inventoryVariant?: string,
}

/**
 * @param enemy
 * @param Level
 * @param Index
 * @param Bypass
 * @param Lock
 * @param [RequireWill]
 * @param [LeashingOnly]
 * @param [NoStack]
 * @param [extraTags]
 * @param [agnostic] - Determines if playertags and current bondage are ignored
 * @param [filter] - Filters for items
 * @param [securityEnemy] - Bypass is treated separately for these groups
 * @param [curse] - Going to add this curse
 * @param [filterEps] - Anything under this is filtered unless nothing is above it
 * @param [minWeightFallback]
 * @param [useAugmented] - useAugmented
 * @param [augmentedInventory]
 * @param [options]
 * @param [options.dontAugmentWeight]
 * @param [options.ApplyVariants]
 * @param [options.dontPreferVariant]
 * @param [options.allowLowPower]
 * @param [options.ForceDeep]
 */
function KDGetRestraintsEligible (
	enemy:               KDHasTags,
	Level:               number,
	Index:               string,
	Bypass:              boolean,
	Lock:                string,
	RequireWill?:        boolean,
	LeashingOnly?:       boolean,
	NoStack?:            boolean,
	extraTags?:          Record<string, number>,
	agnostic?:           boolean,
 	filter?:             {minPower?: number, maxPower?: number, onlyLimited?: boolean, noUnlimited?: boolean, noLimited?: boolean, onlyUnlimited?: boolean, ignore?: string[], require?: string[], looseLimit?: boolean, ignoreTags?: string[], allowedGroups?: string[]},
	securityEnemy?:      entity,
	curse?:              string,
	filterEps:           number = 0.9,
	minWeightFallback:   boolean = true,
	useAugmented:        boolean = false,
	augmentedInventory:  string[] = undefined,
	options?:            eligibleRestraintOptions
): eligibleRestraintItem[]
{
	let RestraintsList: eligibleRestraintItem[] = [];
	let effLevel = Level;
	if (KinkyDungeonStatsChoice.has("TightRestraints")) {
		effLevel *= KDTightRestraintsMult;
		effLevel += KDTightRestraintsMod;
	}

	if (KinkyDungeonStatsChoice.has("NoWayOut")) RequireWill = false;
	let willPercent = (KinkyDungeonStatWill / KinkyDungeonStatWillMax - 0.15 * KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax)
		/(1 + (KinkyDungeonGoddessRep.Ghost + 50)/100);

	if (KinkyDungeonSlowLevel > 0) willPercent = willPercent * (0.6 + 0.4 * Math.min(1, Math.max(0, 1 - KinkyDungeonSlowLevel/3)));

	let tags = new Map();
	if (enemy.tags.length) {
		for (let t of enemy.tags) {
			tags.set(t, true);
		}
	} else {
		for (let t of Object.keys(enemy.tags)) {
			tags.set(t, true);
		}
	}
	if (extraTags)
		for (let t of Object.entries(extraTags)) {
			if (effLevel >= +t[1])
				tags.set(t[0], true);
		}

	if (filter?.ignoreTags) {
		for (let ft of filter.ignoreTags) {
			tags.delete(ft);
		}
	}

	let arousalMode = KinkyDungeonStatsChoice.get("arousalMode");
	let cache: { r : restraint; w : number, inventory?: boolean, name?: string}[] = [];
	for (let restraint of KinkyDungeonRestraints) {

		if ((
			effLevel >= restraint.minLevel
				|| KinkyDungeonNewGame > 0
				|| (restraint.ignoreMinLevelTags?.some((t) => {return tags.get(t);}))
				|| filter?.require?.includes(restraint.name)
		) && (
			!restraint.maxLevel
				|| effLevel < restraint.maxLevel
				|| (restraint.ignoreMaxLevelTags?.some((t) => {return tags.get(t);}))
		) && (
			restraint.allFloors
				|| restraint.floors[Index]
				|| (restraint.ignoreFloorTags?.some((t) => {return tags.get(t);}))

		)) {
			if (!restraint.arousalMode || arousalMode) {
				let enabled = false;
				let weight = restraint.weight;
				for (let t of tags.keys()) {
					if (restraint.enemyTags[t] != undefined) {
						weight += restraint.enemyTags[t];
						enabled = true;
					}
				}

				if (restraint.enemyTagsMult)
					for (let t of tags.keys()) {
						if (restraint.enemyTagsMult[t] != undefined) {
							weight *= restraint.enemyTagsMult[t];
						}
					}
				if (enabled) {
					cache.push({r: restraint, w:weight});
				}
			}
		}
	}

	if (options?.extraOptions) {
		for (let opt of options.extraOptions) {
			if (KDRestraint({name: opt}))
				cache.push({r: KDRestraint({name: opt}), w:options?.inventoryWeight || 100, name: opt, inventory: true})
		}
	}

	let add = false;
	let addedVar = false;
	for (let r of cache) {
		let restraint = r.r;
		if (filter && !r.inventory) {
			if (filter.allowedGroups && !filter.allowedGroups.includes(r.r.Group)) continue;
			if (filter.maxPower && r.r.power > filter.maxPower && (!filter.looseLimit || !r.r.unlimited)) continue;
			if (filter.minPower && r.r.power < filter.minPower && (!filter.looseLimit || !r.r.limited) && !r.r.unlimited) continue;
			if (filter.onlyUnlimited && r.r.limited) continue;
			if (filter.noUnlimited && r.r.unlimited) continue;
			if (filter.noLimited && r.r.limited) continue;
			if (filter.onlyLimited && !r.r.limited && !r.r.unlimited) continue;
			if (filter.ignore && filter.ignore.includes(r.r.name)) continue;
			if (filter.require && !filter.require.includes(r.r.name)) continue;
		}
		if ((!LeashingOnly || (restraint.Group == "ItemNeck" || restraint.Group == "ItemNeckRestraints"))
			&& (!RequireWill || !restraint.maxwill || willPercent <= restraint.maxwill || (LeashingOnly && (restraint.Group == "ItemNeck" || restraint.Group == "ItemNeckRestraints")))) {

			add = false;
			addedVar = false;
			if (agnostic || KDCanAddRestraint(restraint, Bypass, Lock, NoStack, undefined, options?.ForceDeep || KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined, securityEnemy, useAugmented, curse, augmentedInventory)) {
				if (restraint.playerTags)
					for (let tag in restraint.playerTags)
						if ((!agnostic || KDNoOverrideTags.includes(tag)) && KinkyDungeonPlayerTags.get(tag)) r.w += restraint.playerTags[tag];
				if (restraint.playerTagsMult)
					for (let tag in restraint.playerTagsMult)
						if ((!agnostic || KDNoOverrideTags.includes(tag)) && KinkyDungeonPlayerTags.get(tag)) r.w *= restraint.playerTagsMult[tag];
				if (restraint.playerTagsMissing)
					for (let tag in restraint.playerTagsMissing)
						if ((!agnostic || KDNoOverrideTags.includes(tag)) && !KinkyDungeonPlayerTags.get(tag)) r.w += restraint.playerTagsMissing[tag];
				if (restraint.playerTagsMissingMult)
					for (let tag in restraint.playerTagsMissingMult)
						if ((!agnostic || KDNoOverrideTags.includes(tag)) && !KinkyDungeonPlayerTags.get(tag)) r.w *= restraint.playerTagsMissingMult[tag];


				if (!(options?.dontAugmentWeight === false)) {
					let mult = KDRestraintPowerMult(KinkyDungeonPlayerEntity, restraint, augmentedInventory);
					if (Math.sign(mult) != Math.sign(r.w)) mult = 1;
					r.w *= mult;
				}

				if (r.w > 0 && (r.w > filterEps)) {
					add = true;
				}
			}

			if (options?.ApplyVariants && restraint.ApplyVariants && !r.inventory) {
				for (let variant of Object.entries(restraint.ApplyVariants)) {
					if (Level >= KDApplyVariants[variant[0]].minfloor && !(Level >= KDApplyVariants[variant[0]].maxfloor)
						&& (!variant[1].enemyTags || Object.keys(variant[1].enemyTags).some((tag) => {return tags.get(tag) != undefined;}))
						&& (agnostic || KDCanAddRestraint(restraint, Bypass, Lock, NoStack, undefined, KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined, securityEnemy, useAugmented, curse, augmentedInventory,
							KDApplyVariants[variant[0]].powerBonus))) {

						let w = r.w * (variant[1].weightMult || 1) + (variant[1].weightMod || 0);

						if (variant[1].enemyTags)
							for (let tag in variant[1].enemyTags)
								if (tags.get(tag)) w += variant[1].enemyTags[tag];

						if (variant[1].enemyTagsMult)
							for (let tag in variant[1].enemyTagsMult)
								if (tags.get(tag)) w *= variant[1].enemyTagsMult[tag];

						if (variant[1].playerTags)
							for (let tag in variant[1].playerTags)
								if ((!agnostic || KDNoOverrideTags.includes(tag)) && KinkyDungeonPlayerTags.get(tag)) w += variant[1].playerTags[tag];
						if (variant[1].playerTagsMult)
							for (let tag in variant[1].playerTagsMult)
								if ((!agnostic || KDNoOverrideTags.includes(tag)) && KinkyDungeonPlayerTags.get(tag)) w *= variant[1].playerTagsMult[tag];
						if (variant[1].playerTagsMissing)
							for (let tag in variant[1].playerTagsMissing)
								if ((!agnostic || KDNoOverrideTags.includes(tag)) && !KinkyDungeonPlayerTags.get(tag)) w += variant[1].playerTagsMissing[tag];
						if (variant[1].playerTagsMissingMult)
							for (let tag in variant[1].playerTagsMissingMult)
								if ((!agnostic || KDNoOverrideTags.includes(tag)) && !KinkyDungeonPlayerTags.get(tag)) w *= variant[1].playerTagsMissingMult[tag];

						if (r.w > 0 && (r.w > filterEps)) {
							addedVar = true;
							RestraintsList.push({
								restraint: restraint,
								variant: KDApplyVariants[variant[0]],
								weight: w,
							});
						}
					}
				}
			}

			if (add && (!addedVar || options?.dontPreferVariant)) {
				RestraintsList.push({
					restraint: restraint,
					weight: r.w,
					inventoryVariant: (r.name && KinkyDungeonRestraintVariants[r.name]) ? r.name : undefined,
				});
			}
		}
	}

	let RestraintsList2: eligibleRestraintItem[] = [];
	if (!options?.allowLowPower) {
		// Only does strictest for that group
		let groupPower: Record<string, eligibleRestraintItem[]> = {};
		for (let r of RestraintsList) {
			if (!groupPower[r.restraint.Group] || r.restraint.power >= groupPower[r.restraint.Group][0].restraint.power) {
				if (!groupPower[r.restraint.Group]) groupPower[r.restraint.Group] = [r];
				else {
					if (r.restraint.power > groupPower[r.restraint.Group][0].restraint.power) groupPower[r.restraint.Group] = [r];
					else groupPower[r.restraint.Group].push(r);
				}
			}
		}
		for (let value of Object.values(groupPower)) {
			RestraintsList2.push(...value);
		}
	}


	if (minWeightFallback && RestraintsList.length == 0) {
		return KDGetRestraintsEligible(
			enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack,
			extraTags, agnostic, filter, securityEnemy, curse, (filterEps || 0.05) > 0.1 ? filterEps * 0.1 : 0, filterEps > 0.1, useAugmented, augmentedInventory, options);
	}
	if (!options?.allowLowPower){
		return RestraintsList2;
	}
	else return RestraintsList;
}

/**
 * @param enemy
 * @param Level
 * @param Index
 * @param [Bypass]
 * @param [Lock]
 * @param [RequireWill]
 * @param [LeashingOnly]
 * @param [NoStack]
 * @param [extraTags]
 * @param [agnostic] - Determines if playertags and current bondage are ignored
 * @param [filter] - Filters for items
 * @param [securityEnemy] - Bypass is treated separately for these groups
 * @param [curse] - Planning to add this curse
 * @param [useAugmented] - useAugmented
 * @param [augmentedInventory] -
 * @param [options]
 * @param [options.dontAugmentWeight]
 * @param [options.ApplyVariants]
 * @param [options.dontPreferVariant]
 * @param [options.allowLowPower]
 * @param [options.ForceDeep]
 */
function KinkyDungeonGetRestraint (
	enemy:                KDHasTags,
	Level:                number,
	Index:                string,
	Bypass?:              boolean,
	Lock?:                string,
	RequireWill?:         boolean,
	LeashingOnly?:        boolean,
	NoStack?:             boolean,
	extraTags?:           Record<string, number>,
	agnostic?:            boolean,
	filter?:              {minPower?: number, maxPower?: number, onlyLimited?: boolean, noUnlimited?: boolean, noLimited?: boolean, onlyUnlimited?: boolean, ignore?: string[], require?: string[], looseLimit?: boolean, ignoreTags?: string[], allowedGroups?: string[]},
	securityEnemy?:       entity,
	curse?:               string,
	useAugmented?:        boolean,
	augmentedInventory?:  string[],
	options?:             eligibleRestraintOptions
)
{
	let restraintWeightTotal = 0;
	let restraintWeights = [];

	let Restraints = KDGetRestraintsEligible(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, undefined, undefined, useAugmented, augmentedInventory, options);

	for (let rest of Restraints) {
		let restraint = rest.restraint;
		let weight = rest.weight;
		restraintWeights.push({restraint: restraint, weight: restraintWeightTotal, inventoryVariant: rest.inventoryVariant});
		weight += rest.weight;
		restraintWeightTotal += Math.max(0, weight);
	}

	let selection = KDRandom() * restraintWeightTotal;

	for (let L = restraintWeights.length - 1; L >= 0; L--) {
		if (selection > restraintWeights[L].weight) {
			return restraintWeights[L].restraint;
		}
	}
}

/**
 * @param enemy
 * @param Level
 * @param Index
 * @param Bypass
 * @param Lock
 * @param RequireWill
 * @param [LeashingOnly]
 * @param [NoStack]
 * @param [extraTags]
 * @param [agnostic] - Determines if playertags and current bondage are ignored
 * @param [filter] - Filters for items
 * @param [securityEnemy] - Bypass is treated separately for these groups
 * @param [curse] - Planning to add this curse
 * @param [useAugmented] - useAugmented
 * @param [augmentedInventory] -
 * @param [options]
 * @param [options.dontAugmentWeight]
 * @param [options.ApplyVariants]
 * @param [options.dontPreferVariant]
 * @param [options.allowLowPower]
 * @param [options.ForceDeep]
 * @param [options.extraOptions]
 * @returns {{r: restraint, v: ApplyVariant}}
 */
function KDGetRestraintWithVariants (
	enemy:                KDHasTags,
	Level:                number,
	Index:                string,
	Bypass:               boolean,
	Lock:                 string,
	RequireWill:          boolean,
	LeashingOnly?:        boolean,
	NoStack?:             boolean,
	extraTags?:           Record<string, number>,
	agnostic?:            boolean,
	filter?:              {minPower?: number, maxPower?: number, onlyLimited?: boolean, noUnlimited?: boolean, noLimited?: boolean, onlyUnlimited?: boolean, ignore?: string[], require?: string[], looseLimit?: boolean, ignoreTags?: string[], allowedGroups?: string[]},
	securityEnemy?:       entity,
	curse?:               string,
	useAugmented?:        boolean,
	augmentedInventory?:  string[],
	options?:             eligibleRestraintOptions
): {r: restraint, v: ApplyVariant, iv: string}
{
	let restraintWeightTotal = 0;
	let restraintWeights = [];

	if (!options) options = {ApplyVariants: true,};
	else options.ApplyVariants = true;
	let Restraints = KDGetRestraintsEligible(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, undefined, undefined, useAugmented, augmentedInventory, options);

	for (let rest of Restraints) {
		let restraint = rest.restraint;
		let weight = rest.weight;
		restraintWeights.push({restraint: restraint, variant: rest.variant, weight: restraintWeightTotal, inventoryVariant: rest.inventoryVariant});
		weight += rest.weight;
		restraintWeightTotal += Math.max(0, weight);
	}

	let selection = KDRandom() * restraintWeightTotal;

	for (let L = restraintWeights.length - 1; L >= 0; L--) {
		if (selection > restraintWeights[L].weight) {
			return {r: restraintWeights[L].restraint, v: restraintWeights[L].variant, iv: restraintWeights[L].inventoryVariant};
		}
	}
}

function KinkyDungeonUpdateRestraints(C?: Character, id?: number, _delta?: number, customRestraints?: item[], extraTags?: string[]) {
	if (!C && !id) C = KinkyDungeonPlayer;
	if (C == KinkyDungeonPlayer && !customRestraints) {
		let playerTags = new Map();
		for (let inv of KinkyDungeonAllRestraintDynamic()) {
			let group = KDRestraint(inv.item).Group;
			if (group) {
				if (KDGroupBlocked(group)) playerTags.set(group + "Blocked", true);
				playerTags.set(group + "Full", true);
				playerTags.set(inv.item.name + "Worn", true);
			}
		}
		for (let sg of KinkyDungeonStruggleGroupsBase) {
			let group = sg;
			if (!KinkyDungeonGetRestraintItem(group)) playerTags.set(group + "Empty", true);
		}
		let outfit = KDOutfit({name: KinkyDungeonCurrentDress});
		for (let inv2 of KinkyDungeonAllRestraintDynamic()) {
			let inv = inv2.item;
			playerTags.set("Item_"+inv.name, true);

			if ((!inv.faction || KDToggles.ForcePalette || outfit?.palette || KinkyDungeonPlayer.Palette)
				&& (KDToggles.ApplyPaletteRestraint && (outfit?.palette || KinkyDungeonPlayer.Palette || !KDDefaultPalette || KinkyDungeonFactionFilters[KDDefaultPalette]))) {
				inv.faction = outfit?.palette || KinkyDungeonPlayer.Palette || KDDefaultPalette;
			}

			if (KDRestraint(inv).Link)
				playerTags.set("LinkTo_"+KDRestraint(inv).Link, true);
			if (KDRestraint(inv).UnLink)
				playerTags.set("UnLinkTo_"+KDRestraint(inv).UnLink, true);
			if (KDRestraint(inv).addTag)
				for (let tag of KDRestraint(inv).addTag) {
					if (!playerTags.get(tag)) playerTags.set(tag, true);
				}
			if (KDRestraint(inv).chastity)
				playerTags.set("ChastityLower", true);
			if (KDRestraint(inv).chastitybra)
				playerTags.set("ChastityUpper", true);
			if (KDRestraint(inv).hobble)
				playerTags.set("Hobble", true);
			if (KDRestraint(inv).blockfeet)
				playerTags.set("BoundFeet", true);
			if (KDRestraint(inv).bindarms)
				playerTags.set("BoundArms", true);
			if (KDRestraint(inv).bindhands)
				playerTags.set("BoundHands", true);
			if (KDRestraint(inv).blindfold)
				playerTags.set("Blindfolded", true);
			if (KDRestraint(inv).shrine) {
				for (let tag of KDRestraint(inv).shrine) {
					if (!playerTags.get(tag)) playerTags.set(tag, true);
				}
				// The following is redundant
				/*let link = inv.dynamicLink;
				while (link) {
					for (let tag of KDRestraint(link).shrine) {
						if (!playerTags.get(tag)) playerTags.set(tag, true);
					}
					link = link.dynamicLink;
				}*/
			}

		}

		for (let t of KDHeavyRestraintPrefs) {
			if (KinkyDungeonStatsChoice.get(t)) playerTags.set(t, true);
		}
		if (KinkyDungeonStatsChoice.get("Deprived")) playerTags.set("NoVibes", true);
		if (KinkyDungeonStatsChoice.get("Unmasked")) playerTags.set("Unmasked", true);
		if (KinkyDungeonStatsChoice.get("NoSenseDep")) playerTags.set("NoSenseDep", true);
		if (KinkyDungeonStatsChoice.get("NoHood")) playerTags.set("NoHood", true);
		if (KinkyDungeonStatsChoice.get("FreeBoob2")) playerTags.set("FreeBoob", true);
		if (KinkyDungeonStatsChoice.get("FreeBoob1") && !KinkyDungeonPlayerTags.get("ItemNipples")) playerTags.set("FreeBoob", true);
		if (KinkyDungeonStatsChoice.get("NoKigu")) playerTags.set("NoKigu", true);
		if (KinkyDungeonStatsChoice.get("NoBlindfolds")) playerTags.set("NoBlindfolds", true);
		if (KinkyDungeonStatsChoice.get("NoPet")) playerTags.set("NoPet", true);
		if (KinkyDungeonStatsChoice.get("Unchained")) playerTags.set("Unchained", true);
		if (KinkyDungeonStatsChoice.get("Damsel")) playerTags.set("Damsel", true);
		if (KinkyDungeonStatsChoice.get("arousalMode")) playerTags.set("arousalMode", true);
		if (KinkyDungeonStatsChoice.get("arousalModePlug")) playerTags.set("arousalModePlug", true);
		if (KinkyDungeonStatsChoice.get("arousalModePlugNoFront")) playerTags.set("arousalModePlugNoFront", true);
		if (KinkyDungeonStatsChoice.get("arousalModePiercing")) playerTags.set("arousalModePiercing", true);

		let tags = extraTags || [];
		KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);
		for (let t of tags) {
			playerTags.set(t, true);
		}

		KinkyDungeonSendEvent("updatePlayerTags", {tags: playerTags, player:KinkyDungeonPlayerEntity});
		return playerTags;
	} else if (customRestraints) {
		let playerTags = new Map();
		for (let inv of customRestraints) {
			let group = KDRestraint(inv)?.Group;
			if (group) {
				if (KDGroupBlocked(group)) playerTags.set(group + "Blocked", true);
				playerTags.set(group + "Full", true);
				playerTags.set(inv.name + "Worn", true);
			}
		}
		for (let sg of KinkyDungeonStruggleGroupsBase) {
			let group = sg;
			if (!customRestraints.some((rest) => {
				return KDRestraint(rest)?.Group == group;
			})) playerTags.set(group + "Empty", true);
		}
		for (let inv of customRestraints) {
			if (!KDRestraint(inv)) continue;
			playerTags.set("Item_"+inv.name, true);

			if (KDRestraint(inv).Link)
				playerTags.set("LinkTo_"+KDRestraint(inv).Link, true);
			if (KDRestraint(inv).UnLink)
				playerTags.set("UnLinkTo_"+KDRestraint(inv).UnLink, true);
			if (KDRestraint(inv).addTag)
				for (let tag of KDRestraint(inv).addTag) {
					if (!playerTags.get(tag)) playerTags.set(tag, true);
				}
			if (KDRestraint(inv).chastity)
				playerTags.set("ChastityLower", true);
			if (KDRestraint(inv).chastitybra)
				playerTags.set("ChastityUpper", true);
			if (KDRestraint(inv).hobble)
				playerTags.set("Hobble", true);
			if (KDRestraint(inv).blockfeet)
				playerTags.set("BoundFeet", true);
			if (KDRestraint(inv).bindarms)
				playerTags.set("BoundArms", true);
			if (KDRestraint(inv).bindhands)
				playerTags.set("BoundHands", true);
			if (KDRestraint(inv).blindfold)
				playerTags.set("Blindfolded", true);
			if (KDRestraint(inv).shrine) {
				for (let tag of KDRestraint(inv).shrine) {
					if (!playerTags.get(tag)) playerTags.set(tag, true);
				}
			}

		}
		if (extraTags)
			for (let t of extraTags) {
				playerTags.set(t, true);
			}

		KinkyDungeonSendEvent("updateCustomTags", {tags: playerTags, npc:id});
		return playerTags;
	} else if (KDGameData.NPCRestraints && KDGameData.NPCRestraints[id + ""]) {

		let playerTags = new Map();
		for (let inv of Object.values(KDGameData.NPCRestraints[id + ""])) {
			let group = KDRestraint(inv)?.Group;
			if (group) {
				if (KDGroupBlocked(group)) playerTags.set(group + "Blocked", true);
				playerTags.set(group + "Full", true);
				playerTags.set(inv.name + "Worn", true);
			}
		}
		for (let sg of KinkyDungeonStruggleGroupsBase) {
			let group = sg;
			if (!Object.values(KDGameData.NPCRestraints[id + ""]).some((rest) => {
				return KDRestraint(rest)?.Group == group;
			})) playerTags.set(group + "Empty", true);
		}
		for (let inv of Object.values(KDGameData.NPCRestraints[id + ""])) {
			if (!KDRestraint(inv)) continue;
			playerTags.set("Item_"+inv.name, true);

			if (KDRestraint(inv).Link)
				playerTags.set("LinkTo_"+KDRestraint(inv).Link, true);
			if (KDRestraint(inv).UnLink)
				playerTags.set("UnLinkTo_"+KDRestraint(inv).UnLink, true);
			if (KDRestraint(inv).addTag)
				for (let tag of KDRestraint(inv).addTag) {
					if (!playerTags.get(tag)) playerTags.set(tag, true);
				}
			if (KDRestraint(inv).chastity)
				playerTags.set("ChastityLower", true);
			if (KDRestraint(inv).chastitybra)
				playerTags.set("ChastityUpper", true);
			if (KDRestraint(inv).hobble)
				playerTags.set("Hobble", true);
			if (KDRestraint(inv).blockfeet)
				playerTags.set("BoundFeet", true);
			if (KDRestraint(inv).bindarms)
				playerTags.set("BoundArms", true);
			if (KDRestraint(inv).bindhands)
				playerTags.set("BoundHands", true);
			if (KDRestraint(inv).blindfold)
				playerTags.set("Blindfolded", true);
			if (KDRestraint(inv).shrine) {
				for (let tag of KDRestraint(inv).shrine) {
					if (!playerTags.get(tag)) playerTags.set(tag, true);
				}
			}

		}

		let tags = extraTags || [];
		KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);
		for (let t of tags) {
			playerTags.set(t, true);
		}

		KinkyDungeonSendEvent("updateNPCTags", {tags: playerTags, npc:id});
		return playerTags;
	}

	return new Map();

}


function KDGetCursePower(item: item): number {
	if (!item || !KDGetCurse(item)) return 0;
	return KDCursePower(KDGetCurse(item));
}

/**
 * @param item
 */
function KDGetVariantPower(item: item): number {
	if (item && KinkyDungeonRestraintVariants[item.inventoryVariant || item.name]) {
		return KinkyDungeonRestraintVariants[item.inventoryVariant || item.name].power || 0;
	}
	return 0;
}

/**
 * @param item
 * @param [NoLink]
 * @param [toLink]
 * @param [newLock] - If we are trying to add a new item
 * @param [newCurse] - If we are trying to add a new item
 */
function KinkyDungeonRestraintPower(item: item, NoLink?: boolean, toLink?: restraint, newLock?: string, newCurse?: string): number {
	if (item && item.type == Restraint) {
		let lockMult = item ? KinkyDungeonGetLockMult(item.lock, item) : 1;
		let power = KDRestraint(item).power * lockMult + KDGetCursePower(item) + KDGetVariantPower(item);

		if (item.dynamicLink && !NoLink) {
			let link = item.dynamicLink;
			if (!toLink || !(KinkyDungeonIsLinkable(
				{
					oldRestraint: KinkyDungeonGetRestraintByName(link.name),
					newRestraint: toLink,
					item: link,
					props: {
						newLock: newLock,
						newCurse: newCurse,
					},
				}) && KDCheckLinkSize(link, toLink, true, false, undefined, undefined,
				{
					newLock: newLock,
					newCurse: newCurse,
				}))) {
				let lock = link.lock;
				let mult = KinkyDungeonGetLockMult(lock, link);
				let pp = link ? (KDRestraint({name: link.name}).power) : 0;
				power = Math.max(power, pp * mult + KDGetCursePower(link));
			}
		}
		return power;
	}
	return 0;
}

/**
 * @param oldRestraint
 * @param newRestraint
 * @param [item]
 * @param [Lock]
 * @param [Curse]
 * @param [ignoreItem]
 * @param [power]
 */
function KinkyDungeonLinkableAndStricter(oldRestraint: restraint, newRestraint: restraint, item?: item, Lock?: string, Curse?: string, ignoreItem?: item, power?: number): boolean {
	if (oldRestraint && newRestraint) {
		if (!KDIsEligible(newRestraint)) return false;
		return KinkyDungeonIsLinkable({oldRestraint: oldRestraint, newRestraint: newRestraint, power: power, item: item, ignoreItem: ignoreItem, props: {newLock: Lock, newCurse: Curse}});
		//}
	}
	return false;
}

/**
 * Blanket function for stuff needed to select a restraint
 * @param {restraint} restraint
 */
function KDIsEligible(restraint: restraint): boolean {
	if (restraint.requireSingleTagToEquip && !restraint.requireSingleTagToEquip.some((tag) => {return KinkyDungeonPlayerTags.get(tag);})) return false;
	if (restraint.requireAllTagsToEquip && restraint.requireAllTagsToEquip.some((tag) => {return !KinkyDungeonPlayerTags.get(tag);})) return false;
	return true;
}

function KinkyDungeonGenerateRestraintTrap(): string {
	let enemy = KinkyDungeonGetEnemy(["chestTrap"], KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["chestTrap"]);
	if (enemy) return enemy.name;
	return "GreedyGhast";
}

function KDGetLockVisual(item: item): string {
	//if (KinkyDungeonBlindLevel > 0) return `Locks/Blind.png`;
	return `Locks/${item.lock}.png`;
}

/**
 * @param restraint
 * @param Bypass
 * @param Lock
 * @param NoStack
 * @param [r]
 * @param [Deep] - allow linking under
 * @param [noOverpower] - not allowed to replace items that currently exist
 * @param [securityEnemy] - Bypass is treated separately for these groups
 * @param [useAugmentedPower] - Bypass is treated separately for these groups
 * @param [curse] - Bypass is treated separately for these groups
 * @param [augmentedInventory]
 * @param [powerBonus]
 */
function KDCanAddRestraint (
	restraint:            restraint,
	Bypass:               boolean,
	Lock:                 string,
	NoStack:              boolean,
	r?:                   item,
	Deep?:                boolean,
	noOverpower?:         boolean,
	securityEnemy?:       entity,
	useAugmentedPower?:   boolean,
	curse?:               string,
	augmentedInventory?:  string[],
	powerBonus:           number = 0
): boolean
{
	if (!restraint) {
		console.log("Warning: Requested restraint was empty!");
		return false;
	}
	if (!KinkyDungeonIsLockable(restraint)) Lock = "";
	if (!curse && restraint.curse) curse = restraint.curse;
	if (restraint.bypass) Bypass = true;
	// Limits
	if (restraint.shrine && restraint.shrine.includes("Vibes") && KinkyDungeonPlayerTags.get("NoVibes")) return false;
	if (restraint.arousalMode && !KinkyDungeonStatsChoice.get("arousalMode")) return false;
	if (restraint.Group == "ItemButt" && !KinkyDungeonStatsChoice.get("arousalModePlug")) return false;
	if (restraint.Group == "ItemVulva" && restraint.shrine.includes("Plugs") && KinkyDungeonStatsChoice.get("arousalModePlugNoFront")) return false;
	if (restraint.requireSingleTagToEquip && !restraint.requireSingleTagToEquip.some((tag) => {return KinkyDungeonPlayerTags.get(tag);})) return false;
	if (restraint.requireAllTagsToEquip && restraint.requireAllTagsToEquip.some((tag) => {return !KinkyDungeonPlayerTags.get(tag);})) return false;
	//if (restraint.AssetGroup == "ItemNipplesPiercings" && !KinkyDungeonStatsChoice.get("arousalModePiercing")) return false;

	if (restraint.shrine.includes("Raw")) return false;

	function bypasses() {
		return (
			(
				!((KinkyDungeonPlayerTags.get("SupremeBra") && (restraint.Group == "ItemNipples" || restraint.Group == "ItemNipplesPiercings"))
			|| (KinkyDungeonPlayerTags.get("SupremeBelt") && (restraint.Group == "ItemVulva" || restraint.Group == "ItemVulvaPiercings" || restraint.Group == "ItemButt")))
			&& (Bypass || restraint.bypass || !KDGroupBlocked(restraint.Group, true))
			)
			|| KDEnemyPassesSecurity(restraint.Group, securityEnemy)
		);
	}

	/*if (restraint.requireSingleTagToEquip) {
		let pass = false;
		for (let tag of restraint.requireSingleTagToEquip) {
			if (KinkyDungeonPlayerTags.has(tag)) {
				pass = true;
				break;
			}
		}
		if (!pass) return false;
	}*/
	if (!r) r = KinkyDungeonGetRestraintItem(restraint.Group);
	// NoLink here because we do it later with augment
	let power = (KinkyDungeonRestraintPower(r, true, restraint, Lock, curse) * (r && useAugmentedPower ? Math.max(0.9, KDRestraintPowerMult(KinkyDungeonPlayerEntity, KDRestraint(r), augmentedInventory)) : 1));
	let linkUnder = KDGetLinkUnder(r, restraint, Bypass, NoStack, Deep, securityEnemy, Lock, curse, powerBonus, true);

	let linkableCurrent = r && KDRestraint(r) && KinkyDungeonLinkableAndStricter(KDRestraint(r), restraint, r);

	if (linkUnder && bypasses()) return true;

	// We raise the power if the current item cannot be linked, but the item underneath also cannot be linked
	let link = r?.dynamicLink;
	while (link && !linkableCurrent) {
		let linkableUnder = KinkyDungeonLinkableAndStricter(KDRestraint(link), restraint, link, Lock, curse);
		if (!linkableUnder) {
			power = Math.max(power,
				KinkyDungeonRestraintPower(link, true, restraint, Lock, curse)
					* (useAugmentedPower ? Math.max(0.9, KDRestraintPowerMult(KinkyDungeonPlayerEntity, KDRestraint(link), augmentedInventory)) : 1));
			link = link.dynamicLink;
		} else {
			link = null;
		}
	}

	let newLock = (Lock && KinkyDungeonIsLockable(restraint)) ? Lock : restraint.DefaultLock;
	let allowOverpower = r && !linkableCurrent && !noOverpower && !KDRestraint(r).enchanted;
	if (
		// Nothing to overwrite so we good
		!r
		// We can link
		|| linkableCurrent
		// We are weak enough to override
		|| allowOverpower
	) {
		let augMult = allowOverpower ?
			(useAugmentedPower ?
				KDRestraintPowerMult(KinkyDungeonPlayerEntity, restraint, augmentedInventory)
				: 1)
			: 1;
		let compPower =
			allowOverpower ? (
			-0.01
			+ (curse ? (KDCursePower(curse)) : 0)
			+ (restraint.power + powerBonus)
				* augMult
				* KinkyDungeonGetLockMult(newLock, undefined, curse, restraint)
			) : 0;
		if (!allowOverpower || (Math.max(0.99, power * 1.1) < compPower)) {
			if (bypasses())
				return true; // Recursion!!
		}
	}
	return false;
}

/**
 * @param Group
 * @param enemy
 */
function KDEnemyPassesSecurity(Group: string, enemy: entity): boolean {
	if (!enemy) return false;
	let blockers = KDGetBlockingRestraints(Group, true);
	for (let blocker of blockers) {
		if (!KDRestraint(blocker)?.Security) return false;
		for (let secure of Object.entries(KDRestraint(blocker).Security)) {
			if (KDGetSecurity(enemy, secure[0]) >= secure[1]) return true;
		}
	}
	return false;
}

/**
 * Returns the first restraint in the stack that can link the given restraint
 * @param currentRestraint
 * @param restraint
 * @param [bypass]
 * @param [NoStack]
 * @param [Deep] - Whether or not it can look deeper into the stack
 * @param [securityEnemy] - Bypass is treated separately for these groups
 * @param [Lock]
 * @param [Curse]
 * @param [powerBonus]
 * @param [allowOverride]
 */
function KDGetLinkUnder(currentRestraint: item, restraint: restraint, bypass?: boolean, NoStack?: boolean, Deep?: boolean, securityEnemy?: entity, Lock?: string, Curse?: string, powerBonus?: number, allowOverride?: boolean): item {
	let link = currentRestraint;
	if (restraint.bypass) bypass = true;
	while (link) {
		if (KDCanLinkUnder(link, restraint, bypass, NoStack, securityEnemy, Lock, Curse, undefined , powerBonus, allowOverride)) {
			return link;
		}
		if (Deep)
			link = link.dynamicLink;
		else link = null;
	}
	return null;
}

/**
 * Returns whether or not the restraint can go under the currentRestraint
 * @param currentRestraint
 * @param restraint
 * @param [bypass]
 * @param [NoStack]
 * @param [securityEnemy] - Bypass is treated separately for these groups
 * @param [Lock]
 * @param [Curse]
 * @param [ignoreItem]
 * @param [powerBonus]
 * @param [allowOverride]
 */
function KDCanLinkUnder(currentRestraint: item, restraint: restraint, bypass?: boolean, NoStack?: boolean, securityEnemy?: entity, Lock?: string, Curse?: string, ignoreItem?: item, powerBonus?: number, allowOverride?: boolean): boolean {
	if (restraint.bypass) bypass = true;
	let linkUnder = currentRestraint
		&& (bypass || (KDRestraint(currentRestraint).accessible) || (KDRestraint(currentRestraint).deepAccessible) || KDEnemyPassesSecurity(KDRestraint(currentRestraint).Group, securityEnemy))
		&& KinkyDungeonIsLinkable({
			oldRestraint: restraint,
			newRestraint: KDRestraint(currentRestraint),
			item: ignoreItem || {name: restraint.name, id: -1},
			ignoreItem: currentRestraint,
			linkUnderItem: currentRestraint,
		});
	let power = (allowOverride && !NoStack) ? (
		-0.01
		+ (Curse ? (KDCursePower(Curse)) : 0)
		+ (restraint.power + powerBonus)
			* KinkyDungeonGetLockMult(Lock, undefined, Curse, restraint)
		) : 0;
	let linkUnderOver = (!currentRestraint.dynamicLink || KinkyDungeonIsLinkable({
		oldRestraint: KDRestraint(currentRestraint.dynamicLink),
		newRestraint: restraint,
		item: currentRestraint.dynamicLink,
		ignoreItem: ignoreItem || {name: restraint.name, id: -1},
		power: power,
		props: {
			newLock: Lock,
			newCurse: Curse,
		}
	}));

	if (!linkUnder || !linkUnderOver) return false;
	if (
		KDCheckLinkSize(currentRestraint, restraint, bypass, NoStack, securityEnemy, ignoreItem,
			{
				newLock: Lock,
				newCurse: Curse,
			}, power)
	) {
		return true;
	}
}

/**
 * @param currentItem
 * @param newItem
 */
function KDCurrentItemLinkable(currentItem: item, newItem: restraint): boolean {
	return (KinkyDungeonLinkableAndStricter(KDRestraint(currentItem), newItem, currentItem) &&
		(
			(newItem.linkCategory && !newItem.linkCategories && KDLinkCategorySize(currentItem, newItem.linkCategory) + KDLinkSize(newItem) <= 1.0)
			|| (newItem.linkCategories && newItem.linkCategories.every(
				(lc, index) =>
				{return KDLinkCategorySize(currentItem, lc) + KDLinkSize(newItem, index) <= 1.0;}))
			|| (!newItem.linkCategory && !newItem.linkCategories && !KDDynamicLinkList(currentItem, true).some((inv) => {return newItem.name == inv.name;})))
	);
}

/**
 * @param currentRestraint
 * @param restraint
 * @param [bypass]
 * @param [NoStack]
 * @param [securityEnemy] - Bypass is treated separately for these groups
 * @param [ignoreItem] - Item to ignore
 * @param [props] - Curse and lock properties
 * @param [props.newLock]
 * @param [props.newCurse]
 * @param [power] - Item that can overpower other linked items
 */
function KDCheckLinkSize(currentRestraint: item, restraint: restraint, bypass?: boolean, NoStack?: boolean, _securityEnemy?: entity, ignoreItem?: item, props?: any, power?: number): boolean {

	if (restraint.bypass) bypass = true;
	let linkCategories = restraint.linkCategories || (restraint.linkCategory ? [restraint.linkCategory] : []);
	return (linkCategories.length == 0 || linkCategories.every((lc, index) => {return KDLinkCategorySize(KinkyDungeonGetRestraintItem(KDRestraint(currentRestraint).Group),
		lc, ignoreItem, power) + KDLinkSize(restraint, index) <= (NoStack ? 0.01 : 1.0);})
	)
		&& ((linkCategories.length > 0 && !restraint.noDupe)
			|| !KDDynamicLinkList(KinkyDungeonGetRestraintItem(KDRestraint(currentRestraint).Group), true).some((item) => {
				if (restraint.name == KDRestraint(item).name && (!ignoreItem || ignoreItem?.id != item.id)) {
					// Note: return false means succeed
					// true means interupt
					//if (restraint.noDupe) return true;
					if (!props) return true;

					if ((!KDGetCurse(item) && props.newCurse)
					|| (!props.newCurse && props.newLock && !KDGetCurse(item) && !item.lock)
					|| (props.newCurse && KDCurses[props.newCurse].level > KDCurses[KDGetCurse(item)]?.level + 0.01)
					|| (props.newLock && KDLocks[props.newLock].lockmult > (KDLocks[item.lock]?.lockmult) + 0.01)) return false;

					/*if (!KDGetCurse(currentRestraint)) {
						if (props.newCurse) return false; // Curse always overrides lock
						if (!currentRestraint.lock && (props.newCurse || props.newLock)) return false;
						if (props.newLock && KDLocks[currentRestraint.lock]?.lockmult + 0.01 < KDLocks[props.newLock]?.lockmult) return false;
					} else {
						if (props.newCurse && KDCurses[KDGetCurse(currentRestraint)]?.level + 0.01 < KDCurses[props.newCurse]?.level) return false;
					}*/
					return true;
				}
				return false;
			}));
}

/**
 * @param restraint
 * @param variant
 */
function KDApplyVarToInvVar(restraint: restraint, variant: ApplyVariant): KDRestraintVariant {
	let events = [];
	let restvar = {
		template: restraint.name,
		events: events,
		curse: variant.curse,
		noKeep: variant.noKeep,
	};
	for (let e of variant.hexes) {
		events.push(...JSON.parse(JSON.stringify(KDEventHexModular[e].events({variant: restvar}))));
	}
	for (let e of variant.enchants) {
		/*
		 * TODO: Figure out the proper typing for the final "variant"
		 * argument. It's typed as a KDHexEnchantEventsData, but
		 * that's not what's being passed.
		 */
		events.push(...JSON.parse(JSON.stringify(
			KDEventEnchantmentModular[e].types[KDModifierEnum.restraint].events(
				restraint.name, undefined, undefined, variant.enchants[0], variant.enchants.slice(1) /* , {variant: variant} */))));
	}
	return restvar;
}


/**
 * @param restraint
 * @param [Tightness]
 * @param [Bypass]
 * @param [Lock]
 * @param [Keep]
 * @param [Trapped]
 * @param [events]
 * @param [faction]
 * @param [Deep] - whether or not it can go deeply in the stack
 * @param [Curse] - Curse to apply
 * @param [securityEnemy] - Bypass is treated separately for these groups
 * @param [reserved] - Reserved do not use
 * @param [inventoryAs] - inventoryAs for the item
 * @param [data] - data for the item
 */
function KDLinkUnder (
	restraint:       restraint,
	Tightness?:      number,
	Bypass?:         boolean,
	Lock?:           string,
	Keep?:           boolean,
	_Trapped?:       boolean,
	events?:         KinkyDungeonEvent[],
	faction?:        string,
	Deep?:           boolean,
	Curse?:          string,
	securityEnemy?:  entity,
	_reserved?:      boolean,
	inventoryAs?:    string,
	data?:           Record<string, any>,
	powerBonus:      number = 0
): number
{
	KDRestraintDebugLog.push("LKUndering " + restraint.name);

	let r = KinkyDungeonGetRestraintItem(restraint.Group);

	if (r) {
		// Then we remove the lowest power item if we are over the size
		let compPower = (
			-0.01
			+ (Curse ? (KDCursePower(Curse)) : 0)
			+ (restraint.power + powerBonus)
				* KinkyDungeonGetLockMult(Lock, undefined, Curse, restraint)
		);
		if (!KDCheckLinkSize(r, restraint, true, false, undefined, undefined, undefined)) {
			// go thru and remove the lowest power accessible one
			let dynamicList = [];
			let iii = 0;
			do {
				iii++;
				if (!KDCheckLinkSize(r, restraint, true, false, undefined, undefined, undefined))
					dynamicList = KDDynamicLinkList(r, true).filter(
						(inv) => {
							if ((KDRestraint(inv).linkCategories ? KDRestraint(inv).linkCategories : (KDRestraint(inv).linkCategory ? [KDRestraint(inv).linkCategory] : [])).some(
								(category) => {
									return (restraint.linkCategories || [restraint.linkCategory]).includes(category);
								}
							))
								return true;
							return false;
						}
					);
				else dynamicList = [];
				let cand = null;
				let candPower = -100;
				for (let inv of dynamicList) {
					let pwr = KinkyDungeonRestraintPower(inv, true);
					if (pwr > candPower) {
						cand = inv;
						candPower = pwr;
					}
				}
				if (cand && compPower > candPower) {
					// Turn off 'Add' here because we need to preserve dynamiclink
					KinkyDungeonRemoveRestraintSpecific(cand, Keep, false);
					r = KinkyDungeonGetRestraintItem(restraint.Group);
					if (!r) dynamicList = [];
				}
			} while (dynamicList.length > 0 && iii < 100);
		}
	}



	let linkUnder = null;
	linkUnder = KDGetLinkUnder(r, restraint, Bypass, undefined, Deep, securityEnemy, Lock, Curse, powerBonus, true);
	let linkableCurrent = r
		&& KDRestraint(r)
		&& KinkyDungeonLinkableAndStricter(KDRestraint(r), restraint, r);

	let ret = 0;
	let alwaysLinkUnder = false;
	if (!linkableCurrent && linkUnder && (!linkableCurrent || !restraint.inaccessible || alwaysLinkUnder)) {
		// Insert the item underneath
		ret = Math.max(1, Tightness);
		KDRestraintDebugLog.push("Linking " + restraint.name  + " under " + linkUnder.name);
		let safeLink = KDGetLinkUnder(r, restraint, Bypass, undefined, Deep, securityEnemy);
		linkUnder.dynamicLink = {name: restraint.name, id: KinkyDungeonGetItemID(), type: Restraint, events:events ? events : KDGetEventsForRestraint(inventoryAs || restraint.name),
			data: data,
			tightness: Tightness, curse: Curse, faction: faction, dynamicLink: linkUnder.dynamicLink };

		KDUpdateItemEventCache = true;
		let lk = linkUnder.dynamicLink;
		if (!Curse && (Lock)) KinkyDungeonLock(linkUnder.dynamicLink, Lock);
		else if (restraint.DefaultLock) KinkyDungeonLock(linkUnder.dynamicLink, restraint.DefaultLock);
		if (inventoryAs) linkUnder.dynamicLink.inventoryVariant = inventoryAs;
		if (!safeLink) {
			// Remove the original by iterating down and identifying one we can delete
			//let lastlink = null;
			let link = KinkyDungeonGetRestraintItem(restraint.Group);

			/*
			if (!KDGetCurse(currentRestraint) && props.newCurse) return false;
			if (!currentRestraint.lock && (props.newCurse || props.newLock)) return false;
			if (props.newCurse && KDCurses[KDGetCurse(currentRestraint)]?.level < KDCurses[props.newCurse]?.level) return false;
			if (props.newLock && KDLocks[currentRestraint.lock]?.lockmult < KDLocks[props.newLock]?.lockmult) return false;
			*/
			if (lk.name == restraint.name && ((KDGetCurse(lk) || '') == (Curse || '') && ((lk.lock || '') == (Lock || '')))) {
				let end = false;
				while (link) {
					if (lk.name == link.name && (
						(!KDGetCurse(link) && Curse)
						|| (!Curse && Lock && !KDGetCurse(link) && !link.lock)
						|| (Curse && KDCurses[Curse].level > KDCurses[KDGetCurse(link)]?.level + 0.01)
						|| (Lock && KDLocks[Lock].lockmult > (KDLocks[link.lock]?.lockmult) + 0.01)
					)
					) {
						// Add is false here because we are removing AFTER adding the item
						KinkyDungeonRemoveRestraintSpecific(link, true, false, false, false, false, undefined, false);
						r = KinkyDungeonGetRestraintItem(restraint.Group);
						KDUpdateItemEventCache = true;
						link = null;
						end = true;
					} else {
						//lastlink = link;
						link = link.dynamicLink;
					}
				}
				if (!end) {
					console.log("There was an error! Duplicated restraint");
					KinkyDungeonSendTextMessage(10, `Error adding ${lk.name}, ${lk.curse}. Please report.`, "#ffffff", 12);
				}
			}

		}

		linkUnder = KinkyDungeonAllRestraint().find((inv) => {return inv.dynamicLink == lk;});
		if (Curse && KDCurses[Curse] && KDCurses[Curse].onApply) {
			KDCurses[Curse].onApply(lk, linkUnder);
		}



		if (r) KDUpdateLinkCaches(r);
		KinkyDungeonSendEvent("postApply", {player: KinkyDungeonPlayerEntity, item: lk, host: linkUnder, keep: Keep, Link: true, UnLink: false});

	}
	return ret;
}

/**
 * @param restraint
 * @param [Tightness]
 * @param [Bypass]
 * @param [Lock]
 * @param [Keep]
 * @param [Trapped] - Deprecated do not use
 * @param [events]
 * @param [faction]
 * @param [Deep] - whether or not it can go deeply in the stack
 * @param [Curse] - Curse to apply
 * @param [securityEnemy] - Bypass is treated separately for these groups
 * @param [useAugmentedPower] - Augment power to keep consistency
 * @param [inventoryAs] - inventoryAs for the item
 * @param [data] - data for the item
 * @param [augmentedInventory]
 * @param [variant] - variant for the item
 * @param [powerBonus] - 0 without variant
 */
function KinkyDungeonAddRestraintIfWeaker (
	restraint:            restraint | string,
	Tightness?:           number,
	Bypass?:              boolean,
	Lock?:                string,
	Keep?:                boolean,
	Trapped?:             boolean,
	events?:              KinkyDungeonEvent[],
	faction?:             string,
	Deep?:                boolean,
	Curse?:               string,
	securityEnemy?:       entity,
	useAugmentedPower?:   boolean,
	inventoryAs?:         string,
	data?:                Record<string, any>,
	augmentedInventory?:  string[],
	variant?:             ApplyVariant,
	powerBonus:           number = 0
): number
{
	let player = KDPlayer();
	if (typeof restraint === "string") {
		KDRestraintDebugLog.push("Lookup" + restraint);
		restraint = KinkyDungeonGetRestraintByName(restraint);
	} else {
		KDRestraintDebugLog.push("AddWeaker" + restraint.name);
	}
	if (!KinkyDungeonIsLockable(restraint)) Lock = "";

	if (variant) {
		return KDEquipInventoryVariant(KDApplyVarToInvVar(restraint, variant),
			variant.prefix, Tightness, Bypass, Lock, Keep, Trapped, faction, Deep, Curse, securityEnemy, useAugmentedPower, inventoryAs, variant.nonstackable ? "" : variant.prefix,
			undefined, powerBonus + variant.powerBonus);
	}

	if (restraint.bypass) Bypass = true;
	if (KDCanAddRestraint(restraint, Bypass, Lock, false, undefined, Deep, false, securityEnemy, useAugmentedPower, Curse, augmentedInventory)) {
		let r = KinkyDungeonGetRestraintItem(restraint.Group);
		let linkableCurrent = r
			&& KDRestraint(r)
			&& KinkyDungeonLinkableAndStricter(KDRestraint(r), restraint, r);

		let ret = 0;

		let preserve_tether = restraint.Group == "ItemNeckAccessories" && KDIsPlayerTethered(KinkyDungeonPlayerEntity) && KinkyDungeonLeashingEnemy();
		let tether_len = preserve_tether ? KDGetTetherLength(KinkyDungeonPlayerEntity) : 0;

		if (!restraint.good && !restraint.armor) {
			KinkyDungeonSetFlag("restrained", 2);
			KinkyDungeonSetFlag("restrained_recently", 5);
		}

		ret = KinkyDungeonAddRestraint(restraint, Tightness + Math.round(0.1 * KinkyDungeonDifficulty), Bypass, Lock, Keep, false, !linkableCurrent, events, faction, undefined, undefined, Curse, undefined, securityEnemy, inventoryAs, data);
		if (preserve_tether && !KDIsPlayerTethered(KinkyDungeonPlayerEntity)) KinkyDungeonAttachTetherToEntity(tether_len, KinkyDungeonLeashingEnemy(), player);

		if (KinkyDungeonPlayerEntity && !KinkyDungeonCanTalk() && KDRandom() < KinkyDungeonGagMumbleChanceRestraint) {
			let msg = "KinkyDungeonGagRestraint";
			let gagMsg = Math.floor(KDRandom() * 3);

			if (restraint.power > 8 && KDRandom() < .8) gagMsg = 2;
			else if (restraint.power > 4 && KDRandom() < .5) gagMsg = 2;

			msg = msg + gagMsg;

			KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet(msg), "#ffffff", 5, 3);
			KDSendGagParticles(KDPlayer());
		}
		return ret;
	}
	return 0;
}

/**
 * @param {object} data
 * @param {restraint} data.oldRestraint - Restraint on bottom
 * @param {restraint} data.newRestraint - Restraint on top
 * @param {item} [data.item] - Current Item
 * @param {boolean} [data.useAugmentedPower]
 * @param {string[]} [data.augmentedInventory]
 * @param {item} [data.ignoreItem] - Item to ignore for purpose of calculating size
 * @param {item} [data.linkUnderItem] - Item to ignore for total link chain calculation
 * @param {object} [data.props] - Curse and lock properties
 * @param {string} [data.props.newLock]
 * @param {string} [data.props.newCurse]
 * @param {number} [data.power]
 */
function KinkyDungeonIsLinkable(data: any): boolean {
	if (data.newRestraint.NoLinkOver) return false;
	//if (!oldRestraint.nonbinding && newRestraint.nonbinding) return false;
	if (data.item && !KDCheckLinkSize(data.item, data.newRestraint, false, false, undefined, data.ignoreItem, data.props,
		data.power || 0)) return false;
	if (data.oldRestraint && data.newRestraint && data.oldRestraint && data.oldRestraint.Link) {
		if (data.newRestraint.name == data.oldRestraint.Link) return true;
	}
	if (data.item && !KDCheckLinkTotal(data.item, data.newRestraint, data.linkUnderItem, data.props?.newLock, data.props?.newCurse, data.useAugmentedPower, data.augmentedInventory)) return false;
	if (data.oldRestraint && data.newRestraint && data.oldRestraint && (data.newRestraint.AlwaysLinkable || data.oldRestraint.LinkableBy || data.oldRestraint.LinkAll) && data.newRestraint.shrine) {
		if (data.oldRestraint.LinkAll) return true;
		if (data.newRestraint.AlwaysLinkable) return true;
		for (let l of data.oldRestraint.LinkableBy) {
			for (let s of data.newRestraint.shrine) {
				if (l == s) {
					return true;
				}
			}
		}
	}
	return false;
}

/**
 * Checks if all the items linked under allow this item
 * @param oldRestraint
 * @param newRestraint
 * @param [ignoreItem]
 */
function KDCheckLinkTotal(oldRestraint: item, newRestraint: restraint, ignoreItem?: item, _lock: string = "", _curse: string = "", _useAugmentedPower: boolean = false, _augmentedInventory: any = undefined): boolean {
	if (KDRestraint(oldRestraint).Link && KDRestraint(oldRestraint).Link == newRestraint.name) {
		return true;
	}
	if (newRestraint.UnLink && oldRestraint.name == newRestraint.UnLink) {
		return true;
	}
	let link = oldRestraint;
	if (oldRestraint.linkCache) {
		for (let s of newRestraint.shrine) {
			if (oldRestraint.linkCache.includes(s)) return true;
		}
	}
	while (link) {
		let pass = false;
		let r = KDRestraint(link);
		if (link != ignoreItem) {
			if (r.LinkAll
			// 5.2.5: Added ability to override weaker items when linking under
			//|| KinkyDungeonRestraintPower(link, true, newRestraint, link.lock, KDGetCurse(link))
			//< -0.01 + (curse ? (KDCursePower(curse)) : 0) + newRestraint.power * (useAugmentedPower ? KDRestraintPowerMult(KinkyDungeonPlayerEntity, newRestraint, augmentedInventory) : 1) * KinkyDungeonGetLockMult(lock, undefined, curse)
			) {
				pass = true;
			} else if (newRestraint.AlwaysLinkable) {
				pass = true;
			} else if (r.LinkableBy && newRestraint.shrine) {
				for (let l of r.LinkableBy) {
					if (!pass)
						for (let s of newRestraint.shrine) {
							if (l == s) {
								pass = true;
							}
						}
				}
			}
			if (!pass) return false;
		}
		link = link.dynamicLink;
	}
	return true;
}

/**
 * Gets the linkability cache
 * @param restraint
 */
function KDUpdateLinkCaches(restraint: item) {
	let link = restraint;
	while (link) {
		link.linkCache = KDGetLinkCache(link);
		link = link.dynamicLink;
	}
}

/**
 * Gets the linkability cache
 * @param restraint
 */
function KDGetLinkCache(restraint: item): string[] {
	let cache = Object.assign([], KDRestraint(restraint).LinkableBy || []);
	let link = restraint.dynamicLink;
	while (link) {
		let r = KDRestraint(link);
		if (r.LinkableBy) {
			for (let l of cache) {
				if (!r.LinkableBy.includes(l)) cache.splice(cache.indexOf(l), 1);
			}
		} else if (!r.LinkAll) return [];
		link = link.dynamicLink;
	}
	return cache;
}

let KinkyDungeonRestraintAdded = false;
let KinkyDungeonCancelFlag = false;

/**
 * @param restraint
 * @param Tightness
 * @param [Bypass]
 * @param [Lock]
 * @param [Keep]
 * @param [Link]
 * @param [SwitchItems]
 * @param [events]
 * @param [faction]
 * @param [Unlink]
 * @param [dynamicLink]
 * @param [Curse] - Curse to apply
 * @param [autoMessage] - Whether or not to automatically dispatch messages
 * @param [securityEnemy] - Whether or not to automatically dispatch messages
 * @param [inventoryAs] - InventoryAs for the item
 * @param [data] - data for the item
 * @param [powerBonus] - bonus power
 * @param [NoEvent]
 */
function KinkyDungeonAddRestraint (
	restraint:      restraint,
	Tightness:      number,
	Bypass?:        boolean,
	Lock?:          string,
	Keep?:          boolean,
	Link?:          boolean,
	SwitchItems?:   boolean,
	events?:        KinkyDungeonEvent[],
	faction?:       string,
	Unlink?:        boolean,
	dynamicLink?:   item,
	Curse?:         string,
	autoMessage:    boolean = true,
	securityEnemy:  entity = undefined,
	inventoryAs:    string = undefined,
	data?:          Record<string, number>,
	powerBonus:     number = 0,
	NoEvent:        boolean = false
): number
{
	KDDelayedActionPrune(["Restrain"]);
	if (restraint.bypass) Bypass = true;
	KDStruggleGroupLinkIndex = {};
	let start = performance.now();
	let tight = (Tightness) ? Tightness : 0;
	if (restraint) {
		if (restraint.Group == "ItemButt" && !KinkyDungeonStatsChoice.get("arousalModePlug")) return 0;
		if (restraint.Group == "ItemVulva" && restraint.shrine.includes("Plugs") && KinkyDungeonStatsChoice.get("arousalModePlugNoFront")) return 0;

		// First we try linking under
		if (!Unlink) {
			let ret = KDLinkUnder(restraint, Tightness, Bypass, Lock, Keep, false, events, faction, true, Curse, securityEnemy, true, inventoryAs, data, powerBonus);
			if (ret) return ret;
		}

		let r = KinkyDungeonGetRestraintItem(restraint.Group);

		KDRestraintDebugLog.push("StartAdd " + restraint.name);
		if (!KDGroupBlocked(restraint.Group, true) || Bypass || KDEnemyPassesSecurity(restraint.Group, securityEnemy)) {
			KinkyDungeonEvasionPityModifier = 0;
			KinkyDungeonMiscastPityModifier = 0;
			let linkable = !Unlink && (!Link && r && KinkyDungeonIsLinkable({
				oldRestraint: KDRestraint(r),
				newRestraint: restraint,
				item: r,}));
			let linked = false;
			if (linkable) {
				linked = true;
				//let remAfter = false;
				// We replace if we cant link

				let lk = KinkyDungeonLinkItem(restraint, r, Tightness, Lock, Keep, faction, Curse, autoMessage, inventoryAs, events, data);
				if (lk) {
					KinkyDungeonCancelFlag = true;
				}
			}

			let eventsAdd = false;
			let oldevents = null;
			let prevR = null;

			// Some confusing stuff here to prevent recursion. If Link = true this means we are in the middle of linking, we dont want to do that
			if (!KinkyDungeonCancelFlag) {
				// We block events because there may be linking happening...
				KinkyDungeonRemoveRestraint(restraint.Group, Keep && !Link, Link || Unlink, undefined, undefined, Unlink); // r && r.dynamicLink && restraint.name == r.dynamicLink.name

				let newR = KinkyDungeonGetRestraintItem(restraint.Group);
				// Run events AFTER
				if (r && r.events) {
					oldevents = r.events;
					eventsAdd = newR != undefined;
					prevR = r;
				}

				r = newR;
				KinkyDungeonCancelFlag = r != undefined;

			}



			// If we did not link an item (or unlink one) then we proceed as normal
			if (!KinkyDungeonCancelFlag) {
				KinkyDungeonRemoveRestraint(restraint.Group, Keep, false, undefined, undefined, r && r.dynamicLink&& restraint.name == r.dynamicLink.name);
				if (restraint.remove)
					for (let remove of restraint.remove) {
						InventoryRemove(KinkyDungeonPlayer, remove);
					}
				if (restraint.removeShrine)
					for (let remove of restraint.removeShrine) {
						for (let removeR of KinkyDungeonAllRestraint()) {
							let host = removeR;
							let link = removeR.dynamicLink;
							let iter = 0;
							while (link && iter < 100) {
								if (KDRestraint(link).shrine && KDRestraint(link).shrine.includes(remove)) {
									KinkyDungeonRemoveDynamicRestraint(host, Keep, false);
									host = removeR;
									link = removeR.dynamicLink;
								} else {
									host = link;
									link = link.dynamicLink;
								}
								iter += 1;
							}

							if (KDRestraint(removeR).shrine && KDRestraint(removeR).shrine.includes(remove)) {
								KinkyDungeonRemoveRestraint(KDRestraint(removeR).Group, Keep, false, false, false, false);
							}
						}
					}

				KinkyDungeonSendFloater({x: 1100, y: 600 - KDRecentRepIndex * 40}, `+${TextGet("Restraint" + restraint.name)}!`, "pink", 5, true);
				KDRecentRepIndex += 1;

				let item: item = {
					name: restraint.name,
					id: KinkyDungeonGetItemID(),
					type: Restraint,
					curse: Curse,
					events: events ? events : KDGetEventsForRestraint(inventoryAs || restraint.name),
					tightness: tight,
					lock: "",
					faction: faction,
					dynamicLink: dynamicLink,
					data: data,
				};
				if (inventoryAs) item.inventoryVariant = inventoryAs;
				KDRestraintDebugLog.push("Adding " + item.name);
				KinkyDungeonInventoryAdd(item);
				KDUpdateItemEventCache = true;
				if (!NoEvent)
					KinkyDungeonSendEvent("postApply", {player: KinkyDungeonPlayerEntity, item: item, host: undefined, keep: Keep, Link: Link, UnLink: Unlink});

				KDUpdateItemEventCache = true;
				if (Curse && KDCurses[Curse] && KDCurses[Curse].onApply) {
					KDCurses[Curse].onApply(item, undefined);
				}

				if (Lock) KinkyDungeonLock(item, Lock, false, Unlink);
				else if (restraint.DefaultLock && !Unlink) KinkyDungeonLock(item, KDProcessLock(restraint.DefaultLock));

				KDUpdateLinkCaches(item);
				KDUpdateItemEventCache = true;
			} else if ((!Link && !linked) || SwitchItems) {
				KinkyDungeonCancelFlag = false;
				// Otherwise, if we did unlink an item, and we are not in the process of linking (very important to prevent loops)
				// Then we link the new item to the unlinked item if possible
				r = KinkyDungeonGetRestraintItem(restraint.Group);
				if (SwitchItems) {
					KDUpdateItemEventCache = true;
					KinkyDungeonAddRestraintIfWeaker(restraint, Tightness, Bypass, Lock, Keep, false, undefined, faction, undefined, Curse, securityEnemy, undefined, inventoryAs, data);
				} else if (r && KDRestraint(r) && KinkyDungeonIsLinkable({
					oldRestraint: KDRestraint(r),
					newRestraint: restraint,
					item: r,
				})) {
					KinkyDungeonLinkItem(restraint, r, Tightness, Lock, Keep, faction, Curse, undefined, inventoryAs, events, data);
				}
			}
			// Run events AFTER the swappen
			if (oldevents) {
				if (prevR.events) {
					for (let e of oldevents) {
						if (e.trigger == "postRemoval" && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
							KinkyDungeonHandleInventoryEvent("postRemoval", e, prevR, {item: prevR, add: eventsAdd, keep: Keep, Link: Link, shrine: undefined});
						}
					}
				}
				KinkyDungeonSendEvent("postRemoval", {item: prevR, add: eventsAdd, keep: Keep, Link: Link, shrine: undefined});
			}
			KDUpdateItemEventCache = true;
			KinkyDungeonCancelFlag = false;
		}

		//KinkyDungeonWearForcedClothes();

		KinkyDungeonPlayerTags = KinkyDungeonUpdateRestraints(); // We update the restraints but no time drain on batteries, etc

		KinkyDungeonCalculateSlowLevel();
		KDRefreshCharacter.set(KinkyDungeonPlayer, true); // We signal it is OK to check whether the player should get undressed due to restraints

		KinkyDungeonDressPlayer();
		KinkyDungeonMultiplayerInventoryFlag = true; // Signal that we can send the inventory now
		KinkyDungeonSleepTime = 0;
		KinkyDungeonUpdateStruggleGroups();
		if (!KinkyDungeonRestraintAdded) {
			KinkyDungeonRestraintAdded = true;
			let sfx = (restraint && KDGetRestraintSFX(restraint)) ? KDGetRestraintSFX(restraint) : "Struggle";
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
		}
		let end = performance.now();
		if (KDDebug)
			console.log(`Took ${end - start} milliseconds to add restraint ${restraint.name}`);
		return Math.max(1, restraint.power);
	}
	return 0;
}

/**
 * It removes a restraint from the player
 * @param item - The item to remove.
 * @param [Keep] - If true, the item will be kept in the player's inventory.
 * @param [Add] - If true, this is part of the process of adding another item and should not trigger infinite recursion
 * @param [NoEvent] - If true, the item will not trigger any events.
 * @param [Shrine] - If the item is being removed from a shrine, this is true.
 * @param [UnLink] - If the item is being removed as part of an unlinking process
 * @param [Remover] - Who removes this
 * @param [ForceRemove] - Ignore AlwaysKeep, for example if armor gets confiscated
 * @returns removed items
 */
function KinkyDungeonRemoveRestraintSpecific(item: item, Keep?: boolean, Add?: boolean,
	NoEvent?: boolean, Shrine?: boolean, UnLink?: boolean, Remover?: entity, ForceRemove?: boolean): item[] {
	KDUpdateItemEventCache = true;

	let rest = KinkyDungeonGetRestraintItem(KDRestraint(item)?.Group);
	if (rest == item) {
		return KinkyDungeonRemoveRestraint(KDRestraint(item).Group, Keep, Add, NoEvent, Shrine, UnLink, Remover, ForceRemove);
	} else if (KDRestraint(item)) {
		let list = KDDynamicLinkList(rest, true);
		for (let i = 1; i < list.length; i++) {
			if (list[i] == item) {
				return KinkyDungeonRemoveDynamicRestraint(list[i-1], Keep, NoEvent, Remover, ForceRemove);
			}
		}
	}
	return [];
}

/**
 * It removes a restraint from the player
 * @param Group - The group of the item to remove.
 * @param [Keep] - If true, the item will be kept in the player's inventory.
 * @param [Add] - If true, this is part of the process of adding another item and should not trigger infinite recursion
 * @param [NoEvent] - If true, the item will not trigger any events.
 * @param [Shrine] - If the item is being removed from a shrine, this is true.
 * @param [UnLink] - If the item is being removed as part of an unlinking process
 * @param [Remover] - Who removes this
 * @param [ForceRemove] - Ignore AlwaysKeep, for example if armor gets confiscated
 * @returns items removed
 */
function KinkyDungeonRemoveRestraint(Group: string, Keep?: boolean, Add?: boolean, NoEvent?: boolean, Shrine?: boolean, UnLink?: boolean, Remover?: entity, ForceRemove?: boolean): item[] {
	let rem = [];
	KDRestraintDebugLog.push("Removing " + Group);
	KDDelayedActionPrune(["Remove"]);
	KDStruggleGroupLinkIndex = {};
	for (let item of KinkyDungeonAllRestraint()) {
		const rest = KinkyDungeonRestraintsCache.get(item.name);
		if (rest.Group == Group) {
			let AssetGroup = rest && rest.AssetGroup ? rest.AssetGroup : Group;
			if (!NoEvent)
				KinkyDungeonSendEvent("remove", {item: rest, add: Add, keep: Keep, shrine: Shrine});

			if (!KinkyDungeonCancelFlag && !Add && !UnLink) {
				KDRestraintDebugLog.push("Unlinking " + item.name);
				let rr = KinkyDungeonUnLinkItem(item, Keep);
				if (rr.length > 0) {
					KinkyDungeonCancelFlag = true;
					rem.push(...rr);
				}
			}

			if (!KinkyDungeonCancelFlag) {
				InventoryRemove(KinkyDungeonPlayer, AssetGroup);

				let removed: item[] = [];
				for (let _item of KinkyDungeonInventory.get(Restraint).values()) {
					if (_item && KDRestraint(_item).Group == Group) {
						KDRestraintDebugLog.push("Deleting " + _item.name);
						KinkyDungeonInventoryRemove(_item);
						removed.push(_item);
						break;
					}
				}


				// Add the item to inventory
				// Cases:
				// No add = normal remove, proceed as normal
				// yes Add and yes unlink: pulling the item off to link over it
				// add and no unlink: removing to put a top level item
				// no add and yes unlink: forbidden case
				if (removed.length > 0 && ((!Add && !UnLink) || (Add && UnLink)))
					for (let invitem of (!Add && !UnLink) ? KDDynamicLinkList(item, true) : removed) {
						let invrest = KDRestraint(invitem);

						rem.push(JSON.parse(JSON.stringify(invitem)));
						// @ts-ignore
						let inventoryAs = invitem.inventoryVariant || invitem.inventoryAs || (Remover?.player ? invrest.inventoryAsSelf : invrest.inventoryAs);
						if (invitem.conjured) {
							KinkyDungeonSendTextMessage(1, TextGet("KDConjuredItemVanish")
								.replace("ITMN", KDGetItemName(invitem)), "#ffffff", 1);
						}
						if (invrest.inventory && !ForceRemove && !invitem.conjured
							&& (Keep
								|| ((
									invrest.enchanted
									|| (invrest.alwaysKeep)
									|| (invrest.armor)
									|| (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs] && !KinkyDungeonRestraintVariants[inventoryAs].noKeep)
								)))) {
							if (inventoryAs) {
								let origRestraint = KinkyDungeonGetRestraintByName(inventoryAs);
								if (origRestraint && invrest.shrine?.includes("Cursed") && !origRestraint.shrine?.includes("Cursed")) {
									KinkyDungeonSendTextMessage(10, TextGet("KDCursedArmorUncurse").replace("RestraintName", TextGet("Restraint" + invrest.name)), "#aaffaa", 1,
										false, false, undefined, "Struggle");
								}
								if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
									KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
								}

								if (!KinkyDungeonInventoryGetLoose(inventoryAs)) {
									let loose: item = {name: inventoryAs, id: KinkyDungeonGetItemID(), type: LooseRestraint, events:invitem.events || origRestraint.events, quantity: 1};
									if (invitem.inventoryVariant) loose.inventoryVariant = invitem.inventoryVariant;
									if (KinkyDungeonRestraintVariants[inventoryAs]) loose.showInQuickInv = true;
									KinkyDungeonInventoryAdd(loose);
									KDUpdateItemEventCache = true;
								} else {
									if (!KinkyDungeonInventoryGetLoose(inventoryAs).quantity) KinkyDungeonInventoryGetLoose(inventoryAs).quantity = 0;
									KinkyDungeonInventoryGetLoose(inventoryAs).quantity += 1;
								}
							} else {
								if (!KinkyDungeonInventoryGetLoose(invrest.name)) {
									KinkyDungeonInventoryAdd({name: invrest.name, id: KinkyDungeonGetItemID(), type: LooseRestraint, events:invrest.events, quantity: 1});
									KDUpdateItemEventCache = true;
								} else {
									if (!KinkyDungeonInventoryGetLoose(invrest.name).quantity) KinkyDungeonInventoryGetLoose(invrest.name).quantity = 0;
									KinkyDungeonInventoryGetLoose(invrest.name).quantity += 1;
								}

							}
						} else if (Keep && rest.disassembleAs) {
							let dropped = {x:KDPlayer().x, y:KDPlayer().y,
								name: rest.disassembleAs,
								amount: rest.disassembleCount || 1};
							let newPoint = KinkyDungeonGetNearbyPoint(KDPlayer().x, KDPlayer().y, false, undefined, true);
							if (newPoint) {
								dropped.x = newPoint.x;
								dropped.y = newPoint.y;
							}
							KDMapData.GroundItems.push(dropped);
						}


						if (!NoEvent) {
							if (invrest.events) {
								for (let e of invrest.events) {
									if (e.trigger == "postRemoval" && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
										KinkyDungeonHandleInventoryEvent("postRemoval", e, invitem, {item: invitem, id: KinkyDungeonGetItemID(), add: Add, keep: Keep, shrine: Shrine});
									}
								}
							}
							KinkyDungeonSendEvent("postRemoval", {item: invrest, add: Add, keep: Keep, shrine: Shrine});
						}
					}





				if (rest.Group == "ItemNeck" && !Add && !KinkyDungeonPlayerTags.get("Collars"))
					rem.push(...KinkyDungeonRemoveRestraint("ItemNeckRestraints", true, undefined, undefined, Shrine, undefined, Remover, ForceRemove));

				let sfx = (rest && KDGetRemoveSFX(rest)) ? KDGetRemoveSFX(rest) : "Struggle";
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");

				KinkyDungeonCalculateSlowLevel();
				KDRefreshCharacter.set(KinkyDungeonPlayer, true);
				KinkyDungeonDressPlayer();

				KinkyDungeonMultiplayerInventoryFlag = true;
				KinkyDungeonUpdateStruggleGroups();

			}
			KinkyDungeonCancelFlag = false;
			if (KinkyDungeonPlayerWeapon != KinkyDungeonPlayerWeaponLastEquipped && KinkyDungeonInventoryGet(KinkyDungeonPlayerWeaponLastEquipped)) {
				KDSetWeapon(KinkyDungeonPlayerWeaponLastEquipped);
			}
			return rem;
		}
	}
	return rem;
}

function KDIInsertRestraintUnderneath(_restraint: restraint) {

	return false;
}

/**
 * It removes the item's dynamic link
 * @param hostItem - The group of the item to remove.
 * @param [Keep] - If true, the item will be kept in the player's inventory.
 * @param [NoEvent] - If true, the item will not trigger any events.
 * @param [Remover] - Who removes this
 * @param [ForceRemove] - Ignore AlwaysKeep, for example if armor gets confiscated
 * @returns removed items
 */
function KinkyDungeonRemoveDynamicRestraint(hostItem: item, Keep?: boolean, NoEvent?: boolean, Remover?: entity, ForceRemove?: boolean): item[] {
	let item = hostItem.dynamicLink;
	let rem = [];
	if (item) {
		const rest = KDRestraint(item);
		if (!NoEvent)
			KinkyDungeonSendEvent("remove", {item: rest, keep: Keep, shrine: false, dynamic: true});

		if (!KinkyDungeonCancelFlag) {
			// @ts-ignore
			let inventoryAs = item.inventoryVariant || item.inventoryAs || (Remover?.player ? rest.inventoryAsSelf : rest.inventoryAs);
			if (item.conjured) {
				KinkyDungeonSendTextMessage(1, TextGet("KDConjuredItemVanish")
					.replace("ITMN", KDGetItemName(item)), "#ffffff", 1);
			}
			if (rest.inventory && !ForceRemove && !item.conjured
				&& (Keep
					|| rest.enchanted
					|| rest.armor
					|| rest.alwaysKeep
					|| (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs] && !KinkyDungeonRestraintVariants[inventoryAs].noKeep)
				)) {
				if (inventoryAs) {
					let origRestraint = KinkyDungeonGetRestraintByName(inventoryAs);
					if (origRestraint && rest.shrine?.includes("Cursed") && !origRestraint.shrine?.includes("Cursed")) {
						KinkyDungeonSendTextMessage(10, TextGet("KDCursedArmorUncurse").replace("RestraintName", TextGet("Restraint" + rest.name)), "#aaffaa", 1,
							false, false, undefined, "Struggle");
						if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
							KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
						}
					}
					if (!KinkyDungeonInventoryGetLoose(inventoryAs)) {
						let loose: item = {name: inventoryAs, id: KinkyDungeonGetItemID(), type: LooseRestraint, events: item.events || KDGetEventsForRestraint(inventoryAs), quantity: 1};
						if (item.inventoryVariant) loose.inventoryVariant = item.inventoryVariant;
						if (KinkyDungeonRestraintVariants[inventoryAs]) loose.showInQuickInv = true;
						KinkyDungeonInventoryAdd(loose);
						KDUpdateItemEventCache = true;
					} else {
						if (!KinkyDungeonInventoryGetLoose(inventoryAs).quantity) KinkyDungeonInventoryGetLoose(inventoryAs).quantity = 0;
						KinkyDungeonInventoryGetLoose(inventoryAs).quantity += 1;
					}
				} else {
					if (!KinkyDungeonInventoryGetLoose(rest.name)) {
						KinkyDungeonInventoryAdd({name: rest.name, id: KinkyDungeonGetItemID(), type: LooseRestraint, events:rest.events, quantity: 1});
						KDUpdateItemEventCache = true;
					} else {
						if (!KinkyDungeonInventoryGetLoose(rest.name).quantity) KinkyDungeonInventoryGetLoose(rest.name).quantity = 0;
						KinkyDungeonInventoryGetLoose(rest.name).quantity += 1;
					}
				}
			} else if (Keep && rest.disassembleAs) {
				let dropped = {x:KDPlayer().x, y:KDPlayer().y,
					name: rest.disassembleAs,
					amount: rest.disassembleCount || 1};
				let newPoint = KinkyDungeonGetNearbyPoint(KDPlayer().x, KDPlayer().y, false, undefined, true);
				if (newPoint) {
					dropped.x = newPoint.x;
					dropped.y = newPoint.y;
				}
				KDMapData.GroundItems.push(dropped);
			}


			// Remove the item itself by unlinking it from the chain
			KDRestraintDebugLog.push("Removing Dynamic " + item.name);
			hostItem.dynamicLink = item.dynamicLink;
			item.dynamicLink = undefined;
			rem.push(JSON.parse(JSON.stringify(item)));
			KDUpdateItemEventCache = true;
			let r = KinkyDungeonGetRestraintItem(KDRestraint(hostItem).Group);
			if (r) KDUpdateLinkCaches(r);

			if (!NoEvent) {
				if (rest.events) {
					for (let e of rest.events) {
						if (e.trigger == "postRemoval" && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
							KinkyDungeonHandleInventoryEvent("postRemoval", e, item, {item: item, id: KinkyDungeonGetItemID(), keep: Keep, shrine: false, dynamic: true});
						}
					}
				}
				KinkyDungeonSendEvent("postRemoval", {item: rest, keep: Keep, shrine: false, dynamic: true});
			}

			let sfx = (rest && KDGetRemoveSFX(rest)) ? KDGetRemoveSFX(rest) : "Struggle";
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");

			KinkyDungeonCalculateSlowLevel();
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();

			KinkyDungeonMultiplayerInventoryFlag = true;
			KinkyDungeonUpdateStruggleGroups();
		}
		KinkyDungeonCancelFlag = false;
	}
	return rem;
}

/**
 * "Returns an array of all the shrine types that have at least one restraint item."
 *
 * The function takes one argument, `ShrineFilter`, which is an array of shrine types. If the argument is not provided, the
 * function will return all shrine types. If the argument is provided, the function will only return shrine types that are
 * in the argument
 * @param ShrineFilter - An array of strings, each string being the name of a shrine.
 * @returns An array of all the restraint types that can be used in the shrine.
 */
function KinkyDungeonRestraintTypes(ShrineFilter: string[]): string[] {
	let ret: string[] = [];

	for (let invItem of KinkyDungeonAllRestraintDynamic()) {
		let inv = invItem.item;
		if (KDRestraint(inv).shrine) {
			for (let shrine of KDRestraint(inv).shrine) {
				if (ShrineFilter.includes(shrine) && !ret.includes(shrine)) ret.push(shrine);
			}
		}
	}

	return ret;
}


/**
 * @param newRestraint
 * @param oldItem
 * @param tightness
 * @param [Lock]
 * @param [Keep]
 * @param [faction]
 * @param [Curse]
 * @param [autoMessage] - Whether or not to automatically dispatch a message
 * @param [inventoryAs] - inventoryAs for the item
 * @param [events] - inventoryAs for the item
 * @param [data] - data for the item
 * @returns {item} - The new item
 */
function KinkyDungeonLinkItem (
	newRestraint:  restraint,
	oldItem:       item,
	tightness:     number,
	Lock?:         string,
	Keep?:         boolean,
	faction?:      string,
	Curse?:        string,
	autoMessage:   boolean = true,
	inventoryAs:   string = null,
	events:        KinkyDungeonEvent[] = undefined,
	data?:         Record<string, number>
): item
{
	if (newRestraint && oldItem && oldItem.type == Restraint) {
		if (newRestraint) {
			KDRestraintDebugLog.push("Adding Linking " + newRestraint.name);
			KinkyDungeonAddRestraint(newRestraint, tightness, true, Lock, Keep, true, undefined, events, faction, undefined, oldItem, Curse, undefined, undefined, inventoryAs, data);
			let newItem = KinkyDungeonGetRestraintItem(newRestraint.Group);
			if (newItem)
				newItem.dynamicLink = oldItem;
			if (newRestraint.UnLink && KDRestraint(oldItem).Link == newRestraint.name) {
				if (oldItem.name != newRestraint.UnLink) {
					oldItem.name = newRestraint.UnLink;
					oldItem.events = Object.assign([], KDRestraint(oldItem).events);
				}
			}
			KDUpdateItemEventCache = true;
			KDUpdateLinkCaches(newItem);
			if (autoMessage && KDRestraint(oldItem).Link)
				KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonLink" + oldItem.name), "#ff5277", 2,
					false, false, undefined, "Struggle");


			KinkyDungeonSendEvent("postApply", {player: KinkyDungeonPlayerEntity, item: newItem, host: undefined, keep: Keep, Link: true, UnLink: false});
			KDUpdateItemEventCache = true;
			return newItem;
		}
	}
	return null;
}

/**
 *
 * @param {item} item
 * @param {boolean} Keep
 * @returns {item[]}
 */
function KinkyDungeonUnLinkItem(item: item, Keep: boolean, _dynamic?: any): item[] {
	//if (!data.add && !data.shrine)
	let rem = [];
	if (item.type == Restraint) {
		let UnLink: item = null;
		if (item.dynamicLink) {
			UnLink = item.dynamicLink;
		}
		if (UnLink) {
			let newRestraint = KinkyDungeonGetRestraintByName(UnLink.name);
			if (newRestraint) {

				KDRestraintDebugLog.push("Adding Unlinked " + newRestraint.name);
				KinkyDungeonAddRestraint(newRestraint, UnLink.tightness, true, UnLink.lock, Keep, undefined, undefined, UnLink?.events, UnLink.faction, true, UnLink.dynamicLink, UnLink.curse, undefined, undefined, UnLink.inventoryVariant, UnLink.data);

				KinkyDungeonSendEvent("postRemoval", {item: null, keep: Keep, shrine: false, Link: false, dynamic: true});
				if (KDRestraint(item).UnLink) {
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonUnLink" + item.name), "lightgreen", 2,
						false, false, undefined, "Struggle");
				} else
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonUnLink"), "lightgreen", 2,
						false, false, undefined, "Struggle");
				return [item];
			}
		}
	}
	return rem;
}

/**
 * @param x
 * @param y
 * @param options
 */
function KDCreateDebris (
	x: number,
	y: number,
	options: {aoe: number, number: number, dist: number, kind: string, duration?: number, durationExtra?: number}
)
{
	let count = options.number ? options.number : 1;
	let rad = options.aoe ? options.aoe : 1.5;
	let minrad = options.dist;
	for (let i = 0; i < count; i++) {
		let slots = [];
		for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
			for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
				if (Math.sqrt(X*X+Y*Y) <= rad && (!minrad || Math.sqrt(X*X+Y*Y) >= minrad)) {
					if ((x + X > 0 && y + Y > 0 && x + X < KDMapData.GridWidth && y + Y < KDMapData.GridHeight)
						&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x + X, y + Y)))
						slots.push({x:X, y:Y});
				}
			}

		if (slots.length > 0) {
			let slot = slots[Math.floor(KDRandom() * slots.length)];
			if (slot) {
				KDCreateEffectTile(x + slot.x, y + slot.y, {
					name: options.kind,
					duration: options.duration
				}, options.durationExtra || 0);
			}
		}

	}
}

/**
 * @param StruggleType
 * @param restraint
 * @param lockType
 * @param index
 * @param data
 * @param host
 */
function KDSuccessRemove(StruggleType: string, restraint: item, lockType: KDLockType, index: number, data: any, host: item): boolean {
	let progress = restraint.cutProgress ? restraint.cutProgress : 0;
	data.destroyChance = (StruggleType == "Cut" || restraint.cutProgress) ? 1.0 : 0;
	if (KDRestraint(restraint)?.struggleBreak && StruggleType == "Struggle") data.destroyChance = 1.0;
	if (restraint.struggleProgress && restraint.struggleProgress > 0) {
		progress += restraint.struggleProgress;
		data.destroyChance = restraint.cutProgress / progress;
	}
	let destroy = false;

	KinkyDungeonFastStruggleType = "";
	KinkyDungeonFastStruggleGroup = "";

	KinkyDungeonSendEvent("beforeSuccessRemove", data);

	if (StruggleType == "Pick" || StruggleType == "Unlock") {
		if (StruggleType == "Unlock") {
			if (lockType && lockType.canUnlock(data)) {
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Unlock) ? KDGetFinishEscapeSFX(restraint).Unlock : "Unlock")
					+ ".ogg");
				KinkyDungeonRemoveKeysUnlock(restraint.lock);
				KinkyDungeonLock(restraint, "");
			}
		} else {
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Unlock) ? KDGetFinishEscapeSFX(restraint).Unlock : "Unlock")
				+ ".ogg");
			KinkyDungeonLock(restraint, "");
		}
	} else {
		if (KDSoundEnabled()) {
			if (StruggleType == "Cut") AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Cut) ? KDGetFinishEscapeSFX(restraint).Cut : "Cut")
				+ ".ogg");
			else if (StruggleType == "Remove") AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Remove) ? KDGetFinishEscapeSFX(restraint).Remove : "Unbuckle")
				+ ".ogg");
			else AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Struggle) ? KDGetFinishEscapeSFX(restraint).Struggle : "Struggle")
				+ ".ogg");
		}
		if (KDRandom() < data.destroyChance) {
			if (KDAlwaysKeep({name: restraint.name, id: 0}, KinkyDungeonPlayerEntity)) {
				KinkyDungeonSendTextMessage(9, TextGet("KinkyDungeonStruggleCutDestroyFail").replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff5277", 2,
					false, false, undefined, "Struggle");
			} else {
				KinkyDungeonSendTextMessage(9, TextGet("KinkyDungeonStruggleCutDestroy").replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff5277", 2,
					false, false, undefined, "Struggle");
			}
			destroy = true;
		}
		let trap = restraint.trap;
		KDSendStatus('escape', restraint.name, StruggleType);
		if (KDSoundEnabled() && destroy) {
			if (KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Destroy) {
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ (KDGetFinishEscapeSFX(restraint).Destroy)
					+ ".ogg");
			}
		}
		if (index) {
			//if (KDStruggleGroupLinkIndex[KDRestraint(restraint).Group]) KDStruggleGroupLinkIndex[KDRestraint(restraint).Group] = 0;
			KinkyDungeonRemoveDynamicRestraint(host, !destroy, false, KinkyDungeonPlayerEntity);
		} else {
			KinkyDungeonRemoveRestraint(KDRestraint(restraint).Group, !destroy, undefined, undefined, undefined, undefined, KinkyDungeonPlayerEntity);
		}
		if (KinkyDungeonStatsChoice.get("FutileStruggles") && data.escapeChance < 0.25) KinkyDungeonChangeWill(KinkyDungeonStatWillCostEscape);
		if (trap) {
			let summon = KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, trap, 1, 2.5).length;
			if (summon) {
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonSummonTrapMonster"), "#ff5277", 2,
					false, false, undefined, "Struggle");
			}
		}
	}
	let suff = "";
	if (KDRestraint(restraint)?.customEscapeSucc) suff = KDRestraint(restraint)?.customEscapeSucc;
	else if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) suff = "Aroused";
	KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonStruggle" + StruggleType + "Success" + suff).replace("TargetRestraint", TextGet("Restraint" + KDRestraint(restraint).name)), "lightgreen", 2);

	KinkyDungeonSendEvent("afterSuccessRemove", data);

	return destroy;
}

function KDAddDelayedStruggle(amount: number, time: number, _StruggleType: string, struggleGroup: string, index: number, data: KDStruggleData, progress: number = 0, limit: number = 100): void {
	let cur = progress || 0;
	for (let t = 1; t <= time; t++) {
		let plus = Math.min(amount/time, Math.max(0, (limit > 0 ? (limit - cur) : 1)));
		if (plus > 0 && plus < 0.04) plus = 0.04;
		cur += plus;
		KDAddDelayedAction({
			commit: "Struggle",
			data: {
				group: struggleGroup,
				index: index,
				amount: plus,
				escapeData: data,
				delta: time == 1 ? 0 : 1,
			},
			time: t,
			tags: ["Action", "Remove", "Restrain", "Hit"],
		});
	}
}

/**
 * @param bonus
 * @param penalty
 * @param threshold
 * @param bonusscale
 * @param penaltyscale
 */
function KDGetManaBonus(bonus: number, penalty: number, threshold: number, bonusscale: number, penaltyscale: number): number {
	if (KinkyDungeonStatMana > threshold) return bonus * (KinkyDungeonStatMana - threshold)/bonusscale;
	else if (KinkyDungeonStatMana < threshold) return penalty * (KinkyDungeonStatMana - threshold)/penaltyscale;
	return 0;
}

/**
 * Gets the goddess bonus for this item
 * @param item
 * @param [data] - Escape chance data
 */
function KDGetItemGoddessBonus(item: item, data?: any): number {
	if (!item) return 0;
	if (data) {
		if (data.struggleType == "Unlock") return 0;
	}
	let bonus = 0;
	let avg = 0;
	for (let s of KDRestraint(item)?.shrine) {
		if (KinkyDungeonGoddessRep[s] != undefined) {
			bonus += KDGetGoddessBonus(s);
			avg += 1;
		}
	}
	if (avg > 0)
		bonus = bonus/avg;
	return bonus;
}

/**
 * Gets a restraint from a list of eligible restraints and a group prioritization order
 * @param RestraintList
 * @param GroupOrder
 * @param [skip]
 */
function KDChooseRestraintFromListGroupPri(RestraintList: {restraint: restraint, weight: number}[], GroupOrder: string[], skip: boolean = true): restraint {

	let cycled = false;
	for (let i = 0; i < GroupOrder.length; i++) {
		let group = GroupOrder[i];
		if (skip && (!cycled ||
			(KinkyDungeonGetRestraintItem(group)
				&& !KDRestraint(KinkyDungeonGetRestraintItem(group))?.armor
				&& !KDRestraint(KinkyDungeonGetRestraintItem(group))?.good))) continue;
		let Restraints = RestraintList.filter((rest) => {
			return rest.restraint.Group == group;
		});

		if (Restraints.length > 0) {
			let restraintWeightTotal = 0;
			let restraintWeights = [];


			for (let rest of Restraints) {
				let restraint = rest.restraint;
				let weight = rest.weight;
				restraintWeights.push({restraint: restraint, weight: restraintWeightTotal});
				weight += restraint.weight;
				restraintWeightTotal += Math.max(0, weight);
			}

			let selection = KDRandom() * restraintWeightTotal;

			for (let L = restraintWeights.length - 1; L >= 0; L--) {
				if (selection > restraintWeights[L].weight) {
					return restraintWeights[L].restraint;
				}
			}
		}
		if (i == GroupOrder.length - 1 && !cycled) {
			i = 0;
			cycled = true;
		}
	}
	return null;
}


/**
 * Gets a restraint from a list of eligible restraints and a group prioritization order
 * @param RestraintList
 * @param GroupOrder
 * @param [skip]
 */
function KDChooseRestraintFromListGroupPriWithVariants (
	RestraintList: eligibleRestraintItem[],
	GroupOrder: string[],
	skip: boolean = true
): { r: restraint, v: ApplyVariant, iv: string}
{
	let cycled = false;
	for (let i = 0; i < GroupOrder.length; i++) {
		let group = GroupOrder[i];
		if (skip && (!cycled && i < GroupOrder.length - 1 &&
			(KinkyDungeonGetRestraintItem(group)
				&& !KDRestraint(KinkyDungeonGetRestraintItem(group))?.armor
				&& !KDRestraint(KinkyDungeonGetRestraintItem(group))?.good))) continue;
		let Restraints = RestraintList.filter((rest) => {
			return rest.restraint.Group == group;
		});

		if (Restraints.length > 0) {
			let restraintWeightTotal = 0;
			let restraintWeights = [];


			for (let rest of Restraints) {
				let restraint = rest.restraint;
				let weight = rest.weight;
				restraintWeights.push({restraint: restraint, variant: rest.variant, weight: restraintWeightTotal, iv: rest.inventoryVariant});
				weight += restraint.weight;
				restraintWeightTotal += Math.max(0, weight);
			}

			let selection = KDRandom() * restraintWeightTotal;

			for (let L = restraintWeights.length - 1; L >= 0; L--) {
				if (selection > restraintWeights[L].weight) {
					return {r: restraintWeights[L].restraint, v: restraintWeights[L].variant, iv: restraintWeights[L].iv};
				}
			}
		}

		if (i == GroupOrder.length - 1 && !cycled) {
			i = 0;
			cycled = true;
		}
	}
	return null;
}


type kdRopeSlimePart = {
	enemyTagSuffix?: string;
	enemyTagExtra?: Record<string, number>,
}

let KDSlimeParts: Record<string, kdRopeSlimePart> = {
	"Collar": {enemyTagSuffix: "Collar",enemyTagExtra: {"livingCollar":10}},
	"Boots": {},
	"Feet": {},
	"Legs": {},
	"Arms": {},
	"Head": {},
	"Mouth": {},
	"Hands": {},
	"Raw": {},
};

let KDRopeParts: Record<string, kdRopeSlimePart> = {
	"Collar": {enemyTagSuffix: "Collar",enemyTagExtra: {"livingCollar":10}},
	"ArmsBoxtie": {},
	"ArmsWrist": {},
	"Cuffs": {},
	"CuffsAdv": {},
	"CuffsAdv2": {},
	//"Hogtie": {enemyTagSuffix: "Hogtie"},
	//"HogtieWrist": {enemyTagSuffix: "Hogtie"},
	"HogtieLink": {enemyTagSuffix: "Hogtie"},
	"Feet": {},
	"Feet2": {},
	"Feet3": {},
	"Legs": {},
	"Legs2": {},
	"Legs3": {},
	"Belt": {},
	"Harness": {},
	"Crotch": {},
	"Toes": {},
	"Raw": {},
};

type kdCuffPart = {
	base:               boolean;
	enemyTagSuffix?:    string;
	enemyTagOverride?:  Record<string, number>;
	Link?:              string;
	UnLink?:            string;
	ModelSuffix?:       string;
}

let KDCuffParts: Record<string, kdCuffPart> = {
	"LivingCollar": {base: true, enemyTagSuffix: "LivingCollar", enemyTagOverride: {"livingCollar":10}},
	"AnkleCuffs": {base: true,},// Link: "AnkleCuffs2"},
	//"AnkleCuffs2": {Link: "AnkleCuffs3", UnLink: "AnkleCuffs"}, //, ModelSuffix: "Chained"
	//"AnkleCuffs3": {UnLink: "AnkleCuffs2"},
	"LegCuffs": {base: true,},// Link: "LegCuffs2"},
	//"LegCuffs2": {UnLink: "LegCuffs"}, //, ModelSuffix: "Chained"
	"ArmCuffs": {base: true,},// Link: "ArmCuffs2"},
	//"ArmCuffs2": {Link: "ArmCuffs3", UnLink: "ArmCuffs"}, //, ModelSuffix: "Chained"
	//"ArmCuffs3": {UnLink: "ArmCuffs4"},
	//"ArmCuffs4": {UnLink: "ArmCuffs", Link: "ArmCuffs3"},
};

/**
 * @param CopyOf - The cuff family to copy
 * @param idSuffix - The suffix to add to the cuff family
 * @param ModelSuffix - The suffix for the cuff model to use
 * @param tagBase - The base for the enemy tags
 * @param extraTags - extra enemy tags
 * @param allTag - adds a tag to all of the cuffs if specified
 * @param removeTag
 * @param addPower - Base opower level
 * @param properties - Restraint properties to override
 * @param extraEvents - Extra events to add on to the base cuffs
 * @param addStruggle - Increase to base struggle amounts
 * @param premultStruggle - Multiplier to base struggle amounts, AFTER baseStruggle
 * @param addStruggleLink
 * @param premultStruggleLink
 * @param [Filters] - Multiplier to base struggle amounts, AFTER baseStruggle
 * @param baseWeight
 * @param [noGeneric] - does not add this to tagBaseRestraints, only tagBaseCuffs
 * @param [CuffAssets] - mapping of Group to Assets
 * @param [CuffModels] - mapping of Group to Models
 * @param [noLockBase] - Removes Pick and Unlock methods of escape
 * @param [noLockLink] - Removes Pick and Unlock methods of escape
 * @param [Properties]
 * param {{name: string, description: string}} strings - Generic strings for the cuff type
 */
function KDAddCuffVariants (
	CopyOf:                string,
	idSuffix:              string,
	ModelSuffix:           string,
	tagBase:               string,
	extraTags:             Record<string, number>,
	allTag:                string[],
	removeTag:             string[],
	addPower:              number,
	properties:            KDRestraintPropsBase,
	extraEvents:           KinkyDungeonEvent[] = [],
	addStruggle?:          KDEscapeChanceList,
	premultStruggle?:      KDEscapeChanceList,
	addStruggleLink?:      KDEscapeChanceList,
	premultStruggleLink?:  KDEscapeChanceList,
	Filters?:              Record<string, LayerFilter>,
	baseWeight:            number = 10,
	noGeneric?:            boolean,
	CuffAssets:            Record<string, string> = {},
	CuffModels:            Record<string, string> = {},
	noLockBase?:           boolean,
	noLockLink?:           boolean,
	Properties?:           Record<string, LayerProperties>
)
{
	for (let part of Object.entries(KDCuffParts)) {
		let cuffPart = part[0];
		let cuffInfo = part[1];
		// Only if we have something to copy
		let origRestraint = KinkyDungeonGetRestraintByName(CopyOf + cuffPart);
		if (origRestraint) {
			// For each category of rope items we dupe the original item and apply modifications based on the category parameters
			let enemyTags: Record<string, number> = {};
			if (cuffInfo.base) {
				enemyTags[tagBase + (cuffInfo.enemyTagSuffix || "Cuffs")] = baseWeight;
				if (cuffInfo.enemyTagOverride) {
					for (let tag in cuffInfo.enemyTagOverride) {
						enemyTags[tag] = cuffInfo.enemyTagOverride[tag];
					}
				} else {
					if (!noGeneric) {
						enemyTags[tagBase + ("Restraints")] = baseWeight;
						enemyTags[tagBase + ("LessCuffs")] = 0.1 - baseWeight;
						enemyTags[tagBase + ("NoCuffs")] = -1000;
					}
					if (extraTags) {
						for (let t of Object.entries(extraTags)) {
							enemyTags[t[0]] = t[1];
						}
					}
				}
			}

			let enemyTagsMult: Record<string, number> = {};
			if (cuffInfo.base)
				enemyTagsMult[tagBase + (cuffInfo.enemyTagSuffix || "")] = 1;
			let shrine = [...allTag, ...KDGetRestraintTags(origRestraint)];
			for (let t of removeTag) {
				if (shrine.includes(t)) shrine.splice(shrine.indexOf(t), 1);
			}
			let props: KDRestraintPropsBase = {
				Model: CuffModels[cuffPart] || (origRestraint.Model + ModelSuffix + (cuffInfo.ModelSuffix || "")),
				Asset: CuffAssets[cuffPart] || (origRestraint.Asset),
				power: origRestraint.power + addPower,
				shrine: shrine,
				enemyTags: enemyTags,
				enemyTagsMult: enemyTagsMult,
				events: cuffInfo.base ? [...extraEvents, ...(origRestraint.events || [])] : [...(origRestraint.events || [])],
				escapeChance: Object.assign({}, origRestraint.escapeChance),
				Filters: origRestraint.Filters ? Object.assign({}, origRestraint.Filters) : {},
				Properties: origRestraint.Properties ? Object.assign({}, origRestraint.Properties) : {},
				cloneTag: tagBase + "Restraints",
			};
			if (cuffInfo.Link) props.Link = idSuffix + cuffInfo.Link;
			if (cuffInfo.UnLink) props.UnLink = idSuffix + cuffInfo.UnLink;
			if (Filters && props.Filters) {
				for (let layer of Object.keys(Filters)) {
					props.Filters[layer] = Object.assign({}, Filters[layer]);
				}
			}
			if (origRestraint.disassembleAs) props.disassembleAs = idSuffix + "Raw";
			if (Properties && props.Properties) {
				for (let layer of Object.keys(Properties)) {
					props.Properties[layer] = Object.assign({}, Properties[layer]);
				}
			}
			if (cuffInfo.base) {
				if (premultStruggle) {
					for (let type of Object.entries(premultStruggle)) {
						props.escapeChance[type[0]] = Math.round(10000*((props.escapeChance[type[0]] || 0) * type[1]))/10000;
					}
				}
				if (addStruggle) {
					for (let type of Object.entries(addStruggle)) {
						props.escapeChance[type[0]] = Math.round(10000*((props.escapeChance[type[0]] || 0) + type[1]))/10000;
					}
				}
				if (noLockBase) {
					delete props.escapeChance.Pick;
					delete props.escapeChance.Unlock;
				}
			} else {
				if (premultStruggleLink) {
					for (let type of Object.entries(premultStruggleLink)) {
						props.escapeChance[type[0]] = Math.round(10000*((props.escapeChance[type[0]] || 0) * type[1]))/10000;
					}
				}
				if (addStruggleLink) {
					for (let type of Object.entries(addStruggleLink)) {
						props.escapeChance[type[0]] = Math.round(10000*((props.escapeChance[type[0]] || 0) + type[1]))/10000;
					}
				}
				if (noLockLink) {
					delete props.escapeChance.Pick;
					delete props.escapeChance.Unlock;
				}
			}
			KinkyDungeonCloneRestraint(CopyOf + cuffPart, idSuffix + cuffPart, Object.assign(props, properties));
		}
	}
}


/**
 *
 * @param {string} CopyOf - The rope family to copy
 * @param {string} idSuffix - The suffix to add to the rope family
 * @param {string} ModelSuffix - The suffix for the rope model to use
 * @param {string} tagBase - The base for the enemy tags
 * @param {string[]} allTag - adds a tag to all of the ropes if specified
 * @param {string[]} removeTag
 * @param {number} basePower - Base opower level
 * @param {KDRestraintPropsBase} properties - Restraint properties to override
 * @param {KinkyDungeonEvent[]} extraEvents - Extra events to add on
 * @param {KDEscapeChanceList} addStruggle - Increase to base struggle amounts
 * @param {KDEscapeChanceList} premultStruggle - Multiplier to base struggle amounts, AFTER baseStruggle
 * @param {Record<string, LayerFilter>} [Filters] - Multiplier to base struggle amounts, AFTER baseStruggle
 * @param {number} baseWeight
 * @param {boolean} Enchantable - Do NOT delete enchantable rope categories
 * @param {Record<string, LayerProperties>} [Properties]
 * param {{name: string, description: string}} strings - Generic strings for the rope type
 */
function KDAddRopeVariants (
	CopyOf:           string,
	idSuffix:         string,
	ModelSuffix:      string,
	tagBase:          string,
	allTag:           string[],
	removeTag:        string[],
	basePower:        number,
	properties:       KDRestraintPropsBase,
	extraEvents:      KinkyDungeonEvent[] = [],
	addStruggle:      KDEscapeChanceList,
	premultStruggle:  KDEscapeChanceList,
	Filters:          Record<string, LayerFilter>,
	baseWeight:       number = 10,
	Enchantable:      boolean = false,
	Properties?:      Record<string, LayerProperties>
)
{
	for (let part of Object.entries(KDRopeParts)) {
		let ropePart = part[0];
		// Only if we have something to copy
		let origRestraint = KinkyDungeonGetRestraintByName(CopyOf + ropePart);
		if (origRestraint) {
			// For each category of rope items we dupe the original item and apply modifications based on the category parameters
			let enemyTags: Record<string, number> = {};
			enemyTags[tagBase + (part[1].enemyTagSuffix || "")] = baseWeight;
			if (part[1].enemyTagExtra) {
				for (let tag in part[1].enemyTagExtra) {
					enemyTags[tag] = part[1].enemyTagExtra[tag];
				}
			}



			let enemyTagsMult: Record<string, number> = {};
			enemyTagsMult[tagBase + (part[1].enemyTagSuffix || "")] = 1;
			let shrine = [...allTag, ...KDGetRestraintTags(origRestraint)];
			for (let t of removeTag) {
				if (shrine.includes(t)) shrine.splice(shrine.indexOf(t), 1);
			}
			let props: KDRestraintPropsBase = {
				Model: origRestraint.Model + ModelSuffix,
				power: origRestraint.power + basePower,
				shrine: shrine,
				enemyTags: enemyTags,
				enemyTagsMult: enemyTagsMult,
				events: [...extraEvents, ...(origRestraint.events || [])],
				escapeChance: Object.assign({}, origRestraint.escapeChance),
				Filters: origRestraint.Filters ? Object.assign({}, origRestraint.Filters) : {},
				Properties: origRestraint.Properties ? Object.assign({}, origRestraint.Properties) : {},
				cloneTag: tagBase,
				linkCategories: origRestraint.linkCategories ? JSON.parse(JSON.stringify(origRestraint.linkCategories)) : undefined,
				linkSize: origRestraint.linkSizes ? JSON.parse(JSON.stringify(origRestraint.linkSizes)) : undefined,
			};

			if (origRestraint.disassembleAs) props.disassembleAs = idSuffix + "Raw";
			if (!Enchantable && props.linkCategories) {
				for (let i = 0; i < props.linkCategories.length; i++) {
					if (props.linkCategories[i].includes("Enchantable")) {
						props.linkCategories.splice(i, 1);
						if (props.linkSizes && props.linkSizes[i])
							props.linkSizes.splice(i, 1);
						break;
					}
				}
			}
			if (Filters && props.Filters) {
				for (let layer of Object.keys(Filters)) {
					props.Filters[layer] = Object.assign({}, Filters[layer]);
				}
			}
			if (Properties && props.Properties) {
				for (let layer of Object.keys(Properties)) {
					props.Properties[layer] = Object.assign({}, Properties[layer]);
				}
			}
			if (premultStruggle) {
				for (let type of Object.entries(premultStruggle)) {
					props.escapeChance[type[0]] = Math.round(10000*((props.escapeChance[type[0]] || 0) * type[1]))/10000;
				}
			}
			if (addStruggle) {
				for (let type of Object.entries(addStruggle)) {
					props.escapeChance[type[0]] = Math.round(10000*((props.escapeChance[type[0]] || 0) + type[1]))/10000;
				}
			}
			KinkyDungeonCloneRestraint(CopyOf + ropePart, idSuffix + ropePart, Object.assign(props, properties));
		}
	}
}


/**
 * @param CopyOf - The rope family to copy
 * @param idSuffix - The suffix to add to the rope family
 * @param ModelSuffix - The suffix for the rope model to use
 * @param tagBase - The base for the enemy tags
 * @param allTag - adds a tag to all of the ropes if specified
 * @param removeTag
 * @param basePower - Base opower level
 * @param properties - Restraint properties to override
 * @param extraEvents - Extra events to add on
 * @param addStruggle - Increase to base struggle amounts
 * @param premultStruggle - Multiplier to base struggle amounts, AFTER baseStruggle
 * @param [Filters] - Multiplier to base struggle amounts, AFTER baseStruggle
 * @param baseWeight
 * @param [restraintType] - Restrainttype for slime spread event
 * @param [Properties]
 * param {{name: string, description: string}} strings - Generic strings for the rope type
 */
function KDAddHardSlimeVariants (
	CopyOf:            string,
	idSuffix:          string,
	ModelSuffix:       string,
	tagBase:           string,
	allTag:            string[],
	removeTag:         string[],
	basePower:         number,
	properties:        KDRestraintPropsBase,
	extraEvents:       KinkyDungeonEvent[] = [],
	addStruggle?:      KDEscapeChanceList,
	premultStruggle?:  KDEscapeChanceList,
	Filters?:          Record<string, LayerFilter>,
	baseWeight:        number = 100,
	restraintType?:    string,
	Properties?:       Record<string, LayerProperties>
)
{
	for (let part of Object.entries(KDSlimeParts)) {
		let restraintPart = part[0];
		// Only if we have something to copy
		let origRestraint = KinkyDungeonGetRestraintByName(CopyOf + restraintPart);
		if (origRestraint) {
			// For each category of rope items we dupe the original item and apply modifications based on the category parameters
			let enemyTags: Record<string, number> = {};
			enemyTags[tagBase + (part[1].enemyTagSuffix || "")] = baseWeight;
			enemyTags[tagBase + (part[1].enemyTagSuffix || "") + "Random"] = baseWeight + 3;
			if (part[1].enemyTagExtra) {
				for (let tag in part[1].enemyTagExtra) {
					enemyTags[tag] = part[1].enemyTagExtra[tag];
				}
			}

			let shrine = [ ...allTag,...KDGetRestraintTags(origRestraint)];
			for (let t of removeTag) {
				if (shrine.includes(t)) shrine.splice(shrine.indexOf(t), 1);
			}
			let props: KDRestraintPropsBase = {
				Model: origRestraint.Model + ModelSuffix,
				power: origRestraint.power + basePower,
				shrine: shrine,
				enemyTags: enemyTags,
				events: JSON.parse(JSON.stringify([...extraEvents, ...(origRestraint.events || [])])),
				escapeChance: Object.assign({}, origRestraint.escapeChance),
				Filters: origRestraint.Filters ? Object.assign({}, origRestraint.Filters) : {},
				Properties: origRestraint.Properties ? Object.assign({}, origRestraint.Properties) : {},
				cloneTag: tagBase,
			};
			if (Filters && props.Filters) {
				for (let layer of Object.keys(Filters)) {
					props.Filters[layer] = Object.assign({}, Filters[layer]);
				}
			}
			if (origRestraint.disassembleAs) props.disassembleAs = idSuffix + "Raw";
			if (Properties && props.Properties) {
				for (let layer of Object.keys(Properties)) {
					props.Properties[layer] = Object.assign({}, Properties[layer]);
				}
			}
			if (premultStruggle) {
				for (let type of Object.entries(premultStruggle)) {
					props.escapeChance[type[0]] = Math.round(10000*((props.escapeChance[type[0]] || 0) * type[1]))/10000;
				}
			}
			if (addStruggle) {
				for (let type of Object.entries(addStruggle)) {
					props.escapeChance[type[0]] = Math.round(10000*((props.escapeChance[type[0]] || 0) + type[1]))/10000;
				}
			}
			if (restraintType) {
				for (let ev of props.events) {
					if (ev.type == "slimeSpread") ev.restraint = restraintType;
				}
			}
			KinkyDungeonCloneRestraint(CopyOf + restraintPart, idSuffix + restraintPart, Object.assign(props, properties));
		}
	}
}

/**
 * Converts restraint tags to a copy that is also a list (in case data structure changes)
 * @param restraint
 * @returns {string[]}
 */
function KDGetRestraintTags(restraint: restraint): string[] {
	return [...restraint.shrine];
}

/**
 * @param item
 * @param name
 */
function KDItemDataQuery(item: item, name: string): any {
	if (item?.data) {
		return item.data[name];
	}
	return undefined;
}
/**
 * @param item
 * @param name
 * @param value
 */
function KDItemDataSet(item: item, name: string, value: number | string): void {
	if (!item.data) {
		item.data = {};
	}
	item.data[name] = value;
}

/**
 * Changes a restraint item's name
 * @param item
 * @param type - Restraint or LooseRestraint
 * @param name
 */
function KDChangeItemName(item: item, type: string, name: string) {
	if (item.name == name) return;
	if (KinkyDungeonInventory.get(type).get(item.name)) {
		KinkyDungeonInventory.get(type).set(name, item);
		KinkyDungeonInventory.get(type).delete(item.name);
	}
	item.name = name;
	KDUpdateItemEventCache = true;
}

/**
 * Gets the total curse power rating of the player
 * @param {boolean} activatedOnly
 */
function KDCurseCount(activatedOnly: boolean): number {
	let restraints = KinkyDungeonAllRestraintDynamic();
	let data: KDEventData_CurseCount = {
		restraints: restraints,
		activatedOnly: activatedOnly,
		count: 0,
	};
	KinkyDungeonSendEvent("curseCount", data);

	return data.count;
}

/**
 * @param player
 * @param requireSingleTag
 * @param requireAllTags
 * @param ignoregold
 * @param ignoreShrine
 * @param [forceIgnoreNonBinding]
 */
function KDGetTotalRestraintPower(_player: entity, requireSingleTag: string[], requireAllTags: string[], ignoregold: boolean, ignoreShrine: boolean, forceIgnoreNonBinding?: boolean): number {
	let power = 0;
	for (let inv of KinkyDungeonAllRestraintDynamic()) {
		let item = inv.item;
		let restraint = KDRestraint(item);
		if (requireSingleTag.length > 0) {
			if (!restraint.shrine || !requireSingleTag.some((tag) => {return restraint.shrine.includes(tag);})) {
				continue;
			}
		}
		if (requireAllTags.length > 0) {
			if (!restraint.shrine || requireAllTags.some((tag) => {return !restraint.shrine.includes(tag);})) {
				continue;
			}
		}
		if (!KinkyDungeonAllowTagMatch(item, ignoregold, ignoreShrine, forceIgnoreNonBinding)) {
			continue;
		}
		power += KinkyDungeonRestraintPower(item);
	}
	return power;
}

function KDGetEscapeSFX(restraint: Named) {
	if (KDRestraint(restraint).sfxEscape) return KDRestraint(restraint).sfxEscape;
	if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
		return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfxEscape;
	}
	return null;
}

function KDGetRestraintSFX(restraint: Named) {
	if (KDRestraint(restraint).sfx) return KDRestraint(restraint).sfx;
	if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
		return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfx;
	}
	return null;
}

function KDGetFinishEscapeSFX(restraint: Named) {
	if (KDRestraint(restraint).sfxFinishEscape) return KDRestraint(restraint).sfxFinishEscape;
	if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
		return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfxFinishEscape;
	}
	return null;
}
function KDGetRemoveSFX(restraint: Named) {
	if (KDRestraint(restraint).sfxRemove) return KDRestraint(restraint).sfxRemove;
	if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
		return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfxRemove;
	}
	return null;
}

/**
 * @param item
 * @param level
 */
function KDHasRemovableCurse(item: item, level: number): boolean {
	if (item.curse && KDCurses[item.curse] && KDCurses[item.curse].level <= level) {
		return true;
	}
	return false;
}

/**
 * @param item
 * @param level
 */
function KDHasRemovableHex(item: item, level: number): boolean {
	if (item.events && item.events.some((event) => {
		return event.trigger == "CurseTransform" && KDEventHexModular[event.original] && KDEventHexModular[event.original].level <= level;
	})) {
		return true;
	}
	return false;
}

/**
 * @param item
 * @param level
 * @returns {KinkyDungeonEvent[]}
 */
function KDGetRemovableHex(item: item, level: number): KinkyDungeonEvent[] {
	if (item.events) {
		return item.events.filter((event) => {
			return KDEventHexModular[event.original] && KDEventHexModular[event.original].level <= level; // event.trigger == "CurseTransform" &&
		});
	}
	return [];
}


let KDRestraintDebugLog = [];

/**
 * The name of an item, includes TextGet call
 * @param item
 */
function KDGetItemName(item: item, type?: string): string {
	let base = TextGet("KinkyDungeonInventoryItem" + item.name);
	let variant = null;
	switch(type || item.type) {
		case Restraint:
		case LooseRestraint:
			base = TextGet("Restraint" + KDRestraint(item).name);
			variant = KinkyDungeonRestraintVariants[item.inventoryVariant || item.name];
			break;
		case Consumable:
			base = TextGet("KinkyDungeonInventoryItem" + KDConsumable(item).name);
			variant = KinkyDungeonConsumableVariants[item.inventoryVariant || item.name];
			break;
		case Weapon:
			base = TextGet("KinkyDungeonInventoryItem" + KDWeapon(item).name);
			variant = KinkyDungeonWeaponVariants[item.inventoryVariant || item.name];
			break;
	}
	if (variant?.suffix) return base + " " + TextGet("KDVarSuff" + variant.suffix);
	if (variant?.prefix) return TextGet("KDVarPref" + variant.prefix) + " " + base;
	return base;
}

/**
 * @param restraint
 * @param [variant]
 */
function KDGetRestraintName(restraint: restraint, variant?: ApplyVariant): string {
	let base = TextGet("Restraint" + restraint.name);
	if (variant?.suffix) return base + " " + TextGet("KDVarSuff" + variant.suffix);
	if (variant?.prefix) return TextGet("KDVarPref" + variant.prefix) + " " + base;
	return base;
}
/**
 * @param consumable
 * @param [variant]
 */
function KDGetConsumableName(consumable: consumable, variant?: ApplyVariant): string {
	let base = TextGet("KinkyDungeonInventoryItem" + consumable.name);
	if (variant?.suffix) return base + " " + TextGet("KDVarSuff" + variant.suffix);
	if (variant?.prefix) return TextGet("KDVarPref" + variant.prefix) + " " + base;
	return base;
}
/**
 * @param weapon
 * @param [variant]
 */
function KDGetWeaponName(weapon: weapon, variant?: ApplyVariant): string {
	let base = TextGet("KinkyDungeonInventoryItem" + weapon.name);
	if (variant?.suffix) return base + " " + TextGet("KDVarSuff" + variant.suffix);
	if (variant?.prefix) return TextGet("KDVarPref" + variant.prefix) + " " + base;
	return base;
}

/**
 * @param name
 */
function KDGetItemNameString(name: string): string {
	let base = TextGet((KinkyDungeonGetRestraintByName(name) ? "Restraint" : "KinkyDungeonInventoryItem") + name);
	let variant = KinkyDungeonRestraintVariants[name] || KinkyDungeonWeaponVariants[name] || KinkyDungeonConsumableVariants[name];
	if (variant) {
		base = TextGet((KinkyDungeonGetRestraintByName(variant.template) ? "Restraint" : "KinkyDungeonInventoryItem") + variant.template);
	}
	if (variant?.suffix) return base + " " + TextGet("KDVarSuff" + variant.suffix);
	if (variant?.prefix) return TextGet("KDVarPref" + variant.prefix) + " " + base;
	return base;
}



function KDGetEventsForRestraint(name: string): KinkyDungeonEvent[] {
	if (!KDRestraint({name: name})) return [];
	if (KinkyDungeonRestraintVariants[name]) return Object.assign([], KinkyDungeonRestraintVariants[name].events);
	return Object.assign([], KDRestraint({name: name}).events || []);
}


/**
 * @param item
 * @param [includeItem] - Include 'item'
 */
function KDDynamicLinkList(item: item, includeItem?: boolean): item[] {
	let ret = [];
	if (includeItem) ret.push(item);
	if (item && item.dynamicLink) {
		let link = item.dynamicLink;
		while (link) {
			ret.push(link);
			link = link.dynamicLink;
		}
	}
	return ret;
}

/**
 * Returns a list of items on the 'surface' of a dynamic link, i.e items that can be accessed
 * @param item
 */
function KDDynamicLinkListSurface(item: item): item[] {
	// First we get the whole stack
	let stack = [];
	if (item && item.dynamicLink) {
		let last = item;
		let link = item.dynamicLink;
		while (link) {
			stack.push({item: link, host: last});
			last = link;
			link = link.dynamicLink;
		}
	}
	let ret = [item];
	let inaccess = false;
	// Now that we have the stack we sum things up
	for (let i = 0; i < stack.length; i++) {
		let tuple = stack[i];
		let inv = tuple.item;
		let host = tuple.host;
		if (!inaccess && KDRestraint(host).inaccessible) inaccess = true;
		if (!inaccess && KDRestraint(inv).alwaysInaccessible) inaccess = true;

		if ( KDRestraint(inv).alwaysAccessible || (
			!inaccess
			&&
			(
				KDRestraint(host).UnderlinkedAlwaysRender || KDRestraint(host).accessible || KDRestraint(inv).alwaysRender || (KDRestraint(inv).renderWhenLinked && KDRestraint(host).shrine && KDRestraint(inv).renderWhenLinked.some((link) => {return KDRestraint(host).shrine.includes(link);}))
			)
		)
		) {
			ret.push(inv);
		}
	}
	return ret;
}

/**
 * @param restraint
 * @param [index]
 */
function KDLinkSize(restraint: restraint, index?: number): number {
	if (index != undefined && restraint.linkSizes) {
		return restraint.linkSizes[index];
	}
	return restraint.linkSize ? restraint.linkSize : 1;
}

/**
 * @param item
 * @param linkCategory
 * @param [ignoreItem]
 * @param [power] - Ignore items with less power
 */
function KDLinkCategorySize(item: item, linkCategory: string, ignoreItem?: item, power?: number): number {
	let total = 0;
	// First we get the whole stack
	let stack = [item];
	if (item && item.dynamicLink) {
		let link = item.dynamicLink;
		while (link) {
			stack.push(link);
			link = link.dynamicLink;
		}
	}
	// Now that we have the stack we sum things up
	for (let inv of stack) {
		if (ignoreItem?.id != inv.id) {
			if (KDRestraint(inv).linkCategory == linkCategory) {
				if (!power || KinkyDungeonRestraintPower(inv, true, undefined) >= power)
					total += KDLinkSize(KDRestraint(inv));
			} else if (KDRestraint(inv).linkCategories && KDRestraint(inv).linkCategories.includes(linkCategory)) {
				if (!power || KinkyDungeonRestraintPower(inv, true, undefined) >= power)
					total += KDLinkSize(KDRestraint(inv), KDRestraint(inv).linkCategories.indexOf(linkCategory));
			}
		}

	}
	return total;
}

/**
 * @param item
 */
function KDGetRestraintHost(item: item): item {
	let host = KinkyDungeonGetRestraintItem(KDRestraint(item)?.Group);
	let link = item.dynamicLink;

	while (link) {
		if (link.id == item.id) return host;
		host = link;
		link = link.dynamicLink;
	}


	return host;
}


/**
 * @param e
 * @param item
 */
function KDLinkItemEvent(e: KinkyDungeonEvent, item: item, data: any): void {
	let added = false;
	if (data.restraintsAdded) {
		for (let r of data.restraintsAdded) {
			if (r.r.name === item.name) {
				added = true;
				break;
			}
		}
	}
	if (!added && (KDCanAddRestraint(KinkyDungeonGetRestraintByName(KDRestraint(item)?.Link), true, undefined, false, undefined, true, true))) {
		let subMult = 1;
		let chance = e.chance ? e.chance : 1.0;
		if (e.subMult !== undefined) {
			let rep = (KinkyDungeonGoddessRep.Ghost + 50) / 100;
			subMult = 1.0 + e.subMult * rep;
		}
		if (e.tags?.includes("lowwill") && KinkyDungeonStatWill < 0.1) chance = 1.0;
		if (item && KDRestraint(item).Link && (KDRandom() < chance * subMult) && (!e.noLeash || KDGameData.KinkyDungeonLeashedPlayer < 1)) {
			let newRestraint = KinkyDungeonGetRestraintByName(KDRestraint(item).Link);
			//KinkyDungeonLinkItem(newRestraint, item, item.tightness, "");
			if (KinkyDungeonAddRestraintIfWeaker(newRestraint, item.tightness, true, "", false, undefined, undefined, item.faction, true)) {
				if (KDSoundEnabled() && e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		}
	}
}

function KDGetRestriction(): number {
	let data = {
		restriction: 0
	};
	for (let inv of KinkyDungeonAllRestraintDynamic()) {
		let restraint = KDRestraint(inv.item);
		if (restraint) {
			if (restraint.restriction) data.restriction += restraint.restriction;
			if (restraint.blockfeet
				|| restraint.bindarms
				|| restraint.hobble
				|| restraint.freeze
			) data.restriction += 2;
			else if (
				restraint.bindhands
				|| restraint.blindfold
				|| restraint.gag
				|| restraint.restricthands
			) data.restriction += 1;
		}
	}

	KinkyDungeonSendEvent("restriction", data);

	return data.restriction;
}

/**
 * @param item
 * @param [Remover]
 */
function KDAlwaysKeep(item: item, Remover: entity): boolean {
	let rest = KDRestraint(item);
	let inventoryAs = item.inventoryVariant || (Remover?.player ? rest.inventoryAsSelf : rest.inventoryAs);
	return rest.enchanted
	|| rest.armor
	|| rest.alwaysKeep
	|| (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs] && !KinkyDungeonRestraintVariants[inventoryAs].noKeep);
}


/**
 * Re-sorts the restraint stack so that items are in LinkPriority order
 * @param Group
 * @param [addedItem]
 * @param [bypass]
 * @param [securityEnemy]
 */
function KDResortRestraints(Group: string, addedItem: item, bypass: boolean, securityEnemy: entity) {
	let item = KinkyDungeonGetRestraintItem(Group);
	if (item) {
		let pri = (inv: item) => {
			return ((KDRestraint(inv).linkPriority*1000) || KinkyDungeonRestraintPower(inv, true) || 0);
		};
		if (!addedItem) {
			// Simplest case, just sort the tree
			// Bubble sort is the best sorting algorithm
			let tree = KDDynamicLinkList(item, true);

			let host = tree[0];
			let temp = null;
			let n = tree.length;
			let swapped = false;
			for (let i = 0; i < n - 1; i++) {
				for (let j = 0; j < n - i - 1; j++) {
					tree[j+1].linkCache = undefined;
					if (pri(tree[j]) < pri(tree[j+1])) {
						if (KDCanLinkUnder(tree[j+1], KDRestraint(tree[j]),
							bypass, false, securityEnemy, tree[j].lock, KDGetCurse(tree[j]), tree[j])) {
							// Swap
							tree[j].dynamicLink = tree[j+1].dynamicLink;
							tree[j+1].dynamicLink = tree[j];
							temp = tree[j];
							tree[j] = tree[j+1];
							tree[j+1] = temp;
							swapped = true;
						}
					}

				}
				if (!swapped) {
					break;
				}
			}


			// Fix the links
			host = tree[0];
			for (let iii = 0; iii < n; iii++) {
				if (iii + 1 < n)
					tree[iii].dynamicLink = tree[iii + 1];
				else tree[iii].dynamicLink = undefined;
			}
			KinkyDungeonInventoryRemove(item);
			KinkyDungeonInventoryAdd(host);
		} else if (addedItem) {
			// Next simplest case, we move the added item in the position that makes the most sense
			if (bypass) {
				// Case where the security enemy had access
			} else {
				// Case where the security enemy did not have ability to do it
			}
		} else {
			// Complex case, do a 'bubble sort' logic which is slow, but takes into account accessibility
		}
	}
	// No item, no sort
}

/**
 * @param player
 */
function KDLockoutChance(player: entity): number {
	let data = {
		chance: 0,
		bonus: 0,
		player: player,
	};
	if (player.player) {
		data.chance = KDGameData.LockoutChance || 0;
		KinkyDungeonSendEvent("calcLockout", data);
		data.chance += data.bonus;
		return data.chance;
	}
	return 1.0;
}



/**
 * @param player
 * @param data
 * @param [base]
 */
function KDLockoutGain(player: entity, data: any, base: number = 20): void {
	data.lockoutgain = 0.75 * base * 0.01 + 0.01 * Math.round(KDRandom() * 0.5 * base);
	if (player.player) {
		KinkyDungeonSendEvent("calcLockoutGain", data);
	}
}


function KDMaxCutDepth(threshold: number, cutBonus: number, origEscapeChance: number, origLimitChance: number): number {
	return Math.min(1.4 * threshold, Math.max(0, Math.min(
		1.1,
		2.0 * (0.25 + cutBonus + origEscapeChance -
			Math.max(0, origLimitChance)
		))));
}


function KDGetNecklaceGagType(player: entity) {
	if (player.player) {
		if (KinkyDungeonGetRestraintItem("ItemNeck")) {
			let list = KDDynamicLinkList(KinkyDungeonGetRestraintItem("ItemNeck"), true);
			for (let item of list) {
				if (KDRestraint(item)?.necklaceGagType) return KDRestraint(item)?.necklaceGagType;
			}
		}
	} else if (KDGameData.NPCRestraints[player.id + ""]) {
		let items = KDGetNPCRestraints(player.id);
		for (let slot of NPCBindingNeckSlots) {
			if (items[slot]) {
				if (KDRestraint(items[slot])?.necklaceGagType) return KDRestraint(items[slot])?.necklaceGagType;
			}
		}
	}

	return "";
}
