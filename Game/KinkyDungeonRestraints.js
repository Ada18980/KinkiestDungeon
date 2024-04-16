"use strict";
// Escape chances
// Struggle : How difficult it is to struggle out of the item. Shouldn't be below 0.1 as that would be too tedious. Negative values help protect against spells.
// Cut : How difficult it is to cut with a knife. Metal items should have 0, rope and leather should be low but possible, and stuff like tape should be high
// Remove : How difficult it is to get it off by unbuckling. Most items should have a high chance if they have buckles, medium chance if they have knots, and low chance if they have a difficult mechanism.
// Pick : How hard it is to pick the lock on the item. Higher level items have more powerful locks. The general formula is 0.33 for easy items, 0.1 for medium items, 0.05 for hard items, and 0.01 for super punishing items
// Unlock : How hard it is to reach the lock. Should be higher than the pick chance, and based on accessibility. Items like the

// Note that there is a complex formula for how the chances are manipulated based on whether your arms are bound. Items that bind the arms are generally unaffected, and items that bind the hands are unaffected, but they do affect each other

// Power is a scale of how powerful the restraint is supposed to be. It should roughly match the difficulty of the item, but can be higher for special items. Power 10 or higher might be totally impossible to struggle out of.

// These are groups that the game is not allowed to remove because they were tied at the beginning
let KinkyDungeonRestraintsLocked = [];

let KDWillEscapePenalty = 0.25;
let KDWillEscapePenaltyArms = 0.1;
let KDWillEscapePenaltyStart = 0.0;
let KDWillEscapePenaltyStartArms = 0.0;
let KDWillEscapePenaltyEnd = 0.0;

let KDMinEscapeRate = 0.4;
let KDMinPickRate = 0.2;
let KDStruggleTime = 3;
let KDBaseEscapeSpeed = 2.0;

/** Thresholds for hand bondage */
let StruggleTypeHandThresh = {
	Struggle: 0.01, // Any hand bondage will affect struggling
	Unlock: 0.7, // Unlocking requires a bit of dexterity
	Pick: 0.45, // Picking requires dexterity
	Cut: 0.7, // Cutting requires a bit of dexterity
	Remove: 0.8, // Removing only requires a solid corner
};


let KDRestraintArchetypes = ["Rope", "Latex", "Ribbon", "Leather", "Cyber", "Metal", "Armbinders", "Boxbinders", "Straitjackets", "Legbinders"];


/**
 * @type {Record<string, (data : KDEventData_affinity) => boolean>}
 */
let KDCustomAffinity = {
	Wall: (data) => {
		// Intentionally only a + shape
		if (KDNearbyMapTiles(data.entity.x, data.entity.y, 1.1)?.some((tile) => {return KinkyDungeonBlockTiles.includes(tile.tile);})) return true;
		return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
	},
	HookOrFoot: (data) => {
		if (KinkyDungeonCanUseFeetLoose()) {
			if (data.Message) {
				KinkyDungeonSendTextMessage(7, TextGet("KDUseFootAffinity"), "lightgreen", 2);
			}
			return true;
		}
		return KinkyDungeonGetAffinity(data.Message, "Hook", data.group);
	},
	Tug: (data) => {
		if (KinkyDungeonFlags.get("leashtug")) {
			if (data.Message) {
				KinkyDungeonSendTextMessage(7, TextGet("KDUseTugAffinity"), "lightgreen", 2);
			}
			return true;
		}
		return false;
	},
	SharpHookOrFoot: (data) => {
		if (!KinkyDungeonGetAffinity(data.Message, "Sharp", data.group)) return false;
		if (KinkyDungeonCanUseFeetLoose()) {
			if (data.Message) {
				KinkyDungeonSendTextMessage(7, TextGet("KDUseFootAffinity"), "lightgreen", 2);
			}
			return true;
		}
		return KinkyDungeonGetAffinity(data.Message, "Hook", data.group);
	},
	SharpTug: (data) => {
		if (!KinkyDungeonGetAffinity(data.Message, "Sharp", data.group)) return false;
		if (KinkyDungeonFlags.get("leashtug")) {
			if (data.Message) {
				KinkyDungeonSendTextMessage(7, TextGet("KDUseTugAffinity"), "lightgreen", 2);
			}
			return true;
		}
		return false;
	},
};

function KDGetTightnessEffect(escapeChance, struggleType, T = 0) {
	let mult = (struggleType == "Cut" || struggleType == "Remove") ? 0.5 : 1.0;
	let x1 = 1 - 0.1 * mult;
	let x2 = escapeChance > 0 ? (escapeChance - 0.03 * mult) / escapeChance : 0;
	let val = Math.max(x1, Math.min(x2, 1 - 0.05 * mult));
	val = 1 - (1 - val) * (100/(100 + T));
	return val;
}

/**
 * Returns the multiplier of a restraint based on the player's current restraint counts
 * @param {entity} player
 * @param {restraint} restraint
 * @param {string[]} augmentedInventory
 * @returns {number} - multiplier for apparent power
 */
function KDRestraintPowerMult(player, restraint, augmentedInventory) {
	if (player != KinkyDungeonPlayerEntity) return 1;
	if (!restraint) return 1;
	let keyProperties = restraint.shrine.filter((element) => {return KDRestraintArchetypes.includes(element);});
	let relatedRestraints = [];
	let opposedRestraints = [];
	let mult = 1.0;
	for (let r of KinkyDungeonAllRestraint()) {
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

/**
 *
 * @returns {number}
 */
function KDGetWillPenalty() {
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
	return scale * max;
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
let KDInflexibleMult = 0.5;
let KDInflexibleSpeedBonus = 0.75;

let KDUnchainedBonus = 0.12;
let KDDamselBonus = -0.2;
let KDDamselPickAmount = 6;
let KDArtistBonus = 0.15;
let KDBunnyBonus = -0.2;
let KDBunnyKnifeAmount = 5;
let KDBunnyEnchKnifeAmount = 12;
let KDSlipperyBonus = 0.15;
let KDDollBonus = -0.2;
let KDEscapeeBonus = 0.12;
let KDDragonBonus = -0.2;

let KDStrongBonus = 0.075;
let KDWeakBonus = -0.1;

let KDBondageLoverAmount = 1;

/**
 * @type {Map<string, restraint>}
 */
let KinkyDungeonRestraintsCache = new Map();

/**
 * gets a restraint
 * @param {Named} item
 * @returns {restraint}
 */
function KDRestraint(item) {
	if (KinkyDungeonRestraintVariants[item.name]) return KinkyDungeonRestraintsCache.get(KinkyDungeonRestraintVariants[item.name].template);
	return KinkyDungeonRestraintsCache.get(item.name);
}

/**
 * gets a restraint
 * @param {Named} item
 * @returns {string}
 */
function KDRestraintBondageType(item) {
	let r = KDRestraint(item);
	if (r) {
		let data = {
			item: item,
			restraint: r,
			type: "",
			override: undefined,
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
 * gets a restraint
 * @param {Named} item
 * @returns {KDBondageStatus}
 */
function KDRestraintBondageStatus(item) {
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
				toy: 0,
				plug: 0,
				belt: 0,
			},
			override: undefined,
			overridePriority: 0,
		};
		// Stock methodology
		let powerMult = Math.max(1, Math.max(r.power))**0.75;
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
		if (r.bindarms || r.bindhands) {
			data.status.disarm = Math.ceil(powerMult * Math.max(r.bindarms ? 0.3 : 0, r.bindhands || 0.1));
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
		toy: 0,
		plug: 0,
		belt: 0,
	};
}

/**
 * gets a restraint
 * @param {item} item
 * @returns {boolean}
 */
function KDItemIsMagic(item) {
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
KDProgressiveOrder.Strict = [
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
KDProgressiveOrder.Fun1 = [
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
KDProgressiveOrder.Fun2 = [
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
KDProgressiveOrder.Fun3 = [
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

/**
 * @type {Map<string, {r: restraint, w:number}[]>}
 */
let KDRestraintsCache = new Map();

let KDTetherGraphics = new PIXI.Graphics;
KDTetherGraphics.zIndex = 2;
let KDGameBoardAddedTethers = false;

/**
 *
 * @param {entity} Entity
 * @param {number} CamX
 * @param {number} CamY
 * @returns {void}
 */
function KinkyDungeonDrawTethers(Entity, CamX, CamY) {
	KDTetherGraphics.clear();
	if (!KDGameBoardAddedTethers) {
		kdgameboard.addChild(KDTetherGraphics);
		KDGameBoardAddedTethers = true;
	}


	for (let inv of KinkyDungeonAllRestraint()) {
		if (inv && KDRestraint(inv).tether && inv.tx && inv.ty) {
			let vx = inv.tx;
			let vy = inv.ty;
			if (inv.tetherToLeasher && KinkyDungeonLeashingEnemy()) {
				vx = KinkyDungeonLeashingEnemy().visual_x;
				vy = KinkyDungeonLeashingEnemy().visual_y;
			}
			if (inv.tetherToGuard && KinkyDungeonJailGuard()) {
				vx = KinkyDungeonJailGuard().visual_x;
				vy = KinkyDungeonJailGuard().visual_y;
			}

			//let dist = KDistEuclidean(inv.tx - Entity.visual_x, inv.ty - Entity.visual_y);
			let xx = canvasOffsetX + (Entity.visual_x - CamX)*KinkyDungeonGridSizeDisplay;
			let yy = canvasOffsetY + (Entity.visual_y - CamY)*KinkyDungeonGridSizeDisplay;
			let txx = canvasOffsetX + (vx - CamX)*KinkyDungeonGridSizeDisplay;
			let tyy = canvasOffsetY + (vy - CamY)*KinkyDungeonGridSizeDisplay;
			let dx = (txx - xx);
			let dy = (tyy - yy);
			let dd = 0.1; // Increments
			let color = KDRestraint(inv).Color[0]?.length > 3 ? KDRestraint(inv).Color[0] : KDRestraint(inv).Color;
			if (!color || color == "Default") color = "#aaaaaa";
			if (Array.isArray(color)) color = color[0];
			KDTetherGraphics.lineStyle(4, string2hex(color), 1);
			for (let d = 0; d < 1; d += dd) {
				let yOffset = 30 * Math.sin(Math.PI * d);
				let yOffset2 = 30 * Math.sin(Math.PI * (d + dd));
				KDTetherGraphics.moveTo(KinkyDungeonGridSizeDisplay/2 + xx + dx*d, KinkyDungeonGridSizeDisplay*0.8 + yOffset + yy + dy*d);
				KDTetherGraphics.lineTo(KinkyDungeonGridSizeDisplay/2 + xx + dx*(d+dd), KinkyDungeonGridSizeDisplay*0.8 + yOffset2 + yy + dy*(d+dd));
			}
			return;
		}
	}
}


function KDIsPlayerTethered(player) {
	if (!player?.player) return false;
	let inv = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
	if (inv && KDRestraint(inv).tether && (inv.tx || inv.ty)) {
		return true;
	}
	let found = KinkyDungeonFindID(KDGameData.KinkyDungeonLeashingEnemy);
	if (!found) KDGameData.KinkyDungeonLeashingEnemy = 0;
	return KDGameData.KinkyDungeonLeashedPlayer > 0;
}

function KinkyDungeonAttachTetherToEntity(dist, entity) {
	let inv = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
	if (inv && KDRestraint(inv).tether) {
		let newLeash = inv.tetherEntity != entity.id;
		inv.tetherEntity = entity.id;
		KDGameData.KinkyDungeonLeashingEnemy = entity.id;
		if (dist) inv.tetherLength = dist;
		return newLeash;
	}
	return false;
}

/**
 *
 * @param {entity} player
 * @param {number} x
 * @param {number} y
 * @param {entity} entity
 */
function KDIsPlayerTetheredToLocation(player, x, y, entity) {
	if (!player.player) return false;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).tether && (inv.tx && inv.ty || inv.tetherToLeasher || inv.tetherToGuard || inv.tetherEntity)) {
			if (inv.tx == x && inv.ty == y) return true;
			if (entity && inv.tetherEntity && inv.tetherEntity == entity.id) return true;
		}
	}
	return false;
}
/**
 *
 * @param {entity} player
 * @param {entity} [entity]
 */
function KDIsPlayerTetheredToEntity(player, entity) {
	if (!player.player) return false;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).tether && (inv.tx && inv.ty || inv.tetherToLeasher || inv.tetherToGuard || inv.tetherEntity)) {
			if (entity && inv.tetherEntity && inv.tetherEntity == entity.id) return true;
			if (!entity && inv.tetherEntity && KinkyDungeonFindID(inv.tetherEntity)) return true;
		}
	}
	return false;
}


/**
 *
 * @param {entity} player
 * @returns {number}
 */
function KDGetTetherEntity(player) {
	if (!player.player) return -1;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).tether && (inv.tetherEntity)) {
			if (inv.tetherEntity) return inv.tetherEntity;
		}
	}
	return -1;
}

/**
 *
 * @param {entity} [player]
 */
function KDBreakTether(player) {
	if (player == KinkyDungeonPlayerEntity) {
		for (let pair of KinkyDungeonAllRestraintDynamic()) {
			let inv = pair.item;
			if (inv && KDRestraint(inv).tether) {
				inv.tetherToLeasher = false;
				inv.tetherToGuard = false;
				inv.tetherEntity = undefined;
				inv.tx = undefined;
				inv.ty = undefined;
			}
		}
	}

}

let KDLeashPullCost = 0.5;
let KDLeashPullKneelTime = 5;

/**
 *
 * @param {boolean} Msg
 * @param {entity} Entity
 * @param {number} [xTo]
 * @param {number} [yTo]
 * @returns {boolean}
 */
function KinkyDungeonUpdateTether(Msg, Entity, xTo, yTo) {
	if (Entity.player && KinkyDungeonFlags.get("pulled")) return false;
	else if (KDEnemyHasFlag(Entity, "pulled")) return false;
	let exceeded = false;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).tether && (inv.tx && inv.ty || inv.tetherToLeasher || inv.tetherToGuard || inv.tetherEntity)) {
			let tether = inv.tetherLength ? inv.tetherLength : KDRestraint(inv).tether;

			if (inv.tetherToLeasher && KinkyDungeonLeashingEnemy() && !KinkyDungeonIsDisabled(KinkyDungeonLeashingEnemy())) {
				inv.tx = KinkyDungeonLeashingEnemy().x;
				inv.ty = KinkyDungeonLeashingEnemy().y;
			} else if (inv.tetherToLeasher && !KinkyDungeonLeashingEnemy()) {
				inv.tetherToLeasher = undefined;
				inv.tx = undefined;
				inv.ty = undefined;
			}
			if (inv.tetherToGuard && KinkyDungeonJailGuard() && !KinkyDungeonIsDisabled(KinkyDungeonJailGuard())) {
				inv.tx = KinkyDungeonJailGuard().x;
				inv.ty = KinkyDungeonJailGuard().y;
			} else if (inv.tetherToGuard && !KinkyDungeonJailGuard()) {
				inv.tetherToGuard = undefined;
				inv.tx = undefined;
				inv.ty = undefined;
			}
			if (inv.tetherEntity && KinkyDungeonFindID(inv.tetherEntity) && !KinkyDungeonIsDisabled(KinkyDungeonFindID(inv.tetherEntity))) {
				inv.tx = KinkyDungeonFindID(inv.tetherEntity).x;
				inv.ty = KinkyDungeonFindID(inv.tetherEntity).y;
			} else if (inv.tetherEntity) {
				inv.tetherEntity = undefined;
				inv.tx = undefined;
				inv.ty = undefined;
			}

			if (inv.tx && inv.ty) KDGameData.KinkyDungeonLeashedPlayer = Math.max(KDGameData.KinkyDungeonLeashedPlayer, 5);

			if (xTo || yTo) {// This means we arre trying to move
				let pathToTether = KinkyDungeonFindPath(xTo, yTo, inv.tx, inv.ty, false, !Entity.player, false, KinkyDungeonMovableTilesSmartEnemy);
				let playerDist = Math.max(pathToTether?.length || 0, KDistChebyshev(xTo-inv.tx, yTo-inv.ty));
				// Fallback
				if (playerDist > KDRestraint(inv).tether && KDistEuclidean(xTo-inv.tx, yTo-inv.ty) > KDistEuclidean(Entity.x-inv.tx, Entity.y-inv.ty)) {
					if (Msg) KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonTetherTooShort").replace("TETHER", TextGet("Restraint" + inv.name)), "#ff0000", 2, true);
					if (KinkyDungeonCanStand() && !KDForcedToGround()) {
						KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns, KDLeashPullKneelTime + KDGameData.SlowMoveTurns);
						KinkyDungeonChangeWill(-KDLeashPullCost, false);
					}
					//return true;
					if (Entity.player) KinkyDungeonSetFlag("leashtug", 3);
					else KinkyDungeonSetEnemyFlag(Entity, "leashtug", 3);
					exceeded = true;
				}
			}
			for (let i = 0; i < 10; i++) {
				// Distance is in pathing units
				let pathToTether = KinkyDungeonFindPath(Entity.x, Entity.y, inv.tx, inv.ty, false, !Entity.player, false, KinkyDungeonMovableTilesSmartEnemy);
				let playerDist = pathToTether?.length;
				// Fallback
				if (!pathToTether) playerDist = KDistChebyshev(Entity.x-inv.tx, Entity.y-inv.ty);
				if (playerDist > tether) {
					let slot = null;
					if (pathToTether
						&& pathToTether?.length > 0
						&& (
							KDistEuclidean(pathToTether[0].x - inv.tx, pathToTether[0].y - inv.ty) > -0.01 + KDistEuclidean(Entity.x - inv.tx, Entity.y - inv.ty)
							|| KinkyDungeonFindPath(pathToTether[0].x, pathToTether[0].y, inv.tx, inv.ty, false, !Entity.player, false, KinkyDungeonMovableTilesSmartEnemy)?.length < pathToTether.length
						) && KDistChebyshev(pathToTether[0].x - Entity.x, pathToTether[0].y - Entity.y) < 1.5)
						slot = pathToTether[0];
					if (!slot) {
						let mindist = playerDist;
						for (let X = Entity.x-1; X <= Entity.x+1; X++) {
							for (let Y = Entity.y-1; Y <= Entity.y+1; Y++) {
								if ((X !=  Entity.x || Y != Entity.y) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y)) && KDistEuclidean(X-inv.tx, Y-inv.ty) < mindist) {
									mindist = KDistEuclidean(X-inv.tx, Y-inv.ty);
									slot = {x:X, y:Y};
								}
							}
						}
					}
					if (!slot) { //Fallback
						slot = {x:inv.tx, y:inv.ty};
					}
					if (slot) {
						let enemy = KinkyDungeonEnemyAt(slot.x, slot.y);
						if (enemy) {
							let slot2 = null;
							let mindist2 = playerDist;
							for (let X = enemy.x-1; X <= enemy.x+1; X++) {
								for (let Y = enemy.y-1; Y <= enemy.y+1; Y++) {
									if ((X !=  enemy.x || Y != enemy.y) && !KinkyDungeonEntityAt(slot.x, slot.y) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y)) && KDistEuclidean(X-Entity.x, Y-Entity.y) < mindist2) {
										mindist2 = KDistEuclidean(X-Entity.x, Y-Entity.y);
										slot2 = {x:X, y:Y};
									}
								}
							}
							if (slot2) {
								KDMoveEntity(enemy, slot2.x, slot2.y, false);
							} else {
								let pointSwap = KinkyDungeonGetNearbyPoint(slot.x, slot.y, true, undefined, true, true);
								if (pointSwap)
									KDMoveEntity(enemy, pointSwap.x, pointSwap.y, false, undefined, undefined, true);
								else
									KDMoveEntity(enemy, Entity.x, Entity.y, false,undefined, undefined, true);
							}
						}
						// Force open door
						if (KinkyDungeonMapGet(slot.x, slot.y) == 'D') KinkyDungeonMapSet(slot.x, slot.y, 'd');

						if (Entity.player) {
							KDMovePlayer(slot.x, slot.y, false, undefined, undefined);
						} else {
							KDMoveEntity(Entity, slot.x, slot.y, false, undefined, undefined, true);
						}
						if (Entity.player) KinkyDungeonSetFlag("pulled", 1);
						else KinkyDungeonSetEnemyFlag(Entity, "pulled", 1);
						if (Entity.player) KinkyDungeonSetFlag("leashtug", 3);
						else KinkyDungeonSetEnemyFlag(Entity, "leashtug", 3);
						if (Entity.player) {
							KinkyDungeonInterruptSleep();
							KinkyDungeonSendEvent("leashTug", {Entity: Entity, slot: slot, item: inv});
							if (KinkyDungeonLeashingEnemy()) {
								KinkyDungeonSetEnemyFlag(KinkyDungeonLeashingEnemy(), "harshpull", 5);
							}
							if (Msg) KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonTetherPull").replace("TETHER", TextGet("Restraint" + inv.name)), "#ff0000", 2, true);
							exceeded = true;
						}

					}
				}
			}
		}
	}

	return exceeded;
}


/**
 * Gets the length of the neck tether
 * @returns {number}
 */
function KinkyDungeonTetherLength() {
	let inv = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
	if (inv && KDRestraint(inv).tether && inv.tx && inv.ty) {
		return KDRestraint(inv).tether;
	}
	return undefined;
}

/**
 *
 * @param {number} [modifier]
 * @returns {number}
 */
function KinkyDungeonKeyGetPickBreakChance(modifier) {
	let mult = (modifier) ? modifier : 1.0;
	let chance = 0;

	KinkyDungeonPickBreakProgress += mult;

	if (KinkyDungeonPickBreakProgress > KinkyDungeonKeyPickBreakAmount/1.5) chance = (KinkyDungeonPickBreakProgress - KinkyDungeonKeyPickBreakAmount/1.5) / (KinkyDungeonKeyPickBreakAmount + 1);

	return chance;
}

/**
 *
 * @param {number} [modifier]
 * @returns {number}
 */
function KinkyDungeonGetKnifeBreakChance(modifier) {
	let mult = (modifier) ? modifier : 1.0;
	let chance = 0;

	KinkyDungeonKnifeBreakProgress += mult;

	if (KinkyDungeonKnifeBreakProgress > KinkyDungeonKnifeBreakAmount/1.5) chance = (KinkyDungeonKnifeBreakProgress - KinkyDungeonKnifeBreakAmount/1.5) / (KinkyDungeonKnifeBreakAmount + 1);

	return chance;
}

/**
 *
 * @param {number} [modifier]
 * @returns {number}
 */
function KinkyDungeonGetEnchKnifeBreakChance(modifier) {
	let mult = (modifier) ? modifier : 1.0;
	let chance = 0;

	KinkyDungeonEnchKnifeBreakProgress += mult;

	if (KinkyDungeonEnchKnifeBreakProgress > KinkyDungeonEnchKnifeBreakAmount/1.5) chance = (KinkyDungeonEnchKnifeBreakProgress - KinkyDungeonEnchKnifeBreakAmount/1.5) / (KinkyDungeonEnchKnifeBreakAmount + 1);

	return chance;
}

/**
 *
 * @param {restraint} restraint
 * @returns {boolean}
 */
function KinkyDungeonIsLockable(restraint) {
	if (restraint && restraint.escapeChance && (restraint.escapeChance.Pick != undefined || restraint.escapeChance.Unlock != undefined)) return true;
	return false;
}

/**
 *
 * @param {item} item
 * @param {string} lock
 * @param {boolean} NoEvent
 */
function KinkyDungeonLock(item, lock, NoEvent = false, Link = false) {
	KDUpdateItemEventCache = true;
	if (lock != "") {
		if (KinkyDungeonIsLockable(KDRestraint(item))) {
			if (KDLocks[lock] && KDLocks[lock].doLock) KDLocks[lock].doLock({item: item, link: Link});
			item.lock = lock;

			if (!StandalonePatched)
				InventoryLock(KinkyDungeonPlayer, InventoryGet(KinkyDungeonPlayer, KDRestraint(item).AssetGroup ? KDRestraint(item).AssetGroup : KDRestraint(item).Group), "IntricatePadlock", Player.MemberNumber, true);
			item.pickProgress = 0;
		}
	} else {
		if (KDLocks[lock] && KDLocks[lock].doUnlock) KDLocks[lock].doUnlock({item: item, link: Link});
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

		InventoryUnlock(KinkyDungeonPlayer,  KDRestraint(item).AssetGroup ? KDRestraint(item).AssetGroup : KDRestraint(item).Group);
		if (!KinkyDungeonRestraintsLocked.includes( KDRestraint(item).AssetGroup ? KDRestraint(item).AssetGroup : KDRestraint(item).Group))
			InventoryUnlock(Player, KDRestraint(item).AssetGroup ? KDRestraint(item).AssetGroup : KDRestraint(item).Group);
	}

}

/**
 * Gets the curse of an item, ither intrinsic or applied
 * @param {item} item
 * @returns {string}
 */
function KDGetCurse(item) {
	return item?.curse || KDRestraint(item)?.curse;
}

/**
 *
 * @param {string} shrine
 * @returns {item[]}
 */
function KinkyDungeonGetRestraintsWithShrine(shrine, ignoreGold, recursive, ignoreShrine) {
	/**
	 * @type {item[]}
	 */
	let ret = [];

	for (let item of KinkyDungeonAllRestraint()) {
		if (((!KDRestraint(item).noShrine && (!KDGetCurse(item) || !KDCurses[KDGetCurse(item)].noShrine)) || ignoreShrine) && KDRestraint(item).shrine && KDRestraint(item).shrine.includes(shrine) && (ignoreGold || !KDLocks[item.lock]?.shrineImmune)) {
			ret.push(item);
		}
		if (recursive) {
			let link = item.dynamicLink;
			while (link) {
				if (((!KDRestraint(link).noShrine && (!KDGetCurse(link) || !KDCurses[KDGetCurse(link)].noShrine)) || ignoreShrine) && KDRestraint(link).shrine && KDRestraint(link).shrine.includes(shrine) && (ignoreGold || !KDLocks[link.lock]?.shrineImmune)) {
					ret.push(link);
				}
				link = link.dynamicLink;
			}
		}
	}

	return ret;
}

/**
 *
 * @param {string} shrine
 * @returns {number}
 */
function KinkyDungeonRemoveRestraintsWithShrine(shrine, maxCount, recursive, noPlayer, ignoreGold, ignoreShrine, Keep) {
	let count = 0;

	for (let i = 0; i < (maxCount ? maxCount : 100); i++) {
		/**
		 * @type {item[]}
		 */
		let items = KinkyDungeonAllRestraint().filter((r) => {return ((!KDRestraint(r).noShrine && (!KDGetCurse(r) || !KDCurses[KDGetCurse(r)].noShrine)) || ignoreShrine) && KDRestraint(r).shrine && KDRestraint(r).shrine.includes(shrine) && (ignoreGold || !KDLocks[r.lock]?.shrineImmune);});
		// Get the most powerful item
		let item = items.length > 0 ? items.reduce((prev, current) => (KinkyDungeonRestraintPower(prev, true) > KinkyDungeonRestraintPower(current, true)) ? prev : current) : null;
		if (item) {
			if (item.curse && KDCurses[item.curse]) {
				KDCurses[item.curse].remove(item, KDGetRestraintHost(item));
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
			items = KinkyDungeonGetRestraintsWithShrine(shrine, ignoreGold, true);

			// Get the most powerful item
			item = items.length > 0 ? items.reduce((prev, current) => (KinkyDungeonRestraintPower(prev, true) > KinkyDungeonRestraintPower(current, true)) ? prev : current) : null;
			if (item) {
				let groupItem = KinkyDungeonGetRestraintItem(KDRestraint(item).Group);
				if (groupItem == item) {
					if (item.curse && KDCurses[item.curse]) {
						KDCurses[item.curse].remove(item, KDGetRestraintHost(item));
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
								KDCurses[item.curse].remove(item, KDGetRestraintHost(item));
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
 *
 * @param {item} item
 */
function KDRemoveThisItem(item, Keep, NoEvent, Shrine, Remover) {
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
 *
 * @param {string} name
 * @returns {number}
 */
function KinkyDungeonRemoveRestraintsWithName(name) {
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
 *
 * @param {string} shrine
 * @returns {number}
 */
function KinkyDungeonUnlockRestraintsWithShrine(shrine) {
	let count = 0;

	for (let item of KinkyDungeonAllRestraint()) {
		if (item.lock && !KDRestraint(item).noShrine && (!KDGetCurse(item) || !KDCurses[KDGetCurse(item)].noShrine) && KDRestraint(item).shrine && KDRestraint(item).shrine.includes(shrine) && KDLocks[item.lock] && !KDLocks[item.lock]?.shrineImmune) {

			KinkyDungeonLock(item, "");
			count++;
		}
	}

	return count;
}

/**
 *
 * @returns {item[]}
 */
function KinkyDungeonPlayerGetLockableRestraints() {
	/**
	 * @type {item[]}
	 */
	let ret = [];

	for (let item of KinkyDungeonAllRestraint()) {
		if (!item.lock && !KDGetCurse(item) && KDRestraint(item).escapeChance && KDRestraint(item).escapeChance.Pick != undefined) {
			ret.push(item);
		}
	}

	return ret;
}

/**
 * @param {string[]} Locks
 * @returns {item[]}
 */
function KinkyDungeonPlayerGetRestraintsWithLocks(Locks, recursive) {
	/**
	 * @type {item[]}
	 */
	let ret = [];

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
 *
 * @param {string} lock
 */
function KinkyDungeonRemoveKeysUnlock(lock) {
	if (KDLocks[lock]) KDLocks[lock].removeKeys({unlock: true});
}
/**
 *
 * @param {string} lock
 * @param {string} keytype
 */
function KinkyDungeonRemoveKeysDropped(lock, keytype) {
	if (KDLocks[lock]) KDLocks[lock].removeKeys({dropped: true, keytype: keytype});
}


/**
 *
 * @param {string} lock
 * @returns {string}
 */
function KinkyDungeonGetKey(lock) {
	if (KDLocks[lock]) return KDLocks[lock].key;
	return "";
}

/**
 *
 * @returns {boolean}
 */
function KinkyDungeonHasGhostHelp() {
	return ((KinkyDungeonTargetTile && ((KinkyDungeonTargetTile.Type == "Ghost" && KinkyDungeonTargetTile.GhostDecision <= 0) || KinkyDungeonTargetTile.Type == "Angel")));
}

function KinkyDungeonHasHelp() {
	return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp() || KinkyDungeonHasAngelHelp();
}


/**
 *
 * @returns {boolean}
 */
function KinkyDungeonHasAllyHelp() {
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
/**
 *
 * @returns {boolean}
 */
function KinkyDungeonHasAngelHelp() {
	return (KinkyDungeonTargetTile && KinkyDungeonTargetTile.Type == "Angel");
}

/**
 *
 * @returns {boolean}
 */
function KinkyDungeonIsWearingLeash() {
	for (let restraint of KinkyDungeonAllRestraint()) {
		if (KDRestraint(restraint) && KDRestraint(restraint).leash) {
			return true;
		}
	}
	return false;
}

let KDAffinityList = ["Hook", "Edge", "Sticky", "Sharp"];

/**
 *
 * @param {boolean} Message - Show a message?
 * @param {string} affinity
 * @param {string} [group]
 * @param {entity} [entity]
 * @returns {boolean}
 */
function KinkyDungeonGetAffinity(Message, affinity, group, entity) {
	if (!entity) entity = KinkyDungeonPlayerEntity;
	/**
	 * @param {KDEventData_affinity} data
	*/
	let data = {
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
			else if (Message && !data.msgedStand && (!data.canStand || !data.groupIsHigh) && t.affinitiesStanding && t.affinitiesStanding.includes(affinity)) {
				data.msgedStand = true;
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonHookHighFail"), "#ff0000", 2);
			}
		}
	if (KDCustomAffinity[data.affinity]) {
		return KDCustomAffinity[data.affinity](data);
	} if (affinity == "Hook") {
		let tile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
		if (tile == '?') {
			if (data.canStand && data.groupIsHigh) return true;
			else if (!data.msgedStand && Message) KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonHookHighFail"), "#ff0000", 2);
		} else if (KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y - 1) == ',') return true;
		return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
	} else if (affinity == "Edge") {
		for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++) {
			for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
				let tile = KinkyDungeonMapGet(X, Y);
				if (KDCornerTiles[tile]) {
					return true;
				} else if (tile == 'C' && Message) {
					KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedOpenChest"), "#ff0000", 2, true);
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
				KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonScrapUse"), "lightgreen", 2);
			return true;
		}
		for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++) {
			for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
				let tile2 = KinkyDungeonMapGet(X, Y);
				if (tile2 == '-'
					|| tile == 'a') {
					if (Message)
						KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonScrapObjectUse"), "lightgreen", 2);
					return true;
				}
			}
		}
		return false;
	}
	return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
}

function KinkyDungeonWallCrackAndKnife(Message) {
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
							KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedCrack"), "#ff0000", 2, true);
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
 * @param {item} item
 * @returns {boolean}
 */
function KDIsTreeAccessible(item) {
	let link = item;
	while (link && KDRestraint(link)) {
		if (KDRestraint(link).inaccessible) return false;
		link = link.dynamicLink;
	}
	return true;
}

/**
 * Determines if the entire dynamic item tree has at least one chastity item
 * @param {item} item
 * @returns {boolean}
 */
function KDIsTreeChastity(item) {
	let link = item;
	while (link && KDRestraint(link)) {
		if (KDRestraint(link).chastity) return false;
		link = link.dynamicLink;
	}
	return true;
}

/**
 * Determines if the entire dynamic item tree has at least one chastity bra item
 * @param {item} item
 * @returns {boolean}
 */
function KDIsTreeChastityBra(item) {
	let link = item;
	while (link && KDRestraint(link)) {
		if (KDRestraint(link).chastitybra) return false;
		link = link.dynamicLink;
	}
	return true;
}

/**
 *
 * @param {string} Group - Group
 * @param {boolean} [External] - By enemies or by player?
 * @returns {boolean}
 */
function KDGroupBlocked(Group, External) {
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
 * @param {string} Group
 * @param {boolean} External
 * @return {item[]}
 * Gets a list of restraints blocking this group */
function KDGetBlockingRestraints(Group, External) {
	// Create the storage system
	/** @type {Map<item, boolean>} */
	let map = new Map();
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
 * @param {string} Group
 * @param {boolean} External
 * @return {item[]}
 * Gets a list of restraints with Security that block this */
function KDGetBlockingSecurity(Group, External) {
	let items = KDGetBlockingRestraints(Group, External);
	items = items.filter((item) => {
		return KDRestraint(item)?.Security != undefined;
	});
	return items;
}

/**
 *
 * @param {boolean} Other - false = self, true = other prisoner door etc
 * @returns {boolean} - Can you use keys on target
 */
function KinkyDungeonCanUseKey(Other = true) {
	return !KinkyDungeonIsHandsBound(true, Other, 0.7) || KinkyDungeonStatsChoice.has("Psychic");
}

/**
 *
 * @param {boolean} [ApplyGhost] - Can you receive help in this context?
 * @param {boolean} [Other] - Is this on yourself or another?
 * @param {number} Threshold - Threshold
 * @returns {boolean}
 */
function KinkyDungeonIsHandsBound(ApplyGhost, Other, Threshold = 0.99) {
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
 * @param {boolean} Other - on other or self
 * @return  {number} - The bindhands level, sum of all bindhands properties of worn restraints
 */
function KDHandBondageTotal(Other = false) {
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

/**
 *
 * @returns {boolean}
 */
function KinkyDungeonCanUseFeet() {
	return KinkyDungeonStatsChoice.get("Flexible") && KinkyDungeonSlowLevel < 1;
}
/**
 *
 * @returns {boolean}
 */
function KinkyDungeonCanUseFeetLoose() {
	return KinkyDungeonCanUseFeet() || (
		!KDForcedToGround()
	);
}

/**
 *
 * @param {boolean} [ApplyGhost]
 * @param {boolean} [Other] - Is this on yourself or another?
 * @returns {boolean}
 */
function KinkyDungeonIsArmsBound(ApplyGhost, Other) {
	let blocked = KDGroupBlocked("ItemArms");
	if (!blocked)
		for (let inv of KinkyDungeonAllRestraint()) {
			if (KDRestraint(inv).bindarms) {
				blocked = true;
				break;
			}
		}
	return (!ApplyGhost || !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp())) &&
		blocked;
}
/**
 * @param {Character} C
 * @param {boolean} [ApplyGhost]
 * @param {boolean} [Other] - Is this on yourself or another?
 * @returns {boolean}
 */
function KinkyDungeonIsArmsBoundC(C, ApplyGhost, Other) {
	if (C == KinkyDungeonPlayer) {
		return KinkyDungeonIsArmsBound(ApplyGhost, Other);
	} else {
		return false;
	}
}



/**
 *
 * @param {boolean} ApplyGhost
 * @param {string} Group
 * @param {item} [excludeItem]
 * @returns {number}
 */
function KinkyDungeonStrictness(ApplyGhost, Group, excludeItem) {
	if (ApplyGhost && (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp())) return 0;
	let strictness = 0;
	for (let invItem of KinkyDungeonAllRestraint()) {
		let inv = invItem;
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
 * @param {string} Group
 * @param {item} excludeItem
 * @returns {string[]}
 */
function KinkyDungeonGetStrictnessItems(Group, excludeItem) {
	let list = [];
	for (let invItem of KinkyDungeonAllRestraint()) {
		let inv = invItem;
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


/**
 *
 * @returns {number}
 */
function KinkyDungeonGetPickBaseChance() {
	let bonus = 0;
	if (KinkyDungeonStatsChoice.get("Locksmith")) bonus += KDLocksmithPickBonus;
	if (KinkyDungeonStatsChoice.get("Clueless")) bonus += KDCluelessPickBonus;
	if (KinkyDungeonStatsChoice.get("LocksmithMaster")) bonus += 0.15;
	return 0.33 / (1.0 + 0.02 * MiniGameKinkyDungeonLevel) + bonus;
}

/**
 *
 * @returns {number}
 */
function KinkyDungeonGetPickBonus() {
	let bonus = 0;
	if (KinkyDungeonStatsChoice.get("Locksmith")) bonus += KDLocksmithBonus;
	if (KinkyDungeonStatsChoice.get("Clueless")) bonus += KDCluelessBonus;
	if (KinkyDungeonStatsChoice.get("LocksmithMaster")) bonus += 0.15;
	return bonus;
}

/**
 *
 * @returns {boolean}
 */
function KinkyDungeonPickAttempt() {
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
		KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle"), "#ff0000", 2, true);
	} else if (!KinkyDungeonHasStamina(-cost, true)) {
		chargecosts = false;
		KinkyDungeonWaitMessage(true, 0);
	} else if (KinkyDungeonTargetTile && KinkyDungeonTargetTile.pickProgress >= 1){//KDRandom() < escapeChance
		Pass = "Success";
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Unlock.ogg");
	} else if (KDLocks[lock] && KDLocks[lock].breakChance({})) { // Blue locks cannot be picked or cut!
		Pass = "Break";
		KinkyDungeonLockpicks -= 1;
		KinkyDungeonPickBreakProgress = 0;
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/PickBreak.ogg");
	} else if (!KinkyDungeonStatsChoice.get("Psychic") && (handsBound || (armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
		KinkyDungeonDropItem({name: "Pick"}, KinkyDungeonPlayerEntity, true);
		KinkyDungeonLockpicks -= 1;
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Miss.ogg");
	} else {
		KinkyDungeonTargetTile.pickProgress += escapeChance;
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Pick.ogg");
	}
	KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonAttemptPick" + Pass).replace("TargetRestraint", TextGet("KinkyDungeonObject")), (Pass == "Success") ? "lightgreen" : "#ff0000", 1);
	if (chargecosts) {
		KinkyDungeonChangeStamina(cost, 1);
		KinkyDungeonChangeWill(wcost);
	}
	KinkyDungeonSetFlag("tryescaping", 3);
	return Pass == "Success";
}

/**
 *
 * @param {string} lock
 * @returns {boolean}
 */
function KinkyDungeonUnlockAttempt(lock) {
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
	KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonStruggleUnlock" + Pass).replace("TargetRestraint", TextGet("KinkyDungeonObject")), (Pass == "Success") ? "lightgreen" : "#ff0000", 1);
	if (Pass == "Success") {
		KinkyDungeonRemoveKeysUnlock(lock);
		if (KDLocks[lock] && KDLocks[lock].loot_special && KinkyDungeonTargetTile && KinkyDungeonTargetTile.Loot == "normal") KinkyDungeonSpecialLoot = true;
		else if (KDLocks[lock] && KDLocks[lock].loot_locked && KinkyDungeonTargetTile && KinkyDungeonTargetTile.Loot == "normal") KinkyDungeonLockedLoot = true;
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Unlock.ogg");
		return true;
	} else if (!KinkyDungeonStatsChoice.get("Psychic") && (handsBound || (armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
		let keytype = KinkyDungeonGetKey(lock);
		if (keytype) {
			KinkyDungeonRemoveKeysDropped(lock, keytype);
		}
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Miss.ogg");
	} else {
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Pick.ogg");
	}
	KinkyDungeonSetFlag("tryescaping", 3);
	return false;
}

/** Gets the affinity of a restraint */
function KDGetRestraintAffinity(item, data) {
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

/**
 *
 */
function KDGetEscapeChance(restraint, StruggleType, escapeChancePre, limitChancePre, ApplyGhost, ApplyPlayerBonus, Msg) {
	let escapeChance = escapeChancePre != undefined ? escapeChancePre : KDRestraint(restraint).escapeChance[StruggleType] != undefined ? KDRestraint(restraint).escapeChance[StruggleType] : 1.0;
	if (KDGetCurse(restraint)) escapeChance = -100;
	let lockType = (restraint.lock && KDLocks[restraint.lock]) ? KDLocks[restraint.lock] : null;
	if (lockType) {
		let extraChance = (StruggleType == "Pick" && lockType.pick_diff) ? lockType.pick_diff : 0;
		if (extraChance) escapeChance += extraChance;
	}

	let limitChance = limitChancePre != undefined ? limitChancePre : (KDRestraint(restraint).limitChance != undefined && KDRestraint(restraint).limitChance[StruggleType] != undefined) ? KDRestraint(restraint).limitChance[StruggleType] :
		((StruggleType == "Unlock" || StruggleType == "Pick") ? 0 : 0.12);

	if (ApplyPlayerBonus) {
		if (StruggleType == "Pick") {
			if (KinkyDungeonStatsChoice.get("Locksmith")) escapeChance += KDLocksmithBonus;
			if (KinkyDungeonStatsChoice.get("Clueless")) escapeChance += KDCluelessBonus;
		} else if (StruggleType == "Remove" || StruggleType == "Unlock") {
			if (KinkyDungeonStatsChoice.get("Flexible")) escapeChance += KDFlexibleBonus;
			if (KinkyDungeonStatsChoice.get("Inflexible")) escapeChance *= KDInflexibleMult;
		} else if (StruggleType == "Struggle") {
			if (KinkyDungeonStatsChoice.get("Strong")) escapeChance += KDStrongBonus;
			if (KinkyDungeonStatsChoice.get("Weak")) escapeChance += KDWeakBonus;
		}
	}

	//if (!KinkyDungeonHasHelp()) {
	//limitChance += 0.05; // Small penalty for not having help
	//}

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


	if (KinkyDungeonStatsChoice.get("Unchained") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Metal"))
		escapeChance += KDUnchainedBonus;
	if (KinkyDungeonStatsChoice.get("Damsel") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Metal")) {
		if (escapeChance > 0)
			escapeChance /= 1.5;
		if (StruggleType != "Pick" && StruggleType != "Unlock" && limitChance > 0 && limitChance < KDDamselBonus)
			limitChance = KDDamselBonus;
	} else
	if (KinkyDungeonStatsChoice.get("Artist") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Rope"))
		escapeChance += KDArtistBonus;
	if (KinkyDungeonStatsChoice.get("Bunny") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Rope")) {
		if (escapeChance > 0)
			escapeChance /= 1.5;
		if (StruggleType != "Pick"  && StruggleType != "Unlock" && limitChance > 0 && limitChance < KDBunnyBonus)
			limitChance = KDBunnyBonus;
	} else
	if (KinkyDungeonStatsChoice.get("Slippery") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Latex"))
		escapeChance += KDSlipperyBonus;
	else if (KinkyDungeonStatsChoice.get("Doll") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Latex")) {
		if (escapeChance > 0)
			escapeChance /= 1.5;
		if (StruggleType != "Pick"  && StruggleType != "Unlock" && limitChance > 0 && limitChance < KDDollBonus)
			limitChance = KDDollBonus;
	} else
	if (KinkyDungeonStatsChoice.get("Escapee") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Leather"))
		escapeChance += KDEscapeeBonus;
	else if (KinkyDungeonStatsChoice.get("Dragon") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Leather")) {
		if (escapeChance > 0)
			escapeChance /= 1.5;
		if (StruggleType != "Pick"  && StruggleType != "Unlock" && limitChance > 0 && limitChance < KDDragonBonus)
			limitChance = KDDragonBonus;
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
	data.escapeChance += GoddessBonus;
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

function KDGetDynamicItem(group, index) {
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
 * @param {KDStruggleData} data
 * @returns {string}
 *  */
function KDGetStruggleData(data) {
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
				data.escapeChance += maxBonus*toolMult;
				data.origEscapeChance += maxBonus*toolMult;
				//if (maxBonus > 0) cancut = true;
			} else if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.cutBonus) {
				data.escapeChance += KinkyDungeonPlayerDamage.cutBonus*toolMult;
				data.origEscapeChance += KinkyDungeonPlayerDamage.cutBonus*toolMult;
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
		(!data.handsBound && (KinkyDungeonWeaponCanCut(true) || KinkyDungeonLockpicks > 0)
		|| (data.struggleGroup == "ItemHands" && KinkyDungeonCanTalk() && !armsBound))) {
		data.escapeChance = Math.max(data.escapeChance, Math.min(1, data.escapeChance + 0.15*toolMult));
		data.origEscapeChance = Math.max(data.origEscapeChance, Math.min(1, data.origEscapeChance + 0.15*toolMult));
	}

	// Psychic doesnt modify original chance, so that you understand its the perk helping you
	if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.25);

	let edgeBonus = 0.12*toolMult;
	// Easier to struggle if your legs are free, due to leverage
	// Slight boost to remove as well, but not as much due to the smaller movements required
	if ((data.struggleType == "Struggle" || data.struggleType == "Cut") && data.hasAffinity) data.escapeChance += edgeBonus * (0.5 + 0.5*Math.max(2 - KinkyDungeonSlowLevel, 0));
	else if ((data.struggleType == "Remove") && data.hasAffinity) data.escapeChance += edgeBonus * (0.1 + 0.1*Math.max(2 - KinkyDungeonSlowLevel, 0));

	// Restriction penalties AFTER bonuses
	if (data.restriction > 0 && !KinkyDungeonHasHelp()) {
		let restrictionMult =  1 - 10 / (10 + data.restriction);

		if (data.escapeChance > 0) {
			let penalty = 0;
			switch (data.struggleType) {
				case "Struggle": {
					penalty = 0.2;
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
					penalty = 0.3;
					break;
				}
			}

			data.escapePenalty += data.escapeChance * penalty * restrictionMult;
		}
	}


	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Lockdown")) {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonBuffLockdownTry")
			.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff0000", 1);
		data.escapeChance -= KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Lockdown") * 0.1;
	}

	if (data.escapePenalty < 0) data.escapePenalty *= buffMult;
	if (data.escapePenalty) {
		data.escapeChance -= data.escapePenalty;
	}

	if ((data.struggleType == "Struggle") && !data.hasAffinity && data.escapeChance <= 0 && data.escapeChance >= -edgeBonus && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		let typesuff = "";
		if (!data.query) {
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint).Struggle) ? KDGetEscapeSFX(data.restraint).Struggle : "Struggle")
					+ ".ogg");
			if (data.affinity && !KinkyDungeonGetAffinity(false, data.affinity, data.struggleGroup)) typesuff = "Wrong" + data.affinity;
			if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "NeedEdge" + typesuff)
				.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff0000", 2, true);
			KinkyDungeonLastAction = "Struggle";
			KinkyDungeonSendEvent("struggle", {
				restraint: data.restraint,
				group: data.struggleGroup,
				struggleType: data.struggleType,
				result: "NeedEdge",
			});
		}
		return "NeedEdge";
	}

	let removeFail = ((data.struggleType == "Unlock" && !KinkyDungeonStatsChoice.get("Psychic")) || data.struggleType == "Pick") && !(KinkyDungeonHasHelp()) && KDGetEscapeChance(data.restraint, "Remove", undefined, undefined, false, false).escapeChance <= 0;

	if (removeFail) data.escapeChance = 0;

	if (data.escapeChance <= 0 && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		if (!data.restraint.attempts) data.restraint.attempts = 0;
		if (!data.query && data.restraint.attempts < KinkyDungeonMaxImpossibleAttempts) {
			increasedAttempts = true;
			data.restraint.attempts += 1;
			if (data.escapeChance <= -0.5) data.restraint.attempts += 1;
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
				+ ".ogg");
			return "Fail";
		} else {
			if (!data.query) {
				let typesuff = "";
				if (removeFail || (data.origEscapeChance <= 0 && data.helpChance)) typesuff = "3";
				else if (KDRestraint(data.restraint).specStruggleTypes && KDRestraint(data.restraint).specStruggleTypes.includes(data.struggleType)) typesuff = "2";
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
					+ ".ogg");
				if (typesuff == "" && data.failSuffix) typesuff = data.failSuffix;
				if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "Impossible" + typesuff)
					.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff0000", 2, true);
				if (EC.escapeChanceData.GoddessBonus < 0 && EC.escapeChanceData.escapeChance < 0 && EC.escapeChance - EC.escapeChanceData.GoddessBonus > 0) {
					KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonStruggle" + data.struggleType + "ImpossibleGoddess")
						.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff0000", 2, true);
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
					if (KinkyDungeonStatsChoice.get("BondageLover")) KinkyDungeonChangeDistraction(KDBondageLoverAmount, false, 0.5);
				}
				KinkyDungeonAdvanceTime(1);
				KinkyDungeonSetFlag("escapeimpossible", 2);
			}
			return "Impossible";
		}
	}

	// Struggling is unaffected by having arms bound
	let minAmount = 0.1 - Math.max(0, 0.01*KDRestraint(data.restraint).power);
	if (data.struggleType == "Remove" && !data.hasAffinity) minAmount = 0;
	// Bound arms make fine motor skill escaping more difficult in general
	if (!(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && data.struggleType != "Struggle" && (data.struggleGroup != "ItemArms" && data.struggleGroup != "ItemHands" ) && armsBound) data.escapeChance *= 0.6;

	// Bound arms make escaping more difficult, and impossible if the chance is already slim
	if (data.struggleType != "Struggle" && data.struggleGroup != "ItemArms" && armsBound) data.escapeChance = Math.max(minAmount, data.escapeChance - 0.18);
	else if (data.struggleType == "Remove" && !armsBound && !data.handsBound) data.escapeChance = Math.max(minAmount, data.escapeChance + 0.07 * (1 - KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax));

	// Covered hands makes it harder to unlock. If you have the right removal type it makes it harder but wont make it go to 0
	if (((data.struggleType == "Pick" && !KinkyDungeonStatsChoice.get("Psychic")) || data.struggleType == "Unlock" || data.struggleType == "Remove") && data.struggleGroup != "ItemHands" && data.handsBound)
		data.escapeChance = Math.max((data.struggleType == "Remove" && data.hasAffinity) ?
		Math.max(0, data.escapeChance / 2) : 0, data.escapeChance - 0.14 - 0.22 * data.handBondage);

	if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.2);

	if ((data.struggleType == "Remove") && !data.hasAffinity && data.escapeChance == 0 && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		let typesuff = "";
		if (!data.query) {
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
				+ ".ogg");
			if (data.affinity && !KinkyDungeonGetAffinity(false, data.affinity, data.struggleGroup)) typesuff = "Wrong" + data.affinity;
			if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "NeedEdge" + typesuff)
				.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff0000", 2, true);
			KinkyDungeonLastAction = "Struggle";
			KinkyDungeonSendEvent("struggle", {
				restraint: data.restraint,
				group: data.struggleGroup,
				struggleType: data.struggleType,
				result: "NeedEdge",
			});
		}
		return "NeedEdge";
	}

	let possible = data.escapeChance > 0;
	// Strict bindings make it harder to escape unless you have help or are cutting with affinity
	if (data.strict && data.struggleType == "Struggle")
		data.escapeChance = Math.max(0, data.escapeChance - data.strict * 0.9);

	if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.2);

	if (possible && data.escapeChance == 0 && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		let typesuff = "";
		if (!data.query) {
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
				+ ".ogg");
			if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "Strict" + typesuff)
				.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff0000", 2, true);
			KinkyDungeonLastAction = "Struggle";
			KinkyDungeonSendEvent("struggle", {
				restraint: data.restraint,
				group: data.struggleGroup,
				struggleType: data.struggleType,
				result: "Strict",
			});
		}
		return "Strict";
	}

	// Reduce cutting power if you dont have hands
	if (data.struggleType == "Cut" && KinkyDungeonIsHandsBound(true)) {
		if (KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;})) {
			if (KinkyDungeonWallCrackAndKnife(true)) {
				data.escapeChance *= 0.92;
			} else if (!KinkyDungeonIsArmsBound(true)) {
				data.escapeChance *= 0.7;
			} else if (KinkyDungeonStatsChoice.get("Psychic")) {
				data.escapeChance *= 0.6;
			} else if (data.hasAffinity) {
				data.escapeChance *= 0.5;
			} else {
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedGrip"), "#ff0000", 2, true);
				data.escapeChance *= 0.0;
			}
		} else if (data.hasAffinity) data.escapeChance *= 0.5;
		else data.escapeChance = 0;

		// 5.2.6 - removed because limitchance already accounts for this
		//data.escapeChance = Math.max(0, data.escapeChance - 0.05);

	}

	if (!(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && (data.struggleType == "Pick" || data.struggleType == "Unlock" || data.struggleType == "Remove")) data.escapeChance /= 1.0 + KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax*KinkyDungeonDistractionUnlockSuccessMod;

	if (KDGroupBlocked(data.struggleGroup) && !KDRestraint(data.restraint).alwaysStruggleable) data.escapeChance = 0;

	// Blue locks make it harder to escape an item

	if (data.lockType && data.lockType.penalty && data.lockType.penalty[data.struggleType]) data.escapeChance = Math.max(0, data.escapeChance - data.lockType.penalty[data.struggleType]);

	if (data.struggleType == "Cut" && data.struggleGroup != "ItemHands" && data.handsBound)
		data.escapeChance = data.escapeChance / 2;

	if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.15);

	let belt = null;
	let bra = null;

	if (data.struggleGroup == "ItemVulva" || data.struggleGroup == "ItemVulvaPiercings" || data.struggleGroup == "ItemButt") belt = KinkyDungeonGetRestraintItem("ItemPelvis");
	if (belt && KDRestraint(belt) && KDRestraint(belt).chastity) data.escapeChance = 0.0;

	if (data.struggleGroup == "ItemNipples" || data.struggleGroup == "ItemNipplesPiercings") bra = KinkyDungeonGetRestraintItem("ItemBreast");
	if (bra && KDRestraint(bra) && KDRestraint(bra).chastitybra) data.escapeChance = 0.0;

	if (!data.query)
		KinkyDungeonSetFlag("escaping", 1);

	if (data.escapeChance <= 0 && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		if (!data.restraint.attempts) data.restraint.attempts = 0;
		if (data.restraint.attempts < KinkyDungeonMaxImpossibleAttempts || increasedAttempts) {
			if (!increasedAttempts) {
				data.restraint.attempts += 0.5;
				if (data.escapeChance <= -0.5) data.restraint.attempts += 0.5;
			}
			return "Fail";
		} else {
			if (!data.query) {
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
					+ ".ogg");
				let suff = "";
				if (suff == "" && data.failSuffix) suff = data.failSuffix;
				if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) suff = suff + "Aroused";
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "ImpossibleBound" + suff)
					.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff0000", 2, true);


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
					if (KinkyDungeonStatsChoice.get("BondageLover")) KinkyDungeonChangeDistraction(KDBondageLoverAmount, false, 0.5);
				}
				KinkyDungeonAdvanceTime(1);
				KinkyDungeonSetFlag("escapeimpossible", 2);
			}
			return "Impossible";
		}
	}

	if (KDRestraint(data.restraint) && KDRestraint(data.restraint).escapeMult != undefined) data.escapeChance *= KDRestraint(data.restraint).escapeMult;

	if (KDRestraint(data.restraint) && KDRestraint(data.restraint).struggleMult && KDRestraint(data.restraint).struggleMult[data.struggleType] != undefined)
		data.escapeChance *= KDRestraint(data.restraint).struggleMult[data.struggleType];


	if (data.escapeChance > Math.max(0, data.limitChance, data.extraLim) || (KDRestraint(data.restraint).alwaysEscapable && KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
		// Min struggle speed is always 0.05 = 20 struggle attempts
		data.minSpeed = (KDRestraint(data.restraint).struggleMinSpeed && KDRestraint(data.restraint).struggleMinSpeed[data.struggleType]) ? KDRestraint(data.restraint).struggleMinSpeed[data.struggleType] : data.minSpeed;
		data.escapeChance = Math.max(data.escapeChance, data.minSpeed);
	}

	if (KDRestraint(data.restraint) && KDRestraint(data.restraint).struggleMaxSpeed && KDRestraint(data.restraint).struggleMaxSpeed[data.struggleType] != undefined)
		data.escapeChance = Math.min(data.escapeChance, KDRestraint(data.restraint).struggleMaxSpeed[data.struggleType]);


	// Struggling is affected by tightness
	if (data.escapeChance > 0) {// && StruggleType == "Struggle") {
		for (let T = 0; T < data.restraint.tightness; T++) {
			data.escapeChance *= KDGetTightnessEffect(data.escapeChance, data.struggleType, T); // Tougher for each tightness, however struggling will reduce the tightness
		}
	}

	if (data.escapeChance > 0 && KinkyDungeonHasWill(0.01, false)) {
		data.escapeChance -= data.willEscapePenalty;
		if (data.escapeChance <= 0) {
			if (!data.query) {
				// Replace with frustrated moan later~
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint).NoWill) ? KDGetEscapeSFX(data.restraint).NoWill : "Struggle")
					+ ".ogg");
				KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle")
					.replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), "#ff0000", 2, true);
				KinkyDungeonLastAction = "Struggle";
				KinkyDungeonSendEvent("struggle", {
					restraint: data.restraint,
					group: data.struggleGroup,
					struggleType: data.struggleType,
					result: "Will",
				});
			}
			return "Will";
		}
	}

	return "";
}

// Lockpick = use tool or cut
// Otherwise, just a normal struggle
/**
 *
 * @param {string} struggleGroup
 * @param {string} StruggleType
 * @param {boolean} [query]
 * @param {KDStruggleData} [retData]
 * @returns {string}
 */
function KinkyDungeonStruggle(struggleGroup, StruggleType, index, query = false, retData) {

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
	let helpChance = (KDRestraint(restraint).helpChance != undefined && KDRestraint(restraint).helpChance[StruggleType] != undefined) ? KDRestraint(restraint).helpChance[StruggleType] : 0.0;
	let limitChance = (KDRestraint(restraint).limitChance != undefined && KDRestraint(restraint).limitChance[StruggleType] != undefined) ? KDRestraint(restraint).limitChance[StruggleType] :
		((StruggleType == "Unlock" || StruggleType == "Pick") ? 0 : 0.05);
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
	 * @type {KDStruggleData}
	 */
	let data = {
		minSpeed: KDMinEscapeRate,
		handBondage: 0,
		handsBound: false,
		armsBound: false,
		query: query,
		restraint: restraint,
		struggleType: StruggleType,
		struggleGroup: struggleGroup,
		escapeChance: restraintEscapeChancePre,
		origEscapeChance: restraintEscapeChancePre,
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
		willEscapePenalty: KDGetWillPenalty(),
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

	data.escapeSpeed = KDBaseEscapeSpeed * data.speedMult;
	data.extraLim = (data.struggleType == "Pick" && data.lockType.pick_lim) ? Math.max(0, data.lockType.pick_lim) : 0;
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
			if ((data.wcost > 0 && !KinkyDungeonHasWill(-data.wcost, false)) && (data.escapeChance*0.5 <= data.willEscapePenalty && !KinkyDungeonHasWill(0.01, false))) {
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).NoWill) ? KDGetEscapeSFX(restraint).NoWill : "Struggle")
					+ ".ogg");
				KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle")
					.replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff0000", 2, true);
				KinkyDungeonLastAction = "Struggle";
				KinkyDungeonSendEvent("struggle", {
					restraint: restraint,
					group: struggleGroup,
					struggleType: StruggleType,
					result: "Will",
				});
				return "Will";
			} else if (!KinkyDungeonHasStamina(-data.cost, true)) {
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
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
					let limitProgress = cutStruggleProgress ? (StruggleType == "Struggle" ?
						(cutStruggleProgress < threshold ? threshold * cutStruggleProgress : 1.0) :
						Math.min(1, 1.15 - 1.15 * cutStruggleProgress))
						: (StruggleType == "Struggle" ? 0 : 1);
					let limitPenalty = Math.max(0, Math.min(1, limitProgress) * data.limitChance, data.extraLimPenalty);
					let maxPossible = 1;
					if ((data.limitChance > 0 && data.limitChance > data.escapeChance && StruggleType == "Struggle")) {
						// Find the intercept
						maxPossible = threshold;
					}
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
							if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint)[data.struggleType]) ? KDGetEscapeSFX(restraint)[data.struggleType] : "Struggle")
								+ ".ogg");
							KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Limit")
								.replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff0000", 2, true);
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
							if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint)[data.struggleType]) ? KDGetEscapeSFX(restraint)[data.struggleType] : "Struggle")
								+ ".ogg");
							KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Limit")
								.replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff0000", 2, true);
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
					if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
						+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint)[data.struggleType]) ? KDGetEscapeSFX(restraint)[data.struggleType] : "Struggle")
						+ ".ogg");
					// Replace with frustrated moan later~
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Barely")
						.replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff0000", 2, true);
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
					KDSuccessRemove(StruggleType, restraint, data.lockType, index, data, host);
				} else {
					// Failure block for the different failure types
					if (StruggleType == "Cut") {
						if (((data.handsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound) || (data.armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound)) && KinkyDungeonWeaponCanCut(false) && KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name) {
							if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).KnifeDrop) ? KDGetEscapeSFX(restraint).KnifeDrop : "Miss")
								+ ".ogg");
							Pass = "Drop";
							KinkyDungeonDisarm(KinkyDungeonPlayerEntity, "Cut");
						} else {
							if (KDItemIsMagic(restraint) && !data.canCutMagic) {
								if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
									+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).NoMagic) ? KDGetEscapeSFX(restraint).NoMagic : "SoftShield")
									+ ".ogg");
								Pass = "Fail";
							} else {
								if (KDToggles.Sound) {
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
							if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).PickBreak) ? KDGetEscapeSFX(restraint).PickBreak : "PickBreak")
								+ ".ogg");
							KinkyDungeonLockpicks -= 1;
							KinkyDungeonPickBreakProgress = 0;
						} else if (!KinkyDungeonStatsChoice.get("Psychic") && (data.handsBound || (data.armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
							if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).PickDrop) ? KDGetEscapeSFX(restraint).PickDrop : "Miss")
								+ ".ogg");
							Pass = "Drop";
							KinkyDungeonDropItem({name: "Pick"}, KinkyDungeonPlayerEntity, true);
							KinkyDungeonLockpicks -= 1;
						} else {
							if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
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
							if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
								+ ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).KeyDrop) ? KDGetEscapeSFX(restraint).KeyDrop : "Miss")
								+ ".ogg");
							Pass = "Drop";
							let keytype = KinkyDungeonGetKey(restraint.lock);
							if (keytype) {
								//KinkyDungeonDropItem({name: keytype+"Key"}, KinkyDungeonPlayerEntity, true);
								KinkyDungeonRemoveKeysDropped(restraint.lock, keytype);
							}
						} else {
							if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
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
						if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
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
						if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
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
				KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonStruggle" + StruggleType + Pass + suff).replace("TargetRestraint", TextGet("Restraint" + KDRestraint(restraint).name)), (Pass == "Success") ? "lightgreen" : "#ff0000", 2);

			if (KinkyDungeonHasStamina(-data.cost)) {
				KinkyDungeonChangeStamina(data.cost, true, 1);
				KinkyDungeonChangeWill(data.wcost);
				if (KinkyDungeonStatsChoice.get("BondageLover")) KinkyDungeonChangeDistraction(KDBondageLoverAmount, false, 0.5);

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
 * @param {string} group - The group of the restraint item you want to get.
 * @param {number} [index] - The index of the restraint item you want to get.
 * @returns {item} The item that matches the group.
 */
function KinkyDungeonGetRestraintItem(group, index) {
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
 *
 * @param {string} Name
 * @returns {restraint}
 */
function KinkyDungeonGetRestraintByName(Name) {
	if (KinkyDungeonRestraintsCache.size > 0) {
		// Nothing
	} else {
		KinkyDungeonRefreshRestraintsCache();
	}
	if (KinkyDungeonRestraintVariants[Name]) Name = KinkyDungeonRestraintVariants[Name].template;

	return KinkyDungeonRestraintsCache.get(Name);
}

/**
 *
 * @param {string} Lock
 * @param {item} [item] - Factoring in curse
 * @param {string} [curse] - Curse to add
 * @param {restraint} [restraint] - restraint to add, checks to make sure its lockable
 * @returns {number}
 */
function KinkyDungeonGetLockMult(Lock, item, curse, restraint) {
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
	"Unchained",
	"Damsel",
	"NoPet",
	"NoKigu",
	"NoBlindfolds",
	...KDHeavyRestraintPrefs,
];
/**
 *
 * @param {KDHasTags} enemy
 * @param {*} Level
 * @param {*} Index
 * @param {*} Bypass
 * @param {*} Lock
 * @param {*} RequireWill
 * @param {*} LeashingOnly
 * @param {*} NoStack
 * @param {*} extraTags
 * @param {boolean} minWeightFallback
 * @param {*} agnostic - Determines if playertags and current bondage are ignored
 * @param {number} filterEps - Anything under this is filtered unless nothing is above it
 * @param {entity} [securityEnemy] - Bypass is treated separately for these groups
 * @param {string} [curse] - Going to add this curse
 * @param {boolean} [useAugmented] - useAugmented
 * @param {string[]} [augmentedInventory]
 * @param {object} [options]
 * @param {boolean} [options.dontAugmentWeight]
 * @param {boolean} [options.ApplyVariants]
 * @param {boolean} [options.dontPreferVariant]
 * @param {boolean} [options.allowLowPower]
 * @param {{minPower?: number, maxPower?: number, onlyLimited?: boolean, noUnlimited?: boolean, noLimited?: boolean, onlyUnlimited?: boolean, ignore?: string[], require?: string[], looseLimit?: boolean, ignoreTags?: string[], allowedGroups?: string[]}} [filter] - Filters for items
 * @returns {{restraint: restraint, variant?: ApplyVariant, weight: number}[]}
 */
function KDGetRestraintsEligible(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, filterEps = 0.9, minWeightFallback = true, useAugmented = false, augmentedInventory = undefined, options) {
	let RestraintsList = [];
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
			if (effLevel >= t[1])
				tags.set(t[0], true);
		}

	if (filter?.ignoreTags) {
		for (let ft of filter.ignoreTags) {
			tags.delete(ft);
		}
	}

	let arousalMode = KinkyDungeonStatsChoice.get("arousalMode");
	let cache = [];
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

	let add = false;
	let addedVar = false;
	for (let r of cache) {
		let restraint = r.r;
		if (filter) {
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
			if (agnostic || KDCanAddRestraint(restraint, Bypass, Lock, NoStack, undefined, KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined, securityEnemy, useAugmented, curse, augmentedInventory)) {

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

			if (options?.ApplyVariants && restraint.ApplyVariants) {
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
				});
			}
		}
	}

	let RestraintsList2 = [];
	if (!options?.allowLowPower) {
		// Only does strictest for that group
		let noway = KinkyDungeonStatsChoice.get("NoWayOut");
		let groupPower = {};
		let wornGroups = {};
		for (let inv of KinkyDungeonAllRestraint()) {
			wornGroups[KDRestraint(inv)?.Group] = true;
		}
		for (let r of RestraintsList) {
			if (!wornGroups[r.restraint.Group] || !groupPower[r.restraint.Group] || noway) {
				if (!groupPower[r.restraint.Group] || r.restraint.power >= groupPower[r.restraint.Group][0].restraint.power) {
					if (!groupPower[r.restraint.Group]) groupPower[r.restraint.Group] = [r];
					else {
						if (r.restraint.power > groupPower[r.restraint.Group][0].restraint.power) groupPower[r.restraint.Group] = [r];
						else groupPower[r.restraint.Group].push(r);
					}
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
			extraTags, agnostic, filter, securityEnemy, curse, 0, false, useAugmented, augmentedInventory, options);
	}
	if (!options?.allowLowPower)
		return RestraintsList2;
	else return RestraintsList;
}

/**
 *
 * @param {KDHasTags} enemy
 * @param {*} Level
 * @param {*} Index
 * @param {*} Bypass
 * @param {*} Lock
 * @param {*} RequireWill
 * @param {*} LeashingOnly
 * @param {*} NoStack
 * @param {*} extraTags
 * @param {*} agnostic - Determines if playertags and current bondage are ignored
 * @param {entity} [securityEnemy] - Bypass is treated separately for these groups
 * @param {string} [curse] - Planning to add this curse
 * @param {boolean} [useAugmented] - useAugmented
 * @param {string[]} [augmentedInventory] -
 * @param {object} [options]
 * @param {boolean} [options.dontAugmentWeight]
 * @param {boolean} [options.ApplyVariants]
 * @param {boolean} [options.dontPreferVariant]
 * @param {{minPower?: number, maxPower?: number, onlyLimited?: boolean, noUnlimited?: boolean, noLimited?: boolean, onlyUnlimited?: boolean, ignore?: string[], require?: string[], looseLimit?: boolean, ignoreTags?: string[], allowedGroups?: string[]}} [filter] - Filters for items
 * @returns
 */
function KinkyDungeonGetRestraint(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, useAugmented, augmentedInventory, options) {
	let restraintWeightTotal = 0;
	let restraintWeights = [];

	let Restraints = KDGetRestraintsEligible(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, undefined, undefined, useAugmented, augmentedInventory, options);

	for (let rest of Restraints) {
		let restraint = rest.restraint;
		let weight = rest.weight;
		restraintWeights.push({restraint: restraint, weight: restraintWeightTotal});
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
 *
 * @param {KDHasTags} enemy
 * @param {*} Level
 * @param {*} Index
 * @param {*} Bypass
 * @param {*} Lock
 * @param {*} RequireWill
 * @param {*} LeashingOnly
 * @param {*} NoStack
 * @param {*} extraTags
 * @param {*} agnostic - Determines if playertags and current bondage are ignored
 * @param {entity} [securityEnemy] - Bypass is treated separately for these groups
 * @param {string} [curse] - Planning to add this curse
 * @param {boolean} [useAugmented] - useAugmented
 * @param {string[]} [augmentedInventory] -
 * @param {object} [options]
 * @param {boolean} [options.dontAugmentWeight]
 * @param {boolean} [options.ApplyVariants]
 * @param {boolean} [options.dontPreferVariant]
 * @param {{minPower?: number, maxPower?: number, onlyLimited?: boolean, noUnlimited?: boolean, noLimited?: boolean, onlyUnlimited?: boolean, ignore?: string[], require?: string[], looseLimit?: boolean, ignoreTags?: string[], allowedGroups?: string[]}} [filter] - Filters for items
 * @returns {{r: restraint, v: ApplyVariant}}
 */
function KDGetRestraintWithVariants(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, useAugmented, augmentedInventory, options) {
	let restraintWeightTotal = 0;
	let restraintWeights = [];

	if (!options) options = {ApplyVariants: true,};
	else options.ApplyVariants = true;
	let Restraints = KDGetRestraintsEligible(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, undefined, undefined, useAugmented, augmentedInventory, options);

	for (let rest of Restraints) {
		let restraint = rest.restraint;
		let weight = rest.weight;
		restraintWeights.push({restraint: restraint, variant: rest.variant, weight: restraintWeightTotal});
		weight += rest.weight;
		restraintWeightTotal += Math.max(0, weight);
	}

	let selection = KDRandom() * restraintWeightTotal;

	for (let L = restraintWeights.length - 1; L >= 0; L--) {
		if (selection > restraintWeights[L].weight) {
			return {r: restraintWeights[L].restraint, v: restraintWeights[L].variant};
		}
	}
}

function KinkyDungeonUpdateRestraints(delta) {
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
		if (group == "ItemM") {
			if (!KinkyDungeonGetRestraintItem("ItemMouth")) playerTags.set("ItemMouth" + "Empty", true);
			if (!KinkyDungeonGetRestraintItem("ItemMouth2")) playerTags.set("ItemMouth2" + "Empty", true);
			if (!KinkyDungeonGetRestraintItem("ItemMouth3")) playerTags.set("ItemMouth3" + "Empty", true);
		} else if (group == "ItemH") {
			if (!KinkyDungeonGetRestraintItem("ItemHood")) playerTags.set("ItemHood" + "Empty", true);
			if (!KinkyDungeonGetRestraintItem("ItemHead")) playerTags.set("ItemHead" + "Empty", true);
		} else if (!KinkyDungeonGetRestraintItem(group)) playerTags.set(group + "Empty", true);
	}
	let outfit = KDOutfit({name: KinkyDungeonCurrentDress});
	for (let inv2 of KinkyDungeonAllRestraintDynamic()) {
		let inv = inv2.item;
		playerTags.set("Item_"+inv.name, true);

		if ((!inv.faction || KDToggles.ForcePalette || outfit?.palette) && (!KDDefaultPalette || KinkyDungeonFactionFilters[KDDefaultPalette])) {
			inv.faction = outfit?.palette || KDDefaultPalette;
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
	if (KinkyDungeonStatsChoice.get("NoKigu")) playerTags.set("NoKigu", true);
	if (KinkyDungeonStatsChoice.get("NoBlindfolds")) playerTags.set("NoBlindfolds", true);
	if (KinkyDungeonStatsChoice.get("NoPet")) playerTags.set("NoPet", true);
	if (KinkyDungeonStatsChoice.get("Unchained")) playerTags.set("Unchained", true);
	if (KinkyDungeonStatsChoice.get("Damsel")) playerTags.set("Damsel", true);
	if (KinkyDungeonStatsChoice.get("arousalMode")) playerTags.set("arousalMode", true);
	if (KinkyDungeonStatsChoice.get("arousalModePlug")) playerTags.set("arousalModePlug", true);
	if (KinkyDungeonStatsChoice.get("arousalModePiercing")) playerTags.set("arousalModePiercing", true);

	let tags = [];
	KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);
	for (let t of tags) {
		playerTags.set(t, true);
	}

	KinkyDungeonSendEvent("updatePlayerTags", {tags: playerTags, player:KinkyDungeonPlayerEntity});
	return playerTags;
}

function KDGetCursePower(item) {
	if (!item || !KDGetCurse(item)) return 0;
	return KDCursePower(KDGetCurse(item));
}

/**
 *
 * @param {item} item
 * @param {boolean} [NoLink]
 * @param {restraint} [toLink]
 * @param {string} [newLock] - If we are trying to add a new item
 * @param {string} [newCurse] - If we are trying to add a new item
 * @returns
 */
function KinkyDungeonRestraintPower(item, NoLink, toLink, newLock, newCurse) {
	if (item && item.type == Restraint) {
		let lockMult = item ? KinkyDungeonGetLockMult(item.lock, item) : 1;
		let power = KDRestraint(item).power * lockMult + KDGetCursePower(item);

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
 * @param {restraint} oldRestraint
 * @param {restraint} newRestraint
 * @param {item} [item]
 * @param {string} [Lock]
 * @param {string} [Curse]
 * @returns {boolean}
 */
function KinkyDungeonLinkableAndStricter(oldRestraint, newRestraint, item, Lock, Curse) {
	if (oldRestraint && newRestraint) {
		if (!KDIsEligible(newRestraint)) return false;
		return KinkyDungeonIsLinkable({oldRestraint: oldRestraint, newRestraint: newRestraint, item: item, props: {newLock: Lock, newCurse: Curse}});
		//}
	}
	return false;
}

/**
 * Blanket function for stuff needed to select a restraint
 * @param {restraint} restraint
 */
function KDIsEligible(restraint) {
	if (restraint.requireSingleTagToEquip && !restraint.requireSingleTagToEquip.some((tag) => {return KinkyDungeonPlayerTags.get(tag);})) return false;
	if (restraint.requireAllTagsToEquip && restraint.requireAllTagsToEquip.some((tag) => {return !KinkyDungeonPlayerTags.get(tag);})) return false;
	return true;
}

function KinkyDungeonGenerateRestraintTrap() {
	let enemy = KinkyDungeonGetEnemy(["chestTrap"], KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["chestTrap"]);
	if (enemy) return enemy.name;
	return "GreedyGhast";
}

function KDGetLockVisual(item) {
	//if (KinkyDungeonBlindLevel > 0) return `Locks/Blind.png`;
	return `Locks/${item.lock}.png`;
}

/**
 *
 * @param {restraint} restraint
 * @param {boolean} Bypass
 * @param {boolean} NoStack
 * @param {string} Lock
 * @param {item} [r]
 * @param {boolean} [Deep] - allow linking under
 * @param {boolean} [noOverpower] - not allowed to replace items that currently exist
 * @param {entity} [securityEnemy] - Bypass is treated separately for these groups
 * @param {boolean} [useAugmentedPower] - Bypass is treated separately for these groups
 * @param {string} [curse] - Bypass is treated separately for these groups
 * @param {string[]} [augmentedInventory]
 * @param {number} [powerBonus]
 * @returns {boolean} - Restraint can be added
 */
function KDCanAddRestraint(restraint, Bypass, Lock, NoStack, r, Deep, noOverpower, securityEnemy, useAugmentedPower, curse, augmentedInventory, powerBonus = 0) {
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
	if (restraint.requireSingleTagToEquip && !restraint.requireSingleTagToEquip.some((tag) => {return KinkyDungeonPlayerTags.get(tag);})) return false;
	if (restraint.requireAllTagsToEquip && restraint.requireAllTagsToEquip.some((tag) => {return !KinkyDungeonPlayerTags.get(tag);})) return false;
	//if (restraint.AssetGroup == "ItemNipplesPiercings" && !KinkyDungeonStatsChoice.get("arousalModePiercing")) return false;

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
	let power = powerBonus + (KinkyDungeonRestraintPower(r, true, restraint, Lock, curse) * (r && useAugmentedPower ? Math.max(0.9, KDRestraintPowerMult(KinkyDungeonPlayerEntity, KDRestraint(r), augmentedInventory)) : 1));
	let linkUnder = KDGetLinkUnder(r, restraint, Bypass, NoStack, Deep, securityEnemy, Lock, curse);

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
			+ restraint.power
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
 *
 * @param {string} Group
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDEnemyPassesSecurity(Group, enemy) {
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
 * @param {item} currentRestraint
 * @param {restraint} restraint
 * @param {boolean} [bypass]
 * @param {boolean} [NoStack]
 * @param {boolean} [Deep] - Whether or not it can look deeper into the stack
 * @param {entity} [securityEnemy] - Bypass is treated separately for these groups
 * @param {string} [Lock]
 * @param {string} [Curse]
 * @returns {item}
 */
function KDGetLinkUnder(currentRestraint, restraint, bypass, NoStack, Deep, securityEnemy, Lock, Curse) {
	let link = currentRestraint;
	if (restraint.bypass) bypass = true;
	while (link) {
		if (KDCanLinkUnder(link, restraint, bypass, NoStack, securityEnemy, Lock, Curse)) {
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
 * @param {item} currentRestraint
 * @param {restraint} restraint
 * @param {boolean} [bypass]
 * @param {boolean} [NoStack]
 * @param {entity} [securityEnemy] - Bypass is treated separately for these groups
 * @param {string} [Lock]
 * @param {string} [Curse]
 * @returns {boolean}
 */
function KDCanLinkUnder(currentRestraint, restraint, bypass, NoStack, securityEnemy, Lock, Curse) {
	if (restraint.bypass) bypass = true;
	let linkUnder = currentRestraint
		&& (bypass || (KDRestraint(currentRestraint).accessible) || (KDRestraint(currentRestraint).deepAccessible) || KDEnemyPassesSecurity(KDRestraint(currentRestraint).Group, securityEnemy))
		&& KinkyDungeonIsLinkable({
			oldRestraint: restraint,
			newRestraint: KDRestraint(currentRestraint),
			item: {name: restraint.name, id: -1},
			ignoreItem: currentRestraint,
			linkUnderItem: currentRestraint,
		})
		&& (!currentRestraint.dynamicLink || KinkyDungeonIsLinkable({
			oldRestraint: KDRestraint(currentRestraint.dynamicLink),
			newRestraint: restraint,
			item: currentRestraint.dynamicLink,
			ignoreItem: currentRestraint,
			props: {
				newLock: Lock,
				newCurse: Curse,
			}
		}));

	if (!linkUnder) return false;
	if (
		KDCheckLinkSize(currentRestraint, restraint, bypass, NoStack, securityEnemy, undefined,
			{
				newLock: Lock,
				newCurse: Curse,
			})
	) {
		return true;
	}
}

/**
 *
 * @param {item} currentRestraint
 * @param {item} [ignoreItem] - Item to ignore
 * @param {restraint} restraint
 * @param {boolean} [bypass]
 * @param {boolean} [NoStack]
 * @param {entity} [securityEnemy] - Bypass is treated separately for these groups
 * @param {object} [props] - Curse and lock properties
 * @param {string} [props.newLock]
 * @param {string} [props.newCurse]
 * @returns {boolean}
 */
function KDCheckLinkSize(currentRestraint, restraint, bypass, NoStack, securityEnemy, ignoreItem, props) {

	if (restraint.bypass) bypass = true;
	return (!restraint.linkCategory || (KDLinkCategorySize(KinkyDungeonGetRestraintItem(KDRestraint(currentRestraint).Group),
		restraint.linkCategory, ignoreItem) + KDLinkSize(restraint) <= (NoStack ? 0.01 : 1.0))
	)
		&& ((restraint.linkCategory && !restraint.noDupe)
			|| !KDDynamicLinkList(KinkyDungeonGetRestraintItem(KDRestraint(currentRestraint).Group), true).some((item) => {
				if (restraint.name == item.name && (!ignoreItem || ignoreItem?.id != item.id)) {
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
 *
 * @param {restraint} restraint
 * @param {ApplyVariant} variant
 * @returns {KDRestraintVariant}
 */
function KDApplyVarToInvVar(restraint, variant) {
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
		events.push(...JSON.parse(JSON.stringify(KDEventEnchantmentModular[e].types[KDModifierEnum.restraint].events(restraint.name, undefined, undefined, variant.enchants[0], variant.enchants.slice(1), {variant: variant}))));
	}
	return restvar;
}


/**
 * @param {restraint} restraint
 * @param {number} [Tightness]
 * @param {boolean} [Bypass]
 * @param {string} [Lock]
 * @param {boolean} [Keep]
 * @param {boolean} [Trapped]
 * @param {KinkyDungeonEvent[]} [events]
 * @param {string} [faction]
 * @param {boolean} [Deep] - whether or not it can go deeply in the stack
 * @param {string} [Curse] - Curse to apply
 * @param {entity} [securityEnemy] - Bypass is treated separately for these groups
 * @param {boolean} [reserved] - Reserved do not use
 * @param {string} [inventoryAs] - inventoryAs for the item
 * @param {Record<string, any>} [data] - data for the item
 * @returns {number}
 */
function KDLinkUnder(restraint, Tightness, Bypass, Lock, Keep, Trapped, events, faction, Deep, Curse, securityEnemy, reserved, inventoryAs, data) {
	KDRestraintDebugLog.push("LKUndering " + restraint.name);

	let r = KinkyDungeonGetRestraintItem(restraint.Group);
	let linkUnder = null;
	linkUnder = KDGetLinkUnder(r, restraint, Bypass, undefined, Deep, securityEnemy, Lock, Curse);
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
		KinkyDungeonSendEvent("postApply", {player: KinkyDungeonPlayerEntity, item: lk, host: linkUnder, keep: Keep, Link: true});
	}
	return ret;
}

/**
 * @param {restraint | string} restraint
 * @param {number} [Tightness]
 * @param {boolean} [Bypass]
 * @param {string} [Lock]
 * @param {boolean} [Keep]
 * @param {boolean} [Trapped] - Deprecated do not use
 * @param {KinkyDungeonEvent[]} [events]
 * @param {string} [faction]
 * @param {boolean} [Deep] - whether or not it can go deeply in the stack
 * @param {string} [Curse] - Curse to apply
 * @param {entity} [securityEnemy] - Bypass is treated separately for these groups
 * @param {boolean} [useAugmentedPower] - Augment power to keep consistency
 * @param {string} [inventoryAs] - inventoryAs for the item
 * @param {string[]} [augmentedInventory]
 * @param {Record<string, any>} [data] - data for the item
 * @param {ApplyVariant} [variant] - variant for the item
 * @returns {number}
 */
function KinkyDungeonAddRestraintIfWeaker(restraint, Tightness, Bypass, Lock, Keep, Trapped, events, faction, Deep, Curse, securityEnemy, useAugmentedPower, inventoryAs, data, augmentedInventory, variant) {
	if (typeof restraint === "string") {
		KDRestraintDebugLog.push("Lookup" + restraint);
		restraint = KinkyDungeonGetRestraintByName(restraint);
	} else {
		KDRestraintDebugLog.push("AddWeaker" + restraint.name);
	}
	if (!KinkyDungeonIsLockable(restraint)) Lock = "";

	if (variant) {
		return KDEquipInventoryVariant(KDApplyVarToInvVar(restraint, variant),
			variant.prefix, Tightness, Bypass, Lock, Keep, Trapped, faction, Deep, Curse, securityEnemy, useAugmentedPower, inventoryAs, variant.nonstackable ? "" : variant.prefix);
	}

	if (restraint.bypass) Bypass = true;
	if (KDCanAddRestraint(restraint, Bypass, Lock, false, undefined, Deep, false, securityEnemy, (useAugmentedPower == undefined && securityEnemy != undefined) || useAugmentedPower, Curse, augmentedInventory)) {
		let r = KinkyDungeonGetRestraintItem(restraint.Group);
		let linkableCurrent = r
			&& KDRestraint(r)
			&& KinkyDungeonLinkableAndStricter(KDRestraint(r), restraint, r);

		let ret = 0;

		if (!restraint.good && !restraint.armor) {
			KinkyDungeonSetFlag("restrained", 2);
			KinkyDungeonSetFlag("restrained_recently", 5);
		}

		ret = KinkyDungeonAddRestraint(restraint, Tightness + Math.round(0.1 * KinkyDungeonDifficulty), Bypass, Lock, Keep, false, !linkableCurrent, events, faction, undefined, undefined, Curse, undefined, securityEnemy, inventoryAs, data);
		if (KinkyDungeonPlayerEntity && !KinkyDungeonCanTalk() && KDRandom() < KinkyDungeonGagMumbleChanceRestraint) {
			let msg = "KinkyDungeonGagRestraint";
			let gagMsg = Math.floor(KDRandom() * 3);

			if (restraint.power > 8 && KDRandom() < .8) gagMsg = 2;
			else if (restraint.power > 4 && KDRandom() < .5) gagMsg = 2;

			msg = msg + gagMsg;

			KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet(msg), "#ffffff", 5, 3);
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
 * @returns {boolean}
 */
function KinkyDungeonIsLinkable(data) {
	if (data.newRestraint.NoLinkOver) return false;
	//if (!oldRestraint.nonbinding && newRestraint.nonbinding) return false;
	if (data.item && !KDCheckLinkSize(data.item, data.newRestraint, false, false, undefined, data.ignoreItem, data.props)) return false;
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
 * @param {item} oldRestraint
 * @param {restraint} newRestraint
 * @param {item} [ignoreItem]
 * @returns {boolean}
 */
function KDCheckLinkTotal(oldRestraint, newRestraint, ignoreItem, lock = "", curse = "", useAugmentedPower = false, augmentedInventory = undefined) {
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
 * @param {item} restraint
 */
function KDUpdateLinkCaches(restraint) {
	let link = restraint;
	while (link) {
		link.linkCache = KDGetLinkCache(link);
		link = link.dynamicLink;
	}
}

/**
 * Gets the linkability cache
 * @param {item} restraint
 * @returns {string[]}
 */
function KDGetLinkCache(restraint) {
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
 * @param {restraint} restraint
 * @param {number} Tightness
 * @param {boolean} [Bypass]
 * @param {string} [Lock]
 * @param {boolean} [Keep]
 * @param {boolean} [Link]
 * @param {boolean} [SwitchItems]
 * @param {KinkyDungeonEvent[]} [events]
 * @param {boolean} [Unlink]
 * @param {string} [faction]
 * @param {item} [dynamicLink]
 * @param {string} [Curse] - Curse to apply
 * @param {boolean} [autoMessage] - Whether or not to automatically dispatch messages
 * @param {entity} [securityEnemy] - Whether or not to automatically dispatch messages
 * @param {string} [inventoryAs] - InventoryAs for the item
 * @param {Record<string, number>} [data] - data for the item
 * @returns
 */
function KinkyDungeonAddRestraint(restraint, Tightness, Bypass, Lock, Keep, Link, SwitchItems, events, faction, Unlink, dynamicLink, Curse, autoMessage = true, securityEnemy = undefined, inventoryAs = undefined, data) {
	KDDelayedActionPrune(["Restrain"]);
	if (restraint.bypass) Bypass = true;
	KDStruggleGroupLinkIndex = {};
	let start = performance.now();
	let tight = (Tightness) ? Tightness : 0;
	if (restraint) {
		// First we try linking under
		if (!Unlink) {
			let ret = KDLinkUnder(restraint, Tightness, Bypass, Lock, Keep, false, events, faction, true, Curse, securityEnemy, true, inventoryAs, data);
			if (ret) return ret;
		}

		KDRestraintDebugLog.push("StartAdd " + restraint.name);
		if (!KDGroupBlocked(restraint.Group, true) || Bypass || KDEnemyPassesSecurity(restraint.Group, securityEnemy)) {
			KinkyDungeonEvasionPityModifier = 0;
			KinkyDungeonMiscastPityModifier = 0;
			let r = KinkyDungeonGetRestraintItem(restraint.Group);
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



			let color = (typeof restraint.Color === "string") ? [restraint.Color] : Object.assign([], restraint.Color);
			if (restraint.factionColor && faction && KinkyDungeonFactionColors[faction]) {
				for (let i = 0; i < restraint.factionColor.length; i++) {
					for (let n of restraint.factionColor[i]) {
						if (KinkyDungeonFactionColors[faction][i])
							color[n] = KinkyDungeonFactionColors[faction][i]; // 0 is the primary color
					}
				}
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

				let item = {name: restraint.name, id: KinkyDungeonGetItemID(), type: Restraint, curse: Curse, events: events ? events : KDGetEventsForRestraint(inventoryAs || restraint.name),
					tightness: tight, lock: "", faction: faction, dynamicLink: dynamicLink,
					data: data,
				};
				if (inventoryAs) item.inventoryVariant = inventoryAs;
				KDRestraintDebugLog.push("Adding " + item.name);
				KinkyDungeonInventoryAdd(item);
				KDUpdateItemEventCache = true;
				KinkyDungeonSendEvent("postApply", {player: KinkyDungeonPlayerEntity, item: item, host: undefined, keep: Keep, Link: Link});

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
		KinkyDungeonCheckClothesLoss = true; // We signal it is OK to check whether the player should get undressed due to restraints

		KinkyDungeonDressPlayer();
		KinkyDungeonMultiplayerInventoryFlag = true; // Signal that we can send the inventory now
		KinkyDungeonSleepTime = 0;
		KinkyDungeonUpdateStruggleGroups();
		if (!KinkyDungeonRestraintAdded) {
			KinkyDungeonRestraintAdded = true;
			let sfx = (restraint && KDGetRestraintSFX(restraint)) ? KDGetRestraintSFX(restraint) : "Struggle";
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
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
 * @param {item} item - The item to remove.
 * @param {boolean} [Keep] - If true, the item will be kept in the player's inventory.
 * @param {boolean} [Add] - If true, this is part of the process of adding another item and should not trigger infinite recursion
 * @param {boolean} [NoEvent] - If true, the item will not trigger any events.
 * @param {boolean} [Shrine] - If the item is being removed from a shrine, this is true.
 * @param {boolean} [UnLink] - If the item is being removed as part of an unlinking process
 * @param {entity} [Remover] - Who removes this
 * @param {boolean} [ForceRemove] - Ignore AlwaysKeep, for example if armor gets confiscated
 * @returns {boolean} true if the item was removed, false if it was not.
 */
function KinkyDungeonRemoveRestraintSpecific(item, Keep, Add, NoEvent, Shrine, UnLink, Remover, ForceRemove) {
	KDUpdateItemEventCache = true;
	let rest = KinkyDungeonGetRestraintItem(KDRestraint(item)?.Group);
	if (rest == item) {
		return KinkyDungeonRemoveRestraint(KDRestraint(item).Group, Keep, Add, NoEvent, Shrine, UnLink, Remover);
	} else if (KDRestraint(item)) {
		let list = KDDynamicLinkList(rest, true);
		for (let i = 1; i < list.length; i++) {
			if (list[i] == item) {
				return KinkyDungeonRemoveDynamicRestraint(list[i-1], Keep, NoEvent, Remover, ForceRemove);
			}
		}
	}
	return false;
}

/**
 * It removes a restraint from the player
 * @param {string} Group - The group of the item to remove.
 * @param {boolean} [Keep] - If true, the item will be kept in the player's inventory.
 * @param {boolean} [Add] - If true, this is part of the process of adding another item and should not trigger infinite recursion
 * @param {boolean} [NoEvent] - If true, the item will not trigger any events.
 * @param {boolean} [Shrine] - If the item is being removed from a shrine, this is true.
 * @param {boolean} [UnLink] - If the item is being removed as part of an unlinking process
 * @param {entity} [Remover] - Who removes this
 * @param {boolean} [ForceRemove] - Ignore AlwaysKeep, for example if armor gets confiscated
 * @returns {boolean} true if the item was removed, false if it was not.
 */
function KinkyDungeonRemoveRestraint(Group, Keep, Add, NoEvent, Shrine, UnLink, Remover, ForceRemove) {
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
				KinkyDungeonCancelFlag = KinkyDungeonUnLinkItem(item, Keep);
			}

			if (!KinkyDungeonCancelFlag) {
				InventoryRemove(KinkyDungeonPlayer, AssetGroup);

				let removed = [];
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
						// @ts-ignore
						let inventoryAs = invitem.inventoryVariant || invitem.inventoryAs || (Remover?.player ? invrest.inventoryAsSelf : invrest.inventoryAs);
						if (invrest.inventory && !ForceRemove
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
									KinkyDungeonSendTextMessage(10, TextGet("KDCursedArmorUncurse").replace("RestraintName", TextGet("Restraint" + invrest.name)), "#aaffaa", 1);
								}
								if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
									KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
								}

								if (!KinkyDungeonInventoryGetLoose(inventoryAs)) {
									let loose = {name: inventoryAs, id: KinkyDungeonGetItemID(), type: LooseRestraint, events:invitem.events || origRestraint.events, quantity: 1};
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





				if (rest.Group == "ItemNeck" && !Add && KinkyDungeonGetRestraintItem("ItemNeckRestraints")) KinkyDungeonRemoveRestraint("ItemNeckRestraints", KDRestraint(KinkyDungeonGetRestraintItem("ItemNeckRestraints")).inventory);

				let sfx = (rest && KDGetRemoveSFX(rest)) ? KDGetRemoveSFX(rest) : "Struggle";
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");

				KinkyDungeonCalculateSlowLevel();
				KinkyDungeonCheckClothesLoss = true;
				KinkyDungeonDressPlayer();

				KinkyDungeonMultiplayerInventoryFlag = true;
				KinkyDungeonUpdateStruggleGroups();

			}
			KinkyDungeonCancelFlag = false;
			if (KinkyDungeonPlayerWeapon != KinkyDungeonPlayerWeaponLastEquipped && KinkyDungeonInventoryGet(KinkyDungeonPlayerWeaponLastEquipped)) {
				KDSetWeapon(KinkyDungeonPlayerWeaponLastEquipped);
			}
			return true;
		}
	}
	return false;
}

function KDIInsertRestraintUnderneath(restraint) {

	return false;
}

/**
 * It removes the item's dynamic link
 * @param {item} hostItem - The group of the item to remove.
 * @param {boolean} [Keep] - If true, the item will be kept in the player's inventory.
 * @param {boolean} [NoEvent] - If true, the item will not trigger any events.
 * @param {entity} [Remover] - Who removes this
 * @param {boolean} [ForceRemove] - Ignore AlwaysKeep, for example if armor gets confiscated
 * @returns {boolean} true if the item was removed, false if it was not.
 */
function KinkyDungeonRemoveDynamicRestraint(hostItem, Keep, NoEvent, Remover, ForceRemove) {
	let item = hostItem.dynamicLink;
	if (item) {
		const rest = KDRestraint(item);
		if (!NoEvent)
			KinkyDungeonSendEvent("remove", {item: rest, keep: Keep, shrine: false, dynamic: true});

		if (!KinkyDungeonCancelFlag) {
			// @ts-ignore
			let inventoryAs = item.inventoryVariant || item.inventoryAs || (Remover?.player ? rest.inventoryAsSelf : rest.inventoryAs);
			if (rest.inventory && !ForceRemove
				&& (Keep
					|| rest.enchanted
					|| rest.armor
					|| rest.alwaysKeep
					|| (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs] && !KinkyDungeonRestraintVariants[inventoryAs].noKeep)
				)) {
				if (inventoryAs) {
					let origRestraint = KinkyDungeonGetRestraintByName(inventoryAs);
					if (origRestraint && rest.shrine?.includes("Cursed") && !origRestraint.shrine?.includes("Cursed")) {
						KinkyDungeonSendTextMessage(10, TextGet("KDCursedArmorUncurse").replace("RestraintName", TextGet("Restraint" + rest.name)), "#aaffaa", 1);
						if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
							KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
						}
					}
					if (!KinkyDungeonInventoryGetLoose(inventoryAs)) {
						let loose = {name: inventoryAs, id: KinkyDungeonGetItemID(), type: LooseRestraint, events: item.events || KDGetEventsForRestraint(inventoryAs), quantity: 1};
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
			}

			// Remove the item itself by unlinking it from the chain
			KDRestraintDebugLog.push("Removing Dynamic " + item.name);
			hostItem.dynamicLink = item.dynamicLink;
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
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");

			KinkyDungeonCalculateSlowLevel();
			KinkyDungeonCheckClothesLoss = true;
			KinkyDungeonDressPlayer();

			KinkyDungeonMultiplayerInventoryFlag = true;
			KinkyDungeonUpdateStruggleGroups();
		}
		KinkyDungeonCancelFlag = false;
		return true;
	}
	return false;
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
function KinkyDungeonRestraintTypes(ShrineFilter) {
	let ret = [];

	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).shrine) {
			for (let shrine of KDRestraint(inv).shrine) {
				if (ShrineFilter.includes(shrine) && !ret.includes(shrine)) ret.push(shrine);
			}
		}
	}

	return ret;
}


/**
 *
 * @param {restraint} newRestraint
 * @param {item} oldItem
 * @param {number} tightness
 * @param {string} [Lock]
 * @param {boolean} [Keep]
 * @param {string} [faction]
 * @param {string} [Curse]
 * @param {boolean} [autoMessage] - Whether or not to automatically dispatch a message
 * @param {string} [inventoryAs] - inventoryAs for the item
 * @param {KinkyDungeonEvent[]} [events] - inventoryAs for the item
 * @param {Record<string, number>} [data] - data for the item
 * @returns {item} - The new item
 */
function KinkyDungeonLinkItem(newRestraint, oldItem, tightness, Lock, Keep, faction, Curse, autoMessage = true, inventoryAs = null, events = undefined, data) {
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
				KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonLink" + oldItem.name), "#ff0000", 2);


			KinkyDungeonSendEvent("postApply", {player: KinkyDungeonPlayerEntity, item: newItem, host: undefined, keep: Keep, Link: true});
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
 * @returns
 */
function KinkyDungeonUnLinkItem(item, Keep, dynamic) {
	//if (!data.add && !data.shrine)
	if (item.type == Restraint) {
		/**
		 * @type {item}
		 */
		let UnLink = null;
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
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonUnLink" + item.name), "lightgreen", 2);
				} else
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonUnLink"), "lightgreen", 2);
				return true;
			}
		}
	}
	return false;
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {{aoe: number, number: number, dist: number, kind: string, duration?: number, durationExtra?: number}} options
 */
function KDCreateDebris(x, y, options) {
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
 *
 * @param {string} StruggleType
 * @param {item} restraint
 * @param {KDLockType} lockType
 * @param {number} index
 * @param {any} data
 * @param {item} host
 */
function KDSuccessRemove(StruggleType, restraint, lockType, index, data, host) {
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
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
					+ ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Unlock) ? KDGetFinishEscapeSFX(restraint).Unlock : "Unlock")
					+ ".ogg");
				KinkyDungeonRemoveKeysUnlock(restraint.lock);
				KinkyDungeonLock(restraint, "");
			}
		} else {
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
				+ ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Unlock) ? KDGetFinishEscapeSFX(restraint).Unlock : "Unlock")
				+ ".ogg");
			KinkyDungeonLock(restraint, "");
		}
	} else {
		if (KDToggles.Sound) {
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
				KinkyDungeonSendTextMessage(9, TextGet("KinkyDungeonStruggleCutDestroyFail").replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff0000", 2);
			} else {
				KinkyDungeonSendTextMessage(9, TextGet("KinkyDungeonStruggleCutDestroy").replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff0000", 2);
			}
			destroy = true;
		}
		let trap = restraint.trap;
		KDSendStatus('escape', restraint.name, StruggleType);
		if (KDToggles.Sound && destroy) {
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
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonSummonTrapMonster"), "#ff0000", 2);
			}
		}
	}
	let suff = "";
	if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) suff = "Aroused";
	KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonStruggle" + StruggleType + "Success" + suff).replace("TargetRestraint", TextGet("Restraint" + KDRestraint(restraint).name)), "lightgreen", 2);

	KinkyDungeonSendEvent("afterSuccessRemove", data);

	return destroy;
}

function KDAddDelayedStruggle(amount, time, StruggleType, struggleGroup, index, data, progress = 0, limit = 100) {
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
 *
 * @param {number} bonus
 * @param {number} penalty
 * @param {number} threshold
 * @param {number} bonusscale
 * @param {number} penaltyscale
 * @returns {number}
 */
function KDGetManaBonus(bonus, penalty, threshold, bonusscale, penaltyscale) {
	if (KinkyDungeonStatMana > threshold) return bonus * (KinkyDungeonStatMana - threshold)/bonusscale;
	else if (KinkyDungeonStatMana < threshold) return penalty * (KinkyDungeonStatMana - threshold)/penaltyscale;
	return 0;
}

/**
 * Gets the goddess bonus for this item
 * @param {item} item
 * @param {any} data - Escape chance data
 */
function KDGetItemGoddessBonus(item, data) {
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
 * @param {{restraint: restraint, weight: number}[]} RestraintList
 * @param {string[]} GroupOrder
 * @param {boolean} [skip]
 * @returns {restraint}
 */
function KDChooseRestraintFromListGroupPri(RestraintList, GroupOrder, skip = true) {

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
 * @param {{restraint: restraint, variant?: ApplyVariant, weight: number}[]} RestraintList
 * @param {string[]} GroupOrder
 * @param {boolean} [skip]
 * @returns {{r: restraint, v: ApplyVariant}}
 */
function KDChooseRestraintFromListGroupPriWithVariants(RestraintList, GroupOrder, skip = true) {
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
				restraintWeights.push({restraint: restraint, variant: rest.variant, weight: restraintWeightTotal});
				weight += restraint.weight;
				restraintWeightTotal += Math.max(0, weight);
			}

			let selection = KDRandom() * restraintWeightTotal;

			for (let L = restraintWeights.length - 1; L >= 0; L--) {
				if (selection > restraintWeights[L].weight) {
					return {r: restraintWeights[L].restraint, v: restraintWeights[L].variant};
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



let KDSlimeParts = {
	"Collar": {enemyTagSuffix: "Collar",enemyTagExtra: {"livingCollar":10}},
	"Boots": {},
	"Feet": {},
	"Legs": {},
	"Arms": {},
	"Head": {},
	"Mouth": {},
	"Hands": {},
};

let KDRopeParts = {
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
};

let KDCuffParts = {
	"LivingCollar": {base: true, enemyTagSuffix: "Collar", enemyTagOverride: {"livingCollar":10}},
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
 *
 * @param {string} CopyOf - The cuff family to copy
 * @param {string} idSuffix - The suffix to add to the cuff family
 * @param {string} ModelSuffix - The suffix for the cuff model to use
 * @param {string} tagBase - The base for the enemy tags
 * @param {Record<string, number>} extraTags - extra enemy tags
 * @param {string[]} allTag - adds a tag to all of the cuffs if specified
 * @param {number} addPower - Base opower level
 * @param {KDRestraintPropsBase} properties - Restraint properties to override
 * @param {KinkyDungeonEvent[]} extraEvents - Extra events to add on to the base cuffs
 * @param {KDEscapeChanceList} addStruggle - Increase to base struggle amounts
 * @param {KDEscapeChanceList} premultStruggle - Multiplier to base struggle amounts, AFTER baseStruggle
 * @param {Record<string, LayerFilter>} [Filters] - Multiplier to base struggle amounts, AFTER baseStruggle
 * @param {boolean} [noGeneric] - does not add this to tagBaseRestraints, only tagBaseCuffs
 * @param {Record<string, string>} [CuffAssets] - mapping of Group to Assets
 * @param {Record<string, string>} [CuffModels] - mapping of Group to Models
 * @param {boolean} [noLockBase] - Removes Pick and Unlock methods of escape
 * @param {boolean} [noLockLink] - Removes Pick and Unlock methods of escape
 * param {{name: string, description: string}} strings - Generic strings for the cuff type
 */
function KDAddCuffVariants(CopyOf, idSuffix, ModelSuffix, tagBase, extraTags, allTag, removeTag, addPower, properties, extraEvents = [], addStruggle, premultStruggle, addStruggleLink, premultStruggleLink, Filters, baseWeight = 10, noGeneric, CuffAssets = {}, CuffModels = {}, noLockBase, noLockLink) {
	for (let part of Object.entries(KDCuffParts)) {
		let cuffPart = part[0];
		let cuffInfo = part[1];
		// Only if we have something to copy
		let origRestraint = KinkyDungeonGetRestraintByName(CopyOf + cuffPart);
		if (origRestraint) {
			// For each category of rope items we dupe the original item and apply modifications based on the category parameters
			/** @type {Record<string, number>} */
			let enemyTags = {};
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

			/** @type {Record<string, number>} */
			let enemyTagsMult = {};
			if (cuffInfo.base)
				enemyTagsMult[tagBase + (cuffInfo.enemyTagSuffix || "")] = 1;
			let shrine = [...allTag, ...KDGetRestraintTags(origRestraint)];
			for (let t of removeTag) {
				if (shrine.includes(t)) shrine.splice(shrine.indexOf(t), 1);
			}
			/** @type {KDRestraintPropsBase} */
			let props = {
				Model: CuffModels[cuffPart] || (origRestraint.Model + ModelSuffix + (cuffInfo.ModelSuffix || "")),
				Asset: CuffAssets[cuffPart] || (origRestraint.Asset),
				power: origRestraint.power + addPower,
				shrine: shrine,
				enemyTags: enemyTags,
				enemyTagsMult: enemyTagsMult,
				events: cuffInfo.base ? [...extraEvents, ...(origRestraint.events || [])] : [...(origRestraint.events || [])],
				escapeChance: Object.assign({}, origRestraint.escapeChance),
				Filters: origRestraint.Filters ? Object.assign({}, origRestraint.Filters) : {},
				cloneTag: tagBase + "Restraints",
			};
			if (cuffInfo.Link) props.Link = idSuffix + cuffInfo.Link;
			if (cuffInfo.UnLink) props.UnLink = idSuffix + cuffInfo.UnLink;
			if (Filters && props.Filters) {
				for (let layer of Object.keys(Filters)) {
					props.Filters[layer] = Object.assign({}, Filters[layer]);
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
			let newRestraint = KinkyDungeonCloneRestraint(CopyOf + cuffPart, idSuffix + cuffPart, Object.assign(props, properties));
			console.log("Added " + newRestraint.name);
			console.log(newRestraint);
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
 * @param {number} basePower - Base opower level
 * @param {KDRestraintPropsBase} properties - Restraint properties to override
 * @param {KinkyDungeonEvent[]} extraEvents - Extra events to add on
 * @param {KDEscapeChanceList} addStruggle - Increase to base struggle amounts
 * @param {KDEscapeChanceList} premultStruggle - Multiplier to base struggle amounts, AFTER baseStruggle
 * @param {Record<string, LayerFilter>} [Filters] - Multiplier to base struggle amounts, AFTER baseStruggle
 * param {{name: string, description: string}} strings - Generic strings for the rope type
 */
function KDAddRopeVariants(CopyOf, idSuffix, ModelSuffix, tagBase, allTag, removeTag, basePower, properties, extraEvents = [], addStruggle, premultStruggle, Filters, baseWeight = 10) {
	for (let part of Object.entries(KDRopeParts)) {
		let ropePart = part[0];
		// Only if we have something to copy
		let origRestraint = KinkyDungeonGetRestraintByName(CopyOf + ropePart);
		if (origRestraint) {
			// For each category of rope items we dupe the original item and apply modifications based on the category parameters
			/** @type {Record<string, number>} */
			let enemyTags = {};
			enemyTags[tagBase + (part[1].enemyTagSuffix || "")] = baseWeight;
			if (part[1].enemyTagExtra) {
				for (let tag in part[1].enemyTagExtra) {
					enemyTags[tag] = part[1].enemyTagExtra[tag];
				}
			}



			/** @type {Record<string, number>} */
			let enemyTagsMult = {};
			enemyTagsMult[tagBase + (part[1].enemyTagSuffix || "")] = 1;
			let shrine = [...allTag, ...KDGetRestraintTags(origRestraint)];
			for (let t of removeTag) {
				if (shrine.includes(t)) shrine.splice(shrine.indexOf(t), 1);
			}
			/** @type {KDRestraintPropsBase} */
			let props = {
				Model: origRestraint.Model + ModelSuffix,
				power: origRestraint.power + basePower,
				shrine: shrine,
				enemyTags: enemyTags,
				enemyTagsMult: enemyTagsMult,
				events: [...extraEvents, ...(origRestraint.events || [])],
				escapeChance: Object.assign({}, origRestraint.escapeChance),
				Filters: origRestraint.Filters ? Object.assign({}, origRestraint.Filters) : {},
				cloneTag: tagBase,
			};
			if (Filters && props.Filters) {
				for (let layer of Object.keys(Filters)) {
					props.Filters[layer] = Object.assign({}, Filters[layer]);
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
			let newRestraint = KinkyDungeonCloneRestraint(CopyOf + ropePart, idSuffix + ropePart, Object.assign(props, properties));
			console.log("Added " + newRestraint.name);
			console.log(newRestraint);
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
 * @param {number} basePower - Base opower level
 * @param {KDRestraintPropsBase} properties - Restraint properties to override
 * @param {KinkyDungeonEvent[]} extraEvents - Extra events to add on
 * @param {KDEscapeChanceList} addStruggle - Increase to base struggle amounts
 * @param {KDEscapeChanceList} premultStruggle - Multiplier to base struggle amounts, AFTER baseStruggle
 * @param {Record<string, LayerFilter>} [Filters] - Multiplier to base struggle amounts, AFTER baseStruggle
 * @param {string} [restraintType] - Restrainttype for slime spread event
 * param {{name: string, description: string}} strings - Generic strings for the rope type
 */
function KDAddHardSlimeVariants(CopyOf, idSuffix, ModelSuffix, tagBase, allTag, removeTag, basePower, properties, extraEvents = [], addStruggle, premultStruggle, Filters, baseWeight = 100, restraintType) {
	for (let part of Object.entries(KDSlimeParts)) {
		let restraintPart = part[0];
		// Only if we have something to copy
		let origRestraint = KinkyDungeonGetRestraintByName(CopyOf + restraintPart);
		if (origRestraint) {
			// For each category of rope items we dupe the original item and apply modifications based on the category parameters
			/** @type {Record<string, number>} */
			let enemyTags = {};
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
			/** @type {KDRestraintPropsBase} */
			let props = {
				Model: origRestraint.Model + ModelSuffix,
				power: origRestraint.power + basePower,
				shrine: shrine,
				enemyTags: enemyTags,
				events: JSON.parse(JSON.stringify([...extraEvents, ...(origRestraint.events || [])])),
				escapeChance: Object.assign({}, origRestraint.escapeChance),
				Filters: origRestraint.Filters ? Object.assign({}, origRestraint.Filters) : {},
				cloneTag: tagBase,
			};
			if (Filters && props.Filters) {
				for (let layer of Object.keys(Filters)) {
					props.Filters[layer] = Object.assign({}, Filters[layer]);
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
			let newRestraint = KinkyDungeonCloneRestraint(CopyOf + restraintPart, idSuffix + restraintPart, Object.assign(props, properties));
			console.log("Added " + newRestraint.name);
			console.log(newRestraint);
		}
	}
}

/**
 * Converts restraint tags to a copy that is also a list (in case data structure changes)
 * @param {restraint} restraint
 * @returns {string[]}
 */
function KDGetRestraintTags(restraint) {
	return [...restraint.shrine];
}

/**
 *
 * @param {item} item
 * @param {string} name
 * @returns {any}
 */
function KDItemDataQuery(item, name) {
	if (item?.data) {
		return item.data[name];
	}
	return undefined;
}
/**
 *
 * @param {item} item
 * @param {string} name
 * @param {number | string} value
 * @returns {any}
 */
function KDItemDataSet(item, name, value) {
	if (!item.data) {
		item.data = {};
	}
	item.data[name] = value;
}

/**
 * Changes a restraint item's name
 * @param {item} item
 * @param {string} type - Restraint or LooseRestraint
 * @param {string} name
 */
function KDChangeItemName(item, type, name) {
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
 * @returns {number}
 */
function KDCurseCount(activatedOnly) {
	let restraints = KinkyDungeonAllRestraintDynamic();
	/** @type {KDEventData_CurseCount} */
	let data = {
		restraints: restraints,
		activatedOnly: activatedOnly,
		count: 0,
	};
	KinkyDungeonSendEvent("curseCount", data);

	return data.count;
}

/**
 *
 * @param {entity} player
 * @param {string[]} requireSingleTag
 * @param {string[]} requireAllTags
 * @param {boolean} ignoregold
 * @param {boolean} ignoreShrine
 */
function KDGetTotalRestraintPower(player, requireSingleTag, requireAllTags, ignoregold, ignoreShrine) {
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
		if (ignoregold && KDLocks[item.lock]?.shrineImmune) continue;
		if (!ignoreShrine && (KDGetCurse(item) && KDCurses[KDGetCurse(item)].noShrine)) continue;
		power += KinkyDungeonRestraintPower(item);
	}
	return power;
}

function KDGetEscapeSFX(restraint) {
	if (KDRestraint(restraint).sfxEscape) return KDRestraint(restraint).sfxEscape;
	if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
		return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfxEscape;
	}
	return null;
}

function KDGetRestraintSFX(restraint) {
	if (KDRestraint(restraint).sfx) return KDRestraint(restraint).sfx;
	if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
		return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfx;
	}
	return null;
}

function KDGetFinishEscapeSFX(restraint) {
	if (KDRestraint(restraint).sfxFinishEscape) return KDRestraint(restraint).sfxFinishEscape;
	if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
		return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfxFinishEscape;
	}
	return null;
}
function KDGetRemoveSFX(restraint) {
	if (KDRestraint(restraint).sfxRemove) return KDRestraint(restraint).sfxRemove;
	if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
		return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfxRemove;
	}
	return null;
}

/**
 *
 * @param {item} item
 * @param {number} level
 * @returns {boolean}
 */
function KDHasRemovableCurse(item, level) {
	if (item.curse && KDCurses[item.curse] && KDCurses[item.curse].level <= level) {
		return true;
	}
	return false;
}

/**
 *
 * @param {item} item
 * @param {number} level
 * @returns {boolean}
 */
function KDHasRemovableHex(item, level) {
	if (item.events && item.events.some((event) => {
		return event.trigger == "CurseTransform" && KDEventHexModular[event.original] && KDEventHexModular[event.original].level <= level;
	})) {
		return true;
	}
	return false;
}

/**
 *
 * @param {item} item
 * @param {number} level
 * @returns {KinkyDungeonEvent[]}
 */
function KDGetRemovableHex(item, level) {
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
 * @param {item} item
 */
function KDGetItemName(item) {
	let base = TextGet("KinkyDungeonInventoryItem" + item.name);
	let variant = null;
	switch(item.type) {
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
 *
 * @param {restraint} restraint
 * @param {ApplyVariant} [variant]
 */
function KDGetRestraintName(restraint, variant) {
	let base = TextGet("Restraint" + restraint.name);
	if (variant?.suffix) return base + " " + TextGet("KDVarSuff" + variant.suffix);
	if (variant?.prefix) return TextGet("KDVarPref" + variant.prefix) + " " + base;
	return base;
}
/**
 *
 * @param {consumable} consumable
 * @param {ApplyVariant} [variant]
 */
function KDGetConsumableName(consumable, variant) {
	let base = TextGet("KinkyDungeonInventoryItem" + consumable.name);
	if (variant?.suffix) return base + " " + TextGet("KDVarSuff" + variant.suffix);
	if (variant?.prefix) return TextGet("KDVarPref" + variant.prefix) + " " + base;
	return base;
}
/**
 *
 * @param {weapon} weapon
 * @param {ApplyVariant} [variant]
 */
function KDGetWeaponName(weapon, variant) {
	let base = TextGet("KinkyDungeonInventoryItem" + weapon.name);
	if (variant?.suffix) return base + " " + TextGet("KDVarSuff" + variant.suffix);
	if (variant?.prefix) return TextGet("KDVarPref" + variant.prefix) + " " + base;
	return base;
}

/**
 *
 * @param {string} name
 */
function KDGetItemNameString(name) {
	let base = TextGet((KinkyDungeonGetRestraintByName(name) ? "Restraint" : "KinkyDungeonInventoryItem") + name);
	let variant = KinkyDungeonRestraintVariants[name] || KinkyDungeonWeaponVariants[name] || KinkyDungeonConsumableVariants[name];
	if (variant) {
		base = TextGet((KinkyDungeonGetRestraintByName(variant.template) ? "Restraint" : "KinkyDungeonInventoryItem") + variant.template);
	}
	if (variant?.suffix) return base + " " + TextGet("KDVarSuff" + variant.suffix);
	if (variant?.prefix) return TextGet("KDVarPref" + variant.prefix) + " " + base;
	return base;
}



function KDGetEventsForRestraint(name) {
	if (!KDRestraint({name: name})) return [];
	if (KinkyDungeonRestraintVariants[name]) return Object.assign([], KinkyDungeonRestraintVariants[name].events);
	return Object.assign([], KDRestraint({name: name}).events || []);
}


/**
 *
 * @param {item} item
 * @param {boolean} [includeItem]
 * @returns {item[]}
 */
function KDDynamicLinkList(item, includeItem) {
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
 * @param {item} item
 * @returns {item[]}
 */
function KDDynamicLinkListSurface(item) {
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
 *
 * @param {restraint} restraint
 * @returns {number}
 */
function KDLinkSize(restraint) {
	return restraint.linkSize ? restraint.linkSize : 1;
}

/**
 *
 * @param {item} item
 * @param {string} linkCategory
 * @param {item} [ignoreItem]
 * @returns {number}
 */
function KDLinkCategorySize(item, linkCategory, ignoreItem) {
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
		if (KDRestraint(inv).linkCategory == linkCategory && ignoreItem?.id != inv.id) {
			total += KDLinkSize(KDRestraint(inv));
		}
	}
	return total;
}

/**
 *
 * @param {item} item
 * @returns {item}
 */
function KDGetRestraintHost(item) {
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
 *
 * @param {KinkyDungeonEvent} e
 * @param {item} item
 */
function KDLinkItemEvent(e, item, data) {
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
				if (KDToggles.Sound && e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		}
	}
}

/**
 * @returns {number}
 */
function KDGetRestriction() {
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
 *
 * @param {item} item
 * @param {entity} [Remover]
 * @returns {boolean}
 */
function KDAlwaysKeep(item, Remover) {
	let rest = KDRestraint(item);
	let inventoryAs = item.inventoryVariant || (Remover?.player ? rest.inventoryAsSelf : rest.inventoryAs);
	return rest.enchanted
	|| rest.armor
	|| rest.alwaysKeep
	|| (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs] && !KinkyDungeonRestraintVariants[inventoryAs].noKeep);
}

