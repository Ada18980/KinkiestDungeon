'use strict';

let KDClassReqs: Record<string, () => boolean> = {
	"Trainee": () => {return KinkyDungeonSexyMode;}
};

/** For backwards save compat */
let KDClassSynonyms = {
	Mage: "Wizard",
}
/** Forbidden for multiclass */
let KDNoMulticlass = {
}



let KDClassStart: Record<string, (start: boolean) => void> = {
	"Fighter": (start) => { // Fighter
		if (start) {
			KinkyDungeonInventoryAddWeapon("Shield");
			KinkyDungeonInventoryAddWeapon("Sword");
			if (!KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("Breastplate"), 0, true, ""))
				KinkyDungeonInventoryAddLoose("Breastplate");
			KDGameData.PreviousWeapon = ["Sword", "Shield", "Unarmed", "Unarmed"];
			KDSetWeapon("Sword");
			KDGameData.Offhand = "Shield";
		}
		
		KDPushSpell(KinkyDungeonFindSpell("BattleRhythm"));
		if (start) {
			KinkyDungeonSpellChoicesToggle.push(true);
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
			KDPushSpell(KinkyDungeonFindSpell("Offhand"));
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
			KDPushSpell(KinkyDungeonFindSpell("Bondage"));
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
			KDPushSpell(KinkyDungeonFindSpell("CommandWord"));
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
			KDGameData.StatMaxBonus.WP += 5;
			KDPushSpell(KinkyDungeonFindSpell("IronWill"));
			KDPushSpell(KinkyDungeonFindSpell("FighterOffhand"));
			KinkyDungeonSpellPoints = 3;
			KDAddConsumable("RedKey", 1);
			KDAddConsumable("Pick", 2);
			KinkyDungeonGold = 100;
	
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 1);
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 1);
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 2);
			KinkyDungeonInventoryAddLoose("RopeSnakeRaw", undefined, undefined, 10);
			KinkyDungeonInventoryAddLoose("TrapCuffs", undefined, undefined, 3);
		}
		
	},
	"Rogue": (start) => { // Rogue
		if (start) {
			KinkyDungeonInventoryAddWeapon("Dirk");
		KinkyDungeonInventoryAddWeapon("Bow");
		KDGameData.PreviousWeapon = ["Bow", "Dirk", "Unarmed", "Unarmed"];
		KDSetWeapon("Dirk");
		}
		KDPushSpell(KinkyDungeonFindSpell("RogueTargets"));
		if (start) {
			KDPushSpell(KinkyDungeonFindSpell("Bondage"));
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
			KDPushSpell(KinkyDungeonFindSpell("CommandWord"));
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
			KDGameData.StatMaxBonus.SP += 5;
			KDPushSpell(KinkyDungeonFindSpell("Sneaky"));
			KinkyDungeonSpellPoints = 3;
			KDAddConsumable("Pick", 3);
			KinkyDungeonGold = 100;

			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 1);
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 2);
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 1);
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 4);
			KinkyDungeonInventoryAddLoose("RopeSnakeRaw", undefined, undefined, 10);
			KinkyDungeonInventoryAddLoose("TrapGag", undefined, undefined, 3);
		}
	},
	"Mage": (start) => { // Mage
		if (start) {
			KinkyDungeonInventoryAddWeapon("Knife");
			KinkyDungeonInventoryAddWeapon("ArcaneTome");
			KDGameData.PreviousWeapon = ["ArcaneTome", "Knife", "Unarmed", "Unarmed"];
			KDSetWeapon("ArcaneTome");
		}
		KDPushSpell(KinkyDungeonFindSpell("ManaRegen"));
		if (start) {
			KDPushSpell(KinkyDungeonFindSpell("Bondage"));
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
			KDPushSpell(KinkyDungeonFindSpell("CommandWord"));
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
			KDPushSpell(KinkyDungeonFindSpell("Analyze"));
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
			KDGameData.StatMaxBonus.MP += 5;
			KinkyDungeonSpellPoints = 3;
			KDAddConsumable("RedKey", 2);
			KinkyDungeonGold = 100;

			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 3);
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 1);
			KinkyDungeonInventoryAddLoose("StrongMagicRopeRaw", undefined, undefined, 10);
		}
	},
	"Peasant": (start) => { // Peasant
		KDPushSpell(KinkyDungeonFindSpell("Peasant"));
		if (start) {
			KDPushSpell(KinkyDungeonFindSpell("Bondage"));
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
			KinkyDungeonSpellPoints = 3;
			KinkyDungeonInventoryAddLoose("RopeSnakeRaw", undefined, undefined, 3);
		}
	},
	"Trainee": (start) => { // Trainee
		if (start) {
			KDPushSpell(KinkyDungeonFindSpell("Bondage"));
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
		}
		KDPushSpell(KinkyDungeonFindSpell("DistractionCast"));
		if (start) {
			KDInsertSpellChoiceInFreeSlot(KinkyDungeonSpells.length - 1);
			KinkyDungeonSpellPoints = 3;
			KinkyDungeonGold = 100;
			//KDPushSpell(KinkyDungeonFindSpell("DistractionCast"));
			KDGameData.StatMaxBonus.AP += 2.5;
			KDGameData.StatMaxBonus.MP += 2.5;
			KinkyDungeonInventoryAddWeapon("Knife");
			KDGameData.PreviousWeapon = ["Knife", "Unarmed", "Unarmed", "Unarmed"];
			KDSetWeapon("Knife");
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 3);
			KinkyDungeonChangeFactionRep("Apprentice", .2);

			KinkyDungeonInventoryAddLoose("WeakMagicRopeRaw", undefined, undefined, 10);
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug2"), 0, true, "");
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), 10, true, "Gold");
		}
	},
};

let KinkyDungeonClassModeChoice = "";

function KDDrawClasses(xOffset: number = 0, yOffset: number = 0,
	filter?: (kurasu: string) => boolean,
	redout?: (kurasu: string) => string,
	img?: (kurasu: string) => string,
	click?: (kurasu: string) => boolean): boolean {
	let buttonswidth = 168;
	let buttonsheight = 50;
	let buttonspad = 25;
	let buttonsypad = 10;
	let buttonsstart = 875;
	let X = 0;
	let Y = 0;
	if (!redout) redout = (kurasu) => {
		return ((!KDClassReqs[kurasu]) || KDClassReqs[kurasu]()) ?
			(KinkyDungeonClassMode == kurasu ? KDBaseWhite : "#888888")
			: KDBaseRed;
	}

	let classCount = Object.keys(KDClassStart).length;
	let tt = false;
	for (let i = 0; i < classCount; i++) {
		let kurasu = Object.keys(KDClassStart)[i];
		if (filter && !filter(kurasu)) continue;
		X = i % 4;
		Y = Math.floor(i / 4);

		DrawButtonKDEx("Class" + i, (_bdata) => {
			if (!click) {
				KinkyDungeonClassMode = Object.keys(KDClassStart)[i];
				localStorage.setItem("KinkyDungeonClassMode", "" + KinkyDungeonClassMode);
				return true;
			}
			return click(Object.keys(KDClassStart)[i]);
		}, (!KDClassReqs[Object.keys(KDClassStart)[i]]) || KDClassReqs[Object.keys(KDClassStart)[i]](),
		xOffset + buttonsstart + (buttonspad + buttonswidth) * X,
		yOffset + 190 + Y*(buttonsheight + buttonsypad), buttonswidth, buttonsheight,
		TextGet("KinkyDungeonClassMode" + Object.keys(KDClassStart)[i]),
			redout(kurasu),
			img ? img(kurasu) : "", undefined, undefined,
			true, KDButtonColor, undefined, true, {
				scaleImage: !!(img && img(kurasu))
			});
		if (MouseIn(xOffset + buttonsstart + (buttonspad + buttonswidth) * X,
		yOffset + 190 + Y*(buttonsheight + buttonsypad),
		buttonswidth, buttonsheight) && !tt) {
			DrawTextFitKD(TextGet("KinkyDungeonClassModeDesc" + Object.keys(KDClassStart)[i]),
			xOffset + 1250,
			yOffset + 120, 1000, KDBaseWhite, KDTextGray0);
			tt = true;
		}
	}
	return tt;
}