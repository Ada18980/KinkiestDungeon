"use strict";
let KinkyDungeonGroundItems = []; // Tracking all items on the ground

/** Certain items, when dropped, have specific properties
 * @type {Record<string, KDDroppedItemProp>}
*/
let KDDroppedItemProperties = {
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

};

function KinkyDungeonItemDrop(x, y, dropTable, summoned) {
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
					let dropped = {x:x, y:y, name: dropWeights[L].drop.name, amount: dropWeights[L].drop.amountMin + Math.floor(KDRandom()*dropWeights[L].drop.amountMax)};
					if (!KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x, y))) {
						let newPoint = KinkyDungeonGetNearbyPoint(x, y, false, undefined, true);
						if (newPoint) {
							dropped.x = newPoint.x;
							dropped.y = newPoint.y;
						} else {
							console.log("Failed to find point to drop " + TextGet("KinkyDungeonInventoryItem" + dropWeights[L].drop.name));
						}
					}
					KinkyDungeonGroundItems.push(dropped);
					KinkyDungeonSetFlag("ItemDrop_" + dropped.name, Math.round(12 + KDRandom() * 8));
					return dropped;
				}
				return false;
			}
		}
	}
	return false;
}

function KinkyDungeonDropItem(Item, Origin, AllowOrigin, noMsg, allowEnemies) {
	let slots = [];
	for (let X = -Math.ceil(1); X <= Math.ceil(1); X++)
		for (let Y = -Math.ceil(1); Y <= Math.ceil(1); Y++) {
			if ((X != 0 || Y != 0))
				slots.push({x:X, y:Y});
		}

	let foundslot = AllowOrigin ? {x:Origin.x, y:Origin.y} : null;
	if (!(Origin == KinkyDungeonPlayerEntity && AllowOrigin && KinkyDungeonPlayer.IsEnclose())) {
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
	}


	if (foundslot) {

		let dropped = {x:foundslot.x, y:foundslot.y, name: Item.name};
		if (Item.amountMin && Item.amountMax) {
			dropped.amount = Item.amountMin + Math.floor(KDRandom()*Item.amountMax);
		} else if (Item.amount) {
			dropped.amount = Item.amount;
		}

		KinkyDungeonGroundItems.push(dropped);
		if (!noMsg)
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonDrop" + Item.name), "#ff0000", 2);

		return true;
	}

	return false;
}

function KinkyDungeonItemEvent(Item) {
	let color = "white";
	let priority = 1;
	let sfx = "Coins";
	let name = Item.name;
	let replace = "";
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
		KinkyDungeonLockpicks += 1;
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
		KinkyDungeonRedKeys += 1;
	} else if (Item.name == "BlueKey") {
		priority = 2;
		color = "lightgreen";
		KinkyDungeonBlueKeys += 1;
	} else if (Item.name == "PotionMana") {
		priority = 3;
		color = "lightblue";
		sfx = "PotionDrink";
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 1);
	} else if (Item.name == "PotionStamina") {
		priority = 3;
		sfx = "PotionDrink";
		color = "lightgreen";
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 1);
	} else if (Item.name == "PotionFrigid") {
		priority = 3;
		sfx = "PotionDrink";
		color = "white";
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
	} else if (KinkyDungeonFindConsumable(Item.name)) {
		let item = KinkyDungeonFindConsumable(Item.name);
		priority = item.rarity;
		if (item.potion) sfx = "PotionDrink";
		color = "white";
		KinkyDungeonChangeConsumable(item, 1);
	} else if (KinkyDungeonFindWeapon(Item.name)) {
		let item = KinkyDungeonFindWeapon(Item.name);
		priority = Math.min(8, item.rarity + 4);
		color = "orange";
		KinkyDungeonInventoryAddWeapon(Item.name);
	} else if (Item.name == "Heart") {
		if (KinkyDungeonStatDistractionMax >= KDMaxStat && KinkyDungeonStatStaminaMax >= KDMaxStat && KinkyDungeonStatManaMax >= KDMaxStat && KinkyDungeonStatWillMax >= KDMaxStat) {
			KinkyDungeonDrawState = "Game";
			KinkyDungeonChangeStamina(30);
			KinkyDungeonChangeMana(5);
			KinkyDungeonChangeWill(2.5);
			KDGameData.HeartTaken = true;
		} else if (KinkyDungeonIsPlayer()) {
			KinkyDungeonDrawState = "Heart";
			KinkyDungeonInterruptSleep();
			KinkyDungeonSetFlag("NoDialogue", 3);
		}
	} else if (Item.name == "Keyring") {
		KDGameData.JailKey = true;
		KinkyDungeonAggroAction('key', {});
	} else if (KinkyDungeonGetRestraintByName(Item.name)) {
		if (!KinkyDungeonInventoryGetLoose(Item.name)) {
			KinkyDungeonInventoryAdd({name: Item.name, id: KinkyDungeonGetItemID(), type: LooseRestraint, events:Item.events, quantity: 1});
		} else {
			if (!KinkyDungeonInventoryGetLoose(Item.name).quantity) KinkyDungeonInventoryGetLoose(Item.name).quantity = 0;
			KinkyDungeonInventoryGetLoose(Item.name).quantity += 1;
		}
		color = "#ffffff";
		name = "Generic";
		replace = TextGet("Restraint" + Item.name);
	}
	if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
	KinkyDungeonSendActionMessage(priority, TextGet("ItemPickup" + name).replace("XXX", Item.amount).replace("ReplaceValue", replace), color, 1);
	if (!KDCanSeeDroppedItem(Item))
		KinkyDungeonSendActionMessage(priority + 1, TextGet("ItemFoundHidden").replace("XXX", Item.amount).replace("ReplaceValue", replace), color, 1);
}


function KinkyDungeonItemCheck(x, y, Index) {
	for (let I = 0; I < KinkyDungeonGroundItems.length; I++) {
		let item = KinkyDungeonGroundItems[I];
		if (x == item.x && y == item.y) {
			KinkyDungeonGroundItems.splice(I, 1);
			I -= 1;
			KinkyDungeonItemEvent(item);
		}
	}
}

function KDCanSeeDroppedItem(item) {
	if (KDDroppedItemProperties[item.name]?.tinyness <= KinkyDungeonBlindLevel) return false;
	return true;
}

function KinkyDungeonDrawItems(canvasOffsetX, canvasOffsetY, CamX, CamY) {
	for (let item of KinkyDungeonGroundItems) {
		let sprite = item.name;
		if (KinkyDungeonRestraintsCache.has(item.name)) sprite = "Restraint";
		if (item.x >= CamX && item.y >= CamY && item.x < CamX + KinkyDungeonGridWidthDisplay && item.y < CamY + KinkyDungeonGridHeightDisplay && KinkyDungeonVisionGet(item.x, item.y) > 0) {
			if (KDCanSeeDroppedItem(item))
				KDDraw(kdgameboard, kdpixisprites, item.x + "," + item.y + "_" + item.name, KinkyDungeonRootDirectory + "Items/" + sprite + ".png",
					(item.x - CamX)*KinkyDungeonGridSizeDisplay, (item.y - CamY)*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
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
	if (!(KinkyDungeonStatDistractionMax < KDMaxStat && KinkyDungeonStatStaminaMax < KDMaxStat && KinkyDungeonStatManaMax < KDMaxStat && KinkyDungeonStatWillMax < KDMaxStat)) KinkyDungeonDrawState = "Game";

	DrawButtonVis(650, 700, 250, 60, TextGet("KinkyDungeonHeartDistraction"), KinkyDungeonStatDistractionMax < KDMaxStat ? "#ffffff" : "#999999");
	DrawButtonVis(950, 700, 250, 60, TextGet("KinkyDungeonHeartStamina"), KinkyDungeonStatStaminaMax < KDMaxStat ? "#ffffff" : "#999999");
	DrawButtonVis(1250, 700, 250, 60, TextGet("KinkyDungeonHeartMana"), KinkyDungeonStatManaMax < KDMaxStat ? "#ffffff" : "#999999");
	DrawButtonVis(1550, 700, 250, 60, TextGet("KinkyDungeonHeartWill"), KinkyDungeonStatWillMax < KDMaxStat ? "#ffffff" : "#999999");

	DrawButtonKDEx("discardheart", (bdata) => {
		KinkyDungeonDrawState = "Game";
		return true;
	}, true, 1000, 850, 450, 60, TextGet("KinkyDungeonHeartDiscard"), KinkyDungeonStatWillMax < KDMaxStat ? "#ffffff" : "#999999");
}

function KinkyDungeonHandleHeart() {
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