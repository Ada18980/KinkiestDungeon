"use strict";

let KDMaxRarity = 10; // By normal means

let KinkyDungeonConsumables: Record<string, consumable> = {
	"PotionMana" : {name: "PotionMana", potion: true, costMod: 0.5, rarity: 0, shop: true, type: "restore", mp_instant: 5, mpool_instant: 0, mp_gradual: 0, scaleWithMaxMP: true, gagFloor: 0.5, duration: 0, sfx: "PotionDrink"},
	"ManaOrb" : {name: "ManaOrb", noHands: true, rarity: 2, shop: true, type: "restore", mp_instant: 0, mpool_instant: 20, mp_gradual: 0, scaleWithMaxMP: false, duration: 0, sfx: "Invis"},
	"PotionWill" : {name: "PotionWill", potion: true, rarity: 1, shop: true, type: "restore", wp_instant: 2.5, wp_gradual: 0, scaleWithMaxWP: true, duration: 0, gagFloor: 0.5, sfx: "PotionDrink"},
	"PotionStamina" : {name: "PotionStamina", potion: true, rarity: 1, shop: true, type: "restore", sp_instant: 5, sp_gradual: 25, scaleWithMaxSP: true, duration: 25, gagFloor: 0.5, sfx: "PotionDrink"},
	"PotionFrigid" : {name: "PotionFrigid", potion: true, rarity: 1, costMod: 1, shop: true, type: "restore", ap_instant: -10, ap_gradual: -20, duration: 50, arousalRatio: 1.0, gagFloor: 0.5, sfx: "PotionDrink"},
	"SmokeBomb" : {name: "SmokeBomb", noHands: true, rarity: 2, costMod: -1, shop: false, noConsumeOnUse: true, type: "targetspell", sfx: "FireSpell", spell: "SmokeBomb"},
	"FlashBomb" : {name: "FlashBomb", noHands: true, rarity: 3, costMod: -1, shop: false, noConsumeOnUse: true, type: "targetspell", sfx: "FireSpell", spell: "FlashBomb"},
	"Flashbang" : {name: "Flashbang", noHands: true, rarity: 4, costMod: -1, shop: false, noConsumeOnUse: true, type: "targetspell", sfx: "FireSpell", spell: "Flashbang"},
	"PotionInvisibility" : {name: "PotionInvisibility", potion: true, rarity: 3, costMod: -1, shop: true, type: "spell", spell: "Invisibility", sfx: "PotionDrink"},
	"Ectoplasm" : {name: "Ectoplasm", noHands: true, rarity: 1, shop: false, type: "spell", spell: "LesserInvisibility", sfx: "Invis"},
	"Gunpowder" : {name: "Gunpowder", rarity: 1, shop: true, useQuantity: 1, noConsumeOnUse: true, type: "targetspell", spell: "Gunpowder", sfx: "FireSpell"},
	"EarthRune" : {name: "EarthRune", rarity: 2, costMod: -1, shop: false, type: "spell", spell: "Earthrune", sfx: "HeavySwing"},
	"RopeRune" : {name: "RopeRune", rarity: 2, costMod: -1, shop: false, type: "spell", spell: "EnchantRope", sfx: "HeavySwing"},
	"WaterRune" : {name: "WaterRune", rarity: 2, costMod: -1, shop: false, type: "spell", spell: "WaterRune", sfx: "HeavySwing"},
	"Bola" : {name: "Bola", rarity: 0, costMod: -1, shop: false, useQuantity: 1, noConsumeOnUse: true, type: "targetspell", spell: "PlayerBola"},
	"LeashItem" : {name: "LeashItem", rarity: 2, costMod: -2, shop: true, useQuantity: 0, noConsumeOnUse: true, type: "targetspell", spell: "LeashSpell"},
	"IceRune" : {name: "IceRune", rarity: 2, costMod: -1, shop: false, type: "spell", spell: "Icerune", sfx: "Freeze"},
	"Bomb" : {name: "Bomb", rarity: 1, costMod: -1, shop: false, type: "spell", spell: "BombItem", sfx: "FireSpell"},
	"Dynamite" : {name: "Dynamite", rarity: 2, costMod: -1, shop: false, type: "spell", spell: "DynamiteItem", sfx: "FireSpell"},
	"C4" : {name: "C4", rarity: 3, costMod: -1, shop: false, type: "spell", spell: "C4Item", sfx: "FireSpell"},
	"ElfCrystal" : {name: "ElfCrystal", noHands: true, rarity: 3, costMod: -1, shop: false, type: "spell", spell: "Slippery", sfx: "MagicSlash"},
	"EnchantedGrinder" : {name: "EnchantedGrinder", noHands: true, rarity: 4, shop: true, type: "spell", spell: "Cutting", sfx: "Laser"},
	"MistressKey" : {name: "MistressKey", rarity: 8, costMod: -1, shop: false, type: "goldKey"},
	"AncientPowerSource" : {name: "AncientPowerSource", noHands: true, rarity: 4, costMod: -2, shop: true, type: "charge", amount: 0.250},
	"AncientPowerSourceSpent" : {name: "AncientPowerSourceSpent", noHands: true, rarity: 3, costMod: -3, shop: false, type: "recharge"},
	"ScrollArms" : {name: "ScrollArms", sub: 0.25, noHands: true, rarity: 2, costMod: 1, shop: true, type: "buff", buff: "NoArmsComp", duration: 12, power: 1, aura: "#aaffaa", sfx: "FireSpell"},
	"ScrollVerbal" : {name: "ScrollVerbal", sub: 0.25, noHands: true, rarity: 2, costMod: 1, shop: true, type: "buff", buff: "NoVerbalComp", duration: 12, power: 1, aura: "#aaaaff", sfx: "FireSpell"},
	"ScrollLegs" : {name: "ScrollLegs", sub: 0.25, noHands: true, rarity: 2, costMod: 1, shop: true, type: "buff", buff: "NoLegsComp", duration: 12, power: 1, aura: "#ffaaaa", sfx: "FireSpell"},
	"ScrollPurity" : {name: "ScrollPurity", sub: 0.20, noHands: true, rarity: 4, shop: true, type: "shrineRemove", shrine: "Vibes", sfx: "FireSpell"},

	"DollID" : {name: "DollID", rarity: 0, shop: false, type: "dollID", noHands: true, sfx: "FutureLock", noConsumeOnUse: true},
	"KeyCard" : {name: "KeyCard", rarity: 1, shop: false, type: "KeyCard", noHands: true, sfx: "FutureLock", noConsumeOnUse: true},
	"CuffKeys" : {name: "CuffKeys", rarity: 1, sub: 0.25, shop: false, type: "CuffKeys", noConsumeOnUse: true},
	"Pick" : {name: "Pick", rarity: 0, sub: 0.25, shop: false, type: "Lockpick", noConsumeOnUse: true},
	"RedKey" : {name: "RedKey", rarity: 1, sub: 0.25, shop: false, type: "RedKey", noConsumeOnUse: true},
	"BlueKey" : {name: "BlueKey", rarity: 2, costMod: 2, shop: false, type: "BlueKey", noConsumeOnUse: true},
	"Snuffer" : {name: "Snuffer", rarity: 3, costMod: -1, shop: true, type: "Snuffer", noConsumeOnUse: true},
	"SackOfSacks" : {name: "SackOfSacks", rarity: 3, costMod: -2, shop: true, type: "SackOfSacks", noConsumeOnUse: true},
	"DiscPick" : {name: "DiscPick", rarity: 4, costMod: -1, sub: 0.2, shop: true, type: "DiscPick", noConsumeOnUse: true, uniqueTags: ["pick"]},

	"UniversalSolvent" : {name: "UniversalSolvent", rarity: 5, shop: true, useQuantity: 1, noConsumeOnUse: true, type: "targetspell", spell: "UniversalSolvent", sfx: "PotionDrink"},

	"DivineTear" : {name: "DivineTear", rarity: 6, sub: 0.05, shop: true, delay: 3, power: 10, noHands: true, duration: 0, sfx: "Cookie", type: "RemoveCurseOrHex", noConsumeOnUse: true},
};

// Separate for organizational purposes
let KDCookies: Record<string, consumable> = {
	"Cookie" : {name: "Cookie", rarity: 0, shop: true, type: "restore", wp_instant: 1.0, wp_gradual: 0, scaleWithMaxWP: true, needMouth: true, delay: 3, gagMax: 0.59, duration: 0, sfx: "Cookie"},
	"Brownies" : {name: "Brownies", rarity: 1, shop: true, type: "restore", wp_instant: 3.0, wp_gradual: 0, scaleWithMaxWP: true, needMouth: true, delay: 4, gagMax: 0.59, duration: 0, sfx: "Cookie"},
	"Donut" : {name: "Donut", rarity: 0, shop: true, type: "restore", wp_instant: 1.0, wp_gradual: 0, scaleWithMaxWP: true, needMouth: true, delay: 3, gagMax: 0.59, duration: 0, sfx: "Cookie"},
	"CookieJailer" : {name: "CookieJailer", rarity: 0, shop: true, type: "restore", wp_instant: 1.5, wp_gradual: 0, scaleWithMaxWP: true, needMouth: true, delay: 3, gagMax: 0.59, duration: 0, sfx: "Cookie",
		sideEffects: ["subAdd"],
		data: {
			subAdd: 5,
		}},
};
Object.assign(KinkyDungeonConsumables, KDCookies);

let KDRechargeCost = 100;

let KinkyDungneonBasic = {
	"Key" : {name: "Key", rarity: 0, shop: false},
	"Keyring" : {name: "Key", rarity: 0, shop: false},
	"RedKey" : {name: "RedKey", rarity: 0, shop: true},
	"BlueKey" : {name: "BlueKey", rarity: 2, costMod: 2, shop: true},
	"Lockpick" : {name: "Lockpick", rarity: 0, shop: true},
	"Pick" : {name: "Lockpick", rarity: 0, shop: true},
	//"4Lockpick" : {name: "4Lockpick", rarity: 1, shop: true},
	"3Bola" : {name: "3Bola", consumable: "Bola", quantity: 3, rarity: 0, shop: true},
	"3Bomb" : {name: "3Bomb", consumable: "Bomb", quantity: 3, rarity: 1, shop: true},
	"2Dynamite" : {name: "2Dynamite", consumable: "Dynamite", quantity: 2, rarity: 2, shop: true},
	"2C4" : {name: "2C4", consumable: "C4", quantity: 2, rarity: 3, shop: true},
	"3Flash" : {name: "3Flash", consumable: "FlashBomb", quantity: 3, rarity: 2, shop: true},
	"3Flashbang" : {name: "3Flashbang", consumable: "Flashbang", quantity: 3, rarity: 3, shop: true},
	"3Smoke" : {name: "3Smoke", consumable: "SmokeBomb", quantity: 3, rarity: 1, shop: true},
	"MaidUniform" : {name: "MaidUniform", outfit: "MaidUniform", rarity: 2, shop: true, ignoreInventory: "Maid", uniqueTags: ["outfit"]},
	"Bast" : {name: "Bast", outfit: "Bast", rarity: 2, shop: true, ignoreInventory: "Bast", uniqueTags: ["outfit"]},
	"Bountyhunter" : {name: "Bountyhunter", outfit: "Bountyhunter", rarity: 2, shop: true, ignoreInventory: "Bountyhunter", uniqueTags: ["outfit"]},
	"Dragon" : {name: "Dragon", outfit: "Dragon", rarity: 2, shop: true, ignoreInventory: "Dragon", uniqueTags: ["outfit"]},
	"BlueSuit" : {name: "BlueSuit", outfit: "BlueSuit", rarity: 2, shop: true, ignoreInventory: "Maid", uniqueTags: ["outfit"]},
	"Elven" : {name: "Elven", outfit: "Elven", rarity: 2, shop: true, ignoreInventory: "Elven", uniqueTags: ["outfit"]},
	"ElementalDress" : {name: "ElementalDress", outfit: "ElementalDress", rarity: 2, shop: true, ignoreInventory: "ElementalDress", uniqueTags: ["outfit"]},
	//"PotionCollar" : {name: "PotionCollar", rarity: 2, shop: true},
};

let KinkyDungneonShopRestraints = {
	"SlimeWalkers" : {name: "SlimeWalkers", rarity: 2, shop: true},
	"SarielPanties" : {name: "SarielPanties", rarity: 5, shop: true},
	"ElvenPanties" : {name: "ElvenPanties", rarity: 3, shop: true},
	"DivineBelt" : {name: "DivineBelt", rarity: 5, shop: true, uniqueTags: ["divine"]},
	"DivineBelt2" : {name: "DivineBelt2", rarity: 5, shop: true, uniqueTags: ["divine"]},
	"DivineBra" : {name: "DivineBra", rarity: 5, shop: true, uniqueTags: ["divine"]},
	"DivineBra2" : {name: "DivineBra2", rarity: 5, shop: true, uniqueTags: ["divine"]},
	"DusterGag" : {name: "DusterGag", rarity: 2, shop: true},
	"GasMask" : {name: "GasMask", rarity: 2, shop: true},
	"PotionCollar" : {name: "PotionCollar", rarity: 3, shop: true},
	"Sunglasses" : {name: "Sunglasses", rarity: 2, shop: true, uniqueTags: ["shades"]},
	"Sunglasses2" : {name: "Sunglasses2", rarity: 2, shop: true, uniqueTags: ["shades"]},
};

let KDConsumableEffects: Record<string, (Consumable: consumable) => void> = {
	"Snuffer": (_Consumable) => {
		let tiles = KDGetEffectTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
		for (let tile of Object.values(tiles)) {
			if (tile?.tags?.includes("snuffable")) {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: tile.name + "Unlit",
					duration: 9999, infinite: true,
				}, 0);
				KinkyDungeonAdvanceTime(1);
				return;
			}
		}
		KinkyDungeonSendTextMessage(10, TextGet("KDNotSnuffable"), "#ff5555", 3);
	},
	"SackOfSacks": (_Consumable) => {
		let tiles = KDGetEffectTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
		for (let tile of Object.values(tiles)) {
			if (tile?.tags?.includes("unsackable")) {
				tile.duration = 0;
				KinkyDungeonAdvanceTime(1);
				KinkyDungeonSendTextMessage(10, TextGet("KDUnbag"), "#ff5555", 3);
				return;
			}
			if (tile?.tags?.includes("sackable")) {
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Sack",
					duration: 8000,
				}, 0);
				KinkyDungeonAdvanceTime(1);
				return;
			}
		}
		KinkyDungeonSendTextMessage(10, TextGet("KDNotBaggable"), "#ff5555", 3);
	},
	"RemoveCurseOrHex": (Consumable) => {
		if (KinkyDungeonAllRestraintDynamic().some((r) => {return KDHasRemovableCurse(r.item, Consumable.power) || KDHasRemovableHex(r.item, Consumable.power);})) {
			KDGameData.InventoryAction = "RemoveCurseOrHex";
			KDGameData.CurseLevel = Consumable.power;
			KDGameData.UsingConsumable = Consumable.name;
			KinkyDungeonDrawState = "Inventory";
			KinkyDungeonCurrentFilter = Restraint;
			KinkyDungeonSendTextMessage(8, TextGet("KDRemoveCurseOrHex"), "#ff5555", 1, true);
		} else {
			KinkyDungeonSendTextMessage(8, TextGet("KDRemoveCurseOrHexFail"), "#ff5555", 1, true);
		}
	},
	"subAdd": (Consumable) => {
		let amount = typeof Consumable.data?.subAdd === 'number' ? Consumable.data?.subAdd : 5;
		KinkyDungeonChangeRep("Ghost", amount);
	},
	"restore": (Consumable) => {
		let multi = 1.0;
		if (Consumable.scaleWithMaxSP) {
			multi = Math.max(KinkyDungeonStatStaminaMax / KDMaxStatStart);
		}
		let Manamulti = 1.0;
		if (Consumable.scaleWithMaxMP) {
			Manamulti = Math.max(KinkyDungeonStatManaMax / KDMaxStatStart);
		}
		let Willmulti = 1.0;
		if (Consumable.scaleWithMaxWP) {
			Willmulti = Math.max(KinkyDungeonStatWillMax / KDMaxStatStart);
		}
		let Distmulti = 1.0;
		if (Consumable.scaleWithMaxAP) {
			Distmulti = Math.max(KinkyDungeonStatDistractionMax / KDMaxStatStart);
		}
		let gagFloor = Consumable.gagFloor ? Consumable.gagFloor : 0;
		let gagMult = (Consumable.potion && gagFloor != 1.0) ? Math.max(0, gagFloor + (1 - gagFloor) * (1 - Math.max(0, Math.min(1.0, KinkyDungeonGagTotal(true))))) : 1.0;
		if (gagMult < 0.999) {
			KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonConsumableLessEffective"), "#ff5277", 2);
		}
		if (Consumable.mp_instant != undefined) {
			//let manaAmt = Math.min(KinkyDungeonStatManaMax, KinkyDungeonStatMana + Consumable.mp_instant * Manamulti * gagMult) - KinkyDungeonStatMana;
			KinkyDungeonChangeMana(Consumable.mp_instant * Manamulti * gagMult, false, Consumable.mpool_instant * Manamulti * gagMult, false, true);
		}
		if (Consumable.wp_instant) KinkyDungeonChangeWill(Consumable.wp_instant * Willmulti * gagMult);
		if (Consumable.sp_instant) KinkyDungeonChangeStamina(Consumable.sp_instant * multi * gagMult);
		if (Consumable.ap_instant) KinkyDungeonChangeDistraction(Consumable.ap_instant * Distmulti * gagMult, false, Consumable.arousalRatio ? Consumable.arousalRatio : 0);

		KinkyDungeonCalculateMiscastChance();

		if (Consumable.mp_gradual) KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "PotionMana", type: "restore_mp", power: Consumable.mp_gradual/Consumable.duration * gagMult * Manamulti, duration: Consumable.duration});
		if (Consumable.wp_gradual) KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "PotionWill", type: "restore_wp", power: Consumable.wp_gradual/Consumable.duration * gagMult * Willmulti, duration: Consumable.duration});
		if (Consumable.sp_gradual) KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "PotionStamina", type: "restore_sp", power: Consumable.sp_gradual/Consumable.duration * gagMult * multi, duration: Consumable.duration});
		if (Consumable.ap_gradual) KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "PotionFrigid", type: "restore_ap", power: Consumable.ap_gradual/Consumable.duration * gagMult * Distmulti, duration: Consumable.duration});
	},
};

let KDConsumablePrereq: Record<string, (item: item, Quantity: number) => boolean> = {

};
