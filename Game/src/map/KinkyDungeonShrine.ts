"use strict";

/**
 * Base costs for all the shrines. Starts at this value, increases thereafter
 */
let KinkyDungeonShrineBaseCosts: Record<string, number> = {
	//"Charms": 25,
	"Leather": 40,
	"Latex": 40,
	"Rope": 20,
	"Metal": 60,
	"Will": 20,
	"Elements": 200,
	"Conjure": 200,
	"Illusion": 200,
};

let KDRewardProgramScaling = 500;
let KDRewardProgramBase = 500;

let KDWillShrineWill = 0.25;
let KinkyDungeonOrbAmount = 0;
let KDShrineRemoveCount = 30;
let KDMaxGoddessBonus = 0.2;
let KDMinGoddessBonus = 0.15;

/**
 * Cost growth, overrides the default amount
 */
let KinkyDungeonShrineBaseCostGrowth: Record<string, number> = {
	"Elements": 2,
	"Conjure": 2,
	"Illusion": 2,
};

let KinkyDungeonShopIndex = 0;

let KinkyDungeonShrinePoolChancePerUse = 0.2;

/**
 * Current costs multipliers for shrines
 */
let KinkyDungeonShrineCosts: Record<string, number> = {};

let KinkyDungeonShrineTypeRemove = ["Charms", "Leather", "Metal", "Rope", "Latex", "Gags", "Blindfolds", "Boots"]; // These shrines will always remove restraints associated with their shrine

function KinkyDungeonShrineInit() {
	KinkyDungeonShrineCosts = {};
	KDMapData.PoolUsesGrace = 3;

	KinkyDungeonInitReputation();

}


/**
 * @param Name
 */
function KDGoddessColor(Name: string): string {
	let color = "#ffffff";
	if (Name == "Illusion") color = "#8154FF";
	else if (Name == "Conjure") color = "#D4AAFF";
	else if (Name == "Elements") color = "#ff5277";
	else if (Name == "Latex") color = "#2667FF";
	else if (Name == "Leather") color = "#442E1E";
	else if (Name == "Metal") color = "#222222";
	else if (Name == "Rope") color = "#7C4926";
	else if (Name == "Will") color = "#23FF44";
	return color;
}

function KinkyDungeonShrineAvailable(type: string): boolean {
	if (type == "Commerce") {
		if (KDMapData.ShopItems.length > 0) return true;
		else return false;
	}
	if (KinkyDungeonShrineTypeRemove.includes(type) && KinkyDungeonGetRestraintsWithShrine(type, undefined, undefined, undefined,
		KinkyDungeonStatsChoice.get("ExclusionsApply")).length > 0) return true;
	else if ((type == "Elements" || type == "Illusion" || type == "Conjure")) return true;
	else if (type == "Will" && (KinkyDungeonStatMana < KinkyDungeonStatManaMax || KinkyDungeonStatManaPool < KinkyDungeonStatManaPoolMax || KinkyDungeonStatWill < KinkyDungeonStatWillMax)) return true;

	return false;
}

let KDLevelsPerCheckpoint = 4;

/**
 * @param Level
 */
function KinkyDungeonGenerateShop(Level: number): any[] {
	let ShopItems = [];
	let items_mid = 0;
	let items_high = 0;
	let itemCount = 8 + Math.floor(KDRandom() * 3);
	if (KinkyDungeonStatsChoice.has("Supermarket")) {
		items_mid = -1;
		items_high = -1;
		itemCount += 2;
	}
	let uniqueTags: Record<string, boolean> = {};
	for (let I = itemCount; I > 0; I--) {
		let Rarity = Math.floor(KDRandom() * 0.4 * KDMaxRarity/KinkyDungeonMaxLevel*Level);
		if (items_high < 3) {
			Rarity = 2 + Math.floor(KDMaxRarity/KinkyDungeonMaxLevel*Level);
			items_high += 1;}
		else if (items_mid < 5) {
			Rarity = Math.floor(KDRandom() + (0.4+KDRandom() * 0.35) * KDMaxRarity/KinkyDungeonMaxLevel*Level);
			items_mid += 1;}

		let item = KinkyDungeonGetShopItem(Level, Rarity, true, ShopItems, uniqueTags);
		if (item) {
			if (item.uniqueTags) {
				for (let t of item.uniqueTags) {
					uniqueTags[t] = true;
				}
			}
			ShopItems.push({name: item.name, shoptype: item.shoptype, consumable: item.consumable, quantity: item.quantity, rarity: item.rarity, cost: item.cost});
		}

	}
	ShopItems.sort(function(a, b){return a.rarity-b.rarity;});
	return ShopItems;
}

/**
 * @param item - needs to be an item or a shopItem
 * @param [noScale]
 * @param [sell]
 */
function KinkyDungeonItemCost(item: any, noScale?: boolean, sell?: boolean): number {
	if (!item) return 0;
	if (item.cost != null) return item.cost;

	if (KDRestraint(item)) {
		let restraint = KDRestraint(item);
		let power = restraint.displayPower || restraint.power;
		if (!power || power < 0.1) power = 0.1;
		if (restraint.armor) power += 3;
		if (restraint.protection) power += 3*restraint.protection;
		if (KinkyDungeonRestraintVariants[item.inventoryVariant || item.name]) {
			let enchants: Record<string, number> = {};
			for (let ev of KinkyDungeonRestraintVariants[item.inventoryVariant || item.name].events) {
				if (ev.original && KDEventEnchantmentModular[ev.original]) enchants[ev.original] = KDEventEnchantmentModular[ev.original].types[KDModifierEnum[item.type || 'restraint']].level;
			}
			let sum = 0;
			for (let amt of Object.values(enchants)) {
				sum += amt;
			}
			power += sum;
		}
		let costt = KDRestraint(item).value || (
			//Math.ceil((1 + MiniGameKinkyDungeonLevel/KDLevelsPerCheckpoint/2.5 * (noScale ? 0 : 1))*(
			//sell ? (40 * (-0.5*power-0.6+1.25**(2.38*power)))
			//: (50 * 1.25**(2.38*power))
			//))
			Math.round(((1 - 3.67*power + 3.54*(power**0.5) + 2 * Math.pow(power, 1.6))))
			//b=((1-3.67\cdot x\ +3.54\cdot\ x^{0.5}+2\cdot x^{1.6}))
		);


		//(5 * Math.round(((10 + 2 * Math.pow(power, 1.5)))/5));
		if (KinkyDungeonStatsChoice.has("PriceGouging") && !sell) {
			costt *= 5;
		}
		return costt;
	}
	let rarity = item.rarity || KDWeapon(item)?.rarity || KDConsumable(item)?.rarity || KDOutfit(item)?.rarity || 0;
	if (rarity != undefined) {
		let costMod = item.costMod || KDWeapon(item)?.costMod || KDConsumable(item)?.costMod || KDOutfit(item)?.costMod || 0;
		if (KDWeapon(item)) costMod += 1;

		if (costMod) rarity += costMod;
		if (KinkyDungeonConsumableVariants[item.name] || KinkyDungeonWeaponVariants[item.name]) {
			let enchants: Record<string, number> = {};
			for (let ev of KinkyDungeonConsumableVariants[item.name] ? KinkyDungeonConsumableVariants[item.name].events : KinkyDungeonWeaponVariants[item.name].events) {
				if (ev.original && KDEventEnchantmentModular[ev.original]) enchants[ev.original] = KDEventEnchantmentModular[ev.original].types[KDModifierEnum[item.type || 'restraint']].level;
			}
			let sum = 0;
			for (let amt of Object.values(enchants)) {
				sum += amt;
			}
			rarity += 0.1*sum;
		}


		let costt = 5 * Math.round((1 + Math.min(KDGetEffLevel(),KinkyDungeonMaxLevel)/KDLevelsPerCheckpoint/2.5 * (noScale ? 0 : 1))*(
			sell ? (40 * (-0.5*rarity-0.6+1.25**(2.38*rarity)))
				: (50 * 1.25**(2.38*rarity))
		)/5);
		if (costt > 100) costt = 10 * Math.round(costt / 10);
		if (KinkyDungeonStatsChoice.has("PriceGouging") && !sell) {
			costt *= 5;
		}
		return costt;
	}
	let costs = 50;
	if (KinkyDungeonStatsChoice.has("PriceGouging") && !sell) {
		costs *= 5;
	}
	return costs;
}

function KinkyDungeonShrineCost(type: string): number {
	let mult = 1.0;
	let growth = 1.0;
	let noMult = false;

	if (type == "Commerce" && KinkyDungeonShopIndex < KDMapData.ShopItems.length) {
		if (!KDMapData.ShopItems) KDMapData.ShopItems = [];
		let item = KDMapData.ShopItems[KinkyDungeonShopIndex];
		return Math.round(KinkyDungeonItemCost(item));
	} else if (KinkyDungeonShrineTypeRemove.includes(type)) {
		let rest = KinkyDungeonGetRestraintsWithShrine(type, undefined, undefined, undefined,
			KinkyDungeonStatsChoice.get("ExclusionsApply"));
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

function KDAddBasic(item: item | shopItem) {
	if (item.name == "RedKey") {
		KDAddConsumable("RedKey", 1);
	} else if (item.name == "BlueKey") {
		KDAddConsumable("BlueKey", 1);
	} else if (item.name == "Lockpick") {
		KDAddConsumable("Pick", 1);
	} else if (item.name == "2Lockpick") {
		KDAddConsumable("Pick", 2);
	} else if (item.name == "4Lockpick") {
		KDAddConsumable("Pick", 4);
	} else if (item.name == "MaidUniform") {
		KinkyDungeonInventoryAddOutfit("Maid");
	} if (KinkyDungneonBasic[item.name]?.outfit) {
		KinkyDungeonInventoryAddOutfit(KinkyDungneonBasic[item.name].outfit);
	} else if (KinkyDungneonBasic[item.name]?.consumable) {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables[KinkyDungneonBasic[item.name].consumable], KinkyDungneonBasic[item.name].quantity || item.quantity);
	}
}

function KinkyDungeonPayShrine(type: string, mult: number = 1) {
	let cost = KinkyDungeonShrineCost(type);
	KinkyDungeonGold -= cost * mult;
	let ShrineMsg = "";
	let rep = 0;

	// TODO shrine effects
	if (KinkyDungeonShrineTypeRemove.includes(type)) {
		rep = Math.min(2, KinkyDungeonRemoveRestraintsWithShrine(type, KDShrineRemoveCount, true, undefined, undefined, undefined, undefined,
			KinkyDungeonStatsChoice.get("ExclusionsApply")) * 0.5);
		KinkyDungeonChangeRep("Ghost", -rep);

		ShrineMsg = TextGet("KinkyDungeonPayShrineRemoveRestraints");
		KDSendStatus('goddess', type, 'shrineRemove');
	} else if (type == "Elements" || type == "Illusion" || type == "Conjure") {
		ShrineMsg = TextGet("KinkyDungeonPayShrineBuff" + type).replace("SCHOOL", TextGet("KinkyDungeonSpellsSchool" + type));
		if (type == "Elements") {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "ShrineElements", type: "event", maxCount: 10, tags: ["offense", "shrineElements"], aura: "#f1641f", power: 1.5, duration: 9999, infinite: true, events: [
				{trigger: "afterDamageEnemy", type: "ShrineElements", spell: "ArcaneStrike"},
			]});
		} else if (type == "Conjure") {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "ShrineConjure", type: "bondageImmune", maxCount: 3, tags: ["defense", "shrineConjure", "bondageResist"], aura: "#4572e3", power: 1.5, duration: 9999, infinite: true, events: [
			//{trigger: "beforeAttack", type: "CounterattackSpell", spell: "ArcaneStrike", requiredTag: "shrineConjure", prereq: "hit-hostile"},
			]});
			//KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "ShrineConjure2", type: "SpellResist", maxCount: 10, tags: ["defense", "shrineConjure", "bondageResist"], power: 5, duration: 9999});
			//KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "ShrineConjure3", type: "Armor", maxCount: 10, tags: ["defense", "shrineConjure", "bondageResist"], power: 5, duration: 9999});
		} else if (type == "Illusion") {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "ShrineIllusion", type: "event", maxCount: 10, tags: ["defense", "shrineIllusion"], aura: "#9052bc", power: 1.5, duration: 9999, infinite: true, events: [
				{trigger: "playerAttack", type: "ShadowStep", time: 6, requiredTag: "shrineIllusion"},
			]});
		}
		KDSendStatus('goddess', type, 'shrineDonate');
		rep = 2;
	} else if (type == "Will") {
		rep = Math.min(2, Math.ceil(5 - KinkyDungeonStatMana * 1.5 / KinkyDungeonStatManaMax - KinkyDungeonStatWill * 3.5 / KinkyDungeonStatWillMax));
		KinkyDungeonChangeMana(KinkyDungeonStatManaMax, false, 0, false, true);
		KinkyDungeonChangeWill(KDWillShrineWill * KinkyDungeonStatWillMax);
		KinkyDungeonNextDataSendStatsTime = 0;

		ShrineMsg = TextGet("KinkyDungeonPayShrineHeal");
		KDSendStatus('goddess', type, 'shrineHeal');
	} else if (type == "Commerce") {
		let item = KDMapData.ShopItems[KinkyDungeonShopIndex];
		if (item) {
			if (item.shoptype == Consumable)
				KinkyDungeonChangeConsumable(KinkyDungeonConsumables[item.name], 1);
			else if (item.shoptype == Weapon)
				KinkyDungeonInventoryAddWeapon(item.name);
			else if (item.shoptype == LooseRestraint) {
				let restraint = KDRestraint(item);
				if (!KinkyDungeonInventoryGetLoose(item.name)) {
					KinkyDungeonInventoryAdd({name: item.name, type: LooseRestraint, events:restraint.events, quantity: 1, id: KinkyDungeonGetItemID()});
				} else {
					if (!KinkyDungeonInventoryGetLoose(item.name).quantity) KinkyDungeonInventoryGetLoose(item.name).quantity = 0;
					KinkyDungeonInventoryGetLoose(item.name).quantity += 1;
				}
				//KinkyDungeonInventoryAdd({name: item.name, id: KinkyDungeonGetItemID(), type: LooseRestraint, events:restraint.events});
			}
			else if (item.shoptype == "basic") {
				KDAddBasic(item);
			}
			ShrineMsg = TextGet("KinkyDungeonPayShrineCommerce").replace("ItemBought", KDGetItemNameString(item.name));
			KDMapData.ShopItems.splice(KinkyDungeonShopIndex, 1);
			if (KinkyDungeonShopIndex > 0) KinkyDungeonShopIndex -= 1;

			KDGameData.ShopRewardProgram += cost*mult;
			let point = KinkyDungeonGetNearbyPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y,
				true, undefined, undefined,
				true, (x, y) => {
					return KinkyDungeonMapGet(x, y) == '0' && !KinkyDungeonTilesGet(x + ',' + y)?.Type;
				});
			if (!KDGameData.ShopRewardProgramThreshold) KDGameData.ShopRewardProgramThreshold = KDRewardProgramBase;
			if (!KDGameData.ShopRewardProgram) KDGameData.ShopRewardProgram = 0;
			if (point && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(point.x, point.y)) && KDGameData.ShopRewardProgram > KDGameData.ShopRewardProgramThreshold) {
				KDGameData.ShopRewardProgram = 0;
				KDGameData.ShopRewardProgramThreshold += KDRewardProgramScaling;
				KinkyDungeonMapSet(point.x, point.y, ';');
				KinkyDungeonTilesSet("" + (point.x) + "," + (point.y), {Portal: "CommercePortal", Light: 5, lightColor: 0xffff88});
			}

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
			//if (MouseIn(KDModalArea_x + 410, KDModalArea_y + 25, 112-15, 60) && cost <= KinkyDungeonGold) {
			//return true;
			//}
			//else if (MouseIn(KDModalArea_x + 613, KDModalArea_y + 25, 112, 60)) {
			//KinkyDungeonShopIndex = (KinkyDungeonShopIndex + 1) % KDMapData.ShopItems.length;
			//

			//return true;
			//}

		}
	}
	return false;
}

function KinkyDungeonDrawShrine() {
	let cost = 0;
	let type = KinkyDungeonTargetTile.Name;
	KDModalArea = true;
	let discount = 1;
	if (KinkyDungeonTargetTile.mult != undefined) discount = KinkyDungeonTargetTile.mult;

	if (KinkyDungeonShrineAvailable(type)) cost = KinkyDungeonShrineCost(type);

	if (type == "Commerce") {
		if (cost == 0) {
			DrawTextKD(TextGet("KinkyDungeonLockedShrine"), KDModalArea_x, KDModalArea_y, "#ffffff", KDTextGray2);
		} else {
			let shopHeight = Math.max(8, KDMapData.ShopItems.length) * 50;

			let YY = 700;
			KDModalArea_y = YY - shopHeight + 80;
			KDModalArea_height = shopHeight + 100;
			KDModalArea_width = 900;

			FillRectKD(kdcanvas, kdpixisprites, "shopbg", {
				Left: KDModalArea_x - 25,
				Top: KDModalArea_y,// + 80 - shopHeight,
				Width: KDModalArea_width + 25,
				Height: shopHeight + 20,
				Color: KDButtonColor,
				LineWidth: 1,
				zIndex: 60,
				alpha: 0.8,
			});
			DrawRectKD(kdcanvas, kdpixisprites, "shopbg2", {
				Left: KDModalArea_x - 25,
				Top: KDModalArea_y,// + 80 - shopHeight,
				Width: KDModalArea_width + 25,
				Height: shopHeight + 20,
				Color: KDBorderColor,
				LineWidth: 1,
				zIndex: 60.1,
				alpha: 1.0,
			});
			// Wrap around shop index to prevent errors
			if (KinkyDungeonShopIndex > KDMapData.ShopItems.length) {
				KinkyDungeonShopIndex = 0;
			} else if (KDMapData.ShopItems.length > 0 && KDMapData.ShopItems[KinkyDungeonShopIndex]) {
				// Draw the item and cost
			}

			DrawButtonKDEx("shrinebuy", (_bdata) => {
				KDSendInput("shrineBuy", {type: type, shopIndex: KinkyDungeonShopIndex});
				return true;
			}, cost <= KinkyDungeonGold, KDModalArea_x + 550, YY + 25, 200, 60, TextGet("KinkyDungeonCommercePurchase").replace("ItemCost", "" + cost*discount), (cost*discount <= KinkyDungeonGold) ? "#ffffff" : "#ff5555", "", "");

			if (KDShopBuyConfirm) {
				DrawTextFitKD(TextGet("KDShopConfirm"),
					KDModalArea_x + 650, YY + 25 - 25, 250, "#88ff88", undefined, 20,);
			}
			// Draw the list of shop items
			let ii = 0;
			for (let l of KDMapData.ShopItems) {
				if (KDMapData.ShopItems[ii]) {
					let index = ii;
					let itemsmall = KDGetItemPreview({name: KDMapData.ShopItems[ii].name, type: KDMapData.ShopItems[ii].shoptype});
					if (itemsmall?.preview)
						KDDraw(kdcanvas, kdpixisprites, "preview" + ii,
							itemsmall.preview, KDModalArea_x - 25, YY + 40 - ii * 50 - 3, 50, 50, undefined,
							{
								zIndex: 69,
							});
					DrawButtonKDEx("l.name" + ii, (_bdata) => {
						KinkyDungeonShopIndex = index;
						return true;
					}, true,
					KDModalArea_x - 20, YY + 40 - ii * 50, 400 + 20 + 20, 45, "", "#444444", "", undefined, false, true, "#000000", undefined, undefined, {
						alpha: 0.4,
						zIndex: 65,
					}
					);
				}
				//175/2
				DrawTextFitKD(TextGet("KinkyDungeonInventoryItem" + l.name), KDModalArea_x + 25, YY + 65 - ii * 50, 200, KinkyDungeonShopIndex == ii ? "white" : KDTextGray3, KDTextGray2, 20, "left", 70);
				DrawTextFitKD(TextGet("KinkyDungeonCommerceCost").replace("ItemCost", "" + KinkyDungeonItemCost(l)), KDModalArea_x + 300 + 50, YY + 65 - ii * 50, 130, KDMapData.ShopItems[KinkyDungeonShopIndex].name == l.name ? "#ffffff" : KDTextGray3, KDTextGray2, 20, undefined, 70);
				ii++;
			}
			let item = KDGetItemPreview({name: KDMapData.ShopItems[KinkyDungeonShopIndex].name, type: KDMapData.ShopItems[KinkyDungeonShopIndex].shoptype});
			if (item?.preview)
				KDDraw(kdcanvas, kdpixisprites, "preview",
					item.preview, KDModalArea_x+650 - 50, YY + 80 - shopHeight, 100, 100, undefined,
					{
						zIndex: 129,
					});

			let data = {
				extraLines: [],
				extraLineColor: [],
				extraLineColorBG: [],
				extraLinesPre: [],
				extraLineColorPre: [],
				extraLineColorBGPre: [],
				SelectedItem: item?.item,
				item: item?.item,
			};
			KinkyDungeonSendEvent("inventoryTooltip", data);
			let mult = KDGetFontMult();
			let textSplit = KinkyDungeonWordWrap(TextGet("KinkyDungeonInventoryItem" + KDMapData.ShopItems[KinkyDungeonShopIndex].name + "Desc"),
				15*mult, 40*mult).split('\n');
			let textSplit2 = KinkyDungeonWordWrap(TextGet("KinkyDungeonInventoryItem" + KDMapData.ShopItems[KinkyDungeonShopIndex].name +  "Desc2"),
				15*mult, 40*mult).split('\n');
			let i = 0;
			let descSpacing = 24;
			const encoder = new TextEncoder();
			for (let N = 0; N < textSplit.length; N++) {
				DrawTextFitKD(textSplit[N],
					KDModalArea_x+650, YY + 200 - shopHeight + i * descSpacing, 380 * (encoder.encode(textSplit[N]).length / 40), "#ffffff", undefined, 20, undefined, 70);
				i++;
			}
			i += 1;
			for (let N = 0; N < data.extraLinesPre.length; N++) {
				DrawTextFitKD(data.extraLinesPre[N],
					KDModalArea_x+650, YY + 200 - shopHeight + i * descSpacing, 380 * (encoder.encode(data.extraLinesPre[N]).length / 40), data.extraLineColorPre[N], data.extraLineColorBGPre[N], 20, undefined, 70);
				i++;
			}
			for (let N = 0; N < textSplit2.length; N++) {
				DrawTextFitKD(textSplit2[N],
					KDModalArea_x+650, YY + 200 - shopHeight + i * descSpacing, 380 * (encoder.encode(textSplit2[N]).length / 40), "#ffffff", undefined, 20, undefined, 70);
				i++;
			}
			for (let N = 0; N < data.extraLines.length; N++) {
				DrawTextFitKD(data.extraLines[N],
					KDModalArea_x+650, YY + 200 - shopHeight + i * descSpacing, 380 * (encoder.encode(data.extraLines[N]).length / 40), data.extraLineColor[N], data.extraLineColorBG[N], 20, undefined, 70);
				i++;
			}
			// Next button
			//DrawButtonVis(KDModalArea_x + 613, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonCommerceNext"), "White", "", "");

		}
	} else {
		let YY = 700;

		let II = 0;
		let shrineActionSpacing = 80;
		if (DrawButtonKDEx("shrineUse", (_bdata) => {
			KDSendInput("shrineUse", {type: type, cost: cost*discount, targetTile: KinkyDungeonTargetTileLocation});
			KinkyDungeonTargetTileLocation = "";
			KinkyDungeonTargetTile = null;
			return true;
		}, cost > 0, KDModalArea_x, YY + 25 - II*shrineActionSpacing, 325, 60,
		TextGet(cost > 0 ? "KinkyDungeonPayShrine" : "KinkyDungeonPayShrineCant").replace("XXX", "" + cost*discount), cost > 0 ? "#ffffff" : KDTextGray2, "", "",
		false, false, KDTextGray2))
			DrawTextFitKD(TextGet("KDShrineActionDescOffer"),
				KDModalArea_x+400, YY + 55 - II*shrineActionSpacing, 600, "#ffffff", KDTextGray0, 20, "left", 70);
		II++;
		let tiles = KinkyDungeonRescueTiles();
		let rescueAvailable = tiles.length > 0;
		if (DrawButtonKDEx("shrinePray", (_bdata) => {
			if (rescueAvailable) {
				KDSendInput("shrinePray", {type: type, cost: cost, targetTile: KinkyDungeonTargetTileLocation});
				KinkyDungeonTargetTileLocation = "";
				KinkyDungeonTargetTile = null;
			}
			return true;
		}, !KinkyDungeonTargetTile.Rescue, KDModalArea_x, YY + 25 - II*shrineActionSpacing, 325, 60,
		TextGet("KDShrineActionPray"), KinkyDungeonTargetTile?.Rescue ? KDTextGray2 : "#ffffff", "", "",
		false, false, rescueAvailable ? KDTextGray2 : "#ff5555"))
			DrawTextFitKD(TextGet(KinkyDungeonTargetTile?.Rescue ? "KDShrineActionDescPrayFail" : "KDShrineActionDescPray"),
				KDModalArea_x+400, YY + 55  - II*shrineActionSpacing, 600, "#ffffff", KDTextGray0, 20, "left", 70);
		II++;

		if (DrawButtonKDEx("drinkShrine", (_bdata) => {
			KDSendInput("shrineDrink", {type: type, targetTile: KinkyDungeonTargetTileLocation});
			return true;
		}, true,KDModalArea_x, YY + 25 - II*shrineActionSpacing, 325, 60,
		TextGet("KinkyDungeonDrinkShrine"), (KDCanDrinkShrine(false)) ? "#AAFFFF" : KDTextGray2, "", "",
		false, false, KDTextGray2))
			DrawTextFitKD(TextGet("KDShrineActionDescDrink"),
				KDModalArea_x+400, YY + 55 - II*shrineActionSpacing, 600, "#ffffff", KDTextGray0, 20, "left", 70);

		II++;
		if (DrawButtonKDEx("bottleShrine", (_bdata) => {
			KDSendInput("shrineBottle", {type: type, targetTile: KinkyDungeonTargetTileLocation});
			return true;
		}, true, KDModalArea_x, YY + 25 - II*shrineActionSpacing, 325, 60,
		TextGet("KinkyDungeonBottleShrine"), (KDCanDrinkShrine(true)) ? "#AAFFFF" : KDTextGray2, "", "",
		false, false, KDTextGray2))
			DrawTextFitKD(TextGet("KDShrineActionDescBottle"),
				KDModalArea_x+400, YY + 55 - II*shrineActionSpacing, 600, "#ffffff", KDTextGray0, 20, "left", 70);

		II++;

		if (KDGameData.Champion == type) {
			if (DrawButtonKDEx("shrineDevote", (_bdata) => {
				KDSendInput("shrineDevote", {type: "", cost: cost, targetTile: KinkyDungeonTargetTileLocation});
				KinkyDungeonTargetTileLocation = "";
				KinkyDungeonTargetTile = null;
				return true;
			}, !KinkyDungeonTargetTile.Rescue, KDModalArea_x, YY + 25 - II*shrineActionSpacing, 325, 60,
			TextGet("KDShrineActionChampionRemove"), KinkyDungeonTargetTile?.Rescue ? KDTextGray2 : "#ffffff", "", "",
			false, false, KDTextGray2))
				DrawTextFitKD(TextGet(KDGameData.Champion != type ? "KDShrineActionDescChampionRemoveFail" : "KDShrineActionDescChampionRemove"),
					KDModalArea_x+400, YY + 55  - II*shrineActionSpacing, 600, "#ffffff", KDTextGray0, 20, "left", 70);
		} else {
			if (DrawButtonKDEx("shrineDevote", (_bdata) => {
				KDSendInput("shrineDevote", {type: type, cost: cost, targetTile: KinkyDungeonTargetTileLocation});
				KinkyDungeonTargetTileLocation = "";
				KinkyDungeonTargetTile = null;
				return true;
			}, !KinkyDungeonTargetTile.Rescue, KDModalArea_x, YY + 25 - II*shrineActionSpacing, 325, 60,
			TextGet("KDShrineActionChampion"), KinkyDungeonTargetTile?.Rescue ? KDTextGray2 : "#ffffff", "", "",
			false, false, KDTextGray2))
				DrawTextFitKD(TextGet(KDGameData.Champion == type ? "KDShrineActionDescChampionFail" : "KDShrineActionDescChampion"),
					KDModalArea_x+400, YY + 55  - II*shrineActionSpacing, 600, "#ffffff", KDTextGray0, 20, "left", 70);
		}
		II++;

		if (KinkyDungeonTargetTile?.Quest) {
			if (DrawButtonKDEx("shrineQuest", (_bdata) => {
				KDSendInput("shrineQuest", {type: type, cost: cost, targetTile: KinkyDungeonTargetTileLocation});
				KinkyDungeonTargetTileLocation = "";
				KinkyDungeonTargetTile = null;
				return true;
			}, true, KDModalArea_x, YY + 25 - II*shrineActionSpacing, 325, 60,
			TextGet("KDShrineActionQuestAccept"), "#ffffff", "", "",
			false, false, KDTextGray2))
				DrawTextFitKD(TextGet("KDShrineActionDescQuestAccept"),
					KDModalArea_x+400, YY + 55 - II*shrineActionSpacing, 600, "#ffffff", KDTextGray0, 20, "left", 70);
			II++;
			DrawTextFitKD(TextGet("KDShrineActionQuest"),
				KDModalArea_x+450, YY - II*shrineActionSpacing, 600, "#ffffff", KDTextGray0, 24, "center", 70);
			DrawTextFitKD(TextGet("KDQuest_" + KinkyDungeonTargetTile.Quest),
				KDModalArea_x+450, YY + 50 - II*shrineActionSpacing, 600, "#cc2f7b", KDTextGray0, 32, "center", 70);

			II++;
		}


		let shrineHeight = II*shrineActionSpacing + 40 + (KinkyDungeonTargetTile?.Quest ? 20 : 0);

		KDModalArea_y = YY - shrineHeight + 115;
		KDModalArea_width = 1000;

		FillRectKD(kdcanvas, kdpixisprites, "shrinebg", {
			Left: KDModalArea_x - 25,
			Top: KDModalArea_y,// + 110 - shrineHeight,
			Width: KDModalArea_width + 25,
			Height: shrineHeight,
			Color: KDButtonColor,
			LineWidth: 1,
			zIndex: 60,
			alpha: 0.8,
		});
		DrawRectKD(kdcanvas, kdpixisprites, "shrinebg2", {
			Left: KDModalArea_x - 25,
			Top: KDModalArea_y,// + 110 - shrineHeight,
			Width: KDModalArea_width + 25,
			Height: shrineHeight,
			Color: KDBorderColor,
			LineWidth: 1,
			zIndex: 60.1,
			alpha: 1.0,
		});
	}
}

let KDGoddessRevengeMobTypes: Record<string, {require: string[], requireSingle: string[], filter?: string[]}> = {
	Rope: {require: undefined, requireSingle: ["ropeTrap", "rope"], filter: ["human", "immobile"]},
	Latex: {require: undefined, requireSingle: ["slime", "latexTrap", "latex"], filter: ["human", "immobile"]},
	Metal: {require: undefined, requireSingle: ["metalTrap", "metal"], filter: ["human", "immobile"]},
	Leather: {require: undefined, requireSingle: ["leatherTrap", "leather"], filter: ["human", "immobile"]},
	Elements: {require: ["elemental"], requireSingle: ["fire", "water", "earth", "air"], filter: ["human", "immobile"]},
	Will: {requireSingle: ["nature", "beast"], require: undefined, filter: ["human", "immobile"]},
	Conjure: {require: [], requireSingle: ["book", "ribbon", "familiar"], filter: ["human", "immobile"]},
	Illusion: {require: undefined, requireSingle: ["illusionTrap"], filter: ["immobile"]},
};

/**
 * @param x
 * @param y
 * @param Goddess
 * @param [mult]
 * @param [LevelBoost]
 */
function KDSummonRevengeMobs(_x: number, _y: number, Goddess: string, mult: number = 1.0, LevelBoost: number = 2): number {
	let spawned = 0;
	let maxspawn = 2 + Math.round(Math.min(3 + KDRandom() * 2, KinkyDungeonDifficulty/10) + Math.min(3 + KDRandom() * 2, 1*MiniGameKinkyDungeonLevel/KDLevelsPerCheckpoint));
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
				(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
				'0', requireTags, undefined, undefined, filter, requireSingleTag);
			if (Enemy) {
				let pass = KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, Enemy.name, 1, 10, false, undefined, i < 24, false, "Ambush", true, 1.5, true, undefined, true, true);

				if (pass.length > 0) {
					pass[0].teleporting = 5;
					pass[0].teleportingmax = 5;
					if (Enemy.tags.minor) spawned += 0.4;
					else spawned += 1;
				}
			}
		}
	}
	return spawned;
}

/**
 * @param Bottle - Is this bottling or drinking?
 */
function KDCanDrinkShrine(Bottle: boolean): boolean {
	if (Bottle && KinkyDungeonIsHandsBound(true, true, 0.9)) return false;
	return !KinkyDungeonTargetTile.drunk && (Bottle || KinkyDungeonStatMana < KinkyDungeonStatManaMax || KinkyDungeonStatManaPool < KinkyDungeonStatManaPoolMax || KinkyDungeonPlayerTags.get("slime"));
}

function KinkyDungeonGetSetPieces(Dict: any) {
	let ret = [];
	for (let sh of Dict) {
		if (sh.Type) {
			ret.push(sh.Type);
		}
	}
	return ret;
}

function KinkyDungeonGetMapShrines(Dict: any) {
	let ret = [];
	for (let sh of Dict) {
		if (sh.Type) {
			ret.push(sh.Type);
		}
	}
	return ret;
}

function KinkyDungeonTakeOrb(Amount: number, X: number, Y: number) {
	KinkyDungeonSetFlag("NoDialogue", 3);
	KinkyDungeonDrawState = "Orb";
	KinkyDungeonOrbAmount = Amount;
	KDOrbX = X;
	KDOrbY = Y;
}
function KinkyDungeonDrawOrb() {
	let tile = KinkyDungeonTilesGet(KDOrbX + "," + KDOrbY);
	let spell = tile?.Spell ? KinkyDungeonFindSpell(tile.Spell) : null;
	DrawTextKD(TextGet("KinkyDungeonOrbIntro" + (KinkyDungeonStatsChoice.get("randomMode") ? (
		(!spell || KDHasSpell(spell.name)) ? "KinkyRandom" : "Kinky") : ""))
		.replace("SHCL", TextGet("KinkyDungeonSpellsSchool" + spell?.school))
		.replace("SPLNME", TextGet("KinkyDungeonSpell" + spell?.name))
	, 1250, 150, "#ffffff", KDTextGray2);
	DrawTextKD(TextGet("KinkyDungeonOrbIntro2"), 1250, 200, "#ffffff", KDTextGray2);
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
			let color = "#e7cf1a";
			if (value < -10) {
				if (value < -30) color = "#ff5277";
				else color = "#ff8933";
			} else if (value > 10) {
				if (value > 30) color = "#4fd658";
				else color = "#9bd45d";
			}
			DrawButtonKDEx("orbspell" + shrine, (_b) => {
				KDSendInput("orb", {shrine: shrine, Amount: 1, Rep: 1 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "DivinePrivilege")), x: KDOrbX, y: KDOrbY});
				KinkyDungeonDrawState = "Game";
				return true;
			}, true, canvasOffsetX_ui + XX - 100, yPad + canvasOffsetY_ui + spacing * i - 27, 250, 55, TextGet("KinkyDungeonShrine" + shrine), "white");
			DrawProgressBar(canvasOffsetX_ui + 275 + XX, yPad + canvasOffsetY_ui + spacing * i - spacing/4, 200, spacing/2, 50 + value, color, KDTextGray2);
			if (KinkyDungeonShrineBaseCosts[shrine])
				KDDrawRestraintBonus(shrine, canvasOffsetX_ui + 275 + XX - 70, yPad + canvasOffsetY_ui + spacing * i, undefined, 24);

			i++;
		}

	}

	DrawButtonKDEx("orbspellrandom", (_b) => {
		let shrine = Object.keys(KinkyDungeonShrineBaseCosts)[Math.floor(KDRandom() * Object.keys(KinkyDungeonShrineBaseCosts).length)];
		KDSendInput("orb", {shrine: shrine, Amount: 1, Rep: 0.9 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "DivinePrivilege")), x: KDOrbX, y: KDOrbY});
		KinkyDungeonDrawState = "Game";
		return true;
	}, true, canvasOffsetX_ui + XX - 100, yPad + canvasOffsetY_ui + spacing * i - 27, 250, 55, TextGet("KinkyDungeonSurpriseMe"), "white");
	i += 2;
	DrawButtonKDEx("cancelorb", (_bdata) => {
		KinkyDungeonDrawState = "Game";
		return true;
	}, true, canvasOffsetX_ui + 525, yPad + canvasOffsetY_ui + spacing * i, 425, 55, TextGet("KinkyDungeonCancel"), "white");

}

let KDOrbX = 0;
let KDOrbY = 0;

function KinkyDungeonHandleOrb() {

	return true;
}

let KDPerkConfirm = false;
let KDPerkOrbPerks = [];
let KDPerkOrbBondage = [];
let KDPerkOrbMethod = "Default";
function KinkyDungeonTakePerk(Amount: number, X: number, Y: number) {
	KinkyDungeonSetFlag("NoDialogue", 3);

	KDPerkOrbPerks = KinkyDungeonTilesGet(X + "," + Y).Perks;
	KDPerkOrbBondage = KinkyDungeonTilesGet(X + "," + Y).Bondage;
	KDPerkOrbMethod = KinkyDungeonTilesGet(X + "," + Y).Method;
	KinkyDungeonDrawState = "PerkOrb";
	KinkyDungeonOrbAmount = Amount;
	KDOrbX = X;
	KDOrbY = Y;
}
function KinkyDungeonDrawPerkOrb() {
	let bwidth = 350;
	let bheight = 64;
	let Twidth = 1250;

	if (!StandalonePatched)
		MainCanvas.textAlign = "center";
	DrawTextKD(TextGet("KinkyDungeonPerkIntro"), 1250, 50, "#ffffff", KDTextGray2);
	DrawTextKD(TextGet("KinkyDungeonPerkIntro2"), 1250, 100, "#ffffff", KDTextGray2);

	let count = 0;
	let pspacing = 120;
	for (let p of KDPerkOrbPerks) {
		DrawTextFitKD(TextGet("KinkyDungeonStat" + KinkyDungeonStatsPresets[p].id), 1250, 200 + count * pspacing, Twidth, "#ffffff", KDTextGray2, 30);
		DrawTextFitKD(TextGet("KinkyDungeonStatDesc" + KinkyDungeonStatsPresets[p].id), 1250, 235 + count * pspacing, Twidth, "#ffffff", KDTextGray2, 22);
		FillRectKD(kdcanvas, kdpixisprites, "bg_" + KinkyDungeonStatsPresets[p].id, {
			Left: 1250-Twidth/2 - 10,
			Top: 200 + count * pspacing - 30,
			Width: Twidth + 20,
			Height: 70 + 20,
			Color: KDTextGray0,
			LineWidth: 1,
			zIndex: 60,
			alpha: 0.7,
		});
		count += 1;
	}
	if (KDPerkOrbBondage?.length > 0 && !KinkyDungeonStatsChoice.get("hideperkbondage")) {
		let str = "";
		for (let b of KDPerkOrbBondage) {
			if (str) str = str + ', ';
			str = str + TextGet("Restraint" + b);
		}
		if (KinkyDungeonStatsChoice.get("partialhideperkbondage")) {
			DrawTextFitKD(TextGet("KDBondageOptionPerkHidden"), 1250, 210 + count * pspacing, Twidth, "#ffffff", KDTextGray2, 30);
		} else {
			DrawTextFitKD(TextGet("KDBondageOptionPerk"), 1250, 200 + count * pspacing, Twidth, "#ffffff", KDTextGray2, 24);
			DrawTextFitKD(str, 1250, 235 + count * pspacing, Twidth, "#ffffff", KDTextGray2, 22);
		}

		FillRectKD(kdcanvas, kdpixisprites, "bg_bndg", {
			Left: 1250-Twidth/2 - 10,
			Top: 200 + count * pspacing - 30,
			Width: Twidth + 20,
			Height: 70 + 20,
			Color: KDTextRed1,
			LineWidth: 1,
			zIndex: 60,
			alpha: 0.7,
		});
		count += 1;
	}

	if (KinkyDungeonStatsChoice.get("escapeselect")) {
		DrawTextFitKD(TextGet("KDEscapeMethod_" + KDPerkOrbMethod), 1250, 200 + count * pspacing, Twidth, "#ffffff", KDTextGray2, 30);
		DrawTextFitKD(TextGet("KDEscapeMethodDesc_" + KDPerkOrbMethod), 1250, 235 + count * pspacing, Twidth, "#ffffff", KDTextGray2, 22);

		FillRectKD(kdcanvas, kdpixisprites, "bg_method", {
			Left: 1250-Twidth/2 - 10,
			Top: 200 + count * pspacing - 30,
			Width: Twidth + 20,
			Height: 70 + 20,
			Color: KDTextGreen1,
			LineWidth: 1,
			zIndex: 60,
			alpha: 0.7,
		});
		count += 1;
	}


	if (KDPerkConfirm) {
		DrawTextFitKD(TextGet("KinkyDungeonPerkConfirm"), 1250, 800, 1300, "#ffffff", KDTextGray2, 30);
	}

	DrawButtonKDEx("reject", (_bdata) => {
		KinkyDungeonDrawState = "Game";
		return true;
	}, true, 1250-1300, 850 + 120 - 1000, 2600, 2000, TextGet("KinkyDungeonPerkReject"), "#ffffff", undefined, undefined, undefined, true, undefined, undefined, undefined,
	{
		zIndex: 1,
		alpha: 0,
	});

	DrawButtonKDEx("accept", (_bdata) => {
		if (KDPerkConfirm) {
			KDSendInput("perkorb", {shrine: "perk", perks: KDPerkOrbPerks, bondage: KDPerkOrbBondage, method: KDPerkOrbMethod, Amount: 1, x: KDOrbX, y: KDOrbY});
			KinkyDungeonDrawState = "Game";
		}
		KDPerkConfirm = true;
		return true;
	}, true, 1250 - bwidth/2, 850, bwidth, bheight, TextGet("KinkyDungeonPerkAccept" + (KDPerkConfirm ? "Confirm" : "")), "#ffffff",
	undefined, undefined, undefined, undefined, undefined, undefined, undefined, {
		zIndex: 70,
	});


}

function KDGetPosNegColor(value: number): string {
	return (value ? (value > 0 ? KDGoodColor : KDCurseColor) : "#dddddd");
}

function KDGetGoddessBonus(shrine: string): number {
	if (KinkyDungeonGoddessRep[shrine]) {
		return KinkyDungeonGoddessRep[shrine] / 50 * (KinkyDungeonGoddessRep[shrine] > 0 ? KDMaxGoddessBonus : KDMinGoddessBonus);
	}
	return 0;
}

function KDDrawRestraintBonus(shrine: string, x: number, y: number, width: number = 100, FontSize?: number, align?: string, zIndex?: number, alpha?: number, forceColor?: string) {
	let bonus = KDGetGoddessBonus(shrine);
	let color = forceColor ? forceColor : KDGetPosNegColor(bonus);
	let str = (bonus >= 0 ? "+" : "") + Math.round(bonus * 100) + "%";
	DrawTextFitKD(str, x, y, width, color, "#000000", FontSize, align, zIndex, alpha);
}

/**
 * @param map
 * @param tile
 */
function KDGetShrineQuest(map: KDMapDataType, tile: any): string {
	if (!tile) return "";
	let eligibleQuests: Record<string, number> = {};
	for (let q of Object.values(KDQuests)) {
		if (q.tags?.includes(tile.Name) && !KDGameData.Quests?.includes(q.name) && !map.flags?.includes(q.name)) {
			eligibleQuests[q.name] = q.weight(KDMapData.RoomType, KDMapData.MapMod, {});
		}
	}

	let quest = KDGetByWeight(eligibleQuests);
	return quest;
}

/**
 * @param map
 * @param tile
 */
function KDSetShrineQuest(map: KDMapDataType, tile: any, quest: string) {
	if (!tile) return;
	tile.Quest = quest;
	KDSetMapFlag(map, quest);
}
