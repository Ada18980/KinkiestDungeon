"use strict";

let KinkyDungeonLostItems: item[] = [];
let KDTightRestraintsMod = 6;
let KDTightRestraintsMult = 2;

let KDPartialLootRecoveryChance = 0.25;

/**
 * @param list
 * @param excludeBound - "bound weapons", i.e. magic knives and weapons in really old nomenclature back when there were like 4 weapons
 */
function KinkyDungeonAddLostItems(list: item[], excludeBound: boolean) {
	for (let item of list) {
		let unique = true;
		if (item.type && item.name == "Knife") unique = false;
		for (let item2 of KinkyDungeonLostItems) {
			if (item2.name == item.name) {
				unique = false;
				break;
			}
		}
		if (!KinkyDungeonRestraintVariants[item.inventoryVariant || item.name]
			&& (KDRestraint(item)?.noRecover))
			unique = false;
		if (!KinkyDungeonWeaponVariants[item.name]
			&& (KDWeapon(item)?.rarity < 3))
			unique = false;

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

function KinkyDungeonLoot(
	Level: number,
	Index: string,
	Type: string,
	roll?: number,
	tile?: any,
	/** Used for the case where you only want to return the loot object and not execute it */
	returnOnly?: boolean,
	noTrap?: boolean,
	minWeight: number = 0.1,
	minWeightFallback: boolean = true,
	container?: KDContainer, lootType?: any[]): boolean | any {
	let lootWeightTotal = 0;
	let lootWeights: { loot: any; weight: number; }[] = [];

	if (!lootType) lootType = KinkyDungeonLootTable[Type];
	for (let loot of lootType) {
		let effLevel = Level;
		if (loot.trap && KinkyDungeonStatsChoice.has("TightRestraints")) {
			effLevel *= KDTightRestraintsMult;
			effLevel += KDTightRestraintsMod;
		}
		if ((effLevel >= loot.minLevel || KinkyDungeonNewGame > 0) && (loot.allFloors || loot.floors[Index])) {
			let prereqs = true;
			if (loot.arousalMode && !KinkyDungeonStatsChoice.get("arousalMode")) prereqs = false;


			if (loot.noflag?.some((flag: string) => {return KinkyDungeonFlags.get(flag) != undefined;})) prereqs = false;
			if (loot.notag?.some((flag: any) => {return KinkyDungeonPlayerTags.get(flag) != undefined;})) prereqs = false;

			if (loot.prerequisites && prereqs) {

				let maxlevel = 999;
				let minlevel = 0;
				let SpellList = null;
				if (prereqs && (loot.minCurseCount != undefined || loot.maxCurseCount != undefined)) {
					let count = KDCurseCount(loot.activatedCurseOnly);
					if (count < loot.minCurseCount || count > loot.maxCurseCount)
						prereqs = false;
				}


				if (prereqs && loot.hardmode && !KinkyDungeonStatsChoice.get("hardMode")) prereqs = false;
				if (prereqs && loot.nohardmode && KinkyDungeonStatsChoice.get("hardMode")) prereqs = false;
				if (prereqs && loot.prerequisites.includes("nopetsuit") && KinkyDungeonPlayerTags.get("NoPet")) prereqs = false;
				if (prereqs && loot.prerequisites.includes("nokigu") && KinkyDungeonPlayerTags.get("NoKigu")) prereqs = false;
				if (prereqs && loot.prerequisites.includes("noblindfold") && KinkyDungeonPlayerTags.get("NoBlindfolds")) prereqs = false;
				if (prereqs && loot.prerequisites.includes("nofrontplug") && KinkyDungeonPlayerTags.get("arousalModePlugNoFront")) prereqs = false;

				if (prereqs && loot.prerequisites.includes("vibe") && KinkyDungeonPlayerTags.get("NoVibes")) prereqs = false;
				if (prereqs && loot.prerequisites.includes("alreadyBelted") && KinkyDungeonChastityMult() < 0.9) prereqs = false;
				if (prereqs && loot.prerequisites.includes("lowlevel")) maxlevel = 2;
				if (prereqs && loot.prerequisites.includes("fewpick") && KinkyDungeonItemCount("Pick") >3) prereqs = false;
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
				if (prereqs && loot.prerequisites.includes("pearlChest") && !KDPearlRequirement()) prereqs = false;

				if (prereqs)
					for (let prereq of loot.prerequisites) {
						if (prereq.startsWith("Group_")) {
							let group = prereq.substring(6);
							let item = KinkyDungeonGetRestraintItem(group);
							let power = item && KDRestraint(item) &&  KDRestraint(item).power ? KinkyDungeonRestraintPower(item) : 0;
							if (power && (power + 0.01 >= loot.power || KDRestraint(item).enchanted)) {
								prereqs = false;
								break;
							}
						}
					}

				if (SpellList != null && KinkyDungeonGetUnlearnedSpells(minlevel, maxlevel, SpellList).length == 0) {
					prereqs = false;
				}

				if (prereqs && loot.prerequisites.includes("hasBow")) {
					prereqs = false;
					for (let w of KinkyDungeonAllWeapon()) {
						if (KDWeapon(w)?.tags?.includes("normalbow")) {
							prereqs = true;
							break;
						}
					}
				}
			}
			if (KinkyDungeonGoddessRep.Ghost && loot.submissive && (KinkyDungeonGoddessRep.Ghost + 50 < loot.submissive)) prereqs = false;
			if (prereqs && loot.noweapon) {
				for (let w of loot.noweapon) {
					if (KinkyDungeonInventoryGet(w)) {
						prereqs = false;
						break;
					}
				}
			}
			if (prereqs && loot.nospell) {
				for (let s of loot.nospell) {
					if (KDHasSpell(s)) {
						prereqs = false;
						break;
					}
				}
			}
			if (prereqs && loot.norestraint) {
				for (let r of loot.norestraint) {
					if (KinkyDungeonInventoryGet(r)) {
						prereqs = false;
						break;
					}
				}
			}
			// Check for cursed norestraint as well
			if (prereqs && loot.norestraintcursed) {
				let id = loot.norestraintcursed + `${loot.hexlevelmin || 0},${loot.hexlevelmax || 0}`;
				if (!cursedRestraintCache[id]) cursedRestraintCache[id] = [...KinkyDungeonGetHexByList(loot.norestraintcursed, true, loot.hexlevelmin, loot.hexlevelmax)];
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
					for (let e of KDMapData.Entities) {if (!e.summoned) nonSumEnemies++;}
					weightMult *= Math.max(0, 1 - 0.5*nonSumEnemies/KinkyDungeonCurrentMaxEnemies);
				}
				if (loot.trap && noTrap)
					weightMult = 0;


				let w = (loot.weight + weightBonus) * weightMult;
				if (w > minWeight) {
					lootWeights.push({loot: loot, weight: lootWeightTotal});
					lootWeightTotal += Math.max(0, w);
				}

			}
		}
	}

	let selection = (roll ? roll : KDRandom()) * lootWeightTotal;

	for (let L = lootWeights.length - 1; L >= 0; L--) {
		if (selection > lootWeights[L].weight) {
			if (returnOnly) return lootWeights[L].loot;
			for (let i = 0; i < (lootWeights[L].loot.count || 1); i++) {
				let replace = KinkyDungeonLootEvent(lootWeights[L].loot, Level, TextGet(lootWeights[L].loot.message), lootWeights[L].loot.lock, container);

				if (!KinkyDungeonSendActionMessage(8, replace, lootWeights[L].loot.messageColor, lootWeights[L].loot.messageTime || 2))
					KinkyDungeonSendTextMessage(8, replace, lootWeights[L].loot.messageColor, lootWeights[L].loot.messageTime || 2, true, true);

			}

			return true;
		}
	}
	// Go with it otherwise
	if (minWeight > 0 && minWeightFallback) return KinkyDungeonLoot(Level, Index, Type, roll, tile, returnOnly, noTrap, 0, false, container);
	return false;
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


function KinkyDungeonLootEvent(Loot: any, Floor: number, Replacemsg: string, Lock?: string, container?: KDContainer): string {
	let data = {
		loot: Loot,
		replacemsg: Replacemsg,
		lock: Lock,
	};
	KinkyDungeonSendEvent("loot", data);


	Loot = data.loot;
	Replacemsg = data.replacemsg;
	Lock = data.lock;

	let levelPercent = KDGetEffLevel()/(KinkyDungeonMaxLevel - 1);

	let value = 0;

	if (Loot.weapon || Loot.weaponlist) {
		let weapon = Loot.weapon;

		if (Loot.weaponlist) weapon = KDGetByWeight(KinkyDungeonGetWeaponsByListWeighted("CommonWeapon", false, (Loot.minRarity || 0), (Loot.maxRarity || 4))) || weapon;

		let enchantVariant = "";
		let enchant_extra = [];
		let enchants = (Loot.minEnchants || 1) + Math.floor(KDRandom() * ((Loot.maxEnchants || 1) - (Loot.minEnchants || 1)));

		if (Loot.enchantlist && (Loot.enchantchance == undefined || KDRandom() < Loot.enchantchance + (Loot.enchantscale|| 0) * levelPercent)) {
			while (enchants > 0) {
				let ench = KDGetByWeight(
					KinkyDungeonGetEnchantmentsByListWeighted(Loot.enchantlist, ModifierEnum.weapon, weapon, false, Loot.enchantlevelmin, Loot.enchantlevelmax, [enchantVariant, ...enchant_extra])
				);
				if (!enchantVariant) {
					enchantVariant = ench;
				} else {
					enchant_extra.push(ench);
				}
				enchants -= 1;
			}
		}

		if (enchantVariant) {
			let events = JSON.parse(JSON.stringify([])); // no weapon events needed due to the way it's referenced usually
			if (enchantVariant) {
				events.push(...KDEventEnchantmentModular[enchantVariant].types[KDModifierEnum.weapon].events(weapon, Loot, "", undefined, enchant_extra));
			}
			for (let e of enchant_extra) {
				events.push(...KDEventEnchantmentModular[e].types[KDModifierEnum.weapon].events(weapon, Loot, "", enchantVariant, enchant_extra));
			}
			let variant: KDWeaponVariant = {
				template: weapon,
				events: events,
			};
			KDGiveWeaponVariant(variant, KDEventEnchantmentModular[enchantVariant]?.prefix, undefined, KDEventEnchantmentModular[enchantVariant]?.suffix, container);

			if (Replacemsg)
				Replacemsg = Replacemsg.replace("WeaponAcquired", (enchantVariant ? TextGet("KDVarPrefEnchanted") : "") + ' ' + TextGet("KinkyDungeonInventoryItem" + weapon));
		} else {
			KDInvAddWeapon(container, Loot.weapon);
			if (Replacemsg)
				Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItem" + weapon));
		}

	}
	if (Loot.spell) {
		let spell = KinkyDungeonFindSpell(Loot.spell, true);
		KDPushSpell(spell);
		if (spell.autoLearn) {
			for (let sp of spell.autoLearn) {
				if (KinkyDungeonSpellIndex(sp) < 0) {
					KDPushSpell(KinkyDungeonFindSpell(sp, true));
					KDSendStatus('learnspell', sp);
				}
			}
		}
		if (spell.learnFlags) {
			for (let sp of spell.learnFlags) {
				KinkyDungeonFlags.set(sp, -1);
			}
		}

		if (spell.learnPage) {
			for (let sp of spell.learnPage) {
				KDAddSpellPage(sp, KDSpellColumns[sp] || []);
			}
		}
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("SpellLearned", TextGet("KinkyDungeonSpell" + Loot.spell));
	}
	else if (Loot.armor || Loot.armortags) {
		let armor = Loot.armor;
		let hexed = Loot.hexlist && (Loot.hexchance == undefined || KDRandom() < Loot.hexchance + (Loot.hexscale|| 0) * levelPercent || (Loot.nouncursed && !Loot.enchantlist && KinkyDungeonInventoryGet(Loot.nouncursed)));
		let forceequip = Loot.forceEquip || (hexed && (Loot.forceEquipCursed || KinkyDungeonStatsChoice.get("CurseSeeker"))) || (!hexed && (Loot.forceEquipUncursed));
		if (Loot.noForceEquip) forceequip = false;
		if (Loot.armortags) {
			let newarmor = KinkyDungeonGetRestraint({tags: Loot.armortags}, KDGetEffLevel(), (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), true, "",
				undefined, undefined, undefined, undefined, true, undefined, undefined, undefined, forceequip);
			if (!newarmor && forceequip) {
				KinkyDungeonGetRestraint({tags: Loot.armortags}, KDGetEffLevel(), (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), true, "",
					undefined, undefined, undefined, undefined, true, undefined, undefined, undefined, false);
			}
			if (newarmor) armor = newarmor.name;
		}
		let unlockcurse = null;
		let hexVariant = "";
		let enchantVariant = "";
		let enchant_extra = [];
		let hex_extra = [];
		let enchants = (Loot.minEnchants || 1) + Math.floor(KDRandom() * ((Loot.maxEnchants || 1) - (Loot.minEnchants || 1)));
		let curses = (Loot.minHex || 1) + Math.floor(KDRandom() * ((Loot.maxHex || 1) - (Loot.minHex || 1)));
		if (hexed) {
			while (curses > 0) {
				let curs = KDGetByWeight(KinkyDungeonGetHexByListWeighted(Loot.hexlist, armor, false, Loot.hexlevelmin, Loot.hexlevelmax, [hexVariant, ...hex_extra]));
				if (!enchantVariant) {
					hexVariant = curs;
					// Sets the armor to the cursed type
					armor = armor+(Loot.cursesuffix != undefined ? Loot.cursesuffix : Loot.hexlist);
				} else {
					hex_extra.push(curs);
				}
				curses -= 1;
			}
		}
		if (Loot.enchantlist && (Loot.enchantchance == undefined || KDRandom() < Loot.enchantchance + (Loot.enchantscale|| 0) * levelPercent || (Loot.nouncursed && !hexVariant && KinkyDungeonInventoryGet(Loot.nouncursed)) || (hexVariant && Loot.alwaysenchanthex))) {
			while (enchants > 0) {
				let ench = KDGetByWeight(
					KinkyDungeonGetEnchantmentsByListWeighted(Loot.enchantlist, ModifierEnum.restraint, armor, false, Loot.enchantlevelmin, Loot.enchantlevelmax, [enchantVariant, ...enchant_extra])
				);
				if (!enchantVariant) {
					enchantVariant = ench;
				} else {
					enchant_extra.push(ench);
				}
				enchants -= 1;
			}
		}
		if (Loot.unlockcurse && (hexVariant || !Loot.hexlist) && (Loot.cursechance == undefined || KDRandom() < Loot.cursechance + (Loot.cursescale|| 0) * levelPercent)) {
			let curselist = [];
			for (let c of Loot.unlockcurse) {
				curselist.push(c);
			}
			unlockcurse = KDGetByWeight(KinkyDungeonGetCurseByListWeighted(curselist, armor, false, Loot.hexlevelmin, Loot.hexlevelmax));
		}
		if (hexVariant || enchantVariant) {
			let events: KinkyDungeonEvent[] = JSON.parse(JSON.stringify(KDRestraint({name: armor}).events || []));
			let variant: KDRestraintVariant = {
				template: armor,
				events: events,
			};
			if (hexVariant) {
				events.push(...KDEventHexModular[hexVariant].events({variant: variant}));
			}
			for (let c of hex_extra) {
				events.push(...KDEventHexModular[c].events({variant: variant}));
			}
			if (enchantVariant) {
				events.push(...KDEventEnchantmentModular[enchantVariant].types[KDModifierEnum.restraint].events(armor, Loot, hexVariant, enchantVariant, enchant_extra, {variant: variant}));
			}
			for (let e of enchant_extra) {
				events.push(...KDEventEnchantmentModular[e].types[KDModifierEnum.restraint].events(armor, Loot, hexVariant, enchantVariant, enchant_extra, {variant: variant}));
			}

			let equipped = 0;
			if (forceequip) {
				equipped = KDEquipInventoryVariant(variant, KDEventEnchantmentModular[enchantVariant]?.prefix, 0, true, undefined, true, false, Loot.faction || (unlockcurse ? "Curse" : undefined), true, unlockcurse, undefined, false, undefined, undefined, KDEventEnchantmentModular[enchantVariant]?.suffix);
			}
			if (!equipped) {
				KDGiveInventoryVariant(variant, KDEventEnchantmentModular[enchantVariant]?.prefix, unlockcurse, undefined, undefined, KDEventEnchantmentModular[enchantVariant]?.suffix, Loot.faction || (unlockcurse ? "Curse" : undefined), undefined, undefined, container);
			} else {
				KinkyDungeonSendTextMessage(10, TextGet("KDCursedChestEquip" + (unlockcurse ? "Cursed" : ""))
					.replace("NEWITM", TextGet("Restraint" + variant.template)),
				"#aa88ff", 10);
			}

			if (Replacemsg)
				Replacemsg = Replacemsg.replace("ArmorAcquired", (enchantVariant ? TextGet("KDVarPrefEnchanted") : "") + ' ' + TextGet("Restraint" + armor));
		} else {
			KDInvAddLoose(container, armor, unlockcurse, Loot.faction || (unlockcurse ? "Curse" : undefined));
			if (Replacemsg)
				Replacemsg = Replacemsg.replace("ArmorAcquired", TextGet("Restraint" + armor));
		}

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
		KDPushSpell(spell);
	}
	else if (Loot.name == "spell_conjuration_low") {
		let SpellsUnlearned = KinkyDungeonGetUnlearnedSpells(0, 2, KinkyDungeonSpellList.Conjure);
		let spellIndex = Math.floor(KDRandom()*SpellsUnlearned.length);

		let spell = SpellsUnlearned[spellIndex];
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("SpellLearned", TextGet("KinkyDungeonSpell" + spell.name));
		KDPushSpell(spell);
	}
	else if (Loot.name == "spell_elemental_low") {
		let SpellsUnlearned = KinkyDungeonGetUnlearnedSpells(0, 2, KinkyDungeonSpellList.Elements);
		let spellIndex = Math.floor(KDRandom()*SpellsUnlearned.length);

		let spell = SpellsUnlearned[spellIndex];
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("SpellLearned", TextGet("KinkyDungeonSpell" + spell.name));
		KDPushSpell(spell);
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
			KDInvAddWeapon(container, reward);
			if (Replacemsg)
				Replacemsg = Replacemsg.replace("ITEMGET", TextGet("KinkyDungeonInventoryItem" + reward));
		}
		else if (KinkyDungeonFindSpell(reward, true)) {
			KDPushSpell(KinkyDungeonFindSpell(reward, true));
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
		KDInvAddWeapon(container, "Knife");
	}
	else if (Loot.name == "magicknife") {
		KDInvAddWeapon(container, "EnchKnife");
	}
	else if (Loot.name == "pick") {
		KDAddConsumable("Pick", 1, container);
	}
	else if (Loot.name == "redkey") {
		KDAddConsumable("RedKey", 1, container);
	}
	else if (Loot.name == "bluekey") {
		KDAddConsumable("BlueKey", 1, container);
	}
	else if (Loot.name == "grinder") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.EnchantedGrinder, 1, container);
	}
	else if (Loot.name == "bola") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.Bola, 2, container);
	}
	else if (Loot.name == "bomb") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.Bomb, 1, container);
	}
	else if (Loot.name == "gunpowder") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.Gunpowder, 3 + Math.floor(KDRandom() * 3), container);
	}
	else if (Loot.name == "MistressKey") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.MistressKey, 1, container);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 2, container);
	}
	else if (Loot.name == "DivineTear") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.DivineTear, 1, container);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 2, container);
	}
	else if (Loot.name == "Scrolls") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 2);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollArms, 2 + Math.floor(KDRandom() * 3), container);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollLegs, 2 + Math.floor(KDRandom() * 3), container);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollVerbal, 2 + Math.floor(KDRandom() * 3), container);
	}
	else if (Loot.name == "scroll_legs") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollLegs, 1, container);
	}
	else if (Loot.name == "scroll_arms") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollArms, 1, container);
	}
	else if (Loot.name == "scroll_verbal") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollVerbal, 1, container);
	}
	else if (Loot.name == "scrolls_basic") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollArms, 1 + Math.floor(KDRandom() * 3), container);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollLegs, 1 + Math.floor(KDRandom() * 3), container);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollVerbal, 1 + Math.floor(KDRandom() * 3), container);
	}
	else if (Loot.name == "scrolls_purity") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ScrollPurity, 1, container);
	}
	else if (Loot.name == "AncientCores") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, Loot.count ? Loot.count : 2, container);
	}
	else if (Loot.name == "AncientCoreSingle") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, Loot.count ? Loot.count : 1, container);
	}
	else if (Loot.name == "AncientCoreSingleSpent") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSourceSpent, Loot.count ? Loot.count : 1, container);
	}
	else if (Loot.name == "EnchantedBelt"||Loot.name == "EnchantedBra"||Loot.name == "EnchantedHeels"||Loot.name == "EnchantedAnkleCuffs"||Loot.name == "EnchantedMuzzle"||Loot.name == "EnchantedBlindfold"||Loot.name == "EnchantedMittens"||Loot.name == "EnchantedBallGag"||Loot.name == "EnchantedArmbinder") {
		let restraint = KinkyDungeonGetRestraintByName(Loot.name);
		KDInvAdd(container, {name: Loot.name, id: KinkyDungeonGetItemID(), type: LooseRestraint, events: Object.assign([], restraint.events)});
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 1, container);
	}
	else if (Loot.name == "PotionCollar") {
		let restraint = KinkyDungeonGetRestraintByName("PotionCollar");
		KDInvAdd(container, {name: Loot.name, id: KinkyDungeonGetItemID(), type: LooseRestraint, events: Object.assign([], restraint.events)});
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 1, container);
	}
	else if (Loot.name == "weapon_boltcutters") {
		KDInvAddWeapon(container, "BoltCutters");
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItemBoltCutters"));
	}
	else if (Loot.name == "weapon_spear") {
		KDInvAddWeapon(container, "Spear");
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItemSpear"));
	}
	else if (Loot.name == "weapon_flail") {
		KDInvAddWeapon(container, "Flail");
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItemFlail"));
	}
	else if (Loot.name == "staff_flame") {
		KDInvAddWeapon(container, "StaffFlame");
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItemStaffFlame"));
	}
	else if (Loot.name == "staff_bind") {
		KDInvAddWeapon(container, "StaffBind");
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("WeaponAcquired", TextGet("KinkyDungeonInventoryItemStaffBind"));
	}
	else if (Loot.name == "potions_mana") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 3+Math.floor(KDRandom()*2), container);
	}
	else if (Loot.name == "manaorb") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ManaOrb, 1, container);
	}
	else if (Loot.name == "manaorbmany") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.ManaOrb, 3, container);
	}
	else if (Loot.name == "potions_will") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 2+Math.floor(KDRandom()*2), container);
	}
	else if (Loot.name == "potions_many") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 2+Math.floor(KDRandom()*2), container);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 1+Math.floor(KDRandom()*3), container);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, Math.floor(KDRandom()*3), container);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, Math.floor(KDRandom()*3), container);
	}
	else if (Loot.name == "potion_mana") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 1, container);
	}
	else if (Loot.name == "potion_stamina") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 1, container);
	}
	else if (Loot.name == "potion_will") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 1, container);
	}
	else if (Loot.name == "potion_frigid") {
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1, container);
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
		KDMapData.TrapsTriggered++;
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintPanelGag"));
	}
	else if (Loot.name == "trap_mithrilankle") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MithrilAnkleCuffs"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		KDMapData.TrapsTriggered++;
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintMithrilAnkleCuffs"));
	}
	else if (Loot.name == "trap_mitts") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapMittens"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		KDMapData.TrapsTriggered++;
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
		KDMapData.TrapsTriggered++;
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug"));
	}
	else if (Loot.name == "trap_plug_tease") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug2"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		KDMapData.TrapsTriggered++;
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug2"));
	}
	else if (Loot.name == "trap_plug_torment") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug3"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		KDMapData.TrapsTriggered++;
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug3"));
	}
	else if (Loot.name == "trap_plug_thunder") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug4"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		KDMapData.TrapsTriggered++;
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug4"));
	}
	else if (Loot.name == "trap_nipple") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("NippleClamps"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBra"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, Lock ? Lock : KinkyDungeonGenerateLock(true, undefined, true), undefined, Loot.trap);
		KDMapData.TrapsTriggered++;
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintNippleClamps"));
	}
	else if (Loot.name == "trap_plug2") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapVibe"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt2"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, (MiniGameKinkyDungeonLevel > 5 || KinkyDungeonNewGame > 0) ? "Gold" : "Red", undefined, Loot.trap);
		KDMapData.TrapsTriggered++;
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug"));
	}
	else if (Loot.name == "trap_plug2_torment") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapVibe"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapPlug3"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBelt2"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, (MiniGameKinkyDungeonLevel > 5 || KinkyDungeonNewGame > 0) ? "Gold" : "Red", undefined, Loot.trap);
		KDMapData.TrapsTriggered++;
		if (Replacemsg)
			Replacemsg = Replacemsg.replace("RestraintType", TextGet("RestraintTrapPlug3"));
	}
	else if (Loot.name == "trap_nipple2") {
		value = Math.ceil((150 + 50 * KDRandom()) * (1 + Floor/40));
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("NippleClamps"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, "");
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("TrapBra2"), MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, (MiniGameKinkyDungeonLevel > 5 || KinkyDungeonNewGame > 0) ? "Gold" : "Red", undefined, false);
		KDMapData.TrapsTriggered++;
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
			KDMapData.TrapsTriggered++;
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/MagicSlash.ogg");
		}
	}
	else if (Loot.name == "lost_clothes") {
		let outfit = {name: "Default", id: KinkyDungeonGetItemID(), type: Outfit};
		if (!KinkyDungeonInventoryGet("Default")) KDInvAdd(container, outfit);
	}
	else if (Loot.name == "lost_items") {
		if (!KinkyDungeonInventoryGet("Default")) {
			KDInvAdd(container, {name: "Default", id: KinkyDungeonGetItemID(), type: Outfit});
		}
		let newLostItems = [];
		let recovOne = false;
		for (let I = 0; I < KinkyDungeonLostItems.length; I++) {
			let lostitem = KinkyDungeonLostItems[I];

			if (lostitem) {
				if (!KinkyDungeonStatsChoice.get("itemPartialMode") || KDRandom() < KDPartialLootRecoveryChance || (!recovOne && I == KinkyDungeonLostItems.length-1)) {
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
						if (lostitem.type == Consumable && KDConsumable(lostitem)) {
							if (lostitem.name != "MistressKey")
								KinkyDungeonSendFloater({x: KinkyDungeonPlayerEntity.x - 1 + 2 * KDRandom(), y: KinkyDungeonPlayerEntity.y - 1 + 2 * KDRandom()},
									`+${lostitem.quantity} ${TextGet("KinkyDungeonInventoryItem" + lostitem.name)}`, "white", 4);
							else
								KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonMistressKeysTakenAway"), "orange", 2);
							remove = true;
						} if (lostitem.type == Weapon && KDWeapon(lostitem) && !KinkyDungeonInventoryGet(lostitem.name)) {
							//KinkyDungeonSendFloater({x: KinkyDungeonPlayerEntity.x - 1 + 2 * KDRandom(), y: KinkyDungeonPlayerEntity.y - 1 + 2 * KDRandom()},
							//`+${TextGet("KinkyDungeonInventoryItem" + lostitem.name)}`, "white", 6);
							remove = true;
						} else if (lostitem.type == Outfit && KDOutfit(lostitem) && !KinkyDungeonInventoryGet(lostitem.name)) {
							//KinkyDungeonSendFloater({x: KinkyDungeonPlayerEntity.x - 1 + 2 * KDRandom(), y: KinkyDungeonPlayerEntity.y - 1 + 2 * KDRandom()},
							//`+${TextGet("KinkyDungeonInventoryItem" + lostitem.name)}`, "white", 7);
							remove = true;
						} else if (lostitem.type == LooseRestraint && KDRestraint(lostitem) && !KinkyDungeonInventoryGet(lostitem.name)) {
							//if (KinkyDungeonGetRestraintByName(lostitem.name).armor || KinkyDungeonRestraintVariants[lostitem.name] != undefined)
							//KinkyDungeonSendFloater({x: KinkyDungeonPlayerEntity.x - 1 + 2 * KDRandom(), y: KinkyDungeonPlayerEntity.y - 1 + 2 * KDRandom()},
							//`+ (loose) ${TextGet("Restraint" + lostitem.name)}`, "white", 5);
							remove = true;
						}
					}
					if (remove) {
						if (lostitem.name != "MistressKey") {
							//if (lostitem.looserestraint && lostitem.looserestraint.enchanted) {
							//KinkyDungeonInventory.unshift(lostitem);
							//} else
							//if (KinkyDungeonRestraintVariants[lostitem.name]) KDGiveInventoryVariant()


							recovOne = true;
							KinkyDungeonItemEvent(
								lostitem,
								KDRestraint(lostitem)?.armor
								|| !!KinkyDungeonRestraintVariants[lostitem.name]);
						}
						//KinkyDungeonLostItems.splice(I, 1);
						//I -= 1;
					}
				} else {
					newLostItems.push(lostitem);
				}
			}
		}
		KinkyDungeonLostItems = newLostItems;
	}
	if (KDLootEvents[Loot.name]) {
		let ret = KDLootEvents[Loot.name](Loot, Floor, Replacemsg, Lock, container);
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


function KinkyDungeonAddGold(value: number) {
	if (!isNaN(value)) {
		KinkyDungeonGold += value;
		//if (ArcadeDeviousChallenge && KinkyDungeonDeviousDungeonAvailable()) CharacterChangeMoney(Player, Math.round(value/10));
		let pre = value >= 0 ? "+" : "";
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, pre + `${value} GP`, "white", 3.5);
	} else KinkyDungeonSendActionMessage(10, "Error, the thing you just did would have set your gold to infinity. Please report.", "white", 4);

}


function KDSpawnLootTrap(x: number, y: number, _trap: any, _mult: number, duration: number) {
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
				(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
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
					let created = KinkyDungeonSummonEnemy(tile.x, tile.y, Enemy.name, 1, 0.5, true, (duration || Enemy.tags.construct) ? (duration || 40) : undefined, undefined, false, "Ambush", true, undefined, true, undefined, duration > 300, false);
					if (tile.tile.lootTrapEnemy) {
						for (let en of created) {
							en.teleporting = tile.tile.lootTrapEnemy;
							en.teleportingmax = tile.tile.lootTrapEnemy;
						}
					}
					if (created.length > 0)
						spawned += created.length;
					for (let et of etiles) {
						et.duration = 0;
					}
					delete tile.tile.lootTrapEnemy;
				}
			}
		}

	}
	if (spawned > 0) {
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/MagicSlash.ogg");
		KinkyDungeonMakeNoise(12, x, y);
		KinkyDungeonSendTextMessage(10, TextGet("LootChestTrap"), "#ff8933", 2);
	}
}

function KDGenChestTrap(guaranteed: boolean, x: number, y: number, chestType: string, lock: any, noTrap: boolean): any {
	let trap = undefined;
	if (chestType && chestType != "cache" && chestType != "chest" && chestType != "silver" && !KDTrapChestType[chestType]) return undefined;
	if (lock && KDRandom() < 0.8) return undefined;
	if (guaranteed || KDRandom() < (noTrap ? 0.4 : 1.0)) {
		if (KDTrapChestType[chestType]) return KDTrapChestType[chestType](guaranteed, x, y, chestType, lock, noTrap);
		else return KDTrapChestType.default(guaranteed, x, y, chestType, lock, noTrap);
	}
	return trap;
}

let KDChestTrapWeights = {
	metalTrap: {
		weight: () => {return 100 - (KinkyDungeonGoddessRep.Metal);},
		mult: 1,
		time: 2,
	},
	leatherTrap: {
		weight: () => {return 100 - (KinkyDungeonGoddessRep.Leather);},
		mult: 1.2,
		time: 2,
	},
	latexTrap: {
		weight: () => {return 100 - (KinkyDungeonGoddessRep.Latex);},
		mult: 1.2,
		time: 2,
	},
	ropeTrap: {
		weight: () => {return 110 - (KinkyDungeonGoddessRep.Rope) - (KinkyDungeonGoddessRep.Conjure);},
		mult: 1.4,
		time: 2,
	},
	illusionTrap: {
		weight: () => {return 100 - (KinkyDungeonGoddessRep.Illusion);},
		mult: 1,
	},
	skeletonTrap: {
		weight: () => {return KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)]?.enemyTags?.includes("skeleton") ? 300 : 0;},
		mult: 1.4,
	},
	zombieTrap: {
		weight: () => {return KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)]?.enemyTags?.includes("zombie") ? 300 : 0;},
		mult: 1.5,
	},
	mummyTrap: {
		weight: () => {return KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)]?.enemyTags?.includes("mummy") ? 300 : 0;},
		mult: 1,
	},
	mushroomTrap: {
		weight: () => {return KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)]?.enemyTags?.includes("mushroom") ? 300 : 0;},
		mult: 1,
	},
};

type trapChestFunc = (guaranteed: boolean, x: number, y: number, chestType: string, lock: any, noTrap: boolean) => { trap: string, mult: number, time: number, duration?: number };

let KDTrapChestType: Record<string, trapChestFunc> = {
	"default" : (_guaranteed, _x, _y, _chestType, _lock, _noTrap) => {
		let obj = KDGetWeightedString(KDChestTrapWeights) || "metalTrap";
		return {trap: obj, mult: KDChestTrapWeights[obj].mult, time: KDChestTrapWeights[obj].time};
	},
	"shadow" : (_guaranteed, _x, _y, _chestType, _lock, _noTrap) => {
		return {trap: "shadowTrap", mult: 2.5, duration: 300, time: 3};
	},
};

function KDTriggerLoot(Loot: string, Type: string) {
	let lootobj = KinkyDungeonLootTable[Type].find((element) => {return element.name == Loot;});
	console.log(KinkyDungeonLootEvent(lootobj, MiniGameKinkyDungeonLevel, lootobj.message));
}

/**
 * @param WeightList - contains values that have a weight param
 */
function KDGetWeightedString(WeightList: Record<string, any>, params?: any): any {
	let WeightTotal = 0;
	let Weights = [];

	for (let obj of Object.entries(WeightList)) {
		Weights.push({obj: obj[0], weight: WeightTotal});
		WeightTotal += obj[1].weight(params);
	}

	let selection = KDRandom() * WeightTotal;

	for (let L = Weights.length - 1; L >= 0; L--) {
		if (selection > Weights[L].weight) {
			return Weights[L].obj;
		}
	}
	return null;
}

/**
 * @param tags - Type of restraint
 */
function KDCanCurse(tags: string[]): boolean {
	return KDCheckPrereq(undefined, "AlreadyCursed", {tags: tags, type: undefined, trigger: undefined}, {});
}

/**
 * Helper function used to summon cursed epicenters
 * @param x
 * @param y
 */
function KDSummonCurseTrap(x: number, y: number) {
	let enemy = KinkyDungeonGetEnemy(["curseTrap"], KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), '0', ["epicenter"]);
	if (enemy) {
		let point = {x: x, y: y};//KinkyDungeonGetNearbyPoint(x, y, true);
		if (point) {
			let en = DialogueCreateEnemy(point.x, point.y, enemy.name);

			en.teleporting = 4;
			en.teleportingmax = 4;
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/SummonCurse.ogg");
			KinkyDungeonSendTextMessage(8, TextGet("KDSummonCurse"), "#9074ab", 5);
		}
	}
}


function KDGenerateMinorLoot(lootType: string, coord: WorldCoord, tile: any, x: number, y: number, container: KDContainer) {
	if (KDMinorLootTable[lootType]) {
		let type = KDMinorLootTable[lootType];
		let count = 1 + type.rarity + (type.extraQuantity || 0);
		let loots: any[] = [];
		for (let i = 0; i < count; i++) {
			loots.push(
				KinkyDungeonLoot(coord.mapY,
					KDGetWorldMapLocation({x: coord.mapX, y: coord.mapY})?.data[coord.room]?.Checkpoint || KDGetCurrentCheckpoint(),
					lootType, undefined, tile, true, true, undefined, undefined,
					container, type.options
				)
			);
		}
		for (let l of loots) {
			let itemType = KDGetItemType(l);
			if (itemType == Consumable) {
				KDAddConsumable(l.name, (l.quantity || 1) + Math.floor(KDRandom() * l.extraQuantity || 0), container);
			} else if (itemType == Weapon && !container.items[l.name]) {
				KDInvAddWeapon(container, l.name);
			} else if (itemType == LooseRestraint) {
				KDInvAddLoose(container, l.name, undefined, tile.Faction,
					(l.quantity || 1) + Math.floor(KDRandom() * l.extraQuantity || 0));
			}
		}
	}
}