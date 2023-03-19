"use strict";

/**
 * @type {Record<string, consumable>}
 */
let KinkyDungeonConsumables = {
	"PotionMana" : {name: "PotionMana", potion: true, rarity: 0, shop: true, type: "restore", mp_instant: 5, mpool_instant: 0, mp_gradual: 0, scaleWithMaxMP: true, gagFloor: 0.5, duration: 0, sfx: "PotionDrink"},
	"ManaOrb" : {name: "ManaOrb", noHands: true, rarity: 2, shop: true, type: "restore", mp_instant: 0, mpool_instant: 20, mp_gradual: 0, scaleWithMaxMP: false, duration: 0, sfx: "Invis"},
	"PotionWill" : {name: "PotionWill", potion: true, rarity: 0, shop: true, type: "restore", wp_instant: 2.5, wp_gradual: 0, scaleWithMaxWP: true, duration: 0, gagFloor: 0.5, sfx: "PotionDrink"},
	"PotionStamina" : {name: "PotionStamina", potion: true, rarity: 1, shop: true, type: "restore", sp_instant: 5, sp_gradual: 25, scaleWithMaxSP: true, duration: 25, gagFloor: 0.5, sfx: "PotionDrink"},
	"PotionFrigid" : {name: "PotionFrigid", potion: true, rarity: 1, shop: true, type: "restore", ap_instant: -10, ap_gradual: -20, duration: 50, arousalRatio: 1.0, gagFloor: 0.5, sfx: "PotionDrink"},
	"SmokeBomb" : {name: "SmokeBomb", noHands: true, rarity: 2, costMod: -1, shop: true, type: "spell", spell: "Shroud", sfx: "FireSpell"},
	"PotionInvisibility" : {name: "PotionInvisibility", potion: true, rarity: 3, costMod: -1, shop: true, type: "spell", spell: "Invisibility", sfx: "PotionDrink"},
	"Ectoplasm" : {name: "Ectoplasm", noHands: true, rarity: 1, shop: false, type: "spell", spell: "LesserInvisibility", sfx: "Invis"},
	"EarthRune" : {name: "EarthRune", rarity: 2, costMod: -1, shop: false, type: "spell", spell: "Earthrune", sfx: "HeavySwing"},
	"WaterRune" : {name: "WaterRune", rarity: 2, costMod: -1, shop: false, type: "spell", spell: "Waterrune", sfx: "HeavySwing"},
	"Bola" : {name: "Bola", rarity: 0, costMod: -1, shop: false, useQuantity: 1, noConsumeOnUse: true, type: "targetspell", spell: "PlayerBola"},
	"IceRune" : {name: "IceRune", rarity: 2, costMod: -1, shop: false, type: "spell", spell: "Icerune", sfx: "Freeze"},
	"Bomb" : {name: "Bomb", rarity: 1, costMod: -1, shop: false, type: "spell", spell: "Bomb", sfx: "MagicSlash"},
	"ElfCrystal" : {name: "ElfCrystal", noHands: true, rarity: 3, costMod: -1, shop: false, type: "spell", spell: "Slippery", sfx: "MagicSlash"},
	"EnchantedGrinder" : {name: "EnchantedGrinder", noHands: true, rarity: 4, shop: true, type: "spell", spell: "Cutting", sfx: "Laser"},
	"MistressKey" : {name: "MistressKey", rarity: 8, costMod: -1, shop: false, type: "goldKey"},
	"AncientPowerSource" : {name: "AncientPowerSource", noHands: true, rarity: 4, costMod: -1, shop: true, type: "charge", amount: 0.250},
	"AncientPowerSourceSpent" : {name: "AncientPowerSourceSpent", noHands: true, rarity: 3, costMod: -1, shop: false, type: "recharge"},
	"ScrollArms" : {name: "ScrollArms", noHands: true, rarity: 2, costMod: 1, shop: true, type: "buff", buff: "NoArmsComp", duration: 12, power: 1, aura: "#aaffaa", sfx: "FireSpell"},
	"ScrollVerbal" : {name: "ScrollVerbal", noHands: true, rarity: 2, costMod: 1, shop: true, type: "buff", buff: "NoVerbalComp", duration: 12, power: 1, aura: "#aaaaff", sfx: "FireSpell"},
	"ScrollLegs" : {name: "ScrollLegs", noHands: true, rarity: 2, costMod: 1, shop: true, type: "buff", buff: "NoLegsComp", duration: 12, power: 1, aura: "#ffaaaa", sfx: "FireSpell"},
	"ScrollPurity" : {name: "ScrollPurity", noHands: true, rarity: 4, shop: true, type: "shrineRemove", shrine: "Vibes", sfx: "FireSpell"},

	"DollID" : {name: "DollID", rarity: 0, shop: false, type: "dollID", noHands: true, sfx: "FutureLock"},
};

// Separate for organizational purposes
/**
 * @type {Record<string, consumable>}
 */
let KDCookies = {
	"Cookie" : {name: "Cookie", rarity: 0, shop: true, type: "restore", wp_instant: 1.0, wp_gradual: 0, scaleWithMaxWP: true, needMouth: true, delay: 3, gagMax: 0.59, duration: 0, sfx: "Cookie"},
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
	"RedKey" : {name: "RedKey", rarity: 0, shop: true},
	"BlueKey" : {name: "BlueKey", rarity: 2, costMod: 2, shop: true},
	"Lockpick" : {name: "Lockpick", rarity: 0, shop: true},
	//"4Lockpick" : {name: "4Lockpick", rarity: 1, shop: true},
	"3Bola" : {name: "3Bola", consumable: "Bola", quantity: 3, rarity: 0, shop: true},
	"3Bomb" : {name: "3Bomb", consumable: "Bomb", quantity: 3, rarity: 1, shop: true},
	"MaidUniform" : {name: "MaidUniform", rarity: 2, shop: true, ignoreInventory: "Maid"},
	//"PotionCollar" : {name: "PotionCollar", rarity: 2, shop: true},
};

let KinkyDungneonShopRestraints = {
	"SlimeWalkers" : {name: "SlimeWalkers", rarity: 2, shop: true},
	"PotionCollar" : {name: "PotionCollar", rarity: 2, shop: true},
};

/** @type {Record<string, (consumable) => void>} */
let KDConsumableEffects = {
	"subAdd": (Consumable) => {
		let amount = Consumable.data?.subAdd || 5;
		KinkyDungeonChangeRep("Ghost", amount);
	},
	"dollID": (Consumable) => {
		KinkyDungeonSetFlag("DollmakerGrace", 300);
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
			KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonConsumableLessEffective"), "#ff0000", 2);
		}
		if (Consumable.mp_instant != undefined) {
			//let manaAmt = Math.min(KinkyDungeonStatManaMax, KinkyDungeonStatMana + Consumable.mp_instant * Manamulti * gagMult) - KinkyDungeonStatMana;
			KinkyDungeonChangeMana(Consumable.mp_instant * Manamulti * gagMult, false, Consumable.mpool_instant * Manamulti * gagMult, false, true);
		}
		if (Consumable.wp_instant) KinkyDungeonChangeWill(Consumable.wp_instant * Willmulti * gagMult);
		if (Consumable.sp_instant) KinkyDungeonChangeStamina(Consumable.sp_instant * multi * gagMult);
		if (Consumable.ap_instant) KinkyDungeonChangeDistraction(Consumable.ap_instant * Distmulti * gagMult, false, Consumable.arousalRatio ? Consumable.arousalRatio : 0);

		KinkyDungeonCalculateMiscastChance();

		if (Consumable.mp_gradual) KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "PotionMana", type: "restore_mp", power: Consumable.mp_gradual/Consumable.duration * gagMult * Manamulti, duration: Consumable.duration});
		if (Consumable.wp_gradual) KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "PotionWill", type: "restore_wp", power: Consumable.wp_gradual/Consumable.duration * gagMult * Willmulti, duration: Consumable.duration});
		if (Consumable.sp_gradual) KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "PotionStamina", type: "restore_sp", power: Consumable.sp_gradual/Consumable.duration * gagMult * multi, duration: Consumable.duration});
		if (Consumable.ap_gradual) KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "PotionFrigid", type: "restore_ap", power: Consumable.ap_gradual/Consumable.duration * gagMult * Distmulti, duration: Consumable.duration});
	},
};

/** @type {Record<string, (item: item, Quantity: number) => boolean>} */
let KDConsumablePrereq = {

};