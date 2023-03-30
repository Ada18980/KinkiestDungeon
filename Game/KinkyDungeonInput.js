"use strict";

/**
 * @type {{type: string, data: any}[]}
 */
let KinkyDungeonInputQueue = [];

/**
 * @returns {string}
 * Delegate to KDProcessInputs */
function KDProcessInput(type, data) {
	let Result = null;
	let loose = null;
	let msg = "";
	let success = 0;
	let tile = null;

	KDUpdateEnemyCache = true;
	switch (type) {
		case "move":
			KinkyDungeonToggleAutoDoor = data.AutoDoor;
			KinkyDungeonToggleAutoPass = data.AutoPass;
			KinkyDungeonToggleAutoSprint = data.sprint;
			KinkyDungeonSuppressSprint = data.SuppressSprint;
			KinkyDungeonMove(data.dir, data.delta, data.AllowInteract, data.SuppressSprint);
			break;
		case "setMoveDirection":
			KinkyDungeonMoveDirection = data.dir;
			break;
		case "tick":
			if (data.sleep == 10 && (KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'parole') && KinkyDungeonPlayerInCell()) {
				KDKickEnemies(KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y));
			}
			if (data.sleep && KinkyDungeonStatWill < KinkyDungeonStatWillMax * KDGetSleepWillFraction()) KinkyDungeonChangeWill(KinkyDungeonStatWillMax/KDMaxStatStart * KDSleepRegenWill, false);
			KinkyDungeonAdvanceTime(data.delta, data.NoUpdate, data.NoMsgTick);
			break;
		case "tryCastSpell": {
			KDDelayedActionPrune(["Action", "Cast"]);
			let sp = data.spell ? data.spell : KinkyDungeonFindSpell(data.spellname, true);
			if (!data.spell) data.spell = sp;
			if (sp) {
				/** @type {{result: string, data: any}} */
				let res = KinkyDungeonCastSpell(data.tx, data.ty, sp, data.enemy, data.player, data.bullet, undefined, data);
				if (res.result == "Cast" && sp.sfx) {
					KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sp.sfx + ".ogg");
				}
				if (res.result != "Fail") {
					KinkyDungeonAdvanceTime(res.data.delta);
				}
				KinkyDungeonInterruptSleep();
				Result = res.result;
				return Result;
			}
			return "Fail";
		}
		case "struggle":
			KDDelayedActionPrune(["Action", "Struggle"]);
			return KinkyDungeonStruggle(data.group, data.type, data.index);
		case "struggleCurse": {
			KDDelayedActionPrune(["Action", "Struggle"]);
			let item = KinkyDungeonGetRestraintItem(data.group);
			if (data.index) {
				let surfaceItems = KDDynamicLinkListSurface(item);
				if (surfaceItems[data.index])
					item = surfaceItems[data.index];
				else console.log("Error! Please report the item combination and screenshot to Ada!");
			}
			KinkyDungeonCurseStruggle(item, data.curse);
			break;
		}
		case "curseUnlock":
			KDDelayedActionPrune(["Action", "Struggle"]);
			KinkyDungeonCurseUnlock(data.group, data.index, data.curse);
			break;
		case "toggleSpell":
			KinkyDungeonSpellChoicesToggle[data.i] = !KinkyDungeonSpellChoicesToggle[data.i];
			KinkyDungeonSendEvent("toggleSpell", {index: data.i, spell: KinkyDungeonSpells[KinkyDungeonSpellChoices[data.i]]}, KinkyDungeonSpells[KinkyDungeonSpellChoices[data.i]]);
			if (KinkyDungeonSpellChoicesToggle[data.i] && KinkyDungeonSpells[KinkyDungeonSpellChoices[data.i]].costOnToggle) {
				if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.i]]))) {
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.i]]));
				} else KinkyDungeonSpellChoicesToggle[data.i] = false;
			}
			break;
		case "consumable":
			KDModalArea = false;
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = null;
			KinkyDungeonAttemptConsumable(data.item, data.quantity);
			break;
		case "switchWeapon": {
			KDDelayedActionPrune(["Action", "SwitchWeapon"]);
			let oldweapon = KinkyDungeonPlayerWeapon;
			KDGameData.PreviousWeapon = oldweapon;
			KDSetWeapon(data.weapon);
			KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon());
			if (KinkyDungeonStatsChoice.has("Disorganized")) {
				KinkyDungeonAdvanceTime(1);
				KinkyDungeonSlowMoveTurns = 2;
			} else if (!KinkyDungeonStatsChoice.has("QuickDraw"))
				KinkyDungeonAdvanceTime(1);
			KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonEquipWeapon").replace("WEAPONNAME", TextGet("KinkyDungeonInventoryItem" + data.weapon)), "white", 5);
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Equip.ogg");
			break;
		}
		case "unequipWeapon":
			KDDelayedActionPrune(["Action", "SwitchWeapon"]);
			KDGameData.PreviousWeapon = data.weapon;
			KDSetWeapon(null);
			KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon());
			KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonUnEquipWeapon").replace("WEAPONNAME", TextGet("KinkyDungeonInventoryItem" + data.weapon)), "white", 5);
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Equip.ogg");
			break;
		case "dress":
			KDDelayedActionPrune(["Action", "Dress"]);
			KinkyDungeonSetDress(data.dress, data.outfit);
			KinkyDungeonSlowMoveTurns = 5;
			KinkyDungeonSleepTime = CommonTime() + 200;
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Equip.ogg");
			break;
		case "equip":
			KDDelayedActionPrune(["Action", "Equip"]);
			success = KinkyDungeonAddRestraintIfWeaker(KinkyDungeonRestraintsCache.get(data.name), 0, true, "", KinkyDungeonGetRestraintItem(data.Group) && !KinkyDungeonLinkableAndStricter(KinkyDungeonRestraintsCache.get(data.currentItem), KinkyDungeonRestraintsCache.get(data.name)), false, data.events, data.faction, false, data.curse);
			if (success != undefined) {
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Unlock.ogg");
				KDSendStatus('bound', data.name, "self");
				loose = KinkyDungeonInventoryGetLoose(data.name);
				if (!(loose.quantity > 1)) {
					KinkyDungeonInventoryRemove(loose);
				} else {
					loose.quantity -= 1;
				}

				KDStunTurns(2);

				msg = "KinkyDungeonSelfBondage";
				if (KDRestraint(loose).Group == "ItemVulvaPiercings" || KDRestraint(loose).Group == "ItemVulva" || KDRestraint(loose).Group == "ItemButt") {
					if (KinkyDungeonIsChaste(false)) {
						msg = "KinkyDungeonSelfBondagePlug";
					}
				} else if (KDRestraint(loose).Group == "Item") {
					if (KinkyDungeonIsChaste(true)) {
						msg = "KinkyDungeonSelfBondageNipple";
					}
				} else if (KDRestraint(loose).enchanted) {
					msg = "KinkyDungeonSelfBondageEnchanted";
				}
				KinkyDungeonSendTextMessage(10, TextGet(msg).replace("RestraintName", TextGet("Restraint" + KDRestraint(loose).name)), "yellow", 1);

				return msg;
			} else return "KDCantEquip";
		case "tryOrgasm":
			KDDelayedActionPrune(["Action", "Sexy"]);
			KinkyDungeonDoTryOrgasm(data.bonus);
			break;
		case "tryPlay":
			KDDelayedActionPrune(["Action", "Sexy"]);
			KinkyDungeonDoPlayWithSelf();
			break;
		case "sleep":
			KDGameData.SleepTurns = KinkyDungeonSleepTurnsMax;
			break;
		case "noise": {
			KDDelayedActionPrune(["Action", "Dialogue"]);
			let gagTotal = KinkyDungeonGagTotal(true);
			KinkyDungeonMakeNoise(Math.ceil(10 - 8 * Math.min(1, gagTotal * gagTotal)), KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			KinkyDungeonSendTextMessage(10, TextGet("KDShoutHelp" + Math.min(3, Math.floor(gagTotal *3.3))), "yellow", 1);
			break;
		}
		case "pick":
			KDDelayedActionPrune(["Action", "Struggle"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			KinkyDungeonTargetTile = tile;
			KinkyDungeonTargetTileLocation = data.targetTile;
			if (KinkyDungeonTargetTile?.Lock) {
				KinkyDungeonAdvanceTime(1, true);
				if (KinkyDungeonPickAttempt()) {
					KinkyDungeonTargetTile.Lock = undefined;
					if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
				}
				KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
			}
			break;
		case "unlock":
			KDDelayedActionPrune(["Action", "Struggle"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			KinkyDungeonTargetTile = tile;
			KinkyDungeonTargetTileLocation = data.targetTile;

			if (KinkyDungeonTargetTile?.Lock) {
				KDUpdateDoorNavMap();
				KinkyDungeonAdvanceTime(1, true);
				if (KinkyDungeonUnlockAttempt(KinkyDungeonTargetTile.Lock)) {
					KinkyDungeonTargetTile.Lock = undefined;
					if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
				}
				KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
			}
			break;
		case "commandunlock": {
			KDDelayedActionPrune(["Action", "Cast"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			KinkyDungeonTargetTile = tile;
			KinkyDungeonTargetTileLocation = data.targetTile;


			if (KinkyDungeonTargetTile?.Lock) {
				KinkyDungeonAdvanceTime(1, true);
				let spell = KinkyDungeonFindSpell("CommandWord", true);
				let miscast = KinkyDungeonMiscastChance;
				let gagTotal = KinkyDungeonGagTotal();
				if (KinkyDungeoCheckComponents(KinkyDungeonFindSpell("CommandWord"), KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y).length > 0) {
					miscast = miscast + Math.max(0, 1 - miscast) * Math.min(1, gagTotal);
				}
				if (KDRandom() > miscast) {
					KinkyDungeonTargetTile.Lock = undefined;
					if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
					KDUpdateDoorNavMap();
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					if (gagTotal) {
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonUnlockDoorPurpleUseGagged"), "#aa44ff", 1);
					} else {
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonUnlockDoorPurpleUse"), "#aa44ff", 1);
					}
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
				} else {
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonUnlockDoorPurpleUseGaggedFail"), "#ff0000", 1);
				}
				KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
			}

			break;
		}
		case "closeDoor":
			KDDelayedActionPrune(["Action", "World"]);
			KinkyDungeonCloseDoor(data);
			break;
		case "shrineBuy":
			KDDelayedActionPrune(["Action", "World"]);
			KinkyDungeonShopIndex = data.shopIndex;
			KinkyDungeonPayShrine(data.type);
			KinkyDungeonAggroAction('shrine', {});
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
			break;
		case "shrineUse":
			KDDelayedActionPrune(["Action", "World"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			//KinkyDungeonTargetTile = tile;
			//KinkyDungeonTargetTileLocation = data.targetTile;
			KinkyDungeonAdvanceTime(1, true);
			//KinkyDungeonTargetTile = null;
			if (KinkyDungeonGold >= data.cost) {
				KinkyDungeonPayShrine(data.type);
				KinkyDungeonTilesDelete(KinkyDungeonTargetTileLocation);
				let x =  data.targetTile.split(',')[0];
				let y =  data.targetTile.split(',')[1];
				KinkyDungeonMapSet(parseInt(x), parseInt(y), "a");
				//KinkyDungeonTargetTileLocation = "";
				KinkyDungeonAggroAction('shrine', {x: parseInt(x), y:parseInt(y)});
				KDGameData.AlreadyOpened.push({x: parseInt(x), y: parseInt(y)});
				KinkyDungeonUpdateStats(0);
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
			} else {
				if (KinkyDungeonShrineTypeRemove.includes(type))
					KinkyDungeonSendActionMessage(9, TextGet("KDNoRestraints"), "#ff5555", 1, true);
				else
					KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonPayShrineFail"), "#ff5555", 1, true);
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Damage.ogg");
			}
			KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
			break;
		case "shrineDrink": {
			if (!KDCanDrinkShrine(false)) {
				KinkyDungeonSendActionMessage(9, TextGet("KDNoMana"), "#ff5555", 2, true);
				break;
			}
			KDDelayedActionPrune(["Action", "World"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			if (tile) tile.drunk = true;
			KinkyDungeonAdvanceTime(1, true);

			// KinkyDungeonStatsChoice.get("Blessed")
			let slimed = 0;
			for (let inv of KinkyDungeonAllRestraint()) {
				if (KDRestraint(inv).slimeLevel) {
					slimed += 1;
					KinkyDungeonRemoveRestraint(KDRestraint(inv).Group, false);
				}
			}
			if (slimed) {
				KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonPoolDrinkSlime"), "#FF00FF", 2);
				KinkyDungeonChangeRep(data.type, -slimed * 2);
			}
			else KinkyDungeonSendActionMessage(9, TextGet(KinkyDungeonGagTotal() > 0 ? "KinkyDungeonPoolDrinkFace" : "KinkyDungeonPoolDrink"), "#AAFFFF", 2);
			KinkyDungeonChangeMana(5, false, 0, false, true);
			KDSendStatus('goddess', data.type, 'shrineDrink');
			KinkyDungeonAggroAction('shrine', {});
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");

			let x =  data.targetTile.split(',')[0];
			let y =  data.targetTile.split(',')[1];
			KDSummonRevengeMobs(parseInt(x), parseInt(y), tile.type, slimed ? 1.5 : 1);

			KDGameData.PoolUses += 1;
			break;
		}
		case "shrineBottle": {
			if (!KDCanDrinkShrine(true)) {
				KinkyDungeonSendTextMessage(9, TextGet("KDNoMana"), "#ff5555", 2, true);
				break;
			}
			KDDelayedActionPrune(["Action", "World"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			if (tile) tile.drunk = true;

			KinkyDungeonAdvanceTime(1, true);
			let x =  data.targetTile.split(',')[0];
			let y =  data.targetTile.split(',')[1];
			KDSummonRevengeMobs(parseInt(x), parseInt(y), tile.type, 1.0);

			// KinkyDungeonStatsChoice.get("Blessed")
			KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonPoolBottle"), "#AAFFFF", 2);
			KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("PotionMana"), 1);
			KDSendStatus('goddess', data.type, 'shrineBottle');
			KinkyDungeonAggroAction('shrine', {});
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/PotionDrink.ogg");

			KDGameData.PoolUses += 1;
			break;
		}
		case "defeat":
			KDDelayedActionPrune(["Action", "World"]);
			KinkyDungeonDefeat();
			KinkyDungeonChangeRep("Ghost", 4);
			break;
		case "lose":
			KinkyDungeonState = "Menu";
			KDLose = true;
			MiniGameKinkyDungeonLevel = -1;
			break;
		case "orb":
			if (KinkyDungeonMapGet(data.x, data.y) == 'O') {
				KDDelayedActionPrune(["Action", "World"]);
				if (KinkyDungeonGoddessRep[data.shrine] < -45) {
					KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, "OrbGuardian", 3 + Math.floor(Math.sqrt(1 + MiniGameKinkyDungeonLevel)), 10, false, 30);
				}
				KinkyDungeonChangeRep(data.shrine, data.Amount * -10);

				KDSendStatus('goddess', data.shrine, 'takeOrb');
				if (KinkyDungeonStatsChoice.get("randomMode")) {
					let spell = null;
					let spellList = [];
					let maxSpellLevel = 4;
					for (let k of Object.keys(KinkyDungeonSpellList)) {
						for (let sp of KinkyDungeonSpellList[k]) {
							if (KinkyDungeonCheckSpellPrerequisite(sp) && sp.school == k && !sp.secret) {
								for (let iii = 0; iii < maxSpellLevel - sp.level; iii++)
									spellList.push(sp);
							}
						}
					}

					for (let sp of KinkyDungeonSpells) {
						for (let S = 0; S < spellList.length; S++) {
							if (sp.name == spellList[S].name) {
								spellList.splice(S, 1);
								S--;
							}
						}
					}

					spell = spellList[Math.floor(KDRandom() * spellList.length)];

					if (spell) {
						KinkyDungeonSpells.push(spell);
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonOrbSpell").replace("SPELL", TextGet("KinkyDungeonSpell" + spell.name)), "lightblue", 2);
					}
				} else {
					KinkyDungeonSpellPoints += data.Amount;
				}
				KinkyDungeonMapSet(data.x, data.y, 'o');
				KinkyDungeonAggroAction('orb', {});
			}
			break;
		case "perkorb":
			if (KinkyDungeonMapGet(data.x, data.y) == 'P') {
				KDDelayedActionPrune(["Action", "World"]);
				KDSendStatus('goddess', data.perks, 'takePerkOrb');

				if (data.perks) {
					for (let p of data.perks) {
						KinkyDungeonStatsChoice.set(p, true);
					}
				}

				KinkyDungeonMapSet(data.x, data.y, 'p');
				for (let x = 0; x < KinkyDungeonGridWidth; x++) {
					if (KinkyDungeonMapGet(x, data.y) == 'P') {
						KinkyDungeonMapSet(x, data.y, 'p');
					}
				}
				KinkyDungeonSendEvent("perkOrb", {x: data.x, y: data.y, perks: data.perks});
			}
			break;
		case "heart":
			if (data.type == "AP") {
				if (KinkyDungeonStatDistractionMax < KDMaxStat) KinkyDungeonSpells.push(KinkyDungeonFindSpell("APUp1"));
				KinkyDungeonUpdateStats(0);
			}else if (data.type == "SP") {
				if (KinkyDungeonStatStaminaMax < KDMaxStat) KinkyDungeonSpells.push(KinkyDungeonFindSpell("SPUp1"));
				KinkyDungeonUpdateStats(0);
			} else if (data.type == "MP") {
				if (KinkyDungeonStatManaMax < KDMaxStat) KinkyDungeonSpells.push(KinkyDungeonFindSpell("MPUp1"));
				KinkyDungeonUpdateStats(0);
			} else if (data.type == "WP") {
				if (KinkyDungeonStatWillMax < KDMaxStat) KinkyDungeonSpells.push(KinkyDungeonFindSpell("WPUp1"));
				KinkyDungeonUpdateStats(0);
			}
			KDGameData.CollectedHearts = (KDGameData.CollectedHearts || 0) + 1;
			break;
		case "champion":
			KDGameData.Champion = data.rep;
			KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonBecomeChampion").replace("GODDESS", TextGet("KinkyDungeonShrine" + data.rep)), "yellow", 1);
			KDSendStatus('goddess', data.rep, 'helpChampion');
			break;
		case "aid":
			KDDelayedActionPrune(["Action", "World"]);
			KinkyDungeonChangeRep(data.rep, -KinkyDungeonAidManaCost(data.rep, data.value));
			KinkyDungeonChangeMana(KinkyDungeonAidManaAmount(data.rep, data.value));
			KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonAidManaMe"), "purple", 2);
			KDSendStatus('goddess', data.rep, 'helpMana');
			break;
		case "rescue":
			KinkyDungeonRescued[data.rep] = true;

			if (KDRandom() < 0.5 + data.value/100) {
				KDDelayedActionPrune(["Action", "World"]);
				/*let allies = KinkyDungeonGetAllies();
				// Tie up all non-allies
				for (let e of KinkyDungeonEntities) {
					if (e.Enemy.bound && !e.Enemy.tags.angel) {
						allies.push(e);
						if (!e.boundLevel) e.boundLevel = e.Enemy.maxhp;
						else e.boundLevel += e.Enemy.maxhp;
						e.hp = 0.1;
						e.rescue = true;
					}
				}
				KinkyDungeonEntities = allies;
				KDGameData.PrisonerState = '';
				KDGameData.KinkyDungeonJailGuard = 0;
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonRescueMe"), "purple", 10);
				for (let T of Object.values(KinkyDungeonTiles)) {
					if (T.Lock) T.Lock = undefined;
					if (T.Type == "Lock") T.Type = undefined;
					if (T.Type == "Trap") T.Type = undefined;
				}*/
				let tiles = KinkyDungeonRescueTiles();
				if (tiles.length > 0) {
					KDSendStatus('goddess', data.rep, 'helpRescue');
					KinkyDungeonChangeRep(data.rep, -10);
					tile = tiles[Math.floor(tiles.length * KDRandom())];
					if (tile) {
						KinkyDungeonMapSet(tile.x, tile.y, "$");
						KinkyDungeonTilesSet(tile.x + "," + tile.y, {Type: "Angel"});
						KDStartDialog("AngelHelp","Angel", true, "");
					}
					KDGameData.RescueFlag = true;
				}
				return "Rescue";
			} else {
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNoRescue"), "purple", 10);
				KDSendStatus('goddess', data.rep, 'helpNoRescue');
				return "FailRescue";
			}
		case "penance":
			KDGameData.KinkyDungeonPenance = true;
			KDGameData.KDPenanceMode = "";
			KDGameData.KDPenanceStage = 0;
			KDGameData.KDPenanceStageEnd = 0;
			KDGameData.AngelCurrentRep = data.rep;
			KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonPenanceHappen"), "purple", 4);
			KDGameData.KinkyDungeonPenanceCostCurrent = KinkyDungeonPenanceCosts[data.rep] ? KinkyDungeonPenanceCosts[data.rep] : KinkyDungeonPenanceCostDefault;
			if (KinkyDungeonGold >= KDGameData.KinkyDungeonPenanceCostCurrent) {
				if (KinkyDungeonPenanceCosts[data.rep]) KinkyDungeonPenanceCosts[data.rep] += KinkyDungeonPenanceCostGrowth;
				else KinkyDungeonPenanceCosts[data.rep] = KinkyDungeonPenanceCostDefault + KinkyDungeonPenanceCostGrowth;
			}
			KDSendStatus('goddess', data.rep, 'helpPenance');
			break;
		case "spellChoice":
			KDDelayedActionPrune(["Action", "SwitchSpell"]);
			KinkyDungeonEvasionPityModifier = 0.0;
			KinkyDungeonSpellChoices[data.I] = data.CurrentSpell;
			KinkyDungeonSpellChoicesToggle[data.I] = !KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]].defaultOff;
			if (KinkyDungeonSpellChoicesToggle[data.I] && KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]].costOnToggle) {
				if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]]))) {
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]]));
				} else KinkyDungeonSpellChoicesToggle[data.I] = false;
			}
			if (KinkyDungeonStatsChoice.has("Disorganized")) {
				KinkyDungeonAdvanceTime(1);
				KinkyDungeonSlowMoveTurns = 2;
			} else if (!KinkyDungeonStatsChoice.has("QuickDraw"))
				KinkyDungeonAdvanceTime(1);
			break;
		case "spellRemove":
			KinkyDungeonEvasionPityModifier = 0.0;
			KinkyDungeonSpellChoices[data.I] = -1;
			KinkyDungeonSpellChoicesToggle[data.I] = true;
			break;
		case "spellCastFromBook": {
			KDDelayedActionPrune(["Action", "Cast"]);
			let spell = KinkyDungeonHandleSpellCast(KinkyDungeonSpells[data.CurrentSpell]);
			if (spell && !(KinkyDungeonSpells[data.CurrentSpell].type == "passive") && !KinkyDungeonSpells[data.CurrentSpell].passive && !KinkyDungeonSpells[data.CurrentSpell].upcastFrom) {
				if (KinkyDungeonStatsChoice.has("Disorganized")) {
					KinkyDungeonAdvanceTime(1);
					KinkyDungeonSlowMoveTurns = 2;
				} else if (!KinkyDungeonStatsChoice.has("QuickDraw"))
					KinkyDungeonAdvanceTime(1);
				KinkyDungeonSendActionMessage(5, TextGet("KinkyDungeonSpellTarget" + spell.name).replace("SpellArea", "" + Math.floor(spell.aoe)), "white", 0.1, true);
			}
			break;
		}
		case "upcast": {
			KDDelayedActionPrune(["Action", "Cast"]);
			KDEmpower(data, KinkyDungeonPlayerEntity);
			break;
		}
		case "upcastcancel": {
			KinkyDungeonTickBuffTag(KinkyDungeonPlayerBuffs, "upcast", 1);
			break;
		}
		case "spellLearn": {
			KDDelayedActionPrune(["Action", "SwitchSpell"]);
			KinkyDungeonEvasionPityModifier = 0.0;
			let spell = KinkyDungeonFindSpell(data.SpellName, true);
			let cost = KinkyDungeonGetCost(spell);
			if (KinkyDungeonCheckSpellPrerequisite(spell)) {
				if (KinkyDungeonSpellPoints >= cost) {
					if (spell.manacost <= KinkyDungeonStatManaMax) {
						KinkyDungeonSpellPoints -= cost;
						KinkyDungeonSpells.push(spell);
						KDSendStatus('learnspell', spell.name);
						if (spell.goToPage) {
							KinkyDungeonCurrentSpellsPage = spell.goToPage;
						}
						if (spell.autoLearn) {
							for (let sp of spell.autoLearn) {
								if (KinkyDungeonSpellIndex(sp) < 0) {
									KinkyDungeonSpells.push(KinkyDungeonFindSpell(sp, true));
									KDSendStatus('learnspell', sp);
								}
							}
						}
						KinkyDungeonSetMaxStats();
						if (KDToggles.Sound && KinkyDungeonIsPlayer()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
						KinkyDungeonCurrentPage = KinkyDungeonSpellIndex(spell.name);
						if (KinkyDungeonStatsChoice.has("Disorganized")) {
							KinkyDungeonAdvanceTime(1);
							KinkyDungeonSlowMoveTurns = 2;
						} else if (!KinkyDungeonStatsChoice.has("QuickDraw"))
							KinkyDungeonAdvanceTime(1);
						if (KinkyDungeonIsPlayer()) {
							KinkyDungeonPreviewSpell = undefined;
							//if (KinkyDungeonTextMessageTime > 0)
							//KinkyDungeonDrawState = "Game";
						}
					} else if (KinkyDungeonIsPlayer()) KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSpellsNotEnoughMana"), "#b4dbfc", 1);
				} else if (KinkyDungeonIsPlayer()) KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSpellsNotEnoughPoints"), "#ffff00", 1);
			} else if (KinkyDungeonIsPlayer()) KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSpellsNotPrerequisite").replace("REQUIREDSPELL", TextGet("KinkyDungeonSpell" + spell.prerequisite)), "#ff4444", 1);
			break;
		}
		case "tabletInteract": {
			KDDelayedActionPrune(["Action", "World"]);
			if (data.action == "read") {
				tile = KinkyDungeonTilesGet(data.targetTile);
				if (tile && tile.Type == "Tablet") {
					// Perform the tablet buff action
					if (tile.Name == "Will") {
						// Restoration shrine gets a regeneration buff
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletWill", type: "restore_mp", power: 0.5, duration: 20});
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletWill2", type: "restore_sp", power: 0.5, duration: 20});
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletWill3", type: "restore_wp", power: 0.5, duration: 5});
					} else if (tile.Name == "Determination") {
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletDetermination", type: "restore_wp", power: 1, duration: 5});
					} else {
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
							{id: "Tablet" + tile.Name, aura: KDGoddessColor(tile.Name), type: "event", duration: 9999, power: 2, player: true, enemies: false, maxCount: 3, tags: ["cast_" + tile.Name.toLowerCase()], events: [
								{trigger: "calcMana", type: "Tablet", requiredTag: tile.Name.toLowerCase(), power: 0.5},
							]}
						);
					}

					// Send the message and advance time
					KinkyDungeonAdvanceTime(1);
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonTabletReadSuccess"), "lightgreen", 1);

					// Remove the tile
					let x = parseInt(data.targetTile.split(',')[0]);
					let y = parseInt(data.targetTile.split(',')[1]);
					if (x && y) {
						KinkyDungeonMapSet(x, y, 'm');
						KinkyDungeonTilesDelete(data.targetTile);
					}
				}
			}
			break;
		}
		case "foodInteract": {
			KDDelayedActionPrune(["Action", "World"]);
			if (data.action == "eat") {
				tile = KinkyDungeonTilesGet(data.targetTile);
				if (tile && tile.Type == "Food") {
					let gagged = KinkyDungeonGagTotal();
					if (gagged > 0) {
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonFoodEatenGag"), "#ff8800", 1);
					} else {
						// Perform the deed
						let Willmulti = Math.max(KinkyDungeonStatWillMax / KDMaxStatStart);
						let amount = tile.Amount ? tile.Amount : 1.0;
						KinkyDungeonChangeWill(amount * Willmulti);


						// Send the message and advance time
						KinkyDungeonAdvanceTime(1);
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonFoodEaten"), "lightgreen", 1);

						// Remove the food
						tile.Food = "Plate";
					}
				}
			}
			break;
		}
		case "chargerInteract":
			KDDelayedActionPrune(["Action", "World"]);
			if (data.action == "charge") {
				if (KinkyDungeonInventoryGet("AncientPowerSourceSpent") && KinkyDungeonGold >= KDRechargeCost) {
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 1);
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSourceSpent, -1);
					KinkyDungeonAddGold(-KDRechargeCost);
					KinkyDungeonAdvanceTime(1);
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonChargerChargeSuccess").replace("VALUE", "" + KDRechargeCost), "yellow", 1);
					let x = parseInt(data.targetTile.split(',')[0]);
					let y = parseInt(data.targetTile.split(',')[1]);
					if (x && y) {
						KinkyDungeonTilesDelete(data.targetTile);
						KinkyDungeonMapSet(x, y, '-');
					}
					return "Pass";
				} else {
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonChargerChargeFailure"), "orange", 1);
					return "Fail";
				}
			} else if (data.action == "place") {
				tile = KinkyDungeonTilesGet(data.targetTile);
				if (tile && tile.Type == "Charger" && KinkyDungeonInventoryGet("AncientPowerSource")) {
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, -1);
					tile.Light = KDChargerLight;
					KinkyDungeonAdvanceTime(1);
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonChargerPlace"), "yellow", 1);
					let x = parseInt(data.targetTile.split(',')[0]);
					let y = parseInt(data.targetTile.split(',')[1]);
					if (x && y) {
						KinkyDungeonMapSet(x, y, '=');
					}
				}
			} else if (data.action == "remove") {
				tile = KinkyDungeonTilesGet(data.targetTile);
				if (tile && tile.Type == "Charger" && tile.Light > 0 && !tile.NoRemove) {
					KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 1);
					tile.Light = undefined;
					KinkyDungeonAdvanceTime(1);
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonChargerRemove"), "yellow", 1);
					let x = parseInt(data.targetTile.split(',')[0]);
					let y = parseInt(data.targetTile.split(',')[1]);
					if (x && y) {
						KinkyDungeonMapSet(x, y, '+');
					}
				} else if (tile && tile.NoRemove) {
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonChargerNoRemove"), "yellow", 1);
				}
			}
			break;
		case "dialogue": {
			KDDoDialogue(data);
			break;

		}
	}
	return "";
}

/**
 *
 * @param {string} type
 * @param {any} data
 * @returns {string}
 */
function KDSendInput(type, data, frame, noUpdate) {

	if (!noUpdate) {
		KDGameData.OrigEnergyLevel = KDGameData.AncientEnergyLevel;
		KDGameData.LastSP = KinkyDungeonStatStamina;
		KDGameData.LastMP = KinkyDungeonStatMana;
		KDGameData.LastAP = KinkyDungeonStatDistraction;
		KDGameData.LastWP = KinkyDungeonStatWill;
	}

	KinkyDungeonInputQueue.push({type: type, data: data});
	return KDProcessInputs(true);
}

/**
 * Handles inputs once per frame
 * @returns {string}
 */
function KDProcessInputs(ReturnResult) {
	for (let i = 0; i < 3; i++) {
		if (KinkyDungeonInputQueue.length > 0) {
			let input = KinkyDungeonInputQueue.splice(0, 1)[0];
			if (input) {
				let res = KDProcessInput(input.type, input.data);
				if (ReturnResult) return res;
			}
		}
	}

	return "";
}