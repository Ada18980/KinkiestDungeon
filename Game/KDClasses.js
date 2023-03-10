'use strict';

let KDClassReqs = {
	"Trainee": () => {return KinkyDungeonSexyMode;}
};

let KDClassStart = {
	"Fighter": () => { // Fighter
		KinkyDungeonInventoryAddWeapon("Knife");
		KinkyDungeonInventoryAddWeapon("Sword");
		if (!KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("Breastplate"), 0, true, ""))
			KinkyDungeonInventoryAddLoose("Breastplate");
		KDGameData.PreviousWeapon = "Knife";
		KDSetWeapon("Sword");
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("CommandWord"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("WPUp1"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("WPUp1"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("IronWill"));
		KinkyDungeonSpellPoints = 3;
		KinkyDungeonRedKeys = 1;
		KinkyDungeonLockpicks = 1;
		KinkyDungeonGold = 100;

		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 2);
	},
	"Rogue": () => { // Rogue
		KinkyDungeonInventoryAddWeapon("Rope");
		KinkyDungeonInventoryAddWeapon("Dirk");

		if (!KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("LeatherBoots"), 0, true, ""))
			KinkyDungeonInventoryAddLoose("LeatherBoots");
		KDGameData.PreviousWeapon = "Rope";
		KDSetWeapon("Dirk");
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("CommandWord"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("SPUp1"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("SPUp1"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("Sneaky"));
		KinkyDungeonSpellPoints = 3;
		KinkyDungeonLockpicks = 2;
		KinkyDungeonGold = 100;

		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 2);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 1);
	},
	"Mage": () => { // Mage
		KinkyDungeonInventoryAddWeapon("Knife");
		KinkyDungeonInventoryAddWeapon("ArcaneCrystal");
		KDGameData.PreviousWeapon = "Knife";
		KDSetWeapon("ArcaneCrystal");

		KinkyDungeonSpells.push(KinkyDungeonFindSpell("CommandWord"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("Analyze"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("MPUp1"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("MPUp1"));
		KinkyDungeonSpellPoints = 3;
		KinkyDungeonRedKeys = 1;
		KinkyDungeonGold = 100;

		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 3);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 1);
	},
	"Peasant": () => { // Peasant
		KinkyDungeonSpellChoices = [];
		KinkyDungeonSpellPoints = 3;
	},
	"Trainee": () => { // Trainee
		KinkyDungeonSpellChoices = [];
		KinkyDungeonSpellPoints = 3;
		KinkyDungeonGold = 100;
		KinkyDungeonSpellChoices = [];
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("DistractionCast"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("MPUp1"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("APUp1"));
		KinkyDungeonInventoryAddWeapon("Knife");
		KDSetWeapon("Knife");
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 3);
		KinkyDungeonChangeFactionRep("Apprentice", .2);

		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug2"), 100, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), 100, true, "Gold");
	},
};