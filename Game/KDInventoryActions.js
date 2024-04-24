"use strict";

let KDMarketRateDecay = 0.95;

/**
 * @type {Record<string, KDInventoryActionDef>}
 */
let KDInventoryAction = {
	"Equip": {
		text: (player, item) => {
			return TextGet("KDInventoryAction" + (KinkyDungeonPlayerWeapon != item.name ? "Equip" : "Unequip"));
		},
		icon: (player, item) => {
			if (item.type == LooseRestraint) {
				let newItem = null;
				let currentItem = null;
				let linkable = null;

				newItem = KDRestraint(item);
				if (newItem) {
					currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
					if (KDDebugLink) {
						linkable = KDCanAddRestraint(KDRestraint(newItem), true, "", false, currentItem, true, true);
					} else {
						if (!currentItem) return "InventoryAction/Equip";
						linkable = (KinkyDungeonLinkableAndStricter(KDRestraint(currentItem), newItem, currentItem) &&
							((newItem.linkCategory && KDLinkCategorySize(currentItem, newItem.linkCategory) + KDLinkSize(newItem) <= 1.0)
							|| (!newItem.linkCategory && !KDDynamicLinkList(currentItem, true).some((inv) => {return newItem.name == inv.name;}))));
					}
					if (linkable) {
						return "InventoryAction/Equip";
					} else return "InventoryAction/Unequip";
				}
			}
			return KinkyDungeonPlayerWeapon != item.name ? "InventoryAction/Equip" : "InventoryAction/Unequip";
		},
		valid: (player, item) => {
			if ((item?.type == Restraint)) return false;
			if (item.type == LooseRestraint) {
				let newItem = null;
				let currentItem = null;
				let linkable = null;

				newItem = KDRestraint(item);
				if (newItem) {

					if (newItem.requireSingleTagToEquip && !newItem.requireSingleTagToEquip.some((tag) => {return KinkyDungeonPlayerTags.get(tag);})) return false;
					if (newItem.requireAllTagsToEquip && newItem.requireAllTagsToEquip.some((tag) => {return !KinkyDungeonPlayerTags.get(tag);})) return false;

					currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
					if (KDDebugLink) {
						linkable = KDCanAddRestraint(KDRestraint(newItem), true, "", false, currentItem, true, true);
					} else {
						if (!currentItem) return true;
						linkable = (KinkyDungeonLinkableAndStricter(KDRestraint(currentItem), newItem, currentItem) &&
							((newItem.linkCategory && KDLinkCategorySize(currentItem, newItem.linkCategory) + KDLinkSize(newItem) <= 1.0)
							|| (!newItem.linkCategory && !KDDynamicLinkList(currentItem, true).some((inv) => {return newItem.name == inv.name;}))));
					}
					if (linkable) {
						return true;
					} else return false;
				}
				return true;
			}
			return item.type == Outfit || item.type == Weapon;
		},
		click: (player, item) => {
			if (item.type == LooseRestraint) {
				let equipped = false;
				let newItem = null;
				let currentItem = null;
				let linkable = null;

				newItem = KDRestraint(item);
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
						if (!currentItem || linkable) {
							equipped = false;
						} else equipped = true;
					}
				}
				if (!equipped && newItem) {
					if (KDGameData.InventoryAction && !KDConfirmOverInventoryAction) {
						KDConfirmOverInventoryAction = true;
						return true;
					} else if (KDSendInput("equip", {name: item.name,
						faction: item.faction,
						inventoryVariant: item.name != newItem.name ?
							item.name : undefined,
						group: newItem.Group, curse: item.curse, currentItem: currentItem ? currentItem.name : undefined, events: Object.assign([], item.events)})) return true;

				}
			} else if (item.type == Weapon) {
				let weapon = item.name;
				let equipped = item.name == KinkyDungeonPlayerWeapon;
				if (equipped) {
					KDSendInput("unequipweapon", {weapon: weapon});
				} else {
					KDSendInput("switchWeapon", {weapon: weapon});
				}
			} else if (item.type == Outfit) {
				let outfit = item.name;
				let toWear = KinkyDungeonGetOutfit(outfit);
				if (toWear) {
					let dress = toWear.dress;
					if (dress == "JailUniform" && KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)])
						dress = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)].defeat_outfit;
					KDSendInput("dress", {dress: dress, outfit: outfit});
				}
			}
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"Drop": {
		icon: (player, item) => {
			return "InventoryAction/Drop";
		},
		valid: (player, item) => {
			if ((item?.type == Restraint)) return false;
			return true;
		},
		click: (player, item) => {
			KDSendInput("drop", {item: item.name});
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"Hotbar": {
		icon: (player, item) => {
			return "InventoryAction/Hotbar";
		},
		valid: (player, item) => {
			return true;
		},
		click: (player, item) => {
			KDConfigHotbar = !KDConfigHotbar;
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"Remove": {
		icon: (player, item) => {
			return "InventoryAction/Remove";
		},
		show: (player, item) => {
			return !KDGetCurse(item) && !item.lock;
		},
		valid: (player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return !sg.blocked;
		},
		click: (player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			if (itemIndex >= 0 && !sg.blocked) {
				KDSendInput("struggle", {group: sg.group, index: itemIndex, type: "Remove"});
			}
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"Unlock": {
		icon: (player, item) => {
			return "Locks/" + item.lock;
		},
		show: (player, item) => {
			return !KDGetCurse(item) && !item.lock == false;
		},
		valid: (player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return !sg.blocked;
		},
		click: (player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			if (itemIndex >= 0 && !sg.blocked) {
				KDSendInput("struggle", {group: sg.group, index: itemIndex, type: "Unlock"});
			}
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"Lock": {
		icon: (player, item) => {
			return "InventoryAction/Lock";
		},
		show: (player, item) => {
			return !KDGetCurse(item) && !item.lock && KinkyDungeonIsLockable(KDRestraint(item));
		},
		valid: (player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return !sg.blocked;
		},
		click: (player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			if (itemIndex >= 0 && !sg.blocked) {
				KDSendInput("lock", {group: sg.group, index: itemIndex, type: "White"});
			}
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"Pick": {
		icon: (player, item) => {
			return "InventoryAction/Pick";
		},
		show: (player, item) => {
			return !KDGetCurse(item) && !item.lock == false;
		},
		valid: (player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return KinkyDungeonLockpicks > 0 && !sg.blocked;
		},
		click: (player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			if (itemIndex >= 0 && !sg.blocked) {
				KDSendInput("struggle", {group: sg.group, index: itemIndex, type: "Unlock"});
			}
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},

	"CurseInfo": {
		icon: (player, item) => {
			return "InventoryAction/CurseInfo";
		},
		show: (player, item) => {
			return !(KDGetCurse(item) || item.lock);
		},
		valid: (player, item) => {
			return true;
		},
		click: (player, item) => {
			KinkyDungeonCurseInfo(item, (KDGetCurse(item)));
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"CurseUnlock": {
		icon: (player, item) => {
			return "InventoryAction/CurseUnlock";
		},
		show: (player, item) => {
			return !KDGetCurse(item) == true;
		},
		valid: (player, item) => {
			return KinkyDungeonCurseAvailable(item, (KDGetCurse(item)));
		},
		click: (player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			if (itemIndex >= 0 && KinkyDungeonCurseAvailable(item, (KDGetCurse(item)))) {
				let r = KDRestraint(item);
				let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
				KDSendInput("curseUnlock", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], curse: (KDGetCurse(item))});
			}
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"Struggle": {
		icon: (player, item) => {
			return "InventoryAction/Struggle";
		},
		show: (player, item) => {
			return !KDGetCurse(item) && !item.lock;
		},
		valid: (player, item) => {
			return true;
		},
		click: (player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			if (itemIndex >= 0) {
				let r = KDRestraint(item);
				let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
				KDSendInput(KDGetCurse(item) ? "struggleCurse" : "struggle", {group: sg.group, index: itemIndex, type: "Struggle", curse: KDGetCurse(item)});
			}
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"Cut": {
		icon: (player, item) => {
			return (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name && !KinkyDungeonPlayerDamage.unarmed) ? "Items/" + KinkyDungeonPlayerWeapon :"InventoryAction/Cut";
		},
		show: (player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return !KDGetCurse(item) && !sg.noCut;
		},
		valid: (player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return !sg.blocked;
		},
		click: (player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			if (itemIndex >= 0 && !sg.blocked && !sg.noCut) {
				KDSendInput("struggle", {group: sg.group, index: itemIndex, type: "Cut"});
			}
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},

	"Favorite": {
		text: (player, item) => {
			return TextGet("KDInventoryAction" + (!(KDGameData.ItemPriority[item.name|| item.name] > 9) ? "Favorite" : "Unfavorite"));
		},
		icon: (player, item) => {
			return !(KDGameData.ItemPriority[item.name|| item.name] > 9) ? "InventoryAction/Favorite" : "InventoryAction/Unfavorite";
		},
		valid: (player, item) => {
			return true;
		},
		click: (player, item) => {
			if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
			if (!(KDGameData.ItemPriority[item.name|| item.name] > 9)) KDGameData.ItemPriority[item.name|| item.name] = 10;
			else KDGameData.ItemPriority[item.name|| item.name] = 0;
			KDSortInventory(KinkyDungeonPlayerEntity);


			let filteredInventory = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter, undefined, undefined, undefined, undefined, KDInvFilter);
			let index = filteredInventory.findIndex((element) => {return element.item.name == item.name;});
			if (index >= 0) {
				KinkyDungeonCurrentPageInventory = index;
			}

		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"Use": {
		icon: (player, item) => {
			return "InventoryAction/Use";
		},
		valid: (player, item) => {
			return item.quantity > 0;
		},
		click: (player, item) => {
			KDSendInput("consumable", {item: item.name, quantity: 1});
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},

	"QuickSlot1": {
		icon: (player, item) => {
			return KDGameData.PreviousWeapon[0] ? "Items/" + (KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[0]]?.template || KDGameData.PreviousWeapon[0]) : "InventoryAction/Quickslot";
		},
		valid: (player, item) => {
			return true;//KDGameData.PreviousWeapon[0] != item.name;
		},
		label: (player, item) => {
			if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[0]) {
				return TextGet("KDLocked");
			}
			return "";
		},
		click: (player, item) => {
			KDGameData.PreviousWeapon[0] = item.name;
			if (!KDGameData.PreviousWeaponLock) {
				KDGameData.PreviousWeaponLock = [];
				for (let i = 0; i < KDMaxPreviousWeapon; i++) {
					KDGameData.PreviousWeaponLock.push(false);
				}
			}
			KDGameData.PreviousWeaponLock[0] = !KDGameData.PreviousWeaponLock[0];
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"QuickSlot2": {
		icon: (player, item) => {
			return KDGameData.PreviousWeapon[1] ? "Items/" + (KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[1]]?.template || KDGameData.PreviousWeapon[1]) : "InventoryAction/Quickslot";
		},
		valid: (player, item) => {
			return true;//KDGameData.PreviousWeapon[0] != item.name;
		},
		label: (player, item) => {
			if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[1]) {
				return TextGet("KDLocked");
			}
			return "";
		},
		click: (player, item) => {
			KDGameData.PreviousWeapon[1] = item.name;
			if (!KDGameData.PreviousWeaponLock) {
				KDGameData.PreviousWeaponLock = [];
				for (let i = 0; i < KDMaxPreviousWeapon; i++) {
					KDGameData.PreviousWeaponLock.push(false);
				}
			}
			KDGameData.PreviousWeaponLock[1] = !KDGameData.PreviousWeaponLock[1];
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"QuickSlot3": {
		icon: (player, item) => {
			return KDGameData.PreviousWeapon[2] ? "Items/" + (KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[2]]?.template || KDGameData.PreviousWeapon[2]) : "InventoryAction/Quickslot";
		},
		valid: (player, item) => {
			return true;//KDGameData.PreviousWeapon[0] != item.name;
		},
		label: (player, item) => {
			if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[2]) {
				return TextGet("KDLocked");
			}
			return "";
		},
		click: (player, item) => {
			KDGameData.PreviousWeapon[2] = item.name;
			if (!KDGameData.PreviousWeaponLock) {
				KDGameData.PreviousWeaponLock = [];
				for (let i = 0; i < KDMaxPreviousWeapon; i++) {
					KDGameData.PreviousWeaponLock.push(false);
				}
			}
			KDGameData.PreviousWeaponLock[2] = !KDGameData.PreviousWeaponLock[2];
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},
	"QuickSlot4": {
		icon: (player, item) => {
			return KDGameData.PreviousWeapon[3] ? "Items/" + (KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[3]]?.template || KDGameData.PreviousWeapon[3]) : "InventoryAction/Quickslot";
		},
		valid: (player, item) => {
			return true;//KDGameData.PreviousWeapon[0] != item.name;
		},
		label: (player, item) => {
			if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[3]) {
				return TextGet("KDLocked");
			}
			return "";
		},
		click: (player, item) => {
			KDGameData.PreviousWeapon[3] = item.name;
			if (!KDGameData.PreviousWeaponLock) {
				KDGameData.PreviousWeaponLock = [];
				for (let i = 0; i < KDMaxPreviousWeapon; i++) {
					KDGameData.PreviousWeaponLock.push(false);
				}
			}
			KDGameData.PreviousWeaponLock[3] = !KDGameData.PreviousWeaponLock[3];
		},
		cancel: (player, delta) => {
			return false; // NA for default actions
		},
	},


	"RemoveCurseOrHex": {
		icon: (player, item) => {
			return "InventoryAction/Macaron";
		},
		valid: (player, item) => {
			if (!(item?.type == Restraint)) return false;
			return KDHasRemovableCurse(item, KDGameData.CurseLevel) || KDHasRemovableHex(item, KDGameData.CurseLevel);
		},
		/** Happens when you click the button */
		click: (player, item) => {
			if (KDHasRemovableCurse(item, KDGameData.CurseLevel) || KDHasRemovableHex(item, KDGameData.CurseLevel)) {
				if (KDHasRemovableCurse(item, KDGameData.CurseLevel)) {
					if (item.curse && KDCurses[item.curse]) {
						KDCurses[item.curse].remove(item, KDGetRestraintHost(item));
					}

					let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
					item.curse = undefined;
					if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
						KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
					}
				}
				let removeHexes = {};
				for (let e of KDGetRemovableHex(item, KDGameData.CurseLevel)) {
					removeHexes[e.original] = true;
				}
				let newEvents = [];
				for (let event of item.events) {
					if (!event.original || !removeHexes[event.original]) newEvents.push(event);
				}
				item.events = newEvents;
				let transform = false;
				for (let event of newEvents) {
					if (event.trigger == "CurseTransform") transform = true;
				}
				if (!transform) {
					for (let event of newEvents) {
						if (event.trigger == "curseCount") {
							newEvents.splice(newEvents.indexOf(event), 1);
							break;
						}
					}
				}

				if (KDGetRestraintVariant(item)) {
					KDGetRestraintVariant(item).events = JSON.parse(JSON.stringify(item.events));
					if (KDGetRestraintVariant(item).suffix == "Cursed") KDGetRestraintVariant(item).suffix = "Purified";
					if (KDGetRestraintVariant(item).prefix == "Cursed") KDGetRestraintVariant(item).prefix = "Purified";
				}

				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Evil.ogg");

				if (KDGameData.UsingConsumable) {
					KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonInventoryItem" + KDGameData.UsingConsumable + "Use"), "#ff5555", 1, true);
					let con = KinkyDungeonInventoryGetConsumable(KDGameData.UsingConsumable);
					if (con) {
						if (con.quantity > 1) con.quantity -= 1;
						else {
							KDGameData.InventoryAction = "";
							KDGameData.UsingConsumable = "";
							KinkyDungeonInventoryRemoveSafe(con);
						}
					}
					KinkyDungeonLastAction = "";
					KinkyDungeonAdvanceTime(1, true, true);
				}
			}
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction
					|| !(KinkyDungeonAllRestraintDynamic().some((r) => {return KDHasRemovableCurse(r.item, KDGameData.CurseLevel) || KDHasRemovableHex(r.item, KDGameData.CurseLevel);}))) {
					KDGameData.UsingConsumable = "";
					return true;
				}
			}
			return false;
		},
	},
	"RemoveMagicLock": {
		icon: (player, item) => {
			return "InventoryAction/CommandWord";
		},
		valid: (player, item) => {
			if (!(item?.type == Restraint)) return false;
			return KDMagicLocks.includes(item.lock);
		},
		/** Happens when you click the button */
		click: (player, item) => {
			if (KDMagicLocks.includes(item.lock)) {
				KinkyDungeonLock(item, "");

				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonPurpleLockRemove"), "#ffff00", 2);
				KinkyDungeonChangeMana(-KDGameData.InventoryActionManaCost || 0);
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");

				KDGameData.InventoryAction = "";
				KinkyDungeonLastAction = "Cast";
				KinkyDungeonAdvanceTime(1, true, true);
			}
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (!KinkyDungeonHasMana(KDGameData.InventoryActionManaCost) || !(KinkyDungeonPlayerGetRestraintsWithLocks(KDMagicLocks).length > 0)) {
					return true;
				}
			}
			return false;
		},
	},
	"Offhand": {
		icon: (player, item) => {
			return "InventoryAction/Offhand";
		},
		valid: (player, item) => {
			if (!(item?.type == Weapon && KDCanOffhand(item))) return false;
			return KinkyDungeonCanUseWeapon(false, undefined, KDWeapon(item));
		},
		/** Happens when you click the button */
		click: (player, item) => {
			KDGameData.Offhand = item.name;
			KDGameData.OffhandOld = item.name;
			KinkyDungeonAdvanceTime(1, true, true);
			KinkyDungeonDrawState = "Game";
			KinkyDungeonCheckClothesLoss = true;
			KinkyDungeonDressPlayer();
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"Attach": {
		icon: (player, item) => {
			return "InventoryAction/Attach";
		},
		valid: (player, item) => {
			if (!(item?.type == Weapon && !KDWeapon(item)?.noHands && !KDWeapon(item)?.unarmed)) return false;
			return item.name != KDGameData.AttachedWep;
		},
		label:  (player, item) => {
			if (KDGameData.AttachedWep && KinkyDungeonInventoryGet(KDGameData.AttachedWep))
				return KDGetItemNameString(KDGameData.AttachedWep);
			return "";
		},
		itemlabel:  (player, item) => {
			if (KDGameData.AttachedWep == item.name)
				return TextGet("KDAttached");
			return "";
		},
		/** Happens when you click the button */
		click: (player, item) => {
			KDGameData.AttachedWep = item.name;
			KinkyDungeonAdvanceTime(1, true, true);
			KDStunTurns(4, true);
			KinkyDungeonDrawState = "Game";
			KinkyDungeonCheckClothesLoss = true;
			KinkyDungeonDressPlayer();
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Tape.ogg");
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"Sell": {
		alsoShow: ["SellBulk", "SellExcess"],
		icon: (player, item) => {
			return "InventoryAction/Sell";
		},
		label:  (player, item) => {
			if (KDWeapon(item)?.unarmed) return "";
			let mult = 1;
			let quantity = 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)
			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDGP").replace("AMNT", value + "");
		},
		itemlabel:  (player, item) => {
			if (KDWeapon(item)?.unarmed) return "";
			let mult = 1;
			let quantity = 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)
			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDGP").replace("AMNT", value + "");
		},
		itemlabelcolor: (player, item) => {return "#ffff44";},
		text:  (player, item) => {
			let mult = 1;
			let quantity = 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)
			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDInventoryActionSell").replace("VLU", value + "");
		},
		valid: (player, item) => {
			if (KDGameData.ItemPriority[item.name|| item.name] > 9) return false;
			if (KDWeapon(item)?.unarmed) return false;
			return item?.type == Weapon || item?.type == LooseRestraint || item?.type == Consumable;
		},
		/** Happens when you click the button */
		click: (player, item) => {
			let mult = 1;
			let quantity = 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			let itemInv = KinkyDungeonInventoryGetSafe(item.name);
			if (!itemInv) return;
			if (itemInv.type == Consumable)
				KinkyDungeonChangeConsumable(KDConsumable(itemInv), -1);
			else if (itemInv.quantity > 1) itemInv.quantity -= 1;
			else KinkyDungeonInventoryRemoveSafe(itemInv);
			KinkyDungeonAddGold(value);
			if (!KDGameData.ItemsSold) KDGameData.ItemsSold = {};
			KDGameData.ItemsSold[item.name] = (KDGameData.ItemsSold[item.name] || 0) + 1;
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
			KinkyDungeonSendTextMessage(10, TextGet("KDSell")
				.replace("ITM", TextGet( (itemInv.type == LooseRestraint ? "Restraint" : "KinkyDungeonInventoryItem") + item.name))
				.replace("VLU", "" + value)
			, "#ffffff", 2);
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"SellBulk": {
		icon: (player, item) => {
			return "InventoryAction/SellBulk";
		},
		label:  (player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1);
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDGP").replace("AMNT", value + "");
		},
		text:  (player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1);
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDInventoryActionSellBulk").replace("VLU", value + "");
		},
		valid: (player, item) => {
			if (KDGameData.ItemPriority[item.name|| item.name] > 9) return false;
			return item?.type == LooseRestraint || item?.type == Consumable;
		},
		show: (player, item) => {
			return item?.type == LooseRestraint || item?.type == Consumable;
		},
		/** Happens when you click the button */
		click: (player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1);
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			let itemInv = KinkyDungeonInventoryGetSafe(item.name);
			if (!itemInv) return;
			if (itemInv.type == Consumable)
				KinkyDungeonChangeConsumable(KDConsumable(itemInv), -itemInv.quantity);
			else KinkyDungeonInventoryRemoveSafe(itemInv);
			if (!KDGameData.ItemsSold) KDGameData.ItemsSold = {};
			KDGameData.ItemsSold[item.name] = (KDGameData.ItemsSold[item.name] || 0) + quantity;
			KinkyDungeonAddGold(value);
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
			KinkyDungeonSendTextMessage(10, TextGet("KDSellBulk")
				.replace("ITM", TextGet( (itemInv.type == LooseRestraint ? "Restraint" : "KinkyDungeonInventoryItem") + item.name))
				.replace("VLU", "" + value)
				.replace("#", "" + (itemInv.quantity || 1))
			, "#ffffff", 2);
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"SellExcess": {
		icon: (player, item) => {
			return "InventoryAction/SellExcess";
		},
		label:  (player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1) - 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDGP").replace("AMNT", value + "");
		},
		text:  (player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1) - 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDInventoryActionSellExcess").replace("VLU", value + "");
		},
		valid: (player, item) => {
			if (KDGameData.ItemPriority[item.name|| item.name] > 9) return false;
			return item?.type == LooseRestraint || item?.type == Consumable;
		},
		show: (player, item) => {
			if (!item.quantity || item.quantity == 1) return false;
			return item?.type == LooseRestraint || item?.type == Consumable;
		},
		/** Happens when you click the button */
		click: (player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1) - 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			let itemInv = KinkyDungeonInventoryGetSafe(item.name);
			if (!itemInv) return;
			if (itemInv.type == Consumable)
				KinkyDungeonChangeConsumable(KDConsumable(itemInv), -quantity);
			else KinkyDungeonInventoryGetSafe(item.name).quantity = 1;
			if (!KDGameData.ItemsSold) KDGameData.ItemsSold = {};
			KDGameData.ItemsSold[item.name] = (KDGameData.ItemsSold[item.name] || 0) + quantity;
			KinkyDungeonAddGold(value);
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
			KinkyDungeonSendTextMessage(10, TextGet("KDSellExcess")
				.replace("ITM", TextGet( (itemInv.type == LooseRestraint ? "Restraint" : "KinkyDungeonInventoryItem") + item.name))
				.replace("VLU", "" + value)
				.replace("#", "" + (quantity || 1))
			, "#ffffff", 2);
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"Bondage": {
		icon: (player, item) => {
			return "InventoryAction/Bondage";
		},
		/** Returns if the button is greyed out */
		valid: (player, item) => {
			if (!(item?.type == LooseRestraint)) return false;
			if (KDRestraintSpecial(item) || KDRestraint(item).armor) return false;
			let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
			for (let enemy of nearby) {
				if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
					return true;
				}
			}
			return false;
		},
		/** Happens when you click the button */
		click: (player, item) => {
			let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
			for (let enemy of nearby) {
				if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
					let level = KDRestraint(item).power;
					let type = KDRestraintBondageType(item);
					let status = KDRestraintBondageStatus(item);
					let mult = (KDSpecialBondage[type]) ? (KDSpecialBondage[type].enemyBondageMult || 1) : 1;
					KDTieUpEnemy(enemy, level*mult, type);
					KinkyDungeonSendTextMessage(10,
						TextGet("KDTieUpEnemy")
							.replace("RSTR", KDGetItemName(item))//TextGet("Restraint" + KDRestraint(item)?.name))
							.replace("ENNME", TextGet("Name" + enemy.Enemy.name))
							.replace("AMNT", "" + Math.round(100 * enemy.boundLevel / enemy.Enemy.maxhp)),
						"#ffffff", 1);
					if (status.belt) {
						KinkyDungeonApplyBuffToEntity(enemy, KDChastity, {});
					}
					if (status.toy) {
						KinkyDungeonApplyBuffToEntity(enemy, KDToy, {});
					}
					if (status.plug) {
						KinkyDungeonApplyBuffToEntity(enemy, KDEntityBuffedStat(enemy, "Plug") > 0 ? KDDoublePlugged : KDPlugged, {});
					}
					if (status.blind) {
						enemy.blind = Math.max(enemy.blind || 0, status.blind);
					}
					if (status.silence) {
						enemy.silence = Math.max(enemy.silence || 0, status.silence);
					}
					if (status.bind) {
						enemy.bind = Math.max(enemy.bind || 0, status.bind);
					}
					if (status.slow) {
						enemy.slow = Math.max(enemy.slow || 0, status.slow);
					}
					if (status.disarm) {
						enemy.disarm = Math.max(enemy.disarm || 0, status.disarm);
					}

					if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/LockLight.ogg");

					if (item.quantity > 1) item.quantity -= 1;
					else KinkyDungeonInventoryRemoveSafe(item);
					KinkyDungeonAdvanceTime(1, true, true);

					break;
				}
			}
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
				for (let enemy of nearby) {
					if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
						return false;
					}
				}
				return true;
			}
			return false;
		},
	},
	"Food": {
		icon: (player, item) => {
			return "InventoryAction/Cookie";
		},
		/** Returns if the button is greyed out */
		valid: (player, item) => {
			if (!(item?.type == Consumable) || item.quantity < 1 || !KDConsumable(item)?.wp_instant) return false;
			let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
			for (let enemy of nearby) {
				if (enemy.id == KDGameData.FoodTarget && enemy.hp < enemy.Enemy.maxhp) {
					return true;
				}
			}
			return false;
		},
		/** Happens when you click the button */
		click: (player, item) => {
			let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
			for (let enemy of nearby) {
				if (enemy.id == KDGameData.FoodTarget) {
					enemy.hp = Math.min(enemy.Enemy.maxhp, enemy.hp + KDConsumable(item)?.wp_instant * 5);
					let faction2 = KDGetFaction(enemy);
					if (!KinkyDungeonHiddenFactions.includes(faction2)) {
						KinkyDungeonChangeFactionRep(faction2, 0.01 * KDConsumable(item)?.wp_instant);
					}

					KinkyDungeonSendTextMessage(10,
						TextGet("KDGiveFood")
							.replace("RSTR", KDGetItemName(item))//TextGet("Restraint" + KDRestraint(item)?.name))
							.replace("ENNME", TextGet("Name" + enemy.Enemy.name))
							.replace("AMNT1", "" + Math.round(10 * enemy.hp))
							.replace("AMNT2", "" + Math.round(10 * enemy.Enemy.maxhp)),
						"#ffffff", 1);


					if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Cookie.ogg");

					if (item.quantity > 1) item.quantity -= 1;
					else KinkyDungeonInventoryRemoveSafe(item);
					KinkyDungeonAdvanceTime(1, true, true);

					break;
				}
			}
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
				for (let enemy of nearby) {
					if (enemy.id == KDGameData.FoodTarget) {
						return false;
					}
				}
				return true;
			}
			return false;
		},
	},
};