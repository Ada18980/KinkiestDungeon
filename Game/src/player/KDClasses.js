'use strict';

let KDClassReqs = {
	"Trainee": () => {return KinkyDungeonSexyMode;}
};

let KDClassStart = {
	"Fighter": () => { // Fighter
		KinkyDungeonInventoryAddWeapon("Shield");
		KinkyDungeonInventoryAddWeapon("Sword");
		if (!KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("Breastplate"), 0, true, ""))
			KinkyDungeonInventoryAddLoose("Breastplate");
		KDGameData.PreviousWeapon = ["Sword", "Shield", "Unarmed", "Unarmed"];
		KDSetWeapon("Sword");
		KDGameData.Offhand = "Shield";
		KDPushSpell(KinkyDungeonFindSpell("BattleRhythm"));
		KinkyDungeonSpellChoicesToggle.push(true);
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KDPushSpell(KinkyDungeonFindSpell("Offhand"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KDPushSpell(KinkyDungeonFindSpell("Bondage"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KDPushSpell(KinkyDungeonFindSpell("CommandWord"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KDGameData.StatMaxBonus.WP += 5;
		KDPushSpell(KinkyDungeonFindSpell("IronWill"));
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
		KinkyDungeonInventoryAddWeapon("Dirk");
		KinkyDungeonInventoryAddWeapon("Bow");
		KDGameData.PreviousWeapon = ["Bow", "Dirk", "Unarmed", "Unarmed"];
		KDSetWeapon("Dirk");
		KDPushSpell(KinkyDungeonFindSpell("RogueTargets"));
		KDPushSpell(KinkyDungeonFindSpell("Bondage"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KDPushSpell(KinkyDungeonFindSpell("CommandWord"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KDGameData.StatMaxBonus.SP += 5;
		KDPushSpell(KinkyDungeonFindSpell("Sneaky"));
		KinkyDungeonSpellPoints = 3;
		KinkyDungeonLockpicks = 2;
		KinkyDungeonGold = 100;

		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 2);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 1);
	},
	"Mage": () => { // Mage
		KinkyDungeonInventoryAddWeapon("Knife");
		KinkyDungeonInventoryAddWeapon("ArcaneCrystal");
		KDGameData.PreviousWeapon = ["ArcaneCrystal", "Knife", "Unarmed", "Unarmed"];
		KDSetWeapon("ArcaneCrystal");

		KDPushSpell(KinkyDungeonFindSpell("ManaRegen"));
		KDPushSpell(KinkyDungeonFindSpell("Bondage"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KDPushSpell(KinkyDungeonFindSpell("CommandWord"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KDPushSpell(KinkyDungeonFindSpell("Analyze"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KDGameData.StatMaxBonus.MP += 5;
		KinkyDungeonSpellPoints = 3;
		KinkyDungeonRedKeys = 1;
		KinkyDungeonGold = 100;

		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 3);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 1);
	},
	"Peasant": () => { // Peasant
		KDPushSpell(KinkyDungeonFindSpell("Peasant"));
		KDPushSpell(KinkyDungeonFindSpell("Bondage"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KinkyDungeonSpellPoints = 3;
	},
	"Trainee": () => { // Trainee
		KDPushSpell(KinkyDungeonFindSpell("Bondage"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KinkyDungeonSpellPoints = 3;
		KinkyDungeonGold = 100;
		KDPushSpell(KinkyDungeonFindSpell("DistractionCast"));
		KDGameData.StatMaxBonus.AP += 2.5;
		KDGameData.StatMaxBonus.MP += 2.5;
		KinkyDungeonInventoryAddWeapon("Knife");
		KDGameData.PreviousWeapon = ["Knife", "Unarmed", "Unarmed", "Unarmed"];
		KDSetWeapon("Knife");
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 3);
		KinkyDungeonChangeFactionRep("Apprentice", .2);

		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug2"), 0, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), 10, true, "Gold");
	},
};