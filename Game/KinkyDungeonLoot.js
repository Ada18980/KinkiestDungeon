"use strict";

/** @type {item[]} */
let KinkyDungeonLostItems = [];
let KDTightRestraintsMod = 6;
let KDTightRestraintsMult = 2;

/**
 * @param {item[]} list
 * @param {boolean} excludeBound - bound weapons, i.e. magic knives and weapons
 */
function KinkyDungeonAddLostItems(list, excludeBound) {
	for (let item of list) {
		let unique = true;
		if (item.type && item.name == "Knife") unique = false;
		for (let item2 of KinkyDungeonLostItems) {
			if (item2.name == item.name) {
				unique = false;
				break;
			}
		}
		if (unique && (!excludeBound || item.type != Weapon || (KDWeapon(item).magic))) {
			KinkyDungeonLostItems.push(item);
			if (item.type == Consumable) {
				item.quantity = Math.min(item.quantity, 10);
			}
		} else if (!unique && item.type == Consumable && item.quantity) {
			for (let item2 of KinkyDungeonLostItems) {
				if (item2.name == item.name) {
					item2.quantity = Math.min(item2.quantity + item.quantity, 10);
					break;
				}
			}
		}
	}
}

let cursedRestraintCache = {

};


// Determines if you get a good loot from a blue locked chest
let KinkyDungeonSpecialLoot = false;
let KinkyDungeonLockedLoot = false;

function KinkyDungeonLoot(Level, Index, Type, roll, tile, returnOnly, noTrap) {
	let lootWeightTotal = 0;
	let lootWeights = [];

	let lootType = KinkyDungeonLootTable[Type];
	for (let loot of lootType) {
		let effLevel = Level;
		if (loot.trap && KinkyDungeonStatsChoice.has("TightRestraints")) {
			effLevel *= KDTightRestraintsMult;
			effLevel += KDTightRestraintsMod;
		}
		if ((effLevel >= loot.minLevel || KinkyDungeonNewGame > 0) && (loot.allFloors || loot.floors[Index])) {
			let prereqs = true;
			if (loot.arousalMode && !KinkyDungeonStatsChoice.get("arousalMode")) prereqs = false;

			if (loot.prerequisites) {

				let maxlevel = 999;
				let minlevel = 0;
				let SpellList = null;
				if (prereqs && loot.prerequisites.includes("vibe") && KinkyDungeonPlayerTags.has("NoVibes")) prereqs = false;
				if (prereqs && loot.prerequisites.includes("alreadyBelted") && KinkyDungeonChastityMult() < 0.9) prereqs = false;
				if (prereqs && loot.prerequisites.includes("lowlevel")) maxlevel = 2;
				if (prereqs && loot.prerequisites.includes("fewpick") && KinkyDungeonLockpicks > 3) prereqs = false;
				if (prereqs && loot.prerequisites.includes("lowpotions") && (
					KinkyDungeonItemCount("PotionFrigid") + KinkyDungeonItemCount("PotionMana") + KinkyDungeonItemCount("PotionStamina") > 10
				)) prereqs = false;
				if (prereqs && loot.prerequisites.includes("lowmanapotions") && (
					KinkyDungeonItemCount("PotionMana") > 20
				)) prereqs = false;
				if (prereqs && loot.prerequisites.includes("lowwillpotions") && (
					KinkyDungeonItemCount("PotionWill") > 15
				)) prereqs = false;
				if (prereqs && loot.prerequisites.includes("UnlearnedElements")) SpellList = KinkyDungeonSpellList.Elements;
				if (prereqs && loot.prerequisites.includes("UnlearnedConjure")) SpellList = KinkyDungeonSpellList.Conjure;
				if (prereqs && loot.prerequisites.includes("UnlearnedIllusion")) SpellList = KinkyDungeonSpellList.Illusion;
				if (prereqs && loot.prerequisites.includes("NoBoltCutters") && KinkyDungeonInventoryGet("BoltCutters")) prereqs = false;
				else if (prereqs && loot.prerequisites.includes("LostItems") && KinkyDungeonLostItems.length < 1) prereqs = false;
				else if (prereqs && loot.prerequisites.includes("LightRestraint") && KinkyDungeonAllRestraint().length < 1) prereqs = false;
				else if (prereqs && loot.prerequisites.includes("ModerateRestraint") && KinkyDungeonAllRestraint().length < 4 && !(!KinkyDungeonIsHandsBound() && !KinkyDungeonCanTalk() && KinkyDungeonSlowLevel < 1)) prereqs = false;
				if (prereqs && loot.prerequisites.includes("pearlChest") && !KDPearlRequirement) prereqs = false;

				if (prereqs)
					for (let prereq of loot.prerequisites) {
						if (prereq.startsWith("Group_")) {
							let group = prereq.substring(6);
							let item = KinkyDungeonGetRestraintItem(group);
							let power = item && KDRestraint(item) &&  KDRestraint(item).power ? KinkyDungeonRestraintPower(item) : 0;
							if (power && (power >= loot.power ||  KDRestraint(item).enchanted)) {
								prereqs = false;
								break;
							}
						}
					}

				if (SpellList != null && KinkyDungeonGetUnlearnedSpells(minlevel, maxlevel, SpellList).length == 0) {
					prereqs = false;
				}
			}
			if (KinkyDungeonGoddessRep.Ghost && loot.submissive && (KinkyDungeonGoddessRep.Ghost + 50 < loot.submissive)) prereqs = false;
			if (loot.noweapon) {
				for (let w of loot.noweapon) {
					if (KinkyDungeonInventoryGet(w)) {
						prereqs = false;
						break;
					}
				}
			}
			if (loot.norestraint) {
				for (let r of loot.norestraint) {
					if (KinkyDungeonInventoryGet(r)) {
						prereqs = false;
						break;
					}
				}
			}
			// Check for cursed norestraint as well
			if (loot.norestraintcursed) {
				let id = loot.norestraintcursed + `${loot.curselevelmin || 0},${loot.curselevelmax || 0}`;
				if (!cursedRestraintCache[id]) cursedRestraintCache[id] = [...KinkyDungeonGetCurses(loot.norestraintcursed, true, loot.curselevelmin, loot.curselevelmax)];
				for (let r of cursedRestraintCache[id]) {
					if (KinkyDungeonInventoryGet(r)) {
						prereqs = false;
						break;
					}
				}
			}

			if (prereqs) {
				let weightMult = 1.0;
				let weightBonus = 0;
				if (loot.goddess) {
					let grep = KinkyDungeonGoddessRep[loot.goddess];
					if (grep) {
						weightBonus += loot.goddessWeight * grep/50;
					}
				}
				if (loot.playerTags)
					for (let tag in loot.playerTags)
						if (KinkyDungeonPlayerTags.get(tag)) weightBonus += loot.playerTags[tag];
				if (Type == "chest") {
					if (tile && tile.Special && loot.special) weightBonus += loot.special;
					else if (tile && tile.Special) weightMult = 0;
					if (tile && tile.RedSpecial && loot.redspecial) weightBonus += loot.redspecial;
				}

				let rep = (KinkyDungeonGoddessRep.Ghost + 50)/100;
				if (loot.trap || loot.magic) weightMult *= (1 + rep);
				if (loot.trap && KinkyDungeonCurrentMaxEnemies > 0) {
					let nonSumEnemies = 0;
					for (let e of KinkyDungeonEntities) {if (!e.summoned) nonSumEnemies++;}
					weightMult *= Math.max(0, 1 - 0.5*nonSumEnemies/KinkyDungeonCurrentMaxEnemies);
				}
				if (loot.trap && noTrap)
					weightMult = 0;

				lootWeights.push({loot: loot, weight: lootWeightTotal});
				lootWeightTotal += Math.max(0, (loot.weight + weightBonus) * weightMult);
			}
		}
	}

	let selection = (roll ? roll : KDRandom()) * lootWeightTotal;

	for (let L = lootWeights.length - 1; L >= 0; L--) {
		if (selection > lootWeights[L].weight) {
			if (returnOnly) return lootWeights[L].loot;
			let replace = KinkyDungeonLootEvent(lootWeights[L].loot, Level, TextGet(lootWeights[L].loot.message), lootWeights[L].loot.lock);

			if (!KinkyDungeonSendActionMessage(8, replace, lootWeights[L].loot.messageColor, lootWeights[L].loot.messageTime || 2))
				KinkyDungeonSendTextMessage(8, replace, lootWeights[L].loot.messageColor, lootWeights[L].loot.messageTime || 2, true, true);

			break;
		}
	}
}

function KinkyDungeonGetUnlearnedSpells(minlevel, maxlevel, SpellList) {
	let SpellsUnlearned = [];

	for (let spell of SpellList) {
		if (spell.level >= minlevel && spell.level <= maxlevel && !spell.passive && KinkyDungeonCheckSpellPrerequisite(spell)) {
			SpellsUnlearned.push(spell);
		}
	}

	for (let spell of KinkyDungeonSpells) {
		for (let S = 0; S < SpellsUnlearned.length; S++) {
			if (spell.name == SpellsUnlearned[S].name) {
				SpellsUnlearned.splice(S, 1);
				S--;
			}
		}
	}

	return SpellsUnlearned;
}

/*
You find a scrap of a journal! (pg. 24)
From the journal of Catherine Edgar Willows, well-known explorer (who vanished in the dungeon 30 years ago)

"Many who trowel the upper levels of the Mistress' tomb often ask rhetorically: 'Why are there weird kinky traps guarding treasure chests? Why not have real, deadly traps if the purpose is to dissuade intruders?'

They make a crucial mistake: The treasure chests aren't trapped. Rather, they are full of gold. And we know that gold is pleasing to the gods: our economy runs on it, and the gods only make interventions in our day-to-day affairs because we give them gold.
Lesser gods, known as spirits, also love gold, but unlike the gods we know, these lesser spirits cannot consume gold on an altar in one fell swoop like the gods can. Therefore, they need to physically inhabit the place where the gold sits, slowly draining it of its pleasing essence.

So the question is not "why did somebody lay these traps." The answer is that they are not traps at all. I surmise that the upper floors were once a place of offering for the dead. And when the old civilization perished and the entire complex sank into the ground, there was no longer anyone to drive the spirits away and keep them from inhabiting the upstairs.

As for why there are so many restraints in general rather than your typical sort of spirits... well we know what the Mistress surrounded herself with."
*/


function KinkyDungeonLootEvent(Loot, Floor, Replacemsg, Lock) {
	let value = 0;
	if (Loot.weapon) {
		KinkyDungeonInventoryAddWeapon(Loot.weapon);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItem" + Loot.weapon));
	}
	else if (Loot.armor) {
		let armor = Loot.armor;
		let unlockcurse = null;
		if (Loot.curselevelmin != undefined || Loot.curselevelmax != undefined)
			armor = CommonRandomItemFromList("", KinkyDungeonGetCurses(Loot.armor, false, Loot.curselevelmin, Loot.curselevelmax));
		if (Loot.unlockcurse) {
			let curselist = [];
			for (let c of Loot.unlockcurse) {
				curselist.push(...KDCurseUnlockList[c]);
			}
			unlockcurse = CommonRandomItemFromList("", curselist);
		}
		KinkyDungeonInventoryAddLoose(armor, unlockcurse);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("ArmorAcquired", TextGet("Restraint" + Loot.armor));
	}
	else if (Loot.name == "spell_points") {
		let amount = 1;
		KinkyDungeonSpellPoints += amount;
		KinkyDungeonSendFloater({x: 1100, y: 800 - KDRecentRepIndex * 40}, `+${amount} Spell Points!!!`, "#8888ff", 5, true);
		KDRecentRepIndex += 1;
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("AMOUNT", "" + amount);
	}
	else if (Loot.name == "spell_illusion_low") {
		let SpellsUnlearned = KinkyDungeonGetUnlearnedSpells(0, 2, KinkyDungeonSpellList.Illusion);
		let spellIndex = Math.floor(KDRandom()*SpellsUnlearned.length);

		let spell = SpellsUnlearned[spellIndex];
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("SpellLearned", TextGet("KinkyDungeonSpell" + spell.name));
		KinkyDungeonSpells.push(spell);
	}
	else if (Loot.name == "spell_conjuration_low") {
		let SpellsUnlearned = KinkyDungeonGetUnlearnedSpells(0, 2, KinkyDungeonSpellList.Conjure);
		let spellIndex = Math.floor(KDRandom()*SpellsUnlearned.length);

		let spell = SpellsUnlearned[spellIndex];
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("SpellLearned", TextGet("KinkyDungeonSpell" + spell.name));
		KinkyDungeonSpells.push(spell);
	}
	else if (Loot.name == "spell_elemental_low") {
		let SpellsUnlearned = KinkyDungeonGetUnlearnedSpells(0, 2, KinkyDungeonSpellList.Elements);
		let spellIndex = Math.floor(KDRandom()*SpellsUnlearned.length);

		let spell = SpellsUnlearned[spellIndex];
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("SpellLearned", TextGet("KinkyDungeonSpell" + spell.name));
		KinkyDungeonSpells.push(spell);
	}
	else if (Loot.name == "pearlReward") {
		let rewardAvailable = [];
		for (let rep of Object.entries(KinkyDungeonGoddessRep)) {
			let rewards = KDBlessedRewards[rep[0]];
			if (rewards && rep[1] > 45) {
				for (let r of rewards) {
					if (!KinkyDungeonInventoryGet(r)) {
						rewardAvailable.push(r);
					}
				}
			}
		}
		let reward = rewardAvailable[Math.floor(KDRandom() * rewardAvailable.length)];
		if (KinkyDungeonWeapons[reward]) {
			KinkyDungeonInventoryAddWeapon(reward);
			if (Replacemsg)
				Replacemsg = Replacemsg.replace("ITEMGET", TextGet("KinkyDungeonInventoryItem" + reward));
		}
		else if (KinkyDungeonFindSpell(reward, true)) {
			KinkyDungeonSpells.push(KinkyDungeonFindSpell(reward, true));
			if (Replacemsg)
				Replacemsg = Replacemsg.replace("ITEMGET", TextGet("KinkyDungeonSpell" + reward));
		}
		else if (KinkyDungeonConsumables[reward]) {
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables[reward], 1);
			if (Replacemsg)
				Replacemsg = Replacemsg.replace("ITEMGET", TextGet("KinkyDungeonInventoryItem" + reward));
		}
		else {
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 1);
			if (Replacemsg)
				Replacemsg = Replacemsg.replace("ITEMGET", TextGet("KinkyDungeonInventoryItemAncientPowerSource"));
		}

	}
	else if (Loot.name == "gold") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
	}
	else if (Loot.name == "biggold") {
		value = Math.ceil((250 + 100 * KDRandom()) * (1 + Floor/40));
	}
	else if (Loot.name == "smallgold") {
		value = Math.ceil((25 + 15 * KDRandom()) * (1 + Floor/35));
	}
	else if (Loot.name == "knife") {
		KinkyDungeonInventoryAddWeapon("Knife");
	}
	else if (Loot.name == "magicknife") {
		KinkyDungeonInventoryAddWeapon("EnchKnife");
	}
	else if (Loot.name == "pick") {
		KinkyDungeonLockpicks += 1;
	}
	else if (Loot.name == "redkey") {
		KinkyDungeonRedKeys += 1;
	}
	else if (Loot.name == "bluekey") {
		KinkyDungeonBlueKeys += 1;
	}
	else if (Loot.name == "grinder") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.EnchantedGrinder, 1);
	}
	else if (Loot.name == "bola") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.Bola, 2);
	}
	else if (Loot.name == "bomb") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.Bomb, 1);
	}
	else if (Loot.name == "MistressKey") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.MistressKey, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 2);
	}
	else if (Loot.name == "Scrolls") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 2);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollArms, 2 + Math.floor(KDRandom() * 3));
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollLegs, 2 + Math.floor(KDRandom() * 3));
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollVerbal, 2 + Math.floor(KDRandom() * 3));
	}
	else if (Loot.name == "scroll_legs") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollLegs, 1);
	}
	else if (Loot.name == "scroll_arms") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollArms, 1);
	}
	else if (Loot.name == "scroll_verbal") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollVerbal, 1);
	}
	else if (Loot.name == "scrolls_basic") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollArms, 1 + Math.floor(KDRandom() * 3));
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollLegs, 1 + Math.floor(KDRandom() * 3));
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollVerbal, 1 + Math.floor(KDRandom() * 3));
	}
	else if (Loot.name == "scrolls_purity") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollPurity, 1);
	}
	else if (Loot.name == "AncientCores") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, Loot.count ? Loot.count : 2);
	}
	else if (Loot.name == "EnchantedBelt"||Loot.name == "EnchantedBra"||Loot.name == "EnchantedHeels"||Loot.name == "EnchantedAnkleCuffs"||Loot.name == "EnchantedMuzzle"||Loot.name == "EnchantedBlindfold"||Loot.name == "EnchantedMittens"||Loot.name == "EnchantedBallGag"||Loot.name == "EnchantedArmbinder") {
		let restraint = KinkyDungeonGetRestraintByName(Loot.name);
		KinkyDungeonInventoryAdd({name: Loot.name, id: KinkyDungeonGetItemID(), type: LooseRestraint, events: Object.assign([], restraint.events)});
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 1);
	}
	else if (Loot.name == "PotionCollar") {
		let restraint = KinkyDungeonGetRestraintByName("PotionCollar");
		KinkyDungeonInventoryAdd({name: Loot.name, id: KinkyDungeonGetItemID(), type: LooseRestraint, events: Object.assign([], restraint.events)});
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 1);
	}
	else if (Loot.name == "weapon_boltcutters") {
		KinkyDungeonInventoryAddWeapon("BoltCutters");
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItemBoltCutters"));
	}
	else if (Loot.name == "weapon_spear") {
		KinkyDungeonInventoryAddWeapon("Spear");
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItemSpear"));
	}
	else if (Loot.name == "weapon_flail") {
		KinkyDungeonInventoryAddWeapon("Flail");
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItemFlail"));
	}
	else if (Loot.name == "staff_flame") {
		KinkyDungeonInventoryAddWeapon("StaffFlame");
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItemStaffFlame"));
	}
	else if (Loot.name == "staff_bind") {
		KinkyDungeonInventoryAddWeapon("StaffBind");
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItemStaffBind"));
	}
	else if (Loot.name == "potions_mana") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 3+Math.floor(KDRandom()*2));
	}
	else if (Loot.name == "manaorb") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ManaOrb, 1);
	}
	else if (Loot.name == "manaorbmany") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ManaOrb, 3);
	}
	else if (Loot.name == "potions_will") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 2+Math.floor(KDRandom()*2));
	}
	else if (Loot.name == "potions_many") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 2+Math.floor(KDRandom()*2));
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 1+Math.floor(KDRandom()*3));
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, Math.floor(KDRandom()*3));
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, Math.floor(KDRandom()*3));
	}
	else if (Loot.name == "potion_mana") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 1);
	}
	else if (Loot.name == "potion_stamina") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 1);
	}
	else if (Loot.name == "potion_will") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 1);
	}
	else if (Loot.name == "potion_frigid") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
	}
	else if (Loot.name == "trap_armbinder") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapArmbinder"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "", undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapArmbinder"));
	}
	else if (Loot.name == "trap_armbinderHeavy") {
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapArmbinder"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		let harness = KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapArmbinderHarness"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, KinkyDungeonGenerateLock(true));
		if (Replacemsg)
			if (!harness)
				Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapArmbinder"));
			else Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapArmbinderHarness"));
	}
	else if (Loot.name == "trap_cuffs") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapCuffs"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapCuffs"));
	}
	else if (Loot.name == "trap_harness") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapHarness"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapHarness"));
	}
	else if (Loot.name == "trap_gag") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapGag"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapGag"));
	}
	else if (Loot.name == "trap_gagHeavy") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("PanelGag"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintPanelGag"));
	}
	else if (Loot.name == "trap_mithrilankle") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MithrilAnkleCuffs"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintMithrilAnkleCuffs"));
	}
	else if (Loot.name == "trap_mitts") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapMittens"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapMittens"));
	}
	else if (Loot.name == "trap_blindfold") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBlindfold"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapBlindfold"));
	}
	else if (Loot.name == "trap_boots") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBoots"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapBoots"));
	}
	else if (Loot.name == "trap_legirons") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapLegirons"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapLegirons"));
	}
	else if (Loot.name == "trap_belt") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapVibe"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapVibe"));
	}
	else if (Loot.name == "trap_protobelt") {
		value = Math.ceil((200 + 100 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapVibeProto"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBeltProto"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapVibe"));
	}
	else if (Loot.name == "trap_beltonly") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapBelt"));
	}
	else if (Loot.name == "trap_plug") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug"));
	}
	else if (Loot.name == "trap_plug_tease") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug2"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug2"));
	}
	else if (Loot.name == "trap_plug_torment") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug3"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug3"));
	}
	else if (Loot.name == "trap_plug_thunder") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug4"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug4"));
	}
	else if (Loot.name == "trap_nipple") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("NippleClamps"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBra"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintNippleClamps"));
	}
	else if (Loot.name == "trap_plug2") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapVibe"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt2"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, (MiniGameKinkyDungeonLevel > 5 || KinkyDungeonNewGame > 0) ? "Gold" : "Red", undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug"));
	}
	else if (Loot.name == "trap_plug2_torment") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapVibe"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug3"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt2"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, (MiniGameKinkyDungeonLevel > 5 || KinkyDungeonNewGame > 0) ? "Gold" : "Red", undefined, Loot.trap);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug3"));
	}
	else if (Loot.name == "trap_nipple2") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("NippleClamps"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBra2"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, (MiniGameKinkyDungeonLevel > 5 || KinkyDungeonNewGame > 0) ? "Gold" : "Red", undefined, false);
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapBra2"));
	}
	else if (Loot.name == "trap_book") {
		let spell = null;
		if (KDRandom() < 0.33) {
			spell = KinkyDungeonFindSpell("TrapRopeStrong", true);
		} else if (KDRandom() < 0.5) {
			spell = KinkyDungeonFindSpell("TrapMagicChainsWeak", true);
		} else {
			spell = KinkyDungeonFindSpell("TrapRibbons", true);
		}
		if (spell) {
			KinkyDungeonCastSpell(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, spell, undefined, undefined, undefined);
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/MagicSlash.ogg");
		}
	}

	else if (Loot.name == "lost_items") {
		if (!KinkyDungeonInventoryGet("Default")) {
			KinkyDungeonInventoryAdd({name: "Default", id: KinkyDungeonGetItemID(), type: Outfit});
		}
		for (let I = 0; I < KinkyDungeonLostItems.length; I++) {
			let lostitem = KinkyDungeonLostItems[I];
			if (lostitem) {
				let remove = false;
				let existingitem = KinkyDungeonGetInventoryItem(lostitem.name, lostitem.type);
				if (existingitem && existingitem.item) {
					if (KDConsumable(existingitem.item)) {
						if (lostitem.name != "MistressKey") {
							if (!existingitem.item.quantity) existingitem.item.quantity = lostitem.quantity;
							else existingitem.item.quantity += lostitem.quantity;
							KinkyDungeonSendFloater({x: KinkyDungeonPlayerEntity.x - 1 + 2 * KDRandom(), y: KinkyDungeonPlayerEntity.y - 1 + 2 * KDRandom()},
								`+${lostitem.quantity} ${TextGet("KinkyDungeonInventoryItem" + lostitem.name)}`, "white", 5);
						} else
							KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonMistressKeysTakenAway"), "orange", 2);
					}
				} else {
					if (lostitem.type == Consumable && KinkyDungeonFindConsumable(lostitem.name)) {
						if (lostitem.name != "MistressKey")
							KinkyDungeonSendFloater({x: KinkyDungeonPlayerEntity.x - 1 + 2 * KDRandom(), y: KinkyDungeonPlayerEntity.y - 1 + 2 * KDRandom()},
								`+${lostitem.quantity} ${TextGet("KinkyDungeonInventoryItem" + lostitem.name)}`, "white", 4);
						else
							KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonMistressKeysTakenAway"), "orange", 2);
						remove = true;
					} if (lostitem.type == Weapon && KinkyDungeonFindWeapon(lostitem.name)) {
						KinkyDungeonSendFloater({x: KinkyDungeonPlayerEntity.x - 1 + 2 * KDRandom(), y: KinkyDungeonPlayerEntity.y - 1 + 2 * KDRandom()},
							`+${TextGet("KinkyDungeonInventoryItem" + lostitem.name)}`, "white", 6);
						remove = true;
					} else if (lostitem.type == Outfit && KinkyDungeonGetOutfit(lostitem.name)) {
						KinkyDungeonSendFloater({x: KinkyDungeonPlayerEntity.x - 1 + 2 * KDRandom(), y: KinkyDungeonPlayerEntity.y - 1 + 2 * KDRandom()},
							`+${TextGet("KinkyDungeonInventoryItem" + lostitem.name)}`, "white", 7);
						remove = true;
					} else if (lostitem.type == LooseRestraint && KinkyDungeonGetRestraintByName(lostitem.name)) {
						KinkyDungeonSendFloater({x: KinkyDungeonPlayerEntity.x - 1 + 2 * KDRandom(), y: KinkyDungeonPlayerEntity.y - 1 + 2 * KDRandom()},
							`+ (loose) ${TextGet("Restraint" + lostitem.name)}`, "white", 5);
						remove = true;
					}
				}
				if (remove) {
					if (lostitem.name != "MistressKey") {
						//if (lostitem.looserestraint && lostitem.looserestraint.enchanted) {
						//KinkyDungeonInventory.unshift(lostitem);
						//} else
						KinkyDungeonInventoryAdd(lostitem);
					}
					//KinkyDungeonLostItems.splice(I, 1);
					//I -= 1;
				}
			}
		}
		KinkyDungeonLostItems = [];
	}
	if (KDLootEvents[Loot.name]) {
		let ret = KDLootEvents[Loot.name](Loot, Floor, Replacemsg, Lock);
		if (ret.value) value = ret.value;
		if (ret.Replacemsg) Replacemsg = ret.Replacemsg;
	}


	if (Loot.trap) {
		if (!Loot.noSmoke) {
			KDSmokePuff(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 2.9, 0.4);
		}
		KDSendStatus('bound', Loot.name, "chest");
	}

	if (value > 0) {
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("XXX", "" + value);
		KinkyDungeonAddGold(value);
	}
	return Replacemsg;
}


function KinkyDungeonAddGold(value) {
	if (!isNaN(value)) {
		KinkyDungeonGold += value;
		// @ts-ignore
		if (ArcadeDeviousChallenge && KinkyDungeonDeviousDungeonAvailable()) CharacterChangeMoney(Player, Math.round(value/10));
		let pre = value >= 0 ? "+" : "";
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, pre + `${value} GP`, "white", 3.5);
	} else KinkyDungeonSendActionMessage(10, "Error, the thing you just did would have set your gold to infinity. Please report.", "white", 4);

}


function KDSpawnLootTrap(x, y, trap, mult, duration) {
	let spawned = 0;
	/*let maxspawn = 1 + Math.round(Math.min(2 + KDRandom() * 2, KinkyDungeonDifficulty/25) + Math.min(2 + KDRandom() * 2, 0.5*MiniGameKinkyDungeonLevel/KDLevelsPerCheckpoint));
	if (mult) maxspawn *= mult;
	let requireTags = trap ? [trap] : undefined;

	let tags = ["trap", trap];
	KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);

	for (let i = 0; i < 30; i++) {
		if (spawned < maxspawn) {
			let Enemy = KinkyDungeonGetEnemy(
				tags, MiniGameKinkyDungeonLevel + KinkyDungeonDifficulty/5,
				KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
				'0', requireTags, true);
			if (Enemy) {
				let pass = false; //KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, Enemy.name, 1, 7, true, (duration || Enemy.tags.construct) ? (duration || 40) : undefined, undefined, false, "Ambush", true, 1.5, true, undefined, true, true);
				if (pass) {
					if (Enemy.tags.minor) spawned += 0.5;
					else if (Enemy.tags.elite) spawned += 1.5;
					else if (Enemy.tags.miniboss) spawned += 2;
					else if (Enemy.tags.boss) spawned += 4;
					else spawned += 1;
					if (Enemy.summonTags) {
						for (let t of Enemy.summonTags) {
							if (!tags.includes(t)) tags.push(t);
						}
					}
					if (Enemy.summonTagsMulti) {
						for (let t of Enemy.summonTagsMulti) {
							tags.push(t);
						}
					}
				}
			}
		}
	}*/

	for (let tile of KDNearbyTiles(x, y, 2.5)) {
		if (tile.tile.lootTrapEnemy) {
			let etiles = Object.values(KDGetEffectTiles(tile.x, tile.y)).filter((etile) => {
				return etile.tags && etile.tags.includes("runesummon");
			});
			if (etiles?.length > 0) {
				let Enemy = KinkyDungeonGetEnemyByName(tile.tile.lootTrapEnemy);
				if (Enemy) {
					if (KinkyDungeonSummonEnemy(tile.x, tile.y, Enemy.name, 1, 0.5, true, (duration || Enemy.tags.construct) ? (duration || 40) : undefined, undefined, false, "Ambush", true, undefined, true, undefined, duration > 300, false))
						spawned += 1;
					for (let et of etiles) {
						et.duration = 0;
					}
					delete tile.tile.lootTrapEnemy;
				}
			}
		}

	}
	if (spawned > 0) {
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/MagicSlash.ogg");
		KinkyDungeonMakeNoise(12, x, y);
		KinkyDungeonSendTextMessage(10, TextGet("LootChestTrap"), "#ff8800", 2);
	}
}

function KDGenChestTrap(guaranteed, x, y, chestType, lock, noTrap) {
	let trap = undefined;
	if (chestType && chestType != "cache" && chestType != "chest" && chestType != "silver" && !KDTrapChestType[chestType]) return undefined;
	if (lock && KDRandom() < 0.8) return undefined;
	if (guaranteed || KDRandom() < (noTrap ? 0.4 : 1.0)) {
		if (KDTrapChestType[chestType]) return KDTrapChestType[chestType](guaranteed, x, y, chestType, lock, noTrap);
		else return KDTrapChestType.default(guaranteed, x, y, chestType, lock, noTrap);
	}
	return trap;
}

let KDTrapChestType = {
	"default" : (guaranteed, x, y, chestType, lock, noTrap) => {
		if (KDRandom() < 0.33)
			return {trap: "metalTrap", mult: 1};
		else if (KDRandom() < 0.34)
			return {trap: "leatherTrap", mult: 1.2};
		else
			return {trap: "ropeTrap", mult: 1.4};
	},
	"shadow" : (guaranteed, x, y, chestType, lock, noTrap) => {
		return {trap: "shadowTrap", mult: 2.5, duration: 300};
	},
};

function KDTriggerLoot(Loot, Type) {
	let lootobj = KinkyDungeonLootTable[Type].find((element) => {return element.name == Loot;});
	console.log(KinkyDungeonLootEvent(lootobj, KinkyDungeonMapIndex, lootobj.message));
}