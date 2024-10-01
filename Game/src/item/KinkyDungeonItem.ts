"use strict";

/** Certain items, when dropped, have specific properties
*/
let KDDroppedItemProperties: Record<string, KDDroppedItemProp> = {
	"RedKey": {
		tinyness: 2,
	},
	"Pick": {
		tinyness: 1,
	},
	"BlueKey": {
		tinyness: 2,
	},
	"Knife": {
		tinyness: 3,
	},
	"EnchKnife": {
		tinyness: 3,
	},
	"Dirk": {
		tinyness: 3,
	},
	"Scissors": {
		tinyness: 3,
	},
	"Heart": {
		persistent: true,
	},
	"Lore": {
		tinyness: 3,
		persistent: true,
	},

};

type GroundItem = {
	x: number;
	y: number;
	name: string;
	amount?: number;
}

function KinkyDungeonItemDrop(x: number, y: number, dropTable: any[], summoned: boolean): boolean | GroundItem {
	if (dropTable) {
		let dropWeightTotal = 0;
		let dropWeights = [];

		for (let drop of dropTable) {
			let weight = drop.weight;
			dropWeights.push({drop: drop, weight: dropWeightTotal});
			if (drop.ignoreInInventory && (KinkyDungeonInventoryGet(drop.name) || KinkyDungeonFlags.get("ItemDrop_" + drop.name))) weight = 0;
			if (drop.chance && KDRandom() > drop.chance) weight = 0;
			dropWeightTotal += Math.max(weight, 0);
		}

		let selection = KDRandom() * dropWeightTotal;

		for (let L = dropWeights.length - 1; L >= 0; L--) {
			if (selection > dropWeights[L].weight) {
				if (dropWeights[L].drop.name != "Nothing" && (!KinkyDungeonStatsChoice.get("Stealthy") || dropWeights[L].drop.name != "Gold") && (!summoned || !dropWeights[L].drop.noSummon)) {
					let dropped: GroundItem = {x:x, y:y, name: dropWeights[L].drop.name, amount: dropWeights[L].drop.amountMin ? (dropWeights[L].drop.amountMin + Math.floor(KDRandom()*dropWeights[L].drop.amountMax)) : dropWeights[L].drop.amount};
					if (!KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x, y))) {
						let newPoint = KinkyDungeonGetNearbyPoint(x, y, false, undefined, true);
						if (newPoint) {
							dropped.x = newPoint.x;
							dropped.y = newPoint.y;
						} else {
							console.log("Failed to find point to drop " + TextGet("KinkyDungeonInventoryItem" + dropWeights[L].drop.name));
						}
					}
					KDMapData.GroundItems.push(dropped);
					KinkyDungeonSetFlag("ItemDrop_" + dropped.name, Math.round(12 + KDRandom() * 8));
					return dropped;
				}
				return false;
			}
		}
	}
	return false;
}

function KinkyDungeonDropItem(Item: any, Origin: any, PreferOrigin: boolean, noMsg?: boolean, allowEnemies?: boolean): boolean {
	let slots = [];
	for (let X = -Math.ceil(1); X <= Math.ceil(1); X++)
		for (let Y = -Math.ceil(1); Y <= Math.ceil(1); Y++) {
			if ((X != 0 || Y != 0))
				slots.push({x:X, y:Y});
		}

	let foundslot = PreferOrigin ? {x:Origin.x, y:Origin.y} : null;

	// Old code used for enclosure in box--todo reimplement enclosure
	//if (!(Origin == KinkyDungeonPlayerEntity && PreferOrigin && KinkyDungeonPlayer.IsEnclose())) {
	if (!foundslot || !(KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(foundslot.x, foundslot.y))
		&& (allowEnemies || KinkyDungeonNoEnemy(foundslot.x, foundslot.y, true))))
		for (let C = 0; C < 100; C++) {
			let slot = slots[Math.floor(KDRandom() * slots.length)];
			if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(Origin.x+slot.x, Origin.y+slot.y))
				&& (allowEnemies || KinkyDungeonNoEnemy(Origin.x+slot.x, Origin.y+slot.y, true))) {
				foundslot = {x: Origin.x+slot.x, y: Origin.y+slot.y};

				C = 100;
			} else slots.splice(C, 1);
		}
	//}


	if (foundslot) {

		let dropped: GroundItem = {x:foundslot.x, y:foundslot.y, name: Item.name};
		if (Item.amountMin && Item.amountMax) {
			dropped.amount = Item.amountMin + Math.floor(KDRandom()*Item.amountMax);
		} else if (Item.amount) {
			dropped.amount = Item.amount;
		}

		KDMapData.GroundItems.push(dropped);
		if (!noMsg)
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonDrop" + Item.name), "#ff5277", 2);

		return true;
	}

	return false;
}

function KinkyDungeonItemEvent(Item: any, nomsg?: boolean) {
	let color = "white";
	let priority = 1;
	let sfx = "Coins";
	let name = Item.name;
	let replace = "";
	if (Item.amount == undefined && Item.quantity) {
		Item.amount = Item.quantity;
	}
	if (KDCustomItems[name]) {
		let ret = KDCustomItems[name](Item);
		if (ret.sfx != undefined) sfx = ret.sfx;
		if (ret.replace != undefined) replace = ret.replace;
		if (ret.priority != undefined) priority = ret.priority;
		if (ret.color != undefined) color = ret.color;
		if (ret.name != undefined) name = ret.name;
	} else if (Item.name == "Gold") {
		color = "yellow";
		KinkyDungeonAddGold(Item.amount);
	} else if (Item.name == "Lore") {
		return KinkyDungeonNewLore();
	} else if (Item.name == "Pick") {
		priority = 2;
		color = "lightgreen";
		KDAddConsumable("Pick", 1);
	} else if (Item.name == "MagicSword") {
		priority = 8;
		color = "orange";
		KinkyDungeonInventoryAddWeapon("MagicSword");
	} else if (Item.name == "Scrolls") {
		priority = 4;
		color = "lightgreen";
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollArms, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollLegs, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollVerbal, 1);
	} else if (Item.name == "Knife") {
		priority = 2;
		color = "lightgreen";
		KinkyDungeonInventoryAddWeapon("Knife");
	} else if (Item.name == "Knives") {
		priority = 3;
		color = "lightgreen";
		KinkyDungeonInventoryAddWeapon("Knife");
		if (!KinkyDungeonPlayerDamage || KinkyDungeonPlayerDamage.unarmed) {
			KDSetWeapon("Knife");
			KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon());
		}
	} else if (Item.name == "EnchKnife") {
		priority = 2;
		color = "lightgreen";
		KinkyDungeonInventoryAddWeapon("EnchKnife");
		if (!KinkyDungeonPlayerDamage || KinkyDungeonPlayerDamage.unarmed) {
			KDSetWeapon("EnchKnife");
			KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon());
		}
	} else if (Item.name == "RedKey") {
		priority = 2;
		color = "lightgreen";
		KDAddConsumable("RedKey", 1);
	} else if (Item.name == "BlueKey") {
		priority = 2;
		color = "lightgreen";
		KDAddConsumable("BlueKey", 1);
	} else if (KDConsumable(Item)) {
		if (KinkyDungeonWeaponVariants[Item.name]) {
			KDGiveConsumableVariant(KinkyDungeonConsumableVariants[Item.name], undefined, Item.name, undefined, Item.amount);
			color = "#aaaaff";
			name = "Generic";
			replace = TextGet("KinkyDungeonInventoryItem" + KinkyDungeonConsumableVariants[Item.name].template);
		} else {
			let item = KinkyDungeonFindConsumable(Item.name);
			priority = item.rarity;
			if (item.potion) sfx = "PotionDrink";
			color = "white";
			KinkyDungeonChangeConsumable(item, Item.amount || 1);
		}
	} else if (KDWeapon(Item)) {
		if (KinkyDungeonWeaponVariants[Item.name]) {
			KDGiveWeaponVariant(KinkyDungeonWeaponVariants[Item.name], undefined, Item.name);
			color = "#aaaaff";
			name = "Generic";
			replace = TextGet("KinkyDungeonInventoryItem" + KinkyDungeonWeaponVariants[Item.name].template);
		} else {
			let item = KinkyDungeonFindWeapon(Item.name);
			priority = Math.min(8, item.rarity + 4);
			color = "orange";
			KinkyDungeonInventoryAddWeapon(Item.name);
		}

	} else if (KDRestraint(Item)) {
		if (KinkyDungeonRestraintVariants[Item.name]) {
			KDGiveInventoryVariant(KinkyDungeonRestraintVariants[Item.name], undefined, KinkyDungeonRestraintVariants[Item.name].curse, "", Item.name, undefined, undefined, undefined, Item.amount || 1);
			color = "#aaaaff";
			name = "Generic";
			replace = TextGet("Restraint" + KinkyDungeonRestraintVariants[Item.name].template);
		} else {
			if (!KinkyDungeonInventoryGetLoose(Item.name)) {
				KinkyDungeonInventoryAdd({name: Item.name, id: KinkyDungeonGetItemID(),
					type: LooseRestraint, events:Item.events || KDGetEventsForRestraint(Item.name), quantity: Item.amount || 1});
			} else {
				if (!KinkyDungeonInventoryGetLoose(Item.name).quantity) KinkyDungeonInventoryGetLoose(Item.name).quantity = 0;
				KinkyDungeonInventoryGetLoose(Item.name).quantity += Item.amount || 1;
			}
			color = "#ffffff";
			name = "Generic";
			replace = TextGet("Restraint" + Item.name);
		}

	} else if (KDOutfit(Item)) {
		priority = 1;
		color = "white";
		KinkyDungeonInventoryAddOutfit(Item.name);
	} else if (Item.name == "Heart") {
		if (KinkyDungeonStatDistractionMax >= KDMaxStat && KinkyDungeonStatStaminaMax >= KDMaxStat && KinkyDungeonStatManaMax >= KDMaxStat && KinkyDungeonStatWillMax >= KDMaxStat) {
			KinkyDungeonDrawState = "Game";
			KinkyDungeonChangeStamina(10);
			KinkyDungeonChangeMana(5);
			KinkyDungeonChangeWill(5.0);
			KDGameData.HeartTaken = true;
		} else if (KinkyDungeonIsPlayer()) {
			KinkyDungeonDrawState = "Heart";
			KinkyDungeonInterruptSleep();
			KinkyDungeonDialogueTimer = CommonTime() + 700;
			KinkyDungeonSetFlag("NoDialogue", 3);
		}
	} else if (Item.name == "Keyring") {
		KDMapData.KeysHeld++;
		KinkyDungeonAggroAction('key', {});
	}
	if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
	if (!nomsg) {
		KinkyDungeonSendActionMessage(priority, TextGet("ItemPickup" + name).replace("XXX", Item.amount).replace("ReplaceValue", replace), color, 1, false, false, undefined, "Items");
		if (!KDCanSeeDroppedItem(Item))
			KinkyDungeonSendActionMessage(priority + 1, TextGet("ItemFoundHidden").replace("XXX", Item.amount).replace("ReplaceValue", replace), color, 1, false, false, undefined, "Items");

	}
}


function KDAllowUseItems(Message: boolean, _x?: number, _y?: number): boolean {
	let ret = !KinkyDungeonStatsChoice.get("CantTouchThat") || KinkyDungeonHasHelp() || !(KinkyDungeonIsArmsBound() && !KinkyDungeonCanUseFeet() && KinkyDungeonIsHandsBound(false, true, 0.01));
	if (!ret && KinkyDungeonCanTalk()) {
		if (KDGameData.KneelTurns > 0) {return true;}
		if (Message) KinkyDungeonSendActionMessage(7, TextGet("KDMouthGround"), "#ffaa44", 3, undefined, true);
		return false;
	}
	return ret;
}

function KinkyDungeonItemCheck(x: number, y: number, _Index: number, autoEquip?: boolean) {
	let allowManip = KDAllowUseItems(false, x, y);
	let msg = false;
	let pickedone = false;
	for (let I = 0; I < KDMapData.GroundItems.length; I++) {
		let item = KDMapData.GroundItems[I];
		if (x == item.x && y == item.y) {
			if (allowManip
				|| (item.name == "Keyring" && "SsH".includes(KinkyDungeonMapGet(item.x, item.y)))
				|| (!pickedone && KinkyDungeonStatsChoice.get("Psychic") && x && y && KDistChebyshev(KinkyDungeonPlayerEntity.x-x, KinkyDungeonPlayerEntity.y - y) < 1.5)) {
				KDMapData.GroundItems.splice(I, 1);
				I -= 1;
				pickedone = true;
				KinkyDungeonItemEvent(item);
				if (autoEquip && KDWeapon(item) && KinkyDungeonPlayerWeapon == "Unarmed") {
					KDSetWeapon(item.name);
				}
			} else {
				let point = null;
				if (KinkyDungeonLastAction == "Move" && (KinkyDungeonPlayerEntity.lastx != KinkyDungeonPlayerEntity.x || KinkyDungeonPlayerEntity.lasty != KinkyDungeonPlayerEntity.y)) {
					point = {
						x: KinkyDungeonPlayerEntity.x * 2 - KinkyDungeonPlayerEntity.lastx,
						y: KinkyDungeonPlayerEntity.y * 2 - KinkyDungeonPlayerEntity.lasty,
					};
					if (!KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(point.x, point.y))) point = null;
				}
				if (!point)
					point = KinkyDungeonGetNearbyPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, undefined, true, true);
				if (point) {
					item.x = point.x;
					item.y = point.y;
				}
				msg = true;
			}

		}
	}
	if (msg) {
		KinkyDungeonSendTextMessage(6, TextGet("KDCantTouchThat"), "#ff8933",1, false, true);
	}
}

function KDCanSeeDroppedItem(item: GroundItem): boolean {
	if (KDDroppedItemProperties[item.name]?.tinyness <= KinkyDungeonBlindLevel) return false;
	return true;
}

/**
 * @param item
 */
function KDGetItemType(item: Named): string {
	if (KDWeapon(item)) return Weapon;
	if (KDRestraint(item)) return LooseRestraint;
	if (KDConsumable(item)) return Consumable;
	if (KDOutfit(item)) return Outfit;
	return Misc;
}

function KinkyDungeonDrawItems(_canvasOffsetX: number, _canvasOffsetY: number, CamX: number, CamY: number) {
	let sprite = null;
	let counts = {};
	let max = 10;
	for (let item of KDMapData.GroundItems) {
		//if (KinkyDungeonGetRestraintByName(item.name)) sprite = "Restraint";
		if (item.x >= CamX && item.y >= CamY && item.x < CamX + KinkyDungeonGridWidthDisplay && item.y < CamY + KinkyDungeonGridHeightDisplay && KinkyDungeonVisionGet(item.x, item.y) > 0) {
			let scale = 0.5;
			if (KDRestraint({name: item.name}) && !KDRestraint({name: item.name}).armor) {
				sprite = KinkyDungeonRootDirectory + "Items/Restraint.png";
				scale = 1;
			}
			else sprite = KDGetItemPreview({name: item.name, type: KDGetItemType(item)})?.preview || (KinkyDungeonRootDirectory + "Items/" + item.name + ".png");
			if (KDCanSeeDroppedItem(item)) {
				KDDraw(kditemsboard, kdpixisprites, item.x + "," + item.y + "_" + item.name, sprite,
					(item.x - CamX + ((0.25/max) * (counts[item.x + ',' + item.y] || 0)))*KinkyDungeonGridSizeDisplay, (item.y - CamY + (1 - scale))*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridSizeDisplay*scale, KinkyDungeonGridSizeDisplay*scale);
				if (!counts[item.x + ',' + item.y]) {
					counts[item.x + ',' + item.y] = 0;
				}
				if (counts[item.x + ',' + item.y] < max)
					counts[item.x + ',' + item.y] += 1;
			}
		}
	}
}



function KinkyDungeonDrawHeart() {

	DrawTextKD(TextGet("KinkyDungeonHeartIntro"), 1250, 200, "#ffffff", KDTextGray2);
	DrawTextKD(TextGet("KinkyDungeonHeartIntro1"), 1250, 300, "#ffffff", KDTextGray2);
	DrawTextKD(TextGet("KinkyDungeonHeartIntro2"), 1250, 350, "#ffffff", KDTextGray2);
	DrawTextKD(TextGet("KinkyDungeonHeartIntro3"), 1250, 400, "#ffffff", KDTextGray2);
	DrawTextKD(TextGet("KinkyDungeonHeartIntro4"), 1250, 450, "#ffffff", KDTextGray2);

	DrawTextKD(TextGet("StatDistraction").replace("PERCENT", "" + Math.round(100*KinkyDungeonStatDistractionMax / KDMaxStatStart)), 650 + 250/2, 650, "#ffffff", KDTextGray2);
	DrawTextKD(TextGet("StatStamina").replace("CURRENT/MAX", "" + KinkyDungeonStatStaminaMax * KDMaxStatStart), 950 + 250/2, 650, "#ffffff", KDTextGray2);
	DrawTextKD(TextGet("StatMana").replace("CURRENT/MAX", "" + KinkyDungeonStatManaMax * KDMaxStatStart), 1250 + 250/2, 650, "#ffffff", KDTextGray2);
	DrawTextKD(TextGet("StatWill").replace("CURRENT/MAX", "" + KinkyDungeonStatWillMax * KDMaxStatStart), 1550 + 250/2, 650, "#ffffff", KDTextGray2);

	// Fix softlock
	//if ((KinkyDungeonStatDistractionMax > KDMaxStat && KinkyDungeonStatStaminaMax > KDMaxStat && KinkyDungeonStatManaMax > KDMaxStat && KinkyDungeonStatWillMax > KDMaxStat)) KinkyDungeonDrawState = "Game";

	DrawButtonVis(650, 700, 250, 60, TextGet("KinkyDungeonHeartDistraction"), KinkyDungeonStatDistractionMax < KDMaxStat ? "#ffffff" : "#999999");
	DrawButtonVis(950, 700, 250, 60, TextGet("KinkyDungeonHeartStamina"), KinkyDungeonStatStaminaMax < KDMaxStat ? "#ffffff" : "#999999");
	DrawButtonVis(1250, 700, 250, 60, TextGet("KinkyDungeonHeartMana"), KinkyDungeonStatManaMax < KDMaxStat ? "#ffffff" : "#999999");
	DrawButtonVis(1550, 700, 250, 60, TextGet("KinkyDungeonHeartWill"), KinkyDungeonStatWillMax < KDMaxStat ? "#ffffff" : "#999999");

	DrawButtonKDEx("discardheart", (_bdata) => {
		KinkyDungeonDrawState = "Game";
		return true;
	}, CommonTime() > KinkyDungeonDialogueTimer, 1000, 850, 450, 60, TextGet("KinkyDungeonHeartDiscard"), KinkyDungeonStatWillMax < KDMaxStat ? "#ffffff" : "#999999");
}

function KinkyDungeonHandleHeart() {
	if (CommonTime() > KinkyDungeonDialogueTimer) {
		if (MouseIn(650, 700, 250, 60) && KinkyDungeonStatDistractionMax < KDMaxStat) {
			KDSendInput("heart", {type: "AP"});
			KinkyDungeonDrawState = "Game";
		} else if (MouseIn(950, 700, 250, 60) && KinkyDungeonStatStaminaMax < KDMaxStat) {
			KDSendInput("heart", {type: "SP"});
			KinkyDungeonDrawState = "Game";
		} else if (MouseIn(1250, 700, 250, 60) && KinkyDungeonStatManaMax < KDMaxStat) {
			KDSendInput("heart", {type: "MP"});
			KinkyDungeonDrawState = "Game";
		} else if (MouseIn(1550, 700, 250, 60) && KinkyDungeonStatWillMax < KDMaxStat) {
			KDSendInput("heart", {type: "WP"});
			KinkyDungeonDrawState = "Game";
		}
	}


	return true;
}

let KDCustomItems = {
	"LeylineMap": () => {
		KDStartDialog("LeylineMap", "", true, "");
		return {
			sfx: undefined,
			replace: undefined,
			priority: undefined,
			color: undefined,
		};
	},
};

/**
 * @param items
 * @param offset
 */
function KDDrawItemsTooltip(items: any[], offset: number): number {
	let TooltipList = [];
	TooltipList.push({
		str: TextGet("KDTooltipItems"),
		fg: "#ffffff",
		bg: "#000000",
		size: 24,
		center: true,
	});
	let str = "";
	for (let item of items) {
		str = str + (str ? ", " : "") + KDGetItemNameString(item.name);
	}
	let mult = KDGetFontMult();
	let strSplit = KinkyDungeonWordWrap(str, 12*mult, 28*mult).split('\n');

	let i = 1;
	const imax = 5;
	for (let line of strSplit) {
		TooltipList.push({
			str: (i == imax ? line.substring(0, line.length - 1) + "..." : line),
			fg: "#dddddd",
			bg: "#000000",
			size: 18,
			center: true,
		});
		if (i >= imax) break;
		i++;
	}

	return KDDrawTooltip(TooltipList, offset);
}
