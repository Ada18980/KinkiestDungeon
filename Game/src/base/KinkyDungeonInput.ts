

let KinkyDungeonInputQueue: {type: string, data: any}[] = [];

/**
 * The purpose of Input processing is to allow a future netcode implementation
 * and/or replay system
 * By separating player inputs from actual UI it becomes easier to do these things in future
 */
let KDInputTypes: Record<string, (data: any) => string> = {
	"move": (data) => {
		KDInteracting = false;
		KinkyDungeonToggleAutoPass = data.AutoPass;
		KinkyDungeonToggleAutoSprint = data.sprint;
		KinkyDungeonSuppressSprint = data.SuppressSprint;
		return KinkyDungeonMove(data.dir, data.delta, data.AllowInteract,
			 data.SuppressSprint, data.forceSprint) ? "move" : "nomove";
	},
	"movestairs": (data) => {
		KDInteracting = false;
		KinkyDungeonToggleAutoPass = data.AutoPass;
		KinkyDungeonToggleAutoSprint = data.sprint;
		KinkyDungeonSuppressSprint = data.SuppressSprint;
		KinkyDungeonConfirmStairs = true;
        if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/ClickError.ogg");
		return KinkyDungeonMove(data.dir, data.delta, data.AllowInteract, data.SuppressSprint) ? "move" : "nomove";
	},
	"setMoveDirection": (data) => {
		KinkyDungeonMoveDirection = data.dir;
		return "";
	},
	"docapture": (data) => {
		let entity = KinkyDungeonEntityAt(data.tx, data.ty);
		if (entity?.id == data.id) {
			KDDoCapture(entity, 0, data.noadvance, data.skip);
			KinkyDungeonLastAction = "Attack"; KDPauseBalance(5);
			KinkyDungeonAdvanceTime(1);
		}
		return "";
	},
	"doaggro": (data) => {
		let entity = KinkyDungeonEntityAt(data.tx, data.ty);
		if (entity?.id == data.id) {
			KDAggroViaDialogue(entity, data.unaware, data.aggroothers)
		}
		return "";
	},
	"dospecial": (data) => {
		KinkyDungeonRangedAttack(data.x, data.y);
		return "";
	},
	"doattack": (data) => {
		let entity = KinkyDungeonEntityAt(data.tx, data.ty);
		if (entity?.id == data.id) {
			KDDoAttack(entity, data.teasesub, data.attackCost, data.skip);
			KinkyDungeonLastAction = "Attack"; KDPauseBalance(5);
			KinkyDungeonAdvanceTime(1);
		}
		return "";
	},

	"tick": (data) => {
		if (data.sleep == 10 && (KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'parole') && KinkyDungeonPlayerInCell()) {
			KDKickEnemies(KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y), false, MiniGameKinkyDungeonLevel, true);
		}
		if(data.sleep) {
			KDSleepTick();
		}
		KinkyDungeonAdvanceTime(data.delta, data.NoUpdate, data.NoMsgTick);
		return "";
	},
	"tryCastSpell": (data) => {
		KDDelayedActionPrune(["Action", "Cast"]);
		let sp = data.spell ? data.spell : KinkyDungeonFindSpell(data.spellname, true);
		if (!data.spell) data.spell = sp;
		if (sp) {
			let res: { result: string, data: any } = KinkyDungeonCastSpell(data.tx, data.ty, sp, data.enemy, data.player, data.bullet, undefined, data);
			if (res.result == "Cast" && sp.sfx) {
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sp.sfx + ".ogg");
			}
			if (res.result != "Fail" && !sp.quick) {
				KinkyDungeonAdvanceTime(res.data.delta);
			}
			KinkyDungeonInterruptSleep();
			let Result = res.result;
			return Result;
		}
		return "Fail";
	},
	"offhandswitch": (data) => {
		KDGameData.InventoryAction = "Offhand";
		KDGameData.Offhand = "";
		KDGameData.OffhandOld = "";
		KDShowInventory(null);
		KinkyDungeonCurrentFilter = Weapon;
		return "";
	},
	"lock": (data) => {
		KDDelayedActionPrune(["Action", "Struggle"]);
		let item = KinkyDungeonGetRestraintItem(data.group);
		if (data.index) {
			let surfaceItems = KDDynamicLinkListSurface(item);
			if (surfaceItems[data.index])
				item = surfaceItems[data.index];
			else console.log("Error! Please report the item combination and screenshot to Ada!");
		}
		KinkyDungeonLock(item, data.type);
		return "";
	},
	"struggle": (data) => {
		KDDelayedActionPrune(["Action", "Struggle"]);
		return KinkyDungeonStruggle(data.group, data.type, data.index);
	},
	"struggleCurse": (data) => {
		KDDelayedActionPrune(["Action", "Struggle"]);
		let item = KinkyDungeonGetRestraintItem(data.group);
		if (data.index) {
			let surfaceItems = KDDynamicLinkListSurface(item);
			if (surfaceItems[data.index])
				item = surfaceItems[data.index];
			else console.log("Error! Please report the item combination and screenshot to Ada!");
		}
		KinkyDungeonCurseStruggle(item, data.curse);
		return "";
	},
	"curseUnlock": (data) => {
		KDDelayedActionPrune(["Action", "Struggle"]);
		KinkyDungeonCurseUnlock(data.group, data.index, data.curse);
		return "";
	},
	"toggleSpell": (data) => {
		KinkyDungeonSpellChoicesToggle[data.i] = !KinkyDungeonSpellChoicesToggle[data.i];
		let spell = KDGetUpcast(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.i]].name,
			KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellEmpower")) || KinkyDungeonSpells[KinkyDungeonSpellChoices[data.i]];
		KinkyDungeonSendEvent("toggleSpell", {index: data.i, spell: spell},
			spell);

		if (KinkyDungeonSpellChoicesToggle[data.i] && spell.costOnToggle) {
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell))) {
				KDChangeMana(spell.name,"spell", "cast", -KinkyDungeonGetManaCost(spell));
			} else KinkyDungeonSpellChoicesToggle[data.i] = false;
		}

		if (spell.name != KinkyDungeonSpells[KinkyDungeonSpellChoices[data.i]].name) {
			KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "upcast", 1);
		}
		return "";
	},
	"consumable": (data) => {
		//KDModalArea = false;
		KinkyDungeonAttemptConsumable(data.item, data.quantity);
		//KinkyDungeonTargetTile = null;
		//KinkyDungeonTargetTileLocation = null;
		return "";
	},
	"quickRestraint": (data) => {
		KinkyDungeonAttemptQuickRestraint(data.item);
		return "";
	},

	"switchWeapon": (data) => {
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
		KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonEquipWeapon").replace("WEAPONNAME", KDGetItemNameString(data.weapon)), KDBaseWhite, 5);
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Equip.ogg");

		// Reequip offhand if able
		if (KDGameData.OffhandOld && !KDGameData.Offhand
			&& KinkyDungeonInventoryGetWeapon(KDGameData.OffhandOld)
			&& KinkyDungeonCanUseWeapon(false, undefined, KDWeapon(KinkyDungeonInventoryGetWeapon(KDGameData.OffhandOld)))
			&& KDCanOffhand(KinkyDungeonInventoryGetWeapon(KDGameData.OffhandOld))) {
			KDGameData.Offhand = KDGameData.OffhandOld;
		}
		return "";
	},
	"unequipWeapon": (data) => {
		KDDelayedActionPrune(["Action", "SwitchWeapon"]);
		if (!KDGameData.PreviousWeapon || typeof KDGameData.PreviousWeapon === 'string') KDGameData.PreviousWeapon = [];
		if (data.weapon)
			KDGameData.PreviousWeapon.push(data.weapon);
		KDSetWeapon(null);
		while (KDGameData.PreviousWeapon?.length > KDMaxPreviousWeapon) {
			KDGameData.PreviousWeapon.splice(0, 1);
		}
		KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon());
		KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonUnEquipWeapon").replace("WEAPONNAME", KDGetItemNameString(data.weapon)), KDBaseWhite, 5);
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Equip.ogg");
		return "";
	},
	"dress": (data) => {
		KDDelayedActionPrune(["Action", "Dress"]);
		KinkyDungeonSetDress(data.dress, data.outfit);
		KDGameData.SlowMoveTurns = 5;
		KDUpdateWaitTime(200);
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Equip.ogg");
		return "";
	},
	"drop": (data) => {
		KDDropItemInv(data.item);
		return "";
	},
	"buffclick": (data) => {
		if (KDBuffClick[data.click]) {
			KDBuffClick[data.click](data.buff, data.id || KinkyDungeonPlayerEntity, data);
		}
		return "";
	},
	"inventoryAction": (data) => {
		if (!data.action) {
			KDGameData.InventoryAction = "";
			KDGameData.InventoryActionContainer = [];
			return "";
		}
		if (KDInventoryAction[data.action || KDGameData.InventoryAction]
			&& KDInventoryAction[data.action || KDGameData.InventoryAction].valid(data.player, data.item)) {
			if (data.item.type == Restraint) data.item = KinkyDungeonInventoryGetWorn(data.item.name)
			else data.item = KinkyDungeonInventoryGetSafe(data.item.name, KDInventoryActionContainer(data.player));
			if (data.item)
				KDInventoryAction[data.action || KDGameData.InventoryAction].click(data.player, data.item);
		}
		return "";
	},
	"equipRestraintGeneric": (data) => {
		let equipped = false;
		let newItem: restraint = null;
		let currentItem: item = null;
		let linkable = null;
		let name: string = data.name;

		if (name) {
			newItem = KDRest(name);
			if (newItem) {
				currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
				if (!currentItem) equipped = false;
				else {
					if (KDDebugLink) {
						linkable = KDCanAddRestraint(KDRestraint(newItem),
						true, "", false, currentItem, true, true);
					} else {
						linkable = KDCanAddRestraint(KDRestraint(newItem),
						false, "", false, currentItem, true,
						true);
						//KDCurrentItemLinkable(currentItem, newItem);
					}
					if (linkable) {
						equipped = false;
					} else equipped = true;
				}
			}
		}

		if (equipped) return "";


		//KDDelayedActionPrune(["Action", "Equip"]);
		KinkyDungeonSetFlag("SelfBondage", 1);

		data.player = KDPlayer().id;

		let maxtime = data.duration || KDGetEquipDuration(newItem.name, KDPlayer());
		for (let i = 1; i <= maxtime; i++)
			KDAddDelayedAction({
				data: data,
				commit: i == maxtime ? "EquipGenericRestraint" : undefined,
				update: i < maxtime ? "EquipGenericRestraint" : undefined,
				time: i,
				tick: i - 1,
				maxtime: maxtime,
				tags: ["Action", "Remove", "Restrain", "Hit"],
			});
		KDDelayedActionStart();

		return "";
	},

	"equip": (data) => {

		let equipped = false;
		let newItem: restraint = null;
		let currentItem: item = null;
		let linkable = null;
		let name: string = data.name;

		if (name) {
			newItem = KDRest(name);
			if (newItem) {
				currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
				if (!currentItem) equipped = false;
				else {
					if (!KDDebugforceadds) {
						if (KDDebugLink) {
							linkable = KDCanAddRestraint(KDRestraint(newItem),
							true, "", false, currentItem, true, true);
						} else {
							linkable = KDCanAddRestraint(KDRestraint(newItem),
							false, "", false, currentItem, true,
							true);
							//KDCurrentItemLinkable(currentItem, newItem);
						}
						if (linkable) {
							equipped = false;
						} else equipped = true;
					}
				}
			}
		}

		if (equipped) return "";


		//KDDelayedActionPrune(["Action", "Equip"]);
		KinkyDungeonSetFlag("SelfBondage", 1);

		data.player = KDPlayer().id;

		let maxtime = KDGetEquipDuration(newItem.name, KDPlayer());
		for (let i = 1; i <= maxtime; i++)
			KDAddDelayedAction({
				data: data,
				commit: i == maxtime ? "EquipRestraint" : undefined,
				update: i < maxtime ? "EquipRestraint" : undefined,
				time: i,
				tick: i - 1,
				maxtime: maxtime,
				tags: ["Action", "Remove", "Restrain", "Hit"],
			});
		KDDelayedActionStart();
		return "";
	},
	"tryOrgasm": (data) => {
		KDDelayedActionPrune(["Action", "Sexy"]);
		KinkyDungeonDoTryOrgasm(data.bonus, 0);
		return "";
	},
	"tryPlay": (data) => {
		KDDelayedActionPrune(["Action", "Sexy"]);
		KinkyDungeonDoPlayWithSelf();
		return "";
	},
	"sleep": (data) => {
		KDSleep(KDPlayer());
		return "";
	},
	"noise": (data) => {
		KDDelayedActionPrune(["Action", "Dialogue"]);
		let gagTotal = KinkyDungeonGagTotal(true);
		KinkyDungeonMakeNoise(Math.ceil(10 - 8 * Math.min(1, gagTotal * gagTotal)), KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, false, true);
		KinkyDungeonSendTextMessage(10, TextGet("KDShoutHelp" + Math.min(3, Math.floor(gagTotal *3.3))), "yellow", 1);
		KinkyDungeonSetFlag("CallForHelp", 12);
		KinkyDungeonSetFlag("GuardCalled", 0);
		return "";
	},

	"crouch": (data) => {
		KDGameData.Crouch = !KDGameData.Crouch;
		KinkyDungeonAdvanceTime(0);
		return "";
	},
	"pick": (data) => {
		KDDelayedActionPrune(["Action", "Struggle"]);
		let tile = KinkyDungeonTilesGet(data.targetTile);
		KinkyDungeonTargetTile = tile;
		KinkyDungeonTargetTileLocation = data.targetTile;
		if (KinkyDungeonTargetTile?.Lock) {
			if (KinkyDungeonPickAttempt()) {
				KinkyDungeonTargetTile.OGLock = KinkyDungeonTargetTile.Lock;
				KinkyDungeonTargetTile.Lock = undefined;
				KinkyDungeonTargetTile.LockSeen = undefined;
				if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
				KinkyDungeonTargetTile = null;
				KinkyDungeonTargetTileLocation = "";
				KDModalArea = false;
			}
			KinkyDungeonAdvanceTime(1, true);
			KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
		}
		return "";
	},
	"swipe": (data) => {
		KDDelayedActionPrune(["Action", "Struggle"]);
		let tile = KinkyDungeonTilesGet(data.targetTile);
		KinkyDungeonTargetTile = tile;
		KinkyDungeonTargetTileLocation = data.targetTile;
		if (KinkyDungeonInventoryGet("KeyCard") != undefined) {
			if (KinkyDungeonTargetTile?.Lock) {
				KinkyDungeonTargetTile.OGLock = KinkyDungeonTargetTile.Lock;
				KinkyDungeonTargetTile.Lock = undefined;
				KinkyDungeonTargetTile.LockSeen = undefined;
				if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
				KinkyDungeonTargetTile = null;
				KinkyDungeonTargetTileLocation = "";
				KDModalArea = false;
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSwipeDoorUse"), KDBaseLightGreen, 2);
				KinkyDungeonAdvanceTime(1, true);
				KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
				// The cards are one-use if you are being chased
				if (KDCyberHostile(KinkyDungeonPlayerEntity)) {
					KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("KeyCard"), -1);
					KinkyDungeonSendActionMessage(10, TextGet("KDCyberHostileKeyCard"), KDBaseRed, 2);
				}
			}
		} else {
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSwipeDoorNone"), KDBaseLightGreen, 1);
		}

		return "";
	},
	"scan": (data) => {
		KDDelayedActionPrune(["Action", "Struggle"]);
		let tile = KinkyDungeonTilesGet(data.targetTile);
		KinkyDungeonTargetTile = tile;
		KinkyDungeonTargetTileLocation = data.targetTile;
		if (!KDIsBlindfolded(KinkyDungeonPlayerEntity)) {
			if (KDCyberAccess(KinkyDungeonPlayerEntity)) {
				if (KinkyDungeonTargetTile?.Lock) {
					KinkyDungeonTargetTile.OGLock = KinkyDungeonTargetTile.Lock;
					KinkyDungeonTargetTile.Lock = undefined;
					KinkyDungeonTargetTile.LockSeen = undefined;
					if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					KDModalArea = false;
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonScanDoorUse"), KDBaseLightGreen, 2);
					KinkyDungeonAdvanceTime(1, true);
					KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
				}
			}  else {
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonScanDoorFail"), KDBaseLightGreen, 1);
			}
		} else {
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonScanDoorNone"), KDBaseLightGreen, 1);
		}

		return "";
	},

	"hack": (data) => {
		KDDelayedActionPrune(["Action", "Struggle"]);
		let tile = KinkyDungeonTilesGet(data.targetTile);
		KinkyDungeonTargetTile = tile;
		KinkyDungeonTargetTileLocation = data.targetTile;
		if (KDCyberLink(KinkyDungeonPlayerEntity)) {
			if (KDTryHack(KinkyDungeonPlayerEntity)) {
				if (KinkyDungeonTargetTile?.Lock) {
					KinkyDungeonTargetTile.OGLock = KinkyDungeonTargetTile.Lock;
					KinkyDungeonTargetTile.Lock = undefined;
					KinkyDungeonTargetTile.LockSeen = undefined;
					if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
					KinkyDungeonTargetTile = null;
					KinkyDungeonTargetTileLocation = "";
					KDModalArea = false;
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonHackDoorUse"), KDBaseLightGreen, 2);
					KinkyDungeonAdvanceTime(1, true);
					KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
				}
			}  else {
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonHackDoorFail"), KDBaseLightGreen, 1);
			}
		} else {
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonHackDoorNone"), KDBaseLightGreen, 1);
		}

		return "";
	},
	"unlock": (data) => {
		KDDelayedActionPrune(["Action", "Struggle"]);
		let tile = KinkyDungeonTilesGet(data.targetTile);
		KinkyDungeonTargetTile = tile;
		KinkyDungeonTargetTileLocation = data.targetTile;

		if (KinkyDungeonTargetTile?.Lock) {
			KDUpdateDoorNavMap();
			if (KinkyDungeonUnlockAttempt(KinkyDungeonTargetTile.Lock)) {
				KinkyDungeonTargetTile.OGLock = KinkyDungeonTargetTile.Lock;
				KinkyDungeonTargetTile.Lock = undefined;
				KinkyDungeonTargetTile.LockSeen = undefined;
				if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
				KinkyDungeonTargetTile = null;
				KinkyDungeonTargetTileLocation = "";
				KDModalArea = false;
			}
			KinkyDungeonAdvanceTime(1, true);
			KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
		}
		return "";
	},
	"commandunlock": (data) => {
		KDDelayedActionPrune(["Action", "Cast"]);
		let tile = KinkyDungeonTilesGet(data.targetTile);
		KinkyDungeonTargetTile = tile;
		KinkyDungeonTargetTileLocation = data.targetTile;


		if (KinkyDungeonTargetTile?.Lock) {
			let spell = KinkyDungeonFindSpell("CommandWord", true);
			let miscast = KinkyDungeonMiscastChance;
			let gagTotal = KinkyDungeonGagTotal();
			if (KinkyDungeoCheckComponents(KinkyDungeonFindSpell("CommandWord"), KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y).failed.length > 0) {
				miscast = miscast + Math.max(0, 1 - miscast) * Math.min(1, !KDSpellIgnoreComp(spell) ? gagTotal : 0);
			}
			if (KDRandom() > miscast) {
				KinkyDungeonTargetTile.OGLock = KinkyDungeonTargetTile.Lock;
				KinkyDungeonTargetTile.Lock = undefined;
				KinkyDungeonTargetTile.LockSeen = undefined;
				if (KinkyDungeonTargetTile.Type == "Lock") delete KinkyDungeonTargetTile.Type;
				KDUpdateDoorNavMap();
				KinkyDungeonTargetTile = null;
				KinkyDungeonTargetTileLocation = "";
				KDModalArea = false;
				if (gagTotal) {
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonUnlockDoorPurpleUseGagged"), "#aa44ff", 1);
				} else {
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonUnlockDoorPurpleUse"), "#aa44ff", 1);
				}
				KDChangeMana(spell.name,"spell", "cast", -KinkyDungeonGetManaCost(spell));
			} else {
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonUnlockDoorPurpleUseGaggedFail"), KDBaseRed, 1);
			}
			KinkyDungeonAdvanceTime(1, true);
			KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
		}

		return "";
	},
	"closeDoor": (data) => {
		let x =  data.targetTile.split(',')[0];
		let y =  data.targetTile.split(',')[1];
		KDDelayedActionPrune(["Action", "World"]);
		KinkyDungeonCloseDoor(x, y);
		return "";
	},
	"interact": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		let tick = KinkyDungeonCurrentTick;
		let fail = !KDInteract(data.x, data.y);
		if (KinkyDungeonCurrentTick > tick || fail) {
			if (KDTurnToFace(data.x, data.y)
				&& (KinkyDungeonStatsChoice.get("DirectionSlow") || KinkyDungeonStatsChoice.get("DirectionSlow2"))) {
				KinkyDungeonAdvanceTime(1);
			}
		}
		return "";
	},
	"shrineBuy": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		KinkyDungeonShopIndex = data.shopIndex;
		KinkyDungeonPayShrine(data.type);
		KinkyDungeonAggroAction('shrine', {});
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
		return "";
	},
	"shrineUse": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		let tile = KinkyDungeonTilesGet(data.targetTile);
		if (KinkyDungeonGoddessRep[data.type] <= -45 && !tile?.Quest) {
			//Cursed
			KinkyDungeonSendActionMessage(10, TextGet("KDCursedGoddess"), KDBaseRed, 2);
			return "Fail";
		}
		if (!tile) return "Error";
		//KinkyDungeonTargetTile = tile;
		//KinkyDungeonTargetTileLocation = data.targetTile;
		//KinkyDungeonTargetTile = null;
		let mult = 1;
		if (tile.mult != undefined) mult = tile.mult;
		if (tile.Quest) {
			KinkyDungeonSendActionMessage(9, TextGet("KDNeedQuestFirst"), KDBaseRed, 1);

		} else {
			if (KinkyDungeonGold >= data.cost * mult) {
				KinkyDungeonPayShrine(data.type, mult);
				KDClearTile(KinkyDungeonTargetTileLocation);
				KDModalArea = false;
				let x =  data.targetTile.split(',')[0];
				let y =  data.targetTile.split(',')[1];
				KinkyDungeonMapSet(parseInt(x), parseInt(y), "a");
				//KinkyDungeonTargetTileLocation = "";
				KinkyDungeonAggroAction('shrine', {x: parseInt(x), y:parseInt(y)});
				KDGameData.AlreadyOpened.push({x: parseInt(x), y: parseInt(y)});
				KinkyDungeonUpdateStats(0);
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
			} else {
				if (KinkyDungeonShrineTypeRemove.includes(data.type))
					KinkyDungeonSendActionMessage(9, TextGet("KDNoRestraints"), KDBaseRed, 1, true);
				else
					KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonPayShrineFail"), KDBaseRed, 1, true);
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Damage.ogg");
			}
			KinkyDungeonAdvanceTime(1, true);
			KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
		}
		return "";
	},
	"shrineQuest": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		let tile = KinkyDungeonTilesGet(data.targetTile);
		if (tile && !KDHasQuest(tile.Quest)) {
			KDAddQuest(tile.Quest);
			delete tile.Quest;
			tile.mult = 0;
			KinkyDungeonSendActionMessage(9, TextGet("KDShrineQuestAccepted"), KDBaseWhite, 1, false, false, undefined, "Self");
			return "Accept";
		}

		KinkyDungeonSendActionMessage(9, TextGet("KDShrineQuestAcceptedFail"), KDBaseWhite, 1, false, false, undefined, "Self");
		return "Fail";
	},
	"shrineDevote": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		if (KinkyDungeonGoddessRep[data.type] <= -45 && KDGameData.Champion != data.type) {
			//Cursed
			KinkyDungeonSendActionMessage(10, TextGet("KDCursedGoddess"), KDBaseRed, 2, false, false, undefined, "Self");
			return "Fail";
		}

		KDGameData.Champion = data.type;
		return "Pass";
	},
	"shrinePray": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		if (KinkyDungeonGoddessRep[data.type] <= -45) {
			//Cursed
			KinkyDungeonSendActionMessage(10, TextGet("KDCursedGoddess"), KDBaseRed, 2, false, false, undefined, "Self");
			return "Fail";
		}

		let tile = KinkyDungeonTilesGet(data.targetTile);
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
				KinkyDungeonTilesSet(tile.x + "," + tile.y, {Type: "Angel", Light: 5, lightColor: 0xfffafa});
				KDStartDialog("AngelHelp","Angel", true, "");
			}
			KDGameData.RescueFlag = true;
		}
		//KinkyDungeonAdvanceTime(1, true);
		return "Rescue";
	},
	"shrineDrink": (data) => {
		if (!KDCanDrinkShrine(false)) {
			KinkyDungeonSendActionMessage(9, TextGet("KDNoMana"), KDBaseRed, 2, true);
			return "";
		}
		KDDelayedActionPrune(["Action", "World"]);
		let tile = KinkyDungeonTilesGet(data.targetTile);
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

		let x =  data.targetTile.split(',')[0];
		let y =  data.targetTile.split(',')[1];

		KDChangeMana(x + ',' + y,"map", "interact", KinkyDungeonStatManaMax * 0.5, false, 0, false, true);
		KDSendStatus('goddess', data.type, 'shrineDrink');
		KinkyDungeonAggroAction('shrine', {});
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");

		KinkyDungeonAdvanceTime(1, true);


		if (KinkyDungeonGoddessRep[data.type] <= -45) {
			//Cursed
			KDSummonRevengeMobs(parseInt(x), parseInt(y), tile.type, 5);
		} else
			KDSummonRevengeMobs(parseInt(x), parseInt(y), tile.type, slimed ? 1.5 : 1);

		KDMapData.PoolUses += 1;

		KinkyDungeonSendEvent("afterShrineDrink", {x: data.x, y: data.y, tile: data.tile});
		return "";
	},
	"shrineBottle": (data) => {
		if (!KDCanDrinkShrine(true)) {
			KinkyDungeonSendTextMessage(9, TextGet("KDNoMana"), KDBaseRed, 2, true);
			return "";
		}
		KDDelayedActionPrune(["Action", "World"]);
		let tile = KinkyDungeonTilesGet(data.targetTile);
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
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/PotionDrink.ogg");

		KDMapData.PoolUses += 1;
		KinkyDungeonSendEvent("afterShrineBottle", {x: data.x, y: data.y, tile: data.tile});
		return "";
	},
	"safeword": (data) => {
		// todo multiple players?
		let player = KDPlayer();

		let msg = TextGet("KDSafwordMsg", {
			Playername: KDGameData.PlayerName,
			PTheir: KDGetPronounTheir(KDPlayer())
		});

		
		for (let key of Object.keys(KDSpecialStats)) {
			let amt = KDEntityBuffedStat(KDPlayer(), key);
			KDAddSpecialStat(key, player, -amt, true);
		}

		for (let i = 0; i < 10000; i++) {
			let restraints = KinkyDungeonAllRestraintDynamic();
			if (restraints.length > 0) {
				KinkyDungeonRemoveRestraintSpecific(restraints[0].item, true, false, false, true);
			}
		}

		KinkyDungeonAdvanceTime(0, false);

		KinkyDungeonSendTextMessage(10, msg, KDBaseWhite, 5);
		let point = KDMapData.StartPosition || KDMapData.EndPosition;
		if (point) {
			KDMovePlayer(point.x, point.y, false, false);
			KinkyDungeonPlayerEntity.visual_x = KinkyDungeonPlayerEntity.x;
			KinkyDungeonPlayerEntity.visual_y = KinkyDungeonPlayerEntity.y;
		}
		KDKickEnemies(undefined, true, MiniGameKinkyDungeonLevel)
		
		return "";
	},
	"renamenpc": (data) => {
			let origname = KDGameData.Collection[data.id]?.origname;
			if (KDGameData.Collection[data.id]
				&& KDGameData.Collection[data.id].name != data.newName) {
				if (!origname) origname = KDGameData.Collection[data.id].name;
				KDGameData.Collection[data.id].name = data.newName;
			}
			if (KDPersistentNPCs[data.id]
				&& KDPersistentNPCs[data.id].Name != data.newName) {
				if (!origname) origname = KDPersistentNPCs[data.id].Name;
				KDPersistentNPCs[data.id].Name = data.newName;
			}
			if (KDPersistentNPCs[data.id]?.entity
				&& KDPersistentNPCs[data.id].entity.CustomName != data.newName) {
				if (!origname) origname = KDPersistentNPCs[data.id].entity.CustomName;
				KDPersistentNPCs[data.id].entity.CustomName = data.newName;
			}
			if (KDPersistentNPCs[data.id]?.trueEntity
				&& KDPersistentNPCs[data.id].trueEntity.CustomName != data.newName) {
				if (!origname) origname = KDPersistentNPCs[data.id].trueEntity.CustomName;
				KDPersistentNPCs[data.id].trueEntity.CustomName = data.newName;
			}

			if (origname) {
				if (KDGameData.Collection[data.id]) {
					KDGameData.Collection[data.id].origname = origname;
				}
				//if (!KDGameData.NamesGenerated) KDGameData.NamesGenerated = {};
				//delete KDGameData.NamesGenerated[origname];
				//KDGameData.NamesGenerated[data.newName] = data.id;
			}
			return "";
		},
	"defeat": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		KinkyDungeonDefeat(!(KinkyDungeonAltFloor(KDGameData.RoomType)?.isPrison)
			&& KinkyDungeonFlags.has("LeashToPrison"), KinkyDungeonLeashingEnemy());
		KDResetStripSearch();
		KinkyDungeonChangeRep("Ghost", 4);
		return "";
	},
	"lose": (data) => {
		KinkyDungeonState = "Menu";
		KDLose = true;
		MiniGameKinkyDungeonLevel = -1;
		return "";
	},
	"orb": (data) => {
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
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonGoddessCollar").replace("TYPE", TextGet("KinkyDungeonShrine" + data.shrine)).replace("RESTRAINT", TextGet("Restraint" + tag)), KDBaseLightBlue, 2);
				}
			}

			KinkyDungeonChangeRep(data.shrine, edata.rep);

			KDSendStatus('goddess', data.shrine, 'takeOrb');
			if (KinkyDungeonStatsChoice.get("randomMode")) {
				let tt = KinkyDungeonTilesGet(data.x + "," + data.y);
				let spell = ((tt && !KDHasSpell(tt.Spell)) ? KinkyDungeonFindSpell(tt.Spell) : null) || KDGetRandomSpell();

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
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonOrbSpell").replace("SPELL", TextGet("KinkyDungeonSpell" + spell.name)), KDBaseLightBlue, 2);
				} else {
					KinkyDungeonSpellPoints += data.Amount;
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonObjectOrbBreak"), KDBaseLightBlue, 2);


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
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = "";
			KDModalArea = false;
		}
		return "";
	},
	"perkorb": (data) => {
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
		return "";
	},
	"heart": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		let tile = KinkyDungeonTilesGet(data.targetTile);
		if (tile) {
			let amnt = (data.amount || 3);
			if (data.type == "AP") {
				if (KinkyDungeonStatDistractionMax < KDMaxStat) //for (let i = 0; i < amnt; i++) KDPushSpell(KinkyDungeonFindSpell("APUp1"));
					KDGameData.StatMaxBonus[data.type] += amnt;
				KinkyDungeonUpdateStats(0);
			}else if (data.type == "SP") {
				if (KinkyDungeonStatStaminaMax < KDMaxStat)// for (let i = 0; i < amnt; i++) KDPushSpell(KinkyDungeonFindSpell("SPUp1"));
					KDGameData.StatMaxBonus[data.type] += amnt;
				KinkyDungeonUpdateStats(0);
			} else if (data.type == "MP") {
				if (KinkyDungeonStatManaMax < KDMaxStat)// for (let i = 0; i < amnt; i++) KDPushSpell(KinkyDungeonFindSpell("MPUp1"));
					KDGameData.StatMaxBonus[data.type] += amnt;
				KinkyDungeonUpdateStats(0);
			} else if (data.type == "WP") {
				if (KinkyDungeonStatWillMax < KDMaxStat) //for (let i = 0; i < amnt; i++) KDPushSpell(KinkyDungeonFindSpell("WPUp1"));
					KDGameData.StatMaxBonus[data.type] += amnt;
				KinkyDungeonUpdateStats(0);
			}
			KDGameData.CollectedHearts = (KDGameData.CollectedHearts || 0) + 1;

			// Send the message and advance time
			KinkyDungeonAdvanceTime(1);
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonTabletReadSuccess"), KDBaseLightGreen, 1);

			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = "";
			KDModalArea = false;

			// Remove the tile
			let x = parseInt(data.targetTile.split(',')[0]);
			let y = parseInt(data.targetTile.split(',')[1]);
			if (x && y) {
				KinkyDungeonMapSet(x, y, 'm');
				KDClearTile(data.targetTile);
			}
		}
		return "";
	},
	"champion": (data) => {
		KDGameData.Champion = data.rep;
		KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonBecomeChampion").replace("GODDESS", TextGet("KinkyDungeonShrine" + data.rep)), "yellow", 1);
		KDSendStatus('goddess', data.rep, 'helpChampion');
		return "";
	},
	"aid": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		KinkyDungeonChangeRep(data.rep, -KinkyDungeonAidManaCost(data.rep, data.value));
		KDChangeMana("player", "aid", "pray", KinkyDungeonAidManaAmount(data.rep, data.value));
		KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonAidManaMe"), KDBasePurple, 2);
		KDSendStatus('goddess', data.rep, 'helpMana');
		return "";
	},
	"rescue": (data) => {
		KinkyDungeonRescued[data.rep] = true;

		if (KDRandom() < 0.5 + data.value/100) {
			KDDelayedActionPrune(["Action", "World"]);
			let tiles = KinkyDungeonRescueTiles();
			if (tiles.length > 0) {
				KDSendStatus('goddess', data.rep, 'helpRescue');
				KinkyDungeonChangeRep(data.rep, -10);
				let tile = tiles[Math.floor(tiles.length * KDRandom())];
				if (tile) {
					KinkyDungeonMapSet(tile.x, tile.y, "$");
					KinkyDungeonTilesSet(tile.x + "," + tile.y, {Type: "Angel", Light: 5, lightColor: 0xfffafa});
					KDStartDialog("AngelHelp","Angel", true, "");
				}
				KDGameData.RescueFlag = true;
			}
			return "Rescue";
		} else {
			KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNoRescue"), KDBasePurple, 10);
			KDSendStatus('goddess', data.rep, 'helpNoRescue');
			return "FailRescue";
		}
	},
	"penance": (data) => {
		KDGameData.KinkyDungeonPenance = true;
		KDGameData.KDPenanceMode = "";
		KDGameData.KDPenanceStage = 0;
		KDGameData.KDPenanceStageEnd = 0;
		KDGameData.AngelCurrentRep = data.rep;
		KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonPenanceHappen"), KDBasePurple, 4);
		KDGameData.KinkyDungeonPenanceCostCurrent = KinkyDungeonPenanceCosts[data.rep] ? KinkyDungeonPenanceCosts[data.rep] : KinkyDungeonPenanceCostDefault;
		if (KinkyDungeonGold >= KDGameData.KinkyDungeonPenanceCostCurrent) {
			if (KinkyDungeonPenanceCosts[data.rep]) KinkyDungeonPenanceCosts[data.rep] += KinkyDungeonPenanceCostGrowth;
			else KinkyDungeonPenanceCosts[data.rep] = KinkyDungeonPenanceCostDefault + KinkyDungeonPenanceCostGrowth;
		}
		KDSendStatus('goddess', data.rep, 'helpPenance');
		return "";
	},
	"spellChoice": (data) => {
		KDDelayedActionPrune(["Action", "SwitchSpell"]);
		KinkyDungeonEvasionPityModifier = 0.0;
		KinkyDungeonSpellChoices[data.I] = data.CurrentSpell;
		KinkyDungeonWeaponChoices[data.I] = "";
		KinkyDungeonConsumableChoices[data.I] = "";
		KinkyDungeonArmorChoices[data.I] = "";
		KinkyDungeonSpellChoicesToggle[data.I] = !KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]].defaultOff;
		if (KinkyDungeonSpellChoicesToggle[data.I] && KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]].costOnToggle) {
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]]))) {
				KDChangeMana(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]].name, "spell", "cast", -KinkyDungeonGetManaCost(KinkyDungeonSpells[KinkyDungeonSpellChoices[data.I]]));
			} else KinkyDungeonSpellChoicesToggle[data.I] = false;
		}
		if (KinkyDungeonStatsChoice.has("Disorganized")) {
			KinkyDungeonAdvanceTime(1);
			KDGameData.SlowMoveTurns = 2;
		} else if (!KinkyDungeonStatsChoice.has("QuickDraw"))
			KinkyDungeonAdvanceTime(1);
			return "";
		},
	"itemChoice": (data) => {
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
		} else if (KDRest(data.name)) {
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
		return "";
	},
	"spellRemove": (data) => {
		KinkyDungeonEvasionPityModifier = 0.0;
		KinkyDungeonSpellChoices[data.I] = -1;
		KinkyDungeonWeaponChoices[data.I] = "";
		KinkyDungeonConsumableChoices[data.I] = "";
		KinkyDungeonArmorChoices[data.I] = "";
		KinkyDungeonSpellChoicesToggle[data.I] = true;
		return "";
	},
	"spellCastFromBook": (data) => {
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
			KinkyDungeonSendActionMessage(5, TextGet("KinkyDungeonSpellTarget" + spell.name).replace("SpellArea", "" + Math.floor(spell.aoe)), KDBaseWhite, 0.1, true);
		}
		return "";
	},
	"focusControlToggle": (data) => {
		KDInputFocusControlToggle(data.key, data.value);
		return "";
	},
	"upcast": (data) => {
		KDDelayedActionPrune(["Action", "Cast"]);
		KDEmpower(data, KinkyDungeonPlayerEntity);
		return "";
	},
	"upcastcancel": (data) => {
		KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "upcast", 1);
		return "";
	},
	"select": (data) => {
		if (data.enemy && KDAllied(data.enemy)) {
			if (data.enemy.buffs?.AllySelect?.duration > 0) KinkyDungeonExpireBuff(data.enemy, "AllySelect")
			else KinkyDungeonApplyBuffToEntity(data.enemy, {
				id: "AllySelect",
				aura: KDBaseWhite,
				auraSprite: "Select",
				duration: 9999, infinite: true,
				type: "Sel",
				power: 1,
			});
		}
		return "";
	},
	"selectOnly": (data) => {
		for (let e of KDMapData.Entities) {
			if (e.id != data.enemy?.id && e.buffs?.AllySelect) KinkyDungeonExpireBuff(e, "AllySelect")
			else if (e.id == data.enemy?.id) KinkyDungeonApplyBuffToEntity(e, {
				id: "AllySelect",
				aura: KDBaseWhite,
				auraSprite: "Select",
				duration: 9999, infinite: true,
				type: "Sel",
				power: 1,
			});
		}
		KinkyDungeonSendTextMessage(10, TextGet("KDOrderSelect").replace("ENMY", TextGet("Name" + data.enemy.Enemy.name)), KDBaseWhite, 1);

		return "";
	},
	"cancelParty": (data) => {
		if (data.enemy) {
			let enemy = KinkyDungeonFindID(data.enemy.id);
			if (!enemy && KDGameData.Party) enemy = KDGameData.Party.find((entity) => {return entity.id == data.enemy.id;});
			if (enemy) {
				if (enemy.buffs?.AllySelect) KinkyDungeonExpireBuff(enemy, "AllySelect")
				KinkyDungeonSetEnemyFlag(enemy, "NoFollow", -1);
				KDRemoveFromParty(enemy, false);
				KinkyDungeonSendTextMessage(10, TextGet("KDOrderRemove").replace("ENMY", TextGet("Name" + enemy.Enemy.name)), KDBaseWhite, 1);

			}
		}
		return "";
	},
	"onMe": (data) => {
		if (data.enemy && data.player) {
			let enemy = KinkyDungeonFindID(data.enemy.id);
			enemy.gx = data.player.x;
			enemy.gy = data.player.y;
			if (KDEnemyHasFlag(data.enemy, "NoFollow")) {
				KinkyDungeonSetEnemyFlag(enemy, "NoFollow", 0);
				KinkyDungeonSetEnemyFlag(enemy, "Defensive", -1);
				KinkyDungeonSendTextMessage(10, TextGet("KDOrderOnMe").replace("ENMY", TextGet("Name" + enemy.Enemy.name)), KDBaseWhite, 1);
			} else {
				KinkyDungeonSetEnemyFlag(enemy, "NoFollow", -1);
				KinkyDungeonSetEnemyFlag(enemy, "Defensive", 0);
				KinkyDungeonSendTextMessage(10, TextGet("KDOrderDisperse").replace("ENMY", TextGet("Name" + enemy.Enemy.name)), KDBaseWhite, 1);
			}

		}
		return "";
	},
	"spellLearn": (data) => {
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
					if (KDSoundEnabled() && KinkyDungeonIsPlayer()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
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
			} else if (KinkyDungeonIsPlayer()) KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSpellsNotEnoughPoints"), "#e7cf1a", 1);
		} else if (KinkyDungeonIsPlayer()) KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSpellsNotPrerequisite").replace("REQUIREDSPELL", TextGet("KinkyDungeonSpell" + spell.prerequisite)), "#ff4444", 1);
		
		return "";
	},


	"ghostNegotiate": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		if (data.action == "negotiate") {
			let tile = KinkyDungeonTilesGet(data.targetTile);
			if (tile && tile.Type == "Ghost") {
				
				let x = parseInt(data.targetTile.split(',')[0]);
				let y = parseInt(data.targetTile.split(',')[1]);
				if (x && y) {
					KDGameData.InteractTargetX = x;
					KDGameData.InteractTargetY = y;
					KDStartDialog("GhostNegotiate", "Ghost", true, tile.personality || "", undefined);
				}
			}
		}
		return "";
	},
	"tabletInteract": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		if (data.action == "read") {
			let tile = KinkyDungeonTilesGet(data.targetTile);
			if (tile && tile.Type == "Tablet") {
				let full = false;
				// Perform the tablet buff action
				if (tile.Name == "Will") {
					// Restoration shrine gets a regeneration buff
					let multi = 1.0;
					multi = Math.max(KinkyDungeonStatStaminaMax / KDMaxStatStart);
					let Manamulti = 1.0;
					Manamulti = Math.max(KinkyDungeonStatManaMax / KDMaxStatStart);
					let Willmulti = 1.0;
					Willmulti = Math.max(KinkyDungeonStatWillMax / KDMaxStatStart);

					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletWill", type: "restore_mp", power: Manamulti*0.5, duration: 20});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletWill2", type: "restore_sp", power: multi*0.5, duration: 20});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletWill3", type: "restore_wp", power: Willmulti*0.15, duration: 10});
				} else if (tile.Name == "Determination") {
					if (KinkyDungeonStatWill >= KinkyDungeonStatWillMax) {
						full = true;
					} else {
						let Willmulti = 1.0;
						Willmulti = Math.max(KinkyDungeonStatWillMax / KDMaxStatStart);
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "TabletDetermination", type: "restore_wp", power: Willmulti*0.30, duration: 10});
					}
				} else {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
						{id: "Tablet" + tile.Name, aura: KDGoddessColor(tile.Name), type: "event", duration: 9999, infinite: true, power: 2, player: true, enemies: false, maxCount: 3, tags: ["cast_" + tile.Name.toLowerCase(), "trigger_" + tile.Name.toLowerCase()], events: [
							{trigger: "calcMana", type: "Tablet", requiredTag: tile.Name.toLowerCase(), power: 0.5},
						]}
					);
				}

				if (full) {
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonTabletReadFull"), KDBaseLightGreen, 1);
				} else {
					// Send the message and advance time
					KinkyDungeonAdvanceTime(1);
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonTabletReadSuccess"), KDBaseLightGreen, 1);

					// Remove the tile
					let x = parseInt(data.targetTile.split(',')[0]);
					let y = parseInt(data.targetTile.split(',')[1]);
					if (x && y) {
						KinkyDungeonMapSet(x, y, 'm');
						KDClearTile(data.targetTile);
					}
				}

			}
		}
		return "";
	},
	"foodInteract": (data) => {
		KDDelayedActionPrune(["Action", "World"]);
		if (data.action == "eat") {
			let tile = KinkyDungeonTilesGet(data.targetTile);
			if (tile && tile.Type == "Food") {
				let gagged = KinkyDungeonGagTotal();
				if (gagged > 0) {
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonFoodEatenGag"), KDBaseOrange, 1);
				} else {
					// Perform the deed
					let Willmulti = Math.max(KinkyDungeonStatWillMax / KDMaxStatStart);
					let amount = tile.Amount ? tile.Amount : 1.0;
					KDChangeWill(tile.Food, "food", "consumable", amount * Willmulti);
					if (KDFood[tile.Food]?.OnEat) {
						let x = parseInt(data.targetTile.split(',')[0]);
						let y = parseInt(data.targetTile.split(',')[1]);
						if (x && y) {
							KDOnEatScripts[KDFood[tile.Food].OnEat](x, y, tile, KDFood[tile.Food]);
						}
					}

					// Send the message and advance time
					KinkyDungeonAdvanceTime(1);
					KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonFoodEaten"), KDBaseLightGreen, 1);

					// Remove the food
					tile.Food = "Plate";
				}
			}
		}
		return "";
	},
	"chargerInteract": (data) => {
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
					KDClearTile(data.targetTile);
					KinkyDungeonMapSet(x, y, '-');
				}
				
				return "Pass";
			} else {
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonChargerChargeFailure"), "orange", 1);
				return "Fail";
			}
		} else if (data.action == "place") {
			let tile = KinkyDungeonTilesGet(data.targetTile);
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
			let tile = KinkyDungeonTilesGet(data.targetTile);
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
				if (KDGameData["titledata"] == undefined) { KDGameData["titledata"] = {}}
				// @ts-ignore
                KDGameData.titledata.lampstolen = true
			} else if (tile && tile.NoRemove) {
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonChargerNoRemove"), "yellow", 1);
			}
		}
		return "";
	},
	"dialogue": (data) => {
		KDDoDialogue(data);
		return "";
	},
	"recycleBuild": (data) => {
		if (KDHasRecyclerResources(KDMapToRecycleOutputs(data.selectedItem.recyclecost))) {
			KDChangeRecyclerResources(KDMapToRecycleOutputs(data.selectedItem.recyclecost), -1);
			KinkyDungeonItemEvent({
				name: data.selectedItem.item,
				amount: data.selectedItem.count || 1,
			});
		}
		return "";
	},
	"recycle": (data) => {
		// TODO
		return "";
	},
	"tightenNPCRestraint": (data) => {
		KDNPCRefreshBondage(data.npc, data.player, false, false);
		return "";
	},
	"changeAutorelease": (data) => {
		if (!KDGameData.AutoRelease) {
			KDGameData.AutoRelease = {
				Escaped: false,
				NonNotable: false,
			};
		}
		KDGameData.AutoRelease[data.type] = !KDGameData.AutoRelease[data.type];
		return "";
	},
	"talk": (data) => {
		let Enemy = KinkyDungeonFindID(data.id);
		if (Enemy) {
			if (data.moveTo) {
				if (KDistChebyshev(Enemy.x - KDPlayer().x, Enemy.y - KDPlayer().y) > 1.5) {
					let turns = KDFastMoveTo(Enemy.x, Enemy.y);
					if (turns) {
						KinkyDungeonSetEnemyFlag(Enemy, "forcetalk", turns + 5);
					}
					return "move";
				}
			}
			KDStartDialog(data.d,
				Enemy.Enemy.name,
				true,
				Enemy.personality, Enemy);
		}

		return "";
	},
	"releaseNPC": (data) => {
		if (data?.selection) {
			for (let v of Object.keys(data.selection)) {
				KDReleaseNPC(parseInt(v), data.player);
				KDClipCollectionIndex = true;
			}
		}
		KDSortCollection();
		return "";
	},
	"removeGuest": (data) => {
		if (data?.selection) {
			for (let v of Object.keys(data.selection)) {
				if (KDCanRemoveGuest(parseInt(v))) {
					delete KDGameData.Collection[parseInt(v) + ""];
				KDClipCollectionIndex = true;
				}
			}
		}
		KDSortCollection();
		return "";
	},
	"ransomNPC": (data) => {
		if (data?.selection) {
			for (let v of Object.keys(data.selection)) {
				if (KDCanRansom(parseInt(v))) {
					KDFreeNPCRestraints(parseInt(v), data.player);
					KDClipCollectionIndex = true;


					let type = KinkyDungeonGetEnemyByName(KDGameData.Collection[v + ""].type);
					let rep = -2*KDGetEnemyTypeRep(type, KDGameData.Collection[v + ""].Faction);
					KinkyDungeonChangeFactionRep(KDGameData.Collection[v + ""].Faction, rep);
					KinkyDungeonAddGold(KDRansomValue(parseInt(v)));
					DisposeEntity(parseInt(v), false);
					let e = KinkyDungeonFindID(parseInt(v));
					if (e)
						KDRemoveEntity(e, false, false, true);
					delete KDCollectionReleaseSelection[v];
					// TODO make it affect friends/enemies of the faction
					// TODO add everything into one
				}
			}
		}
		KDSortCollection();
		return "";
	},
	"freeNPCRestraint": (data) => {
		KDFreeNPCRestraints(data.npc, data.player);
		if (KDNPCChar.get(data.npc))
			KDRefreshCharacter.set(KDNPCChar.get(data.npc), true);
		return "";
	},
	"autoprune": (data) => {
		KDDelayedActionPrune(["Auto"]);
		return "";
	},
	"addNPCRestraint": (data) => {
		/**
			slot: slot.id,
			id: inv.item.id,
			restraint: inv.item.name,
			lock: "White",
			npc: number
		 */


		let res = KDInputSetNPCRestraint(data);

		let enemy = KDGetGlobalEntity(data.npc);

		let packed = enemy ? KDUnPackEnemy(enemy) : false;
		if (res && enemy && (!data.restraint || enemy.boundLevel > 0))
			KinkyDungeonSendTextMessage(10,
				TextGet("KDTieUpEnemy" + (!data.restraint ? "Negative" : ""))
					.replace("RSTR", KDGetItemNameString(data.restraint))//TextGet("Restraint" + KDRestraint(item)?.name))
					.replace("ENNME", TextGet("Name" + enemy?.Enemy.name))
					.replace("AMNT", "" + Math.round(100 * enemy?.boundLevel / enemy?.Enemy.maxhp)),
				KDBaseWhite, 1);

		if (data.time && res) {
			KinkyDungeonAdvanceTime(1, true);
		}
		if (res && data.npc > 0) {
			KDSetCollFlag(data.npc, "restrained", 1);
			KDSetCollFlag(data.npc, "restrained_recently", 24);
		}
		if (KDNPCChar.get(data.npc))
			KDRefreshCharacter.set(KDNPCChar.get(data.npc), true);

		if (packed) KDPackEnemy(enemy);
		if (!res) return "Fail";
		if (data.quantityItem && data.quantityCount) {
			let item = KinkyDungeonInventoryGetSafe(data.quantityItem.name);
			if (item) item.quantity = Math.max(0, item.quantity - data.quantityCount);
		}
		return "";
	},
};
/**
 * Delegate to KDProcessInputs
 */
function KDProcessInput(type: string, data: any): string {
	KDUpdateEnemyCache = true;
	let res = "";
	
	if (KDInputTypes[type]) {
		res = KDInputTypes[type](data);
	}

	if (data.GameData) {
		Object.assign(KDGameData, data.GameData);
	}
	return res;
}

function KDSendInput(type: string, data: any, _frame?: boolean, noUpdate?: boolean, process = true): string {

	if (!noUpdate) {
		KDGameData.OrigEnergyLevel = KDGameData.AncientEnergyLevel;
		KDGameData.LastSP = KinkyDungeonStatStamina;
		KDGameData.LastMP = KinkyDungeonStatMana;
		KDGameData.LastAP = KinkyDungeonStatDistraction;
		KDGameData.LastWP = KinkyDungeonStatWill;
	}

	KinkyDungeonInputQueue.push({type: type, data: data});
	if (process)
		return KDProcessInputs(true);
	else return "";
}

/**
 * Handles inputs once per frame
 */
function KDProcessInputs(ReturnResult?: boolean): string {
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

function KDInteract(x: number, y: number, dist?: number): boolean {
	if (dist == undefined) dist = KDistChebyshev(x - KDPlayer().x, y - KDPlayer().y);
	KinkyDungeonSendEvent("beforeInteract", {x:x, y: y});
	if (dist < 1.5 && !KinkyDungeonEntityAt(x, y, false, undefined, undefined, false))
		KinkyDungeonItemCheck(x, y, MiniGameKinkyDungeonLevel, true);
	KDInteracting = false;
	let tile = KinkyDungeonTilesGet(x + ',' + y);
	if (tile?.Type) {
		if (KDObjectInteract[tile.Type]) {
			let ret = KDObjectInteract[tile.Type](x, y, dist);
			KinkyDungeonSendEvent("afterInteract", {x:x, y: y, type: "object", objtype: tile.Type});
			return ret;
		} else if (KDObjectClick[tile.Type] && dist < 1.5) {
			let ret = KDObjectClick[tile.Type](x, y);
			KinkyDungeonSendEvent("afterInteract", {x:x, y: y, type: "objectclick", objtype: tile.Type});
			return ret;
		}
	}
	let tiletype = KinkyDungeonMapGet(x, y);
	if (KDTileInteract[tiletype]) {
		let ret = KDTileInteract[tiletype](x, y, dist);
		KinkyDungeonSendEvent("afterInteract", {x:x, y: y, type: "tile", objtype: tiletype});
		return ret;

	}
	let Enemy = KinkyDungeonEntityAt(x, y, false, undefined, undefined, false);
	if (Enemy && dist < 1.5) {
		if ((KDIsImprisoned(Enemy)
			|| ((!KinkyDungeonAggressive(Enemy) || KDAllied(Enemy))
			&& !(Enemy.playWithPlayer && KDCanDom(Enemy))))) {
			let d = Enemy.Enemy.specialdialogue ? Enemy.Enemy.specialdialogue : "GenericAlly";
			if ((!Enemy.specialdialogue && !Enemy.prisondialogue) && KDIsImprisoned(Enemy)) d = "PrisonerJailBug";
			else if (Enemy.prisondialogue && KDIsImprisoned(Enemy)) d = Enemy.prisondialogue; // Special dialogue override
			else if (Enemy.specialdialogue) d = Enemy.specialdialogue; // Special dialogue override
			if (d || ((!Enemy.lifetime || Enemy.lifetime > 9000) && !Enemy.Enemy.tags.notalk)) { // KDAllied(Enemy)

				KDStartDialog(d, Enemy.Enemy.name, true, Enemy.personality, Enemy);
				KinkyDungeonSendEvent("afterInteract", {x:x, y: y, type: "talk", entity: Enemy});
				return true;
			}
		}
	}
	if (tile?.Type && KDInteractableTiles.includes(tiletype)) {
		if (dist < 1.5) {
			KinkyDungeonTargetTile = tile;
			KinkyDungeonTargetTileLocation = x + "," + y;
			KinkyDungeonTargetTileMsg();
		} else {
			KinkyDungeonSendActionMessage(10, TextGet("KDMoveCloser"), KDBaseWhite, 2, true);
		}
	}
	KinkyDungeonSendEvent("afterInteractFail", {x:x, y: y});
	return false;
}
