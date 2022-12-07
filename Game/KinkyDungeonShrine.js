"use strict";

/**
 * Base costs for all the shrines. Starts at this value, increases thereafter
 * @type {Record<string, number>}
 */
let KinkyDungeonShrineBaseCosts = {
	//"Charms": 25,
	"Leather": 40,
	"Metal": 60,
	"Rope": 20,
	"Latex": 40,
	"Will": 20,
	"Elements": 200,
	"Conjure": 200,
	"Illusion": 200,
};

let KDWillShrineWill = 0.25;
let KinkyDungeonOrbAmount = 0;
let KDShrineRemoveCount = 3;

/**
 * Cost growth, overrides the default amount
 * @type {Record<string, number>}
 */
let KinkyDungeonShrineBaseCostGrowth = {
	"Elements": 2,
	"Conjure": 2,
	"Illusion": 2,
};

let KinkyDungeonShopIndex = 0;

let KinkyDungeonShrinePoolChancePerUse = 0.2;

/**
 * Current costs multipliers for shrines
 * @type {Record<string, number>}
 */
let KinkyDungeonShrineCosts = {};

let KinkyDungeonShrineTypeRemove = ["Charms", "Leather", "Metal", "Rope", "Latex", "Gags", "Blindfolds", "Boots"]; // These shrines will always remove restraints associated with their shrine

function KinkyDungeonShrineInit() {
	KinkyDungeonShrineCosts = {};
	KDGameData.PoolUsesGrace = 3;

	KinkyDungeonInitReputation();

}


/**
 *
 * @param {string} Name
 * @returns {string}
 */
function KDGoddessColor(Name) {
	let color = "#ffffff";
	if (Name == "Illusion") color = "#8154FF";
	else if (Name == "Conjure") color = "#D4AAFF";
	else if (Name == "Elements") color = "#FF0000";
	else if (Name == "Latex") color = "#2667FF";
	else if (Name == "Leather") color = "#442E1E";
	else if (Name == "Metal") color = "#222222";
	else if (Name == "Rope") color = "#7C4926";
	else if (Name == "Will") color = "#23FF44";
	return color;
}

function KinkyDungeonShrineAvailable(type) {
	if (type == "Commerce") {
		if (KDGameData.ShopItems.length > 0) return true;
		else return false;
	}
	if (KinkyDungeonShrineTypeRemove.includes(type) && KinkyDungeonGetRestraintsWithShrine(type).length > 0) return true;
	else if ((type == "Elements" || type == "Illusion" || type == "Conjure")) return true;
	else if (type == "Will" && (KinkyDungeonStatMana < KinkyDungeonStatManaMax || KinkyDungeonStatManaPool < KinkyDungeonStatManaPoolMax || KinkyDungeonStatWill < KinkyDungeonStatWillMax)) return true;

	return false;
}

let KDLevelsPerCheckpoint = 4;

/**
 *
 * @param {number} Level
 */
function KinkyDungeonGenerateShop(Level) {
	KDGameData.PoolUses = Math.min(KDGameData.PoolUses, KinkyDungeonStatsChoice.get("Blessed") ? 0 : 1);
	KinkyDungeonShopIndex = 0;
	KDGameData.ShopItems = [];
	let items_mid = 0;
	let items_high = 0;
	let itemCount = 8 + Math.floor(KDRandom() * 3);
	if (KinkyDungeonStatsChoice.has("Supermarket")) {
		items_mid = -1;
		items_high = -1;
		itemCount += 2;
	}
	for (let I = itemCount; I > 0; I--) {
		let Rarity = 0;
		if (items_high < 3) {Rarity = Math.floor(Level/KDLevelsPerCheckpoint); items_high += 1;}
		else if (items_mid < 5) {Rarity += Math.round(KDRandom() * 3); items_mid += 1;}

		let item = KinkyDungeonGetShopItem(Level, Rarity, true);
		if (item)
			KDGameData.ShopItems.push({name: item.name, shoptype: item.shoptype, consumable: item.consumable, quantity: item.quantity, rarity: item.rarity, cost: item.cost});
	}
	KDGameData.ShopItems.sort(function(a, b){return a.rarity-b.rarity;});
}

/**
 *
 * @param {any} item
 * @param {boolean} [noScale]
 * @param {boolean} [sell]
 * @returns {number}
 */
function KinkyDungeonItemCost(item, noScale, sell) {
	if (item.cost != null) return item.cost;
	if (item.rarity != null) {
		let rarity = item.rarity;
		if (item.costMod) rarity += item.costMod;
		let costt = 5 * Math.round((1 + MiniGameKinkyDungeonLevel/KDLevelsPerCheckpoint/2.5 * (noScale ? 0 : 1))*(50 + 2 * rarity * rarity * 20)/5);
		if (costt > 100) costt = 10 * Math.round(costt / 10);
		if (KinkyDungeonStatsChoice.has("PriceGouging") && !sell) {
			costt *= 5;
		}
		return costt;
	}
	let costs = 15;
	if (KinkyDungeonStatsChoice.has("PriceGouging") && !sell) {
		costs *= 5;
	}
	return costs;
}

function KinkyDungeonShrineCost(type) {
	let mult = 1.0;
	let growth = 1.0;
	let noMult = false;

	if (type == "Commerce" && KinkyDungeonShopIndex < KDGameData.ShopItems.length) {
		if (!KDGameData.ShopItems) KDGameData.ShopItems = [];
		let item = KDGameData.ShopItems[KinkyDungeonShopIndex];
		return Math.round(KinkyDungeonItemCost(item));
	} else if (KinkyDungeonShrineTypeRemove.includes(type)) {
		let rest = KinkyDungeonGetRestraintsWithShrine(type);
		let maxPower = 1;
		for (let r of rest) {
			if (KDRestraint(r).power > maxPower) maxPower = KDRestraint(r).power;
		}
		mult = Math.sqrt(Math.max(1, Math.min(KDShrineRemoveCount, rest.length)));
		mult *= Math.pow(Math.max(1, maxPower), 0.75);
		noMult = true;
	} else if (type == "Will") {
		let value = 0;
		value += 120 * (1 - KinkyDungeonStatWill/KinkyDungeonStatWillMax);
		value += 70 * (1 - KinkyDungeonStatMana/KinkyDungeonStatManaMax);
		return Math.round(Math.round(value/10)*10 * (1 + 0.01 * KinkyDungeonDifficulty));
	}
	if (KinkyDungeonShrineBaseCostGrowth[type]) growth = KinkyDungeonShrineBaseCostGrowth[type];
	if (KinkyDungeonShrineCosts[type] > 0 && !noMult) mult = Math.pow(growth, KinkyDungeonShrineCosts[type]);

	if (type == "Conjure" || type == "Illusion" || type == "Elements")
		return Math.round(150 * (1 + 0.01 * KinkyDungeonDifficulty));

	return Math.round(Math.round(KinkyDungeonShrineBaseCosts[type] * mult/10)*10 * (1 + 0.01 * KinkyDungeonDifficulty));
}

function KDAddBasic(item) {
	if (item.name == "RedKey") {
		KinkyDungeonRedKeys += 1;
	} else if (item.name == "BlueKey") {
		KinkyDungeonBlueKeys += 1;
	} else if (item.name == "Lockpick") {
		KinkyDungeonLockpicks += 1;
	} else if (item.name == "2Lockpick") {
		KinkyDungeonLockpicks += 2;
	} else if (item.name == "4Lockpick") {
		KinkyDungeonLockpicks += 4;
	} else if (item.name == "MaidUniform") {
		KinkyDungeonInventoryAddOutfit("Maid");
	} else if (item.consumable) {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables[item.consumable], item.quantity);
	}
}

function KinkyDungeonPayShrine(type) {
	KinkyDungeonGold -= KinkyDungeonShrineCost(type);
	let ShrineMsg = "";
	let rep = 0;

	// TODO shrine effects
	if (KinkyDungeonShrineTypeRemove.includes(type)) {
		rep = KinkyDungeonRemoveRestraintsWithShrine(type, KDShrineRemoveCount);
		KinkyDungeonChangeRep("Ghost", -rep);

		ShrineMsg = TextGet("KinkyDungeonPayShrineRemoveRestraints");
		KDSendStatus('goddess', type, 'shrineRemove');
	} else if (type == "Elements" || type == "Illusion" || type == "Conjure") {
		ShrineMsg = TextGet("KinkyDungeonPayShrineBuff" + type).replace("SCHOOL", TextGet("KinkyDungeonSpellsSchool" + type));
		if (type == "Elements") {
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "ShrineElements", type: "event", maxCount: 10, tags: ["offense", "shrineElements"], aura: "#f1641f", power: 1.5, duration: 9999, events: [
				{trigger: "afterDamageEnemy", type: "ShrineElements", spell: "ArcaneStrike"},
			]});
		} else if (type == "Conjure") {
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "ShrineConjure", type: "event", maxCount: 10, tags: ["defense", "shrineConjure"], aura: "#4572e3", power: 1.5, duration: 9999, events: [
				{trigger: "beforeAttack", type: "CounterattackSpell", spell: "ArcaneStrike", requiredTag: "shrineConjure", prereq: "hit-hostile"},
			]});
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "ShrineConjure2", type: "SpellResist", maxCount: 10, tags: ["defense", "shrineConjure"], power: 5, duration: 9999});
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "ShrineConjure3", type: "Armor", maxCount: 10, tags: ["defense", "shrineConjure"], power: 5, duration: 9999});
		} else if (type == "Illusion") {
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "ShrineIllusion", type: "event", maxCount: 10, tags: ["defense", "shrineIllusion"], aura: "#9052bc", power: 1.5, duration: 9999, events: [
				{trigger: "playerAttack", type: "ShadowStep", time: 6, requiredTag: "shrineIllusion"},
			]});
		}
		KDSendStatus('goddess', type, 'shrineDonate');
		rep = 2.5;
	} else if (type == "Will") {
		rep = Math.ceil(5 - KinkyDungeonStatMana * 1.5 / KinkyDungeonStatManaMax - KinkyDungeonStatWill * 3.5 / KinkyDungeonStatWillMax);
		KinkyDungeonChangeMana(KinkyDungeonStatManaMax, false, 0, false, true);
		KinkyDungeonChangeWill(KDWillShrineWill * KinkyDungeonStatWillMax);
		KinkyDungeonNextDataSendStatsTime = 0;

		ShrineMsg = TextGet("KinkyDungeonPayShrineHeal");
		KDSendStatus('goddess', type, 'shrineHeal');
	} else if (type == "Commerce") {
		let item = KDGameData.ShopItems[KinkyDungeonShopIndex];
		if (item) {
			if (item.shoptype == "Consumable")
				KinkyDungeonChangeConsumable(KinkyDungeonConsumables[item.name], 1);
			else if (item.shoptype == "Weapon")
				KinkyDungeonInventoryAddWeapon(item.name);
			else if (item.shoptype == "Restraint") {
				let restraint = KinkyDungeonGetRestraintByName(item.name);
				KinkyDungeonInventoryAdd({name: item.name, type: LooseRestraint, events:restraint.events});
			}
			else if (item.shoptype == "Basic") {
				KDAddBasic(item);
			}
			ShrineMsg = TextGet("KinkyDungeonPayShrineCommerce").replace("ItemBought", TextGet("KinkyDungeonInventoryItem" + item.name));
			KDGameData.ShopItems.splice(KinkyDungeonShopIndex, 1);
			if (KinkyDungeonShopIndex > 0) KinkyDungeonShopIndex -= 1;

			rep = item.rarity + 1;
			KDSendStatus('goddess', type, 'shrineBuy');
		}
	}

	if (ShrineMsg) KinkyDungeonSendActionMessage(10, ShrineMsg, "lightblue", 1);

	if (KinkyDungeonShrineCosts[type] > 0) KinkyDungeonShrineCosts[type] = KinkyDungeonShrineCosts[type] + 1;
	else KinkyDungeonShrineCosts[type] = 1;

	if (rep != 0) {
		KinkyDungeonChangeRep(type, rep);
	}
}

function KinkyDungeonHandleShrine() {
	let cost = 0;
	let type = KinkyDungeonTargetTile.Name;

	if (KinkyDungeonShrineAvailable(type)) cost = KinkyDungeonShrineCost(type);

	if (type == "Commerce") {
		if (cost > 0) {
			if (MouseIn(KDModalArea_x + 410, KDModalArea_y + 25, 112-15, 60) && cost <= KinkyDungeonGold) {
				KDSendInput("shrineBuy", {type: type, shopIndex: KinkyDungeonShopIndex});
				return true;
			}
			else if (MouseIn(KDModalArea_x + 613, KDModalArea_y + 25, 112, 60)) {
				KinkyDungeonShopIndex = (KinkyDungeonShopIndex + 1) % KDGameData.ShopItems.length;

				return true;
			}

		}
	}
	return false;
}

function KinkyDungeonDrawShrine() {
	let cost = 0;
	let type = KinkyDungeonTargetTile.Name;
	KDModalArea = true;

	if (KinkyDungeonShrineAvailable(type)) cost = KinkyDungeonShrineCost(type);

	if (type == "Commerce") {
		if (cost == 0) {
			DrawTextKD(TextGet("KinkyDungeonLockedShrine"), KDModalArea_x, KDModalArea_y, "#ffffff", KDTextGray2);
		} else {
			FillRectKD(kdcanvas, kdpixisprites, "shopbg", {
				Left: KDModalArea_x - 25,
				Top: KDModalArea_y + 80 - KDGameData.ShopItems.length * 50,
				Width: 800,
				Height: KDGameData.ShopItems.length * 50 + 20,
				Color: KDTextGray0,
				LineWidth: 1,
				zIndex: 60,
				alpha: 0.4,
			});
			// Wrap around shop index to prevent errors
			if (KinkyDungeonShopIndex > KDGameData.ShopItems.length) {
				KinkyDungeonShopIndex = 0;
			} else if (KDGameData.ShopItems.length > 0 && KDGameData.ShopItems[KinkyDungeonShopIndex]) {
				// Draw the item and cost
			}

			DrawButtonVis(KDModalArea_x + 410, KDModalArea_y + 25, 112-15, 60, TextGet("KinkyDungeonCommercePurchase").replace("ItemCost", "" + cost), (cost <= KinkyDungeonGold) ? "White" : "Pink", "", "");

			// Draw the list of shop items
			let ii = 0;
			for (let l of KDGameData.ShopItems) {
				DrawTextFitKD(TextGet("KinkyDungeonInventoryItem" + l.name), KDModalArea_x + 175/2, KDModalArea_y + 65 - ii * 50, 175, KDGameData.ShopItems[KinkyDungeonShopIndex].name == l.name ? "white" : KDTextGray3, KDTextGray2);
				DrawTextFitKD(TextGet("KinkyDungeonCommerceCost").replace("ItemCost", "" + KinkyDungeonItemCost(l)), KDModalArea_x + 300, KDModalArea_y + 65 - ii * 50, 100, KDGameData.ShopItems[KinkyDungeonShopIndex].name == l.name ? "white" : KDTextGray3, KDTextGray2);
				ii++;
			}
			let wrapAmount = TranslationLanguage == 'CN' ? 15 : 40;
			let textSplit = KinkyDungeonWordWrap(TextGet("KinkyDungeonInventoryItem" + KDGameData.ShopItems[KinkyDungeonShopIndex].name + "Desc"), wrapAmount, 40).split('\n');
			let textSplit2 = KinkyDungeonWordWrap(TextGet("KinkyDungeonInventoryItem" + KDGameData.ShopItems[KinkyDungeonShopIndex].name +  "Desc2"), wrapAmount, 40).split('\n');
			let i = 0;
			for (let N = 0; N < textSplit.length; N++) {
				DrawTextFitKD(textSplit[N],
					KDModalArea_x+565, KDModalArea_y + 120 - KDGameData.ShopItems.length * 50 + i * 50, 380 * (textSplit[N].length / 40), "white");
				i++;
			}
			i += 1;
			for (let N = 0; N < textSplit2.length; N++) {
				DrawTextFitKD(textSplit2[N],
					KDModalArea_x+565, KDModalArea_y + 120 - KDGameData.ShopItems.length * 50 + i * 50, 380 * (textSplit2[N].length / 40), "white");
				i++;
			}
			// Next button
			DrawButtonVis(KDModalArea_x + 613, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonCommerceNext"), "White", "", "");
		}
	} else {
		DrawButtonKDEx("shrineUse", (bdata) => {
			KDSendInput("shrineUse", {type: type, cost: cost, targetTile: KinkyDungeonTargetTileLocation});
			KinkyDungeonTargetTileLocation = "";
			KinkyDungeonTargetTile = null;
			return true;
		}, cost > 0, KDModalArea_x, KDModalArea_y + 25, 325, 60, TextGet(cost > 0 ? "KinkyDungeonPayShrine" : "KinkyDungeonPayShrineCant").replace("XXX", "" + cost), cost > 0 ? "#ffffff" : KDTextGray2, "", "");
		DrawButtonKDEx("drinkShrine", (bdata) => {
			KDSendInput("shrineDrink", {type: type, targetTile: KinkyDungeonTargetTileLocation});
			return true;
		}, true,KDModalArea_x + 350, KDModalArea_y + 25, 200, 60, TextGet("KinkyDungeonDrinkShrine"), (KDCanDrinkShrine(false)) ? "#AAFFFF" : KDTextGray2, "", "");
		DrawButtonKDEx("bottleShrine", (bdata) => {
			KDSendInput("shrineBottle", {type: type, targetTile: KinkyDungeonTargetTileLocation});
			return true;
		}, true, KDModalArea_x + 575, KDModalArea_y + 25, 200, 60, TextGet("KinkyDungeonBottleShrine"), (KDCanDrinkShrine(true)) ? "#AAFFFF" : KDTextGray2, "", "");
	}
}

/**
 * @type {Record<string, {require: string[], requireSingle: string[], filter?: string[]}>}
 */
let KDGoddessRevengeMobTypes = {
	Rope: {require: undefined, requireSingle: ["ropeTrap", "rope"], filter: ["human", "immobile"]},
	Latex: {require: undefined, requireSingle: ["slime", "latexTrap", "latex"], filter: ["human", "immobile"]},
	Metal: {require: undefined, requireSingle: ["metalTrap", "metal"], filter: ["human", "immobile"]},
	Leather: {require: undefined, requireSingle: ["leatherTrap", "leather"], filter: ["human", "immobile"]},
	Elements: {require: ["elemental"], requireSingle: ["fire", "water", "earth", "air"], filter: ["human", "immobile"]},
	Will: {requireSingle: ["nature", "beast"], require: undefined, filter: ["human", "immobile"]},
	Conjure: {require: [], requireSingle: ["book", "ribbon", "familiar"], filter: ["human", "immobile"]},
	Illusion: {require: ["ghost"], requireSingle: ["spooky"], filter: ["immobile"]},
};

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string} Goddess
 * @param {number} [mult]
 * @param {number} [LevelBoost]
 * @returns {number}
 */
function KDSummonRevengeMobs(x, y, Goddess, mult = 1.0, LevelBoost = 2) {
	let spawned = 0;
	let maxspawn = 1 + Math.round(Math.min(2 + KDRandom() * 2, KinkyDungeonDifficulty/25) + Math.min(2 + KDRandom() * 2, 0.5*MiniGameKinkyDungeonLevel/KDLevelsPerCheckpoint));
	if (mult) maxspawn *= mult;

	let types = KDGoddessRevengeMobTypes[Goddess];

	let requireTags = types ? types.require : undefined;
	let requireSingleTag = types ? types.requireSingle : undefined;
	let filter = types ? types.filter : undefined;

	let tags = ["revenge"];
	KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);

	for (let i = 0; i < 30 + maxspawn; i++) {
		if (spawned < maxspawn) {
			let Enemy = KinkyDungeonGetEnemy(
				tags, MiniGameKinkyDungeonLevel + LevelBoost,
				KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
				'0', requireTags, false, undefined, filter, requireSingleTag);
			if (Enemy) {
				let pass = KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, Enemy.name, 1, 10, false, undefined, i < 24, false, "Ambush", true, 1.5, true, undefined, true, true);

				if (pass) {
					if (Enemy.tags.minor) spawned += 0.4;
					else spawned += 1;
				}
			}
		}
	}
	return spawned;
}

/**
 *
 * @param {boolean} Bottle - Is this bottling or drinking?
 * @returns {boolean}
 */
function KDCanDrinkShrine(Bottle) {
	if (Bottle && KinkyDungeonIsHandsBound(true, true)) return false;
	return !KinkyDungeonTargetTile.drunk && (Bottle || KinkyDungeonStatMana < KinkyDungeonStatManaMax || KinkyDungeonStatManaPool < KinkyDungeonStatManaPoolMax || KinkyDungeonPlayerTags.get("slime"));
}

function KinkyDungeonShrineAngerGods(Type) {
	if (Type == "Elements") {
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapGag"), 0, true, KinkyDungeonGenerateLock(true));

		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("ChainArms"), 2, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("ChainLegs"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapVibe"), 0, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("ChainCrotch"), 0, true, KinkyDungeonGenerateLock(true));

	} else if (Type == "Latex") {
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapGag"), 0, true, KinkyDungeonGenerateLock(true));

		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("LatexStraitjacket"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("LatexLegbinder"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("LatexBoots"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("LatexCorset"), 0, true, KinkyDungeonGenerateLock(true));

		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapVibe"), 0, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("ChainCrotch"), 0, true, KinkyDungeonGenerateLock(true));

	} else if (Type == "Conjure" || Type == "Rope") {
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapGag"), 0, true, KinkyDungeonGenerateLock(true));

		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("StrongMagicRopeArms"), 4, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("StrongMagicRopeLegs"), 0, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("StrongMagicRopeCrotch"), 2, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapVibe"), 0, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("StrongMagicRopeFeet"), 0, true);


	} else if (Type == "Illusion") {
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapGag"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBlindfold"), 0, true, KinkyDungeonGenerateLock(true));

		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapMittens"), 0, true, KinkyDungeonGenerateLock(true));

		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapVibe"), 0, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), 0, true, KinkyDungeonGenerateLock(true));
	} else if (Type == "Leather") {
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapHarness"), 4, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapGag"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBlindfold"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBoots"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("SturdyLeatherBeltsFeet"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("SturdyLeatherBeltsLegs"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapArmbinder"), 4, true, KinkyDungeonGenerateLock(true));
	} else if (Type == "Metal") {
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapGag"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WristShackles"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("AnkleShackles"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("LegShackles"), 0, true, KinkyDungeonGenerateLock(true));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapVibe"), 0, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), 0, true, KinkyDungeonGenerateLock(true));
	} else if (Type == "Will") {
		KinkyDungeonStatMana = 0;
		KinkyDungeonStatStamina = 0;
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("GhostCollar"), 0, true);
	}
	if (KinkyDungeonGoddessRep[Type] < -45) {
		KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, "OrbGuardian", 3 + Math.floor(Math.sqrt(1 + MiniGameKinkyDungeonLevel)), 10, false, 30);
	}
	KinkyDungeonChangeRep(Type, -10);
}

function KinkyDungeonGetSetPieces(Dict) {
	let ret = [];
	for (let sh of Dict) {
		if (sh.Type) {
			ret.push(sh.Type);
		}
	}
	return ret;
}

function KinkyDungeonGetMapShrines(Dict) {
	let ret = [];
	for (let sh of Dict) {
		if (sh.Type) {
			ret.push(sh.Type);
		}
	}
	return ret;
}

function KinkyDungeonTakeOrb(Amount, X, Y) {
	KinkyDungeonSetFlag("NoDialogue", 3);
	KinkyDungeonDrawState = "Orb";
	KinkyDungeonOrbAmount = Amount;
	KDOrbX = X;
	KDOrbY = Y;
}
function KinkyDungeonDrawOrb() {

	MainCanvas.textAlign = "center";
	DrawTextKD(TextGet("KinkyDungeonOrbIntro" + (KinkyDungeonStatsChoice.get("randomMode") ? "Kinky" : "")), 1250, 200, "#ffffff", KDTextGray2);
	DrawTextKD(TextGet("KinkyDungeonOrbIntro2"), 1250, 250, "#ffffff", KDTextGray2);
	let i = 0;
	let maxY = 560;
	let XX = 500;
	let spacing = 60;
	let yPad = 150;
	MainCanvas.textAlign = "center";
	for (let shrine in KinkyDungeonShrineBaseCosts) {
		let value = KinkyDungeonGoddessRep[shrine];

		if (value != undefined) {
			if (spacing * i > maxY) {
				if (XX == 0) i = 0;
				XX = 600;
			}
			let color = "#ffff00";
			if (value < -10) {
				if (value < -30) color = "#ff0000";
				else color = "#ff8800";
			} else if (value > 10) {
				if (value > 30) color = "#00ff00";
				else color = "#88ff00";
			}
			DrawButtonVis(canvasOffsetX_ui + XX, yPad + canvasOffsetY_ui + spacing * i - 27, 250, 55, TextGet("KinkyDungeonShrine" + shrine), "white");
			DrawProgressBar(canvasOffsetX_ui + 275 + XX, yPad + canvasOffsetY_ui + spacing * i - spacing/4, 200, spacing/2, 50 + value, color, KDTextGray2);

			i++;
		}

	}

	DrawButtonVis(canvasOffsetX_ui + 525, yPad + canvasOffsetY_ui + spacing * i, 425, 55, TextGet("KinkyDungeonSurpriseMe"), "white");
	i += 2;
	DrawButtonKDEx("cancelorb", (bdata) => {
		KinkyDungeonDrawState = "Game";
		return true;
	}, true, canvasOffsetX_ui + 525, yPad + canvasOffsetY_ui + spacing * i, 425, 55, TextGet("KinkyDungeonCancel"), "white");

	MainCanvas.textAlign = "center";
}

let KDOrbX = 0;
let KDOrbY = 0;

function KinkyDungeonHandleOrb() {
	let Amount = KinkyDungeonOrbAmount;
	let i = 0;
	let maxY = 560;
	let XX = 500;
	let spacing = 60;
	let yPad = 150;
	for (let shrine in KinkyDungeonShrineBaseCosts) {
		let value = KinkyDungeonGoddessRep[shrine];

		if (value != undefined) {
			if (spacing * i > maxY) {
				if (XX == 0) i = 0;
				XX = 600;
			}
			if (MouseIn(canvasOffsetX_ui + XX, yPad + canvasOffsetY_ui + spacing * i - 27, 250, 55)) {
				KDSendInput("orb", {shrine: shrine, Amount: Amount, x: KDOrbX, y: KDOrbY});
				KinkyDungeonDrawState = "Game";
				return true;
			}
			i++;
		}

	}

	if (MouseIn(canvasOffsetX_ui + 525, yPad + canvasOffsetY_ui + spacing * i, 425, 55)) {
		let shrine = Object.keys(KinkyDungeonShrineBaseCosts)[Math.floor(KDRandom() * Object.keys(KinkyDungeonShrineBaseCosts).length)];
		if (KinkyDungeonMapGet(KDOrbX, KDOrbY) == 'O') {
			if (KinkyDungeonGoddessRep[shrine] < -45) {
				KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, "OrbGuardian", 3 + Math.floor(Math.sqrt(1 + MiniGameKinkyDungeonLevel)), 10, false, 30);
			}
			KinkyDungeonChangeRep(shrine, Amount * -9);
			if (KinkyDungeonStatsChoice.get("randomMode")) {
				let spell = null;
				let spellList = [];
				let maxSpellLevel = 4;

				for (let k of Object.keys(KinkyDungeonSpellList)) {
					for (let sp of KinkyDungeonSpellList[k]) {
						if (KinkyDungeonCheckSpellPrerequisite(sp) && sp.school == k && !sp.secret) {
							for (let iii = 0; iii < maxSpellLevel - sp.level; iii++) {
								if (sp.level == 1 && KinkyDungeonStatsChoice.get("Novice"))
									spellList.push(sp);
								spellList.push(sp);
							}

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

				if (spell) {
					KinkyDungeonSpells.push(spell);
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonOrbSpell").replace("SPELL", TextGet("KinkyDungeonSpell" + spell.name)), "lightblue", 2);
				}
			} else {
				KinkyDungeonSpellPoints += Amount;
			}
			KinkyDungeonMapSet(KDOrbX, KDOrbY, 'o');
		}

		KinkyDungeonDrawState = "Game";
		return true;
	}


	return true;
}

let KDPerkConfirm = false;
let KDPerkOrbPerks = [];
function KinkyDungeonTakePerk(Amount, X, Y) {
	KinkyDungeonSetFlag("NoDialogue", 3);
	KDPerkOrbPerks = KinkyDungeonTilesGet(X + "," + Y).Perks;
	KinkyDungeonDrawState = "PerkOrb";
	KinkyDungeonOrbAmount = Amount;
	KDOrbX = X;
	KDOrbY = Y;
}
function KinkyDungeonDrawPerkOrb() {
	let bwidth = 350;
	let bheight = 64;
	let Twidth = 1250;

	MainCanvas.textAlign = "center";
	DrawTextKD(TextGet("KinkyDungeonPerkIntro"), 1250, 200, "#ffffff", KDTextGray2);
	DrawTextKD(TextGet("KinkyDungeonPerkIntro2"), 1250, 250, "#ffffff", KDTextGray2);

	let count = 0;
	let pspacing = 120;
	for (let p of KDPerkOrbPerks) {
		DrawTextFitKD(TextGet("KinkyDungeonStat" + KinkyDungeonStatsPresets[p].id), 1250, 350 + count * pspacing, Twidth, "#ffffff", KDTextGray2, 30);
		DrawTextFitKD(TextGet("KinkyDungeonStatDesc" + KinkyDungeonStatsPresets[p].id), 1250, 385 + count * pspacing, Twidth, "#ffffff", KDTextGray2, 22);
		FillRectKD(kdcanvas, kdpixisprites, "bg_" + KinkyDungeonStatsPresets[p].id, {
			Left: 1250-Twidth/2 - 10,
			Top: 350 + count * pspacing - 30,
			Width: Twidth + 20,
			Height: 70 + 20,
			Color: KDTextGray0,
			LineWidth: 1,
			zIndex: 60,
			alpha: 0.7,
		});
		count += 1;
	}

	if (KDPerkConfirm) {
		DrawTextFitKD(TextGet("KinkyDungeonPerkConfirm"), 1250, 720, 1300, "#ffffff", KDTextGray2, 30);
	}

	DrawButtonKDEx("accept", (bdata) => {
		if (KDPerkConfirm) {
			KDSendInput("perkorb", {shrine: "perk", perks: KDPerkOrbPerks, Amount: 1, x: KDOrbX, y: KDOrbY});
			KinkyDungeonDrawState = "Game";
		}
		KDPerkConfirm = true;
		return true;
	}, true, 1250 - bwidth/2, 750, bwidth, bheight, TextGet("KinkyDungeonPerkAccept" + (KDPerkConfirm ? "Confirm" : "")), "#ffffff");

	DrawButtonKDEx("reject", (bdata) => {
		KinkyDungeonDrawState = "Game";
		return true;
	}, true, 1250 - bwidth/2, 750 + 80, bwidth, bheight, TextGet("KinkyDungeonPerkReject"), "#ffffff");

	MainCanvas.textAlign = "center";
}
