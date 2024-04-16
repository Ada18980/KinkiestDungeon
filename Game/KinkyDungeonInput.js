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
			return KinkyDungeonMove(data.dir, data.delta, data.AllowInteract, data.SuppressSprint) ? "move" : "nomove";
			//break;
		case "setMoveDirection":
			KinkyDungeonMoveDirection = data.dir;
			break;
		case "tick":
			if (data.sleep == 10 && (KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'parole') && KinkyDungeonPlayerInCell()) {
				KDKickEnemies(KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y), false, MiniGameKinkyDungeonLevel, true);
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
				if (res.result != "Fail" && !sp.quick) {
					KinkyDungeonAdvanceTime(res.data.delta);
				}
				KinkyDungeonInterruptSleep();
				Result = res.result;
				return Result;
			}
			return "Fail";
		}
		case "lock": {
			KDDelayedActionPrune(["Action", "Struggle"]);
			let item = KinkyDungeonGetRestraintItem(data.group);
			if (data.index) {
				let surfaceItems = KDDynamicLinkListSurface(item);
				if (surfaceItems[data.index])
					item = surfaceItems[data.index];
				else console.log("Error! Please report the item combination and screenshot to Ada!");
			}
			KinkyDungeonLock(item, data.type);
			break;
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
		case "toggleSpell": {
			KinkyDungeonSpellChoicesToggle[data.i] = !KinkyDungeonSpellChoicesToggle[data.i];
			let spell = KDGetUpcast(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.i]].name,
				KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellEmpower")) || KinkyDungeonSpells[KinkyDungeonSpellChoices[data.i]];
			KinkyDungeonSendEvent("toggleSpell", {index: data.i, spell: spell},
				spell);

			if (KinkyDungeonSpellChoicesToggle[data.i] && spell.costOnToggle) {
				if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell))) {
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
				} else KinkyDungeonSpellChoicesToggle[data.i] = false;
			}

			if (spell.name != KinkyDungeonSpells[KinkyDungeonSpellChoices[data.i]].name) {
				KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "upcast", 1);
			}
			break;
		}
		case "consumable":
			//KDModalArea = false;
			KinkyDungeonAttemptConsumable(data.item, data.quantity);
			//KinkyDungeonTargetTile = null;
			//KinkyDungeonTargetTileLocation = null;
			break;
		case "switchWeapon": {
			if (data?.pref != undefined) KDWeaponSwitchPref = data.pref;
			KDDelayedActionPrune(["Action", "SwitchWeapon"]);
			if (!data.noOld) {
				let oldweapon = KinkyDungeonPlayerWeapon;
				if (!KDGameData.PreviousWeapon || typeof KDGameData.PreviousWeapon === 'string') KDGameData.PreviousWeapon = [];
				while (KDGameData.PreviousWeapon.length < KDMaxPreviousWeapon) {
					KDGameData.PreviousWeapon.push("Unarmed");
				}
				if (!KDGameData.PreviousWeaponLock || !KDGameData.PreviousWeaponLock[KDWeaponSwitchPref])
					KDGameData.PreviousWeapon[KDWeaponSwitchPref] = oldweapon;
			}
			/*while (KDGameData.PreviousWeapon?.length > KDMaxPreviousWeapon) {
				KDGameData.PreviousWeapon.splice(0, 1);
			}*/
			KDSetWeapon(data.weapon);
			//while (KDGameData.PreviousWeapon?.includes(data.weapon)) KDGameData.PreviousWeapon.splice(KDGameData.PreviousWeapon.indexOf(data.weapon), 1);
			KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon(undefined, undefined, KinkyDungeonWeapons[data.weapon]));
			let time = (data.weapon && KinkyDungeonWeapons[data.weapon] && KinkyDungeonWeapons[data.weapon].heavy) ? 2 : 1;
			if (KinkyDungeonStatsChoice.has("Disorganized")) {
				time += 2;
			} else if (KinkyDungeonStatsChoice.has("QuickDraw"))
				time -= 1;

			if (time > 0) {
				KinkyDungeonAdvanceTime(1);
				if (time > 1)
					KDGameData.SlowMoveTurns = time - 1;
			}
			KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonEquipWeapon").replace("WEAPONNAME", KDGetItemNameString(data.weapon)), "white", 5);
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Equip.ogg");

			// Reequip offhand if able
			if (KDGameData.OffhandOld && !KDGameData.Offhand
				&& KinkyDungeonInventoryGetWeapon(KDGameData.OffhandOld)
				&& KinkyDungeonCanUseWeapon(false, undefined, KDWeapon(KinkyDungeonInventoryGetWeapon(KDGameData.OffhandOld)))
				&& KDCanOffhand(KinkyDungeonInventoryGetWeapon(KDGameData.OffhandOld))) {
				KDGameData.Offhand = KDGameData.OffhandOld;
			}
			break;
		}
		case "unequipWeapon":
			KDDelayedActionPrune(["Action", "SwitchWeapon"]);
			if (!KDGameData.PreviousWeapon || typeof KDGameData.PreviousWeapon === 'string') KDGameData.PreviousWeapon = [];
			if (data.weapon)
				KDGameData.PreviousWeapon.push(data.weapon);
			KDSetWeapon(null);
			while (KDGameData.PreviousWeapon?.length > KDMaxPreviousWeapon) {
				KDGameData.PreviousWeapon.splice(0, 1);
			}
			KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon());
			KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonUnEquipWeapon").replace("WEAPONNAME", KDGetItemNameString(data.weapon)), "white", 5);
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Equip.ogg");
			break;
		case "dress":
			KDDelayedActionPrune(["Action", "Dress"]);
			KinkyDungeonSetDress(data.dress, data.outfit);
			KDGameData.SlowMoveTurns = 5;
			KinkyDungeonSleepTime = CommonTime() + 200;
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Equip.ogg");
			break;
		case "drop": {
			KDDropItemInv(data.item);
			break;
		}
		case "buffclick": {
			if (KDBuffClick[data.click]) {
				KDBuffClick[data.click](data.buff, data.id || KinkyDungeonPlayerEntity);
			}
			break;
		}
		case "inventoryAction": {
			if (KDInventoryAction[data.action || KDGameData.InventoryAction] && KDInventoryAction[data.action || KDGameData.InventoryAction].valid(data.player, data.item)) {
				KDInventoryAction[data.action || KDGameData.InventoryAction].click(data.player, data.item);
			}
			break;
		}
		case "equip": {

			let equipped = false;
			let newItem = null;
			let currentItem = null;
			let linkable = null;
			let name = data.name;

			if (name) {
				newItem = KDRestraint({name: name});
				if (newItem) {
					currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
					if (!currentItem) equipped = false;
					else {
						if (KDDebugLink) {
							linkable = KDCanAddRestraint(KDRestraint(newItem), true, "", false, currentItem, true, true);
						} else {
							linkable = (KinkyDungeonLinkableAndStricter(KDRestraint(currentItem), newItem, currentItem) &&
								((newItem.linkCategory && KDLinkCategorySize(currentItem, newItem.linkCategory) + KDLinkSize(newItem) <= 1.0)
								|| (!newItem.linkCategory && !KDDynamicLinkList(currentItem, true).some((inv) => {return newItem.name == inv.name;}))));
						}
						if (linkable) {
							equipped = false;
						} else equipped = true;
					}
				}
			}

			if (equipped) return "";


			KDDelayedActionPrune(["Action", "Equip"]);
			KinkyDungeonSetFlag("SelfBondage", 1);
			success = KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(data.name), 0, true, "", KinkyDungeonGetRestraintItem(data.Group) && !KinkyDungeonLinkableAndStricter(KinkyDungeonGetRestraintByName(data.currentItem), KinkyDungeonGetRestraintByName(data.name)), false, data.events, data.faction, false, data.curse, undefined, undefined, data.inventoryVariant);
			if (success) {
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Unlock.ogg");
				KDSendStatus('bound', data.name, "self");
				loose = KinkyDungeonInventoryGetLoose(data.name);
				if (loose) {
					if (!(loose.quantity > 1)) {
						KinkyDungeonInventoryRemove(loose);
					} else {
						loose.quantity -= 1;
					}
				}


				KDStunTurns(KinkyDungeonGetRestraintByName(data.name)?.protection ? 4 : 2, true);

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
			} else {
				KinkyDungeonSendTextMessage(10, TextGet("KDCantEquip").replace("RestraintName", TextGet("Restraint" + KDRestraint(loose).name)), "yellow", 1);

				return "KDCantEquip";
			}
		}
		case "tryOrgasm":
			KDDelayedActionPrune(["Action", "Sexy"]);
			KinkyDungeonDoTryOrgasm(data.bonus, 0);
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
			KinkyDungeonSetFlag("CallForHelp", 12);
			break;
		}

		case "crouch": {
			KDGameData.Crouch = !KDGameData.Crouch;
			KinkyDungeonAdvanceTime(0);
			break;
		}
		case "pick":
			KDDelayedActionPrune(["Action", "Struggle"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			KinkyDungeonTargetTile = tile;
			KinkyDungeonTargetTileLocation = data.targetTile;
			if (KinkyDungeonTargetTile?.Lock) {
				if (KinkyDungeonPickAttempt()) {
					KinkyDungeonTargetTile.OGLock = KinkyDungeonTargetTile.Lock;
					KinkyDungeonTargetTile.Lock = undefined;
					if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
				}
				KinkyDungeonAdvanceTime(1, true);
				KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
			}
			break;
		case "swipe":
			KDDelayedActionPrune(["Action", "Struggle"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			KinkyDungeonTargetTile = tile;
			KinkyDungeonTargetTileLocation = data.targetTile;
			if (KinkyDungeonInventoryGet("KeyCard") != undefined) {
				if (KinkyDungeonTargetTile?.Lock) {
					KinkyDungeonTargetTile.OGLock = KinkyDungeonTargetTile.Lock;
					KinkyDungeonTargetTile.Lock = undefined;
					if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSwipeDoorUse"), "lightgreen", 2);
					KinkyDungeonAdvanceTime(1, true);
					KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
				}
			} else {
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSwipeDoorNone"), "lightgreen", 1);
			}

			break;


		case "unlock":
			KDDelayedActionPrune(["Action", "Struggle"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			KinkyDungeonTargetTile = tile;
			KinkyDungeonTargetTileLocation = data.targetTile;

			if (KinkyDungeonTargetTile?.Lock) {
				KDUpdateDoorNavMap();
				if (KinkyDungeonUnlockAttempt(KinkyDungeonTargetTile.Lock)) {
					KinkyDungeonTargetTile.OGLock = KinkyDungeonTargetTile.Lock;
					KinkyDungeonTargetTile.Lock = undefined;
					if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
				}
				KinkyDungeonAdvanceTime(1, true);
				KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
			}
			break;
		case "commandunlock": {
			KDDelayedActionPrune(["Action", "Cast"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			KinkyDungeonTargetTile = tile;
			KinkyDungeonTargetTileLocation = data.targetTile;


			if (KinkyDungeonTargetTile?.Lock) {
				let spell = KinkyDungeonFindSpell("CommandWord", true);
				let miscast = KinkyDungeonMiscastChance;
				let gagTotal = KinkyDungeonGagTotal();
				if (KinkyDungeoCheckComponents(KinkyDungeonFindSpell("CommandWord"), KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y).length > 0) {
					miscast = miscast + Math.max(0, 1 - miscast) * Math.min(1, !KDSpellIgnoreComp(spell) ? gagTotal : 0);
				}
				if (KDRandom() > miscast) {
					KinkyDungeonTargetTile.OGLock = KinkyDungeonTargetTile.Lock;
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
				KinkyDungeonAdvanceTime(1, true);
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
		case "shrineUse": {
			KDDelayedActionPrune(["Action", "World"]);
			if (KinkyDungeonGoddessRep[data.type] <= -45) {
				//Cursed
				KinkyDungeonSendActionMessage(10, TextGet("KDCursedGoddess"), "#ff5555", 2);
				return "Fail";
			}
			tile = KinkyDungeonTilesGet(data.targetTile);
			//KinkyDungeonTargetTile = tile;
			//KinkyDungeonTargetTileLocation = data.targetTile;
			//KinkyDungeonTargetTile = null;
			let mult = 1;
			if (tile.mult != undefined) mult = tile.mult;
			if (tile.Quest) {
				KinkyDungeonSendActionMessage(9, TextGet("KDNeedQuestFirst"), "#ff5555", 1);

			} else {
				if (KinkyDungeonGold >= data.cost * mult) {
					KinkyDungeonPayShrine(data.type, mult);
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
				KinkyDungeonAdvanceTime(1, true);
				KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
			}
			break;
		}
		case "shrineQuest": {
			KDDelayedActionPrune(["Action", "World"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			if (tile && !KDHasQuest(tile.Quest)) {
				KDAddQuest(tile.Quest);
				delete tile.Quest;
				tile.mult = 0;
				KinkyDungeonSendActionMessage(9, TextGet("KDShrineQuestAccepted"), "#ffffff", 1);
				return "Accept";
			}

			KinkyDungeonSendActionMessage(9, TextGet("KDShrineQuestAcceptedFail"), "#ffffff", 1);
			return "Fail";
		}
		case "shrineDevote": {
			KDDelayedActionPrune(["Action", "World"]);
			if (KinkyDungeonGoddessRep[data.type] <= -45 && KDGameData.Champion != data.type) {
				//Cursed
				KinkyDungeonSendActionMessage(10, TextGet("KDCursedGoddess"), "#ff5555", 2);
				return "Fail";
			}

			KDGameData.Champion = data.type;
			return "Pass";
		}
		case "shrinePray": {
			KDDelayedActionPrune(["Action", "World"]);
			if (KinkyDungeonGoddessRep[data.type] <= -45) {
				//Cursed
				KinkyDungeonSendActionMessage(10, TextGet("KDCursedGoddess"), "#ff5555", 2);
				return "Fail";
			}

			tile = KinkyDungeonTilesGet(data.targetTile);
			if (tile) {
				tile.Rescue = true;
			}
			//KinkyDungeonTargetTile = tile;
			//KinkyDungeonTargetTileLocation = data.targetTile;
			//KinkyDungeonTargetTile = null;
			KDDelayedActionPrune(["Action", "World"]);
			let tiles = KinkyDungeonRescueTiles();
			if (tiles.length > 0) {
				KDSendStatus('goddess', data.type, 'helpRescue');
				KinkyDungeonChangeRep(data.type, -10);
				tile = tiles[Math.floor(tiles.length * KDRandom())];
				if (tile) {
					KinkyDungeonMapSet(tile.x, tile.y, "$");
					KinkyDungeonTilesSet(tile.x + "," + tile.y, {Type: "Angel", Light: 5, lightColor: 0xffffff});
					KDStartDialog("AngelHelp","Angel", true, "");
				}
				KDGameData.RescueFlag = true;
			}
			//KinkyDungeonAdvanceTime(1, true);
			return "Rescue";
		}
		case "shrineDrink": {
			if (!KDCanDrinkShrine(false)) {
				KinkyDungeonSendActionMessage(9, TextGet("KDNoMana"), "#ff5555", 2, true);
				break;
			}
			KDDelayedActionPrune(["Action", "World"]);
			tile = KinkyDungeonTilesGet(data.targetTile);
			if (tile) tile.drunk = true;

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
			KinkyDungeonChangeMana(KinkyDungeonStatManaMax * 0.5, false, 0, false, true);
			KDSendStatus('goddess', data.type, 'shrineDrink');
			KinkyDungeonAggroAction('shrine', {});
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");

			KinkyDungeonAdvanceTime(1, true);

			let x =  data.targetTile.split(',')[0];
			let y =  data.targetTile.split(',')[1];

			if (KinkyDungeonGoddessRep[data.type] <= -45) {
				//Cursed
				KDSummonRevengeMobs(parseInt(x), parseInt(y), tile.type, 5);
			} else
				KDSummonRevengeMobs(parseInt(x), parseInt(y), tile.type, slimed ? 1.5 : 1);

			KDMapData.PoolUses += 1;

			KinkyDungeonSendEvent("afterShrineDrink", {x: data.x, y: data.y, tile: data.tile});
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

			KDMapData.PoolUses += 1;
			KinkyDungeonSendEvent("afterShrineBottle", {x: data.x, y: data.y, tile: data.tile});
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
				let edata = {
					x: data.x,
					y: data.y,
					shrine: data.shrine,
					punish: KinkyDungeonGoddessRep[data.shrine] < -45,
					inputdata: data,
					rep: (data.Rep || data.Amount) * -10,
				};

				KinkyDungeonSendEvent("spellOrb", edata);
				if (edata.punish) {
					KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, "OrbGuardian", 3 + Math.floor(Math.sqrt(1 + MiniGameKinkyDungeonLevel)), 10, false, 30);
					let tag = "";
					switch (data.shrine) {
						case "Latex":
							tag = "HardSlimeCollar";
							break;
						case "Leather":
							tag = "LeatherLivingCollar";
							break;
						case "Metal":
							tag = "MithrilLivingCollar";
							break;
						case "Rope":
							tag = "WeakMagicRopeCollar";
							break;
						case "Will":
							tag = "MysticDuctTapeCollar";
							break;
						case "Elements":
							tag = "CrystalLivingCollar";
							break;
						case "Conjure":
							tag = "RibbonCollar";
							break;
						case "Illusion":
							tag = "ObsidianLivingCollar";
							break;
					}
					let restraintAdd = KinkyDungeonGetRestraintByName(tag);
					if (restraintAdd) {
						KinkyDungeonAddRestraintIfWeaker(restraintAdd, 10, true, "Gold", false, false, undefined, undefined, true);
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonGoddessCollar").replace("TYPE", TextGet("KinkyDungeonShrine" + data.shrine)).replace("RESTRAINT", TextGet("Restraint" + tag)), "lightblue", 2);
					}
				}

				KinkyDungeonChangeRep(data.shrine, edata.rep);

				KDSendStatus('goddess', data.shrine, 'takeOrb');
				if (KinkyDungeonStatsChoice.get("randomMode")) {
					let tt = KinkyDungeonTilesGet(data.x + "," + data.y);
					let spell = (tt ? KinkyDungeonFindSpell(tt.Spell) : null) || KDGetRandomSpell();

					if (spell) {
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
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonOrbSpell").replace("SPELL", TextGet("KinkyDungeonSpell" + spell.name)), "lightblue", 2);
					} else {
						KinkyDungeonSpellPoints += data.Amount;
					}
				} else {
					KinkyDungeonSpellPoints += data.Amount;
				}
				if (KinkyDungeonTilesGet(data.x + ',' + data.y)) {
					KinkyDungeonTilesGet(data.x + ',' + data.y).Light = undefined;
				}
				KinkyDungeonMapSet(data.x, data.y, 'o');
				KinkyDungeonAggroAction('orb', {});
				KinkyDungeonSendEvent("afterSpellOrb", edata);
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
				if (data.bondage) {
					for (let b of data.bondage) {
						KinkyDungeonAddRestraintIfWeaker(
							KinkyDungeonGetRestraintByName(b), 20, true, "Gold", true
						);
					}
				}
				if(data.method) {
					KDGameData.SelectedEscapeMethod = data.method;
				}

				KinkyDungeonMapSet(data.x, data.y, 'p');

				KinkyDungeonSetFlag("choseperk", 3);
				for (let x = 0; x < KDMapData.GridWidth; x++) {
					if (KinkyDungeonMapGet(x, data.y) == 'P') {
						KinkyDungeonMapSet(x, data.y, 'p');
					}
				}
				KinkyDungeonSendEvent("perkOrb", {x: data.x, y: data.y, perks: data.perks});
			}
			break;
		case "heart":
			if (data.type == "AP") {
				if (KinkyDungeonStatDistractionMax < KDMaxStat) KDPushSpell(KinkyDungeonFindSpell("APUp1"));
				KinkyDungeonUpdateStats(0);
			}else if (data.type == "SP") {
				if (KinkyDungeonStatStaminaMax < KDMaxStat) KDPushSpell(KinkyDungeonFindSpell("SPUp1"));
				KinkyDungeonUpdateStats(0);
			} else if (data.type == "MP") {
				if (KinkyDungeonStatManaMax < KDMaxStat) KDPushSpell(KinkyDungeonFindSpell("MPUp1"));
				KinkyDungeonUpdateStats(0);
			} else if (data.type == "WP") {
				if (KinkyDungeonStatWillMax < KDMaxStat) KDPushSpell(KinkyDungeonFindSpell("WPUp1"));
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
				let tiles = KinkyDungeonRescueTiles();
				if (tiles.length > 0) {
					KDSendStatus('goddess', data.rep, 'helpRescue');
					KinkyDungeonChangeRep(data.rep, -10);
					tile = tiles[Math.floor(tiles.length * KDRandom())];
					if (tile) {
						KinkyDungeonMapSet(tile.x, tile.y, "$");
						KinkyDungeonTilesSet(tile.x + "," + tile.y, {Type: "Angel", Light: 5, lightColor: 0xffffff});
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
			KinkyDungeonWeaponChoices[data.I] = "";
			KinkyDungeonConsumableChoices[data.I] = "";
			KinkyDungeonArmorChoices[data.I] = "";
			KinkyDungeonSpellChoicesToggle[data.I] = !KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]].defaultOff;
			if (KinkyDungeonSpellChoicesToggle[data.I] && KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]].costOnToggle) {
				if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]]))) {
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]]));
				} else KinkyDungeonSpellChoicesToggle[data.I] = false;
			}
			if (KinkyDungeonStatsChoice.has("Disorganized")) {
				KinkyDungeonAdvanceTime(1);
				KDGameData.SlowMoveTurns = 2;
			} else if (!KinkyDungeonStatsChoice.has("QuickDraw"))
				KinkyDungeonAdvanceTime(1);
			break;
		case "itemChoice":
			KDDelayedActionPrune(["Action", "SwitchSpell"]);
			KinkyDungeonEvasionPityModifier = 0.0;
			KinkyDungeonSpellChoices[data.I] = -1;
			KinkyDungeonWeaponChoices[data.I] = "";
			KinkyDungeonConsumableChoices[data.I] = "";
			KinkyDungeonArmorChoices[data.I] = "";
			KinkyDungeonSpellChoicesToggle[data.I] = true;

			if (KDConsumable({name: data.name})) {
				KinkyDungeonConsumableChoices[data.I] = data.name;
			} else if (KDWeapon({name: data.name})) {
				KinkyDungeonWeaponChoices[data.I] = data.name;
			} else {
				KinkyDungeonArmorChoices[data.I] = data.name;
			}
			/*
			if (KinkyDungeonSpellChoicesToggle[data.I] && KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]].costOnToggle) {
				if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]]))) {
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]]));
				} else KinkyDungeonSpellChoicesToggle[data.I] = false;
			}
			if (KinkyDungeonStatsChoice.has("Disorganized")) {
				KinkyDungeonAdvanceTime(1);
				KDGameData.SlowMoveTurns = 2;
			} else if (!KinkyDungeonStatsChoice.has("QuickDraw"))
				KinkyDungeonAdvanceTime(1);*/
			break;
		case "spellRemove":
			KinkyDungeonEvasionPityModifier = 0.0;
			KinkyDungeonSpellChoices[data.I] = -1;
			KinkyDungeonWeaponChoices[data.I] = "";
			KinkyDungeonConsumableChoices[data.I] = "";
			KinkyDungeonArmorChoices[data.I] = "";
			KinkyDungeonSpellChoicesToggle[data.I] = true;
			break;
		case "spellCastFromBook": {
			KDDelayedActionPrune(["Action", "Cast"]);
			let spell = KinkyDungeonHandleSpellCast(KinkyDungeonSpells[data.CurrentSpell]);
			if (spell && !(KinkyDungeonSpells[data.CurrentSpell].type == "passive") && !KinkyDungeonSpells[data.CurrentSpell].passive && !KinkyDungeonSpells[data.CurrentSpell].upcastFrom) {
				if (!spell.quick) {
					if (KinkyDungeonStatsChoice.has("Disorganized")) {
						KinkyDungeonAdvanceTime(1);
						KDGameData.SlowMoveTurns = 2;
					} else if (!KinkyDungeonStatsChoice.has("QuickDraw"))
						KinkyDungeonAdvanceTime(1);
				}
				KinkyDungeonSendActionMessage(5, TextGet("KinkyDungeonSpellTarget" + spell.name).replace("SpellArea", "" + Math.floor(spell.aoe)), "white", 0.1, true);
			}
			break;
		}
		case "focusControlToggle": {
			KDInputFocusControlToggle(data.key, data.value);
			break;
		}
		case "upcast": {
			KDDelayedActionPrune(["Action", "Cast"]);
			KDEmpower(data, KinkyDungeonPlayerEntity);
			break;
		}
		case "upcastcancel": {
			KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "upcast", 1);
			break;
		}
		case "select": {
			if (data.enemy && KDAllied(data.enemy)) {
				if (data.enemy.buffs?.AllySelect?.duration > 0) data.enemy.buffs.AllySelect.duration = 0;
				else KinkyDungeonApplyBuffToEntity(data.enemy, {
					id: "AllySelect",
					aura: "#ffffff",
					aurasprite: "Select",
					duration: 9999, infinite: true,
					type: "Sel",
					power: 1,
				});
			}
			break;
		}
		case "selectOnly": {
			for (let e of KDMapData.Entities) {
				if (e.id != data.enemy?.id && e.buffs?.AllySelect) e.buffs.AllySelect.duration = 0;
				else if (e.id == data.enemy?.id) KinkyDungeonApplyBuffToEntity(e, {
					id: "AllySelect",
					aura: "#ffffff",
					aurasprite: "Select",
					duration: 9999, infinite: true,
					type: "Sel",
					power: 1,
				});
			}
			KinkyDungeonSendTextMessage(10, TextGet("KDOrderSelect").replace("ENMY", TextGet("Name" + data.enemy.Enemy.name)), "#ffffff", 1);

			break;
		}
		case "cancelParty": {
			if (data.enemy) {
				let enemy = KinkyDungeonFindID(data.enemy.id);
				if (!enemy && KDGameData.Party) enemy = KDGameData.Party.find((entity) => {return entity.id == data.enemy.id;});
				if (enemy) {
					if (enemy.buffs?.AllySelect) enemy.buffs.AllySelect.duration = 0;
					KinkyDungeonSetEnemyFlag(enemy, "NoFollow", -1);
					KDRemoveFromParty(enemy, false);
					KinkyDungeonSendTextMessage(10, TextGet("KDOrderRemove").replace("ENMY", TextGet("Name" + enemy.Enemy.name)), "#ffffff", 1);

				}
			}
			break;
		}
		case "onMe": {
			if (data.enemy && data.player) {
				let enemy = KinkyDungeonFindID(data.enemy.id);
				enemy.gx = data.player.x;
				enemy.gy = data.player.y;
				if (KDEnemyHasFlag(data.enemy, "NoFollow")) {
					KinkyDungeonSetEnemyFlag(enemy, "NoFollow", 0);
					KinkyDungeonSetEnemyFlag(enemy, "Defensive", -1);
					KinkyDungeonSendTextMessage(10, TextGet("KDOrderOnMe").replace("ENMY", TextGet("Name" + enemy.Enemy.name)), "#ffffff", 1);
				} else {
					KinkyDungeonSetEnemyFlag(enemy, "NoFollow", -1);
					KinkyDungeonSetEnemyFlag(enemy, "Defensive", 0);
					KinkyDungeonSendTextMessage(10, TextGet("KDOrderDisperse").replace("ENMY", TextGet("Name" + enemy.Enemy.name)), "#ffffff", 1);
				}

			}
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
						KDPushSpell(spell);
						KDSendStatus('learnspell', spell.name);
						if (spell.goToPage) {
							KinkyDungeonCurrentSpellsPage = spell.goToPage;
						}
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
						KinkyDungeonSetMaxStats();
						if (KDToggles.Sound && KinkyDungeonIsPlayer()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
						KinkyDungeonCurrentPage = KinkyDungeonSpellIndex(spell.name);
						if (KinkyDungeonStatsChoice.has("Disorganized")) {
							KinkyDungeonAdvanceTime(1);
							KDGameData.SlowMoveTurns = 2;
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
					let full = false;
					// Perform the tablet buff action
					if (tile.Name == "Will") {
						// Restoration shrine gets a regeneration buff
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletWill", type: "restore_mp", power: 0.5, duration: 20});
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletWill2", type: "restore_sp", power: 0.5, duration: 20});
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletWill3", type: "restore_wp", power: 0.5, duration: 5});
					} else if (tile.Name == "Determination") {
						if (KinkyDungeonStatWill >= KinkyDungeonStatWillMax) {
							full = true;
						} else {
							KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletDetermination", type: "restore_wp", power: 1, duration: 5});
						}
					} else {
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
							{id: "Tablet" + tile.Name, aura: KDGoddessColor(tile.Name), type: "event", duration: 9999, infinite: true, power: 2, player: true, enemies: false, maxCount: 3, tags: ["cast_" + tile.Name.toLowerCase(), "trigger_" + tile.Name.toLowerCase()], events: [
								{trigger: "calcMana", type: "Tablet", requiredTag: tile.Name.toLowerCase(), power: 0.5},
							]}
						);
					}

					if (full) {
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonTabletReadFull"), "lightgreen", 1);
					} else {
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
	if (data.GameData) {
		Object.assign(KDGameData, data.GameData);
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